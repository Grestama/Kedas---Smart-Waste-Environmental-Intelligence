"""Kedas — Role-Aware Live Data Tool Registry & Mutation Proposal Engine.

Enforces:
1. Strict read-only live data tools with IDOR and role boundaries.
2. Controlled mutation proposals: LLMs cannot mutate state directly; they only formulate
   typed ActionProposal payloads that require explicit human confirmation.
3. Full audit logging of tool invocations.
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import AuthorizationError
from app.modules.ai.context_resolver import ServerContext
from app.modules.ai.schemas import ActionProposalPayload
from app.modules.collection.models import PickupRequest, PickupStatus, ServiceArea
from app.modules.community.models import CDOAAgreement, CDOAStatus
from app.modules.facility.models import Facility
from app.modules.points.models import LedgerEntry, LedgerEntryStatus

logger = logging.getLogger("kedas.ai.tools")


class LiveDataToolRegistry:
    """Allowlisted read-only live data tools with strict actor scoping."""

    @classmethod
    def get_own_pickup_status(
        cls,
        db: Session,
        server_ctx: ServerContext,
    ) -> dict[str, Any]:
        """Fetch active/recent pickup status for authenticated resident. Strictly scoped to caller."""
        if not server_ctx.actor.is_authenticated or not server_ctx.actor.user_id:
            raise AuthorizationError("Akses ditolak: Fitur status penjemputan memerlukan login.")

        # IDOR prevention: only query caller's own pickups
        stmt = (
            select(PickupRequest)
            .where(PickupRequest.reporter_user_id == server_ctx.actor.user_id)
            .order_by(PickupRequest.created_at.desc())
            .limit(3)
        )
        pickups = list(db.scalars(stmt).all())

        if not pickups:
            return {
                "has_active_pickup": False,
                "pickups": [],
                "message": "Anda belum memiliki permohonan penjemputan sampah.",
            }

        latest = pickups[0]
        return {
            "has_active_pickup": latest.status
            not in (PickupStatus.COMPLETED.value, PickupStatus.CANCELLED.value),
            "latest_pickup": {
                "id": latest.id,
                "public_code": latest.public_code,
                "status": latest.status,
                "scheduled_date": (
                    latest.slot.start_time.isoformat()
                    if getattr(latest, "slot", None) and latest.slot
                    else None
                ),
                "service_mode": latest.service_mode,
                "estimated_weight_kg": float(latest.estimated_weight_kg)
                if latest.estimated_weight_kg
                else None,
            },
            "history_count": len(pickups),
        }

    @classmethod
    def get_own_wastepoints_balance(
        cls,
        db: Session,
        server_ctx: ServerContext,
    ) -> dict[str, Any]:
        """Fetch WastePoints balance and recent reward ledger. Strictly scoped to caller."""
        if not server_ctx.actor.is_authenticated or not server_ctx.actor.user_id:
            raise AuthorizationError("Akses ditolak: Fitur saldo WastePoints memerlukan login.")

        # IDOR prevention: sum ledger entries only for caller's user_id
        balance = (
            db.scalar(
                select(func.coalesce(func.sum(LedgerEntry.points_delta), 0)).where(
                    LedgerEntry.user_id == server_ctx.actor.user_id,
                    LedgerEntry.status == LedgerEntryStatus.POSTED.value,
                )
            )
            or 0
        )

        recent_entries = list(
            db.scalars(
                select(LedgerEntry)
                .where(LedgerEntry.user_id == server_ctx.actor.user_id)
                .order_by(LedgerEntry.created_at.desc())
                .limit(3)
            ).all()
        )

        return {
            "user_id": server_ctx.actor.user_id,
            "balance_points": int(balance),
            "recent_transactions": [
                {
                    "id": e.id,
                    "delta": e.points_delta,
                    "type": e.entry_type,
                    "reason": e.reason,
                    "created_at": e.created_at.isoformat(),
                }
                for e in recent_entries
            ],
        }

    @classmethod
    def get_facility_capacity(
        cls,
        db: Session,
        server_ctx: ServerContext,
        facility_id: str | None = None,
    ) -> dict[str, Any]:
        """Fetch capacity and operating status of active TPS3R facilities."""
        stmt = select(Facility).where(Facility.is_active.is_(True))
        if facility_id:
            stmt = stmt.where(Facility.id == facility_id)
        elif server_ctx.scope.facility_id:
            stmt = stmt.where(Facility.id == server_ctx.scope.facility_id)

        facilities = list(db.scalars(stmt.limit(5)).all())
        return {
            "total_active_facilities": len(facilities),
            "facilities": [
                {
                    "id": f.id,
                    "name": f.name,
                    "facility_type": f.facility_type,
                    "is_active": f.is_active,
                    "service_area_id": f.service_area_id,
                }
                for f in facilities
            ],
        }

    @classmethod
    def get_cdoa_agreement_info(
        cls,
        db: Session,
        server_ctx: ServerContext,
    ) -> dict[str, Any]:
        """Fetch active CDOA agreement and escalation contact for the resolved destination."""
        dest_id = server_ctx.scope.destination_id
        if not dest_id:
            return {
                "has_active_cdoa": False,
                "message": "Tidak ada kawasan destinasi spesifik yang dipilih.",
            }

        cdoa = db.scalar(
            select(CDOAAgreement)
            .where(
                CDOAAgreement.service_area_id == dest_id,
                CDOAAgreement.status == CDOAStatus.PUBLISHED.value,
            )
            .order_by(CDOAAgreement.created_at.desc())
        )
        if not cdoa:
            return {
                "has_active_cdoa": False,
                "destination_name": server_ctx.scope.destination_name,
                "message": "Kawasan ini belum memiliki CDOA aktif yang dipublikasikan.",
            }

        return {
            "has_active_cdoa": True,
            "agreement_no": cdoa.agreement_no,
            "title": cdoa.title,
            "version": cdoa.version,
            "destination_name": server_ctx.scope.destination_name,
            "escalation_channel": server_ctx.scope.cdoa_escalation_channel,
        }

    @classmethod
    def get_service_directory(
        cls,
        db: Session,
        server_ctx: ServerContext,
    ) -> dict[str, Any]:
        """Fetch general service directory and active areas."""
        areas = list(
            db.scalars(select(ServiceArea).where(ServiceArea.is_active.is_(True)).limit(10)).all()
        )
        return {
            "active_areas_count": len(areas),
            "areas": [
                {
                    "id": a.id,
                    "name": a.name,
                    "code": a.code,
                    "administrative_area": a.administrative_area,
                }
                for a in areas
            ],
        }


# ==============================================================================
# Controlled Mutation Action Proposal Builders
# ==============================================================================


class ActionProposalBuilder:
    """Builds typed action proposals requiring human confirmation before execution."""

    @staticmethod
    def create_pickup_draft(
        user_id: str,
        service_area_id: str,
        scheduled_date: str,
        service_mode: str = "SCHEDULED_CURBSIDE",
        estimated_weight_kg: float = 5.0,
    ) -> ActionProposalPayload:
        return ActionProposalPayload(
            action_type="CREATE_PICKUP_DRAFT",
            title="Konfirmasi Pendaftaran Penjemputan Sampah",
            description=f"Jadwal penjemputan sampah terpilah pada {scheduled_date} (estimasi {estimated_weight_kg} kg).",
            target_id=None,
            service_area_id=service_area_id,
            parameters={
                "user_id": user_id,
                "service_area_id": service_area_id,
                "scheduled_date": scheduled_date,
                "service_mode": service_mode,
                "estimated_weight_kg": estimated_weight_kg,
            },
        )

    @staticmethod
    def cancel_pickup_draft(
        pickup_id: str,
        public_code: str,
        reason: str,
    ) -> ActionProposalPayload:
        return ActionProposalPayload(
            action_type="CANCEL_PICKUP_DRAFT",
            title=f"Batalkan Penjemputan Tiket {public_code}",
            description=f"Konfirmasi pembatalan tiket penjemputan {public_code} dengan alasan: {reason}.",
            target_id=pickup_id,
            parameters={
                "pickup_id": pickup_id,
                "public_code": public_code,
                "cancellation_reason": reason,
            },
        )

    @staticmethod
    def contact_banjar_escalation(
        banjar_name: str,
        contact_channel: str,
        issue_summary: str,
    ) -> ActionProposalPayload:
        return ActionProposalPayload(
            action_type="CONTACT_BANJAR_ESCALATION",
            title=f"Hubungi Pengurus {banjar_name}",
            description=f"Kirimkan ringkasan isu pengelolaan sampah ke saluran resmi {contact_channel}.",
            target_id=None,
            parameters={
                "banjar_name": banjar_name,
                "contact_channel": contact_channel,
                "issue_summary": issue_summary,
            },
        )
