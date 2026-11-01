# KEDAS — OFFICIAL RELEASE NOTES
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Versi Rilis:** 1.0.0-pilot  
**Tanggal Rilis:** 30 Oktober 2026  
**Identitas Produk Resmi:** **Kedas** (sebelumnya *WasteLink Bali*)  
**Tagline:** *Bergerak Bersama untuk Lingkungan yang Lebih Bersih.*  

---

## 1. Ikhtisar Rilis

Rilis versi 1.0.0-pilot menandai selesainya transformasi menyeluruh dari arsitektur prototipe lama menjadi platform operasional terintegrasi destinasi pariwisata hijau dan komunitas Bali.

Rilis ini mencakup 10 domain implementasi, 44 tabel database relasional, 9 revisi migrasi schema, 116+ endpoint API, antarmuka web responsif multi-peran, dan microsite publik untuk wisatawan mancanegara dan domestik.

---

## 2. Sorotan Fitur Baru (New Features & Capabilities)

### 🌿 Community Destination Operating Agreement (CDOA)
- **Model CDOA Terkelola:** Entitas perjanjian digital dengan nomor unik per kawasan, tanggal efektif, SLA jam pengangkutan, batas kapasitas harian, dan kanal eskalasi darurat.
- **Siklus Hidup Perjanjian:** Draf kesepakatan dapat diajukan, ditinjau prajuru adat, disetujui, dan dipublikasikan secara transparan.
- **Direktori Layanan Publik (`/area-layanan`):** Portal warga untuk memeriksa kesepakatan aktif dan daftar material yang diterima di banjar tempat tinggalnya.

### 🧭 Deterministic Service Eligibility Engine
- **Validasi Pra-Pemesanan Real-Time:** Menolak pemesanan penjemputan sampah jika area nonaktif, fasilitas penerima sedang maintenance, kuota slot habis, atau material melanggar ketentuan pemilahan sumber.
- **Pesan Penolakan Informatif:** Menyertakan instruksi penanganan alternatif saat permohonan tidak memenuhi syarat.

### 🎫 Kedas Waste Passport & Jejak Material Anti-Greenwashing
- **Paspor Sampah Publik QR:** Setiap kantong material memiliki barcode/QR publik yang dapat dipindai oleh siapa pun untuk melihat jejak perjalanan sampah dari rumah ke fasilitas daur ulang tanpa membocorkan identitas pribadi pelapor.
- **Paspor Terotentikasi & Anti-IDOR:** Detail pelacakan lengkap dengan riwayat berat timbangan digital dan catatan QC petugas yang dilindungi otorisasi kepemilikan ketat.

### 🏨 Green Hospitality Ledger (HOREKA)
- **Portal B2B Usaha Pariwisata:** Rekapitulasi volume timbulan sampah hotel, vila, dan restoran dengan rincian pemisahan aliran sisa makanan (organik) dan daur ulang bernilai tinggi.
- **Metrik Loop Rate & Residu:** Pelacakan persentase sampah yang berhasil dialihkan dari pembuangan akhir ke TPA.

### 🌺 Guest Green Companion (`/guest`)
- **Microsite Publik Ramah Ponsel:** Halaman edukasi wisatawan dwibahasa (Bahasa Indonesia & Bahasa Inggris) berbasis filosofi luhur Tri Hita Karana.
- **Panduan 3 Wadah Pemilahan:** Edukasi visual memilah Organik, Daur Ulang, dan Residu.
- **Peta Stasiun Isi Ulang Air Minum:** Direktori titik isi ulang air minum gratis/terjangkau untuk mengurangi timbulan botol plastik sekali pakai di Bali.

### ⚖️ Neraca Massa & Jaringan Pasar Sirkular
- **Formula Validasi Konversi:** Validasi input vs output pemilahan fasilitas TPS3R ($Input = Output + Residu$) untuk memastikan material yang diklaim terolah benar-benar ada secara fisik.
- **Reservasi Stok Atomik:** Mengunci stok material olahan saat ada penawaran beli dari mitra industri daur ulang berlisensi untuk mencegah penjualan ganda (*double allocation*).

### 📊 Destination Clean Loop Index (DCLI)
- **Indikator Kinerja 5 Dimensi:** Mengukur keandalan layanan, tingkat penerimaan fasilitas, cakupan rantai lacak, konsistensi neraca massa, dan keaktifan warga banjar.
- **Guardrail Anti-Greenwashing:** Menolak menampilkan skor semu jika cakupan data operasional aktual belum mencapai ambang batas minimal 3 siklus.

---

## 3. Peningkatan Kualitas, Desain & Aksesibilitas

- **Sistem Gerak (Motion System):** Keyframe animasi halus (`animate-fade-in`, `animate-scale-in`, `animate-slide-up`) dengan dukungan penuh preferensi aksesibilitas `@media (prefers-reduced-motion: reduce)`.
- **Palet Warna Destinasi:** Skema visual berakar pada Bali Sand (#F6F6F1) dan Forest Jade (#1D3F35 / #2F6552) dengan kontras tinggi untuk kenyamanan mata petugas di bawah terik matahari lapangan.
- **Zero Mock Fallbacks:** Layanan API frontend meneruskan error nyata dari backend tanpa menyamarkan kegagalan koneksi menjadi data palsu.

---

## 4. Statistik Pengujian & Kestabilan

- **Backend Pytest:** 81 / 81 Tests Lulus (100%)
- **Frontend Vitest:** 95 / 95 Tests Lulus (100%)
- **Mobile Vitest:** 15 / 15 Tests Lulus (100%)
- **Total Pengujian Otomatis:** **191 / 191 Tests Lulus (100%)**
- **Type Safety:** 0 Type Errors pada backend (`mypy`) maupun frontend/mobile (`tsc --noEmit`).
- **Code Style:** 0 Linter Errors pada `ruff check`.
