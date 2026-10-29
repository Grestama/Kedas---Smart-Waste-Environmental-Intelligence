"""WasteLink Bali — Collector Task Operations API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import require_collector
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    PickupResponse,
    TaskStatusUpdateRequest,
)

router = APIRouter()


@router.get(
    "/available",
    response_model=list[PickupResponse],
    summary="[Collector] Daftar tugas penjemputan yang tersedia",
)
async def list_available_tasks(
    collector: Annotated[User, Depends(require_collector)],
    db: Annotated[Session, Depends(get_db_session)],
    service_area_id: str | None = None,
) -> list[PickupResponse]:
    tasks = collection_service.list_available_tasks(db, collector, service_area_id=service_area_id)
    return [PickupResponse.model_validate(t) for t in tasks]


@router.get(
    "/mine",
    response_model=list[PickupResponse],
    summary="[Collector] Daftar tugas yang sudah diterima/ditugaskan kepada saya",
)
async def list_my_tasks(
    collector: Annotated[User, Depends(require_collector)],
    db: Annotated[Session, Depends(get_db_session)],
    status: str | None = None,
) -> list[PickupResponse]:
    tasks = collection_service.list_my_tasks(db, collector.id, status=status)
    return [PickupResponse.model_validate(t) for t in tasks]


@router.post(
    "/{id}/accept",
    response_model=PickupResponse,
    summary="[Collector] Klaim tugas penjemputan (Atomik)",
)
async def accept_task(
    id: str,
    request: Request,
    collector: Annotated[User, Depends(require_collector)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PickupResponse:
    request_id = getattr(request.state, "request_id", None)
    pickup = collection_service.accept_task_atomic(db, collector, id, request_id=request_id)
    return PickupResponse.model_validate(pickup)


@router.post(
    "/{id}/status",
    response_model=PickupResponse,
    summary="[Collector] Perbarui status penjemputan (State Machine)",
)
async def update_task_status(
    id: str,
    req: TaskStatusUpdateRequest,
    request: Request,
    collector: Annotated[User, Depends(require_collector)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PickupResponse:
    request_id = getattr(request.state, "request_id", None)
    pickup = collection_service.update_task_status(
        db, collector, id, new_status=req.status, reason=req.reason, request_id=request_id
    )
    return PickupResponse.model_validate(pickup)
