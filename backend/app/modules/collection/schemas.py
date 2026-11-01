"""WasteLink Bali — Collection, Scheduling, & Pickup Pydantic Schemas."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

# --- Service Area & Slot Schemas ---


class ServiceAreaCreateRequest(BaseModel):
    code: str = Field(
        min_length=2, max_length=64, description="Unique area code, e.g. BALI_DENPASAR_SANUR"
    )
    name: str = Field(min_length=2, max_length=100, description="Area name, e.g. Banjar Sanur Kauh")
    administrative_area: str = Field(
        min_length=2, max_length=100, description="Desa / Kelurahan / Kecamatan"
    )
    is_active: bool = True


class ServiceAreaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    administrative_area: str
    is_active: bool
    created_at: datetime


class CollectionSlotCreateRequest(BaseModel):
    service_area_id: str
    start_time: datetime
    end_time: datetime
    max_capacity: int = Field(default=10, ge=1, le=100)
    is_active: bool = True


class CollectionSlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    service_area_id: str
    start_time: datetime
    end_time: datetime
    max_capacity: int
    booked_capacity: int
    is_active: bool
    remaining_capacity: int


# --- Pickup Request Schemas ---


class PickupCreateRequest(BaseModel):
    category_id: str = Field(description="ID of active waste category")
    address_id: str = Field(description="ID of user registered address")
    slot_id: str = Field(description="ID of active collection slot")
    estimated_weight_kg: Decimal | None = Field(default=None, ge=0, le=1000)
    notes: str | None = Field(default=None, max_length=500)
    service_mode: str = Field(
        default="PICKUP",
        description="Mode layanan: 'PICKUP' (dijemput armada trike) atau 'DROP_OFF' (setor mandiri ke TPS3R)",
    )
    idempotency_key: str | None = Field(
        default=None,
        max_length=64,
        description="Kunci idempotensi unik dari klien untuk mencegah request ganda pada retry jaringan",
    )


class PickupStatusEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    from_status: str
    to_status: str
    actor_user_id: str | None = None
    reason: str | None = None
    created_at: datetime


class PickupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    public_code: str
    reporter_user_id: str
    service_area_id: str
    category_id: str
    address_id: str
    slot_id: str
    status: str
    service_mode: str = "PICKUP"
    idempotency_key: str | None = None
    assigned_collector_id: str | None = None
    estimated_weight_kg: Decimal | None = None
    notes: str | None = None
    created_at: datetime


class PickupDetailResponse(PickupResponse):
    events: list[PickupStatusEventResponse] = []


class PickupCancelRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=500, description="Alasan pembatalan penjemputan")


class TaskStatusUpdateRequest(BaseModel):
    status: str = Field(description="Status baru, e.g. EN_ROUTE, ARRIVED, INSPECTION")
    reason: str | None = Field(default=None, max_length=500)


class AdminReassignRequest(BaseModel):
    new_collector_id: str = Field(description="ID of verified collector to assign")
    reason: str = Field(min_length=3, max_length=500, description="Alasan penugasan ulang")


# --- Service Eligibility Schemas ---


class ServiceEligibilityCheckRequest(BaseModel):
    address_id: str = Field(description="ID of registered user address")
    category_id: str = Field(description="ID of waste category")
    slot_id: str | None = Field(default=None, description="Optional slot ID to verify capacity")
    estimated_weight_kg: Decimal | None = Field(default=None, ge=0, le=1000)


class ServiceEligibilityResponse(BaseModel):
    is_eligible: bool
    reason_code: str
    message: str
    service_area_id: str
    service_area_name: str
    category_name: str
    cdoa_version: int | None = None
    cdoa_agreement_no: str | None = None
    primary_facility_name: str | None = None
    daily_capacity_limit_kg: float | None = None


# --- Kedas Waste Passport Schemas ---


class WastePassportEventItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_type: str
    from_status: str
    to_status: str
    timestamp: datetime
    notes: str | None = None


class WastePassportPublicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    passport_no: str
    status: str
    category_name: str
    category_type: str
    service_area_name: str
    administrative_area: str
    service_mode: str
    created_at: datetime
    completed_at: datetime | None = None
    estimated_weight_kg: float | None = None
    actual_weight_kg: float | None = None
    destination_facility_name: str | None = None
    timeline: list[WastePassportEventItem] = Field(default_factory=list)
    public_verification_notice: str = (
        "Kedas Waste Passport terverifikasi resmi. Informasi aman dan melindungi data pribadi warga."
    )


class WastePassportDetailResponse(WastePassportPublicResponse):
    id: str
    address_label: str
    assigned_collector_name: str | None = None
    cancellation_reason: str | None = None


