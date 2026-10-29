# Software Requirements Specification (SRS)
# WasteLink Bali — Platform Pengelolaan Sampah Berbasis Komunitas dan Ekonomi Sirkular

> **Status dokumen:** Draft spesifikasi kebutuhan perangkat lunak untuk hackathon/MVP  
> **Versi:** 1.0  
> **Tanggal:** 29 Oktober 2026  
> **Bahasa produk:** Bahasa Indonesia  
> **Wilayah pilot asumsi:** satu banjar atau desa di Bali  
> **Zona waktu operasional:** WITA (`Asia/Makassar`)  
> **Mata uang:** Rupiah (`IDR`)  
> **Dokumen acuan:** `PRD_WasteLink_Bali.md`, `HRD_WasteLink_Bali.md`, `SDD_WasteLink_Bali.md`

> **Catatan penting:** SRS ini mengubah kebutuhan produk dan rancangan teknis menjadi persyaratan yang dapat ditinjau, diimplementasikan, dan diuji. Angka poin, batas berat, kapasitas, SLA, harga material, target kinerja, biaya, dan nilai simulasi yang belum divalidasi bukan kebijakan final. Persyaratan yang bergantung pada operasi lapangan harus dikonfigurasi setelah ada persetujuan pengelola dan konfirmasi mitra.

---

## Daftar Isi

1. Tujuan dan Konvensi Dokumen
2. Ruang Lingkup Produk
3. Referensi dan Keterlacakan Dokumen
4. Gambaran Umum Sistem
5. Stakeholder, Aktor, dan Hak Akses
6. Lingkungan Operasional dan Batasan
7. Asumsi dan Dependensi
8. Kebutuhan Antarmuka Eksternal
9. Kebutuhan Fungsional
10. Aturan Bisnis
11. Kebutuhan Data
12. State dan Transisi Status
13. Kebutuhan API dan Kontrak Integrasi
14. Kebutuhan Nonfungsional
15. Kebutuhan Keamanan, Privasi, dan Audit
16. Kebutuhan UX/UI dan Aksesibilitas
17. Use Case dan Skenario Operasional
18. Kebutuhan Pelaporan dan Metrik
19. Penanganan Kegagalan dan Edge Case
20. Kriteria Penerimaan Sistem
21. Strategi Verifikasi dan Validasi
22. Matriks Keterlacakan PRD–HRD–SDD–SRS
23. Prioritas dan Batas Rilis
24. Risiko dan Keputusan Terbuka
25. Glosarium
26. Lampiran A — Katalog API Referensi
27. Lampiran B — Paket Uji Penerimaan
28. Penutup

---

## 1. Tujuan dan Konvensi Dokumen

### 1.1 Tujuan

Dokumen ini menetapkan **apa yang harus disediakan dan dipenuhi oleh perangkat lunak WasteLink Bali**. SRS menjadi acuan untuk product owner, designer, frontend developer, backend developer, database engineer, QA, Data/AI Engineer, administrator, serta perwakilan operasi lapangan.

SRS tidak menggantikan PRD, HRD, atau SDD:

| Dokumen | Pertanyaan utama | Tanggung jawab |
|---|---|---|
| PRD | Mengapa produk diperlukan dan pengalaman apa yang dituju? | Masalah, sasaran, persona, perjalanan pengguna, kebijakan produk |
| HRD | Kapabilitas tingkat tinggi apa yang harus tersedia? | Domain kebutuhan, prioritas, KPI, aturan lintas fungsi |
| SDD | Bagaimana sistem dirancang untuk memenuhi kebutuhan? | Arsitektur, modul, model data, state machine, API referensi, deployment |
| **SRS** | Persyaratan perangkat lunak apa yang harus dipenuhi dan bagaimana membuktikannya? | Requirement yang jelas, terukur, dapat diuji, dan dapat ditelusuri |

### 1.2 Konvensi normatif

Kata kunci **HARUS** menunjukkan persyaratan wajib. **SEBAIKNYA** menunjukkan persyaratan yang direkomendasikan kecuali ada alasan terdokumentasi. **DAPAT** menunjukkan opsi yang boleh dipilih. Istilah MUST/SHOULD/COULD digunakan pada prioritas rilis, bukan untuk mengubah arti requirement.

Setiap requirement memiliki ID unik. Requirement dianggap dapat diterima jika memiliki kondisi awal, perilaku yang diharapkan, dan hasil yang dapat diverifikasi. Implementasi tidak boleh menafsirkan requirement dengan cara yang menghilangkan kontrol keamanan, konsistensi transaksi, keselamatan, atau jejak audit.

### 1.3 Klasifikasi prioritas

- **MUST:** syarat MVP; fitur atau kontrol inti yang belum boleh dihilangkan.
- **SHOULD:** penting, tetapi dapat ditunda dengan alasan dan mitigasi yang disetujui.
- **COULD:** peningkatan yang berguna jika waktu, biaya, dan dependensi memungkinkan.
- **WON'T for MVP:** secara eksplisit bukan bagian rilis MVP.

### 1.4 Kriteria kualitas requirement

Requirement dalam dokumen ini diharapkan:

1. **Tunggal:** tidak menggabungkan beberapa perilaku independen dalam satu kewajiban.
2. **Terukur:** memiliki hasil, aturan, atau kondisi verifikasi yang jelas.
3. **Konsisten:** tidak bertentangan dengan requirement lain atau keputusan desain yang dirujuk.
4. **Dapat ditelusuri:** memiliki hubungan ke domain HRD/PRD dan verifikasi.
5. **Dapat diuji:** bisa diperiksa melalui test, inspeksi, demonstrasi, atau analisis.

### 1.5 Status dan pengelolaan perubahan

Dokumen ini adalah baseline kebutuhan versi 1.0 untuk MVP. Perubahan yang menyentuh status final, role/permission, berat, reward, saldo, pendanaan, data pribadi, atau definisi dampak harus memiliki catatan perubahan, dampak ke requirement terkait, dan persetujuan product owner/pemilik domain. Perubahan tarif dan kebijakan harus berlaku melalui versi atau tanggal efektif baru; transaksi lama tidak boleh berubah secara diam-diam.

---

## 2. Ruang Lingkup Produk

### 2.1 Deskripsi produk

WasteLink Bali adalah platform pengelolaan sampah berbasis komunitas yang menghubungkan warga, petugas pengangkut, administrator/pengelola, mitra pengolah atau pembeli material, dan pihak pendanaan. Sistem mendukung rangkaian dari panduan pemilahan, pembuatan setoran, penjadwalan, penugasan petugas, inspeksi, penimbangan, pemberian WastePoints, pencatatan material, pembentukan batch, sampai pengiriman dan konfirmasi penerimaan oleh mitra.

Tujuan inti sistem adalah membuat data operasional **terpilah, terlacak, bisa diaudit, dan dapat direkonsiliasi**. Sistem tidak boleh menyamakan status penjemputan dengan bukti bahwa material telah didaur ulang atau diolah.

### 2.2 Sasaran MVP

1. Warga dapat membuat dan melacak setoran untuk kategori dan area layanan yang aktif.
2. Satu akun dapat mempunyai beberapa role, termasuk `USER` dan `COLLECTOR` setelah verifikasi, tanpa membuat akun baru.
3. Petugas terverifikasi dapat mengambil tugas, memperbarui status yang sah, mencatat inspeksi dan berat, serta mengunggah bukti.
4. Berat bersih dihitung konsisten dan diverifikasi oleh petugas/aktor berwenang.
5. WastePoints diterbitkan hanya setelah persyaratan transaksi terpenuhi dan dicatat dalam ledger yang dapat diaudit.
6. Organik, material daur ulang, residu, dan limbah khusus mempunyai aturan/rute berbeda.
7. Material yang tervalidasi dapat dicatat ke batch dan ditelusuri sampai pengiriman/penerimaan mitra jika alur marketplace diaktifkan.
8. Admin dapat mengelola konfigurasi utama, memverifikasi role/mitra, meninjau transaksi, dan melihat laporan operasional.
9. Sistem menyediakan audit, kontrol akses, dan penanganan kesalahan untuk mencegah klaim reward ganda serta akses data lintas pengguna.

### 2.3 Ruang lingkup fungsional

**Termasuk MVP:**

- Registrasi, login, logout, profil, dan sesi yang aman.
- Role, status verifikasi role Collector, dan switch role.
- Kategori/subkategori sampah serta panduan penanganan.
- Area layanan, slot jadwal, permintaan setoran/penjemputan, tugas petugas, histori status.
- Inspeksi kualitas, berat kotor/tara/bersih, bukti dan koreksi berizin.
- Reward rule berversi, ledger poin, saldo, dan adjustment yang terlacak.
- Profil mitra, batch material, alokasi/pengiriman, dan konfirmasi penerimaan sesuai kemampuan pilot/demo.
- Notifikasi dalam aplikasi, dashboard per role, laporan, audit log, serta data demo berlabel.

**Dapat diaktifkan setelah kesiapan operasi:** katalog penukaran voucher, notifikasi eksternal, saran klasifikasi AI, pencocokan material yang lebih maju, integrasi merchant, pembayaran otomatis, dan integrasi pihak ketiga.

### 2.4 Di luar ruang lingkup MVP

- Menjadi layanan darurat atau pengganti otoritas persampahan pemerintah.
- Menjamin semua jenis sampah akan diterima atau dibeli.
- Menentukan berat final dari foto atau model AI.
- Mengangkut atau memproses sendiri semua jenis limbah, termasuk limbah berbahaya.
- Menjadi dompet digital umum atau menjanjikan konversi poin menjadi uang tunai.
- Mengklaim dampak karbon/lingkungan yang tidak didukung metodologi dan bukti.
- Menganggap material sudah didaur ulang hanya karena dijemput atau dikirim.
- Mengaktifkan wilayah atau jalur pengolahan yang belum disepakati dengan operator dan mitra.

### 2.5 Batas sistem

Sistem mengelola data, validasi, koordinasi, bukti, ledger, alokasi material, rekonsiliasi, dan laporan. Operasi fisik—pengangkutan, penimbangan fisik, pemilahan tambahan, pengolahan, dan penerimaan akhir—dilakukan manusia/mitra sesuai SOP. Kebenaran tindakan fisik hanya direpresentasikan sebagai fakta yang tercatat dan didukung bukti, bukan jaminan otomatis dari aplikasi.

---

## 3. Referensi dan Keterlacakan Dokumen

### 3.1 Dokumen acuan

| ID referensi | Dokumen | Kegunaan |
|---|---|---|
| REF-PRD | `PRD_WasteLink_Bali.md` | Sasaran produk, persona, user journey, prinsip produk, kebijakan operasional |
| REF-HRD | `HRD_WasteLink_Bali.md` | Kebutuhan tingkat tinggi, prioritas, metrik, risiko, kriteria penerimaan sistem |
| REF-SDD | `SDD_WasteLink_Bali.md` | Arsitektur, modul, endpoint referensi, entitas, transisi status, pengamanan teknis |

### 3.2 Konvensi keterlacakan

- `REQ-AUTH-*`: autentikasi dan profil.
- `REQ-IAM-*`: role, permission, dan switch role.
- `REQ-TAX-*`: taksonomi dan panduan pemilahan.
- `REQ-COL-*`: setoran, slot, dan tugas penjemputan.
- `REQ-QC-*`: inspeksi, timbang, bukti, sengketa.
- `REQ-PTS-*`: aturan reward dan ledger WastePoints.
- `REQ-MKT-*`: mitra, batch, offer, distribusi material.
- `REQ-ORG-*`: pengelolaan organik.
- `REQ-SAF-*`: residu, limbah khusus, dan keselamatan.
- `REQ-FIN-*`: pendanaan dan rekonsiliasi keuangan.
- `REQ-NOT-*`: notifikasi dan media.
- `REQ-RPT-*`: dashboard, metrik, dan ekspor.
- `REQ-ADM-*`: konfigurasi dan administrasi.
- `REQ-SEC-*`: keamanan, privasi, dan audit.
- `REQ-DAT-*`: data, integritas, dan retensi.
- `REQ-API-*`: API dan kontrak integrasi.
- `NFR-*`: kebutuhan nonfungsional.
- `AC-*`: kriteria penerimaan.

### 3.3 Aturan sumber kebenaran

Jika terjadi perbedaan, keputusan produk yang disetujui pada PRD/HRD menjadi acuan ruang lingkup; SDD menjadi acuan pola desain teknis; SRS merumuskan requirement yang akan diuji. Konflik yang mengubah keselamatan, reward, pendanaan, privasi, atau definisi status tidak boleh diselesaikan dengan asumsi implementer: konflik harus masuk daftar keputusan terbuka dan disetujui sebelum fitur terkait dirilis.

---

## 4. Gambaran Umum Sistem

### 4.1 Komponen logis

1. **Client web responsif:** halaman warga, dashboard petugas, dashboard admin, area mitra, formulir, histori, serta pelaporan.
2. **API aplikasi:** autentikasi, permission, validasi bisnis, state transition, dan kontrak data.
3. **Domain Collection:** setoran, slot, assignment, inspeksi, berat, bukti, pembatalan, dan sengketa.
4. **Domain WastePoints:** aturan reward berversi, kalkulasi, ledger, saldo, adjustment, dan redemption bila aktif.
5. **Domain Circular Marketplace:** partner, aturan penerimaan, batch, offer/alokasi, delivery, dan receipt.
6. **Domain Finance dan Reporting:** sumber dana, transaksi, budget, rekonsiliasi dan indikator.
7. **Penyimpanan data:** PostgreSQL sebagai sumber kebenaran untuk transaksi inti.
8. **Object storage:** bukti foto/dokumen yang privat dan diakses setelah otorisasi.
9. **Adapter eksternal opsional:** peta/geocoding, email/push, AI klasifikasi, merchant, atau sistem mitra jika tersedia dan disetujui.

### 4.2 Aktor eksternal

- Warga (User).
- Petugas sampah (Collector) yang telah diverifikasi.
- Admin/operator WasteLink.
- Finance/pengelola program keuangan dengan permission terpisah.
- Buyer/processor/mitra penerima material yang diverifikasi.
- Sponsor/pihak pendanaan dengan akses laporan sesuai persetujuan.
- Penyedia layanan eksternal yang hanya menerima data minimum sesuai kontrak integrasi.

### 4.3 Mode operasi

- Semua kebutuhan MVP harus dapat berjalan pada web responsif, termasuk ponsel.
- Integrasi noninti harus mempunyai fallback manual atau status kegagalan yang jelas.
- Data demo harus disintetiskan atau digunakan dengan izin yang sesuai dan diberi label simulasi.
- Fitur yang belum punya jalur pengolahan, jadwal, atau mitra terkonfirmasi harus nonaktif/tidak ditawarkan sebagai layanan tersedia.

---

## 5. Stakeholder, Aktor, dan Hak Akses

### 5.1 Aktor dan tanggung jawab

| Aktor | Ringkasan tanggung jawab | Akses data utama |
|---|---|---|
| Guest | Melihat informasi umum dan kategori publik | Informasi yang ditetapkan publik saja |
| User | Membuat setoran, melacak status, melihat berat/reward milik sendiri | Profil, alamat sendiri, setoran sendiri, ledger sendiri |
| Collector | Mengambil dan menyelesaikan tugas operasional | Tugas yang tersedia/ditugaskan, lokasi dan kontak minimum untuk tugas yang sah |
| Admin/Operator | Memverifikasi role/mitra, mengelola konfigurasi, menyelesaikan kasus | Data operasional sesuai permission dan kebutuhan tugas |
| Finance | Mengelola sumber dana dan rekonsiliasi sesuai kewenangan | Catatan finansial dan data agregat yang dibutuhkan |
| Buyer/Processor | Menyatakan spesifikasi kebutuhan, menerima offer/batch, mengonfirmasi pengiriman | Batch/offer/delivery yang ditawarkan atau terkait dengan mitra tersebut |
| Sponsor | Menilai program dan hasil agregat | Data agregat yang disetujui; tidak ada akses otomatis pada identitas warga |

### 5.2 Model role

Satu akun memakai satu `user_id` permanen dan dapat mempunyai beberapa grant role. `active_role` adalah preferensi navigasi UI, bukan sumber otorisasi. Hak akses berasal dari status akun, grant role yang sah, permission, ownership, assignment, dan scope area/mitra yang diverifikasi oleh backend.

### 5.3 Persyaratan hak akses

**REQ-IAM-001 (MUST):** Sistem HARUS mengaitkan semua role dengan satu identitas pengguna utama.  
**REQ-IAM-002 (MUST):** Role Collector HARUS berstatus terverifikasi sebelum fitur penugasan, inspeksi, timbang, atau bukti operasional dapat digunakan.  
**REQ-IAM-003 (MUST):** Sistem HARUS menyediakan pengajuan role Collector dan status `PENDING`, `VERIFIED`, `REJECTED`; status `SUSPENDED` dapat digunakan jika role dinonaktifkan.  
**REQ-IAM-004 (MUST):** User HARUS dapat berpindah antara dashboard dari role yang sudah aktif tanpa kehilangan identitas, riwayat, atau kepemilikan data.  
**REQ-IAM-005 (MUST):** Backend HARUS memeriksa permission pada setiap endpoint terlindungi; nilai role yang dikirim client tidak boleh menaikkan hak akses.  
**REQ-IAM-006 (MUST):** Sistem HARUS membatasi data tugas kepada Collector yang berhak berdasarkan status verifikasi, penugasan, area, kategori, dan jadwal.  
**REQ-IAM-007 (MUST):** Buyer hanya boleh mengakses batch, offer, dan delivery yang ditawarkan kepada atau terkait dengan mitranya.  
**REQ-IAM-008 (MUST):** Sponsor hanya boleh mengakses data agregat yang secara eksplisit disetujui.  
**REQ-IAM-009 (MUST):** Pemberian, penolakan, penangguhan, atau pemulihan role HARUS mencatat actor, waktu, hasil, dan alasan yang relevan.  
**REQ-IAM-010 (MUST):** Permission finance, perubahan reward, koreksi berat, ekspor data, dan audit HARUS dipisahkan sesuai prinsip least privilege; satu role tidak otomatis memperoleh semua permission administratif.

---

## 6. Lingkungan Operasional dan Batasan

### 6.1 Lingkungan pengguna

- Browser modern pada ponsel dan desktop dengan koneksi internet.
- Bahasa utama UI dan pesan error: Bahasa Indonesia.
- Sistem harus tetap menampilkan state terakhir yang sukses disimpan ketika adapter noninti mengalami gangguan.
- Input pengguna dapat memiliki kualitas jaringan, ukuran gambar, atau data lokasi yang tidak selalu ideal.

### 6.2 Referensi teknologi

SDD menetapkan stack referensi berupa Next.js/TypeScript untuk client, FastAPI untuk API, PostgreSQL untuk data inti, dan object storage privat untuk media. Pilihan library/provider final dapat berubah, tetapi implementasi harus mempertahankan kontrak API, kontrol hak akses, konsistensi transaksi, dan persyaratan nonfungsional dalam SRS ini.

### 6.3 Batasan operasional

- Tidak boleh menjanjikan layanan penjemputan untuk kategori/area tanpa jalur layanan aktif.
- Penimbangan dilakukan menggunakan alat fisik yang sesuai SOP; aplikasi menerima catatan dan bukti, bukan menggantikan alat ukur.
- Formula reward, tarif, jadwal, batas berat, masa sanggah, dan SLA final ditentukan pengelola setelah validasi.
- Pemrosesan limbah khusus hanya boleh dicatat jika ada jalur, pihak berwenang, dan SOP yang sesuai.
- Harga pada marketplace adalah snapshot kesepakatan, bukan janji harga tetap universal.

---

## 7. Asumsi dan Dependensi

### 7.1 Asumsi

1. Pilot dimulai dari satu banjar/desa di Bali.
2. Pengelola dapat menunjuk admin/operator, petugas yang disetujui, dan mitra yang memenuhi persyaratan.
3. Penimbangan pada MVP dilakukan secara manual dengan alat fisik.
4. Slot layanan, area, kategori yang diterima, serta kapasitas ditetapkan dari kondisi operasional yang nyata.
5. Poin merupakan insentif program; bukan saldo uang tunai yang dapat ditarik kecuali kebijakan terpisah ditetapkan secara sah.
6. In-app notification adalah kanal minimum yang dapat berjalan tanpa provider eksternal.
7. AI dan peta adalah fitur pendukung, bukan dependensi wajib untuk alur inti.

### 7.2 Dependensi

- Ketentuan pengelola tentang wilayah, jadwal, pembatalan, masa sanggah, reward, dan peran pengguna.
- Mitra penerima/pengolah yang menyatakan material, spesifikasi, volume, dan proses penerimaan.
- Infrastruktur backend, database, object storage, serta konfigurasi secret.
- Provider email/push/maps/AI jika fitur tersebut diaktifkan.
- Prosedur keselamatan bagi Collector serta prosedur penanganan setoran yang ditolak.

### 7.3 Perilaku saat dependensi tidak tersedia

**REQ-DEP-001 (MUST):** Jika kategori tidak mempunyai jalur pengolahan aktif, sistem HARUS mencegah pengguna menjadwalkan penjemputan kategori tersebut sebagai layanan tersedia dan menjelaskan alasannya.  
**REQ-DEP-002 (MUST):** Jika slot atau kapasitas layanan tidak tersedia, sistem HARUS menolak pembuatan jadwal tersebut atau menawarkan slot lain yang benar-benar tersedia.  
**REQ-DEP-003 (MUST):** Jika provider notifikasi gagal, transaksi domain yang telah tersimpan HARUS tetap konsisten dan kegagalan notifikasi HARUS dapat dicoba ulang/diperiksa.  
**REQ-DEP-004 (MUST):** Jika AI, geocoding, atau peta gagal, pengguna tetap HARUS dapat melakukan langkah inti melalui input manual yang diizinkan.  
**REQ-DEP-005 (MUST):** Sistem tidak boleh menandai mitra, program pendanaan, atau penerimaan material sebagai terkonfirmasi tanpa data/konfirmasi yang sesuai.

---

## 8. Kebutuhan Antarmuka Eksternal

### 8.1 Antarmuka pengguna

**REQ-UI-001 (MUST):** UI HARUS menyediakan navigasi dan menu yang sesuai dengan role aktif.  
**REQ-UI-002 (MUST):** Form setoran HARUS menjelaskan field wajib, kategori yang dapat diterima, estimasi kuantitas, lokasi, jadwal, dan catatan.  
**REQ-UI-003 (MUST):** Status operasional HARUS ditampilkan menggunakan label teks yang jelas; warna tidak boleh menjadi satu-satunya pembeda.  
**REQ-UI-004 (MUST):** Pesan gagal, validasi, loading, empty state, dan sukses HARUS mempunyai feedback yang bisa dipahami.  
**REQ-UI-005 (MUST):** Halaman dashboard HARUS responsif untuk viewport ponsel dan desktop tanpa menghilangkan fungsi utama.  
**REQ-UI-006 (SHOULD):** Formulir yang panjang sebaiknya mempertahankan input aman saat validasi gagal agar pengguna tidak perlu mengulang seluruh data.  
**REQ-UI-007 (MUST):** Tindakan destruktif/sensitif seperti pembatalan, koreksi, adjustment, dan konfirmasi penerimaan HARUS menampilkan ringkasan perubahan dan konfirmasi yang sesuai.

### 8.2 Antarmuka perangkat keras

Tidak ada integrasi wajib dengan timbangan digital pada MVP. Berat dicatat oleh petugas dari alat fisik yang digunakan sesuai SOP. Jika integrasi timbangan ditambahkan kelak, integrasi tersebut harus divalidasi dan tidak boleh menimpa nilai final tanpa event dan otorisasi.

### 8.3 Antarmuka perangkat lunak

**REQ-EXT-001 (MUST):** Sistem HARUS menyediakan API aplikasi versi `/api/v1` untuk fungsi domain yang diaktifkan.  
**REQ-EXT-002 (MUST):** Payload API HARUS menggunakan JSON UTF-8 selain konten upload/download file.  
**REQ-EXT-003 (MUST):** Object storage HARUS privat secara default; URL file bukan mekanisme otorisasi tunggal.  
**REQ-EXT-004 (SHOULD):** Integrasi eksternal HARUS diisolasi melalui adapter agar provider dapat diganti tanpa mengubah aturan domain inti.  
**REQ-EXT-005 (MUST):** Setiap integrasi yang tidak aktif HARUS mempunyai status konfigurasi yang jelas dan tidak boleh menghasilkan tampilan seolah-olah operasi berhasil.

### 8.4 Antarmuka komunikasi

- HTTPS wajib untuk environment yang dapat diakses melalui jaringan publik.
- Cookie sesi, bila dipakai, HARUS memakai atribut aman yang sesuai seperti `HttpOnly`, `Secure` pada HTTPS, dan `SameSite` sesuai arsitektur.
- Endpoint API harus mendukung kode status HTTP dan format error yang konsisten.
- Upload media harus membatasi ukuran, format, jumlah, dan pemilik konteks file.
- Timeout, retry, dan error provider harus ditangani terpisah dari transaksi domain inti.

---

## 9. Kebutuhan Fungsional

### 9.1 Autentikasi, sesi, dan profil

**REQ-AUTH-001 (MUST) — Registrasi.** Sistem HARUS menyediakan registrasi menggunakan metode autentikasi yang dipilih pada implementasi. Identitas login yang dipakai sebagai kunci harus unik.  
**REQ-AUTH-002 (MUST) — Login.** Pengguna HARUS dapat memulai sesi melalui kredensial/provider yang sah. Login gagal tidak boleh mengungkap informasi sensitif tentang akun.  
**REQ-AUTH-003 (MUST) — Logout.** Pengguna HARUS dapat mengakhiri sesi; sesi yang dicabut tidak boleh dipakai kembali untuk endpoint terlindungi.  
**REQ-AUTH-004 (MUST) — Password storage.** Jika password lokal digunakan, password HARUS disimpan menggunakan password hash yang sesuai, bukan plaintext atau enkripsi reversibel.  
**REQ-AUTH-005 (MUST) — Session lifecycle.** Sistem HARUS menerapkan masa berlaku dan invalidasi sesi/token sesuai mekanisme autentikasi yang dipilih.  
**REQ-AUTH-006 (MUST) — Profil.** Pengguna HARUS dapat melihat dan mengubah field profil yang memang diizinkan untuknya.  
**REQ-AUTH-007 (MUST) — Ownership alamat.** Pengguna hanya boleh melihat/mengubah alamat miliknya; akses terhadap alamat pengguna lain HARUS ditolak.  
**REQ-AUTH-008 (SHOULD) — Pemulihan akses.** Sistem sebaiknya menyediakan pemulihan akun yang aman dengan token satu kali pakai atau mekanisme setara. Respons awal pemulihan tidak boleh mengungkap apakah identitas login terdaftar.  
**REQ-AUTH-009 (MUST) — Rate limiting.** Endpoint login, registrasi, dan pemulihan akses HARUS mempunyai perlindungan terhadap percobaan berulang sesuai kemampuan deployment.  
**REQ-AUTH-010 (MUST) — Account status.** Akun yang ditangguhkan/dinonaktifkan tidak boleh melanjutkan tindakan yang membutuhkan akun aktif; status dan kebijakan pesan harus konsisten.

### 9.2 Pengajuan role dan switch role

**REQ-IAM-011 (MUST) — Pengajuan Collector.** User HARUS dapat mengirim pengajuan role Collector berisi data minimum yang diperlukan dan persetujuan terhadap ketentuan operasional.  
**REQ-IAM-012 (MUST) — Review pengajuan.** Admin berizin HARUS dapat menyetujui atau menolak pengajuan dengan alasan yang dapat dicatat.  
**REQ-IAM-013 (MUST) — Role pending.** Keberhasilan pengiriman formulir tidak boleh otomatis mengaktifkan role Collector.  
**REQ-IAM-014 (MUST) — Switch role.** Pengguna dengan lebih dari satu role aktif HARUS dapat mengganti dashboard tanpa membuat akun baru atau mengubah ownership data.  
**REQ-IAM-015 (MUST) — Otorisasi server.** Sistem HARUS menentukan izin dari data role/permission di server, bukan hanya dari state UI.  
**REQ-IAM-016 (MUST) — Suspensi role.** Jika grant Collector ditangguhkan, endpoint operasional harus menolak tindakan baru yang mensyaratkan role aktif. Histori tugas lama tetap dipertahankan.  
**REQ-IAM-017 (SHOULD) — Audit switch role.** Sistem sebaiknya mencatat perubahan status role dan tindakan administratif yang relevan.

### 9.3 Kategori, subkategori, dan panduan pemilahan

**REQ-TAX-001 (MUST) — Kategori utama.** Sistem HARUS mendukung sekurang-kurangnya `ORGANIC`, `RECYCLABLE`, `RESIDUAL`, dan `SPECIAL`. Nama yang ditampilkan kepada pengguna menggunakan Bahasa Indonesia yang jelas.  
**REQ-TAX-002 (MUST) — Subkategori.** Setiap kategori dapat memiliki subkategori yang dikonfigurasi admin. Struktur tidak boleh mengasumsikan seluruh material mempunyai aturan yang sama.  
**REQ-TAX-003 (MUST) — Panduan.** Kategori/subkategori aktif HARUS mempunyai panduan yang sesuai, termasuk contoh item, cara persiapan, kontaminan utama, peringatan keselamatan, dan jalur penanganan jika relevan.  
**REQ-TAX-004 (MUST) — Status kategori.** Admin berizin HARUS dapat mengaktifkan atau menonaktifkan kategori. Kategori nonaktif tidak boleh dipilih untuk setoran baru, tetapi transaksi historis tetap harus dapat dibaca dengan snapshot yang sesuai.  
**REQ-TAX-005 (MUST) — Availability rule.** Ketersediaan kategori HARUS memperhatikan area layanan, jadwal, kapasitas, penerimaan material, dan jalur pengolahan yang telah dikonfigurasi.  
**REQ-TAX-006 (MUST) — Tidak ada janji palsu.** Jika kategori tidak tersedia di area/jadwal yang diminta, UI HARUS menyampaikan keterbatasannya dan tidak membuat permintaan aktif seolah-olah dapat dilayani.  
**REQ-TAX-007 (SHOULD) — Versi panduan.** Perubahan panduan sebaiknya menyimpan versi atau snapshot yang relevan agar aturan pada transaksi lama dapat dijelaskan.  
**REQ-TAX-008 (COULD) — Saran AI.** Sistem dapat memberikan saran kategori dari foto/deskripsi. Hasil harus berlabel saran dan dapat dikoreksi; AI tidak boleh menjadi satu-satunya dasar penanganan limbah khusus atau penghitungan berat.

### 9.4 Area layanan dan slot jadwal

**REQ-COL-001 (MUST) — Area layanan.** Sistem HARUS menghubungkan slot/jadwal dengan area layanan yang terdefinisi.  
**REQ-COL-002 (MUST) — Slot aktif.** Hanya slot aktif dengan kapasitas tersedia yang dapat dipilih pengguna.  
**REQ-COL-003 (MUST) — Kapasitas atomik.** Sistem HARUS mencegah dua permintaan bersamaan menggunakan kapasitas terakhir yang sama sehingga jumlah booking melampaui kapasitas yang ditetapkan.  
**REQ-COL-004 (MUST) — Zona waktu.** Jadwal ditampilkan dan diproses menggunakan WITA untuk pilot, dengan timestamp disimpan secara konsisten dan dikonversi saat ditampilkan.  
**REQ-COL-005 (MUST) — Perubahan slot.** Perubahan jadwal yang memengaruhi permintaan yang sudah dibuat HARUS tersimpan dalam histori dan diberitahukan kepada pihak terkait jika kanal notifikasi tersedia.

### 9.5 Pembuatan dan pelacakan setoran/penjemputan

**REQ-COL-006 (MUST) — Form setoran.** User HARUS dapat membuat setoran dengan kategori, perkiraan jumlah, kondisi, lokasi/alamat, slot jadwal, dan catatan yang dibutuhkan untuk layanan.  
**REQ-COL-007 (MUST) — Validasi formulir.** Sistem HARUS memvalidasi field wajib, kategori aktif, area layanan, ketersediaan slot, dan jalur layanan sebelum permintaan disimpan.  
**REQ-COL-008 (MUST) — Identitas permintaan.** Setiap permintaan HARUS memiliki ID unik yang tidak bisa ditebak sebagai satu-satunya kontrol akses.  
**REQ-COL-009 (MUST) — Riwayat milik sendiri.** User HARUS dapat melihat daftar permintaan miliknya dengan status terkini, waktu pembaruan, kategori, jadwal, dan tindakan lanjutan yang tersedia.  
**REQ-COL-010 (MUST) — Detail terbatas.** Detail permintaan hanya boleh terlihat oleh owner, Collector yang relevan, dan admin yang berizin sesuai kebutuhan.  
**REQ-COL-011 (SHOULD) — Pembatalan.** User dapat membatalkan permintaan sebelum batas status yang ditetapkan kebijakan. Pembatalan yang membutuhkan alasan HARUS meminta alasan dan membuat event histori.  
**REQ-COL-012 (SHOULD) — Deteksi duplikat.** Sistem sebaiknya memperingatkan kemungkinan duplikasi berdasarkan pemilik, waktu, lokasi, kategori, dan status; deteksi tidak boleh menghapus permintaan otomatis.  
**REQ-COL-013 (MUST) — History event.** Perubahan status HARUS mencatat status asal/tujuan, actor, waktu, command, serta alasan bila diperlukan.  
**REQ-COL-014 (MUST) — Status terpisah.** UI dan data HARUS membedakan status permintaan/penjemputan dengan status batch, pengiriman, penerimaan, dan proses pengolahan.

### 9.6 Daftar tugas dan penugasan Collector

**REQ-COL-015 (MUST) — Daftar tugas tersedia.** Collector terverifikasi HARUS dapat melihat tugas yang cocok dengan area, jadwal, kategori, status, dan kebijakan kapasitasnya.  
**REQ-COL-016 (MUST) — Klaim atomik.** Pengambilan tugas HARUS diproses secara atomik sehingga maksimal satu Collector memperoleh assignment aktif untuk tugas yang sama, kecuali model operasi eksplisit mendukung beberapa petugas.  
**REQ-COL-017 (MUST) — Konflik klaim.** Jika tugas telah diambil pihak lain, sistem HARUS menolak klaim berikutnya dan menampilkan hasil konflik yang dapat dipahami.  
**REQ-COL-018 (MUST) — Status tugas.** Collector hanya boleh melakukan transisi status yang diizinkan oleh state machine dan hak aksesnya.  
**REQ-COL-019 (MUST) — Kendala lapangan.** Sistem HARUS menyediakan cara untuk mencatat kendala yang didukung seperti alamat tidak ditemukan, warga tidak ada, akses tertutup, material tidak sesuai, kapasitas, atau situasi tidak aman.  
**REQ-COL-020 (MUST) — Reassignment.** Admin dengan permission yang sesuai dapat menugaskan ulang permintaan; perubahan assignment harus disimpan dan diberitahukan kepada pihak yang terdampak.  
**REQ-COL-021 (MUST) — Minimasi kontak.** Informasi kontak dan alamat detail hanya boleh ditampilkan kepada petugas yang memerlukan untuk tugas yang sah.

### 9.7 Inspeksi kualitas dan penimbangan

**REQ-QC-001 (MUST) — Catatan inspeksi.** Collector yang ditugaskan HARUS dapat mencatat kondisi material, kontaminasi, hasil penerimaan/penolakan, catatan, dan waktu inspeksi.  
**REQ-QC-002 (MUST) — Alasan penolakan.** Penolakan atau permintaan jadwal ulang HARUS memiliki kode/alasan yang dapat dipahami pengguna dan dapat ditinjau admin.  
**REQ-QC-003 (MUST) — Berat kotor dan tara.** Sistem HARUS menyimpan berat kotor dan berat tara jika digunakan, serta menyimpan hasil berat bersih.  
**REQ-QC-004 (MUST) — Formula berat.** Berat bersih HARUS dihitung sebagai `berat_bersih = berat_kotor - berat_tara`; tara default nol hanya bila proses bisnis memang menetapkan tidak ada wadah/tara.  
**REQ-QC-005 (MUST) — Validasi berat.** Berat kotor dan tara harus numerik, menggunakan satuan yang ditetapkan, tidak negatif, dan menghasilkan berat bersih yang valid serta tidak negatif. Batas maksimal operasional dikonfigurasi dan divalidasi server.  
**REQ-QC-006 (MUST) — Konsistensi satuan.** Satuan dan presisi harus konsisten pada penyimpanan, perhitungan, API, serta laporan. Sistem tidak boleh memakai floating point biner untuk saldo/ledger atau nilai yang membutuhkan presisi desimal.  
**REQ-QC-007 (MUST) — Actor timbang.** Catatan berat HARUS menyimpan actor pencatat, waktu, sumber transaksi, status/verifikasi, dan bukti apabila diwajibkan.  
**REQ-QC-008 (SHOULD) — Konfirmasi berat.** User sebaiknya dapat melihat berat final dan mengajukan keberatan dalam jangka waktu yang dikonfigurasi. Keberatan tidak otomatis mengubah berat atau reward.  
**REQ-QC-009 (SHOULD) — Koreksi berat.** Koreksi hanya boleh dilakukan aktor berizin, meminta alasan, dan menyimpan nilai lama, nilai baru, actor, waktu, referensi bukti, serta dampak transaksi turunannya.  
**REQ-QC-010 (MUST) — Histori tidak ditimpa.** Koreksi tidak boleh menghapus catatan timbang sebelumnya; perubahan final harus direpresentasikan sebagai revisi/event yang dapat diaudit.  
**REQ-QC-011 (MUST) — Bukti.** Sistem harus mendukung pengaitan bukti foto/dokumen ke tugas atau inspeksi, dengan metadata uploader, timestamp, jenis, ukuran, dan status penyimpanan.  
**REQ-QC-012 (MUST) — Privasi bukti.** File bukti tidak boleh publik secara default dan harus diperiksa otorisasi setiap kali diakses.  
**REQ-QC-013 (MUST) — Upload terverifikasi.** UI tidak boleh menyatakan bukti telah tersimpan jika upload atau pencatatan metadata di server gagal.

### 9.8 WastePoints dan reward rule

**REQ-PTS-001 (MUST) — Rule reward.** Sistem HARUS menyimpan aturan reward yang sekurang-kurangnya mencakup kategori/subkategori, satuan dasar, tarif/formula, faktor kualitas jika digunakan, rentang berlaku, batas program, status aktif, dan sumber pendanaan jika relevan.  
**REQ-PTS-002 (MUST) — Versi aturan.** Setiap perhitungan reward HARUS menyimpan versi aturan yang digunakan; perubahan aturan tidak boleh mengubah hasil transaksi lama secara diam-diam.  
**REQ-PTS-003 (MUST) — Eligibility.** Reward hanya dapat dihitung jika setoran memenuhi status akhir verifikasi, kategori eligible, berat bersih valid, kondisi kualitas, dan ketentuan program.  
**REQ-PTS-004 (MUST) — Kalkulasi deterministik.** Untuk input dan versi rule yang sama, hasil kalkulasi HARUS konsisten. Formula dan kebijakan pembulatan harus ditetapkan per program serta disimpan pada konfigurasi.  
**REQ-PTS-005 (MUST) — Penerbitan pascaverifikasi.** Foto atau laporan warga saja tidak cukup untuk menerbitkan reward berbasis berat. Reward hanya diterbitkan setelah data timbang dan hasil verifikasi yang disyaratkan lengkap.  
**REQ-PTS-006 (MUST) — Idempotensi.** Retry atau pemanggilan ulang terhadap transaksi penerbitan yang sama tidak boleh membuat ledger entry ganda.  
**REQ-PTS-007 (MUST) — Ledger append-only.** Penerbitan, debit, reversal, adjustment, expiry, dan transaksi relevan HARUS dicatat sebagai entri ledger. Entri yang salah tidak dihapus; koreksi dilakukan dengan transaksi kompensasi/reversal.  
**REQ-PTS-008 (MUST) — Saldo.** Saldo yang ditampilkan HARUS konsisten dengan ledger atau proyeksi saldo yang dapat direkonsiliasi secara deterministik.  
**REQ-PTS-009 (MUST) — Adjustment.** Penyesuaian poin hanya dapat dilakukan oleh permission khusus, memiliki alasan, actor, timestamp, referensi transaksi, dan dampak saldo yang jelas.  
**REQ-PTS-010 (MUST) — Budget reward.** Bila program dibatasi dana, proses penerbitan harus memeriksa dan mengalokasikan budget secara aman terhadap transaksi bersamaan. Jika dana tidak cukup, sistem harus mengikuti kebijakan eksplisit seperti hold atau menghentikan reward baru.  
**REQ-PTS-011 (MUST) — Penangguhan rule.** Admin berizin dapat menonaktifkan penerbitan baru dari aturan/program tanpa menghapus reward yang telah sah terbit.  
**REQ-PTS-012 (SHOULD) — Katalog benefit.** Sistem sebaiknya menyediakan katalog voucher/manfaat jika merchant dan syarat penukaran telah dikonfirmasi.  
**REQ-PTS-013 (SHOULD) — Penukaran atomik.** Penukaran harus memvalidasi saldo, batas, masa berlaku, ketersediaan, dan budget/manfaat. Debit atau reservasi poin harus atomik sehingga saldo tidak dapat dipakai dua kali.  
**REQ-PTS-014 (SHOULD) — Pembatalan penukaran.** Jika penukaran dibatalkan setelah debit diposting, sistem harus membuat reversal yang dapat ditelusuri, bukan menghapus debit asal.  
**REQ-PTS-015 (MUST) — Transparansi pengguna.** Pengguna harus dapat melihat jumlah poin, tanggal, sumber, status, dan penjelasan transaksi yang relevan. Sistem tidak boleh menjanjikan penukaran ke uang tunai jika kebijakan tersebut belum ditetapkan.

### 9.9 Penanganan sampah organik

**REQ-ORG-001 (MUST) — Jalur terpisah.** Organik basah harus memiliki aturan penerimaan, jadwal, dan rute pengolahan yang sesuai; tidak boleh otomatis disamakan dengan material daur ulang kering.  
**REQ-ORG-002 (MUST) — Kapasitas pengolah.** Ketersediaan jadwal organik harus mempertimbangkan kapasitas dan jam penerimaan fasilitas/mitra yang telah dikonfirmasi.  
**REQ-ORG-003 (MUST) — Kontaminasi.** Sistem harus memungkinkan petugas mencatat kontaminasi atau kondisi yang memengaruhi penerimaan dan reward.  
**REQ-ORG-004 (MUST) — Status penyaluran.** Pengiriman organik kepada pengolah harus memiliki catatan penerima, waktu, berat/besaran jika tersedia, dan bukti sesuai SOP.  
**REQ-ORG-005 (MUST) — Klaim pengolahan.** Sistem tidak boleh menyatakan organik telah menjadi kompos, pakan, atau produk lain sebelum ada konfirmasi yang sesuai dari pihak yang bertanggung jawab.

### 9.10 Residu dan limbah khusus

**REQ-SAF-001 (MUST) — Peringatan keselamatan.** UI harus menampilkan instruksi aman untuk kategori yang berisiko atau limbah khusus yang terdefinisi.  
**REQ-SAF-002 (MUST) — Gating jalur khusus.** Limbah khusus tidak boleh masuk ke alur pickup umum jika tidak ada jalur, mitra, atau prosedur resmi yang sesuai dan aktif.  
**REQ-SAF-003 (MUST) — Ketidakpastian kategori.** Jika jenis limbah tidak diketahui atau dinilai berbahaya, sistem harus mengarahkan ke pemeriksaan manusia/prosedur yang sesuai, bukan menerbitkan approval otomatis dari AI.  
**REQ-SAF-004 (MUST) — Larangan klaim penanganan.** Sistem tidak boleh mengklaim limbah khusus sudah diolah hanya karena laporan dibuat, diambil, atau dikirim.  
**REQ-SAF-005 (MUST) — Catatan penolakan.** Penolakan untuk alasan keselamatan harus menyimpan alasan, actor, waktu, dan panduan lanjutan yang aman jika panduan tersebut telah disetujui.

### 9.11 Circular Marketplace: mitra, batch, offer, dan delivery

**REQ-MKT-001 (MUST) — Profil mitra.** Sistem harus menyimpan profil mitra, status verifikasi, kontak operasional yang dibatasi aksesnya, area, jenis material yang diterima, spesifikasi, dan status aktif.  
**REQ-MKT-002 (MUST) — Spesifikasi penerimaan.** Setiap kebutuhan mitra harus menyimpan kategori/subkategori, syarat kualitas/kontaminasi, rentang kuantitas jika ada, lokasi, periode berlaku, serta status aktif.  
**REQ-MKT-003 (MUST) — Batch.** Material yang telah diverifikasi dapat dimasukkan ke batch yang berisi kategori, berat, kualitas, lokasi penyimpanan, sumber material, status, dan waktu pembentukan.  
**REQ-MKT-004 (MUST) — Traceability.** Sistem harus mempertahankan hubungan batch dengan setoran, catatan timbang, dan sumber asal yang relevan.  
**REQ-MKT-005 (MUST) — Batas alokasi.** Total material yang dialokasikan/dikeluarkan tidak boleh melebihi jumlah tersedia setelah memperhitungkan penyesuaian yang sah.  
**REQ-MKT-006 (SHOULD) — Pencocokan.** Sistem dapat merekomendasikan kecocokan batch dan kebutuhan buyer berdasarkan kategori, kualitas, kuantitas, lokasi, dan periode; rekomendasi harus dapat ditinjau manusia.  
**REQ-MKT-007 (SHOULD) — Offer.** Buyer terverifikasi dapat mengirim offer pada batch yang ditawarkan kepadanya. Offer menyimpan buyer, parameter kesepakatan, status, batas waktu, dan snapshot ketentuan.  
**REQ-MKT-008 (MUST) — Persetujuan alokasi.** Penerimaan offer/alokasi harus memvalidasi status batch, masa berlaku offer, izin actor, dan ketersediaan material secara atomik.  
**REQ-MKT-009 (MUST) — Data delivery.** Pengiriman harus mencatat batch, penerima, berat kirim, actor pengirim, tanggal/waktu, bukti, dan status.  
**REQ-MKT-010 (MUST) — Konfirmasi penerimaan.** Penerima yang berwenang harus dapat mencatat berat diterima, waktu, kondisi, bukti, dan selisih terhadap berat kirim.  
**REQ-MKT-011 (MUST) — Selisih.** Selisih berat tidak boleh diselesaikan dengan overwrite tanpa histori; sistem harus mendukung review/dispute dan catatan penyelesaian.  
**REQ-MKT-012 (MUST) — Status terpisah.** Sistem harus membedakan material dikumpulkan, masuk batch, dialokasikan, dikirim, diterima, dan diproses bila bukti proses tersedia.  
**REQ-MKT-013 (MUST) — Buyer scope.** Buyer hanya boleh melihat batch, offer, delivery, dan dokumen yang berkaitan dengan transaksi/mitranya.  
**REQ-MKT-014 (MUST) — Perubahan master data.** Perubahan harga/spesifikasi mitra tidak boleh menulis ulang kesepakatan historis; snapshot transaksi harus dipertahankan.

### 9.12 Pendanaan dan rekonsiliasi keuangan

**REQ-FIN-001 (MUST) — Sumber pendanaan.** Sistem harus dapat mencatat program pendanaan, sumber, periode berlaku, batas penggunaan, status, dan ketentuan program sesuai model yang disetujui.  
**REQ-FIN-002 (MUST) — Pisahkan konsep keuangan.** Sistem harus membedakan sumber pendanaan, anggaran/komitmen reward, transaksi keuangan, offer penjualan material, dan rekonsiliasi.  
**REQ-FIN-003 (MUST) — Catatan transaksi.** Transaksi keuangan menyimpan jenis, nilai, mata uang, tanggal efektif, kategori, status, referensi, actor, dan bukti bila relevan.  
**REQ-FIN-004 (MUST) — Rekonsiliasi.** Sistem harus merekam periode, jenis sumber, nilai sistem, nilai pembanding, selisih, alasan, status review, actor, reviewer bila diwajibkan, serta referensi bukti.  
**REQ-FIN-005 (MUST) — Selisih tidak disembunyikan.** Rekonsiliasi yang belum seimbang harus ditampilkan sebagai exception yang perlu ditinjau; sistem tidak boleh mengubah nilai secara otomatis hanya agar sama.  
**REQ-FIN-006 (MUST) — Budget guard.** Penerbitan reward yang mempunyai budget harus mematuhi batas yang disetujui dan tidak boleh melampaui budget karena transaksi simultan.  
**REQ-FIN-007 (MUST) — Separation of duties.** Izin mencatat transaksi keuangan tidak otomatis memberi izin mengubah berat, kategori, reward rule, atau ledger.  
**REQ-FIN-008 (MUST) — Audit perubahan finansial.** Perubahan budget, program, transaksi, atau rekonsiliasi harus menyimpan actor, waktu, nilai yang berubah, alasan, dan referensi.  
**REQ-FIN-009 (MUST) — Batas klaim akuntansi.** Sistem adalah pencatatan operasional; perlakuan akuntansi, perpajakan, dan validitas kontrak harus mengikuti arahan pihak berwenang dan tidak diasumsikan ditetapkan oleh SRS.

### 9.13 Notifikasi dan media

**REQ-NOT-001 (MUST) — In-app notification.** Sistem harus menyediakan notifikasi dalam aplikasi untuk peristiwa penting pada akun/permintaan/operasi yang relevan.  
**REQ-NOT-002 (MUST) — Recipient scoping.** Pengguna hanya boleh membaca atau menandai dibaca notifikasi miliknya.  
**REQ-NOT-003 (MUST) — Peristiwa.** Notifikasi dapat dicetuskan untuk permintaan baru, assignment, perubahan jadwal/status, hasil inspeksi/timbang, penerbitan/koreksi poin, perubahan redemption, pembaruan role, dan perubahan batch/delivery.  
**REQ-NOT-004 (MUST) — Tidak memberi otorisasi.** Kepemilikan notifikasi tidak memberikan hak untuk membuka resource; resource tetap harus melewati pemeriksaan akses.  
**REQ-NOT-005 (MUST) — Tahan kegagalan provider.** Kegagalan email/push tidak boleh membatalkan transaksi domain yang sudah commit.  
**REQ-NOT-006 (SHOULD) — Retry/outbox.** Jika delivery eksternal diaktifkan, sistem sebaiknya memakai mekanisme retry/outbox dan menghindari duplikasi sejauh kemampuan provider.  
**REQ-NOT-007 (MUST) — Upload aman.** File harus memiliki batas jenis/ukuran, object key yang dibuat server, metadata uploader dan konteks, serta otorisasi sebelum diakses.  
**REQ-NOT-008 (MUST) — Status upload.** UI harus membedakan file lokal, sedang diunggah, berhasil disimpan, dan gagal disimpan.

### 9.14 Dashboard, laporan, dan administrasi

**REQ-RPT-001 (MUST) — Dashboard User.** User harus dapat melihat setoran aktif/historis, status, berat final, WastePoints, dan notifikasi miliknya sesuai fitur yang aktif.  
**REQ-RPT-002 (MUST) — Dashboard Collector.** Collector harus dapat melihat tugas yang tersedia/miliknya, jadwal, detail tugas yang diizinkan, status, kebutuhan bukti, dan catatan operasional.  
**REQ-RPT-003 (MUST) — Dashboard Admin.** Admin harus dapat meninjau pengguna/role, kategori, area/slot, permintaan, kendala, mitra, batch, transaksi terkait, dan laporan sesuai permission.  
**REQ-RPT-004 (MUST) — Dashboard Finance.** Finance yang berwenang harus dapat melihat program pendanaan, pemakaian budget, reward, transaksi, dan rekonsiliasi dalam scope yang diizinkan.  
**REQ-RPT-005 (SHOULD) — Dashboard buyer.** Buyer/processor dapat melihat batch yang ditawarkan, offer, delivery, penerimaan, dan histori transaksi miliknya.  
**REQ-RPT-006 (SHOULD) — Dashboard sponsor.** Sponsor dapat melihat indikator agregat yang disetujui tanpa akses otomatis ke data identitas warga.  
**REQ-RPT-007 (MUST) — Definisi metrik.** Laporan harus membedakan berat diverifikasi, masuk batch, dialokasikan, dikirim, diterima, dan diproses terkonfirmasi.  
**REQ-RPT-008 (MUST) — Filter.** Laporan harus menyediakan filter yang relevan seperti periode, kategori, area, status, dan mitra, dengan pilihan field yang diizinkan.  
**REQ-RPT-009 (SHOULD) — Export.** Ekspor CSV dapat disediakan untuk aktor berizin, wajib menerapkan filter dan scope yang sama, serta mencatat event audit.  
**REQ-RPT-010 (MUST) — Label data demo.** Data sintetis/simulasi harus diberi label agar tidak tercampur dengan hasil operasional nyata.  
**REQ-RPT-011 (MUST) — Validitas klaim dampak.** Laporan tidak boleh menyatakan dampak lingkungan, jumlah material terolah, atau penurunan emisi melebihi fakta dan metodologi yang tersedia.

### 9.15 Administrasi dan audit

**REQ-ADM-001 (MUST) — Konfigurasi.** Admin berizin harus dapat mengelola kategori, panduan, area, slot, aturan penerimaan, dan status layanan sesuai tanggung jawabnya.  
**REQ-ADM-002 (MUST) — Pengelolaan mitra.** Admin berizin dapat membuat, memutakhirkan, memverifikasi, menangguhkan, atau menonaktifkan profil mitra dengan histori perubahan.  
**REQ-ADM-003 (MUST) — Aturan berversi.** Perubahan reward rule atau parameter kritis harus membuat versi/rekaman efektif baru; perubahan tidak boleh mengubah snapshot historis.  
**REQ-ADM-004 (MUST) — Audit log.** Sistem harus mencatat operasi sensitif seperti perubahan role/permission, koreksi berat, adjustment ledger, perubahan rule/budget, ekspor data, override status, dan review sengketa.  
**REQ-ADM-005 (MUST) — Pelacakan perubahan.** Audit minimal memuat actor, action, resource, timestamp, hasil, alasan jika diwajibkan, dan correlation/request ID jika tersedia.  
**REQ-ADM-006 (MUST) — Akses audit.** Audit log hanya dapat dilihat oleh role/permission yang berwenang; log tidak boleh mengandung password, token, secret, atau data pribadi yang tidak diperlukan.  
**REQ-ADM-007 (MUST) — Override terbatas.** Override manual hanya boleh dilakukan permission tertentu, harus disertai alasan, dan tidak boleh menghapus histori atau otomatis menerbitkan reward tanpa validasi ulang.  
**REQ-ADM-008 (MUST) — Retensi.** Kebijakan retensi untuk data transaksi, bukti, audit, dan identitas harus ditentukan sebelum pilot dengan data nyata; penghapusan tidak boleh melanggar kebutuhan audit atau kewajiban yang berlaku.

---

## 10. Aturan Bisnis

Aturan berikut merupakan invariant yang harus ditegakkan pada backend/database sesuai kebutuhan, bukan hanya ditampilkan sebagai validasi UI.

| ID | Aturan bisnis | Verifikasi minimum |
|---|---|---|
| BR-001 | User hanya membuat setoran untuk kategori dan area/jadwal yang aktif. | Test validasi area/kategori/slot |
| BR-002 | Role Collector harus terverifikasi untuk melakukan tindakan operasional. | Permission test |
| BR-003 | Satu tugas hanya mempunyai satu assignment aktif kecuali SOP secara eksplisit mengizinkan tim petugas. | Concurrency test |
| BR-004 | Status hanya dapat berubah melalui transisi yang diizinkan. | State transition test |
| BR-005 | Penolakan, pembatalan, sengketa, override, dan koreksi yang relevan memerlukan alasan. | Validation/audit test |
| BR-006 | Berat bersih = berat kotor − tara, dengan satuan konsisten dan hasil valid. | Unit/boundary test |
| BR-007 | Reward tidak diterbitkan sebelum inspeksi/berat dan syarat verifikasi final lengkap. | Integration test |
| BR-008 | Satu transaksi asal hanya dapat menghasilkan penerbitan reward yang sah sesuai idempotency key/constraint. | Retry/concurrency test |
| BR-009 | Ledger bersifat append-only; koreksi melalui reversal/adjustment. | Audit/ledger test |
| BR-010 | Budget terbatas diperiksa secara aman terhadap transaksi paralel. | Concurrency/budget test |
| BR-011 | Poin tidak dapat ditukar melebihi saldo yang tersedia. | Concurrent redemption test |
| BR-012 | Batch tidak dapat mengalokasikan atau mengirim berat melebihi ketersediaan sah. | Inventory constraint test |
| BR-013 | Pengiriman dan penerimaan merupakan peristiwa berbeda dan menyimpan berat masing-masing. | Marketplace test |
| BR-014 | Konfirmasi proses/daur ulang membutuhkan bukti atau konfirmasi pihak yang berwenang. | Reporting review |
| BR-015 | Limbah khusus tidak masuk ke rute reguler tanpa jalur khusus yang sah. | Safety scenario test |
| BR-016 | Buyer/partner hanya dapat melihat resource dan dokumen yang terhubung pada scope-nya. | Object-level authorization test |
| BR-017 | Notifikasi gagal tidak membatalkan transaksi domain yang telah tersimpan. | Failure injection test |
| BR-018 | Perubahan kategori/rule/price tidak mengubah transaksi historis secara diam-diam. | Snapshot/version test |
| BR-019 | Setiap koreksi finansial atau poin memiliki actor, alasan, timestamp, dan referensi transaksi. | Audit test |
| BR-020 | Data demo selalu dapat dibedakan dari data nyata. | Dataset/content review |

### 10.1 Formula dan parameter yang masih harus ditetapkan

Formula reward harus memilih satu model per program, misalnya:

- `poin = berat_bersih_kg × poin_per_kg × faktor_kualitas`, atau
- `nilai_reward = berat_bersih_kg × tarif_reward_per_kg × faktor_kualitas`, kemudian dikonversi menggunakan nilai tukar poin yang disetujui.

SRS tidak menetapkan angka tarif/poin final. Sebelum program aktif, pengelola harus menyetujui satu formula, aturan pembulatan, batas transaksi/periode, faktor kualitas, sumber pendanaan, masa berlaku, serta kebijakan saat budget habis.

### 10.2 Kategori sampah dan jalur

| Kategori | Perilaku minimum | Batas yang tidak boleh dilanggar |
|---|---|---|
| Organik | Jadwal dan fasilitas pengolahan sesuai kondisi material; kontaminasi tercatat | Tidak menjanjikan kompos/produk akhir tanpa konfirmasi |
| Anorganik bernilai/daur ulang | Pemisahan menurut jenis, kebersihan, kualitas dan spesifikasi buyer | Tidak mengasumsikan semua jenis/berat diterima buyer |
| Residu | Panduan dan rute yang disetujui jika layanan tersedia | Tidak memasukkan ke batch daur ulang tanpa dasar |
| Limbah khusus | Peringatan keselamatan dan jalur khusus yang terverifikasi | Tidak ditangani melalui pickup umum tanpa prosedur/mitra yang sesuai |

---

## 11. Kebutuhan Data

### 11.1 Prinsip data

**REQ-DAT-001 (MUST):** Data transaksi inti harus disimpan dalam database relasional dengan primary key unik dan relasi yang tervalidasi.  
**REQ-DAT-002 (MUST):** Foreign key, unique constraint, check constraint, dan/atau validasi transaksi harus digunakan untuk menjaga integritas data kritis.  
**REQ-DAT-003 (MUST):** Nilai uang, poin, dan berat harus menggunakan tipe numerik dengan skala/precision yang ditetapkan; floating point tidak digunakan untuk ledger dan nilai yang memerlukan ketepatan desimal.  
**REQ-DAT-004 (MUST):** Timestamp dibuat dan diperlakukan konsisten; UI menampilkan waktu operasi pilot dalam WITA.  
**REQ-DAT-005 (MUST):** Perubahan master data kritis harus mempertahankan informasi historis yang dibutuhkan melalui snapshot atau versi rule.  
**REQ-DAT-006 (MUST):** Record transaksi kritis dan audit tidak boleh dihapus untuk menyembunyikan koreksi/kesalahan.  
**REQ-DAT-007 (MUST):** Data demo harus mempunyai penanda eksplisit dan tidak boleh dipakai sebagai bukti dampak operasional nyata.

### 11.2 Entitas inti dan atribut minimum

Nama tabel di bawah merupakan model logis; nama fisik dapat disesuaikan dengan SDD, selama setiap kebutuhan dan integritasnya tetap terpenuhi.

| Entitas | Atribut minimum yang relevan | Aturan integritas |
|---|---|---|
| `users` | ID, nama, identitas login, status akun, timestamps | Identitas login unik sesuai metode auth; secret tidak terekspos |
| `auth_sessions` | ID, user, masa berlaku, revoked/active, timestamps | Sesi dapat dicabut dan kedaluwarsa |
| `roles` / `user_roles` | role code, user, verification status, valid dates | Grant yang sama tidak terduplikasi; role pending tidak punya akses operasional |
| `role_applications` | applicant, status, reviewer, reason, timestamps | Review dan perubahan status terlacak |
| `user_addresses` | user, label, address text, service area, coordinates opsional | Ownership wajib; lokasi scope-restricted |
| `service_areas` | ID, nama, label administratif, status, boundary opsional | Area nonaktif tidak menerima setoran baru |
| `collection_slots` | area, waktu mulai/akhir, kapasitas, kategori/jalur, status | Booking tidak melebihi kapasitas |
| `waste_categories` | parent, code, label, type, guide, active/version | Kategori nonaktif tidak dipakai pada transaksi baru |
| `material_acceptance_rules` | kategori, area/partner, quality criteria, period, status | Rule harus berlaku pada tanggal transaksi |
| `pickup_requests` | owner, category, address/area, schedule, status, assignment | Owner/area/status valid; ID unik |
| `pickup_status_events` | pickup, from/to, actor, reason, timestamp | Histori kronologis dan tidak ditimpa |
| `pickup_assignments` | pickup, Collector, status, assigned time, ended time | Maksimum assignment aktif sesuai SOP |
| `inspection_records` | pickup, quality, contamination, result, actor, time | Penolakan/exception mempunyai alasan |
| `weight_records` | gross, tare, net, unit, actor, time, version/status | Berat valid; koreksi menyimpan histori |
| `media_assets` / `pickup_evidence` | object key, uploader, context, MIME, size, status | File privat dan terikat pada resource sah |
| `reward_rules` | category, formula, version, validity, caps, program | Snapshot versi dipakai pada tiap transaksi |
| `point_ledger_entries` | user, amount, type, source reference, actor, idempotency key | Immutable/append-only, sumber dapat ditelusuri |
| `reward_redemptions` | user, benefit, point cost, status, timestamps | Saldo dan ketersediaan dicek atomik |
| `funding_programs` | source, period, budget limit, status, conditions | Perubahan budget diaudit |
| `financial_transactions` | type, amount, currency, date, status, source ref, actor | Tidak menghapus histori finansial |
| `financial_reconciliations` | period, system value, reference value, discrepancy, reviewer | Selisih belum selesai tetap terlihat |
| `partners` | identity, status, service scope, contacts, category acceptance | Kontak privat; buyer terverifikasi |
| `partner_material_rules` | partner, category, quality, volume, location, period | Pencocokan memakai rule aktif |
| `material_batches` | category, quantity, quality, location, status | Kuantitas tersedia dihitung dari pergerakan yang sah |
| `material_batch_items` | batch, source pickup/weight record, quantity | Traceability setoran–batch |
| `batch_offers` / allocations | buyer, batch, agreed snapshot, expiry, status, quantity | Alokasi tidak melebihi stok/kuantitas tersedia |
| `batch_deliveries` | batch, receiver, weight sent/received, evidence, discrepancy | Berat kirim dan terima terpisah |
| `notifications` | recipient, type, related resource, read_at, delivery state | Receiver-only access; tidak memberi permission resource |
| `audit_logs` | actor, action, resource, before/after as permitted, reason, time | Read restricted; jangan simpan secret |
| `complaints` / `disputes` | related resource, reporter, status, reason, evidence, resolution | Histori penyelesaian terlacak |

### 11.3 Relasi utama

1. Satu user dapat mempunyai beberapa role dan beberapa alamat.
2. Satu user dapat membuat banyak pickup request.
3. Satu pickup request memiliki histori status dan dapat mempunyai assignment, inspeksi, weight record, dan bukti.
4. Satu penerbitan poin terhubung ke transaksi sumber yang memenuhi syarat.
5. Satu user dapat memiliki banyak entri ledger dan redemption.
6. Satu batch dapat menerima material dari banyak setoran yang tervalidasi.
7. Satu batch dapat mempunyai banyak offer/alokasi dan delivery sesuai kebijakan.
8. Satu partner dapat menentukan aturan penerimaan untuk beberapa kategori.
9. Aksi sensitif mengacu ke actor dan waktu; relasi ke audit disediakan sesuai desain.

### 11.4 Retensi dan penghapusan

Periode retensi pasti belum diputuskan. Sebelum pilot, pemilik produk harus menyetujui retensi untuk identitas, alamat/lokasi, foto bukti, status transaksi, ledger, rekonsiliasi, dan audit. Penghapusan/anonimisasi data pribadi harus mempertimbangkan kebutuhan operasional, sengketa, hukum, dan audit. Soft delete bukan alasan untuk menghapus histori transaksi atau meniadakan batas akses.

---

## 12. State dan Transisi Status

### 12.1 Prinsip umum

**REQ-STATE-001 (MUST):** Semua perubahan status domain harus divalidasi di backend.  
**REQ-STATE-002 (MUST):** Perubahan status yang berhasil harus membuat event histori dengan actor/waktu dan alasan jika relevan.  
**REQ-STATE-003 (MUST):** Client tidak boleh mengirim nilai status final bebas dan memaksa state baru tanpa command/transisi yang sah.  
**REQ-STATE-004 (MUST):** Status pickup, reward, redemption, batch, delivery, dan verifikasi role merupakan state terpisah.

### 12.2 Status pickup referensi

Nama status dapat disederhanakan pada MVP, tetapi semantik dan kontrol harus dipertahankan.

| Status | Arti | Contoh pihak yang dapat memicu |
|---|---|---|
| `SUBMITTED` | Permintaan sudah dikirim | User |
| `PENDING_ASSIGNMENT` | Validasi awal lolos dan menunggu petugas | Sistem/admin |
| `ACCEPTED` | Tugas diambil petugas | Collector terverifikasi |
| `SCHEDULED` | Jadwal/slot dikonfirmasi | Collector/admin berizin |
| `EN_ROUTE` | Petugas berangkat, jika tahap ini dipakai | Collector terkait |
| `ARRIVED` | Petugas tiba, jika tahap ini dipakai | Collector terkait |
| `INSPECTION` | Pemeriksaan material berjalan | Collector terkait |
| `WEIGHED` | Hasil timbang diterima dan valid | Collector/aktor sah |
| `REJECTED` | Permintaan/material ditolak dengan alasan | Aktor berwenang |
| `RESCHEDULE_REQUIRED` | Perlu jadwal ulang | Aktor berwenang |
| `COLLECTED` | Material diserahterimakan untuk diangkut | Collector/aktor sah |
| `DELIVERED_TO_FACILITY` | Serah terima tujuan tercatat | Aktor berwenang |
| `COMPLETED` | Syarat layanan yang didefinisikan telah lengkap | Aktor/sistem berizin |
| `CANCELLED_*` | Dibatalkan user/Collector/admin sesuai kebijakan | Aktor berhak |
| `DISPUTED` | Ada sengketa yang perlu ditinjau | Pihak yang memenuhi syarat |

Transisi referensi:

`SUBMITTED → PENDING_ASSIGNMENT → ACCEPTED → SCHEDULED → [EN_ROUTE] → [ARRIVED] → INSPECTION → WEIGHED → COLLECTED → [DELIVERED_TO_FACILITY] → COMPLETED`.

Cabang `INSPECTION → REJECTED` atau `INSPECTION → RESCHEDULE_REQUIRED` harus menyimpan alasan. Pembatalan dan sengketa hanya diizinkan dari status sesuai policy. Tahap dalam tanda kurung siku bersifat opsional bila SOP MVP tidak memerlukannya. `COMPLETED` tidak sama dengan `PROCESSED` atau “sudah didaur ulang”.

### 12.3 Status role, reward, redemption, dan batch

- **Role application:** `PENDING → VERIFIED | REJECTED`; role aktif dapat menjadi `SUSPENDED` sesuai kewenangan.
- **Reward eligibility/issuance:** `NOT_ELIGIBLE`, `PENDING_VERIFICATION`, `APPROVED`, `ISSUED`, `ON_HOLD`, `REVERSED`. `REDEEMED` sebaiknya menjadi status transaksi redemption, bukan menghapus fakta penerbitan.
- **Redemption:** `REQUESTED → APPROVED → FULFILLED`, atau menuju `REJECTED/CANCELLED`; sengketa dapat dicatat setelah fulfillment jika relevan.
- **Batch:** `DRAFT → OPEN → OFFERED/ALLOCATED → READY_FOR_DISPATCH → IN_TRANSIT → PARTIALLY_RECEIVED/RECEIVED → CLOSED`; status lain dapat mencakup `CANCELLED` dan `DISPUTED` sesuai alur.

### 12.4 Validasi transisi

Untuk setiap command status, test harus memverifikasi: status awal valid, actor dan permission valid, prasyarat bisnis terpenuhi, side effect diproses satu kali, histori tersimpan, dan status final ditampilkan konsisten. Command gagal tidak boleh meninggalkan assignment, ledger, atau stok parsial yang tidak konsisten.

---

## 13. Kebutuhan API dan Kontrak Integrasi

### 13.1 Aturan API umum

**REQ-API-001 (MUST):** Endpoint aplikasi menggunakan prefix `/api/v1` kecuali health check yang ditentukan terpisah.  
**REQ-API-002 (MUST):** Semua endpoint terlindungi memverifikasi autentikasi, status akun, permission, ownership, assignment, serta scope terkait.  
**REQ-API-003 (MUST):** Request/response memakai skema terdefinisi dan validasi input server-side.  
**REQ-API-004 (MUST):** Respons error tidak boleh mengekspos stack trace, secret, hash password, token, atau data pribadi yang tidak relevan.  
**REQ-API-005 (MUST):** Mutasi sensitif harus idempotent atau mempunyai constraint domain untuk mencegah efek ganda.  
**REQ-API-006 (MUST):** Daftar menggunakan pagination dan filter/sort yang diizinkan; client tidak boleh memasukkan kolom sort arbitrer ke query database.  
**REQ-API-007 (MUST):** API mengembalikan status HTTP yang sesuai dan kode error terstruktur yang konsisten.  
**REQ-API-008 (SHOULD):** Perubahan breaking contract dikelola dengan versi atau migrasi yang direncanakan.

### 13.2 Format response konseptual

Respons sukses dapat mengikuti pola:

```json
{
  "data": {},
  "meta": {
    "request_id": "server-generated-id"
  }
}
```

Respons error dapat mengikuti pola:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang dimasukkan.",
    "details": [],
    "request_id": "server-generated-id"
  }
}
```

Struktur final harus distandarkan di implementasi. Informasi error harus membantu pemulihan tanpa membocorkan detail internal.

### 13.3 Idempotensi dan konkurensi

- Klien mengirim `Idempotency-Key` untuk mutasi sensitif yang bisa di-retry, atau sistem memakai kunci unik berbasis domain.
- Server menyimpan hasil pemrosesan key sesuai durasi kebijakan dan menolak key sama dengan payload berbeda secara aman.
- Klaim tugas, pemakaian budget, penerbitan poin, redemption, dan alokasi material harus mengandalkan transaksi/locking/conditional update, bukan pemeriksaan UI saja.
- Jika terjadi konflik konkurensi, server mengembalikan respons konflik yang jelas; tidak boleh ada perubahan parsial.

### 13.4 Timestamp, berat, uang, dan pagination

- Timestamp API memakai format ISO 8601 dengan zona waktu yang jelas; UI menampilkan WITA.
- Berat menggunakan satuan eksplisit dan presisi konsisten. API tidak boleh mengembalikan berat tanpa label satuan bila ambigu.
- Uang menggunakan `IDR` dan tipe numerik/string desimal sesuai kontrak; tidak boleh ada representasi pembulatan yang tidak didefinisikan.
- Parameter daftar dapat mencakup `page`, `page_size`, `cursor`, `status`, `category_id`, `service_area_id`, `from`, `to`, serta sort field allowlist.

---

## 14. Kebutuhan Nonfungsional

Nilai target di bawah adalah target awal untuk validasi pada lingkungan demo/pilot. Nilai final untuk produksi harus disepakati berdasarkan kapasitas, perangkat, jaringan, dan provider yang benar-benar dipakai.

### 14.1 Kinerja

**NFR-PERF-001 (MUST):** Pada beban demo yang disepakati, endpoint baca sederhana menargetkan p95 di bawah 1 detik, tidak termasuk waktu layanan pihak ketiga.  
**NFR-PERF-002 (MUST):** Operasi tulis kritis harus memberikan hasil sukses/gagal yang eksplisit dan tidak boleh menampilkan sukses sebelum transaksi inti berhasil commit.  
**NFR-PERF-003 (MUST):** Daftar yang berpotensi panjang harus menggunakan pagination atau mekanisme pembatasan yang setara.  
**NFR-PERF-004 (MUST):** Peta, gambar besar, AI, dan notifikasi eksternal tidak boleh memblokir akses terhadap data/status inti yang sudah tersedia.  
**NFR-PERF-005 (SHOULD):** UI upload harus memberi feedback progres/status untuk file yang memerlukan waktu lebih lama.

### 14.2 Keamanan

**NFR-SEC-001 (MUST):** Otorisasi dilakukan di server untuk setiap resource dan aksi terlindungi.  
**NFR-SEC-002 (MUST):** Semua komunikasi publik menggunakan HTTPS.  
**NFR-SEC-003 (MUST):** Secret, password, token sesi, dan credential provider tidak boleh disimpan pada source repository atau dikirim dalam payload client.  
**NFR-SEC-004 (MUST):** Input harus divalidasi dan diproses aman terhadap injection, XSS, CSRF sesuai pola auth, serta broken object-level authorization.  
**NFR-SEC-005 (MUST):** Endpoint berisiko seperti login, recovery, upload, redemption, dan adjustment harus dibatasi sesuai risiko.  
**NFR-SEC-006 (MUST):** File tidak dianggap aman berdasarkan ekstensi/header client saja.  
**NFR-SEC-007 (MUST):** Audit log harus dilindungi dari akses pengguna tidak berwenang dan tidak boleh menyimpan secret.  
**NFR-SEC-008 (MUST):** Kegagalan otorisasi harus fail-closed, bukan memberi akses default.

### 14.3 Privasi

**NFR-PRIV-001 (MUST):** Sistem hanya mengumpulkan data yang diperlukan untuk layanan yang dijelaskan.  
**NFR-PRIV-002 (MUST):** Alamat/lokasi rumah tidak boleh tampil secara publik secara default.  
**NFR-PRIV-003 (MUST):** Kontak warga hanya dapat dilihat petugas yang mendapat tugas relevan dan pihak berwenang sesuai kebutuhan.  
**NFR-PRIV-004 (MUST):** Foto bukti dan dokumen privat membutuhkan pemeriksaan otorisasi sebelum diunduh/dilihat.  
**NFR-PRIV-005 (MUST):** Sponsor mengakses data agregat yang telah disetujui, bukan detail identitas tanpa dasar dan izin.  
**NFR-PRIV-006 (MUST):** Foto tidak boleh digunakan untuk tujuan sekunder/pelatihan AI tanpa tata kelola, dasar, dan persetujuan yang sesuai.  
**NFR-PRIV-007 (MUST):** Retensi, koreksi, dan penghapusan data harus mengikuti kebijakan yang disetujui serta kewajiban yang berlaku.

### 14.4 Ketersediaan dan pemulihan

**NFR-REL-001 (MUST):** Kegagalan provider noninti tidak boleh merusak transaksi domain yang telah berhasil commit.  
**NFR-REL-002 (MUST):** Error kritis harus dapat ditelusuri melalui request/correlation ID dan log terstruktur.  
**NFR-REL-003 (MUST):** Backup data harus diatur sesuai kemampuan deployment yang dipilih.  
**NFR-REL-004 (MUST sebelum pilot):** Prosedur restore database dan pemulihan file penting harus diuji sebelum penggunaan data nyata.  
**NFR-REL-005 (SHOULD):** Tindakan retry harus aman untuk operasi yang dirancang idempotent.  
**NFR-REL-006 (OPEN):** RTO/RPO formal belum ditetapkan dan harus diputuskan sebelum produksi/pilot dengan komitmen layanan tertentu.

### 14.5 Maintainability dan observability

**NFR-MNT-001 (MUST):** Kode harus dipisahkan berdasarkan domain dengan tanggung jawab yang jelas sesuai SDD.  
**NFR-MNT-002 (MUST):** Aturan bisnis inti harus berada di backend/domain layer, bukan disalin sebagai logika berbeda pada banyak komponen UI.  
**NFR-MNT-003 (MUST):** Skema database dikelola dengan migrasi terversi dan dapat dijalankan dari database kosong.  
**NFR-MNT-004 (MUST):** Error, metrik teknis, event domain, dan audit harus dibedakan agar observabilitas tidak menggantikan audit bisnis.  
**NFR-MNT-005 (SHOULD):** Modul memiliki unit test dan dokumentasi kontrak sesuai tingkat risikonya.

### 14.6 Skalabilitas

**NFR-SCALE-001 (MUST):** Model data tidak mengasumsikan satu petugas, satu kategori, satu area, atau satu mitra.  
**NFR-SCALE-002 (MUST):** Transaksi ledger dan batch harus mempertahankan integritas saat ada permintaan bersamaan.  
**NFR-SCALE-003 (SHOULD):** Query lokasi harus memakai indeks yang sesuai jika data koordinat/geometri digunakan.  
**NFR-SCALE-004 (SHOULD):** Pemrosesan AI, notifikasi, dan laporan berat sebaiknya dipisahkan dari transaksi inti jika beban meningkat.

### 14.7 Kompatibilitas dan aksesibilitas

**NFR-UX-001 (MUST):** UI responsif harus bisa digunakan pada browser ponsel dan desktop yang didukung.  
**NFR-UX-002 (MUST):** Fungsi utama dapat diakses dengan keyboard dan label kontrol terkait harus dapat dipahami teknologi bantu yang digunakan.  
**NFR-UX-003 (MUST):** Status tidak dibedakan hanya berdasarkan warna.  
**NFR-UX-004 (MUST):** Pesan validasi ditautkan secara visual ke field yang bermasalah dan tidak hanya mengandalkan toast yang segera hilang.  
**NFR-UX-005 (MUST):** Bahasa utama UI adalah Bahasa Indonesia; format angka, tanggal, dan waktu mengikuti konteks lokal yang sudah ditetapkan.  
**NFR-UX-006 (SHOULD):** UI sebaiknya tetap dapat menampilkan histori/status tersimpan walau layanan peta/AI/provider eksternal tidak tersedia.

### 14.8 Kesesuaian dan operasionalisasi

**NFR-OPS-001 (MUST):** Environment development, test, demo, dan produksi harus dipisahkan minimal melalui konfigurasi dan data yang sesuai.  
**NFR-OPS-002 (MUST):** Endpoint health/readiness tidak boleh mengekspos rahasia atau data pribadi.  
**NFR-OPS-003 (MUST):** Log tidak boleh merekam password, token, secret, atau payload pribadi yang tidak diperlukan.  
**NFR-OPS-004 (MUST):** Sebelum pilot, owner harus menetapkan prosedur incident response, backup, restore, retensi, dan akses admin darurat.

---

## 15. Kebutuhan Keamanan, Privasi, dan Audit

### 15.1 Model ancaman minimum

Sistem harus mempertimbangkan setidaknya: pengguna mencoba membaca setoran milik orang lain; user memalsukan role di client; Collector mengubah berat tanpa kewenangan; klaim tugas ganda; pengulangan request penerbitan poin/redemption; buyer membaca batch mitra lain; upload file berbahaya/terlalu besar; ekspor data tanpa izin; serta manipulasi status atau budget.

### 15.2 Persyaratan kontrol

**REQ-SEC-001 (MUST):** Backend memeriksa ownership untuk profil, alamat, pickup, ledger, redemption, bukti, dan data personal lainnya.  
**REQ-SEC-002 (MUST):** Backend memeriksa scope assignment/partner/area sebelum mengungkap data alamat, kontak, atau transaksi operasional.  
**REQ-SEC-003 (MUST):** Semua aksi perubahan role, berat final, reward/ledger, budget, alokasi batch, penerimaan material, dan override status memerlukan permission yang sesuai.  
**REQ-SEC-004 (MUST):** Mutasi berbasis cookie harus memakai proteksi CSRF yang sesuai rancangan sesi dan deployment.  
**REQ-SEC-005 (MUST):** Sistem harus menghindari IDOR dengan otorisasi object-level pada setiap read/write resource.  
**REQ-SEC-006 (MUST):** File memakai object key yang dibuat server; path bebas dari client tidak boleh digunakan untuk menentukan lokasi file.  
**REQ-SEC-007 (MUST):** Akses download privat harus memakai signed URL berumur pendek atau endpoint proxy yang memeriksa izin.  
**REQ-SEC-008 (MUST):** Audit event harus dibuat untuk tindakan sensitif dan tidak dapat diubah oleh pengguna biasa.  
**REQ-SEC-009 (MUST):** Ekspor harus mengikuti filter/permission, dan event ekspor harus tercatat.  
**REQ-SEC-010 (MUST):** Admin override harus mempunyai guard, alasan, event before/after yang diperbolehkan, serta referensi kasus bila relevan.

### 15.3 Audit minimal

Audit untuk aksi kritis setidaknya mencatat actor, aksi, jenis resource, ID resource, waktu, hasil, alasan saat diwajibkan, nilai sebelum/sesudah untuk field yang relevan dan aman dicatat, serta request/correlation ID jika tersedia. Detail sensitif seperti password, token, dan secret tidak boleh masuk ke audit log.

### 15.4 Insiden dan pemulihan

Sebelum pilot, operator harus menentukan saluran pelaporan insiden, pihak yang berwenang menonaktifkan akses, prosedur pencabutan sesi, pemulihan data, serta proses pemberitahuan kepada pihak terdampak jika diwajibkan. SRS tidak menetapkan kebijakan hukum spesifik; prosedur final harus ditinjau sesuai kewajiban yang berlaku.

---

## 16. Kebutuhan UX/UI dan Aksesibilitas

**REQ-UX-101 (MUST):** Dashboard User dan Collector harus memiliki menu/tugas prioritas yang jelas serta tidak mencampur fungsi yang tidak relevan dengan role aktif.  
**REQ-UX-102 (MUST):** Switch role harus menunjukkan role aktif, role yang menunggu verifikasi, dan role yang tidak tersedia secara berbeda.  
**REQ-UX-103 (MUST):** Form setoran harus mengelompokkan kategori, perkiraan jumlah, kondisi, lokasi, jadwal, catatan, dan foto jika disyaratkan oleh layanan.  
**REQ-UX-104 (MUST):** Panduan kategori harus tersedia sebelum pengguna mengirim permintaan dan menunjukkan batas penerimaan/kontaminan utama.  
**REQ-UX-105 (MUST):** Status pickup harus memiliki label, timestamp pembaruan, dan langkah berikutnya yang relevan.  
**REQ-UX-106 (MUST):** Berat final, kalkulasi poin, serta alasan penolakan/koreksi harus disajikan secara transparan kepada pihak yang berhak.  
**REQ-UX-107 (MUST):** User tidak boleh melihat aksi yang tampak tersedia namun ditolak secara rutin karena role tidak sesuai; aksi yang tidak tersedia harus disembunyikan/dinonaktifkan dengan penjelasan yang layak.  
**REQ-UX-108 (MUST):** Form yang gagal validasi harus mempertahankan nilai non-sensitif yang telah dimasukkan selama aman.  
**REQ-UX-109 (MUST):** Aksi pembatalan, penukaran, penyesuaian, dan konfirmasi penerimaan menampilkan ringkasan serta konfirmasi yang sesuai.  
**REQ-UX-110 (SHOULD):** Untuk jaringan yang lemah, UI sebaiknya memberi indikator sedang menyimpan dan status terbaru yang berhasil tersimpan.  
**REQ-UX-111 (MUST):** AI, bila aktif, harus diberi label sebagai saran dan menyediakan jalan koreksi manual.  
**REQ-UX-112 (MUST):** Sistem harus menyediakan empty state dan pesan saat layanan kategori, slot, atau mitra belum tersedia; tidak boleh sekadar menampilkan daftar kosong tanpa konteks.

---

## 17. Use Case dan Skenario Operasional

### 17.1 UC-01 — Registrasi dan masuk

**Aktor:** Guest. **Prasyarat:** aplikasi tersedia. **Alur utama:** pengguna mengisi formulir registrasi, server memvalidasi field dan keunikan identitas, akun dibuat, pengguna masuk, sesi dibuat, dan dashboard default ditampilkan. **Alur alternatif:** data tidak valid, identitas duplikat, kredensial gagal, rate limit tercapai, atau provider autentikasi gagal. Sistem harus menampilkan pesan yang sesuai tanpa membocorkan detail akun atau menganggap sesi berhasil dibuat.

### 17.2 UC-02 — Mengajukan role Collector dan switch role

**Aktor:** User, Admin. **Prasyarat:** user sudah login. **Alur utama:** user mengajukan role dengan data minimum; status menjadi pending; admin meninjau; admin menyetujui atau menolak dengan alasan; role aktif setelah persetujuan; user memilih role aktif di UI. **Pengecualian:** role pending/suspended tidak boleh mengakses operasi Collector; switch role tidak mengubah user ID, ownership, atau sesi secara tidak aman.

### 17.3 UC-03 — Membuat setoran

**Aktor:** User. **Prasyarat:** login dan layanan sesuai kategori/area tersedia. **Alur utama:** user membaca panduan, memilih kategori/subkategori, mengisi estimasi jumlah/kondisi, lokasi, jadwal, catatan dan foto bila perlu; server memvalidasi jalur/ketersediaan slot; permintaan tersimpan dengan ID dan status awal; user melihat konfirmasi. **Pengecualian:** slot penuh, kategori nonaktif, area di luar layanan, jalur pengolahan tidak tersedia, atau data wajib tidak valid; permintaan tidak boleh dibuat sebagai aktif.

### 17.4 UC-04 — Collector menerima dan menyelesaikan tugas

**Aktor:** Collector terverifikasi. **Prasyarat:** tugas memenuhi area, kategori, jadwal, dan status. **Alur utama:** Collector melihat daftar tugas yang tersedia, membuka detail yang diizinkan, mengklaim tugas, sistem mengunci assignment secara atomik, Collector memperbarui status melalui transisi sah, melakukan inspeksi, mencatat timbang, melampirkan bukti, lalu menandai serah terima/penyelesaian sesuai SOP. **Pengecualian:** tugas telah diambil, alamat tidak ditemukan, material tidak sesuai, warga tidak ada, akses terhalang, atau situasi tidak aman; Collector mencatat status kendala/alasan dan tidak memalsukan penyelesaian.

### 17.5 UC-05 — Verifikasi berat dan penerbitan poin

**Aktor:** Collector/aktor berizin, sistem reward, User. **Prasyarat:** inspeksi dan data berat tersedia. **Alur utama:** backend memvalidasi berat kotor/tara/bersih, kualitas, kategori, versi aturan, batas program, serta budget jika berlaku; bila eligible, sistem menghitung poin secara deterministik, membuat ledger entry unik, memperbarui saldo/proyeksi, dan menampilkan histori kepada user. **Pengecualian:** berat invalid, kategori tidak eligible, rule kedaluwarsa, budget habis, request retry, atau verifikasi pending. Tidak boleh ada poin ganda; reward dapat ditahan atau tidak diterbitkan sesuai policy.

### 17.6 UC-06 — Mengoreksi berat atau reward

**Aktor:** Admin/aktor berizin dan pihak terkait. **Prasyarat:** transaksi sudah tercatat. **Alur utama:** aktor membuka transaksi, memasukkan koreksi beserta alasan/bukti, sistem memvalidasi izin dan dampak, membuat revision/event, membuat adjustment/reversal ledger bila diperlukan, dan mencatat audit. **Pengecualian:** actor tanpa permission ditolak; transaksi historis tidak dihapus; pengguna melihat perubahan sesuai hak akses.

### 17.7 UC-07 — Menangani organik atau limbah khusus

**Aktor:** User, Collector, Admin, mitra pengolah. **Prasyarat:** jenis kategori diketahui dan jalur layanan diverifikasi. **Alur utama organik:** sistem memeriksa slot serta kapasitas fasilitas; petugas mencatat kontaminasi/berat; penyaluran ke fasilitas dicatat. **Alur utama limbah khusus:** sistem memeriksa jalur spesifik; bila tidak ada, pickup biasa dicegah dan pengguna mendapat petunjuk aman. **Pengecualian:** jika jenis tidak jelas atau kondisi tidak aman, proses ditahan/ditolak untuk review manusia; tidak ada klaim pengolahan tanpa konfirmasi.

### 17.8 UC-08 — Membentuk batch dan mengirim material

**Aktor:** Admin/operasional, Buyer/Processor. **Prasyarat:** material tervalidasi dan mitra terdaftar. **Alur utama:** operator memasukkan material ke batch beserta kategori/berat/sumber; batch ditawarkan/dialokasikan sesuai rule; delivery dibuat dengan berat kirim dan bukti; penerima mencatat berat diterima/kondisi; sistem menghitung selisih dan status; transaksi ditutup setelah prasyarat terpenuhi. **Pengecualian:** alokasi melebihi stok, offer kedaluwarsa, mitra tidak sesuai, selisih signifikan, atau penerimaan ditolak; sistem menolak atau menandai dispute, bukan menghapus histori.

### 17.9 UC-09 — Melihat pendanaan dan melakukan rekonsiliasi

**Aktor:** Finance/Administrator berizin. **Prasyarat:** akses domain finance. **Alur utama:** aktor memilih program/periode, melihat anggaran, pemakaian, transaksi dan nilai pembanding, memasukkan data rekonsiliasi, menambahkan alasan/bukti, menyimpan hasil/status review. **Pengecualian:** selisih tetap ditampilkan sebagai exception; finance tidak otomatis berwenang mengoreksi timbang/reward rule; perubahan dicatat dalam audit.

### 17.10 UC-10 — Menangani notifikasi dan gangguan provider

**Aktor:** Sistem dan penerima notifikasi. **Alur utama:** peristiwa domain berhasil commit, notifikasi in-app dibuat, kanal eksternal diproses jika aktif, penerima membaca notifikasi dan membuka resource melalui pemeriksaan akses. **Pengecualian:** provider gagal atau timeout; transaksi inti tetap berhasil, notification state dapat retry dan resource tetap terlindungi.

---

## 18. Kebutuhan Pelaporan dan Metrik

### 18.1 Metrik operasi

Sistem sebaiknya menghitung dan menampilkan jumlah permintaan dibuat, diterima petugas, selesai, dibatalkan, ditolak, memerlukan jadwal ulang, waktu dari permintaan ke penjemputan, kelengkapan bukti, dan alasan kendala. Semua metrik harus mempunyai definisi status dan rentang waktu yang jelas.

### 18.2 Metrik material

Sistem harus membedakan:

1. Berat yang dilaporkan/diestimasi warga.
2. Berat yang diverifikasi petugas.
3. Berat material yang masuk batch.
4. Berat yang dialokasikan kepada buyer.
5. Berat yang dikirim.
6. Berat yang diterima.
7. Berat yang dilaporkan diproses lebih lanjut dengan konfirmasi yang sesuai.

Nilai-nilai ini tidak boleh dijumlahkan seolah-olah merupakan material terpisah apabila sebenarnya merupakan tahap berbeda dari material yang sama.

### 18.3 Metrik reward dan pendanaan

Laporan dapat mencakup poin diterbitkan, penukaran, reversal/adjustment, biaya reward per kategori/berat eligible, budget awal, penggunaan, sisa, komitmen jika didefinisikan, serta selisih rekonsiliasi. Definisi akuntansi final harus ditetapkan oleh pengelola yang berwenang.

### 18.4 Metrik kualitas dan keselamatan

Laporan dapat mencakup persentase kontaminasi, alasan penolakan, jumlah kasus limbah khusus yang diarahkan ke jalur tepat, selisih berat kirim/terima, serta tingkat kelengkapan bukti. Data ini harus diberi denominator, periode, dan batas interpretasi.

### 18.5 Klaim dampak

Angka pengurangan emisi, pengalihan dari TPA, atau jumlah material yang benar-benar didaur ulang hanya boleh dipublikasikan bila metode, faktor, cakupan data, dan sumber konfirmasi telah disetujui. Tanpa data tersebut, laporan harus menyatakan metrik operasional yang dapat dibuktikan, bukan mengestimasi dampak seolah-olah terverifikasi.

---

## 19. Penanganan Kegagalan dan Edge Case

| ID | Kondisi | Respons wajib |
|---|---|---|
| EC-001 | Login gagal/rate limit | Pesan aman dan jelas; tidak mengungkap akun terdaftar |
| EC-002 | Role Collector masih pending/suspended | Endpoint operasi ditolak; status dapat dijelaskan ke pemilik akun |
| EC-003 | Dua Collector mengklaim tugas yang sama | Satu transaksi berhasil; request lain menerima konflik; tidak ada double assignment |
| EC-004 | Slot penuh saat submit berlangsung | Tidak membuat booking melebihi kapasitas; tawarkan slot alternatif bila tersedia |
| EC-005 | Kategori nonaktif setelah halaman dibuka | Server menolak transaksi baru dengan kategori tersebut dan memberi pesan yang jelas |
| EC-006 | Alamat di luar area layanan | Permintaan tidak dibuat sebagai layanan aktif |
| EC-007 | Foto gagal di-upload | UI menunjukkan gagal; tidak mencatat bukti lengkap |
| EC-008 | Berat bersih negatif/tidak valid | Ditolak oleh validasi server dan database yang relevan |
| EC-009 | Poin diterbitkan ulang akibat retry | Idempotency/constraint mencegah ledger ganda |
| EC-010 | Rule reward berubah setelah timbang | Transaksi menggunakan versi/ketentuan yang berlaku sesuai policy dan menyimpan snapshot |
| EC-011 | Budget habis di antara dua request | Penerbitan dikendalikan atomik; hasil mengikuti kebijakan hold/stop yang disetujui |
| EC-012 | User menukar poin bersamaan di dua tab | Saldo dikunci/diperiksa atomik; tidak terjadi overspend |
| EC-013 | Koreksi setelah reward terbit | Revisi timbang dan reversal/adjustment tercatat; histori lama dipertahankan |
| EC-014 | Batch dialokasikan melebihi stok | Operasi ditolak; stok dan alokasi tidak berubah sebagian |
| EC-015 | Offer kedaluwarsa | Offer tidak dapat diterima kecuali diperpanjang secara sah dan tercatat |
| EC-016 | Berat penerimaan berbeda dari berat kirim | Catat perbedaan; buka review/dispute sesuai threshold/kebijakan |
| EC-017 | Buyer membuka ID batch milik pihak lain | Server menolak berdasarkan object-level authorization |
| EC-018 | Provider notifikasi timeout | Transaksi domain tetap committed; notifikasi dapat retry dan status dicatat |
| EC-019 | AI memberi kategori low-confidence/berisiko | Minta review atau koreksi manusia; tidak ada approval khusus otomatis |
| EC-020 | Peta/geocoding gagal | Input manual yang diizinkan tetap berjalan |
| EC-021 | Status client berbeda dari server | Server menjadi sumber kebenaran; UI memuat ulang status terbaru |
| EC-022 | Ekspor laporan tanpa permission | Server menolak; percobaan dicatat sesuai kebijakan audit |
| EC-023 | Admin menggunakan override | Permission, alasan, actor, before/after, serta resource terkait tercatat |
| EC-024 | Data demo terlihat pada laporan | Laporan memberi label simulasi dan mencegah klaim penggunaan lapangan palsu |
| EC-025 | Fasilitas tidak dapat menerima organik | Slot/jalur tidak ditawarkan atau permintaan diproses sesuai policy reschedule/reject |
| EC-026 | Limbah khusus tidak memiliki jalur resmi yang terverifikasi | Jangan membuat pickup reguler; tampilkan panduan aman yang disetujui |

---

## 20. Kriteria Penerimaan Sistem

Kriteria berikut dipakai sebagai gate untuk MVP. Setiap butir harus didemonstrasikan atau diuji pada environment yang disepakati.

**AC-001 — Akun:** pengguna dapat registrasi/login/logout; credential tidak disimpan plaintext; sesi tidak valid ditolak.  
**AC-002 — Role:** pengajuan Collector memerlukan review; role pending tidak dapat mengambil tugas; switch role tidak mengubah ownership data.  
**AC-003 — Otorisasi:** request dengan role palsu atau ID resource milik pengguna lain ditolak server.  
**AC-004 — Kategori:** empat kategori utama tersedia; kategori nonaktif atau tidak memiliki jalur aktif tidak dapat dijadwalkan sebagai layanan tersedia.  
**AC-005 — Jadwal:** slot penuh tidak dapat dipesan melebihi kapasitas; jadwal ditampilkan dengan zona waktu yang benar.  
**AC-006 — Setoran:** User dapat membuat setoran valid dan melihat status/riwayatnya; input invalid mendapat pesan spesifik.  
**AC-007 — Assignment:** dua request bersamaan untuk klaim task yang sama tidak menghasilkan dua assignment aktif.  
**AC-008 — Status:** transisi ilegal ditolak; transisi sah membuat histori actor/waktu dan alasan bila diperlukan.  
**AC-009 — Bukti:** upload sukses tersimpan beserta metadata; user yang tidak berwenang tidak dapat mengakses file.  
**AC-010 — Timbang:** berat bersih konsisten; nilai negatif/invalid ditolak; koreksi mempertahankan nilai lama dan alasan.  
**AC-011 — Reward:** reward hanya diterbitkan setelah verifikasi; retry tidak menggandakan poin; rule version dapat ditelusuri.  
**AC-012 — Ledger:** adjustment/reversal tidak menghapus entry asal dan saldo konsisten dengan ledger.  
**AC-013 — Budget:** penerbitan reward tidak melampaui batas budget saat transaksi bersamaan.  
**AC-014 — Redemption:** bila diaktifkan, redemption tidak dapat memakai saldo yang sama dua kali dan debit/reversal terdokumentasi.  
**AC-015 — Organik:** jadwal organik mengikuti kapasitas dan jalur pengolah aktif; status proses tidak diklaim tanpa konfirmasi.  
**AC-016 — Limbah khusus:** jalur reguler ditolak bila prosedur/mitra yang sesuai tidak tersedia.  
**AC-017 — Batch:** batch dapat ditelusuri ke sumber; alokasi/delivery tidak melebihi stok; berat kirim dan terima berbeda sebagai field/peristiwa terpisah.  
**AC-018 — Partner scope:** buyer hanya dapat melihat batch/offer/delivery terkait mitranya.  
**AC-019 — Finance:** rekonsiliasi menampilkan discrepancy; perubahan finansial diaudit; finance tidak otomatis dapat mengubah data timbang.  
**AC-020 — Notifikasi:** notifikasi in-app dibatasi ke penerima; kegagalan provider eksternal tidak membatalkan transaksi utama.  
**AC-021 — Laporan:** collected, shipped, received, dan processed terkonfirmasi ditampilkan berbeda.  
**AC-022 — Export:** ekspor mematuhi permission dan filter; export event tercatat.  
**AC-023 — Data demo:** data simulasi dapat dikenali dan tidak diklaim sebagai hasil nyata.  
**AC-024 — Pemulihan:** migrasi schema berjalan dari database kosong; backup/restore diuji sebelum pilot.  
**AC-025 — Dokumentasi:** kontrak endpoint, env vars, kebijakan status, reward, kategori, retensi, dan prosedur operasional tersedia untuk tim.

---

## 21. Strategi Verifikasi dan Validasi

### 21.1 Jenis verifikasi

- **Unit test:** formula berat, formula reward, pembulatan, eligibility, policy transition, validasi slot, pembatasan batch, dan perhitungan saldo.
- **Integration test:** auth → pickup; pickup → assignment; timbang → reward ledger; correction → reversal; batch → delivery → receipt; notification failure → transaksi tetap tersimpan.
- **API contract test:** skema request/response, HTTP status, validasi field, error format, pagination, dan authorization.
- **Security test:** IDOR, forged role, CSRF sesuai auth, upload file, rate limit, export access, scope buyer, dan secret scanning.
- **Concurrency test:** claim task, booking slot terakhir, issuance reward, redemption, budget consumption, dan alokasi batch.
- **End-to-end test:** perjalanan warga, perjalanan Collector, review admin, buyer receipt, dan laporan agregat.
- **UAT:** uji keterpahaman formulir, panduan pemilahan, switch role, status, berat, reward, penolakan, dan bantuan pada koneksi lemah.
- **Operational test:** validasi lapangan terhadap SOP, kategori, alat timbang, kapasitas petugas, mitra, jalur organik, limbah khusus, dan prosedur penolakan.

### 21.2 Exit criteria minimum

MVP dapat dinyatakan siap demo jika semua requirement MUST yang diaktifkan lulus test yang relevan; tidak ada defect kritis terkait privilege escalation, poin ganda, assignment ganda, pengiriman data pribadi lintas akun, atau klaim status pengolahan yang tidak didukung. Semua skenario dengan dependensi belum tersedia harus menunjukkan fallback dan tidak menyamar sebagai sukses.

MVP tidak boleh dinyatakan siap pilot lapangan hanya berdasarkan demo. Pilot memerlukan validasi operasi/mitra, kebijakan reward dan sumber dana, SOP keselamatan, retensi data, backup/restore, prosedur insiden, serta persetujuan pengelola.

---

## 22. Matriks Keterlacakan PRD–HRD–SDD–SRS

Matriks berikut menghubungkan kebutuhan tingkat tinggi HRD ke requirement SRS dan pengujian. ID HRD mengacu ke matriks pada dokumen HRD.

| HRD | Kapabilitas | Requirement SRS utama | Desain SDD | Verifikasi |
|---|---|---|---|---|
| HR-001 | Registrasi/login aman | REQ-AUTH-001–010 | Auth/session/API | Auth, rate-limit, recovery test |
| HR-002 | Satu akun multi-role | REQ-IAM-001, 004, 014 | Identity/user_roles | Switch-role UAT |
| HR-003 | Verifikasi Collector | REQ-IAM-002, 003, 011–013 | Role application | Permission/integration test |
| HR-004 | Switch role tidak mengubah data | REQ-IAM-004–005 | Active role dan policy | Ownership regression test |
| HR-005 | Backend memvalidasi izin | REQ-SEC-001–010, REQ-API-002 | Authorization layer | Security/IDOR test |
| HR-006 | Kategori dan panduan dikelola | REQ-TAX-001–008, REQ-ADM-001 | Taxonomy/acceptance rules | Admin/category test |
| HR-007 | Setoran kategori, lokasi, jadwal | REQ-COL-006–014 | Collection API/data | Integration test |
| HR-008 | Slot tidak melebihi kapasitas | REQ-COL-001–005 | Slot reservation | Boundary/concurrency test |
| HR-009 | Tugas tidak diklaim ganda | REQ-COL-015–017 | Atomic assignment | Concurrent claim test |
| HR-010 | Status mengikuti transisi | REQ-COL-018, REQ-STATE-001–004 | Pickup state machine | Transition test |
| HR-011 | Bukti terlindungi | REQ-QC-011–013, REQ-NOT-007 | Object storage/access | Upload/access test |
| HR-012 | Berat bersih konsisten | REQ-QC-003–007 | Weight records | Unit/boundary test |
| HR-013 | Kualitas/kontaminasi dicatat | REQ-QC-001–002 | Inspection module | Scenario/UAT |
| HR-014 | Reward mengikuti rule version | REQ-PTS-001–005 | Reward service | Formula/version test |
| HR-015 | Retry tidak menggandakan poin | REQ-PTS-006, REQ-API-005 | Ledger/idempotency | Retry/concurrency test |
| HR-016 | Koreksi ledger terlacak | REQ-PTS-007–009, REQ-ADM-004–007 | Append-only ledger/audit | Reversal/audit test |
| HR-017 | Penukaran dalam saldo | REQ-PTS-012–014 | Redemption flow | Concurrent redemption test |
| HR-018 | Organik punya jalur tersendiri | REQ-ORG-001–005 | Organic routing | Scenario test |
| HR-019 | Limbah khusus tidak masuk jalur umum | REQ-SAF-001–005 | Safety gate | Safety test |
| HR-020 | Batch terhubung ke sumber | REQ-MKT-003–004 | Batch items/traceability | Integrity test |
| HR-021 | Alokasi tidak melebihi stok | REQ-MKT-005, 008 | Inventory locking | Constraint/concurrency test |
| HR-022 | Pengiriman dan penerimaan dibedakan | REQ-MKT-009–012 | Delivery/receipt | Marketplace test |
| HR-023 | Buyer hanya melihat data relevan | REQ-MKT-013, REQ-IAM-007 | Partner scope policies | Object authorization test |
| HR-024 | Admin mengelola mitra/aturan | REQ-MKT-001–002, REQ-ADM-001–003 | Partner/admin modules | Admin test |
| HR-025 | Dashboard membedakan status material | REQ-RPT-007, 011 | Reporting queries | Metric validation |
| HR-026 | Sponsor melihat data agregat | REQ-IAM-008, NFR-PRIV-005 | Reporting scope | Privacy access test |
| HR-027 | Tindakan kritis dicatat | REQ-ADM-004–008, REQ-SEC-008 | Audit log | Audit test |
| HR-028 | Kegagalan notifikasi tidak merusak transaksi | REQ-NOT-001–008, REQ-DEP-003 | Notification adapter/outbox | Failure injection |
| HR-029 | Data demo ditandai simulasi | REQ-RPT-010, REQ-DAT-007 | Demo data labels | Review dataset/UI |
| HR-030 | Klaim dampak berbasis bukti | REQ-RPT-011 | Reporting definitions | Content/data review |

### 22.1 Keterlacakan level produk

| Prinsip/tujuan PRD | Requirement SRS | Bukti penerimaan |
|---|---|---|
| Satu akun dapat memiliki role User dan Collector | REQ-IAM-001–016 | User ID/ownership tetap saat switch role |
| Reward setelah verifikasi | REQ-QC-003–010, REQ-PTS-001–015 | Ledger tidak terbit sebelum syarat terpenuhi |
| Jalur sampah berbeda | REQ-TAX-001–008, REQ-ORG-001–005, REQ-SAF-001–005 | Skenario kategori/rute lolos |
| End-to-end traceability | REQ-COL-013–014, REQ-MKT-003–012 | Setoran dapat dilacak ke batch/delivery/receipt |
| Ekonomi bertanggung jawab | REQ-FIN-001–009, REQ-PTS-010 | Budget dan transaksi dapat direkonsiliasi |
| Privasi minimum | NFR-PRIV-001–007, REQ-SEC-001–010 | Tidak ada kebocoran data lintas role |
| Tidak mengklaim proses tanpa bukti | REQ-MKT-012, REQ-ORG-005, REQ-RPT-011 | Status/pelaporan tervalidasi |

---

## 23. Prioritas dan Batas Rilis

### 23.1 MUST — MVP inti

- Registrasi/login/logout, sesi, profil, role, dan otorisasi server.
- Pengajuan dan verifikasi role Collector serta switch role.
- Kategori utama dan panduan, area layanan, slot aktif.
- Pembuatan setoran, daftar tugas, klaim atomik, status dan histori.
- Inspeksi, timbang, bukti, validasi dan koreksi berizin.
- Reward rule berversi, ledger idempotent, saldo, audit.
- Gating organik/limbah khusus berdasarkan jalur yang aktif.
- Batch dan pencatatan setidaknya jalur material ke mitra untuk skenario demo/operasional yang disepakati.
- Scope akses buyer/mitra, notifikasi in-app, laporan material dan audit.
- Validasi input, keamanan dasar, migrasi, backup sesuai deployment, serta data demo berlabel.

### 23.2 SHOULD — Rilis setelah alur utama stabil

- Pemulihan password lengkap bila provider mendukung.
- Pembatalan yang lebih lengkap, dispute, penjadwalan ulang, dan workflow koreksi lanjutan.
- Katalog reward/redemption dengan stok/masa berlaku yang dikelola.
- Offer buyer, pencocokan berdasarkan kebutuhan, dan rekonsiliasi delivery.
- Ekspor CSV dengan audit, notifikasi email/push, dan dashboard sponsor/finance yang lebih lengkap.
- Outbox/retry worker untuk integrasi eksternal.

### 23.3 COULD — Nilai tambah

- Saran klasifikasi material berbasis AI dengan review manusia.
- Peta/geocoding yang mempunyai fallback manual.
- Pengelolaan merchant/voucher yang lebih terintegrasi.
- Analitik lanjutan dan rekomendasi optimasi pengumpulan.
- Integrasi API mitra apabila akses dan dukungan teknis sudah terkonfirmasi.

### 23.4 WON'T — Bukan rilis MVP

- Pembayaran tunai otomatis dan dompet uang umum.
- Penimbangan final hanya dari kamera/AI.
- Pemrosesan limbah khusus secara mandiri oleh aplikasi/pengelola tanpa jalur berwenang.
- Klaim karbon atau dampak lingkungan otomatis tanpa metodologi yang disetujui.
- Janji pembelian/penjualan universal bagi semua material.
- Integrasi seluruh wilayah/otoritas/mitra sekaligus.

### 23.5 Aturan pemotongan scope

Jika waktu pengembangan terbatas, prioritaskan alur yang aman dan lengkap daripada banyak layar tanpa transaksi konsisten. Fungsi COULD dapat dinonaktifkan. Jangan menghilangkan validasi backend, ledger/audit, status yang akurat, privasi bukti, kontrol kapasitas, atau jalur keselamatan demi mempercepat demo.

---

## 24. Risiko dan Keputusan Terbuka

### 24.1 Keputusan operasional yang harus disetujui

1. Wilayah pilot dan cakupan alamat/area.
2. Kategori/subkategori yang benar-benar diterima per area.
3. Slot, kapasitas, SLA, prosedur pembatalan, dan penjadwalan ulang.
4. SOP inspeksi, penimbangan, tara, toleransi, bukti, dan keberatan.
5. Periode pengajuan keberatan atas berat/reward.
6. Formula poin, pembulatan, batas per transaksi/periode, kualitas, expiry, dan kebijakan budget habis.
7. Benefit redemption dan apakah katalog penukaran diaktifkan saat MVP.
8. Mitra pengolah, persyaratan penerimaan, kapasitas, dan prosedur penolakan.
9. Jalur limbah khusus serta instruksi aman yang boleh ditampilkan.
10. Pemilik kebijakan data, retensi, penghapusan, dan penanganan insiden.

### 24.2 Keputusan teknis yang harus dikunci tim

1. Metode auth dan manajemen sesi.
2. Database migration strategy dan pilihan enum/reference table.
3. Model assignment history dan kebijakan multi-petugas.
4. Batas berat maksimum, unit, presisi, dan pembulatan.
5. Strategi idempotensi untuk ledger, redemption, booking, dan batch allocation.
6. Provider object storage, signed URL/proxy, batas file, dan retensi.
7. Provider notifikasi/maps/AI jika diaktifkan dan pemilik credential.
8. Target performa yang akan diukur pada environment demo/pilot.
9. Backup frequency, RTO/RPO, restore runbook, dan monitoring/alert.
10. Pihak yang dapat melakukan ekspor, override, koreksi, dan penyesuaian ledger.

### 24.3 Risiko dan mitigasi

| Risiko | Dampak | Mitigasi dalam SRS |
|---|---|---|
| Harga/insentif belum divalidasi | Reward tidak berkelanjutan | Rule berversi, budget guard, tidak menjanjikan uang tunai |
| Mitra belum memastikan penerimaan | Material menumpuk/ditolak | Acceptance rule aktif, status jelas, tidak menjanjikan jalur yang belum terkonfirmasi |
| Manipulasi berat/bukti | Reward tidak adil | Actor, bukti, koreksi berizin, audit, ledger append-only |
| Double claim/retry | Tugas, poin, atau stok ganda | Atomic transaction, unique constraint, idempotency |
| Kebocoran alamat/foto | Risiko privasi dan keselamatan | Least privilege, object-level authorization, file privat |
| AI salah klasifikasi | Salah rute/risiko keselamatan | AI hanya saran, review manusia, fallback manual |
| Provider eksternal gagal | Layanan tambahan terganggu | Adapter, timeout, retry, jalur manual, transaksi inti tetap commit |
| Klaim dampak berlebihan | Hilangnya kepercayaan | Definisi metrik, provenance data, larangan klaim tanpa bukti |
| Lingkup terlalu besar untuk hackathon | Produk tidak selesai | Prioritas MUST dan pemotongan scope terkontrol |

---

## 25. Glosarium

| Istilah | Definisi dalam SRS |
|---|---|
| User | Pengguna yang membuat setoran dan melihat data miliknya sendiri |
| Collector | Petugas pengangkut yang sudah diverifikasi untuk tindakan operasional |
| Admin/Operator | Aktor yang mengelola konfigurasi dan kasus berdasarkan permission |
| Finance | Aktor dengan permission terbatas untuk pendanaan, transaksi, dan rekonsiliasi |
| Buyer/Processor | Mitra penerima atau pengolah material |
| Sponsor | Pihak yang mendukung program dan melihat laporan agregat yang disetujui |
| Pickup request | Permintaan layanan/setoran dan penjemputan yang tercatat di sistem |
| Assignment | Hubungan aktif antara tugas dan petugas yang ditunjuk |
| Inspection/QC | Pemeriksaan kondisi dan kelayakan material |
| Berat kotor | Berat material termasuk wadah, bila ada |
| Tara | Berat wadah yang dikurangkan dari berat kotor |
| Berat bersih | Berat setelah tara dikurangkan |
| WastePoints | Poin insentif program yang dicatat dalam ledger; bukan otomatis uang tunai |
| Ledger | Catatan transaksi poin yang append-only dan dapat direkonsiliasi |
| Reward rule | Aturan berversi untuk menghitung kelayakan/jumlah poin |
| Batch | Kumpulan material terverifikasi untuk disimpan, ditawarkan, dialokasikan, atau dikirim |
| Offer | Penawaran/kesepakatan yang diajukan buyer atas batch |
| Delivery | Catatan pengiriman material dari pihak pengirim ke penerima |
| Receipt/acceptance | Konfirmasi penerimaan yang mencatat berat/kondisi yang diterima |
| Residual | Sampah residu yang bukan material daur ulang/organik yang diterima pada rute tertentu |
| Limbah khusus | Material yang memerlukan panduan atau jalur penanganan khusus |
| Idempotency | Jaminan bahwa pengulangan request yang sama tidak menggandakan efek transaksi |
| Audit log | Rekaman tindakan penting untuk akuntabilitas dan pemeriksaan |
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| HRD | High-Level Requirements Document |
| SDD | Software Design Document |
| MVP | Minimum Viable Product; rilis awal dengan lingkup inti terbatas |
| WITA | Waktu Indonesia Tengah; zona waktu pilot (`Asia/Makassar`) |

---

## 26. Lampiran A — Katalog API Referensi

Daftar ini mengikuti kontrak desain dalam SDD. Endpoint yang tidak diperlukan untuk lingkup rilis dapat ditunda, tetapi perilaku keamanan dan kebutuhan bisnisnya tetap berlaku apabila fitur tersebut diaktifkan.

### 26.1 Auth dan profil

| Method | Endpoint | Fungsi | Akses minimum |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Registrasi akun | Publik, rate-limited |
| POST | `/api/v1/auth/login` | Login | Publik, rate-limited |
| POST | `/api/v1/auth/logout` | Logout/cabut sesi | Authenticated |
| POST | `/api/v1/auth/forgot-password` | Memulai pemulihan | Publik, response aman |
| POST | `/api/v1/auth/reset-password` | Mengatur ulang credential | Token sekali pakai yang valid |
| GET | `/api/v1/me` | Profil sendiri | Authenticated |
| PATCH | `/api/v1/me` | Ubah profil yang diizinkan | Authenticated + ownership |
| GET | `/api/v1/me/roles` | Role dan status | Authenticated |
| POST | `/api/v1/me/active-role` | Ubah preferensi role UI | Authenticated; tidak memberi privilege |
| GET/POST | `/api/v1/me/addresses` | Daftar/tambah alamat sendiri | Authenticated |
| PATCH/DELETE | `/api/v1/me/addresses/{id}` | Ubah/nonaktifkan alamat | Authenticated + ownership |

### 26.2 Role Collector dan kategori

| Method | Endpoint | Fungsi | Akses minimum |
|---|---|---|---|
| POST | `/api/v1/collector-applications` | Mengajukan role | User |
| GET | `/api/v1/collector-applications/me` | Lihat status pengajuan | Applicant |
| GET | `/api/v1/admin/collector-applications` | Daftar pengajuan | Admin permission |
| POST | `/api/v1/admin/collector-applications/{id}/approve` | Menyetujui | Admin permission |
| POST | `/api/v1/admin/collector-applications/{id}/reject` | Menolak dengan alasan | Admin permission |
| POST | `/api/v1/admin/users/{id}/roles/{role}/suspend` | Menangguhkan grant role | Permission khusus |
| GET | `/api/v1/waste-categories` | Daftar kategori/panduan | Sesuai policy |
| GET | `/api/v1/waste-categories/{id}` | Detail kategori | Sesuai policy |
| GET | `/api/v1/material-acceptance-rules` | Aturan penerimaan yang dapat ditampilkan | Scope sesuai policy |
| POST/PATCH | `/api/v1/admin/waste-categories` | Mengelola kategori | Admin |
| POST/PATCH | `/api/v1/admin/material-acceptance-rules` | Mengelola rule penerimaan | Admin/permission khusus |

### 26.3 Pickup, task, dan timbang

| Method | Endpoint | Fungsi | Akses minimum |
|---|---|---|---|
| POST | `/api/v1/pickup-requests` | Membuat setoran | User/actor berizin |
| GET | `/api/v1/pickup-requests/mine` | Riwayat sendiri | User |
| GET | `/api/v1/pickup-requests/{id}` | Detail pickup | Owner/assigned/admin sesuai policy |
| POST | `/api/v1/pickup-requests/{id}/cancel` | Membatalkan | Owner/actor berhak |
| GET | `/api/v1/collector/tasks/available` | Tugas tersedia | Collector verified |
| GET | `/api/v1/collector/tasks/mine` | Tugas milik/ditugaskan | Collector verified |
| POST | `/api/v1/collector/tasks/{id}/accept` | Claim atomik | Collector verified |
| POST | `/api/v1/collector/tasks/{id}/reject` | Menolak/menarik diri sesuai status | Collector terkait |
| POST | `/api/v1/collector/tasks/{id}/status` | Command transisi status | Collector terkait/admin berizin |
| POST | `/api/v1/collector/tasks/{id}/inspection` | Catat inspeksi | Collector assigned |
| POST | `/api/v1/collector/tasks/{id}/weight-records` | Catat timbang | Collector assigned |
| POST | `/api/v1/collector/tasks/{id}/evidence` | Tambahkan bukti | Actor berwenang |
| POST | `/api/v1/admin/pickup-requests/{id}/reassign` | Menugaskan ulang | Admin permission |
| POST | `/api/v1/pickup-requests/{id}/disputes` | Mengajukan sengketa | Pihak yang memenuhi syarat |

### 26.4 WastePoints dan redemption

| Method | Endpoint | Fungsi | Akses minimum |
|---|---|---|---|
| GET | `/api/v1/points/balance` | Saldo sendiri | User authenticated |
| GET | `/api/v1/points/ledger` | Histori ledger sendiri | User authenticated |
| GET | `/api/v1/rewards/catalog` | Katalog benefit | Sesuai policy |
| POST | `/api/v1/rewards/redemptions` | Mengajukan penukaran | User authenticated |
| GET | `/api/v1/rewards/redemptions/mine` | Riwayat redemption sendiri | User authenticated |
| GET | `/api/v1/admin/reward-rules` | Lihat aturan | Admin/Finance berizin |
| POST | `/api/v1/admin/reward-rules` | Membuat versi rule | Admin permission |
| PATCH | `/api/v1/admin/reward-rules/{id}` | Mengubah status field yang diizinkan | Admin + audit |
| POST | `/api/v1/admin/points/adjustments` | Adjustment ledger | Permission khusus + alasan |

### 26.5 Partner, batch, delivery, finance, dan laporan

| Method | Endpoint | Fungsi | Akses minimum |
|---|---|---|---|
| GET | `/api/v1/partners` | Daftar mitra yang dapat dilihat | Sesuai scope |
| POST/PATCH | `/api/v1/admin/partners` | Kelola mitra | Admin |
| GET | `/api/v1/material-batches` | Daftar batch | Admin/Buyer sesuai scope |
| POST | `/api/v1/admin/material-batches` | Membuat batch | Operasional berizin |
| GET | `/api/v1/material-batches/{id}` | Detail batch | Actor berhak |
| POST | `/api/v1/material-batches/{id}/items` | Menambah sumber material | Operasional berizin |
| POST | `/api/v1/material-batches/{id}/offers` | Mengirim offer | Buyer/actor berhak |
| POST | `/api/v1/batch-offers/{id}/accept` | Menerima offer/alokasi | Admin/actor berizin |
| POST | `/api/v1/material-batches/{id}/delivery` | Membuat catatan kirim | Operasional berizin |
| POST | `/api/v1/batch-deliveries/{id}/confirm-receipt` | Konfirmasi penerimaan | Mitra penerima/actor sah |
| POST | `/api/v1/batch-deliveries/{id}/dispute` | Catat selisih/dispute | Pihak transaksi yang sah |
| GET | `/api/v1/admin/dashboard` | Ringkasan operasi | Admin |
| GET | `/api/v1/admin/audit-logs` | Cari audit | Audit permission |
| GET | `/api/v1/admin/reports/collection` | Laporan collection | Admin |
| GET | `/api/v1/admin/reports/rewards` | Laporan reward | Admin/Finance scope |
| GET/POST | `/api/v1/finance/transactions` | Baca/catat transaksi keuangan | Finance scope |
| POST | `/api/v1/finance/reconciliations` | Membuat rekonsiliasi | Finance scope |
| GET | `/api/v1/admin/reports/export.csv` | Ekspor terfilter | Permission khusus + audit |
| GET | `/api/v1/notifications` | Notifikasi sendiri | Authenticated |
| POST | `/api/v1/notifications/{id}/read` | Menandai dibaca | Recipient |
| GET | `/health/live` | Pemeriksaan proses hidup | Infra/public sesuai policy |
| GET | `/health/ready` | Pemeriksaan readiness | Infra/monitoring |

---

## 27. Lampiran B — Paket Uji Penerimaan

### 27.1 Skenario utama

| Test ID | Prasyarat dan langkah | Hasil yang diharapkan |
|---|---|---|
| TST-001 | Daftarkan user dengan data valid lalu login | Akun dan sesi dibuat; dashboard user terbuka |
| TST-002 | Kirim login salah berulang kali | Pesan aman; rate limit sesuai policy; tidak ada detail akun sensitif |
| TST-003 | Ajukan Collector lalu coba klaim tugas sebelum disetujui | Pengajuan berstatus pending; claim ditolak |
| TST-004 | Setujui Collector melalui admin lalu switch role | Dashboard Collector tersedia; user ID tetap sama |
| TST-005 | User mencoba membuka pickup milik user lain | Akses ditolak tanpa bocor data |
| TST-006 | Buat pickup untuk kategori/slot aktif | Pickup tersimpan dengan ID dan status awal |
| TST-007 | Buat pickup untuk kategori nonaktif/di luar area | Request tidak menjadi layanan aktif; pesan menjelaskan sebab |
| TST-008 | Dua Collector mengklaim task bersamaan | Tepat satu assignment aktif; request lain menerima conflict |
| TST-009 | Kirim transisi status yang tidak diizinkan | Server menolak; tidak ada event status palsu |
| TST-010 | Unggah file bukti valid lalu akses sebagai user tak berwenang | Upload tersimpan; akses tak berwenang ditolak |
| TST-011 | Masukkan gross 5 kg dan tare 0,5 kg | Net 4,5 kg sesuai satuan/presisi |
| TST-012 | Masukkan tare lebih besar dari gross | Validasi menolak; tidak ada timbang final |
| TST-013 | Panggil issuance reward sebelum verifikasi | Reward tidak diterbitkan |
| TST-014 | Ulangi issuance dengan key/transaksi sumber yang sama | Satu penerbitan saja pada ledger |
| TST-015 | Koreksi reward yang sudah diterbitkan | Entry asal tetap ada; adjustment/reversal terhubung dan diaudit |
| TST-016 | Dua redemption bersamaan memakai saldo hampir habis | Tidak ada saldo negatif/overspend |
| TST-017 | Kirim offer/alokasi di atas stok batch | Operasi ditolak dan stok tidak berubah |
| TST-018 | Catat delivery dan receipt dengan berat berbeda | Berat tetap terpisah; discrepancy dapat direview |
| TST-019 | Buyer mencoba membuka batch partner lain | Server menolak akses |
| TST-020 | Matikan provider email/push saat pickup dibuat | Pickup tersimpan; event notifikasi gagal/retry tercatat |
| TST-021 | Ajukan limbah khusus tanpa jalur terkonfirmasi | Pickup umum tidak dibuat; instruksi aman tampil |
| TST-022 | Laporan menunjukkan batch yang dikirim dan diterima | Metrik tidak mencampur berat sent dan received |
| TST-023 | Ekspor laporan dengan role tanpa permission | Request ditolak; sesuai policy tercatat dalam audit |
| TST-024 | Jalankan migrasi pada database kosong | Schema dan seed minimum berhasil |
| TST-025 | Pulihkan backup ke environment terisolasi | Data inti dapat dibaca dan konsistensinya diperiksa |

### 27.2 Kategori severity defect

- **Critical:** privilege escalation, kebocoran data pribadi lintas akun, ledger ganda/korup, saldo tidak konsisten, assignment/batch yang menggandakan material, atau klaim penanganan berbahaya tanpa kontrol.
- **High:** alur inti tidak dapat diselesaikan, berat/reward salah, koreksi tidak terlacak, status akhir menyesatkan, atau partner dapat mengakses transaksi di luar scope.
- **Medium:** fitur nonkritis gagal dengan workaround, laporan/filter salah pada kasus terbatas, atau notifikasi tidak tampil walau transaksi tetap aman.
- **Low:** masalah kosmetik yang tidak mengganggu pemahaman status atau penyelesaian alur.

Tidak boleh ada defect Critical yang terbuka saat MVP ditunjukkan sebagai alur end-to-end yang valid. Defect High yang belum ditangani harus mempunyai workaround, dampak, owner, dan keputusan eksplisit sebelum demo/pilot.

---

## 28. Penutup

SRS WasteLink Bali menetapkan kebutuhan perangkat lunak yang harus dipenuhi, perilaku yang diharapkan pada alur inti, invariant keselamatan dan integritas, kebutuhan nonfungsional, serta cara memverifikasinya. SRS ini menyelaraskan sasaran PRD, kapabilitas HRD, dan rancangan teknis SDD tanpa menganggap asumsi operasional sebagai fakta yang telah tervalidasi.

Sebelum pengembangan fitur sensitif dimulai, tim perlu memastikan kebijakan area/jadwal, penerimaan material, prosedur timbang, formula dan sumber dana reward, jalur organik/limbah khusus, privasi/retensi, serta akses admin telah mendapat persetujuan. Setelah keputusan tersebut disahkan, requirement dapat ditandai `Approved`, dihubungkan ke issue/epic implementasi, dan diuji sesuai ID yang tercantum dalam dokumen ini.
