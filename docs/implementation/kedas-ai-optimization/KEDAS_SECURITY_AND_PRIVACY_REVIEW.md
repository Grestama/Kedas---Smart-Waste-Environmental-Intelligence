# KEDAS SECURITY & PRIVACY REVIEW
## Threat Modeling, Data Privacy, and Cryptographic Governance
**Date:** 30 October 2026  
**Auditor:** Application Security Lead & Systems Architect  
**Classification:** Internal Technical Verification  

---

## 1. Zero Client-Side Secret Exposure

- **API Key Isolation:**  
  All external AI provider credentials (`GEMINI_API_KEY`, `OPENAI_API_KEY`) reside exclusively in backend environment variables (`.env`). No `NEXT_PUBLIC_*` secrets are embedded into the client bundle.
- **Client Bundle Inspection:**  
  A regex scan across `frontend/src/` confirms zero occurrences of unencrypted API keys or internal database connection strings.
- **Backend Proxy Pattern:**  
  All client AI requests (`/ai/ecoguide`, `/ai/vision/classify`, `/ai/copilot`, `/ai/feedback`) route through authenticated FastAPI backend endpoints, applying rate limiting, schema validation, and logging prior to provider invocation.

---

## 2. Image Privacy & Metadata Sanitization

- **EXIF & Geolocation Stripping:**  
  In `backend/app/modules/ai/service.py`, `strip_image_metadata()` uses Pillow (`PIL.Image`) to strip all EXIF tags, GPS coordinates, device serial numbers, and camera timestamps prior to computer vision analysis or storage.
- **Payload Verification:**  
  Verified via automated unit tests in `backend/tests/api/test_ai_foundation_and_ecoguide.py` (`test_strip_image_metadata_removes_exif_and_gps`).

---

## 3. Cryptographic Data Provenance & Integrity

- **SHA-256 Provenance Hashing:**  
  Knowledge documents ingested through `/admin/pengetahuan` generate a SHA-256 checksum stored in `knowledge_documents.sha256_hash`.
- **Manifest Integrity:**  
  B2B pickup records and waste batch deliveries generate physical provenance hashes ensuring that waste diversion claims can be mathematically verified against facility scale tickets.

---

## 4. Role-Based Access Control (RBAC) & Tenant Isolation

- **Role Gating:**  
  Endpoints under `/api/v1/admin/*`, `/api/v1/facility/*`, and `/api/v1/staff/*` enforce strict role dependencies (`RequireRole("ADMIN")`, `RequireRole("OPERATOR")`, `RequireRole("COLLECTOR")`).
- **B2B Tenant Isolation:**  
  `GET /b2b/organizations/{id}/report` and `GET /b2b/organizations/{id}/locations` verify that the requesting user belongs to the designated organization, preventing cross-tenant leakage between competing hotel resorts.
- **IDOR Protection:**  
  Address manipulation and pickup task reassignment are bound strictly to ownership verification in `backend/app/modules/collection/service.py` (verified in `tests/api/test_idor_addresses_and_pickups.py`).

---

## 5. Audit Logging & State Diff Traceability

- **Action Proposal Auditing:**  
  Every decision executed through `POST /api/v1/ai/copilot/execute` generates an `AuditLog` entry recording:
  - `actor_user_id`: ID of the human operator who confirmed the proposal.
  - `action`: Proposal type (e.g. `ADJUST_SERVICE_SLOT`).
  - `entity_type`: Target entity (e.g. `facility`).
  - `details_json`: Exact before and after state diff, timestamp, and confirmation rationale.
