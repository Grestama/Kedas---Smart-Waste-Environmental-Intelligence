"""WasteLink Bali — Weight API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole, get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.weight import service as weight_service
from app.modules.weight.schemas import WeightRecordCreateRequest, WeightRecordResponse

router = APIRouter()
require_collector = RequireRole("COLLECTOR", "ADMIN")


@router.post(
    "/pickup-requests/{id}/weights",
    response_model=WeightRecordResponse,
    status_code=201,
    summary="[Collector] Catat timbangan tervalidasi & picu reward poin",
)
async def record_weight(
    id: str,
    req: WeightRecordCreateRequest,
    request: Request,
    collector: Annotated[User, Depends(require_collector)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WeightRecordResponse:
    request_id = getattr(request.state, "request_id", None)
    weight_rec = weight_service.record_weight(
        db,
        pickup_id=id,
        recorder=collector,
        req=req,
        request_id=request_id,
    )
    return WeightRecordResponse.model_validate(weight_rec)


@router.get(
    "/pickup-requests/{id}/weights",
    response_model=list[WeightRecordResponse],
    summary="Riwayat versi penimbangan setoran tertentu",
)
async def list_weights(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[WeightRecordResponse]:
    records = weight_service.list_pickup_weights(db, id)
    return [WeightRecordResponse.model_validate(r) for r in records]
