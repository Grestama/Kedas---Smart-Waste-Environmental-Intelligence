"""WasteLink Bali — Funding & Budget Domain Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.funding.models import ProgramType, SponsorType


class ProgramCreateRequest(BaseModel):
    code: str = Field(min_length=3, max_length=50)
    name: str = Field(min_length=3, max_length=100)
    sponsor_name: str | None = Field(default=None, max_length=150)
    program_type: ProgramType = Field(default=ProgramType.COMMUNITY)
    target_service_area_id: str | None = None
    total_budget_idr: int = Field(gt=0)
    points_capacity: int = Field(gt=0)


class ProgramResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    sponsor_name: str | None = None
    program_type: str
    target_service_area_id: str | None = None
    total_budget_idr: int
    disbursed_budget_idr: int
    total_points_disbursed: int
    points_capacity: int
    status: str
    created_at: datetime
    updated_at: datetime


class SponsorshipCreateRequest(BaseModel):
    sponsor_name: str = Field(min_length=2, max_length=150)
    sponsor_type: SponsorType = Field(default=SponsorType.CSR)
    amount_idr: int = Field(gt=0)
    contract_ref: str | None = Field(default=None, max_length=100)
    notes: str | None = None


class SponsorshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    program_id: str
    sponsor_name: str
    sponsor_type: str
    amount_idr: int
    contract_ref: str | None = None
    contributed_at: datetime
    notes: str | None = None
    created_at: datetime


class BudgetAllocationCreateRequest(BaseModel):
    service_area_id: str
    allocated_amount_idr: int = Field(gt=0)
    purpose: str = Field(min_length=3, max_length=255)


class BudgetAllocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    program_id: str
    service_area_id: str
    allocated_amount_idr: int
    spent_amount_idr: int
    purpose: str
    allocated_at: datetime
    created_at: datetime
