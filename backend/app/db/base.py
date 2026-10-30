"""WasteLink Bali — Central database metadata registry.

Import all ORM models here so Alembic can detect them for migrations.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

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

# --- Evidence Models ---
from app.modules.evidence.models import (
    EvidenceEntityType,
    EvidenceFile,
    EvidenceFileStatus,
)

# --- Facility & Waste Bank Models ---
from app.modules.facility.models import (
    BankTransactionType,
    Facility,
    FacilityReceipt,
    FacilityType,
    MovementType,
    QualityGrade,
    ReceiptStatus,
    StockMovement,
    WasteBankMember,
    WasteBankTransaction,
)

# --- Funding Models ---
from app.modules.funding.models import (
    FundingProgram,
    FundingProgramStatus,
)

# --- Inspection Models ---
from app.modules.inspection.models import (
    ContaminationLevel,
    InspectionRecord,
    InspectionResult,
)

# --- Marketplace Models ---
from app.modules.marketplace.models import (
    B2BBusinessType,
    B2BLocation,
    B2BOrganization,
    B2BOrganizationMember,
    B2BPickupRequest,
    B2BPickupStatus,
    BatchStatus,
    DeliveryRecord,
    DeliveryStatus,
    MaterialBatch,
    MaterialBatchItem,
    MaterialOffer,
    OfferStatus,
    OfferType,
    OrganicProcessingRecord,
    OrganicProcessType,
    OrganicStatus,
    Partner,
    PartnerType,
    PartnerVerificationStatus,
)

# --- Notification Models ---
from app.modules.notification.models import Notification, NotificationOutbox, OutboxStatus

# --- WastePoints Models ---
from app.modules.points.models import (
    LedgerEntry,
    LedgerEntryStatus,
    LedgerEntryType,
    RewardRule,
    RewardRuleStatus,
)

# --- Taxonomy Models ---
from app.modules.taxonomy.models import (
    CategoryType,
    MaterialAcceptanceRule,
    WasteCategory,
)

# --- Weight Models ---
from app.modules.weight.models import (
    WeighingMethod,
    WeightRecord,
    WeightVerificationStatus,
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

    def __init__(
        self,
        *,
        action: str,
        entity_type: str,
        actor_user_id: str | None = None,
        actor_id: str | None = None,
        entity_id: str | None = None,
        reason: str | None = None,
        request_id: str | None = None,
        ip_address: str | None = None,
        details_json: str | None = None,
        payload_after: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> None:
        import json

        if payload_after and not details_json:
            details_json = json.dumps(payload_after)
        super().__init__(
            action=action,
            entity_type=entity_type,
            actor_user_id=actor_user_id or actor_id,
            entity_id=entity_id,
            reason=reason,
            request_id=request_id,
            ip_address=ip_address,
            details_json=details_json,
            **kwargs,
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
    "InspectionRecord",
    "InspectionResult",
    "ContaminationLevel",
    "WeightRecord",
    "WeighingMethod",
    "WeightVerificationStatus",
    "EvidenceFile",
    "EvidenceEntityType",
    "EvidenceFileStatus",
    "RewardRule",
    "RewardRuleStatus",
    "LedgerEntry",
    "LedgerEntryType",
    "LedgerEntryStatus",
    "FundingProgram",
    "FundingProgramStatus",
    "Partner",
    "PartnerType",
    "PartnerVerificationStatus",
    "MaterialBatch",
    "BatchStatus",
    "MaterialBatchItem",
    "DeliveryRecord",
    "DeliveryStatus",
    "MaterialOffer",
    "OfferType",
    "OfferStatus",
    "OrganicProcessingRecord",
    "OrganicProcessType",
    "OrganicStatus",
    "B2BOrganization",
    "B2BBusinessType",
    "B2BOrganizationMember",
    "B2BLocation",
    "B2BPickupRequest",
    "B2BPickupStatus",
    "Notification",
    "NotificationOutbox",
    "OutboxStatus",
    "Facility",
    "FacilityType",
    "FacilityReceipt",
    "QualityGrade",
    "ReceiptStatus",
    "StockMovement",
    "MovementType",
    "WasteBankMember",
    "WasteBankTransaction",
    "BankTransactionType",
]
