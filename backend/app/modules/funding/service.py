"""WasteLink Bali — Funding & Budget Domain Service."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, ErrorCode
from app.modules.funding.models import FundingProgram, FundingProgramStatus


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
