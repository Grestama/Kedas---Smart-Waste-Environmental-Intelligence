"""WasteLink Bali — Waste Pickup Requests Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    PickupCancelRequest,
    PickupCreateRequest,
    PickupDetailResponse,
    PickupResponse,
    ServiceEligibilityCheckRequest,
    ServiceEligibilityResponse,
    WastePassportDetailResponse,
    WastePassportPublicResponse,
)

router = APIRouter()


@router.get(
    "/passport/public/{public_code}",
    response_model=WastePassportPublicResponse,
    summary="[Publik QR] Akses publik Kedas Waste Passport tanpa mewajibkan login",
)
async def get_public_passport(
    public_code: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> WastePassportPublicResponse:
    return collection_service.get_waste_passport_public(db, public_code=public_code)


@router.post(
    "/eligibility",
    response_model=ServiceEligibilityResponse,
    summary="[Engine] Periksa kelayakan layanan berdasarkan CDOA kawasan, kategori, dan kapasitas",
)
async def check_eligibility(
    req: ServiceEligibilityCheckRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ServiceEligibilityResponse:
    return collection_service.check_service_eligibility(db, user=current_user, req=req)


@router.post(
    "",
    response_model=PickupResponse,
    status_code=201,
    summary="Buat permintaan setoran / penjemputan sampah",
)
async def create_pickup(
    req: PickupCreateRequest,
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PickupResponse:
    request_id = getattr(request.state, "request_id", None)
    pickup = collection_service.create_pickup_request(db, current_user, req, request_id=request_id)
    return PickupResponse.model_validate(pickup)


@router.get(
    "/mine",
    response_model=list[PickupResponse],
    summary="Riwayat setoran sampah milik sendiri",
)
async def list_my_pickups(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
    status: str | None = None,
) -> list[PickupResponse]:
    pickups = collection_service.list_user_pickups(db, current_user.id, status=status)
    return [PickupResponse.model_validate(p) for p in pickups]


@router.get(
    "/{id}",
    response_model=PickupDetailResponse,
    summary="Detail permintaan penjemputan beserta riwayat event status",
)
async def get_pickup(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PickupDetailResponse:
    pickup = collection_service.get_pickup_detail(db, current_user, id)
    return PickupDetailResponse.model_validate(pickup)


@router.post(
    "/{id}/cancel",
    response_model=PickupResponse,
    summary="Batalkan permintaan penjemputan",
)
async def cancel_pickup(
    id: str,
    req: PickupCancelRequest,
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PickupResponse:
    request_id = getattr(request.state, "request_id", None)
    pickup = collection_service.cancel_pickup(
        db, current_user, id, reason=req.reason, request_id=request_id
    )
    return PickupResponse.model_validate(pickup)


@router.get(
    "/{id}/passport",
    response_model=WastePassportDetailResponse,
    summary="Detail digital Kedas Waste Passport untuk pemilik atau petugas terkait",
)
async def get_authenticated_passport(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WastePassportDetailResponse:
    return collection_service.get_waste_passport_detail(db, user=current_user, pickup_id=id)
