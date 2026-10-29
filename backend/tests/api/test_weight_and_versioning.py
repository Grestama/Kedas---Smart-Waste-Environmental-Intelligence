"""API Tests for Weight Verification, Versioning, and Gross/Tare Math."""

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
            "phone_number": "081234567891",
            "vehicle_type": "TRUCK",
            "vehicle_plate_number": "DK 8888 WT",
            "service_area_ids": [],
            "notes": "Siap timbang",
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


def test_weight_math_and_versioning(client, db_session):
    taxonomy_service.seed_default_categories(db_session)
    from app.cli.bootstrap_admin import bootstrap_admin

    bootstrap_admin(email="admin_wt@bali.id", password="admin_pass123", full_name="Admin Weight")
    login_resp = client.post(
        "/api/v1/auth/login", json={"identifier": "admin_wt@bali.id", "password": "admin_pass123"}
    )
    admin_token = login_resp.json()["session_token"]

    collector_token, collector = _setup_collector(
        client, admin_token, "petugas_wt@bali.id", "Ketut Weight"
    )
    col_headers = {"Authorization": f"Bearer {collector_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="WT_AREA", name="Area Timbangan", administrative_area="Denpasar"
        ),
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

    user_token, user = _register(client, "warga_wt@bali.id", "Nyoman Warga")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Timbang No. 1", "service_area_id": area.id},
        headers=user_headers,
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 10.0,
        },
        headers=user_headers,
    )
    pickup_id = pickup_resp.json()["id"]

    # Claim & move to ARRIVED
    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=col_headers)
    client.patch(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "ARRIVED", "reason": "Tiba di lokasi"},
        headers=col_headers,
    )

    # 1. Attempt weighing before inspection -> MUST FAIL with 400
    premature_wt = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 12.5, "tare_weight_kg": 2.0},
        headers=col_headers,
    )
    assert premature_wt.status_code == 400

    # 2. Complete inspection
    client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=col_headers,
    )

    # 3. Tare > Gross MUST FAIL with 400
    invalid_math = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 5.0, "tare_weight_kg": 8.0},
        headers=col_headers,
    )
    assert invalid_math.status_code == 400

    # 4. Valid initial weight record: Gross 12.5 - Tare 2.5 = Net 10.0
    first_wt = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 12.5, "tare_weight_kg": 2.5},
        headers=col_headers,
    )
    assert first_wt.status_code == 201
    w1_data = first_wt.json()
    assert w1_data["version"] == 1
    assert w1_data["net_weight_kg"] == 10.0
    assert w1_data["verification_status"] == "VERIFIED"

    # 5. Subsequent correction without correction reason MUST FAIL with 400
    missing_reason = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "DIRECT_NET", "net_weight_kg": 9.5},
        headers=col_headers,
    )
    assert missing_reason.status_code == 400

    # 6. Valid weight correction with reason -> Version 2 created, version 1 superseded
    second_wt = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={
            "method": "DIRECT_NET",
            "net_weight_kg": 9.5,
            "correction_reason": "Koreksi setelah kalibrasi ulang timbangan pos",
        },
        headers=col_headers,
    )
    assert second_wt.status_code == 201
    w2_data = second_wt.json()
    assert w2_data["version"] == 2
    assert w2_data["net_weight_kg"] == 9.5
    assert w2_data["supersedes_id"] == w1_data["id"]

    # 7. List weights: both versions present
    history = client.get(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        headers=user_headers,
    ).json()
    assert len(history) == 2
    assert history[0]["verification_status"] == "SUPERSEDED"
    assert history[1]["verification_status"] == "VERIFIED"
