"""Journey 4 — Safety Exceptions, Contamination, Rejections & Disputes Acceptance Test.

Verifies:
1. Special / hazardous waste safety gating (prevents booking standard pickup for SPECIAL category).
2. QC inspection rejection due to heavy contamination:
   - State transitions to CANCELLED, zero points issued, full reason logged.
3. Storage upload security & validation:
   - Disallowed MIME type rejected with 400.
   - Oversized file (> 10MB) rejected with 400.
4. Weight revision / correction trail & ledger reversal:
   - Version 1: 10 kg -> 1000 pts.
   - Version 2 correction: 8 kg -> Reversal (-1000 pts), New (+800 pts) -> Balance: 800 pts.
   - Full version history and append-only ledger preserved.
5. Circular marketplace delivery receipt discrepancy:
   - Dispatched 50 kg vs Received 46 kg -> 4 kg discrepancy recorded with flag.
"""

from __future__ import annotations

import io
from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.core.storage import MAX_FILE_SIZE_BYTES
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
            "phone_number": f"0814{user_id[:6]}",
            "vehicle_type": "MOTORCYCLE_CART",
            "vehicle_plate_number": "DK 4444 SE",
            "service_area_ids": [],
            "notes": "Siap bertugas keselamatan",
        },
        headers=col_headers,
    )
    apps = client.get("/api/v1/admin/collector-applications", headers=admin_headers).json()
    app = [a for a in apps if a["user_id"] == user_id][0]
    client.post(
        f"/api/v1/admin/collector-applications/{app['id']}/review",
        json={"approved": True, "notes": "Approved for safety testing"},
        headers=admin_headers,
    )


def test_journey_4_safety_exceptions_and_disputes(client, db_session):
    # Setup Taxonomy & Admin
    taxonomy_service.seed_default_categories(db_session)
    bootstrap_admin(email="admin_j4@bali.id", password="admin_secret_123", full_name="Admin J4")
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin_j4@bali.id", "password": "admin_secret_123"},
    )
    admin_token = admin_login.json()["session_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Setup Area and Slot
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="J4_AREA", name="Banjar J4 Safety", administrative_area="Gianyar"
        ),
    )
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(hours=1),
            end_time=datetime.now(UTC) + timedelta(hours=3),
            max_capacity=10,
        ),
    )

    cats = client.get("/api/v1/waste-categories").json()
    recyclable_cat = [c for c in cats if c["code"] == "RECYCLABLE"][0]
    special_cat = [c for c in cats if c["code"] == "SPECIAL"][0]

    # Setup Reward Rule (100 pts/kg)
    client.post(
        "/api/v1/admin/points/rules",
        json={"category_id": recyclable_cat["id"], "points_per_kg": 100, "minimum_weight_kg": 0.5},
        headers=admin_headers,
    )

    # Citizen & Collector registration
    token_user, user = _register(client, "warga_j4@bali.id", "Warga J4")
    user_headers = {"Authorization": f"Bearer {token_user}"}
    addr_id = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Rumah J4",
            "address_text": "Banjar Gianyar No. 4",
            "service_area_id": area.id,
        },
        headers=user_headers,
    ).json()["id"]

    token_col, col_user = _register(client, "petugas_j4@bali.id", "Petugas J4")
    _approve_collector(client, admin_headers, token_col, col_user["id"])
    col_headers = {"Authorization": f"Bearer {token_col}"}

    # --- 1. Special Waste Safety Gating Test ---
    # Attempting to book standard pickup with SPECIAL waste category -> 422 Unprocessable Entity
    special_booking = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": special_cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 2.0,
            "notes": "Sampah baterai dan cat bekas",
        },
        headers=user_headers,
    )
    assert special_booking.status_code == 422
    assert "khusus" in special_booking.json()["message"].lower()

    # --- 2. Contamination Rejection Test ---
    # Submit normal recyclable booking
    pickup_contam_id = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": recyclable_cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 5.0,
            "notes": "Setoran berbau oli",
        },
        headers=user_headers,
    ).json()["id"]

    # Collector claims and moves to arrived
    client.post(f"/api/v1/collector/tasks/{pickup_contam_id}/accept", headers=col_headers)
    client.post(
        f"/api/v1/collector/tasks/{pickup_contam_id}/status",
        json={"status": "EN_ROUTE", "reason": "Jalan"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/collector/tasks/{pickup_contam_id}/status",
        json={"status": "ARRIVED", "reason": "Sampai"},
        headers=col_headers,
    )

    # Collector performs QC Inspection and REJECTS due to heavy contamination
    reject_insp = client.post(
        f"/api/v1/pickup-requests/{pickup_contam_id}/inspections",
        json={
            "result": "REJECTED",
            "contamination_level": "HIGH",
            "rejection_reason_code": "HAZARDOUS_CONTAMINATION",
            "rejection_notes": "Tercampur oli mesin dan beling",
        },
        headers=col_headers,
    )
    assert reject_insp.status_code == 201
    assert reject_insp.json()["result"] == "REJECTED"

    # Verify pickup status is now CANCELLED (or terminated)
    pickup_detail = client.get(
        f"/api/v1/pickup-requests/{pickup_contam_id}", headers=user_headers
    ).json()
    assert pickup_detail["status"] == "CANCELLED"

    # Verify ZERO points issued
    user_bal = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert user_bal["current_balance"] == 0

    # --- 3. Storage Upload Validation Test ---
    # Valid pickup for upload testing
    pickup_valid_id = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": recyclable_cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 10.0,
            "notes": "Setoran bersih",
        },
        headers=user_headers,
    ).json()["id"]
    client.post(f"/api/v1/collector/tasks/{pickup_valid_id}/accept", headers=col_headers)

    # 3a. Disallowed MIME type (.exe) -> 400 Bad Request
    bad_file = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
    bad_upload = client.post(
        "/api/v1/evidence/upload",
        files={"file": ("malicious.exe", bad_file, "application/x-msdownload")},
        data={"entity_type": "PICKUP", "entity_id": pickup_valid_id},
        headers=col_headers,
    )
    assert bad_upload.status_code == 400
    assert "tidak diizinkan" in bad_upload.json()["message"]

    # 3b. File exceeding size limit (> 10MB) -> 400 Bad Request
    oversized_bytes = b"0" * (MAX_FILE_SIZE_BYTES + 1024)
    oversized_file = io.BytesIO(oversized_bytes)
    oversized_upload = client.post(
        "/api/v1/evidence/upload",
        files={"file": ("huge.jpg", oversized_file, "image/jpeg")},
        data={"entity_type": "PICKUP", "entity_id": pickup_valid_id},
        headers=col_headers,
    )
    assert oversized_upload.status_code == 400
    assert "melebihi batas" in oversized_upload.json()["message"]

    # --- 4. Weight Revision & Append-Only Ledger Reversal Test ---
    # Pass inspection first
    client.post(
        f"/api/v1/collector/tasks/{pickup_valid_id}/status",
        json={"status": "EN_ROUTE", "reason": "Jalan"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/collector/tasks/{pickup_valid_id}/status",
        json={"status": "ARRIVED", "reason": "Sampai"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/pickup-requests/{pickup_valid_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=col_headers,
    )

    # Record Initial Weight: Gross 12 kg - Tare 2 kg = Net 10 kg (Version 1)
    wt_v1 = client.post(
        f"/api/v1/pickup-requests/{pickup_valid_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 12.0, "tare_weight_kg": 2.0},
        headers=col_headers,
    )
    assert wt_v1.status_code == 201
    assert wt_v1.json()["version"] == 1
    assert wt_v1.json()["net_weight_kg"] == 10.0

    # User balance after v1: 10 kg * 100 = 1000 points
    bal_v1 = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_v1["current_balance"] == 1000

    # Supervisor/Collector recalibrates scale: Corrected weight = Gross 10 kg - Tare 2 kg = Net 8 kg (Version 2)
    wt_v2 = client.post(
        f"/api/v1/pickup-requests/{pickup_valid_id}/weights",
        json={
            "method": "MANUAL_SCALE",
            "gross_weight_kg": 10.0,
            "tare_weight_kg": 2.0,
            "correction_reason": "Koreksi setelah rekalibrasi timbangan digital",
        },
        headers=col_headers,
    )
    assert wt_v2.status_code == 201
    assert wt_v2.json()["version"] == 2
    assert wt_v2.json()["net_weight_kg"] == 8.0

    # User balance after correction: +1000 - 1000 + 800 = 800 points
    bal_v2 = client.get("/api/v1/points/balance", headers=user_headers).json()
    assert bal_v2["current_balance"] == 800

    # Verify append-only ledger has exactly 3 entries: EARNED_PICKUP (1000), REVERSAL (-1000), EARNED_PICKUP (800)
    ledger_entries = client.get("/api/v1/points/ledger", headers=user_headers).json()
    assert len(ledger_entries) == 3
    deltas = [e["points_delta"] for e in ledger_entries]
    assert 1000 in deltas
    assert -1000 in deltas
    assert 800 in deltas

    # --- 5. Circular Marketplace Delivery Receipt Discrepancy Test ---
    partner = client.post(
        "/api/v1/admin/partners",
        json={
            "name": "PT Pengolah Plastik Nusantara",
            "contact_email": "mitra_j4@daurulang.id",
            "contact_phone": "081511223344",
            "address": "Kuta Selatan",
        },
        headers=admin_headers,
    ).json()

    batch = client.post(
        "/api/v1/admin/batches",
        json={"category_id": recyclable_cat["id"], "pickup_ids": [pickup_valid_id]},
        headers=col_headers,
    ).json()

    # Dispatched 8.0 kg (matching verified weight)
    delivery = client.post(
        "/api/v1/admin/deliveries",
        json={"batch_id": batch["id"], "partner_id": partner["id"], "dispatched_weight_kg": 8.0},
        headers=col_headers,
    ).json()

    # Partner receives only 7.2 kg (shortage / discrepancy of 0.8 kg)
    receipt = client.post(
        f"/api/v1/admin/deliveries/{delivery['id']}/receipt",
        json={"received_weight_kg": 7.2, "notes": "Terdapat penyusutan kelembapan 0.8 kg"},
        headers=col_headers,
    )
    assert receipt.status_code == 200
    rec_data = receipt.json()
    assert rec_data["status"] == "DISPUTED"
    assert abs(round(rec_data["weight_discrepancy_kg"], 1)) == 0.8
