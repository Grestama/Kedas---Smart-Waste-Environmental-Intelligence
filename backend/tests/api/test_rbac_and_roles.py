"""API tests for RBAC, Collector Applications, and Role Privilege Gating."""

from app.cli.bootstrap_admin import bootstrap_admin


def _create_user_and_login(client, email, name, password="password_123"):  # noqa: S107
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": password},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def _login(client, email, password):
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert resp.status_code == 200
    return resp.json()["session_token"]


def test_user_cannot_access_admin_or_collector_tasks(client):
    """Normal user cannot call admin or collector task endpoints."""
    token, user = _create_user_and_login(client, "normal@example.com", "Normal User")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Check roles — only USER
    roles_resp = client.get("/api/v1/me/roles", headers=headers)
    assert roles_resp.status_code == 200
    role_codes = [r["code"] for r in roles_resp.json()]
    assert role_codes == ["USER"]

    # 2. Cannot access collector available tasks
    task_resp = client.get("/api/v1/collector/tasks/available", headers=headers)
    assert task_resp.status_code == 403

    # 3. Cannot access admin review
    admin_resp = client.get("/api/v1/admin/collector-applications", headers=headers)
    assert admin_resp.status_code == 403


def test_active_role_switch_validation(client):
    """User cannot switch active-role to an unowned or unverified role."""
    token, user = _create_user_and_login(client, "switcher@example.com", "Role Switcher")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Switch to USER succeeds
    resp1 = client.post("/api/v1/me/active-role", json={"role_code": "USER"}, headers=headers)
    assert resp1.status_code == 200
    assert resp1.json()["preferred_active_role"] == "USER"

    # 2. Switch to ADMIN fails with 403 because user has no ADMIN grant
    resp2 = client.post("/api/v1/me/active-role", json={"role_code": "ADMIN"}, headers=headers)
    assert resp2.status_code == 403

    # 3. Even if user sends active_role in body to some endpoint, server-side RBAC still blocks
    admin_resp = client.get("/api/v1/admin/collector-applications", headers=headers)
    assert admin_resp.status_code == 403


def test_collector_application_lifecycle(client):
    """Test full application flow: apply -> pending -> admin review -> collector activated."""
    # 1. Bootstrap admin
    bootstrap_admin(
        email="operator@wastelink.bali",
        password="admin_secret_123",
        full_name="Operator Admin",
    )
    admin_token = _login(client, "operator@wastelink.bali", "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Candidate registers
    cand_token, cand_user = _create_user_and_login(client, "petugas@example.com", "Ketut Collector")
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    # 3. Candidate submits application
    app_resp = client.post(
        "/api/v1/collector-applications",
        json={"vehicle_type": "Tossa Motor Roda Tiga", "operational_notes": "Siap pickup pagi"},
        headers=cand_headers,
    )
    assert app_resp.status_code == 201
    app_id = app_resp.json()["id"]
    assert app_resp.json()["status"] == "PENDING"

    # 4. While PENDING, candidate still cannot access collector tasks
    col_resp = client.get("/api/v1/collector/tasks/available", headers=cand_headers)
    assert col_resp.status_code == 403

    # 5. Admin lists applications
    list_resp = client.get("/api/v1/admin/collector-applications", headers=admin_headers)
    assert list_resp.status_code == 200
    assert any(a["id"] == app_id for a in list_resp.json())

    # 6. Admin approves application
    review_resp = client.post(
        f"/api/v1/admin/collector-applications/{app_id}/review",
        json={"approved": True},
        headers=admin_headers,
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "APPROVED"

    # 7. Candidate now has COLLECTOR role and can access collector tasks
    tasks_resp = client.get("/api/v1/collector/tasks/available", headers=cand_headers)
    assert tasks_resp.status_code == 200
