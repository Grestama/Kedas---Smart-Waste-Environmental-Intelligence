"""WasteLink Bali — Weight Domain Service."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, ErrorCode
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest, PickupStatus, PickupStatusEvent
from app.modules.inspection.models import InspectionRecord, InspectionResult
from app.modules.points import service as points_service
from app.modules.weight.models import (
    WeightRecord,
    WeightVerificationStatus,
)
from app.modules.weight.schemas import WeightRecordCreateRequest


def record_weight(
    db: Session,
    pickup_id: str,
    recorder: User,
    req: WeightRecordCreateRequest,
    request_id: str | None = None,
) -> WeightRecord:
    """Record a verified gross/tare/net weight with versioning and reward trigger."""
    # 1. Fetch pickup with lock
    stmt = select(PickupRequest).where(PickupRequest.id == pickup_id).with_for_update()
    pickup = db.scalar(stmt)
    if not pickup:
        raise AppError(
            code=ErrorCode.NOT_FOUND,
            message="Permintaan penjemputan sampah tidak ditemukan.",
            status_code=404,
        )

    # 2. Authorization
    is_admin = any(
        ur.role.code == "ADMIN" and ur.verification_status == "ACTIVE" for ur in recorder.user_roles
    )
    if pickup.collector_id != recorder.id and not is_admin:
        raise AppError(
            code=ErrorCode.FORBIDDEN,
            message="Anda tidak memiliki wewenang untuk menimbang setoran ini.",
            status_code=403,
        )

    # 3. Precondition: must have a valid accepted inspection
    insp_stmt = (
        select(InspectionRecord)
        .where(InspectionRecord.pickup_id == pickup.id)
        .order_by(InspectionRecord.created_at.desc())
    )
    latest_inspection = db.scalar(insp_stmt)
    if not latest_inspection:
        raise AppError(
            code=ErrorCode.INVALID_STATE_TRANSITION,
            message="Penimbangan tidak dapat dilakukan sebelum inspeksi QC dicatat.",
            status_code=400,
        )

    acceptable_results = [
        InspectionResult.ACCEPTED.value,
        InspectionResult.ACCEPTED_WITH_CONTAMINATION.value,
        InspectionResult.PARTIALLY_ACCEPTED.value,
    ]
    if latest_inspection.result not in acceptable_results:
        raise AppError(
            code=ErrorCode.INVALID_STATE_TRANSITION,
            message=f"Penimbangan ditolak karena hasil inspeksi terakhir adalah '{latest_inspection.result}'.",
            status_code=400,
        )

    # 4. Weight calculation & mathematical consistency
    if req.gross_weight_kg is not None and req.tare_weight_kg is not None:
        if req.tare_weight_kg > req.gross_weight_kg:
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message="Berat tara tidak boleh melebihi berat bruto.",
                status_code=400,
            )
        computed_net = round(req.gross_weight_kg - req.tare_weight_kg, 3)
    elif req.net_weight_kg is not None:
        computed_net = round(req.net_weight_kg, 3)
    else:
        raise AppError(
            code=ErrorCode.VALIDATION_ERROR,
            message="Harus menyertakan berat bruto + tara atau berat bersih langsung.",
            status_code=400,
        )

    if computed_net < 0:
        raise AppError(
            code=ErrorCode.VALIDATION_ERROR,
            message="Berat bersih sampah tidak boleh bernilai negatif.",
            status_code=400,
        )

    # 5. Versioning logic
    existing_weights_stmt = (
        select(WeightRecord)
        .where(WeightRecord.pickup_id == pickup.id)
        .order_by(WeightRecord.version.desc())
    )
    latest_weight = db.scalar(existing_weights_stmt)

    if latest_weight:
        if not (req.correction_reason and req.correction_reason.strip()):
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message="Koreksi data timbangan wajib menyertakan alasan koreksi.",
                status_code=400,
            )
        version = latest_weight.version + 1
        supersedes_id = latest_weight.id
        latest_weight.verification_status = WeightVerificationStatus.SUPERSEDED.value
    else:
        version = 1
        supersedes_id = None

    # 6. Create weight record
    weight_rec = WeightRecord(
        pickup_id=pickup.id,
        version=version,
        recorder_id=recorder.id,
        method=req.method.value,
        gross_weight_kg=req.gross_weight_kg,
        tare_weight_kg=req.tare_weight_kg,
        net_weight_kg=computed_net,
        verification_status=WeightVerificationStatus.VERIFIED.value,
        supersedes_id=supersedes_id,
        correction_reason=req.correction_reason,
    )
    db.add(weight_rec)

    # 7. Update pickup state
    pickup.actual_weight_kg = computed_net
    old_status = pickup.status
    if pickup.status != PickupStatus.COMPLETED.value:
        pickup.status = PickupStatus.COMPLETED.value
        event = PickupStatusEvent(
            pickup_request_id=pickup.id,
            from_status=old_status,
            to_status=PickupStatus.COMPLETED.value,
            actor_user_id=recorder.id,
            reason=f"Penimbangan selesai: {computed_net} kg.",
            request_id=request_id,
        )
        db.add(event)

    # 8. Reward evaluation & ledger posting
    if latest_weight:
        # Adjustment flow
        points_service.reverse_or_adjust_pickup_reward(
            db=db,
            pickup=pickup,
            previous_version=latest_weight.version,
            new_version=version,
            new_net_weight_kg=computed_net,
            actor_id=recorder.id,
            request_id=request_id,
        )
    else:
        # First issuance
        points_service.evaluate_and_post_pickup_reward(
            db=db,
            pickup=pickup,
            net_weight_kg=computed_net,
            actor_id=recorder.id,
            version=version,
            request_id=request_id,
        )

    # 9. Audit log
    audit = AuditLog(
        action="WEIGHT_RECORDED",
        actor_id=recorder.id,
        entity_type="WEIGHT_RECORD",
        entity_id=weight_rec.id,
        request_id=request_id,
        payload_after={
            "pickup_id": pickup.id,
            "version": version,
            "net_weight_kg": computed_net,
            "supersedes_id": supersedes_id,
        },
    )
    db.add(audit)

    db.commit()
    db.refresh(weight_rec)
    return weight_rec


def list_pickup_weights(db: Session, pickup_id: str) -> list[WeightRecord]:
    """Retrieve all versioned weight records for a pickup."""
    stmt = (
        select(WeightRecord)
        .where(WeightRecord.pickup_id == pickup_id)
        .order_by(WeightRecord.version.asc())
    )
    return list(db.scalars(stmt).all())
