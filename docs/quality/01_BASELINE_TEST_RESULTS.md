# WasteLink Bali — Hasil Pengujian Baseline (Baseline Test Results)
**Versi Dokumen:** 1.0  
**Tanggal Audit:** 30 Oktober 2026  
**Auditor:** Autonomous QA Auditor  
**Status Eksekusi:** Evaluasi Awal Tahap 1 Lengkap  

---

## 1. Ringkasan Eksekusi Pengujian Baseline

Semua suite pengujian baseline dieksekusi secara ketat tanpa mocking artifisial atau mematikan validasi:

| Lapisan Sistem | Jenis Pemeriksaan | Perintah Baseline | Durasi | Hasil / Status | Exit Code |
|---|---|---|---|---|---|
| **Backend** | Linter & Formatter | `cd backend; ruff check .` | 0.8s | 0 warnings, 0 errors | `0` |
| **Backend** | Static Type Checking | `cd backend; mypy app` | 2.1s | Success (79 source files) | `0` |
| **Backend** | Automated Test Suite | `cd backend; pytest --tb=short` | 46.2s | **76 Passed**, 0 Failed, 1 Warning | `0` |
| **Backend** | Migration Verification | `cd backend; pytest tests/api/test_db_migration.py` | 1.8s | 1 Passed (Upgrade/Downgrade Head) | `0` |
| **Frontend** | Linter (ESLint) | `npm --prefix frontend run lint` | 4.2s | 0 warnings, 0 errors | `0` |
| **Frontend** | Static Type Checking | `npm --prefix frontend run typecheck` | 5.8s | 0 errors (`tsc --noEmit`) | `0` |
| **Frontend** | Automated Test Suite | `npm --prefix frontend test -- --run` | 7.5s | **89 Passed** (9 test files) | `0` |
| **Frontend** | Production Build | `npm --prefix frontend run build` | 38.4s | **37 Routes Generated** | `0` |
| **Mobile** | Static Type Checking | `npm --prefix mobile run typecheck` | 2.2s | 0 errors (`tsc --noEmit`) | `0` |
| **Mobile** | Automated Test Suite | `npm --prefix mobile test -- --run` | 0.3s | **15 Passed** (1 test file) | `0` |

---

## 2. Rincian Distribusi Uji Backend (76 Uji)

```
tests/api/test_auth_phase2.py                                     3 Passed
tests/api/test_collection_concurrency.py                          3 Passed
tests/api/test_db_migration.py                                   1 Passed
tests/api/test_evidence_storage.py                               1 Passed
tests/api/test_health.py                                         3 Passed
tests/api/test_idor_addresses_and_pickups.py                     2 Passed
tests/api/test_inspections_and_qc.py                              1 Passed
tests/api/test_journey_1_happy_path.py                           1 Passed
tests/api/test_journey_2_permissions_idor.py                      1 Passed
tests/api/test_journey_3_concurrency_idempotency.py               1 Passed
tests/api/test_journey_4_safety_exceptions.py                     1 Passed
tests/api/test_journey_5_reporting_integrity.py                   1 Passed
tests/api/test_marketplace_and_e2e.py                             1 Passed
tests/api/test_middleware.py                                     4 Passed
tests/api/test_notifications.py                                  1 Passed
tests/api/test_phase2_warga_source.py                            7 Passed
tests/api/test_phase3_petugas_dispatch.py                        7 Passed
tests/api/test_phase4_facility_and_waste_bank.py                  5 Passed
tests/api/test_phase5_marketplace_organic_and_b2b.py              5 Passed
tests/api/test_phase6_community_funding_and_special_features.py   5 Passed
tests/api/test_phase7_master_e2e_pilot_readiness.py             1 Passed
tests/api/test_points_and_ledger.py                              1 Passed
tests/api/test_rbac_and_roles.py                                  3 Passed
tests/api/test_taxonomy_and_special_waste.py                      1 Passed
tests/api/test_weight_and_versioning.py                           1 Passed
tests/unit/test_config.py                                        5 Passed
tests/unit/test_errors.py                                        6 Passed
tests/unit/test_pagination.py                                    4 Passed
-------------------------------------------------------------------------
TOTAL BACKEND BASELINE                                          76 Passed (100%)
```

---

## 3. Rincian Distribusi Uji Frontend Web (89 Uji)

```
src/test/facility.test.ts                                         4 Passed
src/test/community.test.ts                                       5 Passed
src/test/marketplace.test.ts                                     5 Passed
src/test/integration.test.ts                                    15 Passed
src/test/design-system.test.tsx                                  12 Passed
src/test/auth.test.tsx                                            8 Passed
src/test/staff.test.tsx                                          15 Passed
src/test/admin.test.tsx                                          17 Passed
src/test/collection.test.tsx                                     8 Passed
-------------------------------------------------------------------------
TOTAL FRONTEND BASELINE                                         89 Passed (100%)
```

---

## 4. Rincian Distribusi Uji Mobile Warga (15 Uji)

```
src/test/mobile.test.ts                                          15 Passed (100%)
- Offline Draft Storage & Retrieval
- Idempotency Key Preservation on Network Retries
- Geolocation Precision Bounds Check (Bali Bounding Box)
- Currency IDR & WITA Timezone Token Formatter
- Category Gating for B3/Special Waste
- State Transition Badge Mappings
```

---

## 5. Ringkasan Evaluasi Baseline

Seluruh test suite bawaan lulus 100%. Namun, audit kode mendalam menemukan beberapa **silent fallback anti-patterns** dan **concurrency edge cases** yang perlu diperbaiki pada Tahap 2 untuk mencapai stabilitas logika penuh.
