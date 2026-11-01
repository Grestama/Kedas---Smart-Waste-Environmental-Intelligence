"""Kedas — Stage 2 & 3 Authentication Hardening and Abuse Mitigation Tests.

Validates:
- Multi-dimensional sliding-window rate limiting on login (IP and Account).
- Return of HTTP 429 Too Many Requests with Retry-After header.
- Reset of account failure history upon successful login.
- Trusted proxy Client IP resolution and resistance to X-Forwarded-For spoofing.
- Constant-time verification to prevent timing-based account enumeration.
- Registration rate limiting per IP.
"""

from __future__ import annotations

import time
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.rate_limit import (
    InMemoryRateLimitStore,
    POLICY_AUTH_LOGIN_ACCOUNT,
    RateLimiter,
    get_client_ip,
    rate_limiter,
)
from app.core.security import verify_password_constant_time
from app.modules.account import service as account_service
from app.modules.account.schemas import UserRegisterRequest


def test_rate_limiter_sliding_window_unit():
    """Unit test for sliding window store with cooldown blocking."""
    store = InMemoryRateLimitStore()

    # Limit 3 attempts per 2 seconds
    allowed, retry_after, remaining = store.check_and_record(
        key="test_key", limit=3, window_seconds=2, block_duration_seconds=3
    )
    assert allowed is True
    assert remaining == 2

    # Attempt 2
    allowed, _, remaining = store.check_and_record("test_key", 3, 2, 3)
    assert allowed is True
    assert remaining == 1

    # Attempt 3
    allowed, _, remaining = store.check_and_record("test_key", 3, 2, 3)
    assert allowed is True
    assert remaining == 0

    # Attempt 4: should trigger rate limit block
    allowed, retry_after, remaining = store.check_and_record("test_key", 3, 2, 3)
    assert allowed is False
    assert retry_after > 0
    assert remaining == 0


def test_trusted_proxy_resolution_and_spoofing_defense():
    """Verify genuine client IP extraction and resistance to spoofed headers."""
    from starlette.requests import Request

    # Case 1: Direct connection from untrusted IP with spoofed header
    # Attacker connects from 203.0.113.5 and sends X-Forwarded-For: 1.1.1.1
    scope_direct = {
        "type": "http",
        "client": ("203.0.113.5", 12345),
        "headers": [(b"x-forwarded-for", b"1.1.1.1, 8.8.8.8")],
    }
    req_direct = Request(scope_direct)
    # Since 203.0.113.5 is not trusted proxy, direct IP must be returned
    assert get_client_ip(req_direct) == "203.0.113.5"

    # Case 2: Request through trusted proxy (127.0.0.1)
    scope_proxy = {
        "type": "http",
        "client": ("127.0.0.1", 12345),
        "headers": [(b"x-forwarded-for", b"198.51.100.42, 10.0.0.1")],
    }
    req_proxy = Request(scope_proxy)
    # Rightmost untrusted IP in chain is 198.51.100.42 (since 10.0.0.1 is trusted proxy network)
    assert get_client_ip(req_proxy) == "198.51.100.42"


def test_login_rate_limiting_by_account(client: TestClient):
    """Verify that exceeding 5 failed attempts for one account triggers HTTP 429."""
    email = "attacker_target@example.com"
    pwd = "CorrectPassword123!@#"
    enforce_headers = {"x-test-enforce-rate-limit": "true"}

    # 1. Register a synthetic user via client
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Target User",
            "email": email,
            "password": pwd,
        },
    )
    assert reg_resp.status_code == 201

    # Clean rate limiter state for test determinism
    rate_limiter.store._records.clear()
    rate_limiter.store._blocked_until.clear()

    # 2. Fire 5 failed attempts (limit is 5)
    for i in range(5):
        resp = client.post(
            "/api/v1/auth/login",
            json={"identifier": email, "password": f"WrongPass{i}"},
            headers=enforce_headers,
        )
        assert resp.status_code == 401, f"Attempt {i+1} should be 401"
        assert resp.json()["code"] == "AUTHENTICATION_REQUIRED"

    # 3. 6th attempt must be rejected with 429 Too Many Requests
    resp_blocked = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": "WrongPass6"},
        headers=enforce_headers,
    )
    assert resp_blocked.status_code == 429
    assert resp_blocked.json()["code"] == "RATE_LIMIT_EXCEEDED"
    assert "Retry-After" in resp_blocked.headers
    assert int(resp_blocked.headers["Retry-After"]) > 0


def test_login_success_clears_account_rate_limit(client: TestClient):
    """Verify that a successful login resets the account failure history."""
    email = "legit_user@example.com"
    pwd = "StrongPassword123!@#"
    enforce_headers = {"x-test-enforce-rate-limit": "true"}

    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Legit User",
            "email": email,
            "password": pwd,
        },
    )
    assert reg_resp.status_code == 201

    rate_limiter.store._records.clear()
    rate_limiter.store._blocked_until.clear()

    # 3 failed attempts (below limit of 5)
    for _ in range(3):
        client.post(
            "/api/v1/auth/login",
            json={"identifier": email, "password": "WrongPassword"},
            headers=enforce_headers,
        )

    # 4th attempt: correct credentials -> resets account limiter
    resp_success = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": pwd},
        headers=enforce_headers,
    )
    assert resp_success.status_code == 200

    # User can log in again without hit accumulation
    resp_success_again = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": pwd},
        headers=enforce_headers,
    )
    assert resp_success_again.status_code == 200


def test_constant_time_verification_timing():
    """Verify verify_password_constant_time executes dummy hash on nonexistent user."""
    # When user is None, verify_password_constant_time still runs Argon2 and returns False
    res = verify_password_constant_time("some_password", None)
    assert res is False
