"""WasteLink Bali — Circular Marketplace, Material Offers, Organic & B2B Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.marketplace.models import (
    B2BBusinessType,
    OfferType,
    OrganicProcessType,
    OrganicStatus,
    PartnerType,
    PartnerVerificationStatus,
)


class PartnerCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    contact_email: str = Field(max_length=255)
    contact_phone: str = Field(max_length=50)
    address: str = Field(min_length=5)
    partner_type: PartnerType = Field(default=PartnerType.PENDAUR_ULANG)
    capacity_kg_per_month: float | None = Field(default=None, gt=0)
    service_area_id: str | None = None
    is_verified: bool = True


class PartnerVerifyRequest(BaseModel):
    verification_status: PartnerVerificationStatus = PartnerVerificationStatus.VERIFIED
    notes: str | None = None


class PartnerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    contact_email: str
    contact_phone: str
    address: str
    partner_type: str
    capacity_kg_per_month: float | None = None
    service_area_id: str | None = None
    verification_status: str
    verified_at: datetime | None = None
    verified_by: str | None = None
    created_at: datetime


class MaterialBatchCreateRequest(BaseModel):
    category_id: str
    pickup_ids: list[str] = Field(
        min_length=1, description="Daftar ID setoran sampah yang selesai ditimbang"
    )


class MaterialBatchItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_id: str
    pickup_id: str
    weight_kg: float


class MaterialBatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_code: str
    category_id: str
    total_weight_kg: float
    status: str
    created_by: str
    created_at: datetime
    items: list[MaterialBatchItemResponse] = []


class DeliveryCreateRequest(BaseModel):
    batch_id: str
    partner_id: str
    dispatched_weight_kg: float = Field(gt=0, description="Berat material yang dikirim (kg)")
    notes: str | None = None


class DeliveryReceiptRequest(BaseModel):
    received_weight_kg: float = Field(
        ge=0, description="Berat material aktual yang diterima mitra (kg)"
    )
    notes: str | None = None


class DeliveryConfirmProcessingRequest(BaseModel):
    notes: str = Field(
        min_length=5, description="Bukti atau catatan pemrosesan daur ulang yang sah"
    )


class DeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_id: str
    partner_id: str
    dispatched_weight_kg: float
    received_weight_kg: float | None = None
    weight_discrepancy_kg: float | None = None
    status: str
    dispatched_at: datetime
    received_at: datetime | None = None
    notes: str | None = None


# ==============================================================================
# Material Demand & Supply Offers
# ==============================================================================


class MaterialOfferCreateRequest(BaseModel):
    offer_type: OfferType
    category_id: str
    partner_id: str | None = None
    facility_id: str | None = None
    min_quantity_kg: float = Field(gt=0)
    max_quantity_kg: float = Field(gt=0)
    quality_grade: str = Field(default="GRADE_A")
    price_indicative_idr: int | None = Field(default=None, gt=0)
    valid_until: datetime
    notes: str | None = None


class MaterialOfferAcceptRequest(BaseModel):
    allocated_quantity_kg: float = Field(gt=0)
    target_partner_id: str | None = None
    target_facility_id: str | None = None
    notes: str | None = None


class MaterialOfferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    offer_no: str
    offer_type: str
    category_id: str
    partner_id: str | None = None
    facility_id: str | None = None
    min_quantity_kg: float
    max_quantity_kg: float
    quality_grade: str
    price_indicative_idr: int | None = None
    valid_until: datetime
    status: str
    notes: str | None = None
    created_by: str
    created_at: datetime


# ==============================================================================
# Organic Waste Processing Pathways
# ==============================================================================


class OrganicProcessingStartRequest(BaseModel):
    facility_id: str
    process_type: OrganicProcessType = OrganicProcessType.COMPOSTING_AEROBIC
    input_weight_kg: float = Field(gt=0, description="Bobot input sampah organik (kg)")
    notes: str | None = None


class OrganicProcessingCompleteRequest(BaseModel):
    output_product_weight_kg: float = Field(
        ge=0, description="Bobot produk kompos/maggot BSF yang dihasilkan (kg)"
    )
    residue_weight_kg: float = Field(ge=0, description="Bobot residu sisa proses (kg)")
    status: OrganicStatus = OrganicStatus.MATURED
    notes: str | None = None


class OrganicProcessingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_no: str
    facility_id: str
    operator_user_id: str
    process_type: str
    input_weight_kg: float
    output_product_weight_kg: float
    residue_weight_kg: float
    status: str
    started_at: datetime
    completed_at: datetime | None = None
    notes: str | None = None
    created_at: datetime


# ==============================================================================
# Commercial Generators (B2B)
# ==============================================================================


class B2BOrganizationCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    business_type: B2BBusinessType = B2BBusinessType.HOTEL
    tax_id: str | None = None
    billing_contact_name: str = Field(min_length=2, max_length=100)
    billing_contact_phone: str = Field(min_length=5, max_length=50)
    billing_contact_email: str = Field(max_length=255)


class B2BOrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    business_type: str
    tax_id: str | None = None
    billing_contact_name: str
    billing_contact_phone: str
    billing_contact_email: str
    is_active: bool
    created_at: datetime


class B2BLocationCreateRequest(BaseModel):
    organization_id: str
    name: str = Field(min_length=2, max_length=100)
    address: str = Field(min_length=5)
    service_area_id: str | None = None
    contact_person: str = Field(min_length=2, max_length=100)
    contact_phone: str = Field(min_length=5, max_length=50)
    estimated_daily_kg: float = Field(default=50.0, gt=0)
    pickup_frequency: str = Field(default="DAILY")
    access_instructions: str | None = None


class B2BLocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    organization_id: str
    name: str
    address: str
    service_area_id: str | None = None
    contact_person: str
    contact_phone: str
    estimated_daily_kg: float
    pickup_frequency: str
    access_instructions: str | None = None
    is_active: bool
    created_at: datetime


class B2BPickupCreateRequest(BaseModel):
    location_id: str
    category_id: str
    scheduled_date: datetime
    estimated_weight_kg: float = Field(gt=0)
    notes: str | None = None


class B2BPickupStatusUpdateRequest(BaseModel):
    status: str
    actual_weight_kg: float | None = Field(default=None, ge=0)
    notes: str | None = None


class B2BPickupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    request_no: str
    location_id: str
    category_id: str
    scheduled_date: datetime
    estimated_weight_kg: float
    actual_weight_kg: float | None = None
    status: str
    collector_id: str | None = None
    notes: str | None = None
    created_at: datetime


class B2BOperationalReportResponse(BaseModel):
    organization_id: str
    organization_name: str
    total_requests: int
    scheduled_count: int
    collected_count: int
    received_facility_count: int
    processed_count: int
    cancelled_count: int
    total_estimated_weight_kg: float
    total_actual_weight_kg: float
    verified_loop_completion_rate: float = 0.0
    breakdown_by_category: dict[str, float] = Field(default_factory=dict)
    audit_disclaimer: str = (
        "Laporan Operasional Green Hospitality Kedas. Disusun berdasarkan rekaman riwayat alur "
        "material terverifikasi fasilitas (operational audit trail), bukan sertifikasi lingkungan tanpa bukti lapangan."
    )
