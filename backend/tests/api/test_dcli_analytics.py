"""Kedas — Destination Clean Loop Index (DCLI) Analytics Tests."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account import service as account_service
from app.modules.account.models import Role, UserRole
from app.modules.account.schemas import AddressCreateRequest
from app.modules.collection import service as collection_service
from app.modules.collection.models import PickupRequest, PickupStatus
from app.modules.collection.schemas import CollectionSlotCreateRequest, ServiceAreaCreateRequest
from app.modules.taxonomy import service as taxonomy_service
from app.modules.taxonomy.schemas import WasteCategoryCreateRequest


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


def _grant_role(db, user_id: str, role_code: str, status: str = "ACTIVE"):
    role = db.query(Role).filter_by(code=role_code).first()
    if not role:
        role = Role(code=role_code, name=role_code, description=role_code)
        db.add(role)
        db.commit()
    user_role = UserRole(
        user_id=user_id,
        role_id=role.id,
        verification_status=status,
        granted_at=datetime.now(UTC),
    )
    db.add(user_role)
    db.commit()


def test_dcli_insufficient_data_guardrail(client, db_session):
    """Ensure DCLI never generates greenwash scores when operational coverage is below threshold."""
    # 1. Non-existent area
    resp = client.get(f"/api/v1/community/banjar/{uuid.uuid4()}/dcli")
    assert resp.status_code == 404

    # 2. Setup Admin and Service Area
    admin_email = f"admin_dcli_{uuid.uuid4().hex[:6]}@kedas.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin DCLI")

    code_area = f"UBD-DCLI-{uuid.uuid4().hex[:4].upper()}"
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=code_area,
            name="Banjar Tebesaya Pilot DCLI",
            administrative_area="Ubud, Gianyar",
            is_active=True,
        ),
    )

    # 3. Query DCLI with 0 pickups -> INSUFFICIENT_DATA
    resp = client.get(f"/api/v1/community/banjar/{area.id}/dcli")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "INSUFFICIENT_DATA"
    assert data["overall_score"] is None
    assert data["minimum_coverage_reached"] is False
    assert data["confidence_level"] == "LOW"
    assert data["total_pickups_analyzed"] == 0
    assert "eksperimental" in data["disclaimer"].lower()
    assert len(data["subscores"]) == 5
    for sub in data["subscores"]:
        assert sub["score"] is None


def test_dcli_evaluated_scoring_with_adequate_coverage(client, db_session):
    """Ensure DCLI calculates balanced weighted scores when minimum operational cycles exist."""
    admin_email = f"admin_eval_{uuid.uuid4().hex[:6]}@kedas.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin DCLI Eval")

    # 1. Create Area, Category, Slot, and User with Address
    code_area = f"SNG-DCLI-{uuid.uuid4().hex[:4].upper()}"
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=code_area,
            name="Banjar Sanur Kauh DCLI",
            administrative_area="Sanur, Denpasar Selatan",
            is_active=True,
        ),
    )

    cat_code = f"REC-DCLI-{uuid.uuid4().hex[:4].upper()}"
    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=cat_code,
            name="Anorganik DCLI",
            category_type="RECYCLABLE",
            handling_instructions="Bersih dan kering.",
        ),
    )

    now = datetime.now(UTC)
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=3),
            max_capacity=50,
        ),
    )

    citizen_email = f"warga_dcli_{uuid.uuid4().hex[:6]}@kedas.bali"
    _, citizen_user = _register(client, citizen_email, "Warga Sanur DCLI")

    addr = account_service.create_user_address(
        db_session,
        citizen_user["id"],
        AddressCreateRequest(
            label="Rumah Sanur",
            address_text="Jl. Danau Tamblingan No. 10, Sanur Kauh",
            service_area_id=area.id,
            is_default=True,
        ),
    )

    # 2. Insert 3 Completed Pickup Requests directly
    for i in range(3):
        p = PickupRequest(
            public_code=f"KDS-DCLI-{uuid.uuid4().hex[:6].upper()}",
            reporter_user_id=citizen_user["id"],
            service_area_id=area.id,
            category_id=cat.id,
            address_id=addr.id,
            slot_id=slot.id,
            status=PickupStatus.COMPLETED.value,
            estimated_weight_kg=10.0 + i,
            actual_weight_kg=10.5 + i,
            completed_at=datetime.now(UTC),
        )
        db_session.add(p)
    db_session.commit()

    # 3. Query DCLI -> should be EVALUATED
    resp = client.get(f"/api/v1/community/banjar/{area.id}/dcli")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "EVALUATED"
    assert data["minimum_coverage_reached"] is True
    assert data["overall_score"] is not None
    assert data["overall_score"] >= 80.0
    assert data["total_pickups_analyzed"] == 3
    assert data["total_weight_kg_analyzed"] > 30.0
    assert "eksperimental" in data["disclaimer"].lower()

    # Check that all 5 subscores are evaluated
    assert len(data["subscores"]) == 5
    for sub in data["subscores"]:
        assert sub["score"] is not None
        assert sub["score"] > 0
