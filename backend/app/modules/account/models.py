"""WasteLink Bali — Account & Identity ORM Models."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base, TimestampMixin


class AccountStatus(StrEnum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DEACTIVATED = "DEACTIVATED"


class VerificationStatus(StrEnum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    SUSPENDED = "SUSPENDED"
    REVOKED = "REVOKED"


class ApplicationStatus(StrEnum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class User(Base, TimestampMixin):
    """User account entity."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), unique=True, index=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    account_status: Mapped[str] = mapped_column(
        String(32), default=AccountStatus.ACTIVE.value, nullable=False, index=True
    )
    preferred_active_role: Mapped[str] = mapped_column(String(32), default="USER", nullable=False)

    # Relationships
    sessions: Mapped[list[AuthSession]] = relationship(
        "AuthSession", back_populates="user", cascade="all, delete-orphan"
    )
    roles: Mapped[list[UserRole]] = relationship(
        "UserRole",
        foreign_keys="UserRole.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    addresses: Mapped[list[UserAddress]] = relationship(
        "UserAddress", back_populates="user", cascade="all, delete-orphan"
    )
    collector_applications: Mapped[list[CollectorApplication]] = relationship(
        "CollectorApplication",
        foreign_keys="CollectorApplication.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class AuthSession(Base):
    """Server-side opaque session token store."""

    __tablename__ = "auth_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    user: Mapped[User] = relationship("User", back_populates="sessions")

    @property
    def is_active(self) -> bool:
        now = datetime.now(UTC)
        return self.revoked_at is None and self.expires_at > now


class Role(Base):
    """System role catalog."""

    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user_grants: Mapped[list[UserRole]] = relationship("UserRole", back_populates="role")


class UserRole(Base):
    """User to Role assignment grant."""

    __tablename__ = "user_roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    verification_status: Mapped[str] = mapped_column(
        String(32), default=VerificationStatus.ACTIVE.value, nullable=False
    )
    granted_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user: Mapped[User] = relationship("User", foreign_keys=[user_id], back_populates="roles")
    role: Mapped[Role] = relationship("Role", back_populates="user_grants")

    __table_args__ = (UniqueConstraint("user_id", "role_id", name="uq_user_roles_user_role"),)


class CollectorApplication(Base, TimestampMixin):
    """Application to become a verified waste collector."""

    __tablename__ = "collector_applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(32), default=ApplicationStatus.PENDING.value, nullable=False, index=True
    )
    vehicle_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    operational_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user: Mapped[User] = relationship(
        "User", foreign_keys=[user_id], back_populates="collector_applications"
    )


class UserAddress(Base, TimestampMixin):
    """User registered pickup address."""

    __tablename__ = "user_addresses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    address_text: Mapped[str] = mapped_column(Text, nullable=False)
    service_area_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="SET NULL"), nullable=True, index=True
    )
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_default: Mapped[bool] = mapped_column(default=False, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="addresses")

    __table_args__ = (Index("ix_user_addresses_user_default", "user_id", "is_default"),)
