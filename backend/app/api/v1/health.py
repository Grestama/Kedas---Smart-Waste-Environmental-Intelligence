"""WasteLink Bali — Health check endpoints.

GET /health/live  — Process is alive (no external dependencies).
GET /health/ready — Dependencies (database) are ready.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.db.session import check_db_connection

router = APIRouter()


@router.get(
    "/live",
    summary="Liveness probe",
    description="Returns 200 if the application process is running. No dependency checks.",
    response_model=dict[str, Any],
)
async def liveness() -> dict[str, Any]:
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env.value,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get(
    "/ready",
    summary="Readiness probe",
    description="Returns 200 if all critical dependencies are available. Returns 503 if database is unavailable.",
    response_model=None,
)
async def readiness() -> JSONResponse | dict[str, Any]:
    db_ok = check_db_connection()

    checks = {
        "database": "ok" if db_ok else "unavailable",
    }

    all_ok = all(v == "ok" for v in checks.values())

    body = {
        "status": "ok" if all_ok else "degraded",
        "checks": checks,
        "timestamp": datetime.now(UTC).isoformat(),
    }

    if not all_ok:
        return JSONResponse(status_code=503, content=body)

    return body
