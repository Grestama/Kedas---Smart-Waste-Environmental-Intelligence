"""WasteLink Bali — Community Banjar, Clean-up Actions & Hazardous Waste Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class CommunityEventType(StrEnum):
    GOTONG_ROYONG = "GOTONG_ROYONG"
    EDUCATION = "EDUCATION"
    BULK_COLLECTION = "BULK_COLLECTION"
    CEREMONY_CLEANUP = "CEREMONY_CLEANUP"


class CommunityEventStatus(StrEnum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ComplaintStatus(StrEnum):
    REPORTED = "REPORTED"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class CleanupActionType(StrEnum):
    BEACH_CLEANUP = "BEACH_CLEANUP"
    RIVER_CLEANUP = "RIVER_CLEANUP"
    PUBLIC_PARK = "PUBLIC_PARK"
    COMMUNITY_VOLUNTEERING = "COMMUNITY_VOLUNTEERING"


class CleanupActionStatus(StrEnum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    VERIFIED = "VERIFIED"


class HazardType(StrEnum):
    TOXIC = "TOXIC"
    CORROSIVE = "CORROSIVE"
    FLAMMABLE = "FLAMMABLE"
    INFECTIOUS = "INFECTIOUS"
    E_WASTE = "E_WASTE"
    BATTERY = "BATTERY"


class HazardousManifestStatus(StrEnum):
    COLLECTED = "COLLECTED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED_TO_FACILITY = "DELIVERED_TO_FACILITY"
    SAFELY_DISPOSED = "SAFELY_DISPOSED"


class BanjarProfile(Base):
    """Banjar and Desa Adat institutional and territorial profile."""

    __tablename__ = "banjar_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    desa_adat_name: Mapped[str] = mapped_column(String(150), nullable=False)
    kelian_banjar_name: Mapped[str] = mapped_column(String(150), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    household_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    target_sorting_percent: Mapped[float] = mapped_column(
        Numeric(5, 2), nullable=False, default=70.0
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )


class BanjarOfficial(Base):
    """Prajuru and officials assigned to a specific Banjar/Desa."""

    __tablename__ = "banjar_officials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    official_title: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class CommunityEvent(Base):
    """Banjar collective collection events, gotong royong, and workshops."""

    __tablename__ = "community_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    event_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=CommunityEventType.GOTONG_ROYONG.value
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=CommunityEventStatus.SCHEDULED.value, index=True
    )
    organizer_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    expected_attendees: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    actual_attendees: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class CommunityComplaint(Base):
    """Citizen and officer waste grievances, dump sites, and escalations in Banjar."""

    __tablename__ = "community_complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    ticket_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reporter_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location_detail: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=ComplaintStatus.REPORTED.value, index=True
    )
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class CleanupAction(Base):
    """Volunteer beach cleanups, river sweeps, and environmental action records (Role 11)."""

    __tablename__ = "cleanup_actions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    action_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    action_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=CleanupActionType.BEACH_CLEANUP.value, index=True
    )
    location_name: Mapped[str] = mapped_column(String(200), nullable=False)
    service_area_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True
    )
    coordinator_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_hours: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=2.0)
    volunteer_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_collected_weight_kg: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0
    )
    plastic_weight_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    organic_weight_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    residual_weight_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    evidence_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=CleanupActionStatus.PLANNED.value, index=True
    )
    verified_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class HazardousWasteManifest(Base):
    """Hazardous/special waste movement and destruction tracking manifest (Role 12)."""

    __tablename__ = "hazardous_waste_manifests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    manifest_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("waste_categories.id", ondelete="RESTRICT"), nullable=False
    )
    service_area_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True
    )
    source_pickup_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("pickup_requests.id", ondelete="SET NULL"), nullable=True
    )
    handler_partner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("partners.id", ondelete="RESTRICT"), nullable=False
    )
    transporter_license_no: Mapped[str] = mapped_column(String(100), nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    hazard_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=HazardType.TOXIC.value
    )
    handling_sop_code: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=HazardousManifestStatus.IN_TRANSIT.value, index=True
    )
    destruction_cert_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    disposed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class CDOAStatus(StrEnum):
    """Community Destination Operating Agreement lifecycle states."""

    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    SUPERSEDED = "SUPERSEDED"
    SUSPENDED = "SUSPENDED"


class CDOAAgreement(Base):
    """Community Destination Operating Agreement (CDOA) configuration entity.

    Versioned destination agreement governing service zones, source eligibility,
    material categories, operational schedules, capacity constraints, and SLAs.
    """

    __tablename__ = "cdoa_agreements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    agreement_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=CDOAStatus.DRAFT.value, index=True
    )
    eligible_source_types: Mapped[str] = mapped_column(
        String(255), nullable=False, default="HOUSEHOLD,HOREKA,COMMUNITY_EVENT"
    )
    accepted_category_ids: Mapped[str | None] = mapped_column(Text, nullable=True)
    primary_facility_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("facilities.id", ondelete="SET NULL"), nullable=True
    )
    collection_schedule_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    capacity_limit_daily_kg: Mapped[float] = mapped_column(Float, nullable=False, default=500.0)
    pic_name: Mapped[str] = mapped_column(String(100), nullable=False, default="Prajuru Banjar")
    pic_contact: Mapped[str] = mapped_column(String(50), nullable=False, default="08123456789")
    escalation_channel: Mapped[str] = mapped_column(
        String(100), nullable=False, default="Kantor Banjar / Balai Desa"
    )
    sla_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=24)
    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    effective_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    approved_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approval_timestamp: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

