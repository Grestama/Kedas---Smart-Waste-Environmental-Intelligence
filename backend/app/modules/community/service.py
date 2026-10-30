"""WasteLink Bali — Community Banjar, Clean-up Actions & Hazardous Waste Service."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import AuthorizationError, NotFoundError, ValidationError
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest, ServiceArea
from app.modules.community.models import (
    BanjarOfficial,
    BanjarProfile,
    CleanupAction,
    CleanupActionStatus,
    CommunityComplaint,
    CommunityEvent,
    CommunityEventStatus,
    ComplaintStatus,
    HazardousManifestStatus,
    HazardousWasteManifest,
)
from app.modules.community.schemas import (
    BanjarOfficialCreateRequest,
    BanjarProfileCreateRequest,
    BanjarRegionalDashboardResponse,
    CleanupActionCompleteRequest,
    CleanupActionCreateRequest,
    CleanupActionVerifyRequest,
    CommunityComplaintCreateRequest,
    CommunityComplaintResolveRequest,
    CommunityEventAttendanceRequest,
    CommunityEventCreateRequest,
    HazardousManifestCreateRequest,
    HazardousManifestDisposalRequest,
    HazardousManifestStatusUpdateRequest,
)
from app.modules.funding.models import FundingProgram
from app.modules.marketplace.models import Partner

# ==============================================================================
# Banjar Profiles & Officials
# ==============================================================================


def create_or_update_banjar_profile(
    db: Session, req: BanjarProfileCreateRequest, actor_id: str, request_id: str | None = None
) -> BanjarProfile:
    """Create or update institutional profile for a Banjar / Desa Adat."""
    area = db.scalar(select(ServiceArea).where(ServiceArea.id == req.service_area_id))
    if not area:
        raise NotFoundError(f"Wilayah layanan dengan ID '{req.service_area_id}' tidak ditemukan.")

    profile = db.scalar(
        select(BanjarProfile).where(BanjarProfile.service_area_id == req.service_area_id)
    )
    if profile:
        profile.desa_adat_name = req.desa_adat_name
        profile.kelian_banjar_name = req.kelian_banjar_name
        profile.contact_phone = req.contact_phone
        profile.household_count = req.household_count
        profile.target_sorting_percent = req.target_sorting_percent
    else:
        profile = BanjarProfile(
            service_area_id=req.service_area_id,
            desa_adat_name=req.desa_adat_name,
            kelian_banjar_name=req.kelian_banjar_name,
            contact_phone=req.contact_phone,
            household_count=req.household_count,
            target_sorting_percent=req.target_sorting_percent,
        )
        db.add(profile)

    audit = AuditLog(
        action="BANJAR_PROFILE_UPDATED",
        entity_type="banjar_profiles",
        entity_id=profile.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Pembaruan profil kelembagaan Banjar {req.desa_adat_name} ({req.kelian_banjar_name})",
    )
    db.add(audit)
    db.commit()
    db.refresh(profile)
    return profile


def get_banjar_profile(db: Session, service_area_id: str) -> BanjarProfile:
    """Retrieve profile of a banjar by its service area id."""
    profile = db.scalar(
        select(BanjarProfile).where(BanjarProfile.service_area_id == service_area_id)
    )
    if not profile:
        raise NotFoundError(
            f"Profil Banjar untuk wilayah layanan '{service_area_id}' belum terdaftar."
        )
    return profile


def assign_banjar_official(
    db: Session, req: BanjarOfficialCreateRequest, actor_id: str, request_id: str | None = None
) -> BanjarOfficial:
    """Assign an official role (e.g. Kelian Banjar, Prajuru) to a user for a specific area."""
    user = db.scalar(select(User).where(User.id == req.user_id))
    if not user:
        raise NotFoundError(f"User dengan ID '{req.user_id}' tidak ditemukan.")

    area = db.scalar(select(ServiceArea).where(ServiceArea.id == req.service_area_id))
    if not area:
        raise NotFoundError(f"Wilayah layanan dengan ID '{req.service_area_id}' tidak ditemukan.")

    official = BanjarOfficial(
        user_id=req.user_id,
        service_area_id=req.service_area_id,
        official_title=req.official_title,
        is_active=True,
    )
    db.add(official)

    audit = AuditLog(
        action="BANJAR_OFFICIAL_ASSIGNED",
        entity_type="banjar_officials",
        entity_id=official.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Penugasan prajuru banjar: {user.full_name} sebagai {req.official_title} di {area.name}",
    )
    db.add(audit)
    db.commit()
    db.refresh(official)
    return official


def list_banjar_officials(db: Session, service_area_id: str) -> list[BanjarOfficial]:
    """List officials assigned to a specific banjar area."""
    return list(
        db.scalars(
            select(BanjarOfficial)
            .where(
                BanjarOfficial.service_area_id == service_area_id,
                BanjarOfficial.is_active,
            )
            .order_by(BanjarOfficial.created_at.asc())
        ).all()
    )


def check_banjar_territorial_access(
    db: Session, service_area_id: str, user: User
) -> bool:
    """Enforce territorial access control: Admin or active official of this banjar."""
    # Check if user is admin
    user_role_codes = [r.role.code for r in user.roles if r.role]
    if "ADMIN" in user_role_codes:
        return True

    # Check if user is an official in this banjar
    is_official = db.scalar(
        select(BanjarOfficial).where(
            BanjarOfficial.user_id == user.id,
            BanjarOfficial.service_area_id == service_area_id,
            BanjarOfficial.is_active,
        )
    )
    if is_official:
        return True

    raise AuthorizationError(
        "Akses ditolak: Anda tidak memiliki wewenang kewilayahan untuk data Banjar ini."
    )


def get_banjar_regional_dashboard(
    db: Session, service_area_id: str, user: User
) -> BanjarRegionalDashboardResponse:
    """Aggregate real-time regional dashboard for a Banjar."""
    check_banjar_territorial_access(db, service_area_id, user)

    area = db.scalar(select(ServiceArea).where(ServiceArea.id == service_area_id))
    if not area:
        raise NotFoundError(f"Wilayah layanan dengan ID '{service_area_id}' tidak ditemukan.")

    profile = db.scalar(
        select(BanjarProfile).where(BanjarProfile.service_area_id == service_area_id)
    )

    # Pickups metrics
    pickups = list(
        db.scalars(
            select(PickupRequest).where(PickupRequest.service_area_id == service_area_id)
        ).all()
    )
    total_pickups = len(pickups)
    total_weight = sum(float(p.estimated_weight_kg or 0.0) for p in pickups)

    # Sorting compliance estimate
    compliance = profile.target_sorting_percent if profile else 70.0

    # Open complaints
    open_complaints = db.scalar(
        select(func.count(CommunityComplaint.id)).where(
            CommunityComplaint.service_area_id == service_area_id,
            CommunityComplaint.status.in_([ComplaintStatus.REPORTED.value, ComplaintStatus.INVESTIGATING.value]),
        )
    ) or 0

    # Upcoming events
    now = datetime.now(UTC)
    upcoming_events = db.scalar(
        select(func.count(CommunityEvent.id)).where(
            CommunityEvent.service_area_id == service_area_id,
            CommunityEvent.event_date >= now,
            CommunityEvent.status == CommunityEventStatus.SCHEDULED.value,
        )
    ) or 0

    # Active programs targeting this area
    active_programs = db.scalar(
        select(func.count(FundingProgram.id)).where(
            FundingProgram.target_service_area_id == service_area_id,
            FundingProgram.status == "ACTIVE",
        )
    ) or 0

    return BanjarRegionalDashboardResponse(
        service_area_id=service_area_id,
        service_area_name=area.name,
        desa_adat_name=profile.desa_adat_name if profile else None,
        kelian_banjar_name=profile.kelian_banjar_name if profile else None,
        household_count=profile.household_count if profile else 0,
        total_pickups_count=total_pickups,
        total_weight_kg=float(total_weight),
        sorting_compliance_percent=float(compliance),
        open_complaints_count=int(open_complaints),
        upcoming_events_count=int(upcoming_events),
        active_programs_count=int(active_programs),
    )


# ==============================================================================
# Community Events
# ==============================================================================


def create_community_event(
    db: Session, req: CommunityEventCreateRequest, organizer_id: str, request_id: str | None = None
) -> CommunityEvent:
    """Schedule a new collective collection, gotong royong or workshop event."""
    area = db.scalar(select(ServiceArea).where(ServiceArea.id == req.service_area_id))
    if not area:
        raise NotFoundError(f"Wilayah layanan dengan ID '{req.service_area_id}' tidak ditemukan.")

    now_str = datetime.now(UTC).strftime("%Y%m%d%H%M")
    suffix = uuid.uuid4().hex[:4].upper()
    event_no = f"EVT-BANJAR-{now_str}-{suffix}"

    event = CommunityEvent(
        event_no=event_no,
        service_area_id=req.service_area_id,
        title=req.title,
        description=req.description,
        event_date=req.event_date,
        event_type=req.event_type.value,
        status=CommunityEventStatus.SCHEDULED.value,
        organizer_user_id=organizer_id,
        expected_attendees=req.expected_attendees,
        actual_attendees=0,
    )
    db.add(event)

    audit = AuditLog(
        action="COMMUNITY_EVENT_SCHEDULED",
        entity_type="community_events",
        entity_id=event.id,
        actor_user_id=organizer_id,
        request_id=request_id,
        reason=f"Penjadwalan kegiatan banjar: {req.title} pada {req.event_date}",
    )
    db.add(audit)
    db.commit()
    db.refresh(event)
    return event


def list_community_events(
    db: Session, service_area_id: str | None = None, status: str | None = None
) -> list[CommunityEvent]:
    """List community events with optional area/status filters."""
    query = select(CommunityEvent).order_by(CommunityEvent.event_date.asc())
    if service_area_id:
        query = query.where(CommunityEvent.service_area_id == service_area_id)
    if status:
        query = query.where(CommunityEvent.status == status)
    return list(db.scalars(query).all())


def record_event_attendance(
    db: Session,
    event_id: str,
    req: CommunityEventAttendanceRequest,
    actor_id: str,
    request_id: str | None = None,
) -> CommunityEvent:
    """Record verified attendance numbers and completion for an event."""
    event = db.scalar(select(CommunityEvent).where(CommunityEvent.id == event_id).with_for_update())
    if not event:
        raise NotFoundError(f"Kegiatan dengan ID '{event_id}' tidak ditemukan.")

    event.actual_attendees = req.actual_attendees
    event.status = req.status.value

    audit = AuditLog(
        action="COMMUNITY_EVENT_COMPLETED",
        entity_type="community_events",
        entity_id=event.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Pencatatan realisasi kegiatan {event.event_no}: {req.actual_attendees} warga hadir",
    )
    db.add(audit)
    db.commit()
    db.refresh(event)
    return event


# ==============================================================================
# Community Complaints
# ==============================================================================


def create_community_complaint(
    db: Session, req: CommunityComplaintCreateRequest, reporter_id: str, request_id: str | None = None
) -> CommunityComplaint:
    """File a grievance or waste violation in a Banjar."""
    area = db.scalar(select(ServiceArea).where(ServiceArea.id == req.service_area_id))
    if not area:
        raise NotFoundError(f"Wilayah layanan dengan ID '{req.service_area_id}' tidak ditemukan.")

    now_str = datetime.now(UTC).strftime("%Y%m%d%H%M")
    suffix = uuid.uuid4().hex[:4].upper()
    ticket_no = f"CMP-{now_str}-{suffix}"

    complaint = CommunityComplaint(
        ticket_no=ticket_no,
        service_area_id=req.service_area_id,
        reporter_user_id=reporter_id,
        title=req.title,
        description=req.description,
        location_detail=req.location_detail,
        status=ComplaintStatus.REPORTED.value,
    )
    db.add(complaint)

    audit = AuditLog(
        action="COMMUNITY_COMPLAINT_FILED",
        entity_type="community_complaints",
        entity_id=complaint.id,
        actor_user_id=reporter_id,
        request_id=request_id,
        reason=f"Pelaporan pengaduan kebersihan {ticket_no}: {req.title}",
    )
    db.add(audit)
    db.commit()
    db.refresh(complaint)
    return complaint


def list_community_complaints(
    db: Session, service_area_id: str | None = None, status: str | None = None
) -> list[CommunityComplaint]:
    """List complaints with optional area/status filters."""
    query = select(CommunityComplaint).order_by(CommunityComplaint.created_at.desc())
    if service_area_id:
        query = query.where(CommunityComplaint.service_area_id == service_area_id)
    if status:
        query = query.where(CommunityComplaint.status == status)
    return list(db.scalars(query).all())


def resolve_community_complaint(
    db: Session,
    complaint_id: str,
    req: CommunityComplaintResolveRequest,
    resolver_id: str,
    request_id: str | None = None,
) -> CommunityComplaint:
    """Resolve an escalated complaint with resolution notes and audit."""
    complaint = db.scalar(
        select(CommunityComplaint).where(CommunityComplaint.id == complaint_id).with_for_update()
    )
    if not complaint:
        raise NotFoundError(f"Pengaduan dengan ID '{complaint_id}' tidak ditemukan.")

    complaint.status = req.status.value
    complaint.resolution_notes = req.resolution_notes
    complaint.resolved_by = resolver_id
    complaint.resolved_at = datetime.now(UTC)

    audit = AuditLog(
        action="COMMUNITY_COMPLAINT_RESOLVED",
        entity_type="community_complaints",
        entity_id=complaint.id,
        actor_user_id=resolver_id,
        request_id=request_id,
        reason=f"Penyelesaian pengaduan {complaint.ticket_no}: status {req.status.value}",
    )
    db.add(audit)
    db.commit()
    db.refresh(complaint)
    return complaint


# ==============================================================================
# Clean-up Actions (Role 11 - Volunteer Beach / River Cleanup)
# ==============================================================================


def create_cleanup_action(
    db: Session, req: CleanupActionCreateRequest, coordinator_id: str, request_id: str | None = None
) -> CleanupAction:
    """Schedule and initialize a volunteer environmental cleanup action."""
    now_str = datetime.now(UTC).strftime("%Y%m%d%H%M")
    suffix = uuid.uuid4().hex[:4].upper()
    action_no = f"CLN-{req.action_type.value[:5]}-{now_str}-{suffix}"

    action = CleanupAction(
        action_no=action_no,
        action_type=req.action_type.value,
        location_name=req.location_name,
        service_area_id=req.service_area_id,
        coordinator_user_id=coordinator_id,
        event_date=req.event_date,
        duration_hours=req.duration_hours,
        volunteer_count=req.volunteer_count,
        total_collected_weight_kg=0.0,
        plastic_weight_kg=0.0,
        organic_weight_kg=0.0,
        residual_weight_kg=0.0,
        status=CleanupActionStatus.PLANNED.value,
    )
    db.add(action)

    audit = AuditLog(
        action="CLEANUP_ACTION_SCHEDULED",
        entity_type="cleanup_actions",
        entity_id=action.id,
        actor_user_id=coordinator_id,
        request_id=request_id,
        reason=f"Penjadwalan aksi pembersihan {req.action_type.value} di {req.location_name}",
    )
    db.add(audit)
    db.commit()
    db.refresh(action)
    return action


def complete_cleanup_action(
    db: Session,
    action_id: str,
    req: CleanupActionCompleteRequest,
    coordinator_id: str,
    request_id: str | None = None,
) -> CleanupAction:
    """Record collected weights and fractions from an environmental cleanup action."""
    action = db.scalar(select(CleanupAction).where(CleanupAction.id == action_id).with_for_update())
    if not action:
        raise NotFoundError(f"Aksi kebersihan dengan ID '{action_id}' tidak ditemukan.")

    action.total_collected_weight_kg = req.total_collected_weight_kg
    action.plastic_weight_kg = req.plastic_weight_kg
    action.organic_weight_kg = req.organic_weight_kg
    action.residual_weight_kg = req.residual_weight_kg
    action.evidence_notes = req.evidence_notes
    action.status = CleanupActionStatus.COMPLETED.value

    audit = AuditLog(
        action="CLEANUP_ACTION_COMPLETED",
        entity_type="cleanup_actions",
        entity_id=action.id,
        actor_user_id=coordinator_id,
        request_id=request_id,
        reason=f"Penyelesaian aksi {action.action_no}: total {req.total_collected_weight_kg} kg sampah terkumpul",
    )
    db.add(audit)
    db.commit()
    db.refresh(action)
    return action


def verify_cleanup_action(
    db: Session,
    action_id: str,
    req: CleanupActionVerifyRequest,
    verifier_id: str,
    request_id: str | None = None,
) -> CleanupAction:
    """Verify environmental cleanup action documentation and mass integrity."""
    action = db.scalar(select(CleanupAction).where(CleanupAction.id == action_id).with_for_update())
    if not action:
        raise NotFoundError(f"Aksi kebersihan dengan ID '{action_id}' tidak ditemukan.")

    if action.status != CleanupActionStatus.COMPLETED.value:
        raise ValidationError("Hanya aksi pembersihan yang berstatus COMPLETED yang dapat diverifikasi.")

    action.status = CleanupActionStatus.VERIFIED.value
    action.verified_by = verifier_id
    action.verified_at = datetime.now(UTC)
    if req.notes:
        action.evidence_notes = f"{action.evidence_notes or ''} [Verifikasi: {req.notes}]".strip()

    audit = AuditLog(
        action="CLEANUP_ACTION_VERIFIED",
        entity_type="cleanup_actions",
        entity_id=action.id,
        actor_user_id=verifier_id,
        request_id=request_id,
        reason=f"Verifikasi aksi pembersihan {action.action_no} oleh supervisor/pemerintah",
    )
    db.add(audit)
    db.commit()
    db.refresh(action)
    return action


def list_cleanup_actions(
    db: Session, action_type: str | None = None, status: str | None = None
) -> list[CleanupAction]:
    """List volunteer clean-up actions with optional filters."""
    query = select(CleanupAction).order_by(CleanupAction.event_date.desc())
    if action_type:
        query = query.where(CleanupAction.action_type == action_type)
    if status:
        query = query.where(CleanupAction.status == status)
    return list(db.scalars(query).all())


# ==============================================================================
# Hazardous Waste Manifests (Role 12 - Limbah Khusus B3 Terkendali)
# ==============================================================================


def create_hazardous_manifest(
    db: Session, req: HazardousManifestCreateRequest, creator_id: str, request_id: str | None = None
) -> HazardousWasteManifest:
    """Create controlled hazardous waste manifest with licensed handler partner gating."""
    # Check handler partner verification
    partner = db.scalar(select(Partner).where(Partner.id == req.handler_partner_id))
    if not partner:
        raise NotFoundError(f"Mitra penangan dengan ID '{req.handler_partner_id}' tidak ditemukan.")
    if partner.verification_status != "VERIFIED":
        raise ValidationError(
            f"Mitra '{partner.name}' belum berstatus VERIFIED. Pengelolaan limbah B3 wajib melalui mitra terverifikasi."
        )

    now_str = datetime.now(UTC).strftime("%Y%m%d%H%M")
    suffix = uuid.uuid4().hex[:4].upper()
    manifest_no = f"MAN-B3-{now_str}-{suffix}"

    manifest = HazardousWasteManifest(
        manifest_no=manifest_no,
        category_id=req.category_id,
        service_area_id=req.service_area_id,
        source_pickup_id=req.source_pickup_id,
        handler_partner_id=req.handler_partner_id,
        transporter_license_no=req.transporter_license_no,
        weight_kg=req.weight_kg,
        hazard_type=req.hazard_type.value,
        handling_sop_code=req.handling_sop_code,
        status=HazardousManifestStatus.IN_TRANSIT.value,
        notes=req.notes,
        created_by=creator_id,
    )
    db.add(manifest)

    audit = AuditLog(
        action="HAZARDOUS_MANIFEST_CREATED",
        entity_type="hazardous_waste_manifests",
        entity_id=manifest.id,
        actor_user_id=creator_id,
        request_id=request_id,
        reason=f"Penerbitan manifes limbah khusus B3 {manifest_no} via {partner.name} (Izin: {req.transporter_license_no})",
    )
    db.add(audit)
    db.commit()
    db.refresh(manifest)
    return manifest


def update_hazardous_manifest_status(
    db: Session,
    manifest_id: str,
    req: HazardousManifestStatusUpdateRequest,
    actor_id: str,
    request_id: str | None = None,
) -> HazardousWasteManifest:
    """Update movement and transit status of a hazardous waste manifest."""
    manifest = db.scalar(
        select(HazardousWasteManifest)
        .where(HazardousWasteManifest.id == manifest_id)
        .with_for_update()
    )
    if not manifest:
        raise NotFoundError(f"Manifes limbah khusus dengan ID '{manifest_id}' tidak ditemukan.")

    manifest.status = req.status.value
    if req.notes:
        manifest.notes = f"{manifest.notes or ''} [{req.status.value}: {req.notes}]".strip()

    audit = AuditLog(
        action="HAZARDOUS_MANIFEST_STATUS_UPDATED",
        entity_type="hazardous_waste_manifests",
        entity_id=manifest.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Pembaruan status manifes B3 {manifest.manifest_no} -> {req.status.value}",
    )
    db.add(audit)
    db.commit()
    db.refresh(manifest)
    return manifest


def record_hazardous_disposal(
    db: Session,
    manifest_id: str,
    req: HazardousManifestDisposalRequest,
    actor_id: str,
    request_id: str | None = None,
) -> HazardousWasteManifest:
    """Record certified final destruction or safe disposal of hazardous waste."""
    manifest = db.scalar(
        select(HazardousWasteManifest)
        .where(HazardousWasteManifest.id == manifest_id)
        .with_for_update()
    )
    if not manifest:
        raise NotFoundError(f"Manifes limbah khusus dengan ID '{manifest_id}' tidak ditemukan.")

    manifest.status = HazardousManifestStatus.SAFELY_DISPOSED.value
    manifest.destruction_cert_no = req.destruction_cert_no
    manifest.disposed_at = datetime.now(UTC)
    if req.notes:
        manifest.notes = f"{manifest.notes or ''} [Pemusnahan: {req.notes}]".strip()

    audit = AuditLog(
        action="HAZARDOUS_MANIFEST_DISPOSED",
        entity_type="hazardous_waste_manifests",
        entity_id=manifest.id,
        actor_user_id=actor_id,
        request_id=request_id,
        reason=f"Sertifikasi pemusnahan limbah B3 {manifest.manifest_no}: Berita Acara #{req.destruction_cert_no}",
    )
    db.add(audit)
    db.commit()
    db.refresh(manifest)
    return manifest


def list_hazardous_manifests(
    db: Session, status: str | None = None
) -> list[HazardousWasteManifest]:
    """List hazardous waste manifests."""
    query = select(HazardousWasteManifest).order_by(HazardousWasteManifest.created_at.desc())
    if status:
        query = query.where(HazardousWasteManifest.status == status)
    return list(db.scalars(query).all())
