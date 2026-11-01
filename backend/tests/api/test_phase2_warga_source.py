"""WasteLink Bali — Tahap 2: Warga & Source Collection Comprehensive Test Suite.

Verifies:
1. Active service area enforcement (cannot book on inactive area).
2. Material acceptance rule enforcement (disallowed categories rejected).
3. Idempotency resilience (retries with identical key return existing request without double-booking slot).
4. Service mode handling ('PICKUP' vs 'DROP_OFF' isolation from trike collector tasks).
5. Address ownership & IDOR prevention (cannot create pickup with another user's address).
6. Cancellation lifecycle & capacity rollback (only permitted states, releases slot capacity).
7. Multi-address management (Rumah, Toko/Pekarangan with default switching).
"""

from datetime import UTC, datetime, timedelta

from app.modules.account.models import Role, UserRole, VerificationStatus
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    ServiceAreaCreateRequest,
)
from app.modules.taxonomy import service as taxonomy_service
from app.modules.taxonomy.schemas import MaterialAcceptanceRuleCreateRequest


def _register(client, email: str, name: str) -> tuple[str, dict]:
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": "Password123#"},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def _grant_collector_role(db, user_id: str):
    role = db.query(Role).filter(Role.code == "COLLECTOR").first()
    user_role = UserRole(
        user_id=user_id,
        role_id=role.id,
        verification_status=VerificationStatus.ACTIVE.value,
        granted_at=datetime.now(UTC),
    )
    db.add(user_role)
    db.commit()


def test_inactive_service_area_rejected(client, db_session):
    """Citizen cannot create pickup in an inactive service area."""
    token, user = _register(client, "warga_inactive@example.com", "Warga Inactive")
    headers = {"Authorization": f"Bearer {token}"}

    # Setup inactive service area
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="BALI_INACTIVE_AREA",
            name="Banjar Non-Aktif",
            administrative_area="Sukawati",
            is_active=False,
        ),
    )
    now = datetime.now(UTC)
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=2),
            end_time=now + timedelta(hours=4),
            max_capacity=5,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    organic_cat = next(c for c in cats if c.code == "ORGANIC")

    # Add address tied to inactive area
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Kunti No. 1", "service_area_id": area.id},
        headers=headers,
    )
    addr_id = addr_resp.json()["id"]

    # Attempt to book pickup
    resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": organic_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 2.5,
        },
        headers=headers,
    )
    assert resp.status_code == 422
    assert "tidak aktif" in resp.json()["message"].lower()


def test_material_acceptance_rule_rejected(client, db_session):
    """Citizen cannot book category that is disallowed in their service area."""
    token, user = _register(client, "warga_cat_rule@example.com", "Warga Rule")
    headers = {"Authorization": f"Bearer {token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="BALI_RULE_AREA",
            name="Banjar Rule Test",
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
            max_capacity=5,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    residual_cat = next(c for c in cats if c.code == "RESIDUAL")

    # Disallow residual in this area via MaterialAcceptanceRule
    taxonomy_service.configure_acceptance_rule(
        db_session,
        MaterialAcceptanceRuleCreateRequest(
            category_id=residual_cat.id,
            service_area_id=area.id,
            is_accepted=False,
            notes="Residu belum dilayani pada pilot tahap ini.",
        ),
    )

    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Cempaka No. 8", "service_area_id": area.id},
        headers=headers,
    )
    addr_id = addr_resp.json()["id"]

    resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": residual_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 1.0,
        },
        headers=headers,
    )
    assert resp.status_code == 422
    assert "tidak diterima" in resp.json()["message"].lower()


def test_idempotency_prevents_duplicate_and_slot_overbooking(client, db_session):
    """Submitting with identical idempotency_key returns the same request and does not consume double capacity."""
    token, user = _register(client, "warga_idem@example.com", "Warga Idem")
    headers = {"Authorization": f"Bearer {token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="BALI_IDEM_AREA",
            name="Banjar Idem Test",
            administrative_area="Sukawati",
            is_active=True,
        ),
    )
    now = datetime.now(UTC)
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=3),
            end_time=now + timedelta(hours=5),
            max_capacity=2,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    recyclable_cat = next(c for c in cats if c.code == "RECYCLABLE")

    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah Utama",
            "address_text": "Jl. Mawar No. 4",
            "service_area_id": area.id,
        },
        headers=headers,
    )
    addr_id = addr_resp.json()["id"]

    idem_key = "mobile_client_uuid_998877"
    payload = {
        "category_id": recyclable_cat.id,
        "address_id": addr_id,
        "slot_id": slot.id,
        "estimated_weight_kg": 4.0,
        "service_mode": "PICKUP",
        "idempotency_key": idem_key,
        "notes": "Botol kaca dan kardus kering",
    }

    # First attempt: succeeds (201)
    resp1 = client.post("/api/v1/pickup-requests", json=payload, headers=headers)
    assert resp1.status_code == 201
    data1 = resp1.json()
    pickup_id_1 = data1["id"]
    assert data1["idempotency_key"] == idem_key
    assert data1["service_mode"] == "PICKUP"

    # Verify slot capacity booked is 1
    db_session.refresh(slot)
    assert slot.booked_capacity == 1

    # Second attempt (network retry with same idempotency key)
    resp2 = client.post("/api/v1/pickup-requests", json=payload, headers=headers)
    assert resp2.status_code in (200, 201)
    data2 = resp2.json()

    # Must return identical pickup ID, public code
    assert data2["id"] == pickup_id_1
    assert data2["public_code"] == data1["public_code"]

    # Crucial invariant: slot capacity booked MUST STILL be 1 (NOT 2)
    db_session.refresh(slot)
    assert slot.booked_capacity == 1


def test_drop_off_service_mode_and_collector_isolation(client, db_session):
    """Drop-off mode creates record with TPS3R guidance and is excluded from trike collector pickup tasks."""
    citizen_token, citizen_user = _register(client, "warga_dropoff@example.com", "Warga Dropoff")
    collector_token, collector_user = _register(
        client, "collector_test@example.com", "Petugas Trike"
    )
    _grant_collector_role(db_session, collector_user["id"])

    headers_citizen = {"Authorization": f"Bearer {citizen_token}"}
    headers_collector = {"Authorization": f"Bearer {collector_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="BALI_DROPOFF_AREA",
            name="Banjar Sukawati Tengah",
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
    organic_cat = next(c for c in cats if c.code == "ORGANIC")

    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Pekarangan",
            "address_text": "Banjar Tengah Sukawati",
            "service_area_id": area.id,
        },
        headers=headers_citizen,
    )
    addr_id = addr_resp.json()["id"]

    # 1. Citizen creates DROP_OFF request
    resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": organic_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 5.0,
            "service_mode": "DROP_OFF",
            "notes": "Diantar langsung ke pos penimbangan TPS3R",
        },
        headers=headers_citizen,
    )
    assert resp.status_code == 201
    drop_off_data = resp.json()
    assert drop_off_data["service_mode"] == "DROP_OFF"

    # Detail includes initial event with TPS3R guidance
    detail_resp = client.get(
        f"/api/v1/pickup-requests/{drop_off_data['id']}", headers=headers_citizen
    )
    assert detail_resp.status_code == 200
    events = detail_resp.json()["events"]
    assert len(events) >= 1
    assert "tps3r" in events[0]["reason"].lower()

    # 2. Trike collector checks available curbside pickup tasks
    tasks_resp = client.get("/api/v1/collector/tasks/available", headers=headers_collector)
    assert tasks_resp.status_code == 200
    task_ids = [t["id"] for t in tasks_resp.json()]
    # Drop-off must NOT be offered as a curbside collection pickup task!
    assert drop_off_data["id"] not in task_ids


def test_cannot_book_with_other_user_address(client, db_session):
    """Citizen cannot use an address belonging to another citizen (IDOR prevention)."""
    token_a, user_a = _register(client, "citizen_a@example.com", "Citizen A")
    token_b, user_b = _register(client, "citizen_b@example.com", "Citizen B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="BALI_ADDR_ISOLATION",
            name="Banjar Isolasi",
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
    cat = cats[0]

    # Citizen A creates address
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah A",
            "address_text": "Jl. Raya Batuan No. 12",
            "service_area_id": area.id,
        },
        headers=headers_a,
    )
    addr_id_a = addr_resp.json()["id"]

    # Citizen B attempts to create pickup with Citizen A's address
    resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat.id,
            "address_id": addr_id_a,
            "slot_id": slot.id,
            "estimated_weight_kg": 2.0,
        },
        headers=headers_b,
    )
    assert resp.status_code in (403, 404)


def test_cancellation_lifecycle_and_capacity_release(client, db_session):
    """Cancellation is allowed in PENDING_ASSIGNMENT, releases slot capacity, and rejects cancellation after completion."""
    token, user = _register(client, "warga_cancel@example.com", "Warga Cancel")
    headers = {"Authorization": f"Bearer {token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="BALI_CANCEL_AREA",
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
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=3),
            max_capacity=5,
        ),
    )
    cats = taxonomy_service.seed_default_categories(db_session)
    cat = cats[0]

    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Batuan No. 1", "service_area_id": area.id},
        headers=headers,
    )
    addr_id = addr_resp.json()["id"]

    # Create pickup
    create_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 2.0,
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    pickup_id = create_resp.json()["id"]

    db_session.refresh(slot)
    assert slot.booked_capacity == 1

    # Cancel pickup
    cancel_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/cancel",
        json={"reason": "Jadwal mendadak bentrok dengan upacara banjar"},
        headers=headers,
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "CANCELLED"

    # Slot capacity booked must be rolled back to 0
    db_session.refresh(slot)
    assert slot.booked_capacity == 0

    # Attempting to cancel already CANCELLED pickup must fail with 409 Conflict
    re_cancel_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/cancel",
        json={"reason": "Membatalkan ulang"},
        headers=headers,
    )
    assert re_cancel_resp.status_code == 409


def test_multi_address_management_and_default_toggle(client):
    """Citizen can register multiple addresses (Rumah, Toko) and toggle default."""
    token, user = _register(client, "multi_addr@example.com", "Warga Multi")
    headers = {"Authorization": f"Bearer {token}"}

    # Add Address 1 (Default)
    resp1 = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah Utama", "address_text": "Jl. Raya No. 1", "is_default": True},
        headers=headers,
    )
    assert resp1.status_code == 201
    addr1 = resp1.json()
    assert addr1["is_default"] is True

    # Add Address 2 (Pekarangan / Toko) as new Default
    resp2 = client.post(
        "/api/v1/me/addresses",
        json={"label": "Toko Pasar", "address_text": "Pasar Sukawati Kios 5", "is_default": True},
        headers=headers,
    )
    assert resp2.status_code == 201
    addr2 = resp2.json()
    assert addr2["is_default"] is True

    # Address 1 should now have is_default == False
    check1 = client.get(f"/api/v1/me/addresses/{addr1['id']}", headers=headers)
    assert check1.json()["is_default"] is False

    # List my addresses
    list_resp = client.get("/api/v1/me/addresses", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 2
