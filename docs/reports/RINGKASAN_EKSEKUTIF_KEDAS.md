# Ringkasan Eksekutif Proyek Kedas
## Platform Digital Pengelolaan Sampah Berbasis Komunitas dan Ekonomi Sirkular Desa

> **Nama Proyek**: Kedas *(sebelumnya WasteLink Bali)*  
> **Arti Nama**: Kata bahasa Bali yang berarti **“bersih”** ([BASAibu Wiki](https://basaibubali.org/Kedas))  
> **Tagline**: *Kedas — Bergerak Bersama untuk Lingkungan yang Lebih Bersih.*  
> **Versi Dokumen**: 1.0 (30 Oktober 2026)  
> **Status Kesiapan**: **READY FOR CONTROLLED PILOT** (Siap Uji Coba Terkendali di Wilayah Terbatas) | **NOT READY FOR PRODUCTION** (Belum Siap Skala Penuh Regional)  
> **Waktu Baca**: 3–5 Menit

---

## 1. Apa itu Kedas?
**Kedas** adalah platform koordinasi digital terpadu untuk rantai pengelolaan sampah berbasis komunitas adat banjar dan ekonomi sirkular desa di Bali. Kedas mendigitalisasi alur pemilahan dari sumber (rumah tangga), penjemputan oleh petugas kebersihan desa, verifikasi dan penimbangan di pos TPS3R, tabungan material bank sampah, hingga agregasi batch penjualan ke industri daur ulang berlisensi.

## 2. Masalah Apa yang Diselesaikan?
1. **Krisis TPA & Rendahnya Pemilahan**: Penutupan TPA Suwung dan rendahnya kepatuhan pemilahan rumah tangga (<20%) diatasi dengan panduan pemilahan berbasis sumber (Pergub Bali No. 47/2019) dan insentif WastePoints.
2. **Ketiadaan Data & Sengketa Timbangan**: Hilangnya kepercayaan antara pengangkut sampah dan fasilitas akibat selisih berat diselesaikan dengan pencatatan digital berbasis bukti foto dan rekonsiliasi otomatis batas toleransi (5%).
3. **Penyaluran Material yang Tercecer**: Material anorganik bernilai daur ulang diagregasikan dalam bentuk batch terstandar sehingga desa memiliki posisi tawar kuat di hadapan pembeli industri.
4. **Pencampuran Dana Nasabah & Poin Promosi**: Risiko salah kelola keuangan dicegah dengan memisahkan buku tabungan rupiah bank sampah secara struktural dari poin insentif warga.

## 3. Siapa Pengguna dan Stakeholder Utamanya?
Sistem mendukung 8 peran RBAC aktif yang melayani stakeholder lapangan:
1. **Warga / Krama Desa (`USER`)**: Memilah sampah, menjadwalkan penjemputan/drop-off, dan memantau reward.
2. **Petugas Kebersihan (`COLLECTOR`)**: Menerima tugas, melakukan inspeksi kontaminasi, dan menginput timbangan.
3. **Koordinator / Supervisor (`DISPATCHER`)**: Mengatur penugasan tugas dan mengelola kuota armada per banjar.
4. **Operator TPS3R / TPST (`FACILITY_OPERATOR`)**: Menerima sampah, rekonsiliasi diskrepansi, dan memilah inventaris.
5. **Pengurus Bank Sampah (`WASTE_BANK_STAFF`)**: Mengelola rekening dan mencatat setoran tabungan nasabah.
6. **Mitra Pembeli Material (`PARTNER`)**: Mengajukan penawaran dan menebus batch daur ulang/organik.
7. **Prajuru Banjar / Kepala Desa (`COMMUNITY_LEADER`)**: Memantau kepatuhan wilayah melalui dasbor teritorial.
8. **Pengelola Platform (`ADMIN`)**: Mengelola master data, aturan poin, dan memantau audit trail sistem.

## 4. Apa Saja Fungsi Inti yang Sudah Tersedia?
Berdasarkan verifikasi sistem aktual (*as-built*), fungsi inti yang telah diimplementasikan dan teruji meliputi:
- **Manajemen Akun & RBAC**: Registrasi, login anti-enumerasi, token JWT, dan isolasi kepemilikan data (Anti-IDOR).
- **Penjemputan Warga**: Validasi area layanan, batas kapasitas slot harian, pencegahan booking ganda, dan pembatalan aman.
- **Operasional Petugas**: Klaim tugas atomik (bebas konflik double-claim), inspeksi foto, penimbangan multi-kategori, dan pelaporan kendala lapangan (*field failure*).
- **Fasilitas TPS3R**: Tanda terima serah-terima (*receipt*), rekonsiliasi selisih timbangan, dan pemilahan stok dengan proteksi *row-level locking* bebas stok negatif.
- **Bank Sampah**: Pembukuan tabungan material rupiah terpisah dari poin insentif.
- **Katalog Batch B2B**: Agregasi material terpilah dan verifikasi lisensi mitra pembeli.
- **Tata Kelola Banjar**: Dasbor agregat wilayah, alokasi dana CSR program, dan manifes limbah khusus/upakara.

## 5. Bagaimana Arsitektur dan Platformnya?
- **Pola Arsitektur**: Modular Monolith dengan batas domain tegas (*12 Bounded Contexts*), mengedepankan integritas data transaksional, *idempotency middleware*, dan *audit trail*.
- **Backend**: FastAPI (Python 3.13), SQLAlchemy 2.0 ORM, Alembic (8 migrasi teruji reversibel).
- **Frontend Web**: Next.js 15.1.7 (React 19, Tailwind CSS), 37 rute aplikasi web teroptimasi statis/SSR.
- **Mobile Engine**: TypeScript offline queue dengan auto-sync idempotensi saat koneksi seluler pulih.
- **Basis Data & Penyimpanan**: PostgreSQL / SQLite terpartisi, penyimpanan bukti foto terisolasi.

## 6. Apa Kekuatan Utama dan Keterbatasan Sistem Saat Ini?
- **Kekuatan Utama**:
  - *Zero Test Regression*: 185 dari 185 automated tests lulus 100% (Backend: 76, Frontend: 94, Mobile: 15).
  - *Concurrency Safe*: Bebas dari lost update dan stok negatif berkat `with_for_update()`.
  - *Resistensi Jaringan*: Dukungan antrean mutasi offline saat petugas berada di area minim sinyal.
  - *Kesesuaian Budaya Bali*: Mengakomodasi limbah upakara (*canang sari*) dan kewilayahan banjar adat.
- **Keterbatasan Saat Ini**:
  - Masih bergantung pada input manual petugas (belum terhubung ke timbangan digital IoT otomatis).
  - Pencairan saldo uang tabungan nasabah bank sampah masih memerlukan antrean kasir tunai (belum terintegrasi payment gateway/BI-FAST otomatis).
  - Pengujian beban (*load testing*) belum mencakup simulasi puluhan ribu transaksi serentak saat hari raya besar.

## 7. Seberapa Siap Sistem Saat Ini?
- **Ready for Internal Demo**: **YA (100% SIAP)** — Seluruh modul berjalan mulus di lingkungan pengujian.
- **Ready for Controlled Pilot**: **YA (100% SIAP)** — Siap untuk diuji coba di 1–2 banjar percontohan terbatas (misal: Banjar di Ubud / Denpasar Selatan) dengan pendampingan teknis.
- **Not Ready for Production (Unrestricted Scale)**: **BELUM SIAP** — Belum siap untuk peluncuran massal skala seluruh kabupaten/provinsi tanpa evaluasi hasil pilot, integrasi timbangan IoT, dan penguatan perjanjian serap industri daur ulang.

## 8. Apa Lima Prioritas Pengembangan Tertinggi?
1. **[P0] Stabilisasi Mutasi Layanan Client**: Memastikan seluruh penolakan server diteruskan jujur ke formulir UI tanpa diserap oleh mock palsu (*SELESAI*).
2. **[P0] Penguncian Baris Inventaris Fasilitas**: Menerapkan row-level lock pada pengurangan stok pemilahan (*SELESAI*).
3. **[P1] Integrasi Timbangan Digital IoT via Bluetooth**: Mengeliminasi risiko salah ketik berat sampah di lapangan (*DIRENCANAKAN*).
4. **[P1] Indikator Status Offline pada UI Petugas**: Visualisasi status antrean lokal di perangkat bergerak (*BACKLOG PRIORITAS*).
5. **[P2] Otomasi Pencairan Tabungan Bank Sampah**: Integrasi transfer bank/e-wallet untuk nasabah (*DIRENCANAKAN*).

## 9. Apa Dampak Sosial-Lingkungan dan Cara Mengukurnya?
- **Dampak Lingkungan**: Pengalihan sampah dari TPA Suwung (*Target Pilot: $\ge 60\%$ diversion rate*); diukur melalui neraca massa masuk vs residu TPS3R.
- **Dampak Sosial**: Peningkatan disiplin pemilahan dari rumah (*Target Pilot: $\ge 80\%$ kepatuhan*); diukur dari log inspeksi skor kontaminasi.
- **Dampak Ekonomi**: Peningkatan pendapatan desa melalui penjualan batch daur ulang terpilah (*Target: $\ge \text{Rp 15 Juta/Bln}$ per TPS3R*); diukur dari transaksi bursa material Kedas.

## 10. Apa Keputusan atau Dukungan yang Masih Dibutuhkan?
1. **Konfirmasi Kebijakan Toleransi Selisih Timbangan**: Penetapan batas deviasi resmi antara timbangan pengangkut dan pos penerimaan fasilitas (saat ini disetel 5%).
2. **Kemitraan Koperasi Banjar untuk Penukaran Poin**: Menentukan jenis insentif nyata bagi warga penukar poin (pengurangan iuran banjar atau sembako).
3. **Penetapan Lokasi Banjar Percontohan Pilot**: Kesepakatan formal dengan Prajuru Banjar dan pengelola TPS3R mitra untuk implementasi lapangan tahap pertama.
