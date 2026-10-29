"""API Tests for Circular Marketplace, Material Batching, Delivery, and End-to-End Flow."""

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
            "phone_number": "081234567899",
            "vehicle_type": "TRUCK",
            "vehicle_plate_number": "DK 1111 E2E",
            "service_area_ids": [],
            "notes": "Siap E2E",
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


def test_marketplace_batching_and_e2e_lifecycle(client, db_session):
    taxonomy_service.seed_default_categories(db_session)
    from app.cli.bootstrap_admin import bootstrap_admin

    bootstrap_admin(email="admin_e2e@bali.id", password="admin_pass123", full_name="Admin E2E")
    login_resp = client.post(
        "/api/v1/auth/login", json={"identifier": "admin_e2e@bali.id", "password": "admin_pass123"}
    )
    admin_token = login_resp.json()["session_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    collector_token, collector = _setup_collector(
        client, admin_token, "petugas_e2e@bali.id", "Collector E2E"
    )
    col_headers = {"Authorization": f"Bearer {collector_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="E2E_MKT", name="Area Marketplace", administrative_area="Denpasar"
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

    # 1. Register Citizen & Submit Pickup
    user_token, user = _register(client, "warga_e2e@bali.id", "Warga E2E")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Sirkular No. 1", "service_area_id": area.id},
        headers=user_headers,
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 25.0,
        },
        headers=user_headers,
    )
    pickup_id = pickup_resp.json()["id"]

    # 2. Collector claims task and arrives
    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=col_headers)
    client.patch(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "ARRIVED", "reason": "Tiba di lokasi warga"},
        headers=col_headers,
    )

    # 3. Collector records inspection (QC)
    insp_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=col_headers,
    )
    assert insp_resp.status_code == 201

    # 4. Collector records verified weight (Gross 28.0 - Tare 3.0 = Net 25.0 kg)
    wt_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 28.0, "tare_weight_kg": 3.0},
        headers=col_headers,
    )
    assert wt_resp.status_code == 201

    # 5. Verify citizen earned WastePoints
    bal_resp = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_resp["current_balance"] == 2500  # 25 kg * 100 default points/kg

    # 6. Register a circular partner
    partner_resp = client.post(
        "/api/v1/admin/partners",
        json={
            "name": "PT Bali Daur Ulang Mandiri",
            "contact_email": "mitra@balidaurulang.com",
            "contact_phone": "081298765432",
            "address": "Kawasan Industri Pedungan, Denpasar",
        },
        headers=admin_headers,
    )
    assert partner_resp.status_code == 201
    partner_id = partner_resp.json()["id"]

    # 7. Operator aggregates completed pickup into Material Batch
    batch_resp = client.post(
        "/api/v1/admin/batches",
        json={"category_id": cat["id"], "pickup_ids": [pickup_id]},
        headers=col_headers,
    )
    assert batch_resp.status_code == 201
    batch_data = batch_resp.json()
    assert batch_data["total_weight_kg"] == 25.0
    assert batch_data["status"] == "BATCHED"
    batch_id = batch_data["id"]

    # 8. Attempting to batch the same pickup again MUST FAIL with 409 Conflict
    dup_batch = client.post(
        "/api/v1/admin/batches",
        json={"category_id": cat["id"], "pickup_ids": [pickup_id]},
        headers=col_headers,
    )
    assert dup_batch.status_code == 409

    # 9. Dispatch delivery of batch to partner: 25.0 kg
    delivery_resp = client.post(
        "/api/v1/admin/deliveries",
        json={"batch_id": batch_id, "partner_id": partner_id, "dispatched_weight_kg": 25.0},
        headers=col_headers,
    )
    assert delivery_resp.status_code == 201
    delivery_id = delivery_resp.json()["id"]
    assert delivery_resp.json()["status"] == "DISPATCHED"

    # 10. Partner receives 24.2 kg (discrepancy of -0.8 kg) -> System records DISPUTED
    receipt_resp = client.post(
        f"/api/v1/admin/deliveries/{delivery_id}/receipt",
        json={"received_weight_kg": 24.2, "notes": "Ada susut kelembaban 0.8 kg"},
        headers=col_headers,
    )
    assert receipt_resp.status_code == 200
    rec_data = receipt_resp.json()
    assert rec_data["status"] == "DISPUTED"
    assert rec_data["weight_discrepancy_kg"] == -0.8
