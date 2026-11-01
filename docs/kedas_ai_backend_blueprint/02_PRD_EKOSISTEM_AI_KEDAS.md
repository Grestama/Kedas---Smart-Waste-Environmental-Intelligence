# 02 — Product Requirements Document: Kedas AI Ecosystem

## 0. Document control

| Field | Value |
|---|---|
| Product | Kedas |
| Product type | AI-powered web platform |
| Scope | AI capabilities + backend services; frontend hanya memakai API contract |
| Primary domain | Community & Green Tourism waste intelligence |
| Version | 1.0 blueprint |
| Date | 30 October 2026 |
| Status | Proposed target requirements; verify current repository first |

### 0.1 Requirement status

- `EV`: existing verified by source and tests.
- `EP`: existing partial.
- `NP0`: new must-have for core AI web demonstration.
- `NP1`: next release after P0.
- `FP2`: future capability dependent on data or external partner.

Status tidak boleh disimpulkan dari nama halaman atau dokumen saja.

## 1. Product opportunity

Kedas membantu stakeholder kawasan wisata membuat keputusan pengelolaan sampah melalui tiga hal: pengetahuan lokal yang dapat ditelusuri, pemahaman material berbasis visual, dan rekomendasi operasional yang terhubung dengan data nyata. Backend menyediakan konteks bersama, deterministic domain services, model/provider abstraction, evaluation, dan audit.

## 2. Target users and jobs-to-be-done

| Persona | Job | AI value | Human authority |
|---|---|---|---|
| Resident | Mengetahui cara memilah dan tujuan material | EcoGuide/Vision | Warga mengonfirmasi kondisi; petugas/fasilitas menetapkan penerimaan |
| Field staff | Memahami instruksi dan anomali data | Vision assist, route/workload suggestion | Petugas mengesahkan grading/timbang/status |
| Facility operator | Memantau kapasitas dan material | Forecast, Copilot, composition analysis | Operator menetapkan kapasitas dan keputusan fasilitas |
| Hospitality manager | Memahami tren dan mengurangi residu | Waste analytics, report generator | Manajer menyetujui data self-reported |
| Community coordinator | Menjalankan program berbasis kebutuhan | EcoGuide, community insight | Pengurus menyetujui program |
| Destination admin | Menetapkan CDOA dan monitoring | Copilot, DCLI narrative | Admin menerbitkan aturan dan menyetujui action |
| Tourist/guest | Memahami etika dan panduan lokal | Guest EcoGuide | Informasi final mengikuti sumber resmi yang dipublikasikan |
| Recycler/buyer | Menemukan pasokan yang memenuhi spesifikasi | Material matching | Pembeli menyetujui sampel, grade, harga, dan kontrak |

## 3. Product outcomes

1. Pengguna mendapat jawaban kawasan yang mempunyai sumber dan tanggal berlaku.
2. Vision membantu mengurangi kebingungan pemilahan, tanpa menggantikan inspeksi petugas.
3. Copilot memperpendek langkah analisis ke action proposal, tetapi tidak mengubah data tanpa approval.
4. Fasilitas mendapat peringatan dan forecast hanya ketika data memadai.
5. HOREKA memperoleh analisis yang membedakan data terverifikasi dengan self-reported.
6. Material yang dipasangkan ke pembeli memenuhi hard eligibility filters.
7. Laporan lingkungan dapat ditelusuri ke metric snapshot.

## 4. Scope

### In scope

- Provider-agnostic AI gateway/adapter.
- Destination context service.
- Knowledge ingestion, review, publication, retrieval, and citation validation.
- EcoGuide API.
- Vision inference and human-review workflow.
- Copilot read-only tools and action proposal lifecycle.
- Facility eligibility and capacity intelligence.
- Hospitality/community insight APIs.
- Circular material matching.
- DCLI/metric snapshot and evidence-based report generation.
- AI evaluation, observability, cost tracking, feature flags, and governance.

### Out of scope for initial competition build

- Unrestricted autonomous agent with database write access.
- Full real-time sensor/IoT fleet integration.
- Automatic legal/compliance certification.
- Guaranteed carbon-credit or regulatory reporting certification.
- Medical/chemical identification of hazardous waste from a photo.
- Province-wide routing optimization without validated map and operational data.
- Training foundation model from scratch.

## 5. AI capability requirements

### 5.1 EcoGuide

- Must retrieve only published knowledge within user's visible scope.
- Must include source title, version/effective date, and cited section/page if available.
- Must distinguish current rule, historical rule, recommendation, and general educational content.
- Must abstain when retrieval is weak, conflicting, stale, or unavailable.
- Must support Indonesian and English; additional Balinese/local phrases only when curated/tested.
- Must log query scope and source IDs, not unnecessary PII.

### 5.2 Vision

- Must support approved image type/size constraints.
- Must return allowed taxonomy candidates, confidence band, and review state.
- Must expose uncertainty/unknown class.
- Must map prediction to destination acceptance rules without asserting guaranteed acceptance.
- Must allow user correction and record correction separately from model output.
- Must never calculate verified weight or final waste hazard status from a photo.

### 5.3 Operations Copilot

- Must obtain context through typed read-only tools.
- Must return evidence-backed recommendations with assumptions and data freshness.
- Must generate a draft proposal with explicit affected entity and expected change.
- Must validate policy and current entity state immediately before execution.
- Must require approval from authorized role for every consequential mutation.
- Must prevent duplicate action via idempotency and proposal status.
- Must retain who proposed, who approved, who executed, and what changed.

### 5.4 Forecasting

- Must compare candidate model to simple baseline.
- Must use time-based/rolling-origin validation.
- Must expose prediction interval/uncertainty when model supports it.
- Must refuse to produce operational forecast when data sufficiency gate fails.
- Must separate actual, forecast, and scenario values visually/API-wise.

### 5.5 Matching and optimization

- Hard constraints are implemented in deterministic code.
- AI/ML may score/rank only eligible candidates.
- No match is a valid outcome.
- All ranking features/weights and data freshness must be traceable.
- User can inspect why each candidate ranks where it does.

### 5.6 Analytics and reporting

- DCLI/mass balance/carbon calculation uses versioned deterministic definitions.
- AI narrative consumes immutable metric snapshot.
- Each report shows source period, provenance, data coverage, caveats, and generated timestamp.
- Unsupported numerical claims fail validation.

## 6. User journeys

### J-01 Ask a local sorting question

Guest/resident → select destination → ask question → resolve scope → retrieve published knowledge → answer with citations → inspect source → submit feedback.

Success: answer grounded, scope correct, citation valid, or explicit abstention.

### J-02 Identify material from image

Resident → upload photo → consent/notice → validation → Vision candidate → destination rule lookup → display confidence and handling guidance → user confirms/corrects → optional save to deposit workflow.

Success: valid prediction schema, uncertainty handled, no false verified status.

### J-03 Resolve facility overload

Operator → open Copilot → ask about overload → Copilot reads allowed metrics → detects issue → proposes alternatives → hard eligibility check → admin reviews draft → approves → domain service executes → audit and metric snapshot update.

Success: zero hard-constraint violation; no unauthorized mutation.

### J-04 HOREKA monthly review

Manager → select reporting period → view actual/self-reported split → analyze categories/trend → receive reduction suggestions → generate report → review and export.

Success: every metric has provenance; narrative does not invent data.

### J-05 Find circular buyer

Facility → choose available batch → run deterministic eligibility → rank eligible buyer demand → view explanation and freshness → request quotation → human negotiation → confirmed handover.

Success: no ineligible buyer shown as valid match.

## 7. Non-functional product objectives

- API and AI features are independently degradable.
- No provider failure blocks normal non-AI transactions.
- Every AI feature has evaluation dataset and release gate.
- Every model/provider version change is recorded.
- PII is minimized and scope enforced at retrieval and tool layer.
- AI answer time, cost, failure, and user feedback are measurable.

## 8. Product metrics

North Star: **Verified material events with complete provenance per active destination-period.**

| Metric | Definition | Segment |
|---|---|---|
| Grounded answer rate | sampled answers meeting grounding rubric / sampled answer | capability, language, destination |
| Citation precision | citations valid and supportive / citations sampled | document type, version |
| Correct abstention | unsupported queries safely abstained / unsupported queries | query class |
| Vision macro-F1 | macro average per-class F1 on locked holdout | class, lighting, image source |
| Vision correction rate | human-corrected suggestions / reviewed suggestions | class, confidence band |
| Copilot evidence coverage | recommendations with verified source references / recommendations | action type |
| Hard constraint violation | executed or proposed ineligible action count | action type |
| Proposal completion | approved proposals executed successfully / approved proposals | destination, role |
| Forecast WAPE/MAE | rolling-origin error | horizon, facility, category |
| Match validity | displayed top-k candidate satisfying all hard filters | category, buyer |
| Report numeric fidelity | checked generated figures matching snapshot | report type |
| AI cost per outcome | provider cost / successful AI-assisted task | feature, model |

## 9. Proposed initial acceptance thresholds

These are **provisional gates** to be tuned after the baseline benchmark. They are not claims of current performance.

| Capability | Proposed initial gate |
|---|---|
| EcoGuide retrieval | Recall@5 ≥ 0.85 on locked benchmark |
| EcoGuide citations | Citation precision ≥ 0.95; unsupported citation = 0 on release suite |
| EcoGuide answer | Groundedness ≥ 0.90 on reviewed benchmark; abstention correctness ≥ 0.90 |
| Vision | Macro-F1 ≥ 0.80 on representative holdout before limited pilot; per-class precision thresholds set based on harm/risk |
| Vision safety | Hazard-sensitive/unknown sample incorrectly labeled as ordinary safe material = 0 on release suite |
| Copilot | Hard constraint violation = 0; mutation without approval = 0; evidence coverage = 100% for consequential recommendations |
| Forecast | Must beat naive baseline by ≥10% on agreed rolling backtest before operational display; otherwise show historical data only |
| Material matching | Ineligible candidates in result = 0; every ranking has explanation and as-of timestamp |
| Reports | Numeric consistency with snapshot = 100% for release test cases |

## 10. Product release phases

1. AI governance and context baseline.
2. Knowledge management and EcoGuide.
3. Vision benchmark and safe integration.
4. Copilot tools, proposal lifecycle, and facility intelligence.
5. Hospitality/community/circular analytics.
6. Evaluation, security, demo narrative, and controlled pilot readiness.

## 11. Dependencies and product risks

| Risk | Impact | Mitigation |
|---|---|---|
| Local SOP not approved | Incorrect advice | Hold publication; show no local answer. |
| Low-quality labels | Misleading Vision metrics | Review protocol and annotator agreement. |
| Insufficient time series | Bad forecasts | Baseline-only; no model claim. |
| Facility capacity stale | Invalid recommendation | Freshness gate and revalidation. |
| LLM hallucination | Wrong action/information | Schema, evidence, abstention, human review. |
| AI cost spike | Service instability | Rate limits, budgets, caching, quotas. |
| Scope leakage | Privacy incident | Pre-retrieval authorization and isolation tests. |

## 12. Acceptance summary

Kedas memenuhi target AI product bila P0 capabilities dapat diperagakan end-to-end, memiliki evidence dan metrics, seluruh action penting melewati permission/approval, tidak ada klaim yang tidak didukung, dan seluruh limitasi dinyatakan secara terbuka.
