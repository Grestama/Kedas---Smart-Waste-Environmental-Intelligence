"""Phase 6 — Community Banjar, Funding Programs, Clean-up Actions & Hazardous Waste.

Revision ID: 0008_community_programs
Revises: 0007_partner_marketplace
Create Date: 2026-10-30 08:35:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0008_community_programs"
down_revision: str | None = "0007_partner_marketplace"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Extend funding_programs table using batch mode for SQLite compatibility
    with op.batch_alter_table("funding_programs") as batch_op:
        batch_op.add_column(sa.Column("sponsor_name", sa.String(length=150), nullable=True))
        batch_op.add_column(
            sa.Column(
                "program_type",
                sa.String(length=50),
                nullable=False,
                server_default="COMMUNITY",
            )
        )
        batch_op.add_column(
            sa.Column("target_service_area_id", sa.String(length=36), nullable=True)
        )
        batch_op.add_column(
            sa.Column(
                "disbursed_budget_idr",
                sa.BigInteger(),
                nullable=False,
                server_default="0",
            )
        )
        batch_op.create_foreign_key(
            "fk_funding_programs_target_service_area",
            "service_areas",
            ["target_service_area_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # 2. program_sponsorships
    op.create_table(
        "program_sponsorships",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("program_id", sa.String(length=36), nullable=False),
        sa.Column("sponsor_name", sa.String(length=150), nullable=False),
        sa.Column("sponsor_type", sa.String(length=50), nullable=False),
        sa.Column("amount_idr", sa.BigInteger(), nullable=False),
        sa.Column("contract_ref", sa.String(length=100), nullable=True),
        sa.Column("contributed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["program_id"],
            ["funding_programs.id"],
            name="fk_program_sponsorships_program_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_program_sponsorships"),
    )
    op.create_index(
        "ix_program_sponsorships_program_id",
        "program_sponsorships",
        ["program_id"],
        unique=False,
    )

    # 3. program_budget_allocations
    op.create_table(
        "program_budget_allocations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("program_id", sa.String(length=36), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("allocated_amount_idr", sa.BigInteger(), nullable=False),
        sa.Column("spent_amount_idr", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("purpose", sa.String(length=255), nullable=False),
        sa.Column("allocated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["program_id"],
            ["funding_programs.id"],
            name="fk_budget_allocations_program_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_budget_allocations_service_area_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_program_budget_allocations"),
    )
    op.create_index(
        "ix_budget_allocations_area_program",
        "program_budget_allocations",
        ["service_area_id", "program_id"],
        unique=False,
    )

    # 4. banjar_profiles
    op.create_table(
        "banjar_profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("desa_adat_name", sa.String(length=150), nullable=False),
        sa.Column("kelian_banjar_name", sa.String(length=150), nullable=False),
        sa.Column("contact_phone", sa.String(length=32), nullable=False),
        sa.Column("household_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "target_sorting_percent",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default="70.0",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_banjar_profiles_service_area_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_banjar_profiles"),
        sa.UniqueConstraint("service_area_id", name="uq_banjar_profiles_service_area_id"),
    )

    # 5. banjar_officials
    op.create_table(
        "banjar_officials",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("official_title", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_banjar_officials_user_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_banjar_officials_service_area_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_banjar_officials"),
    )
    op.create_index(
        "ix_banjar_officials_user_area",
        "banjar_officials",
        ["user_id", "service_area_id"],
        unique=False,
    )

    # 6. community_events
    op.create_table(
        "community_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("event_no", sa.String(length=64), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="SCHEDULED",
        ),
        sa.Column("organizer_user_id", sa.String(length=36), nullable=False),
        sa.Column("expected_attendees", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("actual_attendees", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_community_events_service_area_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["organizer_user_id"],
            ["users.id"],
            name="fk_community_events_organizer_user_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_community_events"),
        sa.UniqueConstraint("event_no", name="uq_community_events_event_no"),
    )
    op.create_index(
        "ix_community_events_area_status",
        "community_events",
        ["service_area_id", "status"],
        unique=False,
    )

    # 7. community_complaints
    op.create_table(
        "community_complaints",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("ticket_no", sa.String(length=64), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("reporter_user_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("location_detail", sa.String(length=255), nullable=False),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="REPORTED",
        ),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("resolved_by", sa.String(length=36), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_community_complaints_service_area_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["reporter_user_id"],
            ["users.id"],
            name="fk_community_complaints_reporter_user_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["resolved_by"],
            ["users.id"],
            name="fk_community_complaints_resolved_by",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_community_complaints"),
        sa.UniqueConstraint("ticket_no", name="uq_community_complaints_ticket_no"),
    )
    op.create_index(
        "ix_community_complaints_area_status",
        "community_complaints",
        ["service_area_id", "status"],
        unique=False,
    )

    # 8. cleanup_actions (Tim Kebersihan Pantai/Sungai/Relawan - Role 11)
    op.create_table(
        "cleanup_actions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("action_no", sa.String(length=64), nullable=False),
        sa.Column("action_type", sa.String(length=50), nullable=False),
        sa.Column("location_name", sa.String(length=200), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=True),
        sa.Column("coordinator_user_id", sa.String(length=36), nullable=False),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "duration_hours",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default="2.0",
        ),
        sa.Column("volunteer_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "total_collected_weight_kg",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column(
            "plastic_weight_kg",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column(
            "organic_weight_kg",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column(
            "residual_weight_kg",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column("evidence_notes", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="PLANNED",
        ),
        sa.Column("verified_by", sa.String(length=36), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_cleanup_actions_service_area_id",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["coordinator_user_id"],
            ["users.id"],
            name="fk_cleanup_actions_coordinator_user_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["verified_by"],
            ["users.id"],
            name="fk_cleanup_actions_verified_by",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_cleanup_actions"),
        sa.UniqueConstraint("action_no", name="uq_cleanup_actions_action_no"),
    )
    op.create_index(
        "ix_cleanup_actions_type_status",
        "cleanup_actions",
        ["action_type", "status"],
        unique=False,
    )

    # 9. hazardous_waste_manifests (Pengelolaan Limbah Khusus B3 - Role 12)
    op.create_table(
        "hazardous_waste_manifests",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("manifest_no", sa.String(length=64), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=True),
        sa.Column("source_pickup_id", sa.String(length=36), nullable=True),
        sa.Column("handler_partner_id", sa.String(length=36), nullable=False),
        sa.Column("transporter_license_no", sa.String(length=100), nullable=False),
        sa.Column("weight_kg", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("hazard_type", sa.String(length=50), nullable=False),
        sa.Column("handling_sop_code", sa.String(length=50), nullable=False),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="IN_TRANSIT",
        ),
        sa.Column("destruction_cert_no", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("disposed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_hazardous_manifests_category_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_hazardous_manifests_service_area_id",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["source_pickup_id"],
            ["pickup_requests.id"],
            name="fk_hazardous_manifests_source_pickup_id",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["handler_partner_id"],
            ["partners.id"],
            name="fk_hazardous_manifests_handler_partner_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
            name="fk_hazardous_manifests_created_by",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_hazardous_waste_manifests"),
        sa.UniqueConstraint("manifest_no", name="uq_hazardous_manifests_manifest_no"),
    )
    op.create_index(
        "ix_hazardous_manifests_status",
        "hazardous_waste_manifests",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("hazardous_waste_manifests")
    op.drop_table("cleanup_actions")
    op.drop_table("community_complaints")
    op.drop_table("community_events")
    op.drop_table("banjar_officials")
    op.drop_table("banjar_profiles")
    op.drop_table("program_budget_allocations")
    op.drop_table("program_sponsorships")

    with op.batch_alter_table("funding_programs") as batch_op:
        batch_op.drop_constraint("fk_funding_programs_target_service_area", type_="foreignkey")
        batch_op.drop_column("disbursed_budget_idr")
        batch_op.drop_column("target_service_area_id")
        batch_op.drop_column("program_type")
        batch_op.drop_column("sponsor_name")
