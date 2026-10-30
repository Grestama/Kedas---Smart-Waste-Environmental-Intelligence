"""WasteLink Bali — Facility, Stock Movement, and Waste Bank Domain ORM Models."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class FacilityType(StrEnum):
    TPS3R = "TPS3R"
    TPST = "TPST"
    BANK_SAMPAH = "BANK_SAMPAH"
    MATERIAL_RECOVERY = "MATERIAL_RECOVERY"


class QualityGrade(StrEnum):
    GRADE_A = "GRADE_A"
    GRADE_B = "GRADE_B"
    GRADE_C = "GRADE_C"
    REJECTED = "REJECTED"


class ReceiptStatus(StrEnum):
    ACCEPTED = "ACCEPTED"
    PARTIALLY_ACCEPTED = "PARTIALLY_ACCEPTED"
    REJECTED = "REJECTED"


class MovementType(StrEnum):
    INTAKE_RECEIPT = "INTAKE_RECEIPT"
    SORTING_IN = "SORTING_IN"
    SORTING_OUTPUT = "SORTING_OUTPUT"
    SORTING_RESIDUE = "SORTING_RESIDUE"
    PROCESSING_OUTPUT = "PROCESSING_OUTPUT"
    HANDOVER_OUT = "HANDOVER_OUT"
    STOCK_ADJUSTMENT = "STOCK_ADJUSTMENT"


class BankTransactionType(StrEnum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    ADJUSTMENT = "ADJUSTMENT"
    REVERSAL = "REVERSAL"


class Facility(Base):
    """Operational receiving facility (e.g. TPS3R Sukawati, Bank Sampah Banjar)."""

    __tablename__ = "facilities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    facility_type: Mapped[str] = mapped_column(String(50), nullable=False, default=FacilityType.TPS3R.value)
    service_area_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True, index=True
    )
    address: Mapped[str] = mapped_column(Text, nullable=False)
    capacity_kg_per_day: Mapped[float] = mapped_column(Numeric(10, 2), default=2000.0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    receipts: Mapped[list[FacilityReceipt]] = relationship("FacilityReceipt", back_populates="facility")
    movements: Mapped[list[StockMovement]] = relationship("StockMovement", back_populates="facility")
    waste_bank_members: Mapped[list[WasteBankMember]] = relationship("WasteBankMember", back_populates="facility")


class FacilityReceipt(Base):
    """Immutable intake receipt record at facility intake workstation."""

    __tablename__ = "facility_receipts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    receipt_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    facility_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("facilities.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    pickup_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("pickup_requests.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("waste_categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    receiver_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    sender_user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    gross_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    tare_weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    received_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    discrepancy_kg: Mapped[float] = mapped_column(Numeric(10, 3), default=0.0, nullable=False)
    discrepancy_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    quality_grade: Mapped[str] = mapped_column(String(32), default=QualityGrade.GRADE_A.value, nullable=False)
    contamination_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)
    receipt_status: Mapped[str] = mapped_column(String(32), default=ReceiptStatus.ACCEPTED.value, nullable=False, index=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    facility: Mapped[Facility] = relationship("Facility", back_populates="receipts")


class StockMovement(Base):
    """Append-only audit trail of physical material stock changes in facility."""

    __tablename__ = "stock_movements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("facilities.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("waste_categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    batch_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("material_batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    movement_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    quantity_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    reference_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    actor_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    facility: Mapped[Facility] = relationship("Facility", back_populates="movements")


class WasteBankMember(Base):
    """Banjar community member account in local waste bank."""

    __tablename__ = "waste_bank_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_no: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    facility_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("facilities.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    current_balance_idr: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    facility: Mapped[Facility] = relationship("Facility", back_populates="waste_bank_members")
    transactions: Mapped[list[WasteBankTransaction]] = relationship(
        "WasteBankTransaction", back_populates="member", cascade="all, delete-orphan"
    )


class WasteBankTransaction(Base):
    """Append-only monetary savings ledger transaction for waste bank members."""

    __tablename__ = "waste_bank_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_no: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    member_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("waste_bank_members.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("waste_categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    transaction_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    weight_kg: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    unit_price_idr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    amount_idr: Mapped[int] = mapped_column(BigInteger, nullable=False)
    running_balance_idr: Mapped[int] = mapped_column(BigInteger, nullable=False)
    receipt_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    reverses_transaction_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    recorded_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(32), default="CONFIRMED", nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    member: Mapped[WasteBankMember] = relationship("WasteBankMember", back_populates="transactions")
