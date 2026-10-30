"""WasteLink Bali — Facility, Sorting & Waste Bank API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
    require_admin,
    require_facility_staff,
    require_operator,
)
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.facility import service as facility_service
from app.modules.facility.schemas import (
    FacilityCreateRequest,
    FacilityReceiptCreateRequest,
    FacilityReceiptResponse,
    FacilityResponse,
    FacilityStockSummaryResponse,
    SortingProcessRequest,
    StockMovementResponse,
    WasteBankDepositRequest,
    WasteBankMemberCreateRequest,
    WasteBankMemberResponse,
    WasteBankReversalRequest,
    WasteBankTransactionResponse,
    WasteBankWithdrawRequest,
)

router = APIRouter()


# ==============================================================================
# Facilities Master Data
# ==============================================================================


@router.get(
    "",
    response_model=list[FacilityResponse],
    summary="Daftar fasilitas penerima (TPS3R, TPST, Bank Sampah)",
)
async def list_facilities(
    db: Annotated[Session, Depends(get_db_session)],
    active_only: bool = True,
) -> list[FacilityResponse]:
    facilities = facility_service.list_facilities(db, active_only=active_only)
    return [FacilityResponse.model_validate(f) for f in facilities]


@router.post(
    "",
    response_model=FacilityResponse,
    status_code=201,
    summary="[Admin] Daftarkan fasilitas baru",
)
async def create_facility(
    req: FacilityCreateRequest,
    current_admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> FacilityResponse:
    facility = facility_service.create_facility(db, req, actor_id=current_admin.id)
    return FacilityResponse.model_validate(facility)


@router.get(
    "/{id}",
    response_model=FacilityResponse,
    summary="Detail fasilitas operasional",
)
async def get_facility(
    id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> FacilityResponse:
    facility = facility_service.get_facility(db, id)
    return FacilityResponse.model_validate(facility)


# ==============================================================================
# Facility Intake Receipts
# ==============================================================================


@router.post(
    "/receipts",
    response_model=FacilityReceiptResponse,
    status_code=201,
    summary="[Staff/Operator] Catat tanda terima material masuk (Facility Intake Receipt)",
)
async def create_facility_receipt(
    req: FacilityReceiptCreateRequest,
    request: Request,
    current_staff: Annotated[User, Depends(require_facility_staff)],
    db: Annotated[Session, Depends(get_db_session)],
) -> FacilityReceiptResponse:
    request_id = request.headers.get("x-request-id")
    receipt = facility_service.create_facility_receipt(
        db,
        req,
        receiver_user_id=current_staff.id,
        request_id=request_id,
    )
    return FacilityReceiptResponse.model_validate(receipt)


# ==============================================================================
# Sorting & Stock Mass Balance
# ==============================================================================


@router.get(
    "/{id}/stock",
    response_model=FacilityStockSummaryResponse,
    summary="[Staff/Operator] Rekapitulasi saldo stok material fisik di fasilitas",
)
async def get_facility_stock(
    id: str,
    current_staff: Annotated[User, Depends(require_facility_staff)],
    db: Annotated[Session, Depends(get_db_session)],
) -> FacilityStockSummaryResponse:
    return facility_service.get_facility_stock_summary(db, id)


@router.post(
    "/sorting",
    response_model=list[StockMovementResponse],
    status_code=201,
    summary="[Staff/Operator] Catat pemilahan & fraksinasi material dengan verifikasi mass balance",
)
async def record_sorting(
    req: SortingProcessRequest,
    request: Request,
    current_staff: Annotated[User, Depends(require_facility_staff)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[StockMovementResponse]:
    request_id = request.headers.get("x-request-id")
    movements = facility_service.record_sorting_process(
        db,
        req,
        actor_id=current_staff.id,
        request_id=request_id,
    )
    return [StockMovementResponse.model_validate(m) for m in movements]


# ==============================================================================
# Bank Sampah (Waste Bank) Accounts & Savings
# ==============================================================================


@router.post(
    "/waste-bank/members",
    response_model=WasteBankMemberResponse,
    status_code=201,
    summary="[Staff/Operator] Buka buku tabungan nasabah bank sampah",
)
async def create_waste_bank_member(
    req: WasteBankMemberCreateRequest,
    current_staff: Annotated[User, Depends(require_facility_staff)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WasteBankMemberResponse:
    member = facility_service.create_waste_bank_member(db, req, actor_id=current_staff.id)
    return WasteBankMemberResponse.model_validate(member)


@router.post(
    "/waste-bank/deposit",
    response_model=WasteBankTransactionResponse,
    status_code=201,
    summary="[Staff/Operator] Setoran tabungan sampah nasabah (kredit saldo IDR)",
)
async def deposit_waste_bank(
    req: WasteBankDepositRequest,
    request: Request,
    current_staff: Annotated[User, Depends(require_facility_staff)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WasteBankTransactionResponse:
    request_id = request.headers.get("x-request-id")
    tx = facility_service.deposit_waste_bank(
        db,
        req,
        actor_id=current_staff.id,
        request_id=request_id,
    )
    return WasteBankTransactionResponse.model_validate(tx)


@router.post(
    "/waste-bank/withdraw",
    response_model=WasteBankTransactionResponse,
    status_code=201,
    summary="[Staff/Operator] Penarikan uang tunai dari tabungan sampah nasabah (debit IDR)",
)
async def withdraw_waste_bank(
    req: WasteBankWithdrawRequest,
    request: Request,
    current_staff: Annotated[User, Depends(require_facility_staff)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WasteBankTransactionResponse:
    request_id = request.headers.get("x-request-id")
    tx = facility_service.withdraw_waste_bank(
        db,
        req,
        actor_id=current_staff.id,
        request_id=request_id,
    )
    return WasteBankTransactionResponse.model_validate(tx)


@router.post(
    "/waste-bank/transactions/{id}/reverse",
    response_model=WasteBankTransactionResponse,
    summary="[Operator/Admin] Pembatalan transaksi (reversal kompensasi)",
)
async def reverse_waste_bank_transaction(
    id: str,
    req: WasteBankReversalRequest,
    request: Request,
    current_operator: Annotated[User, Depends(require_operator)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WasteBankTransactionResponse:
    request_id = request.headers.get("x-request-id")
    tx = facility_service.reverse_waste_bank_transaction(
        db,
        transaction_id=id,
        actor_id=current_operator.id,
        reason=req.reason,
        request_id=request_id,
    )
    return WasteBankTransactionResponse.model_validate(tx)


@router.get(
    "/waste-bank/members/{member_id}/transactions",
    response_model=list[WasteBankTransactionResponse],
    summary="Daftar mutasi transaksi buku tabungan nasabah",
)
async def list_waste_bank_transactions(
    member_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
    limit: int = 50,
) -> list[WasteBankTransactionResponse]:
    txs = facility_service.list_waste_bank_transactions(db, member_id=member_id, limit=limit)
    return [WasteBankTransactionResponse.model_validate(t) for t in txs]
