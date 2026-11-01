"""WasteLink Bali — WastePoints Domain Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class RewardRuleStatus(StrEnum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    DEPRECATED = "DEPRECATED"


class LedgerEntryType(StrEnum):
    EARNED_PICKUP = "EARNED_PICKUP"
    REDEMPTION = "REDEMPTION"
    ADJUSTMENT = "ADJUSTMENT"
    REVERSAL = "REVERSAL"


class LedgerEntryStatus(StrEnum):
    POSTED = "POSTED"
    REVERSED = "REVERSED"


class RewardRule(Base):
    """Versioned point reward calculation rule per waste category."""

    __tablename__ = "reward_rules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("waste_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=RewardRuleStatus.ACTIVE, index=True
    )
    points_per_kg: Mapped[int] = mapped_column(Integer, nullable=False)
    minimum_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False, default=0.100)
    max_points_per_pickup: Mapped[int | None] = mapped_column(Integer, nullable=True)
    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    category: Mapped[object] = relationship("WasteCategory", lazy="joined")
    creator: Mapped[object] = relationship("User", lazy="joined")


class LedgerEntry(Base):
    """Immutable, append-only transaction ledger for WastePoints."""

    __tablename__ = "ledger_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    points_delta: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=LedgerEntryStatus.POSTED, index=True
    )
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    idempotency_key: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False, index=True
    )
    rule_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)
    actor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    reverses_entry_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("ledger_entries.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False, index=True
    )

    # Relationships
    user: Mapped[object] = relationship("User", foreign_keys=[user_id], lazy="joined")
    actor: Mapped[object] = relationship("User", foreign_keys=[actor_id], lazy="joined")
    reversed_entry: Mapped[object] = relationship("LedgerEntry", remote_side=[id], lazy="selectin")
