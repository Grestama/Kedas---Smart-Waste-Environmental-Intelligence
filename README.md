# Kedas — AI-Powered Community & Green Tourism Intelligence Platform

> **Kedas — Bergerak Bersama untuk Lingkungan yang Lebih Bersih.**  
> *(Catatan Historis: Dikembangkan dari basis kerja WasteLink Bali).*  
> **Platform:** Web-First, Responsive Browser Experience (Desktop, Tablet, Mobile)  
> **Status:** Production-Ready Hackathon Submission (203 Automated Tests Passing — 100% Pass Rate)

---

## 🌿 Ringkasan Produk

**Kedas** (bahasa Bali: *"bersih"*) adalah platform kecerdasan digital terpadu berbasis web yang menghubungkan krama warga desa, prajuru banjar adat, pengelola fasilitas TPS3R/TPST, operator armada pengangkut, dan pelaku industri pariwisata (hotel, restoran, kafe) di Bali.

Platform ini memadukan kearifan lokal *Tri Hita Karana* dan amanat **Peraturan Gubernur Bali No. 47 Tahun 2019** dengan tiga inovasi kecerdasan artifisial (AI) yang memiliki batasan operasional dan etika yang ketat:

1. **Kedas EcoGuide (Scoped RAG Knowledge Assistant)**:
   - Asisten pengetahuan pemilahan material berbasis dokumen CDOA (*Community Destination Operating Agreement*) dan SOP fasilitas aktif.
   - Dilengkapi kartu sitasi resmi dan **Protokol Abstensi Eksplisit** (`INSUFFICIENT_CONTEXT`) jika pertanyaan di luar konteks resmi, mencegah halusinasi jawaban.
2. **Kedas Vision (Visual Material Assistant)**:
   - Identifikasi visual material sampah terpilah langsung dari kamera atau berkas gambar web.
   - Memetakan citra ke dalam taksonomi material resmi dengan rekomendasi panduan persiapan (bilas, keringkan, pipihkan) dan **Mandatory Human Review** sebelum booking slot setoran.
3. **Kedas Operations Copilot (Facility & Destination Intelligence)**:
   - Dukungan keputusan operasional *strictly read-only* untuk koordinator destinasi dan pengelola TPS3R.
   - Evaluasi deterministik antrean tugas berdasarkan SLA, pemetaan kapasitas fasilitas aktif, dan audit anomali neraca massa jika terdapat deviasi $> 15\%$.

---

## 🚀 Panduan Menjalankan Sistem (Quickstart)

### 1. Menjalankan Backend API (FastAPI)
```bash
# Masuk ke direktori backend
cd backend

# Jalankan server API lokal (port 8000)
uvicorn app.main:app --reload --port 8000
```
- Dokumentasi API Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- AI Health & Model Probe: [http://localhost:8000/api/v1/ai/health](http://localhost:8000/api/v1/ai/health)

### 2. Menjalankan Frontend Web Portal (Next.js 15)
```bash
# Masuk ke direktori frontend
cd frontend

# Jalankan server Next.js (port 3000)
npm run dev
```
- Beranda Kedas: [http://localhost:3000](http://localhost:3000)
- Guest Green Companion (Bilingual ID/EN): [http://localhost:3000/guest](http://localhost:3000/guest)
- Area Layanan & Kesepakatan CDOA: [http://localhost:3000/area-layanan](http://localhost:3000/area-layanan)
- Setoran Warga + Kedas Vision: [http://localhost:3000/app/setoran/baru](http://localhost:3000/app/setoran/baru)
- Laporan Operasional + Copilot: [http://localhost:3000/admin/laporan](http://localhost:3000/admin/laporan)

---

## 🧪 Verifikasi Pengujian & Evaluasi AI (203 Tests Passed)

```bash
# 1. Menjalankan 86 pengujian Backend (FastAPI + AI Foundation)
python -m pytest backend/

# 2. Menjalankan 102 pengujian Frontend (Vitest + Komponen AI)
npm --prefix frontend test

# 3. Menjalankan 15 pengujian Mobile Engine (Vitest)
npm --prefix mobile test

# 4. Menjalankan Suite Evaluasi & Tata Kelola AI Otomatis (100% Passed)
cd backend && python -m app.cli.evaluate_ai
```

### Hasil Ringkasan Pengujian:
- **Backend Services:** 86 / 86 passed (100%)
- **Web Frontend:** 102 / 102 passed (100%)
- **Mobile Engine:** 15 / 15 passed (100%)
- **Total Tests:** **203 / 203 automated tests passing**
- **AI Safety & Defense Rate:** 100.0% (Prompt Injection Blocked)
- **PII Redaction Precision:** 100.0% (Phone & Email Sanitized)
- **EcoGuide Grounding Precision:** 100.0% (0% Hallucination)
- **Copilot Deterministic Bounds:** 100.0% (Zero direct state mutations)

---

## 📚 Direktori Dokumentasi Resmi (AI Web Innovation)

| Dokumen | Deskripsi |
| :--- | :--- |
| [**PRD Kedas AI Web Innovation**](file:///docs/ai-web-innovation/PRD_KEDAS_AI_WEB_INNOVATION.md) | Product Requirements Document lengkap dengan skenario pengguna & KPI. |
| [**SRS Kedas AI Web Innovation**](file:///docs/ai-web-innovation/SRS_KEDAS_AI_WEB_INNOVATION.md) | Software Requirements Specification, batasan sistem, dan spesifikasi API. |
| [**HDD Kedas AI Web Innovation**](file:///docs/ai-web-innovation/HDD_KEDAS_AI_WEB_INNOVATION.md) | High-Level Design Document arsitektur multi-tier, skema DB, dan guardrail AI. |
| [**Matriks Keterlacakan (Traceability)**](file:///docs/ai-web-innovation/REQUIREMENT_TRACEABILITY.md) | Pemetaan 23 butir kebutuhan PRD $\rightarrow$ SRS $\rightarrow$ Kode $\rightarrow$ Uji Otomatis. |
| [**Panduan Desain & Token**](file:///docs/ai-web-innovation/DESIGN_SYSTEM_KEDAS.md) | Desain token, kontras rasio WCAG 2.2 AA ($13.4:1$), dan komponen AI. |
| [**Laporan Evaluasi & Tata Kelola AI**](file:///docs/ai-web-innovation/AI_EVALUATION_REPORT.md) | Metrik kuantitatif grounding, abstensi, computer vision, dan keselamatan model. |
| [**Tinjauan Keamanan & Privasi**](file:///docs/ai-web-innovation/SECURITY_REVIEW.md) | Threat model OWASP, pertahanan prompt injection, anti-IDOR, dan sanitasi PII. |
| [**Alur Kerja Komunitas & Pariwisata**](file:///docs/ai-web-innovation/COMMUNITY_GREEN_TOURISM_WORKFLOWS.md) | 5 web journey: CDOA, Guest Microsite, Waste Passport, HOREKA Ledger, Copilot. |
| [**Naskah Demo 3 Menit**](file:///docs/ai-web-innovation/DEMO_SCRIPT_3_MIN.md) | Panduan presentasi cepat dan alur demo untuk dewan juri hackathon. |
| [**Naskah Presentasi 7–10 Menit**](file:///docs/ai-web-innovation/DEMO_SCRIPT_7_10_MIN.md) | Panduan teknis mendalam arsitektur dan alur live demo. |
| [**Batasan Rekayasa & Keputusan Terbuka**](file:///docs/ai-web-innovation/KNOWN_LIMITATIONS.md) | Catatan transparan mengenai batasan read-only, hardware POS, dan eligibility. |
| [**Daftar Periksa Pengumpulan Kompetisi**](file:///docs/ai-web-innovation/COMPETITION_SUBMISSION_CHECKLIST.md) | Checklist pre-flight submission, video walkthrough, dan repositori clean-up. |

---

## 🏛️ Tata Kelola Lingkungan & Konfigurasi API

Sistem menggunakan arsitektur **Dual-Mode AI Provider**:
- **Mode Cloud (Produksi):** Set variabel lingkungan `GEMINI_API_KEY` (Google Gemini 2.0 Flash) atau `OPENAI_API_KEY`.
- **Mode Lokal Resilien (Testing & Offline Demo):** Jika API key tidak diisi, sistem otomatis mengaktifkan modul lokal deterministik tanpa memutus fungsionalitas UI atau menggagalkan pengujian.

Contoh `.env` (Backend):
```env
APP_ENV=local
DEBUG=true
DATABASE_URL=postgresql://wastelink:wastelink_secret_password@localhost:5432/wastelink_bali
SESSION_SECRET_KEY=kedas_production_secret_key_minimum_32_characters_long
GEMINI_API_KEY=your_gemini_api_key_here  # Opsional: untuk cloud AI model
```
