# 02. Dokumentasi Regression Tests — WasteLink Bali

**Tanggal**: 30 Oktober 2026  
**Auditor**: Principal QA Automation Engineer & Software Architect  
**Cakupan**: Seluruh suite pengujian regresi untuk validasi stabilitas sistem pasca-remediasi Tahap 2

---

## 1. Ringkasan Suite Pengujian Regresi

| Modul Pengujian | Framework / Runner | Total Test Files | Total Tests | Status |
|---|---|---|---|---|
| **Backend API & Domain** | `pytest` + `pytest-asyncio` + `pytest-cov` | 23 test files | **76 tests** | **100% PASSED** (0 failures) |
| **Frontend Web & UI** | `vitest` + `@testing-library/react` | 9 test files | **94 tests** | **100% PASSED** (0 failures) |
| **Mobile App (Warga/Field)** | `vitest` (TypeScript) | 1 test file | **15 tests** | **100% PASSED** (0 failures) |
| **Total Keseluruhan** | — | **33 test files** | **185 tests** | **100% PASSED** (0 failures) |

---

## 2. Rincian Regression Tests Baru Ditambahkan pada Tahap 2

### A. Pengujian Preservasi Error Server pada Layanan Penjemputan (`frontend/src/test/collection.test.tsx`)

1. **Test: `re-throws server rejection ApiError on createPickupRequest`**
   - **Target**: `collectionService.createPickupRequest`
   - **Skenario**: Negative Test (Validasi Server 400 Bad Request / Kapasitas Penuh)
   - **Alur**:
     - Mock `apiClient.request` mengembalikan rejected promise `new ApiError('Kapasitas penjemputan pada slot ini sudah penuh.', 400, 'OVER_CAPACITY')`.
     - Memanggil `collectionService.createPickupRequest(...)`.
     - Memverifikasi bahwa service **tidak menelan error** dan **melempar kembali** instance `ApiError` dengan `status: 400` dan pesan yang tepat ke form input.
   - **Hasil**: PASSED.

2. **Test: `re-throws server rejection ApiError on cancelPickupRequest`**
   - **Target**: `collectionService.cancelPickupRequest`
   - **Skenario**: Negative Test (Pembatalan Ilegal / Status Invalid 409 Conflict)
   - **Alur**:
     - Mock `apiClient.request` menolak dengan error `409 Conflict` (tugas sudah diproses oleh petugas).
     - Memverifikasi error tidak diserap dan dilemparkan langsung ke komponen modal pembatalan.
   - **Hasil**: PASSED.

3. **Test: `StatusBadge renders correct badge variant for extended statuses`**
   - **Target**: `StatusBadge` Component
   - **Skenario**: Visual Verification / Extended State Machine
   - **Alur**:
     - Render badge untuk status `INSPECTION`, `WEIGHED`, dan `SAFELY_DISPOSED`.
     - Memverifikasi teks tampilan bahasa Indonesia ("Dalam Inspeksi", "Selesai Ditimbang", "Dibuang Aman") dan kelas warna varian (`warning`, `info`, `neutral`).
   - **Hasil**: PASSED.

### B. Pengujian Preservasi Error dan Integritas Tugas Petugas (`frontend/src/test/staff.test.tsx`)

4. **Test: `re-throws server 400/409 error on task status transition instead of mutating mock store`**
   - **Target**: `staffService.updateTaskStatus`
   - **Skenario**: Race Condition & Invalid State Machine Transition
   - **Alur**:
     - Mock backend menolak transisi status dengan HTTP 400 (`TRANSITION_INVALID`).
     - Memverifikasi bahwa `updateTaskStatus` melempar error dan **tidak memutasi** `mockTasksStore` lokal.
   - **Hasil**: PASSED.

5. **Test: `re-throws server 409 error when task is already claimed by another collector`**
   - **Target**: `staffService.acceptTask`
   - **Skenario**: Double-Claim Contention
   - **Alur**:
     - Mock backend mengembalikan 409 Conflict karena tugas telah diklaim oleh petugas lain lebih dulu.
     - Memverifikasi `acceptTask` tidak mengembalikan objek sukses palsu, melainkan melempar pesan error konflik ke UI petugas.
   - **Hasil**: PASSED.

---

## 3. Matriks Hasil Eksekusi Regresi Komprehensif

### Backend Suite (`pytest`)
- `tests/api/test_auth_phase2.py`: 3/3 passed (Registration, Enumeration Prevention, Suspension block)
- `tests/api/test_collection_concurrency.py`: 3/3 passed (Slot Overbooking, Double Claim, State Machine)
- `tests/api/test_db_migration.py`: 1/1 passed (Full 8 migrations upgrade & downgrade cycles)
- `tests/api/test_evidence_storage.py`: 1/1 passed (Storage isolation, MIME validation)
- `tests/api/test_health.py`: 3/3 passed (Liveness, Readiness with DB up/down)
- `tests/api/test_idor_addresses_and_pickups.py`: 2/2 passed (IDOR protection across users)
- `tests/api/test_inspections_and_qc.py`: 1/1 passed (QC Lifecycle & Contamination Scoring)
- `tests/api/test_journey_1_happy_path.py`: 1/1 passed (Full circular lifecycle from pickup to facility)
- `tests/api/test_journey_2_permissions_idor.py`: 1/1 passed (Role RBAC and tenant boundary isolation)
- `tests/api/test_journey_3_concurrency_idempotency.py`: 1/1 passed (Concurrent booking, idempotent retries)
- `tests/api/test_journey_4_safety_exceptions.py`: 1/1 passed (Disputes, hazardous waste gating)
- `tests/api/test_journey_5_reporting_integrity.py`: 1/1 passed (Audit log chain, immutable ledger)
- `tests/api/test_marketplace_and_e2e.py`: 1/1 passed (Material batching, marketplace bids)
- `tests/api/test_middleware.py`: 4/4 passed (Request ID generation, Security headers CSP/HSTS)
- `tests/api/test_notifications.py`: 1/1 passed (Notification routing & tenant isolation)
- `tests/api/test_phase2_warga_source.py`: 7/7 passed (Service areas, drop-off, cancellation, address toggle)
- `tests/api/test_phase3_petugas_dispatch.py`: 7/7 passed (Task claims, field failures, weight adjustment)
- `tests/api/test_phase4_facility_and_waste_bank.py`: 5/5 passed (Mass balance, row-lock sorting, waste bank savings)
- `tests/api/test_phase5_marketplace_organic_and_b2b.py`: 5/5 passed (Partner licensing, discrepancies, organic cycle)
- `tests/api/test_phase6_community_funding_and_special_features.py`: 5/5 passed (Banjar, events, CSR, cleanup, hazardous)
- `tests/api/test_phase7_master_e2e_pilot_readiness.py`: 1/1 passed (Master 7-stage circular workflow)
- `tests/api/test_points_and_ledger.py`: 1/1 passed (Points ledger idempotency)
- `tests/api/test_rbac_and_roles.py`: 3/3 passed (Active role switching, applicant workflow)
- `tests/api/test_taxonomy_and_special_waste.py`: 1/1 passed (Hazardous manifest gating)
- `tests/api/test_weight_and_versioning.py`: 1/1 passed (Weighing math & audit versioning)
- `tests/unit/test_config.py`: 5/5 passed (Settings validation, secret length, mime parsing)
- `tests/unit/test_errors.py`: 6/6 passed (Error format contracts, internal error leak prevention)
- `tests/unit/test_pagination.py`: 4/4 passed (Limit bounding, offset calculations)

### Frontend Suite (`vitest`)
- `src/test/facility.test.ts`: 4/4 passed
- `src/test/community.test.ts`: 5/5 passed
- `src/test/marketplace.test.ts`: 5/5 passed
- `src/test/integration.test.ts`: 15/15 passed
- `src/test/design-system.test.tsx`: 12/12 passed
- `src/test/auth.test.tsx`: 8/8 passed
- `src/test/staff.test.tsx`: 17/17 passed (termasuk 2 test regresi WL-AUD-002)
- `src/test/admin.test.tsx`: 17/17 passed
- `src/test/collection.test.tsx`: 11/11 passed (termasuk 3 test regresi WL-AUD-001 & WL-AUD-005)

### Mobile Suite (`vitest`)
- `src/test/mobile.test.ts`: 15/15 passed (Offline queue, state transitions, storage adapters)
