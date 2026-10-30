"""WasteLink Bali — Circular Marketplace, Offers, Organic Processing & B2B Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole, get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.marketplace import service as marketplace_service
from app.modules.marketplace.schemas import (
    B2BLocationCreateRequest,
    B2BLocationResponse,
    B2BOperationalReportResponse,
    B2BOrganizationCreateRequest,
    B2BOrganizationResponse,
    B2BPickupCreateRequest,
    B2BPickupResponse,
    B2BPickupStatusUpdateRequest,
    DeliveryConfirmProcessingRequest,
    DeliveryCreateRequest,
    DeliveryReceiptRequest,
    DeliveryResponse,
    MaterialBatchCreateRequest,
    MaterialBatchResponse,
    MaterialOfferAcceptRequest,
    MaterialOfferCreateRequest,
    MaterialOfferResponse,
    OrganicProcessingCompleteRequest,
    OrganicProcessingResponse,
    OrganicProcessingStartRequest,
    PartnerCreateRequest,
    PartnerResponse,
    PartnerVerifyRequest,
)

router = APIRouter()
require_admin = RequireRole("ADMIN")
require_operator = RequireRole("ADMIN", "OPERATOR", "COLLECTOR")


# ==============================================================================
# Partners
# ==============================================================================


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


@router.post(
    "/admin/partners/{id}/verify",
    response_model=PartnerResponse,
    summary="[Admin] Verifikasi atau tangguhkan status mitra hilir",
)
async def verify_partner(
    id: str,
    req: PartnerVerifyRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> PartnerResponse:
    partner = marketplace_service.verify_partner(db, partner_id=id, req=req, admin_user=admin)
    return PartnerResponse.model_validate(partner)


@router.get(
    "/admin/partners",
    response_model=list[PartnerResponse],
    summary="[Operator] Daftar mitra daur ulang",
)
async def list_partners(
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
    verified_only: bool = True,
    partner_type: str | None = None,
) -> list[PartnerResponse]:
    partners = marketplace_service.list_partners(db, verified_only=verified_only, partner_type=partner_type)
    return [PartnerResponse.model_validate(p) for p in partners]


# ==============================================================================
# Material Batches & Deliveries
# ==============================================================================


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
    summary="[Operator] Kirim batch material ke mitra daur ulang terverifikasi",
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


@router.post(
    "/admin/deliveries/{id}/confirm-processing",
    response_model=DeliveryResponse,
    summary="[Operator/Mitra] Catat bukti pemrosesan daur ulang yang sah",
)
async def confirm_delivery_processing(
    id: str,
    req: DeliveryConfirmProcessingRequest,
    request: Request,
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> DeliveryResponse:
    request_id = getattr(request.state, "request_id", None)
    delivery = marketplace_service.confirm_delivery_processing(
        db, actor=operator, delivery_id=id, req=req, request_id=request_id
    )
    return DeliveryResponse.model_validate(delivery)


# ==============================================================================
# Material Demand & Supply Offers
# ==============================================================================


@router.post(
    "/marketplace/offers",
    response_model=MaterialOfferResponse,
    status_code=201,
    summary="[Operator/Mitra] Pasang penawaran material (Supply dari TPS3R atau Demand dari Mitra)",
)
async def create_material_offer(
    req: MaterialOfferCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> MaterialOfferResponse:
    offer = marketplace_service.create_material_offer(db, req=req, creator_id=current_user.id)
    return MaterialOfferResponse.model_validate(offer)


@router.get(
    "/marketplace/offers",
    response_model=list[MaterialOfferResponse],
    summary="Daftar penawaran dan kebutuhan material daur ulang",
)
async def list_material_offers(
    db: Annotated[Session, Depends(get_db_session)],
    offer_type: str | None = None,
    category_id: str | None = None,
    status: str | None = None,
) -> list[MaterialOfferResponse]:
    offers = marketplace_service.list_material_offers(
        db, offer_type=offer_type, category_id=category_id, status=status
    )
    return [MaterialOfferResponse.model_validate(o) for o in offers]


@router.post(
    "/marketplace/offers/{id}/accept",
    response_model=MaterialOfferResponse,
    summary="[Operator] Setujui dan alokasikan penawaran material",
)
async def accept_material_offer(
    id: str,
    req: MaterialOfferAcceptRequest,
    request: Request,
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> MaterialOfferResponse:
    request_id = getattr(request.state, "request_id", None)
    offer = marketplace_service.accept_material_offer(
        db, offer_id=id, req=req, actor_id=operator.id, request_id=request_id
    )
    return MaterialOfferResponse.model_validate(offer)


# ==============================================================================
# Organic Processing
# ==============================================================================


@router.post(
    "/organic/processing/start",
    response_model=OrganicProcessingResponse,
    status_code=201,
    summary="[Staff/Operator] Mulai pengolahan sampah organik (Komposting/Maggot BSF)",
)
async def record_organic_start(
    req: OrganicProcessingStartRequest,
    request: Request,
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> OrganicProcessingResponse:
    request_id = getattr(request.state, "request_id", None)
    record = marketplace_service.record_organic_processing_start(
        db, req=req, operator_user_id=operator.id, request_id=request_id
    )
    return OrganicProcessingResponse.model_validate(record)


@router.post(
    "/organic/processing/{id}/complete",
    response_model=OrganicProcessingResponse,
    summary="[Staff/Operator] Catat hasil panen kompos/maggot dan residu organik",
)
async def record_organic_completion(
    id: str,
    req: OrganicProcessingCompleteRequest,
    request: Request,
    operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> OrganicProcessingResponse:
    request_id = getattr(request.state, "request_id", None)
    record = marketplace_service.record_organic_processing_completion(
        db, record_id=id, req=req, operator_user_id=operator.id, request_id=request_id
    )
    return OrganicProcessingResponse.model_validate(record)


# ==============================================================================
# Commercial Generators (B2B)
# ==============================================================================


@router.post(
    "/b2b/organizations",
    response_model=B2BOrganizationResponse,
    status_code=201,
    summary="Daftarkan profil pelaku usaha / penghasil komersial (Hotel, Resto, Villa)",
)
async def create_b2b_organization(
    req: B2BOrganizationCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> B2BOrganizationResponse:
    org = marketplace_service.create_b2b_organization(db, req=req, creator_user=current_user)
    return B2BOrganizationResponse.model_validate(org)


@router.post(
    "/b2b/locations",
    response_model=B2BLocationResponse,
    status_code=201,
    summary="Tambah lokasi penjemputan komersial untuk organisasi usaha",
)
async def create_b2b_location(
    req: B2BLocationCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> B2BLocationResponse:
    location = marketplace_service.create_b2b_location(db, req=req, current_user=current_user)
    return B2BLocationResponse.model_validate(location)


@router.get(
    "/b2b/organizations/{id}/locations",
    response_model=list[B2BLocationResponse],
    summary="Daftar lokasi penjemputan milik organisasi usaha (Tenant Isolation)",
)
async def list_b2b_locations(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[B2BLocationResponse]:
    locations = marketplace_service.list_b2b_locations(db, organization_id=id, current_user=current_user)
    return [B2BLocationResponse.model_validate(loc) for loc in locations]


@router.post(
    "/b2b/pickups",
    response_model=B2BPickupResponse,
    status_code=201,
    summary="Jadwalkan penjemputan sampah komersial B2B",
)
async def create_b2b_pickup(
    req: B2BPickupCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> B2BPickupResponse:
    pickup = marketplace_service.create_b2b_pickup_request(db, req=req, current_user=current_user)
    return B2BPickupResponse.model_validate(pickup)


@router.patch(
    "/b2b/pickups/{id}/status",
    response_model=B2BPickupResponse,
    summary="[Operator/Collector] Perbarui status penjemputan B2B",
)
async def update_b2b_pickup_status(
    id: str,
    req: B2BPickupStatusUpdateRequest,
    current_user: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> B2BPickupResponse:
    pickup = marketplace_service.update_b2b_pickup_status(db, pickup_id=id, req=req, current_user=current_user)
    return B2BPickupResponse.model_validate(pickup)


@router.get(
    "/b2b/organizations/{id}/report",
    response_model=B2BOperationalReportResponse,
    summary="Laporan operasional pengelolaan sampah komersial B2B",
)
async def get_b2b_report(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> B2BOperationalReportResponse:
    report = marketplace_service.get_b2b_operational_report(db, organization_id=id, current_user=current_user)
    return B2BOperationalReportResponse.model_validate(report)
