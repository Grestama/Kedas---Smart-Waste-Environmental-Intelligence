# 02. Migration Repair Log — Compatibility-Safe Remediation

**Project:** Kedas — AI-Powered Environmental Intelligence Platform  
**Date:** 2026-11-01  
**Remediation Mode:** Autonomous Local Remediation (Strict No-Push Policy)  

---

## 1. Selected Remediation Strategy: Jalur A + Version Table Hardening

Because the project is in pre-release/deployment preparation (`UNRELEASED` classification) and CI executes on clean ephemeral PostgreSQL containers, the cleanest and most robust industry solution is **Normalizing all revision identifiers to strictly `<= 32` characters**, while enhancing `backend/alembic/env.py` with widened table support as defense-in-depth.

---

## 2. Inventory of File & Identifier Modifications

| Migration File (New Path) | Old Revision ID (Len) | New Revision ID (Len) | New Down Revision (Len) |
| :--- | :--- | :--- | :--- |
| `0001_baseline_audit_log.py` | `0001_baseline_audit_log` (23) | `0001_baseline_audit_log` (23) | `None` (0) |
| `0002_identity_taxonomy.py` | `0002_identity_taxonomy_collection` (33) | `0002_identity_taxonomy` (22) | `0001_baseline_audit_log` (23) |
| `0003_inspection_weight.py` | `0003_inspection_weight_points_marketplace` (41) | `0003_inspection_weight` (21) | `0002_identity_taxonomy` (22) |
| `0004_notification_outbox.py` | `0004_notification_outbox` (24) | `0004_notification_outbox` (24) | `0003_inspection_weight` (21) |
| `0005_pickup_idempotency.py` | `0005_pickup_idempotency_and_service_mode` (40) | `0005_pickup_idempotency` (22) | `0004_notification_outbox` (24) |
| `0006_facility_receipts.py` | `0006_facility_receipts_stock_and_waste_bank` (43) | `0006_facility_receipts` (21) | `0005_pickup_idempotency` (22) |
| `0007_partner_marketplace.py` | `0007_partner_marketplace_b2b_and_organic` (40) | `0007_partner_marketplace` (23) | `0006_facility_receipts` (21) |
| `0008_community_programs.py` | `0008_community_programs_funding_and_special_features` (52) | `0008_community_programs` (22) | `0007_partner_marketplace` (23) |
| `0009_cdoa_agreements.py` | `0009_cdoa_and_destination_agreements` (36) | `0009_cdoa_agreements` (19) | `0008_community_programs` (22) |
| `0010_ai_knowledge.py` | `0010_ai_knowledge_and_interactions` (34) | `0010_ai_knowledge` (16) | `0009_cdoa_agreements` (19) |

---

## 3. Defense-in-Depth: Alembic Environment Hook (`env.py`)

In `backend/alembic/env.py`, `DefaultImpl.version_table_impl` was enhanced:
```python
def _widened_version_table_impl(
    self,
    *,
    version_table: str,
    version_table_schema: str | None,
    version_table_pk: bool,
    **kw,
) -> Table:
    vt = Table(
        version_table,
        MetaData(),
        Column("version_num", String(128), nullable=False),
        schema=version_table_schema,
    )
    if version_table_pk:
        vt.append_constraint(PrimaryKeyConstraint("version_num", name=f"{version_table}_pkc"))
    return vt

DefaultImpl.version_table_impl = _widened_version_table_impl
```
This guarantees that any future database created will support version strings up to 128 characters, while our revision IDs remain `<= 24` characters for total backward and forward compatibility.

---

## 4. Automated Regression Guard

Created `backend/tests/unit/test_migration_integrity.py`:
- Walks all migration files dynamically using Alembic's `ScriptDirectory`.
- Asserts `len(rev.revision) <= 32` for every revision.
- Asserts `len(rev.down_revision) <= 32`.
- Validates that revision IDs are 100% unique.
- Validates that exactly 1 head exists (`0010_ai_knowledge`).

Test verified:
`tests/unit/test_migration_integrity.py . [100%] PASSED (0.43s)`
