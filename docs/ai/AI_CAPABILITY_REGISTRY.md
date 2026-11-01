# Kedas AI — Capability Registry

**Versi:** 1.0 (Verified Implementation)  
**Tanggal:** 30 Oktober 2026  
**Standar Arsitektur:** Dual-Mode Provider Adapter + Scoped Knowledge RAG + Human-in-the-Loop Governance  

---

## 1. Registry Tabel Kapabilitas AI

| ID | Nama Kapabilitas | Kelas Arsitektur | Tier Rilis | Model / Provider Default | Endpoint / Router | Status Verifikasi |
|---|---|---|---|---|---|---|
| **AI-01** | **EcoGuide Grounded Q&A** | `RETRIEVAL_AUGMENTED` | `OPERATIONAL_PILOT` | Gemini 2.0 Flash / Local Resilient Fallback | `POST /api/v1/ai/ecoguide` | **VERIFIED** |
| **AI-02** | **Kedas Vision Material** | `PERCEPTION` | `ASSISTED_REVIEW` | Gemini 2.0 Flash Vision / Local Heuristic | `POST /api/v1/ai/vision/analyze` | **VERIFIED** |
| **AI-03** | **Operations Copilot** | `AGENTIC_WORKFLOW` | `OPERATIONAL_PILOT` | Gemini 2.0 Flash / Local Fallback | `POST /api/v1/ai/copilot`, `POST /api/v1/ai/copilot/execute` | **VERIFIED** |
| **AI-04** | **Shared Destination Context** | `CONTEXT_SERVICE` | `OPERATIONAL_PILOT` | PostgreSQL / Internal Service | `app.modules.community.service` | **VERIFIED** |
| **AI-05** | **Knowledge Ingestion & Lifecycle** | `DOCUMENT_PIPELINE` | `OPERATIONAL_PILOT` | SHA-256 Hasher / Lexical Chunk Engine | `POST/GET/PATCH/DELETE /api/v1/ai/knowledge` | **VERIFIED** |
| **AI-06** | **Facility Eligibility Engine** | `DETERMINISTIC_ANALYTICS`| `OPERATIONAL_PILOT` | Deterministic Rule Matrix | `app.modules.facility.service` | **VERIFIED** |
| **AI-07** | **Capacity Forecasting** | `PREDICTIVE_ML` | `EXPERIMENTAL` | Naive Rolling Window Baseline | `app.modules.facility.service` | **EXPERIMENTAL** |
| **AI-08** | **Waste Contamination Assistant**| `PERCEPTION` + Rules | `ASSISTED_REVIEW` | QC Matrix / Inspection Service | `POST /api/v1/inspections` | **VERIFIED** |
| **AI-09** | **Waste Composition Analytics** | `DETERMINISTIC_ANALYTICS`| `OPERATIONAL_PILOT` | Aggregated Weigh-in SQL Engine | `app.modules.reporting.service` | **VERIFIED** |
| **AI-10** | **Hospitality Circular Report** | `GENERATIVE_ASSISTANT` | `OPERATIONAL_PILOT` | Deterministic Ledger + Narrative LLM | `GET /api/v1/b2b/organizations/{id}/report` | **VERIFIED** |
| **AI-11** | **Material Partner Matching** | `OPTIMIZATION` | `OPERATIONAL_PILOT` | Hard Filters + Explainable Ranking | `app.modules.marketplace.service` | **VERIFIED** |
| **AI-12** | **Waste Volume Forecasting** | `PREDICTIVE_ML` | `EXPERIMENTAL` | Seasonal Moving Average | `app.modules.reporting.service` | **EXPERIMENTAL** |
| **AI-13** | **DCLI Circularity Index** | `DETERMINISTIC_ANALYTICS`| `OPERATIONAL_PILOT` | Formula DCLI v1.0 Deterministic | `app.modules.community.service` | **VERIFIED** |
| **AI-14** | **Evidence-Based Report Gen** | `GENERATIVE_ASSISTANT` | `OPERATIONAL_PILOT` | LLM over Immutable Metric Snapshot | `app.modules.reporting.service` | **VERIFIED** |
| **AI-15** | **Route & Trike Optimization** | `OPTIMIZATION` | `PROPOSED_FUTURE` | N/A (Requires Fleet GPS Sensors) | N/A | **PROPOSED** |
| **AI-16** | **Facility Predictive Maint.** | `PREDICTIVE_ML` | `PROPOSED_FUTURE` | N/A (Requires IoT Telemetry) | N/A | **PROPOSED** |
| **AI-17** | **Community Engagement Insight**| `DETERMINISTIC_ANALYTICS`| `OPERATIONAL_PILOT` | Aggregated Banjar Participation | `app.modules.community.service` | **VERIFIED** |
| **AI-18** | **Multilingual Language Guard** | `GENERATIVE_ASSISTANT` | `OPERATIONAL_PILOT` | Heuristic Lexical + LLM Detector | `app.modules.ai.service` | **VERIFIED** |
| **AI-19** | **Carbon Avoidance Calculator** | `DETERMINISTIC_ANALYTICS`| `OPERATIONAL_PILOT` | IPCC Waste Factor (0.32 kg CO2e/kg)| `app.modules.marketplace.service` | **VERIFIED** |
| **AI-20** | **Environmental Risk Signals** | `DETECTION` + Rules | `OPERATIONAL_PILOT` | Hazardous B3 Manifest Validation | `app.modules.community.service` | **VERIFIED** |

---

## 2. Penjelasan Definisi Tier Rilis (Release Tiers)

1. **`OPERATIONAL_PILOT`:** Lulus 100% tes unit, integrasi, dan benchmark grounding. Memiliki guard otorisasi, pencatatan log interaksi, dan fallback lokal yang aman.
2. **`ASSISTED_REVIEW`:** Output bersifat probabilistik. Mewajibkan konfirmasi manusia (warga atau petugas lapangan) sebelum data masuk ke rantai transaksi resmi.
3. **`EXPERIMENTAL`:** Berjalan di lingkungan pengujian terbatas. Memerlukan agregasi data historis lebih lanjut sebelum dijadikan keputusan otomatis.
4. **`PROPOSED_FUTURE`:** Terencana dalam roadmap arsitektur, tidak aktif pada rilis kompetisi awal karena ketergantungan sensor perangkat keras eksternal.
