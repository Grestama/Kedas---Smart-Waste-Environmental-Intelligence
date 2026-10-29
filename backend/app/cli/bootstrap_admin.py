"""WasteLink Bali — Secure Admin Bootstrapping CLI.

Allows provisioning the initial operator account without hardcoded secrets.
Usage:
    python -m app.cli.bootstrap_admin --email admin@wastelink.bali --password <SECURE_PASSWORD> --name "Admin Operator"
"""

# ruff: noqa: T201

from __future__ import annotations

import argparse
import sys
from datetime import UTC, datetime

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import AuditLog
from app.db.session import get_session_factory
from app.modules.account.models import (
    AccountStatus,
    Role,
    User,
    UserRole,
    VerificationStatus,
)
from app.modules.account.service import ensure_system_roles_exist


def bootstrap_admin(email: str, password: str, full_name: str) -> None:
    session_factory = get_session_factory()
    with session_factory() as db:
        ensure_system_roles_exist(db)

        # Check if user already exists
        existing_user = db.scalar(select(User).where(User.email == email))
        admin_role = db.scalar(select(Role).where(Role.code == "ADMIN"))
        if not admin_role:
            print("ERROR: Role ADMIN not found.")
            sys.exit(1)

        now = datetime.now(UTC)

        if existing_user:
            user = existing_user
            print(f"User with email [{email}] already exists. Granting ADMIN role...")
        else:
            if len(password) < 8:
                print("ERROR: Password must be at least 8 characters.")
                sys.exit(1)

            pwd_hash = hash_password(password)
            user = User(
                email=email,
                full_name=full_name,
                password_hash=pwd_hash,
                account_status=AccountStatus.ACTIVE.value,
                preferred_active_role="ADMIN",
            )
            db.add(user)
            db.flush()
            print(f"Created user [{full_name}] with ID [{user.id}].")

        # Check if user already has ADMIN role
        user_role = db.scalar(
            select(UserRole).where(
                UserRole.user_id == user.id,
                UserRole.role_id == admin_role.id,
            )
        )
        if not user_role:
            user_role = UserRole(
                user_id=user.id,
                role_id=admin_role.id,
                verification_status=VerificationStatus.ACTIVE.value,
                granted_at=now,
                notes="Bootstrap administrator provisioned via CLI",
            )
            db.add(user_role)

            audit = AuditLog(
                actor_user_id=user.id,
                action="ADMIN_BOOTSTRAPPED",
                entity_type="user_role",
                entity_id=user.id,
                reason="Initial admin account created via CLI tool",
            )
            db.add(audit)
            db.commit()
            print(f"SUCCESS: ADMIN role successfully provisioned for [{email}].")
        else:
            print(f"User [{email}] already holds active ADMIN role.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Provision initial administrator account")
    parser.add_argument("--email", required=True, help="Administrator email address")
    parser.add_argument("--password", required=True, help="Secure administrator password")
    parser.add_argument("--name", default="System Administrator", help="Administrator full name")

    args = parser.parse_args()
    bootstrap_admin(email=args.email, password=args.password, full_name=args.name)


if __name__ == "__main__":
    main()
