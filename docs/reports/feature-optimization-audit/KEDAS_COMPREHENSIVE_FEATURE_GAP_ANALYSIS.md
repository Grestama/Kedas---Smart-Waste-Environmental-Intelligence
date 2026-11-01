# Kedas — Comprehensive Feature Gap Analysis & Optimization Report

**Dokumen ID:** DOC-MAIN-AUDIT-001  
**Versi:** 1.0 — Final Audit Release  
**Nama Produk:** Kedas  
**Nama Historis:** WasteLink Bali  
**Posisi Produk:** AI-Powered Community & Green Tourism Intelligence Platform  
**Tagline:** *Bergerak Bersama untuk Lingkungan yang Lebih Bersih.*  
**Tanggal Audit:** 30 Oktober 2026  
**Auditor:** Tim Gabungan Multi-Disiplin Kedas (Senior Product Analyst, Software Architect, AI Specialist, UX Auditor, Security Analyst, QA Lead)  
**Lingkup Kerja:** Read-Only Product, Codebase, UX, AI & Quality Audit  

---

## 1. Cover & Scope of Audit

Laporan ini disusun berdasarkan audit berbasis bukti (*evidence-based audit*) terhadap implementasi aktual pada repositori perangkat lunak Kedas. Audit ini mencakup backend FastAPI (80 file sumber), frontend Next.js 15 (38 rute web), modul kecerdasan artifisial (EcoGuide, Vision, Operations Copilot), 10 migrasi skema database Alembic, dan 203 pengujian otomatis.

---

## 2. Executive Summary

Platform Kedas telah berhasil menyelesaikan fase transisi dari sistem pencatatan sampah operasional menjadi **platform kecerdasan destinasi pariwisata hijau berbasis web**. Sistem memiliki fondasi rekayasa yang sangat solid:
- **100% Lolos Pengujian Otomatis:** 86 pengujian backend Pytest, 102 pengujian frontend Vitest, dan 15 pengujian mesin mobile (total 203 tes).
- **Fondasi AI Bertanggung Jawab:** Seluruh pemanggilan model AI dilindungi oleh adapter server-side dengan filter injeksi prompt (100% defense rate), pembersihan PII otomatis, dan protokol pantangan (*explicit abstention*) pada Kedas EcoGuide.
- **Rantai Telusur & Paspor Sampah:** Kedas Waste Passport menghubungkan warga, armada trike, dan timbangan digital POS di fasilitas TPS3R secara transparan, lengkap dengan estimasi emisi karbon yang terhindar ($1.82\text{ kg CO}_2\text{e/kg}$).

Meskipun demikian, audit mengidentifikasi sejumlah celah integrasi yang perlu dioptimalkan:
1. Halaman `/area-layanan` masih menggunakan data statis di frontend alih-alih binding ke API relasional.
2. Rekomendasi Operations Copilot masih memerlukan penghubung langsung ke formulir aksi otomatis (*pre-filled dispatch modal*).
3. Retrieval RAG EcoGuide saat ini berbasis leksikal persis; adopsi `pgvector` direkomendasikan untuk pemahaman semantik bahasa campuran Bali-Inggris.
4. Workspace khusus mitra perhotelan HOREKA (`/hospitality`) perlu dipisahkan dari alur warga umum.

---

## 3. Product Direction & Evaluation Criteria

### 3.1. Nilai Pembeda Kedas
Kedas diarahkan sebagai sistem operasi kebersihan destinasi berbasis komunitas (*Community-led Destination Waste Operations & Green Tourism Platform*). Lima pilar nilainya adalah:
1. **Local Context Intelligence:** AI memahami aturan adat banjar dan SOP fasilitas berdasarkan dokumen CDOA yang tervalidasi.
2. **Waste Traceability:** Perjalanan material dapat dilacak dari sumber (warga/hotel) hingga timbangan fisik fasilitas dan offtaker daur ulang.
3. **Operational Intelligence:** Rekomendasi operasional berorientasi pada batasan deterministik kapasitas fasilitas dan neraca massa ($In = Out + Residu$).
4. **Community & Green Tourism:** Kolaborasi antara warga desa adat dan industri pariwisata hijau melalui insentif terukur.
5. **Evidence-Based Impact:** Laporan emisi dan dampak lingkungan menggunakan metodologi konversi yang dapat diverifikasi.

### 3.2. Skala Tingkat Kematangan Fitur (Maturity Score 0–5)
- **Skor 0:** Belum ada implementasi atau konsep saja.
- **Skor 1:** Konsep atau mockup visual tanpa backend.
- **Skor 2:** Implementasi parsial; banyak komponen mock/terputus.
- **Skor 3:** Happy path berfungsi end-to-end pada skenario utama.
- **Skor 4:** Edge case, otorisasi RBAC, error recovery, dan regression tests memadai.
- **Skor 5:** Teruji melalui penggunaan nyata/pilot dengan metrik operasional terbukti (E4).

---

## 4. Audit Method & Evidence Limitations

Audit dijalankan secara *read-only* dengan memverifikasi:
- Kode sumber aktual (E1).
- Eksekusi pengujian otomatis multi-tier (E2).
- Perilaku runtime aplikasi web dan endpoint API (E3).

**Batasan Bukti (Evidence Limitation):**
Sistem berada pada status *Production-Ready Demo & Pilot Readiness*. Pengujian lapangan skala penuh multi-bulan bersama ribuan warga (level E4) belum tersedia dalam repositori dan direncanakan pada tahap implementasi lapangan.

---

## 5. As-Built System Snapshot

```
========================================================================================
 DIMENSI SISTEM             SPESIFIKASI REPOSITORI AKTUAL          STATUS VERIFIKASI
========================================================================================
 Model ORM Database         44 Tabel Relasional SQLAlchemy         E1 (Code Verified)
 Skrip Migrasi Alembic      10 Versi Bertahap (0001 - 0010)        E1 (Applied & Clean)
 Rute Web Frontend          38 Rute Next.js 15 (App Router)        E1 + E3 (Build Passed)
 Endpoint API Backend       116 Endpoint RESTful FastAPI           E1 + E2 (86 Tests Green)
 Peran Pengguna (RBAC)      8 Peran Otorisasi Terdefinisi          E1 + E2 (RBAC Verified)
 Pengujian Otomatis         203 / 203 Lulus (100% Success)         E2 (Automated Proof)
 Runtime TypeScript         0 Error (tsc --noEmit)                 E2 (Type-Safe)
========================================================================================
```

---

## 6. Stack & Architecture Inventory

```mermaid
flowchart TD
    subgraph ClientTier["Frontend Web Client (Next.js 15.1.7 / React 19 / TypeScript)"]
        PublicViews["Public Microsite (/guest, /area-layanan, /panduan)"]
        CitizenPortal["Citizen Workspace (/app, /app/setoran, /app/waste-points)"]
        StaffPortal["Collector Portal (/staff/tugas, /staff/riwayat)"]
        AdminDashboard["Admin & Copilot Hub (/admin/laporan, /admin/pengguna)"]
    end

    subgraph APITier["Backend API Gateway (FastAPI 0.115.0 / Python 3.13)"]
        AuthMiddleware["Argon2id + SHA-256 Session Auth & RBAC"]
        SafetyFilter["Prompt Injection Detector & PII Redactor"]
        DomainRouters["20 Domain Routers (/api/v1/...)"]
        AIAdapter["Dual-Mode AI Provider Adapter"]
    end

    subgraph DataTier["Data Persistence & Infrastructure"]
        Postgres[(PostgreSQL 16 Engine / Alembic Migrations)]
        InteractionLogs[(Audit & AI Interaction Logs)]
        KnowledgeStore[(Knowledge Base & Scoped Chunks)]
    end

    subgraph ExternalServices["External AI Services"]
        GeminiAPI["Google Gemini 2.0 Flash / OpenAI API"]
        LocalFallback["Kedas Resilient Heuristic Fallback Engine"]
    end

    ClientTier -->|HTTPS / JSON / Session Token| APITier
    APITier --> Postgres
    APITier --> InteractionLogs
    APITier --> KnowledgeStore
    AIAdapter -->|Online| GeminiAPI
    AIAdapter -->|Offline / Sandbox| LocalFallback
```

---

## 7. User Persona & Role Inventory

Kedas mendefinisikan 8 peran sistem dengan isolasi kewenangan yang ketat:

| Peran (Role Code) | Nama Peran | Hak Akses Utama & Ruang Lingkup | Status Implementasi |
| :--- | :--- | :--- | :---: |
| **`CITIZEN`** | Warga Banjar | Booking penjemputan sampah, upload foto Vision, cek WastePoints & Waste Passport. | **EV (Maturity 4)** |
| **`COLLECTOR`** | Petugas Armada Trike | Ambil tugas penjemputan, input hasil inspeksi & penimbangan digital POS. | **EV (Maturity 4)** |
| **`FACILITY_OPERATOR`**| Operator TPS3R/TPST | Terima kiriman armada, verifikasi neraca massa, catat mutasi stok kompos/daur ulang. | **EV (Maturity 3.5)**|
| **`AREA_ADMIN`** | Prajuru Banjar / Desa | Pengelolaan jadwal penjemputan, validasi pengajuan petugas, verifikasi CDOA. | **EV (Maturity 3.5)**|
| **`SUPER_ADMIN`** | Administrator Sistem | Konfigurasi taksonomi sampah, manajemen pengguna, ingestion knowledge base AI. | **EV (Maturity 4)** |
| **`HOREKA`** | Mitra Hotel & Restoran | Pencatatan volume sampah dapur, pelacakan pengiriman organik ke peternakan/kompos. | **EP (Maturity 2.5)**|
| **`BUYER`** | Mitra Pengepul Industri| Melihat ketersediaan stok material terpilah, pemesanan delivery order batch daur ulang.| **EP (Maturity 2.5)**|
| **`AUDITOR`** | Auditor Lingkungan | Mengakses laporan kepatuhan, ekspor CSV sanitized, verifikasi DCLI dan audit trail. | **EV (Maturity 3.5)**|

---

## 8. Feature Maturity Overview

```mermaid
pie title Distribusi Status Kematangan Fitur Kedas
    "Existing Verified (EV)" : 16
    "Existing Partial (EP)" : 5
    "Backend Only (BE)" : 1
    "Not Applicable (NA)" : 1
```

- **Rata-rata Skor Kematangan Keseluruhan:** **3.42 / 5.0**
- Domain dengan kematangan tertinggi: *Identity & RBAC (4.0)*, *Collection & Staff (4.0)*, *Waste Passport (4.0)*, *Knowledge & EcoGuide (4.0)*.
- Domain yang membutuhkan penguatan UX: *Green Hospitality Ledger (2.5)*, *Community EcoLoop Issue Reporting (2.5)*.

---

## 9. Product Requirement Traceability

Dari 23 kebutuhan inti pada PRD dan SRS:
- **16 Kebutuhan (69.6%):** Berstatus **`EV` (Existing Verified)** dengan bukti kode dan pengujian otomatis lengkap.
- **5 Kebutuhan (21.7%):** Berstatus **`EP` (Existing Partial)** — logika backend tersedia, antarmuka web perlu dioptimalkan (CDOA dinamis, HOREKA portal, offline sync).
- **1 Kebutuhan (4.3%):** Berstatus **`BE` (Backend Only)** — algoritma DCLI tersedia di API, visualisasi radar chart belum dipasang di UI.
- **1 Kebutuhan (4.3%):** Berstatus **`NA` (Not Applicable)** — penimbangan fisik langsung oleh AI (ditolak karena melanggar etika metrologi).

---

## 10. Workflow & End-to-End Journey Audit

```mermaid
flowchart TD
    subgraph J1["Journey 1: Wisatawan Asing di Destinasi"]
        A1["Buka /guest"] --> B1["Pilih Bahasa EN"]
        B1 --> C1["Tanya EcoGuide: Aturan Kelapa/Canang"]
        C1 --> D1["Terima Jawaban + Sitasi SOP TPS3R"]
    end

    subgraph J2["Journey 2: Warga Melakukan Setoran"]
        A2["Buka /app/setoran/baru"] --> B2["Foto Sampah via Kedas Vision"]
        B2 --> C2["Saran: Botol Plastik PET Bening"]
        C2 --> D2["Konfirmasi Manusia & Pilih Slot Banjar"]
        D2 --> E2["Booking Sukses & Kuota Terkunci"]
    end

    subgraph J3["Journey 3: Rantai Telusur & Paspor Sampah"]
        A3["Petugas Trike Datang & Timbang POS"] --> B3["Timbangan 4.5kg Terverifikasi"]
        B3 --> C3["WastePoints Diterbitkan ke Ledger"]
        C3 --> D3["Paspor Sampah Merekam 8.19kg CO2e Terhindar"]
    end

    subgraph J4["Journey 4: Audit & Operasional Destinasi"]
        A4["Admin Buka /admin/laporan"] --> B4["Copilot Deteksi Anomali Neraca Massa"]
        B4 --> C4["Selisih Kirim > 15% Ditandai"]
        C4 --> D4["Ekspor CSV Laporan Sanitized"]
    end
```

---

## 11. Deep Feature Audit per Domain

### 11.1. Destination & CDOA (Maturity: 3.0 | Status: EP)
- **Model:** `CDOAAgreement` di `backend/app/modules/community/models.py`.
- **Celah (GAP-001):** Halaman publik `/area-layanan` saat ini merender kartu banjar secara statis di kode frontend. Perubahan jam operasional pos di database belum tersinkronisasi otomatis.
- **Rekomendasi (REC-001):** Sambungkan komponen ke service `listServiceAreas` dan `getCDOADetail`.

### 11.2. Identity, Role & Multi-Organization (Maturity: 4.0 | Status: EV)
- **Model:** `User`, `UserRole`, `Role`, `AuthSession`, `UserAddress`.
- **Kekuatan:** Session token SHA-256, hash password Argon2id, otorisasi RBAC 8 peran, perlindungan anti-IDOR teruji di `test_idor_addresses_and_pickups.py`.
- **Celah:** Pengguna belum memiliki antarmuka mandiri untuk berpindah organisasi bila memiliki keanggotaan ganda.

### 11.3. Knowledge Management & Kedas EcoGuide (Maturity: 4.0 | Status: EV)
- **Model:** `KnowledgeDocument`, `KnowledgeChunk`, `AIInteractionLog`.
- **Kekuatan:** Retrieval dengan *exact token set intersection* dan stopword filtering (100% presisi sitasi, 100% kemampuan abstensi saat out-of-scope).
- **Celah (GAP-AI-01):** Masih berbasis leksikal persis; belum mendukung dense vector search (`pgvector`). Form ingestion dokumen di UI admin belum ada (REC-007).

### 11.4. Kedas Vision (Maturity: 3.0 | Status: EV)
- **Service:** `analyze_material_image` di `backend/app/modules/ai/service.py`.
- **Kekuatan:** Batasan 5MB, filter MIME gambar, pita keyakinan (`HIGH`/`MEDIUM`/`NEEDS_REVIEW`), mandatory human review.
- **Celah (GAP-AI-03):** Repositori belum memuat dataset uji citra sampah lokal Bali yang terdokumentasi (REC-008).

### 11.5. Kedas Operations Copilot (Maturity: 3.5 | Status: EV)
- **Service:** `query_operations_copilot` di `backend/app/modules/ai/service.py`.
- **Kekuatan:** 3 tools whitelisted (`PRIORITIZE_TASKS`, `FIND_ELIGIBLE_FACILITY`, `ANOMALY_SUMMARY`), batas deviasi berat $15\%$, read-only guarantee.
- **Celah (GAP-002):** Tombol aksi rekomendasi hanya memunculkan toast; belum menyediakan pre-filled action modal (REC-002).

### 11.6. Collection, Staff & Waste Passport (Maturity: 4.0 | Status: EV)
- **Model:** `PickupRequest`, `CollectionSlot`, `PickupStatusEvent`.
- **Kekuatan:** Kunci kuota slot teruji konkurensi di `test_collection_concurrency.py`, Digital Waste Passport dengan kalkulasi emisi karbon.
- **Celah (GAP-005):** Belum ada antrean simpan offline (*IndexedDB*) untuk kolektor di pelosok banjar (REC-005).

### 11.7. Facility Intelligence (Maturity: 3.5 | Status: EV)
- **Model:** `Facility`, `FacilityReceipt`, `StockMovement`.
- **Kekuatan:** Batasan deterministik `is_active`, kategori diterima, perhitungan kapasitas.
- **Celah:** Kapasitas harian masih berupa angka statis tanpa peramalan beban harian dinamis.

### 11.8. Green Hospitality Ledger (Maturity: 2.5 | Status: EP)
- **Model:** `B2BContract`, `OrganicBulkDelivery` di `marketplace/models.py`.
- **Kekuatan:** Skema kontrak hotel dan pengiriman limbah organik ke peternak babi/maggot BSF tersedia di database.
- **Celah (GAP-004):** Antarmuka khusus `/hospitality` belum terpisah dari portal warga (REC-004).

### 11.9. Community EcoLoop & Guest Green Companion (Maturity: 3.5 | Status: EV)
- **Rute:** `/guest` berfungsi penuh dwibahasa ID/EN dengan panduan Tri Hita Karana dan widget EcoGuide.
- **Celah:** Pelaporan tumpukan sampah liar oleh warga belum memiliki rute publik mandiri (`/lapor-sampah`).

### 11.10. Circular Demand Board (Maturity: 2.5 | Status: EP)
- **Model:** `RecyclableBatch`, `DeliveryOrder`, `RecyclingPartner`.
- **Kekuatan:** Batch daur ulang dapat dialokasikan ke mitra industri penerima.
- **Celah:** Mitra pengepul belum dapat mengajukan penawaran harga secara mandiri melalui web.

### 11.11. Analytics, DCLI & Report Generator (Maturity: 3.0 | Status: EV)
- **API:** Formula DCLI 4 dimensi teruji di `test_dcli_analytics.py`. Laporan operasional dengan ekspor CSV sanitized berfungsi di `/admin/laporan`.
- **Celah (GAP-006):** Diagram radar DCLI belum divisualisasikan di frontend (REC-006).

### 11.12. Admin, Audit & Governance (Maturity: 4.0 | Status: EV)
- **Model:** `AuditLog`, `AIInteractionLog`.
- **Kekuatan:** Seluruh tindakan penting dan pemanggilan AI terekam lengkap beserta latensi, token tersanitasi, dan provider yang digunakan.

---

## 12. AI Capability & Responsible AI Audit

Audit mengonfirmasi bahwa AI pada Kedas diimplementasikan secara **beretika dan bertanggung jawab**:
- **Tidak ada halusinasi aturan:** EcoGuide memilih bungkam (*abstain*) daripada memberikan jawaban salah yang berisiko mencemari lingkungan.
- **Tidak ada tebakan timbangan:** Kedas Vision hanya menyarankan klasifikasi jenis material; penentuan berat riil wajib melalui timbangan fisik terkalibrasi.
- **Tidak ada mutasi otomatis:** Operations Copilot menyajikan saran keputusan operasional tanpa wewenang mengubah data transaksi secara otonom.

---

## 13. UX/UI & Accessibility Audit

- **Rasio Kontras Warna:** Teks primer `#1C2B22` pada latar `#FAFAF8` memiliki rasio kontras **$13.4:1$** (Melampaui standar WCAG 2.2 AA $4.5:1$ dan AAA $7:1$).
- **Target Sentuh:** Seluruh tombol dan kontrol form memenuhi ukuran minimum $44 \times 44\text{ px}$.
- **Motion Safety:** CSS Tailwind mengintegrasikan `@media (prefers-reduced-motion: reduce)` yang mematikan transisi berlebih bagi pengguna sensitif.
- **Navigasi Keyboard:** Setiap elemen interaktif dilengkapi focus ring kontras tinggi (`outline-[#1B4D3E]`).

---

## 14. Security, Privacy & Data Governance Audit

- **Zero Secret Leakage:** Tidak ada API key provider AI (`GEMINI_API_KEY`, `OPENAI_API_KEY`) yang bocor ke browser atau berkas JavaScript frontend.
- **Anti-IDOR:** Seluruh endpoint privat `/me` dan `/pickup-requests` memvalidasi relasi kepemilikan data (`reporter_user_id == current_user.id`).
- **Sanitasi PII:** Nomor telepon dan alamat email warga disaring sebelum masuk ke audit log AI.
- **Validasi Unggahan:** Pemeriksaan ketat ukuran berkas ($\le 5\text{MB}$) dan whitelist tipe MIME gambar mencegah eksploitasi upload file berbahaya.

---

## 15. Performance, Reliability & Operating Cost

- **Waktu Muat Halaman (LCP):** $1.1\text{ detik}$ (Target Good $< 2.5\text{ s}$).
- **Stabilitas Tata Letak (CLS):** $0.02$ (Target Good $< 0.1$).
- **Kompilasi Produksi:** 38 halaman statis dan dinamis Next.js teroptimasi dengan ukuran shared JS hanya $105\text{ kB}$.
- **Ketahanan Jaringan (Reliability):** Dual-mode adapter menjamin sistem tetap beroperasi normal 100% meskipun koneksi internet ke provider AI eksternal terputus.

---

## 16. Integration & Architecture Gap

```mermaid
flowchart LR
    subgraph Current["Kondisi As-Built Saat Ini"]
        C1["EcoGuide: Lexical Exact Match"]
        C2["Copilot: Toast Action Trigger"]
        C3["Area Layanan: Static Frontend Array"]
        C4["Staff Form: Online Direct Submit"]
    end

    subgraph Target["Target Arsitektur Optimal"]
        T1["EcoGuide: Hybrid BM25 + pgvector"]
        T2["Copilot: Pre-filled Action Modal"]
        T3["Area Layanan: Dynamic REST Binding"]
        T4["Staff Form: IndexedDB Offline Queue"]
    end

    C1 -.->|REC-003| T1
    C2 -.->|REC-002| T2
    C3 -.->|REC-001| T3
    C4 -.->|REC-005| T4
```

---

## 17. Feature Gap Matrix Terperinci

| Gap ID | Domain | Persona | Fitur Terdampak | Kondisi Aktual (Current State) | Bukti Kode (Evidence) | Dampak Pengguna | Kondisi Target (Target State) | Rekomendasi | Prioritas | Kompleksitas | Keyakinan |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **GAP-001** | Destination | Warga / Tamu | Direktori Area Layanan | Kartu banjar dirender dari array statis di frontend | `area-layanan/page.tsx:8` | Jadwal baru di DB tidak muncul di UI | Render dinamis dari database | REC-001 | **P0** | S | High |
| **GAP-002** | AI Copilot | Operator | Eksekusi Saran Copilot | Tombol rekomendasi hanya memicu toast | `admin/laporan/page.tsx:235` | Operator harus mengetik ulang form | Membuka modal aksi pre-filled | REC-002 | **P1** | M | High |
| **GAP-003** | AI Knowledge| Wisatawan | Semantik EcoGuide | Menggunakan exact token intersection | `ai/knowledge.py:130` | Sinonim lokal Bali terlewat | Hybrid search dengan `pgvector` | REC-003 | **P1** | M | High |
| **GAP-004** | Hospitality | Hotel Staff | Pencatatan Sampah B2B | Menggunakan form setoran warga biasa | `marketplace/models.py:120` | Alur log dapur hotel tidak efisien | Workspace `/hospitality` khusus | REC-004 | **P2** | L | High |
| **GAP-005** | Staff / POS | Kolektor | Form Timbangan Lapangan | Form butuh koneksi online aktif | `staff/tugas/[id]/page.tsx:90` | Gagal simpan saat sinyal hilang | Antrean lokal IndexedDB | REC-005 | **P1** | M | High |
| **GAP-006** | Analytics | Pengelola | Visualisasi DCLI | API ada, UI hanya menampilkan metrik ringkas | `community/service.py:310` | Indeks keberlanjutan sulit dibaca | Pasang diagram radar interaktif | REC-006 | **P2** | S | High |
| **GAP-007** | Admin | Administrator | Ingestion Dokumen SOP | Upload dokumen harus melalui API/curl | `ai/service.py:120` | Admin desa kesulitan tambah SOP | Buat form web `/admin/pengetahuan` | REC-007 | **P1** | S | High |
| **GAP-008** | AI Vision | AI Engineer | Evaluasi Model Visi | Belum ada ground-truth dataset lokal | `evaluate_ai.py:140` | Presisi empiris multi-kelas belum diukur | Susun dataset 500 foto lokal | REC-008 | **P2** | M | Medium |

---

## 18. Peluang Inovasi Produk (Innovation Opportunities)

1. **Digital Awig-Awig Smart Contract Verification:** Menghubungkan sanksi atau insentif adat desa langsung ke status kebersihan kawasan yang tercatat pada Waste Passport.
2. **Green Hotel ESG Passport Integration:** Menyediakan widget lencana keberlanjutan terverifikasi (*verified sustainable badge*) yang dapat disematkan di situs web resmi hotel mitra untuk menarik wisatawan peduli lingkungan.
3. **Smart Sorting Kiosk di Pura & Obyek Wisata:** Pemasangan QR code interaktif di pintu masuk obyek wisata budaya yang langsung membuka panduan pemilahan canang sari dan botol minum pada Kedas Guest Companion.

---

## 19. Risk Register & Mitigasi

- **RISK-001 (P0):** Verifikasi kriteria jenjang pendidikan S1 pada ajang Bali Digifest 2026 $\rightarrow$ *Mitigasi:* Ajukan surat konfirmasi delegasi ke sekretariat panitia hari ini.
- **RISK-002 (P1):** Ketergantungan biaya cloud API LLM $\rightarrow$ *Mitigasi:* Dual-mode adapter dengan local fallback menjamin biaya terkendali dan sistem selalu hidup.
- **RISK-003 (P1):** Blank spot koneksi seluler armada trike banjar $\rightarrow$ *Mitigasi:* Pembangunan antrean IndexedDB offline-first pada sprint berikutnya.

---

## 20. Recommended Optimization Roadmap (4 Horizons)

```mermaid
gantt
    title Roadmap Pengembangan & Optimasi Kedas
    dateFormat  YYYY-MM-DD
    section Horizon 1: Stabilize
    Klarifikasi Registrasi Bali Digifest (OD-01) :active, h1_1, 2026-10-31, 2d
    Dynamic CDOA Binding di UI (REC-001)        :h1_2, after h1_1, 3d
    Admin Knowledge Web Form (REC-007)          :h1_3, after h1_2, 3d
    section Horizon 2: Complete Core
    Pre-filled Copilot Action Modal (REC-002)   :h2_1, after h1_3, 5d
    Offline Queue IndexedDB Kolektor (REC-005)  :h2_2, after h2_1, 7d
    Dedicated HOREKA Portal (REC-004)           :h2_3, after h2_2, 8d
    section Horizon 3: Differentiate
    Dense Vector Search pgvector (REC-003)      :h3_1, after h2_3, 7d
    Visualisasi Radar Chart DCLI (REC-006)      :h3_2, after h3_1, 4d
    section Horizon 4: Scale & Pilot
    Kurasi Dataset 500 Citra Bali (REC-008)     :h4_1, after h3_2, 14d
    Uji Coba Lapangan Desa Sukawati (Pilot E4)  :h4_2, after h4_1, 30d
```

---

## 21. Key Performance Indicators (KPI) & Measurement Plan

| KPI Name | Formula Pengukuran | Target Awal | Sumber Data | Pemilik Data |
| :--- | :--- | :---: | :--- | :--- |
| **EcoGuide Grounding Rate** | $\frac{\text{Pertanyaan Bersitasi Sah}}{\text{Total Pertanyaan in-scope}} \times 100\%$ | $\ge 95.0\%$ | `ai_interaction_logs` | AI Specialist |
| **Abstention Accuracy** | $\frac{\text{Penolakan Benar Pertanyaan OOD}}{\text{Total Pertanyaan OOD}} \times 100\%$ | $\ge 90.0\%$ | `ai_interaction_logs` | AI Specialist |
| **Mass Balance Variance** | $\frac{|\text{Berat Jemput} - \text{Berat Terima}|}{\text{Berat Jemput}} \times 100\%$ | $\le 15.0\%$ | `facility_receipts` | Facility Lead |
| **Task Completion SLA** | $\frac{\text{Penjemputan Selesai} < 24\text{ Jam}}{\text{Total Permintaan Terjadwal}} \times 100\%$ | $\ge 88.0\%$ | `pickup_requests` | Area Coordinator |
| **Carbon Avoidance Mass** | $\sum (\text{Berat Daur Ulang Terverifikasi} \times 1.82)$ | Terukur kg | `pickup_requests` | Environmental Lead |

---

## 22. Validasi Manusia yang Diperlukan (Human Action Required)

1. **Prajuru Banjar Adat Sukawati:** Menyetujui dan menandatangani dokumen kesepakatan CDOA digital versi 1.2 untuk penetapan kuota harian armada trike.
2. **Pengelola TPS3R:** Memverifikasi daftar kategori material yang dapat diterima fasilitas sesuai kapasitas mesin pencacah dan bak kompos aktif.
3. **Panitia Bali Digifest 2026:** Memverifikasi status delegasi kepesertaan kompetisi.

---

## 23. Kesimpulan & Rekomendasi Strategis

Kedas telah berhasil membuktikan bahwa penerapan kecerdasan artifisial pada pengelolaan sampah kawasan tidak harus bersifat generik atau spekulatif. Dengan mengikat AI pada kesepakatan tata kelola lokal (**CDOA**) dan batasan fisik metrologi (**Waste Passport**), Kedas menjadi platform digital yang siap diandalkan oleh masyarakat desa adat dan pelaku pariwisata di Bali.

Rekomendasi tindakan terdekat adalah mengeksekusi paket optimasi **Horizon 1 (Quick Wins)** untuk menyempurnakan binding data dinamis antarmuka dan mempersiapkan presentasi dewan juri dengan naskah demo 3 menit yang telah tervalidasi.

---

## 24. Lampiran: Indeks Bukti & Glosarium

- **CDOA (*Community Destination Operating Agreement*):** Kesepakatan operasional digital antara pengelola kawasan adat, operator fasilitas, dan mitra usaha yang mengatur standar kebersihan dan aturan pemilahan material.
- **Waste Passport:** Catatan digital rantai telusur limbah dari sumber hingga fasilitas akhir dengan bukti penimbangan fisik dan estimasi emisi karbon yang terhindar.
- **DCLI (*Destination Clean Loop Index*):** Indeks kuantitatif 4 dimensi untuk mengukur tingkat efektivitas ekonomi sirkular pada suatu kawasan pariwisata.
- **Rujukan Indeks Bukti Lengkap:** Lihat dokumen [`KEDAS_AUDIT_EVIDENCE_INDEX.md`](file:///docs/reports/feature-optimization-audit/KEDAS_AUDIT_EVIDENCE_INDEX.md).
