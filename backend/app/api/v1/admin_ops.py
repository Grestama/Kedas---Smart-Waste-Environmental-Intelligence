"""WasteLink Bali — Admin Operations, Reports, and Audit Trail Endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.common.pagination import PaginatedResponse
from app.core.dependencies import RequireRole
from app.db.base import AuditLog
from app.db.session import get_db_session
from app.modules.account import service as account_service
from app.modules.account.models import User
from app.modules.account.schemas import UserResponse, UserStatusUpdateRequest
from app.modules.reporting import service as reporting_service
from app.modules.reporting.schemas import OperationalSummaryReport

router = APIRouter(prefix="/admin", tags=["Admin Operations & Reporting"])
require_admin = RequireRole("ADMIN")


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    actor_user_id: str | None = None
    action: str
    entity_type: str
    entity_id: str | None = None
    reason: str | None = None
    request_id: str | None = None
    details_json: str | None = None
    created_at: datetime


@router.get(
    "/dashboard",
    response_model=OperationalSummaryReport,
    summary="[Admin] Dashboard metrik operasional dan ekonomi sirkular real-time",
)
async def get_admin_dashboard(
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> OperationalSummaryReport:
    return reporting_service.get_operational_summary_report(db)


@router.get(
    "/reports/summary",
    response_model=OperationalSummaryReport,
    summary="[Admin] Laporan ringkasan metrik operasional dengan rentang waktu",
)
async def get_summary_report(
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> OperationalSummaryReport:
    return reporting_service.get_operational_summary_report(
        db, date_from=date_from, date_to=date_to
    )


@router.get(
    "/reports/export",
    summary="[Admin] Ekspor laporan metrik CSV tersanitasi (Anti Formula Injection)",
)
async def export_report_csv(
    request: Request,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> Response:
    request_id = getattr(request.state, "request_id", None)
    csv_data = reporting_service.export_operational_metrics_csv(
        db, admin=admin, date_from=date_from, date_to=date_to, request_id=request_id
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="wastelink_laporan_operasional.csv"',
            "Cache-Control": "no-store",
        },
    )


@router.get(
    "/users",
    response_model=PaginatedResponse[UserResponse],
    summary="[Admin] Manajemen daftar pengguna dengan filter role dan status",
)
async def list_users(
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
    role_code: str | None = None,
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[UserResponse]:
    users, total = account_service.list_admin_users(
        db, role_code=role_code, status=status, page=page, page_size=page_size
    )
    return PaginatedResponse.create(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch(
    "/users/{id}/status",
    response_model=UserResponse,
    summary="[Admin] Perbarui status akun pengguna (e.g. SUSPENDED) dengan pencabutan sesi",
)
async def update_status(
    id: str,
    req: UserStatusUpdateRequest,
    request: Request,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
) -> UserResponse:
    request_id = getattr(request.state, "request_id", None)
    user = account_service.update_user_status(
        db,
        admin_id=admin.id,
        user_id=id,
        status=req.status.value,
        reason=req.reason,
        request_id=request_id,
    )
    return UserResponse.model_validate(user)


@router.get(
    "/audit-logs",
    response_model=PaginatedResponse[AuditLogResponse],
    summary="[Admin] Audit log penelusuran sistem (Read-Only)",
)
async def list_audit_logs(
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db_session)],
    action: str | None = None,
    entity_type: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[AuditLogResponse]:
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc())
    if action:
        stmt = stmt.where(AuditLog.action == action)
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = list(db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all())

    return PaginatedResponse.create(
        items=[AuditLogResponse.model_validate(log) for log in items],
        total=total,
        page=page,
        page_size=page_size,
    )
