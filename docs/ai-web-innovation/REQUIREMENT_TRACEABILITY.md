# KEDAS — REQUIREMENT TRACEABILITY MATRIX (RTM)
## AI-Powered Community & Green Tourism Web Platform
**Date:** 30 October 2026  
**Status:** Reconciled & Verified  

---

## 1. Traceability Table

| PRD Capability | SRS ID | HDD Component | Code Area (Backend / Frontend) | Automated Test Suite | Verification Status |
|---|---|---|---|---|---|
| **Identity & Access** | SRS-IAM-001 | IAM Service | `backend/app/modules/account/service.py` | `test_auth_phase2.py` | `EXISTING_VERIFIED` |
| **RBAC & Active Role Switch** | SRS-ACL-002 | IAM & RBAC Engine | `backend/app/core/dependencies.py` | `test_rbac_and_roles.py` | `EXISTING_VERIFIED` |
| **CDOA & Territorial Rules** | SRS-DEST-001 | Destination Domain | `backend/app/modules/community/models.py` | `test_cdoa_and_membership.py` | `EXISTING_VERIFIED` |
| **Public Service Directory** | SRS-DEST-002 | Destination Domain | `frontend/src/app/(public)/area-layanan/` | `test_cdoa_and_membership.py` | `EXISTING_VERIFIED` |
| **Deterministic Eligibility Engine** | SRS-OPS-001 | Eligibility Service | `backend/app/modules/collection/service.py` | `test_facility_intelligence_and_eligibility.py` | `EXISTING_VERIFIED` |
| **Waste Passport QR Public** | SRS-TRACE-001 | Traceability Service | `backend/app/modules/collection/service.py` | `test_waste_passport_traceability.py` | `EXISTING_VERIFIED` |
| **Waste Passport Zero PII Leak** | SRS-SEC-004 | Security Filter | `backend/app/modules/collection/service.py` | `test_waste_passport_traceability.py` | `EXISTING_VERIFIED` |
| **Hospitality B2B Ledger** | SRS-HOSP-001 | B2B Marketplace | `backend/app/modules/marketplace/service.py` | `test_phase5_marketplace_organic_and_b2b.py` | `EXISTING_VERIFIED` |
| **Facility Mass Balance ($In=Out+Res$)**| SRS-FAC-001 | Facility Service | `backend/app/modules/facility/service.py` | `test_phase4_facility_and_waste_bank.py` | `EXISTING_VERIFIED` |
| **Guest Green Companion (`/guest`)** | SRS-PUB-001 | Public Web Shell | `frontend/src/app/(public)/guest/` | `frontend/src/test/integration.test.ts` | `EXISTING_VERIFIED` |
| **Destination Clean Loop Index (DCLI)**| SRS-ANL-001 | Analytics Engine | `backend/app/modules/community/service.py` | `test_dcli_analytics.py` | `EXISTING_VERIFIED` |
| **AI Server-Side Provider Adapter** | SRS-AI-001 | AI Orchestrator | `backend/app/modules/ai/adapter.py` | `test_ai_provider_adapter.py` | `NEW_P0` |
| **Knowledge Base Ingestion & Chunking**| SRS-KB-001 | Knowledge Domain | `backend/app/modules/ai/knowledge.py` | `test_ai_knowledge_ingestion.py` | `NEW_P0` |
| **Prompt Injection Defense** | SRS-SEC-001 | AI Safety Filter | `backend/app/modules/ai/safety.py` | `test_ai_prompt_injection.py` | `NEW_P0` |
| **Kedas EcoGuide (Scoped RAG + Citations)**| SRS-RAG-001 | EcoGuide Service | `backend/app/modules/ai/ecoguide.py` | `test_ai_ecoguide_rag.py` | `NEW_P0` |
| **Kedas EcoGuide Abstention Engine**| SRS-RAG-002 | EcoGuide Service | `backend/app/modules/ai/ecoguide.py` | `test_ai_ecoguide_rag.py` | `NEW_P0` |
| **Kedas Vision (Visual Material Classifier)**| SRS-VIS-001 | Vision Service | `backend/app/modules/ai/vision.py` | `test_ai_vision_material.py` | `NEW_P0` |
| **Kedas Vision Confidence Bands & Review**| SRS-VIS-002 | Vision Service | `backend/app/modules/ai/vision.py` | `test_ai_vision_material.py` | `NEW_P0` |
| **Kedas Operations Copilot (Read-Only)**| SRS-COP-001 | Copilot Service | `backend/app/modules/ai/copilot.py` | `test_ai_operations_copilot.py` | `NEW_P0` |
| **Copilot Hard-Constrained Eligibility**| SRS-COP-002 | Copilot Service | `backend/app/modules/ai/copilot.py` | `test_ai_operations_copilot.py` | `NEW_P0` |
| **Grounded AI Report Narrative Generator**| SRS-REP-001 | Narrative Engine | `backend/app/modules/ai/reports.py` | `test_ai_report_narratives.py` | `NEW_P1` |
| **Web Design System (Bali Green-Sand)**| SRS-UI-001 | UI Token & Atoms | `frontend/src/app/globals.css`, `components/ui/` | `src/test/design-system.test.tsx` | `NEW_P0` |
| **AI Assistant Web Drawer & Citations UI**| SRS-UI-002 | UI Components | `frontend/src/components/ai/` | `src/test/ai-components.test.tsx` | `NEW_P0` |

---

## 2. P0 Acceptance Criteria Summary

1. **AC-ECO-01:** EcoGuide must reject queries regarding local destination rules when no published CDOA or knowledge document exists, returning `INSUFFICIENT_CONTEXT` (abstention).
2. **AC-ECO-02:** Every positive claim regarding collection schedules or accepted materials must include verifiable `source_id` matching an authorized knowledge chunk.
3. **AC-VIS-01:** Uploaded image must be checked for valid image format and size ($\le 5\text{MB}$) server-side before invoking vision inference.
4. **AC-VIS-02:** Vision returns top category candidates mapped strictly to active Kedas taxonomy. It must never output estimated weight or monetary reward without human weighing.
5. **AC-COP-01:** Operations Copilot tools are strictly read-only. No SQL execution or state mutation is permitted from copilot recommendations.
6. **AC-SEC-01:** All AI provider secrets reside server-side. Zero API keys in client-side Next.js bundles or browser network payloads.
