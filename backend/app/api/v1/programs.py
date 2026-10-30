"""WasteLink Bali — Programs, CSR Funding & Regional Budget Allocation Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.funding import service as funding_service
from app.modules.funding.schemas import (
    BudgetAllocationCreateRequest,
    BudgetAllocationResponse,
    ProgramCreateRequest,
    ProgramResponse,
    SponsorshipCreateRequest,
    SponsorshipResponse,
)

router = APIRouter(prefix="/programs", tags=["Programs & Funding"])
require_program_admin = RequireRole("ADMIN", "PROGRAM_MANAGER")
require_finance_admin = RequireRole("ADMIN", "PROGRAM_MANAGER", "FINANCE")


@router.post(
    "",
    response_model=ProgramResponse,
    status_code=201,
    summary="[Admin/Program Manager] Daftarkan program pendanaan, CSR, atau hibah",
)
async def create_program(
    req: ProgramCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_program_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> ProgramResponse:
    request_id = getattr(request.state, "request_id", None)
    program = funding_service.create_funding_program(
        db, req=req, actor_id=actor.id, request_id=request_id
    )
    return ProgramResponse.model_validate(program)


@router.get(
    "",
    response_model=list[ProgramResponse],
    summary="Daftar program pendanaan dan CSR aktif",
)
async def list_programs(
    db: Annotated[Session, Depends(get_db_session)],
    program_type: str | None = None,
    status: str | None = None,
) -> list[ProgramResponse]:
    programs = funding_service.list_funding_programs(
        db, program_type=program_type, status=status
    )
    return [ProgramResponse.model_validate(p) for p in programs]


@router.post(
    "/{id}/sponsorships",
    response_model=SponsorshipResponse,
    status_code=201,
    summary="[Admin/Finance] Catat penerimaan dana sponsor CSR / hibah lingkungan",
)
async def record_sponsorship(
    id: str,
    req: SponsorshipCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_finance_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> SponsorshipResponse:
    request_id = getattr(request.state, "request_id", None)
    sponsorship = funding_service.record_sponsorship(
        db, program_id=id, req=req, actor_id=actor.id, request_id=request_id
    )
    return SponsorshipResponse.model_validate(sponsorship)


@router.post(
    "/{id}/allocations",
    response_model=BudgetAllocationResponse,
    status_code=201,
    summary="[Admin/Program Manager] Alokasikan anggaran program ke wilayah Banjar/Desa tertentu",
)
async def allocate_budget(
    id: str,
    req: BudgetAllocationCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_program_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> BudgetAllocationResponse:
    request_id = getattr(request.state, "request_id", None)
    allocation = funding_service.allocate_program_budget(
        db, program_id=id, req=req, actor_id=actor.id, request_id=request_id
    )
    return BudgetAllocationResponse.model_validate(allocation)
