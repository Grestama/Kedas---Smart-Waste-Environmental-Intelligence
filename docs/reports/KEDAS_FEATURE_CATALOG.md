# KEDAS — COMPREHENSIVE FEATURE CATALOG
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Versi Dokumen:** 1.0  
**Tanggal:** 30 Oktober 2026  

---

## 1. Ikhtisar Arsitektur Pengguna & Peran (Actors)

Platform Kedas dirancang dengan 8 peran sistem terintegrasi yang saling berinteraksi dalam satu siklus ekonomi sirkular kawasan:

```
[ Warga / Rumah Tangga ]  ---> [ Petugas Kolektor ] ---> [ Fasilitas TPS3R / Bank Sampah ]
        ^                                                            |
        |                                                            v
[ Wisatawan / Tamu ] (Guest)                             [ Industri Daur Ulang / Offtaker ]
        |                                                            ^
        v                                                            |
[ Usaha Pariwisata HOREKA ] -----------------------------------------+
        |
        v
[ Prajuru Adat Banjar ] & [ Administrator Kawasan Kedas ]
```

---

## 2. Katalog Fitur Berdasarkan Peran Pengguna

### 2.1 Peran: Warga / Rumah Tangga (`USER`)
- **Registrasi & Profil Mandiri:** Pendaftaran cepat via email atau nomor ponsel dengan validasi format internasional.
- **Manajemen Multi-Alamat:** Menyimpan alamat rumah, vila sewaan, atau toko dengan penandaan alamat utama (*default*).
- **Pengecekan Kelayakan Layanan (Service Eligibility):** Validasi otomatis apakah area tempat tinggal tercakup CDOA aktif, fasilitas buka, dan jenis sampah diterima.
- **Pemesanan Penjemputan Cerdas:** Memilih slot jadwal penjemputan dengan indikator sisa kuota kapasitas.
- **Drop-off Mandiri ke TPS3R:** Opsi mengantarkan sampah secara mandiri jika tidak memerlukan penjemputan armada.
- **Kedas Waste Passport:** Melihat kode pelacakan dan status real-time perjalanan sampah dari rumah hingga selesai diproses.
- **Buku Tabungan Poin & Dampak:** Memantau akumulasi poin daur ulang dan estimasi pengurangan emisi karbon ($kg\ CO_2e$).
- **Pengaduan Sampah Lingkungan:** Melaporkan tumpukan sampah liar atau keterlambatan pengangkutan ke Prajuru Banjar.

### 2.2 Peran: Petugas Lapangan & Pengemudi Armada (`COLLECTOR`)
- **Papan Tugas Penjemputan:** Melihat daftar permintaan penjemputan yang tersedia di wilayah operasionalnya.
- **Klaim Tugas Berbasis Konkurensi Atomik:** Mengklaim tugas secara instan tanpa risiko penugasan ganda (*double claim*).
- **Alur Kerja Lapangan Terpandu:** Transisi status bertahap: Ditugaskan -> Menuju Lokasi -> Tiba di Titik Jemput -> Inspeksi QC -> Penimbangan -> Selesai Diangkut.
- **Penimbangan Digital & Inspeksi Residu:** Menginput berat aktual material dalam kilogram (presisi desimal) dan persentase residu/kontaminasi.
- **Pencatatan Kegagalan Lapangan:** Opsi pembatalan tugas terstruktur jika warga tidak ada di lokasi atau material ditolak, dengan pelepasan kuota otomatis.
- **Peta Navigasi Titik Jemput:** Akses cepat koordinat rute penjemputan di ponsel.

### 2.3 Peran: Operator Fasilitas TPS3R (`FACILITY_OPERATOR`)
- **Penerimaan Material Armada (Gate In):** Konfirmasi penerimaan sampah dari petugas kolektor dengan validasi selisih timbang (*discrepancy check*).
- **Pencatatan Neraca Massa Pemilahan (Sorting Mass Balance):** Input pemilahan material harian dengan formula konversi ketat ($Input = Output + Residu$).
- **Manajemen Batch Material Olahan:** Mengelompokkan hasil pilahan (plastik PET, kaca, karton, aluminium) ke dalam batch terstandarisasi.
- **Penawaran Material ke Marketplace:** Menerbitkan penawaran material olahan yang siap dijual kepada offtaker/mitra daur ulang.
- **Pengolahan Sampah Organik:** Pencatatan komposting, pengolahan pakan ternak maggot BSF, dan pengurangan volume ke TPA.

### 2.4 Peran: Petugas Bank Sampah (`WASTE_BANK_STAFF`)
- **Penerimaan Setoran Tabungan Warga:** Mencatat kilogram sampah terpilah bernilai ekonomis yang disetorkan nasabah.
- **Buku Besar Tabungan (Waste Bank Ledger):** Konversi otomatis berat sampah ke nilai rupiah/poin berdasarkan daftar harga taksonomi resmi.
- **Koreksi & Reversal Transaksi Kompensasi:** Pembatalan atau penyesuaian transaksi keliru dengan jejak audit kompensasi ganda (*audit-safe reversal*).

### 2.5 Peran: Usaha Pariwisata & HOREKA (`PARTNER` / Tenant Komersial)
- **Portal Bisnis Hijau (Green Hospitality Ledger):** Rekapitulasi volume timbulan sampah komersial hotel/restoran per periode.
- **Pemisahan Aliran Limbah Makanan (Food Waste Stream):** Monitoring khusus sisa makanan dapur untuk dialihkan ke peternak atau reaktor biogas.
- **Metrik Loop Rate & Residu:** Pelacakan persentase sampah yang berhasil dialihkan dari TPA (*landfill diversion rate*).
- **Ekspor Laporan Kepatuhan ESG:** Unduh data verifikasi serah-terima sampah terpilah untuk pelaporan keberlanjutan.

### 2.6 Peran: Mitra Daur Ulang / Industri Pembeli (`PARTNER` / Buyer Offtaker)
- **Katalog Penawaran Material Terverifikasi:** Memantau ketersediaan batch material daur ulang berkualitas tinggi di berbagai TPS3R Bali.
- **Reservasi Stok Atomik:** Melakukan penawaran beli dengan penguncian kuota instan anti-rebutan.
- **Konfirmasi Serah-Terima (Handover & Delivery Receipt):** Pencatatan penerimaan fisik di pabrik/gudang dan verifikasi surat jalan.

### 2.7 Peran: Prajuru Banjar & Pemimpin Komunitas (`COMMUNITY_LEADER`)
- **Papan Kendali Regional Banjar (Territorial Dashboard):** Memantau volume sampah, tingkat partisipasi warga, dan aduan lingkungan di banjar.
- **Penetapan & Perjanjian CDOA:** Mengusulkan, meninjau, menyetujui, dan mempublikasikan kesepakatan operasional bersama warga dan pengelola fasilitas.
- **Manajemen Aduan Warga:** Menindaklanjuti dan menyelesaikan keluhan sampah liar bersama petugas terkait.
- **Pengorganisasian Aksi Gotong Royong:** Menyelenggarakan kegiatan bersih-bersih lingkungan (*cleanup actions*) dan pencatatan relawan.
- **Monitoring Indeks Kebersihan Destinasi (DCLI):** Memantau skor performa sirkularitas banjar secara objektif.

### 2.8 Peran: Wisatawan & Tamu Destinasi (Guest / Tanpa Login)
- **Guest Green Companion (`/guest`):** Panduan etika lingkungan berbasis Tri Hita Karana dalam Bahasa Indonesia dan Bahasa Inggris.
- **Panduan Pemilahan 3 Aliran Sederhana:** Edukasi visual memilah Organik, Anorganik/Daur Ulang, dan Residu.
- **Peta Titik Isi Ulang Air Minum (Refill Stations):** Mengurangi konsumsi botol plastik sekali pakai di kawasan wisata.
- **Pemindai Paspor Sampah Publik:** Memindai QR code tempat sampah hotel/restoran untuk melihat jejak pengolahannya.

### 2.9 Peran: Administrator Sistem (`ADMIN`)
- **Manajemen Pengguna & Verifikasi Peran:** Menyetujui atau menolak pendaftaran role kolektor, operator, dan mitra bisnis.
- **Pengaturan Taksonomi Sampah:** Mengelola kategori material, instruksi penanganan, harga acuan bank sampah, dan batas bahaya B3.
- **Penetapan Wilayah Layanan (Service Areas):** Menambah dan mengonfigurasi batas operasional banjar/desa adat.
- **Audit Log Explorer:** Memeriksa seluruh rekaman jejak audit sistem untuk investigasi keamanan dan operasional.
- **Pengawasan Manifest Limbah B3:** Validasi izin kepatuhan lingkungan untuk pengolahan limbah bahan berbahaya dan beracun.
