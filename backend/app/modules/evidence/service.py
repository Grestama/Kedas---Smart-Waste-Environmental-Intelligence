"""WasteLink Bali — Evidence Domain Service."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, ErrorCode
from app.core.storage import get_storage_adapter
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest
from app.modules.evidence.models import EvidenceFile, EvidenceFileStatus
from app.modules.marketplace.models import DeliveryRecord


def _verify_entity_access(db: Session, user: User, entity_type: str, entity_id: str) -> None:
    """Ensure user is authorized to attach/view evidence for this entity."""
    is_admin = any(
        ur.role.code == "ADMIN" and ur.verification_status == "ACTIVE" for ur in user.user_roles
    )
    if is_admin:
        return

    if entity_type in ["PICKUP", "INSPECTION", "WEIGHT"]:
        pickup = db.scalar(select(PickupRequest).where(PickupRequest.id == entity_id))
        if not pickup:
            raise AppError(
                code=ErrorCode.NOT_FOUND, message="Entitas tidak ditemukan.", status_code=404
            )
        if pickup.user_id != user.id and pickup.collector_id != user.id:
            raise AppError(
                code=ErrorCode.FORBIDDEN,
                message="Anda tidak memiliki izin mengakses bukti untuk setoran ini.",
                status_code=403,
            )
    elif entity_type == "DELIVERY":
        delivery = db.scalar(select(DeliveryRecord).where(DeliveryRecord.id == entity_id))
        if not delivery:
            raise AppError(
                code=ErrorCode.NOT_FOUND,
                message="Entitas pengiriman tidak ditemukan.",
                status_code=404,
            )
        is_collector = any(
            ur.role.code == "COLLECTOR" and ur.verification_status == "ACTIVE"
            for ur in user.user_roles
        )
        if delivery.dispatched_by != user.id and not is_collector:
            raise AppError(
                code=ErrorCode.FORBIDDEN, message="Akses pengiriman ditolak.", status_code=403
            )


def upload_evidence_file(
    db: Session,
    uploader: User,
    file_bytes: bytes,
    original_filename: str,
    content_type: str,
    entity_type: str,
    entity_id: str,
    request_id: str | None = None,
) -> EvidenceFile:
    """Store file via storage adapter and persist metadata in DB."""
    # 1. Access verification
    _verify_entity_access(db, uploader, entity_type, entity_id)

    # 2. Store file securely
    storage = get_storage_adapter()
    stored_obj = storage.upload_file(
        file_bytes=file_bytes,
        original_filename=original_filename,
        content_type=content_type,
        prefix=f"evidence/{entity_type.lower()}",
    )

    # 3. Create record in DB
    evidence = EvidenceFile(
        storage_key=stored_obj.storage_key,
        original_filename=stored_obj.original_filename,
        mime_type=stored_obj.content_type,
        file_size_bytes=stored_obj.file_size_bytes,
        sha256_hash=stored_obj.sha256_hash,
        uploader_id=uploader.id,
        entity_type=entity_type,
        entity_id=entity_id,
        status=EvidenceFileStatus.CONFIRMED.value,
    )
    db.add(evidence)

    # 4. Audit
    audit = AuditLog(
        action="EVIDENCE_UPLOADED",
        actor_id=uploader.id,
        entity_type="EVIDENCE_FILE",
        entity_id=evidence.id,
        request_id=request_id,
        payload_after={
            "storage_key": evidence.storage_key,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "size": stored_obj.file_size_bytes,
        },
    )
    db.add(audit)

    db.commit()
    db.refresh(evidence)
    return evidence


def get_evidence_file(
    db: Session,
    evidence_id: str,
    user: User,
) -> tuple[EvidenceFile, bytes]:
    """Retrieve evidence record and its file content with authorization check."""
    stmt = select(EvidenceFile).where(EvidenceFile.id == evidence_id)
    evidence = db.scalar(stmt)
    if not evidence or evidence.status == EvidenceFileStatus.DELETED.value:
        raise AppError(
            code=ErrorCode.NOT_FOUND, message="File bukti tidak ditemukan.", status_code=404
        )

    _verify_entity_access(db, user, evidence.entity_type, evidence.entity_id)

    storage = get_storage_adapter()
    data = storage.read_file(evidence.storage_key)
    return evidence, data


def list_entity_evidence(
    db: Session,
    entity_type: str,
    entity_id: str,
    user: User,
) -> list[EvidenceFile]:
    """List all evidence attached to a specific domain entity."""
    _verify_entity_access(db, user, entity_type, entity_id)

    stmt = (
        select(EvidenceFile)
        .where(
            EvidenceFile.entity_type == entity_type,
            EvidenceFile.entity_id == entity_id,
            EvidenceFile.status == EvidenceFileStatus.CONFIRMED.value,
        )
        .order_by(EvidenceFile.created_at.asc())
    )
    return list(db.scalars(stmt).all())
