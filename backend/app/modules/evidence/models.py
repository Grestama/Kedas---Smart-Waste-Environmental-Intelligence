"""WasteLink Bali — Evidence Media Domain Models."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class EvidenceEntityType(StrEnum):
    PICKUP = "PICKUP"
    INSPECTION = "INSPECTION"
    WEIGHT = "WEIGHT"
    DELIVERY = "DELIVERY"
    DISPUTE = "DISPUTE"


class EvidenceFileStatus(StrEnum):
    CONFIRMED = "CONFIRMED"
    DELETED = "DELETED"


class EvidenceFile(Base):
    """Metadata representing verified media/file evidence."""

    __tablename__ = "evidence_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    storage_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    uploader_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=EvidenceFileStatus.CONFIRMED
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # Relationships
    uploader: Mapped[object] = relationship("User", lazy="joined")
