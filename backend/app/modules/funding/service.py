"""WasteLink Bali — Funding & Budget Domain Service."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, ConflictError, ErrorCode, NotFoundError, ValidationError
from app.db.base import AuditLog
from app.modules.funding.models import (
    FundingProgram,
    FundingProgramStatus,
    ProgramBudgetAllocation,
    ProgramSponsorship,
)
from app.modules.funding.schemas import (
    BudgetAllocationCreateRequest,
    ProgramCreateRequest,
    SponsorshipCreateRequest,
)


def get_or_create_default_funding(db: Session) -> FundingProgram:
    """Return an active funding program or initialize the default pilot program."""
    stmt = (
        select(FundingProgram)
        .where(FundingProgram.status == FundingProgramStatus.ACTIVE.value)
        .order_by(FundingProgram.created_at.asc())
    )
    prog = db.scalar(stmt)
    if not prog:
        prog = FundingProgram(
            code="BALI_CLEAN_PILOT_2026",
            name="Program Revitalisasi Banjar Bersih Bali",
            total_budget_idr=100_000_000,
            points_capacity=1_000_000,
            total_points_disbursed=0,
            status=FundingProgramStatus.ACTIVE.value,
        )
        db.add(prog)
        db.flush()
    return prog


def reserve_and_disburse_points(db: Session, points_amount: int) -> FundingProgram:
    """Safely check and disburse points against active funding budget with row lock."""
    stmt = (
        select(FundingProgram)
        .where(FundingProgram.status == FundingProgramStatus.ACTIVE.value)
        .with_for_update()
        .order_by(FundingProgram.created_at.asc())
    )
    program = db.scalar(stmt)
    if not program:
        # Fallback to create default if none exists
        program = get_or_create_default_funding(db)
        # re-select with row lock
        stmt = select(FundingProgram).where(FundingProgram.id == program.id).with_for_update()
        program = db.scalar(stmt)

    assert program is not None
    if program.total_points_disbursed + points_amount > program.points_capacity:
        raise AppError(
            code=ErrorCode.VALIDATION_ERROR,
            message="Kapasitas kuota reward poin pada program pendanaan saat ini telah habis.",
            status_code=400,
        )

    program.total_points_disbursed += points_amount
    if program.total_points_disbursed >= program.points_capacity:
        program.status = FundingProgramStatus.EXHAUSTED.value

    db.flush()
    return program


def reimburse_points(db: Session, points_amount: int) -> None:
    """Return points to active funding program upon reward reversal."""
    stmt = select(FundingProgram).order_by(FundingProgram.created_at.asc()).with_for_update()
    program = db.scalar(stmt)
    if program:
        program.total_points_disbursed = max(0, program.total_points_disbursed - points_amount)
        if program.status == FundingProgramStatus.EXHAUSTED.value:
            program.status = FundingProgramStatus.ACTIVE.value
        db.flush()


# ==============================================================================
# Phase 6: Programs, Sponsorships & Budget Allocations
# ==============================================================================


def create_funding_program(
    db: Session, req: ProgramCreateRequest, actor_id: str, request_id: str | None = None
) -> FundingProgram:
    """Create a new CSR or government funding program."""
    existing = db.scalar(select(FundingProgram).where(FundingProgram.code == req.code))
    if existing:
        raise ConflictError(f"Kode program pendanaan '{req.code}' sudah terdaftar.")

    program = FundingProgram(
        code=req.code,
        name=req.name,
        sponsor_name=req.sponsor_name,
        program_type=req.program_type.value,
        target_service_area_id=req.target_service_area_id,
        total_budget_idr=req.total_budget_idr,
        disbursed_budget_idr=0,
        points_capacity=req.points_capacity,
        total_points_disbursed=0,
        status=FundingProgramStatus.ACTIVE.value,
    )
    db.add(program)
    db.flush()

    audit = AuditLog(
        action="FUNDING_PROGRAM_CREATED",
        entity_type="funding_programs",
        entity_id=program.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Pendaftaran program pendanaan {req.name} ({req.code})",
    )
    db.add(audit)
    db.commit()
    db.refresh(program)
    return program


def list_funding_programs(
    db: Session, program_type: str | None = None, status: str | None = None
) -> list[FundingProgram]:
    """List funding programs with optional type/status filters."""
    query = select(FundingProgram).order_by(FundingProgram.created_at.desc())
    if program_type:
        query = query.where(FundingProgram.program_type == program_type)
    if status:
        query = query.where(FundingProgram.status == status)
    return list(db.scalars(query).all())


def record_sponsorship(
    db: Session,
    program_id: str,
    req: SponsorshipCreateRequest,
    actor_id: str,
    request_id: str | None = None,
) -> ProgramSponsorship:
    """Record an incoming CSR/donor sponsorship injection into a program budget."""
    program = db.scalar(select(FundingProgram).where(FundingProgram.id == program_id).with_for_update())
    if not program:
        raise NotFoundError(f"Program pendanaan dengan ID '{program_id}' tidak ditemukan.")

    sponsorship = ProgramSponsorship(
        program_id=program.id,
        sponsor_name=req.sponsor_name,
        sponsor_type=req.sponsor_type.value,
        amount_idr=req.amount_idr,
        contract_ref=req.contract_ref,
        contributed_at=datetime.now(UTC),
        notes=req.notes,
    )
    db.add(sponsorship)

    # Increase program budget
    program.total_budget_idr += req.amount_idr
    if program.status == FundingProgramStatus.EXHAUSTED.value:
        program.status = FundingProgramStatus.ACTIVE.value

    audit = AuditLog(
        action="SPONSORSHIP_CONTRIBUTED",
        entity_type="program_sponsorships",
        entity_id=sponsorship.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Penerimaan dana CSR/sponsor {req.sponsor_name} sebesar Rp {req.amount_idr:,}",
    )
    db.add(audit)
    db.commit()
    db.refresh(sponsorship)
    return sponsorship


def allocate_program_budget(
    db: Session,
    program_id: str,
    req: BudgetAllocationCreateRequest,
    actor_id: str,
    request_id: str | None = None,
) -> ProgramBudgetAllocation:
    """Allocate budget from a program to a specific banjar/service area."""
    program = db.scalar(select(FundingProgram).where(FundingProgram.id == program_id).with_for_update())
    if not program:
        raise NotFoundError(f"Program pendanaan dengan ID '{program_id}' tidak ditemukan.")

    available_budget = program.total_budget_idr - program.disbursed_budget_idr
    if req.allocated_amount_idr > available_budget:
        raise ValidationError(
            f"Alokasi anggaran (Rp {req.allocated_amount_idr:,}) melebihi sisa anggaran program yang tersedia (Rp {available_budget:,})."
        )

    allocation = ProgramBudgetAllocation(
        program_id=program.id,
        service_area_id=req.service_area_id,
        allocated_amount_idr=req.allocated_amount_idr,
        spent_amount_idr=0,
        purpose=req.purpose,
        allocated_at=datetime.now(UTC),
    )
    db.add(allocation)
    program.disbursed_budget_idr += req.allocated_amount_idr

    audit = AuditLog(
        action="PROGRAM_BUDGET_ALLOCATED",
        entity_type="program_budget_allocations",
        entity_id=allocation.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Alokasi anggaran Rp {req.allocated_amount_idr:,} ke wilayah {req.service_area_id} untuk '{req.purpose}'",
    )
    db.add(audit)
    db.commit()
    db.refresh(allocation)
    return allocation
