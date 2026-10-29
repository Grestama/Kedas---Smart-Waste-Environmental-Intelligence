# High-Level Requirements Document (HRD)

# WasteLink Bali --- Platform Pengelolaan Sampah Berbasis Komunitas dan Ekonomi Sirkular

> **Status dokumen:** Draft kebutuhan tingkat tinggi untuk hackathon /
> MVP\
> **Versi:** 1.0\
> **Tanggal:** 29 Oktober 2026\
> **Bahasa utama produk:** Bahasa Indonesia\
> **Wilayah pilot yang diasumsikan:** satu banjar atau desa di Bali\
> **Zona waktu:** WITA (`Asia/Makassar`)\
> **Dokumen acuan:** `PRD_WasteLink_Bali.md`\
> **Catatan istilah:** Dalam dokumen ini, HRD berarti **High-Level
> Requirements Document**, bukan Human Resource Development.\
> **Catatan penting:** Harga material, formula poin, SLA, kapasitas,
> biaya, target KPI, dan contoh transaksi merupakan asumsi desain.
> Semuanya harus divalidasi melalui riset mitra, uji operasional, dan
> persetujuan pengelola sebelum diterapkan di lapangan.

------------------------------------------------------------------------

## Daftar Isi

1.  Ringkasan Dokumen
2.  Tujuan dan Ruang Lingkup
3.  Konteks Produk dan Stakeholder
4.  Prinsip dan Aturan Dasar
5.  Gambaran Sistem
6.  Role, Identitas, dan Hak Akses
7.  Kebutuhan Fungsional Tingkat Tinggi
8.  Kebutuhan Pengelolaan Sampah
9.  Kebutuhan WastePoints dan Reward
10. Kebutuhan Circular Marketplace
11. Kebutuhan Pendanaan dan Keuangan Operasional
12. Kebutuhan Dashboard dan Pelaporan
13. Kebutuhan Nonfungsional
14. Kebutuhan Data dan Integrasi
15. Kebutuhan Keamanan, Privasi, dan Audit
16. Kebutuhan UX/UI dan Aksesibilitas
17. Aturan Bisnis dan Validasi
18. Alur End-to-End
19. Batasan, Dependensi, dan Risiko
20. Prioritas Kebutuhan
21. Kriteria Penerimaan Tingkat Sistem
22. Strategi Pengujian dan Validasi
23. Indikator Keberhasilan
24. Roadmap Implementasi
25. Keputusan Terbuka
26. Glosarium
27. Matriks Keterlacakan Kebutuhan

------------------------------------------------------------------------

## 1. Ringkasan Dokumen

### 1.1 Tujuan dokumen

Dokumen ini mendefinisikan kebutuhan tingkat tinggi WasteLink Bali
sebagai landasan untuk desain sistem, arsitektur teknis, pembagian tugas
tim, implementasi MVP, dan pengujian. HRD menjelaskan **apa yang harus
disediakan oleh sistem dan batasan yang harus dipenuhi**, sedangkan PRD
menjelaskan konteks produk, pengalaman pengguna, dan detail fitur secara
lebih luas.

HRD ini ditujukan kepada: - Product Owner atau ketua tim hackathon. -
UI/UX Designer. - Frontend Developer. - Backend Developer. - Data/AI
Engineer. - QA / Tester. - Calon mitra pengangkut, bank sampah,
pengepul, pengolah organik, pengerajin, sponsor, dan pengelola
komunitas.

### 1.2 Ringkasan produk

WasteLink Bali adalah platform pengelolaan sampah berbasis komunitas
yang menghubungkan warga, petugas sampah, pengelola, dan
pembeli/pengolah material. Sistem menangani siklus dari laporan atau
setoran, pemilahan, penjadwalan, penjemputan, penimbangan, verifikasi
kualitas, pemberian poin, penggabungan material ke dalam batch, hingga
distribusi kepada mitra.

Produk memiliki tiga domain utama:

1.  **Waste Collection:** laporan, jadwal, penugasan, penjemputan,
    bukti, dan riwayat.
2.  **WastePoints:** berat terverifikasi, aturan reward, saldo poin,
    ledger transaksi, dan penukaran.
3.  **Circular Marketplace:** mitra, kebutuhan material, batch,
    pencocokan, penawaran, distribusi, dan bukti penerimaan.

Sistem juga menyediakan kontrol administratif, pengelolaan role,
notifikasi, pelaporan, dan audit.

### 1.3 Pernyataan kebutuhan utama

WasteLink harus memastikan bahwa: - Warga dapat mengajukan setoran
dengan kategori dan lokasi yang benar. - Petugas yang terverifikasi
dapat mengambil dan menyelesaikan tugas sesuai izin. - Sampah organik,
anorganik bernilai, residu, dan limbah khusus memiliki alur yang
berbeda. - Berat dan kualitas final dicatat melalui proses verifikasi,
bukan hanya berdasarkan foto atau prediksi AI. - Reward hanya
diterbitkan berdasarkan transaksi yang sah dan aturan reward yang
aktif. - Material yang sudah terkumpul dapat dilacak hingga batch dan
penerima yang tercatat. - Admin dapat mengelola pengguna, role,
kategori, mitra, aturan, laporan, dan audit. - Sistem tidak menyatakan
material telah didaur ulang apabila yang tersedia hanya bukti
pengangkutan atau penerimaan. - Data pengguna, lokasi, bukti foto, dan
transaksi hanya dapat diakses sesuai hak akses.

### 1.4 Status kebutuhan

Kebutuhan dalam dokumen menggunakan prioritas berikut: - **MUST:** harus
tersedia agar alur inti MVP dapat berjalan. - **SHOULD:** sangat
disarankan; dapat disederhanakan jika waktu hackathon terbatas. -
**COULD:** nilai tambah apabila waktu dan kapasitas tim memungkinkan. -
**WON'T (MVP):** secara eksplisit tidak dikerjakan pada rilis MVP.

Prioritas ini adalah panduan perencanaan, bukan pengganti keputusan
Product Owner.

------------------------------------------------------------------------

## 2. Tujuan dan Ruang Lingkup

### 2.1 Tujuan bisnis

1.  Meningkatkan kemudahan warga dalam memilah dan menyalurkan sampah.
2.  Meningkatkan keterlacakan pengumpulan, penimbangan, dan distribusi
    material.
3.  Mendorong pemilahan melalui reward yang transparan dan
    berkelanjutan.
4.  Menghubungkan pasokan material dengan kebutuhan mitra pengolah.
5.  Membantu pengelola memahami volume, kualitas, biaya, performa
    layanan, dan kebutuhan pendanaan.
6.  Menyediakan prototipe yang dapat diuji dalam satu wilayah pilot
    tanpa mengasumsikan integrasi skala provinsi.

### 2.2 Tujuan pengguna

**Warga** - Memahami cara memilah sampah. - Membuat laporan/setoran
tanpa proses rumit. - Mengetahui jadwal dan status penjemputan. -
Melihat berat final, riwayat, dan poin yang diperoleh. - Memahami alasan
jika sampah ditolak atau reward disesuaikan.

**Petugas Sampah** - Melihat tugas yang tersedia dan sesuai
area/kapasitas. - Mengetahui lokasi, kategori, estimasi volume, dan
catatan penanganan. - Memperbarui status tugas. - Mencatat berat dan
kualitas sesuai kewenangan. - Mengunggah bukti penyelesaian.

**Admin/Pengelola** - Memverifikasi petugas dan mitra. - Mengatur
kategori, tarif reward, area layanan, jadwal, dan status. - Meninjau
laporan, transaksi, konflik, dan anomali. - Mengelola konfigurasi tanpa
mengubah catatan historis secara diam-diam.

**Buyer / Pengolah / Pengepul / Pengerajin** - Menginformasikan jenis
dan spesifikasi material yang dibutuhkan. - Melihat batch yang sesuai
dengan akses yang diberikan. - Mengajukan permintaan atau penawaran. -
Mengonfirmasi penerimaan dan kondisi material.

**Sponsor / Mitra Program** - Menyediakan dukungan dana atau reward
berdasarkan perjanjian. - Melihat laporan agregat program yang
disetujui. - Tidak memperoleh akses otomatis ke data pribadi warga.

### 2.3 Ruang lingkup MVP

MVP minimal mencakup: - Registrasi dan autentikasi. - Profil pengguna
dan multi-role. - Pengajuan role petugas serta verifikasi admin. -
Switch role pada akun yang memiliki lebih dari satu role aktif. -
Kategori dan panduan pemilahan. - Pembuatan laporan/setoran. -
Penjadwalan penjemputan. - Daftar tugas petugas dan penerimaan tugas. -
Pembaruan status dan bukti penjemputan. - Penimbangan dan verifikasi
kualitas oleh petugas berwenang. - Perhitungan dan pencatatan poin
berbasis aturan. - Riwayat laporan, penjemputan, dan poin. - Pengelolaan
batch material sederhana. - Daftar mitra dan pencatatan tujuan
distribusi. - Dashboard admin dasar. - Notifikasi dalam aplikasi. -
Audit log untuk tindakan kritis. - Data contoh untuk demonstrasi dan
pengujian.

### 2.4 Di luar ruang lingkup MVP

Fitur berikut tidak wajib untuk demo awal: - Pembayaran tunai otomatis
atau dompet uang elektronik. - Integrasi langsung ke sistem pembayaran
atau bank. - Pelacakan GPS petugas secara real-time sepanjang waktu. -
Timbangan IoT otomatis. - Prediksi harga pasar material secara
real-time. - Model AI khusus untuk mengidentifikasi semua jenis limbah
berbahaya. - Integrasi API pemerintah atau sistem persampahan eksternal
yang belum dikonfirmasi. - Penghitungan emisi/karbon sebagai klaim
terverifikasi. - Pengelolaan armada dan optimasi rute skala besar. -
Operasi multi-provinsi. - Perdagangan material otomatis tanpa konfirmasi
manusia. - Penetapan legalitas atau status aman suatu limbah hanya dari
hasil AI.

### 2.5 Definisi keberhasilan MVP

MVP dianggap berjalan apabila satu transaksi demonstrasi dapat
ditelusuri dari awal sampai akhir:

1.  Warga membuat setoran.
2.  Sistem memvalidasi data dan membuat permintaan penjemputan.
3.  Petugas terverifikasi menerima tugas.
4.  Petugas memperbarui status dan mencatat hasil penjemputan.
5.  Berat bersih dan kualitas diverifikasi.
6.  Sistem menghitung reward berdasarkan aturan aktif, jika kategori
    memenuhi syarat.
7.  Catatan transaksi poin masuk ke ledger.
8.  Material dapat dimasukkan ke batch.
9.  Batch dapat ditautkan ke mitra dan status distribusi.
10. Admin dapat melihat riwayat dan ringkasan transaksi.

------------------------------------------------------------------------

## 3. Konteks Produk dan Stakeholder

### 3.1 Stakeholder utama

  -----------------------------------------------------------------------
  Stakeholder             Kebutuhan utama         Keterlibatan
  ----------------------- ----------------------- -----------------------
  Warga                   Setoran mudah, jadwal   Pengguna langsung
                          jelas, poin transparan  

  Petugas sampah          Daftar tugas, navigasi  Pengguna operasional
                          lokasi, pencatatan      
                          sederhana               

  Admin/Pengelola         Kontrol layanan,        Pemilik operasional
                          verifikasi,             
                          konfigurasi, laporan    

  Bank sampah             Data setoran, kategori, Mitra
                          berat, dan rekap        pengumpulan/pemasaran

  Pengepul                Material sesuai         Pembeli/mitra
                          spesifikasi dan         
                          kuantitas               

  Pengerajin              Material tertentu dan   Pembeli/pemanfaat
                          pasokan terprediksi     material

  Pengolah organik        Organik sesuai jenis,   Mitra pemrosesan
                          kondisi, dan kapasitas  

  Hotel/restoran/kafe     Pengelolaan rutin dan   Pelanggan B2B potensial
                          laporan                 

  Sponsor/CSR             Hasil program yang      Pendana program
                          dapat                   
                          dipertanggungjawabkan   

  Pemerintah/desa adat    Koordinasi dan laporan  Mitra potensial
                          wilayah                 

  Tim WasteLink           Produk, operasi,        Pengelola platform
                          dukungan, dan evaluasi  
  -----------------------------------------------------------------------

### 3.2 Batas tanggung jawab

WasteLink adalah sistem koordinasi dan pencatatan. Platform tidak boleh
mengklaim melakukan pengolahan fisik jika pengolahan dilakukan oleh
mitra. Tanggung jawab aktual atas pengangkutan, penyimpanan, pemrosesan,
dan penerimaan material harus mengikuti kesepakatan operasional serta
ketentuan yang berlaku.

### 3.3 Model operasi awal

-   Satu wilayah pilot yang disepakati.
-   Satu pengelola/admin utama.
-   Sejumlah petugas yang telah diverifikasi.
-   Minimal satu mitra pengolahan organik jika kategori organik dibuka.
-   Minimal satu pengepul/bank sampah/pembeli untuk kategori anorganik
    yang ditampilkan sebagai tersedia.
-   Kategori yang belum memiliki jalur penerimaan harus ditandai "belum
    tersedia" atau tidak dapat dipesan.
-   Jam layanan, kapasitas, tarif, dan SLA ditentukan oleh pengelola
    berdasarkan kapasitas aktual.

------------------------------------------------------------------------

## 4. Prinsip dan Aturan Dasar

### 4.1 Prinsip data yang dapat dipercaya

-   Data berat harus bersumber dari timbangan fisik atau perangkat
    timbang yang disetujui.
-   Data kualitas harus dicatat oleh petugas atau petugas pemeriksa yang
    memiliki izin.
-   AI hanya memberi rekomendasi kategori, bukan menentukan berat, harga
    final, atau status keamanan.
-   Semua perubahan terhadap data transaksi kritis harus memiliki
    identitas pelaku, waktu, dan alasan.
-   Koreksi tidak boleh menghapus jejak nilai sebelumnya; gunakan
    catatan koreksi atau audit trail.

### 4.2 Prinsip ekonomi

-   Nilai material dan poin reward adalah dua entitas berbeda.
-   Poin bukan uang tunai kecuali program secara eksplisit dan sah
    menyediakan penukaran tunai.
-   Tarif reward harus memiliki versi, periode berlaku, kategori, syarat
    kualitas, dan sumber pendanaan.
-   Poin tidak boleh diterbitkan sebelum syarat verifikasi terpenuhi.
-   Jika dana reward tidak tersedia atau program ditangguhkan, sistem
    harus mengikuti aturan yang sudah diumumkan dan tidak membuat janji
    baru.
-   Biaya layanan penjemputan, bila ada, harus dipisahkan dari nilai
    reward material.

### 4.3 Prinsip keselamatan

-   Limbah yang tidak dikenal, bahan kimia, baterai, lampu tertentu,
    limbah elektronik, dan material berisiko harus diarahkan ke jalur
    khusus.
-   Petugas tidak diwajibkan menerima material yang tidak aman atau
    tidak sesuai spesifikasi.
-   Sistem harus menyediakan alasan penolakan yang jelas.
-   Jangan meminta warga membuka, mencampur, atau memindahkan bahan yang
    dicurigai berbahaya.
-   Panduan aplikasi bukan pengganti prosedur keselamatan dan instruksi
    pengelola yang kompeten.

### 4.4 Prinsip pengalaman pengguna

-   Formulir warga harus singkat dan bertahap.
-   Istilah teknis harus disertai contoh visual atau penjelasan
    sederhana.
-   Status permintaan harus mudah dipahami.
-   Pengguna harus mengetahui apakah poin masih estimasi atau sudah
    final.
-   Switch role tidak boleh menghilangkan tugas aktif atau mengubah
    kepemilikan data.
-   Pesan error harus menyebut tindakan yang bisa dilakukan pengguna,
    tanpa membocorkan informasi sensitif.

------------------------------------------------------------------------

## 5. Gambaran Sistem

### 5.1 Komponen logis

1.  **Client Application:** antarmuka responsif untuk warga, petugas,
    buyer, dan admin.
2.  **Authentication & Authorization:** login, sesi, role, status
    verifikasi, dan izin.
3.  **Waste Collection Service:** laporan, jadwal, permintaan, tugas,
    status, dan bukti.
4.  **Waste Classification Service:** kategori, subkategori, panduan,
    kondisi, kontaminasi, dan jalur penanganan.
5.  **Weighing & Quality Service:** pencatatan berat, berat kemasan,
    berat bersih, kualitas, dan koreksi.
6.  **Reward Service:** konfigurasi tarif, kalkulasi poin, ledger,
    pembatalan, dan penukaran.
7.  **Batch & Marketplace Service:** batch material, spesifikasi,
    permintaan pembeli, distribusi, dan penerimaan.
8.  **Notification Service:** notifikasi status, tugas, reward, dan
    perubahan yang relevan.
9.  **Admin & Reporting Service:** dashboard, laporan, konfigurasi,
    ekspor, dan audit.
10. **Storage Service:** foto laporan, bukti penjemputan, dan dokumen
    mitra.
11. **Database:** data terstruktur dan relasi.
12. **Audit & Monitoring:** pencatatan tindakan penting, error, dan
    metrik sistem.

### 5.2 Arsitektur implementasi yang disarankan

Untuk prototipe: - Frontend: Next.js App Router + TypeScript. - UI:
Tailwind CSS dan komponen yang konsisten. - Backend: FastAPI. -
Database: PostgreSQL. - Data spasial: PostGIS jika fitur lokasi
memerlukan pencarian radius atau geometri. - File: object storage dengan
akses terbatas. - Peta: provider yang dipilih tim setelah memeriksa
kuota, lisensi, dan kebijakan penggunaan. - Deployment: satu frontend,
satu backend API, satu database terkelola, dan storage. - API: REST
dengan dokumentasi OpenAPI. - Waktu: simpan timestamp dalam UTC bila
sesuai arsitektur; tampilkan ke pengguna dalam WITA. - Poin: integer,
bukan floating point. - Berat: simpan satuan eksplisit; rekomendasi
internal gram sebagai integer atau kilogram desimal dengan aturan
presisi konsisten.

Pilihan teknologi dapat berubah sesuai kemampuan tim; kebutuhan perilaku
dan integritas data tetap harus dipenuhi.

### 5.3 Diagram konteks

``` mermaid
flowchart LR
    W[Warga] -->|Setoran, jadwal, konfirmasi| A[WasteLink Platform]
    P[Petugas Sampah] -->|Tugas, timbang, bukti| A
    AD[Admin/Pengelola] -->|Verifikasi dan konfigurasi| A
    B[Buyer/Pengepul/Pengerajin] <-->|Kebutuhan dan penerimaan material| A
    O[Pengolah Organik] <-->|Kapasitas dan penerimaan| A
    S[Sponsor/Program B2B] <-->|Dukungan dan laporan agregat| A
    A --> DB[(Database)]
    A --> FS[(Object Storage)]
    A --> N[Notifikasi]
```

### 5.4 Batas integrasi

-   Integrasi pihak ketiga hanya boleh digunakan setelah akses dan
    syaratnya jelas.
-   Sistem tidak boleh mengklaim status "real-time" jika pembaruan
    berasal dari input manual.
-   Jika peta atau notifikasi eksternal gagal, pengguna tetap dapat
    melihat detail tugas dan status terakhir yang tersimpan.
-   Integrasi eksternal harus memiliki penanganan timeout, error, dan
    kuota.
-   Data demo harus ditandai sebagai data simulasi.

------------------------------------------------------------------------

## 6. Role, Identitas, dan Hak Akses

### 6.1 Jenis role

  -----------------------------------------------------------------------
  Role                    Tujuan                  Status khusus
  ----------------------- ----------------------- -----------------------
  `USER`                  Mengajukan setoran dan  Aktif setelah
                          melihat riwayat         registrasi

  `COLLECTOR`             Mengelola dan           Memerlukan verifikasi
                          menyelesaikan tugas     
                          penjemputan             

  `ADMIN`                 Mengelola konfigurasi   Diberikan secara
                          dan operasi             terbatas

  `BUYER`                 Mengelola kebutuhan     Memerlukan verifikasi
                          material dan konfirmasi 
                          penerimaan              

  `PROCESSOR`             Mengelola               Memerlukan verifikasi
                          penerimaan/kapasitas    
                          pengolahan              

  `FINANCE`               Meninjau transaksi      Opsional untuk MVP
                          reward dan pendanaan    

  `SPONSOR_VIEWER`        Melihat laporan program Akses terbatas
                          agregat yang disetujui  
  -----------------------------------------------------------------------

Satu akun dapat memiliki lebih dari satu role. Role aktif adalah konteks
navigasi, bukan sumber otorisasi tunggal.

### 6.2 Persyaratan switch role

-   Sistem harus menampilkan hanya role yang dimiliki akun dan statusnya
    aktif.
-   Role `COLLECTOR`, `BUYER`, `PROCESSOR`, dan role operasional khusus
    harus disetujui sebelum digunakan.
-   Jika role belum aktif, sistem menampilkan status pengajuan dan
    persyaratan yang belum terpenuhi.
-   Perpindahan role tidak mengubah user ID.
-   Perpindahan role tidak menghapus draft, riwayat, atau tugas aktif.
-   Backend memeriksa role dan izin untuk setiap operasi yang
    dilindungi.
-   Role aktif dapat disimpan sebagai preferensi UI, tetapi tidak boleh
    dianggap bukti otorisasi.
-   Pengguna dapat kembali ke role lain tanpa kehilangan konteks
    transaksi.
-   Aksi sensitif dapat meminta autentikasi ulang atau konfirmasi
    tambahan.

### 6.3 Matriks akses tingkat tinggi

  -----------------------------------------------------------------------------------
  Kemampuan            User    Collector         Admin   Buyer/Processor      Finance
  ------------ ------------ ------------ ------------- ----------------- ------------
  Melihat                Ya           Ya            Ya                Ya           Ya
  profil                                                                 
  sendiri                                                                

  Mengajukan             Ya    Jika juga      Opsional     Tidak default        Tidak
  setoran                           User     untuk uji                   

  Melihat                Ya Jika pemilik        Sesuai     Tidak default        Tidak
  setoran                                    kebutuhan                   
  sendiri                                  operasional                   

  Mengambil           Tidak           Ya         Dapat             Tidak        Tidak
  tugas                                      mengawasi                   

  Mencatat            Tidak  Jika diberi         Dapat     Tidak default        Tidak
  berat                             izin    mengoreksi                   
                                          dengan audit                   

  Verifikasi          Tidak        Tidak            Ya             Tidak        Tidak
  petugas                                                                

  Mengubah            Tidak        Tidak    Ya, sesuai             Tidak        Dapat
  tarif reward                                    izin                       meninjau

  Melihat                Ya     Jika ada  Sesuai audit             Tidak           Ya
  ledger                          reward                                 
  sendiri                        petugas                                 

  Membuat             Tidak  Jika diberi            Ya          Opsional        Tidak
  batch                             izin                                 

  Mengajukan          Tidak        Tidak         Dapat                Ya        Tidak
  kebutuhan                                  mengelola                   
  material                                                               

  Konfirmasi          Tidak        Tidak         Dapat   Ya, untuk batch        Tidak
  penerimaan                                 mengawasi           terkait 
  batch                                                                  

  Melihat             Tidak        Tidak   Sesuai izin             Tidak           Ya
  laporan                                                                
  keuangan                                                               
  lengkap                                                                

  Mengakses           Tidak        Tidak      Terbatas             Tidak       Sesuai
  audit log                                                                 kebutuhan
  -----------------------------------------------------------------------------------

### 6.4 Status akun dan role

Akun: - `PENDING_VERIFICATION` jika ada proses verifikasi yang
diperlukan. - `ACTIVE` jika dapat menggunakan fungsi sesuai izin. -
`SUSPENDED` jika akses ditangguhkan. - `REJECTED` untuk pengajuan yang
ditolak, bukan untuk menghapus akun secara otomatis. - `DEACTIVATED`
jika akun dinonaktifkan sesuai kebijakan.

Role: - `PENDING` - `ACTIVE` - `REJECTED` - `SUSPENDED` - `REVOKED`

Perubahan status harus mencatat aktor, waktu, dan alasan. Penolakan atau
penangguhan harus disertai pesan yang layak jika aman dan sesuai.

### 6.5 Pengajuan role Collector

Sistem harus menyediakan: - Formulir data yang diperlukan untuk
verifikasi. - Persetujuan atas ketentuan operasional. - Status
pengajuan. - Catatan admin. - Riwayat perubahan. - Mekanisme pengajuan
ulang jika diizinkan. - Tidak mengaktifkan role hanya karena formulir
berhasil dikirim.

Informasi yang dikumpulkan harus minimum dan sesuai kebutuhan
operasional. Dokumen identitas sensitif tidak boleh diwajibkan tanpa
alasan, dasar pemrosesan, dan prosedur perlindungan yang jelas.

------------------------------------------------------------------------

## 7. Kebutuhan Fungsional Tingkat Tinggi

### 7.1 Autentikasi dan profil

**FR-AUTH-001 --- Registrasi** - Prioritas: MUST. - Sistem menyediakan
registrasi menggunakan metode autentikasi yang dipilih tim. - Email atau
identitas login harus unik. - Kata sandi, jika digunakan, disimpan dalam
bentuk hash aman. - Validasi harus menampilkan kesalahan yang dapat
dipahami. - Sistem tidak mengungkap apakah email tertentu terdaftar
melalui pesan error yang berisiko enumerasi.

**FR-AUTH-002 --- Login dan logout** - Prioritas: MUST. - Pengguna dapat
login dan logout. - Sesi/token memiliki masa berlaku dan mekanisme
invalidasi yang sesuai. - Endpoint terlindungi menolak sesi tidak valid.

**FR-AUTH-003 --- Profil** - Prioritas: MUST. - Pengguna dapat melihat
dan mengubah field profil yang diizinkan. - Perubahan informasi sensitif
dapat memerlukan verifikasi ulang. - Alamat dan lokasi operasional tidak
ditampilkan secara publik tanpa alasan.

**FR-AUTH-004 --- Pemulihan akses** - Prioritas: SHOULD. - Sistem
menyediakan alur pemulihan akun yang aman jika infrastruktur
mendukungnya.

### 7.2 Switch role

**FR-ROLE-001 --- Daftar role tersedia** - Prioritas: MUST. - Sistem
menampilkan role aktif dan role yang menunggu verifikasi secara
berbeda. - Role yang belum disetujui tidak dapat mengakses fitur
operasional.

**FR-ROLE-002 --- Berpindah role** - Prioritas: MUST. - Pengguna dengan
dua role aktif dapat berganti dashboard. - Pergantian role tidak membuat
akun baru atau mengubah pemilik data.

**FR-ROLE-003 --- Proteksi backend** - Prioritas: MUST. - Semua operasi
sensitif memvalidasi izin dari sisi backend. - Manipulasi nilai role
aktif di client tidak dapat menaikkan hak akses.

**FR-ROLE-004 --- Audit role** - Prioritas: SHOULD. - Perubahan status
role dan tindakan admin dicatat.

### 7.3 Kategori dan panduan pemilahan

**FR-WASTE-001 --- Kategori** - Prioritas: MUST. - Sistem mendukung
kategori utama: organik, anorganik bernilai, residu, dan limbah
khusus. - Subkategori dapat dikonfigurasi. - Setiap kategori mempunyai
status aktif/nonaktif, panduan, dan jalur penanganan.

**FR-WASTE-002 --- Panduan** - Prioritas: MUST. - Sistem menampilkan
contoh item, cara persiapan, kontaminan yang tidak diperbolehkan, dan
instruksi aman. - Panduan harus dapat diperbarui tanpa mengubah
transaksi lama.

**FR-WASTE-003 --- Ketersediaan jalur** - Prioritas: MUST. - Kategori
hanya dapat dijadwalkan untuk layanan tertentu apabila wilayah, petugas,
dan jalur pengolahan tersedia. - Jika jalur belum tersedia, sistem
menjelaskan keterbatasan dan tidak menerima janji distribusi.

**FR-WASTE-004 --- Saran AI** - Prioritas: COULD. - Sistem dapat
menyarankan kategori dari gambar. - Pengguna harus dapat mengoreksi
saran. - Hasil AI ditandai sebagai saran. - Sistem tidak boleh
memutuskan status limbah berbahaya hanya dari klasifikasi gambar.

### 7.4 Laporan dan permintaan penjemputan

**FR-COLLECT-001 --- Membuat laporan** - Prioritas: MUST. - User dapat
memilih kategori, subkategori, estimasi jumlah, kondisi, lokasi, jadwal,
dan catatan. - Foto dapat diwajibkan atau opsional sesuai jenis
layanan. - Sistem memvalidasi field wajib, lokasi layanan, dan
ketersediaan kategori. - Sistem membuat ID laporan yang unik.

**FR-COLLECT-002 --- Menjadwalkan** - Prioritas: MUST. - Jadwal harus
berasal dari slot layanan yang dikonfigurasi. - Sistem mencegah
pemilihan slot yang tidak tersedia. - Slot yang penuh tidak boleh
ditawarkan sebagai tersedia.

**FR-COLLECT-003 --- Melihat status** - Prioritas: MUST. - User dapat
melihat status terkini, waktu pembaruan, dan tindakan berikutnya. -
Sistem menampilkan perbedaan antara status permintaan, status
penjemputan, dan status distribusi material.

**FR-COLLECT-004 --- Membatalkan permintaan** - Prioritas: SHOULD. -
User dapat membatalkan sebelum batas status yang ditentukan. -
Pembatalan setelah tugas diterima dapat memerlukan alasan atau
konfirmasi. - Sistem mencatat pembatalan dan memberi tahu petugas
terkait.

**FR-COLLECT-005 --- Mencegah duplikasi** - Prioritas: SHOULD. - Sistem
mendeteksi kemungkinan laporan duplikat berdasarkan pemilik, waktu,
lokasi, dan status. - Sistem meminta konfirmasi, bukan menghapus laporan
secara otomatis.

### 7.5 Pengelolaan tugas petugas

**FR-TASK-001 --- Daftar tugas** - Prioritas: MUST. - Petugas aktif
dapat melihat tugas yang memenuhi area layanan, kapasitas, kategori yang
diizinkan, dan jadwal. - Detail pribadi ditampilkan seminimal mungkin
sampai tugas relevan diambil.

**FR-TASK-002 --- Mengambil tugas** - Prioritas: MUST. - Sistem
memastikan satu tugas tidak dapat diambil secara bersamaan oleh beberapa
petugas. - Konflik pengambilan diselesaikan secara atomik di backend. -
Jika tugas telah diambil, petugas lain menerima pesan yang sesuai.

**FR-TASK-003 --- Update status** - Prioritas: MUST. - Petugas dapat
memperbarui status sesuai transisi yang diizinkan. - Transisi yang tidak
valid ditolak. - Sistem mencatat waktu dan aktor.

**FR-TASK-004 --- Bukti penjemputan** - Prioritas: MUST. - Petugas dapat
mengunggah foto atau bukti yang disyaratkan. - Bukti dikaitkan dengan
tugas dan aktor. - Sistem membatasi jenis, ukuran, dan akses file. -
Foto tidak boleh ditampilkan ke publik secara default.

**FR-TASK-005 --- Tidak dapat menyelesaikan** - Prioritas: SHOULD. -
Petugas dapat menandai kendala, misalnya alamat tidak ditemukan, warga
tidak ada, sampah tidak sesuai, akses tertutup, atau kondisi tidak
aman. - Status dan alasan kendala dapat ditinjau admin.

### 7.6 Penimbangan dan kualitas

**FR-WEIGH-001 --- Catat berat** - Prioritas: MUST untuk reward berbasis
berat. - Sistem mencatat berat kotor, berat wadah/tara jika ada, dan
berat bersih. - Rumus: `berat_bersih = berat_kotor - berat_tara`. -
Berat harus positif dan sesuai batas operasional yang dikonfigurasi. -
Satuan dan presisi harus konsisten.

**FR-WEIGH-002 --- Verifikasi kualitas** - Prioritas: MUST. - Petugas
berwenang memilih kondisi, tingkat kontaminasi, dan hasil verifikasi. -
Kualitas dapat mengubah kelayakan reward atau rute pengolahan sesuai
aturan yang aktif. - Penolakan harus memiliki alasan.

**FR-WEIGH-003 --- Koreksi berat** - Prioritas: SHOULD. - Koreksi hanya
dapat dilakukan role berwenang. - Nilai lama, nilai baru, aktor, waktu,
dan alasan disimpan. - Koreksi dapat memicu penyesuaian ledger melalui
transaksi kompensasi, bukan penghapusan historis.

**FR-WEIGH-004 --- Konfirmasi** - Prioritas: SHOULD. - User dapat
melihat berat final dan mengajukan keberatan dalam periode yang
ditentukan. - Keberatan tidak otomatis mengubah berat atau poin.

### 7.7 WastePoints dan ledger

**FR-POINT-001 --- Aturan reward** - Prioritas: MUST. - Sistem menyimpan
aturan reward berdasarkan kategori/subkategori, satuan, tarif, kualitas,
tanggal berlaku, sumber pendanaan, dan status aktif. - Aturan baru tidak
boleh mengubah transaksi lama secara diam-diam.

**FR-POINT-002 --- Kalkulasi** - Prioritas: MUST. - Reward dihitung dari
berat bersih tervalidasi, aturan aktif pada saat transaksi, faktor
kualitas jika berlaku, dan batas program. - Pembulatan dilakukan dengan
aturan konsisten. - Nilai kalkulasi dan versi aturan disimpan.

**FR-POINT-003 --- Penerbitan poin** - Prioritas: MUST. - Poin hanya
diterbitkan setelah status dan syarat verifikasi terpenuhi. - Penerbitan
harus idempotent: pengulangan request tidak menghasilkan poin ganda. -
Sistem menyimpan referensi transaksi asal.

**FR-POINT-004 --- Ledger** - Prioritas: MUST. - Setiap penambahan,
pengurangan, penyesuaian, kedaluwarsa, atau penukaran poin dicatat
sebagai transaksi. - Saldo merupakan hasil agregasi ledger atau
mekanisme konsisten yang dapat direkonsiliasi. - Catatan ledger tidak
dihapus untuk mengoreksi kesalahan.

**FR-POINT-005 --- Penukaran** - Prioritas: SHOULD. - Sistem dapat
menyediakan katalog voucher/manfaat. - Penukaran memeriksa saldo, batas,
masa berlaku, dan ketersediaan. - Poin dikunci/didebit secara atomik
agar tidak terjadi penggunaan ganda. - Jika penukaran gagal, saldo
dipulihkan secara konsisten.

**FR-POINT-006 --- Penangguhan reward** - Prioritas: MUST. - Admin dapat
menonaktifkan aturan baru untuk kategori/program. - Sistem tidak boleh
menghapus reward yang telah sah diterbitkan. - Dampak terhadap setoran
yang sedang berjalan harus mengikuti kebijakan yang diumumkan dan
tercatat.

### 7.8 Batch dan marketplace

**FR-MKT-001 --- Batch material** - Prioritas: MUST. - Material
tervalidasi dapat dimasukkan ke batch dengan kategori, berat, kualitas,
lokasi penyimpanan, dan status. - Sistem menjaga hubungan batch dengan
laporan/setoran asal. - Berat batch harus direkonsiliasi dengan material
masuk, penyesuaian, dan material keluar.

**FR-MKT-002 --- Kebutuhan buyer** - Prioritas: SHOULD. - Buyer
terverifikasi dapat mencatat jenis material, spesifikasi, rentang berat,
lokasi, periode, dan syarat penerimaan. - Kebutuhan tidak otomatis
berarti kontrak pembelian telah terjadi.

**FR-MKT-003 --- Pencocokan** - Prioritas: SHOULD. - Sistem dapat
mencocokkan batch dengan kebutuhan berdasarkan kategori, kualitas,
kuantitas, lokasi, dan waktu. - Rekomendasi sistem harus dapat ditinjau
manusia.

**FR-MKT-004 --- Distribusi** - Prioritas: MUST. - Admin/petugas
berwenang mencatat batch keluar, penerima, tanggal, berat kirim, dan
bukti. - Status distribusi dibedakan: disiapkan, dikirim, diterima,
ditolak sebagian, selesai, atau dibatalkan. - Sistem tidak menyamakan
"dikirim" dengan "diterima" atau "diolah".

**FR-MKT-005 --- Bukti penerimaan** - Prioritas: SHOULD. -
Buyer/pengolah dapat mengonfirmasi berat dan kondisi yang diterima. -
Selisih berat/kualitas harus dapat dicatat dan ditinjau.

### 7.9 Pengelolaan organik

**FR-ORG-001 --- Jalur organik** - Prioritas: MUST jika kategori organik
dibuka. - Sistem memisahkan organik basah dari material kering dan
limbah khusus. - Jenis organik dapat mencakup sisa sayuran/buah, sisa
makanan matang, dan daun/tanaman sesuai kemampuan mitra.

**FR-ORG-002 --- Jadwal** - Prioritas: MUST jika layanan organik
aktif. - Slot dan frekuensi penjemputan mengikuti kapasitas nyata mitra
dan wilayah. - Sistem tidak menjadwalkan setoran ke pengolah yang tidak
memiliki kapasitas/slot yang disetujui.

**FR-ORG-003 --- Kontaminasi** - Prioritas: MUST. - Petugas mencatat
kontaminasi yang terlihat. - Setoran yang tidak sesuai dapat ditolak,
dipisahkan, atau dialihkan hanya jika prosedur dan fasilitas
mendukung. - Sistem tidak mendorong petugas menyortir bahan berbahaya
secara manual.

**FR-ORG-004 --- Hasil pengolahan** - Prioritas: SHOULD. - Mitra dapat
melaporkan jumlah material diterima dan hasil proses bila pengukuran
tersedia. - Klaim kompos, maggot, atau produk akhir hanya boleh dicatat
berdasarkan konfirmasi mitra.

### 7.10 Residu dan limbah khusus

**FR-SAFE-001 --- Residu** - Prioritas: MUST. - Residu memiliki jalur
pengangkutan terpisah dari material yang akan didaur ulang. - Poin
material tidak diberikan secara default. - Ketersediaan layanan
bergantung pada jalur penerimaan yang disetujui.

**FR-SAFE-002 --- Limbah khusus** - Prioritas: MUST. - Kategori limbah
khusus menampilkan petunjuk dan jalur yang sesuai. - Sistem tidak
mengarahkan limbah berbahaya ke petugas sampah umum tanpa kewenangan dan
prosedur yang sesuai. - Jika jalur yang sesuai belum tersedia, sistem
memberi informasi bahwa layanan belum tersedia dan tidak membuat jadwal
penjemputan biasa.

**FR-SAFE-003 --- Laporan kondisi tidak aman** - Prioritas: MUST. -
Petugas dapat menghentikan atau menolak penanganan dan menandai alasan
keselamatan. - Admin mendapat notifikasi untuk meninjau kasus.

### 7.11 Notifikasi

**FR-NOTIF-001 --- Event notifikasi** - Prioritas: MUST untuk in-app. -
Event minimum: permintaan dibuat, tugas diterima, status berubah,
penjemputan selesai, berat diverifikasi, poin diterbitkan, distribusi
diperbarui, keberatan ditanggapi, dan role disetujui/ditolak.

**FR-NOTIF-002 --- Preferensi** - Prioritas: COULD. - Pengguna dapat
mengatur kanal/prefensi jika kanal tambahan tersedia.

**FR-NOTIF-003 --- Keandalan** - Prioritas: SHOULD. - Kegagalan
pengiriman notifikasi tidak boleh membatalkan transaksi inti. - Status
tetap dapat dilihat dari aplikasi.

### 7.12 Admin dan laporan

**FR-ADMIN-001 --- Verifikasi** - Prioritas: MUST. - Admin dapat
meninjau pengajuan role dan mitra. - Keputusan disertai status, aktor,
waktu, dan alasan.

**FR-ADMIN-002 --- Konfigurasi kategori** - Prioritas: MUST. - Admin
dapat mengaktifkan/nonaktifkan kategori, mengubah panduan, dan
menetapkan jalur yang tersedia. - Perubahan tidak mengubah arti
transaksi historis.

**FR-ADMIN-003 --- Konfigurasi reward** - Prioritas: MUST. - Admin
berwenang mengatur aturan reward dengan periode berlaku dan sumber
pendanaan. - Sistem mencatat perubahan konfigurasi dan versi aturan.

**FR-ADMIN-004 --- Pengelolaan mitra** - Prioritas: MUST. - Admin dapat
mengelola profil, jenis layanan, wilayah, kapasitas, kategori yang
diterima, dan status verifikasi mitra.

**FR-ADMIN-005 --- Dashboard** - Prioritas: MUST. - Dashboard
menampilkan jumlah laporan, status penjemputan, berat tervalidasi per
kategori, poin diterbitkan/ditukar, batch material, dan distribusi. -
Metrik harus memiliki definisi dan rentang waktu yang jelas.

**FR-ADMIN-006 --- Ekspor** - Prioritas: SHOULD. - Admin dapat
mengekspor data agregat dalam CSV jika diizinkan. - Ekspor yang berisi
data pribadi dibatasi dan diaudit.

------------------------------------------------------------------------

## 8. Kebutuhan Pengelolaan Sampah

### 8.1 Model kategori

Kategori utama yang didukung:

  -------------------------------------------------------------------------------
  Kategori          Contoh            Jalur umum            Reward default
  ----------------- ----------------- --------------------- ---------------------
  Organik basah     Sisa sayur, kulit Kompos, BSF, pengolah Poin
                    buah, sisa        organik yang sesuai   program/partisipasi
                    makanan                                 jika didanai

  Anorganik         Kaleng, botol     Bank sampah,          Berdasarkan
  bernilai          PET, kardus,      pengepul, industri,   berat/kualitas dan
                    kertas, logam     pengerajin            aturan
                    tertentu                                

  Residu            Popok, tisu       Jalur residu yang     Tidak ada reward
                    kotor, kemasan    disetujui             material secara
                    tertentu yang                           default
                    tidak diterima                          

  Limbah khusus     Baterai, lampu    Fasilitas/pengelola   Program khusus jika
                    tertentu, limbah  sesuai jenis          tersedia
                    elektronik, bahan                       
                    kimia                                   
  -------------------------------------------------------------------------------

Kategori tersebut tidak berarti semua contoh selalu masuk kategori yang
sama dalam setiap wilayah. Panduan final harus mengikuti spesifikasi
mitra dan ketentuan yang berlaku.

### 8.2 Data minimum setoran

-   ID setoran.
-   ID warga.
-   Kategori dan subkategori.
-   Estimasi berat/volume dari warga jika tersedia.
-   Foto dan catatan kondisi jika diperlukan.
-   Koordinat atau alamat penjemputan.
-   Slot waktu.
-   Status.
-   Tanggal dibuat dan diperbarui.
-   Petugas terkait.
-   Hasil verifikasi berat/kualitas.
-   Alasan penolakan atau kendala.
-   Referensi reward jika ada.
-   Referensi batch jika material dikonsolidasikan.

### 8.3 Penanganan sampah organik

-   Organik memiliki slot dan frekuensi yang ditentukan pengelola.
-   Sampah organik tidak boleh otomatis digabung dengan material kering.
-   Wadah tertutup dan petunjuk persiapan dapat dianjurkan sesuai SOP
    mitra.
-   Sistem mencatat jenis organik dan kontaminasi.
-   Mitra harus menyatakan kategori yang diterima dan kapasitasnya.
-   Jika kapasitas penuh, sistem tidak menawarkan slot baru yang tidak
    tersedia.
-   Pengiriman ke pengolah harus dicatat dengan berat dan bukti
    penerimaan.
-   Data hasil pengolahan hanya dicatat jika dilaporkan oleh mitra.
-   Tidak ada klaim bahwa semua organik pasti menjadi kompos atau pakan;
    hasil bergantung pada proses mitra.

### 8.4 Penanganan material daur ulang

-   Material dipisahkan menurut spesifikasi pembeli.
-   Sistem dapat mencatat kondisi bersih/kering, tercampur, atau perlu
    sortir.
-   Berat bersih digunakan untuk kalkulasi reward jika aturan
    menetapkannya.
-   Material dapat ditahan dalam batch sampai memenuhi volume minimum.
-   Sistem tidak menganggap harga tetap; nilai dapat berubah berdasarkan
    kesepakatan dan waktu.
-   Material yang tidak diterima buyer dapat dialihkan hanya ke mitra
    lain yang menerima kategori tersebut.

### 8.5 Status siklus setoran

Status yang disarankan: 1. `DRAFT` 2. `SUBMITTED` 3. `SCHEDULED` 4.
`AVAILABLE_FOR_ASSIGNMENT` 5. `ASSIGNED` 6. `ON_THE_WAY` (jika dipakai)
7. `COLLECTED` 8. `WEIGHING_PENDING` 9. `VERIFIED` 10. `REWARD_PENDING`
(opsional) 11. `COMPLETED` 12. `CANCELLED` 13. `REJECTED` 14.
`ISSUE_REPORTED`

Implementasi dapat menyederhanakan status untuk MVP, tetapi tidak boleh
mencampur status penjemputan dengan status pengolahan akhir.

------------------------------------------------------------------------

## 9. Kebutuhan WastePoints dan Reward

### 9.1 Tujuan reward

Reward dirancang untuk mendorong pemilahan dan partisipasi. Reward tidak
boleh menjadi janji keuntungan finansial yang tidak didukung sumber
pendanaan.

### 9.2 Komponen aturan reward

Setiap aturan minimal memuat: - ID aturan dan versi. -
Kategori/subkategori. - Satuan dasar. - Poin per satuan atau formula. -
Faktor kualitas yang diperbolehkan. - Berat minimum/maksimum jika
berlaku. - Batas reward per transaksi/hari/program. - Tanggal mulai dan
akhir. - Status aktif. - Sumber pendanaan atau program sponsor. -
Keterangan aturan yang dapat dilihat pengguna. - Pembuat dan penyetuju
jika diperlukan.

### 9.3 Formula konseptual

Contoh formula berbasis material:

`nilai_reward = berat_bersih × tarif_reward_per_kg × faktor_kualitas`

`poin = pembulatan_sesuai_kebijakan(nilai_reward / nilai_tukar_poin)`

Jika reward langsung ditetapkan sebagai poin per kilogram:

`poin = berat_bersih_kg × poin_per_kg × faktor_kualitas`

Satu formula harus dipilih dan diterapkan konsisten pada satu program.
Jangan menggabungkan formula nilai rupiah dan formula poin tanpa
menjelaskan hubungan keduanya.

### 9.4 Status reward

-   `NOT_ELIGIBLE`: kategori/transaksi tidak memenuhi syarat.
-   `PENDING_VERIFICATION`: belum ada hasil timbang/verifikasi final.
-   `APPROVED`: memenuhi aturan dan siap diterbitkan.
-   `ISSUED`: transaksi poin sudah tercatat pada ledger.
-   `ON_HOLD`: ditahan untuk pemeriksaan.
-   `REVERSED`: dikoreksi melalui transaksi kompensasi dengan alasan.
-   `REDEEMED`: poin telah digunakan melalui transaksi penukaran; status
    ini sebaiknya melekat pada transaksi penukaran, bukan menghapus
    transaksi penerbitan.

### 9.5 Sumber reward

-   Margin penjualan material.
-   Sponsor atau CSR.
-   Anggaran program komunitas.
-   Pendapatan layanan B2B yang dialokasikan untuk program.
-   Subsidi merchant dalam bentuk voucher.
-   Program khusus yang disetujui pengelola.

Sistem harus memungkinkan reward program disuspensi untuk setoran baru
jika pendanaan tidak tersedia, dengan komunikasi yang jelas dan tanpa
menghapus poin sah yang sudah diterbitkan.

### 9.6 Aturan ledger

-   Ledger bersifat append-only secara logis.
-   Tidak mengedit saldo secara langsung tanpa transaksi.
-   Setiap transaksi memiliki ID unik dan idempotency key jika dibuat
    melalui API.
-   Setiap transaksi merujuk pada setoran, aturan, dan aktor yang
    relevan.
-   Koreksi dilakukan dengan transaksi kompensasi.
-   Saldo tidak boleh negatif kecuali produk secara eksplisit mendukung
    mekanisme utang---yang tidak direkomendasikan untuk MVP.
-   Penukaran harus atomic agar dua permintaan bersamaan tidak
    menggunakan saldo yang sama.
-   Ekspor ledger dibatasi berdasarkan izin.

### 9.7 Penukaran poin

MVP dapat menyediakan: - Voucher merchant. - Manfaat program
komunitas. - Hadiah atau benefit yang didanai sponsor. - Reward
non-tunai lain yang syaratnya jelas.

Pencairan tunai tidak termasuk MVP default. Jika ditambahkan di masa
depan, perlu peninjauan regulasi, pajak, akuntansi, KYC/AML jika
relevan, perlindungan konsumen, dan penyedia pembayaran yang sesuai.

------------------------------------------------------------------------

## 10. Kebutuhan Circular Marketplace

### 10.1 Tujuan

Marketplace menghubungkan batch material yang tersedia dengan pihak yang
benar-benar menerima atau membutuhkan material tersebut. Sistem membantu
pencocokan, tetapi kontrak, harga, dan penerimaan harus tetap
dikonfirmasi oleh pihak terkait.

### 10.2 Profil mitra

Data minimum: - Nama usaha/organisasi. - Jenis mitra. - Kontak
operasional. - Area layanan. - Kategori yang diterima. - Spesifikasi
kualitas. - Kuantitas minimum/maksimum jika diketahui. - Kapasitas dan
jadwal penerimaan. - Status verifikasi. - Dokumen/izin yang diperlukan
sesuai jenis kegiatan. - Catatan kesepakatan dan tanggal validasi.

### 10.3 Batch material

Data minimum: - ID batch. - Kategori/subkategori. - Berat awal dan berat
tersedia. - Status kualitas. - Daftar setoran asal. - Lokasi
penyimpanan. - Tanggal dibuat. - Status batch. - Harga/penawaran jika
tersedia. - Mitra tujuan jika sudah ditetapkan. - Riwayat perpindahan
dan distribusi.

### 10.4 Status batch

-   `OPEN`: menerima material tambahan.
-   `READY`: memenuhi persyaratan untuk ditawarkan.
-   `RESERVED`: dialokasikan untuk mitra.
-   `DISPATCHED`: telah dikirim.
-   `PARTIALLY_RECEIVED`: diterima sebagian.
-   `RECEIVED`: diterima oleh mitra.
-   `PROCESSED`: mitra mengonfirmasi telah diproses.
-   `REJECTED`: ditolak dengan alasan.
-   `CLOSED`: transaksi/batch selesai.
-   `CANCELLED`: dibatalkan sesuai proses.

`PROCESSED` hanya boleh digunakan jika mitra memberikan konfirmasi yang
dapat dicatat. Jangan menyimpulkan proses akhir hanya dari status
`RECEIVED`.

### 10.5 Pencocokan

Kriteria pencocokan dapat meliputi: - Jenis material. -
Spesifikasi/kualitas. - Berat tersedia. - Jarak atau area. - Jadwal
pengiriman. - Kapasitas penerimaan. - Harga atau kesepakatan. - Status
dan verifikasi mitra.

Sistem dapat memberi skor rekomendasi, tetapi hasilnya harus dapat
dijelaskan dan tidak boleh otomatis membuat transaksi yang mengikat.

### 10.6 Rekonsiliasi berat

Berat batch dapat berubah karena sortir, pengeringan, kontaminasi, atau
selisih timbang. Karena itu: - Catat berat masuk. - Catat penyesuaian
beserta alasan. - Catat berat yang dikirim. - Catat berat yang
diterima. - Catat selisih dan status penyelesaiannya. - Jangan menimpa
berat lama tanpa audit. - Jika satu batch dibagi untuk beberapa buyer,
pastikan total alokasi tidak melebihi berat tersedia.

------------------------------------------------------------------------

## 11. Kebutuhan Pendanaan dan Keuangan Operasional

### 11.1 Sumber pendanaan yang didukung secara konseptual

-   Penjualan material daur ulang.
-   Kontrak pengelolaan sampah untuk bisnis.
-   Sponsor/CSR/ESG.
-   Program komunitas atau pemerintah yang sah dan tersedia.
-   Subsidi voucher dari merchant.
-   Hibah atau pendanaan inkubasi yang sesuai.

Ketersediaan sumber tersebut bukan asumsi pendapatan yang sudah
terjamin. Setiap sumber memerlukan mitra, kesepakatan, dan bukti
transaksi.

### 11.2 Pemisahan keuangan

Sistem harus membedakan: - Nilai penjualan material. - Biaya
pengumpulan/transportasi. - Biaya sortir dan penyimpanan. - Biaya
operasional platform. - Dana reward yang dialokasikan. - Poin yang
diterbitkan. - Voucher yang disponsori. - Pembayaran dari pelanggan
B2B. - Dana sponsor yang diterima dan digunakan. - Margin atau
surplus/defisit operasional.

Poin yang belum ditukar tidak boleh secara otomatis diperlakukan sama
dengan uang tunai. Akuntansi final harus ditentukan bersama pihak yang
kompeten.

### 11.3 Pengendalian anggaran reward

-   Setiap program reward memiliki sumber dana dan batas anggaran.
-   Sistem menyimpan total alokasi, penggunaan, dan sisa anggaran.
-   Penerbitan reward memeriksa status program dan aturan.
-   Jika anggaran habis, sistem mengikuti kebijakan program:
    menghentikan reward baru, mengubah aturan untuk periode berikutnya,
    atau menggunakan dana cadangan yang telah disetujui.
-   Perubahan tidak boleh berlaku surut tanpa mekanisme koreksi yang
    transparan dan sah.
-   Admin tidak boleh menghapus ledger untuk menyeimbangkan laporan.

### 11.4 Rekonsiliasi material dan reward

Pengelola perlu dapat membandingkan: - Berat material yang
dikumpulkan. - Berat yang masuk batch. - Berat yang dikirim. - Berat
yang diterima mitra. - Nilai jual yang disepakati. - Reward yang
diterbitkan. - Biaya yang dicatat. - Pendanaan sponsor atau B2B yang
terkait.

Selisih tidak selalu berarti fraud; dapat terjadi karena kelembapan,
sortir, wadah, atau perbedaan timbangan. Sistem harus menyediakan status
peninjauan.

### 11.5 Contoh simulasi keuangan

Contoh nilai penjualan Rp1.000.000 dapat dialokasikan ke reward warga,
transportasi, sortir, platform, cadangan, dan margin. Persentase seperti
30% reward atau 10% margin hanya boleh digunakan sebagai contoh simulasi
sampai ada data biaya dan harga mitra yang nyata.

### 11.6 Kontrol finance

-   Akses finance terpisah dari akses petugas lapangan.
-   Penyesuaian transaksi keuangan harus mempunyai alasan.
-   Transaksi bernilai besar dapat memerlukan persetujuan kedua.
-   Laporan sponsor harus mengungkap metrik yang benar-benar diukur.
-   Tidak boleh menyatakan dampak lingkungan atau volume daur ulang yang
    belum didukung bukti.

------------------------------------------------------------------------

## 12. Kebutuhan Dashboard dan Pelaporan

### 12.1 Dashboard User

Harus menampilkan: - Ringkasan setoran aktif. - Status penjemputan. -
Riwayat setoran. - Berat final. - Poin tertunda, diterbitkan, dan
ditukar. - Panduan pemilahan. - Notifikasi. - Status keberatan jika ada.

### 12.2 Dashboard Collector

Harus menampilkan: - Tugas tersedia. - Tugas aktif. - Jadwal dan
lokasi. - Kategori dan perkiraan volume. - Catatan keselamatan. -
Formulir berat dan kualitas. - Upload bukti. - Tugas selesai dan
kendala. - Statistik pribadi yang relevan.

### 12.3 Dashboard Admin

Harus menampilkan: - Pengajuan role/mitra yang menunggu. - Jumlah
laporan berdasarkan status. - Tugas aktif dan terlambat. - Berat
tervalidasi per kategori dan periode. - Tingkat kontaminasi jika data
tersedia. - Reward diterbitkan dan ditukar. - Batch terbuka, terkirim,
diterima, dan bermasalah. - Mitra aktif dan kapasitas yang tercatat. -
Keluhan/keberatan. - Aktivitas audit kritis.

### 12.4 Dashboard Buyer/Processor

Harus menampilkan: - Profil dan status verifikasi. - Kebutuhan
material. - Batch yang cocok. - Penawaran/permintaan yang masih
berjalan. - Pengiriman yang diharapkan. - Konfirmasi penerimaan. -
Riwayat transaksi yang melibatkan mitra tersebut.

### 12.5 Dashboard sponsor

Jika disediakan: - Menampilkan metrik agregat program. - Memisahkan
target dari realisasi. - Menampilkan periode pelaporan dan definisi
metrik. - Tidak menampilkan nama, alamat, nomor telepon, foto, atau
identitas warga kecuali terdapat dasar dan persetujuan yang sesuai. -
Metrik seperti "sampah didaur ulang" hanya digunakan jika bukti proses
akhir tersedia; selain itu gunakan istilah yang akurat seperti "material
terkumpul" atau "material diterima mitra".

### 12.6 Definisi metrik

-   **Jumlah laporan:** jumlah laporan dibuat dalam periode, dengan
    aturan untuk laporan batal/duplikat.
-   **Berat terkumpul:** berat bersih yang diverifikasi setelah
    pengambilan.
-   **Berat tersalurkan:** berat batch yang dikirim atau diterima,
    dengan label status yang tepat.
-   **Tingkat penyelesaian:** tugas selesai dibagi tugas yang memenuhi
    definisi cohort dan periode.
-   **Waktu penjemputan:** selisih timestamp antara titik awal dan titik
    akhir yang ditetapkan.
-   **Reward diterbitkan:** jumlah poin yang masuk ledger dalam periode.
-   **Tingkat kontaminasi:** hanya dihitung jika metode pengukuran dan
    penyebutnya jelas.
-   **Pendapatan material:** transaksi penjualan yang telah dicatat
    sesuai status pembayaran, bukan sekadar penawaran.

------------------------------------------------------------------------

## 13. Kebutuhan Nonfungsional

### 13.1 Keamanan

-   Autentikasi dan otorisasi backend wajib.
-   Kata sandi harus di-hash dengan algoritma yang sesuai.
-   Endpoint terlindungi harus menolak akses anonim.
-   File upload dibatasi tipe, ukuran, dan akses.
-   Rahasia tidak boleh disimpan di repository atau dikirim ke client.
-   Input divalidasi di server.
-   Proteksi terhadap injection, broken access control, CSRF/XSS sesuai
    pola arsitektur, dan penyalahgunaan endpoint diterapkan.
-   Tindakan sensitif dicatat di audit log.
-   Rate limiting diterapkan pada endpoint berisiko jika infrastruktur
    mendukung.
-   Data produksi tidak boleh dicampur dengan data demo tanpa penanda.

### 13.2 Privasi

-   Kumpulkan data minimum yang diperlukan.
-   Jelaskan tujuan penggunaan lokasi dan foto.
-   Lokasi rumah warga tidak boleh tampil pada peta publik secara
    default.
-   Data kontak hanya dibuka kepada petugas yang ditugaskan dan selama
    diperlukan.
-   Foto bukti hanya tersedia bagi pihak berwenang.
-   Kebijakan retensi dan penghapusan harus ditentukan.
-   Permintaan akses/perbaikan/penghapusan data ditangani sesuai
    kebijakan dan ketentuan yang berlaku.
-   Akses sponsor menggunakan data agregat.
-   Data demo harus sintetis atau digunakan dengan izin yang sesuai.

### 13.3 Kinerja

Target awal untuk diuji, bukan jaminan: - Halaman umum dan dashboard
dasar memiliki waktu respons yang layak pada jaringan seluler umum. -
Endpoint baca sederhana menargetkan p95 di bawah 1 detik pada beban demo
yang disepakati, di luar waktu layanan pihak ketiga. - Operasi tulis
kritis memberi hasil sukses/gagal yang jelas. - Upload foto menampilkan
progres atau status jika proses membutuhkan waktu. - Peta dan gambar
tidak boleh memblokir akses ke status utama. - Pagination digunakan
untuk daftar yang berpotensi panjang.

### 13.4 Ketersediaan dan pemulihan

-   Sistem harus menampilkan status terakhir yang berhasil disimpan jika
    layanan tambahan gagal.
-   Kegagalan notifikasi tidak boleh membatalkan pencatatan transaksi.
-   Database memiliki backup sesuai kemampuan deployment.
-   Prosedur restore diuji sebelum pilot yang menggunakan data nyata.
-   Error kritis dicatat dan dapat ditelusuri.
-   RTO/RPO formal belum ditetapkan untuk MVP dan harus disepakati
    sebelum produksi.

### 13.5 Skalabilitas

-   Struktur data tidak mengasumsikan hanya satu petugas atau satu
    kategori.
-   Wilayah, mitra, jadwal, dan aturan reward dapat diperluas.
-   Pencarian lokasi harus menggunakan indeks yang sesuai jika volume
    data meningkat.
-   Pengolahan foto/AI tidak boleh menghambat transaksi inti.
-   Batch dan ledger harus mempertahankan konsistensi saat transaksi
    bersamaan.

### 13.6 Maintainability

-   Kode dibagi berdasarkan domain.
-   API dan model data didokumentasikan.
-   Aturan bisnis tidak ditanamkan berulang di banyak komponen UI.
-   Konfigurasi reward dan kategori dapat dikelola tanpa deployment baru
    bila aman.
-   Migrasi database terversi.
-   Log tidak memuat password, token, atau data sensitif berlebihan.
-   Komponen UI menggunakan pola konsisten.

### 13.7 Aksesibilitas dan kompatibilitas

-   UI responsif pada ponsel dan desktop.
-   Form dapat digunakan dengan keyboard.
-   Status tidak dibedakan hanya dengan warna.
-   Kontras teks memadai.
-   Error ditautkan ke field terkait.
-   Bahasa awal adalah Bahasa Indonesia.
-   Format angka menggunakan format lokal Indonesia saat ditampilkan.
-   Sistem mempertimbangkan koneksi yang tidak stabil dan perangkat
    kelas menengah.

------------------------------------------------------------------------

## 14. Kebutuhan Data dan Integrasi

### 14.1 Entitas data inti

Entitas yang disarankan: - `users` - `user_roles` -
`role_applications` - `waste_categories` - `service_areas` -
`collection_slots` - `waste_reports` - `pickup_requests` -
`pickup_status_events` - `pickup_evidence` - `weighing_records` -
`quality_inspections` - `reward_rules` - `reward_programs` -
`points_ledger` - `redemption_catalog` - `redemption_transactions` -
`partners` - `partner_material_requirements` - `material_batches` -
`batch_items` - `batch_movements` - `delivery_records` -
`notifications` - `funding_sources` - `operational_costs` - `audit_logs`

Untuk MVP, sebagian entitas dapat digabung jika tidak mengorbankan
integritas data, audit, atau pemisahan tanggung jawab.

### 14.2 Prinsip relasi

-   Satu user dapat memiliki banyak role.
-   Satu user dapat membuat banyak laporan.
-   Satu laporan dapat memiliki riwayat status dan bukti.
-   Satu penjemputan terkait dengan satu laporan atau satu unit kerja
    yang didefinisikan dengan jelas.
-   Satu penjemputan dapat mempunyai catatan timbang dan inspeksi sesuai
    kebutuhan.
-   Satu penerbitan poin harus merujuk pada sumber yang sah.
-   Satu batch dapat mengandung material dari banyak setoran.
-   Satu batch dapat memiliki beberapa pergerakan atau pengiriman.
-   Satu mitra dapat memiliki banyak kebutuhan material.
-   Semua tindakan kritis dapat dirujuk ke aktor dan waktu.

### 14.3 Integritas data

-   Gunakan primary key unik.
-   Foreign key harus diterapkan untuk relasi penting.
-   Nilai berat dan poin tidak boleh menggunakan tipe floating point
    yang rawan error pembulatan untuk ledger.
-   Timestamp harus konsisten dan ditampilkan dalam WITA.
-   Status memakai enum atau tabel referensi yang terkendali.
-   Constraint mencegah berat negatif, saldo yang tidak sah, dan alokasi
    batch melebihi stok tersedia.
-   Perubahan kategori/aturan harus mempertahankan snapshot yang
    diperlukan pada transaksi lama.

### 14.4 Penyimpanan file

-   File memiliki ID dan metadata.
-   URL storage tidak boleh menjadi satu-satunya kontrol akses.
-   Gunakan URL bertanda tangan atau proxy yang memeriksa otorisasi jika
    diperlukan.
-   Validasi ukuran dan format.
-   Nama file tidak dipercaya sebagai nama path.
-   Foto yang dipublikasikan harus melalui kebijakan privasi dan
    moderasi yang sesuai.
-   Kebijakan retensi file ditentukan oleh jenis bukti dan kebutuhan
    operasional.

### 14.5 Integrasi eksternal

Integrasi potensial: - Peta/geocoding. - Email atau push notification. -
Object storage. - Merchant voucher. - Pembayaran di masa depan. - Data
cuaca atau informasi kebencanaan jika relevan dan sumbernya resmi. -
Sistem mitra melalui API jika benar-benar tersedia.

Semua integrasi harus: - Memiliki pemilik dan tujuan. - Memeriksa syarat
penggunaan, kuota, privasi, dan biaya. - Memiliki fallback. - Tidak
mengklaim keberhasilan jika respons provider gagal. - Menyimpan status
dan ID transaksi provider jika diperlukan.

------------------------------------------------------------------------

## 15. Keamanan, Privasi, dan Audit

### 15.1 Ancaman utama

-   Pengguna memanipulasi role di client.
-   Petugas menerima tugas ganda.
-   Pengguna mengirim laporan palsu atau duplikat.
-   Berat dimanipulasi untuk memperoleh poin.
-   Poin diterbitkan dua kali akibat retry.
-   Poin ditukar dua kali secara bersamaan.
-   Foto berisi informasi pribadi yang tidak perlu.
-   Buyer palsu meminta material.
-   Admin mengubah tarif tanpa jejak.
-   Batch tercatat terkirim padahal belum diterima.
-   Data sponsor mengungkap identitas warga.
-   Upload file berbahaya atau terlalu besar.
-   API disalahgunakan melalui spam.

### 15.2 Kontrol mitigasi

-   Otorisasi backend berdasarkan role dan status.
-   Transaksi database/locking untuk klaim tugas, ledger, dan alokasi
    batch.
-   Idempotency key pada operasi yang berpotensi diulang.
-   Batas frekuensi dan validasi laporan.
-   Verifikasi petugas dan mitra.
-   Audit log append-only secara logis.
-   Pemisahan tugas admin/finance bila relevan.
-   Bukti timbang dan riwayat koreksi.
-   Konfirmasi buyer untuk penerimaan batch.
-   Signed URL atau kontrol akses file.
-   Redaksi data pribadi pada laporan.
-   Prosedur pelaporan insiden dan pembekuan akun bila dibutuhkan.

### 15.3 Audit log

Minimal mencatat: - Pengajuan, persetujuan, penolakan, penangguhan, dan
pencabutan role. - Perubahan kategori dan panduan. - Perubahan
tarif/aturan reward. - Pencatatan dan koreksi berat. - Penerbitan,
pembalikan, dan penukaran poin. - Perubahan status tugas yang kritis. -
Perubahan batch dan berat. - Pengiriman dan konfirmasi penerimaan. -
Ekspor data sensitif. - Tindakan admin pada akun atau transaksi.

Setiap event memuat aktor, tindakan, objek, timestamp, alasan jika
relevan, serta ringkasan perubahan yang tidak memuat rahasia.

### 15.4 Respons insiden

-   Sediakan cara melaporkan masalah.
-   Admin dapat menangguhkan akses jika ada indikasi penyalahgunaan.
-   Transaksi yang dicurigai dapat ditahan untuk peninjauan tanpa
    menghapus bukti.
-   Kesalahan reward diperbaiki dengan proses koreksi yang tercatat.
-   Data dan kredensial yang bocor harus ditangani melalui prosedur
    insiden.
-   Komunikasi kepada pengguna dilakukan sesuai dampak dan kewajiban
    yang berlaku.

------------------------------------------------------------------------

## 16. Kebutuhan UX/UI dan Aksesibilitas

### 16.1 Navigasi berdasarkan role

**User** - Beranda. - Buat Setoran. - Setoran Saya. - Poin dan Reward. -
Panduan Pemilahan. - Notifikasi. - Profil dan Switch Role.

**Collector** - Dashboard. - Tugas Tersedia. - Tugas Saya. - Timbang dan
Verifikasi. - Riwayat. - Profil dan Switch Role.

**Admin** - Overview. - Pengguna dan Role. - Laporan/Setoran. - Tugas
dan Petugas. - Kategori dan Jalur Pengolahan. - Reward dan Program. -
Batch dan Distribusi. - Mitra. - Pendanaan dan Laporan. - Audit Log.

**Buyer/Processor** - Dashboard Mitra. - Kebutuhan Material. - Batch
yang Ditawarkan. - Pengiriman. - Konfirmasi Penerimaan. - Riwayat.

### 16.2 Prinsip formulir setoran

-   Gunakan langkah bertahap: kategori → detail → lokasi/jadwal →
    ringkasan → kirim.
-   Tampilkan contoh visual untuk kategori yang mudah tertukar.
-   Pertanyaan lanjutan hanya muncul jika relevan dengan kategori.
-   Beri peringatan jika kategori belum memiliki layanan di wilayah
    tersebut.
-   Jelaskan foto yang dibutuhkan dan cara menghindari data pribadi yang
    tidak perlu.
-   Estimasi berat warga diberi label "perkiraan", bukan berat final.
-   Tampilkan ringkasan sebelum permintaan dikirim.
-   Sediakan penanganan error dan kemampuan mencoba kembali.

### 16.3 Prinsip dashboard petugas

-   Tugas aktif harus mudah dibedakan dari tugas tersedia.
-   Lokasi, jadwal, kategori, dan catatan keselamatan terlihat sebelum
    petugas menerima tugas.
-   Tombol status mengikuti urutan yang valid.
-   Form timbang menampilkan satuan dengan jelas.
-   Berat kotor, tara, dan bersih tidak membingungkan.
-   Petugas dapat menandai kendala tanpa harus memalsukan penyelesaian.
-   Upload bukti menampilkan status berhasil/gagal.
-   Mode jaringan buruk perlu dipertimbangkan; bila offline penuh belum
    didukung, tampilkan status koneksi dan jangan mengklaim data
    tersimpan.

### 16.4 Prinsip WastePoints

-   Pisahkan poin tersedia, tertunda, ditahan, dan telah ditukar.
-   Tampilkan alasan poin belum tersedia.
-   Tampilkan formula/ringkasan reward yang mudah dipahami.
-   Perubahan aturan diberi tanggal berlaku.
-   Penukaran menunjukkan jumlah poin, benefit, syarat, dan konfirmasi
    akhir.
-   Riwayat koreksi atau pembatalan harus dapat dipahami pengguna.

### 16.5 Prinsip status material

Gunakan istilah yang spesifik: - "Dilaporkan" - "Terjadwal" - "Petugas
menerima tugas" - "Sudah dijemput" - "Berat diverifikasi" - "Masuk
batch" - "Dikirim ke mitra" - "Diterima mitra" - "Diproses mitra" hanya
jika ada konfirmasi.

Jangan menggunakan satu status "Selesai didaur ulang" untuk seluruh
alur.

------------------------------------------------------------------------

## 17. Aturan Bisnis dan Validasi

### 17.1 Aturan setoran

-   Setoran hanya dapat dibuat oleh akun aktif.
-   Kategori harus aktif dan tersedia di wilayah layanan.
-   Jadwal harus berada pada slot yang tersedia.
-   Lokasi harus cukup untuk pelaksanaan layanan, tetapi tidak
    dipublikasikan terbuka.
-   Setoran yang sudah selesai tidak boleh diedit secara bebas.
-   Perubahan pasca-verifikasi harus melalui koreksi atau proses
    keberatan.
-   Setoran batal tidak boleh menghasilkan reward berbasis berat yang
    belum diverifikasi.

### 17.2 Aturan penugasan

-   Hanya Collector aktif yang dapat mengambil tugas.
-   Tugas tidak dapat dimiliki dua petugas sekaligus kecuali sistem
    mendukung tim multi-petugas secara eksplisit.
-   Petugas hanya melihat data pribadi yang dibutuhkan untuk tugas.
-   Status harus mengikuti transisi yang diizinkan.
-   Tugas yang tidak dapat diselesaikan harus memiliki alasan.
-   Pengalihan tugas harus tercatat.

### 17.3 Aturan timbang dan reward

-   Berat bersih tidak boleh negatif.
-   Berat nol tidak menghasilkan reward berbasis berat.
-   Kategori yang tidak eligible tidak menghasilkan reward material.
-   Aturan reward yang dipakai harus disimpan pada transaksi.
-   Retry API tidak boleh menggandakan ledger.
-   Koreksi berat setelah reward diterbitkan memerlukan transaksi
    penyesuaian.
-   Reward yang sedang ditinjau tidak boleh ditampilkan sebagai saldo
    tersedia.
-   Poin tidak boleh ditukar melebihi saldo yang dapat digunakan.

### 17.4 Aturan marketplace

-   Batch tidak boleh dialokasikan melebihi berat tersedia.
-   Buyer harus aktif dan diverifikasi sesuai kebijakan.
-   Spesifikasi buyer harus sesuai dengan kategori dan kualitas batch.
-   Status dikirim tidak sama dengan status diterima.
-   Selisih penerimaan dicatat dan diselesaikan.
-   Material yang ditolak tidak otomatis kembali ke stok tersedia tanpa
    proses inspeksi dan pencatatan.

### 17.5 Aturan limbah khusus

-   Limbah khusus tidak boleh diproses sebagai setoran biasa tanpa jalur
    yang sesuai.
-   Jika kategori tidak memiliki mitra/fasilitas yang tervalidasi,
    layanan penjemputan tidak tersedia.
-   Petugas dapat menolak penanganan yang tidak aman.
-   Sistem tidak memberikan instruksi berisiko yang mengharuskan warga
    membuka atau mencampur limbah.

### 17.6 Aturan audit

-   Aksi kritis harus mempunyai actor ID.
-   Aksi admin harus memiliki alasan bila mengubah data transaksi.
-   Catatan historis tidak boleh dihapus untuk menyembunyikan perubahan.
-   Ekspor harus mengikuti izin dan tujuan penggunaan.
-   Data demo tidak boleh ditampilkan sebagai data dampak aktual.

------------------------------------------------------------------------

## 18. Alur End-to-End

### 18.1 Alur A --- Setoran anorganik bernilai

1.  Warga memilih kategori anorganik.
2.  Warga memilih subkategori, misalnya kaleng aluminium.
3.  Sistem menampilkan persiapan dan standar mitra yang tersedia.
4.  Warga mengisi perkiraan jumlah, lokasi, dan slot.
5.  Sistem memvalidasi ketersediaan layanan.
6.  Permintaan dibuat dengan status awal.
7.  Petugas terverifikasi melihat tugas.
8.  Petugas mengambil tugas secara atomik.
9.  Petugas melakukan penjemputan.
10. Petugas mencatat berat kotor, tara, berat bersih, dan kualitas.
11. Sistem menghitung kelayakan reward menggunakan aturan yang berlaku.
12. Poin diterbitkan ke ledger jika syarat terpenuhi.
13. Material masuk ke batch yang sesuai.
14. Admin/operasional mengalokasikan batch ke buyer/pengepul/pengerajin.
15. Material dikirim dan penerimaan dicatat.
16. Dashboard membedakan berat terkumpul, dikirim, dan diterima.

### 18.2 Alur B --- Sampah organik basah

1.  Warga memilih organik.
2.  Sistem menampilkan subkategori yang diterima oleh mitra lokal.
3.  Warga memilih slot sesuai jadwal pengumpulan organik.
4.  Sistem memeriksa kapasitas mitra dan slot.
5.  Petugas mengambil setoran.
6.  Petugas memeriksa kontaminasi yang terlihat dan mencatat berat.
7.  Jika sesuai, setoran dialokasikan ke pengolah organik yang tersedia.
8.  Pengolah mengonfirmasi penerimaan.
9.  Reward partisipasi atau per kilogram diterapkan jika program dan
    anggaran aktif.
10. Hasil pengolahan hanya dicatat jika mitra mengonfirmasi.
11. Dashboard melaporkan berat terkumpul dan diterima pengolah secara
    terpisah.

### 18.3 Alur C --- Limbah khusus

1.  Warga memilih kategori limbah khusus.
2.  Sistem meminta subkategori.
3.  Sistem menampilkan panduan aman dan status ketersediaan jalur.
4.  Jika jalur tersedia, permintaan diarahkan ke mitra/layanan yang
    sesuai.
5.  Jika jalur tidak tersedia, sistem tidak membuat tugas penjemputan
    biasa.
6.  Jika ada risiko atau jenis tidak dikenal, pengguna diarahkan untuk
    menghubungi pengelola/fasilitas yang tepat.
7.  Semua status dan keputusan dicatat.

### 18.4 Alur D --- Koreksi reward

1.  User atau petugas mengajukan keberatan/menemukan kesalahan.
2.  Transaksi ditandai untuk ditinjau.
3.  Admin berwenang memeriksa bukti timbang dan aturan yang digunakan.
4.  Admin menyetujui atau menolak koreksi dengan alasan.
5.  Jika koreksi disetujui, sistem membuat transaksi kompensasi pada
    ledger.
6.  Saldo dan ringkasan diperbarui.
7.  User diberi notifikasi.
8.  Audit menyimpan nilai sebelum dan sesudah serta aktor.

### 18.5 Alur E --- Batch dikirim ke buyer

1.  Material terverifikasi dikumpulkan dalam batch.
2.  Sistem memastikan berat tersedia dan kategori sesuai.
3.  Buyer mengajukan kebutuhan atau menerima penawaran.
4.  Pengelola menyetujui alokasi.
5.  Berat yang dialokasikan dikunci dari alokasi ganda.
6.  Pengiriman dibuat dan bukti dikaitkan.
7.  Buyer mengonfirmasi jumlah dan kondisi.
8.  Selisih dicatat dan ditinjau.
9.  Status menjadi diterima atau diterima sebagian.
10. Status pengolahan akhir hanya diperbarui jika ada konfirmasi
    tambahan.

------------------------------------------------------------------------

## 19. Batasan, Dependensi, dan Risiko

### 19.1 Dependensi operasional

-   Ketersediaan petugas.
-   Ketersediaan jadwal dan kapasitas pengangkutan.
-   Ketersediaan pengolah organik.
-   Kesepakatan dengan pengepul/bank sampah/pengerajin.
-   Spesifikasi kualitas material.
-   Sumber pendanaan reward.
-   Timbangan dan SOP verifikasi.
-   Koneksi internet untuk penggunaan aplikasi.
-   Kebijakan privasi dan tata kelola data.
-   Ketentuan yang berlaku untuk pengangkutan dan pengolahan limbah.

### 19.2 Risiko produk

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Reward lebih besar dari Defisit dan hilangnya   Anggaran per program,
  dana tersedia           kepercayaan             tarif terkonfigurasi,
                                                  simulasi biaya

  Salah klasifikasi       Jalur pengolahan salah  Panduan visual,
  sampah                                          konfirmasi manusia,
                                                  verifikasi petugas

  Sampah organik menumpuk Bau, kontaminasi,       Slot berbasis
                          risiko kesehatan        kapasitas, jadwal
                                                  sesuai SOP, mitra
                                                  tervalidasi

  Petugas tidak datang    Pengalaman buruk        Status kendala,
                                                  eskalasi admin, metrik
                                                  penyelesaian

  Berat dimanipulasi      Reward salah            Bukti timbang, audit
                                                  koreksi, batas
                                                  kewajaran

  Poin ganda              Kerugian finansial      Idempotency, transaksi
                                                  database, ledger

  Buyer tidak menerima    Stok menumpuk           Verifikasi buyer,
  material                                        spesifikasi, konfirmasi
                                                  kapasitas

  Batch tidak terlacak    Klaim dampak tidak      ID batch, catatan
                          valid                   perpindahan, bukti
                                                  penerimaan

  Role disalahgunakan     Akses ilegal            Verifikasi role dan
                                                  otorisasi backend

  Data lokasi bocor       Risiko privasi          Akses minimum, kontrol
                                                  file, audit

  Ketergantungan API      Layanan terganggu       Fallback dan status
  pihak ketiga                                    terakhir

  Data demo disangka      Klaim menyesatkan       Label simulasi dan
  aktual                                          pemisahan environment
  -----------------------------------------------------------------------

### 19.3 Risiko AI

-   Dataset foto mungkin tidak mewakili semua kondisi lokal.
-   Model dapat salah mengklasifikasikan bahan yang tampak serupa.
-   Pencahayaan, kemasan, dan kontaminasi memengaruhi hasil.
-   Klasifikasi visual tidak dapat menjamin kandungan bahan atau status
    bahaya.
-   Hasil AI harus memiliki fallback manual.
-   Evaluasi model perlu mengukur precision/recall per kategori jika
    fitur AI diaktifkan.
-   Jangan mengklaim akurasi model tanpa hasil evaluasi pada data yang
    relevan.

### 19.4 Mitigasi lingkup hackathon

-   Prioritaskan alur end-to-end untuk satu kategori anorganik dan satu
    kategori organik jika mitra/pengolahan dapat disimulasikan.
-   Gunakan dataset sintetis untuk dashboard demo dan beri label.
-   Buat status dan transisi jelas sebelum menambah AI.
-   Gunakan simulasi integrasi bila layanan eksternal tidak tersedia.
-   Jangan membangun pembayaran tunai otomatis pada MVP.
-   Tampilkan data yang benar-benar tersedia; jangan membuat klaim
    real-time palsu.

------------------------------------------------------------------------

## 20. Prioritas Kebutuhan

### 20.1 MUST --- MVP inti

-   Registrasi/login.
-   Profil.
-   Role User.
-   Pengajuan dan verifikasi Collector.
-   Switch role yang aman.
-   Kategori dan panduan.
-   Laporan/setoran.
-   Penjadwalan.
-   Daftar tugas petugas.
-   Pengambilan tugas yang mencegah duplikasi.
-   Update status.
-   Bukti penjemputan.
-   Pencatatan berat dan kualitas.
-   Aturan reward dasar.
-   Ledger poin.
-   Riwayat transaksi.
-   Batch material dasar.
-   Pencatatan distribusi dan penerimaan.
-   Dashboard admin dasar.
-   Audit log tindakan kritis.
-   Kontrol akses data.

### 20.2 SHOULD --- setelah alur inti stabil

-   Penukaran voucher.
-   Keberatan terhadap berat/reward.
-   Profil buyer dan kebutuhan material.
-   Pencocokan batch.
-   Notifikasi lebih lengkap.
-   Ekspor laporan.
-   Penanganan kendala petugas.
-   Pengelolaan kapasitas pengolah.
-   Ringkasan anggaran reward.
-   Rekonsiliasi berat kirim/terima.

### 20.3 COULD --- nilai tambah

-   Klasifikasi foto berbasis AI.
-   Optimasi rute.
-   Peta kepadatan setoran.
-   Analisis tren dan prediksi volume.
-   Integrasi pesan eksternal.
-   QR code untuk batch atau bukti setoran.
-   Gamifikasi komunitas.
-   Dashboard sponsor agregat.
-   Estimasi dampak lingkungan dengan metodologi tervalidasi.

### 20.4 WON'T --- rilis MVP

-   Pembayaran tunai otomatis.
-   Dompet uang elektronik.
-   Blockchain.
-   Klaim sertifikasi karbon.
-   AI sebagai penentu final keamanan limbah.
-   Pelacakan GPS terus-menerus.
-   Operasi multiwilayah skala provinsi.
-   Kontrak jual beli otomatis tanpa persetujuan pihak.
-   Integrasi yang belum memiliki akses resmi atau dokumentasi.

------------------------------------------------------------------------

## 21. Kriteria Penerimaan Tingkat Sistem

### 21.1 Autentikasi dan role

-   Pengguna dapat registrasi dan login.
-   User dapat melihat dashboard sesuai role aktif.
-   User yang belum disetujui sebagai Collector tidak dapat mengambil
    tugas.
-   Perubahan role aktif tidak mengubah user ID.
-   Request yang memalsukan role di client tetap ditolak backend.
-   Perubahan status role tercatat.

### 21.2 Setoran dan tugas

-   User dapat membuat setoran dengan kategori, lokasi, dan jadwal yang
    valid.
-   Slot yang tidak tersedia tidak dapat dipilih.
-   Petugas aktif dapat melihat tugas yang memenuhi syarat.
-   Satu tugas hanya dapat diklaim satu petugas pada satu waktu.
-   Transisi status ilegal ditolak.
-   User dapat melihat status dan waktu pembaruan.
-   Bukti terhubung ke tugas dan tidak dapat diakses pengguna yang tidak
    berwenang.

### 21.3 Berat dan reward

-   Berat bersih dihitung konsisten dari berat kotor dan tara.
-   Berat negatif/invalid ditolak.
-   Reward tidak diterbitkan sebelum verifikasi.
-   Pengulangan request tidak menggandakan poin.
-   Saldo dan ledger konsisten.
-   Koreksi meninggalkan jejak audit.
-   Reward dari kategori tidak eligible tidak diterbitkan.
-   Penukaran tidak dapat menggunakan saldo yang sama dua kali.

### 21.4 Organik dan limbah khusus

-   Organik memiliki jadwal dan jalur yang terpisah sesuai konfigurasi.
-   Kategori yang tidak memiliki pengolah tersedia tidak dapat
    dijadwalkan sebagai layanan aktif.
-   Kontaminasi dapat dicatat.
-   Limbah khusus tidak diarahkan ke penjemputan umum jika jalurnya
    tidak tersedia.
-   Sistem tidak menandai material telah diolah tanpa konfirmasi mitra.

### 21.5 Batch dan mitra

-   Batch dapat ditelusuri ke setoran asal.
-   Alokasi batch tidak melebihi berat tersedia.
-   Pengiriman dan penerimaan dicatat terpisah.
-   Selisih berat dapat dicatat.
-   Status `PROCESSED` memerlukan konfirmasi yang sesuai.
-   Buyer hanya mengakses transaksi yang berkaitan dengan mitranya.

### 21.6 Admin dan laporan

-   Admin dapat memverifikasi role dan mitra.
-   Perubahan tarif mempunyai periode berlaku dan audit.
-   Dashboard membedakan terkumpul, dikirim, diterima, dan diproses.
-   Ekspor data mengikuti izin.
-   Data sintetis diberi label sebagai simulasi.

------------------------------------------------------------------------

## 22. Strategi Pengujian dan Validasi

### 22.1 Unit test

Cakupan minimum: - Kalkulasi berat bersih. - Formula reward. -
Pembulatan poin. - Validasi status. - Transisi role. - Validasi slot
jadwal. - Validasi kategori dan jalur. - Rekonsiliasi ledger. - Batas
alokasi batch. - Validasi penukaran.

### 22.2 Integration test

-   Registrasi → login → buat setoran.
-   Setoran → tugas petugas → status selesai.
-   Verifikasi berat → penerbitan poin.
-   Retry API → tidak ada poin ganda.
-   Koreksi berat → transaksi kompensasi.
-   Batch → pengiriman → konfirmasi penerimaan.
-   Role pending → approval admin → akses aktif.
-   Kegagalan notifikasi → transaksi tetap tersimpan.

### 22.3 Security test

-   User mencoba mengakses laporan user lain.
-   User mencoba memanggil endpoint petugas.
-   Collector mencoba mengubah tarif.
-   Buyer mencoba melihat batch yang tidak terkait.
-   Upload file dengan format/ukuran tidak valid.
-   Request ganda untuk klaim tugas.
-   Request ganda untuk penukaran poin.
-   Percobaan mengubah berat setelah status final tanpa izin.
-   Percobaan mengekspor data pribadi.
-   Validasi tidak ada secret pada repository dan client bundle.

### 22.4 Uji penerimaan pengguna

Uji dengan skenario: 1. Warga baru membuat setoran kaleng. 2. Warga
membuat setoran organik dan memilih jadwal yang tersedia. 3. Petugas
menerima tugas dan mencatat berat. 4. User berpindah role tanpa
kehilangan data. 5. User memeriksa poin yang diterbitkan. 6. Admin
meninjau batch dan mitra. 7. Buyer mengonfirmasi penerimaan. 8. Petugas
menolak limbah yang tidak aman. 9. User melihat alasan setoran tidak
dapat dilayani. 10. Admin mengekspor laporan agregat.

### 22.5 Pengujian lapangan

Sebelum operasi nyata: - Validasi kategori bersama mitra. - Uji jadwal
dan kapasitas. - Uji proses timbang. - Validasi formula reward dan
pendanaan. - Uji komunikasi perubahan status. - Pastikan petugas
memahami prosedur keselamatan. - Pastikan ada jalur untuk material yang
ditolak. - Uji pemulihan ketika koneksi terputus. - Minta umpan balik
warga dan petugas. - Dokumentasikan masalah dan perubahan SOP.

------------------------------------------------------------------------

## 23. Indikator Keberhasilan

Target berikut adalah hipotesis untuk pilot, bukan klaim performa. Nilai
akhir ditetapkan setelah baseline dan kapasitas operasional diketahui.

### 23.1 Aktivasi dan penggunaan

-   Jumlah warga yang menyelesaikan registrasi.
-   Jumlah warga yang melakukan setoran pertama.
-   Persentase laporan yang lengkap.
-   Persentase pengguna yang kembali menggunakan layanan.
-   Tingkat penggunaan panduan pemilahan.

### 23.2 Operasional

-   Persentase tugas yang selesai.
-   Median waktu dari permintaan hingga penjemputan.
-   Persentase tugas dengan bukti lengkap.
-   Persentase setoran yang berhasil diverifikasi.
-   Tingkat pembatalan dan alasan.
-   Tingkat setoran yang tidak dapat dilayani karena kapasitas.

### 23.3 Kualitas material

-   Berat tervalidasi per kategori.
-   Persentase setoran terkontaminasi.
-   Berat batch yang diterima mitra.
-   Selisih berat kirim dan terima.
-   Persentase batch yang memiliki tujuan akhir tercatat.

### 23.4 Reward dan pendanaan

-   Poin diterbitkan per program.
-   Poin ditukar.
-   Persentase transaksi reward yang dikoreksi.
-   Biaya reward per kilogram yang memenuhi syarat.
-   Rasio biaya operasional terhadap pendapatan program.
-   Sisa anggaran reward.
-   Jumlah program sponsor aktif dan realisasi penggunaan dana.

### 23.5 Kepercayaan dan keamanan

-   Jumlah laporan/keberatan terkait berat atau reward.
-   Waktu penyelesaian keberatan.
-   Jumlah klaim tugas ganda yang berhasil dicegah.
-   Jumlah insiden akses tidak sah.
-   Persentase transaksi kritis dengan audit lengkap.
-   Jumlah insiden keselamatan yang dilaporkan.

### 23.6 Definisi dampak

Jangan menyamakan: - Dilaporkan dengan dikumpulkan. - Dikumpulkan dengan
diterima pengolah. - Diterima pengolah dengan berhasil didaur ulang. -
Berat sampah dengan dampak karbon. - Poin yang diterbitkan dengan uang
yang dibayarkan.

Setiap klaim harus memiliki sumber data, definisi, periode, dan batasan.

------------------------------------------------------------------------

## 24. Roadmap Implementasi

### Fase 0 --- Validasi dan fondasi

Hasil: - Definisi pilot dan stakeholder. - Daftar kategori yang
benar-benar dapat dilayani. - Kesepakatan awal dengan petugas dan
mitra. - Aturan reward simulasi. - Definisi status dan data model. -
Wireframe utama.

Kriteria keluar: - Tim sepakat pada scope MVP. - Tidak ada kategori yang
ditawarkan tanpa jalur penanganan. - Data demo diberi label.

### Fase 1 --- Fondasi akun dan role

Hasil: - Auth. - Profil. - Role User. - Pengajuan/verifikasi
Collector. - Switch role. - Proteksi endpoint. - Audit dasar.

Kriteria keluar: - Role aktif dan izin backend bekerja. - Manipulasi
role di frontend tidak meningkatkan akses.

### Fase 2 --- Waste Collection

Hasil: - Kategori. - Form setoran. - Jadwal. - Daftar tugas. - Klaim
tugas. - Update status. - Bukti penjemputan. - Riwayat.

Kriteria keluar: - Satu laporan dapat diselesaikan oleh satu petugas
tanpa status yang inkonsisten.

### Fase 3 --- Timbang dan WastePoints

Hasil: - Form berat dan kualitas. - Aturan reward. - Ledger. - Saldo. -
Riwayat poin. - Koreksi dasar.

Kriteria keluar: - Kalkulasi dapat diuji dan retry tidak menggandakan
poin.

### Fase 4 --- Batch dan mitra

Hasil: - Profil mitra. - Batch material. - Alokasi. - Pengiriman. -
Penerimaan. - Dashboard rekap.

Kriteria keluar: - Material dapat ditelusuri dari setoran sampai status
penerimaan mitra.

### Fase 5 --- Penyempurnaan dan demo

Hasil: - UX responsif. - Data demo. - Pengujian end-to-end. - Penanganan
error. - Presentasi nilai bisnis dan dampak. - Dokumentasi deployment.

Kriteria keluar: - Demo dapat menjalankan alur warga → petugas → timbang
→ poin → batch → mitra. - Batasan, asumsi, dan data simulasi dijelaskan
secara jujur.

### Fase 6 --- Pilot terbatas setelah hackathon

Hasil: - Uji operasional nyata. - Validasi harga dan biaya. - SOP
penanganan organik dan limbah khusus. - Kebijakan privasi dan retensi. -
Dukungan pengguna. - Evaluasi KPI.

Kriteria keluar: - Mitra, sumber pendanaan, tanggung jawab operasional,
dan prosedur keselamatan disepakati.

------------------------------------------------------------------------

## 25. Keputusan Terbuka

Keputusan berikut harus diselesaikan sebelum implementasi produksi:

1.  **Identitas pengguna:** email/password, OAuth, nomor telepon, atau
    kombinasi.
2.  **Wilayah pilot:** banjar/desa dan batas area layanan.
3.  **Model layanan:** penjemputan terjadwal, drop-off point, atau
    kombinasi.
4.  **Petugas:** individu, petugas komunitas, mitra berizin, atau tim.
5.  **Kategori aktif:** kategori mana yang benar-benar memiliki jalur
    pengolahan.
6.  **Organik:** mitra, jenis organik yang diterima, kapasitas, jadwal,
    dan SOP.
7.  **Timbangan:** perangkat, prosedur tara, bukti, dan penanganan
    selisih.
8.  **Reward:** poin per kilogram atau formula nilai material, faktor
    kualitas, pembulatan, batas, dan sumber dana.
9.  **Penukaran:** voucher, manfaat komunitas, atau bentuk lain; tunai
    tidak termasuk MVP default.
10. **Marketplace:** penawaran harga, kontrak B2B, atau pencocokan awal
    tanpa transaksi online.
11. **Buyer verification:** data dan bukti minimum yang diperlukan.
12. **Peta:** provider, biaya, batas kuota, dan kebijakan privasi.
13. **Notifikasi:** in-app saja atau ditambah email/push.
14. **Data retention:** durasi penyimpanan laporan, bukti foto, dan
    audit.
15. **Keberatan:** batas waktu dan penanggung jawab.
16. **Pendanaan:** pemilik anggaran reward dan persetujuan perubahan.
17. **Legal/operasional:** tanggung jawab pengangkutan dan pengolahan
    sesuai aturan yang berlaku.
18. **AI:** apakah klasifikasi foto masuk MVP atau hanya fase
    berikutnya.
19. **KPI pilot:** baseline dan target setelah kapasitas diketahui.
20. **Dukungan pengguna:** kanal pelaporan kendala dan waktu respons.

------------------------------------------------------------------------

## 26. Glosarium

  -----------------------------------------------------------------------
  Istilah                             Definisi
  ----------------------------------- -----------------------------------
  Setoran                             Catatan sampah yang diajukan warga
                                      untuk layanan atau pengumpulan

  Laporan                             Informasi awal dari pengguna
                                      tentang sampah

  Permintaan penjemputan              Permintaan operasional yang
                                      dijadwalkan

  Collector/Petugas                   Pengguna terverifikasi yang
                                      menjalankan tugas pengangkutan

  Berat kotor                         Berat material beserta wadah jika
                                      ada

  Tara                                Berat wadah yang dikurangkan dari
                                      berat kotor

  Berat bersih                        Berat material setelah tara
                                      dikurangkan

  Kontaminasi                         Material yang tidak sesuai dengan
                                      kategori/batch

  WastePoints                         Poin reward internal WasteLink

  Ledger                              Catatan transaksi poin yang dapat
                                      diaudit

  Batch                               Kumpulan material yang dikelola
                                      sebagai satu unit stok/distribusi

  Buyer                               Pihak yang membeli atau menerima
                                      material

  Processor/Pengolah                  Pihak yang melakukan pemrosesan
                                      material

  Pengepul                            Pihak yang mengumpulkan/membeli
                                      material untuk distribusi lanjutan

  Bank sampah                         Sistem/unit pengumpulan dan
                                      pengelolaan sampah sesuai
                                      operasionalnya

  Organik basah                       Sampah organik yang mudah membusuk
                                      dan membutuhkan penanganan sesuai
                                      SOP

  Residu                              Sampah yang tidak diterima jalur
                                      pemanfaatan material yang tersedia

  Limbah khusus                       Material yang membutuhkan jalur
                                      penanganan tertentu

  Idempotency                         Sifat operasi yang aman diulang
                                      tanpa menggandakan efek

  Audit log                           Catatan tindakan penting, pelaku,
                                      waktu, dan perubahan

  SLA                                 Target waktu layanan yang
                                      disepakati

  MVP                                 Produk minimum yang dapat diuji
                                      untuk memvalidasi alur dan asumsi
                                      inti
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 27. Matriks Keterlacakan Kebutuhan

Matriks ini menghubungkan kebutuhan tingkat tinggi dengan domain
implementasi dan cara verifikasi.

  ------------------------------------------------------------------------------------------------
  ID             Kebutuhan                    Domain             Prioritas      Verifikasi
  -------------- ---------------------------- ------------------ -------------- ------------------
  HR-001         Registrasi dan login aman    Auth               MUST           Test auth

  HR-002         Satu akun dapat memiliki     Role               MUST           Integration test
                 beberapa role                                                  

  HR-003         Role Collector memerlukan    Role               MUST           Permission test
                 verifikasi                                                     

  HR-004         Switch role tidak mengubah   Role/UI            MUST           UAT
                 kepemilikan data                                               

  HR-005         Backend memvalidasi izin     Security           MUST           Security test

  HR-006         Kategori sampah dan panduan  Waste taxonomy     MUST           Admin test
                 dapat dikelola                                                 

  HR-007         Setoran menyimpan kategori,  Collection         MUST           Integration test
                 lokasi, dan jadwal                                             

  HR-008         Slot tidak melebihi          Scheduling         MUST           Boundary test
                 kapasitas yang dikonfigurasi                                   

  HR-009         Tugas tidak dapat diklaim    Task               MUST           Concurrency test
                 ganda                                                          

  HR-010         Status mengikuti transisi    Task               MUST           State transition
                 yang sah                                                       test

  HR-011         Bukti penjemputan            Storage/Security   MUST           Access test
                 terlindungi                                                    

  HR-012         Berat bersih dihitung        Weighing           MUST           Unit test
                 konsisten                                                      

  HR-013         Kualitas dan kontaminasi     Quality            MUST           UAT
                 dapat dicatat                                                  

  HR-014         Reward mengikuti aturan      Reward             MUST           Unit/integration
                 terversi                                                       test

  HR-015         Retry tidak menggandakan     Ledger             MUST           Idempotency test
                 poin                                                           

  HR-016         Koreksi ledger dapat diaudit Finance            MUST           Audit test

  HR-017         Penukaran tidak melebihi     Redemption         SHOULD         Concurrency test
                 saldo                                                          

  HR-018         Organik memiliki jalur dan   Organic            MUST jika      Scenario test
                 jadwal yang sesuai                              aktif          

  HR-019         Limbah khusus tidak masuk    Safety             MUST           Safety test
                 jalur umum tanpa izin                                          

  HR-020         Batch terhubung ke setoran   Marketplace        MUST           Data integrity
                 asal                                                           test

  HR-021         Alokasi batch tidak melebihi Marketplace        MUST           Constraint test
                 stok                                                           

  HR-022         Pengiriman dan penerimaan    Marketplace        MUST           UAT
                 dibedakan                                                      

  HR-023         Buyer hanya melihat data     Security           MUST           Access test
                 yang relevan                                                   

  HR-024         Admin dapat mengelola mitra  Admin              MUST           Admin test
                 dan aturan                                                     

  HR-025         Dashboard membedakan         Reporting          MUST           Metric validation
                 terkumpul/dikirim/diterima                                     

  HR-026         Sponsor hanya melihat data   Privacy            SHOULD         Access test
                 agregat yang disetujui                                         

  HR-027         Tindakan kritis dicatat      Audit              MUST           Audit test

  HR-028         Kegagalan notifikasi tidak   Reliability        SHOULD         Failure test
                 merusak transaksi                                              

  HR-029         Data demo ditandai sebagai   Demo               MUST           Review
                 simulasi                                                       

  HR-030         Klaim dampak sesuai bukti    Reporting          MUST           Content review
                 yang tersedia                                                  
  ------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## Penutup

HRD ini menjadi dasar kebutuhan tingkat tinggi untuk implementasi
WasteLink Bali. Sebelum sistem dipakai dalam operasi nyata, tim harus
memvalidasi kategori sampah yang dapat dilayani, kapasitas dan SOP
mitra, harga material, biaya pengumpulan, sumber pendanaan reward,
perlindungan data, dan tanggung jawab operasional.

Prioritas teknis MVP adalah membangun alur yang konsisten dan dapat
diaudit:

**Warga mengajukan setoran → petugas terverifikasi menjemput → berat dan
kualitas diverifikasi → reward dicatat jika memenuhi aturan → material
masuk batch → mitra menerima material → pengelola dapat menelusuri hasil
dan biaya.**

AI, optimasi rute, analitik prediktif, dan fitur tambahan dikembangkan
setelah alur dasar dapat dipercaya.
