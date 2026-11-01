# KEDAS — OPERATOR RUNBOOK & SYSTEM ADMINISTRATION
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Versi Dokumen:** 1.0  
**Tanggal:** 30 Oktober 2026  
**Target Pembaca:** DevOps, SRE, Lead Administrator Kawasan Kedas  

---

## 1. Arsitektur Komponen & Prasyarat Lingkungan

Sistem Kedas terdiri atas tiga modul utama yang dapat dijalankan secara terdistribusi maupun pada *single host container*:
1. **Backend API:** FastAPI (Python 3.11+) dengan SQLAlchemy 2.0 ORM, Pydantic v2, dan Alembic.
2. **Frontend Web:** Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide Icons.
3. **Mobile Core:** React Native / Expo Web Simulator terintegrasi.
4. **Database:** PostgreSQL 15+ (Production) atau SQLite WAL Mode (Development / CI).

---

## 2. Prosedur Instalasi & Inisialisasi Sistem (Cold Start)

### 2.1 Backend Setup
```powershell
# 1. Pindah ke direktori backend dan aktifkan virtualenv
cd backend
python -m venv .venv
.venv\Scripts\activate

# 2. Instalasi dependensi
pip install -r requirements.txt

# 3. Konfigurasi Environment (.env)
# Pastikan SESSION_SECRET_KEY memiliki panjang minimal 32 karakter
cp .env.example .env

# 4. Jalankan Migrasi Database ke versi terbaru (Revisi 0009 CDOA)
alembic upgrade head

# 5. Bootstrap Akun Administrator Utama
python -m app.cli.bootstrap_admin --email admin@kedas.bali --password "SecureAdminPass2026!" --name "Administrator Kawasan"

# 6. Jalankan Server API FastAPI
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2.2 Frontend Setup
```powershell
# 1. Pindah ke direktori frontend
cd frontend

# 2. Instalasi paket npm
npm install

# 3. Konfigurasi API URL
# Buat .env.local berisi: NEXT_PUBLIC_API_URL=http://localhost:8000
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 4. Jalankan Server Next.js Development
npm run dev -- -p 3000
```

---

## 3. SOP Operasional Harian (Standard Operating Procedures)

### SOP 1: Pembukaan & Pengesahan CDOA Kawasan Baru
1. Prajuru Banjar atau Admin membuka panel `/community/cdoa` dan mengisi draf kesepakatan wilayah.
2. Tentukan kategori material yang disepakati (misal: Organik Dapur, Anorganik Daur Ulang) dan SLA jam pengangkutan (misal: 24 jam).
3. Unggah nomor surat kesepakatan dan setujui status (`APPROVED`).
4. Publikasikan CDOA (`PUBLISHED`). Sejak detik ini, warga di wilayah tersebut otomatis dapat memesan layanan penjemputan di aplikasi.

### SOP 2: Verifikasi & Penugasan Petugas Lapangan Baru
1. Pengguna mendaftar akun warga di `/daftar`, lalu mengajukan permohonan petugas kolektor melalui profilnya dengan menyertakan jenis kendaraan.
2. Admin membuka panel `/app/admin` -> tab **Kolektor / Petugas**.
3. Periksa kelayakan kendaraan dan wilayah. Klik **Setujui Permohonan**.
4. Akun pemohon seketika memperoleh izin akses role `COLLECTOR` dan dapat langsung beralih workspace untuk mengambil tugas penjemputan.

### SOP 3: Audit Selisih Timbang Fasilitas (Discrepancy Resolution)
1. Jika terjadi selisih berat antara timbangan petugas armada ($W_1$) dan timbangan gate fasilitas TPS3R ($W_2$) yang melebihi batas toleransi 10%:
2. Sistem otomatis menandai tiket dengan status selisih timbang.
3. Operator fasilitas wajib memasukkan catatan verifikasi fisik (misal: "Kandungan air tinggi akibat hujan lebat saat penjemputan").
4. Admin dapat meninjau rekaman insiden di audit trail `/app/admin/audit-logs`.

### SOP 4: Penanganan Insiden Penolakan Sampah Liar / Kontaminasi
1. Petugas di lapangan menemukan sampah bercampur limbah B3 jarum suntik atau bangkai hewan.
2. Petugas menolak penjemputan via tombol **Tolak di Lokasi** dengan memilih alasan wajib `KONTAMINASI_BERBAHAYA`.
3. Kuota kapasitas slot penjemputan otomatis dilepaskan kembali ke publik (*capacity auto-release*).
4. Notifikasi penolakan dan edukasi pemilahan otomatis terkirim ke akun warga pemesan.

---

## 4. Health Check & Monitoring Endpoints

- **Liveness Check:** `GET /health/live` (Memastikan container server API menyala dan merespons).
- **Readiness Check:** `GET /health/ready` (Memverifikasi konektivitas koneksi basis data PostgreSQL).
- **DCLI Index Check:** `GET /api/v1/community/banjar/{service_area_id}/dcli` (Memeriksa integritas metrik kawasan).
- **Service Directory:** `GET /api/v1/community/service-directory/{service_area_id}` (Memverifikasi aturan CDOA yang aktif).

---

## 5. Rencana Pemulihan Bencana (Disaster Recovery)

1. **Backup Basis Data:** Jalankan backup dump PostgreSQL harian otomatis menggunakan `pg_dump -Fc`.
2. **Rollback Migrasi Schema:** Jika migrasi schema bermasalah, rollback ke revisi sebelumnya menggunakan:
   `alembic downgrade -1`
3. **Penyelamatan Sesi:** Jika terjadi insiden keamanan, cabut seluruh sesi aktif secara massal melalui eksekusi truncate pada tabel `sessions` di basis data:
   `DELETE FROM sessions WHERE expires_at > NOW();`
