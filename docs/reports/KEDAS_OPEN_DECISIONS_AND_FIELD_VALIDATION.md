# KEDAS — OPEN DECISIONS AND FIELD VALIDATION LOG
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Versi Dokumen:** 1.0  
**Tanggal:** 30 Oktober 2026  

---

## 1. Keputusan Terbuka & Kompromi Arsitektur (Architectural Trade-offs)

Selama pembangunan sistem Kedas, beberapa keputusan arsitektur diambil dengan menyeimbangkan kebutuhan stabilitas hackathon dengan kesiapan operasional riil di lapangan. Berikut adalah catatan keputusan yang membutuhkan validasi empiris lanjutan saat implementasi pilot:

### 1.1 Sinkronisasi Offline Lapangan (Offline Sync Architecture)
- **Kondisi Saat Ini:** Sistem menerapkan *optimistic updates* dengan cache lokal peramban/perangkat seluler. Jika petugas kehilangan sinyal di gang sempit, data antarmuka tetap responsif, namun pengiriman data ke server membutuhkan koneksi aktif.
- **Alternatif Lanjutan:** Pembangunan basis data lokal SQLite terenkripsi penuh di sisi client mobile (menggunakan WatermelonDB atau PowerSync) dengan mekanisme *conflict resolution CRDT*.
- **Rekomendasi Validasi Lapangan:** Uji coba pemetaan kekuatan sinyal 4G di gang-gang pemukiman Banjar Ubud dan Sanur untuk menentukan apakah full-offline database wajib dibangun sebelum ekspansi pilot.

### 1.2 Integrasi Sensor Timbangan Fisik (Hardware Scales vs Manual Entry)
- **Kondisi Saat Ini:** Berat material dimasukkan secara manual oleh petugas lapangan melalui input numerik terstandarisasi dengan verifikasi ganda saat gate-in di TPS3R.
- **Alternatif Lanjutan:** Integrasi modul komunikasi Bluetooth Low Energy (BLE) atau Web Bluetooth API yang menghubungkan timbangan gantung digital langsung ke aplikasi Kedas tanpa campur tangan pengetikan angka oleh manusia.
- **Rekomendasi Validasi Lapangan:** Pelajari kehandalan perangkat keras timbangan gantung tahan air ber-Bluetooth di lingkungan lapangan Bali yang lembap dan berdebu.

### 1.3 Kedudukan Hukum CDOA: Awig-Awig Adat vs Regulasi Daerah (Perda)
- **Kondisi Saat Ini:** CDOA dirancang sebagai Perjanjian Operasional Kawasan Destinasi (*Community Destination Operating Agreement*) yang mengikat secara administratif di dalam sistem aplikasi dan disepakati oleh Prajuru Banjar serta pengelola TPS3R.
- **Alternatif Lanjutan:** Integrasi formal CDOA sebagai turunan resmi dari Pararem / Awig-Awig Desa Adat yang memiliki sanksi adat (sanksi sosial/denda adat) serta integrasi ke dalam Peraturan Daerah (Perda) Pengelolaan Sampah Berbasis Sumber Kabupaten Gianyar/Badung.
- **Rekomendasi Validasi Lapangan:** Lakukan audiensi terarah (*FGD*) bersama Majelis Desa Adat (MDA) Bali untuk menyelaraskan klausul CDOA dengan hukum adat setempat.

### 1.4 Mekanisme Likuiditas Poin & Insentif Warga
- **Kondisi Saat Ini:** Poin daur ulang tercatat pada buku besar internal (*Points & Ledger Ledger*) dan dapat ditukarkan dengan produk kompos lokal atau merchandise ramah lingkungan di banjar.
- **Alternatif Lanjutan:** Integrasi rekening virtual atau pencairan uang elektronik (GoPay/OVO/ShopeePay) bekerja sama dengan BPD Bali.
- **Rekomendasi Validasi Lapangan:** Kaji preferensi warga banjar: apakah warga lebih antusias menerima pemotongan iuran banjar (iuran urunan kas banjar) atau transfer uang digital langsung.

### 1.5 Kalibrasi Ambang Batas Indeks DCLI pada Musim Liburan (Peak Tourist Season)
- **Kondisi Saat Ini:** Ambang batas DCLI menetapkan minimal 3 siklus operasional tercatat sebelum skor diterbitkan. Bobot Service Reliability sebesar 25% dan Rasio Penerimaan sebesar 20%.
- **Alternatif Lanjutan:** Penyesuaian dinamis bobot metrik saat musim puncak wisatawan (*peak season* Juli–Agustus & Desember) di mana timbulan sampah restoran/hotel melonjak hingga 300%.
- **Rekomendasi Validasi Lapangan:** Kumpulkan data operasional selama minimal 30 hari kalender pilot di Ubud untuk mengkalibrasi deviasi standar neraca massa pada musim hujan vs kemarau.
