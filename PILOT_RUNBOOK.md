# WasteLink Bali — Petunjuk Operasional & Kesiapan Uji Coba Lapangan (Pilot Runbook)
**Versi Dokumen:** 1.0  
**Tanggal Rilis:** 30 Oktober 2026  
**Status:** Pilot Production Readiness  
**Zona Waktu:** Waktu Indonesia Tengah (WITA, UTC+8)  
**Mata Uang:** Indonesian Rupiah (IDR)  

---

## 1. Lokasi & Wilayah Target Percontohan (Pilot Areas)

Implementasi percontohan WasteLink Bali dirancang untuk dua wilayah berkarakteristik komplementer yang mewakili ekosistem Pulau Dewata secara utuh:

### A. Wilayah 1: Kecamatan Sukawati, Kabupaten Gianyar
- **Area Layanan Pilot:** Desa Adat Sukawati (Banjar Sukawati Kaja & Banjar Babakan).
- **Fasilitas Pengolahan Utama:** TPS3R Sukawati Kaja Mandiri & Bank Sampah Banjar Sukawati.
- **Karakteristik & Fokus Operasional:**
  - Komunitas adat yang kohesif dengan partisipasi aktif Krama Banjar dan pengawasan Prajuru Lingkungan Hidup.
  - Aliran sampah dominan: **Sampah Upakara / Canang / Dedaunan Organik** pasca upacara adat, serta **Anorganik Daur Ulang Bernilai (Kardus & Botol PET)** melalui Bank Sampah Banjar.
  - Alur biokonversi: Sisa bahan organik dialirkan ke komposting aerobik banjar dan budidaya larva Black Soldier Fly (BSF Maggot) di TPS3R.

### B. Wilayah 2: Sanur Kauh, Denpasar Selatan, Kota Denpasar
- **Area Layanan Pilot:** Kawasan Pesisir & Pariwisata Sanur Kauh.
- **Fasilitas Pengolahan Utama:** TPST Denpasar Selatan & Jaringan Daur Ulang Hilir Pelabuhan Benoa.
- **Karakteristik & Fokus Operasional:**
  - Wilayah campuran permukiman, sentra kuliner, hotel butik, dan vila (Penghasil Komersial B2B).
  - Aksi berkala **Pembersihan Pantai & Muara Sungai (Beach Cleanup)** oleh relawan dan komunitas pecinta alam.
  - Aliran material berisiko: Pengumpulan limbah B3 rumah tangga terpisah (baterai, kemasan insektisida, lampu neon) dengan manifest resmi bermitra dengan pengolah B3 berizin KLHK di kawasan Pelabuhan Benoa.

---

## 2. Panduan Penyediaan Akun & Peran (Role Provisioning Guide)

WasteLink Bali mengoperasikan model otorisasi granular berbasis kombinasi **Role + Wilayah Layanan (Service Area) + Fasilitas/Organisasi**. Berikut adalah prosedur provisioning untuk ke-12 peran:

| # | Peran Ekosistem | Kode Role Sistem | Lingkup Hak Akses & Persyaratan Verifikasi |
|---|---|---|---|
| 1 | **Warga / Rumah Tangga** | `USER` | Pendaftaran mandiri via Mobile/Web. Akses membuat pickup request terjadwal, memantau riwayat timbangan, cek saldo poin, dan pengaduan banjar. |
| 2 | **Petugas Pengangkut** | `COLLECTOR` | Didaftarkan oleh Dinas/Desa. Wajib verifikasi nomor HP dan pelat armada. Hak akses: Melihat antrean tugas wilayahnya, update status (`EN_ROUTE`, `ARRIVED`), inspeksi QC, dan timbang lapangan. |
| 3 | **Supervisor / Dispatcher** | `DISPATCHER` / `ADMIN` | Akses re-assign tugas pengangkutan macet, penyesuaian jadwal armada, dan monitoring pergerakan harian petugas. |
| 4 | **Operator TPS3R** | `OPERATOR` | Terikat pada `facility_id` TPS3R tertentu. Hak akses: Penerimaan material masuk (`ReceiptRecord`), pencatatan selisih timbangan jembatan, pencatatan pemilahan fraksi mass-balance, dan transfer residu. |
| 5 | **Operator TPST** | `OPERATOR` | Terikat pada `facility_id` TPST regional. Mengelola konsolidasi batch material besar, transfer antar fasilitas, dan serah-terima ke pabrik daur ulang. |
| 6 | **Pengelola Bank Sampah** | `OPERATOR` / `ADMIN` | Hak akses pembukaan rekening nasabah (`member_id`), setoran sampah bernilai (`deposit`), penarikan saldo kas tunai/transfer (`withdraw`), dan cetak buku tabungan. |
| 7 | **Mitra Pembeli / Pendaur Ulang** | `BUYER` | Akun organisasi terverifikasi legalitas NIB/SIUP. Akses konfirmasi penerimaan batch (`dispatched_weight` vs `received_weight`) dan penerbitan sertifikat pemrosesan daur ulang (`confirm-processing`). |
| 8 | **Pelaku Usaha (Hotel/Resto/Vila)** | `USER` + Akses B2B Org | Akses pembuatan profil bisnis multi-cabang, registrasi titik loading dock, penjadwalan pickup harian volume tinggi, dan penarikan sertifikat pengurangan emisi ESG. |
| 9 | **Prajuru Banjar / Desa Adat** | `COMMUNITY_LEADER` | Ditugaskan via endpoint `/community/banjar/officials`. Memiliki visibilitas metrik pilah Banjar, hak menjadwalkan kegiatan Gotong Royong, dan kewenangan resolusi komplain kebersihan lokal. |
| 10 | **Pengelola Program CSR / Pemda** | `PROGRAM_MANAGER` / `ADMIN` | Hak alokasi anggaran subsidi program, konfigurasi aturan reward WastePoints, monitoring serapan dana, dan audit laporan sirkular. |
| 11 | **Koordinator Relawan Pantai** | `VOLUNTEER_COORDINATOR` | Akses pendaftaran kegiatan aksi bersih pantai/sungai, pelaporan metrik sampah liar terkumpul, pemilahan kategori liar, dan bukti dokumentasi foto. |
| 12 | **Pengendali Limbah B3 / Khusus** | `HAZARDOUS_HANDLER` | Hak menerbitkan manifest limbah B3 berizin KLHK, monitoring rantai pengangkutan tertutup, dan verifikasi sertifikat pemusnahan insinerator bersuhu tinggi. |

---

## 3. Ambang Batas Selisih Timbangan (Weighing Discrepancy & Dispute Thresholds)

Kepatuhan terhadap aturan bisnis: **"Berat perkiraan warga bukan berat final; berat final tervalidasi diukur oleh petugas/fasilitas"** ditegakkan dengan aturan toleransi sebagai berikut:

1. **Ambang Batas Lapangan vs TPS3R (Field vs Facility Gate Scale):**
   - Toleransi selisih yang wajar antara timbangan gantung digital petugas lapangan dan timbangan duduk/lantai TPS3R adalah **maksimal ±5% atau 0.5 kg** (mana yang lebih longgar).
   - Selisih dalam batas toleransi dicatat otomatis sebagai susut alami (dehidrasi/kelembapan material).
2. **Koreksi Timbangan Lapangan (Versioned Reweighing):**
   - Jika terjadi sanggahan timbangan oleh warga sebelum material diangkut:
     - Petugas wajib melakukan penimbangan ulang di hadapan warga.
     - Setiap perubahan data menaikkan versi (`version + 1`) dan menandai versi sebelumnya sebagai `SUPERSEDED`.
     - Wajib menyertakan parameter `correction_reason` (minimal 5 karakter).
     - Ledger poin akan melakukan rekonsiliasi otomatis (`reverse_or_adjust_pickup_reward`).
3. **Eskalasi Discrepancy Berat Pengiriman ke Mitra Hilir:**
   - Berat pengiriman TPS3R (`dispatched_weight_kg`) bersifat **immutable** dan tidak dapat diubah oleh pabrik penerima.
   - Pabrik mencatat `received_weight_kg`. Selisih (`discrepancy_kg`) lebih dari 2.5% otomatis memicu tiket investigasi logistik armada.

---

## 4. Prosedur Darurat & Offline Fallback Petugas Pengangkut

Untuk mengantisipasi blank spot jaringan telekomunikasi seluler di gang-gang sempit banjar pedesaan:

1. **Local Queueing & Storage:**
   - Aplikasi mobile petugas (`Collector App`) menyimpan antrean tugas dan mutasi status dalam SQLite / WatermelonDB terenkripsi lokal saat status koneksi terputus (`offline`).
2. **Client-Generated Idempotency Keys:**
   - Setiap transaksi inspeksi QC, foto bukti, dan timbangan menggunakan UUID v4 unik sebagai `idempotency_key`.
3. **Sinkronisasi Otomatis:**
   - Begitu sinyal 4G/WiFi kembali tersedia, aplikasi secara sekuensial mem-flush antrean transaksi ke backend `/api/v1/collector/sync` atau endpoint terkait.
   - Backend memproses transaksi secara idempotent tanpa risiko penggandaan poin warga atau pencatatan ganda berat sampah.

---

## 5. Protokol Keselamatan Limbah B3 & Jalur Khusus

1. **Pemisahan Absolut Jalur Pengangkutan:**
   - Limbah B3 rumah tangga (baterai, aki bekas, jarum medis mandiri, kemasan racun hama pertanian) **DILARANG KERAS** dicampur ke dalam jadwal pickup rutin warga.
   - Endpoint pickup umum akan melempar `HTTP 400 Bad Request` jika warga mencoba memesan penjemputan kategori `SPECIAL` tanpa konfirmasi izin rute khusus.
2. **Manifest Digital B3:**
   - Setiap serah-terima limbah berbahaya wajib menerbitkan `HazardousWasteManifest` berlisensi nomor KLHK, kode SOP penanganan beracun, dan pengangkut bersertifikasi.
   - Status manifest bergerak tertutup: `MANIFESTED` -> `IN_TRANSIT` -> `DELIVERED_TO_FACILITY` -> `SAFELY_DISPOSED`.

---

## 6. Prosedur Operasional Tanggap Insiden & Pemeliharaan Sistem (Incident Response Runbook)

### A. Pemeriksaan Kesehatan Sistem (Health Checks)
- **Liveness Probe:** `GET /api/v1/health/live`  
  *Respons yang diharapkan:* `{"status": "ok", "app": "WasteLink Bali", "version": "0.1.0"}`
- **Readiness Probe:** `GET /api/v1/health/ready`  
  *Memverifikasi koneksi database aktif:* `{"status": "ok", "database": "connected"}`

### B. Prosedur Backup & Restore Database PostgreSQL
- **Pencadangan Terjadwal Harian (Daily Backup):**
  ```bash
  pg_dump -U wastelink -h localhost -d wastelink_bali -F c -b -v -f "/backups/wastelink_pilot_$(date +%Y%m%d_%H%M%S).dump"
  ```
- **Pemulihan Bencana (Disaster Recovery / Point-In-Time Restore):**
  ```bash
  # 1. Hentikan service API untuk mencegah write baru
  # 2. Pulihkan struktur dan data
  pg_restore -U wastelink -h localhost -d wastelink_bali -v --clean "/backups/wastelink_pilot_target.dump"
  # 3. Jalankan verifikasi migrasi database
  alembic upgrade head
  ```

### C. Prosedur Investigasi Anomali Ledger & Anti-Fraud
- Jika terdeteksi anomali selisih poin atau lonjakan drastis penerbitan WastePoints:
  1. Jalankan audit query pada tabel `ledger_entries` dengan mengecek konsistensi `idempotency_key` dan nilai poin terhadap bobot sampah fisik:
     ```sql
     SELECT user_id, SUM(points) as total_points, count(*) as tx_count 
     FROM ledger_entries 
     GROUP BY user_id 
     ORDER BY total_points DESC LIMIT 20;
     ```
  2. Periksa riwayat audit log pada tabel `audit_logs` untuk entitas `WEIGHT_RECORD` dan `POINTS_LEDGER`.
