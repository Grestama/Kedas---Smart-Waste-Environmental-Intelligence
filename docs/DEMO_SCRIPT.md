# Panduan Naskah Presentasi Demo Hackathon — Kedas
## Pitch & Demo Script untuk Dewan Juri

**Nama Proyek**: Kedas  
**Tagline**: *Kedas — Bergerak Bersama untuk Lingkungan yang Lebih Bersih.*  
**Target Audiens**: Dewan Juri Hackathon, Evaluator Teknis, & Komunitas Lingkungan

---

## 1. Naskah Demo Kilat 3–5 Menit (Elevator Pitch & Core Loop)

### Menit 00:00 – 00:45 | Masalah Riil di Bali
- **Presenter**:
  > *"Om Swastyastu, selamat pagi Dewan Juri. Provinsi Bali menghadapi krisis darurat sampah padat. Pasca-penutupan TPA Suwung, desa-desa diwajibkan mengolah sampah dari sumber sesuai Pergub Bali No. 47/2019. Namun fakta di lapangan: partisipasi pemilahan warga rendah, penimbangan pengangkut sampah sering dipersengketakan, dan TPS3R kesulitan memasarkan material daur ulang. Hari ini, kami mempersembahkan **Kedas** — platform koordinasi digital terpadu berbasis banjar dan ekonomi sirkular desa."*

### Menit 00:45 – 01:45 | Warga: Pilah dari Rumah & Minta Jemput
- **Aksi Layar**: Buka [http://localhost:3000/masuk](http://localhost:3000/masuk) -> Pilih Tab "Warga" -> Masuk -> Menuju dasbor `/app`.
- **Presenter**:
  > *"Mari kita lihat dari sisi Krama Desa. Di dasbor warga, Wayan dapat memantau saldo WastePoints dan membuat permintaan jemput sampah terpilah. Wayan memilih kategori Plastik PET dan Kardus, memilih jadwal penjemputan banjar, dan mengirim permintaan. Sistem memvalidasi kapasitas slot armada banjar secara real-time untuk mencegah overload."*

### Menit 01:45 – 02:45 | Petugas: Ambil Tugas, Inspeksi QC & Timbang Digital
- **Aksi Layar**: Buka `/staff` -> Tab "Tugas Tersedia" -> Klik "Ambil Tugas" -> Buka detail tugas `/staff/tugas/[id]`.
- **Presenter**:
  > *"Sekarang mari berpindah ke meja petugas pengangkut. Made melihat tugas penjemputan warga di banjarnya. Sistem menerapkan klaim atomik sehingga tidak ada tugas yang diambil oleh dua petugas secara bersamaan. Di lokasi, petugas menginspeksi kontaminasi sampah, memasukkan berat timbangan, dan mengunggah foto bukti digital. Begitu disimpan, poin warga terkredit secara otomatis dan tamper-proof di buku besar poin."*

### Menit 02:45 – 03:30 | Fasilitas & Tata Kelola: Transparansi Neraca Massa
- **Aksi Layar**: Buka `/admin` -> Menu "Permintaan Warga" & "Laporan".
- **Presenter**:
  > *"Sampah yang tiba di TPS3R ditimbang ulang untuk mencegah selisih muatan. Operator memilah sampah dengan proteksi row-level locking di database agar stok tidak pernah defisit. Dari sini, material diagregasikan menjadi batch daur ulang siap jual untuk mitra industri. Seluruh riwayat tercatat dalam audit log yang transparan untuk evaluasi paruman banjar."*

### Menit 03:30 – 04:00 | Penutup & Dampak
- **Presenter**:
  > *"Kedas bukan sekadar aplikasi pencatatan, melainkan infrastruktur koordinasi yang menghubungkan krama, petugas banjar, dan industri sirkular. Dengan 186 pengujian otomatis yang lulus 100%, Kedas siap diuji coba dalam pilot terkendali di Banjar Sukawati. Bersama Kedas, kita wujudkan Bali yang bersih dan berdaya saing sirkular. Suksma!"*

---

## 2. Naskah Demo Mendalam 7–10 Menit (Technical & Ecosystem Deep-Dive)

- **Menit 00:00 – 01:30**: Problem statement mendalam (Tri Hita Karana, krisis TPA Suwung, residu upakara).
- **Menit 01:30 – 03:00**: Registrasi warga, verifikasi alamat, dan pencegahan duplikasi akun.
- **Menit 03:00 – 04:30**: Alur calon petugas (Warga mengajukan permohonan armada di `/app/profil` -> Admin meninjau dan menyetujui di `/admin/pengajuan-petugas` -> Hak akses petugas aktif seketika).
- **Menit 04:30 – 06:00**: Alur penjemputan, inspeksi QC kontaminasi, mitigasi kegagalan lapangan (*field failure* dengan alasan wajib), dan penimbangan digital.
- **Menit 06:00 – 07:30**: Fasilitas TPS3R, penanganan selisih timbangan (discrepancy flag), dan neraca massa pemilahan stok.
- **Menit 07:30 – 08:45**: Integrasi Bank Sampah (saldo rupiah nasabah) dan Marketplace B2B (verifikasi izin daur ulang mitra industri).
- **Menit 08:45 – 10:00**: Arsitektur teknis, keamanan Anti-IDOR, observabilitas audit log, dan sesi tanya jawab teknis.
