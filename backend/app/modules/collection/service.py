"""WasteLink Bali — Collection, Scheduling, & Pickup Domain Service.

Enforces:
- Atomic slot booking and overbooking prevention
- Special waste route confirmation gating
- Atomic single-collector task claims (concurrency-safe)
- Strict state machine transitions and append-only event trail
"""

from __future__ import annotations

import secrets
import string
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from app.db.base import AuditLog
from app.modules.account.models import Role, User, UserAddress, UserRole, VerificationStatus
from app.modules.collection.models import (
    CollectionSlot,
    PickupRequest,
    PickupStatus,
    PickupStatusEvent,
    ServiceArea,
)
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    PickupCreateRequest,
    ServiceAreaCreateRequest,
)
from app.modules.taxonomy.models import CategoryType, MaterialAcceptanceRule, WasteCategory


def _generate_public_code() -> str:
    """Generate user-friendly unique tracking code, e.g. WLB-261029-A7K2."""
    date_part = datetime.now(UTC).strftime("%y%m%d")
    alphabet = string.ascii_uppercase + string.digits
    random_part = "".join(secrets.choice(alphabet) for _ in range(4))
    return f"WLB-{date_part}-{random_part}"


# --- Service Areas ---


def create_service_area(db: Session, req: ServiceAreaCreateRequest) -> ServiceArea:
    existing = db.scalar(select(ServiceArea).where(ServiceArea.code == req.code))
    if existing:
        raise ConflictError(f"Area layanan dengan kode [{req.code}] sudah ada.")

    area = ServiceArea(
        code=req.code,
        name=req.name,
        administrative_area=req.administrative_area,
        is_active=req.is_active,
    )
    db.add(area)
    db.commit()
    db.refresh(area)
    return area


def list_service_areas(db: Session, active_only: bool = True) -> list[ServiceArea]:
    stmt = select(ServiceArea)
    if active_only:
        stmt = stmt.where(ServiceArea.is_active.is_(True))
    return list(db.scalars(stmt.order_by(ServiceArea.name.asc())).all())


def get_service_area_by_id(db: Session, area_id: str) -> ServiceArea:
    area = db.get(ServiceArea, area_id)
    if not area:
        raise NotFoundError("Area layanan tidak ditemukan.")
    return area


# --- Collection Slots ---


def create_collection_slot(db: Session, req: CollectionSlotCreateRequest) -> CollectionSlot:
    get_service_area_by_id(db, req.service_area_id)
    if req.start_time >= req.end_time:
        raise ValidationError("Waktu mulai slot harus lebih awal daripada waktu selesai.")

    slot = CollectionSlot(
        service_area_id=req.service_area_id,
        start_time=req.start_time,
        end_time=req.end_time,
        max_capacity=req.max_capacity,
        booked_capacity=0,
        is_active=req.is_active,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


def list_available_slots(db: Session, service_area_id: str) -> list[CollectionSlot]:
    """List open active slots with available capacity."""
    stmt = (
        select(CollectionSlot)
        .where(
            CollectionSlot.service_area_id == service_area_id,
            CollectionSlot.is_active.is_(True),
            CollectionSlot.booked_capacity < CollectionSlot.max_capacity,
        )
        .order_by(CollectionSlot.start_time.asc())
    )
    return list(db.scalars(stmt).all())


# --- Pickup Requests & State Machine ---

# Explicit state transition graph
VALID_TRANSITIONS: dict[str, set[str]] = {
    PickupStatus.SUBMITTED.value: {
        PickupStatus.PENDING_ASSIGNMENT.value,
        PickupStatus.CANCELLED.value,
    },
    PickupStatus.PENDING_ASSIGNMENT.value: {
        PickupStatus.ACCEPTED.value,
        PickupStatus.CANCELLED.value,
        PickupStatus.REJECTED.value,
    },
    PickupStatus.ACCEPTED.value: {
        PickupStatus.EN_ROUTE.value,
        PickupStatus.PENDING_ASSIGNMENT.value,
        PickupStatus.CANCELLED.value,
    },
    PickupStatus.EN_ROUTE.value: {
        PickupStatus.ARRIVED.value,
        PickupStatus.CANCELLED.value,
    },
    PickupStatus.ARRIVED.value: {
        PickupStatus.INSPECTION.value,
        PickupStatus.CANCELLED.value,
    },
    PickupStatus.INSPECTION.value: {
        PickupStatus.WEIGHED.value,
        PickupStatus.REJECTED.value,
        PickupStatus.CANCELLED.value,
    },
    PickupStatus.WEIGHED.value: {
        PickupStatus.COLLECTED.value,
        PickupStatus.CANCELLED.value,
    },
    PickupStatus.COLLECTED.value: {
        PickupStatus.COMPLETED.value,
    },
}


def create_pickup_request(
    db: Session, user: User, req: PickupCreateRequest, request_id: str | None = None
) -> PickupRequest:
    """Create a new waste pickup or drop-off request with idempotency, capacity & safety checks."""
    # 0. Idempotency Check (prevent double-booking and duplicate requests on network retries)
    if req.idempotency_key:
        existing = db.scalar(
            select(PickupRequest).where(
                PickupRequest.reporter_user_id == user.id,
                PickupRequest.idempotency_key == req.idempotency_key,
            )
        )
        if existing:
            return existing

    # 1. Service mode validation
    if req.service_mode not in ("PICKUP", "DROP_OFF"):
        raise ValidationError("Mode layanan tidak valid. Pilihan: 'PICKUP' atau 'DROP_OFF'.")

    # 2. Verify address ownership
    address = db.get(UserAddress, req.address_id)
    if not address or address.user_id != user.id:
        raise NotFoundError("Alamat tidak ditemukan atau bukan milik Anda.")

    if not address.service_area_id:
        raise ValidationError("Alamat belum memiliki area layanan operasional.")

    service_area_id = address.service_area_id

    # 3. Active service area enforcement
    service_area = db.get(ServiceArea, service_area_id)
    if not service_area or not service_area.is_active:
        raise ValidationError("Area layanan operasional sedang tidak aktif atau dinonaktifkan.")

    # 4. Verify waste category is active
    category = db.get(WasteCategory, req.category_id)
    if not category or not category.is_active:
        raise ValidationError("Kategori sampah tidak aktif atau tidak tersedia.")

    # 5. Check material acceptance rule for the area
    rule_stmt = select(MaterialAcceptanceRule).where(
        MaterialAcceptanceRule.category_id == category.id,
        MaterialAcceptanceRule.service_area_id == service_area_id,
    )
    acceptance_rule = db.scalar(rule_stmt)
    if acceptance_rule and not acceptance_rule.is_accepted:
        raise ValidationError(
            f"Kategori sampah [{category.name}] saat ini tidak diterima di area layanan ini."
        )

    # 6. SPECIAL waste safety gate
    if category.category_type == CategoryType.SPECIAL.value and (
        not acceptance_rule
        or not acceptance_rule.is_accepted
        or not acceptance_rule.special_route_confirmed
    ):
        raise ValidationError(
            "Limbah khusus belum memiliki jalur pengolahan dan mitra berizin aktif di wilayah ini. "
            "Penjemputan umum tidak dapat dijadwalkan demi keselamatan."
        )

    # 7. Atomic slot lock and capacity check
    slot_stmt = (
        select(CollectionSlot)
        .where(
            CollectionSlot.id == req.slot_id,
            CollectionSlot.service_area_id == service_area_id,
            CollectionSlot.is_active.is_(True),
        )
        .with_for_update()
    )
    slot = db.scalar(slot_stmt)
    if not slot:
        raise ValidationError(
            "Slot jadwal tidak valid atau berada di luar area layanan alamat Anda."
        )

    if slot.booked_capacity >= slot.max_capacity:
        raise ConflictError("Slot waktu yang dipilih sudah penuh. Silakan pilih slot lain.")

    # Increment slot booked capacity
    slot.booked_capacity += 1

    # 8. Create PickupRequest
    public_code = _generate_public_code()
    pickup = PickupRequest(
        public_code=public_code,
        reporter_user_id=user.id,
        service_area_id=service_area_id,
        category_id=category.id,
        address_id=address.id,
        slot_id=slot.id,
        status=PickupStatus.PENDING_ASSIGNMENT.value,
        service_mode=req.service_mode,
        idempotency_key=req.idempotency_key,
        estimated_weight_kg=float(req.estimated_weight_kg)
        if req.estimated_weight_kg is not None
        else None,
        notes=req.notes,
    )
    db.add(pickup)
    db.flush()

    # 9. Record Initial Status Event
    reason_text = (
        "Permintaan penjemputan berhasil dibuat dan siap diambil petugas."
        if req.service_mode == "PICKUP"
        else "Setoran mandiri berhasil didaftarkan. Harap serahkan sampah ke titik TPS3R sesuai jadwal."
    )
    event = PickupStatusEvent(
        pickup_request_id=pickup.id,
        from_status=PickupStatus.SUBMITTED.value,
        to_status=PickupStatus.PENDING_ASSIGNMENT.value,
        actor_user_id=user.id,
        reason=reason_text,
        request_id=request_id,
    )
    db.add(event)
    db.commit()
    db.refresh(pickup)
    return pickup


def list_user_pickups(db: Session, user_id: str, status: str | None = None) -> list[PickupRequest]:
    """Retrieve pickups reported by the current user."""
    stmt = select(PickupRequest).where(PickupRequest.reporter_user_id == user_id)
    if status:
        stmt = stmt.where(PickupRequest.status == status)
    stmt = stmt.order_by(PickupRequest.created_at.desc())
    return list(db.scalars(stmt).all())


def get_pickup_detail(db: Session, actor: User, pickup_id: str) -> PickupRequest:
    """Retrieve single pickup with access control check."""
    pickup = db.get(PickupRequest, pickup_id)
    if not pickup:
        raise NotFoundError("Permintaan penjemputan tidak ditemukan.")

    # Check access permission:
    # 1. Owner can always read
    if pickup.reporter_user_id == actor.id:
        return pickup

    # 2. Check if actor is Admin
    stmt_admin = (
        select(UserRole)
        .join(Role)
        .where(
            UserRole.user_id == actor.id,
            Role.code == "ADMIN",
            UserRole.verification_status == VerificationStatus.ACTIVE.value,
        )
    )
    if db.scalar(stmt_admin):
        return pickup

    # 3. Check if actor is assigned Collector or task is pending in their area
    if pickup.assigned_collector_id == actor.id:
        return pickup

    stmt_col = (
        select(UserRole)
        .join(Role)
        .where(
            UserRole.user_id == actor.id,
            Role.code == "COLLECTOR",
            UserRole.verification_status == VerificationStatus.ACTIVE.value,
        )
    )
    if db.scalar(stmt_col) and pickup.status == PickupStatus.PENDING_ASSIGNMENT.value:
        return pickup

    raise AuthorizationError("Anda tidak memiliki akses ke data penjemputan ini.")


def cancel_pickup(
    db: Session,
    actor: User,
    pickup_id: str,
    reason: str,
    request_id: str | None = None,
) -> PickupRequest:
    """Cancel a pickup request with valid from-state check and slot release."""
    if not reason or not reason.strip():
        raise ValidationError("Alasan pembatalan wajib diisi.")

    pickup = db.get(PickupRequest, pickup_id)
    if not pickup:
        raise NotFoundError("Permintaan penjemputan tidak ditemukan.")

    # Verify ownership or admin permission
    is_owner = pickup.reporter_user_id == actor.id
    stmt_admin = (
        select(UserRole)
        .join(Role)
        .where(
            UserRole.user_id == actor.id,
            Role.code == "ADMIN",
            UserRole.verification_status == VerificationStatus.ACTIVE.value,
        )
    )
    is_admin = db.scalar(stmt_admin) is not None

    if not is_owner and not is_admin:
        raise AuthorizationError("Hanya pemilik atau administrator yang dapat membatalkan setoran.")

    # Check state machine allowability
    allowed_from = {
        PickupStatus.SUBMITTED.value,
        PickupStatus.PENDING_ASSIGNMENT.value,
        PickupStatus.ACCEPTED.value,
    }
    if pickup.status not in allowed_from:
        raise ConflictError(f"Setoran dalam status [{pickup.status}] tidak dapat dibatalkan.")

    prev_status = pickup.status
    pickup.status = PickupStatus.CANCELLED.value
    pickup.cancellation_reason = reason.strip()

    # Release slot capacity if applicable
    slot = db.get(CollectionSlot, pickup.slot_id)
    if slot and slot.booked_capacity > 0:
        slot.booked_capacity = max(0, slot.booked_capacity - 1)

    event = PickupStatusEvent(
        pickup_request_id=pickup.id,
        from_status=prev_status,
        to_status=PickupStatus.CANCELLED.value,
        actor_user_id=actor.id,
        reason=reason.strip(),
        request_id=request_id,
    )
    db.add(event)
    db.commit()
    db.refresh(pickup)
    return pickup


# --- Collector Task Operations (Atomic) ---


def list_available_tasks(
    db: Session, collector: User, service_area_id: str | None = None
) -> list[PickupRequest]:
    """List pending curbside pickup tasks available for claim by verified collectors."""
    stmt = select(PickupRequest).where(
        PickupRequest.status == PickupStatus.PENDING_ASSIGNMENT.value,
        PickupRequest.service_mode == "PICKUP",
        PickupRequest.assigned_collector_id.is_(None),
    )
    if service_area_id:
        stmt = stmt.where(PickupRequest.service_area_id == service_area_id)
    stmt = stmt.order_by(PickupRequest.created_at.asc())
    return list(db.scalars(stmt).all())


def list_my_tasks(db: Session, collector_id: str, status: str | None = None) -> list[PickupRequest]:
    """List tasks assigned to the current collector."""
    stmt = select(PickupRequest).where(PickupRequest.assigned_collector_id == collector_id)
    if status:
        stmt = stmt.where(PickupRequest.status == status)
    stmt = stmt.order_by(PickupRequest.created_at.desc())
    return list(db.scalars(stmt).all())


def accept_task_atomic(
    db: Session, collector: User, pickup_id: str, request_id: str | None = None
) -> PickupRequest:
    """Atomic claim of a collection task with row locking to prevent race conditions."""
    # 1. Lock pickup row
    stmt = select(PickupRequest).where(PickupRequest.id == pickup_id).with_for_update()
    pickup = db.scalar(stmt)

    if not pickup:
        raise NotFoundError("Tugas penjemputan tidak ditemukan.")

    # 2. Check availability
    if (
        pickup.status != PickupStatus.PENDING_ASSIGNMENT.value
        or pickup.assigned_collector_id is not None
    ):
        raise ConflictError(
            "Tugas penjemputan sudah diambil oleh petugas lain atau status tidak valid."
        )

    # 3. Assign collector and update status
    pickup.assigned_collector_id = collector.id
    pickup.status = PickupStatus.ACCEPTED.value

    # 4. Record event
    event = PickupStatusEvent(
        pickup_request_id=pickup.id,
        from_status=PickupStatus.PENDING_ASSIGNMENT.value,
        to_status=PickupStatus.ACCEPTED.value,
        actor_user_id=collector.id,
        reason="Tugas berhasil diklaim oleh petugas.",
        request_id=request_id,
    )
    db.add(event)
    db.commit()
    db.refresh(pickup)
    return pickup


def update_task_status(
    db: Session,
    actor: User,
    pickup_id: str,
    new_status: str,
    reason: str | None = None,
    request_id: str | None = None,
) -> PickupRequest:
    """Update task status following state machine rules."""
    pickup = db.get(PickupRequest, pickup_id)
    if not pickup:
        raise NotFoundError("Tugas penjemputan tidak ditemukan.")

    # Check collector assignment or admin
    is_assigned = pickup.assigned_collector_id == actor.id
    stmt_admin = (
        select(UserRole)
        .join(Role)
        .where(
            UserRole.user_id == actor.id,
            Role.code == "ADMIN",
            UserRole.verification_status == VerificationStatus.ACTIVE.value,
        )
    )
    is_admin = db.scalar(stmt_admin) is not None

    if not is_assigned and not is_admin:
        raise AuthorizationError("Anda bukan petugas yang ditugaskan untuk tugas ini.")

    # Check state machine
    allowed_next = VALID_TRANSITIONS.get(pickup.status, set())
    if new_status not in allowed_next:
        raise ValidationError(
            f"Transisi status dari [{pickup.status}] ke [{new_status}] tidak diizinkan."
        )

    prev_status = pickup.status
    pickup.status = new_status
    if new_status == PickupStatus.COMPLETED.value:
        pickup.completed_at = datetime.now(UTC)

    event = PickupStatusEvent(
        pickup_request_id=pickup.id,
        from_status=prev_status,
        to_status=new_status,
        actor_user_id=actor.id,
        reason=reason,
        request_id=request_id,
    )
    db.add(event)
    db.commit()
    db.refresh(pickup)
    return pickup


def admin_reassign_pickup(
    db: Session,
    admin_id: str,
    pickup_id: str,
    new_collector_id: str,
    reason: str,
    request_id: str | None = None,
) -> PickupRequest:
    """Admin reassigns an existing pickup task to a different verified collector."""
    pickup = db.get(PickupRequest, pickup_id)
    if not pickup:
        raise NotFoundError("Permintaan penjemputan tidak ditemukan.")

    # Verify new collector is verified ACTIVE collector
    stmt_col = (
        select(UserRole)
        .join(Role)
        .where(
            UserRole.user_id == new_collector_id,
            Role.code == "COLLECTOR",
            UserRole.verification_status == VerificationStatus.ACTIVE.value,
        )
    )
    if not db.scalar(stmt_col):
        raise ValidationError("Petugas baru tidak memiliki role COLLECTOR aktif.")

    prev_collector = pickup.assigned_collector_id
    pickup.assigned_collector_id = new_collector_id

    # Record status event
    event = PickupStatusEvent(
        pickup_request_id=pickup.id,
        from_status=pickup.status,
        to_status=pickup.status,
        actor_user_id=admin_id,
        reason=f"Admin reassign dari [{prev_collector}] ke [{new_collector_id}]: {reason}",
        request_id=request_id,
    )
    db.add(event)

    # Record Audit log
    audit = AuditLog(
        actor_user_id=admin_id,
        action="PICKUP_REASSIGNED",
        entity_type="pickup_request",
        entity_id=pickup.id,
        reason=reason,
        request_id=request_id,
    )
    db.add(audit)
    db.commit()
    db.refresh(pickup)
    return pickup
