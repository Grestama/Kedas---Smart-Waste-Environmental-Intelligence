# 01 — AS-BUILT VS TARGET GAP MATRIX
## Kedas: AI-Powered Community & Green Tourism Intelligence Platform
**Date:** 30 October 2026  
**Auditor:** Coordinated Engineering Team  

---

## 1. Feature Classification Taxonomy

Each capability is rigorously tagged with its implementation reality:
- **`EXISTING_VERIFIED`**: Present in codebase, used in active flows, verified by automated tests.
- **`EXISTING_PARTIAL`**: Present in backend models/APIs but frontend UI/UX incomplete or isolated.
- **`NEW_P0`**: Mandatory AI web innovation capability required for core competition demonstration.
- **`NEW_P1`**: Supporting capability that enhances the AI web workflow.
- **`FUTURE_P2`**: Post-competition / full production pilot capability.
- **`OUT_OF_SCOPE`**: Excluded from this competition scope (native mobile apps, hardware IoT, payment gateway).

---

## 2. Comprehensive Matrix

| Category | Capability / Feature | As-Built Status | Code References | Target Action |
|---|---|---|---|---|
| **Identity & Access** | Multi-Role Authentication (8 roles) | `EXISTING_VERIFIED` | `backend/app/modules/account/` | Preserve unchanged |
| **Identity & Access** | Role Switching & Application Approval | `EXISTING_VERIFIED` | `test_rbac_and_roles.py` | Preserve unchanged |
| **Destination Ops** | CDOA Model, Lifecycle & Approval | `EXISTING_VERIFIED` | `backend/app/modules/community/` | Expose to EcoGuide context |
| **Destination Ops** | Public Service Directory & SLA | `EXISTING_VERIFIED` | `/service-directory/{id}` | Connect with AI prompt context |
| **Destination Ops** | Deterministic Service Eligibility Engine | `EXISTING_VERIFIED` | `collection/service.py:check_service_eligibility` | Expose to Operations Copilot tool |
| **Traceability** | Kedas Waste Passport Public QR | `EXISTING_VERIFIED` | `/pickup-requests/passport/public/{code}` | Integrate with web guest & resident |
| **Traceability** | State Machine & Anti-IDOR Detail | `EXISTING_VERIFIED` | `test_waste_passport_traceability.py` | Preserve unchanged |
| **Hospitality** | Green Hospitality Ledger (HOREKA B2B) | `EXISTING_VERIFIED` | `marketplace/service.py:get_b2b_operational_report` | Feed metrics to AI narrative generator |
| **Hospitality** | Multi-tenant HOREKA isolation | `EXISTING_VERIFIED` | `test_phase5*` | Guard against cross-tenant LLM leaks |
| **Facility** | Mass Balance Sorting ($In = Out + Res$) | `EXISTING_VERIFIED` | `facility/service.py:record_sorting_process` | Expose anomaly checks to Copilot |
| **Facility** | Atomic Material Stock Reservation | `EXISTING_VERIFIED` | `test_phase4*` | Read-only access for Copilot |
| **Community** | EcoLoop Banjar Complaints & Events | `EXISTING_VERIFIED` | `community/models.py` | Link with EcoGuide escalation |
| **Guest Microsite** | Guest Green Companion (`/guest`) | `EXISTING_VERIFIED` | `frontend/src/app/(public)/guest/` | Embed EcoGuide assistant widget |
| **Analytics** | Destination Clean Loop Index (DCLI) | `EXISTING_VERIFIED` | `/banjar/{id}/dcli` | Guardrail: refuse scores on low coverage |
| **AI Foundation** | Server-Side AI Provider Adapter | `NEW_P0` | Need implementation in backend | Build multi-provider adapter (Gemini/Mock) |
| **AI Foundation** | Knowledge Admin & Ingestion Pipeline | `NEW_P0` | Need implementation in backend | Ingest CDOA, SOP, guidelines with chunks |
| **AI Foundation** | Prompt Injection Defense & Sanitizer | `NEW_P0` | Need implementation in backend | Secure system prompts and untrusted inputs |
| **AI Capability** | Kedas EcoGuide (RAG Local Assistant) | `NEW_P0` | Need implementation | Scoped retrieval, source citations, abstention |
| **AI Capability** | Kedas Vision (Visual Material Assistant) | `NEW_P0` | Need implementation | Image validation, taxonomy candidate mapping |
| **AI Capability** | Kedas Operations Copilot | `NEW_P0` | Need implementation | Read-only whitelisted tools, eligibility ranking |
| **AI Capability** | Grounded Metric Report Narratives | `NEW_P1` | Need implementation | B2B/Banjar narrative grounded in snapshots |
| **UI/UX Refactor** | Unified Bali Green-Sand Design System | `NEW_P0` | `globals.css` + token components | Polished components, a11y, responsive |
| **UI/UX Refactor** | AI Assistant Panel & Citations UI | `NEW_P0` | Need implementation in frontend | Clean drawer/modal with trust indicators |
| **Mobile Core** | React Native Expo Simulator | `EXISTING_VERIFIED` | `mobile/` | Freeze native development; keep tests green |
| **External Integration** | Hardware Scale IoT & Live BLE | `OUT_OF_SCOPE` | - | Excluded from competition scope |
| **External Integration** | Real-time GPS Telematics Streaming | `OUT_OF_SCOPE` | - | Excluded from competition scope |
| **External Integration** | Bank Payment Gateway / QRIS Payout | `OUT_OF_SCOPE` | - | Excluded from competition scope |

---

## 3. Compatibility Risks & Mitigation

1. **Risk:** AI Provider Key Exposure in Client.
   - *Mitigation:* All provider integrations exist exclusively in FastAPI backend. Client receives only structured, sanitized JSON responses.
2. **Risk:** LLM Hallucinating Waste Acceptance or Regulations.
   - *Mitigation:* EcoGuide requires server-side scoped chunk retrieval with strict claim-to-source citation contracts. If context is missing, it must return `INSUFFICIENT_CONTEXT` (abstention).
3. **Risk:** Unrestricted Tool Execution or SQL Injection via LLM.
   - *Mitigation:* Operations Copilot uses only typed, hardcoded read-only Python service calls. Zero free-form SQL execution. All state changes require human confirmation.
4. **Risk:** Cross-Tenant Knowledge Retrieval in B2B/Banjar.
   - *Mitigation:* Ingestion and retrieval enforce `destination_id` and `organization_id` scoping filters at database query level before sending context to LLM.
