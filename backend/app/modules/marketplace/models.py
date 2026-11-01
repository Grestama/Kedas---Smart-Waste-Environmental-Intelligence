"""WasteLink Bali — Circular Marketplace, Material Batches, Organic Processing & B2B Domain Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class PartnerType(StrEnum):
    PENGEPUL = "PENGEPUL"
    AGREGATOR = "AGREGATOR"
    PENDAUR_ULANG = "PENDAUR_ULANG"
    PENGERAJIN = "PENGERAJIN"
    PENGOLAH_ORGANIK = "PENGOLAH_ORGANIK"


class PartnerVerificationStatus(StrEnum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    SUSPENDED = "SUSPENDED"


class BatchStatus(StrEnum):
    COLLECTED = "COLLECTED"
    BATCHED = "BATCHED"
    ALLOCATED = "ALLOCATED"
    SHIPPED = "SHIPPED"
    RECEIVED = "RECEIVED"
    PROCESSED_CONFIRMED = "PROCESSED_CONFIRMED"


class DeliveryStatus(StrEnum):
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    DISPUTED = "DISPUTED"


class OfferType(StrEnum):
    SUPPLY = "SUPPLY"
    DEMAND = "DEMAND"


class OfferStatus(StrEnum):
    OPEN = "OPEN"
    ALLOCATED = "ALLOCATED"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class OrganicProcessType(StrEnum):
    COMPOSTING_AEROBIC = "COMPOSTING_AEROBIC"
    MAGGOT_BSF = "MAGGOT_BSF"
    ANAEROBIC_DIGESTION = "ANAEROBIC_DIGESTION"


class OrganicStatus(StrEnum):
    IN_PROGRESS = "IN_PROGRESS"
    MATURED = "MATURED"
    HARVESTED = "HARVESTED"
    FAILED = "FAILED"


class B2BBusinessType(StrEnum):
    HOTEL = "HOTEL"
    RESTAURANT = "RESTAURANT"
    VILLA = "VILLA"
    MARKET = "MARKET"
    OFFICE = "OFFICE"
    COMMERCIAL = "COMMERCIAL"


class B2BPickupStatus(StrEnum):
    SCHEDULED = "SCHEDULED"
    DISPATCHED = "DISPATCHED"
    COLLECTED = "COLLECTED"
    RECEIVED_FACILITY = "RECEIVED_FACILITY"
    PROCESSED = "PROCESSED"
    CANCELLED = "CANCELLED"


class Partner(Base):
    """Verified buyer/processor receiving sorted material batches."""

    __tablename__ = "partners"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    partner_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=PartnerType.PENDAUR_ULANG.value, index=True
    )
    capacity_kg_per_month: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    service_area_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True
    )
    verification_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=PartnerVerificationStatus.VERIFIED.value, index=True
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class MaterialBatch(Base):
    """Aggregated verified materials prepared for circular economy processing."""

    __tablename__ = "material_batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    batch_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("waste_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    total_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=BatchStatus.BATCHED.value, index=True
    )
    created_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
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

    # Relationships
    category: Mapped[object] = relationship("WasteCategory", lazy="joined")
    creator: Mapped[object] = relationship("User", lazy="joined")
    items: Mapped[list[MaterialBatchItem]] = relationship(
        "MaterialBatchItem", back_populates="batch", cascade="all, delete-orphan", lazy="selectin"
    )
    deliveries: Mapped[list[DeliveryRecord]] = relationship(
        "DeliveryRecord", back_populates="batch", lazy="selectin"
    )


class MaterialBatchItem(Base):
    """Traceable link connecting a verified pickup request to a material batch."""

    __tablename__ = "material_batch_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    batch_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("material_batches.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    pickup_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("pickup_requests.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)

    # Relationships
    batch: Mapped[MaterialBatch] = relationship("MaterialBatch", back_populates="items")
    pickup: Mapped[object] = relationship("PickupRequest", lazy="joined")


class DeliveryRecord(Base):
    """Manifest of material batch shipment and receipt confirmation."""

    __tablename__ = "delivery_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    batch_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("material_batches.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    partner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("partners.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    dispatched_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    received_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    weight_discrepancy_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=DeliveryStatus.DISPATCHED.value, index=True
    )
    dispatched_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    dispatched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    batch: Mapped[MaterialBatch] = relationship("MaterialBatch", back_populates="deliveries")
    partner: Mapped[Partner] = relationship("Partner", lazy="joined")
    dispatcher: Mapped[object] = relationship("User", lazy="joined")


class MaterialOffer(Base):
    """Confirmed material demand or supply posting with indicative price and expiration."""

    __tablename__ = "material_offers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    offer_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    offer_type: Mapped[str] = mapped_column(
        String(32), nullable=False, index=True
    )  # SUPPLY vs DEMAND
    partner_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("partners.id", ondelete="SET NULL"), nullable=True
    )
    facility_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("facilities.id", ondelete="SET NULL"), nullable=True
    )
    category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("waste_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    min_quantity_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    max_quantity_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    quality_grade: Mapped[str] = mapped_column(String(32), nullable=False, default="GRADE_A")
    price_indicative_idr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    valid_until: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=OfferStatus.OPEN.value, index=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class OrganicProcessingRecord(Base):
    """Verified organic waste processing record (Composting, Maggot BSF bioconversion)."""

    __tablename__ = "organic_processing_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    batch_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    facility_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("facilities.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    operator_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    process_type: Mapped[str] = mapped_column(String(50), nullable=False)
    input_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    output_product_weight_kg: Mapped[float] = mapped_column(
        Numeric(10, 3), nullable=False, default=0.0
    )
    residue_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=OrganicStatus.IN_PROGRESS.value, index=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class B2BOrganization(Base):
    """Commercial waste generator (Hotel, Restaurant, Villa, Supermarket, Office)."""

    __tablename__ = "b2b_organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    business_type: Mapped[str] = mapped_column(String(50), nullable=False)
    tax_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    billing_contact_name: Mapped[str] = mapped_column(String(100), nullable=False)
    billing_contact_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    billing_contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    locations: Mapped[list[B2BLocation]] = relationship(
        "B2BLocation", back_populates="organization", cascade="all, delete-orphan"
    )
    members: Mapped[list[B2BOrganizationMember]] = relationship(
        "B2BOrganizationMember", back_populates="organization", cascade="all, delete-orphan"
    )


class B2BOrganizationMember(Base):
    """Authorized user managing a B2B commercial client organization."""

    __tablename__ = "b2b_organization_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    organization_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("b2b_organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(32), default="STAFF", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    organization: Mapped[B2BOrganization] = relationship(
        "B2BOrganization", back_populates="members"
    )
    __table_args__ = (UniqueConstraint("organization_id", "user_id", name="uq_b2b_org_user"),)


class B2BLocation(Base):
    """Specific commercial generation site (e.g. Hotel Main Kitchen, Villa Cluster B)."""

    __tablename__ = "b2b_locations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    organization_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("b2b_organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    service_area_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True, index=True
    )
    contact_person: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    estimated_daily_kg: Mapped[float] = mapped_column(Numeric(10, 2), default=50.0, nullable=False)
    pickup_frequency: Mapped[str] = mapped_column(String(50), default="DAILY", nullable=False)
    access_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    organization: Mapped[B2BOrganization] = relationship(
        "B2BOrganization", back_populates="locations"
    )
    pickups: Mapped[list[B2BPickupRequest]] = relationship(
        "B2BPickupRequest", back_populates="location"
    )


class B2BPickupRequest(Base):
    """Commercial pickup order scheduled for a B2B location."""

    __tablename__ = "b2b_pickup_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    request_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    location_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("b2b_locations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("waste_categories.id", ondelete="RESTRICT"), nullable=False
    )
    scheduled_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    estimated_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    actual_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default=B2BPickupStatus.SCHEDULED.value, nullable=False, index=True
    )
    collector_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    location: Mapped[B2BLocation] = relationship("B2BLocation", back_populates="pickups")
