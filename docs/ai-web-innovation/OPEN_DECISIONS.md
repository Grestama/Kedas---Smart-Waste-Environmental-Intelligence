# KEDAS — OPEN DECISIONS & ASSUMPTION LOG
## AI-Powered Community & Green Tourism Intelligence Platform
**Date:** 30 October 2026  
**Status:** Documented for Human Review & External Alignment  

---

## 1. Competition Eligibility & Official Rubric (Top Priority External Action)

### Decision Item OD-01: Bali Digifest AI Web Innovation Challenge 2026 Participant Eligibility
- **Context:** Third-party competition listings state eligibility for **SMA/SMK, D1, and D2** students. No explicit mention was found for undergraduate (S1) students in that specific listing.
- **Current Assumption:** We proceed with building a production-grade, competition-winning Web AI product that satisfies the technical requirements of the AI Web Innovation Challenge.
- **Action Required by Human Lead:**
  1. Contact the official organizing committee (Bali Digifest / Diskominfos Bali) to verify whether S1 / umum categories exist or if submission should be credited under an eligible participant profile.
  2. Request official competition guidebook for exact evaluation rubric, submission format, and presentation time window.

---

## 2. Technical & Architecture Decisions

### Decision Item OD-02: AI Provider Adapter & Offline Fallback Strategy
- **Decision:** Implement a dual-mode server-side provider adapter:
  1. **Primary Mode:** Standard Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`) via `GEMINI_API_KEY` or standard OpenAI API via `OPENAI_API_KEY`.
  2. **Deterministic Resilient Fallback Mode:** An internal rule-based semantic matcher and grounded prompt simulator that runs 100% offline with zero external network dependencies.
- **Rationale:** Ensures that during live hackathon judging, network dropouts or API rate-limit errors never break the demonstration. The system gracefully signals fallback state while providing accurate, grounded responses from local knowledge.

### Decision Item OD-03: Image Retention & Privacy Policy for Kedas Vision
- **Decision:**
  - Raw uploaded images for material analysis are validated in memory and stored temporarily in private, isolated storage (`/uploads/temp/`).
  - EXIF metadata (GPS coordinates, camera serials, timestamps) is stripped upon upload.
  - Images are retained only for the duration of the classification and review session unless the user explicitly opts in to donate the image for dataset training.
  - PII detected in images (e.g. human faces, identification cards) flags the image as `UNSUITABLE_FOR_TAXONOMY` and prompts immediate deletion.

### Decision Item OD-04: Knowledge Base Corpus for Pilot Destinations
- **Decision:** The initial RAG knowledge base is seeded with 3 curated, non-confidential public operational documents:
  1. *Peraturan Gubernur Bali No. 47 Tahun 2019 tentang Pengelolaan Sampah Berbasis Sumber*.
  2. *Standard Operating Procedure (SOP) Pemilahan 3 Aliran TPS3R Desa Adat Ubud / Tebesaya*.
  3. *Community Destination Operating Agreement (CDOA) Model Banjar Sanur Kauh 2026*.
- **Rationale:** Prevents copyright infringement while providing authentic, localized regulatory grounding for EcoGuide.

### Decision Item OD-05: Vector Store Architecture in PostgreSQL
- **Decision:** For development and lightweight production without external dependencies, knowledge chunks are indexed using PostgreSQL full-text search with cosine-similarity semantic scoring in Python, with seamless pluggability for `pgvector` when the extension is enabled.
- **Rationale:** Keeps migrations safe and portable across SQLite test environments and standard PostgreSQL instances without crashing on missing native C-extensions.
