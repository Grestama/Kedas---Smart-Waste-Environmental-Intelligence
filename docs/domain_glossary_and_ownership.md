# WasteLink Bali — Domain Glossary, Actor Taxonomy & Ownership Matrix (Tahap 1)

**Tanggal:** 30 Oktober 2026  
**Status:** Disahkan untuk Ekosistem 12 Kelompok WasteLink Bali

---

## 1. Glosarium Istilah Domain Inti

| Istilah Domain | Definisi Resmi Platform | Sumber Data Otoritatif |
| :--- | :--- | :--- |
| **Pickup Request** | Permohonan penjemputan sampah terpilah yang diajukan oleh warga atau lokasi usaha untuk slot waktu tertentu. | Warga / Pemohon (Klien) & Server |
| **Collection Task** | Penugasan operasional yang dihasilkan dari Pickup Request untuk armada pengangkut sampah (trike motor roda tiga). | Supervisor / Dispatcher |
| **Facility Receipt** | Tanda terima fisik penyerahan material saat tiba di fasilitas penerima (TPS3R, TPST, atau Bank Sampah). | Operator Pos Timbang TPS3R |
| **Weighing Record** | Catatan timbangan resmi yang memuat bobot kotor (gross), tara wadah (tare), bobot bersih (net), serta metode timbang. | Petugas Lapangan / Operator TPS3R |
| **Material Batch** | Pengelompokan (agregasi) beberapa setoran material terverifikasi menjadi satu lot komoditas yang siap didistribusikan ke mitra. | Operator TPS3R / Admin |
| **Handover (Serah-Terima)** | Bukti perpindahan tanggung jawab fisik material antar-pihak (misal: Petugas Trike &rarr; TPS3R &rarr; Truk Mitra Pabrik). | Pengirim & Penerima Bersama |
| **Processing Record** | Catatan pemrosesan internal di fasilitas (misal: pencacahan plastik botol, pengomposan organik, biokonversi maggot BSF). | Operator TPS3R / Pengolah Organik |
| **Residue (Residu)** | Fraksi sampah yang tidak dapat didaur ulang atau diolah secara ekonomis dan wajib diteruskan ke TPA regional. | Operator TPS3R / TPST |
| **Waste Bank Transaction** | Transaksi penyetoran nasabah pada unit bank sampah yang terikat pada buku tabungan internal bernilai rupiah. | Pengelola Bank Sampah |
| **Material Offer / Need** | Informasi penawaran atau permintaan spesifikasi material daur ulang (kategori, volume, harga indikatif, standar mutu). | Pengepul / Pabrik Daur Ulang |
| **Program Funding** | Alokasi dana program (CSR, sponsor, APBDes) dengan batasan pagu anggaran dan peruntukan wilayah tertentu. | Sponsor / Pengelola Program |
| **Verified Impact** | Klaim dampak lingkungan yang didasarkan secara eksklusif pada bukti penimbangan dan tanda terima pemrosesan sah. | Sistem Agregasi Platform |

---

## 2. Taksonomi 12 Kelompok Pengguna Ekosistem Bali

1. **G1: Warga / Rumah Tangga**
   - *Tanggung Jawab*: Memilah sampah dari sumber, mengajukan setoran, memantau rute trike, dan mengumpulkan WastePoints.
   - *Akses*: Mobile Citizen App (`mobile/`) dan Web Portal Warga (`/app`).
2. **G2: Petugas Pengangkut / Kebersihan**
   - *Tanggung Jawab*: Menerima tugas penjemputan, validasi kondisi sampah, menimbang di tempat, dan mengangkut ke TPS3R.
   - *Akses*: Desktop Web POS (`/staff`).
3. **G3: Banjar, Desa, Desa Adat & Komunitas**
   - *Tanggung Jawab*: Mengatur jadwal wilayah, sosialisasi awig-awig/pararem kebersihan, kerja bakti, dan pelaporan tumpukan sampah.
   - *Akses*: Community Portal (`/admin/area-jadwal`).
4. **G4: Operator TPS3R**
   - *Tanggung Jawab*: Menerima material dari armada trike, inspeksi mutu lanjutan, pencacahan, pembentukan batch, dan pengomposan.
   - *Akses*: Facility Console (`/staff` & `/admin/mitra`).
5. **G5: Operator TPST / Pusat Pemilahan Terpadu**
   - *Tanggung Jawab*: Konsolidasi volume besar, pemilahan mekanis/RDF, pencatatan aliran masuk/keluar, dan transfer residu TPA.
   - *Akses*: Facility Console (`/admin/mitra`).
6. **G6: Pengelola Bank Sampah**
   - *Tanggung Jawab*: Pembukuan tabungan nasabah, penimbangan berkala, dan penjualan kolektif ke pengepul.
   - *Akses*: Bank Sampah Desk (`/admin/waste-points/rules`).
7. **G7: Pengepul, Pendaur Ulang & Pengerajin**
   - *Tanggung Jawab*: Menerima kiriman batch material, verifikasi timbangan pabrik, dan penerbitan bukti pemrosesan.
   - *Akses*: Partner Portal (`/admin/mitra`).
8. **G8: Pelaku Usaha (Hotel, Resto, Vila, Pasar, Kantor)**
   - *Tanggung Jawab*: Penjadwalan ritase rutin komersial, pemilahan volume besar, dan pelaporan kepatuhan lingkungan.
   - *Akses*: Commercial Services (`/app`).
9. **G9: Pengolah Organik & Kompos**
   - *Tanggung Jawab*: Menerima fraksi organik bersih, pencatatan siklus fermentasi/maggot BSF, dan distribusi pupuk kompos desa.
   - *Akses*: Organics Desk (`/admin/mitra`).
10. **G10: Tim Bersih Pantai / Sungai & Relawan**
    - *Tanggung Jawab*: Pencatatan aksi gotong royong insidental tanpa mencampuradukkan metrik dengan ritase harian.
    - *Akses*: Community Desk (`/admin/laporan`).
11. **G11: Pengelola Limbah Khusus / B3**
    - *Tanggung Jawab*: Rujukan aman untuk limbah berbahaya (baterai, jarum suntik, pestisida, oli) ke pos penanganan berizin.
    - *Akses*: Restricted Specialty Desk (Nonaktif secara default sampai mitra berizin terverifikasi).
12. **G12: Admin Platform, Pemda, Sponsor & CSR**
    - *Tanggung Jawab*: Master data platform, audit integritas sistem, pemantauan pagu pendanaan, dan pelaporan daerah.
    - *Akses*: Full Admin Console (`/admin`).

---

## 3. Matriks Kepemilikan & Hak Akses Data (Ownership Matrix)

| Entitas Data | Aktor Pemilik (Writer / Modifier) | Pembaca Terotorisasi (Reader) | Aturan Akses & Privasi |
| :--- | :--- | :--- | :--- |
| **Profil & Alamat Warga** | Warga Pemilik | Warga Pemilik, Petugas yang Ditugaskan, Admin | Nomor telepon dan alamat lengkap disamarkan untuk petugas lain. |
| **Pickup Request** | Warga Pemohon | Warga Pemohon, Petugas Tertugas, Admin | IDOR-protected; pemohon lain tidak bisa membaca. |
| **Collection Task** | Dispatcher / Petugas yang Klaim | Petugas Tertugas, Supervisor, Admin | Klaim tugas bersifat atomik; double assignment diblokir. |
| **Hasil Inspeksi QC** | Petugas Lapangan / Operator TPS3R | Warga Pemohon, Petugas, Admin | Nilai QC Grade A/B/C/D tidak dapat dimanipulasi warga. |
| **Catatan Timbangan** | Petugas / Operator Berwenang | Warga Pemohon, Petugas, Admin | Berat sah mengunci data; revisi menghasilkan versi baru (`SUPERSEDED`). |
| **WastePoints Ledger** | Backend System (Otoritatif) | Warga Pemilik, Admin Finance | *Append-only*; mutasi poin memiliki referensi id transaksi sumber. |
| **Material Batch** | Operator TPS3R / Admin | Operator TPS3R, Mitra Pembeli, Admin | Menelusuri daftar pickup penyusun lot material. |
| **Surat Jalan Pengiriman** | Pengirim (Operator TPS3R) | Operator TPS3R, Mitra Penerima, Admin | Selisih berat otomatis memicu status sengketa (`DISPUTED`). |
| **Alokasi Dana CSR** | Sponsor / Admin Program | Sponsor Terkait, Admin Program | Sponsor hanya dapat membaca program yang didanainya. |
| **Audit Log Sistem** | Backend Security Middleware | Platform Admin (Read-Only) | Imutabel; tidak dapat diedit atau dihapus oleh siapapun. |

---

## 4. Catatan Keputusan Arsitektur Terpadu (Decision Log)

- **ADR-001 (Pemisahan Peran & Terminal)**: Aplikasi mobile hanya untuk Warga. Petugas dan Admin menggunakan Web Desktop POS di komputer operasional untuk meminimalkan salah ketik angka timbangan.
- **ADR-002 (Integritas Timbangan)**: Bobot tara wadah wajib dimasukkan dan divalidasi ($\text{Net} = \text{Gross} - \text{Tare}$).
- **ADR-003 (Backend sebagai Otoritas Poin)**: WastePoints tidak pernah dihitung di aplikasi client. Klien hanya menampilkan estimasi sampai server mengesahkan hasil timbang.
- **ADR-004 (Luring Transparan)**: Setoran luring disimpan di penyimpanan lokal dengan status `DRAFT_LOKAL_OFFLINE` dan tidak mengklaim kuota server sampai terkirim online.
- **ADR-005 (Penyimpanan Waktu Standar)**: Timestamp database disimpan dalam UTC ISO-8601; tampilan diformat ke WITA (`Asia/Makassar`).
