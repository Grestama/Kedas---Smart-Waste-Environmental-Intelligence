"""WasteLink Bali — Master API v1 Router.

Aggregates all domain routers under /api/v1.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.admin_ops import router as admin_ops_router
from app.api.v1.admin_pickups import router as admin_pickups_router
from app.api.v1.ai import router as ai_router
from app.api.v1.auth import router as auth_router
from app.api.v1.collector_applications import router as collector_applications_router
from app.api.v1.collector_tasks import router as collector_tasks_router
from app.api.v1.community import router as community_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.facility import router as facility_router
from app.api.v1.health import router as health_router
from app.api.v1.inspections import router as inspections_router
from app.api.v1.marketplace import router as marketplace_router
from app.api.v1.me import router as me_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.pickup_requests import router as pickup_requests_router
from app.api.v1.points import router as points_router
from app.api.v1.programs import router as programs_router
from app.api.v1.service_areas import router as service_areas_router
from app.api.v1.waste_categories import router as waste_categories_router
from app.api.v1.weights import router as weights_router

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

# --- Phase 3: Inspection QC & Verified Weighing ---
api_v1_router.include_router(inspections_router, tags=["Inspections QC"])
api_v1_router.include_router(weights_router, tags=["Verified Weights"])

# --- Phase 3: Evidence Media Storage ---
api_v1_router.include_router(evidence_router, tags=["Evidence Media"])

# --- Phase 3: WastePoints Ledger & Funding ---
api_v1_router.include_router(points_router, tags=["WastePoints"])

# --- Phase 3: Circular Marketplace & Batches ---
api_v1_router.include_router(marketplace_router, tags=["Marketplace & Deliveries"])

# --- Phase 3: Notifications ---
api_v1_router.include_router(notifications_router, tags=["Notifications"])

# --- Phase 4: Facility Reception, Sorting & Bank Sampah ---
api_v1_router.include_router(
    facility_router, prefix="/facilities", tags=["Facilities & Bank Sampah"]
)

# --- Phase 4: Admin Operations, Reporting, and Audit ---
api_v1_router.include_router(admin_ops_router)

# --- Phase 6: Programs, Funding & CSR ---
api_v1_router.include_router(programs_router)

# --- Phase 6: Community Banjar, Cleanups & Hazardous Waste ---
api_v1_router.include_router(community_router)

# --- AI Web Innovation: EcoGuide, Vision & Operations Copilot ---
api_v1_router.include_router(ai_router)
