"""WasteLink Bali / Kedas — Facility Intelligence & Service Eligibility Engine Tests."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account import service as account_service
from app.modules.account.models import Role, UserRole
from app.modules.account.schemas import AddressCreateRequest
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import CollectionSlotCreateRequest, ServiceAreaCreateRequest
from app.modules.community import service as community_service
from app.modules.community.schemas import CDOACreateRequest
from app.modules.facility import service as facility_service
from app.modules.facility.schemas import FacilityCreateRequest
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


def test_service_eligibility_engine_scenarios(client, db_session):
    """Test deterministic service eligibility engine with CDOA, facility intelligence, and capacity constraints."""
    # 1. Setup Admin
    admin_email = f"admin_elig_{uuid.uuid4().hex[:6]}@kedas.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin Elig")
    _login(client, admin_email, "admin_secret_123")

    # 2. Setup Citizen
    citizen_email = f"warga_elig_{uuid.uuid4().hex[:6]}@kedas.bali"
    citizen_token, citizen_user = _register(client, citizen_email, "Warga Ubud")
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # 3. Setup Service Area
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"ubud_central_{uuid.uuid4().hex[:4]}",
            name="Ubud Central Destination",
            administrative_area="Ubud, Gianyar",
        ),
    )

    # 4. Setup Citizen Address in this area
    addr = account_service.create_user_address(
        db_session,
        citizen_user["id"],
        AddressCreateRequest(
            label="Rumah Utama",
            address_text="Jl. Monkey Forest No. 88, Ubud, Gianyar",
            service_area_id=area.id,
            is_default=True,
        ),
    )

    # 5. Setup Categories
    cat_organic = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"organik_daun_{uuid.uuid4().hex[:4]}",
            name="Sampah Organik Dapur & Daun",
            category_type="ORGANIC",
        ),
    )
    cat_plastic = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"plastik_pet_{uuid.uuid4().hex[:4]}",
            name="Plastik Botol PET",
            category_type="RECYCLABLE",
        ),
    )

    # Acceptance rule
    taxonomy_service.configure_acceptance_rule(
        db_session,
        MaterialAcceptanceRuleCreateRequest(
            category_id=cat_organic.id,
            service_area_id=area.id,
            is_accepted=True,
        ),
    )
    taxonomy_service.configure_acceptance_rule(
        db_session,
        MaterialAcceptanceRuleCreateRequest(
            category_id=cat_plastic.id,
            service_area_id=area.id,
            is_accepted=True,
        ),
    )

    # 6. Setup Facility in area
    facility = facility_service.create_facility(
        db_session,
        FacilityCreateRequest(
            code=f"TPS3R_UBUD_{uuid.uuid4().hex[:4]}",
            name="TPS3R Ubud Kompos Lestari",
            facility_type="TPS3R",
            service_area_id=area.id,
            address="Jl. Raya Ubud No. 1",
            capacity_kg_per_day=1500.0,
            is_active=True,
        ),
        actor_id=admin_email,
    )

    # 7. Setup Slot
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(days=1),
            end_time=datetime.now(UTC) + timedelta(days=1, hours=2),
            max_capacity=5,
        ),
    )

    # 8. Check Eligibility: Before CDOA is published -> CDOA is not active, but baseline area is active
    resp_elig1 = client.post(
        "/api/v1/pickup-requests/eligibility",
        headers=citizen_headers,
        json={
            "address_id": addr.id,
            "category_id": cat_organic.id,
            "slot_id": slot.id,
        },
    )
    assert resp_elig1.status_code == 200
    assert resp_elig1.json()["is_eligible"] is True
    assert resp_elig1.json()["reason_code"] == "ELIGIBLE"

    # 9. Now Create & Publish CDOA that ONLY accepts Organic (cat_organic) and routes to facility
    cdoa = community_service.create_cdoa_draft(
        db_session,
        CDOACreateRequest(
            service_area_id=area.id,
            title="CDOA Ubud Kompos 2026",
            accepted_category_ids=[cat_organic.id],
            primary_facility_id=facility.id,
            capacity_limit_daily_kg=1000.0,
            pic_name="I Wayan Ubud",
            pic_contact="0812345678",
            escalation_channel="Balai Banjar Ubud",
        ),
        actor_id=admin_email,
    )
    community_service.approve_cdoa(db_session, cdoa.id, actor_id=admin_email)
    community_service.publish_cdoa(db_session, cdoa.id, actor_id=admin_email)

    # 10. Check Eligibility for Organic -> Should be ELIGIBLE
    resp_elig_organic = client.post(
        "/api/v1/pickup-requests/eligibility",
        headers=citizen_headers,
        json={
            "address_id": addr.id,
            "category_id": cat_organic.id,
            "slot_id": slot.id,
        },
    )
    assert resp_elig_organic.status_code == 200
    data_org = resp_elig_organic.json()
    assert data_org["is_eligible"] is True
    assert data_org["primary_facility_name"] == facility.name
    assert data_org["cdoa_agreement_no"] == cdoa.agreement_no

    # 11. Check Eligibility for Plastic -> Should be INELIGIBLE (CDOA_CATEGORY_EXCLUDED)
    resp_elig_plastic = client.post(
        "/api/v1/pickup-requests/eligibility",
        headers=citizen_headers,
        json={
            "address_id": addr.id,
            "category_id": cat_plastic.id,
            "slot_id": slot.id,
        },
    )
    assert resp_elig_plastic.status_code == 200
    data_plastic = resp_elig_plastic.json()
    assert data_plastic["is_eligible"] is False
    assert data_plastic["reason_code"] == "CDOA_CATEGORY_EXCLUDED"

    # 12. Deactivate Facility -> Check Organic -> Should be INELIGIBLE (FACILITY_PAUSED)
    facility.is_active = False
    db_session.commit()

    resp_elig_paused = client.post(
        "/api/v1/pickup-requests/eligibility",
        headers=citizen_headers,
        json={
            "address_id": addr.id,
            "category_id": cat_organic.id,
            "slot_id": slot.id,
        },
    )
    assert resp_elig_paused.status_code == 200
    assert resp_elig_paused.json()["is_eligible"] is False
    assert resp_elig_paused.json()["reason_code"] == "FACILITY_PAUSED"

    # 13. Reactivate Facility & fill slot capacity -> Should be INELIGIBLE (SLOT_FULL)
    facility.is_active = True
    slot.booked_capacity = slot.max_capacity
    db_session.commit()

    resp_elig_full = client.post(
        "/api/v1/pickup-requests/eligibility",
        headers=citizen_headers,
        json={
            "address_id": addr.id,
            "category_id": cat_organic.id,
            "slot_id": slot.id,
        },
    )
    assert resp_elig_full.status_code == 200
    assert resp_elig_full.json()["is_eligible"] is False
    assert resp_elig_full.json()["reason_code"] == "SLOT_FULL"
