"""WasteLink Bali — Notification Domain Service."""

from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.errors import AppError, ErrorCode
from app.modules.notification.models import Notification


def list_user_notifications(
    db: Session,
    user_id: str,
    unread_only: bool = False,
) -> list[Notification]:
    """Retrieve notifications intended strictly for the authenticated user."""
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    if unread_only:
        stmt = stmt.where(Notification.is_read.is_(False))
    return list(db.scalars(stmt).all())


def mark_notification_read(
    db: Session,
    user_id: str,
    notification_id: str,
) -> Notification:
    """Mark a notification as read, ensuring strict ownership isolation."""
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    )
    notif = db.scalar(stmt)
    if not notif:
        raise AppError(
            code=ErrorCode.NOT_FOUND, message="Notifikasi tidak ditemukan.", status_code=404
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


def mark_all_read(db: Session, user_id: str) -> None:
    """Mark all unread notifications as read for a user."""
    stmt = (
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read.is_(False))
        .values(is_read=True)
    )
    db.execute(stmt)
    db.commit()
