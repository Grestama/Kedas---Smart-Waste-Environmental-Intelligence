"""WasteLink Bali — Current User Profile, Roles, & Addresses Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db_session
from app.modules.account import service as account_service
from app.modules.account.models import User
from app.modules.account.schemas import (
    ActiveRoleRequest,
    AddressCreateRequest,
    AddressResponse,
    AddressUpdateRequest,
    RoleResponse,
    UserResponse,
    UserUpdateRequest,
)

router = APIRouter()


@router.get("", response_model=UserResponse, summary="Lihat profil pengguna saat ini")
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch("", response_model=UserResponse, summary="Perbarui profil pengguna")
async def update_my_profile(
    req: UserUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> UserResponse:
    user = account_service.update_profile(db, current_user, req)
    return UserResponse.model_validate(user)


@router.get("/roles", response_model=list[RoleResponse], summary="Daftar role pengguna")
async def get_my_roles(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[dict[str, str]]:
    return account_service.get_user_roles(db, current_user.id)


@router.post("/active-role", response_model=UserResponse, summary="Ganti active-role UI context")
async def switch_active_role(
    req: ActiveRoleRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> UserResponse:
    user = account_service.set_active_role(db, current_user, req.role_code)
    return UserResponse.model_validate(user)


# --- Address Endpoints ---


@router.get("/addresses", response_model=list[AddressResponse], summary="Daftar alamat sendiri")
async def list_my_addresses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> list[AddressResponse]:
    addresses = account_service.get_user_addresses(db, current_user.id)
    return [AddressResponse.model_validate(a) for a in addresses]


@router.post(
    "/addresses", response_model=AddressResponse, status_code=201, summary="Tambah alamat baru"
)
async def add_address(
    req: AddressCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> AddressResponse:
    address = account_service.create_user_address(db, current_user.id, req)
    return AddressResponse.model_validate(address)


@router.get("/addresses/{id}", response_model=AddressResponse, summary="Detail alamat")
async def get_address(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> AddressResponse:
    address = account_service.get_user_address_by_id(db, current_user.id, id)
    return AddressResponse.model_validate(address)


@router.patch("/addresses/{id}", response_model=AddressResponse, summary="Perbarui alamat")
async def update_address(
    id: str,
    req: AddressUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> AddressResponse:
    address = account_service.update_user_address(db, current_user.id, id, req)
    return AddressResponse.model_validate(address)


@router.delete("/addresses/{id}", status_code=200, summary="Hapus alamat")
async def delete_address(
    id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    account_service.delete_user_address(db, current_user.id, id)
    return {"message": "Alamat berhasil dihapus."}
