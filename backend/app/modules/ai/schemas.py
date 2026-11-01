"""Kedas — AI Foundation, Knowledge Base & Interaction Pydantic Schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.modules.ai.models import KnowledgeDocumentStatus, KnowledgeSourceType


class CitationSchema(BaseModel):
    id: str
    source_id: str
    title: str
    section: str | None = None
    excerpt: str
    cdoa_version: str | None = None
    url: str | None = None


class KnowledgeChunkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str
    chunk_index: int
    section_title: str | None = None
    content: str
    token_count: int


class KnowledgeDocumentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    source_type: KnowledgeSourceType = KnowledgeSourceType.SOP
    destination_id: str | None = None
    organization_id: str | None = None
    cdoa_id: str | None = None
    is_public: bool = True
    version: str = "1.0"
    content_raw: str = Field(
        min_length=10, description="Raw markdown or text content to be chunked"
    )


class KnowledgeDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    source_type: str
    destination_id: str | None = None
    organization_id: str | None = None
    cdoa_id: str | None = None
    is_public: bool
    version: str
    status: str
    checksum: str
    total_chunks: int
    created_by: str
    created_at: datetime
    updated_at: datetime


class KnowledgeDocumentDetailResponse(KnowledgeDocumentResponse):
    chunks: list[KnowledgeChunkResponse] = Field(default_factory=list)


class KnowledgeDocumentStatusUpdate(BaseModel):
    status: KnowledgeDocumentStatus


class KnowledgeSearchQuery(BaseModel):
    query: str = Field(min_length=2)
    destination_id: str | None = None
    organization_id: str | None = None
    limit: int = Field(default=4, ge=1, le=10)


# ==============================================================================
# EcoGuide (RAG Assistant) Schemas
# ==============================================================================


class EcoGuideQueryRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    destination_id: str | None = None
    user_language: str = Field(default="id", pattern="^(id|en)$")
    session_id: str | None = None


class EcoGuideResponse(BaseModel):
    answer: str
    status: str = "SUCCESS"  # SUCCESS, INSUFFICIENT_CONTEXT, CONFLICTING_SOURCES, DEGRADED_FALLBACK
    destination_name: str | None = None
    cdoa_version: str | None = None
    citations: list[CitationSchema] = Field(default_factory=list)
    abstain_reason: str | None = None
    suggested_action: str | None = None
    contact_channel: str | None = None
    confidence_level: str = "HIGH"
    provider: str
    fallback_used: bool = False
    detected_intent: str | None = None
    language_used: str = "id"
    log_id: str | None = None
    disclaimer: str = (
        "Jawaban Kedas EcoGuide dirumuskan secara asistif berdasarkan SOP dan aturan kawasan yang tervalidasi. "
        "Bukan merupakan otorisasi transaksi atau ketetapan hukum formal."
    )


class AIFeedbackRequest(BaseModel):
    interaction_id: str | None = None
    log_id: str | None = None
    rating: str = Field(pattern="^(THUMBS_UP|THUMBS_DOWN|HELPFUL|UNHELPFUL)$")
    comment: str | None = Field(default=None, max_length=500)

    @property
    def target_id(self) -> str:
        return self.log_id or self.interaction_id or ""


class AIFeedbackResponse(BaseModel):
    success: bool
    message: str


# ==============================================================================
# Kedas Vision Schemas
# ==============================================================================


class VisionCandidateSchema(BaseModel):
    category_code: str
    category_name: str
    confidence_band: str  # HIGH, MEDIUM, NEEDS_REVIEW
    confidence_score: float  # 0.0 - 1.0
    preparation_instructions: str | None = None
    is_accepted_in_area: bool | None = None


class VisionAnalyzeResponse(BaseModel):
    candidates: list[VisionCandidateSchema]
    top_candidate: VisionCandidateSchema
    detected_material_description: str
    ambiguity_flag: bool = False
    human_review_required: bool = False
    warning: str | None = None
    provider: str
    fallback_used: bool = False
    disclaimer: str = (
        "Hasil identifikasi visual merupakan saran kategorisasi awal. Berat aktual, penentuan kontaminasi, "
        "dan kelayakan penerimaan akhir sepenuhnya ditentukan saat penimbangan fisik oleh petugas/fasilitas."
    )


# ==============================================================================
# Kedas Operations Copilot Schemas
# ==============================================================================


class CopilotQueryRequest(BaseModel):
    intent: str = Field(
        description="e.g. PRIORITIZE_TASKS, FIND_ELIGIBLE_FACILITY, ANOMALY_SUMMARY, METRIC_NARRATIVE"
    )
    destination_id: str | None = None
    category_id: str | None = None
    estimated_weight_kg: float | None = None
    query_text: str | None = None


class ActionProposalPayload(BaseModel):
    action_type: str  # ADJUST_SERVICE_SLOT, CREATE_STAFF_TASK, PROPOSE_ALTERNATE_FACILITY
    title: str
    description: str
    target_id: str | None = None
    service_area_id: str | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)


class ActionProposalExecuteRequest(BaseModel):
    proposal: ActionProposalPayload
    user_notes: str | None = None


class ActionProposalExecuteResponse(BaseModel):
    success: bool
    action_type: str
    audit_id: str
    message: str
    target_id: str | None = None
    before_state: dict[str, Any] = Field(default_factory=dict)
    after_state: dict[str, Any] = Field(default_factory=dict)
    executed_at: datetime


class OperationRecommendationSchema(BaseModel):
    id: str
    title: str
    rationale: str
    priority: str  # HIGH, MEDIUM, LOW
    constraints_checked: list[str] = Field(default_factory=list)
    suggested_action_label: str
    target_url: str | None = None
    metric_snapshot: dict[str, float | int | str] | None = None
    action_proposal: ActionProposalPayload | None = None


class CopilotResponse(BaseModel):
    summary: str
    recommendations: list[OperationRecommendationSchema] = Field(default_factory=list)
    data_snapshot: dict[str, float | int | str] | None = None
    provenance: str = "VERIFIED"
    provider: str
    fallback_used: bool = False
    disclaimer: str = (
        "Rekomendasi Copilot bersifat read-only berdasarkan data snapshot operasional saat ini. "
        "Tidak ada perubahan status, penugasan, atau alokasi stok yang dilakukan secara otomatis."
    )


# ==============================================================================
# Interaction Logs & Governance Schemas
# ==============================================================================


class AIProviderHealthResponse(BaseModel):
    provider_name: str
    is_active: bool
    status: str  # OPERATIONAL, DEGRADED, OFFLINE
    fallback_available: bool = True
    total_requests_logged: int
    fallback_count: int
    average_latency_ms: float
