"""API Tests for WastePoints Rule Versioning, Idempotency, and Append-Only Ledger."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.modules.collection import service as collection_service
from app.modules.collection.schemas import CollectionSlotCreateRequest, ServiceAreaCreateRequest
from app.modules.taxonomy import service as taxonomy_service


def _register(client, email, name):
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": "password_123"},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def _setup_collector(client, admin_token, email, name):
    token, user = _register(client, email, name)
    c_headers = {"Authorization": f"Bearer {token}"}
    client.post(
        "/api/v1/collector-applications",
        json={
            "phone_number": "081234567892",
            "vehicle_type": "TRUCK",
            "vehicle_plate_number": "DK 9999 PT",
            "service_area_ids": [],
            "notes": "Siap timbang poin",
        },
        headers=c_headers,
    )
    a_headers = {"Authorization": f"Bearer {admin_token}"}
    apps = client.get("/api/v1/admin/collector-applications", headers=a_headers).json()
    my_app = [a for a in apps if a["user_id"] == user["id"]][0]
    client.post(
        f"/api/v1/admin/collector-applications/{my_app['id']}/review",
        json={"approved": True, "notes": "Approved for testing"},
        headers=a_headers,
    )
    return token, user


def test_points_ledger_idempotency_and_balance(client, db_session):
    taxonomy_service.seed_default_categories(db_session)
    from app.cli.bootstrap_admin import bootstrap_admin

    bootstrap_admin(email="admin_pts@bali.id", password="admin_pass123", full_name="Admin Points")
    login_resp = client.post(
        "/api/v1/auth/login", json={"identifier": "admin_pts@bali.id", "password": "admin_pass123"}
    )
    admin_token = login_resp.json()["session_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    collector_token, collector = _setup_collector(
        client, admin_token, "petugas_pts@bali.id", "Gede Points"
    )
    col_headers = {"Authorization": f"Bearer {collector_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(code="PTS_AREA", name="Area Poin", administrative_area="Denpasar"),
    )
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(hours=1),
            end_time=datetime.now(UTC) + timedelta(hours=3),
            max_capacity=5,
        ),
    )
    cats = client.get("/api/v1/waste-categories").json()
    cat = [c for c in cats if c["code"] == "RECYCLABLE"][0]

    # Create explicit reward rule: 150 points per kg
    rule_resp = client.post(
        "/api/v1/admin/points/rules",
        json={"category_id": cat["id"], "points_per_kg": 150, "minimum_weight_kg": 0.5},
        headers=admin_headers,
    )
    assert rule_resp.status_code == 201

    user_token, user = _register(client, "warga_pts@bali.id", "Kadek Points")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Poin No. 1", "service_area_id": area.id},
        headers=user_headers,
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 4.0,
        },
        headers=user_headers,
    )
    pickup_id = pickup_resp.json()["id"]

    # Initial balance must be 0
    bal_0 = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_0["current_balance"] == 0

    # Collector moves through QC to weighing: 4.0 kg @ 150 pts/kg = 600 points
    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=col_headers)
    client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "ARRIVED", "reason": "Tiba"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=col_headers,
    )
    wt_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "DIRECT_NET", "net_weight_kg": 4.0},
        headers=col_headers,
    )
    assert wt_resp.status_code == 201

    # Check balance: 4.0 * 150 = 600 points
    bal_1 = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_1["current_balance"] == 600

    # Ledger check: exactly 1 posted entry of 600
    ledger_1 = client.get("/api/v1/points/ledger", headers=user_headers).json()
    assert len(ledger_1) == 1
    assert ledger_1[0]["points_delta"] == 600
    assert ledger_1[0]["entry_type"] == "EARNED_PICKUP"

    # Now simulate weight correction: 4.0 kg was actually 3.0 kg (3.0 * 150 = 450 points)
    # The system must reverse the 600 and issue 450 -> Net balance = 450
    corr_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={
            "method": "DIRECT_NET",
            "net_weight_kg": 3.0,
            "correction_reason": "Salah input berat bruto di awal",
        },
        headers=col_headers,
    )
    assert corr_resp.status_code == 201

    bal_2 = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_2["current_balance"] == 450

    ledger_2 = client.get("/api/v1/points/ledger", headers=user_headers).json()
    # Ledger must contain:
    # 1. New EARNED_PICKUP (v2) = +450
    # 2. REVERSAL (v1) = -600
    # 3. Original EARNED_PICKUP (v1) = +600 (marked REVERSED)
    assert len(ledger_2) == 3
    deltas = [e["points_delta"] for e in ledger_2]
    assert 450 in deltas
    assert -600 in deltas

    # Admin Point Adjustment: Add 100 points with idempotency
    adj_resp = client.post(
        "/api/v1/admin/points/adjust",
        json={
            "user_id": user["id"],
            "points_delta": 100,
            "reason": "Bonus partisipasi bersih lingkungan desa",
            "idempotency_key": "IDEMP-BONUS-001",
        },
        headers=admin_headers,
    )
    assert adj_resp.status_code == 201
    assert adj_resp.json()["points_delta"] == 100

    # Retry same idempotency key + same payload -> MUST RETURN SAME RESULT (NO DOUBLE CREDIT)
    retry_adj = client.post(
        "/api/v1/admin/points/adjust",
        json={
            "user_id": user["id"],
            "points_delta": 100,
            "reason": "Bonus partisipasi bersih lingkungan desa",
            "idempotency_key": "IDEMP-BONUS-001",
        },
        headers=admin_headers,
    )
    assert retry_adj.status_code == 201

    bal_3 = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_3["current_balance"] == 550  # 450 + 100

    # Same idempotency key + DIFFERENT payload -> MUST FAIL 409 CONFLICT
    conflict_adj = client.post(
        "/api/v1/admin/points/adjust",
        json={
            "user_id": user["id"],
            "points_delta": 500,  # different payload
            "reason": "Bonus berbeda",
            "idempotency_key": "IDEMP-BONUS-001",
        },
        headers=admin_headers,
    )
    assert conflict_adj.status_code == 409

    # Negative balance safeguard: attempting to deduct 10,000 points must fail with 400
    over_deduct = client.post(
        "/api/v1/admin/points/adjust",
        json={
            "user_id": user["id"],
            "points_delta": -10000,
            "reason": "Penalti berlebihan",
            "idempotency_key": "IDEMP-PENALTY-001",
        },
        headers=admin_headers,
    )
    assert over_deduct.status_code == 400
