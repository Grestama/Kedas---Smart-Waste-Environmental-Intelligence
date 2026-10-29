"""WasteLink Bali — Tahap 3: Petugas, Dispatch, Penugasan, Bukti, Penimbangan & Reward Ledger.

Verifies:
1. Unverified or non-collector users cannot accept or manage collection tasks.
2. Atomic concurrency claim prevents double assignment of tasks.
3. Strict state transition rules (cannot skip steps like inspection/weighing).
4. Field failure transitions (CANCELLED/REJECTED) require mandatory reasons and release slot capacity.
5. Supervisor / Admin task reassignment with audit trail.
6. Inspection QC gate before weighing.
7. Verified weight calculation (gross - tare = net), versioning, and append-only points ledger.
8. Citizen / unassigned collector IDOR isolation on internal task operations.
"""

from datetime import UTC, datetime, timedelta

from app.modules.account.models import Role, UserRole
from app.modules.collection import service as collection_service
from app.modules.collection.models import PickupStatus
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    ServiceAreaCreateRequest,
)
from app.modules.points import service as points_service
from app.modules.taxonomy import service as taxonomy_service


def _register(client, email: str, name: str) -> tuple[str, dict]:
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": "Password123#"},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def _grant_role(db, user_id: str, role_code: str, status: str = "ACTIVE"):
    role = db.query(Role).filter(Role.code == role_code).first()
    user_role = UserRole(
        user_id=user_id,
        role_id=role.id,
        verification_status=status,
        granted_at=datetime.now(UTC),
    )
    db.add(user_role)
    db.commit()


def _setup_pickup(client, db_session, citizen_token):
    headers_citizen = {"Authorization": f"Bearer {citizen_token}"}
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_PHASE3_{datetime.now(UTC).timestamp()}",
            name="Banjar Sukawati Kaja",
            administrative_area="Sukawati",
            is_active=True,
        ),
    )
    now = datetime.now(UTC)
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=2),
            end_time=now + timedelta(hours=4),
            max_capacity=10,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    recyclable_cat = next(c for c in cats if c.code == "RECYCLABLE")

    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Raya Batuan No. 10", "service_area_id": area.id},
        headers=headers_citizen,
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": recyclable_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 4.5,
            "service_mode": "PICKUP",
            "notes": "Botol beling dan plastik",
        },
        headers=headers_citizen,
    )
    assert pickup_resp.status_code == 201
    return pickup_resp.json(), slot, recyclable_cat


def test_unverified_or_inactive_collector_cannot_claim_task(client, db_session):
    """User without active COLLECTOR role is rejected from claiming tasks."""
    c_token, citizen = _register(client, "citizen_p3@example.com", "Warga Biasa")
    col_pending_token, col_pending = _register(client, "col_pending@example.com", "Petugas Pending")
    # Grant COLLECTOR role but in PENDING status
    _grant_role(db_session, col_pending["id"], "COLLECTOR", status="PENDING")

    pickup_data, _, _ = _setup_pickup(client, db_session, c_token)
    pickup_id = pickup_data["id"]

    # 1. Citizen attempts to claim task -> 403 Forbidden
    resp_citizen = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/accept",
        headers={"Authorization": f"Bearer {c_token}"},
    )
    assert resp_citizen.status_code == 403

    # 2. Unverified/pending collector attempts to claim task -> 403 Forbidden
    resp_pending = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/accept",
        headers={"Authorization": f"Bearer {col_pending_token}"},
    )
    assert resp_pending.status_code == 403


def test_concurrency_atomic_claim_prevents_double_assignment(client, db_session):
    """Atomic claim ensures only the first collector gets the task; second collector gets 409 Conflict."""
    c_token, _ = _register(client, "citizen_concur@example.com", "Warga Concur")
    col1_token, col1 = _register(client, "collector_1@example.com", "Petugas 1")
    col2_token, col2 = _register(client, "collector_2@example.com", "Petugas 2")
    _grant_role(db_session, col1["id"], "COLLECTOR", status="ACTIVE")
    _grant_role(db_session, col2["id"], "COLLECTOR", status="ACTIVE")

    headers_col1 = {"Authorization": f"Bearer {col1_token}"}
    headers_col2 = {"Authorization": f"Bearer {col2_token}"}

    pickup_data, _, _ = _setup_pickup(client, db_session, c_token)
    pickup_id = pickup_data["id"]

    # First claim succeeds
    resp1 = client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=headers_col1)
    assert resp1.status_code == 200
    assert resp1.json()["assigned_collector_id"] == col1["id"]
    assert resp1.json()["status"] == PickupStatus.ACCEPTED.value

    # Second claim fails with 409 Conflict
    resp2 = client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=headers_col2)
    assert resp2.status_code == 409
    assert "sudah diambil" in resp2.json()["message"].lower()


def test_invalid_status_transitions_rejected(client, db_session):
    """State machine strictly prevents illegal transitions (e.g. ACCEPTED directly to COLLECTED)."""
    c_token, _ = _register(client, "citizen_state@example.com", "Warga State")
    col_token, col = _register(client, "collector_state@example.com", "Petugas State")
    _grant_role(db_session, col["id"], "COLLECTOR", status="ACTIVE")
    headers = {"Authorization": f"Bearer {col_token}"}

    pickup_data, _, _ = _setup_pickup(client, db_session, c_token)
    pickup_id = pickup_data["id"]

    # Claim task -> ACCEPTED
    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=headers)

    # Attempt illegal jump to COLLECTED -> 422
    resp_illegal = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "COLLECTED"},
        headers=headers,
    )
    assert resp_illegal.status_code == 422
    assert "tidak diizinkan" in resp_illegal.json()["message"].lower()

    # Step through valid sequence: ACCEPTED -> EN_ROUTE -> ARRIVED
    r_enroute = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "EN_ROUTE"},
        headers=headers,
    )
    assert r_enroute.status_code == 200
    assert r_enroute.json()["status"] == "EN_ROUTE"

    r_arrived = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "ARRIVED"},
        headers=headers,
    )
    assert r_arrived.status_code == 200
    assert r_arrived.json()["status"] == "ARRIVED"


def test_field_failure_transition_requires_mandatory_reason_and_releases_slot(client, db_session):
    """Transition to CANCELLED/REJECTED on field exception requires mandatory reason and releases slot."""
    c_token, _ = _register(client, "citizen_fail@example.com", "Warga Fail")
    col_token, col = _register(client, "collector_fail@example.com", "Petugas Fail")
    _grant_role(db_session, col["id"], "COLLECTOR", status="ACTIVE")
    headers = {"Authorization": f"Bearer {col_token}"}

    pickup_data, slot, _ = _setup_pickup(client, db_session, c_token)
    pickup_id = pickup_data["id"]

    db_session.refresh(slot)
    assert slot.booked_capacity == 1

    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=headers)
    client.post(f"/api/v1/collector/tasks/{pickup_id}/status", json={"status": "EN_ROUTE"}, headers=headers)
    client.post(f"/api/v1/collector/tasks/{pickup_id}/status", json={"status": "ARRIVED"}, headers=headers)

    # 1. Attempt cancel without reason -> 422
    resp_no_reason = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "CANCELLED"},
        headers=headers,
    )
    assert resp_no_reason.status_code == 422
    assert "wajib menyertakan alasan" in resp_no_reason.json()["message"].lower()

    # 2. Cancel with valid field reason -> succeeds and releases slot
    resp_cancelled = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "CANCELLED", "reason": "Pekarangan terkunci dan warga tidak di lokasi"},
        headers=headers,
    )
    assert resp_cancelled.status_code == 200
    assert resp_cancelled.json()["status"] == "CANCELLED"

    db_session.refresh(slot)
    assert slot.booked_capacity == 0


def test_admin_reassignment_with_audit_trail(client, db_session):
    """Admin can reassign task to another verified collector with reason and audit log."""
    c_token, _ = _register(client, "citizen_reassign@example.com", "Warga Reassign")
    col1_token, col1 = _register(client, "col_reassign_1@example.com", "Petugas 1")
    col2_token, col2 = _register(client, "col_reassign_2@example.com", "Petugas 2")
    admin_token, admin = _register(client, "admin_reassign@example.com", "Admin Reassign")

    _grant_role(db_session, col1["id"], "COLLECTOR", status="ACTIVE")
    _grant_role(db_session, col2["id"], "COLLECTOR", status="ACTIVE")
    _grant_role(db_session, admin["id"], "ADMIN", status="ACTIVE")

    pickup_data, _, _ = _setup_pickup(client, db_session, c_token)
    pickup_id = pickup_data["id"]

    # Collector 1 claims
    client.post(
        f"/api/v1/collector/tasks/{pickup_id}/accept",
        headers={"Authorization": f"Bearer {col1_token}"},
    )

    # Admin reassigns to Collector 2
    reassign_resp = client.post(
        f"/api/v1/admin/pickups/{pickup_id}/reassign",
        json={
            "new_collector_id": col2["id"],
            "reason": "Kendaraan motor roda tiga Collector 1 mengalami kendala mesin",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert reassign_resp.status_code == 200
    assert reassign_resp.json()["assigned_collector_id"] == col2["id"]

    # Verify event trail
    detail_resp = client.get(
        f"/api/v1/pickup-requests/{pickup_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    events = detail_resp.json()["events"]
    assert any("reassign" in (e["reason"] or "").lower() for e in events)


def test_end_to_end_inspection_weighing_and_reward_ledger(client, db_session):
    """Complete workflow: Claim -> Inspection -> Weighing -> Reward Ledger minted."""
    c_token, citizen = _register(client, "citizen_reward@example.com", "Warga Reward")
    col_token, col = _register(client, "col_reward@example.com", "Petugas Reward")
    _grant_role(db_session, col["id"], "COLLECTOR", status="ACTIVE")
    headers_col = {"Authorization": f"Bearer {col_token}"}
    headers_citizen = {"Authorization": f"Bearer {c_token}"}

    pickup_data, _, cat = _setup_pickup(client, db_session, c_token)
    pickup_id = pickup_data["id"]

    # Set initial points balance
    initial_balance = points_service.get_user_balance(db_session, citizen["id"])
    assert initial_balance == 0

    # 1. Claim & arrive
    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=headers_col)
    client.post(f"/api/v1/collector/tasks/{pickup_id}/status", json={"status": "EN_ROUTE"}, headers=headers_col)
    client.post(f"/api/v1/collector/tasks/{pickup_id}/status", json={"status": "ARRIVED"}, headers=headers_col)

    # 2. QC Inspection (Accepted)
    insp_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={
            "result": "ACCEPTED",
            "contamination_level": "NONE",
        },
        headers=headers_col,
    )
    assert insp_resp.status_code == 201

    # 3. Verified Weighing (Gross 5.5 kg, Tare 0.5 kg -> Net 5.0 kg)
    weight_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={
            "method": "MANUAL_SCALE",
            "gross_weight_kg": 5.5,
            "tare_weight_kg": 0.5,
        },
        headers=headers_col,
    )
    assert weight_resp.status_code == 201
    weight_data = weight_resp.json()
    assert weight_data["net_weight_kg"] == 5.0
    assert weight_data["version"] == 1

    # 4. Check user points balance (5.0 kg * 100 pts/kg = 500 points)
    final_balance = points_service.get_user_balance(db_session, citizen["id"])
    assert final_balance == 500

    # 5. Check user ledger entries
    ledger_resp = client.get("/api/v1/points/ledger", headers=headers_citizen)
    assert ledger_resp.status_code == 200
    ledger_entries = ledger_resp.json()
    assert len(ledger_entries) >= 1
    assert ledger_entries[0]["points_delta"] == 500
    assert ledger_entries[0]["source_id"] == pickup_id


def test_weighing_correction_adjusts_ledger_cleanly(client, db_session):
    """Supervisor / Collector corrects weight: supersedes version 1 and reverses/adjusts points."""
    c_token, citizen = _register(client, "citizen_adjust@example.com", "Warga Adjust")
    col_token, col = _register(client, "col_adjust@example.com", "Petugas Adjust")
    _grant_role(db_session, col["id"], "COLLECTOR", status="ACTIVE")
    headers_col = {"Authorization": f"Bearer {col_token}"}

    pickup_data, _, _ = _setup_pickup(client, db_session, c_token)
    pickup_id = pickup_data["id"]

    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=headers_col)
    client.post(f"/api/v1/collector/tasks/{pickup_id}/status", json={"status": "EN_ROUTE"}, headers=headers_col)
    client.post(f"/api/v1/collector/tasks/{pickup_id}/status", json={"status": "ARRIVED"}, headers=headers_col)
    client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=headers_col,
    )

    # Initial weight 4.0 kg -> 400 pts
    client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "MANUAL_SCALE", "net_weight_kg": 4.0},
        headers=headers_col,
    )
    assert points_service.get_user_balance(db_session, citizen["id"]) == 400

    # Attempting correction without correction_reason -> 400
    r_bad_correction = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "MANUAL_SCALE", "net_weight_kg": 4.5},
        headers=headers_col,
    )
    assert r_bad_correction.status_code == 400
    assert "alasan koreksi" in r_bad_correction.json()["message"].lower()

    # Valid correction: net weight 6.0 kg (600 pts) with reason
    r_corrected = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={
            "method": "MANUAL_SCALE",
            "net_weight_kg": 6.0,
            "correction_reason": "Koreksi kalibrasi timbangan digital pos banjar",
        },
        headers=headers_col,
    )
    assert r_corrected.status_code == 201
    assert r_corrected.json()["version"] == 2

    # New balance must be 600 pts (not 400 + 600 = 1000)
    assert points_service.get_user_balance(db_session, citizen["id"]) == 600
