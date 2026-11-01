"""Kedas — AI Foundation, Knowledge Base & Interaction ORM Models."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base, TimestampMixin


class KnowledgeDocumentStatus(StrEnum):
    DRAFT = "DRAFT"
    VALIDATING = "VALIDATING"
    PARSING = "PARSING"
    CHUNKING = "CHUNKING"
    PENDING_REVIEW = "PENDING_REVIEW"
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    SUPERSEDED = "SUPERSEDED"
    RETIRED = "RETIRED"


class AuthorityClass(StrEnum):
    GOVERNMENT_PROVINCIAL = "GOVERNMENT_PROVINCIAL"
    GOVERNMENT_REGENCY = "GOVERNMENT_REGENCY"
    DESA_ADAT = "DESA_ADAT"
    INTERNAL_SOP = "INTERNAL_SOP"
    SCIENTIFIC = "SCIENTIFIC"
    COMMUNITY = "COMMUNITY"


class KnowledgeSourceType(StrEnum):
    REGULATION = "REGULATION"
    SOP = "SOP"
    CDOA = "CDOA"
    EDUCATIONAL = "EDUCATIONAL"
    AWIG_AWIG = "AWIG_AWIG"
    PARAREM = "PARAREM"


class AICapability(StrEnum):
    ECOGUIDE = "ECOGUIDE"
    VISION = "VISION"
    COPILOT = "COPILOT"
    REPORT_NARRATIVE = "REPORT_NARRATIVE"


class KnowledgeDocument(Base, TimestampMixin):
    """Knowledge document metadata record (CDOA, SOP, regulations)."""

    __tablename__ = "knowledge_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(
        String(64), default=KnowledgeSourceType.SOP.value, nullable=False, index=True
    )
    destination_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True, index=True
    )
    organization_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("b2b_organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    cdoa_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("cdoa_agreements.id", ondelete="SET NULL"), nullable=True, index=True
    )
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(32), default="1.0", nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default=KnowledgeDocumentStatus.PUBLISHED.value, nullable=False, index=True
    )
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    total_chunks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(255), nullable=False)

    chunks: Mapped[list[KnowledgeChunk]] = relationship(
        "KnowledgeChunk", back_populates="document", cascade="all, delete-orphan"
    )

    def get_metadata(self) -> dict[str, Any]:
        """Safely parse metadata_json into a dictionary."""
        if not self.metadata_json:
            return {}
        try:
            val = json.loads(self.metadata_json)
            if isinstance(val, dict):
                return val
            return {}
        except Exception:
            return {}

    def set_metadata(self, data: dict[str, Any]) -> None:
        """Serialize dictionary into metadata_json."""
        self.metadata_json = json.dumps(data)

    @property
    def authority_class(self) -> str:
        val = self.get_metadata().get("authority_class")
        return str(val) if val else AuthorityClass.INTERNAL_SOP.value

    @property
    def effective_until(self) -> datetime | None:
        raw = self.get_metadata().get("effective_until")
        if not raw:
            return None
        try:
            return datetime.fromisoformat(raw)
        except Exception:
            return None

    @property
    def is_expired(self) -> bool:
        if self.status == KnowledgeDocumentStatus.EXPIRED.value:
            return True
        exp = self.effective_until
        return bool(exp is not None and datetime.now(UTC) > exp)


class KnowledgeChunk(Base, TimestampMixin):
    """Scoped knowledge chunk for RAG retrieval with provenance."""

    __tablename__ = "knowledge_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("knowledge_documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    section_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    document: Mapped[KnowledgeDocument] = relationship("KnowledgeDocument", back_populates="chunks")


class AIInteractionLog(Base):
    """Auditable, PII-minimized log of AI provider interactions."""

    __tablename__ = "ai_interaction_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    capability: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    destination_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    prompt_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    citations_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_band: Mapped[str | None] = mapped_column(String(32), nullable=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    fallback_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    feedback_rating: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False, index=True
    )


class AIConversation(Base, TimestampMixin):
    """Persistent conversational thread with ownership and destination scoping."""

    __tablename__ = "ai_conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    session_token: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    destination_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), default="Percakapan EcoGuide", nullable=False)
    actor_type: Mapped[str] = mapped_column(String(32), default="GUEST", nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    messages: Mapped[list[AIMessage]] = relationship(
        "AIMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="AIMessage.created_at",
    )


class AIMessage(Base):
    """Individual message turn within an AIConversation thread."""

    __tablename__ = "ai_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("ai_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender: Mapped[str] = mapped_column(String(16), nullable=False)  # 'user' | 'ai'
    text: Mapped[str] = mapped_column(Text, nullable=False)
    citations_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    provenance: Mapped[str] = mapped_column(String(32), default="VERIFIED", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ANSWERED", nullable=False)
    abstain_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    log_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    conversation: Mapped[AIConversation] = relationship("AIConversation", back_populates="messages")
