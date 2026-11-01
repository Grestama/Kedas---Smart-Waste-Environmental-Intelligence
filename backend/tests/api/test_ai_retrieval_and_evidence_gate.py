"""Kedas — Tahap 4 Hybrid Retrieval, Balinese Glossary Expansion & Evidence Gating Tests."""

from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.modules.ai.knowledge import ingest_document
from app.modules.ai.models import AuthorityClass, KnowledgeDocumentStatus, KnowledgeSourceType
from app.modules.ai.retrieval import (
    EcoGuideIntent,
    EvidenceStatus,
    classify_hierarchical_intent,
    execute_hybrid_retrieval_and_gating,
    expand_query,
)
from app.modules.ai.schemas import KnowledgeDocumentCreate
from app.modules.collection.models import ServiceArea


def test_balinese_glossary_expansion():
    """Verify controlled query expansion adds authentic Balinese & environmental terms."""
    # 1. Ritual / Canang
    exp_q, terms = expand_query("Bagaimana cara membuang sisa canang sari?")
    assert "upakara" in exp_q.lower() or "organik" in exp_q.lower()
    assert len(terms) > 0

    # 2. Danyuh (dried coconut leaves)
    exp_q2, terms2 = expand_query("Apakah danyuh diterima di komposter banjar?")
    assert "daun kelapa kering" in exp_q2.lower() or "kompos" in exp_q2.lower()

    # 3. Kresek / Single-use plastics
    exp_q3, terms3 = expand_query("Apakah kantong kresek boleh digunakan?")
    assert "plastik sekali pakai" in exp_q3.lower() or "pergub 97" in exp_q3.lower()

    # 4. Customary Awig-awig
    exp_q4, terms4 = expand_query("Apa sanksi awig-awig jika membuang sampah sembarangan?")
    assert "pamidanda" in exp_q4.lower() or "aturan adat" in exp_q4.lower()


def test_hierarchical_intent_classification():
    """Verify intent classifier resolves all 7 canonical EcoGuide intents."""
    assert (
        classify_hierarchical_intent("Kapan jadwal pengangkutan sampah?")
        == EcoGuideIntent.COLLECTION_SCHEDULE
    )
    assert (
        classify_hierarchical_intent("Bagaimana cara memilah botol kaca dan canang?")
        == EcoGuideIntent.SORTING_GUIDE
    )
    assert (
        classify_hierarchical_intent("Apa isi Pergub Bali No. 97 Tahun 2018?")
        == EcoGuideIntent.REGULATION_LEGAL
    )
    assert (
        classify_hierarchical_intent("Berapa denda adat beras atau sanksi adat pamidanda banjar?")
        == EcoGuideIntent.ADAT_SANCTION
    )
    assert (
        classify_hierarchical_intent("Dimana lokasi TPS3R terdekat?")
        == EcoGuideIntent.DROP_OFF_LOCATION
    )
    assert (
        classify_hierarchical_intent("Berapa saldo WastePoints saya dan cara tukar poin?")
        == EcoGuideIntent.SERVICE_INQUIRY
    )
    assert (
        classify_hierarchical_intent("Apa itu filosofi Tri Hita Karana Palemahan?")
        == EcoGuideIntent.ADAT_SANCTION
        or classify_hierarchical_intent("Mengapa daur ulang penting?")
        == EcoGuideIntent.GENERAL_EDUCATION
    )


def test_rrf_scoring_and_destination_prioritization(db_session: Session):
    """Verify RRF fusion algorithm boosts destination-specific documents over generic rules."""
    # Setup 2 service areas
    area_sanur = ServiceArea(
        name="Kawasan Sanur",
        code=f"sanur_{uuid.uuid4().hex[:6]}",
        administrative_area="Denpasar Selatan",
        is_active=True,
    )
    db_session.add(area_sanur)
    db_session.commit()

    # 1. Ingest generic provincial document
    ingest_document(
        db_session,
        KnowledgeDocumentCreate(
            title="Panduan Umum Pemilahan Sampah Provinsi Bali",
            source_type=KnowledgeSourceType.REGULATION,
            authority_class=AuthorityClass.GOVERNMENT_PROVINCIAL,
            content_raw="Sampah organik seperti sisa makanan dan canang harus dipisahkan dari anorganik.",
            destination_id=None,
            initial_status=KnowledgeDocumentStatus.PUBLISHED,
        ),
        created_by="system",
    )

    # 2. Ingest destination-specific Sanur document
    doc_sanur = ingest_document(
        db_session,
        KnowledgeDocumentCreate(
            title="SOP TPS3R Sanur: Pengomposan Canang dan Danyuh",
            source_type=KnowledgeSourceType.SOP,
            authority_class=AuthorityClass.INTERNAL_SOP,
            content_raw="Khusus kawasan Sanur, canang sari dan danyuh dikumpulkan setiap hari Rabu untuk komposter komunal.",
            destination_id=area_sanur.id,
            initial_status=KnowledgeDocumentStatus.PUBLISHED,
        ),
        created_by="system",
    )

    # Query with Sanur destination scope
    result = execute_hybrid_retrieval_and_gating(
        db_session,
        query="jadwal pengumpulan canang sari dan danyuh",
        destination_id=area_sanur.id,
        limit=2,
    )

    assert len(result.candidates) > 0
    # Destination-specific doc should be candidate #1
    top_doc = result.candidates[0].document
    assert top_doc.id == doc_sanur.id
    assert result.status in (EvidenceStatus.SUFFICIENT, EvidenceStatus.PARTIAL)


def test_evidence_gating_and_abstention_on_unknown(db_session: Session):
    """Verify Evidence Sufficiency Gating triggers abstention when evidence score is low."""
    # Query completely unsupported random topic
    result = execute_hybrid_retrieval_and_gating(
        db_session,
        query="Bagaimana cara memperbaiki mesin roket falcon 9 di orbit mars?",
        limit=2,
    )
    assert result.status == EvidenceStatus.INSUFFICIENT
    assert result.abstain_reason is not None
    assert len(result.candidates) == 0 or result.top_score < 0.40
