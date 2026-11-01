"""WasteLink Bali — Community Banjar, Clean-up Actions & Hazardous Waste Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.community.models import (
    CleanupActionType,
    CommunityEventStatus,
    CommunityEventType,
    ComplaintStatus,
    HazardousManifestStatus,
    HazardType,
)

# ==============================================================================
# Banjar Profiles & Officials
# ==============================================================================


class BanjarProfileCreateRequest(BaseModel):
    service_area_id: str
    desa_adat_name: str = Field(min_length=2, max_length=150)
    kelian_banjar_name: str = Field(min_length=2, max_length=150)
    contact_phone: str = Field(min_length=5, max_length=32)
    household_count: int = Field(ge=0, default=0)
    target_sorting_percent: float = Field(ge=0.0, le=100.0, default=70.0)


class BanjarProfileUpdateRequest(BaseModel):
    desa_adat_name: str | None = Field(default=None, max_length=150)
    kelian_banjar_name: str | None = Field(default=None, max_length=150)
    contact_phone: str | None = Field(default=None, max_length=32)
    household_count: int | None = Field(default=None, ge=0)
    target_sorting_percent: float | None = Field(default=None, ge=0.0, le=100.0)


class BanjarProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    service_area_id: str
    desa_adat_name: str
    kelian_banjar_name: str
    contact_phone: str
    household_count: int
    target_sorting_percent: float
    created_at: datetime
    updated_at: datetime


class BanjarOfficialCreateRequest(BaseModel):
    user_id: str
    service_area_id: str
    official_title: str = Field(min_length=2, max_length=100)


class BanjarOfficialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    service_area_id: str
    official_title: str
    is_active: bool
    created_at: datetime


class BanjarRegionalDashboardResponse(BaseModel):
    service_area_id: str
    service_area_name: str
    desa_adat_name: str | None = None
    kelian_banjar_name: str | None = None
    household_count: int = 0
    total_pickups_count: int = 0
    total_weight_kg: float = 0.0
    sorting_compliance_percent: float = 0.0
    open_complaints_count: int = 0
    upcoming_events_count: int = 0
    active_programs_count: int = 0


# ==============================================================================
# Community Events
# ==============================================================================


class CommunityEventCreateRequest(BaseModel):
    service_area_id: str
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    event_date: datetime
    event_type: CommunityEventType = Field(default=CommunityEventType.GOTONG_ROYONG)
    expected_attendees: int = Field(ge=0, default=0)


class CommunityEventAttendanceRequest(BaseModel):
    actual_attendees: int = Field(ge=0)
    status: CommunityEventStatus = Field(default=CommunityEventStatus.COMPLETED)


class CommunityEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    event_no: str
    service_area_id: str
    title: str
    description: str | None = None
    event_date: datetime
    event_type: str
    status: str
    organizer_user_id: str
    expected_attendees: int
    actual_attendees: int
    created_at: datetime


# ==============================================================================
# Community Complaints
# ==============================================================================


class CommunityComplaintCreateRequest(BaseModel):
    service_area_id: str
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    location_detail: str = Field(min_length=3, max_length=255)


class CommunityComplaintResolveRequest(BaseModel):
    status: ComplaintStatus = Field(default=ComplaintStatus.RESOLVED)
    resolution_notes: str = Field(min_length=3)


class CommunityComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    ticket_no: str
    service_area_id: str
    reporter_user_id: str
    title: str
    description: str
    location_detail: str
    status: str
    resolution_notes: str | None = None
    resolved_by: str | None = None
    resolved_at: datetime | None = None
    created_at: datetime


# ==============================================================================
# Clean-up Actions (Role 11)
# ==============================================================================


class CleanupActionCreateRequest(BaseModel):
    action_type: CleanupActionType = Field(default=CleanupActionType.BEACH_CLEANUP)
    location_name: str = Field(min_length=3, max_length=200)
    service_area_id: str | None = None
    event_date: datetime
    duration_hours: float = Field(gt=0, default=2.0)
    volunteer_count: int = Field(ge=0, default=0)


class CleanupActionCompleteRequest(BaseModel):
    total_collected_weight_kg: float = Field(gt=0)
    plastic_weight_kg: float = Field(ge=0, default=0.0)
    organic_weight_kg: float = Field(ge=0, default=0.0)
    residual_weight_kg: float = Field(ge=0, default=0.0)
    evidence_notes: str | None = None


class CleanupActionVerifyRequest(BaseModel):
    notes: str = Field(min_length=3)


class CleanupActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    action_no: str
    action_type: str
    location_name: str
    service_area_id: str | None = None
    coordinator_user_id: str
    event_date: datetime
    duration_hours: float
    volunteer_count: int
    total_collected_weight_kg: float
    plastic_weight_kg: float
    organic_weight_kg: float
    residual_weight_kg: float
    evidence_notes: str | None = None
    status: str
    verified_by: str | None = None
    verified_at: datetime | None = None
    created_at: datetime


# ==============================================================================
# Hazardous Waste Manifests (Role 12)
# ==============================================================================


class HazardousManifestCreateRequest(BaseModel):
    category_id: str
    handler_partner_id: str
    transporter_license_no: str = Field(min_length=3, max_length=100)
    weight_kg: float = Field(gt=0)
    hazard_type: HazardType = Field(default=HazardType.TOXIC)
    handling_sop_code: str = Field(min_length=3, max_length=50)
    service_area_id: str | None = None
    source_pickup_id: str | None = None
    notes: str | None = None


class HazardousManifestStatusUpdateRequest(BaseModel):
    status: HazardousManifestStatus
    notes: str | None = None


class HazardousManifestDisposalRequest(BaseModel):
    destruction_cert_no: str = Field(min_length=3, max_length=100)
    notes: str | None = None


class HazardousManifestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    manifest_no: str
    category_id: str
    service_area_id: str | None = None
    source_pickup_id: str | None = None
    handler_partner_id: str
    transporter_license_no: str
    weight_kg: float
    hazard_type: str
    handling_sop_code: str
    status: str
    destruction_cert_no: str | None = None
    notes: str | None = None
    created_by: str
    created_at: datetime
    disposed_at: datetime | None = None


# ==============================================================================
# Community Destination Operating Agreement (CDOA) & Service Directory
# ==============================================================================


class CDOACreateRequest(BaseModel):
    service_area_id: str
    title: str = Field(min_length=3, max_length=200)
    eligible_source_types: str = Field(default="HOUSEHOLD,HOREKA,COMMUNITY_EVENT", max_length=255)
    accepted_category_ids: list[str] = Field(default_factory=list)
    primary_facility_id: str | None = None
    collection_schedule_notes: str | None = None
    capacity_limit_daily_kg: float = Field(default=500.0, ge=10.0)
    pic_name: str = Field(default="Prajuru Banjar", min_length=2, max_length=100)
    pic_contact: str = Field(default="08123456789", min_length=5, max_length=50)
    escalation_channel: str = Field(
        default="Kantor Banjar / Balai Desa", min_length=2, max_length=100
    )
    sla_hours: int = Field(default=24, ge=1, le=168)
    effective_from: datetime | None = None


class CDOAApproveRequest(BaseModel):
    notes: str | None = None


class CDOAPublishRequest(BaseModel):
    notes: str | None = None


class CDOAResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agreement_no: str
    service_area_id: str
    version: int
    title: str
    status: str
    eligible_source_types: str
    accepted_category_ids: str | None = None
    primary_facility_id: str | None = None
    collection_schedule_notes: str | None = None
    capacity_limit_daily_kg: float
    pic_name: str
    pic_contact: str
    escalation_channel: str
    sla_hours: int
    effective_from: datetime
    effective_until: datetime | None = None
    created_by: str
    approved_by: str | None = None
    approval_timestamp: datetime | None = None
    created_at: datetime
    updated_at: datetime


class ServiceCategoryInfo(BaseModel):
    id: str
    code: str
    name: str
    category_type: str
    is_accepted: bool = True


class ServiceDirectoryResponse(BaseModel):
    service_area_id: str
    service_area_name: str
    administrative_area: str
    is_service_active: bool
    active_cdoa: CDOAResponse | None = None
    accepted_categories: list[ServiceCategoryInfo] = Field(default_factory=list)
    schedule_notes: str | None = None
    daily_capacity_limit_kg: float | None = None
    escalation_channel: str | None = None
    unavailability_reason: str | None = None


# ==============================================================================
# Destination Clean Loop Index (DCLI) Experimental Analytics
# ==============================================================================


class DCLISubscore(BaseModel):
    dimension: str
    weight_percent: float
    score: float | None = None
    description: str
    coverage_metric: str


class DCLIResponse(BaseModel):
    service_area_id: str
    service_area_name: str
    status: str
    overall_score: float | None = None
    minimum_coverage_reached: bool
    data_coverage_percent: float
    confidence_level: str
    subscores: list[DCLISubscore] = Field(default_factory=list)
    total_pickups_analyzed: int
    total_weight_kg_analyzed: float
    disclaimer: str = (
        "Destination Clean Loop Index (DCLI) adalah indikator eksperimental internal berbasis data "
        "operasional aktual. Indikator ini BUKAN sertifikasi lingkungan formal, audit kepatuhan hukum, "
        "atau klaim net-zero/carbon neutral."
    )
