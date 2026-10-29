"""WasteLink Bali — Inspection Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.inspection.models import ContaminationLevel, InspectionResult


class InspectionCreateRequest(BaseModel):
    result: InspectionResult
    contamination_level: ContaminationLevel = ContaminationLevel.NONE
    accepted_weight_kg: float | None = Field(default=None, ge=0)
    rejected_weight_kg: float | None = Field(default=None, ge=0)
    rejection_reason_code: str | None = Field(default=None, max_length=50)
    rejection_notes: str | None = None


class InspectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pickup_id: str
    inspector_id: str
    result: str
    contamination_level: str
    accepted_weight_kg: float | None = None
    rejected_weight_kg: float | None = None
    rejection_reason_code: str | None = None
    rejection_notes: str | None = None
    created_at: datetime
