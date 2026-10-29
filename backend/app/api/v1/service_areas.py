"""WasteLink Bali — Service Area & Scheduling Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    CollectionSlotResponse,
    ServiceAreaCreateRequest,
    ServiceAreaResponse,
)

router = APIRouter()


@router.get(
    "/service-areas",
    response_model=list[ServiceAreaResponse],
    summary="Daftar wilayah layanan aktif (Desa/Banjar)",
)
async def list_service_areas(
    db: Annotated[Session, Depends(get_db_session)],
    active_only: bool = True,
) -> list[ServiceAreaResponse]:
    areas = collection_service.list_service_areas(db, active_only=active_only)
    return [ServiceAreaResponse.model_validate(a) for a in areas]


@router.post(
    "/service-areas",
    response_model=ServiceAreaResponse,
    status_code=201,
    summary="[Admin] Tambah area layanan baru",
)
async def create_service_area(
    req: ServiceAreaCreateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ServiceAreaResponse:
    area = collection_service.create_service_area(db, req)
    return ServiceAreaResponse.model_validate(area)


@router.get(
    "/service-areas/{id}/slots",
    response_model=list[CollectionSlotResponse],
    summary="Daftar slot jadwal penjemputan yang tersedia",
)
async def list_available_slots(
    id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> list[CollectionSlotResponse]:
    slots = collection_service.list_available_slots(db, id)
    return [CollectionSlotResponse.model_validate(s) for s in slots]


@router.post(
    "/service-areas/{id}/slots",
    response_model=CollectionSlotResponse,
    status_code=201,
    summary="[Admin] Tambah slot jadwal penjemputan baru",
)
async def create_slot(
    id: str,
    req: CollectionSlotCreateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CollectionSlotResponse:
    req.service_area_id = id
    slot = collection_service.create_collection_slot(db, req)
    return CollectionSlotResponse.model_validate(slot)
