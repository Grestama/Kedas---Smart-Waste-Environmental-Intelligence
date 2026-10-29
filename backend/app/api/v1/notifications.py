"""WasteLink Bali — Notification API Endpoints."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.notification import service as notification_service
from app.modules.notification.schemas import NotificationResponse

router = APIRouter()


@router.get(
    "/notifications",
    response_model=list[NotificationResponse],
    summary="Daftar notifikasi aktivitas milik pengguna",
)
async def list_my_notifications(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
    unread_only: bool = False,
) -> list[NotificationResponse]:
    notifications = notification_service.list_user_notifications(
        db, current_user.id, unread_only=unread_only
    )
    return [NotificationResponse.model_validate(n) for n in notifications]


@router.patch(
    "/notifications/{id}/read",
    response_model=NotificationResponse,
    summary="Tandai notifikasi telah dibaca",
)
async def mark_as_read(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> NotificationResponse:
    notif = notification_service.mark_notification_read(db, current_user.id, id)
    return NotificationResponse.model_validate(notif)


@router.post(
    "/notifications/read-all",
    response_model=dict[str, Any],
    summary="Tandai seluruh notifikasi telah dibaca",
)
async def mark_all_as_read(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    notification_service.mark_all_read(db, current_user.id)
    return {"message": "Seluruh notifikasi berhasil ditandai telah dibaca."}
