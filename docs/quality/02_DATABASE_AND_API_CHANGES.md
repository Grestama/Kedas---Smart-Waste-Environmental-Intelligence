# 02. Catatan Perubahan Database & API — WasteLink Bali

**Tanggal**: 30 Oktober 2026  
**Auditor**: Database Architect & API Lead  
**Tujuan**: Melacak seluruh perubahan skema basis data, migration, locking strategy, dan kontrak API selama proses remediasi Tahap 2.

---

## 1. Analisis Skema Database & Migrasi

### A. Status Migrasi Alembic
Seluruh 8 versi migrasi Alembic yang telah diterapkan terbukti konsisten, reversibel, dan telah diuji secara dua arah (*upgrade -> downgrade -> upgrade*) melalui suite `tests/api/test_db_migration.py`:

1. `0001_core_schema.py`: Tabel `users`, `audit_logs`, enum peran dan status pengguna.
2. `0002_warga_source.py`: Tabel `addresses`, `pickup_requests`, `pickup_items`, `service_areas`, `waste_categories`, `points_ledger`.
3. `0003_petugas_dispatch.py`: Tabel `collector_profiles`, `pickup_tasks`, `task_events`, `inspections`, `weighing_records`, `drop_off_receipts`.
4. `0004_facility_and_waste_bank.py`: Tabel `facilities`, `facility_receipts`, `waste_bank_accounts`, `waste_bank_transactions`, `facility_inventory`.
5. `0005_marketplace_and_b2b.py`: Tabel `partners`, `material_offers`, `material_orders`, `commercial_contracts`.
6. `0006_community_and_funding.py`: Tabel `banjars`, `banjar_officials`, `community_events`, `sponsorships`, `cleanup_actions`.
7. `0007_phase7_pilot_readiness.py`: Tabel `offline_sync_events`, `pilot_feedbacks`, `sla_breach_logs`.
8. `0008_governance_and_special_waste.py`: Tabel `hazardous_manifests`, `facility_licensing_records`.

### B. Evaluasi Kebutuhan Migrasi Tambahan pada Tahap 2
- **Hasil Audit**: Struktur tabel dan indeks yang ada sudah sangat lengkap dan mencakup seluruh relasi referensial, indeks komposit (`service_area_id`, `status`, `created_at`), dan check constraint.
- **Tindakan**: **TIDAK ADA MIGRATION BARU YANG DIPERLUKAN**. Mempertahankan stabilitas skema produksi tanpa modifikasi DDL yang berisiko.
- **Penerapan Concurrency Lock**: Dilakukan pada level DML / ORM query logic dengan memanfaatkan fitur bawaan PostgreSQL/SQLAlchemy:
  - Penambahan `.with_for_update()` pada query seleksi fasilitas di `FacilityService.sort_received_waste()`.
  - Serialisasi ini mencegah fenomena lost update dan negatif inventaris pada saat eksekusi paralel tanpa memerlukan perubahan kolom atau DDL tabel.

---

## 2. Perubahan Kontrak & Perilaku API

Meskipun endpoint URL dan struktur payload dasar tetap mematuhi spesifikasi OpenAPI v3, perilaku penanganan respon pada lapisan service client diselaraskan agar tidak menelan kode status error dari backend:

### A. Endpoint Pembuatan Permintaan Jemput
- **Path**: `POST /api/v1/collection/requests`
- **Perubahan Perilaku Client (`collectionService.createPickupRequest`)**:
  - **Sebelumnya**: Jika backend merespons dengan HTTP `400 Bad Request` (misal: kuota slot area habis), client menangkap error dan mengembalikan objek mock baru dengan ID acak `req-mock-***`, menipu form bahwa request berhasil dibuat.
  - **Sesudahnya**: Client memeriksa `err.status`. Jika status adalah kode HTTP (misal 400, 422, 401), error `ApiError` dilemparkan langsung ke form sehingga pesan kesalahan seperti `"Kapasitas penjemputan pada slot ini sudah penuh"` ditampilkan secara jujur kepada warga.

### B. Endpoint Pembatalan Permintaan Jemput
- **Path**: `POST /api/v1/collection/requests/{request_id}/cancel`
- **Perubahan Perilaku Client (`collectionService.cancelPickupRequest`)**:
  - **Sebelumnya**: Error `409 Conflict` (saat permintaan sudah berada dalam status `IN_TRANSIT` atau `COMPLETED`) ditelan dan mengembalikan respon sukses lokal.
  - **Sesudahnya**: Melemparkan error `ApiError` ke UI sehingga modal pembatalan memberi tahu warga bahwa permintaan tidak lagi dapat dibatalkan secara sepihak.

### C. Endpoint Pengambilan Tugas Petugas
- **Path**: `POST /api/v1/dispatch/tasks/{task_id}/claim`
- **Perubahan Perilaku Client (`staffService.acceptTask`)**:
  - **Sebelumnya**: Error konflik klaim `409 Conflict` (tugas sudah diambil petugas lain) ditelan dan tugas dipindahkan ke daftar tugas aktif petugas secara lokal.
  - **Sesudahnya**: Melemparkan `ApiError(status=409)` sehingga UI menampilkan notifikasi peringatan: *"Tugas ini baru saja diambil oleh petugas lain"*.

### D. Endpoint Pembaruan Status Tugas Petugas
- **Path**: `POST /api/v1/dispatch/tasks/{task_id}/status`
- **Perubahan Perilaku Client (`staffService.updateTaskStatus`)**:
  - **Sebelumnya**: Transisi ilegal `400 Bad Request` ditelan dan store in-memory dimutasi.
  - **Sesudahnya**: Penolakan transisi status dilempar ke komponen UI dan state lokal tidak dimutasi sembarangan.

---

## 3. Kompatibilitas Mundur (Backward Compatibility)
- Seluruh perubahan API bersifat **100% backward compatible**. Tidak ada penghapusan parameter, perubahan tipe data respon, atau perubahan URL endpoint.
- Aplikasi mobile dan web yang beroperasi dalam mode offline murni (`status === 0` / Network Error) tetap mempertahankan fallback offline queue yang aman.
