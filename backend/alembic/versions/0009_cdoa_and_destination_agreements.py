"""Phase 2 — Community Destination Operating Agreement (CDOA) & Destination Operations.

Revision ID: 0009_cdoa_and_destination_agreements
Revises: 0008_community_programs_funding_and_special_features
Create Date: 2026-10-30 12:35:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0009_cdoa_and_destination_agreements"
down_revision: str | None = "0008_community_programs_funding_and_special_features"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "cdoa_agreements",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("agreement_no", sa.String(length=64), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="DRAFT"),
        sa.Column(
            "eligible_source_types",
            sa.String(length=255),
            nullable=False,
            server_default="HOUSEHOLD,HOREKA,COMMUNITY_EVENT",
        ),
        sa.Column("accepted_category_ids", sa.Text(), nullable=True),
        sa.Column("primary_facility_id", sa.String(length=36), nullable=True),
        sa.Column("collection_schedule_notes", sa.Text(), nullable=True),
        sa.Column("capacity_limit_daily_kg", sa.Float(), nullable=False, server_default="500.0"),
        sa.Column(
            "pic_name", sa.String(length=100), nullable=False, server_default="Prajuru Banjar"
        ),
        sa.Column(
            "pic_contact", sa.String(length=50), nullable=False, server_default="08123456789"
        ),
        sa.Column(
            "escalation_channel",
            sa.String(length=100),
            nullable=False,
            server_default="Kantor Banjar / Balai Desa",
        ),
        sa.Column("sla_hours", sa.Integer(), nullable=False, server_default="24"),
        sa.Column("effective_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("effective_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("approved_by", sa.String(length=36), nullable=True),
        sa.Column("approval_timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["approved_by"],
            ["users.id"],
            name="fk_cdoa_agreements_approved_by",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
            name="fk_cdoa_agreements_created_by",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["primary_facility_id"],
            ["facilities.id"],
            name="fk_cdoa_agreements_primary_facility_id",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_cdoa_agreements_service_area_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_cdoa_agreements"),
        sa.UniqueConstraint("agreement_no", name="uq_cdoa_agreements_agreement_no"),
    )
    op.create_index(
        "ix_cdoa_agreements_agreement_no",
        "cdoa_agreements",
        ["agreement_no"],
        unique=False,
    )
    op.create_index(
        "ix_cdoa_agreements_service_area_id",
        "cdoa_agreements",
        ["service_area_id"],
        unique=False,
    )
    op.create_index(
        "ix_cdoa_agreements_status",
        "cdoa_agreements",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("cdoa_agreements")
