# 01. Root-Cause Analysis — Alembic Migration & CI Failure Remediation

**Project:** Kedas — AI-Powered Environmental Intelligence Platform  
**Incident:** GitHub Actions CI Failure on `Run Alembic migrations on clean DB`  
**Classification:** `StringDataRightTruncation` in PostgreSQL target table `alembic_version`  
**Date of Forensic:** 2026-11-01  

---

## 1. Error Summary & Observed Behavior

During GitHub Actions execution on branch `main` (`.github/workflows/ci.yml`), step `Run Alembic migrations on clean DB` executes:
```bash
alembic upgrade head
alembic downgrade -1
alembic upgrade head
```
Target database: `postgresql://wastelink:wastelink_test_ci_password@localhost:5432/wastelink_test` (PostgreSQL 16 Alpine container).

### Failure Output:
```text
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 0001_baseline_audit_log, Phase 1 - Baseline audit log table
INFO  [alembic.runtime.migration] Running upgrade 0001_baseline_audit_log -> 0002_identity_taxonomy_collection, Phase 2 - Identity, taxonomy, collection slots, and pickup requests
Traceback (most recent call last):
  ...
psycopg.errors.StringDataRightTruncation: value too long for type character varying(32)
```

---

## 2. Forensic Proof: Revision Identifiers vs. Alembic Version Table Column

### 2.1 Complete Revision Chain Inventory & Length Audit
Audited directly against all files in `backend/alembic/versions/*.py`:

| File | Revision ID | Length | Down Revision | Down Len | Status (>32 chars) |
| :--- | :--- | :---: | :--- | :---: | :---: |
| `0001_baseline_audit_log.py` | `0001_baseline_audit_log` | 23 | `None` | 0 | **OK (<= 32)** |
| `0002_identity_taxonomy_collection.py` | `0002_identity_taxonomy_collection` | 33 | `0001_baseline_audit_log` | 23 | **EXCEEDS LIMIT (33 > 32)** |
| `0003_inspection_weight_points_marketplace.py` | `0003_inspection_weight_points_marketplace` | 41 | `0002_identity_taxonomy_collection` | 33 | **EXCEEDS LIMIT (41 > 32)** |
| `0004_notification_outbox.py` | `0004_notification_outbox` | 24 | `0003_inspection_weight_points_marketplace` | 41 | **OK (<= 32)** |
| `0005_pickup_idempotency_and_service_mode.py` | `0005_pickup_idempotency_and_service_mode` | 40 | `0004_notification_outbox` | 24 | **EXCEEDS LIMIT (40 > 32)** |
| `0006_facility_receipts_stock_and_waste_bank.py` | `0006_facility_receipts_stock_and_waste_bank` | 43 | `0005_pickup_idempotency_and_service_mode` | 40 | **EXCEEDS LIMIT (43 > 32)** |
| `0007_partner_marketplace_b2b_and_organic.py` | `0007_partner_marketplace_b2b_and_organic` | 40 | `0006_facility_receipts_stock_and_waste_bank` | 43 | **EXCEEDS LIMIT (40 > 32)** |
| `0008_community_programs_funding_and_special_features.py` | `0008_community_programs_funding_and_special_features` | 52 | `0007_partner_marketplace_b2b_and_organic` | 40 | **EXCEEDS LIMIT (52 > 32)** |
| `0009_cdoa_and_destination_agreements.py` | `0009_cdoa_and_destination_agreements` | 36 | `0008_community_programs_funding_and_special_features` | 52 | **EXCEEDS LIMIT (36 > 32)** |
| `0010_ai_knowledge_and_interactions.py` | `0010_ai_knowledge_and_interactions` | 34 | `0009_cdoa_and_destination_agreements` | 36 | **EXCEEDS LIMIT (34 > 32)** |

**Key Finding:** Out of 10 migrations, **8 revisions exceed 32 characters**! The CI failed on `0002` simply because it was the first revision in the chain that exceeded the 32-character boundary. Even if `0002` were fixed alone, revisions `0003`, `0005`, `0006`, `0007`, `0008`, `0009`, and `0010` would sequentially fail.

### 2.2 Proof of Alembic Version Column Schema
Inspection of Alembic's core DDL implementation (`alembic.ddl.impl.DefaultImpl.version_table_impl`):
```python
vt = Table(
    version_table,
    MetaData(),
    Column("version_num", String(32), nullable=False),  # <-- Hardcoded 32 characters
    schema=version_table_schema,
)
```
When Alembic runs against PostgreSQL, it executes DDL:
```sql
CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);
```
When inserting `0002_identity_taxonomy_collection` (33 characters), PostgreSQL raises `StringDataRightTruncation`.

In contrast, SQLite (used in local development and unit tests) has dynamic type affinity and does not enforce VARCHAR character length limits, which is why local SQLite testing previously masked this defect.

---

## 3. Database Status Classification

- **Status:** `UNRELEASED`
- **Evidence:**
  1. The production backend has not yet been deployed to Railway / Render (currently in deployment preparation).
  2. The CI runs against an ephemeral PostgreSQL service container (`postgres:16-alpine`) initialized from scratch on every run.
  3. The local development database is SQLite (`backend/wastelink.db`), which will be cleanly synchronized.
  4. No downstream external API consumers or third-party database replicas exist.

---

## 4. Remediation Strategy (Dual-Layer Defense in Depth)

We adopt **Jalur A (Controlled Revision Identifier Normalization)** combined with **Alembic Version Table Hardening**:

1. **Layer 1: Normalize all Revision IDs to <= 32 Characters**
   Every revision ID in the chain is shortened to a clear, semantic, unique slug strictly `<= 32` characters.
   All `down_revision` pointers are updated accordingly.
2. **Layer 2: Alembic Version Table Widening Hook (`env.py`)**
   In `backend/alembic/env.py`, enhance the migration environment to support `VARCHAR(128)` for `version_num`, preventing future regressions if a contributor creates a long revision ID.
3. **Layer 3: Automated Revision Length Quality Guard**
   Add an automated test to CI that inspects all migration files and asserts `len(revision) <= 32` and `len(down_revision) <= 32`.

---

## 4. Root Cause Analysis #2: Boolean DatatypeMismatch on PostgreSQL

### 4.1 Incident Description
Following the resolution of the `VARCHAR(32)` revision truncation, CI progressed through revisions `0001` and `0002` successfully, but failed at `0003_inspection_weight.py:349` (`CREATE TABLE notifications`) with:
```text
sqlalchemy.exc.ProgrammingError: (psycopg.errors.DatatypeMismatch) column "is_read" is of type boolean but default expression is of type integer
HINT: You will need to rewrite or cast the expression.
[SQL: ... is_read BOOLEAN DEFAULT 0 NOT NULL ...]
```

### 4.2 Technical Root Cause
- **SQLite vs PostgreSQL Semantics:** In SQLite, `BOOLEAN` is an alias for `INTEGER`, so `server_default="0"`, `"1"`, or `sa.text("0")` executes without error. In PostgreSQL, `BOOLEAN` is a strict primitive type (`TRUE` / `FALSE`). Providing an integer literal (`0` or `1`) without casting fails type checking with `DatatypeMismatch`.
- **Affected Columns Across Migrations:**
  1. `0003_inspection_weight.py:357`: `notifications.is_read` (`server_default=sa.text("0")`)
  2. `0008_community_programs.py:143`: `banjar_officials.is_active` (`server_default="1"`)
  3. `0010_ai_knowledge.py:29`: `knowledge_documents.is_public` (`server_default="1"`)
  4. `0010_ai_knowledge.py:84`: `ai_interaction_logs.fallback_used` (`server_default="0"`)

### 4.3 Remediation Strategy
Replaced all integer/text literals with dialect-agnostic SQLAlchemy constructs:
- `server_default=sa.false()`
- `server_default=sa.true()`
Added an automated CI guard test in `backend/tests/unit/test_migration_integrity.py` (`test_boolean_columns_use_dialect_agnostic_defaults`) to block any future integer boolean defaults.
