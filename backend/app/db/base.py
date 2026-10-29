"""WasteLink Bali — Central database metadata registry.

Import all ORM models here so Alembic can detect them for migrations.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base

# --- Account & Identity Models ---
from app.modules.account.models import (
    AccountStatus,
    ApplicationStatus,
    AuthSession,
    CollectorApplication,
    Role,
    User,
    UserAddress,
    UserRole,
    VerificationStatus,
)

# --- Collection & Scheduling Models ---
from app.modules.collection.models import (
    CollectionSlot,
    PickupRequest,
    PickupStatus,
    PickupStatusEvent,
    ServiceArea,
)

# --- Taxonomy Models ---
from app.modules.taxonomy.models import (
    CategoryType,
    MaterialAcceptanceRule,
    WasteCategory,
)


class AuditLog(Base):
    """System audit log table for critical domain events and actions.

    Fulfills SDD Section 20.10 and REQ-SEC / REQ-AUD baseline.
    """

    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    actor_user_id: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    entity_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    entity_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    request_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )
    details_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        index=True,
    )

    __table_args__ = (
        Index("ix_audit_logs_action_created", "action", "created_at"),
        Index("ix_audit_logs_entity", "entity_type", "entity_id"),
    )


# Export Base and all models
__all__ = [
    "Base",
    "AuditLog",
    "User",
    "AuthSession",
    "Role",
    "UserRole",
    "CollectorApplication",
    "UserAddress",
    "AccountStatus",
    "VerificationStatus",
    "ApplicationStatus",
    "WasteCategory",
    "CategoryType",
    "MaterialAcceptanceRule",
    "ServiceArea",
    "CollectionSlot",
    "PickupRequest",
    "PickupStatus",
    "PickupStatusEvent",
]
