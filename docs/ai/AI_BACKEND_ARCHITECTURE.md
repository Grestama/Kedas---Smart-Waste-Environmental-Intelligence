# Kedas AI — Backend & System Architecture

```mermaid
flowchart TB
  subgraph CLIENT[Web & Mobile Clients]
    PUB[Public / Guest Interface]
    WARGA[Warga Portal]
    STAFF[Petugas POS Lapangan]
    ADMIN[Konsol Admin Supervisi]
    HOSP[Green Hospitality]
  end

  subgraph API_GW[FastAPI Modular Monolith API Gateway]
    AUTH[Session Auth & Argon2id RBAC]
    ROUTER[Capability Router /api/v1/ai/*]
    SAFETY[Safety & Prompt Injection Shield]
  end

  subgraph AI_LAYER[Environmental Intelligence Layer]
    ADAPTER[AIProviderAdapter: Gemini / OpenAI / Resilient Offline Fallback]
    RAG[Scoped Knowledge Retrieval & Grounding]
    VISION[Material Classification & Heuristic Engine]
    COPILOT[Operations Copilot & ActionProposal Lifecycle]
    DCLI_CALC[Deterministic DCLI & Carbon Calculator]
  end

  subgraph DOMAIN_SERVICES[Transactional Domain Services]
    COLL[Collection & Scheduling Service]
    INSP[Inspection & QC Service]
    SCALE[Digital Scale & Tare-Gross Service]
    POINTS[Double-Entry WastePoints Ledger]
    FAC[TPS3R Facility & Stock Service]
    MARKET[Material Batching & Circular B2B]
    COMM[CDOA Banjar & Special Waste Service]
  end

  subgraph PERSISTENCE[Persistence & Data Layer]
    PG[(PostgreSQL / SQLite Database - 48 Tables)]
    KB_STORE[Knowledge Documents & Chunks Table]
    LOG_STORE[AI Interaction & Audit Logs]
    OBJ_STORE[Private Storage uploads/evidence/]
  end

  CLIENT --> API_GW
  API_GW --> AUTH
  AUTH --> ROUTER
  ROUTER --> SAFETY
  SAFETY --> AI_LAYER
  AI_LAYER --> ADAPTER
  AI_LAYER --> DOMAIN_SERVICES
  DOMAIN_SERVICES --> PERSISTENCE
  AI_LAYER --> KB_STORE
  AI_LAYER --> LOG_STORE
```

---

## 1. Prinsip Utama Arsitektur

1. **FastAPI Modular Monolith:** Semua layanan beroperasi dalam satu proses terpadu tanpa latensi RPC microservice yang berlebihan.
2. **PostgreSQL as Source of Truth:** Semua data transaksi material, saldo poin, dan verifikasi fisik tersimpan di database relasional berintegritas tinggi. Model AI tidak pernah menjadi pemegang kebenaran data transaksi.
3. **Dual-Mode Adapter:** Sistem siap beroperasi penuh secara online menggunakan Google Gemini 2.0 Flash atau OpenAI, dan otomatis beralih ke *Resilient Grounded Local Fallback* jika terjadi kendala koneksi eksternal.
4. **Deterministic Gatekeepers:** Perhitungan formula matematis (DCLI, reduksi emisi karbon IPCC, saldo poin) menggunakan kode deterministik Python tanpa melibatkan generasi teks LLM.
