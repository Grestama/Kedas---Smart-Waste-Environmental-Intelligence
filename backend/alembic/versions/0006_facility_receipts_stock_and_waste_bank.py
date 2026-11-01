"""Phase 4 — Facility Receipts, Stock Movements, and Waste Bank Accounts.

Revision ID: 0006_facility_receipts_stock_and_waste_bank
Revises: 0005_pickup_idempotency_and_service_mode
Create Date: 2026-10-30 08:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0006_facility_receipts_stock_and_waste_bank"
down_revision: str | None = "0005_pickup_idempotency_and_service_mode"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. facilities
    op.create_table(
        "facilities",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("facility_type", sa.String(length=50), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=True),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column(
            "capacity_kg_per_day",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default="2000.0",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_facilities_service_area_id_service_areas",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_facilities"),
    )
    op.create_index("ix_facilities_code", "facilities", ["code"], unique=True)
    op.create_index("ix_facilities_facility_type", "facilities", ["facility_type"], unique=False)
    op.create_index(
        "ix_facilities_service_area_id", "facilities", ["service_area_id"], unique=False
    )
    op.create_index("ix_facilities_is_active", "facilities", ["is_active"], unique=False)

    # 2. facility_receipts
    op.create_table(
        "facility_receipts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("receipt_no", sa.String(length=64), nullable=False),
        sa.Column("facility_id", sa.String(length=36), nullable=False),
        sa.Column("pickup_id", sa.String(length=36), nullable=True),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("receiver_user_id", sa.String(length=36), nullable=False),
        sa.Column("sender_user_id", sa.String(length=36), nullable=True),
        sa.Column("gross_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("tare_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("received_weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column(
            "discrepancy_kg",
            sa.Numeric(precision=10, scale=3),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column("discrepancy_reason", sa.Text(), nullable=True),
        sa.Column("quality_grade", sa.String(length=32), nullable=False, server_default="GRADE_A"),
        sa.Column(
            "contamination_percent",
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default="0.0",
        ),
        sa.Column(
            "receipt_status", sa.String(length=32), nullable=False, server_default="ACCEPTED"
        ),
        sa.Column("idempotency_key", sa.String(length=64), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["facility_id"],
            ["facilities.id"],
            name="fk_facility_receipts_facility_id_facilities",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["pickup_id"],
            ["pickup_requests.id"],
            name="fk_facility_receipts_pickup_id_pickup_requests",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_facility_receipts_category_id_waste_categories",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["receiver_user_id"],
            ["users.id"],
            name="fk_facility_receipts_receiver_user_id_users",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["sender_user_id"],
            ["users.id"],
            name="fk_facility_receipts_sender_user_id_users",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_facility_receipts"),
    )
    op.create_index(
        "ix_facility_receipts_receipt_no", "facility_receipts", ["receipt_no"], unique=True
    )
    op.create_index(
        "ix_facility_receipts_facility_id", "facility_receipts", ["facility_id"], unique=False
    )
    op.create_index(
        "ix_facility_receipts_pickup_id", "facility_receipts", ["pickup_id"], unique=False
    )
    op.create_index(
        "ix_facility_receipts_category_id", "facility_receipts", ["category_id"], unique=False
    )
    op.create_index(
        "ix_facility_receipts_receipt_status", "facility_receipts", ["receipt_status"], unique=False
    )
    op.create_index(
        "ix_facility_receipts_idempotency_key",
        "facility_receipts",
        ["idempotency_key"],
        unique=False,
    )

    # 3. stock_movements
    op.create_table(
        "stock_movements",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("facility_id", sa.String(length=36), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("batch_id", sa.String(length=36), nullable=True),
        sa.Column("movement_type", sa.String(length=50), nullable=False),
        sa.Column("quantity_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("reference_id", sa.String(length=64), nullable=True),
        sa.Column("actor_user_id", sa.String(length=36), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["facility_id"],
            ["facilities.id"],
            name="fk_stock_movements_facility_id_facilities",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_stock_movements_category_id_waste_categories",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["batch_id"],
            ["material_batches.id"],
            name="fk_stock_movements_batch_id_material_batches",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["actor_user_id"],
            ["users.id"],
            name="fk_stock_movements_actor_user_id_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_stock_movements"),
    )
    op.create_index(
        "ix_stock_movements_facility_id", "stock_movements", ["facility_id"], unique=False
    )
    op.create_index(
        "ix_stock_movements_category_id", "stock_movements", ["category_id"], unique=False
    )
    op.create_index(
        "ix_stock_movements_movement_type", "stock_movements", ["movement_type"], unique=False
    )
    op.create_index("ix_stock_movements_batch_id", "stock_movements", ["batch_id"], unique=False)
    op.create_index(
        "ix_stock_movements_reference_id", "stock_movements", ["reference_id"], unique=False
    )

    # 4. waste_bank_members
    op.create_table(
        "waste_bank_members",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("account_no", sa.String(length=50), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("facility_id", sa.String(length=36), nullable=False),
        sa.Column("current_balance_idr", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_waste_bank_members_user_id_users",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["facility_id"],
            ["facilities.id"],
            name="fk_waste_bank_members_facility_id_facilities",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_waste_bank_members"),
    )
    op.create_index(
        "ix_waste_bank_members_account_no", "waste_bank_members", ["account_no"], unique=True
    )
    op.create_index(
        "ix_waste_bank_members_user_id", "waste_bank_members", ["user_id"], unique=False
    )
    op.create_index(
        "ix_waste_bank_members_facility_id", "waste_bank_members", ["facility_id"], unique=False
    )
    op.create_index("ix_waste_bank_members_status", "waste_bank_members", ["status"], unique=False)

    # 5. waste_bank_transactions
    op.create_table(
        "waste_bank_transactions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("transaction_no", sa.String(length=64), nullable=False),
        sa.Column("member_id", sa.String(length=36), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=True),
        sa.Column("transaction_type", sa.String(length=32), nullable=False),
        sa.Column("weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("unit_price_idr", sa.Integer(), nullable=True),
        sa.Column("amount_idr", sa.BigInteger(), nullable=False),
        sa.Column("running_balance_idr", sa.BigInteger(), nullable=False),
        sa.Column("receipt_id", sa.String(length=36), nullable=True),
        sa.Column("reverses_transaction_id", sa.String(length=36), nullable=True),
        sa.Column("recorded_by", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="CONFIRMED"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["member_id"],
            ["waste_bank_members.id"],
            name="fk_waste_bank_tx_member_id_waste_bank_members",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_waste_bank_tx_category_id_waste_categories",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["recorded_by"],
            ["users.id"],
            name="fk_waste_bank_tx_recorded_by_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_waste_bank_transactions"),
    )
    op.create_index(
        "ix_waste_bank_tx_transaction_no",
        "waste_bank_transactions",
        ["transaction_no"],
        unique=True,
    )
    op.create_index(
        "ix_waste_bank_tx_member_id", "waste_bank_transactions", ["member_id"], unique=False
    )
    op.create_index(
        "ix_waste_bank_tx_transaction_type",
        "waste_bank_transactions",
        ["transaction_type"],
        unique=False,
    )
    op.create_index("ix_waste_bank_tx_status", "waste_bank_transactions", ["status"], unique=False)


def downgrade() -> None:
    op.drop_table("waste_bank_transactions")
    op.drop_table("waste_bank_members")
    op.drop_table("stock_movements")
    op.drop_table("facility_receipts")
    op.drop_table("facilities")
