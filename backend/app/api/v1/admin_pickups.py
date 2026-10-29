"""WasteLink Bali — Admin Pickups Management Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    AdminReassignRequest,
    PickupResponse,
)

router = APIRouter()


@router.post(
    "/{id}/reassign",
    response_model=PickupResponse,
    summary="[Admin] Tugaskan ulang petugas sampah",
)
async def admin_reassign_pickup(
    id: str,
    req: AdminReassignRequest,
    request: Request,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PickupResponse:
    request_id = getattr(request.state, "request_id", None)
    pickup = collection_service.admin_reassign_pickup(
        db,
        admin_id=admin.id,
        pickup_id=id,
        new_collector_id=req.new_collector_id,
        reason=req.reason,
        request_id=request_id,
    )
    return PickupResponse.model_validate(pickup)
