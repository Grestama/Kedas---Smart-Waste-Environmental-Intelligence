"""WasteLink Bali — Circular Marketplace & Batching Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PartnerCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    contact_email: str = Field(max_length=255)
    contact_phone: str = Field(max_length=50)
    address: str = Field(min_length=5)


class PartnerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    contact_email: str
    contact_phone: str
    address: str
    verification_status: str
    created_at: datetime


class MaterialBatchCreateRequest(BaseModel):
    category_id: str
    pickup_ids: list[str] = Field(
        min_length=1, description="Daftar ID setoran sampah yang selesai ditimbang"
    )


class MaterialBatchItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_id: str
    pickup_id: str
    weight_kg: float


class MaterialBatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_code: str
    category_id: str
    total_weight_kg: float
    status: str
    created_by: str
    created_at: datetime
    items: list[MaterialBatchItemResponse] = []


class DeliveryCreateRequest(BaseModel):
    batch_id: str
    partner_id: str
    dispatched_weight_kg: float = Field(gt=0, description="Berat material yang dikirim (kg)")
    notes: str | None = None


class DeliveryReceiptRequest(BaseModel):
    received_weight_kg: float = Field(
        ge=0, description="Berat material aktual yang diterima mitra (kg)"
    )
    notes: str | None = None


class DeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    batch_id: str
    partner_id: str
    dispatched_weight_kg: float
    received_weight_kg: float | None = None
    weight_discrepancy_kg: float | None = None
    status: str
    dispatched_at: datetime
    received_at: datetime | None = None
    notes: str | None = None
