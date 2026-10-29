"""API Tests for Evidence Media Storage, MIME Validation, and Access Isolation."""

from __future__ import annotations

import io
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


def test_evidence_storage_and_security(client, db_session):
    taxonomy_service.seed_default_categories(db_session)

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="EVD_AREA", name="Area Bukti", administrative_area="Denpasar"
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

    token_a, user_a = _register(client, "user_evd_a@bali.id", "User A")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    token_b, user_b = _register(client, "user_evd_b@bali.id", "User B")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah", "address_text": "Jl. Bukti No. 1", "service_area_id": area.id},
        headers=headers_a,
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 3.0,
        },
        headers=headers_a,
    )
    pickup_id = pickup_resp.json()["id"]

    # 1. Disallowed MIME type / executable upload MUST FAIL with 400
    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
    bad_upload = client.post(
        "/api/v1/evidence/upload",
        files={"file": ("malware.exe", fake_exe, "application/x-msdownload")},
        data={"entity_type": "PICKUP", "entity_id": pickup_id},
        headers=headers_a,
    )
    assert bad_upload.status_code == 400

    # 2. Valid image upload: image/jpeg
    valid_jpg = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00")
    good_upload = client.post(
        "/api/v1/evidence/upload",
        files={"file": ("sampah_plastik.jpg", valid_jpg, "image/jpeg")},
        data={"entity_type": "PICKUP", "entity_id": pickup_id},
        headers=headers_a,
    )
    assert good_upload.status_code == 201
    evd_data = good_upload.json()
    assert evd_data["mime_type"] == "image/jpeg"
    assert evd_data["storage_key"].startswith("evidence/pickup/")
    assert not evd_data["storage_key"].endswith("sampah_plastik.jpg")  # Randomized key

    evd_id = evd_data["id"]

    # 3. Owner (User A) can download
    dl_resp = client.get(f"/api/v1/evidence/{evd_id}/download", headers=headers_a)
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "image/jpeg"

    # 4. Another unauthorized user (User B) attempting to download -> MUST FAIL with 403
    unauth_dl = client.get(f"/api/v1/evidence/{evd_id}/download", headers=headers_b)
    assert unauth_dl.status_code == 403
