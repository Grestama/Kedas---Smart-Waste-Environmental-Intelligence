"""WasteLink Bali — Waste Taxonomy & Acceptance Rules Pydantic Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WasteCategoryCreateRequest(BaseModel):
    code: str = Field(
        min_length=2, max_length=64, description="Unique uppercase code, e.g. ORGANIC_FOOD"
    )
    name: str = Field(
        min_length=2,
        max_length=100,
        description="Display name in Indonesian, e.g. Sampah Organik Sisa Makanan",
    )
    category_type: str = Field(description="ORGANIC | RECYCLABLE | RESIDUAL | SPECIAL")
    description: str | None = None
    preparation_guide: str | None = None
    safety_notes: str | None = None
    is_active: bool = True
    display_order: int = 0


class WasteCategoryUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    category_type: str | None = None
    description: str | None = None
    preparation_guide: str | None = None
    safety_notes: str | None = None
    is_active: bool | None = None
    display_order: int | None = None


class WasteCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    category_type: str
    description: str | None = None
    preparation_guide: str | None = None
    safety_notes: str | None = None
    is_active: bool
    display_order: int
    created_at: datetime


class MaterialAcceptanceRuleCreateRequest(BaseModel):
    category_id: str
    service_area_id: str
    is_accepted: bool = True
    special_route_confirmed: bool = False
    notes: str | None = None


class MaterialAcceptanceRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category_id: str
    service_area_id: str
    is_accepted: bool
    special_route_confirmed: bool
    notes: str | None = None
    created_at: datetime
