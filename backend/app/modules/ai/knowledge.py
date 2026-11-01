"""Kedas — Knowledge Administration, Chunk Ingestion, and Scoped Retrieval."""

from __future__ import annotations

import hashlib
import json
import re
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import NotFoundError, ValidationError
from app.modules.ai.chunker import StructureAwareChunker
from app.modules.ai.models import (
    KnowledgeChunk,
    KnowledgeDocument,
    KnowledgeDocumentStatus,
    KnowledgeSourceType,
)
from app.modules.ai.safety import sanitize_retrieved_context
from app.modules.ai.schemas import CitationSchema, KnowledgeDocumentCreate


def _compute_checksum(content: str) -> str:
    """Calculate SHA-256 checksum of document content."""
    return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()


def ingest_document(
    db: Session,
    req: KnowledgeDocumentCreate,
    created_by: str,
) -> KnowledgeDocument:
    """Ingest a new knowledge document, parse into structure-aware scoped chunks, and set lifecycle status."""
    raw_content = req.content_raw.strip()
    checksum = _compute_checksum(raw_content)

    meta = {
        "authority_class": req.authority_class.value,
        "effective_from": req.effective_from.isoformat() if req.effective_from else None,
        "effective_until": req.effective_until.isoformat() if req.effective_until else None,
        "tags": req.tags,
        "review_notes": None,
        "rejection_reason": None,
        "approved_by": None,
        "approved_at": None,
    }

    doc = KnowledgeDocument(
        id=str(uuid.uuid4()),
        title=req.title,
        source_type=req.source_type.value,
        destination_id=req.destination_id,
        organization_id=req.organization_id,
        cdoa_id=req.cdoa_id,
        is_public=req.is_public,
        version=req.version,
        status=req.initial_status.value,
        checksum=checksum,
        total_chunks=0,
        metadata_json=json.dumps(meta),
        created_by=created_by,
    )
    db.add(doc)
    db.flush()

    # Use Structure-Aware Chunker preserving legal clauses, SOPs, and Adat structure
    parsed_chunks = StructureAwareChunker.chunk(
        raw_content,
        source_type=req.source_type.value,
        authority_class=req.authority_class.value,
    )

    chunks: list[KnowledgeChunk] = []
    for p_chunk in parsed_chunks:
        chunk = KnowledgeChunk(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            chunk_index=p_chunk.chunk_index,
            section_title=p_chunk.section_title,
            content=p_chunk.content,
            token_count=p_chunk.token_count,
        )
        db.add(chunk)
        chunks.append(chunk)

    doc.total_chunks = len(chunks)
    db.commit()
    db.refresh(doc)
    return doc


def list_knowledge_documents(
    db: Session,
    destination_id: str | None = None,
    source_type: str | None = None,
    status: str | None = None,
    authority_class: str | None = None,
    tag: str | None = None,
) -> list[KnowledgeDocument]:
    """List knowledge documents with optional filters."""
    stmt = select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc())
    if destination_id:
        stmt = stmt.where(KnowledgeDocument.destination_id == destination_id)
    if source_type:
        stmt = stmt.where(KnowledgeDocument.source_type == source_type)
    if status:
        stmt = stmt.where(KnowledgeDocument.status == status)

    docs = list(db.scalars(stmt).all())
    if authority_class:
        docs = [d for d in docs if d.authority_class == authority_class]
    if tag:
        docs = [
            d for d in docs if tag.lower() in [t.lower() for t in d.get_metadata().get("tags", [])]
        ]
    return docs


def get_knowledge_document(db: Session, doc_id: str) -> KnowledgeDocument:
    """Retrieve single knowledge document with eager-loaded chunks."""
    doc = db.scalar(
        select(KnowledgeDocument)
        .options(selectinload(KnowledgeDocument.chunks))
        .where(KnowledgeDocument.id == doc_id)
    )
    if not doc:
        raise NotFoundError(f"Dokumen pengetahuan dengan ID '{doc_id}' tidak ditemukan.")
    return doc


def approve_knowledge_document(
    db: Session, doc_id: str, approver_email: str, notes: str | None = None
) -> KnowledgeDocument:
    """Approve a pending knowledge document and transition to PUBLISHED."""
    doc = get_knowledge_document(db, doc_id)
    if doc.status == KnowledgeDocumentStatus.SUPERSEDED.value:
        raise ValidationError("Dokumen yang berstatus SUPERSEDED tidak dapat disetujui kembali.")
    if doc.status == KnowledgeDocumentStatus.EXPIRED.value:
        raise ValidationError(
            "Dokumen kedaluwarsa tidak dapat disetujui tanpa memperpanjang masa berlaku."
        )

    meta = doc.get_metadata()
    meta["approved_by"] = approver_email
    meta["approved_at"] = datetime.now(UTC).isoformat()
    if notes:
        meta["review_notes"] = notes
    doc.set_metadata(meta)
    doc.status = KnowledgeDocumentStatus.PUBLISHED.value
    db.commit()
    db.refresh(doc)
    return doc


def reject_knowledge_document(
    db: Session, doc_id: str, rejector_email: str, reason: str
) -> KnowledgeDocument:
    """Reject a knowledge document and transition to REJECTED."""
    doc = get_knowledge_document(db, doc_id)
    if doc.status == KnowledgeDocumentStatus.SUPERSEDED.value:
        raise ValidationError("Dokumen yang berstatus SUPERSEDED tidak dapat diubah statusnya.")

    meta = doc.get_metadata()
    meta["rejected_by"] = rejector_email
    meta["rejected_at"] = datetime.now(UTC).isoformat()
    meta["rejection_reason"] = reason
    doc.set_metadata(meta)
    doc.status = KnowledgeDocumentStatus.REJECTED.value
    db.commit()
    db.refresh(doc)
    return doc


def expire_knowledge_document(
    db: Session, doc_id: str, actor_email: str, reason: str | None = None
) -> KnowledgeDocument:
    """Manually mark a knowledge document as EXPIRED."""
    doc = get_knowledge_document(db, doc_id)
    if doc.status == KnowledgeDocumentStatus.SUPERSEDED.value:
        raise ValidationError("Dokumen yang berstatus SUPERSEDED tidak dapat diubah statusnya.")

    meta = doc.get_metadata()
    meta["expired_by"] = actor_email
    meta["expired_at"] = datetime.now(UTC).isoformat()
    if reason:
        meta["expiry_reason"] = reason
    doc.set_metadata(meta)
    doc.status = KnowledgeDocumentStatus.EXPIRED.value
    db.commit()
    db.refresh(doc)
    return doc


def supersede_knowledge_document(
    db: Session, doc_id: str, superseded_by_id: str, actor_email: str
) -> KnowledgeDocument:
    """Mark a knowledge document as SUPERSEDED by another active document."""
    doc = get_knowledge_document(db, doc_id)
    # verify replacement exists
    get_knowledge_document(db, superseded_by_id)

    meta = doc.get_metadata()
    meta["superseded_by_id"] = superseded_by_id
    meta["superseded_by_actor"] = actor_email
    meta["superseded_at"] = datetime.now(UTC).isoformat()
    doc.set_metadata(meta)
    doc.status = KnowledgeDocumentStatus.SUPERSEDED.value
    db.commit()
    db.refresh(doc)
    return doc


def update_knowledge_document_status(
    db: Session, doc_id: str, status: KnowledgeDocumentStatus
) -> KnowledgeDocument:
    """Update document status with lifecycle validation rules."""
    doc = get_knowledge_document(db, doc_id)
    if doc.status == KnowledgeDocumentStatus.SUPERSEDED.value:
        raise ValidationError(
            "Dokumen berstatus SUPERSEDED adalah arsip historis dan tidak dapat diubah statusnya."
        )
    if (
        doc.status == KnowledgeDocumentStatus.REJECTED.value
        and status == KnowledgeDocumentStatus.PUBLISHED
    ):
        raise ValidationError(
            "Dokumen yang ditolak harus melalui alur review formal atau diunggah ulang sebagai revisi baru."
        )
    if (
        doc.status == KnowledgeDocumentStatus.EXPIRED.value
        and status == KnowledgeDocumentStatus.PUBLISHED
        and doc.is_expired
    ):
        raise ValidationError(
            "Dokumen telah melewati masa berlaku (expired) dan tidak dapat langsung dipublikasikan."
        )

    doc.status = status.value
    db.commit()
    db.refresh(doc)
    return doc


def delete_knowledge_document(db: Session, doc_id: str) -> None:
    """Delete a document and cascade remove all its chunks."""
    doc = get_knowledge_document(db, doc_id)
    db.delete(doc)
    db.commit()


def scoped_retrieve_chunks(
    db: Session,
    query: str,
    destination_id: str | None = None,
    organization_id: str | None = None,
    is_public_only: bool = True,
    limit: int = 4,
) -> list[tuple[KnowledgeChunk, KnowledgeDocument, float]]:
    """Retrieve top relevant knowledge chunks using a hybrid scoring algorithm (GAP-003).

    Hybrid scoring combines:
    1. Exact token intersections (lexical overlap).
    2. Bali destination & environmental domain keyword weighting (organik, canang, awig-awig, denda, tps3r, etc.).
    3. Multi-word phrase matching bonus.
    4. Destination-scoped prioritization (boosts local banjar rules over generic provincial rules).

    Returns:
        List of (chunk, document, relevance_score) sorted descending by relevance_score.
    """
    stmt = (
        select(KnowledgeChunk, KnowledgeDocument)
        .join(KnowledgeDocument, KnowledgeChunk.document_id == KnowledgeDocument.id)
        .where(KnowledgeDocument.status == KnowledgeDocumentStatus.PUBLISHED.value)
    )

    # 1. Strict Tenant / Organization Isolation
    if is_public_only:
        stmt = stmt.where(
            KnowledgeDocument.is_public.is_(True),
            KnowledgeDocument.organization_id.is_(None),
        )
    elif organization_id:
        # Authorized member can see their own organization documents or global public documents
        stmt = stmt.where(
            (KnowledgeDocument.organization_id == organization_id)
            | (KnowledgeDocument.organization_id.is_(None) & KnowledgeDocument.is_public.is_(True))
        )
    else:
        # User without org membership cannot see any private organization documents
        stmt = stmt.where(KnowledgeDocument.organization_id.is_(None))

    # 2. Strict Destination Boundary
    if destination_id:
        # Match destination-specific or global provincial documents (destination_id is NULL)
        stmt = stmt.where(
            (KnowledgeDocument.destination_id == destination_id)
            | (KnowledgeDocument.destination_id.is_(None))
        )
    else:
        # If no destination is authorized/selected, strictly restrict to global public documents
        stmt = stmt.where(KnowledgeDocument.destination_id.is_(None))

    results = db.execute(stmt).all()
    # Filter out expired documents (effective_until passed or status EXPIRED)
    results = [r for r in results if not r[1].is_expired]

    if not results:
        return []

    # Score chunks by hybrid lexical + domain semantic weighting
    stopwords = {
        "apakah",
        "bagaimana",
        "kapan",
        "dimana",
        "siapa",
        "mengapa",
        "dan",
        "atau",
        "di",
        "ke",
        "dari",
        "ini",
        "itu",
        "yang",
        "untuk",
        "pada",
        "adalah",
        "bisa",
        "hari",
        "apa",
        "dengan",
        "the",
        "a",
        "an",
        "is",
        "in",
        "to",
        "of",
        "and",
        "how",
        "what",
    }
    domain_boost_keywords = {
        # Waste categories & materials
        "organik",
        "anorganik",
        "residu",
        "b3",
        "canang",
        "upakara",
        "tirta",
        "plastik",
        "kaca",
        "kertas",
        "kardus",
        "logam",
        "medis",
        "limbah",
        "pilah",
        "daur",
        "kompos",
        # Governance, agreements, places & operations
        "cdoa",
        "banjar",
        "prajuru",
        "awig",
        "pararem",
        "pergub",
        "aturan",
        "sanksi",
        "jadwal",
        "penjemputan",
        "kapasitas",
        "tps3r",
        "sla",
        "eskalasi",
        "pos",
        "denda",
    }

    clean_query = query.lower()
    raw_tokens = set(re.findall(r"\w+", clean_query))
    query_tokens = {t for t in raw_tokens if t not in stopwords and len(t) > 2}

    if not query_tokens:
        return []

    scored_results: list[tuple[KnowledgeChunk, KnowledgeDocument, float]] = []

    for chunk, doc in results:
        content_lower = chunk.content.lower()
        title_lower = doc.title.lower()
        section_lower = (chunk.section_title or "").lower()

        content_tokens = set(re.findall(r"\w+", content_lower))
        title_tokens = set(re.findall(r"\w+", title_lower))
        section_tokens = set(re.findall(r"\w+", section_lower))

        # 1. Lexical overlap
        token_matches = len(query_tokens & content_tokens)
        title_matches = len(query_tokens & title_tokens)
        section_matches = len(query_tokens & section_tokens)

        # 2. Domain keyword weighting boost
        domain_matches = len(query_tokens & domain_boost_keywords & content_tokens)

        # 3. Multi-word phrase matching bonus
        phrase_bonus = 0.0
        q_words = [w for w in re.findall(r"\w+", clean_query) if len(w) > 2]
        for i in range(len(q_words) - 1):
            bigram = f"{q_words[i]} {q_words[i + 1]}"
            if bigram in content_lower:
                phrase_bonus += 0.35

        # Raw hybrid score computation
        raw_score = (
            token_matches
            + (title_matches * 2.0)
            + (section_matches * 1.5)
            + (domain_matches * 1.5)
            + phrase_bonus
        ) / max(1, min(len(query_tokens), 6))

        # 4. Destination relevance boost (prioritize local banjar CDOA/SOP over generic provincial regulations)
        if destination_id and doc.destination_id == destination_id:
            raw_score *= 1.25

        # Normalized confidence score
        normalized_score = min(1.0, round(raw_score / 3.0, 3))

        if normalized_score >= 0.15 or raw_score >= 0.25:
            scored_results.append((chunk, doc, float(normalized_score)))

    # Sort descending by score
    scored_results.sort(key=lambda x: x[2], reverse=True)
    return scored_results[:limit]


def build_citations(
    chunks_with_docs: list[tuple[KnowledgeChunk, KnowledgeDocument, float]],
) -> list[CitationSchema]:
    """Convert retrieved chunks into structured claim citations with provenance."""
    citations: list[CitationSchema] = []
    for chunk, doc, _ in chunks_with_docs:
        excerpt = chunk.content[:200] + ("..." if len(chunk.content) > 200 else "")
        citations.append(
            CitationSchema(
                id=f"cit-{chunk.id[:8]}",
                source_id=doc.id,
                title=doc.title,
                section=chunk.section_title or f"Bagian {chunk.chunk_index + 1}",
                excerpt=sanitize_retrieved_context(excerpt),
                cdoa_version=doc.version,
            )
        )
    return citations


def seed_default_knowledge_if_empty(db: Session, admin_id: str) -> None:
    """Seed baseline pilot destination knowledge documents if table is empty."""
    count = db.scalar(select(KnowledgeDocument.id).limit(1))
    if count is not None:
        return

    # 1. Pergub Bali 47/2019
    ingest_document(
        db,
        KnowledgeDocumentCreate(
            title="Peraturan Gubernur Bali No. 47 Tahun 2019 tentang Pengelolaan Sampah Berbasis Sumber",
            source_type=KnowledgeSourceType.REGULATION,
            is_public=True,
            version="1.0",
            content_raw="""
# Bab I: Ketentuan Umum
Pengelolaan sampah berbasis sumber di Bali diwajibkan bagi seluruh rumah tangga, desa adat, dan pelaku usaha pariwisata.

# Bab II: Prinsip Pemilahan
Setiap sumber sampah wajib memilah sampah menjadi sekurang-kurangnya:
1. Sampah organik (sisa makanan, upakara/canang, dedaunan).
2. Sampah anorganik yang dapat didaur ulang (plastik, kaca, kertas, logam).
3. Sampah residu dan bahan berbahaya/beracun (B3).

# Bab III: Peran Desa Adat & Banjar
Desa Adat melalui awig-awig atau pararem mengatur jadwal pengumpulan dan sanksi adat terhadap pembuangan sampah sembarangan.
            """,
        ),
        created_by=admin_id,
    )

    # 2. SOP TPS3R Tebesaya Ubud
    ingest_document(
        db,
        KnowledgeDocumentCreate(
            title="SOP Operasional Pemilahan & Pengolahan TPS3R Tebesaya Ubud",
            source_type=KnowledgeSourceType.SOP,
            is_public=True,
            version="1.0",
            content_raw="""
# Standar Penerimaan Material Anorganik
Material anorganik berupa botol plastik PET, kaleng aluminium, dan kardus wajib dalam keadaan dibilas bersih dan kering.

# Jadwal & Kapasitas Penjemputan
Penjemputan anorganik dilakukan setiap hari Selasa dan Jumat pukul 07.00 - 10.00 WITA. Kapasitas pengolahan harian mesin conveyor adalah 1.500 kg per hari.

# Penanganan Residu & Penolakan
Material yang tercampur limbah B3 medis atau bangkai hewan langsung ditolak di tempat dan dilaporkan ke Prajuru Banjar.
            """,
        ),
        created_by=admin_id,
    )
