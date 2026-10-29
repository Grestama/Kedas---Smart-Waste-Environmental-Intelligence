"""WasteLink Bali — Reporting & Metrics Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryWeightMetric(BaseModel):
    category_id: str
    category_name: str
    verified_weight_kg: float
    pickups_count: int
    points_issued: int


class ServiceAreaMetric(BaseModel):
    service_area_id: str
    area_name: str
    pickups_count: int
    verified_weight_kg: float


class OperationalSummaryReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    generated_at: datetime
    timezone: str = "Asia/Makassar (WITA)"
    date_from: datetime | None = None
    date_to: datetime | None = None

    # Pickups Count
    total_pickups: int
    pickups_submitted: int
    pickups_in_progress: int
    pickups_completed: int
    pickups_cancelled: int

    # Weight Integrity (Explicitly Separated - Never Mixed)
    total_estimated_weight_kg: float = Field(description="Estimasi berat saat pemesanan awal warga")
    total_verified_weight_kg: float = Field(
        description="Berat fisik bersih tervalidasi hasil timbangan petugas di pos"
    )
    total_batched_weight_kg: float = Field(
        description="Berat material yang telah diagregasikan ke dalam batch"
    )
    total_dispatched_weight_kg: float = Field(
        description="Berat material yang telah dikirim ke mitra daur ulang"
    )
    total_received_weight_kg: float = Field(
        description="Berat material aktual yang dikonfirmasi oleh mitra"
    )
    total_weight_discrepancy_kg: float = Field(
        description="Total selisih berat kirim vs terima mitra (positif/negatif)"
    )

    # WastePoints Financials
    total_points_issued: int
    total_points_reversed: int
    net_points_in_circulation: int

    # Funding & Budget
    funding_budget_total_idr: int
    funding_points_capacity: int
    funding_points_disbursed: int
    funding_remaining_capacity: int

    # Breakdowns
    category_metrics: list[CategoryWeightMetric] = []
    area_metrics: list[ServiceAreaMetric] = []
