"""WasteLink Bali — Waste Categories & Acceptance Rules API Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.taxonomy import service as taxonomy_service
from app.modules.taxonomy.schemas import (
    MaterialAcceptanceRuleCreateRequest,
    MaterialAcceptanceRuleResponse,
    WasteCategoryCreateRequest,
    WasteCategoryResponse,
    WasteCategoryUpdateRequest,
)

router = APIRouter()


@router.get(
    "/waste-categories",
    response_model=list[WasteCategoryResponse],
    summary="Daftar kategori sampah & panduan pemilahan",
)
async def list_categories(
    db: Annotated[Session, Depends(get_db_session)],
    active_only: bool = True,
) -> list[WasteCategoryResponse]:
    categories = taxonomy_service.list_categories(db, active_only=active_only)
    return [WasteCategoryResponse.model_validate(c) for c in categories]


@router.get(
    "/waste-categories/{id}",
    response_model=WasteCategoryResponse,
    summary="Detail kategori sampah",
)
async def get_category(
    id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> WasteCategoryResponse:
    category = taxonomy_service.get_category_by_id(db, id)
    return WasteCategoryResponse.model_validate(category)


@router.post(
    "/waste-categories",
    response_model=WasteCategoryResponse,
    status_code=201,
    summary="[Admin] Tambah kategori sampah baru",
)
async def create_category(
    req: WasteCategoryCreateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WasteCategoryResponse:
    category = taxonomy_service.create_category(db, req)
    return WasteCategoryResponse.model_validate(category)


@router.patch(
    "/waste-categories/{id}",
    response_model=WasteCategoryResponse,
    summary="[Admin] Perbarui / nonaktifkan kategori sampah",
)
async def update_category(
    id: str,
    req: WasteCategoryUpdateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> WasteCategoryResponse:
    category = taxonomy_service.update_category(db, id, req)
    return WasteCategoryResponse.model_validate(category)


@router.post(
    "/material-acceptance-rules",
    response_model=MaterialAcceptanceRuleResponse,
    status_code=201,
    summary="[Admin] Konfigurasi aturan penerimaan material per area",
)
async def configure_acceptance_rule(
    req: MaterialAcceptanceRuleCreateRequest,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> MaterialAcceptanceRuleResponse:
    rule = taxonomy_service.configure_acceptance_rule(db, req)
    return MaterialAcceptanceRuleResponse.model_validate(rule)
