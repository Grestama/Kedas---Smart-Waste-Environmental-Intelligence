"""WasteLink Bali — Account & Identity Domain Service.

Handles user registration, authentication, sessions, role assignments,
addresses, and collector applications with strict audit logs.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.dependencies import hash_token
from app.core.errors import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from app.core.security import generate_token, hash_password, verify_password
from app.db.base import AuditLog
from app.modules.account.models import (
    AccountStatus,
    ApplicationStatus,
    AuthSession,
    CollectorApplication,
    Role,
    User,
    UserAddress,
    UserRole,
    VerificationStatus,
)
from app.modules.account.schemas import (
    AddressCreateRequest,
    AddressUpdateRequest,
    CollectorApplicationCreateRequest,
    CollectorApplicationReviewRequest,
    UserLoginRequest,
    UserRegisterRequest,
    UserUpdateRequest,
)


def ensure_system_roles_exist(db: Session) -> None:
    """Ensure baseline roles (USER, COLLECTOR, ADMIN) exist in database."""
    default_roles = [
        ("USER", "Warga / Pengguna", "Role standar pengguna untuk menyetor sampah"),
        ("COLLECTOR", "Petugas Pengangkut", "Petugas terverifikasi untuk mengangkut sampah"),
        ("ADMIN", "Administrator", "Pengelola operasional sistem"),
        ("FINANCE", "Pengelola Keuangan", "Akses anggaran dan rekonsiliasi keuangan"),
        ("BUYER", "Mitra Pembeli", "Mitra pengolah dan pembeli daur ulang"),
    ]
    for code, name, desc in default_roles:
        existing = db.scalar(select(Role).where(Role.code == code))
        if not existing:
            role = Role(code=code, name=name, description=desc)
            db.add(role)
    db.commit()


def register_user(db: Session, req: UserRegisterRequest) -> User:
    """Register a new user account with default USER role."""
    if not req.email and not req.phone:
        raise ValidationError("Email atau nomor telepon wajib diisi untuk registrasi.")

    # Check uniqueness
    if req.email:
        existing_email = db.scalar(select(User).where(User.email == req.email))
        if existing_email:
            raise ConflictError("Email sudah terdaftar.")

    if req.phone:
        existing_phone = db.scalar(select(User).where(User.phone == req.phone))
        if existing_phone:
            raise ConflictError("Nomor telepon sudah terdaftar.")

    ensure_system_roles_exist(db)

    user_role = db.scalar(select(Role).where(Role.code == "USER"))
    if not user_role:
        raise NotFoundError("Role dasar USER tidak ditemukan.")

    # Create User
    pwd_hash = hash_password(req.password)
    user = User(
        full_name=req.full_name,
        email=req.email,
        phone=req.phone,
        password_hash=pwd_hash,
        account_status=AccountStatus.ACTIVE.value,
        preferred_active_role="USER",
    )
    db.add(user)
    db.flush()

    # Grant USER role
    grant = UserRole(
        user_id=user.id,
        role_id=user_role.id,
        verification_status=VerificationStatus.ACTIVE.value,
        granted_at=datetime.now(UTC),
    )
    db.add(grant)
    db.commit()
    db.refresh(user)
    return user


def login_user(
    db: Session,
    req: UserLoginRequest,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> tuple[str, User]:
    """Authenticate credentials and generate opaque server session token."""
    # Look up by email or phone
    stmt = select(User).where((User.email == req.identifier) | (User.phone == req.identifier))
    user = db.scalar(stmt)

    if not user or not verify_password(req.password, user.password_hash):
        # Generic error message to prevent account enumeration
        raise AuthenticationError("Kredensial login tidak valid.")

    if user.account_status != AccountStatus.ACTIVE.value:
        raise AuthorizationError(
            f"Akun Anda dalam status {user.account_status}. Akses ditangguhkan."
        )

    # Generate opaque session token
    raw_token = generate_token(32)
    token_hashed = hash_token(raw_token)

    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(seconds=settings.session_lifetime_seconds)

    auth_session = AuthSession(
        user_id=user.id,
        token_hash=token_hashed,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(auth_session)
    db.commit()

    return raw_token, user


def logout_user(db: Session, session: AuthSession) -> None:
    """Revoke active session on server."""
    session.revoked_at = datetime.now(UTC)
    db.add(session)
    db.commit()


def get_user_roles(db: Session, user_id: str) -> list[dict[str, str]]:
    """Return all roles assigned to user."""
    stmt = (
        select(Role.code, Role.name, Role.description, UserRole.verification_status)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
    )
    results = db.execute(stmt).all()
    return [
        {
            "code": r[0],
            "name": r[1],
            "description": r[2] or "",
            "verification_status": r[3],
        }
        for r in results
    ]


def set_active_role(db: Session, user: User, requested_role: str) -> User:
    """Update user preferred active role (UI context only)."""
    # Verify the user actually possesses this role in ACTIVE status
    stmt = (
        select(Role.code)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(
            UserRole.user_id == user.id,
            UserRole.verification_status == VerificationStatus.ACTIVE.value,
            Role.code == requested_role,
        )
    )
    has_role = db.scalar(stmt)
    if not has_role:
        raise AuthorizationError(f"Anda tidak memiliki role [{requested_role}] yang terverifikasi.")

    user.preferred_active_role = requested_role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_profile(db: Session, user: User, req: UserUpdateRequest) -> User:
    """Update profile fields safely."""
    if req.full_name is not None:
        user.full_name = req.full_name
    if req.phone is not None:
        # Check phone conflict
        existing = db.scalar(select(User).where(User.phone == req.phone, User.id != user.id))
        if existing:
            raise ConflictError("Nomor telepon sudah digunakan akun lain.")
        user.phone = req.phone

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# --- Address operations with strict ownership ---


def create_user_address(db: Session, user_id: str, req: AddressCreateRequest) -> UserAddress:
    """Create a new address for user."""
    if req.is_default:
        # Unset previous default
        db.execute(
            update(UserAddress).where(UserAddress.user_id == user_id).values(is_default=False)
        )

    address = UserAddress(
        user_id=user_id,
        label=req.label,
        address_text=req.address_text,
        service_area_id=req.service_area_id,
        notes=req.notes,
        is_default=req.is_default,
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def get_user_addresses(db: Session, user_id: str) -> list[UserAddress]:
    """List addresses owned by user."""
    stmt = (
        select(UserAddress)
        .where(UserAddress.user_id == user_id)
        .order_by(UserAddress.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def get_user_address_by_id(db: Session, user_id: str, address_id: str) -> UserAddress:
    """Get single address ensuring ownership."""
    address = db.get(UserAddress, address_id)
    if not address or address.user_id != user_id:
        raise NotFoundError("Alamat tidak ditemukan.")
    return address


def update_user_address(
    db: Session, user_id: str, address_id: str, req: AddressUpdateRequest
) -> UserAddress:
    """Update user address with ownership check."""
    address = get_user_address_by_id(db, user_id, address_id)

    if req.label is not None:
        address.label = req.label
    if req.address_text is not None:
        address.address_text = req.address_text
    if req.service_area_id is not None:
        address.service_area_id = req.service_area_id
    if req.notes is not None:
        address.notes = req.notes
    if req.is_default is not None:
        if req.is_default:
            db.execute(
                update(UserAddress)
                .where(UserAddress.user_id == user_id, UserAddress.id != address_id)
                .values(is_default=False)
            )
        address.is_default = req.is_default

    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def delete_user_address(db: Session, user_id: str, address_id: str) -> None:
    """Delete address with ownership check."""
    address = get_user_address_by_id(db, user_id, address_id)
    db.delete(address)
    db.commit()


# --- Collector application workflow ---


def submit_collector_application(
    db: Session, user_id: str, req: CollectorApplicationCreateRequest
) -> CollectorApplication:
    """Submit an application to become a collector."""
    # Check if there is already a pending application
    stmt = select(CollectorApplication).where(
        CollectorApplication.user_id == user_id,
        CollectorApplication.status == ApplicationStatus.PENDING.value,
    )
    existing = db.scalar(stmt)
    if existing:
        raise ConflictError("Anda sudah memiliki pengajuan yang sedang diproses.")

    app = CollectorApplication(
        user_id=user_id,
        vehicle_type=req.vehicle_type,
        operational_notes=req.operational_notes,
        status=ApplicationStatus.PENDING.value,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def get_my_collector_application(db: Session, user_id: str) -> CollectorApplication | None:
    """Retrieve the most recent collector application of current user."""
    stmt = (
        select(CollectorApplication)
        .where(CollectorApplication.user_id == user_id)
        .order_by(CollectorApplication.created_at.desc())
    )
    return db.scalar(stmt)


def list_collector_applications(
    db: Session, status: str | None = None
) -> list[CollectorApplication]:
    """Admin list of collector applications."""
    stmt = select(CollectorApplication)
    if status:
        stmt = stmt.where(CollectorApplication.status == status)
    stmt = stmt.order_by(CollectorApplication.created_at.desc())
    return list(db.scalars(stmt).all())


def review_collector_application(
    db: Session,
    admin_id: str,
    application_id: str,
    req: CollectorApplicationReviewRequest,
    request_id: str | None = None,
) -> CollectorApplication:
    """Admin review of collector application with audit log and role grant creation."""
    app = db.get(CollectorApplication, application_id)
    if not app:
        raise NotFoundError("Pengajuan tidak ditemukan.")

    if app.status != ApplicationStatus.PENDING.value:
        raise ConflictError(f"Pengajuan sudah diproses dengan status [{app.status}].")

    now = datetime.now(UTC)
    app.reviewed_by = admin_id
    app.reviewed_at = now

    if req.approved:
        app.status = ApplicationStatus.APPROVED.value
        app.rejection_reason = None

        # Fetch or create COLLECTOR role grant
        collector_role = db.scalar(select(Role).where(Role.code == "COLLECTOR"))
        if not collector_role:
            raise NotFoundError("Role COLLECTOR tidak ditemukan.")

        user_role = db.scalar(
            select(UserRole).where(
                UserRole.user_id == app.user_id,
                UserRole.role_id == collector_role.id,
            )
        )
        if user_role:
            user_role.verification_status = VerificationStatus.ACTIVE.value
            user_role.granted_by = admin_id
            user_role.granted_at = now
        else:
            user_role = UserRole(
                user_id=app.user_id,
                role_id=collector_role.id,
                verification_status=VerificationStatus.ACTIVE.value,
                granted_by=admin_id,
                granted_at=now,
            )
            db.add(user_role)

        audit_action = "COLLECTOR_APPLICATION_APPROVED"
        audit_reason = "Pengajuan collector disetujui admin."
    else:
        if not req.reason or not req.reason.strip():
            raise ValidationError("Alasan penolakan wajib disertakan.")
        app.status = ApplicationStatus.REJECTED.value
        app.rejection_reason = req.reason.strip()
        audit_action = "COLLECTOR_APPLICATION_REJECTED"
        audit_reason = req.reason.strip()

    # Record Audit Log
    audit = AuditLog(
        actor_user_id=admin_id,
        action=audit_action,
        entity_type="collector_application",
        entity_id=application_id,
        reason=audit_reason,
        request_id=request_id,
    )
    db.add(audit)
    db.commit()
    db.refresh(app)
    return app


def list_admin_users(
    db: Session,
    role_code: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[User], int]:
    """Retrieve users list with role/status filters and bounded pagination."""
    stmt = select(User).order_by(User.created_at.desc())
    if status:
        stmt = stmt.where(User.account_status == status)
    if role_code:
        stmt = (
            stmt.join(UserRole, UserRole.user_id == User.id)
            .join(Role, Role.id == UserRole.role_id)
            .where(Role.code == role_code)
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = list(db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all())
    return items, total


def update_user_status(
    db: Session,
    admin_id: str,
    user_id: str,
    status: str,
    reason: str,
    request_id: str | None = None,
) -> User:
    """Update a user's account status (e.g. SUSPENDED) and revoke active sessions if suspended."""
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("Pengguna tidak ditemukan.")

    old_status = user.account_status
    user.account_status = status

    # If suspended, immediately revoke all active sessions
    if status == AccountStatus.SUSPENDED.value:
        db.query(AuthSession).where(
            AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None)
        ).update({"revoked_at": datetime.now(UTC)})

    audit = AuditLog(
        actor_user_id=admin_id,
        action="USER_STATUS_UPDATED",
        entity_type="USER",
        entity_id=user.id,
        reason=reason,
        request_id=request_id,
        payload_after={"from_status": old_status, "to_status": status, "reason": reason},
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user
