# 01 — FULL REPOSITORY DISCOVERY & AUDIT REPORT
## Kedas: AI-Powered Community & Green Tourism Intelligence Platform
**Date:** 30 October 2026  
**Auditor:** Coordinated Senior Engineering & Product Team  
**Evaluation Standard:** Repository-First Truth vs Historical Reports  

---

## 1. Executive Summary

A comprehensive repository-first discovery was conducted across the Kedas codebase. The codebase was originally initiated under the working title *WasteLink Bali* and systematically upgraded into *Kedas*.

### Critical Finding: Actual Scale vs Historical Baseline
The historical team baseline reported:
- 19 data models, 48 API endpoints, 8 roles, 185 tests (76 BE, 94 FE, 15 Mobile).

**Actual Repository Reality:**
- **44 ORM Models** spanning 9 Alembic revisions (`0001` through `0009_cdoa_and_destination_agreements`).
- **116+ FastAPI Endpoints** across 20 route modules in `backend/app/api/v1/`.
- **37 Next.js Web Routes** in `frontend/src/app/` including public microsite `/guest`.
- **8 System Roles** (`USER`, `COLLECTOR`, `DISPATCHER`, `FACILITY_OPERATOR`, `WASTE_BANK_STAFF`, `PARTNER`, `COMMUNITY_LEADER`, `ADMIN`).
- **191 Automated Tests Passing 100%**:
  - Backend (Pytest): **81 passed** (54.26s)
  - Frontend (Vitest): **95 passed** (8.19s)
  - Mobile (Vitest): **15 passed** (0.30s)
- **Static Analysis:** `ruff check` 0 errors, `mypy app` 0 errors (79 files), `tsc --noEmit` 0 errors across frontend and mobile.

---

## 2. Repository Layout & Architecture

```
HackAthon-Bali/
├── backend/
│   ├── alembic/              # 9 Schema migrations (0001 - 0009)
│   ├── app/
│   │   ├── api/v1/           # 20 Route modules (116+ handlers)
│   │   ├── core/             # Config, security, errors, dependencies
│   │   ├── db/               # Session, Base, Mixins, AuditLog
│   │   └── modules/          # 12 Domain modules (Account, Collection, Community, Facility,
│   │                         #   Marketplace, Funding, Points, Taxonomy, Weight, etc.)
│   └── tests/                # 27 Test suites (81 automated tests)
├── frontend/
│   ├── src/
│   │   ├── app/              # 37 Next.js App Router pages (public, app, staff, admin)
│   │   ├── components/       # UI primitives, shells, role switchers, modals
│   │   ├── context/          # AuthContext, RoleGuard, ToastContext
│   │   ├── lib/              # api-client, token storage, formatters
│   │   ├── services/         # Typed API clients for each backend domain
│   │   └── test/             # 9 Vitest suites (95 tests)
├── mobile/                   # React Native / Expo Core (Preserved & Frozen)
│   ├── src/                  # Simulator screen, offline optimistic task queue
│   └── test/                 # 1 Vitest suite (15 tests)
├── PAKET_DOKUMEN_KEDAS_AI_WEB_INNOVATION/ # Reference PRD, SRS, HDD, Prompt Library
└── docs/                     # Implementation records, audit logs, reports
```

### Context Architecture Diagram
```mermaid
flowchart TB
  subgraph USERS[Target Personas]
    G[Wisatawan / Guest]
    W[Warga Komunitas]
    H[Manajer Hotel & Restoran HOREKA]
    S[Petugas Kolektor Lapangan]
    F[Operator TPS3R / Bank Sampah]
    B[Mitra Daur Ulang / Buyer]
    A[Admin Kawasan & Prajuru Banjar]
  end

  subgraph WEB[Kedas Web-First Experience (Next.js 15)]
    PUB[Public Microsite /guest & /area-layanan]
    APP[Resident Workspace /app]
    STAFF[Field Staff Workspace /staff]
    ADMIN[Administrative Workspace /admin]
    DS[Bali Green-Sand Design System & Tokens]
  end

  subgraph AI_LAYER[Kedas AI Engine (Server-Side Bounded)]
    ECO[Kedas EcoGuide: Scoped RAG + Citations]
    VIS[Kedas Vision: Material Classifier + Human Review]
    COP[Kedas Operations Copilot: Read-Only Whitelisted Tools]
    GOV[AI Governance: Prompt Injection Defense + Auditing]
  end

  subgraph BACKEND[FastAPI Modular Monolith]
    IAM[Identity & Access Management (8 Roles)]
    CDOA[CDOA & Destination Rules Engine]
    ELIG[Deterministic Service Eligibility Engine]
    COLL[Collection & Waste Passport Tracking]
    FAC[Facility Mass Balance & Sorting]
    B2B[Green Hospitality Ledger]
    DCLI[Destination Clean Loop Index Analytics]
  end

  subgraph STORAGE[Data Persistence Layer]
    PG[(PostgreSQL Database / SQLite WAL)]
    OBJ[(Private Document & Evidence Storage)]
    AUD[(Immutable Audit Trail Logs)]
  end

  USERS --> WEB
  WEB --> BACKEND
  WEB --> AI_LAYER
  AI_LAYER --> BACKEND
  BACKEND --> STORAGE
```

---

## 3. Detailed Subsystem Audit

### 3.1 Authentication, Roles & RBAC
- **Token Management:** Cryptographic database-backed session tokens (`Session` entity) with expiration and revoking on logout.
- **Password Hashing:** Argon2/Bcrypt hash verification with password complexity enforcement.
- **Roles:** 8 formal roles (`USER`, `COLLECTOR`, `DISPATCHER`, `FACILITY_OPERATOR`, `WASTE_BANK_STAFF`, `PARTNER`, `COMMUNITY_LEADER`, `ADMIN`).
- **Role Switching:** `preferred_active_role` provides context-switching for users holding multiple verified roles, enforced strictly server-side.
- **Collector Onboarding:** Workflow requires submission of `CollectorApplication` and mandatory Admin approval before granting the `COLLECTOR` role.

### 3.2 Destination Management & CDOA (Community Destination Operating Agreement)
- **Model:** `CDOAAgreement` in `backend/app/modules/community/models.py`.
- **Lifecycle:** `DRAFT` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED` $\rightarrow$ `SUPERSEDED` / `SUSPENDED`.
- **Public Directory:** `/api/v1/community/service-directory/{service_area_id}` delivers active category acceptance, SLA, and capacity limits.

### 3.3 Service Eligibility Engine
- Deterministic 7-factor verification in `backend/app/modules/collection/service.py:check_service_eligibility`:
  1. Service area active check.
  2. Active published CDOA existence.
  3. Waste category acceptance in CDOA.
  4. Facility active and operational status (blocks if in maintenance/closed).
  5. Facility category capability.
  6. Slot operational window and available capacity (`booked_capacity < max_capacity`).
  7. Address-service area territorial isolation.

### 3.4 Kedas Waste Passport & Traceability
- **Public QR View:** `/api/v1/pickup-requests/passport/public/{public_code}` — **Zero PII exposure**: excludes citizen full name, email, phone, and private street address. Displays tracking code, banjar name, verified weight, category, and lifecycle events.
- **Authenticated Detail:** `/api/v1/pickup-requests/{id}/passport` — Enforces anti-IDOR checks (only reporter, assigned collector, or admin).

### 3.5 Green Hospitality Ledger (HOREKA B2B)
- **Tenant Isolation:** Enforced via `partner_id` in `backend/app/modules/marketplace/service.py`.
- **Metrics:** Total collection volume, category breakdown (Organic vs Recyclable vs Residual), verified loop rate.
- **Disclaimer:** Mandatory operational audit disclaimer attached to all responses.

### 3.6 Facility Mass Balance & Sorting
- **Formula:** $Input = Output + Residu \pm Tol$ in `record_sorting_process`. Discrepancies exceeding allowable thresholds are rejected.
- **Atomic Stock Reservation:** Material batches allocated to verified buyers lock stock atomically to prevent double-selling.

### 3.7 Destination Clean Loop Index (DCLI)
- **Endpoint:** `GET /api/v1/community/banjar/{service_area_id}/dcli`.
- **Guardrail:** Minimum 3 completed operational cycles required. If `< 3`, returns `status="INSUFFICIENT_DATA"` and `overall_score=None` to prevent greenwashing.

---

## 4. API Endpoints Inventory

| Domain Prefix | Key Endpoints | Auth Level |
|---|---|---|
| `/auth` | `/login`, `/register`, `/logout`, `/me`, `/forgot-password`, `/reset-password` | Public / Bearer |
| `/me` | `/roles`, `/switch-role`, `/addresses`, `/collector-application` | Authenticated |
| `/pickup-requests` | `/`, `/{id}`, `/eligibility`, `/passport`, `/passport/public/{code}` | Authenticated / Public QR |
| `/collector/tasks` | `/available`, `/claim`, `/{id}/status`, `/{id}/weigh`, `/{id}/qc` | Role: COLLECTOR |
| `/facility` | `/`, `/receipts`, `/sorting`, `/stock`, `/mass-balance` | Role: FACILITY_OPERATOR |
| `/marketplace` | `/batches`, `/offers`, `/orders`, `/b2b/report` | Role: PARTNER, ADMIN |
| `/community` | `/cdoa`, `/service-directory/{id}`, `/banjar/{id}/dcli`, `/complaints`, `/events` | Role: LEADER / Public |
| `/points` | `/ledger`, `/balance`, `/rules` | Authenticated |
| `/admin` | `/users`, `/roles/grant`, `/applications/review`, `/audit-logs` | Role: ADMIN |

---

## 5. Contest Eligibility Issue (Mandatory Risk Record)

> [!WARNING] Contest Eligibility Verification Required
> A public third-party listing for the *Bali Digifest AI Web Innovation Challenge 2026* indicated participant eligibility for **SMA, D1, and D2** students, without explicit mention of undergraduate (S1) students.
>
> Official confirmation from the competition committee must be obtained prior to formal submission. In accordance with autonomous execution guidelines, this is flagged as an **External Human Action** and does not block technical implementation of the web product.
