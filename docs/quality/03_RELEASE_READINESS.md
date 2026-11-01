# 03. Kesiapan Rilis & Rencana Operasional Pilot (Release Readiness) — WasteLink Bali

**Tanggal**: 30 Oktober 2026  
**Status Evaluasi**: **READY FOR CONTROLLED PILOT (WILAYAH TERBATAS)**  
**Wilayah Target Pilot Awal**: Banjar Terpilih (Kecamatan Ubud & Denpasar Selatan)

---

## 1. Checklist Kesiapan per Area Operasional

| Area Operasional | Item Kesiapan | Status | Bukti / Catatan |
|---|---|---|---|
| **1. Warga & Rumah Tangga** | Registrasi, verifikasi profil, panduan pemilahan 4 kategori utama, pemesanan penjemputan mandiri, drop-off point, notifikasi status, pelacakan poin reward. | **READY** | Rute `/app/*`, integrasi dynamic data auth, zero mock fallback error. |
| **2. Petugas & Dispatch** | Penerimaan tugas dinamis, verifikasi kelayakan petugas, alur inspeksi di lokasi, penimbangan multi-kategori, bukti foto digital, penanganan kendala lapangan (field failure). | **READY** | Rute `/staff/*`, tes konkurensi klaim atomik lolos, state machine terlindungi. |
| **3. TPS3R / TPST** | Penerimaan material dari petugas, rekonsiliasi diskrepansi berat, pemilahan material dengan perlindungan row-lock pesimis, pencatatan residu TPA, mass balance check. | **READY** | Modul fasilitas tervalidasi via `test_phase4`, serialisasi mutasi stok aktif. |
| **4. Bank Sampah** | Pendaftaran nasabah, penimbangan kategori terpilah, buku tabungan digital, pembukuan debit/kredit atomik, alur kompensasi pembalikan data salah timbang. | **READY** | Modul tabungan nasabah lulus audit ledger ganda. |
| **5. Mitra Material & B2B** | Verifikasi izin usaha/lisensi daur ulang, katalog penawaran material terpilah, konfirmasi pengiriman & penerimaan material daur ulang/organik, isolasi tenant komersial. | **READY** | Modul marketplace & B2B tervalidasi di `test_phase5`. |
| **6. Banjar & Komunitas** | Dashboard prajuru banjar berbasis wilayah teritorial, pelaporan volume sampah banjar, alokasi dana program CSR/sponsorship, pengelolaan aksi bersih pantai/banjar, manifes limbah upakara & B3. | **READY** | Modul community tervalidasi di `test_phase6`. |
| **7. Operasi Lapangan Offline** | Antrian mutasi lokal di mobile saat sinyal blank spot di perbukitan/gang sempit, sinkronisasi idempotensi otomatis saat kembali online. | **READY** | Suite mobile 15/15 lulus, penanganan idempotency key teruji. |

---

## 2. Matriks Manajemen Risiko & Rencana Mitigasi

| Risiko Operasional | Kemungkinan | Dampak | Rencana Mitigasi Sistem |
|---|---|---|---|
| **Konektivitas Seluler Terputus di Lapangan** | Tinggi | Sedang | Mobile app dan web client dilengkapi offline queue lokal; data tersimpan di IndexedDB/SQLite lokal dan disinkronkan bertahap saat koneksi pulih dengan idempotency key. |
| **Perbedaan Timbangan Petugas vs Fasilitas** | Sedang | Sedang | Sistem mendukung toleransi deviasi (default 5%); jika diskrepansi melebihi batas, status ditandai `DISCREPANCY_FLAGGED` dan memicu notifikasi investigasi supervisor tanpa memblokir alur masuk material. |
| **Lonjakan Penjemputan pada Hari Raya (Galungan/Kuningan)** | Tinggi | Tinggi | Fitur *Slot Capacity Limiter* per banjar membatasi antrian agar tidak melebihi armada aktif; sistem menyediakan opsi pengalihan ke mode setoran mandiri (Drop-off Point Banjar). |
| **Kontaminasi Sampah Tinggi / Tercampur** | Sedang | Rendah | Petugas lapangan memiliki fitur *Contamination Inspection* di mana skor kontaminasi memicu penyesuaian otomatis perolehan poin warga atau penolakan santun berfoto. |

---

## 3. Prosedur Deployment & Rollback yang Direkomendasikan

### A. Prosedur Deployment ke Lingkungan Pilot
1. **Pengecekan Lingkungan**:
   - Pastikan variabel lingkungan terisi lengkap sesuai standar production:
     `DATABASE_URL`, `SECRET_KEY` (>= 32 karakter), `ENVIRONMENT=pilot`, `TIMEZONE=Asia/Makassar`.
2. **Migrasi Basis Data**:
   - Jalankan migrasi Alembic:
     ```bash
     cd backend
     alembic upgrade head
     ```
   - Verifikasi versi migrasi mencapai `0008_governance_and_special_waste`.
3. **Deploy Backend Service**:
   - Jalankan container/service FastAPI di belakang reverse proxy:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
     ```
4. **Deploy Frontend Web & Mobile Web**:
   - Bangun aset teroptimasi Next.js:
     ```bash
     npm --prefix frontend run build
     npm --prefix frontend start
     ```
5. **Verifikasi Kesiapan Layanan (Smoke Test)**:
   - Akses endpoint `/api/v1/health/live` dan pastikan respon `{"status": "ok"}`.
   - Akses endpoint `/api/v1/health/ready` dan pastikan konektivitas basis data terverifikasi (`"database": "ok"`).

### B. Prosedur Rollback Cepat (Zero Data Loss)
Jika ditemukan anomali kritis pasca-deployment:
1. Alihkan traffic reverse proxy kembali ke image/release versi sebelumnya.
2. Jika migrasi DDL terbaru perlu dibatalkan:
   ```bash
   cd backend
   alembic downgrade -1
   ```
   *(Catatan: Semua migrasi 0001–0008 telah teruji 100% reversibel di `test_db_migration.py`).*
3. Periksa tabel `audit_logs` untuk memastikan tidak ada inkonsistensi transaksi yang menggantung.

---

## 4. Runbook Operasional Ringkas

- **Healthcheck Rutin**:
  - `GET /api/v1/health/live` (Liveness probe tiap 10 detik)
  - `GET /api/v1/health/ready` (Readiness probe tiap 30 detik)
- **Backup Basis Data Terjadwal**:
  - Eksekusi snapshot PostgreSQL otomatis setiap hari pukul 02:00 WITA.
  - Retensi backup: 30 hari lokal, 90 hari di offsite cold storage terenkripsi.
- **Penanganan Insiden Diskrepansi Timbangan**:
  - Supervisor membuka `/admin/permintaan` -> filter status `DISCREPANCY_FLAGGED`.
  - Supervisor membandingkan foto timbangan lapangan dengan foto timbangan timbang jembatan/duduk TPS3R.
  - Lakukan koreksi resmi; sistem secara otomatis menerbitkan entri penyesuaian kompensasi di `points_ledger` dengan catatan audit lengkap.
