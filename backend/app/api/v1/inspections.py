"""WasteLink Bali — Inspection API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole, get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.inspection import service as inspection_service
from app.modules.inspection.schemas import InspectionCreateRequest, InspectionResponse

router = APIRouter()
require_collector = RequireRole("COLLECTOR", "ADMIN")


@router.post(
    "/pickup-requests/{id}/inspections",
    response_model=InspectionResponse,
    status_code=201,
    summary="[Collector] Catat hasil inspeksi QC setoran sampah",
)
async def record_inspection(
    id: str,
    req: InspectionCreateRequest,
    request: Request,
    collector: Annotated[User, Depends(require_collector)],
    db: Annotated[Session, Depends(get_db_session)],
) -> InspectionResponse:
    request_id = getattr(request.state, "request_id", None)
    record = inspection_service.create_inspection(
        db,
        pickup_id=id,
        inspector=collector,
        req=req,
        request_id=request_id,
    )
    return InspectionResponse.model_validate(record)


@router.get(
    "/pickup-requests/{id}/inspections",
    response_model=list[InspectionResponse],
    summary="Riwayat inspeksi QC untuk setoran tertentu",
)
async def list_inspections(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[InspectionResponse]:
    records = inspection_service.list_pickup_inspections(db, id)
    return [InspectionResponse.model_validate(r) for r in records]
