"""API tests for Waste Taxonomy and Safety Gating on Hazardous / Special Waste."""

from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import CollectionSlotCreateRequest, ServiceAreaCreateRequest
from app.modules.taxonomy import service as taxonomy_service


def _login(client, email, password):
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert resp.status_code == 200
    return resp.json()["session_token"]


def test_special_waste_safety_gating(client, db_session):
    """Special waste cannot be booked for normal pickup unless a verified route is explicitly confirmed."""
    # 1. Setup Admin, User, Area, Slot, Categories
    bootstrap_admin(
        email="admin_tax@wastelink.bali",
        password="admin_secret_123",
        full_name="Admin Taxonomy",
    )
    admin_token = _login(client, "admin_tax@wastelink.bali", "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Warga Peduli",
            "email": "warga_safe@example.com",
            "password": "password_123",
        },
    )
    user_token = _login(client, "warga_safe@example.com", "password_123")
    user_headers = {"Authorization": f"Bearer {user_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="AREA_TAX", name="Area Sanur Timur", administrative_area="Sanur"
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
    special_cat = next(c for c in cats if c.code == "SPECIAL")

    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah",
            "address_text": "Jl. Danau Poso No. 12",
            "service_area_id": area.id,
        },
        headers=user_headers,
    )
    addr_id = addr_resp.json()["id"]

    # 2. Try to book SPECIAL waste WITHOUT confirmed route -> MUST FAIL
    fail_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": special_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "notes": "Limbah baterai aki bekas",
        },
        headers=user_headers,
    )
    assert fail_resp.status_code == 422
    assert "limbah khusus belum memiliki jalur pengolahan" in fail_resp.json()["message"].lower()

    # 3. Admin explicitly confirms special route for this area and category
    rule_resp = client.post(
        "/api/v1/material-acceptance-rules",
        json={
            "category_id": special_cat.id,
            "service_area_id": area.id,
            "is_accepted": True,
            "special_route_confirmed": True,
            "notes": "Jalur B3 terverifikasi via mitra resmi PT Limbah Bali Lestari",
        },
        headers=admin_headers,
    )
    assert rule_resp.status_code == 201

    # 4. Now booking SPECIAL waste succeeds because safety condition is satisfied
    success_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": special_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "notes": "Limbah baterai aki bekas via rute khusus",
        },
        headers=user_headers,
    )
    assert success_resp.status_code == 201
    assert success_resp.json()["status"] == "PENDING_ASSIGNMENT"
