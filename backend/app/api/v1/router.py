"""WasteLink Bali — Master API v1 Router.

Aggregates all domain routers under /api/v1.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.admin_pickups import router as admin_pickups_router
from app.api.v1.auth import router as auth_router
from app.api.v1.collector_applications import router as collector_applications_router
from app.api.v1.collector_tasks import router as collector_tasks_router
from app.api.v1.health import router as health_router
from app.api.v1.me import router as me_router
from app.api.v1.pickup_requests import router as pickup_requests_router
from app.api.v1.service_areas import router as service_areas_router
from app.api.v1.waste_categories import router as waste_categories_router

api_v1_router = APIRouter()

# --- Health / Probes ---
api_v1_router.include_router(health_router, prefix="/health", tags=["Health"])

# --- Authentication & Identity ---
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(me_router, prefix="/me", tags=["Profile & Addresses"])
api_v1_router.include_router(collector_applications_router, tags=["Collector Applications"])

# --- Taxonomy ---
api_v1_router.include_router(waste_categories_router, tags=["Waste Taxonomy"])

# --- Service Areas & Scheduling ---
api_v1_router.include_router(service_areas_router, tags=["Service Areas & Slots"])

# --- Collection & Pickup Requests ---
api_v1_router.include_router(
    pickup_requests_router, prefix="/pickup-requests", tags=["Pickup Requests"]
)
api_v1_router.include_router(
    collector_tasks_router, prefix="/collector/tasks", tags=["Collector Operations"]
)
api_v1_router.include_router(admin_pickups_router, prefix="/admin/pickups", tags=["Admin Pickups"])
