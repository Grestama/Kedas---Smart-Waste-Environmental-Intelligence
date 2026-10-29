"""Journey 1 — Full Happy Path Acceptance Test.

Covers complete circular lifecycle:
Citizen Registration -> Admin Provisioning & Collector Approval -> Pickup Creation
-> Collector Claim & Status -> Inspection QC -> Verified Weighing -> Reward Evaluation
-> WastePoints Ledger -> Material Batching -> Delivery to Partner -> Receipt Confirmation
-> Admin Operational Report Consistency.
"""

from __future__ import annotations

import io
from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
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


def test_journey_1_full_circular_lifecycle(client, db_session):
    # 1. Setup Taxonomy & Admin
    taxonomy_service.seed_default_categories(db_session)
    bootstrap_admin(email="admin_j1@bali.id", password="admin_secret_123", full_name="Admin J1")

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin_j1@bali.id", "password": "admin_secret_123"},
    )
    admin_token = login_resp.json()["session_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register Collector & Admin Approves Application
    col_token, col_user = _register(client, "petugas_j1@bali.id", "Wayan Petugas J1")
    col_headers = {"Authorization": f"Bearer {col_token}"}

    client.post(
        "/api/v1/collector-applications",
        json={
            "phone_number": "081234567800",
            "vehicle_type": "MOTORCYCLE_CART",
            "vehicle_plate_number": "DK 1111 J1",
            "service_area_ids": [],
            "notes": "Siap bertugas di Banjar",
        },
        headers=col_headers,
    )
    apps = client.get("/api/v1/admin/collector-applications", headers=admin_headers).json()
    my_app = [a for a in apps if a["user_id"] == col_user["id"]][0]
    client.post(
        f"/api/v1/admin/collector-applications/{my_app['id']}/review",
        json={"approved": True, "notes": "Approved for active service"},
        headers=admin_headers,
    )

    # 3. Create Service Area & Available Slot
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="J1_AREA", name="Banjar Kaja J1", administrative_area="Denpasar"
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

    # Configure Reward Rule: 100 points / kg
    client.post(
        "/api/v1/admin/points/rules",
        json={"category_id": cat["id"], "points_per_kg": 100, "minimum_weight_kg": 0.5},
        headers=admin_headers,
    )

    # 4. Citizen Registers & Submits Pickup Request
    user_token, user = _register(client, "warga_j1@bali.id", "Made Warga J1")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Banjar No. 1", "service_area_id": area.id},
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
            "notes": "Sampah botol plastik & kardus bersih",
        },
        headers=user_headers,
    )
    assert pickup_resp.status_code == 201
    pickup_id = pickup_resp.json()["id"]
    assert pickup_resp.json()["status"] == "PENDING_ASSIGNMENT"

    # 5. Collector Views Available Tasks & Accepts
    tasks = client.get("/api/v1/collector/tasks/available", headers=col_headers).json()
    assert any(t["id"] == pickup_id for t in tasks)

    accept_resp = client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=col_headers)
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "ACCEPTED"

    # 6. State Machine Transitions & Upload Evidence
    client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "EN_ROUTE", "reason": "Menuju banjar"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "ARRIVED", "reason": "Sampai di rumah warga"},
        headers=col_headers,
    )

    # Upload Photo Evidence
    fake_photo = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00")
    evd_resp = client.post(
        "/api/v1/evidence/upload",
        files={"file": ("foto_setoran.jpg", fake_photo, "image/jpeg")},
        data={"entity_type": "PICKUP", "entity_id": pickup_id},
        headers=col_headers,
    )
    assert evd_resp.status_code == 201

    # QC Inspection
    insp_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=col_headers,
    )
    assert insp_resp.status_code == 201

    # Verified Weight: Gross 12.0 - Tare 2.0 = Net 10.0 kg
    wt_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 12.0, "tare_weight_kg": 2.0},
        headers=col_headers,
    )
    assert wt_resp.status_code == 201
    assert wt_resp.json()["net_weight_kg"] == 10.0

    # 7. Verify Reward Points Evaluation (10 kg * 100 = 1000 points)
    bal_resp = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_resp["current_balance"] == 1000

    ledger_resp = client.get("/api/v1/points/ledger", headers=user_headers).json()
    assert len(ledger_resp) == 1
    assert ledger_resp[0]["points_delta"] == 1000

    # 8. Circular Marketplace: Create Partner, Batch, Dispatch, Receipt
    partner_resp = client.post(
        "/api/v1/admin/partners",
        json={
            "name": "PT Daur Ulang Bali Lestari",
            "contact_email": "mitra_j1@daurulang.id",
            "contact_phone": "081299998888",
            "address": "Denpasar Selatan",
        },
        headers=admin_headers,
    )
    partner_id = partner_resp.json()["id"]

    batch_resp = client.post(
        "/api/v1/admin/batches",
        json={"category_id": cat["id"], "pickup_ids": [pickup_id]},
        headers=col_headers,
    )
    assert batch_resp.status_code == 201
    batch_id = batch_resp.json()["id"]

    delivery_resp = client.post(
        "/api/v1/admin/deliveries",
        json={"batch_id": batch_id, "partner_id": partner_id, "dispatched_weight_kg": 10.0},
        headers=col_headers,
    )
    delivery_id = delivery_resp.json()["id"]

    receipt_resp = client.post(
        f"/api/v1/admin/deliveries/{delivery_id}/receipt",
        json={"received_weight_kg": 10.0, "notes": "Kondisi sesuai manifest"},
        headers=col_headers,
    )
    assert receipt_resp.status_code == 200
    assert receipt_resp.json()["status"] == "DELIVERED"
    assert receipt_resp.json()["weight_discrepancy_kg"] == 0.0

    # 9. Verify Admin Operational Report Consistency
    report_resp = client.get("/api/v1/admin/reports/summary", headers=admin_headers).json()
    assert report_resp["total_pickups"] >= 1
    assert report_resp["pickups_completed"] >= 1
    assert report_resp["total_verified_weight_kg"] == 10.0
    assert report_resp["total_dispatched_weight_kg"] == 10.0
    assert report_resp["total_received_weight_kg"] == 10.0
    assert report_resp["total_weight_discrepancy_kg"] == 0.0
    assert report_resp["total_points_issued"] >= 1000
