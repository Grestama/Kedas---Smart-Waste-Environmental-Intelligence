"""Journey 2 — Security, Access Boundaries & IDOR Prevention Acceptance Test.

Verifies:
1. Citizen address isolation (cannot view, edit, or delete another citizen's address).
2. Citizen pickup isolation (cannot view details or cancel another citizen's pickup).
3. Privilege separation: Citizen role cannot access collector or admin endpoints.
4. Collector cross-task isolation (Collector B cannot status-transition, inspect, or weigh Collector A's task).
5. Immediate session invalidation & login blocking upon account suspension.
6. Self-privilege escalation prevention (cannot activate unverified privileged role).
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
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
            "phone_number": f"0812{user_id[:6]}",
            "vehicle_type": "MOTORCYCLE_CART",
            "vehicle_plate_number": "DK 2222 XX",
            "service_area_ids": [],
            "notes": "Siap bertugas",
        },
        headers=col_headers,
    )
    apps = client.get("/api/v1/admin/collector-applications", headers=admin_headers).json()
    app = [a for a in apps if a["user_id"] == user_id][0]
    client.post(
        f"/api/v1/admin/collector-applications/{app['id']}/review",
        json={"approved": True, "notes": "Approved for testing"},
        headers=admin_headers,
    )


def test_journey_2_security_and_idor_prevention(client, db_session):
    # Setup Taxonomy & Admin
    taxonomy_service.seed_default_categories(db_session)
    bootstrap_admin(email="admin_j2@bali.id", password="admin_secret_123", full_name="Admin J2")
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin_j2@bali.id", "password": "admin_secret_123"},
    )
    admin_token = admin_login.json()["session_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Setup Area & Slot
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(code="J2_AREA", name="Banjar J2", administrative_area="Denpasar"),
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
    cat = client.get("/api/v1/waste-categories").json()[0]

    # Register Citizen A and Citizen B
    token_a, user_a = _register(client, "warga_a@bali.id", "Warga A")
    token_b, user_b = _register(client, "warga_b@bali.id", "Warga B")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Citizen Address Isolation & IDOR Check
    addr_a_resp = client.post(
        "/api/v1/me/addresses",
        json={"label": "Rumah A", "address_text": "Jl. Mawar No. 1", "service_area_id": area.id},
        headers=headers_a,
    )
    addr_a_id = addr_a_resp.json()["id"]

    # Warga B attempts to read, update, or delete Warga A's address -> 404 Not Found
    get_addr_b = client.get(f"/api/v1/me/addresses/{addr_a_id}", headers=headers_b)
    assert get_addr_b.status_code == 404

    update_addr_b = client.patch(
        f"/api/v1/me/addresses/{addr_a_id}",
        json={"label": "Hacked Address"},
        headers=headers_b,
    )
    assert update_addr_b.status_code == 404

    delete_addr_b = client.delete(f"/api/v1/me/addresses/{addr_a_id}", headers=headers_b)
    assert delete_addr_b.status_code == 404

    # 2. Citizen Pickup Isolation & IDOR Check
    pickup_a_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": cat["id"],
            "address_id": addr_a_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 5.0,
            "notes": "Sampah A",
        },
        headers=headers_a,
    )
    pickup_a_id = pickup_a_resp.json()["id"]

    # Warga B attempts to view Warga A's pickup -> 403 Forbidden
    get_pickup_b = client.get(f"/api/v1/pickup-requests/{pickup_a_id}", headers=headers_b)
    assert get_pickup_b.status_code == 403

    # Warga B attempts to cancel Warga A's pickup -> 403 Forbidden
    cancel_b = client.post(
        f"/api/v1/pickup-requests/{pickup_a_id}/cancel",
        json={"reason": "Pembatalan liar oleh Warga B"},
        headers=headers_b,
    )
    assert cancel_b.status_code == 403

    # 3. Privilege Separation: Citizen cannot access Collector or Admin routes
    assert client.get("/api/v1/collector/tasks/available", headers=headers_a).status_code == 403
    assert (
        client.post(f"/api/v1/collector/tasks/{pickup_a_id}/accept", headers=headers_a).status_code
        == 403
    )
    assert client.get("/api/v1/admin/dashboard", headers=headers_a).status_code == 403
    assert client.get("/api/v1/admin/users", headers=headers_a).status_code == 403
    assert client.get("/api/v1/admin/reports/summary", headers=headers_a).status_code == 403
    assert client.get("/api/v1/admin/audit-logs", headers=headers_a).status_code == 403

    # 4. Privilege Escalation Prevention
    # Citizen attempts to switch preferred active role to ADMIN or COLLECTOR -> 403 Forbidden
    esc_resp = client.post(
        "/api/v1/me/active-role",
        json={"role_code": "ADMIN"},
        headers=headers_a,
    )
    assert esc_resp.status_code == 403

    # 5. Collector Cross-Task Isolation
    # Register and approve two distinct collectors: Collector 1 and Collector 2
    token_c1, user_c1 = _register(client, "petugas_1@bali.id", "Petugas Satu")
    token_c2, user_c2 = _register(client, "petugas_2@bali.id", "Petugas Dua")
    _approve_collector(client, admin_headers, token_c1, user_c1["id"])
    _approve_collector(client, admin_headers, token_c2, user_c2["id"])
    headers_c1 = {"Authorization": f"Bearer {token_c1}"}
    headers_c2 = {"Authorization": f"Bearer {token_c2}"}

    # Collector 1 claims Pickup A
    accept_resp = client.post(f"/api/v1/collector/tasks/{pickup_a_id}/accept", headers=headers_c1)
    assert accept_resp.status_code == 200

    # Collector 2 attempts to transition status of Pickup A -> 403 Forbidden
    cross_status = client.post(
        f"/api/v1/collector/tasks/{pickup_a_id}/status",
        json={"status": "EN_ROUTE", "reason": "Diserobot Petugas 2"},
        headers=headers_c2,
    )
    assert cross_status.status_code == 403

    # Collector 1 advances status to ARRIVED
    client.post(
        f"/api/v1/collector/tasks/{pickup_a_id}/status",
        json={"status": "EN_ROUTE", "reason": "Jalan"},
        headers=headers_c1,
    )
    client.post(
        f"/api/v1/collector/tasks/{pickup_a_id}/status",
        json={"status": "ARRIVED", "reason": "Sampai"},
        headers=headers_c1,
    )

    # Collector 2 attempts to record inspection on Pickup A -> 403 Forbidden
    cross_insp = client.post(
        f"/api/v1/pickup-requests/{pickup_a_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=headers_c2,
    )
    assert cross_insp.status_code == 403

    # Collector 1 records inspection successfully
    insp_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_a_id}/inspections",
        json={"result": "ACCEPTED", "contamination_level": "NONE"},
        headers=headers_c1,
    )
    assert insp_resp.status_code == 201

    # Collector 2 attempts to record weight on Pickup A -> 403 Forbidden
    cross_weight = client.post(
        f"/api/v1/pickup-requests/{pickup_a_id}/weights",
        json={"method": "MANUAL_SCALE", "gross_weight_kg": 6.0, "tare_weight_kg": 1.0},
        headers=headers_c2,
    )
    assert cross_weight.status_code == 403

    # 6. User Suspension & Session Revocation
    # Admin suspends Warga B
    suspend_resp = client.patch(
        f"/api/v1/admin/users/{user_b['id']}/status",
        json={"status": "SUSPENDED", "reason": "Pelanggaran aturan berulang"},
        headers=admin_headers,
    )
    assert suspend_resp.status_code == 200
    assert suspend_resp.json()["account_status"] == "SUSPENDED"

    # Warga B's existing active session token is immediately invalid (revoked) -> 401 Unauthorized
    blocked_get = client.get("/api/v1/me", headers=headers_b)
    assert blocked_get.status_code == 401

    # Warga B attempts to login again with valid password -> 403 Forbidden
    re_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "warga_b@bali.id", "password": "password_123"},
    )
    assert re_login.status_code == 403
