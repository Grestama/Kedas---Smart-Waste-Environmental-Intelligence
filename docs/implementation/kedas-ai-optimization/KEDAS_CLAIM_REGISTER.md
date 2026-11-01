# Kedas — Truthful Claims Register

**Document ID:** DOC-CLAIMS-001  
**Project:** Kedas (Historical: WasteLink Bali)  
**Date:** 30 October 2026  
**Status:** RECONCILED AGAINST VERIFIED IMPLEMENTATION  

---

## 1. Classification of System Claims

Every capability, metric, and feature claimed by Kedas must be categorized strictly according to the evidence available:

- **[VERIFIED_CODE]:** Verified directly in source code and domain models.
- **[VERIFIED_TEST]:** Verified by automated regression/unit/integration tests.
- **[VERIFIED_RUNTIME]:** Verified by browser runtime or HTTP request-response.
- **[SIMULATED_DEMO]:** Seeded demonstration data (clearly tagged as simulated).
- **[PLANNED_ROADMAP]:** Architectural plan not yet built.
- **[FIELD_DEPENDENT]:** Depends on real-world partner/hardware validation.

---

## 2. Capability Claims Table

| Claim ID | Claim Statement | Evidence Level | Verification Proof | Caveats & Operational Boundaries |
| :---: | :--- | :---: | :--- | :--- |
| **CLM-001** | Multi-Role Authentication with 8 distinct RBAC roles | `[VERIFIED_TEST]` | `test_auth_phase2.py`, `test_rbac_and_roles.py` | Roles granted by admin; self-registration defaults to CITIZEN. |
| **CLM-002** | Anti-IDOR ownership protection on citizen data | `[VERIFIED_TEST]` | `test_idor_addresses_and_pickups.py` | Strict ownership checks (`reporter_user_id == user.id`). |
| **CLM-003** | Concurrency-safe collection slot booking | `[VERIFIED_TEST]` | `test_collection_concurrency.py` | Database row locks prevent quota overbooking. |
| **CLM-004** | Dual-mode server-side AI provider adapter | `[VERIFIED_RUNTIME]` | `test_ai_foundation_and_ecoguide.py` | Zero API keys exposed to browser bundle; resilient offline fallback. |
| **CLM-005** | Kedas EcoGuide zero hallucination on unknown rules | `[VERIFIED_TEST]` | `evaluate_ai.py` (100% abstention rate) | Triggers `INSUFFICIENT_CONTEXT` when no active chunks match query. |
| **CLM-006** | Kedas Vision mandatory human review confirmation | `[VERIFIED_RUNTIME]` | `VisionUploadModal.tsx`, `ai-components.test.tsx` | AI outputs suggestion; citizen must confirm or override category. |
| **CLM-007** | Vision never predicts item weight or monetary points | `[VERIFIED_CODE]` | `ai/service.py`, `ai/schemas.py` | Physical weight verified solely by POS digital scales. |
| **CLM-008** | Operations Copilot is strictly read-only | `[VERIFIED_TEST]` | `test_ai_foundation_and_ecoguide.py` | Copilot cannot execute arbitrary SQL or state mutations. |
| **CLM-009** | Carbon offset calculation ($1.82\text{ kg CO}_2\text{e/kg}$) | `[FIELD_DEPENDENT]` | `setoran/[id]/page.tsx` | Standard emission factor estimate; clearly labeled as estimated. |
| **CLM-010** | DCLI composite score across 4 sustainability dimensions | `[VERIFIED_TEST]` | `test_dcli_analytics.py` | Analytical indicator calculated deterministically; not official government certification. |
| **CLM-011** | Mass-balance audit flags discrepancies $> 15\%$ | `[VERIFIED_CODE]` | `ai/service.py`, `test_ai_foundation_and_ecoguide.py` | Mathematical verification of $|In - Out - Res| / In$. |
| **CLM-012** | Guest Green Companion zero-install bilingual web | `[VERIFIED_RUNTIME]` | `app/(public)/guest/page.tsx` | No login required; English and Indonesian instant toggle. |
| **CLM-013** | Multi-hospitality live supply contracts | `[SIMULATED_DEMO]` | `marketplace/models.py`, `test_marketplace_and_e2e.py` | Models exist; live B2B partners require real-world agreements. |
