# Kedas — Feature Optimization Backlog

**Dokumen ID:** DOC-OPT-BACKLOG-001  
**Produk:** Kedas (AI-Powered Community & Green Tourism Intelligence Platform)  
**Tanggal Audit:** 30 Oktober 2026  
**Status:** BACKLOG REKOMENDASI (Belum Diimplementasikan — Siap Sprint Planning)  

---

## 1. Ringkasan Prioritas Backlog

| Prioritas | Jumlah Item | Estimasi Kompleksitas | Kategori Dominan |
| :--- | :---: | :--- | :--- |
| **P0 — Critical** | 2 | 1 Quick Win, 1 Moderate | Keamanan, Integrasi UI Dinamis |
| **P1 — High** | 6 | 4 Moderate, 2 Major | AI Grounding, Traceability, Copilot Action |
| **P2 — Medium** | 6 | 4 Moderate, 2 Research | HOREKA Portal, DCLI Radar Chart, Offline Queue |
| **P3 — Low** | 2 | 2 Major | IoT Sensor Integration, Automated Price Index |
| **TOTAL** | **16** | — | — |

---

## 2. Rincian Item Backlog Optimasi

### REC-001: Dynamic CDOA & Service Area Data Binding
- **ID:** `REC-001`
- **Domain:** Destination & CDOA
- **Judul:** Integrasi Data Dinamis Kawasan Layanan dan Status CDOA dari API
- **Masalah & Bukti:** Halaman `/area-layanan` (`frontend/src/app/(public)/area-layanan/page.tsx`, L8-L41) menggunakan array statis `areas` yang di-hardcode. Perubahan nama pos atau jam operasional banjar di database tidak tercermin di tampilan pengguna.
- **Perilaku Target:** Halaman memanggil `GET /api/v1/service-areas` dan `/api/v1/community/cdoa` untuk merender kartu kawasan secara dinamis sesuai kesepakatan aktif.
- **Persona:** Wisatawan, Warga Banjar, Prajuru Adat.
- **Prioritas:** **P0 — Critical** | **Feasibility:** QUICK WIN (S)
- **Dependency:** API `/api/v1/service-areas` (sudah tersedia dan teruji).
- **Acceptance Criteria:**
  ```gherkin
  Given prajuru banjar memperbarui jam operasional pada CDOA Sukawati
  When pengunjung membuka rute /area-layanan
  Then jadwal dan status terbaru dari database ditampilkan tanpa reload kode
  And jika jaringan gagal, tampilkan fallback visual informatif
  ```
- **KPI:** $100\%$ sinkronisasi jadwal penjemputan antara backend dan web.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)

---

### REC-002: Pre-filled Action Modal for Operations Copilot
- **ID:** `REC-002`
- **Domain:** Kedas Operations Copilot
- **Judul:** Hubungkan Rekomendasi Copilot dengan Modal Aksi Terisi Otomatis (Pre-filled Action)
- **Masalah & Bukti:** Di `frontend/src/app/admin/laporan/page.tsx` (L235), tombol eksekusi pada kartu rekomendasi Copilot hanya menampilkan notifikasi toast umum: *"Aksi dapat dieksekusi melalui modul operasional terkait."*
- **Perilaku Target:** Mengklik tombol rekomendasi membuka dialog konfirmasi/penugasan dengan data rute, fasilitas tujuan, atau ID penjemputan yang telah terisi otomatis, mempertahankan konfirmasi manusia sebelum database diubah.
- **Persona:** Pengelola Kawasan, Operator TPS3R, Admin.
- **Prioritas:** **P1 — High** | **Feasibility:** MODERATE (M)
- **Dependency:** `OperationRecommendationCard.tsx` (sudah ada event `onExecute`).
- **Acceptance Criteria:**
  ```gherkin
  Given Copilot merekomendasikan relokasi 400kg sampah organik ke TPS3R Sukawati
  When admin menekan tombol "Buka Form Alokasi"
  Then modal mutasi stok terbuka dengan dropdown fasilitas sudah terpilih TPS3R Sukawati
  And berat 400kg sudah terisi otomatis
  And admin harus menekan "Konfirmasi Pengiriman" sebelum data disimpan
  ```
- **KPI:** Pengurangan waktu koordinasi alokasi beban berlebih dari 15 menit menjadi < 2 menit.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)

---

### REC-003: Dense Vector Hybrid Search with pgvector for EcoGuide
- **ID:** `REC-003`
- **Domain:** Knowledge Management & Kedas EcoGuide
- **Judul:** Integrasi Ekstensi `pgvector` untuk Pencarian Semantik Hybrid pada EcoGuide
- **Masalah & Bukti:** `backend/app/modules/ai/knowledge.py` saat ini mengandalkan pencocokan token leksikal (TF-IDF sederhana). Istilah kearifan lokal Bali atau sinonim tidak tertangkap jika tidak terdapat kecocokan kata persis.
- **Perilaku Target:** Menggunakan pencarian hybrid: BM25 untuk nama regulasi persis + Cosine Similarity Vector Embedding untuk pemahaman maksud pertanyaan.
- **Persona:** Wisatawan Asing, Warga Baru.
- **Prioritas:** **P1 — High** | **Feasibility:** MODERATE (M)
- **Dependency:** PostgreSQL 16 dengan ekstensi `pgvector` dan model embedding server-side.
- **Acceptance Criteria:**
  ```gherkin
  Given wisatawan bertanya "Where can I throw canang sari after prayer?"
  When EcoGuide mengevaluasi basis pengetahuan tanpa kata "throw"
  Then sistem mencocokkan semantik dengan konsep pembuangan upakara organik
  And menyajikan rujukan resmi Bab II Pergub 47/2019
  ```
- **KPI:** Peningkatan semantic recall query bahasa campuran dari $78\%$ menjadi $> 94\%$.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)

---

### REC-004: Dedicated HOREKA / Green Hospitality Workspace
- **ID:** `REC-004`
- **Domain:** Green Hospitality Ledger
- **Judul:** Pemisahan Portal Khusus Pelaku Usaha Pariwisata (`/hospitality`)
- **Masalah & Bukti:** Saat ini hotel, villa, dan restoran harus menggunakan antarmuka setoran warga biasa atau melihat data di `/admin/mitra`. Alur kerja log sampah harian dapur hotel belum memiliki UI terisolasi.
- **Perilaku Target:** Rute `/hospitality` khusus dengan fitur: pencatatan timbangan sampah dapur harian, pelacakan pengiriman kompos mandiri, dan laporan bulanan ESG destinasi hijau.
- **Persona:** Green Officer Hotel, Manajer Restoran.
- **Prioritas:** **P2 — Medium** | **Feasibility:** MAJOR (L)
- **Dependency:** Model B2B di `backend/app/modules/marketplace/models.py`.
- **Acceptance Criteria:**
  ```gherkin
  Given staf hotel login dengan peran HOREKA
  When mereka mengakses dashboard
  Then mereka diarahkan ke workspace /hospitality
  And disajikan formulir log harian sampah organik dan residu hotel
  ```
- **KPI:** Kepatuhan pencatatan limbah hotel anggota mitra $\ge 90\%$ setiap bulan.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)

---

### REC-005: Offline-First ServiceWorker & Queue for Collectors
- **ID:** `REC-005`
- **Domain:** Collection, Staff & Metrology
- **Judul:** Antrean Simpan Lokal (IndexedDB) untuk Penginputan Timbangan di Area Blank-Spot
- **Masalah & Bukti:** Jika petugas kebersihan banjar berada di area tanpa sinyal seluler saat menimbang sampah warga, penyerahan setoran tidak dapat disimpan dan aplikasi memunculkan error jaringan.
- **Perilaku Target:** Form inspeksi dan penimbangan menyimpan data sementara di browser IndexedDB dengan tanda `PENDING_SYNC`, lalu otomatis disinkronkan saat koneksi internet pulih.
- **Persona:** Petugas Lapangan (Collector).
- **Prioritas:** **P1 — High** | **Feasibility:** MODERATE (M)
- **Dependency:** ServiceWorker PWA atau client-side background sync.
- **Acceptance Criteria:**
  ```gherkin
  Given petugas berada di lokasi tanpa koneksi internet (offline)
  When petugas memasukkan bobot timbangan 8.5kg dan menekan "Simpan"
  Then data disimpan di antrean lokal dengan status "Tersimpan Offline"
  And saat koneksi internet kembali aktif, transaksi diunggah otomatis ke server
  ```
- **KPI:** $0\%$ kegagalan pencatatan timbangan akibat kendala sinyal seluler.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)

---

### REC-006: Interactive DCLI Radar Chart Visualization
- **ID:** `REC-006`
- **Domain:** Analytics & DCLI
- **Judul:** Visualisasi Diagram Radar Destination Clean Loop Index pada Halaman Laporan
- **Masalah & Bukti:** Backend telah memiliki logika perhitungan skor DCLI 4 dimensi di `backend/app/modules/community/service.py`, tetapi UI `/admin/laporan` hanya menampilkan metrik agregat dalam bentuk tabel ringkas.
- **Perilaku Target:** Menampilkan grafik radar interaktif dengan 4 sumbu: *Pemisahan Sumber*, *Efisiensi Koleksi*, *Divergensi Daur Ulang*, dan *Partisipasi Komunitas*.
- **Persona:** Pengelola Destinasi, Dinas Lingkungan Hidup, Asosiasi Pariwisata.
- **Prioritas:** **P2 — Medium** | **Feasibility:** QUICK WIN (S)
- **Dependency:** Endpoint `/api/v1/community/dcli` (sudah tersedia).
- **Acceptance Criteria:**
  ```gherkin
  Given admin membuka tab audit destinasi di /admin/laporan
  When data DCLI dimuat dari API
  Then diagram radar menampilkan skor masing-masing dimensi beserta interpretasi kualitatif
  ```
- **KPI:** Kemudahan pembacaan indeks kebersihan destinasi oleh pengambil kebijakan.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)

---

### REC-007: Admin Knowledge Ingestion Web UI
- **ID:** `REC-007`
- **Domain:** Admin & Governance
- **Judul:** Formulir Antarmuka Web Pengelolaan Dokumen Pengetahuan Kawasan
- **Masalah & Bukti:** Endpoint `/api/v1/ai/knowledge` sudah berfungsi dengan otorisasi admin, namun saat ini penambahan dokumen SOP baru masih harus melalui API caller eksternal / curl.
- **Perilaku Target:** Halaman `/admin/pengetahuan` dengan form unggah judul, nomor regulasi, penentuan kawasan destinasi, status publik/privat, dan preview hasil chunking.
- **Persona:** Super Admin, Area Admin Desa.
- **Prioritas:** **P1 — High** | **Feasibility:** QUICK WIN (S)
- **Dependency:** Komponen UI `Panel`, `Input`, `Button`.
- **Acceptance Criteria:**
  ```gherkin
  Given admin login ke portal /admin
  When admin mengunggah teks SOP TPS3R baru
  Then sistem membuat KnowledgeDocument dan menampilkan cuplikan chunking yang dihasilkan
  ```
- **KPI:** Waktu pembaruan aturan SOP kawasan berkurang menjadi < 5 menit.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)

---

### REC-008: Localized Curated Image Benchmark Dataset
- **ID:** `REC-008`
- **Domain:** Kedas Vision
- **Judul:** Penyusunan Dataset Uji 500+ Foto Sampah Khas Bali untuk Evaluasi Empiris Model Visi
- **Masalah & Bukti:** Kedas Vision belum memiliki dataset evaluasi ground truth lokal yang terdokumentasi dalam repositori, sehingga metrik akurasi multi-kelas belum dapat dihitung secara ilmiah.
- **Perilaku Target:** Repositori dataset uji dengan citra sampah canang sari, botol plastik terjemur, batok kelapa, dan minyak jelantah lengkap dengan anotasi kelas ground truth.
- **Persona:** AI Engineer, QA Analyst.
- **Prioritas:** **P2 — Medium** | **Feasibility:** RESEARCH (M)
- **Dependency:** Izin foto lapangan dari pos TPS3R Sukawati & Ubud.
- **Acceptance Criteria:**
  ```gherkin
  Given dataset uji 500 foto dijalankan melalui runner evaluasi visi
  When model mengklasifikasikan gambar
  Then laporan menghasilkan confusion matrix, precision, recall, dan macro-F1 per kelas
  ```
- **KPI:** Publikasi metrik presisi visi terverifikasi secara transparan $\ge 88\%$.
- **Status:** RECOMMENDED (NOT IMPLEMENTED)
