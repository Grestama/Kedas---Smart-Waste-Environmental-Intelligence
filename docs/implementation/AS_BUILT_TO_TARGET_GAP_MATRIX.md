# KEDAS AS-BUILT TO TARGET GAP MATRIX
## Pemetaan Kesenjangan 12 Bounded Context (Community & Green Tourism Target)

**Versi:** 1.0  
**Tanggal:** 2026-10-30T12:31:00+08:00 (WITA)  
**Referensi:** PRD, SRS, SDD, `STRATEGI_PRODUK_DAN_DESAIN_SISTEM_KEDAS_COMMUNITY_GREEN_TOURISM.md`, dan Master Prompt 10 Tahap.

---

## 1. Skema Status Gap

- `EXISTS_VERIFIED`: Fitur sudah terimplementasi penuh di backend, frontend, dan lulus automated tests.
- `PARTIAL`: Fitur memiliki fondasi tabel, endpoint, atau UI, namun memerlukan perluasan logika spesifik kawasan/perjalanan material.
- `MISSING`: Belum diimplementasikan dan menjadi target pembangunan baru dalam 10 tahap.
- `BROKEN`: Implementasi mengalami kesalahan logika atau pengujian gagal.
- `BLOCKED_BY_FIELD_VALIDATION`: Logika bergantung pada keputusan manusia/operator lapangan dan diset ke mode `pending_validation` atau konfigurasi aman.

---

## 2. Matriks Pemetaan 12 Bounded Context

| Bounded Context | Fitur / Kapabilitas Target | Aktor Utama | Modul / Kode | Endpoint / Service | Model / Tabel | Status Gap | Rekomendasi Arsitektural |
|---|---|---|---|---|---|---|---|
| **BC-01: Identity & Access** | Multi-role account, session lifecycle, role-switching | All Roles | `app.modules.account` | `/auth/*`, `/me/*` | `users`, `roles`, `user_roles`, `auth_sessions` | `EXISTS_VERIFIED` | **Reuse**. RBAC 8 roles sudah sangat stabil, 0 security bug. |
| **BC-01: Identity & Access** | Scoped Organization Membership & Invitations | Banjar, HOREKA, Fasilitas | `app.modules.account`, `community`, `marketplace` | `/b2b/organizations`, `/community/banjar/officials` | `b2b_organization_members`, `banjar_officials` | `PARTIAL` | **Extend**. Formalisasi membership scope seragam lintas entitas organisasi. |
| **BC-02: Destination & Community** | Service Area, Zones & Banjar Governance | Warga, Prajuru, Admin | `app.modules.community`, `taxonomy` | `/service-areas`, `/community/banjar/*` | `service_areas`, `banjar_profiles`, `banjar_officials` | `EXISTS_VERIFIED` | **Reuse**. Struktur banjar dan desa sudah memiliki territorial dashboard. |
| **BC-02: Destination & Community** | Community Destination Operating Agreement (CDOA) | Prajuru, Pengelola Kawasan | `app.modules.community` | *Target Tahap 2* | `cdoa_agreements` (Target Tahap 2) | `PARTIAL` | **Extend**. Bangun versioned agreement entity yang mengikat aturan jadwal, material, dan kapasitas. |
| **BC-03: Waste Source & Guidance** | Master Kategori Sampah & Panduan Pemilahan | Warga, HOREKA, Tamu | `app.modules.taxonomy` | `/waste-categories`, `/material-acceptance-rules` | `waste_categories`, `material_acceptance_rules` | `EXISTS_VERIFIED` | **Reuse**. Dilengkapi aturan kontaminasi dan panduan pemilahan lokal. |
| **BC-04: Collection Operations** | Penjemputan Berbasis Slot & Kuota Kapasitas | Warga, Petugas, Dispatcher | `app.modules.collection` | `/pickup-requests`, `/collector/tasks/*` | `pickup_requests`, `collection_slots`, `pickup_status_events` | `EXISTS_VERIFIED` | **Reuse**. Concurrency row-locking dan pencegahan overbooking sudah teruji. |
| **BC-04: Collection Operations** | Kedas Waste Passport & QR Event Ledger | Warga, Petugas, Operator | `app.modules.collection`, `evidence` | *Target Tahap 4* | `pickup_status_events`, `evidence_files` | `PARTIAL` | **Extend**. Tambahkan opaque signed QR token generator dan publik event timeline. |
| **BC-05: Facility Operations** | Facility Intake, Timbangan Gross/Tare/Net, Inspeksi | Operator Fasilitas | `app.modules.facility`, `inspection`, `weight` | `/facilities/receipts`, `/sorting`, `/stock` | `facilities`, `facility_receipts`, `inspection_records`, `stock_movements` | `EXISTS_VERIFIED` | **Reuse**. Intake, penimbangan, dan kalkulasi toleransi telah berjalan. |
| **BC-05: Facility Operations** | Facility Intelligence & Dynamic Service Eligibility | Warga, Operator | `app.modules.facility`, `collection` | *Target Tahap 3* | `facilities`, `material_acceptance_rules` | `PARTIAL` | **Extend**. Engine deterministik pencegah request jika fasilitas paused/overloaded. |
| **BC-06: Material Traceability** | Batch Genealogy, Split/Merge & Mass Balance | Operator, Admin, Auditor | `app.modules.facility`, `marketplace` | `/facilities/sorting`, `/admin/batches` | `material_batches`, `material_batch_items`, `stock_movements` | `PARTIAL` | **Extend**. Formula mass balance eksplisit (Input = Output + Residu + Loss + Adjustment). |
| **BC-07: Circular Exchange** | Marketplace B2B, Penawaran Material & Handover | Mitra Offtaker, Operator | `app.modules.marketplace` | `/marketplace/offers`, `/admin/deliveries/*` | `partners`, `material_offers`, `delivery_records` | `EXISTS_VERIFIED` | **Reuse**. Gating lisensi lingkungan dan pencatatan selisih timbangan pembeli aktif. |
| **BC-07: Circular Exchange** | Circular Demand Board (Matching Kebutuhan Buyer) | Mitra Offtaker, Fasilitas | `app.modules.marketplace` | *Target Tahap 7* | `material_offers`, `partners` | `PARTIAL` | **Extend**. Menampilkan demand board spesifikasi material unreserved secara transparan. |
| **BC-08: Green Hospitality** | Profil HOREKA, Multi-Lokasi, & Log Sampah | Manajer/Staf HOREKA | `app.modules.marketplace` | `/b2b/organizations`, `/locations`, `/pickups`, `/report` | `b2b_organizations`, `b2b_locations`, `b2b_pickup_requests` | `EXISTS_VERIFIED` | **Reuse**. Multi-lokasi per tenant dan isolasi data komersial sudah teruji. |
| **BC-08: Green Hospitality** | Green Hospitality Ledger & Laporan Bukti Harian | Staf Dapur/Housekeeping | `app.modules.marketplace` | *Target Tahap 5* | `b2b_pickup_requests` | `PARTIAL` | **Extend**. Penambahan kategori source-area (kitchen, housekeeping, banquet) & export periodik. |
| **BC-09: Community Programs** | Gotong Royong (Ngayah), Event Banjar, Keluhan | Warga, Prajuru Banjar | `app.modules.community` | `/community/cleanups`, `/events`, `/complaints` | `cleanup_actions`, `community_events`, `community_complaints` | `EXISTS_VERIFIED` | **Reuse**. Registrasi relawan, verifikasi aksi, dan eskalasi keluhan warga teruji. |
| **BC-10: Guest Experience** | Guest Green Companion (Public Microsite QR) | Wisatawan, Tamu Hotel | `frontend/src/app/guest` | *Target Tahap 6* | *No Auth DB Required* (Public Verified Data) | `PARTIAL` | **New / Extend**. Microsite bilingual (ID/EN) tanpa login, memandu etiket lingkungan & lokasi sampah. |
| **BC-11: Incentive & Funding** | WastePoints Ledger & Aturan Poin Terverifikasi | Warga, Admin | `app.modules.points` | `/points/balance`, `/points/ledger`, `/admin/points/*` | `reward_rules`, `ledger_entries` | `EXISTS_VERIFIED` | **Reuse**. Server-side idempotent credit ledger, terisolasi dari saldo uang tunai. |
| **BC-11: Incentive & Funding** | CSR Sponsorship & Budget Allocation Governance | Sponsor, Prajuru, Admin | `app.modules.funding` | `/programs`, `/programs/{id}/allocations` | `funding_programs`, `program_sponsorships`, `program_budget_allocations` | `EXISTS_VERIFIED` | **Reuse**. Alokasi dana transparan per pos program dan tracking realisasi. |
| **BC-12: Analytics & Audit** | Ringkasan Laporan, Export Audit Trail & Outbox | Admin, Koordinator | `app.modules.admin`, `audit` | `/admin/reports/summary`, `/reports/export`, `/audit-logs` | `audit_logs`, `notification_outbox` | `EXISTS_VERIFIED` | **Reuse**. Audit log append-only dengan filter aktor dan korelasi transaksi. |
| **BC-12: Analytics & Audit** | Destination Clean Loop Index (DCLI) | Pengelola Kawasan | Analytics Engine | *Target Tahap 8* | Aggregated metrics | `MISSING` | **New**. Indikator sirkularitas kawasan dengan guardrail data coverage ketat. |
