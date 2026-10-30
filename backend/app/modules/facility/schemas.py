"""WasteLink Bali — Facility, Stock Movement, and Waste Bank Domain Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.facility.models import (
    FacilityType,
    QualityGrade,
    ReceiptStatus,
)


class FacilityCreateRequest(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    name: str = Field(min_length=2, max_length=100)
    facility_type: FacilityType = Field(default=FacilityType.TPS3R)
    service_area_id: str | None = None
    address: str = Field(min_length=3)
    capacity_kg_per_day: float = Field(default=2000.0, gt=0)


class FacilityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    facility_type: str
    service_area_id: str | None
    address: str
    capacity_kg_per_day: float
    is_active: bool
    created_at: datetime


class FacilityReceiptCreateRequest(BaseModel):
    facility_id: str
    category_id: str
    pickup_id: str | None = None
    sender_user_id: str | None = None
    gross_weight_kg: float | None = Field(default=None, ge=0)
    tare_weight_kg: float | None = Field(default=None, ge=0)
    received_weight_kg: float = Field(gt=0, description="Berat bersih material diterima di fasilitas")
    quality_grade: QualityGrade = Field(default=QualityGrade.GRADE_A)
    contamination_percent: float = Field(default=0.0, ge=0.0, le=100.0)
    receipt_status: ReceiptStatus = Field(default=ReceiptStatus.ACCEPTED)
    discrepancy_reason: str | None = None
    idempotency_key: str | None = Field(default=None, max_length=64)
    notes: str | None = None


class FacilityReceiptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    receipt_no: str
    facility_id: str
    pickup_id: str | None
    category_id: str
    receiver_user_id: str
    sender_user_id: str | None
    gross_weight_kg: float | None
    tare_weight_kg: float | None
    received_weight_kg: float
    discrepancy_kg: float
    discrepancy_reason: str | None
    quality_grade: str
    contamination_percent: float
    receipt_status: str
    idempotency_key: str | None
    notes: str | None
    created_at: datetime


class SortingOutputItem(BaseModel):
    category_id: str
    quantity_kg: float = Field(gt=0, description="Bobot fraksi hasil pilah atau residu (kg)")
    is_residue: bool = Field(default=False, description="Tandai jika merupakan fraksi residu")
    notes: str | None = None


class SortingProcessRequest(BaseModel):
    facility_id: str
    input_category_id: str
    input_weight_kg: float = Field(gt=0, description="Bobot material awal yang dipilah (kg)")
    outputs: list[SortingOutputItem] = Field(min_length=1, description="Daftar fraksi hasil pemilahan + residu")
    tolerance_kg: float = Field(default=0.5, ge=0.0, le=5.0, description="Toleransi susut/kelembapan yang diizinkan")
    notes: str | None = None


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    facility_id: str
    category_id: str
    batch_id: str | None
    movement_type: str
    quantity_kg: float
    reference_id: str | None
    actor_user_id: str
    notes: str | None
    created_at: datetime


class FacilityStockItem(BaseModel):
    category_id: str
    category_name: str
    current_stock_kg: float


class FacilityStockSummaryResponse(BaseModel):
    facility_id: str
    facility_name: str
    items: list[FacilityStockItem]
    total_stock_kg: float


# --- Waste Bank Member & Transaction Schemas ---


class WasteBankMemberCreateRequest(BaseModel):
    user_id: str
    facility_id: str
    account_no: str | None = Field(default=None, max_length=50)


class WasteBankMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    account_no: str
    user_id: str
    facility_id: str
    current_balance_idr: int
    status: str
    created_at: datetime


class WasteBankDepositRequest(BaseModel):
    member_id: str
    category_id: str
    weight_kg: float = Field(gt=0, description="Berat sampah disetor nasabah (kg)")
    unit_price_idr: int = Field(gt=0, description="Harga per kg sampah (IDR)")
    receipt_id: str | None = None
    notes: str | None = None


class WasteBankWithdrawRequest(BaseModel):
    member_id: str
    amount_idr: int = Field(gt=0, description="Jumlah penarikan saldo tabungan (IDR)")
    notes: str | None = None


class WasteBankReversalRequest(BaseModel):
    reason: str = Field(min_length=5, max_length=255, description="Alasan pembatalan transaksi")


class WasteBankTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transaction_no: str
    member_id: str
    category_id: str | None
    transaction_type: str
    weight_kg: float | None
    unit_price_idr: int | None
    amount_idr: int
    running_balance_idr: int
    receipt_id: str | None
    reverses_transaction_id: str | None
    recorded_by: str
    status: str
    notes: str | None
    created_at: datetime
