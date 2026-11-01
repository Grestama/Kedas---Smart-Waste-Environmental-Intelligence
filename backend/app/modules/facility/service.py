"""WasteLink Bali — Facility, Stock Movements & Waste Bank Service Layer."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest, PickupStatus, PickupStatusEvent
from app.modules.facility.models import (
    BankTransactionType,
    Facility,
    FacilityReceipt,
    MovementType,
    StockMovement,
    WasteBankMember,
    WasteBankTransaction,
)
from app.modules.facility.schemas import (
    FacilityCreateRequest,
    FacilityReceiptCreateRequest,
    FacilityStockItem,
    FacilityStockSummaryResponse,
    SortingProcessRequest,
    WasteBankDepositRequest,
    WasteBankMemberCreateRequest,
    WasteBankWithdrawRequest,
)
from app.modules.taxonomy.models import WasteCategory
from app.modules.weight.models import WeightRecord, WeightVerificationStatus

# ==============================================================================
# Facility Operations
# ==============================================================================


def create_facility(db: Session, req: FacilityCreateRequest, actor_id: str) -> Facility:
    """Register a new operational waste facility (TPS3R, TPST, Bank Sampah)."""
    stmt = select(Facility).where(Facility.code == req.code)
    if db.scalar(stmt):
        raise ConflictError(f"Fasilitas dengan kode '{req.code}' sudah terdaftar.")

    facility = Facility(
        code=req.code,
        name=req.name,
        facility_type=req.facility_type.value,
        service_area_id=req.service_area_id,
        address=req.address,
        capacity_kg_per_day=req.capacity_kg_per_day,
        is_active=True,
    )
    db.add(facility)
    db.flush()

    audit = AuditLog(
        actor_id=actor_id,
        action="FACILITY_CREATED",
        entity_type="FACILITY",
        entity_id=facility.id,
        reason=f"Pendaftaran fasilitas baru {facility.name} ({facility.code})",
        payload_after={"code": facility.code, "name": facility.name, "type": facility.facility_type},
    )
    db.add(audit)
    db.commit()
    db.refresh(facility)
    return facility


def get_facility(db: Session, facility_id: str) -> Facility:
    """Retrieve facility by ID or raise NotFoundError."""
    facility = db.get(Facility, facility_id)
    if not facility:
        raise NotFoundError(f"Fasilitas dengan ID '{facility_id}' tidak ditemukan.")
    return facility


def list_facilities(db: Session, active_only: bool = True) -> list[Facility]:
    """List registered facilities."""
    stmt = select(Facility)
    if active_only:
        stmt = stmt.where(Facility.is_active.is_(True))
    stmt = stmt.order_by(Facility.created_at.asc())
    return list(db.scalars(stmt).all())


# ==============================================================================
# Facility Intake Receipts & Discrepancy Tracking
# ==============================================================================


def create_facility_receipt(
    db: Session,
    req: FacilityReceiptCreateRequest,
    receiver_user_id: str,
    request_id: str | None = None,
) -> FacilityReceipt:
    """Record an intake receipt at facility workstation with mass discrepancy audit."""
    # Acquire row-level lock on facility to serialize intake receipt transactions
    facility = db.scalar(
        select(Facility).where(Facility.id == req.facility_id).with_for_update()
    )
    if not facility:
        raise NotFoundError(f"Fasilitas dengan ID '{req.facility_id}' tidak ditemukan.")
    if not facility.is_active:
        raise ValidationError(f"Fasilitas '{facility.name}' sedang non-aktif.")

    # 1. Idempotency Check
    if req.idempotency_key:
        stmt = select(FacilityReceipt).where(
            FacilityReceipt.facility_id == req.facility_id,
            FacilityReceipt.idempotency_key == req.idempotency_key,
        )
        existing = db.scalar(stmt)
        if existing:
            return existing

    # 2. Check Category
    category = db.get(WasteCategory, req.category_id)
    if not category:
        raise NotFoundError("Kategori sampah tidak valid.")

    # 3. Cross-reference Pickup Request if present
    field_weight_kg: float = 0.0
    discrepancy_kg: float = 0.0
    discrepancy_reason: str | None = req.discrepancy_reason
    sender_user_id = req.sender_user_id

    if req.pickup_id:
        stmt_pickup = (
            select(PickupRequest)
            .where(PickupRequest.id == req.pickup_id)
            .with_for_update()
        )
        pickup = db.scalar(stmt_pickup)
        if not pickup:
            raise NotFoundError("Permintaan pickup rujukan tidak ditemukan.")

        sender_user_id = pickup.user_id

        # Find verified field weight from WeightRecord
        stmt_weight = (
            select(WeightRecord)
            .where(
                WeightRecord.pickup_id == pickup.id,
                WeightRecord.verification_status == WeightVerificationStatus.VERIFIED.value,
            )
            .order_by(WeightRecord.version.desc())
        )
        verified_weight = db.scalar(stmt_weight)

        if verified_weight:
            field_weight_kg = float(verified_weight.net_weight_kg)
        elif pickup.estimated_weight_kg:
            field_weight_kg = float(pickup.estimated_weight_kg)

        discrepancy_kg = round(req.received_weight_kg - field_weight_kg, 3)

        # Flag discrepancy note if difference exceeds standard scale tolerance (0.5 kg)
        if abs(discrepancy_kg) > 0.5 and not discrepancy_reason:
            discrepancy_reason = (
                f"Diskrepansi timbangan terdeteksi: lapang {field_weight_kg:.2f} kg, "
                f"fasilitas {req.received_weight_kg:.2f} kg (selisih {discrepancy_kg:+.2f} kg)"
            )

        # Transition pickup to COMPLETED upon receipt at facility
        old_status = pickup.status
        pickup.status = PickupStatus.COMPLETED.value

        event = PickupStatusEvent(
            pickup_request_id=pickup.id,
            from_status=old_status,
            to_status=PickupStatus.COMPLETED.value,
            actor_user_id=receiver_user_id,
            reason=f"Diterima di fasilitas {facility.name}. Tanda terima penerimaan dibuat.",
        )
        db.add(event)

    # 4. Generate unique receipt number
    receipt_no = f"FCR-{datetime.now(UTC).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:6].upper()}"

    receipt = FacilityReceipt(
        receipt_no=receipt_no,
        facility_id=req.facility_id,
        pickup_id=req.pickup_id,
        category_id=req.category_id,
        receiver_user_id=receiver_user_id,
        sender_user_id=sender_user_id,
        gross_weight_kg=req.gross_weight_kg,
        tare_weight_kg=req.tare_weight_kg,
        received_weight_kg=req.received_weight_kg,
        discrepancy_kg=discrepancy_kg,
        discrepancy_reason=discrepancy_reason,
        quality_grade=req.quality_grade.value,
        contamination_percent=req.contamination_percent,
        receipt_status=req.receipt_status.value,
        idempotency_key=req.idempotency_key,
        notes=req.notes,
    )
    db.add(receipt)
    db.flush()

    # 5. Append-only physical stock intake movement
    stock_mov = StockMovement(
        facility_id=req.facility_id,
        category_id=req.category_id,
        movement_type=MovementType.INTAKE_RECEIPT.value,
        quantity_kg=req.received_weight_kg,
        reference_id=receipt.id,
        actor_user_id=receiver_user_id,
        notes=f"Penerimaan intake tanda terima #{receipt.receipt_no}",
    )
    db.add(stock_mov)

    # 6. Audit Trail
    audit = AuditLog(
        actor_id=receiver_user_id,
        action="FACILITY_RECEIPT_CREATED",
        entity_type="FACILITY_RECEIPT",
        entity_id=receipt.id,
        reason=f"Tanda terima penerimaan material #{receipt.receipt_no} di {facility.name}",
        request_id=request_id,
        payload_after={
            "receipt_no": receipt.receipt_no,
            "received_weight_kg": req.received_weight_kg,
            "discrepancy_kg": discrepancy_kg,
            "quality_grade": req.quality_grade.value,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(receipt)
    return receipt


# ==============================================================================
# Sorting, Mass Balance Invariant & Physical Inventory
# ==============================================================================


def get_category_stock(db: Session, facility_id: str, category_id: str) -> float:
    """Calculate current physical inventory in kg for a specific category at a facility."""
    stmt = select(func.coalesce(func.sum(StockMovement.quantity_kg), 0)).where(
        StockMovement.facility_id == facility_id,
        StockMovement.category_id == category_id,
    )
    res = db.scalar(stmt)
    return float(res or 0.0)


def record_sorting_process(
    db: Session,
    req: SortingProcessRequest,
    actor_id: str,
    request_id: str | None = None,
) -> list[StockMovement]:
    """Execute sorting & processing with strict mass balance validation and residue tracking.

    Mass balance invariant:
    Input Weight = sum(Output Fractions) + Residue +- Tolerance
    Stock cannot fall below zero.
    """
    # Acquire row-level lock on facility to serialize intake receipt transactions
    facility = db.scalar(
        select(Facility).where(Facility.id == req.facility_id).with_for_update()
    )
    if not facility:
        raise NotFoundError(f"Fasilitas dengan ID '{req.facility_id}' tidak ditemukan.")

    # 1. Verify available input stock
    current_stock = get_category_stock(db, req.facility_id, req.input_category_id)
    if current_stock < req.input_weight_kg:
        raise ValidationError(
            f"Stok material awal tidak mencukupi untuk pemilahan. "
            f"Stok saat ini: {current_stock:.2f} kg, dibutuhkan: {req.input_weight_kg:.2f} kg."
        )

    # 2. Check Mass Balance Invariant
    sum_outputs = round(sum(item.quantity_kg for item in req.outputs), 3)
    diff = round(abs(req.input_weight_kg - sum_outputs), 3)

    if diff > req.tolerance_kg:
        raise ValidationError(
            f"Ketidakseimbangan massa (mass balance error): total fraksi hasil ({sum_outputs:.2f} kg) "
            f"berbeda {diff:.2f} kg dari bobot input ({req.input_weight_kg:.2f} kg). "
            f"Melebihi batas toleransi kelembapan/debu {req.tolerance_kg:.2f} kg."
        )

    movements: list[StockMovement] = []
    process_ref_id = f"SORT-{datetime.now(UTC).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:6].upper()}"

    # 3. Deduction movement for input material (SORTING_IN, negative quantity)
    deduction = StockMovement(
        facility_id=req.facility_id,
        category_id=req.input_category_id,
        movement_type=MovementType.SORTING_IN.value,
        quantity_kg=-req.input_weight_kg,
        reference_id=process_ref_id,
        actor_user_id=actor_id,
        notes=f"Input pemilahan material #{process_ref_id}. {req.notes or ''}".strip(),
    )
    db.add(deduction)
    movements.append(deduction)

    # 4. Output additions: fractions and residue
    for item in req.outputs:
        cat = db.get(WasteCategory, item.category_id)
        if not cat:
            raise NotFoundError(f"Kategori fraksi hasil '{item.category_id}' tidak ditemukan.")

        m_type = MovementType.SORTING_RESIDUE.value if item.is_residue else MovementType.SORTING_OUTPUT.value
        m_notes = item.notes or ("Fraksi residu pemilahan" if item.is_residue else f"Fraksi hasil pemilahan {cat.name}")

        addition = StockMovement(
            facility_id=req.facility_id,
            category_id=item.category_id,
            movement_type=m_type,
            quantity_kg=item.quantity_kg,
            reference_id=process_ref_id,
            actor_user_id=actor_id,
            notes=m_notes,
        )
        db.add(addition)
        movements.append(addition)

    # 5. Audit Log
    audit = AuditLog(
        actor_id=actor_id,
        action="SORTING_PROCESS_RECORDED",
        entity_type="STOCK_MOVEMENT",
        entity_id=process_ref_id,
        reason=f"Proses pemilahan #{process_ref_id} di {facility.name}. Input {req.input_weight_kg} kg -> Output {sum_outputs} kg",
        request_id=request_id,
        payload_after={
            "process_ref_id": process_ref_id,
            "input_weight_kg": req.input_weight_kg,
            "sum_outputs_kg": sum_outputs,
            "diff_kg": diff,
            "output_count": len(req.outputs),
        },
    )
    db.add(audit)
    db.commit()
    for m in movements:
        db.refresh(m)
    return movements


def get_facility_stock_summary(db: Session, facility_id: str) -> FacilityStockSummaryResponse:
    """Aggregate real-time stock balance per waste category at a facility."""
    facility = get_facility(db, facility_id)

    stmt = (
        select(
            WasteCategory.id,
            WasteCategory.name,
            func.coalesce(func.sum(StockMovement.quantity_kg), 0).label("stock"),
        )
        .join(StockMovement, StockMovement.category_id == WasteCategory.id)
        .where(StockMovement.facility_id == facility_id)
        .group_by(WasteCategory.id, WasteCategory.name)
        .order_by(WasteCategory.name.asc())
    )
    results = db.execute(stmt).all()

    items: list[FacilityStockItem] = []
    total_stock = 0.0

    for cat_id, cat_name, stock in results:
        stock_val = round(float(stock), 3)
        items.append(
            FacilityStockItem(
                category_id=cat_id,
                category_name=cat_name,
                current_stock_kg=stock_val,
            )
        )
        total_stock += stock_val

    return FacilityStockSummaryResponse(
        facility_id=facility.id,
        facility_name=facility.name,
        items=items,
        total_stock_kg=round(total_stock, 3),
    )


# ==============================================================================
# Bank Sampah (Waste Bank) Member Accounts & Monetary Savings Ledger
# ==============================================================================


def create_waste_bank_member(
    db: Session,
    req: WasteBankMemberCreateRequest,
    actor_id: str,
) -> WasteBankMember:
    """Register a citizen as an account holder in a local Bank Sampah."""
    # Acquire row-level lock on facility to serialize intake receipt transactions
    facility = db.scalar(
        select(Facility).where(Facility.id == req.facility_id).with_for_update()
    )
    if not facility:
        raise NotFoundError(f"Fasilitas dengan ID '{req.facility_id}' tidak ditemukan.")
    user = db.get(User, req.user_id)
    if not user:
        raise NotFoundError("Pengguna tidak ditemukan.")

    # Check if already member
    stmt = select(WasteBankMember).where(
        WasteBankMember.user_id == req.user_id,
        WasteBankMember.facility_id == req.facility_id,
    )
    existing = db.scalar(stmt)
    if existing:
        return existing

    account_no = req.account_no or f"BS-{facility.code}-{uuid.uuid4().hex[:6].upper()}"

    member = WasteBankMember(
        account_no=account_no,
        user_id=req.user_id,
        facility_id=req.facility_id,
        current_balance_idr=0,
        status="ACTIVE",
    )
    db.add(member)
    db.flush()

    audit = AuditLog(
        actor_id=actor_id,
        action="WASTE_BANK_MEMBER_CREATED",
        entity_type="WASTE_BANK_MEMBER",
        entity_id=member.id,
        reason=f"Pembukaan rekening buku tabungan bank sampah #{member.account_no} untuk {user.full_name}",
        payload_after={"account_no": member.account_no, "user_id": user.id, "facility_id": facility.id},
    )
    db.add(audit)
    db.commit()
    db.refresh(member)
    return member


def deposit_waste_bank(
    db: Session,
    req: WasteBankDepositRequest,
    actor_id: str,
    request_id: str | None = None,
) -> WasteBankTransaction:
    """Record a material deposit to member's monetary savings ledger in IDR."""
    stmt = (
        select(WasteBankMember)
        .where(WasteBankMember.id == req.member_id)
        .with_for_update()
    )
    member = db.scalar(stmt)
    if not member:
        raise NotFoundError("Rekening nasabah bank sampah tidak ditemukan.")
    if member.status != "ACTIVE":
        raise ValidationError(f"Rekening nasabah dalam status {member.status}.")

    category = db.get(WasteCategory, req.category_id)
    if not category:
        raise NotFoundError("Kategori sampah tidak valid.")

    amount_idr = int(round(req.weight_kg * req.unit_price_idr))
    new_balance = member.current_balance_idr + amount_idr
    member.current_balance_idr = new_balance

    tx_no = f"TX-DEP-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

    tx = WasteBankTransaction(
        transaction_no=tx_no,
        member_id=member.id,
        category_id=req.category_id,
        transaction_type=BankTransactionType.DEPOSIT.value,
        weight_kg=req.weight_kg,
        unit_price_idr=req.unit_price_idr,
        amount_idr=amount_idr,
        running_balance_idr=new_balance,
        receipt_id=req.receipt_id,
        recorded_by=actor_id,
        status="CONFIRMED",
        notes=req.notes,
    )
    db.add(tx)
    db.flush()

    audit = AuditLog(
        actor_id=actor_id,
        action="WASTE_BANK_DEPOSIT",
        entity_type="WASTE_BANK_TRANSACTION",
        entity_id=tx.id,
        reason=f"Setoran tabungan sampah nasabah #{member.account_no}: {req.weight_kg} kg @ Rp {req.unit_price_idr:,} = Rp {amount_idr:,}",
        request_id=request_id,
        payload_after={
            "transaction_no": tx.transaction_no,
            "amount_idr": amount_idr,
            "new_balance_idr": new_balance,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(tx)
    return tx


def withdraw_waste_bank(
    db: Session,
    req: WasteBankWithdrawRequest,
    actor_id: str,
    request_id: str | None = None,
) -> WasteBankTransaction:
    """Process a cash withdrawal from member's waste bank savings."""
    stmt = (
        select(WasteBankMember)
        .where(WasteBankMember.id == req.member_id)
        .with_for_update()
    )
    member = db.scalar(stmt)
    if not member:
        raise NotFoundError("Rekening nasabah bank sampah tidak ditemukan.")
    if member.status != "ACTIVE":
        raise ValidationError(f"Rekening nasabah dalam status {member.status}.")

    if member.current_balance_idr < req.amount_idr:
        raise ValidationError(
            f"Saldo tabungan tidak mencukupi. Saldo saat ini: Rp {member.current_balance_idr:,}, "
            f"diminta: Rp {req.amount_idr:,}."
        )

    new_balance = member.current_balance_idr - req.amount_idr
    member.current_balance_idr = new_balance

    tx_no = f"TX-WDR-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

    tx = WasteBankTransaction(
        transaction_no=tx_no,
        member_id=member.id,
        category_id=None,
        transaction_type=BankTransactionType.WITHDRAWAL.value,
        weight_kg=None,
        unit_price_idr=None,
        amount_idr=-req.amount_idr,
        running_balance_idr=new_balance,
        recorded_by=actor_id,
        status="CONFIRMED",
        notes=req.notes,
    )
    db.add(tx)
    db.flush()

    audit = AuditLog(
        actor_id=actor_id,
        action="WASTE_BANK_WITHDRAWAL",
        entity_type="WASTE_BANK_TRANSACTION",
        entity_id=tx.id,
        reason=f"Penarikan saldo tabungan nasabah #{member.account_no} sebesar Rp {req.amount_idr:,}",
        request_id=request_id,
        payload_after={
            "transaction_no": tx.transaction_no,
            "withdrawn_idr": req.amount_idr,
            "new_balance_idr": new_balance,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(tx)
    return tx


def reverse_waste_bank_transaction(
    db: Session,
    transaction_id: str,
    actor_id: str,
    reason: str,
    request_id: str | None = None,
) -> WasteBankTransaction:
    """Compensate an erroneous waste bank transaction without deleting records."""
    stmt_tx = (
        select(WasteBankTransaction)
        .where(WasteBankTransaction.id == transaction_id)
        .with_for_update()
    )
    orig_tx = db.scalar(stmt_tx)
    if not orig_tx:
        raise NotFoundError("Transaksi bank sampah tidak ditemukan.")
    if orig_tx.status == "REVERSED":
        raise ValidationError("Transaksi ini sudah pernah dibatalkan sebelumnya.")

    stmt_member = (
        select(WasteBankMember)
        .where(WasteBankMember.id == orig_tx.member_id)
        .with_for_update()
    )
    member = db.scalar(stmt_member)
    if not member:
        raise NotFoundError("Rekening nasabah tidak ditemukan.")

    # Reversal delta is exactly opposite of original amount_idr
    reversal_delta = -orig_tx.amount_idr

    # If original was deposit, reversal deducts balance. Verify sufficient balance.
    if reversal_delta < 0 and member.current_balance_idr < abs(reversal_delta):
        raise ValidationError(
            f"Tidak dapat membatalkan setoran: saldo nasabah (Rp {member.current_balance_idr:,}) "
            f"sudah ditarik dan kurang dari jumlah setoran awal (Rp {orig_tx.amount_idr:,})."
        )

    new_balance = member.current_balance_idr + reversal_delta
    member.current_balance_idr = new_balance

    orig_tx.status = "REVERSED"

    tx_no = f"TX-REV-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

    rev_tx = WasteBankTransaction(
        transaction_no=tx_no,
        member_id=member.id,
        category_id=orig_tx.category_id,
        transaction_type=BankTransactionType.REVERSAL.value,
        weight_kg=orig_tx.weight_kg,
        unit_price_idr=orig_tx.unit_price_idr,
        amount_idr=reversal_delta,
        running_balance_idr=new_balance,
        reverses_transaction_id=orig_tx.id,
        recorded_by=actor_id,
        status="CONFIRMED",
        notes=f"Kompensasi pembatalan transaksi #{orig_tx.transaction_no}. Alasan: {reason}",
    )
    db.add(rev_tx)
    db.flush()

    audit = AuditLog(
        actor_id=actor_id,
        action="WASTE_BANK_REVERSAL",
        entity_type="WASTE_BANK_TRANSACTION",
        entity_id=rev_tx.id,
        reason=f"Pembatalan transaksi #{orig_tx.transaction_no}. Alasan: {reason}",
        request_id=request_id,
        payload_after={
            "transaction_no": rev_tx.transaction_no,
            "reverses_transaction_id": orig_tx.id,
            "reversal_delta_idr": reversal_delta,
            "new_balance_idr": new_balance,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(rev_tx)
    return rev_tx


def list_waste_bank_transactions(
    db: Session,
    member_id: str,
    limit: int = 50,
) -> list[WasteBankTransaction]:
    """List transaction ledger for a waste bank member."""
    stmt = (
        select(WasteBankTransaction)
        .where(WasteBankTransaction.member_id == member_id)
        .order_by(WasteBankTransaction.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
