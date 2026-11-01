"""Kedas — Tahap 5 Answer Grounding, Citation Integrity & Abstention Tests."""

from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.ai.knowledge import ingest_document
from app.modules.ai.models import (
    AuthorityClass,
    KnowledgeDocument,
    KnowledgeDocumentStatus,
    KnowledgeSourceType,
)
from app.modules.ai.schemas import CitationSchema, KnowledgeDocumentCreate
from app.modules.ai.service import (
    create_conversation,
    validate_and_prune_citations,
)


def test_structured_output_contract_claims_and_limitations(client, db_session: Session):
    """Verify EcoGuideResponse includes claims, limitations, and suggested next steps."""
    # Ingest baseline document
    ingest_document(
        db_session,
        KnowledgeDocumentCreate(
            title="SOP Pemilahan Botol Kaca Sanur 2026",
            source_type=KnowledgeSourceType.SOP,
            authority_class=AuthorityClass.INTERNAL_SOP,
            content_raw=(
                "# Prosedur Botol Kaca\n"
                "Botol kaca sirup dan bir wajib dipisahkan dalam krat tersendiri dan tidak boleh dipecahkan."
            ),
            initial_status=KnowledgeDocumentStatus.PUBLISHED,
        ),
        created_by="system",
    )

    resp = client.post(
        "/api/v1/ai/ecoguide",
        json={"question": "Bagaimana cara memilah botol kaca bir di Sanur?"},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "SUCCESS"
    assert len(data["citations"]) > 0
    assert len(data["claims"]) > 0
    assert len(data["limitations"]) > 0
    assert data["suggested_next_step"] is not None
    assert "SOP Pemilahan Botol Kaca" in data["claims"][0]


def test_citation_integrity_validator_pruning():
    """Verify that validate_and_prune_citations prunes hallucinated citations."""
    doc_real = KnowledgeDocument(
        id=str(uuid.uuid4()),
        title="Dokumen Resmi Valid",
        checksum="dummy",
        created_by="admin",
    )

    valid_cit = CitationSchema(
        id="cit-001",
        source_id=doc_real.id,
        title="Dokumen Resmi Valid",
        excerpt="Teks valid",
    )
    hallucinated_cit = CitationSchema(
        id="cit-fake",
        source_id="non-existent-doc-uuid-12345",
        title="Dokumen Halusinasi Palsu",
        excerpt="Teks palsu",
    )

    pruned = validate_and_prune_citations([valid_cit, hallucinated_cit], [doc_real])
    assert len(pruned) == 1
    assert pruned[0].id == "cit-001"
    assert pruned[0].source_id == doc_real.id


def test_multi_turn_conversation_context_preservation(client, db_session: Session):
    """Verify multi-turn memory retains previous context in sequential questions."""
    conv = create_conversation(db_session, user=None, title="Sesi Tanya Jawab Pemilahan")

    # Turn 1: Ask about organic waste
    resp1 = client.post(
        "/api/v1/ai/ecoguide",
        json={
            "question": "Apakah sisa canang sari termasuk sampah organik?",
            "conversation_id": conv.id,
        },
    )
    assert resp1.status_code == 200

    # Turn 2: Follow up question referencing turn 1 ("Bagaimana dengan bunganya?")
    resp2 = client.post(
        "/api/v1/ai/ecoguide",
        json={
            "question": "Lalu bagaimana jika bunganya masih segar?",
            "conversation_id": conv.id,
        },
    )
    assert resp2.status_code == 200
    detail_resp = client.get(f"/api/v1/ai/conversations/{conv.id}")
    assert detail_resp.status_code == 200
    messages = detail_resp.json()["messages"]
    assert len(messages) >= 4  # 2 user questions + 2 AI answers


def test_graceful_abstention_on_unverified_customary_rule(client):
    """Verify graceful abstention and escalation when unverified rule is queried."""
    resp = client.post(
        "/api/v1/ai/ecoguide",
        json={"question": "Berapa denda adat jika memelihara harimau siberia di pantai kuta?"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "INSUFFICIENT_CONTEXT"
    assert data["confidence_level"] == "LOW"
    assert len(data["citations"]) == 0
    assert data["abstain_reason"] is not None
    assert data["suggested_action"] is not None
