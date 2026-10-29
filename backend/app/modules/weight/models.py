"""WasteLink Bali — Weight Domain Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WeighingMethod(StrEnum):
    MANUAL_SCALE = "MANUAL_SCALE"
    DIRECT_NET = "DIRECT_NET"
    AUTOMATED_SCALE = "AUTOMATED_SCALE"


class WeightVerificationStatus(StrEnum):
    DRAFT = "DRAFT"
    VERIFIED = "VERIFIED"
    SUPERSEDED = "SUPERSEDED"
    DISPUTED = "DISPUTED"


class WeightRecord(Base):
    """Immutable, versioned weight record with gross/tare/net audit trail."""

    __tablename__ = "weight_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    pickup_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("pickup_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    recorder_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    verifier_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    method: Mapped[str] = mapped_column(
        String(50), nullable=False, default=WeighingMethod.MANUAL_SCALE
    )
    gross_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    tare_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    net_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=WeightVerificationStatus.VERIFIED
    )
    supersedes_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("weight_records.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    correction_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    pickup: Mapped[object] = relationship("PickupRequest", backref="weights", lazy="joined")
    recorder: Mapped[object] = relationship("User", foreign_keys=[recorder_id], lazy="joined")
    verifier: Mapped[object] = relationship("User", foreign_keys=[verifier_id], lazy="joined")
    superseded_record: Mapped[object] = relationship(
        "WeightRecord", remote_side=[id], lazy="selectin"
    )
