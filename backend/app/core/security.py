"""WasteLink Bali — Security primitives and middleware.

Includes:
- Argon2id password hashing and verification
- Cryptographic token generation & constant-time comparison
- Security headers middleware
"""

from __future__ import annotations

import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# Argon2id password hasher with recommended parameters
_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MiB
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

# Precomputed dummy hash to prevent account enumeration timing attacks
_DUMMY_PASSWORD_HASH = _hasher.hash("dummy_mitigate_account_enumeration_timing_attack")


def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against Argon2id hash."""
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


def verify_password_constant_time(password: str, password_hash: str | None) -> bool:
    """Verify password with constant-time guarantee.
    
    If password_hash is None (account not found), performs dummy Argon2 verification
    so that request latency is identical between existing and non-existing accounts.
    """
    if password_hash is None:
        verify_password(password, _DUMMY_PASSWORD_HASH)
        return False
    return verify_password(password, password_hash)


def generate_token(nbytes: int = 32) -> str:
    """Generate a cryptographically secure random token (URL-safe)."""
    return secrets.token_urlsafe(nbytes)


def constant_time_compare(a: str, b: str) -> bool:
    """Constant-time string comparison to prevent timing attacks."""
    return secrets.compare_digest(a.encode("utf-8"), b.encode("utf-8"))


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforce baseline security headers on all responses."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(self), gyroscope=(), magnetometer=(), "
            "microphone=(), payment=(), usb=()"
        )
        return response
