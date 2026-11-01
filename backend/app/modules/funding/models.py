"""WasteLink Bali — Funding & Budget Domain Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class FundingProgramStatus(StrEnum):
    ACTIVE = "ACTIVE"
    EXHAUSTED = "EXHAUSTED"
    SUSPENDED = "SUSPENDED"


class ProgramType(StrEnum):
    COMMUNITY = "COMMUNITY"
    CSR = "CSR"
    GOVERNMENT_GRANT = "GOVERNMENT_GRANT"
    DONATION = "DONATION"


class SponsorType(StrEnum):
    CSR = "CSR"
    GOVERNMENT = "GOVERNMENT"
    FOUNDATION = "FOUNDATION"
    INDIVIDUAL = "INDIVIDUAL"
    COMMUNITY = "COMMUNITY"


class FundingProgram(Base):
    """Funding source providing budget backing for WastePoints and circular operations."""

    __tablename__ = "funding_programs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sponsor_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    program_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=ProgramType.COMMUNITY.value
    )
    target_service_area_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True
    )
    total_budget_idr: Mapped[int] = mapped_column(BigInteger, nullable=False)
    disbursed_budget_idr: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    total_points_disbursed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    points_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=FundingProgramStatus.ACTIVE.value, index=True
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

    sponsorships: Mapped[list[ProgramSponsorship]] = relationship(
        "ProgramSponsorship", back_populates="program", cascade="all, delete-orphan"
    )
    allocations: Mapped[list[ProgramBudgetAllocation]] = relationship(
        "ProgramBudgetAllocation", back_populates="program", cascade="all, delete-orphan"
    )


class ProgramSponsorship(Base):
    """Sponsorship contributions or CSR funding injected into programs."""

    __tablename__ = "program_sponsorships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("funding_programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sponsor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    sponsor_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=SponsorType.CSR.value
    )
    amount_idr: Mapped[int] = mapped_column(BigInteger, nullable=False)
    contract_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contributed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    program: Mapped[FundingProgram] = relationship("FundingProgram", back_populates="sponsorships")


class ProgramBudgetAllocation(Base):
    """Regional/Banjar budget allocation of funding programs."""

    __tablename__ = "program_budget_allocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("funding_programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    allocated_amount_idr: Mapped[int] = mapped_column(BigInteger, nullable=False)
    spent_amount_idr: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    purpose: Mapped[str] = mapped_column(String(255), nullable=False)
    allocated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    program: Mapped[FundingProgram] = relationship("FundingProgram", back_populates="allocations")
