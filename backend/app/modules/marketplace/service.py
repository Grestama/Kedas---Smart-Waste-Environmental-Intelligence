"""WasteLink Bali — Circular Marketplace & Batching Service."""

from __future__ import annotations

import secrets
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, ErrorCode
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest, PickupStatus
from app.modules.marketplace.models import (
    BatchStatus,
    DeliveryRecord,
    DeliveryStatus,
    MaterialBatch,
    MaterialBatchItem,
    Partner,
    PartnerVerificationStatus,
)
from app.modules.marketplace.schemas import (
    DeliveryCreateRequest,
    DeliveryReceiptRequest,
    MaterialBatchCreateRequest,
    PartnerCreateRequest,
)


def create_partner(db: Session, req: PartnerCreateRequest) -> Partner:
    """Register a new buyer/processing partner."""
    partner = Partner(
        name=req.name,
        contact_email=req.contact_email,
        contact_phone=req.contact_phone,
        address=req.address,
        verification_status=PartnerVerificationStatus.VERIFIED.value,
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


def list_partners(db: Session) -> list[Partner]:
    """Retrieve all verified circular economy partners."""
    stmt = (
        select(Partner)
        .where(Partner.verification_status == PartnerVerificationStatus.VERIFIED.value)
        .order_by(Partner.name.asc())
    )
    return list(db.scalars(stmt).all())


def create_material_batch(
    db: Session,
    creator: User,
    req: MaterialBatchCreateRequest,
    request_id: str | None = None,
) -> MaterialBatch:
    """Aggregate verified pickups into a single traceable material batch."""
    # 1. Fetch and validate each pickup
    total_weight = 0.0

    for pid in req.pickup_ids:
        # Check if already batched
        existing_item = db.scalar(
            select(MaterialBatchItem).where(MaterialBatchItem.pickup_id == pid)
        )
        if existing_item:
            raise AppError(
                code=ErrorCode.CONFLICT,
                message=f"Setoran sampah dengan ID '{pid}' telah terdaftar dalam batch material lain.",
                status_code=409,
            )

        pickup = db.scalar(select(PickupRequest).where(PickupRequest.id == pid))
        if not pickup:
            raise AppError(
                code=ErrorCode.NOT_FOUND,
                message=f"Setoran '{pid}' tidak ditemukan.",
                status_code=404,
            )

        if pickup.status != PickupStatus.COMPLETED.value:
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message=f"Setoran '{pid}' belum berstatus COMPLETED (status saat ini: {pickup.status}).",
                status_code=400,
            )

        if pickup.category_id != req.category_id:
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message=f"Kategori sampah pada setoran '{pid}' tidak sesuai dengan kategori batch.",
                status_code=400,
            )

        weight = float(pickup.actual_weight_kg or 0.0)
        total_weight += weight

    # 2. Generate unique batch code
    date_str = datetime.now(UTC).strftime("%y%m%d")
    random_str = secrets.token_hex(2).upper()
    batch_code = f"BATCH-{date_str}-{random_str}"

    batch = MaterialBatch(
        batch_code=batch_code,
        category_id=req.category_id,
        total_weight_kg=round(total_weight, 3),
        status=BatchStatus.BATCHED.value,
        created_by=creator.id,
    )
    db.add(batch)
    db.flush()

    for pid in req.pickup_ids:
        pickup = db.scalar(select(PickupRequest).where(PickupRequest.id == pid))
        assert pickup is not None
        item = MaterialBatchItem(
            batch_id=batch.id,
            pickup_id=pid,
            weight_kg=float(pickup.actual_weight_kg or 0.0),
        )
        db.add(item)

    # Audit log
    audit = AuditLog(
        action="MATERIAL_BATCH_CREATED",
        actor_id=creator.id,
        entity_type="MATERIAL_BATCH",
        entity_id=batch.id,
        request_id=request_id,
        payload_after={
            "batch_code": batch.batch_code,
            "category_id": batch.category_id,
            "total_weight_kg": batch.total_weight_kg,
            "pickup_count": len(req.pickup_ids),
        },
    )
    db.add(audit)

    db.commit()
    db.refresh(batch)
    return batch


def list_material_batches(db: Session, status: str | None = None) -> list[MaterialBatch]:
    """Retrieve material batches with optional status filter."""
    stmt = select(MaterialBatch).order_by(MaterialBatch.created_at.desc())
    if status:
        stmt = stmt.where(MaterialBatch.status == status)
    return list(db.scalars(stmt).all())


def dispatch_delivery(
    db: Session,
    dispatcher: User,
    req: DeliveryCreateRequest,
    request_id: str | None = None,
) -> DeliveryRecord:
    """Dispatch a material batch to a partner."""
    batch = db.scalar(
        select(MaterialBatch).where(MaterialBatch.id == req.batch_id).with_for_update()
    )
    if not batch:
        raise AppError(
            code=ErrorCode.NOT_FOUND, message="Batch material tidak ditemukan.", status_code=404
        )

    if batch.status not in [BatchStatus.BATCHED.value, BatchStatus.ALLOCATED.value]:
        raise AppError(
            code=ErrorCode.INVALID_STATE_TRANSITION,
            message=f"Batch material dengan status '{batch.status}' tidak dapat dikirim.",
            status_code=400,
        )

    partner = db.scalar(select(Partner).where(Partner.id == req.partner_id))
    if not partner:
        raise AppError(code=ErrorCode.NOT_FOUND, message="Mitra tidak ditemukan.", status_code=404)

    delivery = DeliveryRecord(
        batch_id=batch.id,
        partner_id=partner.id,
        dispatched_weight_kg=req.dispatched_weight_kg,
        status=DeliveryStatus.DISPATCHED.value,
        dispatched_by=dispatcher.id,
        dispatched_at=datetime.now(UTC),
        notes=req.notes,
    )
    db.add(delivery)

    batch.status = BatchStatus.SHIPPED.value

    # Audit log
    audit = AuditLog(
        action="DELIVERY_DISPATCHED",
        actor_id=dispatcher.id,
        entity_type="DELIVERY_RECORD",
        entity_id=delivery.id,
        request_id=request_id,
        payload_after={
            "batch_id": batch.id,
            "partner_id": partner.id,
            "dispatched_weight_kg": req.dispatched_weight_kg,
        },
    )
    db.add(audit)

    db.commit()
    db.refresh(delivery)
    return delivery


def confirm_delivery_receipt(
    db: Session,
    receiver: User,
    delivery_id: str,
    req: DeliveryReceiptRequest,
    request_id: str | None = None,
) -> DeliveryRecord:
    """Record receipt confirmation and detect weight discrepancies."""
    delivery = db.scalar(
        select(DeliveryRecord).where(DeliveryRecord.id == delivery_id).with_for_update()
    )
    if not delivery:
        raise AppError(
            code=ErrorCode.NOT_FOUND, message="Catatan pengiriman tidak ditemukan.", status_code=404
        )

    if delivery.status != DeliveryStatus.DISPATCHED.value:
        raise AppError(
            code=ErrorCode.INVALID_STATE_TRANSITION,
            message=f"Penerimaan tidak dapat dikonfirmasi pada status pengiriman '{delivery.status}'.",
            status_code=400,
        )

    discrepancy = round(req.received_weight_kg - float(delivery.dispatched_weight_kg), 3)
    final_status = (
        DeliveryStatus.DISPUTED.value if discrepancy != 0.0 else DeliveryStatus.DELIVERED.value
    )

    delivery.received_weight_kg = req.received_weight_kg
    delivery.weight_discrepancy_kg = discrepancy
    delivery.status = final_status
    delivery.received_at = datetime.now(UTC)
    if req.notes:
        delivery.notes = f"{delivery.notes or ''}\n[Penerimaan]: {req.notes}".strip()

    # Update batch status
    batch = db.scalar(
        select(MaterialBatch).where(MaterialBatch.id == delivery.batch_id).with_for_update()
    )
    if batch:
        batch.status = BatchStatus.RECEIVED.value

    # Audit log
    audit = AuditLog(
        action="DELIVERY_RECEIVED",
        actor_id=receiver.id,
        entity_type="DELIVERY_RECORD",
        entity_id=delivery.id,
        request_id=request_id,
        payload_after={
            "received_weight_kg": req.received_weight_kg,
            "discrepancy_kg": discrepancy,
            "status": final_status,
        },
    )
    db.add(audit)

    db.commit()
    db.refresh(delivery)
    return delivery
