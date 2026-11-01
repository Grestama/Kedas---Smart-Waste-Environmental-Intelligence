# WasteLink Bali — Matriks Integrasi Lintas Lapisan (Integration Matrix)
**Versi Dokumen:** 1.0  
**Tanggal Audit:** 30 Oktober 2026  
**Auditor:** Software Architect & QA Automation Engineer  

---

## 1. Peta Integrasi Alur Bisnis Kritis (Journeys A – G)

| User Journey | UI / Mobile Entry Point | API Route / Handler | Service & Domain | DB Entities Terlibat | Dependensi Eksternal | Test Coverage | Status & Catatan Audit |
|---|---|---|---|---|---|---|---|
| **Journey A**<br>Warga pesan pickup → Petugas jemput, QC & timbang → Poin terbit | Web: `/app/setoran/baru`<br>Mobile: `NewDepositScreen`<br>Staff: `/staff/tugas/[id]` | `POST /pickup-requests`<br>`POST /collector/tasks/{id}/accept`<br>`POST /pickup-requests/{id}/inspections`<br>`POST /pickup-requests/{id}/weights` | `collection/service.py`<br>`inspection/service.py`<br>`weight/service.py`<br>`points/service.py` | `PickupRequest`<br>`CollectionSlot`<br>`InspectionRecord`<br>`WeightRecord`<br>`LedgerEntry`<br>`AuditLog` | None (Local DB lock) | `test_journey_1_happy_path.py`<br>`test_phase7_master_e2e_pilot_readiness.py` | **PASS (100%)**<br>Atomic claim & auto reward ledger terbukti aman. |
| **Journey B**<br>Setoran mandiri warga ke Bank Sampah Banjar | Web: `/admin/bank-sampah`<br>Staff: Setoran POS | `POST /facilities/waste-bank/deposit`<br>`POST /facilities/waste-bank/withdraw` | `facility/service.py` | `WasteBankMember`<br>`WasteBankTransaction`<br>`AuditLog` | None | `test_phase4_facility_and_waste_bank.py` | **PASS (100%)**<br>Row lock `with_for_update` mencegah saldo negatif. |
| **Journey C**<br>Penerimaan fasilitas & pemilahan stok mass balance | Web: `/admin/fasilitas`<br>`/admin/stok` | `POST /facilities/receipts`<br>`POST /facilities/sorting`<br>`GET /facilities/{id}/stock` | `facility/service.py` | `Facility`<br>`FacilityReceipt`<br>`StockMovement`<br>`AuditLog` | Jembatan timbang (input manual) | `test_phase4_facility_and_waste_bank.py` | **PASS (100%)**<br>Invarian neraca massa membatasi susut $\pm 0.5$ kg. |
| **Journey D**<br>Konsolidasi batch & pengiriman ke pabrik daur ulang | Web: `/admin/mitra`<br>`/admin/batch` | `POST /admin/batches`<br>`POST /admin/deliveries`<br>`POST /admin/deliveries/{id}/receipt`<br>`POST /admin/deliveries/{id}/confirm-processing` | `marketplace/service.py` | `MaterialBatch`<br>`MaterialBatchItem`<br>`DeliveryRecord`<br>`Partner` | Pabrik mitra terverifikasi | `test_phase5_marketplace_organic_and_b2b.py` | **PASS (100%)**<br>Dispatched weight immutable; recycling proof gated. |
| **Journey E**<br>Layanan B2B Pelaku Usaha (Hotel/Vila/Resto) | Web: `/admin/b2b` | `POST /b2b/organizations`<br>`POST /b2b/locations`<br>`POST /b2b/pickups`<br>`GET /b2b/organizations/{id}/report` | `marketplace/service.py` | `B2BOrganization`<br>`B2BLocation`<br>`B2BPickupRequest` | None | `test_phase5_marketplace_organic_and_b2b.py` | **PASS (100%)**<br>Tenant isolation terbukti aman dari kebocoran data. |
| **Journey F**<br>Kegiatan Komunitas & Alokasi Dana CSR | Web: `/admin/pendanaan`<br>`/admin/komunitas` | `POST /programs`<br>`POST /programs/{id}/allocations`<br>`POST /community/banjar/profile`<br>`POST /community/events`<br>`POST /community/cleanups/*` | `funding/service.py`<br>`community/service.py` | `FundingProgram`<br>`ProgramBudgetAllocation`<br>`BanjarProfile`<br>`CommunityEvent`<br>`CleanupAction` | Sponsor CSR | `test_phase6_community_funding_and_special_features.py` | **PASS (100%)**<br>Aksi pantai terpisah dari metrik pickup rutin. |
| **Journey G**<br>Pengendalian Limbah B3 Berbahaya | Web: `/admin/limbah-b3` | `POST /community/hazardous-manifests`<br>`PATCH /community/hazardous-manifests/{id}/status`<br>`POST /community/hazardous-manifests/{id}/disposal` | `community/service.py`<br>`taxonomy/service.py` | `HazardousWasteManifest`<br>`Partner` | Pengangkut & Insinerator berizin KLHK | `test_phase6_community_funding_and_special_features.py` | **PASS (100%)**<br>Tertutup dari alur pickup biasa. |

---

## 2. Kesimpulan Evaluasi Tahap 1 & Quality Gate

- **Inventarisasi Repository:** Selesai dan terdokumentasi lengkap di `docs/quality/01_SYSTEM_INVENTORY.md`.
- **Baseline Test Suite:** Seluruh 76 tes backend, 89 tes frontend, dan 15 tes mobile lulus 100% (didokumentasikan di `docs/quality/01_BASELINE_TEST_RESULTS.md`).
- **Audit Kode & Keamanan:** Ditemukan 5 temuan (2 High, 2 Medium, 1 Low) di `docs/quality/01_AUDIT_FINDINGS.md`.
- **Peta Integrasi:** Seluruh 7 journey kritis (A–G) terpetakan di `docs/quality/01_INTEGRATION_MATRIX.md`.

**Quality Gate Tahap 1: TERPENUHI (PASS)**.  
Sesuai aturan eksekusi otomatis Bagian A1 & A3: Langsung lanjutkan ke **Tahap 2 — Autonomous Safe Fix & Logic Hardening**.
