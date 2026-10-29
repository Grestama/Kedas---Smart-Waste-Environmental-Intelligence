"""API tests for Authentication, Session Lifecycle, and Account Status."""

from app.core.security import hash_password
from app.modules.account.models import AccountStatus, User


def test_register_and_login_flow(client):
    """User can register and login, receiving a valid session token."""
    # 1. Register
    reg_payload = {
        "full_name": "Wayan Suwena",
        "email": "wayan@example.com",
        "password": "secure_password_123",
    }
    resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["email"] == "wayan@example.com"
    assert data["user"]["full_name"] == "Wayan Suwena"
    assert "session_token" in data

    # 2. Duplicate registration fails
    dup_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_resp.status_code == 409

    # 3. Login with correct password
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "wayan@example.com", "password": "secure_password_123"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    token = login_data["session_token"]
    assert token is not None

    # 4. Access /me with Bearer token
    me_resp = client.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "wayan@example.com"

    # 5. Logout revokes session
    logout_resp = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_resp.status_code == 200

    # 6. Subsequent call with revoked token fails with 401
    revoked_resp = client.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
    assert revoked_resp.status_code == 401


def test_invalid_credentials_prevent_account_enumeration(client):
    """Failed login returns generic 401 without disclosing if user exists."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "nonexistent@example.com", "password": "wrong_password"},
    )
    assert resp.status_code == 401
    assert resp.json()["code"] == "AUTHENTICATION_REQUIRED"


def test_suspended_user_blocked(client, db_session):
    """Suspended accounts cannot log in or perform authenticated actions."""
    # Create suspended user directly in DB
    user = User(
        full_name="Suspended Person",
        email="suspended@example.com",
        password_hash=hash_password("password_123"),
        account_status=AccountStatus.SUSPENDED.value,
        preferred_active_role="USER",
    )
    db_session.add(user)
    db_session.commit()

    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "suspended@example.com", "password": "password_123"},
    )
    assert resp.status_code == 403
    assert "ditangguhkan" in resp.json()["message"].lower()
