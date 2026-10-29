"""WasteLink Bali — Waste Taxonomy & Material Acceptance ORM Models."""

from __future__ import annotations

import uuid
from enum import StrEnum

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base, TimestampMixin


class CategoryType(StrEnum):
    ORGANIC = "ORGANIC"
    RECYCLABLE = "RECYCLABLE"
    RESIDUAL = "RESIDUAL"
    SPECIAL = "SPECIAL"


class WasteCategory(Base, TimestampMixin):
    """Waste classification category entity."""

    __tablename__ = "waste_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    preparation_guide: Mapped[str | None] = mapped_column(Text, nullable=True)
    safety_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    acceptance_rules: Mapped[list[MaterialAcceptanceRule]] = relationship(
        "MaterialAcceptanceRule", back_populates="category", cascade="all, delete-orphan"
    )


class MaterialAcceptanceRule(Base, TimestampMixin):
    """Area-specific waste material acceptance rules."""

    __tablename__ = "material_acceptance_rules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("waste_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    service_area_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("service_areas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_accepted: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    special_route_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Must be TRUE for SPECIAL waste to be eligible for pickup",
    )
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    category: Mapped[WasteCategory] = relationship(
        "WasteCategory", back_populates="acceptance_rules"
    )

    __table_args__ = (
        UniqueConstraint("category_id", "service_area_id", name="uq_acceptance_category_area"),
        Index("ix_acceptance_area_category", "service_area_id", "category_id"),
    )
