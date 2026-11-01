# KEDAS — KNOWN FRONTEND DEPENDENCIES & API CONTRACTS

**Authority:** `docs/design/design_web.md`  
**Generated:** Stage 1 Baseline (30 October 2026)  

---

## 1. Verified Working API Endpoints

The following backend endpoints are fully implemented, verified, and backed by SQLite migrations 0001–0010:
- `GET /api/v1/health/live`: Health status
- `POST /api/v1/auth/login`: Argon2id authentication
- `POST /api/v1/auth/register`: Resident/user registration
- `GET /api/v1/me`: Profile & active roles
- `GET /api/v1/waste-categories`: 4 baseline waste categories & guidelines
- `GET /api/v1/service-areas`: Pilot service areas (Ubud, Sukawati, Sanur)
- `GET /api/v1/pickup-requests`: Collection requests & state machine
- `POST /api/v1/ai/ecoguide`: RAG question answering with citations
- `POST /api/v1/ai/vision/classify`: Waste classification with confidence & disclaimer
- `GET /api/v1/ai/copilot/recommendations`: Operations Copilot recommendations
- `POST /api/v1/ai/copilot/proposals/{id}/execute`: Human-in-the-loop action execution
- `GET /api/v1/ai/knowledge`: Knowledge base document listing & ingestion

---

## 2. Documented Frontend Dependencies & Fallbacks

1. **Geospatial Map Provider:**
   - Real interactive Leaflet/Mapbox tiles are not bundled to avoid external API token dependencies.
   - *Frontend Behavior:* Structured service area cards and searchable administrative tags are used instead of fake pin maps.
2. **Real B2B Certified ESG Audit Export:**
   - Formal ISO/government audit certificate generation requires external certification authority.
   - *Frontend Behavior:* Clearly labeled as internal "Green Hospitality Ledger" (not official compliance certification).
