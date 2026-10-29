"""WasteLink Bali — WastePoints Domain Service.

Manages reward rule versioning, calculation, idempotency, and the append-only ledger.
"""

from __future__ import annotations

import json
import math

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import AppError, ErrorCode
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest
from app.modules.funding import service as funding_service
from app.modules.notification.models import Notification
from app.modules.points.models import (
    LedgerEntry,
    LedgerEntryStatus,
    LedgerEntryType,
    RewardRule,
    RewardRuleStatus,
)
from app.modules.points.schemas import AdminPointAdjustmentRequest, RewardRuleCreateRequest


def get_user_balance(db: Session, user_id: str) -> int:
    """Calculate the user's real-time point balance by summing posted ledger entries."""
    stmt = select(func.coalesce(func.sum(LedgerEntry.points_delta), 0)).where(
        LedgerEntry.user_id == user_id,
        LedgerEntry.status == LedgerEntryStatus.POSTED.value,
    )
    result = db.scalar(stmt)
    return int(result or 0)


def list_user_ledger(db: Session, user_id: str) -> list[LedgerEntry]:
    """Retrieve full append-only transaction history for a user."""
    stmt = (
        select(LedgerEntry)
        .where(LedgerEntry.user_id == user_id)
        .order_by(LedgerEntry.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def get_or_create_reward_rule(db: Session, category_id: str) -> RewardRule:
    """Retrieve the active reward rule for a waste category or provision default."""
    stmt = (
        select(RewardRule)
        .where(
            RewardRule.category_id == category_id,
            RewardRule.status == RewardRuleStatus.ACTIVE.value,
        )
        .order_by(RewardRule.version.desc())
    )
    rule = db.scalar(stmt)
    if not rule:
        # Default: 100 points per kg, minimum 0.1 kg
        rule = RewardRule(
            category_id=category_id,
            version=1,
            status=RewardRuleStatus.ACTIVE.value,
            points_per_kg=100,
            minimum_weight_kg=0.100,
            max_points_per_pickup=5000,
        )
        db.add(rule)
        db.flush()
    return rule


def create_reward_rule(
    db: Session,
    creator_id: str,
    req: RewardRuleCreateRequest,
) -> RewardRule:
    """Create a new version of reward rule for a waste category."""
    # Find current latest version
    stmt = (
        select(RewardRule)
        .where(RewardRule.category_id == req.category_id)
        .order_by(RewardRule.version.desc())
    )
    latest = db.scalar(stmt)
    new_version = (latest.version + 1) if latest else 1

    # Deprecate previous active rule
    if latest and latest.status == RewardRuleStatus.ACTIVE.value:
        latest.status = RewardRuleStatus.DEPRECATED.value

    rule = RewardRule(
        category_id=req.category_id,
        version=new_version,
        status=RewardRuleStatus.ACTIVE.value,
        points_per_kg=req.points_per_kg,
        minimum_weight_kg=req.minimum_weight_kg,
        max_points_per_pickup=req.max_points_per_pickup,
        created_by=creator_id,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def evaluate_and_post_pickup_reward(
    db: Session,
    pickup: PickupRequest,
    net_weight_kg: float,
    actor_id: str,
    version: int = 1,
    request_id: str | None = None,
) -> LedgerEntry | None:
    """Evaluate reward rules and post points to the immutable ledger idempotently."""
    idempotency_key = f"PICKUP_REWARD:{pickup.id}:{version}"

    # 1. Check idempotency
    existing_stmt = select(LedgerEntry).where(LedgerEntry.idempotency_key == idempotency_key)
    existing_entry = db.scalar(existing_stmt)
    if existing_entry:
        return existing_entry

    # 2. Lookup active reward rule
    rule = get_or_create_reward_rule(db, pickup.category_id)

    # 3. Check minimum weight threshold
    if net_weight_kg < float(rule.minimum_weight_kg):
        return None

    # 4. Deterministic points calculation
    calculated_points = int(math.floor(net_weight_kg * rule.points_per_kg))
    if rule.max_points_per_pickup and calculated_points > rule.max_points_per_pickup:
        calculated_points = rule.max_points_per_pickup

    if calculated_points <= 0:
        return None

    # 5. Budget reservation
    funding_service.reserve_and_disburse_points(db, calculated_points)

    # 6. Post to append-only ledger
    snapshot = json.dumps(
        {
            "rule_id": rule.id,
            "version": rule.version,
            "points_per_kg": rule.points_per_kg,
            "net_weight_kg": net_weight_kg,
        }
    )
    entry = LedgerEntry(
        user_id=pickup.user_id,
        points_delta=calculated_points,
        entry_type=LedgerEntryType.EARNED_PICKUP.value,
        status=LedgerEntryStatus.POSTED.value,
        source_type="PICKUP_REQUEST",
        source_id=pickup.id,
        idempotency_key=idempotency_key,
        rule_snapshot=snapshot,
        actor_id=actor_id,
        reason=f"Poin setoran sampah #{pickup.tracking_code} ({net_weight_kg:.2f} kg)",
    )
    db.add(entry)

    # 7. Audit log
    audit = AuditLog(
        action="POINTS_POSTED",
        actor_id=actor_id,
        entity_type="LEDGER_ENTRY",
        entity_id=entry.id,
        request_id=request_id,
        payload_after={
            "user_id": pickup.user_id,
            "points": calculated_points,
            "idempotency_key": idempotency_key,
        },
    )
    db.add(audit)

    # 8. Notification
    notification = Notification(
        user_id=pickup.user_id,
        title="WastePoints Diterima!",
        body=f"Selamat! Anda mendapatkan +{calculated_points} WastePoints dari setoran sampah #{pickup.tracking_code}.",
        event_type="POINTS_EARNED",
        reference_id=pickup.id,
    )
    db.add(notification)

    db.flush()
    return entry


def reverse_or_adjust_pickup_reward(
    db: Session,
    pickup: PickupRequest,
    previous_version: int,
    new_version: int,
    new_net_weight_kg: float,
    actor_id: str,
    request_id: str | None = None,
) -> None:
    """Reverse prior points reward when weight is superseded and issue corrected reward."""
    prev_idemp_key = f"PICKUP_REWARD:{pickup.id}:{previous_version}"
    stmt = select(LedgerEntry).where(
        LedgerEntry.idempotency_key == prev_idemp_key,
        LedgerEntry.status == LedgerEntryStatus.POSTED.value,
    )
    prev_entry = db.scalar(stmt)
    if prev_entry:
        # Create reversal entry
        rev_key = f"REVERSAL:{pickup.id}:{previous_version}"
        reversal = LedgerEntry(
            user_id=prev_entry.user_id,
            points_delta=-prev_entry.points_delta,
            entry_type=LedgerEntryType.REVERSAL.value,
            status=LedgerEntryStatus.POSTED.value,
            source_type="PICKUP_REQUEST",
            source_id=pickup.id,
            idempotency_key=rev_key,
            actor_id=actor_id,
            reason=f"Koreksi berat setoran sampah #{pickup.tracking_code}",
            reverses_entry_id=prev_entry.id,
        )
        db.add(reversal)
        funding_service.reimburse_points(db, prev_entry.points_delta)

    # Post new reward
    evaluate_and_post_pickup_reward(
        db,
        pickup=pickup,
        net_weight_kg=new_net_weight_kg,
        actor_id=actor_id,
        version=new_version,
        request_id=request_id,
    )


def admin_adjust_points(
    db: Session,
    admin: User,
    req: AdminPointAdjustmentRequest,
    request_id: str | None = None,
) -> LedgerEntry:
    """Perform an administrative point adjustment with idempotency and balance safeguards."""
    if req.points_delta == 0:
        raise AppError(
            code=ErrorCode.VALIDATION_ERROR,
            message="Perubahan poin tidak boleh nol (0).",
            status_code=400,
        )

    # 1. Check idempotency
    existing_stmt = select(LedgerEntry).where(LedgerEntry.idempotency_key == req.idempotency_key)
    existing_entry = db.scalar(existing_stmt)
    if existing_entry:
        if (
            existing_entry.user_id == req.user_id
            and existing_entry.points_delta == req.points_delta
        ):
            return existing_entry
        raise AppError(
            code=ErrorCode.CONFLICT,
            message="Idempotency key telah digunakan dengan data transaksi berbeda.",
            status_code=409,
        )

    # 2. Check negative balance safeguard
    if req.points_delta < 0:
        current_balance = get_user_balance(db, req.user_id)
        if current_balance + req.points_delta < 0:
            raise AppError(
                code=ErrorCode.VALIDATION_ERROR,
                message=f"Saldo poin pengguna ({current_balance}) tidak mencukupi untuk pengurangan sebesar {abs(req.points_delta)}.",
                status_code=400,
            )

    entry = LedgerEntry(
        user_id=req.user_id,
        points_delta=req.points_delta,
        entry_type=LedgerEntryType.ADJUSTMENT.value,
        status=LedgerEntryStatus.POSTED.value,
        source_type="ADMIN_ADJUSTMENT",
        source_id=admin.id,
        idempotency_key=req.idempotency_key,
        actor_id=admin.id,
        reason=req.reason,
    )
    db.add(entry)

    # Audit log
    audit = AuditLog(
        action="ADMIN_POINTS_ADJUSTMENT",
        actor_id=admin.id,
        entity_type="LEDGER_ENTRY",
        entity_id=entry.id,
        request_id=request_id,
        payload_after={
            "user_id": req.user_id,
            "points_delta": req.points_delta,
            "reason": req.reason,
        },
    )
    db.add(audit)

    db.commit()
    db.refresh(entry)
    return entry
