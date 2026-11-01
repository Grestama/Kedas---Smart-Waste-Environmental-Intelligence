"""WasteLink Bali / Kedas — Community Destination Operating Agreement (CDOA) & Service Directory Tests."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account.models import Role, UserRole
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import ServiceAreaCreateRequest
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


def test_cdoa_lifecycle_and_service_directory(client, db_session):
    """Test full CDOA lifecycle: draft creation, approval, publishing, version superseding, and service directory."""
    # 1. Setup Admin and Banjar Leader
    admin_email = f"admin_cdoa_{uuid.uuid4().hex[:6]}@kedas.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin CDOA")
    admin_token = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    leader_email = f"prajuru_{uuid.uuid4().hex[:6]}@kedas.bali"
    leader_token, leader_user = _register(client, leader_email, "Prajuru Sanur Kauh")
    _grant_role(db_session, leader_user["id"], "COMMUNITY_LEADER")
    leader_headers = {"Authorization": f"Bearer {leader_token}"}

    # Citizen
    citizen_email = f"warga_{uuid.uuid4().hex[:6]}@kedas.bali"
    citizen_token, citizen_user = _register(client, citizen_email, "Warga Sanur")
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # 2. Setup Service Area & Category
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"sanur_kauh_{uuid.uuid4().hex[:4]}",
            name="Sanur Kauh Pilot Destination",
            administrative_area="Denpasar Selatan",
        ),
    )

    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"anorganik_botol_{uuid.uuid4().hex[:4]}",
            name="Botol Plastik PET",
            category_type="RECYCLABLE",
            description="Botol air mineral bersih",
        ),
    )

    # 3. Before CDOA: Check public service directory
    resp_dir_empty = client.get(f"/api/v1/community/service-directory/{area.id}")
    assert resp_dir_empty.status_code == 200
    dir_data = resp_dir_empty.json()
    assert dir_data["is_service_active"] is False
    assert "Belum ada Kesepakatan Operasional Destinasi (CDOA)" in dir_data["unavailability_reason"]

    # 4. Citizen attempts to draft CDOA -> 403 Forbidden
    resp_unauth = client.post(
        "/api/v1/community/cdoa",
        headers=citizen_headers,
        json={
            "service_area_id": area.id,
            "title": "Aturan Kebersihan Sanur",
            "accepted_category_ids": [cat.id],
            "pic_name": "Warga",
            "pic_contact": "0811111",
            "escalation_channel": "Kantor Desa",
        },
    )
    assert resp_unauth.status_code == 403

    # 5. Banjar Leader drafts CDOA V1
    resp_draft = client.post(
        "/api/v1/community/cdoa",
        headers=leader_headers,
        json={
            "service_area_id": area.id,
            "title": "Kesepakatan Operasional Kebersihan Sanur Kauh 2026",
            "accepted_category_ids": [cat.id],
            "capacity_limit_daily_kg": 750.0,
            "pic_name": "I Made Suardana",
            "pic_contact": "081234567890",
            "escalation_channel": "Kantor Banjar Sanur Kauh",
            "sla_hours": 12,
        },
    )
    assert resp_draft.status_code == 201
    cdoa1 = resp_draft.json()
    assert cdoa1["version"] == 1
    assert cdoa1["status"] == "DRAFT"
    assert cdoa1["capacity_limit_daily_kg"] == 750.0

    # 6. Cannot publish while DRAFT
    resp_pub_fail = client.post(
        f"/api/v1/community/cdoa/{cdoa1['id']}/publish",
        headers=leader_headers,
        json={"notes": "Langsung publish"},
    )
    assert resp_pub_fail.status_code == 422
    assert "APPROVED sebelum dipublikasikan" in resp_pub_fail.json()["message"]

    # 7. Approve CDOA V1
    resp_appr = client.post(
        f"/api/v1/community/cdoa/{cdoa1['id']}/approve",
        headers=leader_headers,
        json={"notes": "Disetujui dalam rapat banjar"},
    )
    assert resp_appr.status_code == 200
    assert resp_appr.json()["status"] == "APPROVED"
    assert resp_appr.json()["approved_by"] == leader_user["id"]

    # 8. Publish CDOA V1
    resp_pub = client.post(
        f"/api/v1/community/cdoa/{cdoa1['id']}/publish",
        headers=leader_headers,
        json={"notes": "Diberlakukan mulai hari ini"},
    )
    assert resp_pub.status_code == 200
    assert resp_pub.json()["status"] == "PUBLISHED"

    # 9. Verify Service Directory is now active
    resp_dir_active = client.get(f"/api/v1/community/service-directory/{area.id}")
    assert resp_dir_active.status_code == 200
    dir_active = resp_dir_active.json()
    assert dir_active["is_service_active"] is True
    assert dir_active["active_cdoa"]["id"] == cdoa1["id"]
    assert dir_active["daily_capacity_limit_kg"] == 750.0
    assert len(dir_active["accepted_categories"]) == 1
    assert dir_active["accepted_categories"][0]["id"] == cat.id

    # 10. Draft and Publish CDOA V2 to test superseding
    resp_draft2 = client.post(
        "/api/v1/community/cdoa",
        headers=admin_headers,
        json={
            "service_area_id": area.id,
            "title": "Kesepakatan Operasional Kebersihan Sanur Kauh 2026 (Revisi Kapasitas)",
            "accepted_category_ids": [cat.id],
            "capacity_limit_daily_kg": 1200.0,
            "pic_name": "I Made Suardana",
            "pic_contact": "081234567890",
            "escalation_channel": "Kantor Banjar Sanur Kauh",
            "sla_hours": 8,
        },
    )
    assert resp_draft2.status_code == 201
    cdoa2 = resp_draft2.json()
    assert cdoa2["version"] == 2

    # Approve & Publish V2
    client.post(f"/api/v1/community/cdoa/{cdoa2['id']}/approve", headers=admin_headers, json={})
    resp_pub2 = client.post(f"/api/v1/community/cdoa/{cdoa2['id']}/publish", headers=admin_headers, json={})
    assert resp_pub2.status_code == 200
    assert resp_pub2.json()["status"] == "PUBLISHED"

    # Check V1 is now SUPERSEDED
    resp_v1 = client.get(f"/api/v1/community/cdoa/{cdoa1['id']}")
    assert resp_v1.status_code == 200
    assert resp_v1.json()["status"] == "SUPERSEDED"
    assert resp_v1.json()["effective_until"] is not None

    # Service Directory reflects V2
    resp_dir_v2 = client.get(f"/api/v1/community/service-directory/{area.id}")
    assert resp_dir_v2.status_code == 200
    assert resp_dir_v2.json()["active_cdoa"]["version"] == 2
    assert resp_dir_v2.json()["daily_capacity_limit_kg"] == 1200.0

    # 11. List all CDOAs for area
    resp_list = client.get(f"/api/v1/community/banjar/{area.id}/cdoas")
    assert resp_list.status_code == 200
    assert len(resp_list.json()) == 2
