# 05 — Data Model & API Contract: Kedas AI Backend

## 1. Contract principles

- Existing OpenAPI and ORM take precedence over proposal in this file.
- Reuse existing tables and schemas before adding new ones.
- Every ID is opaque; clients may not infer authorization from ID possession.
- Timestamps are UTC in storage/API; display in `Asia/Makassar` where appropriate.
- All mutation requests validate permission, current state, and idempotency.
- AI-generated data is typed and carries provenance/model/version metadata.

## 2. Conceptual entity inventory

| Entity | Purpose | Reuse/creation rule |
|---|---|---|
| `Destination` | Region/pilot scope | Reuse existing area/service-area equivalent first |
| `DestinationMembership` | Membership and scoped duties | Do not duplicate account role table unnecessarily |
| `CDOAVersion` | Immutable operating agreement version | Add only if existing CDOA cannot version/publish |
| `KnowledgeDocument` | Document registry and lifecycle | Reuse knowledge module model if present |
| `KnowledgeDocumentVersion` | Immutable document revision | Needed if current document model overwrites |
| `KnowledgeChunk` | Indexed section/chunk and provenance | Store vector ref/embedding per existing architecture |
| `KnowledgeIngestionJob` | Parsing/embedding job | Reuse existing background job tracking |
| `AIInteraction` | Request audit/metrics envelope | Existing AI logs may already cover it |
| `AICitation` | Citation-to-version/chunk link | Ensure exact version traceability |
| `AIFeedback` | Feedback and reviewer disposition | Keep feedback separate from gold labels |
| `VisionAssessment` | Image assessment, candidates, review | Store private object reference only |
| `VisionHumanReview` | Human correction and adjudication | Append-only review history |
| `ActionProposal` | Copilot proposed action lifecycle | Separate from the actual domain mutation |
| `MetricDefinition` | Metric formula/version/units | Version metric definitions |
| `MetricSnapshot` | Immutable scoped metric results | Source of reporting figures |
| `ForecastRun` | Prediction, horizon, data cutoff, model | Persist model and dataset version |
| `MaterialMatchRun` | Candidate set, filters, scores, explainability | Avoid storing sensitive buyer data outside scope |
| `ModelRegistryEntry` | Provider/model/prompt/schema metadata | May live in configuration/registry, not necessarily DB |

## 3. Suggested status enums

```text
KnowledgeDocumentStatus:
UPLOADED, VALIDATING, PARSING, CHUNKING, EMBEDDING,
PENDING_REVIEW, PUBLISHED, REJECTED, FAILED, EXPIRED, ARCHIVED

AIInteractionStatus:
RECEIVED, AUTHORIZED, PROCESSING, SUCCEEDED, PARTIAL,
ABSTAINED, FAILED, RATE_LIMITED, CANCELLED

VisionReviewStatus:
PENDING, ACCEPTED, CORRECTED, REJECTED, NEEDS_EXPERT_REVIEW

ActionProposalStatus:
DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, EXPIRED,
STALE, EXECUTING, EXECUTED, FAILED, CANCELLED

DataProvenance:
VERIFIED, SELF_REPORTED, ESTIMATED, SIMULATED, EXTERNAL_SOURCE
ForecastStatus:
READY, EXPERIMENTAL, INSUFFICIENT_DATA, FAILED, EXPIRED
```

Enums must map to existing naming conventions; do not create incompatible duplicate enums.

## 4. Key data constraints

- Document version unique within document; checksum captured.
- Published document revision immutable.
- Citation references an exact `document_version_id` and chunk ID.
- `ActionProposal` stores expected entity version/ETag to detect stale state.
- Idempotency key unique per actor/scope/action endpoint.
- Vision file references private object storage; access checked on each fetch.
- Metric snapshot records metric definition version, period, scope, source IDs, data coverage, freshness.
- Forecast records model version, training cutoff, horizon, granularity, feature version, evaluation result.
- Feedback cannot silently overwrite prediction output or gold annotation.
- Provenance field is mandatory for all reportable metric values.

## 5. API contracts — examples

These JSON bodies are illustrative contracts. Align property names, response envelope, pagination, and error conventions with existing API before implementing.

### 5.1 EcoGuide query

`POST /api/v1/ai/ecoguide/queries`

Request:
```json
{
  "question": "Bagaimana cara menangani minyak jelantah di kawasan ini?",
  "destination_id": "opaque-destination-id",
  "language": "id",
  "conversation_id": null,
  "client_context": {"surface": "resident_web"}
}
```

Response:
```json
{
  "interaction_id": "opaque-interaction-id",
  "status": "ANSWERED",
  "answer": "...",
  "citations": [
    {
      "citation_id": "cite-1",
      "document_id": "doc-1",
      "document_version_id": "docver-3",
      "title": "SOP Pengelolaan Minyak Jelantah",
      "section": "Penyerahan Material",
      "effective_from": "2026-01-01",
      "source_excerpt": "..."
    }
  ],
  "limitations": [],
  "context_version": "cdoa-v4",
  "generated_at": "2026-10-30T10:00:00Z"
}
```

### 5.2 Vision assessment

`POST /api/v1/ai/vision/assessments` — multipart upload or pre-authorized object reference, matching current upload architecture.

Response:
```json
{
  "assessment_id": "opaque-assessment-id",
  "status": "NEEDS_REVIEW",
  "taxonomy_version": "waste-taxonomy-1.2",
  "model_version": "vision-provider-model-x",
  "candidates": [
    {"category_id": "plastic_pet", "label": "Botol PET", "confidence_band": "HIGH"},
    {"category_id": "other_packaging", "label": "Kemasan lain", "confidence_band": "LOW"}
  ],
  "visible_attributes": ["transparent_container"],
  "handling_guidance": [],
  "requires_human_confirmation": true,
  "disclaimer": "Hasil AI adalah saran visual, bukan verifikasi penerimaan atau berat."
}
```

Do not show raw confidence score as calibrated probability unless calibration has been measured and documented.

### 5.3 Copilot analysis

`POST /api/v1/ai/copilot/analyses`

Request:
```json
{
  "destination_id": "opaque-destination-id",
  "question": "Fasilitas mana yang berisiko overload minggu ini?",
  "period": {"from": "2026-10-24", "to": "2026-10-30"}
}
```

Response:
```json
{
  "interaction_id": "opaque-interaction-id",
  "status": "SUCCEEDED",
  "summary": "...",
  "findings": [
    {
      "finding_id": "finding-1",
      "type": "CAPACITY_RISK",
      "severity": "MEDIUM",
      "entity_ref": "facility-1",
      "evidence_refs": ["metric-snapshot-1"],
      "as_of": "2026-10-30T09:00:00Z",
      "limitations": ["Kapasitas berdasarkan input operator terakhir."]
    }
  ],
  "recommendations": [],
  "mutations_performed": false
}
```

### 5.4 Action proposal

`POST /api/v1/ai/action-proposals`

```json
{
  "source_interaction_id": "opaque-interaction-id",
  "action_type": "RESCHEDULE_COLLECTION",
  "target_ref": "request-or-facility-id",
  "proposed_change": {"new_window": "2026-10-31T09:00:00+08:00"},
  "reason": "...",
  "evidence_refs": ["metric-snapshot-1"],
  "expected_entity_version": 12,
  "idempotency_key": "client-generated-unique-key"
}
```

Approval is a separate authenticated endpoint. On approval, re-fetch entity and re-run all rules. Never trust values stored only in model output.

### 5.5 Forecast

`GET /api/v1/ai/facilities/{facility_id}/capacity-forecast?days=7&granularity=day`

Response:
```json
{
  "status": "INSUFFICIENT_DATA",
  "facility_id": "opaque-facility-id",
  "horizon": 7,
  "granularity": "day",
  "training_cutoff": null,
  "model_version": null,
  "baseline_metrics": null,
  "prediction": [],
  "limitations": ["Riwayat data belum memenuhi minimum backtest."]
}
```

### 5.6 Material matching

`POST /api/v1/ai/material-matches`

Response contains only candidates that passed hard filters. Each candidate includes `eligible=true`, `eligibility_reasons`, `rank_features`, `data_as_of`, quantity and unit, quote status and expiry. If none qualify: `status=NO_MATCH`, empty candidate list, and reason codes.

### 5.7 Report generation

`POST /api/v1/ai/reports`

Input must reference a saved metric snapshot ID and approved report template. Response contains report ID, narrative, metric references, validation status, caveats, and approval/publication status. It must not accept arbitrary numeric values from browser as source truth.

## 6. Error contract

Use current project envelope; normalize codes conceptually:

- `AI_PROVIDER_UNAVAILABLE`
- `AI_RATE_LIMITED`
- `AI_OUTPUT_INVALID`
- `AI_SCOPE_FORBIDDEN`
- `AI_INSUFFICIENT_EVIDENCE`
- `AI_INSUFFICIENT_DATA`
- `DOCUMENT_NOT_PUBLISHABLE`
- `IMAGE_INVALID`
- `VISION_NEEDS_REVIEW`
- `ACTION_PROPOSAL_STALE`
- `ACTION_APPROVAL_REQUIRED`
- `NO_ELIGIBLE_FACILITY`
- `NO_MATERIAL_MATCH`

Errors must not disclose prompts, API keys, private document content, or provider raw exception details.

## 7. Event contracts

Use domain events only if the existing system already supports them or an ADR justifies implementation. Suggested event names:

- `knowledge.document.registered`
- `knowledge.document.published`
- `knowledge.document.expired`
- `ai.interaction.completed`
- `ai.vision.reviewed`
- `ai.action_proposal.created`
- `ai.action_proposal.approved`
- `ai.action_proposal.executed`
- `facility.capacity.updated`
- `material.batch.handed_over`
- `analytics.snapshot.created`

Events must contain IDs and metadata, not large images, full prompts, or unnecessary PII.

## 8. Migration checklist

1. Inspect ORM and Alembic heads.
2. Map each conceptual entity to existing table.
3. Confirm foreign keys and unique constraints.
4. Create migration only for missing structures.
5. Test migration upgrade and downgrade where safe.
6. Test existing database snapshot copy.
7. Verify indexes/query plans, including vector filter behavior if used.
8. Verify privacy cleanup and retention behavior.
9. Record ADR and rollback path.
