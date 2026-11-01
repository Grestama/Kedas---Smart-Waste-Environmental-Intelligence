"""Kedas — Server-Side AI Context Resolver and Scoped Authorization.

Otoritas penuh context: identitas aktor, permissions, keanggotaan organisasi,
kawasan/CDOA, dan batasan visibilitas diverifikasi secara deterministik di server.
Client context hanya diperlakukan sebagai UI hint, bukan sumber otorisasi.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.account.models import Role, User, UserRole
from app.modules.collection.models import ServiceArea
from app.modules.community.models import BanjarOfficial, CDOAAgreement, CDOAStatus
from app.modules.facility.models import Facility
from app.modules.marketplace.models import B2BOrganizationMember


@dataclass(frozen=True)
class ResolvedActor:
    """Immutable representation of the authenticated or guest actor."""

    actor_type: (
        str  # "GUEST" | "CITIZEN" | "OFFICIAL" | "OPERATOR" | "HOSPITALITY" | "COMMUNITY" | "ADMIN"
    )
    user_id: str | None
    email: str | None
    roles: tuple[str, ...]
    is_admin: bool
    is_authenticated: bool


@dataclass(frozen=True)
class ResolvedScope:
    """Immutable scope boundaries for knowledge retrieval and live-data access."""

    destination_id: str | None
    destination_name: str | None
    organization_id: str | None
    facility_id: str | None
    cdoa_id: str | None
    cdoa_version: str | None
    cdoa_escalation_channel: str | None
    timezone: str
    as_of: str
    visibility_mode: str


@dataclass(frozen=True)
class ServerContext:
    """Consolidated server-derived context authoritative for the entire turn lifecycle."""

    actor: ResolvedActor
    scope: ResolvedScope
    permissions: tuple[str, ...] = field(default_factory=tuple)

    def can_access_document(
        self,
        doc_is_public: bool,
        doc_destination_id: str | None,
        doc_org_id: str | None,
        doc_status: str,
    ) -> bool:
        """Enforce strict multi-tenant and multi-destination boundary on knowledge documents."""
        # Only published documents are accessible
        if doc_status != "PUBLISHED":
            return False

        # Tenant isolation: Organization-scoped document requires matching organization_id or admin
        if doc_org_id and not self.actor.is_admin and self.scope.organization_id != doc_org_id:
            return False

        # Public documents are viewable by anyone in scope
        if doc_is_public:
            if not doc_destination_id or not self.scope.destination_id:
                return True
            return doc_destination_id == self.scope.destination_id

        # Non-public documents require authenticated actor with matching scope
        if not self.actor.is_authenticated:
            return False

        if self.actor.is_admin:
            return True

        return not (doc_destination_id and doc_destination_id != self.scope.destination_id)

    def can_read_user_records(self, target_user_id: str | None) -> bool:
        """Prevent cross-user data leakage."""
        if not target_user_id:
            return False
        if not self.actor.is_authenticated:
            return False
        if self.actor.is_admin:
            return True
        return self.actor.user_id == target_user_id

    def can_read_tenant_records(self, target_org_id: str | None) -> bool:
        """Prevent cross-organization/hospitality tenant data leakage."""
        if not target_org_id:
            return False
        if not self.actor.is_authenticated:
            return False
        if self.actor.is_admin:
            return True
        return self.scope.organization_id == target_org_id


class ContextResolver:
    """Server-side deterministic context resolver."""

    @classmethod
    def resolve(
        cls,
        db: Session,
        user: User | None,
        client_destination_hint: str | None = None,
    ) -> ServerContext:
        """Resolve full server context with database verification."""
        now_iso = datetime.now(UTC).isoformat()
        tz = "Asia/Makassar"

        # 1. Resolve Actor
        if user is None:
            actor = ResolvedActor(
                actor_type="GUEST",
                user_id=None,
                email=None,
                roles=(),
                is_admin=False,
                is_authenticated=False,
            )
            roles_set: set[str] = set()
        else:
            role_codes = tuple(
                db.scalars(
                    select(Role.code)
                    .join(UserRole, UserRole.role_id == Role.id)
                    .where(UserRole.user_id == user.id, UserRole.verification_status == "ACTIVE")
                ).all()
            )
            roles_set = set(role_codes)
            is_admin = "ADMIN" in roles_set

            # Classify primary actor type
            if is_admin:
                actor_type = "ADMIN"
            elif "FACILITY_OPERATOR" in roles_set:
                actor_type = "OPERATOR"
            elif "DISPATCHER" in roles_set or "COLLECTOR" in roles_set:
                actor_type = "OFFICIAL"
            elif "COMMUNITY_LEADER" in roles_set:
                actor_type = "COMMUNITY"
            elif "PARTNER" in roles_set:
                actor_type = "HOSPITALITY"
            else:
                actor_type = "CITIZEN"

            actor = ResolvedActor(
                actor_type=actor_type,
                user_id=user.id,
                email=user.email,
                roles=role_codes,
                is_admin=is_admin,
                is_authenticated=True,
            )

        # 2. Resolve Scope: Organization Membership
        resolved_org_id: str | None = None
        if user:
            membership = db.scalar(
                select(B2BOrganizationMember.organization_id)
                .where(B2BOrganizationMember.user_id == user.id)
                .limit(1)
            )
            resolved_org_id = membership

        # 3. Resolve Scope: Facility Assignment
        resolved_facility_id: str | None = None
        if user and "FACILITY_OPERATOR" in roles_set:
            fac = db.scalar(
                select(Facility.id)
                .where(Facility.is_active.is_(True))
                .order_by(Facility.created_at.desc())
                .limit(1)
            )
            resolved_facility_id = fac

        # 4. Resolve Scope: Destination / Service Area
        resolved_dest_id: str | None = None
        resolved_dest_name: str | None = None

        # Check banjar official assignment first
        if user and ("COMMUNITY_LEADER" in roles_set or "OFFICIAL" in roles_set):
            official = db.scalar(
                select(BanjarOfficial.service_area_id)
                .where(
                    BanjarOfficial.user_id == user.id,
                    BanjarOfficial.is_active.is_(True),
                )
                .limit(1)
            )
            if official:
                resolved_dest_id = official

        # If not resolved from official role, validate client hint against active service areas
        if not resolved_dest_id and client_destination_hint:
            area = db.get(ServiceArea, client_destination_hint)
            if area and area.is_active:
                resolved_dest_id = area.id
                resolved_dest_name = area.name

        # If resolved from official role, fetch name
        if resolved_dest_id and not resolved_dest_name:
            area = db.get(ServiceArea, resolved_dest_id)
            if area:
                resolved_dest_name = area.name

        # 5. Resolve Active CDOA for Destination
        resolved_cdoa_id: str | None = None
        resolved_cdoa_ver: str | None = None
        resolved_escalation: str | None = None

        if resolved_dest_id:
            cdoa = db.scalar(
                select(CDOAAgreement)
                .where(
                    CDOAAgreement.service_area_id == resolved_dest_id,
                    CDOAAgreement.status == CDOAStatus.PUBLISHED.value,
                )
                .order_by(CDOAAgreement.version.desc())
                .limit(1)
            )
            if cdoa:
                resolved_cdoa_id = cdoa.id
                resolved_cdoa_ver = f"{cdoa.agreement_no} (v{cdoa.version})"
                resolved_escalation = cdoa.escalation_channel

        # 6. Visibility Mode
        if not user:
            visibility = "PUBLIC_ONLY"
        elif actor.is_admin:
            visibility = "GLOBAL_ADMIN"
        elif resolved_org_id:
            visibility = "ORGANIZATION_PLUS_PUBLIC"
        else:
            visibility = "DESTINATION_PLUS_OWN_RECORDS"

        scope = ResolvedScope(
            destination_id=resolved_dest_id,
            destination_name=resolved_dest_name or "Kawasan Bali",
            organization_id=resolved_org_id,
            facility_id=resolved_facility_id,
            cdoa_id=resolved_cdoa_id,
            cdoa_version=resolved_cdoa_ver or "1.0",
            cdoa_escalation_channel=resolved_escalation,
            timezone=tz,
            as_of=now_iso,
            visibility_mode=visibility,
        )

        return ServerContext(
            actor=actor,
            scope=scope,
            permissions=tuple(roles_set),
        )
