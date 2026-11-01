"""Phase 5 — Material Partners, Marketplace Offers, Organic Processing & B2B.

Revision ID: 0007_partner_marketplace_b2b_and_organic
Revises: 0006_facility_receipts_stock_and_waste_bank
Create Date: 2026-10-30 08:30:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0007_partner_marketplace_b2b_and_organic"
down_revision: str | None = "0006_facility_receipts_stock_and_waste_bank"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Extend partners table using batch mode for SQLite & PostgreSQL compatibility
    with op.batch_alter_table("partners") as batch_op:
        batch_op.add_column(
            sa.Column(
                "partner_type", sa.String(length=50), nullable=False, server_default="PENDAUR_ULANG"
            )
        )
        batch_op.add_column(
            sa.Column("capacity_kg_per_month", sa.Numeric(precision=10, scale=2), nullable=True)
        )
        batch_op.add_column(sa.Column("service_area_id", sa.String(length=36), nullable=True))
        batch_op.add_column(sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column("verified_by", sa.String(length=36), nullable=True))
        batch_op.create_index("ix_partners_partner_type", ["partner_type"], unique=False)
        batch_op.create_foreign_key(
            "fk_partners_service_area_id",
            "service_areas",
            ["service_area_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch_op.create_foreign_key(
            "fk_partners_verified_by_users", "users", ["verified_by"], ["id"], ondelete="SET NULL"
        )

    # 2. material_offers
    op.create_table(
        "material_offers",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("offer_no", sa.String(length=64), nullable=False),
        sa.Column("offer_type", sa.String(length=32), nullable=False),  # SUPPLY vs DEMAND
        sa.Column("partner_id", sa.String(length=36), nullable=True),
        sa.Column("facility_id", sa.String(length=36), nullable=True),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("min_quantity_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("max_quantity_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("quality_grade", sa.String(length=32), nullable=False, server_default="GRADE_A"),
        sa.Column("price_indicative_idr", sa.Integer(), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="OPEN"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["partner_id"],
            ["partners.id"],
            name="fk_material_offers_partner_id_partners",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["facility_id"],
            ["facilities.id"],
            name="fk_material_offers_facility_id_facilities",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_material_offers_category_id_waste_categories",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
            name="fk_material_offers_created_by_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_material_offers"),
    )
    op.create_index("ix_material_offers_offer_no", "material_offers", ["offer_no"], unique=True)
    op.create_index(
        "ix_material_offers_offer_type", "material_offers", ["offer_type"], unique=False
    )
    op.create_index(
        "ix_material_offers_category_id", "material_offers", ["category_id"], unique=False
    )
    op.create_index("ix_material_offers_status", "material_offers", ["status"], unique=False)
    op.create_index(
        "ix_material_offers_valid_until", "material_offers", ["valid_until"], unique=False
    )

    # 3. organic_processing_records
    op.create_table(
        "organic_processing_records",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("batch_no", sa.String(length=64), nullable=False),
        sa.Column("facility_id", sa.String(length=36), nullable=False),
        sa.Column("operator_user_id", sa.String(length=36), nullable=False),
        sa.Column("process_type", sa.String(length=50), nullable=False),
        sa.Column("input_weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column(
            "output_product_weight_kg",
            sa.Numeric(precision=10, scale=3),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column(
            "residue_weight_kg",
            sa.Numeric(precision=10, scale=3),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="IN_PROGRESS"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["facility_id"],
            ["facilities.id"],
            name="fk_organic_proc_facility_id_facilities",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["operator_user_id"],
            ["users.id"],
            name="fk_organic_proc_operator_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_organic_processing_records"),
    )
    op.create_index(
        "ix_organic_proc_batch_no", "organic_processing_records", ["batch_no"], unique=True
    )
    op.create_index(
        "ix_organic_proc_facility_id", "organic_processing_records", ["facility_id"], unique=False
    )
    op.create_index(
        "ix_organic_proc_status", "organic_processing_records", ["status"], unique=False
    )

    # 4. b2b_organizations
    op.create_table(
        "b2b_organizations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("business_type", sa.String(length=50), nullable=False),
        sa.Column("tax_id", sa.String(length=50), nullable=True),
        sa.Column("billing_contact_name", sa.String(length=100), nullable=False),
        sa.Column("billing_contact_phone", sa.String(length=50), nullable=False),
        sa.Column("billing_contact_email", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_b2b_organizations"),
    )
    op.create_index("ix_b2b_organizations_name", "b2b_organizations", ["name"], unique=False)
    op.create_index(
        "ix_b2b_organizations_is_active", "b2b_organizations", ["is_active"], unique=False
    )

    # 5. b2b_organization_members
    op.create_table(
        "b2b_organization_members",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("organization_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False, server_default="STAFF"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["b2b_organizations.id"],
            name="fk_b2b_members_org_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_b2b_members_user_id", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_b2b_organization_members"),
        sa.UniqueConstraint("organization_id", "user_id", name="uq_b2b_org_user"),
    )
    op.create_index(
        "ix_b2b_members_org_id", "b2b_organization_members", ["organization_id"], unique=False
    )
    op.create_index("ix_b2b_members_user_id", "b2b_organization_members", ["user_id"], unique=False)

    # 6. b2b_locations
    op.create_table(
        "b2b_locations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("organization_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=True),
        sa.Column("contact_person", sa.String(length=100), nullable=False),
        sa.Column("contact_phone", sa.String(length=50), nullable=False),
        sa.Column(
            "estimated_daily_kg",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default="50.0",
        ),
        sa.Column("pickup_frequency", sa.String(length=50), nullable=False, server_default="DAILY"),
        sa.Column("access_instructions", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["b2b_organizations.id"],
            name="fk_b2b_locations_org_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_b2b_locations_service_area_id",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_b2b_locations"),
    )
    op.create_index("ix_b2b_locations_org_id", "b2b_locations", ["organization_id"], unique=False)
    op.create_index(
        "ix_b2b_locations_service_area_id", "b2b_locations", ["service_area_id"], unique=False
    )

    # 7. b2b_pickup_requests
    op.create_table(
        "b2b_pickup_requests",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("request_no", sa.String(length=64), nullable=False),
        sa.Column("location_id", sa.String(length=36), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("scheduled_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("estimated_weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("actual_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="SCHEDULED"),
        sa.Column("collector_id", sa.String(length=36), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["location_id"],
            ["b2b_locations.id"],
            name="fk_b2b_pickups_location_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_b2b_pickups_category_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["collector_id"], ["users.id"], name="fk_b2b_pickups_collector_id", ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_b2b_pickup_requests"),
    )
    op.create_index("ix_b2b_pickups_request_no", "b2b_pickup_requests", ["request_no"], unique=True)
    op.create_index(
        "ix_b2b_pickups_location_id", "b2b_pickup_requests", ["location_id"], unique=False
    )
    op.create_index("ix_b2b_pickups_status", "b2b_pickup_requests", ["status"], unique=False)
    op.create_index(
        "ix_b2b_pickups_scheduled_date", "b2b_pickup_requests", ["scheduled_date"], unique=False
    )


def downgrade() -> None:
    op.drop_table("b2b_pickup_requests")
    op.drop_table("b2b_locations")
    op.drop_table("b2b_organization_members")
    op.drop_table("b2b_organizations")
    op.drop_table("organic_processing_records")
    op.drop_table("material_offers")

    with op.batch_alter_table("partners") as batch_op:
        batch_op.drop_constraint("fk_partners_verified_by_users", type_="foreignkey")
        batch_op.drop_constraint("fk_partners_service_area_id", type_="foreignkey")
        batch_op.drop_index("ix_partners_partner_type")
        batch_op.drop_column("verified_by")
        batch_op.drop_column("verified_at")
        batch_op.drop_column("service_area_id")
        batch_op.drop_column("capacity_kg_per_month")
        batch_op.drop_column("partner_type")
