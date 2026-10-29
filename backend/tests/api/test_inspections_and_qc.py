"""API Tests for Inspection QC and Quality Control State Machine."""

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
            "phone_number": "081234567890",
            "vehicle_type": "MOTORCYCLE_CART",
            "vehicle_plate_number": "DK 5555 QC",
            "service_area_ids": [],
            "notes": "Siap QC",
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


def test_inspection_qc_lifecycle_and_validation(client, db_session):
    taxonomy_service.seed_default_categories(db_session)
    from app.cli.bootstrap_admin import bootstrap_admin

    bootstrap_admin(email="admin_qc@bali.id", password="admin_pass123", full_name="Admin QC")
    login_resp = client.post(
        "/api/v1/auth/login", json={"identifier": "admin_qc@bali.id", "password": "admin_pass123"}
    )
    admin_token = login_resp.json()["session_token"]

    collector_token, collector = _setup_collector(
        client, admin_token, "petugas_qc@bali.id", "Wayan Petugas"
    )
    col_headers = {"Authorization": f"Bearer {collector_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="QC_AREA", name="Area QC Banjar", administrative_area="Denpasar"
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

    user_token, user = _register(client, "warga_qc@bali.id", "Made Warga")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. QC No. 1", "service_area_id": area.id},
        headers=user_headers,
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 5.0,
        },
        headers=user_headers,
    )
    pickup_id = pickup_resp.json()["id"]

    # 1. Collector accepts task
    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=col_headers)

    # 2. Cannot inspect while status is still SCHEDULED/ASSIGNED (before arriving/in-transit)
    # Move to EN_ROUTE
    client.patch(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "EN_ROUTE", "reason": "Menuju lokasi"},
        headers=col_headers,
    )

    # 3. REJECTED without reason code or notes must fail with 400
    fail_reject = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={"result": "REJECTED"},
        headers=col_headers,
    )
    assert fail_reject.status_code == 400

    # 4. PARTIALLY_ACCEPTED without separating weights must fail with 400
    fail_partial = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={"result": "PARTIALLY_ACCEPTED"},
        headers=col_headers,
    )
    assert fail_partial.status_code == 400

    # 5. Successful inspection: ACCEPTED_WITH_CONTAMINATION
    ok_insp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={
            "result": "ACCEPTED_WITH_CONTAMINATION",
            "contamination_level": "LOW",
            "rejection_notes": "Ada sedikit label stiker kertas, masih layak daur ulang.",
        },
        headers=col_headers,
    )
    assert ok_insp.status_code == 201
    assert ok_insp.json()["result"] == "ACCEPTED_WITH_CONTAMINATION"
    assert ok_insp.json()["contamination_level"] == "LOW"

    # 6. Verify inspection history is accessible
    history_resp = client.get(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        headers=user_headers,
    )
    assert history_resp.status_code == 200
    assert len(history_resp.json()) == 1
