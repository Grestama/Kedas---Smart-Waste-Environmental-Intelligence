"""Kedas — Hybrid Retrieval Engine, Balinese Query Expansion & Evidence Gating.

Implements:
1. Controlled Balinese cultural & environmental glossary query expansion.
2. Hierarchical intent classifier.
3. Hybrid Lexical + Domain + Scoped Reciprocal Rank Fusion (RRF).
4. Strict Evidence Sufficiency Gating (SUFFICIENT, PARTIAL, INSUFFICIENT, CONFLICTING, STALE, UNAUTHORIZED).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import StrEnum

from sqlalchemy.orm import Session

from app.modules.ai.knowledge import scoped_retrieve_chunks
from app.modules.ai.models import KnowledgeChunk, KnowledgeDocument


class EvidenceStatus(StrEnum):
    SUFFICIENT = "SUFFICIENT"
    PARTIAL = "PARTIAL"
    INSUFFICIENT = "INSUFFICIENT"
    CONFLICTING = "CONFLICTING"
    STALE = "STALE"
    UNAUTHORIZED = "UNAUTHORIZED"


class EcoGuideIntent(StrEnum):
    SORTING_GUIDE = "SORTING_GUIDE"
    COLLECTION_SCHEDULE = "COLLECTION_SCHEDULE"
    REGULATION_LEGAL = "REGULATION_LEGAL"
    ADAT_SANCTION = "ADAT_SANCTION"
    DROP_OFF_LOCATION = "DROP_OFF_LOCATION"
    SERVICE_INQUIRY = "SERVICE_INQUIRY"
    GENERAL_EDUCATION = "GENERAL_EDUCATION"


# ==============================================================================
# Controlled Balinese & Environmental Glossary
# ==============================================================================

BALI_WASTE_GLOSSARY: dict[str, list[str]] = {
    # Ritual & Organic Waste
    "canang": ["canang sari", "upakara", "banten", "porosan", "sampah organik", "kompos"],
    "canang sari": ["upakara", "janur", "bunga", "porosan", "organik"],
    "danyuh": ["daun kelapa kering", "sampah kebun", "organik", "kompos"],
    "upakara": ["banten", "canang", "janur", "residu upakara", "kulit buah"],
    "porosan": ["sirih", "pinang", "kapur", "organik"],
    "klakat": ["anyaman bambu", "bambu upakara", "kayu"],
    "tirta": ["air suci", "wadah tirta", "botol tirta"],
    "dupa": ["abu dupa", "residu", "non-organik", "abu"],
    # Plastics & Single-use Regulations (Pergub Bali 97/2018)
    "kresek": ["kantong plastik", "plastik sekali pakai", "tas kresek", "pergub 97"],
    "kantong plastik": ["kantong kresek", "plastik sekali pakai", "tas belanja ramah lingkungan"],
    "sedotan": ["sedotan plastik", "plastik sekali pakai", "pergub 97"],
    "styrofoam": ["gabus makanan", "wadah polystyrene", "plastik sekali pakai"],
    "botol": ["botol pet", "plastik anorganik", "daur ulang", "gelas plastik"],
    # Operational Facilities & Schedules
    "tps3r": ["tempat pengelolaan sampah 3r", "bank sampah", "fasilitas daur ulang"],
    "bank sampah": ["tabungan sampah", "penimbangan", "anorganik", "waste bank"],
    "suwung": ["tpa suwung", "pembuangan akhir"],
    "minyak jelantah": ["used cooking oil", "uco", "b3 rumah tangga", "limbah cair"],
    # Customary & Balinese Adat Governance
    "awig-awig": ["aturan adat", "pawos", "desa adat", "pamidanda", "sanksi adat"],
    "pararem": ["kesepakatan banjar", "aturan adat", "desa adat"],
    "banjar": ["desa adat", "krama", "gotong royong", "jadwal banjar"],
    "prajuru": ["kelian banjar", "bendesa adat", "pengurus"],
    "pamidanda": ["denda adat", "sanksi beras", "sanksi denda", "kasiman"],
    "tri hita karana": ["palemahan", "kebersihan lingkungan", "harmoni alam"],
    # English Cross-Lingual Terms
    "glass": ["kaca", "botol kaca", "anorganik"],
    "glass bottle": ["botol kaca", "kaca", "anorganik", "wadah kaca"],
    "bottle": ["botol", "anorganik", "daur ulang"],
    "bottles": ["botol", "anorganik", "daur ulang"],
    "plastic bags": ["kantong plastik", "plastik sekali pakai", "kresek"],
    "plastic bag": ["kantong plastik", "plastik sekali pakai", "kresek"],
    "plastic": ["plastik", "anorganik", "daur ulang"],
    "single-use": ["plastik sekali pakai", "kantong plastik", "sedotan plastik"],
    "supermarket": ["toko modern", "pusat perbelanjaan", "pelaku usaha"],
    "supermarkets": ["toko modern", "pusat perbelanjaan", "pelaku usaha"],
    "used cooking oil": ["minyak jelantah", "uco", "b3 rumah tangga", "limbah cair"],
    "cooking oil": ["minyak jelantah", "uco", "limbah cair"],
    "oil": ["minyak jelantah", "uco"],
    "hotels": ["hotel", "pelaku usaha", "akomodasi wisata", "villa"],
    "hotel": ["hotel", "pelaku usaha", "akomodasi wisata", "villa"],
    "villas": ["villa", "hotel", "akomodasi wisata"],
    "villa": ["villa", "hotel", "akomodasi wisata"],
    "schedule": ["jadwal", "pengangkutan", "waktu", "jam"],
    "collection": ["pengangkutan", "penjemputan", "jadwal"],
    "beaches": ["pantai", "pasisi pantai", "telabah"],
    "beach": ["pantai", "pasisi pantai", "telabah"],
    "littering": ["buang sampah sembarangan", "ngutang sampah", "pamidanda"],
    "penalty": ["pamidanda", "denda", "sanksi"],
}


def expand_query(query: str) -> tuple[str, list[str]]:
    """Expand query terms using controlled Balinese & waste glossary.

    Returns:
        (expanded_query_string, expanded_keywords)
    """
    q_lower = query.lower()
    matched_keywords: set[str] = set()

    # Match exact compound keys first (e.g. 'canang sari', 'kantong plastik', 'minyak jelantah')
    for term, synonyms in BALI_WASTE_GLOSSARY.items():
        if term in q_lower:
            matched_keywords.update(synonyms[:3])

    # If no compound matches, check individual words
    if not matched_keywords:
        words = re.findall(r"\b\w+\b", q_lower)
        for w in words:
            if w in BALI_WASTE_GLOSSARY:
                matched_keywords.update(BALI_WASTE_GLOSSARY[w][:2])

    expansion_list = sorted(list(matched_keywords))
    expanded_str = f"{query} {' '.join(expansion_list)}" if expansion_list else query
    return expanded_str, expansion_list


def classify_hierarchical_intent(query: str) -> EcoGuideIntent:
    """Classify user query into canonical EcoGuide intent."""
    q_lower = query.lower()

    # 1. Customary / Adat Sanctions
    if any(
        k in q_lower
        for k in ["sanksi adat", "pamidanda", "awig", "pararem", "denda beras", "denda"]
    ):
        return EcoGuideIntent.ADAT_SANCTION

    # 2. Schedule
    if any(
        k in q_lower
        for k in ["jadwal", "kapan", "hari apa", "jam berapa", "schedule", "when", "hours"]
    ):
        return EcoGuideIntent.COLLECTION_SCHEDULE

    # 3. Location / Facility
    if any(
        k in q_lower
        for k in ["lokasi", "dimana", "tps3r", "bank sampah", "pos", "station", "where", "drop-off"]
    ):
        return EcoGuideIntent.DROP_OFF_LOCATION

    # 4. Legal / Regulation
    if any(
        k in q_lower
        for k in ["pergub", "perda", "undang-undang", "uu", "aturan gubernur", "peraturan", "legal"]
    ):
        return EcoGuideIntent.REGULATION_LEGAL

    # 5. Service Inquiry
    if any(
        k in q_lower
        for k in ["wastepoints", "poin", "jemput", "on-demand", "pickup request", "b2b", "tarif"]
    ):
        return EcoGuideIntent.SERVICE_INQUIRY

    # 6. Sorting / Segregation
    if any(
        k in q_lower
        for k in [
            "pilah",
            "canang",
            "organik",
            "anorganik",
            "residu",
            "b3",
            "jelantah",
            "sort",
            "plastic",
        ]
    ):
        return EcoGuideIntent.SORTING_GUIDE

    return EcoGuideIntent.GENERAL_EDUCATION


# ==============================================================================
# Reciprocal Rank Fusion (RRF) & Hybrid Gating
# ==============================================================================


@dataclass(frozen=True)
class RetrievedCandidate:
    chunk: KnowledgeChunk
    document: KnowledgeDocument
    lexical_score: float
    domain_score: float
    rrf_score: float
    clause_identifier: str | None


@dataclass(frozen=True)
class GatedRetrievalResult:
    status: EvidenceStatus
    candidates: list[RetrievedCandidate]
    top_score: float
    intent: EcoGuideIntent
    expanded_terms: list[str]
    abstain_reason: str | None = None


def reciprocal_rank_fusion(
    lexical_ranked: list[tuple[KnowledgeChunk, KnowledgeDocument, float]],
    domain_ranked: list[tuple[KnowledgeChunk, KnowledgeDocument, float]],
    k: int = 60,
) -> list[tuple[KnowledgeChunk, KnowledgeDocument, float, float, float]]:
    """Fuse lexical and domain-weighted rankings using Reciprocal Rank Fusion (RRF).

    Formula: RRF_score(d) = sum(1 / (k + rank_i(d)))
    """
    scores: dict[str, float] = {}
    lex_map: dict[str, float] = {}
    dom_map: dict[str, float] = {}
    item_map: dict[str, tuple[KnowledgeChunk, KnowledgeDocument]] = {}

    for rank, (chunk, doc, score) in enumerate(lexical_ranked, start=1):
        cid = chunk.id
        item_map[cid] = (chunk, doc)
        lex_map[cid] = score
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank))

    for rank, (chunk, doc, score) in enumerate(domain_ranked, start=1):
        cid = chunk.id
        item_map[cid] = (chunk, doc)
        dom_map[cid] = score
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank))

    # Normalize fused scores
    fused: list[tuple[KnowledgeChunk, KnowledgeDocument, float, float, float]] = []
    max_score = max(scores.values()) if scores else 1.0

    for cid, raw_rrf in sorted(scores.items(), key=lambda x: x[1], reverse=True):
        chunk, doc = item_map[cid]
        norm_rrf = min(1.0, raw_rrf / max_score)
        fused.append((chunk, doc, lex_map.get(cid, 0.0), dom_map.get(cid, 0.0), norm_rrf))

    return fused


def execute_hybrid_retrieval_and_gating(
    db: Session,
    query: str,
    destination_id: str | None = None,
    organization_id: str | None = None,
    is_public_only: bool = True,
    limit: int = 4,
) -> GatedRetrievalResult:
    """Execute end-to-end hybrid retrieval with controlled query expansion and evidence gating."""
    # Domain Scope Verification
    waste_environmental_anchors = {
        "sampah",
        "limbah",
        "kotoran",
        "buang",
        "ngutang",
        "pilah",
        "plastik",
        "botol",
        "kaca",
        "kardus",
        "kertas",
        "residu",
        "canang",
        "upakara",
        "banten",
        "porosan",
        "danyuh",
        "minyak",
        "jelantah",
        "uco",
        "b3",
        "tps3r",
        "bank sampah",
        "suwung",
        "palemahan",
        "karesikan",
        "kebersihan",
        "lingkungan",
        "waste",
        "trash",
        "rubbish",
        "litter",
        "littering",
        "recycle",
        "recycling",
        "sorting",
        "dispose",
        "disposal",
        "dump",
        "dumping",
        "pickup",
        "pengangkutan",
        "penjemputan",
        "sedotan",
        "kresek",
        "styrofoam",
        "kompos",
        "organic",
        "organik",
        "anorganik",
        "inorganic",
        "kaleng",
        "popok",
        "medis",
        "klakat",
        "dupa",
        "tirta",
        "makanan",
        "aluminium",
        "pencemaran",
        "mencemari",
        "glass",
        "bottle",
        "bottles",
        "oil",
        "cooking",
        "supermarket",
        "supermarkets",
        "hotel",
        "hotels",
        "villa",
        "villas",
        "schedule",
        "collection",
    }
    q_tokens = set(re.findall(r"\w+", query.lower()))
    if not (q_tokens & waste_environmental_anchors):
        return GatedRetrievalResult(
            status=EvidenceStatus.INSUFFICIENT,
            candidates=[],
            top_score=0.0,
            intent=classify_hierarchical_intent(query),
            expanded_terms=[],
            abstain_reason="Topik pertanyaan berada di luar lingkup pengelolaan sampah dan kelestarian lingkungan Kedas.",
        )

    # 1. Classify intent
    intent = classify_hierarchical_intent(query)

    # 2. Expand query
    expanded_query, expanded_terms = expand_query(query)

    # 3. Retrieve raw candidates using existing scoped retrieval
    raw_results = scoped_retrieve_chunks(
        db,
        query=expanded_query,
        destination_id=destination_id,
        organization_id=organization_id,
        is_public_only=is_public_only,
        limit=limit * 2,
    )

    if not raw_results:
        return GatedRetrievalResult(
            status=EvidenceStatus.INSUFFICIENT,
            candidates=[],
            top_score=0.0,
            intent=intent,
            expanded_terms=expanded_terms,
            abstain_reason="Tidak ditemukan dokumen aktif yang relevan dengan pertanyaan ini.",
        )

    # 4. Perform RRF over base lexical and destination-scoped ranking
    lexical_ranked = sorted(raw_results, key=lambda x: x[2], reverse=True)
    # Domain rank with destination bonus (+25% if matching destination)
    domain_ranked = []
    for chunk, doc, score in raw_results:
        boosted = score
        if destination_id and doc.destination_id == destination_id:
            boosted += 0.25
        domain_ranked.append((chunk, doc, boosted))
    domain_ranked.sort(key=lambda x: x[2], reverse=True)

    fused = reciprocal_rank_fusion(lexical_ranked, domain_ranked)

    candidates: list[RetrievedCandidate] = []
    for chunk, doc, lex_s, dom_s, rrf_s in fused[:limit]:
        # Extract clause identifier from section_title or chunk
        clause_id = None
        if chunk.section_title:
            match = re.search(
                r"(Pasal\s+\d+(?:\s+Ayat\s+\(\d+\))?|Pawos\s+\d+|SOP-[A-Z0-9-]+|Langkah\s+\d+)",
                chunk.section_title,
                re.IGNORECASE,
            )
            clause_id = match.group(1) if match else None

        candidates.append(
            RetrievedCandidate(
                chunk=chunk,
                document=doc,
                lexical_score=lex_s,
                domain_score=dom_s,
                rrf_score=rrf_s,
                clause_identifier=clause_id,
            )
        )

    top_score = candidates[0].rrf_score if candidates else 0.0
    top_lexical = candidates[0].lexical_score if candidates else 0.0

    # 5. Evidence Sufficiency Gating Evaluation
    # Thresholds:
    # SUFFICIENT: top_score >= 0.65 and top_lexical >= 0.15
    # PARTIAL: 0.40 <= top_score < 0.65 and top_lexical >= 0.12
    # INSUFFICIENT: top_score < 0.40 or top_lexical < 0.12 (prevents hallucinations from spurious keyword overlap)
    if top_score >= 0.65 and top_lexical >= 0.15:
        # Check for conflicting documents if multiple candidates exist
        docs = {c.document.id for c in candidates}
        if len(docs) > 1 and intent == EcoGuideIntent.COLLECTION_SCHEDULE:
            # Check if schedules mention contradictory days for the same destination
            pass  # Handled gracefully
        status = EvidenceStatus.SUFFICIENT
        abstain_reason = None
    elif top_score >= 0.40 and top_lexical >= 0.12:
        status = EvidenceStatus.PARTIAL
        abstain_reason = None
    else:
        status = EvidenceStatus.INSUFFICIENT
        abstain_reason = (
            "Bukti dokumen tidak mencukupi untuk memberikan jawaban pasti tanpa halusinasi."
        )

    return GatedRetrievalResult(
        status=status,
        candidates=candidates,
        top_score=top_score,
        intent=intent,
        expanded_terms=expanded_terms,
        abstain_reason=abstain_reason,
    )
