# KEDAS AS-BUILT INVENTORY REPORT
## Laporan Inventaris Aktual Sistem Kedas (Community & Green Tourism Platform)

**Tanggal Eksekusi:** 2026-10-30T12:30:00+08:00 (WITA)  
**Versi Repositori:** Commit `84789d6` (Branch `master`)  
**Metodologi:** Static code analysis, endpoint introspection via FastAPI reflection, SQLAlchemy metadata inspection, and test suite execution.

---

## 1. Stack & Repository Architecture

| Komponen | Teknologi Aktual | Versi / Rincian |
|---|---|---|
| **Pola Arsitektur** | Modular Monolith | Backend modular monolith dengan domain separation terisolasi |
| **Backend Core** | Python, FastAPI, Starlette | Python 3.13.5, FastAPI 0.115.0, Uvicorn, Pydantic v2 |
| **Database & ORM** | PostgreSQL / SQLite (test), SQLAlchemy 2.0, Alembic | 8 Revisions (`0001_baseline_audit_log` s.d. `0008_community_programs_funding_and_special_features`) |
| **Frontend Web** | Next.js, React, TypeScript, Tailwind CSS | Next.js 15.1.7 (App Router), React 19, Tailwind CSS v3.4 |
| **Mobile Client** | TypeScript, Offline Store, Mutation Queue | Arsitektur engine offline-first dengan IndexedDB/SQLite adapter |
| **Testing Engine** | Pytest, Vitest, Testing Library | Pytest 9.1.1 (backend), Vitest 3.2.7 (frontend), Vitest 5.0.5 (mobile) |
| **Linters & Types** | Ruff, Mypy, TypeScript Compiler | Ruff 0.8+, Mypy strict in `backend/app/`, TSC strict in `frontend/` & `mobile/` |

---

## 2. Inventaris Akun & Role RBAC (8 Role Sistem)

Kedas menerapkan model RBAC berbasis 8 system role yang terdaftar dalam tabel `roles` dan relasi `user_roles`:

1. `USER` — Warga / rumah tangga yang memesan penjemputan, memilah sampah, menukar WastePoints, dan melihat riwayat setoran.
2. `COLLECTOR` — Petugas armada / pengangkut lapangan yang mengklaim tugas penjemputan, menimbang sampah di sumber, dan menyerahkan ke fasilitas.
3. `DISPATCHER` — Koordinator armada yang memantau penugasan, menetapkan kembali (reassign) tugas terlantar, dan mengelola slot layanan.
4. `FACILITY_OPERATOR` — Operator TPS3R / TPST yang mengelola penerimaan sampah (intake), inspeksi kontaminasi, pemilahan, dan pencatatan residu.
5. `WASTE_BANK_STAFF` — Petugas bank sampah unit yang mengelola tabungan sampah warga, saldo buku tabungan, dan penarikan kas/saldo.
6. `PARTNER` — Pengepul, agregator, pendaur ulang, dan pembeli B2B / offtaker material terpilah dan kompos organik.
7. `COMMUNITY_LEADER` — Prajuru banjar / kepala desa / koordinator lingkungan yang mengelola profil banjar, keluhan warga, aksi gotong royong, dan program pendanaan.
8. `ADMIN` — Administrator platform yang memiliki akses menyeluruh ke audit log, verifikasi mitra, penetapan aturan reward, dan pelaporan kawasan.

---

## 3. Inventaris Database Tables (44 Tabel Terverifikasi)

Hasil refleksi langsung dari `Base.metadata.tables`:

### A. Core & Identity (7 Tabel)
- `users`: Identitas akun utama, email, nama, hashed password, preferred active role, nomor telepon, status verifikasi.
- `roles`: Master 8 role sistem.
- `user_roles`: Many-to-many user ke role.
- `auth_sessions`: Session token, refresh token, expiry, user agent, IP address.
- `user_addresses`: Alamat multi-lokasi warga dengan koordinat lat/long, label, dan flag default.
- `collector_applications`: Permohonan warga menjadi petugas pengangkut (KTP, SIM, plat kendaraan, status review).
- `audit_logs`: Audit trail tidak dapat diubah (append-only) mencatat actor, action, entity, delta data, dan correlation ID.

### B. Taxonomy & Service Area (4 Tabel)
- `waste_categories`: Master kategori sampah (Organik, Anorganik/Plastik, Kertas, Logam, Kaca, B3/Residu) dengan instruksi pilah.
- `service_areas`: Wilayah cakupan operasional berbasis desa/kelurahan/kawasan dengan status layanan aktif/nonaktif.
- `collection_slots`: Jadwal dan kuota kapasitas penjemputan per tanggal, area layanan, dan shift.
- `material_acceptance_rules`: Aturan penerimaan material per fasilitas/area (kategori diterima, ambang kontaminasi, status).

### C. Collection Operations & Tracking (4 Tabel)
- `pickup_requests`: Transaksi penjemputan sampah dari warga/sumber (status: DRAFT, SUBMITTED, SCHEDULED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED).
- `pickup_status_events`: Riwayat mutasi status penjemputan dengan timestamp dan actor.
- `weight_records`: Catatan penimbangan berat (gross, tare, net) dengan jenis timbangan dan toleransi.
- `evidence_files`: Metadata file bukti foto/dokumen terverifikasi (path, mime type, hash, status).

### D. Facility Operations & Waste Bank (6 Tabel)
- `facilities`: Master fasilitas pemrosesan sampah (TPS3R, TPST, Bank Sampah Induk) dengan kapasitas harian dan status operasional.
- `facility_receipts`: Tanda terima intake material di fasilitas dengan berat diterima, berat ditolak, dan status inspeksi.
- `inspection_records`: Catatan uji petik dan kontrol kualitas kontaminasi sampah di fasilitas.
- `stock_movements`: Mutasi inventori stok material di fasilitas (intake, sorted, processed, dispatched).
- `waste_bank_members`: Anggota terdaftar bank sampah unit.
- `waste_bank_transactions`: Buku tabungan setoran dan penarikan bank sampah dengan dukungan pembatalan kompensasi (*compensating reversal*).

### E. Marketplace, B2B & Organic Processing (8 Tabel)
- `partners`: Profil mitra pengepul, agregator, industri daur ulang, dan offtaker dengan nomor izin lingkungan.
- `material_batches`: Batch material terpilah di fasilitas yang siap dijual atau diolah.
- `material_batch_items`: Rincian item penerimaan yang membentuk batch material.
- `material_offers`: Penawaran lelang/penjualan material ke mitra terverifikasi.
- `delivery_records`: Catatan pengiriman material ke mitra beserta konfirmasi penerimaan dan penimbangan ulang.
- `b2b_organizations`: Profil badan usaha komersial (hotel, restoran, kafe, vila / HOREKA).
- `b2b_locations`: Titik lokasi properti/unit usaha HOREKA.
- `b2b_organization_members`: Anggota staf/manajer organisasi HOREKA.
- `b2b_pickup_requests`: Permintaan penjemputan volume komersial terjadwal dari HOREKA.
- `organic_processing_records`: Catatan pengolahan kompos dan biokonversi maggot BSF di TPS3R.

### F. Community Governance, Funding & Special Waste (9 Tabel)
- `banjar_profiles`: Profil banjar adat / lingkungan rukun warga terdaftar.
- `banjar_officials`: Prajuru / pengurus banjar yang mengoordinasikan kebersihan kawasan.
- `community_events`: Jadwal sosialisasi, pelatihan, dan musyawarah kebersihan banjar.
- `community_complaints`: Pengaduan tumpukan sampah liar atau keluhan layanan warga dengan bukti foto dan eskalasi.
- `cleanup_actions`: Aksi gotong royong / *ngayah* pembersihan lingkungan dengan target area dan log partisipasi.
- `funding_programs`: Program sponsor dan dana CSR kebersihan destinasi pariwisata.
- `program_sponsorships`: Perjanjian sponsor dengan alokasi dana dan target kinerja.
- `program_budget_allocations`: Realisasi anggaran program ke pos operasional TPS3R / insentif petugas.
- `hazardous_waste_manifests`: Manifest limbah medis/B3 rumah tangga dengan pengawalan transporter berizin.

### G. Incentive, Rewards & Notification (4 Tabel)
- `reward_rules`: Matriks aturan konversi setoran sampah menjadi WastePoints berdasarkan jenis sampah dan bobot.
- `ledger_entries`: Buku besar append-only kredit/debit poin reward warga yang terisolasi dari saldo uang tunai.
- `notifications`: Notifikasi dalam aplikasi ke pengguna per event status penjemputan/pengaduan.
- `notification_outbox`: Antrean outbox pengiriman notifikasi asinkron untuk menjamin keandalan pengiriman.

---

## 4. Inventaris Endpoint API (114 Endpoints Terverifikasi)

- **Auth & Session (3 endpoints):** `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`
- **Profil & Alamat Pengguna (8 endpoints):** `/api/v1/me`, `/api/v1/me/active-role`, `/api/v1/me/roles`, `/api/v1/me/addresses` (GET/POST/DELETE/PATCH)
- **Area Layanan & Kuota Slot (4 endpoints):** `/api/v1/service-areas`, `/api/v1/service-areas/{id}/slots`
- **Taksonomi & Aturan Pilah (5 endpoints):** `/api/v1/waste-categories`, `/api/v1/material-acceptance-rules`
- **Penjemputan Warga (7 endpoints):** `/api/v1/pickup-requests` (POST, mine, cancel, detail, inspections, weights)
- **Tugas Petugas / Dispatch (4 endpoints):** `/api/v1/collector/tasks/available`, `mine`, `accept`, `status`
- **Permohonan Petugas (2 endpoints):** `/api/v1/collector-applications` (POST, mine)
- **Fasilitas & Residu (10 endpoints):** `/api/v1/facilities`, `/receipts`, `/sorting`, `/stock`, `/waste-bank/members`, `/deposit`, `/withdraw`, `/transactions/{id}/reverse`
- **Marketplace & B2B HOREKA (11 endpoints):** `/api/v1/marketplace/offers`, `/offers/{id}/accept`, `/api/v1/b2b/organizations`, `/locations`, `/pickups`, `/report`
- **Pengolahan Organik (2 endpoints):** `/api/v1/organic/processing/start`, `/complete`
- **Komunitas Banjar, Aksi & Pengaduan (15 endpoints):** `/api/v1/community/banjar/profile`, `/officials`, `/dashboard`, `/cleanups`, `/complaints`, `/events`, `/hazardous-manifests`
- **Program & Sponsorship CSR (4 endpoints):** `/api/v1/programs`, `/allocations`, `/sponsorships`
- **WastePoints Ledger (2 endpoints):** `/api/v1/points/balance`, `/api/v1/points/ledger`
- **Bukti & File Upload (3 endpoints):** `/api/v1/evidence`, `/upload`, `/download`
- **Notifikasi (3 endpoints):** `/api/v1/notifications`, `/read-all`, `/{id}/read`
- **Admin & Tata Kelola (14 endpoints):** `/api/v1/admin/dashboard`, `/users`, `/partners`, `/batches`, `/deliveries`, `/reports/summary`, `/reports/export`, `/audit-logs`, `/points/rules`, `/points/adjust`, `/pickups/{id}/reassign`
- **Health Check & Dokumentasi (5 endpoints):** `/api/v1/health/live`, `/ready`, `/docs`, `/redoc`, `/openapi.json`

---

## 5. Inventaris Frontend Web (37 Rute Next.js 15)

1. Public Landing & Informational: `/`, `/area-layanan`, `/faq`, `/panduan-pilah`, `/kontak`
2. Autentikasi: `/masuk`, `/daftar`, `/lupa-password`
3. Portal Warga: `/app`, `/app/setor`, `/app/riwayat`, `/app/waste-points`, `/app/profil`, `/app/alamat`, `/app/dampak`
4. Portal Petugas: `/collector`, `/collector/tugas`, `/collector/riwayat`, `/collector/peta`, `/collector/profil`
5. Portal Operator Fasilitas & Bank Sampah: `/facility`, `/facility/intake`, `/facility/sortir`, `/facility/bank-sampah`, `/facility/stok`
6. Portal Mitra & B2B HOREKA: `/partner`, `/partner/katalog`, `/partner/pesanan`, `/b2b`, `/b2b/log`, `/b2b/laporan`
7. Portal Pengurus Banjar / Komunitas: `/community`, `/community/kegiatan`, `/community/laporan-warga`, `/community/banjar`
8. Portal Admin: `/admin`, `/admin/pengguna`, `/admin/mitra`, `/admin/laporan`, `/admin/audit-log`
9. Mobile Web Wrapper: `/mobile`
