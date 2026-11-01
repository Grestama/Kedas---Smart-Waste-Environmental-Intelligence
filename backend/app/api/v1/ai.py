"""Kedas — AI Web Innovation API Endpoints: EcoGuide, Vision & Operations Copilot."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole, get_optional_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.ai import service as ai_service
from app.modules.ai.adapter import ai_adapter
from app.modules.ai.knowledge import (
    delete_knowledge_document,
    get_knowledge_document,
    ingest_document,
    list_knowledge_documents,
    update_knowledge_document_status,
)
from app.modules.ai.schemas import (
    ActionProposalExecuteRequest,
    ActionProposalExecuteResponse,
    AIFeedbackRequest,
    AIFeedbackResponse,
    AIProviderHealthResponse,
    CopilotQueryRequest,
    CopilotResponse,
    EcoGuideQueryRequest,
    EcoGuideResponse,
    KnowledgeDocumentCreate,
    KnowledgeDocumentDetailResponse,
    KnowledgeDocumentResponse,
    KnowledgeDocumentStatusUpdate,
    VisionAnalyzeResponse,
)

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
async def execute_copilot_proposal(
    req: ActionProposalExecuteRequest,
    actor: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ActionProposalExecuteResponse:
    return ai_service.execute_action_proposal(db, req=req, actor=actor)



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
) -> list[KnowledgeDocumentResponse]:
    docs = list_knowledge_documents(
        db, destination_id=destination_id, source_type=source_type, status=status
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
