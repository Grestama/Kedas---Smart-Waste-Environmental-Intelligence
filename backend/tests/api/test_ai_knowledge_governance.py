"""Kedas — Tahap 3 Knowledge Ingestion, Governance & Structure-Aware Chunking Tests."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account.models import User
from app.modules.ai.chunker import StructureAwareChunker
from app.modules.ai.knowledge import (
    ingest_document,
    scoped_retrieve_chunks,
)
from app.modules.ai.models import (
    AuthorityClass,
    KnowledgeDocumentStatus,
    KnowledgeSourceType,
)
from app.modules.ai.schemas import KnowledgeDocumentCreate


def _login(client, email: str, password: str) -> str:
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["session_token"]


def _register(client, email: str, full_name: str) -> tuple[str, dict]:
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": full_name, "password": "password_123"},
    )
    assert resp.status_code == 201, f"Register failed: {resp.text}"
    return resp.json()["session_token"], resp.json()["user"]


def test_structure_aware_chunking_regulation_clauses():
    """Verify regulatory text parser partitions by Bab, Pasal, and Ayat with accurate clause identifiers."""
    reg_content = (
        "BAB I: KETENTUAN UMUM\n\n"
        "Pasal 1\n"
        "Dalam Peraturan Gubernur ini yang dimaksud dengan sampah adalah sisa kegiatan sehari-hari.\n\n"
        "BAB II: PEMBATASAN TIMBULAN SAMPAH PLASTIK SEKALI PAKAI\n\n"
        "Pasal 5\n"
        "(1) Setiap produsen, distributor, dan pelaku usaha dilarang menyediakan kantong plastik sekali pakai.\n"
        "(2) Pelaku usaha wajib menyediakan kantong belanja ramah lingkungan guna ulang.\n"
        "(3) Pelanggaran terhadap ketentuan ayat (1) dikenakan sanksi administratif secara bertahap."
    )

    chunks = StructureAwareChunker.chunk(
        reg_content,
        source_type="REGULATION",
        authority_class="GOVERNMENT_PROVINCIAL",
    )

    assert len(chunks) >= 3
    # Look for Pasal 5 Ayat (1) and Ayat (2)
    clause_ids = [c.clause_identifier for c in chunks if c.clause_identifier]
    assert any("Pasal 5" in str(cid) for cid in clause_ids)
    assert any("Pasal 5 Ayat (1)" in str(cid) for cid in clause_ids)
    assert any("Pasal 5 Ayat (2)" in str(cid) for cid in clause_ids)

    # Context title contains Bab
    titles = [c.section_title for c in chunks if c.section_title]
    assert any("BAB II" in str(t) for t in titles)


def test_structure_aware_chunking_adat_awig_awig():
    """Verify customary Balinese awig-awig/pararem parser preserves Pawos and customary headings."""
    adat_content = (
        "Pawos 7: Indik Palemahan lan Wewidangan Kedas\n"
        "Krama desa adat kaenterang nyaga karesikan palemahan banjar lan pura saking luhu plastik.\n\n"
        "Pawos 14: Pamidanda Kasisipan Buang Sampah ring Telabah\n"
        "Sira sane ngutang luhu ring telabah utawi tukad keni denda beras 25 kg lan patut ngresikin genah punika."
    )

    chunks = StructureAwareChunker.chunk(
        adat_content,
        source_type="AWIG_AWIG",
        authority_class="DESA_ADAT",
    )

    assert len(chunks) == 2
    assert chunks[0].clause_identifier == "Pawos 7"
    assert "Palemahan" in str(chunks[0].section_title)
    assert chunks[1].clause_identifier == "Pawos 14"
    assert "Pamidanda" in str(chunks[1].section_title)


def test_knowledge_lifecycle_and_governance_workflow(client, db_session: Session):
    """Test full document governance lifecycle: PENDING_REVIEW -> PUBLISHED, REJECTED, EXPIRED, SUPERSEDED."""
    # 1. Setup Admin and Citizen
    admin_email = f"gov_admin_{uuid.uuid4().hex[:6]}@kedas.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Gov Admin")
    admin_user = db_session.query(User).filter_by(email=admin_email).first()
    assert admin_user is not None
    admin_token = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    citizen_email = f"gov_user_{uuid.uuid4().hex[:6]}@kedas.bali"
    citizen_token, citizen_data = _register(client, citizen_email, "Citizen User")
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # 2. Ingest document in PENDING_REVIEW state
    create_req = KnowledgeDocumentCreate(
        title="Peraturan Daerah Pengelolaan Sampah Ubud",
        source_type=KnowledgeSourceType.REGULATION,
        authority_class=AuthorityClass.GOVERNMENT_REGENCY,
        is_public=True,
        version="1.0",
        content_raw=(
            "BAB I: KETENTUAN UMUM\n\n"
            "Pasal 3\n"
            "Pengelolaan sampah berbasis sumber di kawasan Ubud wajib melibatkan Desa Adat."
        ),
        tags=["ubud", "perda", "desa-adat"],
        initial_status=KnowledgeDocumentStatus.PENDING_REVIEW,
    )
    doc = ingest_document(db_session, create_req, created_by=admin_user.id)
    assert doc.status == KnowledgeDocumentStatus.PENDING_REVIEW.value

    # Pending document must NOT be retrieved by runtime EcoGuide
    retrieved_pending = scoped_retrieve_chunks(db_session, query="pengelolaan sampah ubud")
    assert not any(d.id == doc.id for _, d, _ in retrieved_pending)

    # 3. Citizen attempts to approve -> FORBIDDEN (403)
    resp_hack = client.post(
        f"/api/v1/ai/knowledge/{doc.id}/approve",
        json={"notes": "Illegal citizen approval"},
        headers=citizen_headers,
    )
    assert resp_hack.status_code == 403

    # 4. Admin approves document -> transitions to PUBLISHED
    resp_approve = client.post(
        f"/api/v1/ai/knowledge/{doc.id}/approve",
        json={"notes": "Disetujui untuk operasional kawasan Ubud."},
        headers=admin_headers,
    )
    assert resp_approve.status_code == 200
    doc_approved = resp_approve.json()
    assert doc_approved["status"] == KnowledgeDocumentStatus.PUBLISHED.value

    # Approved document IS now retrievable
    retrieved_published = scoped_retrieve_chunks(db_session, query="pengelolaan sampah ubud")
    assert any(d.id == doc.id for _, d, _ in retrieved_published)

    # 5. Ingest second document and test REJECT flow
    create_req2 = KnowledgeDocumentCreate(
        title="Draft SOP Sampah Tidak Terverifikasi",
        source_type=KnowledgeSourceType.SOP,
        authority_class=AuthorityClass.COMMUNITY,
        content_raw="Sampah dibakar setiap sore hari di pekarangan belakang.",
        initial_status=KnowledgeDocumentStatus.PENDING_REVIEW,
    )
    doc2 = ingest_document(db_session, create_req2, created_by=admin_user.id)

    resp_reject = client.post(
        f"/api/v1/ai/knowledge/{doc2.id}/reject",
        json={"reason": "Pembakaran sampah dilarang keras oleh Pergub Bali No. 47/2019."},
        headers=admin_headers,
    )
    assert resp_reject.status_code == 200
    assert resp_reject.json()["status"] == KnowledgeDocumentStatus.REJECTED.value

    # Rejected document must NEVER be retrievable
    retrieved_reject = scoped_retrieve_chunks(db_session, query="pembakaran sampah pekarangan")
    assert not any(d.id == doc2.id for _, d, _ in retrieved_reject)

    # 6. Test Expiry Guardrail
    doc_exp = ingest_document(
        db_session,
        KnowledgeDocumentCreate(
            title="SOP Musiman Festival Kuta 2023",
            source_type=KnowledgeSourceType.SOP,
            content_raw="Penjemputan botol kaca festival dilakukan pada booth utama pantai.",
            effective_until=datetime.now(UTC) - timedelta(days=30),  # expired 30 days ago
            initial_status=KnowledgeDocumentStatus.PUBLISHED,
        ),
        created_by=admin_user.id,
    )
    # Expired document must be excluded from runtime retrieval
    retrieved_exp = scoped_retrieve_chunks(db_session, query="penjemputan botol kaca festival kuta")
    assert not any(d.id == doc_exp.id for _, d, _ in retrieved_exp)

    # 7. Test Supersede flow
    doc_new = ingest_document(
        db_session,
        KnowledgeDocumentCreate(
            title="SOP TPS3R Sanur Baru 2026",
            source_type=KnowledgeSourceType.SOP,
            content_raw="Protokol penjemputan baru Sanur 2026 telah diperbarui.",
            initial_status=KnowledgeDocumentStatus.PUBLISHED,
        ),
        created_by=admin_user.id,
    )
    resp_supersede = client.post(
        f"/api/v1/ai/knowledge/{doc.id}/supersede",
        json={"superseded_by_id": doc_new.id},
        headers=admin_headers,
    )
    assert resp_supersede.status_code == 200
    assert resp_supersede.json()["status"] == KnowledgeDocumentStatus.SUPERSEDED.value
