"""WasteLink Bali — Notification Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    body: str
    event_type: str
    reference_id: str | None = None
    is_read: bool
    created_at: datetime
