"""WasteLink Bali — Circular Marketplace, Material Batches, and Delivery Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


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


class Partner(Base):
    """Verified buyer/processor receiving sorted material batches."""

    __tablename__ = "partners"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=PartnerVerificationStatus.VERIFIED, index=True
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
        String(50), nullable=False, default=BatchStatus.BATCHED, index=True
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
        String(50), nullable=False, default=DeliveryStatus.DISPATCHED, index=True
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
