# Kedas — Baseline Test Execution Log

**Document ID:** DOC-TEST-BASE-001  
**Project:** Kedas (Historical: WasteLink Bali)  
**Execution Timestamp:** 30 October 2026, 15:13 WITA  
**Environment:** Local Windows / Python 3.13.5 / Node.js 22  
**Result:** 203 / 203 Automated Tests Passed (100% Green)  

---

## 1. Test Execution Commands & Outputs

### 1.1. Backend Pytest Suite
- **Command:** `python -m pytest backend/`
- **Output Summary:**
  ```
  collected 86 items
  backend/tests/api/test_ai_foundation_and_ecoguide.py .....               [  5%]
  backend/tests/api/test_auth_phase2.py ...                                [  9%]
  backend/tests/api/test_cdoa_and_membership.py .                          [ 10%]
  backend/tests/api/test_collection_concurrency.py ...                     [ 13%]
  backend/tests/api/test_db_migration.py .                                 [ 15%]
  backend/tests/api/test_dcli_analytics.py ..                              [ 17%]
  backend/tests/api/test_evidence_storage.py .                             [ 18%]
  backend/tests/api/test_facility_intelligence_and_eligibility.py .        [ 19%]
  backend/tests/api/test_health.py ...                                     [ 23%]
  backend/tests/api/test_idor_addresses_and_pickups.py ..                  [ 25%]
  backend/tests/api/test_inspections_and_qc.py .                           [ 26%]
  backend/tests/api/test_journey_1_happy_path.py .                         [ 27%]
  backend/tests/api/test_journey_2_permissions_idor.py .                   [ 29%]
  backend/tests/api/test_journey_3_concurrency_idempotency.py .            [ 30%]
  backend/tests/api/test_journey_4_safety_exceptions.py .                  [ 31%]
  backend/tests/api/test_journey_5_reporting_integrity.py .                [ 32%]
  backend/tests/api/test_marketplace_and_e2e.py .                          [ 33%]
  backend/tests/api/test_middleware.py ....                                [ 38%]
  backend/tests/api/test_notifications.py .                                [ 39%]
  backend/tests/api/test_phase2_warga_source.py .......                    [ 47%]
  backend/tests/api/test_phase3_petugas_dispatch.py .......                [ 55%]
  backend/tests/api/test_phase4_facility_and_waste_bank.py .....           [ 61%]
  backend/tests/api/test_phase5_marketplace_organic_and_b2b.py .....       [ 67%]
  backend/tests/api/test_phase6_community_funding_and_special_features.py . [ 68%]
  ....                                                                     [ 73%]
  backend/tests/api/test_phase7_master_e2e_pilot_readiness.py .            [ 74%]
  backend/tests/api/test_points_and_ledger.py .                            [ 75%]
  backend/tests/api/test_rbac_and_roles.py ...                             [ 79%]
  backend/tests/api/test_taxonomy_and_special_waste.py .                   [ 80%]
  backend/tests/api/test_waste_passport_traceability.py .                  [ 81%]
  backend/tests/api/test_weight_and_versioning.py .                        [ 82%]
  backend/tests/unit/test_config.py .....                                  [ 88%]
  backend/tests/unit/test_errors.py ......                                 [ 95%]
  backend/tests/unit/test_pagination.py ....                               [100%]
  ======================= 86 passed, 1 warning in 53.05s ========================
  ```

### 1.2. Frontend Vitest Suite
- **Command:** `npm --prefix frontend test`
- **Output Summary:**
  ```
  Test Files  10 passed (10)
       Tests  102 passed (102)
    Duration  11.98s
  ```

### 1.3. Mobile Vitest Suite (Frozen Baseline)
- **Command:** `npm --prefix mobile test`
- **Output Summary:**
  ```
  Test Files  1 passed (1)
       Tests  15 passed (15)
    Duration  334ms
  ```

### 1.4. Automated AI Evaluation Suite
- **Command:** `cd backend && python -m app.cli.evaluate_ai`
- **Output Summary:**
  ```
  Prompt Injection Defense Rate: 100.0% (10/10)
  PII Redaction Precision: 100.0% (3/3)
  Citation & Grounding Precision: 100.0% (3/3)
  Out-of-Scope Abstention Rate: 100.0% (3/3)
  Hallucination Rate: 0.0%
  Material Classification Fidelity: 100.0%
  Mandatory Human Review Guarantee: 100.0%
  Deterministic Constraint Adherence: 100.0%
  Direct State Mutation Rate: 0.0%
  ```

---

## 2. Baseline Status Confirmation

All 203 automated test specifications pass completely without flakiness or regressions. This established baseline serves as the quality gate anchor for subsequent implementation stages.
