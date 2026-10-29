"""Phase 3 — Inspection, Weight, Evidence, WastePoints, Funding, and Marketplace.

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-29 13:07:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_inspection_weight_points_marketplace"
down_revision: str | None = "0002_identity_taxonomy_collection"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 0. Add actual_weight_kg to pickup_requests
    op.add_column(
        "pickup_requests",
        sa.Column("actual_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
    )

    # 1. inspection_records
    op.create_table(
        "inspection_records",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("pickup_id", sa.String(length=36), nullable=False),
        sa.Column("inspector_id", sa.String(length=36), nullable=False),
        sa.Column("result", sa.String(length=50), nullable=False),
        sa.Column("contamination_level", sa.String(length=50), nullable=False),
        sa.Column("accepted_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("rejected_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("rejection_reason_code", sa.String(length=50), nullable=True),
        sa.Column("rejection_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["inspector_id"],
            ["users.id"],
            name="fk_inspection_records_inspector_id_users",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["pickup_id"],
            ["pickup_requests.id"],
            name="fk_inspection_records_pickup_id_pickup_requests",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_inspection_records"),
    )
    op.create_index(
        "ix_inspection_records_pickup_id", "inspection_records", ["pickup_id"], unique=False
    )
    op.create_index(
        "ix_inspection_records_inspector_id", "inspection_records", ["inspector_id"], unique=False
    )

    # 2. weight_records
    op.create_table(
        "weight_records",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("pickup_id", sa.String(length=36), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("recorder_id", sa.String(length=36), nullable=False),
        sa.Column("verifier_id", sa.String(length=36), nullable=True),
        sa.Column("method", sa.String(length=50), nullable=False),
        sa.Column("gross_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("tare_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("net_weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("verification_status", sa.String(length=50), nullable=False),
        sa.Column("supersedes_id", sa.String(length=36), nullable=True),
        sa.Column("correction_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["pickup_id"],
            ["pickup_requests.id"],
            name="fk_weight_records_pickup_id_pickup_requests",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["recorder_id"],
            ["users.id"],
            name="fk_weight_records_recorder_id_users",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["verifier_id"],
            ["users.id"],
            name="fk_weight_records_verifier_id_users",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["supersedes_id"],
            ["weight_records.id"],
            name="fk_weight_records_supersedes_id_weight_records",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_weight_records"),
    )
    op.create_index("ix_weight_records_pickup_id", "weight_records", ["pickup_id"], unique=False)
    op.create_index(
        "ix_weight_records_recorder_id", "weight_records", ["recorder_id"], unique=False
    )
    op.create_index(
        "ix_weight_records_verifier_id", "weight_records", ["verifier_id"], unique=False
    )
    op.create_index(
        "ix_weight_records_supersedes_id", "weight_records", ["supersedes_id"], unique=False
    )

    # 3. evidence_files
    op.create_table(
        "evidence_files",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("storage_key", sa.String(length=255), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=False),
        sa.Column("sha256_hash", sa.String(length=64), nullable=False),
        sa.Column("uploader_id", sa.String(length=36), nullable=False),
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["uploader_id"],
            ["users.id"],
            name="fk_evidence_files_uploader_id_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_evidence_files"),
    )
    op.create_index("ix_evidence_files_storage_key", "evidence_files", ["storage_key"], unique=True)
    op.create_index(
        "ix_evidence_files_uploader_id", "evidence_files", ["uploader_id"], unique=False
    )
    op.create_index(
        "ix_evidence_files_entity_type", "evidence_files", ["entity_type"], unique=False
    )
    op.create_index("ix_evidence_files_entity_id", "evidence_files", ["entity_id"], unique=False)

    # 4. reward_rules
    op.create_table(
        "reward_rules",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("points_per_kg", sa.Integer(), nullable=False),
        sa.Column("minimum_weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("max_points_per_pickup", sa.Integer(), nullable=True),
        sa.Column("effective_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("effective_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_reward_rules_category_id_waste_categories",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
            name="fk_reward_rules_created_by_users",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_reward_rules"),
    )
    op.create_index("ix_reward_rules_category_id", "reward_rules", ["category_id"], unique=False)
    op.create_index("ix_reward_rules_status", "reward_rules", ["status"], unique=False)

    # 5. ledger_entries
    op.create_table(
        "ledger_entries",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("points_delta", sa.Integer(), nullable=False),
        sa.Column("entry_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("source_id", sa.String(length=36), nullable=False),
        sa.Column("idempotency_key", sa.String(length=120), nullable=False),
        sa.Column("rule_snapshot", sa.Text(), nullable=True),
        sa.Column("actor_id", sa.String(length=36), nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=False),
        sa.Column("reverses_entry_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_ledger_entries_user_id_users", ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["actor_id"], ["users.id"], name="fk_ledger_entries_actor_id_users", ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["reverses_entry_id"],
            ["ledger_entries.id"],
            name="fk_ledger_entries_reverses_entry_id_ledger_entries",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_ledger_entries"),
    )
    op.create_index("ix_ledger_entries_user_id", "ledger_entries", ["user_id"], unique=False)
    op.create_index("ix_ledger_entries_entry_type", "ledger_entries", ["entry_type"], unique=False)
    op.create_index("ix_ledger_entries_status", "ledger_entries", ["status"], unique=False)
    op.create_index("ix_ledger_entries_source_id", "ledger_entries", ["source_id"], unique=False)
    op.create_index(
        "ix_ledger_entries_idempotency_key", "ledger_entries", ["idempotency_key"], unique=True
    )
    op.create_index("ix_ledger_entries_created_at", "ledger_entries", ["created_at"], unique=False)

    # 6. funding_programs
    op.create_table(
        "funding_programs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("total_budget_idr", sa.BigInteger(), nullable=False),
        sa.Column("total_points_disbursed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("points_capacity", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_funding_programs"),
    )
    op.create_index("ix_funding_programs_code", "funding_programs", ["code"], unique=True)
    op.create_index("ix_funding_programs_status", "funding_programs", ["status"], unique=False)

    # 7. partners
    op.create_table(
        "partners",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("contact_email", sa.String(length=255), nullable=False),
        sa.Column("contact_phone", sa.String(length=50), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("verification_status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_partners"),
    )
    op.create_index(
        "ix_partners_verification_status", "partners", ["verification_status"], unique=False
    )

    # 8. material_batches
    op.create_table(
        "material_batches",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("batch_code", sa.String(length=50), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("total_weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_material_batches_category_id_waste_categories",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
            name="fk_material_batches_created_by_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_material_batches"),
    )
    op.create_index(
        "ix_material_batches_batch_code", "material_batches", ["batch_code"], unique=True
    )
    op.create_index(
        "ix_material_batches_category_id", "material_batches", ["category_id"], unique=False
    )
    op.create_index("ix_material_batches_status", "material_batches", ["status"], unique=False)

    # 9. material_batch_items
    op.create_table(
        "material_batch_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("batch_id", sa.String(length=36), nullable=False),
        sa.Column("pickup_id", sa.String(length=36), nullable=False),
        sa.Column("weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.ForeignKeyConstraint(
            ["batch_id"],
            ["material_batches.id"],
            name="fk_material_batch_items_batch_id_material_batches",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["pickup_id"],
            ["pickup_requests.id"],
            name="fk_material_batch_items_pickup_id_pickup_requests",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_material_batch_items"),
    )
    op.create_index(
        "ix_material_batch_items_batch_id", "material_batch_items", ["batch_id"], unique=False
    )
    op.create_index(
        "ix_material_batch_items_pickup_id", "material_batch_items", ["pickup_id"], unique=False
    )

    # 10. delivery_records
    op.create_table(
        "delivery_records",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("batch_id", sa.String(length=36), nullable=False),
        sa.Column("partner_id", sa.String(length=36), nullable=False),
        sa.Column("dispatched_weight_kg", sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column("received_weight_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("weight_discrepancy_kg", sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("dispatched_by", sa.String(length=36), nullable=False),
        sa.Column("dispatched_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["batch_id"],
            ["material_batches.id"],
            name="fk_delivery_records_batch_id_material_batches",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["partner_id"],
            ["partners.id"],
            name="fk_delivery_records_partner_id_partners",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["dispatched_by"],
            ["users.id"],
            name="fk_delivery_records_dispatched_by_users",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_delivery_records"),
    )
    op.create_index("ix_delivery_records_batch_id", "delivery_records", ["batch_id"], unique=False)
    op.create_index(
        "ix_delivery_records_partner_id", "delivery_records", ["partner_id"], unique=False
    )
    op.create_index("ix_delivery_records_status", "delivery_records", ["status"], unique=False)

    # 11. notifications
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("reference_id", sa.String(length=36), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_notifications_user_id_users", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_notifications"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)
    op.create_index("ix_notifications_is_read", "notifications", ["is_read"], unique=False)
    op.create_index("ix_notifications_created_at", "notifications", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("delivery_records")
    op.drop_table("material_batch_items")
    op.drop_table("material_batches")
    op.drop_table("partners")
    op.drop_table("funding_programs")
    op.drop_table("ledger_entries")
    op.drop_table("reward_rules")
    op.drop_table("evidence_files")
    op.drop_table("weight_records")
    op.drop_table("inspection_records")
    op.drop_column("pickup_requests", "actual_weight_kg")
