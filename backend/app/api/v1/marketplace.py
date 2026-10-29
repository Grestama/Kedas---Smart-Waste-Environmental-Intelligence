"""WasteLink Bali — Circular Marketplace & Delivery API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.marketplace import service as marketplace_service
from app.modules.marketplace.schemas import (
    DeliveryCreateRequest,
    DeliveryReceiptRequest,
    DeliveryResponse,
    MaterialBatchCreateRequest,
    MaterialBatchResponse,
    PartnerCreateRequest,
    PartnerResponse,
)

router = APIRouter()
require_admin = RequireRole("ADMIN")
require_operator = RequireRole("ADMIN", "COLLECTOR")


@router.post(
    "/admin/partners",
    response_model=PartnerResponse,
    status_code=201,
    summary="[Admin] Daftarkan mitra pembeli/pendaur ulang material sirkular",
)
async def create_partner(
    req: PartnerCreateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PartnerResponse:
    partner = marketplace_service.create_partner(db, req)
    return PartnerResponse.model_validate(partner)


@router.get(
    "/admin/partners",
    response_model=list[PartnerResponse],
    summary="[Operator] Daftar mitra daur ulang terverifikasi",
)
async def list_partners(
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[PartnerResponse]:
    partners = marketplace_service.list_partners(db)
    return [PartnerResponse.model_validate(p) for p in partners]


@router.post(
    "/admin/batches",
    response_model=MaterialBatchResponse,
    status_code=201,
    summary="[Operator] Agregasi setoran sampah terverifikasi menjadi batch material",
)
async def create_batch(
    req: MaterialBatchCreateRequest,
    request: Request,
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> MaterialBatchResponse:
    request_id = getattr(request.state, "request_id", None)
    batch = marketplace_service.create_material_batch(
        db, creator=operator, req=req, request_id=request_id
    )
    return MaterialBatchResponse.model_validate(batch)


@router.get(
    "/admin/batches",
    response_model=list[MaterialBatchResponse],
    summary="[Operator] Daftar batch material yang telah dibentuk",
)
async def list_batches(
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
    status: str | None = None,
) -> list[MaterialBatchResponse]:
    batches = marketplace_service.list_material_batches(db, status=status)
    return [MaterialBatchResponse.model_validate(b) for b in batches]


@router.post(
    "/admin/deliveries",
    response_model=DeliveryResponse,
    status_code=201,
    summary="[Operator] Kirim batch material ke mitra daur ulang",
)
async def dispatch_delivery(
    req: DeliveryCreateRequest,
    request: Request,
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> DeliveryResponse:
    request_id = getattr(request.state, "request_id", None)
    delivery = marketplace_service.dispatch_delivery(
        db, dispatcher=operator, req=req, request_id=request_id
    )
    return DeliveryResponse.model_validate(delivery)


@router.post(
    "/admin/deliveries/{id}/receipt",
    response_model=DeliveryResponse,
    summary="[Operator/Mitra] Konfirmasi penerimaan kiriman dan catat selisih timbangan",
)
async def confirm_delivery_receipt(
    id: str,
    req: DeliveryReceiptRequest,
    request: Request,
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> DeliveryResponse:
    request_id = getattr(request.state, "request_id", None)
    delivery = marketplace_service.confirm_delivery_receipt(
        db, receiver=operator, delivery_id=id, req=req, request_id=request_id
    )
    return DeliveryResponse.model_validate(delivery)
