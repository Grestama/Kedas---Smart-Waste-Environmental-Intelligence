# KEDAS — PILOT READINESS & FIELD DEPLOYMENT REPORT
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Versi Dokumen:** 1.0  
**Tanggal:** 30 Oktober 2026  
**Status Evaluasi:** EVIDENCE-DRIVEN OPERATIONAL AUDIT  

---

## 1. Klasifikasi Kesiapan Operasional

Berdasarkan hasil audit implementasi dan verifikasi 191 pengujian otomatis, status kesiapan platform Kedas diklasifikasikan ke dalam tiga tingkatan operasional yang transparan dan jujur:

```
[ READY FOR DEMO & HACKATHON ]        -> 100% SIAP (Semua skenario E2E terverifikasi)
[ READY FOR CONTROLLED FIELD PILOT ]  -> SIAP DENGAN KETENTUAN (1-2 Banjar Percontohan)
[ UNRESTRICTED PRODUCTION (BALI-WIDE)]-> BELUM SIAP (Memerlukan fase integrasi eksternal)
```

### 1.1 Siap untuk Demo & Presentasi Hackathon (READY FOR DEMO)
- **Status:** **100% SIAP**
- **Cakupan:**
  - Seluruh alur pengguna dapat didemokan secara langsung tanpa *mock-only fallbacks*.
  - Skenario Happy Path (Warga pesan -> Petugas terima -> Timbang -> Fasilitas pilah -> Mitra beli) berjalan mulus.
  - Skenario Edge Cases (Penolakan material ilegal, kuota slot penuh, pembatalan darurat, anti-IDOR) berfungsi sesuai aturan domain.
  - Desain responsif di desktop maupun simulator ponsel pintar.

### 1.2 Siap untuk Uji Coba Lapangan Terkendali (READY FOR CONTROLLED PILOT)
- **Status:** **SIAP DENGAN PROTOKOL TERAWASI**
- **Kawasan Target:** 1–2 Banjar percontohan di Ubud (Desa Adat Ubud/Tebesaya) dan Sanur (Banjar Sanur Kauh).
- **Prasyarat Operasional:**
  1. Penandatanganan formal CDOA (*Community Destination Operating Agreement*) oleh Bendesa Adat / Kelian Banjar dan pengelola TPS3R.
  2. Pelatihan 3–5 petugas pengangkut sampah (*collector*) dan 2 operator timbang TPS3R dalam menggunakan antarmuka seluler Kedas.
  3. Verifikasi timbangan digital portabel di armada penjemputan untuk memastikan akurasi data kilogram yang diinput.
  4. Penyediaan koneksi internet seluler (SIM 4G Telkomsel/Indosat) untuk petugas di area kerja lapangan.

### 1.3 Belum Siap untuk Produksi Massal Tanpa Batas (NOT READY FOR UNRESTRICTED PRODUCTION)
- **Status:** **BELUM SIAP / MEMERLUKAN PENGEMBANGAN TAHAP LANJUTAN**
- **Alasan Teknis & Kelembagaan:**
  1. **Integrasi Pembayaran Finansial:** Belum terhubung dengan agregator pembayaran nasional (QRIS, VA Bank) untuk pencairan saldo tabungan bank sampah langsung ke rekening bank warga.
  2. **Infrastruktur Timbangan IoT:** Input berat saat ini masih manual via form digital terverifikasi petugas, belum terhubung sensor serial/Bluetooth timbangan otomatis anti-fraud.
  3. **Kapasitas Server & Redundansi Multi-Region:** Arsitektur saat ini diuji pada single-node deployment, belum diuji beban konkurensi ribuan transaksi per detik secara serentak di 9 kabupaten/kota Bali.

---

## 2. Analisis Risiko Lapangan & Mitigasi

| Risiko Operasional Lapangan | Tingkat Keparahan | Probabilitas | Strategi Mitigasi yang Telah Diterapkan di Sistem |
|---|---|---|---|
| **Koneksi Seluler Putus di Gang / Pelosok** | Tinggi | Tinggi | Arsitektur *optimistic update* pada aplikasi mobile dan dukungan penyimpanan cache lokal sementara (*offline sync readiness*). |
| **Fluktuasi Berat Akibat Air Hujan (Wet Waste)** | Sedang | Sangat Tinggi | Margin toleransi neraca massa fleksibel ($\pm 10\%$) pada pencatatan sortir TPS3R, disertai form catatan kondisi material (basah/kotor). |
| **Resistensi Warga Lansia terhadap Ponsel** | Sedang | Tinggi | Dukungan model *Proxy Reporting* melalui Prajuru Banjar atau Koordinator Lingkungan yang dapat memesankan penjemputan atas nama warga. |
| **Upaya Greenwashing oleh Entitas Wisata** | Tinggi | Sedang | Indikator DCLI memblokir skor (*INSUFFICIENT_DATA*) jika data belum mencukupi 3 siklus verifikasi. Laporan B2B menyertakan audit disclaimer wajib. |
| **Penolakan Sampah saat Petugas Tiba di Lokasi** | Sedang | Sedang | *Service Eligibility Engine* memvalidasi aturan material sejak awal pemesanan di aplikasi warga untuk mencegah miskomunikasi. |

---

## 3. Checklist Peluncuran Uji Coba Lapangan (Pilot Launch Checklist)

- [x] Basis data termigrasi penuh hingga revisi 0009 (tabel CDOA dan direktori layanan).
- [x] Akun demo percontohan untuk setiap role telah dipersiapkan dan diisi data awal.
- [x] Formulir persetujuan CDOA siap diunduh dan dicetak untuk pengesahan adat.
- [x] Paspor sampah QR code teruji aman dan bebas dari kebocoran data pribadi (PII).
- [x] Portal edukasi wisatawan `/guest` dapat diakses langsung tanpa kewajiban login.
- [ ] Pengadaan stiker barcode/QR tahan cuaca untuk wadah pemilahan di rumah warga.
- [ ] Sosialisasi tata cara operasional kepada prajuru banjar dan warga percontohan.
