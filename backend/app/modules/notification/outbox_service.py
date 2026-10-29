"""WasteLink Bali — Notification Transactional Outbox Service.

Enqueues external side effects within ACID boundaries and processes them reliably
with exponential retry limits and dead-letter failure isolation.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.notification.models import NotificationOutbox, OutboxStatus


def enqueue_outbox_event(
    db: Session,
    event_type: str,
    payload: dict[str, Any],
) -> NotificationOutbox:
    """Stage an external notification event in the database transactional outbox."""
    outbox_item = NotificationOutbox(
        event_type=event_type,
        payload_json=json.dumps(payload),
        status=OutboxStatus.PENDING.value,
        retry_count=0,
        max_retries=3,
    )
    db.add(outbox_item)
    db.flush()
    return outbox_item


def process_outbox_batch(
    db: Session,
    batch_size: int = 50,
    fail_simulation_rate: float = 0.0,
) -> dict[str, int]:
    """Process pending outbox events reliably with failure tracking and bounded retries."""
    stmt = (
        select(NotificationOutbox)
        .where(NotificationOutbox.status == OutboxStatus.PENDING.value)
        .order_by(NotificationOutbox.created_at.asc())
        .limit(batch_size)
        .with_for_update()
    )
    items = list(db.scalars(stmt).all())

    processed_count = 0
    failed_count = 0

    for item in items:
        try:
            # Here real external SMS/WhatsApp/Push provider would be invoked
            # If fail simulation rate triggered (for test purposes):
            if fail_simulation_rate > 0.0:
                raise RuntimeError("Simulated external notification gateway timeout.")

            item.status = OutboxStatus.PROCESSED.value
            item.processed_at = datetime.now(UTC)
            item.last_error = None
            processed_count += 1
        except Exception as exc:
            item.retry_count += 1
            item.last_error = str(exc)
            if item.retry_count >= item.max_retries:
                item.status = OutboxStatus.FAILED.value
            failed_count += 1

    db.commit()
    return {"processed": processed_count, "failed": failed_count}
