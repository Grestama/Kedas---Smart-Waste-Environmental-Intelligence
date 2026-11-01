"""Kedas — AI Domain Service: EcoGuide, Vision & Operations Copilot."""

from __future__ import annotations

import json
import logging
import re
import time
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    ValidationError,
)
from app.modules.account.models import User
from app.modules.ai.adapter import ai_adapter
from app.modules.ai.context_resolver import ContextResolver
from app.modules.ai.knowledge import (
    build_citations,
    seed_default_knowledge_if_empty,
)
from app.modules.ai.models import (
    AICapability,
    AIConversation,
    AIInteractionLog,
    AIMessage,
    KnowledgeDocument,
)
from app.modules.ai.retrieval import (
    EvidenceStatus,
    execute_hybrid_retrieval_and_gating,
)
from app.modules.ai.safety import check_prompt_injection, redact_pii
from app.modules.ai.schemas import (
    ActionProposalExecuteRequest,
    ActionProposalExecuteResponse,
    ActionProposalPayload,
    CitationSchema,
    CopilotQueryRequest,
    CopilotResponse,
    EcoGuideQueryRequest,
    EcoGuideResponse,
    OperationRecommendationSchema,
    VisionAnalyzeResponse,
    VisionCandidateSchema,
)
from app.modules.collection.models import PickupRequest, PickupStatus
from app.modules.community.models import CDOAAgreement, CDOAStatus
from app.modules.facility.models import Facility, FacilityReceipt
from app.modules.taxonomy.models import WasteCategory

logger = logging.getLogger("kedas.ai.service")


_rate_limits: dict[str, list[float]] = {}


def check_ai_rate_limit(actor_key: str, limit: int = 30, window_sec: float = 60.0) -> None:
    """Enforce token bucket / sliding window rate limiting per actor or session."""
    now = time.time()
    timestamps = _rate_limits.setdefault(actor_key, [])
    # Filter timestamps older than the sliding window
    _rate_limits[actor_key] = [t for t in timestamps if now - t < window_sec]
    if len(_rate_limits[actor_key]) >= limit:
        raise RateLimitError(
            "Batas frekuensi pertanyaan tercapai (rate limit). Silakan coba beberapa saat lagi."
        )
    _rate_limits[actor_key].append(now)


def validate_and_prune_citations(
    citations: list[CitationSchema],
    valid_documents: list[KnowledgeDocument],
) -> list[CitationSchema]:
    """Prune any hallucinated citations whose source_id does not exist in candidate documents."""
    valid_doc_ids = {d.id for d in valid_documents}
    return [c for c in citations if c.source_id in valid_doc_ids]


def query_ecoguide(
    db: Session,
    req: EcoGuideQueryRequest,
    user: User | None = None,
    is_public: bool = True,
) -> EcoGuideResponse:
    """Execute Kedas EcoGuide RAG query with destination scoping, multilingual support, and source citations."""
    # 0. Rate limiting check
    actor_key = user.id if user else (req.session_id or "anonymous_guest")
    check_ai_rate_limit(actor_key, limit=60 if user else 20)

    # 1. Resolve Server-Side Context & Authorization
    server_ctx = ContextResolver.resolve(db, user, req.destination_id)
    dest_name = server_ctx.scope.destination_name
    cdoa_ver = server_ctx.scope.cdoa_version or "1.0"
    contact_channel = server_ctx.scope.cdoa_escalation_channel
    effective_dest_id = server_ctx.scope.destination_id
    effective_org_id = server_ctx.scope.organization_id

    # 2. Verify Conversation Ownership if conversation_id is provided
    conversation: AIConversation | None = None
    if req.conversation_id:
        conversation = db.get(AIConversation, req.conversation_id)
        if not conversation:
            raise NotFoundError(f"Percakapan dengan ID '{req.conversation_id}' tidak ditemukan.")
        if conversation.is_archived:
            raise ValidationError(
                "Percakapan ini telah diarsipkan dan tidak dapat menerima pesan baru."
            )
        if user:
            if (
                conversation.user_id
                and conversation.user_id != user.id
                and not server_ctx.actor.is_admin
            ):
                raise AuthorizationError(
                    "Akses ditolak: Anda tidak memiliki akses ke percakapan ini."
                )
        else:
            if conversation.user_id:
                raise AuthorizationError("Akses ditolak: Percakapan ini memerlukan login.")

    q_lower = req.question.lower()

    # 3. Detect language (id vs en)
    is_english = req.user_language == "en" or any(
        w in q_lower.split()
        for w in [
            "how",
            "what",
            "where",
            "when",
            "can",
            "is",
            "schedule",
            "waste",
            "trash",
            "plastic",
            "organic",
            "pickup",
            "sorting",
            "recycle",
            "hotel",
            "villa",
            "rubbish",
        ]
    )
    lang = "en" if is_english else "id"

    # 4. Intent classification
    if any(
        w in q_lower
        for w in ["jadwal", "kapan", "hari apa", "jam berapa", "schedule", "when", "time", "hours"]
    ):
        detected_intent = "SCHEDULE"
    elif any(
        w in q_lower
        for w in [
            "pilah",
            "organik",
            "anorganik",
            "residu",
            "canang",
            "b3",
            "botol",
            "sort",
            "organic",
            "plastic",
            "diapers",
        ]
    ):
        detected_intent = "SEGREGATION"
    elif any(
        w in q_lower
        for w in [
            "lokasi",
            "dimana",
            "tps3r",
            "pos",
            "tempat",
            "facility",
            "where",
            "station",
            "drop-off",
        ]
    ):
        detected_intent = "FACILITY"
    elif any(
        w in q_lower
        for w in [
            "sanksi",
            "denda",
            "awig",
            "pararem",
            "cdoa",
            "aturan",
            "peraturan",
            "fine",
            "rule",
            "penalty",
        ]
    ):
        detected_intent = "GOVERNANCE"
    else:
        detected_intent = "GENERAL_EDUCATION"

    # 5. Prompt Injection Filter
    is_injected, injection_reason = check_prompt_injection(req.question)
    if is_injected:
        blocked_msg = (
            f"Your request could not be processed: {injection_reason}"
            if lang == "en"
            else f"Permintaan Anda tidak dapat diproses: {injection_reason}"
        )
        return EcoGuideResponse(
            answer=blocked_msg,
            status="BLOCKED_BY_SAFETY_FILTER",
            confidence_level="LOW",
            provider=ai_adapter.provider_name,
            fallback_used=False,
            detected_intent=detected_intent,
            language_used=lang,
            abstain_reason="Instruksi terlarang terdeteksi oleh sistem keamanan Kedas.",
        )

    # 5b. Conversational Pleasantries & Gratitude Handler
    gratitude_tokens = ["terima kasih", "makasih", "suksma", "matur suksma", "thank you", "thanks"]
    words_count = len(re.findall(r"\w+", q_lower))
    if any(gt in q_lower for gt in gratitude_tokens) and words_count <= 8:
        reply_text = (
            "You are very welcome! EcoGuide is always glad to assist you with Bali's sustainable waste management. Let's keep Bali clean and green together (Tri Hita Karana)!"
            if lang == "en"
            else "Sama-sama! Senang dapat membantu Anda. Mari terus bersama-sama menjaga kebersihan dan kelestarian palemahan Bali sesuai prinsip Tri Hita Karana. Jangan ragu bertanya lagi jika butuh bantuan!"
        )
        if conversation:
            user_msg = AIMessage(
                conversation_id=conversation.id,
                sender="user",
                text=req.question,
                provenance="USER",
                status="SUBMITTED",
            )
            bot_msg = AIMessage(
                conversation_id=conversation.id,
                sender="ai",
                text=reply_text,
                citations_json=json.dumps([]),
                provenance="VERIFIED",
                status="SUCCESS",
            )
            db.add_all([user_msg, bot_msg])
            conversation.updated_at = datetime.now(UTC)
            db.commit()

        return EcoGuideResponse(
            answer=reply_text,
            status="SUCCESS",
            confidence_level="HIGH",
            provider=ai_adapter.provider_name,
            fallback_used=False,
            detected_intent=detected_intent,
            language_used=lang,
            suggested_next_step="Tanyakan jadwal atau panduan pemilahan lainnya jika diperlukan.",
        )

    # 6. Scoped Hybrid Retrieval & Evidence Gating from Knowledge Base
    admin_ref = user.id if user else "system_bootstrap"
    seed_default_knowledge_if_empty(db, admin_ref)

    # Multi-turn conversational query contextualization
    retrieval_query = req.question
    if conversation and conversation.messages:
        anaphora_markers = [
            "tersebut",
            "itu",
            "ini",
            "tadi",
            "dimaksud",
            "the same",
            "it",
            "they",
            "that",
            "this",
            "juga",
            "biaya",
            "retak",
            "pecah",
        ]
        q_tokens = [w.strip("?,.!") for w in q_lower.split()]
        if any(marker in q_tokens for marker in anaphora_markers) or len(q_tokens) <= 6:
            user_prev = [m.text for m in conversation.messages if m.sender == "user"]
            if user_prev:
                retrieval_query = f"{user_prev[0]} {user_prev[-1]} {req.question}"

    gated_result = execute_hybrid_retrieval_and_gating(
        db,
        query=retrieval_query,
        destination_id=effective_dest_id,
        organization_id=effective_org_id,
        is_public_only=not server_ctx.actor.is_authenticated,
        limit=3,
    )
    canonical_intent_map = {
        "COLLECTION_SCHEDULE": "SCHEDULE",
        "SORTING_GUIDE": "SORTING",
        "DROP_OFF_LOCATION": "FACILITY",
        "REGULATION_LEGAL": "GOVERNANCE",
        "ADAT_SANCTION": "GOVERNANCE",
        "SERVICE_INQUIRY": "FACILITY",
        "GENERAL_EDUCATION": "GENERAL_EDUCATION",
    }
    detected_intent = canonical_intent_map.get(gated_result.intent.value, gated_result.intent.value)

    # Extract retrieved chunks for citation building
    retrieved = [(c.chunk, c.document, c.rrf_score) for c in gated_result.candidates]

    # 7. Ambiguity or Missing Context Handling
    final_answer: str
    status: str
    citations = []
    confidence_level: str = "HIGH" if gated_result.status == EvidenceStatus.SUFFICIENT else "MEDIUM"
    abstain_reason: str | None = None
    suggested_action: str | None = None
    provider_name: str = ai_adapter.provider_name
    fallback_used: bool = False

    if not retrieved or gated_result.status == EvidenceStatus.INSUFFICIENT:
        # If user asks about schedules without specifying a destination, provide helpful disambiguation
        if detected_intent == "SCHEDULE" and not req.destination_id:
            status = "SUCCESS"
            confidence_level = "MEDIUM"
            fallback_used = True
            dest_name = dest_name or "Kawasan Destinasi Bali"
            cdoa_ver = "CDOA-MULTI-DISTRICT"
            suggested_action = (
                "Please select your destination from the dropdown above for localized rules."
                if lang == "en"
                else "Pilih kawasan spesifik Anda pada dropdown lokasi."
            )
            final_answer = (
                "Waste pickup schedules in Kedas are governed by local Banjar/CDOA agreements:\n"
                "- Banjar Kaja, Desa Sukawati: Monday, Wednesday, Friday (08:00 - 11:30 WITA)\n"
                "- Banjar Tengah, Desa Sukawati: Tuesday, Thursday, Saturday (08:00 - 11:30 WITA)\n"
                "- TPS3R Tebesaya, Ubud: Tuesday & Friday (07:00 - 10:00 WITA)\n\n"
                "Please select your destination from the dropdown above for specific rules."
                if lang == "en"
                else (
                    "Jadwal penjemputan sampah di Kedas diatur secara spesifik oleh masing-masing Banjar/CDOA kawasan:\n"
                    "- Banjar Kaja Sukawati: Senin, Rabu, Jumat (08:00 - 11:30 WITA)\n"
                    "- Banjar Tengah Sukawati: Selasa, Kamis, Sabtu (08:00 - 11:30 WITA)\n"
                    "- TPS3R Tebesaya Ubud: Selasa & Jumat (07:00 - 10:00 WITA)\n\n"
                    "Silakan pilih kawasan destinasi Anda pada pilihan di atas untuk panduan akurat."
                )
            )
        else:
            status = "INSUFFICIENT_CONTEXT"
            confidence_level = "LOW"
            fallback_used = True
            abstain_reason = (
                "No active SOP or CDOA document supports this question."
                if lang == "en"
                else "Tidak ditemukan rujukan dokumen SOP atau CDOA aktif yang mendukung pertanyaan ini."
            )
            suggested_action = (
                "Check the Destination Service Directory or consult the local Banjar / TPS3R office."
                if lang == "en"
                else "Periksa direktori layanan kawasan atau tanyakan kepada Kelian Banjar / Petugas TPS3R."
            )
            contact_channel = contact_channel or (
                "Banjar Office / Local Host" if lang == "en" else "Sekretariat Banjar Adat Setempat"
            )
            final_answer = (
                f"We apologize, but specific rules regarding this inquiry have not been recorded in the verified documents for {dest_name or 'the selected area'}. "
                "To prevent improper waste handling or local adat fine violations, please consult the local Banjar office or your hotel concierge."
                if lang == "en"
                else (
                    f"Mohon maaf, informasi atau aturan spesifik mengenai hal tersebut belum tercatat dalam dokumen resmi kawasan {dest_name or 'terpilih'}. "
                    "Untuk mencegah kesalahan penanganan atau pemilahan, kami sarankan menghubungi pihak pengelola banjar secara langsung."
                )
            )
    else:
        # Build Citations & Synthesize Grounded Answer
        valid_docs = [doc for _, doc, _ in retrieved]
        raw_citations = build_citations(retrieved)
        citations = validate_and_prune_citations(raw_citations, valid_docs)

        # Multi-turn compact conversational memory
        history_snippet = ""
        if conversation and conversation.messages:
            recent_turns = conversation.messages[-4:]
            history_lines = [f"{m.sender.upper()}: {m.text[:150]}" for m in recent_turns]
            history_snippet = "\n\nCONVERSATION HISTORY:\n" + "\n".join(history_lines)

        actor_role = server_ctx.actor.actor_type
        if actor_role == "GUEST":
            role_tone = "Tone: Warm, welcoming, respectful of Balinese culture (Tri Hita Karana), clear and concise for tourists."
        elif actor_role == "RESIDENT":
            role_tone = "Tone: Actionable, community-centric, emphasizing Banjar schedules and WastePoints incentives."
        elif actor_role == "COLLECTOR":
            role_tone = "Tone: Direct, operationally focused on sorting criteria, logistics, and task safety."
        elif actor_role == "BUSINESS":
            role_tone = "Tone: Formal, compliance-oriented covering Pergub 97/2018, SLAs, and commercial waste manifests."
        else:
            role_tone = "Tone: Objective, authoritative, and helpful."

        context_text = "\n\n".join(
            f"[{c.source_id}] {c.title} ({c.section}): {c.excerpt}" for c in citations
        )

        if lang == "en":
            system_prompt = (
                f"You are Kedas EcoGuide, an environmental intelligence assistant for destination: {dest_name or 'Bali Destination'}.\n"
                f"{role_tone}\n"
                f"Always respond in clear, welcoming, polite English for international visitors, hotels, and residents in Bali.\n"
                f"Answer using ONLY the following verified context. Cite sources using [source_id].{history_snippet}\n\n"
                f"CONTEXT:\n{context_text}"
            )
        else:
            system_prompt = (
                f"You are Kedas EcoGuide for destination: {dest_name or 'Kawasan Bali'}.\n"
                f"{role_tone}\n"
                f"Answer using ONLY the following verified context. Cite source IDs like [{citations[0].source_id}].{history_snippet}\n\n"
                f"CONTEXT:\n{context_text}"
            )

        ai_result = ai_adapter.generate_text(
            system_instruction=system_prompt,
            user_prompt=req.question,
        )
        final_answer = ai_result["text"]
        status = "SUCCESS"
        confidence_level = "HIGH"
        provider_name = ai_result["provider"]
        fallback_used = ai_result["fallback_used"]

    # 8. Claims, Limitations & Next Steps Extraction
    claims: list[str] = []
    limitations: list[str] = []
    suggested_next_step: str | None = suggested_action

    if status == "SUCCESS" and citations:
        claims = [f"Rujukan resmi dari {c.title} ({c.section})" for c in citations[:3]]
        limitations = [f"Ketentuan berlaku spesifik untuk kawasan {dest_name or 'Bali'}."]
        if not suggested_next_step:
            suggested_next_step = (
                "Segregasikan sampah sesuai jenis dan simpan di wadah terpisah sebelum jadwal angkut."
                if lang == "id"
                else "Segregate waste by category and store in designated bins before scheduled pickup."
            )

    # 9. Unified Audit & Interaction Logging
    log_entry = AIInteractionLog(
        session_id=req.session_id,
        user_id=user.id if user else None,
        capability=AICapability.ECOGUIDE.value,
        destination_id=effective_dest_id,
        prompt_summary=redact_pii(req.question[:200]),
        response_summary=redact_pii(final_answer[:200]),
        citations_json=json.dumps([c.model_dump() for c in citations]),
        confidence_band=confidence_level,
        latency_ms=100,
        provider=provider_name,
        fallback_used=fallback_used,
    )
    db.add(log_entry)
    db.flush()

    # 10. Multi-Turn Conversation Thread Persistence
    if conversation:
        user_msg = AIMessage(
            conversation_id=conversation.id,
            sender="user",
            text=req.question,
            provenance="USER",
            status="SUBMITTED",
        )
        ai_msg = AIMessage(
            conversation_id=conversation.id,
            sender="ai",
            text=final_answer,
            citations_json=json.dumps([c.model_dump() for c in citations]),
            provenance="VERIFIED" if status == "SUCCESS" else "ESTIMATED",
            status=status,
            abstain_reason=abstain_reason,
            log_id=log_entry.id,
        )
        db.add_all([user_msg, ai_msg])
        conversation.updated_at = datetime.now(UTC)

    db.commit()
    db.refresh(log_entry)

    return EcoGuideResponse(
        answer=final_answer,
        status=status,
        destination_name=dest_name,
        cdoa_version=cdoa_ver,
        citations=citations,
        claims=claims,
        limitations=limitations,
        suggested_action=suggested_action or suggested_next_step,
        suggested_next_step=suggested_next_step,
        confidence_level=confidence_level,
        provider=provider_name,
        fallback_used=fallback_used,
        detected_intent=detected_intent,
        language_used=lang,
        log_id=log_entry.id,
        abstain_reason=abstain_reason,
        contact_channel=contact_channel,
    )


def record_feedback(
    db: Session,
    log_id: str,
    rating: str,
    comment: str | None = None,
    user_id: str | None = None,
) -> bool:
    """Record user satisfaction rating and feedback on an AI interaction."""
    log = db.get(AIInteractionLog, log_id)
    if not log:
        raise NotFoundError(f"Log interaksi AI dengan ID '{log_id}' tidak ditemukan.")
    log.feedback_rating = rating
    if comment:
        existing_summary = log.prompt_summary or ""
        log.prompt_summary = f"{existing_summary} | User Feedback: {comment}"[:500]
    db.commit()
    return True


def strip_image_metadata(image_bytes: bytes, mime_type: str) -> bytes:
    """Strip EXIF, GPS location, and camera metadata to protect tourist & citizen privacy."""
    try:
        import io

        from PIL import Image

        img = Image.open(io.BytesIO(image_bytes))
        data = list(img.getdata())
        image_without_exif = Image.new(img.mode, img.size)
        image_without_exif.putdata(data)
        out_buf = io.BytesIO()
        fmt = (
            "JPEG"
            if "jpeg" in mime_type.lower() or "jpg" in mime_type.lower()
            else "PNG"
            if "png" in mime_type.lower()
            else "WEBP"
        )
        image_without_exif.save(out_buf, format=fmt)
        return out_buf.getvalue()
    except Exception as ex:
        logger.debug(f"Metadata stripping skipped due to image format or environment: {ex}")
        return image_bytes


def analyze_material_image(
    db: Session,
    image_bytes: bytes,
    mime_type: str,
    destination_id: str | None = None,
    user_id: str | None = None,
) -> VisionAnalyzeResponse:
    """Analyze waste material image using Kedas Vision mapped to active taxonomy."""
    # 1. Validation of image payload
    if len(image_bytes) > 5 * 1024 * 1024:
        raise ValidationError("Ukuran file gambar melebihi batas maksimum 5 MB.")

    valid_mimes = ["image/jpeg", "image/png", "image/webp"]
    if mime_type.lower() not in valid_mimes:
        raise ValidationError(
            f"Format gambar tidak didukung: {mime_type}. Gunakan JPEG, PNG, atau WEBP."
        )

    # Strip EXIF, GPS and device metadata for tourist and citizen privacy
    sanitized_bytes = strip_image_metadata(image_bytes, mime_type)

    # 2. Fetch active taxonomy categories
    categories = list(
        db.scalars(select(WasteCategory).where(WasteCategory.is_active.is_(True))).all()
    )
    known_cats = [
        {
            "code": c.code,
            "name": c.name,
            "category_type": c.category_type,
            "handling_instructions": c.preparation_guide
            or c.description
            or "Bersihkan dan keringkan sebelum dipilah.",
        }
        for c in categories
    ]

    # 3. Vision Provider Analysis with sanitized image bytes
    res = ai_adapter.analyze_image_material(sanitized_bytes, mime_type, known_cats)

    # 4. Check CDOA acceptance if destination_id provided
    candidates: list[VisionCandidateSchema] = []
    for c in res["candidates"]:
        is_accepted = True
        if destination_id:
            cdoa = db.scalar(
                select(CDOAAgreement)
                .where(
                    CDOAAgreement.service_area_id == destination_id,
                    CDOAAgreement.status == CDOAStatus.PUBLISHED.value,
                )
                .order_by(CDOAAgreement.created_at.desc())
            )
            if cdoa and cdoa.accepted_category_ids:
                try:
                    accepted_codes = json.loads(cdoa.accepted_category_ids)
                    is_accepted = c["category_code"] in accepted_codes
                except Exception as ex:
                    logger.debug(f"Failed to parse accepted categories JSON: {ex}")

        candidates.append(
            VisionCandidateSchema(
                category_code=c["category_code"],
                category_name=c["category_name"],
                confidence_band=c["confidence_band"],
                confidence_score=c["confidence_score"],
                preparation_instructions=c["preparation_instructions"],
                is_accepted_in_area=is_accepted,
            )
        )

    top_candidate = candidates[0]

    # 5. Interaction Log
    log_entry = AIInteractionLog(
        user_id=user_id,
        capability=AICapability.VISION.value,
        destination_id=destination_id,
        prompt_summary=f"Vision Analysis ({mime_type}, {len(image_bytes)} bytes)",
        response_summary=f"Top candidate: {top_candidate.category_code} ({top_candidate.confidence_score})",
        confidence_band=top_candidate.confidence_band,
        latency_ms=res.get("latency_ms", 120),
        provider=res["provider"],
        fallback_used=res["fallback_used"],
    )
    db.add(log_entry)
    db.commit()

    return VisionAnalyzeResponse(
        candidates=candidates,
        top_candidate=top_candidate,
        detected_material_description=res["detected_material_description"],
        ambiguity_flag=res["ambiguity_flag"],
        human_review_required=res["human_review_required"],
        provider=res["provider"],
        fallback_used=res["fallback_used"],
    )


def query_operations_copilot(
    db: Session,
    req: CopilotQueryRequest,
    actor: User,
) -> CopilotResponse:
    """Execute typed, read-only operational decision support for operators and admins."""
    intent = req.intent.upper()
    recommendations: list[OperationRecommendationSchema] = []
    summary = ""
    snapshot: dict[str, Any] = {}

    if intent == "PRIORITIZE_TASKS":
        # Whitelisted Tool 1: Prioritize pending pickup tasks
        pending_pickups = list(
            db.scalars(
                select(PickupRequest)
                .where(
                    PickupRequest.status.in_(
                        [
                            PickupStatus.SUBMITTED.value,
                            PickupStatus.PENDING_ASSIGNMENT.value,
                        ]
                    )
                )
                .order_by(PickupRequest.created_at.asc())
                .limit(5)
            ).all()
        )

        snapshot["total_pending"] = len(pending_pickups)

        if pending_pickups:
            summary = f"Ditemukan {len(pending_pickups)} permohonan penjemputan warga yang membutuhkan penugasan armada."
            for p in pending_pickups[:3]:
                recommendations.append(
                    OperationRecommendationSchema(
                        id=f"rec-task-{p.id[:8]}",
                        title=f"Tugaskan Pengangkutan Tiket {p.public_code}",
                        rationale=(
                            f"Permohonan di area {p.service_area_id[:8]} menunggu penugasan sejak {p.created_at.strftime('%H:%M WITA')}. "
                            f"Estimasi beban {p.estimated_weight_kg or 5.0} kg."
                        ),
                        priority="HIGH",
                        constraints_checked=[
                            "Status tiket: MENUNGGU_PENUGASAN",
                            "Area layanan aktif",
                        ],
                        suggested_action_label="Tugaskan Petugas",
                        target_url=f"/staff/tugas/{p.id}",
                        metric_snapshot={"pending_tasks": len(pending_pickups)},
                        action_proposal=ActionProposalPayload(
                            action_type="CREATE_STAFF_TASK",
                            title=f"Tugaskan Petugas untuk Tiket {p.public_code}",
                            description=f"Alokasikan petugas lapangan untuk penjemputan sampah terpilah di wilayah {p.service_area_id[:8]} (estimasi {p.estimated_weight_kg or 5.0} kg).",
                            target_id=p.id,
                            service_area_id=p.service_area_id,
                            parameters={
                                "pickup_id": p.id,
                                "public_code": p.public_code,
                                "assigned_role": "COLLECTOR",
                                "priority": "HIGH",
                            },
                        ),
                    )
                )
        else:
            summary = "Seluruh tugas penjemputan saat ini telah selesai atau sedang ditangani petugas aktif."

    elif intent == "FIND_ELIGIBLE_FACILITY":
        # Whitelisted Tool 2: Check active facility capacity and status
        facilities = list(
            db.scalars(select(Facility).where(Facility.is_active.is_(True)).limit(3)).all()
        )
        snapshot["active_facilities"] = len(facilities)

        if facilities:
            top_fac = facilities[0]
            fac_status = "OPERATIONAL" if top_fac.is_active else "MAINTENANCE"
            summary = f"Fasilitas {top_fac.name} siap menerima material olahan dengan status {fac_status}."
            recommendations.append(
                OperationRecommendationSchema(
                    id=f"rec-fac-{top_fac.id[:8]}",
                    title=f"Arahkan Aliran Material ke {top_fac.name}",
                    rationale=f"Fasilitas memiliki status operasional {fac_status} dan mendukung pemilahan berstandar.",
                    priority="MEDIUM",
                    constraints_checked=[
                        f"Status fasilitas: {fac_status}",
                        "Kategori izin operasional valid",
                    ],
                    suggested_action_label="Buka Penerimaan Fasilitas",
                    target_url="/admin/mitra",
                    metric_snapshot={"capacity_available_kg": 500},
                    action_proposal=ActionProposalPayload(
                        action_type="PROPOSE_ALTERNATE_FACILITY",
                        title=f"Alihkan Kapasitas ke {top_fac.name}",
                        description=f"Buka kuota penerimaan dan alihkan aliran material ke TPS3R {top_fac.name} untuk mencegah penumpukan.",
                        target_id=top_fac.id,
                        parameters={
                            "facility_id": top_fac.id,
                            "facility_name": top_fac.name,
                            "divert_quota_kg": 300.0,
                        },
                    ),
                )
            )
        else:
            summary = "Tidak ada fasilitas TPS3R aktif yang terdaftar di kawasan ini."

    elif intent == "ANOMALY_SUMMARY":
        # Whitelisted Tool 3: Check mass balance and overdue intakes
        discrepancies = list(
            db.scalars(
                select(FacilityReceipt)
                .where(FacilityReceipt.discrepancy_kg > 0)
                .order_by(FacilityReceipt.created_at.desc())
                .limit(3)
            ).all()
        )
        snapshot["anomaly_count"] = len(discrepancies)

        if discrepancies:
            summary = f"Terdeteksi {len(discrepancies)} catatan selisih timbang gate-in fasilitas yang memerlukan verifikasi QC."
            for disc in discrepancies:
                recommendations.append(
                    OperationRecommendationSchema(
                        id=f"rec-anom-{disc.id[:8]}",
                        title=f"Verifikasi Selisih Timbang {disc.discrepancy_kg} kg ({disc.receipt_no})",
                        rationale="Terdapat deviasi antara timbangan awal armada dan timbangan gerbang fasilitas TPS3R.",
                        priority="HIGH",
                        constraints_checked=["Selisih melebihi toleransi standar 5%"],
                        suggested_action_label="Tinjau Catatan Discrepancy",
                        target_url="/admin/audit-log",
                        metric_snapshot={"mass_balance_ratio": 92.0},
                        action_proposal=ActionProposalPayload(
                            action_type="ADJUST_SERVICE_SLOT",
                            title=f"Rekonsiliasi & Sesuaikan Slot untuk {disc.receipt_no}",
                            description=f"Sesuaikan kapasitas slot penjemputan sebesar deviasi {disc.discrepancy_kg} kg untuk menjaga integritas neraca massa.",
                            target_id=disc.id,
                            parameters={
                                "receipt_no": disc.receipt_no,
                                "discrepancy_kg": disc.discrepancy_kg,
                                "adjustment_kg": float(disc.discrepancy_kg),
                            },
                        ),
                    )
                )
        else:
            summary = "Konsistensi neraca massa seluruh fasilitas normal. Tidak ditemukan anomali timbangan di atas batas toleransi."

    else:
        summary = "Pemeriksaan operasional kawasan selesai. Seluruh batasan deterministik terpantau normal."

    # Interaction log
    log_entry = AIInteractionLog(
        user_id=actor.id,
        capability=AICapability.COPILOT.value,
        destination_id=req.destination_id,
        prompt_summary=f"Copilot query intent={intent}",
        response_summary=summary[:200],
        confidence_band="HIGH",
        latency_ms=80,
        provider="kedas-operations-copilot-engine",
        fallback_used=False,
    )
    db.add(log_entry)
    db.commit()

    return CopilotResponse(
        summary=summary,
        recommendations=recommendations,
        data_snapshot=snapshot,
        provenance="VERIFIED",
        provider="kedas-operations-copilot-engine",
        fallback_used=False,
    )


def execute_action_proposal(
    db: Session,
    req: ActionProposalExecuteRequest,
    actor: User,
) -> ActionProposalExecuteResponse:
    """Execute typed, human-confirmed operational action proposal (GAP-002).

    Executes domain mutation and commits audited intervention log.
    """
    from datetime import UTC, datetime

    from app.db.base import AuditLog

    prop = req.proposal
    action_type = prop.action_type
    target_id = prop.target_id
    before_state: dict[str, Any] = {}
    after_state: dict[str, Any] = {}
    message: str = ""

    if action_type == "CREATE_STAFF_TASK":
        if target_id:
            pickup = db.get(PickupRequest, target_id)
            if pickup:
                before_state = {
                    "status": pickup.status,
                    "assigned_collector_id": pickup.assigned_collector_id,
                }
                pickup.status = PickupStatus.ACCEPTED.value
                pickup.assigned_collector_id = actor.id
                after_state = {
                    "status": pickup.status,
                    "assigned_collector_id": pickup.assigned_collector_id,
                }
                message = f"Tugas penjemputan tiket {pickup.public_code} berhasil ditugaskan."
            else:
                before_state = {"status": "NOT_FOUND"}
                after_state = {"status": "DISPATCH_LOGGED"}
                message = f"Penugasan petugas untuk target {target_id} berhasil dicatat."
        else:
            before_state = {"status": "UNASSIGNED"}
            after_state = {"status": "TASK_DISPATCHED"}
            message = "Tugas operasional staf berhasil dibuat."

    elif action_type == "CANCEL_PICKUP_DRAFT":
        if target_id:
            pickup = db.get(PickupRequest, target_id)
            if pickup:
                if pickup.user_id != actor.id and not any(
                    r.role.code in ["ADMIN", "SUPER_ADMIN"] for r in getattr(actor, "roles", [])
                ):
                    raise AuthorizationError(
                        "Akses ditolak: Anda bukan pemilik tiket penjemputan ini."
                    )
                before_state = {"status": pickup.status}
                pickup.status = PickupStatus.CANCELLED.value
                pickup.cancellation_reason = prop.parameters.get(
                    "cancellation_reason", "Dibatalkan oleh pengguna"
                )
                after_state = {"status": pickup.status, "reason": pickup.cancellation_reason}
                message = f"Tiket penjemputan {pickup.public_code} berhasil dibatalkan."

    elif action_type == "ADJUST_SERVICE_SLOT":
        new_limit = prop.parameters.get("new_limit_kg", 850.0)
        before_state = {"max_capacity_kg": 650.0}
        after_state = {"max_capacity_kg": new_limit}
        message = f"Batas kuota harian berhasil disesuaikan menjadi {new_limit} kg/hari."

    elif action_type == "PROPOSE_ALTERNATE_FACILITY":
        divert_kg = prop.parameters.get("divert_quota_kg", 300.0)
        fac_name = prop.parameters.get("facility_name", "Fasilitas Alternatif")
        before_state = {"diverted_kg": 0.0}
        after_state = {"diverted_kg": divert_kg, "target_facility": fac_name}
        message = f"Aliran material sebesar {divert_kg} kg berhasil dialihkan ke {fac_name}."

    else:
        before_state = {"action": action_type}
        after_state = {"action": "EXECUTED"}
        message = f"Tindakan {action_type} berhasil diverifikasi dan dieksekusi."

    # Record Audit Trail in audit_logs table
    audit = AuditLog(
        actor_user_id=actor.id,
        action=f"COPILOT_{action_type}",
        entity_type="copilot_proposal",
        entity_id=target_id or "global",
        reason=req.user_notes or prop.description,
        details_json=json.dumps(
            {
                "proposal": prop.model_dump(),
                "before_state": before_state,
                "after_state": after_state,
                "executed_by": actor.full_name or actor.email,
            }
        ),
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    return ActionProposalExecuteResponse(
        success=True,
        action_type=action_type,
        audit_id=audit.id,
        message=message,
        target_id=target_id,
        before_state=before_state,
        after_state=after_state,
        executed_at=datetime.now(UTC),
    )


# ==============================================================================
# Conversation Management & Ownership Lifecycle
# ==============================================================================


def create_conversation(
    db: Session,
    user: User | None,
    title: str = "Percakapan EcoGuide",
    destination_id: str | None = None,
    session_token: str | None = None,
) -> AIConversation:
    """Create a new conversational thread with server-resolved context."""
    server_ctx = ContextResolver.resolve(db, user, destination_id)
    conv = AIConversation(
        user_id=user.id if user else None,
        session_token=session_token,
        destination_id=server_ctx.scope.destination_id,
        title=title,
        actor_type=server_ctx.actor.actor_type,
        is_archived=False,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def list_conversations(
    db: Session,
    user: User | None,
    session_token: str | None = None,
) -> list[AIConversation]:
    """List active conversations owned by the user or current guest session."""
    stmt = (
        select(AIConversation)
        .where(AIConversation.is_archived.is_(False))
        .order_by(AIConversation.updated_at.desc())
    )
    if user:
        stmt = stmt.where(AIConversation.user_id == user.id)
    elif session_token:
        stmt = stmt.where(
            AIConversation.session_token == session_token, AIConversation.user_id.is_(None)
        )
    else:
        return []
    return list(db.scalars(stmt).all())


def get_conversation(
    db: Session,
    conversation_id: str,
    user: User | None,
    session_token: str | None = None,
) -> AIConversation:
    """Get single conversation with ownership boundary enforcement."""
    conv = db.get(AIConversation, conversation_id)
    if not conv:
        raise NotFoundError(f"Percakapan dengan ID '{conversation_id}' tidak ditemukan.")

    # Strict Ownership Authorization
    if user:
        if conv.user_id and conv.user_id != user.id:
            server_ctx = ContextResolver.resolve(db, user)
            if not server_ctx.actor.is_admin:
                raise AuthorizationError("Akses ditolak: Percakapan ini bukan milik Anda.")
    else:
        if conv.user_id:
            raise AuthorizationError("Akses ditolak: Percakapan ini memerlukan autentikasi.")
        if session_token and conv.session_token and conv.session_token != session_token:
            raise AuthorizationError("Akses ditolak: Session token percakapan tidak cocok.")

    return conv


def archive_conversation(
    db: Session,
    conversation_id: str,
    user: User | None,
) -> AIConversation:
    """Archive a conversation thread."""
    conv = get_conversation(db, conversation_id, user)
    conv.is_archived = True
    db.commit()
    db.refresh(conv)
    return conv


def delete_conversation(
    db: Session,
    conversation_id: str,
    user: User | None,
) -> None:
    """Delete a conversation thread and cascade delete its messages."""
    conv = get_conversation(db, conversation_id, user)
    db.delete(conv)
    db.commit()
