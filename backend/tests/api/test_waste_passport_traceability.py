"""WasteLink Bali / Kedas — Kedas Waste Passport & Source-to-Facility Traceability Tests."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account import service as account_service
from app.modules.account.schemas import AddressCreateRequest
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    ServiceAreaCreateRequest,
)
from app.modules.taxonomy import service as taxonomy_service
from app.modules.taxonomy.schemas import (
    MaterialAcceptanceRuleCreateRequest,
    WasteCategoryCreateRequest,
)


def _login(client, email: str, password: str = "password_123") -> str:  # noqa: S107
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["session_token"]


def _register(client, email: str, full_name: str) -> tuple[str, dict]:
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": full_name, "password": "password_123"},
    )
    assert resp.status_code == 201, f"Register failed: {resp.text}"
    return resp.json()["session_token"], resp.json()["user"]


def test_kedas_waste_passport_lifecycle_and_security(client, db_session):
    """Test public safe-to-share QR scan, authenticated detail access, and anti-PII protection."""
    # 1. Setup Admin
    admin_email = f"admin_passport_{uuid.uuid4().hex[:6]}@kedas.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin Passport")

    # 2. Setup Citizen A (Requester) & Citizen B (Unrelated Stranger)
    user_a_email = f"citizen_a_{uuid.uuid4().hex[:6]}@kedas.bali"
    token_a, user_a = _register(client, user_a_email, "Ni Luh Ketut")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    user_b_email = f"citizen_b_{uuid.uuid4().hex[:6]}@kedas.bali"
    token_b, _ = _register(client, user_b_email, "I Wayan Stranger")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Setup Service Area, Address, Category & Slot
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"kuta_seminyak_{uuid.uuid4().hex[:4]}",
            name="Seminyak Green Tourism Zone",
            administrative_area="Kuta, Badung",
        ),
    )

    addr = account_service.create_user_address(
        db_session,
        user_a["id"],
        AddressCreateRequest(
            label="Villa Bintang",
            address_text="Jl. Kayu Aya No. 45, Seminyak (Private Home)",
            service_area_id=area.id,
            is_default=True,
        ),
    )

    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"kardus_box_{uuid.uuid4().hex[:4]}",
            name="Kardus & Paper Packaging",
            category_type="RECYCLABLE",
        ),
    )

    taxonomy_service.configure_acceptance_rule(
        db_session,
        MaterialAcceptanceRuleCreateRequest(
            category_id=cat.id,
            service_area_id=area.id,
            is_accepted=True,
        ),
    )

    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(days=1),
            end_time=datetime.now(UTC) + timedelta(days=1, hours=3),
            max_capacity=10,
        ),
    )

    # 4. Create Pickup Request (generates Kedas Waste Passport)
    resp_create = client.post(
        "/api/v1/pickup-requests",
        headers=headers_a,
        json={
            "address_id": addr.id,
            "category_id": cat.id,
            "slot_id": slot.id,
            "estimated_weight_kg": 15.5,
            "notes": "Paket kardus rapi di teras villa",
        },
    )
    assert resp_create.status_code == 201
    pickup_data = resp_create.json()
    public_code = pickup_data["public_code"]
    pickup_id = pickup_data["id"]

    # 5. Public QR Scan (No Auth Required)
    resp_qr = client.get(f"/api/v1/pickup-requests/passport/public/{public_code}")
    assert resp_qr.status_code == 200
    qr_data = resp_qr.json()

    # Verify Safe-to-Share fields
    assert qr_data["passport_no"] == public_code
    assert qr_data["category_name"] == "Kardus & Paper Packaging"
    assert qr_data["service_area_name"] == "Seminyak Green Tourism Zone"
    assert qr_data["status"] == "PENDING_ASSIGNMENT"
    assert len(qr_data["timeline"]) >= 1

    # Security & PII Protection: NO resident private info exposed
    assert "user_a" not in str(qr_data)
    assert user_a["full_name"] not in str(qr_data)
    assert "Jl. Kayu Aya No. 45" not in str(qr_data)
    assert "Private Home" not in str(qr_data)
    assert "Ni Luh Ketut" not in str(qr_data)

    # 6. Case-Insensitive Public Lookup
    resp_qr_lower = client.get(f"/api/v1/pickup-requests/passport/public/{public_code.lower()}")
    assert resp_qr_lower.status_code == 200
    assert resp_qr_lower.json()["passport_no"] == public_code

    # 7. Non-existent code returns 404
    resp_not_found = client.get("/api/v1/pickup-requests/passport/public/NON_EXISTENT_PASSPORT_999")
    assert resp_not_found.status_code == 404

    # 8. Authenticated Detail View (Owner A can access)
    resp_detail_a = client.get(f"/api/v1/pickup-requests/{pickup_id}/passport", headers=headers_a)
    assert resp_detail_a.status_code == 200
    detail_data = resp_detail_a.json()
    assert detail_data["address_label"] == "Villa Bintang"

    # 9. Anti-IDOR Protection: Citizen B (unrelated stranger) CANNOT access authenticated detail
    resp_detail_b = client.get(f"/api/v1/pickup-requests/{pickup_id}/passport", headers=headers_b)
    assert resp_detail_b.status_code == 403
