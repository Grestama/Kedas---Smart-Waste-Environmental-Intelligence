"""WasteLink Bali — Community Banjar, Clean-up Actions & Hazardous Waste Endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import RequireRole, get_current_user
from app.db.session import get_db_session
from app.modules.account.models import User
from app.modules.community import service as community_service
from app.modules.community.schemas import (
    BanjarOfficialCreateRequest,
    BanjarOfficialResponse,
    BanjarProfileCreateRequest,
    BanjarProfileResponse,
    BanjarRegionalDashboardResponse,
    CDOAApproveRequest,
    CDOACreateRequest,
    CDOAPublishRequest,
    CDOAResponse,
    CleanupActionCompleteRequest,
    CleanupActionCreateRequest,
    CleanupActionResponse,
    CleanupActionVerifyRequest,
    CommunityComplaintCreateRequest,
    CommunityComplaintResolveRequest,
    CommunityComplaintResponse,
    CommunityEventAttendanceRequest,
    CommunityEventCreateRequest,
    CommunityEventResponse,
    DCLIResponse,
    HazardousManifestCreateRequest,
    HazardousManifestDisposalRequest,
    HazardousManifestResponse,
    HazardousManifestStatusUpdateRequest,
    ServiceDirectoryResponse,
)

router = APIRouter(prefix="/community", tags=["Community Banjar & Special Operations"])

require_admin = RequireRole("ADMIN")
require_banjar_leader = RequireRole("ADMIN", "COMMUNITY_LEADER")
require_event_organizer = RequireRole("ADMIN", "COMMUNITY_LEADER", "OPERATOR")
require_volunteer_coord = RequireRole("ADMIN", "VOLUNTEER_COORDINATOR", "COMMUNITY_LEADER")
require_program_officer = RequireRole("ADMIN", "PROGRAM_MANAGER")
require_hazardous_handler = RequireRole("ADMIN", "HAZARDOUS_HANDLER", "OPERATOR")


# ==============================================================================
# Banjar Profiles, Officials & Regional Dashboard
# ==============================================================================


@router.post(
    "/banjar/profile",
    response_model=BanjarProfileResponse,
    status_code=201,
    summary="[Admin/Prajuru] Daftarkan atau perbarui profil kelembagaan Banjar/Desa Adat",
)
async def create_or_update_banjar_profile(
    req: BanjarProfileCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_banjar_leader)],
    db: Annotated[Session, Depends(get_db_session)],
) -> BanjarProfileResponse:
    request_id = getattr(request.state, "request_id", None)
    profile = community_service.create_or_update_banjar_profile(
        db, req=req, actor_id=actor.id, request_id=request_id
    )
    return BanjarProfileResponse.model_validate(profile)


@router.get(
    "/banjar/{service_area_id}/profile",
    response_model=BanjarProfileResponse,
    summary="Lihat profil kelembagaan Banjar/Desa Adat",
)
async def get_banjar_profile(
    service_area_id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> BanjarProfileResponse:
    profile = community_service.get_banjar_profile(db, service_area_id=service_area_id)
    return BanjarProfileResponse.model_validate(profile)


@router.post(
    "/banjar/officials",
    response_model=BanjarOfficialResponse,
    status_code=201,
    summary="[Admin/Prajuru] Tetapkan peran pejabat/prajuru banjar pada user",
)
async def assign_banjar_official(
    req: BanjarOfficialCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_banjar_leader)],
    db: Annotated[Session, Depends(get_db_session)],
) -> BanjarOfficialResponse:
    request_id = getattr(request.state, "request_id", None)
    official = community_service.assign_banjar_official(
        db, req=req, actor_id=actor.id, request_id=request_id
    )
    return BanjarOfficialResponse.model_validate(official)


@router.get(
    "/banjar/{service_area_id}/officials",
    response_model=list[BanjarOfficialResponse],
    summary="Daftar prajuru dan pejabat aktif di wilayah Banjar",
)
async def list_banjar_officials(
    service_area_id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> list[BanjarOfficialResponse]:
    officials = community_service.list_banjar_officials(
        db, service_area_id=service_area_id
    )
    return [BanjarOfficialResponse.model_validate(o) for o in officials]


@router.get(
    "/banjar/{service_area_id}/dashboard",
    response_model=BanjarRegionalDashboardResponse,
    summary="[Prajuru/Admin] Dashboard metrik kewilayahan Banjar (Territorial Isolation)",
)
async def get_banjar_dashboard(
    service_area_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> BanjarRegionalDashboardResponse:
    return community_service.get_banjar_regional_dashboard(
        db, service_area_id=service_area_id, user=current_user
    )


# ==============================================================================
# Community Events
# ==============================================================================


@router.post(
    "/events",
    response_model=CommunityEventResponse,
    status_code=201,
    summary="[Prajuru/Operator] Jadwalkan kegiatan gotong royong / edukasi banjar",
)
async def create_community_event(
    req: CommunityEventCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_event_organizer)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CommunityEventResponse:
    request_id = getattr(request.state, "request_id", None)
    event = community_service.create_community_event(
        db, req=req, organizer_id=actor.id, request_id=request_id
    )
    return CommunityEventResponse.model_validate(event)


@router.get(
    "/events",
    response_model=list[CommunityEventResponse],
    summary="Daftar agenda kegiatan dan gotong royong komunitas",
)
async def list_community_events(
    db: Annotated[Session, Depends(get_db_session)],
    service_area_id: str | None = None,
    status: str | None = None,
) -> list[CommunityEventResponse]:
    events = community_service.list_community_events(
        db, service_area_id=service_area_id, status=status
    )
    return [CommunityEventResponse.model_validate(e) for e in events]


@router.post(
    "/events/{id}/attendance",
    response_model=CommunityEventResponse,
    summary="[Prajuru/Operator] Catat kehadiran warga dan penyelesaian kegiatan",
)
async def record_event_attendance(
    id: str,
    req: CommunityEventAttendanceRequest,
    request: Request,
    actor: Annotated[User, Depends(require_event_organizer)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CommunityEventResponse:
    request_id = getattr(request.state, "request_id", None)
    event = community_service.record_event_attendance(
        db, event_id=id, req=req, actor_id=actor.id, request_id=request_id
    )
    return CommunityEventResponse.model_validate(event)


# ==============================================================================
# Community Complaints
# ==============================================================================


@router.post(
    "/complaints",
    response_model=CommunityComplaintResponse,
    status_code=201,
    summary="Laporkan aduan tumpukan sampah liar atau keluhan lingkungan banjar",
)
async def create_community_complaint(
    req: CommunityComplaintCreateRequest,
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CommunityComplaintResponse:
    request_id = getattr(request.state, "request_id", None)
    complaint = community_service.create_community_complaint(
        db, req=req, reporter_id=current_user.id, request_id=request_id
    )
    return CommunityComplaintResponse.model_validate(complaint)


@router.get(
    "/complaints",
    response_model=list[CommunityComplaintResponse],
    summary="Daftar aduan dan kendala lingkungan kewilayahan",
)
async def list_community_complaints(
    db: Annotated[Session, Depends(get_db_session)],
    service_area_id: str | None = None,
    status: str | None = None,
) -> list[CommunityComplaintResponse]:
    complaints = community_service.list_community_complaints(
        db, service_area_id=service_area_id, status=status
    )
    return [CommunityComplaintResponse.model_validate(c) for c in complaints]


@router.post(
    "/complaints/{id}/resolve",
    response_model=CommunityComplaintResponse,
    summary="[Prajuru/Admin] Selesaikan atau tindak lanjuti aduan banjar",
)
async def resolve_community_complaint(
    id: str,
    req: CommunityComplaintResolveRequest,
    request: Request,
    actor: Annotated[User, Depends(require_event_organizer)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CommunityComplaintResponse:
    request_id = getattr(request.state, "request_id", None)
    complaint = community_service.resolve_community_complaint(
        db, complaint_id=id, req=req, resolver_id=actor.id, request_id=request_id
    )
    return CommunityComplaintResponse.model_validate(complaint)


# ==============================================================================
# Clean-up Actions (Role 11 - Volunteer Beach / River Cleanup)
# ==============================================================================


@router.post(
    "/cleanups",
    response_model=CleanupActionResponse,
    status_code=201,
    summary="[Relawan/Prajuru] Rencanakan aksi kebersihan pantai atau sungai",
)
async def create_cleanup_action(
    req: CleanupActionCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_volunteer_coord)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CleanupActionResponse:
    request_id = getattr(request.state, "request_id", None)
    action = community_service.create_cleanup_action(
        db, req=req, coordinator_id=actor.id, request_id=request_id
    )
    return CleanupActionResponse.model_validate(action)


@router.get(
    "/cleanups",
    response_model=list[CleanupActionResponse],
    summary="Daftar kegiatan aksi kebersihan lingkungan dan relawan",
)
async def list_cleanup_actions(
    db: Annotated[Session, Depends(get_db_session)],
    action_type: str | None = None,
    status: str | None = None,
) -> list[CleanupActionResponse]:
    actions = community_service.list_cleanup_actions(
        db, action_type=action_type, status=status
    )
    return [CleanupActionResponse.model_validate(a) for a in actions]


@router.post(
    "/cleanups/{id}/complete",
    response_model=CleanupActionResponse,
    summary="[Relawan] Catat berat sampah terpilah dari aksi kebersihan",
)
async def complete_cleanup_action(
    id: str,
    req: CleanupActionCompleteRequest,
    request: Request,
    actor: Annotated[User, Depends(require_volunteer_coord)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CleanupActionResponse:
    request_id = getattr(request.state, "request_id", None)
    action = community_service.complete_cleanup_action(
        db, action_id=id, req=req, coordinator_id=actor.id, request_id=request_id
    )
    return CleanupActionResponse.model_validate(action)


@router.post(
    "/cleanups/{id}/verify",
    response_model=CleanupActionResponse,
    summary="[Program/Admin] Verifikasi dokumentasi dan integritas sampah aksi kebersihan",
)
async def verify_cleanup_action(
    id: str,
    req: CleanupActionVerifyRequest,
    request: Request,
    actor: Annotated[User, Depends(require_program_officer)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CleanupActionResponse:
    request_id = getattr(request.state, "request_id", None)
    action = community_service.verify_cleanup_action(
        db, action_id=id, req=req, verifier_id=actor.id, request_id=request_id
    )
    return CleanupActionResponse.model_validate(action)


# ==============================================================================
# Hazardous Waste Manifests (Role 12 - Limbah Khusus B3 Terkendali)
# ==============================================================================


@router.post(
    "/hazardous-manifests",
    response_model=HazardousManifestResponse,
    status_code=201,
    summary="[Limbah B3/Operator] Terbitkan manifes pengangkutan limbah khusus terkendali",
)
async def create_hazardous_manifest(
    req: HazardousManifestCreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_hazardous_handler)],
    db: Annotated[Session, Depends(get_db_session)],
) -> HazardousManifestResponse:
    request_id = getattr(request.state, "request_id", None)
    manifest = community_service.create_hazardous_manifest(
        db, req=req, creator_id=actor.id, request_id=request_id
    )
    return HazardousManifestResponse.model_validate(manifest)


@router.get(
    "/hazardous-manifests",
    response_model=list[HazardousManifestResponse],
    summary="Daftar manifes pergerakan limbah khusus B3",
)
async def list_hazardous_manifests(
    db: Annotated[Session, Depends(get_db_session)],
    status: str | None = None,
) -> list[HazardousManifestResponse]:
    manifests = community_service.list_hazardous_manifests(db, status=status)
    return [HazardousManifestResponse.model_validate(m) for m in manifests]


@router.patch(
    "/hazardous-manifests/{id}/status",
    response_model=HazardousManifestResponse,
    summary="[Limbah B3/Operator] Perbarui status perjalanan manifes limbah khusus",
)
async def update_hazardous_manifest_status(
    id: str,
    req: HazardousManifestStatusUpdateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_hazardous_handler)],
    db: Annotated[Session, Depends(get_db_session)],
) -> HazardousManifestResponse:
    request_id = getattr(request.state, "request_id", None)
    manifest = community_service.update_hazardous_manifest_status(
        db, manifest_id=id, req=req, actor_id=actor.id, request_id=request_id
    )
    return HazardousManifestResponse.model_validate(manifest)


@router.post(
    "/hazardous-manifests/{id}/disposal",
    response_model=HazardousManifestResponse,
    summary="[Limbah B3] Catat sertifikat berita acara pemusnahan resmi limbah B3",
)
async def record_hazardous_disposal(
    id: str,
    req: HazardousManifestDisposalRequest,
    request: Request,
    actor: Annotated[User, Depends(require_hazardous_handler)],
    db: Annotated[Session, Depends(get_db_session)],
) -> HazardousManifestResponse:
    request_id = getattr(request.state, "request_id", None)
    manifest = community_service.record_hazardous_disposal(
        db, manifest_id=id, req=req, actor_id=actor.id, request_id=request_id
    )
    return HazardousManifestResponse.model_validate(manifest)


# ==============================================================================
# Community Destination Operating Agreement (CDOA) & Service Directory
# ==============================================================================


@router.post(
    "/cdoa",
    response_model=CDOAResponse,
    status_code=201,
    summary="[Admin/Prajuru] Buat draf kesepakatan operasional destinasi (CDOA)",
)
async def create_cdoa(
    req: CDOACreateRequest,
    request: Request,
    actor: Annotated[User, Depends(require_banjar_leader)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CDOAResponse:
    request_id = getattr(request.state, "request_id", None)
    cdoa = community_service.create_cdoa_draft(
        db, req=req, actor_id=actor.id, request_id=request_id
    )
    return CDOAResponse.model_validate(cdoa)


@router.get(
    "/cdoa/{id}",
    response_model=CDOAResponse,
    summary="Lihat detail kesepakatan CDOA",
)
async def get_cdoa(
    id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> CDOAResponse:
    cdoa = community_service.get_cdoa_by_id(db, cdoa_id=id)
    return CDOAResponse.model_validate(cdoa)


@router.get(
    "/banjar/{service_area_id}/cdoas",
    response_model=list[CDOAResponse],
    summary="Daftar seluruh versi CDOA pada suatu wilayah layanan",
)
async def list_cdoas_by_area(
    service_area_id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> list[CDOAResponse]:
    cdoas = community_service.list_cdoas_by_service_area(db, service_area_id=service_area_id)
    return [CDOAResponse.model_validate(c) for c in cdoas]


@router.post(
    "/cdoa/{id}/approve",
    response_model=CDOAResponse,
    summary="[Admin/Prajuru] Setujui kesepakatan CDOA setelah peninjauan",
)
async def approve_cdoa(
    id: str,
    req: CDOAApproveRequest,
    request: Request,
    actor: Annotated[User, Depends(require_banjar_leader)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CDOAResponse:
    request_id = getattr(request.state, "request_id", None)
    cdoa = community_service.approve_cdoa(
        db, cdoa_id=id, actor_id=actor.id, notes=req.notes, request_id=request_id
    )
    return CDOAResponse.model_validate(cdoa)


@router.post(
    "/cdoa/{id}/publish",
    response_model=CDOAResponse,
    summary="[Admin/Prajuru] Publikasikan CDOA agar aturan operasional kawasan aktif",
)
async def publish_cdoa(
    id: str,
    req: CDOAPublishRequest,
    request: Request,
    actor: Annotated[User, Depends(require_banjar_leader)],
    db: Annotated[Session, Depends(get_db_session)],
) -> CDOAResponse:
    request_id = getattr(request.state, "request_id", None)
    cdoa = community_service.publish_cdoa(
        db, cdoa_id=id, actor_id=actor.id, notes=req.notes, request_id=request_id
    )
    return CDOAResponse.model_validate(cdoa)


@router.get(
    "/service-directory/{service_area_id}",
    response_model=ServiceDirectoryResponse,
    summary="[Publik] Direktori aturan layanan kawasan aktif berdasarkan CDOA",
)
async def get_service_directory(
    service_area_id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> ServiceDirectoryResponse:
    return community_service.get_service_directory(db, service_area_id=service_area_id)


@router.get(
    "/banjar/{service_area_id}/dcli",
    response_model=DCLIResponse,
    summary="[Publik/Monitoring] Destination Clean Loop Index (DCLI) Kawasan",
)
async def get_destination_clean_loop_index(
    service_area_id: str,
    db: Annotated[Session, Depends(get_db_session)],
) -> DCLIResponse:
    return community_service.calculate_destination_clean_loop_index(
        db, service_area_id=service_area_id
    )


