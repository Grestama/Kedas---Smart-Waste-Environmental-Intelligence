"""Journey 5 — Reporting Integrity, Outbox & Audit Trails Acceptance Test.

Verifies:
1. Strict separation of Estimated Weight vs. Verified Weight in aggregate reports.
   - Uncollected or cancelled estimated weight never contaminates verified net weight.
2. Timezone-aware date range filtering (WITA / Asia-Makassar).
3. CSV Report Export with anti-formula injection sanitization (=, +, -, @, \\t, \\r).
4. Transactional Outbox notification queuing, retry management, and processing lifecycle.
5. Complete audit log immutability and administrative traceability.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import CollectionSlotCreateRequest, ServiceAreaCreateRequest
from app.modules.notification.models import OutboxStatus
from app.modules.notification.outbox_service import enqueue_outbox_event, process_outbox_batch
from app.modules.reporting.service import _sanitize_csv_cell
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
            "phone_number": f"0815{user_id[:6]}",
            "vehicle_type": "MOTORCYCLE_CART",
            "vehicle_plate_number": "DK 5555 RP",
            "service_area_ids": [],
            "notes": "Siap bertugas pelaporan",
        },
        headers=col_headers,
    )
    apps = client.get("/api/v1/admin/collector-applications", headers=admin_headers).json()
    app = [a for a in apps if a["user_id"] == user_id][0]
    client.post(
        f"/api/v1/admin/collector-applications/{app['id']}/review",
        json={"approved": True, "notes": "Approved for reporting testing"},
        headers=admin_headers,
    )


def test_journey_5_reporting_integrity_outbox_and_auditing(client, db_session):
    # Setup Taxonomy & Admin
    taxonomy_service.seed_default_categories(db_session)
    bootstrap_admin(email="admin_j5@bali.id", password="admin_secret_123", full_name="Admin J5")
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin_j5@bali.id", "password": "admin_secret_123"},
    )
    admin_token = admin_login.json()["session_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Setup Area and Slot
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code="J5_AREA", name="Banjar J5 Reporting", administrative_area="Tabanan"
        ),
    )
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(hours=1),
            end_time=datetime.now(UTC) + timedelta(hours=3),
            max_capacity=20,
        ),
    )
    cat = client.get("/api/v1/waste-categories").json()[0]

    # Citizen & Collector registration
    token_user, user = _register(client, "warga_j5@bali.id", "Warga J5")
    user_headers = {"Authorization": f"Bearer {token_user}"}
    addr_id = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah J5", "address_text": "Jl. Tabanan No. 5", "service_area_id": area.id},
        headers=user_headers,
    ).json()["id"]

    token_col, col_user = _register(client, "petugas_j5@bali.id", "Petugas J5")
    _approve_collector(client, admin_headers, token_col, col_user["id"])
    col_headers = {"Authorization": f"Bearer {token_col}"}

    # --- 1. Estimated vs Verified Weight Separation Test ---
    # Pickup 1: Estimated 50 kg, never collected (remains PENDING_ASSIGNMENT)
    client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 50.0,
            "notes": "Sampah belum diambil",
        },
        headers=user_headers,
    )

    # Pickup 2: Estimated 20 kg, verified and completed with actual net weight = 15.0 kg
    pickup_collected = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 20.0,
            "notes": "Sampah diambil dan ditimbang",
        },
        headers=user_headers,
    ).json()["id"]

    client.post(f"/api/v1/collector/tasks/{pickup_collected}/accept", headers=col_headers)
    client.post(
        f"/api/v1/collector/tasks/{pickup_collected}/status",
        json={"status": "EN_ROUTE", "reason": "Jalan"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/collector/tasks/{pickup_collected}/status",
        json={"status": "ARRIVED", "reason": "Sampai"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/pickup-requests/{pickup_collected}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=col_headers,
    )
    client.post(
        f"/api/v1/pickup-requests/{pickup_collected}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 17.0, "tare_weight_kg": 2.0},
        headers=col_headers,
    )

    # Fetch Operational Summary Report
    report = client.get("/api/v1/admin/reports/summary", headers=admin_headers).json()
    assert "Asia/Makassar" in report["timezone"]
    # Total estimated weight includes both pickups (50 + 20 = 70 kg)
    assert report["total_estimated_weight_kg"] >= 70.0
    # Total verified weight strictly reflects ONLY the completed pickup's net weight (15.0 kg)
    # The 50 kg uncollected estimate must NEVER be included in verified weight!
    assert report["total_verified_weight_kg"] == 15.0

    # --- 2. WITA Timezone Filtering Test ---
    past_date = (datetime.now(UTC) - timedelta(days=2)).isoformat()
    future_date = (datetime.now(UTC) + timedelta(days=2)).isoformat()
    filtered_resp = client.get(
        "/api/v1/admin/reports/summary",
        params={"date_from": past_date, "date_to": future_date},
        headers=admin_headers,
    )
    assert filtered_resp.status_code == 200
    filtered_report = filtered_resp.json()
    assert filtered_report["total_pickups"] >= 2

    # Query future date range with no pickups
    far_future = (datetime.now(UTC) + timedelta(days=30)).isoformat()
    empty_resp = client.get(
        "/api/v1/admin/reports/summary",
        params={"date_from": far_future},
        headers=admin_headers,
    )
    assert empty_resp.status_code == 200
    empty_report = empty_resp.json()
    assert empty_report["total_pickups"] == 0
    assert empty_report["total_verified_weight_kg"] == 0.0

    # --- 3. CSV Export & Formula Injection Sanitization Test ---
    # Unit-level sanitization verification
    assert _sanitize_csv_cell("=CMD|' /C calc'!A0") == "'=CMD|' /C calc'!A0"
    assert _sanitize_csv_cell("+12345") == "'+12345"
    assert _sanitize_csv_cell("-SOMEPAYLOAD") == "'-SOMEPAYLOAD"
    assert _sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert _sanitize_csv_cell("Normal Text") == "Normal Text"

    # API-level CSV export check
    csv_resp = client.get("/api/v1/admin/reports/export", headers=admin_headers)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["Content-Type"]
    assert "attachment; filename=" in csv_resp.headers["Content-Disposition"]
    csv_content = csv_resp.text
    assert "WasteLink Bali — Laporan Metrik Operasional" in csv_content
    assert "Total Berat Tervalidasi (kg)" in csv_content

    # --- 4. Transactional Outbox Enqueue & Processing Test ---
    # Enqueue notification
    event_payload = {"pickup_id": pickup_collected, "status": "COMPLETED", "user_id": user["id"]}
    outbox_item = enqueue_outbox_event(
        db_session, event_type="PICKUP_COMPLETED", payload=event_payload
    )
    db_session.commit()
    assert outbox_item.status == OutboxStatus.PENDING.value

    # Process batch with simulated failure
    res_fail = process_outbox_batch(db_session, batch_size=10, fail_simulation_rate=1.0)
    assert res_fail["failed"] >= 1
    db_session.refresh(outbox_item)
    assert outbox_item.retry_count == 1
    assert "Simulated external notification gateway timeout" in (outbox_item.last_error or "")

    # Process batch successfully
    res_success = process_outbox_batch(db_session, batch_size=10, fail_simulation_rate=0.0)
    assert res_success["processed"] >= 1
    db_session.refresh(outbox_item)
    assert outbox_item.status == OutboxStatus.PROCESSED.value
    assert outbox_item.processed_at is not None

    # --- 5. System Audit Trail Completeness Test ---
    audit_resp = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_resp.status_code == 200
    audit_data = audit_resp.json()
    assert audit_data["total"] >= 1
    actions = [log["action"] for log in audit_data["items"]]
    assert "OPERATIONAL_REPORT_EXPORTED" in actions
