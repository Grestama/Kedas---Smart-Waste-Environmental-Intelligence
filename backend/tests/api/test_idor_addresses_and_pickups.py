"""API tests for IDOR prevention on addresses and pickup requests."""

from datetime import UTC, datetime, timedelta

from app.modules.collection import service as collection_service
from app.modules.collection.schemas import CollectionSlotCreateRequest, ServiceAreaCreateRequest
from app.modules.taxonomy import service as taxonomy_service


def _register_user(client, email, name):
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": "password_123"},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def test_address_idor_protection(client):
    """User B cannot view, update, or delete User A's address."""
    token_a, user_a = _register_user(client, "usera@example.com", "User A")
    token_b, user_b = _register_user(client, "userb@example.com", "User B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. User A creates address
    create_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah A", "address_text": "Jl. Danau Tamblingan No. 10"},
        headers=headers_a,
    )
    assert create_resp.status_code == 201
    addr_id = create_resp.json()["id"]

    # 2. User B attempts to read User A's address
    get_resp = client.get(f"/api/v1/me/addresses/{addr_id}", headers=headers_b)
    assert get_resp.status_code in (403, 404)

    # 3. User B attempts to update User A's address
    patch_resp = client.patch(
        f"/api/v1/me/addresses/{addr_id}",
        json={"label": "Hacked Label"},
        headers=headers_b,
    )
    assert patch_resp.status_code in (403, 404)

    # 4. User B attempts to delete User A's address
    del_resp = client.delete(f"/api/v1/me/addresses/{addr_id}", headers=headers_b)
    assert del_resp.status_code in (403, 404)

    # 5. Verify User A's address is untouched
    verify_resp = client.get(f"/api/v1/me/addresses/{addr_id}", headers=headers_a)
    assert verify_resp.status_code == 200
    assert verify_resp.json()["label"] == "Rumah A"


def test_pickup_idor_protection(client, db_session):
    """User B cannot view or cancel User A's pickup request."""
    token_a, user_a = _register_user(client, "pickup_a@example.com", "User A")
    token_b, user_b = _register_user(client, "pickup_b@example.com", "User B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Setup area, slot, category
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(code="IDOR_AREA", name="Area IDOR", administrative_area="Sanur"),
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

    # User A creates address with service_area_id
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah Sanur",
            "address_text": "Jl. Hang Tuah No. 5",
            "service_area_id": area.id,
        },
        headers=headers_a,
    )
    addr_id = addr_resp.json()["id"]

    # User A creates pickup
    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": organic_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 3.5,
            "notes": "Sampah dapur terpilah",
        },
        headers=headers_a,
    )
    assert pickup_resp.status_code == 201
    pickup_id = pickup_resp.json()["id"]

    # User B tries to view User A's pickup detail -> 403 Forbidden
    detail_resp = client.get(f"/api/v1/pickup-requests/{pickup_id}", headers=headers_b)
    assert detail_resp.status_code == 403

    # User B tries to cancel User A's pickup -> 403 Forbidden
    cancel_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/cancel",
        json={"reason": "Iseng membatalkan milik orang lain"},
        headers=headers_b,
    )
    assert cancel_resp.status_code == 403
