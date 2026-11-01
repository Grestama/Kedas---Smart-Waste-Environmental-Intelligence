"""Create identity, taxonomy, service areas, slots, and pickup tables.

Revision ID: 0002_identity_taxonomy
Revises: 0001_baseline_audit_log
Create Date: 2026-10-29 13:00:00.000000

"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0002_identity_taxonomy"
down_revision: str | None = "0001_baseline_audit_log"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("account_status", sa.String(length=32), nullable=False),
        sa.Column("preferred_active_role", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_phone", "users", ["phone"], unique=True)
    op.create_index("ix_users_account_status", "users", ["account_status"], unique=False)

    # 2. roles
    op.create_table(
        "roles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_roles"),
    )
    op.create_index("ix_roles_code", "roles", ["code"], unique=True)

    # 3. auth_sessions
    op.create_table(
        "auth_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_auth_sessions_user_id_users", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_auth_sessions"),
    )
    op.create_index("ix_auth_sessions_user_id", "auth_sessions", ["user_id"], unique=False)
    op.create_index("ix_auth_sessions_token_hash", "auth_sessions", ["token_hash"], unique=True)
    op.create_index("ix_auth_sessions_expires_at", "auth_sessions", ["expires_at"], unique=False)

    # 4. user_roles
    op.create_table(
        "user_roles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("role_id", sa.String(length=36), nullable=False),
        sa.Column("verification_status", sa.String(length=32), nullable=False),
        sa.Column("granted_by", sa.String(length=36), nullable=True),
        sa.Column("granted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(
            ["granted_by"], ["users.id"], name="fk_user_roles_granted_by_users", ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["role_id"], ["roles.id"], name="fk_user_roles_role_id_roles", ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_user_roles_user_id_users", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_user_roles"),
        sa.UniqueConstraint("user_id", "role_id", name="uq_user_roles_user_role"),
    )
    op.create_index("ix_user_roles_user_id", "user_roles", ["user_id"], unique=False)
    op.create_index("ix_user_roles_role_id", "user_roles", ["role_id"], unique=False)

    # 5. collector_applications
    op.create_table(
        "collector_applications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("vehicle_type", sa.String(length=100), nullable=True),
        sa.Column("operational_notes", sa.Text(), nullable=True),
        sa.Column("reviewed_by", sa.String(length=36), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["reviewed_by"],
            ["users.id"],
            name="fk_collector_applications_reviewed_by_users",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_collector_applications_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_collector_applications"),
    )
    op.create_index(
        "ix_collector_applications_user_id", "collector_applications", ["user_id"], unique=False
    )
    op.create_index(
        "ix_collector_applications_status", "collector_applications", ["status"], unique=False
    )

    # 6. service_areas
    op.create_table(
        "service_areas",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("administrative_area", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_service_areas"),
    )
    op.create_index("ix_service_areas_code", "service_areas", ["code"], unique=True)
    op.create_index("ix_service_areas_is_active", "service_areas", ["is_active"], unique=False)

    # 7. user_addresses
    op.create_table(
        "user_addresses",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=False),
        sa.Column("address_text", sa.Text(), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=True),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_user_addresses_service_area_id_service_areas",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_user_addresses_user_id_users", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_user_addresses"),
    )
    op.create_index("ix_user_addresses_user_id", "user_addresses", ["user_id"], unique=False)
    op.create_index(
        "ix_user_addresses_user_default", "user_addresses", ["user_id", "is_default"], unique=False
    )

    # 8. collection_slots
    op.create_table(
        "collection_slots",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("max_capacity", sa.Integer(), nullable=False),
        sa.Column("booked_capacity", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_collection_slots_service_area_id_service_areas",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_collection_slots"),
    )
    op.create_index(
        "ix_collection_slots_service_area_id", "collection_slots", ["service_area_id"], unique=False
    )
    op.create_index(
        "ix_collection_slots_start_time", "collection_slots", ["start_time"], unique=False
    )
    op.create_index(
        "ix_collection_slots_is_active", "collection_slots", ["is_active"], unique=False
    )

    # 9. waste_categories
    op.create_table(
        "waste_categories",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category_type", sa.String(length=32), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("preparation_guide", sa.Text(), nullable=True),
        sa.Column("safety_notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_waste_categories"),
    )
    op.create_index("ix_waste_categories_code", "waste_categories", ["code"], unique=True)
    op.create_index(
        "ix_waste_categories_category_type", "waste_categories", ["category_type"], unique=False
    )
    op.create_index(
        "ix_waste_categories_is_active", "waste_categories", ["is_active"], unique=False
    )

    # 10. material_acceptance_rules
    op.create_table(
        "material_acceptance_rules",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("is_accepted", sa.Boolean(), nullable=False),
        sa.Column("special_route_confirmed", sa.Boolean(), nullable=False),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_acceptance_category_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_acceptance_area_id",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_material_acceptance_rules"),
        sa.UniqueConstraint("category_id", "service_area_id", name="uq_acceptance_category_area"),
    )
    op.create_index(
        "ix_acceptance_area_category",
        "material_acceptance_rules",
        ["service_area_id", "category_id"],
        unique=False,
    )

    # 11. pickup_requests
    op.create_table(
        "pickup_requests",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("public_code", sa.String(length=32), nullable=False),
        sa.Column("reporter_user_id", sa.String(length=36), nullable=False),
        sa.Column("service_area_id", sa.String(length=36), nullable=False),
        sa.Column("category_id", sa.String(length=36), nullable=False),
        sa.Column("address_id", sa.String(length=36), nullable=False),
        sa.Column("slot_id", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("assigned_collector_id", sa.String(length=36), nullable=True),
        sa.Column("estimated_weight_kg", sa.Numeric(precision=8, scale=2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.String(length=500), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["address_id"], ["user_addresses.id"], name="fk_pickup_address_id", ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["assigned_collector_id"],
            ["users.id"],
            name="fk_pickup_assigned_collector",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["waste_categories.id"],
            name="fk_pickup_category_id",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["reporter_user_id"], ["users.id"], name="fk_pickup_reporter_user", ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["service_area_id"],
            ["service_areas.id"],
            name="fk_pickup_service_area",
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["slot_id"], ["collection_slots.id"], name="fk_pickup_slot_id", ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_pickup_requests"),
    )
    op.create_index(
        "ix_pickup_requests_public_code", "pickup_requests", ["public_code"], unique=True
    )
    op.create_index(
        "ix_pickups_area_status", "pickup_requests", ["service_area_id", "status"], unique=False
    )
    op.create_index(
        "ix_pickups_reporter_status",
        "pickup_requests",
        ["reporter_user_id", "status"],
        unique=False,
    )
    op.create_index(
        "ix_pickups_collector_status",
        "pickup_requests",
        ["assigned_collector_id", "status"],
        unique=False,
    )

    # 12. pickup_status_events
    op.create_table(
        "pickup_status_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("pickup_request_id", sa.String(length=36), nullable=False),
        sa.Column("from_status", sa.String(length=32), nullable=False),
        sa.Column("to_status", sa.String(length=32), nullable=False),
        sa.Column("actor_user_id", sa.String(length=36), nullable=True),
        sa.Column("reason", sa.String(length=500), nullable=True),
        sa.Column("request_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["actor_user_id"], ["users.id"], name="fk_pickup_events_actor", ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["pickup_request_id"],
            ["pickup_requests.id"],
            name="fk_pickup_events_request",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_pickup_status_events"),
    )
    op.create_index(
        "ix_pickup_events_req_created",
        "pickup_status_events",
        ["pickup_request_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("pickup_status_events")
    op.drop_table("pickup_requests")
    op.drop_table("material_acceptance_rules")
    op.drop_table("waste_categories")
    op.drop_table("collection_slots")
    op.drop_table("user_addresses")
    op.drop_table("service_areas")
    op.drop_table("collector_applications")
    op.drop_table("user_roles")
    op.drop_table("auth_sessions")
    op.drop_table("roles")
    op.drop_table("users")
