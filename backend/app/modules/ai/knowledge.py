"""Kedas — Knowledge Administration, Chunk Ingestion, and Scoped Retrieval."""

from __future__ import annotations

import hashlib
import re
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import NotFoundError
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
    """Ingest a new knowledge document, parse into scoped chunks, and publish."""
    raw_content = req.content_raw.strip()
    checksum = _compute_checksum(raw_content)

    doc = KnowledgeDocument(
        id=str(uuid.uuid4()),
        title=req.title,
        source_type=req.source_type.value,
        destination_id=req.destination_id,
        organization_id=req.organization_id,
        cdoa_id=req.cdoa_id,
        is_public=req.is_public,
        version=req.version,
        status=KnowledgeDocumentStatus.PUBLISHED.value,
        checksum=checksum,
        total_chunks=0,
        created_by=created_by,
    )
    db.add(doc)
    db.flush()

    # Split content into sections/paragraphs for granular provenance
    sections = re.split(r"\n(?=#{1,4}\s+|Pasal\s+\d+|Bab\s+[IVXLCDM]+)", raw_content)
    chunks: list[KnowledgeChunk] = []

    for index, sec in enumerate(sections):
        cleaned = sec.strip()
        if len(cleaned) < 15:
            continue

        # Extract title from first line if available
        first_line = cleaned.split("\n", 1)[0].strip()
        section_title = first_line[:100] if first_line.startswith(("#", "Pasal", "Bab", "SOP")) else None

        token_est = len(cleaned.split())
        chunk = KnowledgeChunk(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            chunk_index=index,
            section_title=section_title,
            content=cleaned,
            token_count=token_est,
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
) -> list[KnowledgeDocument]:
    """List knowledge documents with optional filters."""
    stmt = select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc())
    if destination_id:
        stmt = stmt.where(KnowledgeDocument.destination_id == destination_id)
    if source_type:
        stmt = stmt.where(KnowledgeDocument.source_type == source_type)
    if status:
        stmt = stmt.where(KnowledgeDocument.status == status)
    return list(db.scalars(stmt).all())


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


def update_knowledge_document_status(
    db: Session, doc_id: str, status: KnowledgeDocumentStatus
) -> KnowledgeDocument:
    """Update document status (e.g. PUBLISHED, RETIRED, DRAFT)."""
    doc = get_knowledge_document(db, doc_id)
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

    if is_public_only:
        stmt = stmt.where(KnowledgeDocument.is_public.is_(True))

    if destination_id:
        # Match destination specific or global documents (destination_id is NULL)
        stmt = stmt.where(
            (KnowledgeDocument.destination_id == destination_id)
            | (KnowledgeDocument.destination_id.is_(None))
        )

    if organization_id:
        stmt = stmt.where(
            (KnowledgeDocument.organization_id == organization_id)
            | (KnowledgeDocument.organization_id.is_(None))
        )

    results = db.execute(stmt).all()

    if not results:
        return []

    # Score chunks by hybrid lexical + domain semantic weighting
    stopwords = {
        "apakah", "bagaimana", "kapan", "dimana", "siapa", "mengapa", "dan", "atau",
        "di", "ke", "dari", "ini", "itu", "yang", "untuk", "pada", "adalah", "bisa",
        "hari", "apa", "dengan", "the", "a", "an", "is", "in", "to", "of", "and", "how", "what",
    }
    domain_boost_keywords = {
        # Waste categories & materials
        "organik", "anorganik", "residu", "b3", "canang", "upakara", "tirta", "plastik",
        "kaca", "kertas", "kardus", "logam", "medis", "limbah", "pilah", "daur", "kompos",
        # Governance, agreements, places & operations
        "cdoa", "banjar", "prajuru", "awig", "pararem", "pergub", "aturan", "sanksi",
        "jadwal", "penjemputan", "kapasitas", "tps3r", "sla", "eskalasi", "pos", "denda",
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
            bigram = f"{q_words[i]} {q_words[i+1]}"
            if bigram in content_lower:
                phrase_bonus += 0.35

        # Raw hybrid score computation
        raw_score = (
            token_matches
            + (title_matches * 2.0)
            + (section_matches * 1.5)
            + (domain_matches * 1.5)
            + phrase_bonus
        ) / max(1, len(query_tokens))

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
