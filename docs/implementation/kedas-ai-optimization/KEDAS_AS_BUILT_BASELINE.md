# Kedas — As-Built Baseline Verification Report

**Document ID:** DOC-BASELINE-001  
**Project:** Kedas (Historical: WasteLink Bali)  
**Verification Date:** 30 October 2026  
**Auditor/Implementer:** Agentic Engineering Team  
**Status:** VERIFIED FROM REPOSITORY SOURCE CODE  

---

## 1. Verified Inventory of Codebase & Infrastructure

### 1.1. Backend Architecture (FastAPI & Python 3.13)
- **Framework:** FastAPI 0.115.0, Uvicorn 0.30.0, SQLAlchemy 2.0.30, Pydantic 2.7.0, Alembic 1.13.0.
- **Relational Tables:** 44 ORM models mapped across 12 modules (`account`, `ai`, `collection`, `community`, `evidence`, `facility`, `funding`, `inspection`, `marketplace`, `notification`, `points`, `weight`).
- **Alembic Migrations:** 10 sequential versions cleanly applied (`0001_baseline_audit_log.py` to `0010_ai_knowledge_and_interactions.py`).
- **REST Endpoints:** 116 endpoints registered under `/api/v1` via master router in `backend/app/api/v1/router.py`.
- **Identity & RBAC:** 8 roles defined (`CITIZEN`, `COLLECTOR`, `FACILITY_OPERATOR`, `AREA_ADMIN`, `SUPER_ADMIN`, `HOREKA`, `BUYER`, `AUDITOR`). Session tokens hashed with SHA-256; password hashing with Argon2id.

### 1.2. Frontend Architecture (Next.js 15 & React 19)
- **Framework:** Next.js 15.1.7 (App Router), React 19.0.0, TypeScript 5.9.3, Tailwind CSS 3.4.1.
- **Web Routes:** 38 routes verified via production compilation (`next build` output: 38/38 pages generated cleanly).
- **Design Tokens:** Deep Forest (`#1C2B22`), Warm Canvas (`#FAFAF8`), Bali Emerald (`#1B4D3E`), Sacred Gold (`#D4AF37`). Primary text contrast: $13.4:1$ (exceeds WCAG AAA $7:1$).
- **AI UI Components:** Located in `frontend/src/components/ai/`: `AICitationCard`, `AIConfidenceIndicator`, `AIDataProvenance`, `AIAbstainState`, `AISuggestionReview`, `OperationRecommendationCard`, `AIAssistantPanel`, `EcoGuideWidget`, `VisionUploadModal`.

### 1.3. Frozen Legacy Mobile Engine (React Native / Expo)
- **Framework:** Expo 58.0.21, React Native 0.88.1, React 19.3.1.
- **Test Baseline:** 15 automated Vitest tests passing in 334ms. Scope is frozen; no native mobile feature expansion needed for web competition.

---

## 2. Baseline Test Execution Results

```
========================================================================================
 TIER                    TEST RUNNER      SUITES    TESTS PASSED    FAILURES    DURATION
========================================================================================
 Backend Services        Pytest (9.1.1)     17           86            0         53.05s
 Web Frontend App        Vitest (3.2.7)     10          102            0         11.98s
 Mobile App (Frozen)     Vitest (5.0.5)      1           15            0          0.33s
----------------------------------------------------------------------------------------
 TOTAL AUTOMATED TESTS                      28          203            0         65.36s
========================================================================================
 Static Typecheck (FE)   tsc --noEmit        -       0 errors          0          Pass
 Next.js Build           next build         38       38 pages          0          Pass
 Python Linter           ruff check          -       0 errors          0          Pass
 Python Typecheck        mypy (80 files)     -       0 errors          0          Pass
 AI Evaluation Suite     CLI evaluate_ai     4        20/20            0          0.13s
========================================================================================
```

---

## 3. Reproduction & Traceability of Seven Audit Gaps

| Gap ID | Description | Code Location Verified | Reproduction Status | Target Resolution |
| :---: | :--- | :--- | :---: | :---: |
| **GAP-001** | `/area-layanan` uses static array `areas` | `frontend/src/app/(public)/area-layanan/page.tsx:8-41` | **REPRODUCED** | Stage 2 |
| **GAP-002** | Copilot recommendation CTA triggers toast only | `frontend/src/app/admin/laporan/page.tsx:235` | **REPRODUCED** | Stage 6 |
| **GAP-003** | EcoGuide RAG uses lexical exact token match | `backend/app/modules/ai/knowledge.py:125-150` | **REPRODUCED** | Stage 3 & 4 |
| **GAP-004** | B2B models exist, but `/hospitality` workspace missing | `backend/app/modules/marketplace/models.py:120` | **REPRODUCED** | Stage 7 |
| **GAP-005** | Staff collection & weighing form lacks offline queue | `frontend/src/app/staff/tugas/[id]/page.tsx:90` | **REPRODUCED** | Stage 9 |
| **GAP-006** | DCLI backend formula lacks frontend radar chart | `backend/app/modules/community/service.py:310` | **REPRODUCED** | Stage 8 |
| **GAP-007** | Knowledge ingestion endpoint lacks admin web form | `backend/app/modules/ai/service.py:120` | **REPRODUCED** | Stage 3 |

---

## 4. Stage 1 Quality Gate Assessment

- [x] All 12 domain modules mapped to actual filesystem paths.
- [x] All 7 audit gaps reproduced and linked to exact code locations.
- [x] Baseline test runs executed cleanly (203/203 passed).
- [x] Zero code modifications performed in Stage 1.
- **Stage 1 Verdict:** **PASS** $\rightarrow$ Proceeding automatically to Stage 2.
