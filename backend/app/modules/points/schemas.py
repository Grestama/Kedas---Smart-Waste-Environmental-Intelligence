"""WasteLink Bali — WastePoints Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RewardRuleCreateRequest(BaseModel):
    category_id: str
    points_per_kg: int = Field(gt=0, description="Poin per kg sampah yang disetujui")
    minimum_weight_kg: float = Field(default=0.100, ge=0)
    max_points_per_pickup: int | None = Field(default=None, gt=0)


class RewardRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category_id: str
    version: int
    status: str
    points_per_kg: int
    minimum_weight_kg: float
    max_points_per_pickup: int | None = None
    effective_from: datetime


class LedgerEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    points_delta: int
    entry_type: str
    status: str
    source_type: str
    source_id: str
    idempotency_key: str
    reason: str
    created_at: datetime


class UserBalanceResponse(BaseModel):
    user_id: str
    current_balance: int


class AdminPointAdjustmentRequest(BaseModel):
    user_id: str
    points_delta: int = Field(description="Jumlah poin yang ditambah (+) atau dikurang (-)")
    reason: str = Field(
        min_length=5, max_length=255, description="Alasan administratif penyesuaian"
    )
    idempotency_key: str = Field(min_length=5, max_length=120)
