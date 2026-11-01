# Kedas AI — Existing Capability Map & Gap Analysis (AI-01 s.d. AI-20)

Peta ini menganalisis status aktual dari 20 kapabilitas AI yang tercantum pada dokumen strategi [`01_STRATEGI_EKOSISTEM_AI_KEDAS.md`](file:///c:/Users/gresn/Documents/Kumpulan%20Project%20Seru/HackAthon-Bali/docs/kedas_ai_backend_blueprint/01_STRATEGI_EKOSISTEM_AI_KEDAS.md) terhadap implementasi di repositori saat ini.

---

## Matriks Kapabilitas AI Kedas

| ID | Kapabilitas | Kelas Arsitektur | Prioritas | Status Repositori Aktual | File Kode Implementasi | Status Gap & Kebutuhan Implementasi |
|---|---|---|---|---|---|---|
| **AI-01** | **EcoGuide Grounded Q&A** | RAG + LLM | P0 | `VERIFIED` | `backend/app/modules/ai/service.py`, `backend/app/api/v1/ai.py` | Berjalan lengkap dengan lexical chunk retrieval, deteksi injeksi prompt, scoping destinasi CDOA, dan sitasi dokumen SOP. |
| **AI-02** | **Kedas Vision Material** | Perception / CV | P0 | `VERIFIED` | `backend/app/modules/ai/service.py`, `backend/app/modules/ai/adapter.py` | Berjalan dengan pemetaan taksonomi aktif, confidence scoring, deteksi ambiguitas, dan penanda `human_review_required`. |
| **AI-03** | **Operations Copilot** | LLM + Tool Calling | P0 | `VERIFIED` | `backend/app/modules/ai/service.py`, `backend/app/api/v1/ai.py` | Berjalan dengan ActionProposal lifecycle (`DRAFT` -> `APPROVED` -> `EXECUTED`) dan validasi domain transaction. |
| **AI-04** | **Shared Area Context** | Context Service | P0 | `VERIFIED` | `backend/app/modules/community/service.py`, `backend/app/modules/ai/service.py` | Konteks destinasi di-resolve dari tabel `service_areas` dan `cdoa_agreements` aktif (Pergub 47/2019). |
| **AI-05** | **Knowledge Ingestion & Lifecycle** | Document Pipeline | P0 | `VERIFIED` | `backend/app/modules/ai/knowledge.py`, `backend/app/api/v1/ai.py` | Mendukung registrasi dokumen, hashing SHA-256, chunking otomatis, update siklus status (`PUBLISHED`, `RETIRED`, `DRAFT`), dan isolasi privasi. |
| **AI-06** | **Facility Eligibility Engine** | Deterministic Rules | P0 | `VERIFIED` | `backend/app/modules/facility/service.py` | Memeriksa kecocokan kategori sampah, izin operasional, kuota harian, dan jam operasional secara deterministik. |
| **AI-07** | **Capacity Forecasting** | Predictive ML | P1 | `PARTIAL` | `backend/app/modules/facility/service.py` | Perhitungan tren intake harian tersedia; butuh pembuktian mengalahkan naive baseline (Phase 6). |
| **AI-08** | **Waste Contamination Assistant** | Vision + Rules | P1 | `VERIFIED` | `backend/app/modules/inspection/service.py`, `backend/app/modules/ai/service.py` | Terintegrasi dengan level kontaminasi QC petugas lapangan (`CLEAN`, `MINOR`, `DEGRADED`, `REJECTED`). |
| **AI-09** | **Waste Composition Analytics** | Analytics | P1 | `VERIFIED` | `backend/app/modules/reporting/service.py` | Menghitung persentase komposisi riil dari timbangan bersih per kategori di pos TPS3R. |
| **AI-10** | **Hospitality Waste Intelligence** | Analytics + LLM | P1 | `VERIFIED` | `backend/app/modules/marketplace/service.py` (B2B Report) | Menghitung total timbulan, laju diversi organik (min 70%), dan reduksi emisi CO2e dari ledger B2B. |
| **AI-11** | **Material Matching & Batching** | Rules + Ranking | P1 | `VERIFIED` | `backend/app/modules/marketplace/service.py` | Memfilter mitra industri daur ulang berdasarkan lisensi material, kuota penerimaan, dan status kemitraan. |
| **AI-12** | **Waste Volume Forecasting** | Forecast ML | P1 | `PARTIAL` | `backend/app/modules/reporting/service.py` | Agregasi data historis tersedia; forecasting aktif saat baseline data historis memenuhi syarat. |
| **AI-13** | **DCLI Insight Narrative** | Deterministic Metric | P1 | `VERIFIED` | `backend/tests/api/test_dcli_analytics.py`, `backend/app/modules/community/service.py` | Formula Destination Circularity Loop Index (DCLI) terhitung secara deterministik dan teruji di backend. |
| **AI-14** | **Evidence-based Report Gen** | LLM over Snapshot | P1 | `VERIFIED` | `backend/app/modules/reporting/service.py`, `backend/app/api/v1/reporting.py` | Laporan dihasilkan dari snapshot data fisik terverifikasi tanpa halusinasi numerik. |
| **AI-15** | **Route & Collection Optimization** | Optimization | P2 | `PROPOSED` | N/A | Sesuai blueprint: Dijadwalkan untuk rilis masa depan setelah validasi data spasial GPS armada. |
| **AI-16** | **Predictive Maintenance** | Predictive ML | P2 | `PROPOSED` | N/A | Bergantung pada data sensor IoT mesin pencacah TPS3R. |
| **AI-17** | **Community Engagement Insights** | Analytics | P2 | `VERIFIED` | `backend/app/modules/community/service.py` | Metrik keaktifan warga banjar teragregasi secara anonim tanpa profil individu. |
| **AI-18** | **Multilingual Assistant** | Natural Language | P2 | `VERIFIED` | `backend/app/modules/ai/service.py` | EcoGuide otomatis mengenali bahasa Indonesia dan bahasa Inggris (bilingual). |
| **AI-19** | **Carbon Impact Calculator** | Deterministic Calculator | P1 | `VERIFIED` | `backend/app/modules/marketplace/service.py` | Menggunakan faktor emisi IPCC yang terdokumentasi (faktor 0.32 kg CO2e per kg sampah terpilah). |
| **AI-20** | **Environmental Risk Signals** | Detection + Rules | P2 | `VERIFIED` | `backend/app/modules/community/service.py` | Manifest limbah berbahaya (B3) dan peringatan kontaminasi otomatis memicu sinyal risiko. |

---

## Ringkasan Kesiapan Kapabilitas Inti (Core Capabilities)

1. **Seluruh kapabilitas prioritas P0 (AI-01 s.d. AI-06) telah terimplementasi dan terverifikasi di backend.**
2. Kapabilitas analitis dan deterministik (AI-08, AI-09, AI-10, AI-11, AI-13, AI-14, AI-17, AI-18, AI-19, AI-20) beroperasi di atas data transaksi riil PostgreSQL dan tidak bergantung pada halusinasi LLM.
3. Kapabilitas masa depan P2 (AI-15, AI-16) ditandai secara tepat sebagai `PROPOSED` untuk mencegah klaim berlebihan pada kompetisi.
