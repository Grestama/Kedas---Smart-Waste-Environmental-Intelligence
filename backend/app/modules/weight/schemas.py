"""WasteLink Bali — Weight Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.weight.models import WeighingMethod


class WeightRecordCreateRequest(BaseModel):
    method: WeighingMethod = WeighingMethod.MANUAL_SCALE
    gross_weight_kg: float | None = Field(default=None, ge=0)
    tare_weight_kg: float | None = Field(default=None, ge=0)
    net_weight_kg: float | None = Field(default=None, ge=0)
    correction_reason: str | None = None


class WeightRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pickup_id: str
    version: int
    recorder_id: str
    verifier_id: str | None = None
    method: str
    gross_weight_kg: float | None = None
    tare_weight_kg: float | None = None
    net_weight_kg: float
    verification_status: str
    supersedes_id: str | None = None
    correction_reason: str | None = None
    created_at: datetime
