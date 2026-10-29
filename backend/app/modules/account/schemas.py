"""WasteLink Bali — Account & Identity Pydantic Schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# --- Auth & User Schemas ---


class UserRegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, pattern=r"^\+?[0-9]{8,18}$")
    password: str = Field(min_length=8, max_length=128)


class UserLoginRequest(BaseModel):
    identifier: str = Field(description="Email or phone number")
    password: str = Field(min_length=1)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str | None = None
    phone: str | None = None
    full_name: str
    account_status: str
    preferred_active_role: str
    created_at: datetime


class UserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, pattern=r"^\+?[0-9]{8,18}$")


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str
    description: str | None = None
    verification_status: str


class ActiveRoleRequest(BaseModel):
    role_code: str = Field(description="Role code to set as preferred UI context")


# --- Address Schemas ---


class AddressCreateRequest(BaseModel):
    label: str = Field(min_length=1, max_length=100, description="e.g. Rumah, Toko, Kantor")
    address_text: str = Field(min_length=5, description="Full street address in pilot area")
    service_area_id: str | None = None
    notes: str | None = Field(default=None, max_length=255)
    is_default: bool = False


class AddressUpdateRequest(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=100)
    address_text: str | None = Field(default=None, min_length=5)
    service_area_id: str | None = None
    notes: str | None = Field(default=None, max_length=255)
    is_default: bool | None = None


class AddressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    label: str
    address_text: str
    service_area_id: str | None = None
    notes: str | None = None
    is_default: bool
    created_at: datetime


# --- Collector Application Schemas ---


class CollectorApplicationCreateRequest(BaseModel):
    vehicle_type: str | None = Field(
        default=None, max_length=100, description="e.g. Motor Roda Tiga, Pickup"
    )
    operational_notes: str | None = Field(
        default=None, description="Experience, coverage area, schedule availability"
    )


class CollectorApplicationReviewRequest(BaseModel):
    approved: bool
    reason: str | None = Field(default=None, max_length=500, description="Required if rejected")


class CollectorApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    status: str
    vehicle_type: str | None = None
    operational_notes: str | None = None
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    rejection_reason: str | None = None
    created_at: datetime
