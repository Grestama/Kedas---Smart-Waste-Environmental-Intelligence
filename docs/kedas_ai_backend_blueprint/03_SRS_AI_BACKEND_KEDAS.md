# 03 — Software Requirements Specification: AI & Backend Kedas

## 1. Purpose and normative language

SRS ini mendefinisikan perilaku backend dan AI secara dapat diuji. Kata **MUST** = wajib; **SHOULD** = sangat disarankan; **MAY** = opsional. Semua status `PROPOSED` wajib dipetakan ke implementasi aktual.

## 2. System boundary

Web Next.js memanggil API FastAPI. Backend tetap menjadi boundary untuk authentication, permission, business rules, AI orchestration, provider credentials, persistence, audit, and metrics. AI provider tidak dipanggil langsung dari browser.

## 3. Actors and scopes

- Public guest: anonymous/public-only data, strict rate limit.
- Resident: own records and allowed destination scope.
- Staff: assigned/authorized operations only.
- Facility operator: own facility/organization scope.
- Hospitality member: own organization records.
- Community coordinator: approved community scope.
- Destination admin: configured destination and delegated permissions.
- System/service actor: narrowly scoped service identity.

Authorization MUST combine existing account role + explicit permission + organization membership + destination scope. Never infer access from UI route or role display name alone.

## 4. Functional requirements

### 4.1 AI Platform Foundation

- `AI-BE-FR-001`: Backend MUST expose a provider-neutral adapter contract.
- `AI-BE-FR-002`: Provider secret MUST remain server-side.
- `AI-BE-FR-003`: Each request MUST receive interaction ID, actor/scope, capability, and policy version.
- `AI-BE-FR-004`: Each capability MUST have configured model, timeout, token/image limit, quota, and fallback policy.
- `AI-BE-FR-005`: Request/response MUST validate against typed schemas.
- `AI-BE-FR-006`: Provider/model/version, latency, status, token usage/cost if available MUST be recorded.
- `AI-BE-FR-007`: Provider outage MUST not block non-AI domain operations.

### 4.2 Shared Context

- `CTX-FR-001`: Resolve destination and organization scope from authenticated context, never trust client-provided scope by itself.
- `CTX-FR-002`: Context MUST include version and `as_of` timestamp.
- `CTX-FR-003`: Context builder MUST include only fields authorized for the actor and capability.
- `CTX-FR-004`: CDOA/facility/acceptance-rule changes MUST invalidate or version relevant context cache.
- `CTX-FR-005`: Context must separate verified, self-reported, estimated, and simulated facts.

### 4.3 Knowledge Management

- `KB-FR-001`: Admin may register a document with title, type, owner, scope, language, source URI, effective dates, classification, and checksum.
- `KB-FR-002`: Upload validation MUST enforce allowed type, size, content signature, and private storage.
- `KB-FR-003`: Ingestion MUST be asynchronous when parsing/embedding exceeds request latency budget.
- `KB-FR-004`: Pipeline states MUST include at least `UPLOADED`, `VALIDATING`, `PARSING`, `CHUNKING`, `EMBEDDING`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `FAILED`, `EXPIRED`.
- `KB-FR-005`: Published versions are immutable; edits create a new version.
- `KB-FR-006`: Only approved `PUBLISHED` content is retrievable.
- `KB-FR-007`: Ingestion error must be visible to authorized admin and traceable.
- `KB-FR-008`: Duplicate detection MUST use content checksum and metadata.

### 4.4 EcoGuide

- `EG-FR-001`: Resolve language and destination context.
- `EG-FR-002`: Retrieve only allowed, published, active knowledge.
- `EG-FR-003`: Support lexical and semantic retrieval where vector infrastructure is verified.
- `EG-FR-004`: Rerank/deduplicate results while preserving source metadata.
- `EG-FR-005`: Return answer status, answer, citations, limitations, and next step.
- `EG-FR-006`: Citation references MUST map to retrieved chunks and correct document version.
- `EG-FR-007`: If evidence insufficient or contradictory, return `ABSTAINED` or `PARTIAL`.
- `EG-FR-008`: Prompt injection in query/document MUST not change system instructions, expose secrets, or expand scope.
- `EG-FR-009`: Feedback MUST be stored separately from ground-truth labels.
- `EG-FR-010`: Public guest may only access documents explicitly published as public.

### 4.5 Vision

- `VIS-FR-001`: Validate MIME signature, image dimensions, byte size, and decoding before provider call.
- `VIS-FR-002`: Strip EXIF/location metadata where not required.
- `VIS-FR-003`: Use active taxonomy version and destination acceptance policy.
- `VIS-FR-004`: Return candidates, confidence band, unknown/review status, and model version.
- `VIS-FR-005`: Prediction does not set verified weight, hazardous classification, reward, or final acceptance.
- `VIS-FR-006`: User/staff correction is recorded as a separate human label with actor/time.
- `VIS-FR-007`: Private image reference is authorization-checked on every read.
- `VIS-FR-008`: Model/provider failure returns controlled error and preserves original workflow.

### 4.6 Operations Copilot

- `OC-FR-001`: Tool registry MUST explicitly define name, purpose, input schema, permission, destination scope, read/write class, timeout, and output schema.
- `OC-FR-002`: Default tools are read-only.
- `OC-FR-003`: Tool execution occurs in backend code; model never receives raw SQL/database credentials.
- `OC-FR-004`: Every recommendation includes evidence IDs and data timestamps.
- `OC-FR-005`: Consequential recommendations create `ActionProposal`, not direct mutation.
- `OC-FR-006`: Proposal includes target entity, expected version, requested change, reason, evidence, risk, expiry, and approval policy.
- `OC-FR-007`: Approval requires authenticated actor with explicit permission and current state revalidation.
- `OC-FR-008`: Proposal execution uses domain service transaction and idempotency key.
- `OC-FR-009`: Stale/conflicting proposal becomes `STALE` and must be regenerated/reviewed.
- `OC-FR-010`: Model output cannot change permission, approval requirement, or action target.
- `OC-FR-011`: Rejection/cancellation and reason are auditable.

### 4.7 Facility Intelligence

- `FAC-FR-001`: Eligibility hard filters are deterministic.
- `FAC-FR-002`: Filter requires active facility, accepted category, valid service scope, valid operating window, current capacity, and non-blocked operational status.
- `FAC-FR-003`: Unknown/stale capacity cannot be represented as available.
- `FAC-FR-004`: Ranking cannot reintroduce a candidate rejected by hard filters.
- `FAC-FR-005`: Explain candidate ranking and `as_of` timestamp.
- `FAC-FR-006`: Capacity reservation/consumption must use existing concurrency-safe transaction logic.

### 4.8 Forecasting and anomaly detection

- `ML-FR-001`: Forecast endpoints MUST disclose horizon, granularity, model version, training cutoff, generated time, and uncertainty where supported.
- `ML-FR-002`: Must return `INSUFFICIENT_DATA` if data-quality/sufficiency gate fails.
- `ML-FR-003`: Evaluation MUST use chronological backtesting.
- `ML-FR-004`: Model MUST be compared to a naive baseline.
- `ML-FR-005`: Anomaly score is not proof of fraud or misconduct.
- `ML-FR-006`: Alert includes feature/evidence summary and review status.

### 4.9 Hospitality and Community Intelligence

- `HOS-FR-001`: Analytics distinguish `VERIFIED` and `SELF_REPORTED` records.
- `HOS-FR-002`: Organization isolation MUST be enforced on all reads/writes/exports.
- `HOS-FR-003`: Recommendation must cite its input period and data coverage.
- `COM-FR-001`: Community insights use aggregate data; no sensitive individual profiling.
- `COM-FR-002`: Suppress or generalize small groups according to privacy policy.

### 4.10 Circular Matching and Optimization

- `MAT-FR-001`: Material eligibility hard filters MUST run before ranking.
- `MAT-FR-002`: Match requires category/grade compatibility, quantity/MOQ, active demand, destination/logistics compatibility, and valid partner status where applicable.
- `MAT-FR-003`: Price must have currency, source, and effective timestamp.
- `MAT-FR-004`: Ranking is explainable and returns `NO_MATCH` if no candidate passes.
- `OPT-FR-001`: Route/schedule optimization is P2; constraints must be explicit and testable.
- `OPT-FR-002`: LLM MUST NOT be used as route solver or final optimizer.

### 4.11 DCLI and reporting

- `RPT-FR-001`: DCLI calculation uses versioned deterministic code and explicit formula.
- `RPT-FR-002`: Metric snapshot stores definition version, period, scope, provenance, source IDs, freshness, and data coverage.
- `RPT-FR-003`: AI report generation may create narrative only from supplied snapshot.
- `RPT-FR-004`: Every numeric claim must map to a snapshot field.
- `RPT-FR-005`: Unverifiable report is marked `NEEDS_REVIEW` and cannot be auto-published.

## 5. Non-functional requirements

### 5.1 Reliability

- `NFR-REL-001`: AI outage does not block ordinary collection, facility, or account workflows.
- `NFR-REL-002`: All provider calls have bounded timeout, retry, and circuit-breaker policy.
- `NFR-REL-003`: Jobs are idempotent and have retry/dead-letter or equivalent failure recording.
- `NFR-REL-004`: No silent fallback to mock success in production paths.

### 5.2 Performance (initial targets, staging)

| Operation | Proposed target |
|---|---|
| Non-AI API p95 | ≤700 ms under documented test profile |
| Context assembly p95 | ≤300 ms excluding external retrieval/model |
| Retrieval p95 | ≤1.5 s for configured benchmark corpus |
| EcoGuide full response p95 | ≤20 s, provider-dependent |
| Vision full response p95 | ≤25 s, bounded image size/provider-dependent |
| Copilot analysis p95 | ≤20 s for bounded read-only tool set |
| Background ingestion | Status progress visible; throughput measured, not guessed |

Targets are goals, not current guarantees. Record hardware, concurrency, dataset, provider, region, and test profile.

### 5.3 Privacy and security

- `NFR-SEC-001`: no provider secret in frontend.
- `NFR-SEC-002`: permission and scope enforced in backend before retrieval/tool execution.
- `NFR-SEC-003`: no cross-destination/private-document leakage.
- `NFR-SEC-004`: upload validation and private object access.
- `NFR-SEC-005`: prompt input/retrieved content treated as untrusted.
- `NFR-SEC-006`: high-impact actions require human approval.
- `NFR-SEC-007`: sensitive fields minimized/redacted in logs and prompts.
- `NFR-SEC-008`: configurable retention/deletion with audit controls.

### 5.4 Observability

Every request records correlation ID, capability, actor class, scope hash/ID, provider/model, latency stages, outcome, token/cost if supplied, retrieval/evidence IDs, safety outcome, retry count, and fallback. Never log secrets or unrestricted prompt content.

## 6. Proposed API contract inventory

These are proposed logical contracts. Agent MUST inspect existing OpenAPI and reuse/extend routes before creating any new route.

| Capability | Proposed method/path | Contract purpose |
|---|---|---|
| Context | `GET /api/v1/ai/context/current` | Current authorized destination context |
| Knowledge | `POST /api/v1/ai/knowledge/documents` | Register/upload document |
| Knowledge | `GET /api/v1/ai/knowledge/documents` | List scoped documents |
| Knowledge | `POST /api/v1/ai/knowledge/documents/{id}/submit-review` | Submit document for review |
| Knowledge | `POST /api/v1/ai/knowledge/documents/{id}/publish` | Publish approved version |
| EcoGuide | `POST /api/v1/ai/ecoguide/queries` | Ask grounded question |
| EcoGuide | `POST /api/v1/ai/ecoguide/feedback` | Submit answer feedback |
| Vision | `POST /api/v1/ai/vision/assessments` | Create image assessment |
| Vision | `POST /api/v1/ai/vision/assessments/{id}/review` | Human correction/review |
| Copilot | `POST /api/v1/ai/copilot/analyses` | Analyze allowed operational context |
| Copilot | `POST /api/v1/ai/action-proposals` | Create action proposal |
| Copilot | `POST /api/v1/ai/action-proposals/{id}/approve` | Approve proposal |
| Copilot | `POST /api/v1/ai/action-proposals/{id}/reject` | Reject proposal |
| Capacity | `GET /api/v1/ai/facilities/{id}/forecast` | Capacity projection |
| Hospitality | `GET /api/v1/ai/hospitality/insights` | Scoped business insights |
| Material | `POST /api/v1/ai/material-matches` | Find qualified buyers |
| DCLI | `GET /api/v1/analytics/dcli/snapshots` | Read deterministic snapshot |
| Reports | `POST /api/v1/ai/reports` | Generate narrative over snapshot |

The actual path may differ. Do not introduce duplicate endpoints for behavior that already exists.

## 7. Acceptance scenarios

| ID | Scenario | Expected |
|---|---|---|
| SRS-AI-001 | Query with published source in same destination | Answer cites correct source version |
| SRS-AI-002 | Query with no support | Abstains; no fabricated local rule |
| SRS-AI-003 | User asks for private destination SOP from another scope | Zero retrieval leakage |
| SRS-AI-004 | Vision clear common item | Candidate + uncertainty + review policy |
| SRS-AI-005 | Vision ambiguous or unknown | `NEEDS_REVIEW` |
| SRS-AI-006 | Copilot proposes invalid facility | Rejected by hard filter |
| SRS-AI-007 | Copilot attempts direct mutation | No mutation; action proposal only |
| SRS-AI-008 | Proposal approved by authorized admin | Domain service executes once, auditable |
| SRS-AI-009 | Proposal is stale | `STALE`, no execution |
| SRS-AI-010 | No sufficient forecast history | `INSUFFICIENT_DATA` |
| SRS-AI-011 | Report narrative invents a number | Numeric validator rejects/marks review |
| SRS-AI-012 | Provider unavailable | Graceful error; core domain remains usable |
| SRS-AI-013 | Guest asks internal admin data | Refuse/no private retrieval |
| SRS-AI-014 | Uploaded document contains prompt injection | Treated as untrusted content; no privilege change |

## 8. Definition of done

A requirement is done only when code exists, schema/API contract is documented, permission is enforced, automated tests pass, observability exists, failure state is handled, and evidence is recorded. A UI-only mock or prompt-only feature is not implementation complete.
