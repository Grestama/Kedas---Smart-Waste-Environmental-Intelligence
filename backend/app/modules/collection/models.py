"""WasteLink Bali — Service Area, Scheduling, and Waste Collection ORM Models."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base, TimestampMixin


class PickupStatus(StrEnum):
    SUBMITTED = "SUBMITTED"
    PENDING_ASSIGNMENT = "PENDING_ASSIGNMENT"
    ACCEPTED = "ACCEPTED"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED = "ARRIVED"
    INSPECTION = "INSPECTION"
    WEIGHED = "WEIGHED"
    COLLECTED = "COLLECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class ServiceArea(Base, TimestampMixin):
    """Geographic operational service area (pilot banjar/desa)."""

    __tablename__ = "service_areas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    administrative_area: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    slots: Mapped[list[CollectionSlot]] = relationship(
        "CollectionSlot", back_populates="service_area", cascade="all, delete-orphan"
    )
    pickups: Mapped[list[PickupRequest]] = relationship(
        "PickupRequest", back_populates="service_area"
    )


class CollectionSlot(Base, TimestampMixin):
    """Collection schedule slot with capacity constraints."""

    __tablename__ = "collection_slots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    max_capacity: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    booked_capacity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    service_area: Mapped[ServiceArea] = relationship("ServiceArea", back_populates="slots")
    pickups: Mapped[list[PickupRequest]] = relationship("PickupRequest", back_populates="slot")

    @property
    def is_available(self) -> bool:
        return self.is_active and (self.booked_capacity < self.max_capacity)

    @property
    def remaining_capacity(self) -> int:
        return max(0, self.max_capacity - self.booked_capacity)


class PickupRequest(Base, TimestampMixin):
    """Waste pickup request entity."""

    __tablename__ = "pickup_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    reporter_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("waste_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    address_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("user_addresses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    slot_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("collection_slots.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(32), default=PickupStatus.SUBMITTED.value, nullable=False, index=True
    )
    service_mode: Mapped[str] = mapped_column(
        String(32), default="PICKUP", nullable=False, index=True
    )
    idempotency_key: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    assigned_collector_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    estimated_weight_kg: Mapped[float | None] = mapped_column(
        Numeric(precision=8, scale=2), nullable=True
    )
    actual_weight_kg: Mapped[float | None] = mapped_column(
        Numeric(precision=10, scale=3), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    @property
    def tracking_code(self) -> str:
        return self.public_code

    @property
    def user_id(self) -> str:
        return self.reporter_user_id

    @property
    def collector_id(self) -> str | None:
        return self.assigned_collector_id

    # Relationships
    service_area: Mapped[ServiceArea] = relationship("ServiceArea", back_populates="pickups")
    slot: Mapped[CollectionSlot] = relationship("CollectionSlot", back_populates="pickups")
    events: Mapped[list[PickupStatusEvent]] = relationship(
        "PickupStatusEvent",
        back_populates="pickup_request",
        cascade="all, delete-orphan",
        order_by="PickupStatusEvent.created_at.asc()",
    )

    __table_args__ = (
        Index("ix_pickups_area_status", "service_area_id", "status"),
        Index("ix_pickups_reporter_status", "reporter_user_id", "status"),
        Index("ix_pickups_collector_status", "assigned_collector_id", "status"),
        Index("ix_pickups_reporter_idempotency", "reporter_user_id", "idempotency_key"),
        Index("ix_pickups_service_mode", "service_mode"),
    )


class PickupStatusEvent(Base):
    """Append-only audit trail of pickup request state transitions."""

    __tablename__ = "pickup_status_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pickup_request_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("pickup_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    from_status: Mapped[str] = mapped_column(String(32), nullable=False)
    to_status: Mapped[str] = mapped_column(String(32), nullable=False)
    actor_user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False, index=True
    )

    pickup_request: Mapped[PickupRequest] = relationship("PickupRequest", back_populates="events")

    __table_args__ = (Index("ix_pickup_events_req_created", "pickup_request_id", "created_at"),)
