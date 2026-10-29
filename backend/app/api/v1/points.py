"""WasteLink Bali — WastePoints API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole, get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.points import service as points_service
from app.modules.points.schemas import (
    AdminPointAdjustmentRequest,
    LedgerEntryResponse,
    RewardRuleCreateRequest,
    RewardRuleResponse,
    UserBalanceResponse,
)

router = APIRouter()
require_admin = RequireRole("ADMIN")
require_finance = RequireRole("ADMIN", "FINANCE")


@router.get(
    "/points/balance",
    response_model=UserBalanceResponse,
    summary="Lihat total saldo WastePoints aktif milik sendiri",
)
async def get_my_balance(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> UserBalanceResponse:
    balance = points_service.get_user_balance(db, current_user.id)
    return UserBalanceResponse(user_id=current_user.id, current_balance=balance)


@router.get(
    "/points/ledger",
    response_model=list[LedgerEntryResponse],
    summary="Lihat histori mutasi transaksi buku besar (ledger) poin milik sendiri",
)
async def get_my_ledger(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[LedgerEntryResponse]:
    entries = points_service.list_user_ledger(db, current_user.id)
    return [LedgerEntryResponse.model_validate(e) for e in entries]


@router.post(
    "/admin/points/rules",
    response_model=RewardRuleResponse,
    status_code=201,
    summary="[Admin] Konfigurasi versi aturan reward poin per kategori sampah",
)
async def create_point_rule(
    req: RewardRuleCreateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> RewardRuleResponse:
    rule = points_service.create_reward_rule(db, creator_id=admin.id, req=req)
    return RewardRuleResponse.model_validate(rule)


@router.post(
    "/admin/points/adjust",
    response_model=LedgerEntryResponse,
    status_code=201,
    summary="[Admin/Finance] Penyesuaian poin manual dengan batas saldo dan idempotency",
)
async def adjust_points(
    req: AdminPointAdjustmentRequest,
    request: Request,
    admin: Annotated[User, Depends(require_finance)],
    db: Annotated[Session, Depends(get_db_session)],
) -> LedgerEntryResponse:
    request_id = getattr(request.state, "request_id", None)
    entry = points_service.admin_adjust_points(db, admin=admin, req=req, request_id=request_id)
    return LedgerEntryResponse.model_validate(entry)
