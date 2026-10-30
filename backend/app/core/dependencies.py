"""WasteLink Bali — Authentication & Authorization FastAPI Dependencies.

Implements secure session extraction, user retrieval, RBAC verification,
and object ownership assertions according to SDD/SRS specifications.
"""

from __future__ import annotations

import hashlib
from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AuthenticationError, AuthorizationError
from app.db.session import get_db_session
from app.modules.account.models import (
    AccountStatus,
    AuthSession,
    Role,
    User,
    UserRole,
    VerificationStatus,
)


def hash_token(raw_token: str) -> str:
    """Hash raw session token using SHA-256 for secure database lookup."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def extract_session_token(request: Request) -> str | None:
    """Extract opaque session token.

    Authorization Bearer header takes precedence over cookie for API clients.
    """
    # 1. Try Authorization: Bearer <token>
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    # 2. Fall back to HttpOnly cookie
    settings = get_settings()
    cookie_token = request.cookies.get(settings.session_cookie_name)
    if cookie_token:
        return cookie_token

    return None


async def get_current_session(
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> AuthSession:
    """Validate session token and return active AuthSession."""
    token = extract_session_token(request)
    if not token:
        raise AuthenticationError("Autentikasi diperlukan. Sesi tidak ditemukan.")

    token_hash = hash_token(token)
    stmt = select(AuthSession).where(
        AuthSession.token_hash == token_hash,
        AuthSession.revoked_at.is_(None),
        AuthSession.expires_at > datetime.now(UTC),
    )
    auth_session = db.scalar(stmt)

    if not auth_session:
        raise AuthenticationError("Sesi tidak valid atau telah berakhir.")

    return auth_session


async def get_current_user(
    session: Annotated[AuthSession, Depends(get_current_session)],
    db: Annotated[Session, Depends(get_db_session)],
) -> User:
    """Retrieve the authenticated User from the current valid session."""
    user = db.get(User, session.user_id)
    if not user:
        raise AuthenticationError("Akun pengguna tidak ditemukan.")

    if user.account_status != AccountStatus.ACTIVE.value:
        raise AuthorizationError(
            f"Akun Anda dalam status {user.account_status}. Akses ditangguhkan."
        )

    return user


class RequireRole:
    """Enforce verified RBAC permission at the server level.

    IMPORTANT: Checks server-side UserRole grants with status ACTIVE.
    The client-supplied active_role preference is NEVER trusted for authorization.
    """

    def __init__(self, *allowed_roles: str | Sequence[str]) -> None:
        roles: set[str] = set()
        for r in allowed_roles:
            if isinstance(r, str):
                roles.add(r)
            else:
                roles.update(r)
        self.allowed_roles = roles

    async def __call__(
        self,
        current_user: Annotated[User, Depends(get_current_user)],
        db: Annotated[Session, Depends(get_db_session)],
    ) -> User:
        stmt = (
            select(Role.code)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == current_user.id,
                UserRole.verification_status == VerificationStatus.ACTIVE.value,
                Role.code.in_(self.allowed_roles),
            )
        )
        matched_roles = db.scalars(stmt).all()

        if not matched_roles:
            role_names = ", ".join(self.allowed_roles)
            raise AuthorizationError(f"Akses ditolak. Operasi ini membutuhkan role [{role_names}].")

        return current_user


# Role-based dependency shortcuts
require_admin = RequireRole(["ADMIN"])
require_collector = RequireRole(["COLLECTOR"])
require_admin_or_collector = RequireRole(["ADMIN", "COLLECTOR"])
require_operator = RequireRole(["OPERATOR", "ADMIN"])
require_facility_staff = RequireRole(["OPERATOR", "STAFF", "ADMIN", "COLLECTOR"])
