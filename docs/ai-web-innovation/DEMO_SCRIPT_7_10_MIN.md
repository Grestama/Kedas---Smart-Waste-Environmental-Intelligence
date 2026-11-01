# Kedas — 7 to 10-Minute In-Depth Presentation & Technical Walkthrough

**Project:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Target Audience:** Technical Judges, Environmental Authorities & Investors  
**Format:** Live Screen Share + Interactive Architecture Deep Dive  
**Duration:** 7 - 10 Minutes  

---

## Presentation Agenda

1. **Strategic Context & Regulatory Alignment (2 Mins)**
   - Bali waste crisis, Pergub Bali No. 47/2019, Banjar Adat sovereignty.
   - Community Destination Operating Agreements (CDOA).
2. **Product Architecture & Multi-Tier Ecosystem (2 Mins)**
   - Web-first Next.js 15, FastAPI, PostgreSQL 16, 44 tables, 116+ endpoints.
   - Strict data ownership and RBAC.
3. **Core AI Innovations (3 Mins)**
   - *Kedas EcoGuide*: Scoped RAG, zero hallucination, explicit abstention.
   - *Kedas Vision*: Image taxonomy mapping, 5MB validation, human review gate.
   - *Kedas Operations Copilot*: Deterministic capacity & mass-balance anomaly auditing.
4. **Live Operational Workflow Demo (2 Mins)**
   - Public Guest companion $\rightarrow$ Citizen sorting $\rightarrow$ Chain of custody $\rightarrow$ Admin governance.
5. **Security, Governance & Continuous Audit (1 Min)**
   - Zero client secrets, prompt injection defense, PII redaction, 203 automated tests.

---

## Detailed Speaking Script

### 1. Strategic Context & Regulatory Alignment (00:00 - 02:00)
- **Speaker:** "Selamat pagi dewan juri yang terhormat. Berdasarkan Pergub Bali No. 47 Tahun 2019, pengelolaan sampah di Bali diwajibkan berbasis sumber. Namun di lapangan, terdapat *disconnection* besar antara komunitas lokal Banjar Adat, pelaku usaha pariwisata (hotel, restoran), dan wisatawan internasional.
- Masalahnya bukan sekadar ketiadaan truk sampah, melainkan ketiadaan infrastruktur koordinasi digital yang dapat dipercaya.
- **Kedas** hadir untuk menjembatani jurang tersebut melalui model **Community Destination Operating Agreement (CDOA)**. Setiap kawasan wisata memiliki kesepakatan digital yang mengatur kuota harian, jenis material yang diterima, rute armada trike banjar, dan pembagian insentif WastePoints."

---

### 2. Full-Stack Web Architecture (02:00 - 04:00)
- **Speaker:** "Kedas dirancang sebagai aplikasi web-first yang responsif, cepat, dan tidak membebani pengguna dengan kewajiban download aplikasi di app store.
- **Backend Architecture:**
  - FastAPI dengan Python 3.13 dan SQLAlchemy 2.0.
  - 44 relational tables, 10 migration script Alembic, dan 116+ API endpoints.
  - Skema RBAC mencakup 8 peran operasional (Super Admin, Area Admin, Facility Operator, Collector, Citizen, HOREKA Business Partner, Auditor, Guest).
- **Frontend Architecture:**
  - Next.js 15 dengan App Router, React 19, TypeScript, dan Tailwind CSS.
  - Desain sistem adaptif berbasis kearifan Bali (Kedas Forest, Warm Sand, Sacred Gold).
  - WCAG 2.2 AA compliant dengan kontras teks $13.4:1$ dan navigasi keyboard penuh."

---

### 3. Deep Dive into AI Subsystems (04:00 - 07:00)
- **Speaker:** "Kami menolak pendekatan AI yang sekadar memasang chatbot umum di dashboard. Setiap fitur AI di Kedas memiliki batasan teknis yang ketat:
  1. **Kedas EcoGuide (RAG Berbasis Kawasan):**
     - Menggunakan *Scoped Retrieval* yang difilter berdasarkan CDOA kawasan dan regulasi resmi.
     - Menggunakan exact token intersection dengan eliminasi stopword, mencegah false positive substring (misal kata 'ban' tidak akan mencocokkan 'banjar').
     - Menerapkan *Explicit Abstention Protocol*: jika skor kecocokan $< 0.25$, AI tidak berhalusinasi melainkan mengembalikan status `INSUFFICIENT_CONTEXT` lengkap dengan kontak Kelian Banjar setempat.
  2. **Kedas Vision (Identifikasi Visual Material):**
     - Memeriksa batas ukuran 5MB dan MIME image secara ketat.
     - Memetakan citra ke dalam taksonomi aktif Kedas dengan tiga pita keyakinan (`HIGH`, `MEDIUM`, `NEEDS_REVIEW`).
     - *Mandatory Human Review*: hasil prediksi AI wajib dikonfirmasi warga sebelum permohonan setoran masuk ke antrean database.
  3. **Kedas Operations Copilot (Decision Support):**
     - Bersifat *strictly read-only*. Tidak ada perintah LLM yang langsung mengeksekusi SQL mutasi ke database.
     - Menjalankan tiga tool terdaftar: Prioritisasi tugas penjemputan berdasarkan SLA, alokasi kapasitas fasilitas berstatus aktif, dan deteksi anomali neraca massa jika selisih berat penjemputan vs penerimaan industri melebihi $15\%$."

---

### 4. Live Workflow Demonstration (07:00 - 09:00)
- **Walkthrough Steps:**
  1. Tampilkan halaman publik `/area-layanan` memperlihatkan kesepakatan CDOA Sukawati Kaja.
  2. Buka `/guest`, ubah ke Bahasa Inggris, ajukan pertanyaan seputar kelapa dan canang sari.
  3. Masuk ke dashboard warga `/app/setoran/baru`, simulasikan upload foto botol plastik menggunakan Kedas Vision, konfirmasi kategori, dan booking slot kuota banjar.
  4. Buka halaman detail `/app/setoran/:id` untuk memperlihatkan **Kedas Digital Waste Passport**, rantai telusur digital, dan kalkulasi emisi karbon yang terhindar ($1.82\text{ kg CO}_2\text{e/kg}$).
  5. Masuk ke dashboard admin `/admin/laporan`, jalankan evaluasi Kedas Operations Copilot untuk meninjau neraca massa dan anomali operasional secara real-time.

---

### 5. Governance, Security & Q&A (09:00 - 10:00)
- **Speaker:** "Semua sistem ini telah divalidasi dengan:
  - **203 automated unit, integration, dan E2E tests** (86 backend, 102 frontend, 15 mobile) dengan tingkat kelulusan 100%.
  - **AI Governance Benchmark Runner**: 100% defense rate terhadap prompt injection, 100% PII redaction, 100% citation grounding, dan 0% halusinasi.
  - Zero client-side API key leakage.
  - Siap di-deploy secara mandiri di infrastruktur cloud maupun on-premise desa adat.
- Kami siap menerima pertanyaan dari dewan juri."
