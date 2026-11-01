# 03. PostgreSQL Migration Test Results & Database Safety

**Project:** Kedas — AI-Powered Environmental Intelligence Platform  
**Target RDBMS:** PostgreSQL 16 (CI: `postgres:16-alpine`, Driver: `psycopg` 3.x)  
**Date:** 2026-11-01  
**Status:** ALL TESTS PASSED (100%)  

---

## 1. Migration Test Matrix Results

| Scenario ID | Test Description | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **MIG-001** | Empty DB → `alembic upgrade head` | All 10 migrations execute sequentially without truncation errors | Executed 0001 -> 0010 without errors | **PASSED** |
| **MIG-002** | Upgrade re-run on head | Idempotent; zero schema drift, no exceptions | Executed silently, 0 changes applied | **PASSED** |
| **MIG-003** | `alembic current` verification | Matches active head (`0010_ai_knowledge`) | Active version confirmed: `0010_ai_knowledge` | **PASSED** |
| **MIG-004** | `alembic heads` single-head assertion | Exactly 1 linear head, no branching | Exactly 1 head returned | **PASSED** |
| **MIG-005** | Schema Inspector verification | All core domain tables, columns, indexes, and FKs exist | 20 tables verified in target schema | **PASSED** |
| **MIG-006** | Minimal data seed & query | Can insert and select records on newly created schema | `AuditLog` row created and queried successfully | **PASSED** |
| **MIG-007** | Downgrade 1 revision (`-1`) | Rollback from 0010 to 0009 cleanly | Table `knowledge_documents` dropped, active version `0009_cdoa_agreements` | **PASSED** |
| **MIG-008** | Re-upgrade after downgrade (`-1` → `head`) | Returns to head `0010_ai_knowledge` | Table `knowledge_documents` recreated, active version `0010_ai_knowledge` | **PASSED** |
| **MIG-009** | Full rollback to base & re-upgrade | Rollback to base drops all tables; upgrade to head recreates all tables | Verified full downgrade cycle and recreation | **PASSED** |
| **MIG-010** | Revision ID length constraint (< 32 chars) | Automated guard asserts `len(rev) <= 32` for all revisions | All revisions between 16 and 24 characters | **PASSED** |
| **MIG-011** | Strict VARCHAR(32) emulation | Intercepts all inserts into `alembic_version` and raises truncation if string > 32 chars | All 10 migration inserts passed interceptor check | **PASSED** |

---

## 2. Table Verification Inventory (20 Domain Tables Inspected)

1. `audit_logs` (Phase 1 Baseline)
2. `users` (Phase 2 Identity)
3. `user_roles` (Phase 2 RBAC)
4. `service_areas` (Phase 2 Geography)
5. `waste_categories` (Phase 2 Taxonomy)
6. `collection_slots` (Phase 2 Logistics)
7. `pickup_requests` (Phase 2 Dispatch)
8. `pickup_status_events` (Phase 2 Audit Trail)
9. `inspection_records` (Phase 3 Quality Control)
10. `weight_records` (Phase 3 Mass Balance)
11. `ledger_entries` (Phase 3 WastePoints)
12. `notification_outbox` (Phase 4 Transactional Outbox)
13. `facilities` (Phase 4 TPS3R / TPST)
14. `facility_receipts` (Phase 4 Stock Intake)
15. `partners` (Phase 5 Circular Marketplace)
16. `funding_programs` (Phase 6 CSR Funding & Banjar)
17. `cdoa_agreements` (Phase 2 CDOA Agreements)
18. `knowledge_documents` (Phase AI Ingestion)
19. `knowledge_chunks` (Phase AI Vector Chunks)
20. `ai_interaction_logs` (Phase AI Audited Governance)
