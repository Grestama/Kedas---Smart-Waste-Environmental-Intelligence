"""WasteLink Bali — Inspection Domain Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class InspectionResult(StrEnum):
    ACCEPTED = "ACCEPTED"
    ACCEPTED_WITH_CONTAMINATION = "ACCEPTED_WITH_CONTAMINATION"
    PARTIALLY_ACCEPTED = "PARTIALLY_ACCEPTED"
    REJECTED = "REJECTED"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class ContaminationLevel(StrEnum):
    NONE = "NONE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class InspectionRecord(Base):
    """Quality control inspection record performed by a collector or operator."""

    __tablename__ = "inspection_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    pickup_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("pickup_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    inspector_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    result: Mapped[str] = mapped_column(String(50), nullable=False)
    contamination_level: Mapped[str] = mapped_column(
        String(50), nullable=False, default=ContaminationLevel.NONE
    )
    accepted_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    rejected_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    rejection_reason_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rejection_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    pickup: Mapped[object] = relationship("PickupRequest", backref="inspections", lazy="joined")
    inspector: Mapped[object] = relationship("User", lazy="joined")
