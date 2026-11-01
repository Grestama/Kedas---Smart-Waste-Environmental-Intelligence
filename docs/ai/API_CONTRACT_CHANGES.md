# Kedas AI — API Contract Changes & Route Inventory

Laporan ini mendokumentasikan spesifikasi kontrak API untuk seluruh rute AI dan integrasi backend terkait.

---

## 1. Rute AI Terverifikasi (`/api/v1/ai/*`)

### `POST /api/v1/ai/ecoguide`
- **Tujuan:** Tanya jawab berbasis RAG grounded terhadap dokumen SOP kawasan.
- **Izin:** Publik / Warga Terdaftar (`get_optional_current_user`).
- **Request Body (`EcoGuideQueryRequest`):**
  - `question`: string (wajib, max 500 karakter).
  - `destination_id`: string (opsional, UUID service area).
  - `user_language`: string (`"id"` | `"en"`, default `"id"`).
  - `conversation_context`: string (opsional).
- **Response (`EcoGuideResponse`):**
  - `answer`: string (jawaban grounded).
  - `status`: string (`"SUCCESS"` | `"INSUFFICIENT_CONTEXT"` | `"BLOCKED_BY_SAFETY_FILTER"`).
  - `confidence_level`: string (`"HIGH"` | `"MEDIUM"` | `"LOW"`).
  - `citations`: list of `CitationReference` (`chunk_id`, `document_title`, `snippet`, `source_type`).
  - `suggested_action`: string (opsional).

### `POST /api/v1/ai/vision/analyze`
- **Tujuan:** Analisis citra material sampah untuk panduan pemilahan awal.
- **Izin:** Publik / Warga Terdaftar.
- **Request Form-Data:**
  - `file`: UploadFile (JPEG, PNG, WEBP, maks 10 MB).
  - `destination_id`: string (opsional).
- **Response (`VisionAnalyzeResponse`):**
  - `request_id`: string (UUID).
  - `top_candidate`: `VisionCandidateSchema` (`category_code`, `category_name`, `confidence_band`, `confidence_score`, `preparation_instructions`, `is_accepted_in_area`).
  - `candidates`: list of `VisionCandidateSchema`.
  - `detected_material_description`: string.
  - `ambiguity_flag`: boolean.
  - `human_review_required`: boolean.

### `POST /api/v1/ai/copilot`
- **Tujuan:** Rekomendasi diagnosis dan draft proposal operasional untuk operator.
- **Izin:** Petugas / Fasilitas / Admin (`RequireRole("ADMIN", "FACILITY_OPERATOR", "DISPATCHER", "COMMUNITY_LEADER", "PARTNER")`).
- **Request Body (`CopilotQueryRequest`):**
  - `intent`: string (`"PRIORITIZE_TASKS"` | `"FIND_ELIGIBLE_FACILITY"` | `"ANOMALY_SUMMARY"`).
  - `destination_id`: string (opsional).
  - `time_horizon_hours`: integer (opsional, default 24).
- **Response (`CopilotResponse`):**
  - `summary`: string.
  - `diagnostics`: list of string.
  - `provenance`: string (`"VERIFIED"` | `"ESTIMATED"`).
  - `recommendations`: list of `OperationRecommendationSchema`.
  - `action_proposals`: list of `ActionProposalPayload` (`proposal_id`, `action_type`, `target_entity_id`, `description`, `required_role`, `status`).

### `POST /api/v1/ai/copilot/execute`
- **Tujuan:** Otorisasi dan eksekusi proposal tindakan oleh admin berwenang.
- **Izin:** Admin / Operator Berwenang.
- **Request Body (`ActionProposalExecuteRequest`):**
  - `proposal_id`: string.
  - `action_type`: string (`"DISPATCH_TRIKE"` | `"REROUTE_TO_TPS3R"` | `"FLAG_INSPECTION"`).
  - `target_entity_id`: string.
  - `confirmed_by_admin`: boolean (wajib `True`).
- **Response (`ActionProposalExecuteResponse`):**
  - `success`: boolean.
  - `execution_timestamp`: datetime UTC.
  - `mutation_result`: string.
  - `audit_log_id`: string.

### `POST /api/v1/ai/feedback`
- **Tujuan:** Pencatatan umpan balik bintang dan komentar pengguna terhadap respons AI.
- **Izin:** Publik / Warga.
- **Request Body:** `target_id`, `rating` (`"UPVOTE"` | `"DOWNVOTE"`), `comment`.

### `GET /api/v1/ai/health`
- **Tujuan:** Endpoint monitoring status kesiapan AI adapter dan rata-rata latensi inferensi.
