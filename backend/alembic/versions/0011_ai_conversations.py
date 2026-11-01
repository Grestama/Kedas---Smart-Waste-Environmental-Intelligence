"""Phase AI — Kedas Conversation Lifecycle, Messages, and Thread Management.

Revision ID: 0011_ai_conversations
Revises: 0010_ai_knowledge
Create Date: 2026-11-01 12:15:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0011_ai_conversations"
down_revision: str | None = "0010_ai_knowledge"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. ai_conversations
    op.create_table(
        "ai_conversations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("session_token", sa.String(length=64), nullable=True),
        sa.Column("destination_id", sa.String(length=36), nullable=True),
        sa.Column(
            "title", sa.String(length=255), nullable=False, server_default="Percakapan EcoGuide"
        ),
        sa.Column("actor_type", sa.String(length=32), nullable=False, server_default="GUEST"),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["destination_id"], ["service_areas.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_conversations_user_id", "ai_conversations", ["user_id"])
    op.create_index("ix_ai_conversations_session_token", "ai_conversations", ["session_token"])
    op.create_index("ix_ai_conversations_destination_id", "ai_conversations", ["destination_id"])

    # 2. ai_messages
    op.create_table(
        "ai_messages",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("sender", sa.String(length=16), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("citations_json", sa.Text(), nullable=True),
        sa.Column("provenance", sa.String(length=32), nullable=False, server_default="VERIFIED"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="ANSWERED"),
        sa.Column("abstain_reason", sa.Text(), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("log_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["ai_conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_messages_conversation_id", "ai_messages", ["conversation_id"])


def downgrade() -> None:
    op.drop_table("ai_messages")
    op.drop_table("ai_conversations")
