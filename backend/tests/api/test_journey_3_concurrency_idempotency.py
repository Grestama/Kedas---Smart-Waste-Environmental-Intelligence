"""Journey 3 — Concurrency, Contention & Idempotency Acceptance Test.

Verifies:
1. Slot capacity saturation & conflict:
   - When a slot reaches max_capacity, subsequent booking requests are rejected with 409 Conflict.
2. Collector task claim contention:
   - When two collectors attempt to claim the same pending pickup, only the first succeeds (200 OK),
     and the competing request is rejected with 409 Conflict.
3. Material batch double-assignment conflict:
   - An already batched pickup cannot be batched a second time; returns 409 Conflict.
4. Idempotency & state machine conflict:
   - Attempting to cancel a pickup that has already been cancelled returns 409 Conflict.
"""

from __future__ import annotations

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


def _approve_collector(client, admin_headers, collector_token, user_id):
    col_headers = {"Authorization": f"Bearer {collector_token}"}
    client.post(
        "/api/v1/collector-applications",
        json={
            "phone_number": f"0813{user_id[:6]}",
            "vehicle_type": "MOTORCYCLE_CART",
            "vehicle_plate_number": "DK 3333 CC",
            "service_area_ids": [],
            "notes": "Siap bertugas",
        },
        headers=col_headers,
    )
    apps = client.get("/api/v1/admin/collector-applications", headers=admin_headers).json()
    app = [a for a in apps if a["user_id"] == user_id][0]
    client.post(
        f"/api/v1/admin/collector-applications/{app['id']}/review",
        json={"approved": True, "notes": "Approved for concurrency test"},
        headers=admin_headers,
    )


def test_journey_3_concurrency_contention_and_idempotency(client, db_session):
    # Setup Taxonomy & Admin
    taxonomy_service.seed_default_categories(db_session)
    bootstrap_admin(email="admin_j3@bali.id", password="admin_secret_123", full_name="Admin J3")
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin_j3@bali.id", "password": "admin_secret_123"},
    )
    admin_token = admin_login.json()["session_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Setup Service Area and Slot with EXACT CAPACITY = 1
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="J3_AREA", name="Banjar J3 Contention", administrative_area="Badung"
        ),
    )
    slot_capacity_1 = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(hours=2),
            end_time=datetime.now(UTC) + timedelta(hours=4),
            max_capacity=1,  # Strictly only 1 pickup allowed!
        ),
    )
    cat = client.get("/api/v1/waste-categories").json()[0]

    # Register Citizen 1 and Citizen 2
    token_w1, user_w1 = _register(client, "warga_c1@bali.id", "Warga Satu")
    token_w2, user_w2 = _register(client, "warga_c2@bali.id", "Warga Dua")
    headers_w1 = {"Authorization": f"Bearer {token_w1}"}
    headers_w2 = {"Authorization": f"Bearer {token_w2}"}

    addr_w1 = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah C1", "address_text": "Gang 1 No. 1", "service_area_id": area.id},
        headers=headers_w1,
    ).json()["id"]

    addr_w2 = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah C2", "address_text": "Gang 2 No. 2", "service_area_id": area.id},
        headers=headers_w2,
    ).json()["id"]

    # --- 1. Slot Saturation & Contention Test ---
    # Citizen 1 books the only available spot
    booking_1 = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_w1,
            "slot_id": slot_capacity_1.id,
            "estimated_weight_kg": 5.0,
            "notes": "Setoran pertama",
        },
        headers=headers_w1,
    )
    assert booking_1.status_code == 201
    pickup_1_id = booking_1.json()["id"]

    # Citizen 2 attempts to book the same exhausted slot -> 409 Conflict
    booking_2 = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_w2,
            "slot_id": slot_capacity_1.id,
            "estimated_weight_kg": 3.0,
            "notes": "Setoran yang terlambat slot",
        },
        headers=headers_w2,
    )
    assert booking_2.status_code == 409
    assert "penuh" in booking_2.json()["message"].lower()

    # --- 2. Collector Task Claim Contention Test ---
    # Register and approve two collectors: Collector Alpha and Collector Beta
    token_col_a, user_col_a = _register(client, "petugas_alpha@bali.id", "Petugas Alpha")
    token_col_b, user_col_b = _register(client, "petugas_beta@bali.id", "Petugas Beta")
    _approve_collector(client, admin_headers, token_col_a, user_col_a["id"])
    _approve_collector(client, admin_headers, token_col_b, user_col_b["id"])
    headers_col_a = {"Authorization": f"Bearer {token_col_a}"}
    headers_col_b = {"Authorization": f"Bearer {token_col_b}"}

    # Collector Alpha claims pickup 1 -> 200 OK
    claim_a = client.post(f"/api/v1/collector/tasks/{pickup_1_id}/accept", headers=headers_col_a)
    assert claim_a.status_code == 200
    assert claim_a.json()["status"] == "ACCEPTED"

    # Collector Beta attempts to claim the same pickup -> 409 Conflict
    claim_b = client.post(f"/api/v1/collector/tasks/{pickup_1_id}/accept", headers=headers_col_b)
    assert claim_b.status_code == 409
    assert "sudah diambil" in claim_b.json()["message"].lower()

    # --- 3. Double Batching Prevention Test ---
    # Advance pickup 1 through inspection and weighing to COMPLETED
    client.post(
        f"/api/v1/collector/tasks/{pickup_1_id}/status",
        json={"status": "EN_ROUTE", "reason": "Jalan"},
        headers=headers_col_a,
    )
    client.post(
        f"/api/v1/collector/tasks/{pickup_1_id}/status",
        json={"status": "ARRIVED", "reason": "Sampai"},
        headers=headers_col_a,
    )
    client.post(
        f"/api/v1/pickup-requests/{pickup_1_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=headers_col_a,
    )
    client.post(
        f"/api/v1/pickup-requests/{pickup_1_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 6.0, "tare_weight_kg": 1.0},
        headers=headers_col_a,
    )

    # First Batch includes pickup_1_id -> 201 Created
    batch_1 = client.post(
        "/api/v1/admin/batches",
        json={"category_id": cat["id"], "pickup_ids": [pickup_1_id]},
        headers=headers_col_a,
    )
    assert batch_1.status_code == 201

    # Second Batch attempts to include pickup_1_id again -> 409 Conflict
    batch_2 = client.post(
        "/api/v1/admin/batches",
        json={"category_id": cat["id"], "pickup_ids": [pickup_1_id]},
        headers=headers_col_a,
    )
    assert batch_2.status_code == 409
    assert "telah terdaftar dalam batch" in batch_2.json()["message"]

    # --- 4. State Machine Conflict / Idempotent Cancel Test ---
    # Create another pickup to test cancellation conflict
    slot_2 = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(hours=5),
            end_time=datetime.now(UTC) + timedelta(hours=7),
            max_capacity=5,
        ),
    )
    pickup_to_cancel = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_w1,
            "slot_id": slot_2.id,
            "estimated_weight_kg": 2.0,
            "notes": "Akan dibatalkan",
        },
        headers=headers_w1,
    ).json()["id"]

    # First cancellation succeeds
    cancel_1 = client.post(
        f"/api/v1/pickup-requests/{pickup_to_cancel}/cancel",
        json={"reason": "Berubah pikiran"},
        headers=headers_w1,
    )
    assert cancel_1.status_code == 200
    assert cancel_1.json()["status"] == "CANCELLED"

    # Second cancellation on already CANCELLED pickup -> 409 Conflict
    cancel_2 = client.post(
        f"/api/v1/pickup-requests/{pickup_to_cancel}/cancel",
        json={"reason": "Mencoba membatalkan lagi"},
        headers=headers_w1,
    )
    assert cancel_2.status_code == 409
    assert "tidak dapat dibatalkan" in cancel_2.json()["message"]
