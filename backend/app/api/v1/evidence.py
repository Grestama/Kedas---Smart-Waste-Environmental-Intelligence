"""WasteLink Bali — Evidence API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Request, Response, UploadFile
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.evidence import service as evidence_service
from app.modules.evidence.schemas import EvidenceResponse

router = APIRouter()


@router.post(
    "/evidence/upload",
    response_model=EvidenceResponse,
    status_code=201,
    summary="Unggah berkas bukti (Foto setoran, QC, timbangan, surat jalan)",
)
async def upload_evidence(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
    file: Annotated[UploadFile, File()],
    entity_type: Annotated[str, Form()],
    entity_id: Annotated[str, Form()],
) -> EvidenceResponse:
    request_id = getattr(request.state, "request_id", None)
    file_bytes = await file.read()
    evidence = evidence_service.upload_evidence_file(
        db=db,
        uploader=current_user,
        file_bytes=file_bytes,
        original_filename=file.filename or "upload.bin",
        content_type=file.content_type or "application/octet-stream",
        entity_type=entity_type.upper(),
        entity_id=entity_id,
        request_id=request_id,
    )
    return EvidenceResponse.model_validate(evidence)


@router.get(
    "/evidence/{id}/download",
    summary="Unduh berkas bukti terverifikasi (Akses Privat Terotorisasi)",
)
async def download_evidence(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> Response:
    evidence, data = evidence_service.get_evidence_file(db, id, current_user)
    return Response(
        content=data,
        media_type=evidence.mime_type,
        headers={
            "Content-Disposition": f'inline; filename="{evidence.original_filename}"',
            "Cache-Control": "private, max-age=300",
        },
    )


@router.get(
    "/evidence",
    response_model=list[EvidenceResponse],
    summary="Daftar berkas bukti terkait entitas tertentu",
)
async def list_evidence(
    entity_type: str,
    entity_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[EvidenceResponse]:
    items = evidence_service.list_entity_evidence(db, entity_type.upper(), entity_id, current_user)
    return [EvidenceResponse.model_validate(e) for e in items]
