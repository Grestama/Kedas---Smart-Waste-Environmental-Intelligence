"""Kedas — Tahap 2 AI Context Resolver, Scoped Authorization & Conversation Management Tests."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.modules.account.models import Role, User, UserRole
from app.modules.ai.context_resolver import ContextResolver
from app.modules.collection.models import ServiceArea
from app.modules.community.models import CDOAAgreement, CDOAStatus
from app.modules.marketplace.models import B2BBusinessType, B2BOrganization, B2BOrganizationMember


def _create_user(db: Session, email: str, role_code: str = "RESIDENT") -> User:
    user = User(
        email=email,
        full_name=f"User {email}",
        password_hash="mock_hash",
        account_status="ACTIVE",
    )
    db.add(user)
    db.flush()

    role = db.query(Role).filter_by(code=role_code).first()
    if not role:
        role = Role(code=role_code, name=role_code, description=role_code)
        db.add(role)
        db.flush()

    ur = UserRole(
        user_id=user.id,
        role_id=role.id,
        verification_status="ACTIVE",
        granted_at=datetime.now(UTC),
    )
    db.add(ur)
    db.commit()
    db.refresh(user)
    return user


def test_context_resolver_actor_classification(db_session: Session):
    """Test actor classification for guest, resident, and admin."""
    # 1. Guest
    guest_ctx = ContextResolver.resolve(db_session, user=None)
    assert guest_ctx.actor.actor_type == "GUEST"
    assert guest_ctx.actor.is_authenticated is False
    assert guest_ctx.actor.is_admin is False
    assert guest_ctx.scope.visibility_mode == "PUBLIC_ONLY"

    # 2. Resident
    citizen = _create_user(db_session, f"citizen_{uuid.uuid4().hex[:6]}@kedas.bali", "RESIDENT")
    citizen_ctx = ContextResolver.resolve(db_session, user=citizen)
    assert citizen_ctx.actor.actor_type == "CITIZEN"
    assert citizen_ctx.actor.is_authenticated is True
    assert citizen_ctx.actor.is_admin is False

    # 3. Admin
    admin = _create_user(db_session, f"admin_{uuid.uuid4().hex[:6]}@kedas.bali", "ADMIN")
    admin_ctx = ContextResolver.resolve(db_session, user=admin)
    assert admin_ctx.actor.actor_type == "ADMIN"
    assert admin_ctx.actor.is_admin is True
    assert admin_ctx.scope.visibility_mode == "GLOBAL_ADMIN"


def test_tenant_isolation_hospitality_and_scope_leakage(db_session: Session):
    """Test tenant isolation: Tenant A cannot read Tenant B's private documents."""
    # 1. Create Organization A and Tenant A
    org_a = B2BOrganization(
        name="Resort A Ubud",
        business_type=B2BBusinessType.HOTEL.value,
        billing_contact_name="Manager A",
        billing_contact_phone="0811111111",
        billing_contact_email="a@resort.com",
    )
    org_b = B2BOrganization(
        name="Hotel B Sanur",
        business_type=B2BBusinessType.HOTEL.value,
        billing_contact_name="Manager B",
        billing_contact_phone="0822222222",
        billing_contact_email="b@hotel.com",
    )
    db_session.add_all([org_a, org_b])
    db_session.flush()

    user_a = _create_user(db_session, f"staff_a_{uuid.uuid4().hex[:6]}@kedas.bali", "PARTNER")
    user_b = _create_user(db_session, f"staff_b_{uuid.uuid4().hex[:6]}@kedas.bali", "PARTNER")

    mem_a = B2BOrganizationMember(organization_id=org_a.id, user_id=user_a.id, role="STAFF")
    mem_b = B2BOrganizationMember(organization_id=org_b.id, user_id=user_b.id, role="STAFF")
    db_session.add_all([mem_a, mem_b])
    db_session.commit()

    ctx_a = ContextResolver.resolve(db_session, user_a)
    ctx_b = ContextResolver.resolve(db_session, user_b)

    assert ctx_a.scope.organization_id == org_a.id
    assert ctx_b.scope.organization_id == org_b.id

    # 2. Scope boundary check
    assert (
        ctx_a.can_access_document(
            doc_is_public=False,
            doc_destination_id=None,
            doc_org_id=org_a.id,
            doc_status="PUBLISHED",
        )
        is True
    )
    assert (
        ctx_a.can_access_document(
            doc_is_public=False,
            doc_destination_id=None,
            doc_org_id=org_b.id,
            doc_status="PUBLISHED",
        )
        is False
    )  # Tenant A blocked from Tenant B

    assert ctx_a.can_read_tenant_records(org_a.id) is True
    assert ctx_a.can_read_tenant_records(org_b.id) is False


def test_destination_switch_context_and_freshness(db_session: Session):
    """Test destination context resolution and active CDOA versioning."""
    area1 = ServiceArea(
        code=f"SA-{uuid.uuid4().hex[:4]}",
        name="Kawasan Tebesaya",
        administrative_area="Gianyar",
        is_active=True,
    )
    area2 = ServiceArea(
        code=f"SA-{uuid.uuid4().hex[:4]}",
        name="Kawasan Sanur",
        administrative_area="Denpasar",
        is_active=True,
    )
    db_session.add_all([area1, area2])
    db_session.flush()

    # Create CDOA for Area 1
    admin_u = _create_user(db_session, f"admin_cdoa_{uuid.uuid4().hex[:6]}@kedas.bali", "ADMIN")
    cdoa1 = CDOAAgreement(
        service_area_id=area1.id,
        agreement_no="CDOA-TBS-2026",
        version=1,
        title="CDOA Tebesaya Pilot",
        status=CDOAStatus.PUBLISHED.value,
        pic_name="Prajuru 1",
        pic_contact="0812345",
        escalation_channel="08111222333",
        created_by=admin_u.id,
    )
    db_session.add(cdoa1)
    db_session.commit()

    # Query with area1 hint
    ctx1 = ContextResolver.resolve(db_session, user=None, client_destination_hint=area1.id)
    assert ctx1.scope.destination_id == area1.id
    assert ctx1.scope.destination_name == "Kawasan Tebesaya"
    assert "CDOA-TBS-2026" in str(ctx1.scope.cdoa_version)
    assert ctx1.scope.cdoa_escalation_channel == "08111222333"

    # Destination switch to area2: context from area1 must NOT leak
    ctx2 = ContextResolver.resolve(db_session, user=None, client_destination_hint=area2.id)
    assert ctx2.scope.destination_id == area2.id
    assert ctx2.scope.destination_name == "Kawasan Sanur"
    assert ctx2.scope.cdoa_escalation_channel is None  # area2 has no CDOA


def test_conversation_endpoints_and_ownership(client, db_session: Session):
    """Test conversation thread lifecycle and strict ownership enforcement."""
    # 1. Setup User 1 and User 2
    u1 = _create_user(db_session, f"conv_u1_{uuid.uuid4().hex[:6]}@kedas.bali", "RESIDENT")
    u2 = _create_user(db_session, f"conv_u2_{uuid.uuid4().hex[:6]}@kedas.bali", "RESIDENT")

    from app.core.dependencies import hash_token
    from app.core.security import generate_token
    from app.modules.account.models import AuthSession

    def _login(u: User) -> str:
        tok = generate_token(32)
        sess = AuthSession(
            user_id=u.id,
            token_hash=hash_token(tok),
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
        db_session.add(sess)
        db_session.commit()
        return tok

    st1 = _login(u1)
    st2 = _login(u2)
    h1 = {"Authorization": f"Bearer {st1}"}
    h2 = {"Authorization": f"Bearer {st2}"}

    # 2. User 1 creates conversation
    create_resp = client.post(
        "/api/v1/ai/conversations",
        json={"title": "Pemilahan Sampah Dapur", "destination_id": None},
        headers=h1,
    )
    assert create_resp.status_code == 201
    conv_data = create_resp.json()
    conv_id = conv_data["id"]
    assert conv_data["title"] == "Pemilahan Sampah Dapur"

    # 3. User 1 queries EcoGuide with conversation_id
    query_resp = client.post(
        "/api/v1/ai/ecoguide",
        json={"question": "Bagaimana cara memilah sisa makanan?", "conversation_id": conv_id},
        headers=h1,
    )
    assert query_resp.status_code == 200
    assert query_resp.json()["status"] in ["SUCCESS", "INSUFFICIENT_CONTEXT"]

    # 4. User 1 can view conversation detail with messages
    detail_resp = client.get(f"/api/v1/ai/conversations/{conv_id}", headers=h1)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert len(detail["messages"]) >= 2  # user message + ai message

    # 5. User 2 tries to access User 1's conversation -> FORBIDDEN (403)
    forbidden_resp = client.get(f"/api/v1/ai/conversations/{conv_id}", headers=h2)
    assert forbidden_resp.status_code == 403

    # 6. User 2 tries to ask question inside User 1's conversation -> FORBIDDEN (403)
    hack_resp = client.post(
        "/api/v1/ai/ecoguide",
        json={"question": "Halo?", "conversation_id": conv_id},
        headers=h2,
    )
    assert hack_resp.status_code == 403

    # 7. User 1 archives conversation
    arch_resp = client.patch(f"/api/v1/ai/conversations/{conv_id}/archive", headers=h1)
    assert arch_resp.status_code == 200
    assert arch_resp.json()["is_archived"] is True
