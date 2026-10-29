"""WasteLink Bali — Collector Application Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db_session
from app.modules.account import service as account_service
from app.modules.account.models import User
from app.modules.account.schemas import (
    CollectorApplicationCreateRequest,
    CollectorApplicationResponse,
    CollectorApplicationReviewRequest,
)

router = APIRouter()


@router.post(
    "/collector-applications",
    response_model=CollectorApplicationResponse,
    status_code=201,
    summary="Ajukan permohonan menjadi petugas pengangkut sampah",
)
async def submit_application(
    req: CollectorApplicationCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CollectorApplicationResponse:
    app = account_service.submit_collector_application(db, current_user.id, req)
    return CollectorApplicationResponse.model_validate(app)


@router.get(
    "/collector-applications/mine",
    response_model=CollectorApplicationResponse | None,
    summary="Lihat status permohonan collector sendiri",
)
async def get_my_application(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CollectorApplicationResponse | None:
    app = account_service.get_my_collector_application(db, current_user.id)
    return CollectorApplicationResponse.model_validate(app) if app else None


# --- Admin Review Endpoints ---


@router.get(
    "/admin/collector-applications",
    response_model=list[CollectorApplicationResponse],
    summary="[Admin] Daftar permohonan collector",
)
async def admin_list_applications(
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
    status: str | None = None,
) -> list[CollectorApplicationResponse]:
    apps = account_service.list_collector_applications(db, status=status)
    return [CollectorApplicationResponse.model_validate(a) for a in apps]


@router.post(
    "/admin/collector-applications/{id}/review",
    response_model=CollectorApplicationResponse,
    summary="[Admin] Setujui atau tolak permohonan collector",
)
async def admin_review_application(
    id: str,
    req: CollectorApplicationReviewRequest,
    request: Request,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CollectorApplicationResponse:
    request_id = getattr(request.state, "request_id", None)
    app = account_service.review_collector_application(
        db, admin_id=admin.id, application_id=id, req=req, request_id=request_id
    )
    return CollectorApplicationResponse.model_validate(app)
