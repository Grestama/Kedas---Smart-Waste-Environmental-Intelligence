"""WasteLink Bali — API v1 router.

Aggregates all domain routers under /api/v1.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.health import router as health_router

api_v1_router = APIRouter()

# --- Health / infrastructure ---
api_v1_router.include_router(health_router, prefix="/health", tags=["Health"])

# Domain routers will be added here as modules are built:
# api_v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
# api_v1_router.include_router(me_router, prefix="/me", tags=["Profile"])
# etc.
