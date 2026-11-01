"""Kedas — AI Web Innovation API Endpoints: EcoGuide, Vision & Operations Copilot."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole, get_optional_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.ai import service as ai_service
from app.modules.ai.adapter import ai_adapter
from app.modules.ai.context_resolver import ContextResolver
from app.modules.ai.knowledge import (
    approve_knowledge_document,
    delete_knowledge_document,
    expire_knowledge_document,
    get_knowledge_document,
    ingest_document,
    list_knowledge_documents,
    reject_knowledge_document,
    supersede_knowledge_document,
    update_knowledge_document_status,
)
from app.modules.ai.schemas import (
    ActionProposalExecuteRequest,
    ActionProposalExecuteResponse,
    AIFeedbackRequest,
    AIFeedbackResponse,
    AIProviderHealthResponse,
    ConversationCreateRequest,
    ConversationDetailResponse,
    ConversationResponse,
    CopilotQueryRequest,
    CopilotResponse,
    EcoGuideQueryRequest,
    EcoGuideResponse,
    KnowledgeApproveRequest,
    KnowledgeDocumentCreate,
    KnowledgeDocumentDetailResponse,
    KnowledgeDocumentResponse,
    KnowledgeDocumentStatusUpdate,
    KnowledgeExpireRequest,
    KnowledgeRejectRequest,
    KnowledgeSupersedeRequest,
    VisionAnalyzeResponse,
)
from app.modules.ai.tools import LiveDataToolRegistry

router = APIRouter(prefix="/ai", tags=["AI Innovation: EcoGuide, Vision & Operations Copilot"])

require_admin = RequireRole("ADMIN")
require_operator = RequireRole(
    "ADMIN", "FACILITY_OPERATOR", "DISPATCHER", "COMMUNITY_LEADER", "PARTNER"
)


@router.post(
    "/ecoguide",
    response_model=EcoGuideResponse,
    summary="[Publik & Warga] Tanya Kedas EcoGuide dengan sitasi dokumen kawasan",
)
async def ask_ecoguide(
    req: EcoGuideQueryRequest,
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> EcoGuideResponse:
    is_public = user is None
    return ai_service.query_ecoguide(db, req, user=user, is_public=is_public)


@router.post(
    "/conversations",
    response_model=ConversationResponse,
    status_code=201,
    summary="[Semua Aktor] Buat thread percakapan baru EcoGuide",
)
async def create_new_conversation(
    req: ConversationCreateRequest,
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ConversationResponse:
    conv = ai_service.create_conversation(
        db, user=user, title=req.title, destination_id=req.destination_id
    )
    return ConversationResponse.model_validate(conv)


@router.get(
    "/conversations",
    response_model=list[ConversationResponse],
    summary="[Pengguna/Tamu] Daftar percakapan aktif milik pengguna",
)
async def list_user_conversations(
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[ConversationResponse]:
    convs = ai_service.list_conversations(db, user=user)
    return [ConversationResponse.model_validate(c) for c in convs]


@router.get(
    "/conversations/{id}",
    response_model=ConversationDetailResponse,
    summary="[Pengguna/Tamu] Ambil riwayat percakapan beserta seluruh pesan turn-nya",
)
async def get_conversation_detail(
    id: str,
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ConversationDetailResponse:
    conv = ai_service.get_conversation(db, conversation_id=id, user=user)
    return ConversationDetailResponse.model_validate(conv)


@router.patch(
    "/conversations/{id}/archive",
    response_model=ConversationResponse,
    summary="[Pengguna/Tamu] Arsipkan thread percakapan",
)
async def archive_user_conversation(
    id: str,
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ConversationResponse:
    conv = ai_service.archive_conversation(db, conversation_id=id, user=user)
    return ConversationResponse.model_validate(conv)


@router.delete(
    "/conversations/{id}",
    status_code=204,
    summary="[Pengguna/Tamu] Hapus thread percakapan",
)
async def delete_user_conversation(
    id: str,
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> None:
    ai_service.delete_conversation(db, conversation_id=id, user=user)


@router.post(
    "/vision/analyze",
    response_model=VisionAnalyzeResponse,
    summary="[Warga/Tamu] Analisis foto material sampah untuk saran pemilahan",
)
async def analyze_vision_image(
    file: Annotated[UploadFile, File(description="Foto material sampah (JPEG, PNG, WEBP)")],
    destination_id: Annotated[str | None, Form()] = None,
    user: Annotated[User | None, Depends(get_optional_current_user)] = None,
    db: Annotated[Session, Depends(get_db_session)] = None,  # type: ignore[assignment]
) -> VisionAnalyzeResponse:
    content = await file.read()
    mime = file.content_type or "image/jpeg"
    user_id = user.id if user else None
    return ai_service.analyze_material_image(
        db, image_bytes=content, mime_type=mime, destination_id=destination_id, user_id=user_id
    )


@router.post(
    "/copilot",
    response_model=CopilotResponse,
    summary="[Operator/Admin] Rekomendasi keputusan operasional berbasis data riil",
)
async def query_operations_copilot(
    req: CopilotQueryRequest,
    actor: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CopilotResponse:
    return ai_service.query_operations_copilot(db, req, actor=actor)


@router.post(
    "/copilot/execute",
    response_model=ActionProposalExecuteResponse,
    summary="[Operator/Admin] Konfirmasi dan eksekusi proposal tindakan Copilot (GAP-002)",
)
@router.post(
    "/action-proposal/execute",
    response_model=ActionProposalExecuteResponse,
    summary="[Terautentikasi] Konfirmasi dan eksekusi proposal tindakan asistif AI",
)
async def execute_copilot_proposal(
    req: ActionProposalExecuteRequest,
    actor: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ActionProposalExecuteResponse:
    return ai_service.execute_action_proposal(db, req=req, actor=actor)


# ==============================================================================
# Allowlisted Read-Only Live Data Tools
# ==============================================================================


@router.get(
    "/tools/pickup-status",
    summary="[Warga Terautentikasi] Live status tiket penjemputan aktif milik user",
)
async def get_live_pickup_status(
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    server_ctx = ContextResolver.resolve(db, user=user)
    return LiveDataToolRegistry.get_own_pickup_status(db, server_ctx)


@router.get(
    "/tools/wastepoints",
    summary="[Warga Terautentikasi] Live saldo WastePoints dan mutasi ledger milik user",
)
async def get_live_wastepoints(
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    server_ctx = ContextResolver.resolve(db, user=user)
    return LiveDataToolRegistry.get_own_wastepoints_balance(db, server_ctx)


@router.get(
    "/tools/facility-capacity",
    summary="[Petugas/Admin] Status kapasitas dan kesiapan TPS3R kawasan",
)
async def get_live_facility_capacity(
    user: Annotated[User | None, Depends(get_optional_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
    facility_id: str | None = None,
) -> dict[str, Any]:
    server_ctx = ContextResolver.resolve(db, user=user)
    return LiveDataToolRegistry.get_facility_capacity(db, server_ctx, facility_id=facility_id)


@router.get(
    "/tools/cdoa-info",
    summary="[Publik/User] Informasi perjanjian CDOA dan saluran eskalasi kawasan aktif",
)
async def get_live_cdoa_info(
    destination_id: str | None = None,
    user: Annotated[User | None, Depends(get_optional_current_user)] = None,
    db: Annotated[Session, Depends(get_db_session)] = None,  # type: ignore[assignment]
) -> dict[str, Any]:
    server_ctx = ContextResolver.resolve(db, user=user, client_destination_hint=destination_id)
    return LiveDataToolRegistry.get_cdoa_agreement_info(db, server_ctx)


@router.get(
    "/tools/service-directory",
    summary="[Publik] Direktori kawasan layanan aktif",
)
async def get_live_service_directory(
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    server_ctx = ContextResolver.resolve(db, user=None)
    return LiveDataToolRegistry.get_service_directory(db, server_ctx)


@router.post(
    "/knowledge",
    response_model=KnowledgeDocumentResponse,
    status_code=201,
    summary="[Admin] Daftarkan dan lakukan chunking dokumen SOP/regulasi kawasan",
)
async def create_knowledge_document(
    req: KnowledgeDocumentCreate,
    actor: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> KnowledgeDocumentResponse:
    doc = ingest_document(db, req, created_by=actor.id)
    return KnowledgeDocumentResponse.model_validate(doc)


@router.get(
    "/knowledge",
    response_model=list[KnowledgeDocumentResponse],
    summary="[Operator/Admin] Daftar dokumen pengetahuan, SOP, dan CDOA",
)
async def list_knowledge(
    actor: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
    destination_id: str | None = None,
    source_type: str | None = None,
    status: str | None = None,
    authority_class: str | None = None,
    tag: str | None = None,
) -> list[KnowledgeDocumentResponse]:
    docs = list_knowledge_documents(
        db,
        destination_id=destination_id,
        source_type=source_type,
        status=status,
        authority_class=authority_class,
        tag=tag,
    )
    return [KnowledgeDocumentResponse.model_validate(d) for d in docs]


@router.get(
    "/knowledge/{id}",
    response_model=KnowledgeDocumentDetailResponse,
    summary="[Operator/Admin] Detail dokumen pengetahuan dan chunking-nya",
)
async def get_knowledge_detail(
    id: str,
    actor: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> KnowledgeDocumentDetailResponse:
    doc = get_knowledge_document(db, doc_id=id)
    return KnowledgeDocumentDetailResponse.model_validate(doc)


@router.post(
    "/knowledge/{id}/approve",
    response_model=KnowledgeDocumentResponse,
    summary="[Admin] Setujui (Approve) dokumen pengetahuan untuk diterbitkan ke runtime EcoGuide",
)
async def approve_knowledge(
    id: str,
    req: KnowledgeApproveRequest,
    actor: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> KnowledgeDocumentResponse:
    actor_email = actor.email or actor.id
    doc = approve_knowledge_document(db, doc_id=id, approver_email=actor_email, notes=req.notes)
    return KnowledgeDocumentResponse.model_validate(doc)


@router.post(
    "/knowledge/{id}/reject",
    response_model=KnowledgeDocumentResponse,
    summary="[Admin] Tolak (Reject) dokumen pengetahuan dengan alasan wajib",
)
async def reject_knowledge(
    id: str,
    req: KnowledgeRejectRequest,
    actor: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> KnowledgeDocumentResponse:
    actor_email = actor.email or actor.id
    doc = reject_knowledge_document(db, doc_id=id, rejector_email=actor_email, reason=req.reason)
    return KnowledgeDocumentResponse.model_validate(doc)


@router.post(
    "/knowledge/{id}/expire",
    response_model=KnowledgeDocumentResponse,
    summary="[Admin] Tandai dokumen sebagai kedaluwarsa (Expired)",
)
async def expire_knowledge(
    id: str,
    req: KnowledgeExpireRequest,
    actor: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> KnowledgeDocumentResponse:
    actor_email = actor.email or actor.id
    doc = expire_knowledge_document(db, doc_id=id, actor_email=actor_email, reason=req.reason)
    return KnowledgeDocumentResponse.model_validate(doc)


@router.post(
    "/knowledge/{id}/supersede",
    response_model=KnowledgeDocumentResponse,
    summary="[Admin] Tandai dokumen lama sebagai digantikan (Superseded) oleh dokumen baru",
)
async def supersede_knowledge(
    id: str,
    req: KnowledgeSupersedeRequest,
    actor: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> KnowledgeDocumentResponse:
    actor_email = actor.email or actor.id
    doc = supersede_knowledge_document(
        db, doc_id=id, superseded_by_id=req.superseded_by_id, actor_email=actor_email
    )
    return KnowledgeDocumentResponse.model_validate(doc)


@router.patch(
    "/knowledge/{id}/status",
    response_model=KnowledgeDocumentResponse,
    summary="[Admin] Perbarui status siklus dokumen pengetahuan (PUBLISHED, RETIRED, DRAFT)",
)
async def update_knowledge_status(
    id: str,
    req: KnowledgeDocumentStatusUpdate,
    actor: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> KnowledgeDocumentResponse:
    doc = update_knowledge_document_status(db, doc_id=id, status=req.status)
    return KnowledgeDocumentResponse.model_validate(doc)


@router.delete(
    "/knowledge/{id}",
    status_code=204,
    summary="[Admin] Hapus dokumen pengetahuan beserta seluruh chunk-nya",
)
async def delete_knowledge(
    id: str,
    actor: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> None:
    delete_knowledge_document(db, doc_id=id)


@router.post(
    "/feedback",
    response_model=AIFeedbackResponse,
    summary="[Publik/User] Catat rating dan umpan balik pengguna terhadap jawaban AI",
)
async def submit_ai_feedback(
    req: AIFeedbackRequest,
    db: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[User | None, Depends(get_optional_current_user)] = None,
) -> AIFeedbackResponse:
    user_id = current_user.id if current_user else None
    ai_service.record_feedback(
        db, log_id=req.target_id, rating=req.rating, comment=req.comment, user_id=user_id
    )
    return AIFeedbackResponse(
        success=True,
        message="Terima kasih, umpan balik Anda berhasil dicatat untuk evaluasi kualitas Kedas AI.",
    )


@router.get(
    "/health",
    response_model=AIProviderHealthResponse,
    summary="[Monitoring] Status kesehatan adapter AI dan latensi rata-rata",
)
async def get_ai_health() -> AIProviderHealthResponse:
    stats = ai_adapter.get_health()
    return AIProviderHealthResponse.model_validate(stats)
