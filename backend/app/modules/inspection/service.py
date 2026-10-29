"""WasteLink Bali — Inspection Domain Service."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, ErrorCode
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest, PickupStatus, PickupStatusEvent
from app.modules.inspection.models import (
    InspectionRecord,
    InspectionResult,
)
from app.modules.inspection.schemas import InspectionCreateRequest
from app.modules.notification.models import Notification


def create_inspection(
    db: Session,
    pickup_id: str,
    inspector: User,
    req: InspectionCreateRequest,
    request_id: str | None = None,
) -> InspectionRecord:
    """Record a quality control inspection on a waste pickup."""
    # 1. Fetch pickup with row-level lock
    stmt = select(PickupRequest).where(PickupRequest.id == pickup_id).with_for_update()
    pickup = db.scalar(stmt)
    if not pickup:
        raise AppError(
            code=ErrorCode.NOT_FOUND,
            message="Permintaan penjemputan sampah tidak ditemukan.",
            status_code=404,
        )

    # 2. Authorization: must be the assigned collector or have admin privileges
    is_admin = any(
        ur.role.code == "ADMIN" and ur.verification_status == "ACTIVE"
        for ur in inspector.user_roles
    )
    if pickup.collector_id != inspector.id and not is_admin:
        raise AppError(
            code=ErrorCode.FORBIDDEN,
            message="Anda tidak memiliki wewenang untuk menginspeksi setoran yang ditugaskan ke petugas lain.",
            status_code=403,
        )

    # 3. State machine validation: must be EN_ROUTE or ARRIVED
    valid_states = [
        PickupStatus.EN_ROUTE.value,
        PickupStatus.ARRIVED.value,
        PickupStatus.ACCEPTED.value,
        PickupStatus.INSPECTION.value,
    ]
    if pickup.status not in valid_states:
        raise AppError(
            code=ErrorCode.INVALID_STATE_TRANSITION,
            message=f"Inspeksi tidak dapat dilakukan pada status '{pickup.status}'.",
            status_code=400,
        )

    # 4. Mandatory business validation for inspection results
    if req.result == InspectionResult.REJECTED:
        if not (req.rejection_reason_code or (req.rejection_notes and req.rejection_notes.strip())):
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message="Penolakan setoran (REJECTED) wajib menyertakan kode alasan atau catatan penolakan.",
                status_code=400,
            )
    elif req.result == InspectionResult.PARTIALLY_ACCEPTED and (
        req.accepted_weight_kg is None or req.rejected_weight_kg is None
    ):
        raise AppError(
            code=ErrorCode.VALIDATION_ERROR,
            message="Penerimaan sebagian (PARTIALLY_ACCEPTED) wajib memisahkan berat diterima dan ditolak.",
            status_code=400,
        )

    # 5. Create Inspection Record
    record = InspectionRecord(
        pickup_id=pickup.id,
        inspector_id=inspector.id,
        result=req.result.value,
        contamination_level=req.contamination_level.value,
        accepted_weight_kg=req.accepted_weight_kg,
        rejected_weight_kg=req.rejected_weight_kg,
        rejection_reason_code=req.rejection_reason_code,
        rejection_notes=req.rejection_notes,
    )
    db.add(record)

    # 6. Update pickup status and record event
    old_status = pickup.status
    if req.result == InspectionResult.REJECTED:
        new_status = PickupStatus.CANCELLED.value
        reason = f"Ditolak saat inspeksi: {req.rejection_notes or req.rejection_reason_code}"
    elif req.result == InspectionResult.NEEDS_REVIEW:
        new_status = old_status  # Remains for supervisor review
        reason = "Memerlukan peninjauan lebih lanjut oleh supervisor."
    else:
        new_status = PickupStatus.ARRIVED.value
        reason = f"Inspeksi selesai ({req.result.value}). Siap ditimbang."

    if new_status != old_status:
        pickup.status = new_status
        event = PickupStatusEvent(
            pickup_request_id=pickup.id,
            from_status=old_status,
            to_status=new_status,
            actor_user_id=inspector.id,
            reason=reason,
            request_id=request_id,
        )
        db.add(event)

    # 7. System Audit Log
    audit = AuditLog(
        action="INSPECTION_RECORDED",
        actor_id=inspector.id,
        entity_type="PICKUP_REQUEST",
        entity_id=pickup.id,
        request_id=request_id,
        payload_after={
            "result": req.result.value,
            "contamination_level": req.contamination_level.value,
            "pickup_status": pickup.status,
        },
    )
    db.add(audit)

    # 8. User Domain Notification
    notification = Notification(
        user_id=pickup.user_id,
        title="Hasil Inspeksi Setoran Sampah",
        body=f"Setoran sampah Anda (#{pickup.tracking_code}) telah diperiksa: {req.result.value}.",
        event_type="INSPECTION_COMPLETED",
        reference_id=pickup.id,
    )
    db.add(notification)

    db.commit()
    db.refresh(record)
    return record


def list_pickup_inspections(db: Session, pickup_id: str) -> list[InspectionRecord]:
    """Retrieve full inspection history for a pickup."""
    stmt = (
        select(InspectionRecord)
        .where(InspectionRecord.pickup_id == pickup_id)
        .order_by(InspectionRecord.created_at.desc())
    )
    return list(db.scalars(stmt).all())
