"""Kedas — Tahap 6 Live Data Tools, IDOR Prevention & Action Proposal Tests."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account.models import UserAddress
from app.modules.ai.schemas import ActionProposalExecuteRequest
from app.modules.ai.tools import ActionProposalBuilder
from app.modules.collection.models import CollectionSlot, PickupRequest, PickupStatus, ServiceArea
from app.modules.points.models import LedgerEntry, LedgerEntryStatus, LedgerEntryType
from app.modules.taxonomy.models import WasteCategory


def _login(client, email: str, password: str) -> str:
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert resp.status_code == 200
    return resp.json()["session_token"]


def _register(client, email: str, full_name: str) -> tuple[str, dict]:
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": full_name, "password": "password_123"},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def test_live_pickup_status_idor_prevention(client, db_session: Session):
    """Verify live pickup status tool enforces strict IDOR protection (guest blocked, user isolated)."""
    # 1. Guest request -> 403 Forbidden
    resp_guest = client.get("/api/v1/ai/tools/pickup-status")
    assert resp_guest.status_code == 403

    # 2. Setup Resident A and Resident B
    u_a_email = f"warga_a_{uuid.uuid4().hex[:6]}@kedas.bali"
    tok_a, user_a = _register(client, u_a_email, "Warga A")
    head_a = {"Authorization": f"Bearer {tok_a}"}

    u_b_email = f"warga_b_{uuid.uuid4().hex[:6]}@kedas.bali"
    tok_b, user_b = _register(client, u_b_email, "Warga B")
    head_b = {"Authorization": f"Bearer {tok_b}"}

    # Setup Area and Slot
    area = ServiceArea(
        name="Kawasan Sanur",
        code=f"san_{uuid.uuid4().hex[:6]}",
        administrative_area="Denpasar Selatan",
        is_active=True,
    )
    db_session.add(area)
    db_session.flush()

    now = datetime.now(UTC)
    slot = CollectionSlot(
        service_area_id=area.id,
        start_time=now + timedelta(days=1),
        end_time=now + timedelta(days=1, hours=2),
        max_capacity=10,
        booked_capacity=0,
        is_active=True,
    )
    db_session.add(slot)
    db_session.flush()

    cat = WasteCategory(
        code=f"org_{uuid.uuid4().hex[:6]}",
        name="Organik",
        category_type="ORGANIC",
        is_active=True,
    )
    db_session.add(cat)
    db_session.flush()

    addr_a = UserAddress(
        user_id=user_a["id"],
        label="Rumah",
        address_text="Jl. Danau Tamblingan No. 12, Sanur",
        service_area_id=area.id,
        is_default=True,
    )
    db_session.add(addr_a)
    db_session.flush()

    # Create Pickup for Resident A
    pickup_a = PickupRequest(
        public_code=f"PK-{uuid.uuid4().hex[:6].upper()}",
        reporter_user_id=user_a["id"],
        service_area_id=area.id,
        category_id=cat.id,
        address_id=addr_a.id,
        slot_id=slot.id,
        status=PickupStatus.SUBMITTED.value,
        service_mode="SCHEDULED_CURBSIDE",
        estimated_weight_kg=8.5,
    )
    db_session.add(pickup_a)
    db_session.commit()

    # 3. Resident A sees their own pickup
    resp_a = client.get("/api/v1/ai/tools/pickup-status", headers=head_a)
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    assert data_a["has_active_pickup"] is True
    assert data_a["latest_pickup"]["public_code"] == pickup_a.public_code

    # 4. Resident B does NOT see Resident A's pickup (Zero Leakage)
    resp_b = client.get("/api/v1/ai/tools/pickup-status", headers=head_b)
    assert resp_b.status_code == 200
    data_b = resp_b.json()
    assert data_b["has_active_pickup"] is False
    assert data_b["pickups"] == []


def test_live_wastepoints_balance_scoping(client, db_session: Session):
    """Verify live WastePoints balance correctly sums caller's ledger entries."""
    u_email = f"points_u_{uuid.uuid4().hex[:6]}@kedas.bali"
    tok, u_data = _register(client, u_email, "Warga Points")
    headers = {"Authorization": f"Bearer {tok}"}

    uid = u_data["id"]

    # Post 2 ledger entries for this user: +150 points, +50 points
    e1 = LedgerEntry(
        user_id=uid,
        points_delta=150,
        entry_type=LedgerEntryType.EARNED_PICKUP.value,
        status=LedgerEntryStatus.POSTED.value,
        source_type="PICKUP",
        source_id="src-1",
        idempotency_key=f"idem-{uuid.uuid4()}",
        actor_id=uid,
        reason="Penimbangan botol plastik PET 5 kg",
    )
    e2 = LedgerEntry(
        user_id=uid,
        points_delta=50,
        entry_type=LedgerEntryType.EARNED_PICKUP.value,
        status=LedgerEntryStatus.POSTED.value,
        source_type="PICKUP",
        source_id="src-2",
        idempotency_key=f"idem-{uuid.uuid4()}",
        actor_id=uid,
        reason="Penyetoran kardus 2 kg",
    )
    db_session.add_all([e1, e2])
    db_session.commit()

    resp = client.get("/api/v1/ai/tools/wastepoints", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["balance_points"] == 200
    assert len(data["recent_transactions"]) == 2


def test_action_proposal_pattern_and_human_execution(client, db_session: Session):
    """Verify LLM mutation proposals require explicit user confirmation and commit audit trail."""
    admin_email = f"tool_admin_{uuid.uuid4().hex[:6]}@kedas.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin Tool")
    admin_tok = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_tok}"}

    # 1. Build cancellation proposal
    proposal = ActionProposalBuilder.cancel_pickup_draft(
        pickup_id=str(uuid.uuid4()),
        public_code="PK-TEST-123",
        reason="Warga berhalangan hadir pada slot jadwal.",
    )
    assert proposal.action_type == "CANCEL_PICKUP_DRAFT"
    assert proposal.confirmation_required is True

    # 2. Human confirms and executes proposal via POST /api/v1/ai/action-proposal/execute
    req_payload = ActionProposalExecuteRequest(
        proposal=proposal,
        user_notes="Konfirmasi pembatalan disetujui pengguna.",
    )
    resp = client.post(
        "/api/v1/ai/action-proposal/execute",
        json=req_payload.model_dump(),
        headers=admin_headers,
    )
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert res_data["action_type"] == "CANCEL_PICKUP_DRAFT"
    assert res_data["audit_id"] is not None
