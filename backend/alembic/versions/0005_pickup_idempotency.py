"""Phase 2 — Pickup Idempotency Key and Service Mode.

Revision ID: 0005_pickup_idempotency
Revises: 0004_notification_outbox
Create Date: 2026-10-30 07:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005_pickup_idempotency"
down_revision: str | None = "0004_notification_outbox"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("pickup_requests") as batch_op:
        batch_op.add_column(sa.Column("idempotency_key", sa.String(length=64), nullable=True))
        batch_op.add_column(
            sa.Column(
                "service_mode",
                sa.String(length=32),
                nullable=False,
                server_default="PICKUP",
            )
        )
        batch_op.create_index(
            "ix_pickup_requests_idempotency_key",
            ["idempotency_key"],
            unique=False,
        )
        batch_op.create_index(
            "ix_pickup_requests_service_mode",
            ["service_mode"],
            unique=False,
        )
        batch_op.create_index(
            "ix_pickups_reporter_idempotency",
            ["reporter_user_id", "idempotency_key"],
            unique=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("pickup_requests") as batch_op:
        batch_op.drop_index("ix_pickups_reporter_idempotency")
        batch_op.drop_index("ix_pickup_requests_service_mode")
        batch_op.drop_index("ix_pickup_requests_idempotency_key")
        batch_op.drop_column("service_mode")
        batch_op.drop_column("idempotency_key")
