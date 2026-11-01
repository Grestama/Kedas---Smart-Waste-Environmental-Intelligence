"""Phase AI — Kedas Knowledge Documents, Chunks, and AI Interaction Logs.

Revision ID: 0010_ai_knowledge
Revises: 0009_cdoa_agreements
Create Date: 2026-10-30 14:15:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0010_ai_knowledge"
down_revision: str | None = "0009_cdoa_agreements"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. knowledge_documents
    op.create_table(
        "knowledge_documents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("source_type", sa.String(length=64), nullable=False, server_default="SOP"),
        sa.Column("destination_id", sa.String(length=36), nullable=True),
        sa.Column("organization_id", sa.String(length=36), nullable=True),
        sa.Column("cdoa_id", sa.String(length=36), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("version", sa.String(length=32), nullable=False, server_default="1.0"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PUBLISHED"),
        sa.Column("checksum", sa.String(length=64), nullable=False),
        sa.Column("total_chunks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["destination_id"], ["service_areas.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["organization_id"], ["b2b_organizations.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["cdoa_id"], ["cdoa_agreements.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_knowledge_documents_title", "knowledge_documents", ["title"])
    op.create_index("ix_knowledge_documents_source_type", "knowledge_documents", ["source_type"])
    op.create_index(
        "ix_knowledge_documents_destination_id", "knowledge_documents", ["destination_id"]
    )
    op.create_index(
        "ix_knowledge_documents_organization_id", "knowledge_documents", ["organization_id"]
    )
    op.create_index("ix_knowledge_documents_is_public", "knowledge_documents", ["is_public"])
    op.create_index("ix_knowledge_documents_status", "knowledge_documents", ["status"])

    # 2. knowledge_chunks
    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("document_id", sa.String(length=36), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("section_title", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("token_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["knowledge_documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_knowledge_chunks_document_id", "knowledge_chunks", ["document_id"])

    # 3. ai_interaction_logs
    op.create_table(
        "ai_interaction_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_id", sa.String(length=64), nullable=True),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("capability", sa.String(length=32), nullable=False),
        sa.Column("destination_id", sa.String(length=36), nullable=True),
        sa.Column("prompt_summary", sa.Text(), nullable=True),
        sa.Column("response_summary", sa.Text(), nullable=True),
        sa.Column("citations_json", sa.Text(), nullable=True),
        sa.Column("confidence_band", sa.String(length=32), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("provider", sa.String(length=64), nullable=False),
        sa.Column("fallback_used", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("feedback_rating", sa.String(length=16), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_interaction_logs_session_id", "ai_interaction_logs", ["session_id"])
    op.create_index("ix_ai_interaction_logs_user_id", "ai_interaction_logs", ["user_id"])
    op.create_index("ix_ai_interaction_logs_capability", "ai_interaction_logs", ["capability"])
    op.create_index(
        "ix_ai_interaction_logs_destination_id", "ai_interaction_logs", ["destination_id"]
    )
    op.create_index("ix_ai_interaction_logs_created_at", "ai_interaction_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("ai_interaction_logs")
    op.drop_table("knowledge_chunks")
    op.drop_table("knowledge_documents")
