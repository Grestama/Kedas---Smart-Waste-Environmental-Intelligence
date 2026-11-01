# 08 — MASTER PROMPT: Autonomous Implementation Kedas AI Ecosystem & Backend

> Salin seluruh instruksi ini ke agentic AI yang mempunyai akses ke repository. Prompt ini hanya untuk AI/backend dan API contract. Jangan mengubah frontend visual kecuali update typed API client/test contract benar-benar diperlukan.

# SYSTEM MISSION

Anda bertindak sebagai Principal AI Engineer, Backend Architect, Data Engineer, ML Engineer, LLMOps/MLSecOps Engineer, QA Automation Engineer, dan Technical Writer untuk proyek **Kedas**.

Tugas Anda adalah mengaudit, merancang, mengimplementasikan, menguji, dan mendokumentasikan ekosistem AI + backend Kedas sampai seluruh quality gate terpenuhi.

Dokumen wajib dibaca:
1. `README_PAKET_KEDAS_AI_BACKEND.md`
2. `01_STRATEGI_EKOSISTEM_AI_KEDAS.md`
3. `02_PRD_EKOSISTEM_AI_KEDAS.md`
4. `03_SRS_AI_BACKEND_KEDAS.md`
5. `04_HDD_ARSITEKTUR_AI_BACKEND_KEDAS.md`
6. `05_DATA_MODEL_API_CONTRACT_AI_KEDAS.md`
7. `06_AI_EVALUATION_GOVERNANCE_KEDAS.md`
8. `07_AI_SECURITY_MLOPS_RUNBOOK_KEDAS.md`
9. `09_RUNTIME_PROMPT_LIBRARY_KEDAS.md`

## GLOBAL NON-NEGOTIABLE RULES

1. **Repository is truth.** Audit actual code, OpenAPI, ORM, migrations, tests, environment config, and runtime. Do not trust old docs blindly.
2. **Reconcile baseline.** A supplied audit dated 30 October 2026 reports 44 ORM tables, 10 Alembic revisions, 116 REST endpoints, 38 Next.js routes, and 203/203 tests. Older docs have different counts. Verify actual repository and record the current verified baseline.
3. Preserve existing working routes, database identifiers, role model, permissions, domain services, and frontend contracts unless a written ADR and compatibility plan justify change.
4. Keep existing FastAPI modular monolith. Do not create microservices or new queue/vector infrastructure without measured need and ADR.
5. PostgreSQL/domain services are source of truth. LLM output is untrusted.
6. No API keys or provider calls from browser.
7. No arbitrary SQL, shell, file-system, or unrestricted HTTP tools for LLM.
8. Every AI capability has typed schema, permission policy, timeout, quota, trace, evaluation, fallback, and version metadata.
9. High-impact actions require human approval and domain-service execution.
10. Hard eligibility, transaction, mass balance, rewards, permissions, and DCLI calculations remain deterministic.
11. Never invent datasets, metrics, local policies, facility capacity, partners, prices, carbon factors, or model accuracy.
12. If data is insufficient, implement `INSUFFICIENT_DATA`, `NEEDS_REVIEW`, or `EXPERIMENTAL` response; do not fabricate output.
13. No destructive migration, production data deletion, external transaction, deployment, or production configuration change without explicit human authorization.
14. Do not ask for approval between phases. Continue autonomously for safe local work. If credential/decision/data is missing, document blocker, implement safe non-blocked parts, and continue.
15. Do not silently replace failing backend behavior with mock success.
16. After each phase: format → lint → type check → unit/integration tests → API contract test → security checks relevant to phase. Fix regressions before moving on.
17. Keep changes minimal, explainable, and reversible. Prefer extension over rewrite.

## AUTONOMOUS EXECUTION PROTOCOL

Maintain:
- `docs/ai-backend-implementation/IMPLEMENTATION_PROGRESS.md`
- `docs/ai-backend-implementation/DECISION_LOG.md`
- `docs/ai-backend-implementation/BLOCKERS_AND_ASSUMPTIONS.md`
- `docs/ai-backend-implementation/TEST_EVIDENCE.md`

For every phase record start/end, files changed, migrations, API changes, tests, results, remaining issues, and gate status.

A phase is complete only when its mandatory criteria pass. If a test fails, diagnose and fix; rerun affected tests and regression suite. If an external dependency blocks a feature, implement contract, feature flag, safe disabled state, and documentation; mark `BLOCKED`, then continue unrelated phases.

---

# PHASE 1 — REPOSITORY DISCOVERY, AS-BUILT BASELINE & DOMAIN MAPPING

## Goal
Establish verified technical baseline and map all existing components so no duplicate service/table/endpoint is created.

## Tasks
1. Inspect repository structure, branch, git status, package manifests, Python dependencies, environment templates, Docker/deployment, scripts, CI.
2. Inspect FastAPI routers, dependency injection, auth middleware, role/permission model, tenant/destination/organization scope.
3. Export OpenAPI and list every endpoint by module, method, auth requirement, request/response schema.
4. Inspect SQLAlchemy models, Alembic heads/history, indexes, constraints, relationships, and actual test DB setup.
5. Inspect current provider adapter, AI modules, prompts, image upload, document knowledge ingestion, background processing, logging, and feature flags.
6. Inspect all existing test suites and run baseline test commands.
7. Verify current versions from dependency lockfiles; do not upgrade dependencies in this phase.
8. Compare repository results to audit report and document differences.
9. Map PRD/SRS requirement IDs to existing code/tests.

## Required artifacts
- `AS_BUILT_BASELINE.md`
- `API_INVENTORY.csv`
- `DATA_MODEL_INVENTORY.md`
- `AUTHORIZATION_MAP.md`
- `EXISTING_AI_CAPABILITY_MAP.md`
- `REQUIREMENT_TRACEABILITY.csv`

## Quality gate
- Current test baseline recorded.
- OpenAPI/routes and ORM inventory generated.
- Conflicting historical metrics reconciled with repository evidence.
- No code changes unless required to make baseline commands run; report separately.

# PHASE 2 — AI BACKEND FOUNDATION & SHARED DESTINATION CONTEXT

## Goal
Create a consistent AI service boundary that all capability modules can safely consume.

## Tasks
1. Map or implement provider-neutral adapter using existing code if present.
2. Introduce capability registry/config: capability ID, provider/model, prompt/schema version, limits, timeout, retry, quota, cost metadata, release tier, fallback.
3. Build shared context service for destination, CDOA version, active taxonomy, facilities, accepted materials, operating windows, and data freshness.
4. Resolve scope from authenticated server context; treat client destination hint as selector only after membership/visibility validation.
5. Define typed error envelope and interaction metadata.
6. Add correlation IDs and structured logs.
7. Add server-side feature flags for each capability.
8. Add rate limiting and resource limits; reuse existing mechanism.
9. Define provider timeout and circuit breaker. Bounded retry only for transient failures.
10. Verify non-AI domain endpoints remain usable during provider outage.

## Quality gate
- No provider secret in frontend bundle or response.
- Scope isolation tests pass.
- All AI requests create traceable interaction metadata.
- Provider failure has normalized error/fallback.

# PHASE 3 — KNOWLEDGE MANAGEMENT & DOCUMENT INGESTION

## Goal
Make local knowledge safely manageable and versioned before improving RAG.

## Tasks
1. Inventory existing knowledge model and `/api/v1/ai/knowledge` implementation; reuse it.
2. Add document lifecycle, owner, destination/org scope, classification, source, language, effective/expiry date, checksum, version.
3. Add secure upload validation (size/type/signature, private object storage, malware scan if available).
4. Implement parser abstraction for allowed document types; isolate parser/timeouts.
5. Preserve page/section headings and provenance through chunking.
6. Add duplicate detection and ingestion job state.
7. Implement reviewer approval and publish/expire/reject flow.
8. Published version immutable; update produces new version.
9. Ensure only approved published documents are retrievable.
10. Add admin API contract; frontend UI may consume later but do not redesign frontend.

## Quality gate
- Upload/parse/chunk failures are observable.
- Private docs not accessible to guest.
- Version/citation lineage tests pass.
- Prompt-injection documents cannot alter policy.

# PHASE 4 — ECOGUIDE HYBRID RAG & EVALUATION

## Goal
Upgrade lexical-only retrieval to measurable hybrid retrieval and grounded answers.

## Tasks
1. Build locked benchmark from approved local SOP and reviewer-written query cases.
2. Include normal, paraphrased, multilingual, ambiguous, no-evidence, conflicting, outdated, injection, and cross-scope queries.
3. Establish lexical baseline first.
4. Check current PostgreSQL extension and deployment support before pgvector. Do not assume it is installed.
5. If vector search chosen, benchmark metadata filtering and recall for destination scopes; inspect index/query plans.
6. Add query embedding, semantic retrieval, merge/fusion, reranking if evidence says needed.
7. Filter authorization/published/effective state before text reaches model.
8. Assemble grounded prompt using versioned prompt library.
9. Enforce structured JSON schema and citation ID verification.
10. Add abstention/conflict/freshness handling.
11. Measure retrieval, grounding, citations, relevance, abstention, latency, token/cost.
12. Add provider/model/prompt regression tests.

## Quality gate
- Recall@5 provisional ≥0.85; citation precision ≥0.95; groundedness ≥0.90 on reviewed set.
- Scope leakage = 0.
- Unsupported critical local claim = 0 on release suite.
- If thresholds not met, do not falsely report pass; ship only limited/experimental mode with exact metrics.

# PHASE 5 — VISION PIPELINE, TAXONOMY & HUMAN REVIEW

## Goal
Make image assistance safe, measurable, and context-aware.

## Tasks
1. Inspect existing Vision path and taxonomy.
2. Define allowed classes, out-of-scope/unknown, mixed material, contamination label, and safety escalation boundary.
3. Curate authorized local image dataset; audit proposed 500-image target; report actual count/class/source/rights.
4. Define annotator guide and disagreement adjudication.
5. Split by capture session/source/location to prevent leakage; lock holdout.
6. Implement secure upload validation and metadata stripping.
7. Use provider adapter/dedicated model without leaking provider details into domain layer.
8. Map candidates to taxonomy version and destination rule.
9. Add calibration/threshold analysis; do not treat raw score as probability.
10. Implement user/staff correction and review status.
11. Do not calculate weight, chemical/hazard status, or definitive acceptance from image.
12. Report macro-F1, per-class precision/recall, confusion, ECE, unknown recall, correction rates.

## Quality gate
- Unknown/ambiguous set routes to review.
- High-risk false-safe case = 0 in release suite.
- Dataset provenance, split, and rights documented.
- If quality below threshold, keep recommendation experimental and manual confirmation required.

# PHASE 6 — FACILITY INTELLIGENCE, FORECASTING & DETERMINISTIC MATCHING

## Goal
Ensure any AI recommendation obeys operational hard constraints.

## Tasks
1. Inventory facility acceptance/capacity/status models and concurrency controls.
2. Implement/verify deterministic eligibility engine first.
3. Add capacity freshness and unavailable/unknown statuses.
4. Build historical intake/capacity series with provenance and missingness.
5. Establish naive and seasonal-naive forecasting baselines.
6. Use rolling-origin backtesting; no random split for time series.
7. Only enable forecast when minimum history/data quality gates pass.
8. Implement capacity forecast API with horizon/model/cutoff/error/interval metadata.
9. Extend material matching: hard filters first, ranking second.
10. Ranking may use distance, grade, MOQ, lead time, active price, partner status; each feature requires data source/as-of.
11. No eligible facility/buyer is an explicit valid result.
12. Add property-based tests for capacity, eligibility, and concurrency where applicable.

## Quality gate
- Hard eligibility violations = 0.
- Forecast beats agreed naive baseline by ≥10% before operational use; otherwise no actionable forecast.
- Stale/unknown capacity never shown as confirmed availability.
- Candidate ranking fully traceable.

# PHASE 7 — OPERATIONS COPILOT & CONTROLLED ACTION LIFECYCLE

## Goal
Turn AI insight into controlled workflow, not autonomous database mutation.

## Tasks
1. Define typed read-only tool registry with input/output schema, permission, scope, timeout, data classification.
2. Implement tools using existing application/domain query services, not raw SQL from LLM.
3. Normalize tool results and create evidence snapshots.
4. Define Copilot intents/use cases (capacity risk, overdue collection, weight anomaly, service alternatives, material routing).
5. Return structured findings, reasons, evidence, freshness, assumptions, limitations, risk.
6. Create ActionProposal lifecycle: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED/EXPIRED/STALE → EXECUTING → EXECUTED/FAILED.
7. Bind proposal to entity version and idempotency key.
8. On approval, re-check actor permission, destination scope, entity state, capacity, and hard rules.
9. Execute through existing domain service transaction only.
10. Append audit record with proposer, approver, executor, evidence, and resulting entity reference.
11. Add duplicate/replay/stale proposal tests.
12. Never expose write tool directly to model by default.

## Quality gate
- Mutation without explicit authorized approval = 0.
- Tool permission leakage = 0.
- Evidence coverage for consequential recommendations = 100%.
- Hard constraint violation = 0.

# PHASE 8 — HOSPITALITY, COMMUNITY, CIRCULAR & ENVIRONMENTAL INTELLIGENCE

## Goal
Build data-driven AI extensions only where their underlying records exist.

## Tasks
1. Verify hospitality organization, ledger, material and pickup models.
2. Distinguish verified/self-reported/estimated data in all reports.
3. Implement hospitality insights and period comparison from metric snapshots.
4. Community insight uses aggregated data and privacy suppression; no individual profiling.
5. Material matching service uses deterministic eligibility followed by explainable ranking.
6. DCLI formula remains deterministic and versioned.
7. Carbon calculator uses approved factors and documented boundaries only.
8. Generate reports from immutable metric snapshot; LLM writes narrative only.
9. Validate every numeric claim against snapshot fields.
10. Forecasting and advanced environmental signals remain feature-flagged until evaluation passes.

## Quality gate
- Organization/destination isolation = 0 leakage.
- Report numeric fidelity = 100% in fixtures.
- DCLI values reproducible from formula version and snapshot.
- No unsupported carbon/emission claims.

# PHASE 9 — AI EVALUATION, GOVERNANCE, SECURITY & MLOPS

## Goal
Make quality and risks measurable and continuously monitored.

## Tasks
1. Create dataset registry and evaluation runner.
2. Build EcoGuide locked test set and reviewer rubric.
3. Build Vision labeled set and data card.
4. Build Copilot scenario suite including prompt injection/tool misuse/unauthorized actions.
5. Build forecasting and material-match benchmark where applicable.
6. Create model cards and prompt version registry.
7. Add red-team tests based on OWASP GenAI risks: prompt injection, sensitive data disclosure, poisoning, improper output handling, excessive agency, vector/embedding weaknesses, misinformation, unbounded consumption; include agentic behavior/identity/tool risks.
8. Add drift, latency, provider error, cost, feedback, abstention, and correction dashboards/logs.
9. Implement version rollback and feature flags.
10. Define release tiers: research, demo, assisted, operational.
11. Document retention, data deletion, consent, and incident playbooks.
12. Run cross-destination access tests and PII redaction tests.

## Quality gate
- All locked evaluation suites run reproducibly.
- No P0 security finding.
- No unapproved mutation or cross-scope disclosure.
- Model/prompt version and evaluation report linked.

# PHASE 10 — API CONTRACT, PERFORMANCE & BACKEND HARDENING

## Goal
Make service reliable and maintainable under competition demonstration and controlled pilot.

## Tasks
1. Validate all new/changed routes against OpenAPI.
2. Generate typed response/request tests; avoid duplicated contract definitions.
3. Test API rate limits, provider timeouts, retry bounds, circuit breaker, and concurrency.
4. Verify object storage private access and expiry.
5. Validate SQL query performance/indexes on realistic demo data.
6. Run load test for AI and non-AI endpoints separately.
7. Measure per-capability p50/p95 latency, provider usage, cost per task, error rate.
8. Add job retry/dead-letter or equivalent failed-state visibility.
9. Test provider outage, vector store outage, queue failure, and DB transaction failure.
10. Preserve existing core domain behavior and test baseline.

## Quality gate
- Existing tests pass with no unexplained regression.
- API contract and migration checks pass.
- No silent mock success.
- Performance profile and known limits documented.

# PHASE 11 — END-TO-END SCENARIO & RELEASE VALIDATION

## Goal
Prove the complete Environmental Intelligence Loop.

## Required scenarios
1. Admin registers/approves/publishes a local SOP.
2. Resident asks EcoGuide; correct source is cited.
3. Resident uploads material photo; Vision suggests candidate and user confirms.
4. Staff/facility validates material using existing rules and verified weigh-in.
5. Facility capacity is updated; Copilot detects condition and creates proposal.
6. Admin reviews, approves, and domain service executes action once.
7. HOREKA period snapshot is analyzed and report generated with provenance.
8. Material match returns eligible partner or explicit no-match.
9. DCLI recalculates deterministically with snapshot version.
10. Provider outage/low evidence/unknown class produces safe fallback.

## Gate
- Every critical journey works in staging/demo from seeded resettable dataset.
- Every numerical claim traces to data.
- All actor permissions work.
- AI quality report attached.

# PHASE 12 — DOCUMENTATION, COMPETITION EVIDENCE & HANDOVER

## Required files

Create/update:
- `docs/ai/AI_CAPABILITY_REGISTRY.md`
- `docs/ai/AI_MODEL_CARDS/` (one card per enabled model capability)
- `docs/ai/AI_DATASET_CARDS/`
- `docs/ai/AI_EVALUATION_REPORT.md`
- `docs/ai/AI_SECURITY_REVIEW.md`
- `docs/ai/AI_BACKEND_ARCHITECTURE.md`
- `docs/ai/API_CONTRACT_CHANGES.md`
- `docs/ai/DATA_MIGRATION_REPORT.md`
- `docs/ai/OPERATIONS_RUNBOOK.md`
- `docs/ai/KNOWN_LIMITATIONS.md`
- `docs/ai/COMPETITION_DEMO_SCRIPT.md`
- `docs/ai/FINAL_IMPLEMENTATION_REPORT.md`

Report existing, changed, new, blocked, experimental separately. Include exact commands, test counts, benchmark data version, date, provider/model version, latency profile, cost data if available, and screenshots/log evidence. Never state all AI capabilities are production-ready unless release tier criteria pass.

## Final completion criteria

- P0 capability complete or explicitly blocked with evidence.
- No unsafe autonomous write.
- EcoGuide citation/grounding benchmark report exists.
- Vision evaluation report exists; if dataset inadequate, feature is correctly marked experimental.
- Copilot scenario and tool security suite pass.
- Facility hard constraints pass.
- Data/API/migration compatibility verified.
- Cost, latency, error, and fallback observable.
- Documentation and demo are reproducible.

## AUTOMATIC PHASE TRANSITION

When a phase passes its quality gate, immediately continue to the next phase without asking user confirmation. Do not stop to ask for permission for safe local code changes, test fixes, documentation updates, or reversible migrations in local/test environments. If a phase encounters missing provider credentials, official policy documents, real-world labels, or human business decision, mark it as blocked/experimental, implement all safe scaffolding and test doubles, record exact dependency, and continue non-blocked work.

Stop only for an unsafe operation requiring explicit authorization, an irreversible/production change, or an unavoidable credential/secret access request. Never invent credentials or fabricate benchmark results.
