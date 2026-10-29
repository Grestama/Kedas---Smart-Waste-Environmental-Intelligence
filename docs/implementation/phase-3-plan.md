# WasteLink Bali — Phase 3 Implementation Plan
## Verified Inspection & Weighing, Evidence Storage, WastePoints Ledger, Material Batching, and Funding Controls

### 1. Architectural Scope & Module Structure
Phase 3 builds the high-risk operational core of WasteLink Bali without introducing microservices. All transactions follow strict ACID boundaries in PostgreSQL, utilizing `with_for_update()` for concurrency control and append-only ledger immutability.

```
backend/app/
├── core/
│   └── storage.py            # StorageAdapter interface (Local & S3)
├── modules/
│   ├── inspection/           # QC inspection records & state machine
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── service.py
│   ├── weight/               # Versioned gross/tare/net weight records
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── service.py
│   ├── evidence/             # Secure private evidence file metadata
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── service.py
│   ├── points/               # Versioned reward rules, evaluation & append-only ledger
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── service.py
│   ├── funding/              # Funding programs & budget concurrency guards
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── service.py
│   ├── marketplace/          # Verified partners, material batches & deliveries
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── service.py
│   └── notification/         # Minimal domain notifications
│       ├── models.py
│       ├── schemas.py
│       └── service.py
└── api/v1/
    ├── inspections.py
    ├── weights.py
    ├── evidence.py
    ├── points.py
    ├── funding.py
    ├── marketplace.py
    └── notifications.py
```

---

### 2. Domain Entities & State Machines

#### A. Inspection (`InspectionRecord`)
- **Status Lifecycle**: `ACCEPTED`, `ACCEPTED_WITH_CONTAMINATION`, `PARTIALLY_ACCEPTED`, `REJECTED`, `NEEDS_REVIEW`.
- **Preconditions**: Pickup must be in `IN_TRANSIT` or `ARRIVED`, and actor must be the assigned collector or authorized admin.
- **Integrity**: `REJECTED` strictly requires rejection reason; `PARTIALLY_ACCEPTED` separates accepted vs rejected weights.
- **Special Waste Safety**: Suspected hazardous/SPECIAL waste triggers `NEEDS_REVIEW` and halts standard automated workflows.

#### B. Verified Weight (`WeightRecord`)
- **Versioning**: Starts at version 1; subsequent corrections increment version and link to `supersedes_id` with mandatory correction reason.
- **Math Verification**: If gross & tare provided, `net = gross - tare` (with `tare <= gross`). Direct net weighing explicitly marked.
- **Precision**: `Numeric(10, 3)` (Decimal), strictly finite and non-negative.
- **Reversal Flow**: Correcting weight after reward issuance generates ledger adjustment/reversal entries.

#### C. Evidence Files (`EvidenceFile`)
- **Access Model**: Private by default; accessible via short-lived signed URLs or authenticated download proxy.
- **Security**: Server-generated UUID storage keys; user-provided filenames never used on disk. MIME allowlist and size checks enforced.

#### D. WastePoints Ledger (`LedgerEntry`)
- **Immutability**: Append-only; no UPDATE or DELETE on posted records.
- **Formula**: `floor(net_weight_kg * rule.points_per_kg)`. Client-supplied points are strictly rejected.
- **Idempotency**: Scoped idempotency key (`PICKUP_REWARD:<pickup_id>:<version>`). Same key + payload returns existing entry; different payload yields 409 Conflict.
- **Balance Calculation**: `SUM(points_delta)` across posted entries. Zero-credit if funding budget exhausted.

#### E. Funding & Budgets (`FundingProgram`)
- **Concurrency**: `with_for_update()` on budget ledger before allocating points.
- **Zero-Negative**: System halts point issuance or marks status `HELD` if budget pool is exhausted.

#### F. Circular Marketplace & Batches (`MaterialBatch`, `DeliveryRecord`)
- **Traceability**: Material batches reference verified source pickup IDs.
- **State Progression**: `COLLECTED -> BATCHED -> ALLOCATED -> SHIPPED -> RECEIVED -> PROCESSED_CONFIRMED`.
- **Discrepancy Tracking**: Dispatched weight vs received weight recorded in delivery receipts; discrepancies trigger review without modifying historical dispatch data.

---

### 3. Risk Mitigation & Quality Gates
- **High Concurrency Risk**: Two collectors attempting to claim/inspect same pickup -> row-level locking (`with_for_update()`).
- **Financial Race Condition**: Multiple reward postings exhausting budget simultaneously -> atomic database decrement.
- **IDOR Protection**: Citizens can only view their own ledger, evidence, and notifications. Collectors can only inspect assigned pickups.
- **Testing Requirements**: Comprehensive test suite covering weight math, idempotency collisions, budget depletion, batch allocation overcommit, and end-to-end collection-to-delivery lifecycle.
