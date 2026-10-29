"""Phase 4 — Notification Transactional Outbox.

Revision ID: 0004_notification_outbox
Revises: 0003_inspection_weight_points_marketplace
Create Date: 2026-10-29 14:15:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004_notification_outbox"
down_revision: str | None = "0003_inspection_weight_points_marketplace"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "notification_outbox",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=100), nullable=False),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("max_retries", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_notification_outbox"),
    )
    op.create_index(
        "ix_notification_outbox_event_type", "notification_outbox", ["event_type"], unique=False
    )
    op.create_index(
        "ix_notification_outbox_status", "notification_outbox", ["status"], unique=False
    )
    op.create_index(
        "ix_notification_outbox_created_at", "notification_outbox", ["created_at"], unique=False
    )


def downgrade() -> None:
    op.drop_table("notification_outbox")
