"""API tests for Concurrency, Capacity Bounds, and State Machine Transition Integrity."""

from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    ServiceAreaCreateRequest,
)
from app.modules.taxonomy import service as taxonomy_service


def _register_user(client, email, name, password="password_123"):  # noqa: S107
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": password},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def _login(client, email, password):
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert resp.status_code == 200
    return resp.json()["session_token"]


def test_slot_capacity_overbooking_prevention(client, db_session):
    """When slot capacity is 1, second booking receives 409 Conflict and capacity is not exceeded."""
    token_1, user_1 = _register_user(client, "user_book1@example.com", "Booker 1")
    token_2, user_2 = _register_user(client, "user_book2@example.com", "Booker 2")

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="RACE_AREA", name="Area Race", administrative_area="Denpasar"
        ),
    )
    now = datetime.now(UTC)
    # Slot with MAX CAPACITY = 1
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=3),
            max_capacity=1,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    recyclable_cat = next(c for c in cats if c.code == "RECYCLABLE")

    # Both users create addresses in this service area
    addr_1 = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah 1",
            "address_text": "Jl. Tukad Balian No. 1",
            "service_area_id": area.id,
        },
        headers={"Authorization": f"Bearer {token_1}"},
    ).json()["id"]

    addr_2 = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah 2",
            "address_text": "Jl. Tukad Balian No. 2",
            "service_area_id": area.id,
        },
        headers={"Authorization": f"Bearer {token_2}"},
    ).json()["id"]

    # 1. First user books the only slot -> SUCCEEDS
    resp1 = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": recyclable_cat.id,
            "address_id": addr_1,
            "slot_id": slot.id,
            "estimated_weight_kg": 2.0,
        },
        headers={"Authorization": f"Bearer {token_1}"},
    )
    assert resp1.status_code == 201

    # 2. Second user attempts to book the same slot -> MUST CONFLICT (Slot Full)
    resp2 = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": recyclable_cat.id,
            "address_id": addr_2,
            "slot_id": slot.id,
            "estimated_weight_kg": 1.5,
        },
        headers={"Authorization": f"Bearer {token_2}"},
    )
    assert resp2.status_code == 409
    assert "sudah penuh" in resp2.json()["message"].lower()


def test_atomic_task_claim_double_claim_conflict(client, db_session):
    """When two collectors try to accept the same pending task, only one succeeds and the other gets 409 Conflict."""
    bootstrap_admin(
        email="admin_race@wastelink.bali",
        password="admin_secret_123",
        full_name="Admin Race",
    )
    admin_token = _login(client, "admin_race@wastelink.bali", "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Setup User and Pickup
    user_token, user = _register_user(client, "warga_task@example.com", "Warga Task")
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="TASK_AREA", name="Area Task", administrative_area="Denpasar"
        ),
    )
    now = datetime.now(UTC)
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=3),
            max_capacity=5,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    organic_cat = next(c for c in cats if c.code == "ORGANIC")

    addr_id = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah",
            "address_text": "Jl. Hayam Wuruk No. 8",
            "service_area_id": area.id,
        },
        headers={"Authorization": f"Bearer {user_token}"},
    ).json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={"category_id": organic_cat.id, "address_id": addr_id, "slot_id": slot.id},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    pickup_id = pickup_resp.json()["id"]

    # Setup Collector 1 and Collector 2
    col1_token, col1_user = _register_user(client, "col1@example.com", "Collector Satu")
    col2_token, col2_user = _register_user(client, "col2@example.com", "Collector Dua")

    for col_tok in [col1_token, col2_token]:
        app_id = client.post(
            "/api/v1/collector-applications",
            json={"vehicle_type": "Motor Roda 3"},
            headers={"Authorization": f"Bearer {col_tok}"},
        ).json()["id"]
        client.post(
            f"/api/v1/admin/collector-applications/{app_id}/review",
            json={"approved": True},
            headers=admin_headers,
        )

    # 1. Collector 1 accepts task -> SUCCEEDS
    claim1 = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/accept",
        headers={"Authorization": f"Bearer {col1_token}"},
    )
    assert claim1.status_code == 200
    assert claim1.json()["assigned_collector_id"] == col1_user["id"]
    assert claim1.json()["status"] == "ACCEPTED"

    # 2. Collector 2 attempts to accept the already-accepted task -> MUST FAIL WITH 409
    claim2 = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/accept",
        headers={"Authorization": f"Bearer {col2_token}"},
    )
    assert claim2.status_code == 409
    assert "sudah diambil" in claim2.json()["message"].lower()


def test_end_to_end_pickup_state_machine_flow(client, db_session):
    """Happy path: User creates pickup -> Collector accepts -> EN_ROUTE -> ARRIVED -> INSPECTION -> audit events verified."""
    # 1. Admin
    bootstrap_admin(
        email="admin_e2e@wastelink.bali",
        password="admin_secret_123",
        full_name="Admin E2E",
    )
    admin_token = _login(client, "admin_e2e@wastelink.bali", "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Collector candidate approved
    col_token, col_user = _register_user(client, "col_e2e@example.com", "Petugas Wayan")
    app_id = client.post(
        "/api/v1/collector-applications",
        json={"vehicle_type": "Gerobak Motor"},
        headers={"Authorization": f"Bearer {col_token}"},
    ).json()["id"]
    client.post(
        f"/api/v1/admin/collector-applications/{app_id}/review",
        json={"approved": True},
        headers=admin_headers,
    )

    # 3. User creates pickup
    user_token, user = _register_user(client, "user_e2e@example.com", "Made Warga")
    user_headers = {"Authorization": f"Bearer {user_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="E2E_AREA", name="Banjar Tegal", administrative_area="Denpasar"
        ),
    )
    now = datetime.now(UTC)
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=3),
            max_capacity=10,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    recyclable_cat = next(c for c in cats if c.code == "RECYCLABLE")

    addr_id = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Sudirman No. 15", "service_area_id": area.id},
        headers=user_headers,
    ).json()["id"]

    pickup = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": recyclable_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 5.0,
        },
        headers=user_headers,
    ).json()
    pickup_id = pickup["id"]
    assert pickup["status"] == "PENDING_ASSIGNMENT"

    # 4. Collector claims task
    col_headers = {"Authorization": f"Bearer {col_token}"}
    accept_resp = client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=col_headers)
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "ACCEPTED"

    # 5. Illegal jump test: ACCEPTED -> COMPLETED is forbidden by state machine
    illegal_resp = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "COMPLETED"},
        headers=col_headers,
    )
    assert illegal_resp.status_code == 422
    assert "tidak diizinkan" in illegal_resp.json()["message"].lower()

    # 6. Valid progression: ACCEPTED -> EN_ROUTE -> ARRIVED -> INSPECTION
    step1 = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "EN_ROUTE", "reason": "Menuju lokasi penjemputan"},
        headers=col_headers,
    )
    assert step1.status_code == 200
    assert step1.json()["status"] == "EN_ROUTE"

    step2 = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "ARRIVED", "reason": "Sudah sampai di depan rumah warga"},
        headers=col_headers,
    )
    assert step2.status_code == 200
    assert step2.json()["status"] == "ARRIVED"

    step3 = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "INSPECTION", "reason": "Mulai pemeriksaan kualitas sampah"},
        headers=col_headers,
    )
    assert step3.status_code == 200
    assert step3.json()["status"] == "INSPECTION"

    # 7. Verify status events history audit trail
    detail = client.get(f"/api/v1/pickup-requests/{pickup_id}", headers=user_headers).json()
    assert detail["status"] == "INSPECTION"
    events = detail["events"]
    assert len(events) >= 4
    to_statuses = [e["to_status"] for e in events]
    assert "PENDING_ASSIGNMENT" in to_statuses
    assert "ACCEPTED" in to_statuses
    assert "EN_ROUTE" in to_statuses
    assert "ARRIVED" in to_statuses
    assert "INSPECTION" in to_statuses
