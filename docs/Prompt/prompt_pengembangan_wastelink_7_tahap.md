# WasteLink Bali — Prompt Pengembangan Terpadu dalam 7 Tahap

> **Jenis dokumen:** Prompt pack untuk coding agent / AI software engineer  
> **Versi:** 1.0  
> **Tanggal:** 30 Oktober 2026  
> **Tujuan:** Mengarahkan pengembangan WasteLink Bali secara bertahap berdasarkan peran nyata dalam ekosistem pengelolaan sampah, dari warga dan petugas sampai fasilitas, bank sampah, mitra material, pelaku usaha, komunitas, serta pengelola program.  
> **Cara pakai:** Tempel **PROMPT GLOBAL** sekali pada awal sesi; jalankan Tahap 1; setelah quality gate lolos, jalankan prompt tahap berikutnya satu per satu. Jangan meminta agent mengimplementasikan ketujuh tahap sekaligus.

---

# 0. Cara Menggunakan Prompt Pack

1. Buka repository WasteLink Bali pada coding agent yang dapat membaca dan mengubah file proyek.
2. Berikan dokumen ini beserta dokumen requirement/desain yang tersedia di repository atau workspace.
3. Tempel **PROMPT GLOBAL** terlebih dahulu.
4. Jalankan **Tahap 1** dan tinjau laporan, keputusan arsitektur, serta test-nya.
5. Setelah quality gate sebuah tahap terpenuhi, kirim prompt tahap berikutnya. Bila gate belum lolos, minta agent memperbaiki temuan tahap itu saja.
6. Jangan menganggap screenshot, UI prototype, mock data, atau endpoint yang ditulis dalam dokumen sebagai implementasi backend yang sudah berjalan. Agent wajib memverifikasi kondisi repository.
7. Simpan laporan keluaran setiap tahap, termasuk perubahan schema/API, keputusan yang diambil, command test yang dijalankan, dan isu yang belum diselesaikan.

## Urutan pengembangan

| Tahap | Nama | Fokus utama | Hasil akhir tahap |
|---|---|---|---|
| 1 | Repository Discovery & Shared Foundation | Audit repository, kontrak domain, fondasi teknis, desain sistem, quality tooling | Baseline arsitektur yang dapat dijalankan dan dites |
| 2 | Warga & Source Collection | Akun, profil, area layanan, panduan kategori, setoran mandiri/pickup request, mobile warga | Warga dapat membuat dan memantau permintaan yang valid |
| 3 | Petugas, Dispatch & Verification | Penugasan, alur lapangan, inspeksi, penimbangan, bukti, reward ledger, serah-terima awal | Alur pickup sampai verifikasi bekerja end-to-end |
| 4 | TPS3R/TPST & Bank Sampah | Penerimaan fasilitas, stok/batch, pemilahan, pengolahan dasar, transaksi bank sampah | Material yang diterima dapat direkonsiliasi dan ditelusuri |
| 5 | Mitra Material, Organik & B2B | Kebutuhan/penawaran material, tujuan hilir, pengolah organik, layanan usaha | Alur material dan permintaan layanan memiliki tujuan yang terkonfirmasi |
| 6 | Banjar/Desa, Program, Funding & Fitur Khusus | Koordinasi komunitas, dashboard program, CSR/funding, pelaporan, kegiatan kebersihan dan limbah khusus terkendali | Pengawasan dan program berjalan dengan batas akses dan bukti yang jelas |
| 7 | Integrasi, Quality Assurance & Pilot Readiness | E2E, keamanan, performa, accessibility, reliability, dokumentasi dan release | Kandidat pilot yang layak diuji di wilayah terbatas |

---

# 1. PROMPT GLOBAL — Konteks, Prinsip, dan Standar yang Berlaku pada Semua Tahap

Salin bagian ini sekali di awal sesi coding agent.

## PROMPT GLOBAL

Kamu berperan sebagai **Senior Product Engineer, Software Architect, Full-Stack Engineer, dan QA Engineer** untuk membangun WasteLink Bali. Kerjakan perubahan secara bertahap, berbasis bukti dari repository, dan siap diuji. Kamu bukan hanya membuat tampilan; kamu harus menjaga agar alur produk, backend, database, otorisasi, dan pencatatan operasional konsisten.

### A. Konteks produk

WasteLink Bali adalah platform koordinasi rantai pengelolaan sampah berbasis komunitas dan ekonomi sirkular. Produk menyatukan alur yang sebelumnya bisa tersebar antara warga, petugas pengangkut, operator TPS3R/TPST/pusat pemilahan, bank sampah, mitra pembeli/pengolah material, pelaku usaha, komunitas/banjar/desa, pengelola program, serta sponsor/CSR.

**Prinsip produk:** satu platform dan sumber data bersama dengan pengalaman berbeda sesuai peran. Jangan membuat aplikasi terpisah untuk setiap kelompok kecuali ada bukti kebutuhan teknis yang kuat. Antarmuka harus mengurangi pekerjaan administrasi lapangan, bukan hanya memindahkan formulir manual ke layar.

### B. Kelompok dan peran yang harus dipertimbangkan

1. **Warga/rumah tangga:** panduan pemilahan, setoran mandiri atau permintaan pickup, status, riwayat timbang, poin yang sudah tervalidasi, notifikasi, pengaduan.
2. **Petugas pengangkut/kebersihan:** tugas, acceptance, status perjalanan/pengambilan, bukti, kendala, penyerahan material, sinkronisasi jaringan yang tidak stabil.
3. **Supervisor/dispatcher:** penugasan, penjadwalan, pemantauan tugas, reassignment, eskalasi dan koreksi beralasan.
4. **Operator TPS3R:** penerimaan, inspeksi, timbang, pemilahan, stok, batch, produk olahan dan residu.
5. **Operator TPST/pusat pemilahan:** aliran masuk/keluar, konsolidasi, batch, perpindahan material, kapasitas, residu; sesuaikan dengan proses fasilitas yang benar-benar ada.
6. **Bank sampah:** anggota/nasabah, setoran per kategori, berat diterima, saldo/tabungan internal bila organisasi memang memakai model itu, dan penyaluran.
7. **Pengepul/agregator/pendaur ulang/pengerajin/pengolah organik:** spesifikasi kebutuhan, kategori yang diterima, kualitas, volume minimum, lokasi, penawaran/permintaan, pengiriman dan bukti penerimaan.
8. **Pelaku usaha (hotel, restoran, vila, pasar, kantor, dan usaha lain):** lokasi penghasil, jadwal layanan, permintaan pickup, volume, bukti pengangkutan, laporan kontrak.
9. **Banjar/desa/desa adat/komunitas:** jadwal dan program wilayah, edukasi, pengumpulan kolektif, rekap operasional dan eskalasi sesuai kewenangan setempat.
10. **Admin platform/operator program/pemerintah/pendana/CSR:** master data sesuai cakupan, verifikasi organisasi/petugas, konfigurasi, laporan, anggaran program, audit dan monitoring.
11. **Tim kebersihan pantai/sungai/relawan:** pencatatan kegiatan khusus yang dipisahkan dari pickup rutin.
12. **Pengelola limbah khusus:** hanya diaktifkan jika jalur, mitra dan prosedurnya telah divalidasi. Jangan arahkan limbah khusus ke jalur pengumpulan umum secara otomatis.

Satu akun dapat memiliki beberapa role hanya jika grant-nya disetujui. Hak akses harus dibatasi berdasarkan **role + organisasi + wilayah + kepemilikan data + izin spesifik**.

### C. Sumber kebenaran dan prioritas dokumen

Sebelum coding, cari dan baca semua dokumen yang tersedia, dengan prioritas:

1. Dokumen requirement yang paling spesifik dan keputusan terbaru yang jelas disetujui.
2. `SRS_WasteLink_Bali.md` untuk kebutuhan sistem yang dapat diuji.
3. `SDD_WasteLink_Bali.md` untuk rancangan teknis dan model domain.
4. `PRD_WasteLink_Bali.md` dan `HRD_WasteLink_Bali.md` untuk tujuan produk dan kebutuhan tingkat tinggi.
5. `perancangan_lanjutan_wastelink_bali.md` untuk ekosistem 12 kelompok, pembagian modul, aturan operasional, tahapan MVP, KPI dan validasi lapangan.
6. `designweb.md` untuk pengalaman web warga, petugas, dan admin.
7. `designapps.md` untuk aplikasi mobile khusus warga.
8. `prompt_backend_wastelink.md` dan `prompt_frontend_wastelink.md` sebagai referensi rekayasa/implementasi yang sudah dirancang.
9. Source code yang benar-benar ada di repository sebagai bukti kondisi implementasi saat ini.

Jika dua dokumen bertentangan, jangan memilih diam-diam. Catat konflik, tunjukkan dampaknya, utamakan keputusan terbaru yang eksplisit, dan gunakan opsi paling aman serta reversible sampai keputusan dikonfirmasi. Jangan mengasumsikan file tersebut sudah ada di repository; cari di workspace dahulu. Jika tidak tersedia, lanjutkan dari source code dan catat keterbatasannya.

### D. Discovery repository wajib

Sebelum mengubah kode pada setiap tahap:

- Petakan struktur frontend, backend, mobile, database, migration, testing, CI, konfigurasi dan dokumentasi.
- Identifikasi stack dan versi aktual dari manifest/lockfile. Jangan mengganti framework atau membuat ulang proyek jika fondasi yang layak sudah ada.
- Jalankan lint, type-check, test dan build yang memang tersedia, bila feasible; catat baseline serta kegagalan awal.
- Cari endpoint/API contract, model, enum/status, autentikasi, komponen UI, dan design token yang sudah ada.
- Bedakan kode production, mock/demo data, prototype, stub dan feature yang benar-benar tersambung.
- Periksa working tree dan jangan menghapus/menimpa perubahan pengguna.
- Sebelum menambah dependency, jelaskan kebutuhan dan periksa apakah dependency yang ada sudah memadai.
- Jangan melakukan refactor besar di luar scope tahap hanya untuk preferensi pribadi.

### E. Stack dan arsitektur

Gunakan stack yang sudah dipakai repository jika masih layak. **Jangan memaksakan asumsi stack.** Jika repository masih kosong dan dokumen persyaratan tidak menetapkan stack final, gunakan rekomendasi berikut dan dokumentasikan keputusan:

- Backend API: Python + FastAPI.
- Relational database: PostgreSQL.
- ORM/migration: SQLAlchemy + Alembic atau alternatif yang sudah digunakan repository.
- Web: Next.js App Router + React + TypeScript jika proyek web memang belum memiliki stack.
- Styling/UI: gunakan sistem styling dan library komponen yang sudah tersedia; hormati `designweb.md`.
- Mobile warga: React Native + Expo jika belum ada aplikasi mobile dan mobile memang masuk scope; hormati `designapps.md`.
- File/bukti foto: object storage atau media service yang sesuai environment, dengan metadata dan akses terkontrol; jangan menyimpan file besar sebagai base64 dalam tabel.
- API contract: OpenAPI untuk backend HTTP bila cocok dengan stack aktual.

Pisahkan domain menjadi modul sesuai batas data dan tanggung jawab. Tidak perlu memecah menjadi microservices untuk MVP. Modular monolith adalah default yang lebih sederhana, kecuali repository dan beban nyata mendukung pendekatan lain.

### F. Aturan bisnis yang tidak boleh dilanggar

1. **Pickup selesai bukan berarti material sudah diterima fasilitas.** Pisahkan status penjemputan, penerimaan, penyaluran, pengolahan, dan tujuan akhir.
2. **Material terangkut bukan otomatis material terdaur ulang.** Klaim dampak harus dibatasi pada bukti yang tersedia.
3. **Berat perkiraan warga bukan berat final.** Berat final hanya berasal dari petugas/fasilitas berwenang sesuai proses pilot.
4. **Reward/poin diterbitkan server-side setelah verifikasi.** Jangan mempercayai nilai poin dari klien. Hindari duplikasi melalui transaksi database dan idempotency.
5. **Ledger poin bersifat append-only secara semantik.** Koreksi memakai transaksi pembalik/penyesuaian dan alasan, bukan menghapus riwayat lama.
6. **Perpindahan material harus memiliki sumber, penerima, waktu, kategori, kuantitas, satuan, status, dan bukti sesuai tingkat risiko.**
7. Kategori yang diterima, jadwal, area layanan, harga, kapasitas dan aturan reward merupakan konfigurasi yang dapat berbeda antar-organisasi/wilayah.
8. Limbah khusus/B3 tidak boleh ditangani sebagai kategori pickup biasa tanpa jalur yang secara eksplisit dikonfirmasi oleh pihak kompeten.
9. Status harga material harus diberi waktu berlaku dan sifatnya (indikatif atau terkonfirmasi). Jangan menjanjikan harga.
10. Data alamat, nomor kontak, foto dan lokasi harus diminimalkan, dibatasi berdasarkan kebutuhan peran dan memiliki retensi yang masuk akal.
11. Aksi penting harus tercatat dalam audit trail: aktor, waktu, objek, aksi, alasan, dan perubahan yang relevan.
12. Perubahan status harus divalidasi di server, termasuk actor permission, ownership, urutan state, concurrency dan idempotency.
13. Semua nilai seperti harga, biaya per pickup, berat maksimum, target reduksi atau nilai poin harus dianggap belum final jika belum disetujui operator wilayah.
14. Jangan mengklaim seluruh Bali mengikuti satu model operasional. Pilot per wilayah harus dikonfigurasi sesuai organisasi, jadwal, kategori, kapasitas, dan jalur penanganan yang benar-benar ada.

### G. Status dan alur domain

Gunakan enum/status yang sudah ada di codebase atau SRS jika konsisten. Jangan membuat enum kedua untuk makna yang sama. Bila enum belum didefinisikan, usulkan satu state machine dan gunakan konsisten pada API, DB, frontend, mobile, notifikasi, audit dan test.

Alur konseptual pickup yang dapat disesuaikan dengan operator:

`draft -> submitted -> scheduled/queued -> assigned -> accepted -> in_progress -> collected -> received_at_facility -> verified -> handed_over/processed`

Jalur gagal/pengecualian dapat meliputi `cancelled`, `failed`, `rescheduled`, `rejected_at_facility`, atau `pending_destination`, tetapi hanya bila diperlukan dan dengan aturan transisi jelas. Jangan memaksa semua status di atas sebagai rangkaian linear bila proses nyata berbeda. Pickup `collected` tidak boleh otomatis disamakan dengan `received_at_facility`; `received_at_facility` tidak berarti `processed`.

### H. Prinsip UX lintas kelompok

- Warga: sederhana, jelas, mobile-first, bahasa mudah dimengerti, tidak menyesatkan tentang reward/jadwal.
- Petugas lapangan: tombol besar, urutan tugas singkat, sedikit input, fokus pada aksi lapangan, indikator jaringan/pending-sync jelas.
- Supervisor: antrean, penugasan, filter, exception dan audit yang mudah dipindai di desktop.
- TPS3R/TPST: antarmuka workstation dengan pencatatan penerimaan, timbang, kualitas, stok/batch, dan serah-terima yang cepat.
- Bank sampah: transaksi per anggota/setoran dengan rekap yang mudah direkonsiliasi.
- Mitra hilir: kebutuhan/spec/material, volume, harga indikatif, konfirmasi dan bukti transaksi.
- Pelaku usaha: jadwal layanan berulang, lokasi/jenis sumber, bukti pickup, invoice/rekap hanya jika sistem memang mendukung penagihan.
- Komunitas/pemerintah/pendana: ringkasan berdasarkan cakupan kewenangannya, definisi metrik jelas dan tidak membuka data pribadi tanpa alasan.
- Semua layar harus memiliki loading, empty state, error, retry, validasi formulir, aksesibilitas, serta tampilan yang layak di viewport sasaran.
- Jangan meninggalkan tombol dekoratif yang tidak berfungsi atau memakai mock data sebagai hasil sukses seolah transaksi sungguhan.

### I. Keamanan dan kualitas wajib

- RBAC dijalankan server-side; menyembunyikan tombol di frontend saja tidak cukup.
- Cegah IDOR/BOLA dengan pemeriksaan pemilik/organisasi/wilayah di setiap resource sensitif.
- Validasi input, upload file, ukuran file, mime type, akses media, pagination dan query filter.
- Gunakan secrets melalui environment; jangan commit credential atau `.env` nyata.
- Transaksi database harus menjaga konsistensi berat, ledger, stok, batch dan status.
- Gunakan idempotency untuk aksi retry-prone yang mengubah data penting.
- Jangan log token, password, data sensitif penuh atau URL media bertanda tangan.
- Tambahkan tests yang menargetkan aturan bisnis dan jalur gagal, bukan hanya happy path.
- Jangan mengklaim test lulus bila command tidak benar-benar dijalankan.
- Jangan melanjutkan tahap bila quality gate sebelumnya belum lulus atau temuan kritis tidak dicatat.

### J. Output wajib setelah setiap tahap

Setelah menyelesaikan sebuah tahap, tulis laporan dalam format:

1. **Ringkasan perubahan**: fitur yang benar-benar dibuat.
2. **File penting berubah/tambah** beserta tujuan masing-masing.
3. **Keputusan arsitektur/domain** dan alasan singkat.
4. **Schema/migration/API/enum/status** yang ditambah atau diubah.
5. **Test command yang dijalankan** dan hasil aktualnya.
6. **Manual QA** per role atau skenario yang diuji.
7. **Known issues/risiko** dan hal yang menunggu validasi lapangan.
8. **Checklist quality gate**: lulus/gagal per butir.
9. **Cara menjalankan fitur** secara lokal.
10. **Rekomendasi tahap berikutnya** tanpa mengerjakan tahap berikutnya sebelum diminta.

Jangan mengembalikan hanya rencana atau potongan kode jika tugasnya adalah implementasi. Ubah file proyek yang relevan, jalankan checks, lalu laporkan hasil. Jika suatu fitur terblokir oleh informasi/akses yang benar-benar tidak tersedia, implementasikan batas aman yang bisa dikerjakan, catat blocker secara spesifik, dan jangan mengarang integrasi.

---

# TAHAP 1 — Repository Discovery, Shared Foundation, Domain Contract & Quality Tooling

## Prompt untuk coding agent

Kerjakan **Tahap 1 saja**. Jangan langsung membangun seluruh modul bisnis. Tujuan tahap ini adalah memahami keadaan repository dan menyiapkan fondasi teknis/domain yang membuat pekerjaan tahap-tahap berikutnya tidak saling bertabrakan.

### 1. Audit repository dan dokumen

- Jalankan discovery wajib dari PROMPT GLOBAL.
- Identifikasi frontend web, backend API, aplikasi mobile, database, media/file storage, background jobs, notifikasi, test runner, lint, type-check, build dan CI yang ada.
- Tandai fitur sebagai `implemented`, `partial`, `mock/demo`, `stub`, `missing`, atau `unknown`.
- Cari entitas dan state yang sudah dipakai. Jangan menduplikasi `User`, `Organization`, `PickupRequest`, `MaterialCategory` atau konsep lain dengan nama berbeda tanpa alasan migrasi.
- Buat laporan gap antara repository dengan dokumen requirement/desain.

### 2. Tentukan bounded context dan ownership

Buat dokumentasi arsitektur yang menunjukkan kepemilikan domain berikut:

- Identity & Access: user, role grant, organisasi, membership, status verifikasi.
- Geography & Service Configuration: wilayah, zona layanan, titik/lokasi, jadwal, kapasitas.
- Waste Taxonomy: kategori, jenis yang diterima, aturan penerimaan dan rute yang diizinkan.
- Source & Collection: setoran/pickup request, jadwal, assignment dan status.
- Verification & Evidence: inspeksi, berat final, foto/bukti, koreksi.
- Material Flow: penerimaan, serah-terima, batch, stock movement, proses, output dan residu.
- Waste Bank: anggota, setoran dan saldo internal bila modelnya relevan.
- Partner Network: spesifikasi kebutuhan, penawaran, pemesanan, pengiriman dan penerimaan material.
- Commercial Services: lokasi usaha, rencana layanan, kontrak dan laporan layanan.
- Community & Program: kegiatan wilayah, edukasi, program, funding, laporan dan indikator.
- Cross-cutting: notifications, audit, files, reporting and analytics.

Jika repository kecil, implementasikan sebagai modular monolith dengan batas modul yang jelas, bukan microservices yang belum dibutuhkan. Tulis keputusan arsitektur yang ringkas.

### 3. Buat domain glossary dan decision log

Siapkan atau perbarui dokumentasi yang menjelaskan:

- definisi `pickup request`, `collection task`, `facility receipt`, `weighing record`, `material batch`, `handover`, `processing record`, `residue`, `waste bank transaction`, `material offer/need`, `program funding`, dan `verified impact`;
- beda antara warga, petugas, supervisor, operator fasilitas, pengelola bank sampah, mitra hilir, pelaku usaha, admin platform, admin wilayah dan sponsor;
- siapa pemilik setiap entitas dan siapa yang boleh membacanya;
- keputusan yang telah pasti, asumsi yang perlu divalidasi, dan pertanyaan yang harus dijawab operator pilot.

Gunakan ID stabil dan timestamps konsisten. Untuk data waktu lokal, simpan secara konsisten di backend (umumnya UTC) dan tampilkan sesuai zona waktu layanan, default pilot Bali `Asia/Makassar` bila sesuai dengan lokasi pilot. Jangan hardcode timezone global ke setiap modul bila sistem dapat melayani wilayah lain.

### 4. Definisikan kontrak data dan API minimum

- Dokumentasikan entity inti, hubungan, invariant, status dan aturan ownership sebelum membuat fitur domain besar.
- Tetapkan format standar API response/error, pagination, filtering, sorting, timestamp, ID, dan validation error sesuai conventions repository.
- Jika backend HTTP menggunakan OpenAPI, pastikan dokumentasi API dapat dihasilkan dan tidak berbeda dari implementasi.
- Definisikan strategi migration yang aman; jangan menghapus/mengubah data existing secara destruktif.
- Pastikan ada strategi menyimpan media/bukti yang tidak mengekspos file privat secara publik.

### 5. Siapkan fondasi teknis

Implementasikan hanya fondasi yang memang belum ada dan dibutuhkan:

- konfigurasi environment serta `.env.example` yang aman;
- lint, formatter, type-check dan test commands;
- error handling dasar dan logging terstruktur tanpa secrets;
- health check jika backend punya pola HTTP;
- migration baseline jika diperlukan;
- API/client configuration terpusat;
- design tokens, app shell, navigasi dasar dan komponen UI bersama bila frontend belum memilikinya;
- strategi test fixtures/seed untuk data demo yang diberi label jelas.

Jangan menambah banyak pustaka hanya untuk membuat struktur terlihat lengkap. Jangan menambahkan mock server yang menyamar sebagai backend produksi.

### 6. Identifikasi risiko operasional sebelum coding lanjut

Buat daftar pertanyaan yang wajib dikonfirmasi pada wilayah pilot:

- siapa yang benar-benar menjalankan pickup;
- apakah warga menggunakan pickup, setor mandiri, atau keduanya;
- kategori apa yang benar-benar diterima oleh operator;
- titik penimbangan dan siapa pemilik berat final;
- operator penerima resmi dan kapasitasnya;
- jalur organik, anorganik, residu, dan limbah khusus;
- apakah reward dibutuhkan dan siapa penyandang dananya;
- konektivitas/perangkat lapangan serta proses jika offline.

Jangan menghentikan seluruh pekerjaan karena informasi operasional belum lengkap. Buat keputusan konfigurabel dan tandai sebagai `pending_validation`.

### Deliverables Tahap 1

1. `repository_audit.md` atau dokumen setara.
2. Diagram arsitektur dan bounded context menggunakan Mermaid.
3. Domain glossary, ownership matrix dan decision log.
4. Kontrak API/domain awal dan rencana migration.
5. Fondasi code/tooling yang benar-benar diperlukan.
6. Baseline test/build serta daftar blocker yang nyata.

### Quality gate Tahap 1

- [ ] Tidak ada framework besar yang diganti tanpa alasan dan persetujuan.
- [ ] Repository serta dokumen requirement telah diaudit.
- [ ] Kode mock/stub dibedakan dari fitur yang benar-benar aktif.
- [ ] Domain, role, ownership, status dan invariant terdokumentasi.
- [ ] Konfigurasi/secret tidak mengekspos kredensial.
- [ ] Minimal test/lint/typecheck/build yang tersedia dijalankan dan hasilnya dicatat.
- [ ] Tidak ada perubahan destruktif atau scope creep.
- [ ] Pertanyaan validasi lapangan dicatat untuk pilot.

Jangan lanjut ke Tahap 2 bila fondasi tidak dapat dijalankan atau keputusan domain kritis masih kontradiktif.

---

# TAHAP 2 — Warga, Pemilahan dari Sumber, Area Layanan & Permintaan Setoran/Pickup

## Prompt untuk coding agent

Kerjakan **Tahap 2 saja**, berdasarkan kontrak yang disepakati di Tahap 1. Fokus pada warga/rumah tangga sebagai sumber sampah dan jalur masuk material ke platform. Implementasikan alur nyata dari frontend sampai backend/database bila keduanya ada di repository.

### 1. Akun dan profil minimum

- Implementasikan integrasi dengan auth/session yang sudah ada; jangan membuat sistem login kedua.
- Warga hanya perlu memasukkan data yang dibutuhkan untuk menyediakan layanan.
- Profil mencakup nama tampilan, kontak sesuai kebutuhan, service area, dan alamat/titik pickup bila layanan memang membutuhkan itu.
- Tampilkan penjelasan data alamat/lokasi dan batasi visibilitasnya. Jangan tampilkan alamat lengkap ke pengguna/role yang tidak ditugaskan pada layanan tersebut.
- Dukungan beberapa lokasi (misalnya rumah dan tempat usaha kecil) boleh dibuat jika model domain mendukungnya; jangan memaksakan bila MVP cukup satu lokasi.

### 2. Konfigurasi area, jadwal dan kategori

- Warga hanya dapat membuat permintaan jika area dan layanan aktif.
- Kategori yang tampil harus berasal dari konfigurasi operator/area, bukan hardcoded sebagai daftar global.
- Tampilkan kategori, contoh item, instruksi pemisahan, kategori yang tidak diterima, serta jalur yang disetujui jika tersedia.
- Bedakan organik, material daur ulang bernilai, residu, dan limbah khusus. Limbah khusus tidak boleh otomatis masuk ke alur umum.
- Perlihatkan jadwal atau slot hanya bila berasal dari kapasitas/jadwal nyata. Hindari janji ETA palsu.
- Jika belum ada jadwal/area terkonfigurasi, tampilkan empty state dan cara menyampaikan minat/menunggu aktivasi, bukan sukses palsu.

### 3. Alur warga: setoran mandiri atau permintaan pickup

Implementasikan mode yang benar-benar dibutuhkan wilayah pilot:

**A. Permintaan pickup**
- Pilih lokasi yang dilayani, kategori, perkiraan jumlah/volume, waktu kesiapan/slot yang tersedia, dan instruksi akses opsional.
- Foto hanya diwajibkan bila ada alasan operasional dan kebijakan privasi yang jelas.
- Tampilkan estimasi berat sebagai perkiraan; jangan anggap sebagai berat final.
- Validasi area, kategori, slot, duplikasi, dan eligibility dari server.
- Dukung pengiriman ulang/idempotency pada pembuatan request agar jaringan putus tidak membuat permintaan ganda.

**B. Setoran mandiri**
- Aktifkan hanya jika terdapat titik/operator setoran dengan alamat, jam layanan, kategori, dan kapasitas yang jelas.
- Tampilkan langkah setor, status dan bukti yang akan diperoleh.
- Jangan mencatat material sebagai diterima sebelum pihak penerima mengonfirmasi transaksi.

### 4. Status, histori dan komunikasi

- Sediakan daftar permintaan, detail, status terkini, riwayat perubahan status, waktu, dan pihak yang melakukan update sesuai hak akses.
- Sediakan pembatalan hanya pada state yang diizinkan; jika sudah ditugaskan/diambil, gunakan permintaan pembatalan atau eskalasi sesuai aturan.
- Sediakan alasan penolakan, permintaan dijadwalkan ulang, gagal diambil dan kategori tidak sesuai.
- Tambahkan notifikasi dalam aplikasi; kanal lain (email/push/WhatsApp/SMS) harus mengikuti layanan yang benar-benar telah dikonfigurasi.
- Sediakan laporan masalah/koreksi dengan status tindak lanjut.

### 5. Aplikasi dan UX warga

- Web warga harus mengikuti `designweb.md`.
- Aplikasi mobile warga harus mengikuti `designapps.md` dan struktur mobile yang telah ditemukan di Tahap 1. Jika mobile belum ada dan disepakati untuk dibangun, setup project secara konsisten; jangan mencampur source code mobile ke project web tanpa alasan.
- Form mobile ringkas, cocok untuk koneksi tidak stabil, dan tidak meminta input berulang.
- Tambahkan loading, empty, error, retry, validation, success state, accessibility label dan konfirmasi sebelum aksi destruktif.
- Peta/lokasi hanya digunakan jika dibutuhkan; berikan input alamat manual bila memungkinkan dan batasi pengambilan lokasi perangkat.

### 6. API dan data

Periksa kebutuhan entity/migration yang mungkin meliputi:

- `ServiceArea` / `ServiceZone`;
- `ServiceSchedule` atau slot layanan;
- `MaterialCategory` dan konfigurasi kategori per area/operator;
- `SourceLocation` / lokasi sumber;
- `PickupRequest` atau `DropOffIntent` sesuai domain;
- `RequestStatusHistory` atau event/audit yang relevan;
- notifikasi/in-app inbox jika belum tersedia.

Nama di atas adalah konsep, **bukan kewajiban untuk membuat tabel dengan nama persis sama**. Gunakan model yang ada bila setara. Sertakan ownership, foreign key, index, constraint, timestamps, pagination dan migration aman.

### 7. Aturan bisnis dan tests

Uji setidaknya:

- warga tidak dapat membuat permintaan pada area yang tidak aktif;
- kategori yang tidak diterima ditolak backend;
- warga tidak dapat membaca/mengubah request milik warga lain;
- jumlah/volume dan field required divalidasi server-side;
- retry tidak membuat request ganda;
- pembatalan hanya sah pada state yang diperbolehkan;
- data alamat tidak bocor ke role tanpa tugas/izin;
- error/empty/loading state frontend bekerja;
- UI mobile/web menggunakan API yang benar, bukan hardcoded mock sebagai hasil sukses.

### Deliverables Tahap 2

- Flow warga yang berfungsi end-to-end untuk mode layanan yang dipilih.
- UI web/mobile sesuai stack dan desain yang tersedia.
- API, schema/migration, validasi, audit/status history dan tests.
- Seed/demo data yang secara eksplisit dilabeli demo.
- Dokumentasi API, aturan konfigurasi layanan, dan hasil QA warga.

### Quality gate Tahap 2

- [ ] Permintaan hanya dapat dibuat pada layanan nyata yang aktif/terkonfigurasi.
- [ ] Status dan validasi berasal dari backend.
- [ ] Tidak ada reward final sebelum verifikasi berat.
- [ ] Riwayat dan pembatalan tidak merusak audit trail.
- [ ] Web/mobile tidak mengaku tersambung bila hanya menggunakan mock.
- [ ] Tes kepemilikan resource dan kategori tidak valid lolos.
- [ ] Warga dapat memahami apa yang terjadi setelah membuat permintaan.

---

# TAHAP 3 — Petugas, Dispatch, Penugasan, Bukti, Penimbangan & Reward Ledger

## Prompt untuk coding agent

Kerjakan **Tahap 3 saja**. Integrasikan permintaan warga dari Tahap 2 dengan operasi lapangan. Petugas pengangkut dapat berasal dari organisasi berbeda; setiap assignment harus terikat pada organisasi, area, dan kewenangan yang sah.

### 1. Verifikasi petugas dan organisasi

- Pastikan petugas aktif dan diverifikasi oleh admin/supervisor yang berwenang sebelum dapat menerima tugas.
- Simpan keterkaitan petugas ke organisasi/tim dan area kerja.
- Cegah user biasa memanipulasi role menjadi petugas/admin melalui payload profile.
- Jika satu petugas memiliki beberapa role, setiap grant harus eksplisit dan diaudit.

### 2. Queue dan dispatch

- Bangun antrean tugas berdasarkan tanggal, area, kategori, prioritas operasional, dan status.
- Sediakan assignment manual oleh dispatcher/supervisor; otomatisasi rute belum wajib.
- Pastikan satu tugas tidak dapat diklaim oleh dua petugas secara bersamaan tanpa aturan concurrency yang jelas.
- Dukung reassignment dengan alasan dan histori.
- Tampilkan informasi minimum yang diperlukan: alamat/lokasi tugas, kategori, perkiraan volume, instruksi akses dan kontak sesuai kebijakan.
- Jangan tampilkan daftar lengkap alamat/warga kepada petugas yang tidak ditugaskan.

### 3. Workflow petugas

Implementasikan state transition yang sesuai domain dan proses pilot, minimal mencakup:

- tugas ditugaskan;
- diterima petugas;
- pengambilan sedang berlangsung;
- berhasil diambil atau gagal dengan alasan;
- menunggu/menjalani serah-terima ke penerima;
- bukti serah-terima atau penerimaan fasilitas jika tersedia.

Alasan kegagalan dapat mencakup warga tidak ada, akses terhalang, kategori tidak sesuai, material tidak siap, kendaraan/kapasitas penuh, lokasi tidak valid, keselamatan, atau alasan lain dengan catatan. Jadikan daftar alasan konfigurabel bila memungkinkan.

Jangan gabungkan status `collected` dan `received_at_facility`. Petugas dapat menyelesaikan penjemputan, tetapi penerima fasilitas perlu mencatat penerimaan terpisah.

### 4. Form lapangan dan bukti

- Catat siapa melakukan aksi, kapan, tugas terkait, kategori aktual, catatan kendala dan media bukti bila diperlukan.
- Pertimbangkan jaringan buruk: antrean aksi yang pending harus terlihat dan tidak boleh diberi label seolah sudah tersimpan di server.
- Jika offline-first sudah tersedia, gunakan mekanisme sinkronisasi yang ada. Jangan membuat offline sync penuh yang tidak aman hanya demi checklist.
- Konflik status saat sync harus dideteksi dan ditampilkan sebagai perlu penanganan, bukan meng-overwrite perubahan terbaru diam-diam.
- Upload foto harus memvalidasi file dan membatasi akses; hindari memotret wajah penghuni jika tidak perlu.
- GPS hanya direkam dengan kebutuhan yang jelas, izin perangkat, serta kebijakan privasi.

### 5. Inspeksi dan penimbangan

- Definisikan siapa yang berwenang mengubah kategori final dan berat final.
- Bila petugas tidak melakukan penimbangan resmi, simpan perkiraan/observasi saja dan serahkan penimbangan final ke operator penerima.
- Setiap record timbang harus memiliki satuan, nilai, kategori/fraksi, titik timbang, aktor, waktu, status verifikasi, referensi transaksi, dan bukti bila diperlukan.
- Cegah perubahan berat final tanpa izin koreksi; setiap koreksi membutuhkan alasan dan audit trail.
- Hindari berat negatif, unit campur, pembulatan tidak konsisten, atau perubahan angka tanpa rekam jejak.

### 6. WastePoints/reward ledger

- Implementasikan reward hanya jika program pendanaan dan aturan bisnis disetujui. Jika belum, buat extension point dan tampilkan dampak non-finansial; jangan mengaktifkan nilai reward fiktif.
- Perhitungan reward harus di server dari record timbang yang terverifikasi, kategori final, aturan reward aktif dan batas program.
- Gunakan ledger append-only secara semantik. Koreksi/reversal dilakukan dengan record baru yang mengacu pada transaksi yang dikoreksi.
- Gunakan idempotency/unique constraints agar satu transaksi verifikasi tidak menerbitkan poin dua kali.
- Pisahkan poin promosi, saldo tabungan bank sampah, dan uang tunai. Jangan menyamakan ketiganya.
- Jika ada penukaran, pastikan anggaran/cap tersedia, status penukaran dan rekonsiliasi terdefinisi; bila belum ada, jangan membuat klaim uang dapat dicairkan.

### 7. Supervisor dan laporan operasional

- Sediakan rekap tugas per shift/area/organisasi, tugas gagal, reassignment, waktu penyelesaian, serah-terima tertunda dan bukti yang belum lengkap.
- KPI tidak boleh hanya menghitung jumlah pickup; tampilkan konteks seperti volume, jarak/area bila tersedia, kendala dan kualitas data.
- Siapkan filter dan ekspor yang hanya memuat data yang diizinkan.

### 8. API dan model

Periksa model existing sebelum menambah konsep seperti `CollectionTask`, `Assignment`, `PickupEvent`, `Inspection`, `WeighingRecord`, `EvidenceAsset`, `Handover` dan `RewardLedgerEntry`. Terapkan transaksi database untuk operasi yang mengubah status, berat, reward atau serah-terima secara bersamaan.

### 9. Tests wajib

- petugas yang tidak aktif/tidak terverifikasi tidak bisa menerima tugas;
- petugas dari organisasi atau area lain tidak bisa mengambil tugas yang tidak berwenang;
- concurrency claim mencegah double assignment;
- transisi status yang tidak valid ditolak;
- aksi retry tidak membuat bukti/timbang/reward ganda;
- berat hanya bisa disahkan role berwenang;
- koreksi berat memiliki alasan/audit;
- role warga tidak dapat mengakses task internal petugas;
- reward tidak diterbitkan sebelum berat terverifikasi dan tidak dapat diterbitkan dua kali;
- kegagalan jaringan/unggah memperlihatkan status yang benar.

### Deliverables Tahap 3

- Dashboard petugas responsif, task queue supervisor/dispatcher, workflow assignment dan field evidence.
- Inspeksi/penimbangan sesuai kewenangan serta ledger poin bersyarat.
- API, migration, dokumentasi state machine, test unit/integration dan laporan QA.

### Quality gate Tahap 3

- [ ] Assignment, status, ownership dan transisi divalidasi server-side.
- [ ] `collected`, `received`, `processed` jelas terpisah.
- [ ] Bukti dan timbang memiliki audit.
- [ ] Reward tidak dapat digandakan dan tidak didasarkan pada klaim klien.
- [ ] Offline/pending sync tidak menampilkan keberhasilan palsu.
- [ ] Tidak ada kebocoran alamat atau data warga ke petugas yang tak berwenang.

---

# TAHAP 4 — Operator TPS3R/TPST, Penerimaan Fasilitas, Batch Material & Bank Sampah

## Prompt untuk coding agent

Kerjakan **Tahap 4 saja**. Bangun bagian setelah penjemputan: penerimaan material di fasilitas dan/atau transaksi bank sampah. TPS3R, TPST dan bank sampah tidak otomatis memiliki alur identik; gunakan konfigurasi/fitur sesuai fasilitas pilot.

### 1. Profil dan konfigurasi fasilitas

- Data fasilitas minimal mencakup nama, tipe, organisasi pemilik/operator, area layanan, status aktif, kategori yang diterima, jam operasional, kapasitas yang relevan dan tujuan material yang tersedia.
- Jangan mengasumsikan seluruh fasilitas menerima semua kategori atau memiliki semua teknologi pengolahan.
- Sediakan penanggung jawab/penerima yang memiliki izin memverifikasi material.
- Bila kapasitas/jadwal belum diverifikasi, jangan gunakan sebagai dasar janji layanan otomatis.

### 2. Penerimaan (facility receipt)

- Buat alur penerimaan yang mengacu pada collection task atau sumber setoran sah.
- Catat identitas pengirim, penerima, waktu, sumber, kategori yang diajukan, kategori aktual, berat diterima, satuan, kualitas/kontaminasi dan bukti sesuai kebutuhan.
- Dukung penerimaan penuh, sebagian, penolakan sebagian, dan penolakan penuh jika sesuai proses fasilitas.
- Untuk selisih berat, catat nilai awal, nilai final, alasan, aktor dan persetujuan sesuai kewenangan. Jangan menghapus catatan penjemputan asli.
- Hanya setelah penerima mengesahkan transaksi, status material berubah menjadi diterima fasilitas.

### 3. Stock movement dan batch

- Bedakan transaksi penerimaan, perpindahan stok, pemisahan kategori, pemrosesan, penjualan/serah-terima, serta residu.
- Buat batch/lot bila dibutuhkan untuk menggabungkan material dengan sumber dan kategori yang dapat ditelusuri.
- Batch harus memiliki riwayat sumber, komposisi, berat masuk, perubahan/penyesuaian yang sah, berat dialokasikan ke batch turunan, berat keluar, tujuan, dan status.
- Jangan mengubah satu batch menjadi “terdaur ulang” hanya karena dipindahkan ke rak/gudang atau ditawarkan di marketplace.
- Cegah double-counting ketika batch dipisahkan/digabung. Tetapkan invariant massa/rekonsiliasi yang realistis, termasuk toleransi timbang bila operator memiliki standar tersebut.
- Catat residu/kehilangan/penyesuaian sebagai kategori transaksi eksplisit, bukan membuang selisih angka.

### 4. Operasi TPS3R/TPST

Implementasikan fitur berdasarkan hasil audit proses fasilitas:

- antrean material masuk;
- inspeksi penerimaan;
- penimbangan dan kualitas;
- klasifikasi/fraksi hasil pemilahan;
- inventori/batch bahan bernilai;
- proses organik hanya jika fasilitas benar-benar melakukannya;
- hasil proses/output dan residu;
- penyerahan material ke mitra berikutnya;
- kapasitas/status fasilitas, bila operator siap memperbaruinya.

Jangan membangun MES atau sistem manufaktur besar bila fasilitas pilot hanya membutuhkan form timbang dan stok sederhana. UI desktop harus mempercepat pekerjaan operator dan mendukung scanner/keyboard input jika berguna.

### 5. Bank sampah

- Jika bank sampah termasuk scope, sediakan daftar nasabah/anggota, transaksi setoran per kategori, berat final, harga/nilai sesuai kebijakan yang disahkan, bukti transaksi dan laporan.
- Pisahkan `WasteLink points` dari `waste bank savings/balance`. Saldo bank sampah hanya digunakan jika model organisasi memang mempunyai buku tabungan/nilai ekonomi.
- Simpan harga dengan waktu dan sumber/kebijakan; harga historis tidak boleh berubah hanya karena harga terbaru diubah.
- Untuk pembatalan/koreksi transaksi, gunakan reversal/adjustment dengan audit, bukan delete permanen.
- Batasi data anggota berdasarkan organisasi bank sampah yang berwenang.

### 6. Rekonsiliasi dan laporan

- Laporan masuk/keluar/residu per kategori dan periode.
- Laporan batch aktif, stok, kontaminasi/penolakan, serah-terima tertunda dan selisih timbang.
- Filter berdasarkan fasilitas/organisasi dan role.
- Tampilkan definisi metrik, satuan, dan periode; jangan mencampur berat perkiraan dengan berat terverifikasi.
- Export mencakup metadata sumber data/waktu pembuatan jika fiturnya tersedia.

### 7. API, transaksi dan keamanan

- Gunakan database transactions untuk receipt + stock movement + reward event (bila ada) supaya partial writes tidak membuat data tidak konsisten.
- Terapkan idempotency pada penerimaan berbasis request/assignment.
- Batas hak akses per fasilitas/organisasi.
- Cegah operator memodifikasi transaksi dari fasilitas lain.
- Setiap perubahan berat/stok/batch kritis tercatat dalam audit trail.

### 8. Tests wajib

- receipt harus mengacu pada sumber/assignment yang sah atau memiliki alasan/manual receipt permission yang jelas;
- receipt tidak dapat disahkan dua kali tanpa idempotency;
- hanya role penerima berwenang yang bisa finalisasi berat;
- batch movement tidak boleh mengurangi stok menjadi negatif tanpa alur koreksi resmi;
- split/merge batch dapat direkonsiliasi;
- selisih timbang dan penolakan memiliki alasan;
- bank sampah terisolasi antarorganisasi;
- laporan total masuk, keluar, stok dan residu tidak double-count;
- transaksi gagal tidak meninggalkan receipt tanpa movement atau saldo yang berubah separuh.

### Deliverables Tahap 4

- Facility operations untuk fasilitas pilot yang benar-benar terlibat.
- Waste-bank workflow bila telah divalidasi.
- Batch/stock movement dasar, laporan dan API/domain tests.
- Dokumentasi proses penerimaan, finalisasi berat, split/merge batch dan rekonsiliasi.

### Quality gate Tahap 4

- [ ] Material bisa ditelusuri dari sumber sampai penerimaan fasilitas.
- [ ] Berat perkiraan dan berat final terpisah.
- [ ] Stok/batch memiliki audit dan mencegah double-count.
- [ ] Residu/penolakan tercatat, bukan disembunyikan.
- [ ] Bank sampah tidak disamakan dengan ledger poin platform.
- [ ] Alur fasilitas sesuai proses aktual, bukan asumsi satu model untuk semua.

---

# TAHAP 5 — Jaringan Mitra Material, Pengolah Organik, Pengepul, Pendaur Ulang & B2B

## Prompt untuk coding agent

Kerjakan **Tahap 5 saja**. Perluas aliran material dan layanan setelah proses sumber, pengangkutan serta penerimaan dasar stabil. Prioritaskan **jalur hilir yang benar-benar dikonfirmasi**; jangan membangun marketplace generik yang berisi listing tanpa pembeli/pengolah nyata.

### 1. Verifikasi dan profil mitra

- Buat profil organisasi mitra: tipe (pengepul, agregator, pendaur ulang, pengerajin, pengolah organik), kontak organisasi, lokasi, kategori diterima, spesifikasi kualitas, volume minimum/maksimum, satuan, kapasitas/periode, status verifikasi dan wilayah layanan.
- Pisahkan data publik/terbatas/rahasia dagang. Harga, kontak personal dan data transaksi hanya dapat dilihat oleh pihak yang berwenang.
- Mitra yang belum diverifikasi diberi status pending dan tidak boleh dipilih sebagai tujuan final yang terjamin.
- Masa berlaku, sumber dan status konfirmasi penawaran harus jelas.

### 2. Demand/offer material sederhana

- Implementasikan kebutuhan/penawaran per kategori/fraksi, spesifikasi, kualitas, volume, lokasi serah, jangka waktu, harga indikatif atau model harga yang berlaku, dan status.
- Hindari membuat sistem tender/escrow/payment kompleks kecuali memang dibutuhkan dan sudah disetujui.
- Matching awal dapat menggunakan filter kategori, kualitas, volume, jarak yang sah, kapasitas dan status mitra; tidak perlu AI/marketplace recommendation dahulu.
- Jangan otomatis mengonfirmasi transaksi hanya karena material cocok dengan listing. Perlu persetujuan pihak yang memiliki kewenangan.
- Simpan jejak komunikasi/keputusan yang relevan tanpa menyimpan informasi pribadi berlebihan.

### 3. Perpindahan material ke tujuan berikutnya

- Rancang alur offer/acceptance atau delivery/order sesuai proses bisnis yang dipilih.
- Material yang dikirim harus dirujuk ke batch/stock movement atau sumber yang sah.
- Catat jumlah dialokasikan, dikirim, diterima, ditolak, selisih, tanggal, pihak pengirim/penerima dan bukti.
- Status minimum perlu membedakan `offered`, `accepted`, `scheduled`, `dispatched`, `received`, `partially_received`, `rejected` dan `closed` jika memang diperlukan pada flow terpilih.
- Berat dikirim dan diterima dapat berbeda; jangan mengubah sumber record untuk menyamakan. Buat discrepancy/adjustment yang bisa diaudit.
- Klaim “didaur ulang/diproses” hanya boleh dibuat setelah mitra mencatat bukti pemrosesan yang memadai; jika tidak ada, statusnya adalah “diterima mitra” atau “tujuan terkonfirmasi”.

### 4. Jalur organik

Aktifkan fitur hanya bila wilayah pilot mempunyai operator dan jalur pengolahan organik yang terverifikasi.

- Catat kategori dan standar input yang diterima, kontaminasi, berat masuk, metode/proses bila disediakan operator, hasil output dan residu.
- Jangan menyimpulkan seluruh organik telah menjadi kompos/produk hanya dari berat masuk.
- Hasil seperti kompos/produk akhir mempunyai status, kuantitas, tanggal, dan sumber/batch bila data tersedia.
- Jangan memuat klaim emisi yang dihindari tanpa metode dan faktor perhitungan yang terdokumentasi.

### 5. Pelaku usaha (hotel, restoran, vila, pasar, kantor, dan lainnya)

- Modelkan lokasi penghasil dan organisasi secara terpisah agar satu organisasi dapat memiliki beberapa lokasi.
- Sediakan konfigurasi kategori, frekuensi layanan, hari/slot yang tersedia, perkiraan volume, instruksi akses, contact point yang relevan, dan status layanan.
- Jika dibutuhkan kontrak atau SLA, definisikan field dan proses yang benar-benar disetujui; jangan mengarang SLA atau biaya.
- Sediakan riwayat layanan, bukti pickup/receipt, laporan per lokasi/periode dan exception.
- Pisahkan permintaan layanan komersial dari permintaan rumah tangga bila aturan, kapasitas, jadwal atau penagihannya berbeda.
- Dukungan invoice/payment hanya dibuat jika kebutuhan dan model bisnis telah disahkan. Kalau belum, buat laporan layanan dan status kontrak tanpa mengklaim transaksi keuangan telah terjadi.

### 6. Model bisnis dan dana

- Jadikan pendapatan sebagai hipotesis yang diuji, bukan asumsi produk.
- Model yang mungkin diuji: layanan pickup B2B, biaya pengelolaan terkontrak, pencocokan material, atau pelaporan program berbayar. Jangan mengaktifkan fee/commission tanpa aturan, persetujuan dan transparansi.
- Harga material bersifat indikatif sampai dikonfirmasi oleh pihak terkait; selalu simpan timestamp/expiry.
- Jangan mencampur dana reward, tabungan bank sampah, uang penjualan material dan anggaran program.

### 7. Tests wajib

- mitra tidak terverifikasi tidak bisa menjadi tujuan terkonfirmasi;
- penawaran kedaluwarsa tidak bisa di-accept tanpa pembaruan/konfirmasi;
- jumlah yang dialokasikan tidak melampaui stok/kuantitas yang tersedia;
- transaksi delivery memiliki sumber batch dan kedua pihak yang sah;
- selisih/penolakan penerimaan tidak mengubah record asal secara diam-diam;
- organisasi usaha tidak bisa membaca data lokasi organisasi lain;
- laporan B2B membedakan permintaan, pickup, penerimaan dan pemrosesan;
- laporan dampak tidak menganggap material terjual/diterima berarti telah didaur ulang;
- jalur organik memerlukan konfigurasi operator aktif.

### Deliverables Tahap 5

- Modul mitra material dengan profil dan kebutuhan/penawaran minimum.
- Alur serah-terima/delivery ke mitra yang dipilih.
- Jalur organik hanya jika tervalidasi.
- Portal layanan pelaku usaha sesuai pilot.
- Laporan dan tests atas tujuan material, kapasitas, selisih dan status transaksi.

### Quality gate Tahap 5

- [ ] Setiap tujuan hilir relevan dengan kategori dan kapasitas yang dikonfirmasi.
- [ ] Data harga/kapasitas memiliki timestamp dan status validitas.
- [ ] Material yang ditawarkan bukan otomatis material yang terjual/didaur ulang.
- [ ] Serah-terima mencatat kedua pihak dan bukti yang relevan.
- [ ] B2B tidak mengarang kontrak, SLA, invoice, atau payment.
- [ ] Jalur organik/daur ulang/residu terpisah dengan jelas.

---

# TAHAP 6 — Banjar/Desa/Komunitas, Admin Program, Pemerintah, CSR/Funding, Pelaporan & Workflow Khusus

## Prompt untuk coding agent

Kerjakan **Tahap 6 saja**. Bangun fitur pengelolaan program dan koordinasi ekosistem setelah jalur operasional inti stabil. Semua dashboard wajib memiliki scope wilayah/organisasi yang jelas dan definisi metrik yang bisa diaudit.

### 1. Banjar, desa, desa adat dan kelompok komunitas

- Sediakan profil wilayah/komunitas, zona layanan dan pengurus yang berwenang.
- Sediakan pengumuman jadwal, panduan kategori lokal, kalender kegiatan, pendaftaran aksi kolektif/kerja bakti dan rekap kegiatan jika termasuk kebutuhan pilot.
- Dukung pelaporan titik penumpukan atau kebutuhan bantuan dengan lokasi yang cukup, bukti dan status tindak lanjut.
- Bedakan program kegiatan lingkungan dari pickup rutin dan transaksi material.
- Hak akses hanya untuk wilayah/komunitas yang diotorisasi. Pengurus komunitas tidak otomatis boleh membaca alamat, histori WastePoints, kontak atau foto privat warga.
- Jangan membuat struktur adat, aturan awig-awig/pararem atau alur persetujuan adat secara default. Jika perlu, konfigurasikan setelah validasi lokal dan persetujuan organisasi terkait.

### 2. Admin platform, operator program dan pemerintah

- Pisahkan `platform admin`, `organization admin`, `area/program manager`, `facility operator`, dan `community coordinator` jika tanggung jawabnya berbeda.
- Sediakan verifikasi organisasi/mitra/petugas, pengaturan area, kategori, jadwal, penerima, status layanan, kebijakan reward yang disetujui dan pengelolaan exception.
- Gunakan maker-checker/dual approval untuk tindakan keuangan atau perubahan kritis jika kebijakan memang memerlukannya.
- Sediakan audit log untuk perubahan konfigurasi, grant role, berat, insentif, funding dan laporan.
- Admin tidak boleh dapat membaca atau mengubah semua data tanpa pembatasan hanya karena namanya “admin”; tentukan platform-wide scope dan organization scope secara eksplisit.

### 3. Program, funding dan CSR

- Modelkan program dengan sponsor/pemberi dana, penerima/organisasi pelaksana, tujuan, periode, wilayah, kategori yang didanai, pagu, aturan pencairan/penggunaan dan bukti pelaksanaan sesuai kebutuhan.
- Bedakan `budget_allocated`, `committed`, `spent`, `pending_evidence` dan `remaining` jika model dana yang dipakai membutuhkannya.
- Jangan mencatat sponsor telah membayar bila pembayaran belum terjadi dan belum diverifikasi.
- Jangan membuat payment gateway, rekening, transfer, atau settlement nyata tanpa requirement dan kredensial integrasi yang sah.
- Setiap reward atau kegiatan yang dibayar dari funding tertentu harus punya referensi sumber dana serta batas anggaran. Tolak penerbitan reward yang melampaui kebijakan/anggaran jika sistem menerapkan cap.
- Sponsor hanya melihat indikator dan bukti yang disetujui untuk programnya; data pribadi penerima harus disamarkan atau diminimalkan.

### 4. Dashboard dan KPI

Implementasikan definisi metrik yang jelas dan filter yang sesuai:

- permintaan dibuat, terjadwal, selesai, gagal, dibatalkan;
- median waktu request-to-pickup dan pickup-to-receipt;
- berat berdasarkan kategori pada sumber, penerimaan, penyaluran dan pengolahan dengan tahap dan metode yang jelas;
- tingkat kontaminasi/penolakan;
- berat yang belum memiliki tujuan berikutnya;
- jumlah batch aktif, output dan residu jika data tersedia;
- penggunaan anggaran dan reward terbit/pending/reversal jika berlaku;
- aktivitas warga/komunitas dan kegiatan lingkungan;
- layanan B2B berdasarkan kontrak/lokasi jika dipakai.

Semua metrik harus menyertakan periode, cakupan wilayah/organisasi, satuan, sumber data, definisi status yang dihitung, dan waktu pembaruan. Jangan menyebut berat “didaur ulang” jika hanya dicatat sebagai diambil atau diterima.

### 5. Kegiatan bersih pantai/sungai dan relawan

Jika masuk prioritas pilot atau telah diminta:

- Buat model kegiatan yang terpisah dari pickup rutin, berisi penyelenggara, area, tanggal, peserta/volunteer count, jenis aktivitas, bukti sebelum/sesudah, kategori material dan kuantitas yang benar-benar ditimbang.
- Jangan menganggap foto sebelum/sesudah cukup untuk menetapkan berat atau dampak kuantitatif.
- Hindari publikasi titik sensitif/lokasi pribadi bila berisiko.
- Kegiatan ini tidak otomatis membuat pengguna menjadi petugas pengangkut rutin.

### 6. Limbah khusus

Jalur ini adalah **feature flag/konfigurasi yang harus nonaktif sampai operator dan prosedur yang kompeten terkonfirmasi**.

- Jangan memberi instruksi detail penanganan material berbahaya yang seharusnya dilakukan oleh pihak berizin/kompeten.
- Sistem hanya boleh mendukung identifikasi awal, pengajuan permintaan, pembatasan akses, rujukan pihak yang berwenang, status dan bukti serah-terima sesuai kebijakan.
- Jangan masukkan ke jadwal pickup umum, bank sampah umum, batch daur ulang biasa atau perhitungan reward normal.
- Jika tidak ada partner yang tervalidasi, jelaskan bahwa jalur belum tersedia dan arahkan ke saluran resmi yang telah dikonfirmasi oleh admin wilayah; jangan mengarang nomor telepon atau organisasi.

### 7. Pelaporan dan ekspor

- Terapkan scope filter server-side; jangan mengambil data global lalu hanya menyembunyikan baris di UI.
- Sediakan CSV/XLSX/PDF hanya jika dependency dan kebutuhan export sudah terkonfirmasi di repository.
- Ekspor harus memiliki waktu pembuatan, filter/periode, satuan dan definisi data; jangan berisi secrets atau data pribadi berlebihan.
- Hindari spreadsheet formula injection pada nilai text yang diekspor.
- Jangan membuat KPI yang tidak dapat dihitung dari data aktual. Tampilkan `not available` atau `insufficient data` untuk metrik yang belum memiliki sumber memadai.

### 8. Tests wajib

- coordinator hanya melihat data area yang ditugaskan;
- sponsor hanya melihat program yang didanai dan data agregat yang diizinkan;
- pengaturan kritis membutuhkan permission yang benar;
- funding tidak dapat dibelanjakan melampaui aturan bila cap diaktifkan;
- reward/program payout memiliki jejak sumber dana;
- setiap angka dashboard dapat ditelusuri ke query dan status sumber yang terdokumentasi;
- eksport tidak membocorkan data sensitif dan aman dari formula injection;
- kegiatan relawan tidak tercampur pada metrik pickup rutin;
- jalur limbah khusus nonaktif secara default dan tidak dapat diselesaikan oleh role umum.

### Deliverables Tahap 6

- Dashboard komunitas/program/admin sesuai prioritas pilot.
- Reporting definitions dan query yang terdokumentasi.
- Model funding/CSR hanya sejauh proses dan kebutuhan telah dikonfirmasi.
- Workflow relawan/limbah khusus hanya bila lolos validasi.
- Matriks role-scope dan tests lintas organisasi/wilayah.

### Quality gate Tahap 6

- [ ] Dashboard memiliki definisi metrik dan filter data terotorisasi.
- [ ] Peran komunitas, admin dan sponsor tidak mempunyai akses berlebihan.
- [ ] Funding dan reward dapat direkonsiliasi, bukan hanya angka ringkasan.
- [ ] Kegiatan relawan terpisah dari pickup rutin.
- [ ] Limbah khusus tidak masuk alur umum dan nonaktif sampai tervalidasi.
- [ ] Ekspor akurat, dibatasi, dan tidak membocorkan informasi pribadi.

---

# TAHAP 7 — Integrasi End-to-End, Security Review, QA, Observability & Pilot Readiness

## Prompt untuk coding agent

Kerjakan **Tahap 7 saja** setelah Tahap 1–6 selesai atau semua gap yang relevan didokumentasikan. Tujuan tahap ini bukan menambahkan banyak fitur baru; tujuan utamanya adalah membuktikan alur inti dapat berjalan dengan data konsisten, izin aman, error tertangani dan operator siap menguji produk di wilayah pilot.

### 1. API dan integrasi antar-modul

- Bandingkan implementasi backend, OpenAPI/API schemas, frontend web dan mobile client.
- Periksa nama field, enum, timestamp, timezone, pagination, error contract, nullable fields, filter dan permission.
- Hapus mock/placeholder dari jalur demo utama atau beri label `demo` dengan jelas.
- Verifikasi setiap tombol aksi terhubung ke API/action valid, state UI merefleksikan hasil server, dan failure punya cara retry.
- Pastikan notifikasi tidak mengirim dua kali ketika transaksi diulang; gunakan outbox/background job hanya jika dibutuhkan oleh arsitektur.
- Periksa migration dari database fresh dan jalur upgrade yang didukung repository.

### 2. E2E journeys minimum

Bangun atau jalankan integration/E2E tests untuk seluruh perjalanan berikut, dengan fixture yang terisolasi:

**Journey A — Warga ke petugas**
1. Warga terautentikasi memilih area layanan aktif.
2. Warga membuat request dengan kategori yang diterima.
3. Request masuk queue supervisor.
4. Supervisor menugaskan petugas valid.
5. Petugas menerima tugas, memperbarui status dan mengunggah bukti yang diperlukan.
6. Petugas menandai pickup berhasil atau gagal dengan alasan.

**Journey B — Pickup ke fasilitas**
1. Pickup yang diambil dirujuk ke serah-terima fasilitas.
2. Penerima fasilitas yang berwenang memeriksa material.
3. Berat/kategori final dicatat dan dikonfirmasi.
4. Selisih/penolakan dicatat dengan reason dan audit.
5. Status receipt terpisah dari status pickup.

**Journey C — Material ke batch/mitra**
1. Material yang diterima dikaitkan ke stok/batch.
2. Batch atau kuantitas yang sah dialokasikan ke tujuan terverifikasi.
3. Pengiriman dicatat dan penerima mengonfirmasi berat diterima.
4. Selisih, penolakan atau sisa dicatat tanpa menghapus histori.
5. Status dampak tidak melampaui bukti yang tersedia.

**Journey D — Reward dan koreksi**
1. Tidak ada poin sebelum berat/kategori terverifikasi.
2. Poin dihitung oleh server berdasarkan aturan aktif jika program reward diaktifkan.
3. Retry tidak menggandakan poin.
4. Koreksi menggunakan adjustment/reversal dan menyimpan reason/actor.
5. Program tanpa funding aktif tidak mengklaim reward bernilai uang.

**Journey E — Bank sampah**
Jika fitur bank sampah diaktifkan: anggota/organisasi benar, transaksi setoran, berat final, nilai historis, koreksi dan laporan direkonsiliasi. Jangan menjalankan journey ini sebagai kewajiban bila bank sampah tidak termasuk pilot.

**Journey F — B2B/program**
Jika relevan: lokasi usaha mengajukan jadwal, pickup/receipt tercatat, laporan hanya menampilkan lokasi/kontrak yang diizinkan. Funding/sponsor hanya mengakses program yang dikelolanya.

**Journey G — Permission/IDOR**
Uji upaya membaca/mengubah request, bukti, berat, transaksi bank sampah, batch, partner delivery, dashboard dan laporan milik organisasi/wilayah lain.

**Journey H — Concurrency dan retry**
Dua petugas mencoba klaim tugas yang sama; dua request mengonfirmasi receipt/reward yang sama; request diulang setelah timeout. Pastikan tidak ada double assignment, double receipt atau double reward.

**Journey I — Failure dan recovery**
Upload media gagal, koneksi putus, validasi server gagal, fasilitas tidak aktif, kategori tidak diterima, mitra membatalkan atau kapasitas penuh. Tampilkan status dan langkah pemulihan yang tepat.

### 3. Security review

- Authentication/session lifecycle, logout, token/session expiry dan refresh sesuai stack yang dipakai.
- RBAC dan pemeriksaan ownership di setiap endpoint sensitif.
- IDOR/BOLA, privilege escalation, mass assignment dan manipulasi role/org id.
- Validasi dan pembatasan file; jangan melayani file privat dari public bucket tanpa proteksi.
- CORS/CSRF/cookie policy sesuai strategi autentikasi.
- Rate limits untuk endpoint yang sensitif atau mudah disalahgunakan jika infrastruktur mendukungnya.
- Secrets, error detail, logs, audit, eksport, signed URL dan data pribadi.
- Dependency audit yang tersedia di toolchain; jangan menonaktifkan security checks hanya demi build lulus.
- Threat model ringkas untuk manipulasi berat, reward, organisasi fiktif, request palsu, penyalahgunaan data warga, dan perubahan transaksi.

Jangan hanya menulis “aman”; laporkan endpoint/test/hasil yang menjadi bukti dan temuan yang belum dapat diuji.

### 4. Data integrity dan observability

- Pastikan migration dari database kosong berhasil.
- Pastikan constraint/index sesuai pola query dan invariant domain.
- Periksa duplicate events, partial transaction, dangling file metadata, orphan records dan data status tak konsisten.
- Log harus cukup untuk debugging, tetapi tidak memuat password, token, alamat lengkap yang tidak diperlukan atau file URL privat.
- Tambahkan correlation/request id jika sesuai arsitektur.
- Tambahkan metrik operasional/health check yang memang dapat didukung deployment.
- Berikan instruksi backup/restore minimum sesuai database/storage yang digunakan; jangan mengklaim backup otomatis jika belum dikonfigurasi.

### 5. UX, accessibility dan performa

- Uji viewport mobile, tablet dan desktop untuk role yang relevan.
- Keyboard navigation, focus states, form labels, contrast, error messages, status tidak hanya ditunjukkan lewat warna, serta screen-reader labels.
- Loading, empty, failure, retry dan pending-sync state tersedia.
- Periksa tabel besar, pagination, filter server-side, query N+1 dan upload foto.
- Hindari mengunduh semua request, gambar dan transaction history sekaligus.
- Pastikan halaman tidak bergantung pada mock data saat API gagal.

### 6. Release dan pilot readiness

Buat dokumen runbook yang menjelaskan:

- requirement environment dan cara menyalakan web/backend/mobile;
- setup database dan migration;
- seed untuk akun demo hanya di development;
- role demo dan langkah login tanpa membagikan credential produksi;
- cara mengonfigurasi area, operator, kategori, jadwal, kapasitas dan tujuan hilir;
- langkah membuat request, dispatch, pickup, facility receipt, batch dan laporan;
- cara mematikan fitur reward/limbah khusus/B2B yang belum aktif;
- known issues, rollback/migration considerations, log yang perlu diperiksa dan jalur melaporkan insiden;
- checklist operator sebelum pilot dimulai.

Jangan deploy ke akun/cloud produksi tanpa izin yang jelas. Jangan memasukkan data pribadi nyata untuk testing; gunakan synthetic fixtures.

### 7. Final scorecard

Laporkan setiap item sebagai `PASS`, `FAIL`, `BLOCKED`, atau `NOT IN SCOPE` dengan bukti singkat:

- [ ] install/startup;
- [ ] migration fresh database;
- [ ] lint/type-check/build;
- [ ] unit tests;
- [ ] integration tests;
- [ ] E2E journeys relevan;
- [ ] role/organization isolation;
- [ ] weight/ledger/batch invariants;
- [ ] upload/access control;
- [ ] responsive/accessibility checks;
- [ ] API/client contract;
- [ ] logging/observability;
- [ ] pilot configuration and runbook;
- [ ] daftar known issues tanpa blocker kritis yang disamarkan.

### Deliverables Tahap 7

1. Hasil pengujian integrasi dan E2E beserta command aktual.
2. Security review dan daftar temuan berbasis tingkat risiko.
3. Dokumen runbook lokal/pilot.
4. Kontrak API dan dokumentasi akhir yang diperbarui.
5. Scorecard release readiness.
6. Daftar fitur yang **siap pilot**, **siap setelah perbaikan**, **dimatikan sampai divalidasi**, dan **bukan scope pilot**.

### Quality gate Tahap 7

- [ ] Alur inti warga → petugas → fasilitas berhasil diuji dari awal hingga akhir.
- [ ] Tidak ada temuan kritis auth, permission, IDOR atau manipulasi reward yang belum ditangani.
- [ ] Migration, test, build dan startup diverifikasi secara aktual.
- [ ] Data timbang, reward, stok dan serah-terima dapat direkonsiliasi.
- [ ] UI tidak menyamarkan mock/pending/error sebagai transaksi sukses.
- [ ] Jalur material yang belum tervalidasi tidak diiklankan sebagai tujuan tersedia.
- [ ] Runbook dan checklist operator cukup untuk pelaksanaan pilot terbatas.

---

# 2. Kontrak Integrasi Antar-Tahap dan Antar-Tim

Jika pekerjaan dibagi ke beberapa coding agent/tim, jangan hanya membagi berdasarkan halaman UI. Setiap domain harus memiliki owner yang bertanggung jawab atas model, API, validasi, authorization dan tests-nya.

## 2.1 Ownership domain yang disarankan

| Domain | Owner utama | Konsumen utama | Kontrak minimum |
|---|---|---|---|
| Identity & Access | Platform | semua modul | user, role grant, organization scope, permission error |
| Service Area & Taxonomy | Platform/Operations | warga, dispatch, fasilitas | area aktif, schedule, category acceptance, destination rules |
| Source & Collection | Collection | warga, petugas, supervisor | request state, assignment, event/history, error contract |
| Verification & Reward | Verification | petugas, fasilitas, warga, program | final weight, category, verification status, ledger idempotency |
| Facility & Material Flow | Facility Operations | TPS3R/TPST, bank sampah, mitra | receipt, batch, stock movement, processing/residue |
| Partner & B2B | Partner Operations | fasilitas, usaha, program | offer/need, delivery, confirmation, service location |
| Program & Analytics | Program | komunitas, admin, government, sponsor | metric definitions, scopes, funding references, exports |
| Notifications & Audit | Platform | semua modul | event reference, recipient authorization, delivery status, audit metadata |

## 2.2 API change protocol

Sebelum mengubah entity/status yang dipakai modul lain:

1. Ubah dokumentasi kontrak terlebih dahulu atau bersamaan dengan perubahan kode.
2. Jelaskan migration dan dampaknya terhadap data existing.
3. Perbarui OpenAPI/types/client dan contract tests.
4. Pastikan consumer yang terdampak tidak memakai enum atau field lama.
5. Sediakan compatibility/deprecation path bila breaking change tidak dapat dihindari.

## 2.3 Prinsip komunikasi antar-squad

- Setiap fitur mempunyai satu domain owner.
- Domain lain mengakses data lewat service/API/contract yang disepakati, bukan menulis tabel secara langsung tanpa ownership.
- Jangan membuat dua sumber kebenaran untuk berat final, status pickup, saldo poin, status batch atau anggaran.
- Test kontrak harus menangkap perubahan API yang memutus frontend/mobile.
- Demo data tidak boleh masuk laporan production.

---

# 3. Aturan Scope: Apa yang Wajib dan Apa yang Menunggu Validasi

## 3.1 Wajib untuk MVP pilot yang terdefinisi

- akun dan role yang dibatasi;
- konfigurasi area, kategori dan jadwal yang benar;
- warga membuat request atau setoran sesuai cara operasi aktual;
- petugas menerima dan menyelesaikan tugas atau memberi alasan gagal;
- operator penerima mencatat penerimaan, kategori dan berat final;
- bukti/status history/audit untuk langkah kritis;
- material dapat ditelusuri minimal sampai penerima berikutnya;
- dashboard supervisor/admin dasar;
- tests untuk ownership, status, berat dan transaksi ganda;
- runbook dan prosedur validasi pilot.

## 3.2 Diaktifkan hanya bila ada bukti kebutuhan dan operator

- WastePoints/penukaran reward;
- transaksi tabungan bank sampah;
- marketplace/penawaran harga;
- pengolahan organik dan pencatatan hasil kompos/biokonversi;
- layanan B2B, kontrak, SLA, invoice atau payment;
- program CSR, funding dan sponsor reports;
- kegiatan bersih pantai/sungai;
- jalur limbah khusus;
- push/WhatsApp/SMS, peta/rute, IoT timbangan atau sistem eksternal.

## 3.3 Jangan implementasikan hanya karena terlihat canggih

- AI klasifikasi foto sebagai otoritas tunggal kategori/berat;
- optimasi rute kompleks sebelum data perjalanan tersedia;
- live GPS petugas sepanjang hari tanpa kebutuhan dan kebijakan yang jelas;
- blockchain/tokenisasi;
- klaim emisi atau dampak lingkungan tanpa metodologi dan input data yang dapat diverifikasi;
- multi-tenant kompleks atau microservices yang tidak didukung kebutuhan nyata;
- pembayaran/reward tunai tanpa sumber dana, kebijakan, proses settlement dan legal/operational review.

---

# 4. Definition of Done Universal

Fitur dianggap selesai hanya jika semua butir relevan terpenuhi:

- [ ] Requirement dan aktor pengguna dapat dijelaskan.
- [ ] Frontend, backend dan database benar-benar terhubung jika fitur membutuhkan ketiganya.
- [ ] Permission dan ownership dicek pada server.
- [ ] Validation dan state transition terdokumentasi.
- [ ] Loading, empty, error, retry dan success state ditangani.
- [ ] Data penting mempunyai audit trail dan sumber kebenaran yang jelas.
- [ ] Test happy path, unauthorized path dan edge case yang berisiko tersedia.
- [ ] Migration aman dan dapat dijalankan.
- [ ] Tidak ada mock, tombol mati, TODO kritis atau data demo tersembunyi di jalur production.
- [ ] Dokumentasi dan API/client types diperbarui.
- [ ] Test command yang dijalankan serta hasil aktual dilaporkan.
- [ ] Risiko atau asumsi lapangan yang belum disahkan dinyatakan terbuka.

---

# 5. Template Laporan Setelah Menjalankan Satu Tahap

Minta coding agent mengakhiri setiap tahap dengan format di bawah ini.

```markdown
## Laporan Tahap [N] — [Nama Tahap]

### 1. Ringkasan
- Fitur selesai:
- Fitur yang belum selesai:
- Perubahan paling penting:

### 2. File berubah
| File | Perubahan | Alasan |
|---|---|---|

### 3. Domain/API/Database
- Entity/migration baru atau berubah:
- Endpoint/contract baru atau berubah:
- Enum/state/permission yang berubah:
- Strategi compatibility:

### 4. Testing aktual
| Command/Test | Hasil | Catatan |
|---|---|---|

### 5. QA per role
- Warga:
- Petugas:
- Supervisor:
- Fasilitas/bank sampah:
- Mitra/usaha/program (bila in scope):

### 6. Quality gate
- PASS:
- FAIL:
- BLOCKED:
- NOT IN SCOPE:

### 7. Asumsi dan validasi lapangan
- Asumsi:
- Bukti yang dibutuhkan:
- Dampak jika asumsi salah:

### 8. Cara menjalankan dan menguji manual
1.
2.
3.

### 9. Risiko/known issues
- Severity:
- Dampak:
- Mitigasi:

### 10. Rekomendasi berikutnya
- Gate apa yang harus dibereskan sebelum tahap berikutnya:
```

---

# 6. Checklist Product Owner Sebelum Menekan Go pada Tiap Tahap

- [ ] Apakah fitur menyelesaikan masalah yang memang dialami kelompok pengguna sasaran?
- [ ] Apakah ada aktor lapangan yang mau menguji dan memvalidasi alur tersebut?
- [ ] Apakah operator dan tujuan material yang diperlukan benar-benar tersedia?
- [ ] Apakah ada definisi selesai yang dapat diuji tanpa membuat klaim dampak berlebihan?
- [ ] Apakah data sensitif yang dikumpulkan memang diperlukan?
- [ ] Apakah fitur tahap ini memperkuat alur utama atau sekadar memperluas scope?
- [ ] Apakah acceptance criteria dapat diverifikasi dengan data sintetis dan test otomatis?
- [ ] Apakah hasil tahap sebelumnya stabil dan quality gate-nya sudah dinyatakan lulus?

---

# 7. Catatan Riset dan Validasi Eksternal

Gunakan sumber resmi berikut sebagai **konteks untuk pertanyaan validasi**, bukan sebagai pengganti observasi operator pilot. Selalu verifikasi kembali ketentuan yang berlaku pada wilayah dan waktu implementasi.

- Kementerian Lingkungan Hidup/BPLH, gerakan pemilahan sumber di Bali (10 Juni 2026): https://kemenlh.go.id/news/detail/tegas-klhbplh-dan-pemprov-bali-wajibkan-warga-pilah-sampah-100-persen-mulai-1-juli
- DKLH Provinsi Bali, pedoman teknis pengelolaan sampah berbasis sumber/TPS 3R: https://dklh.baliprov.go.id/wp-content/uploads/2022/04/PEDOMAN-TEKNIS-PENGELOLAAN-SAMPAH-BERBASIS-SUMBER-1_compressed-2.pdf
- DKLH Provinsi Bali, UPTD Pengelolaan Sampah dan fungsi pengelolaan TPA Regional: https://dklh.baliprov.go.id/uptd-pengelolaan-sampah/
- DKLH Provinsi Bali, Gerakan Bali Bersih Sampah dan pedoman menurut sektor: https://dklh.baliprov.go.id/gerakan-bali-bersih-sampah-gbbs/

Jangan menghardcode peraturan, angka statistik, harga, SLA, kapasitas, atau skema reward hanya berdasarkan sumber umum. Catat versi, tanggal pemeriksaan, applicability dan konfirmasi pihak lokal sebelum menjadikannya aturan aplikasi.

---

# Penutup

Jalankan ketujuh tahap sebagai satu rangkaian evolusi produk yang bisa diuji. Fokus pertama adalah **membuat aliran kerja aktual dapat berjalan dan dilacak**: warga/sumber → penugasan → pengambilan → penerimaan dan penimbangan → batch/serah-terima → tujuan material yang jelas. Modul komunitas, mitra, B2B, program, funding dan workflow khusus ditambahkan setelah dasar operasional teruji atau jika memang menjadi syarat pilot.

Jangan menganggap semua aktor, fasilitas, aturan, harga dan jalur pemrosesan di Bali identik. Semua konfigurasi yang berdampak pada operasi harus dapat diubah dengan kewenangan, memiliki jejak audit, dan divalidasi pada wilayah pilot yang sesungguhnya.
