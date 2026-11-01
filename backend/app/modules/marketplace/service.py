"""WasteLink Bali — Circular Marketplace, Material Offers, Organic Processing & B2B Service Layer."""

from __future__ import annotations

import secrets
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import (
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from app.db.base import AuditLog
from app.modules.account.models import User
from app.modules.collection.models import PickupRequest, PickupStatus
from app.modules.facility.models import Facility
from app.modules.facility.service import get_category_stock
from app.modules.marketplace.models import (
    B2BLocation,
    B2BOrganization,
    B2BOrganizationMember,
    B2BPickupRequest,
    B2BPickupStatus,
    BatchStatus,
    DeliveryRecord,
    DeliveryStatus,
    MaterialBatch,
    MaterialBatchItem,
    MaterialOffer,
    OfferStatus,
    OfferType,
    OrganicProcessingRecord,
    OrganicStatus,
    Partner,
    PartnerVerificationStatus,
)
from app.modules.marketplace.schemas import (
    B2BLocationCreateRequest,
    B2BOrganizationCreateRequest,
    B2BPickupCreateRequest,
    B2BPickupStatusUpdateRequest,
    DeliveryConfirmProcessingRequest,
    DeliveryCreateRequest,
    DeliveryReceiptRequest,
    MaterialBatchCreateRequest,
    MaterialOfferAcceptRequest,
    MaterialOfferCreateRequest,
    OrganicProcessingCompleteRequest,
    OrganicProcessingStartRequest,
    PartnerCreateRequest,
    PartnerVerifyRequest,
)
from app.modules.taxonomy.models import WasteCategory

# ==============================================================================
# Partner Profiles & Verification Gating
# ==============================================================================


def create_partner(db: Session, req: PartnerCreateRequest) -> Partner:
    """Register a new buyer/processing partner."""
    status = (
        PartnerVerificationStatus.VERIFIED.value
        if req.is_verified
        else PartnerVerificationStatus.PENDING.value
    )
    partner = Partner(
        name=req.name,
        contact_email=req.contact_email,
        contact_phone=req.contact_phone,
        address=req.address,
        partner_type=req.partner_type.value,
        capacity_kg_per_month=req.capacity_kg_per_month,
        service_area_id=req.service_area_id,
        verification_status=status,
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


def verify_partner(
    db: Session,
    partner_id: str,
    req: PartnerVerifyRequest,
    admin_user: User,
) -> Partner:
    """Verify or suspend a partner organization."""
    partner = db.get(Partner, partner_id)
    if not partner:
        raise NotFoundError("Mitra tidak ditemukan.")

    partner.verification_status = req.verification_status.value
    partner.verified_at = datetime.now(UTC)
    partner.verified_by = admin_user.id

    audit = AuditLog(
        action="PARTNER_VERIFIED",
        actor_id=admin_user.id,
        entity_type="PARTNER",
        entity_id=partner.id,
        reason=f"Pembaruan status verifikasi mitra {partner.name}: {req.verification_status.value}. {req.notes or ''}".strip(),
        payload_after={"status": partner.verification_status},
    )
    db.add(audit)
    db.commit()
    db.refresh(partner)
    return partner


def list_partners(
    db: Session,
    verified_only: bool = True,
    partner_type: str | None = None,
) -> list[Partner]:
    """Retrieve circular economy partners."""
    stmt = select(Partner)
    if verified_only:
        stmt = stmt.where(Partner.verification_status == PartnerVerificationStatus.VERIFIED.value)
    if partner_type:
        stmt = stmt.where(Partner.partner_type == partner_type)
    stmt = stmt.order_by(Partner.name.asc())
    return list(db.scalars(stmt).all())


# ==============================================================================
# Material Batching & Verified Downstream Deliveries
# ==============================================================================


def create_material_batch(
    db: Session,
    creator: User,
    req: MaterialBatchCreateRequest,
    request_id: str | None = None,
) -> MaterialBatch:
    """Aggregate verified pickups into a single traceable material batch."""
    total_weight = 0.0

    for pid in req.pickup_ids:
        existing_item = db.scalar(
            select(MaterialBatchItem).where(MaterialBatchItem.pickup_id == pid)
        )
        if existing_item:
            raise ConflictError(
                f"Setoran sampah dengan ID '{pid}' telah terdaftar dalam batch material lain."
            )

        pickup = db.scalar(select(PickupRequest).where(PickupRequest.id == pid))
        if not pickup:
            raise NotFoundError(f"Setoran '{pid}' tidak ditemukan.")

        if pickup.status != PickupStatus.COMPLETED.value:
            raise ValidationError(
                f"Setoran '{pid}' belum berstatus COMPLETED (status saat ini: {pickup.status})."
            )

        if pickup.category_id != req.category_id:
            raise ValidationError(
                f"Kategori sampah pada setoran '{pid}' tidak sesuai dengan kategori batch."
            )

        weight = float(pickup.actual_weight_kg or 0.0)
        total_weight += weight

    date_str = datetime.now(UTC).strftime("%y%m%d")
    random_str = secrets.token_hex(2).upper()
    batch_code = f"BATCH-{date_str}-{random_str}"

    batch = MaterialBatch(
        batch_code=batch_code,
        category_id=req.category_id,
        total_weight_kg=round(total_weight, 3),
        status=BatchStatus.BATCHED.value,
        created_by=creator.id,
    )
    db.add(batch)
    db.flush()

    for pid in req.pickup_ids:
        pickup = db.scalar(select(PickupRequest).where(PickupRequest.id == pid))
        assert pickup is not None
        item = MaterialBatchItem(
            batch_id=batch.id,
            pickup_id=pid,
            weight_kg=float(pickup.actual_weight_kg or 0.0),
        )
        db.add(item)

    audit = AuditLog(
        action="MATERIAL_BATCH_CREATED",
        actor_id=creator.id,
        entity_type="MATERIAL_BATCH",
        entity_id=batch.id,
        request_id=request_id,
        payload_after={
            "batch_code": batch.batch_code,
            "category_id": batch.category_id,
            "total_weight_kg": batch.total_weight_kg,
            "pickup_count": len(req.pickup_ids),
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(batch)
    return batch


def list_material_batches(db: Session, status: str | None = None) -> list[MaterialBatch]:
    """Retrieve material batches with optional status filter."""
    stmt = select(MaterialBatch).order_by(MaterialBatch.created_at.desc())
    if status:
        stmt = stmt.where(MaterialBatch.status == status)
    return list(db.scalars(stmt).all())


def dispatch_delivery(
    db: Session,
    dispatcher: User,
    req: DeliveryCreateRequest,
    request_id: str | None = None,
) -> DeliveryRecord:
    """Dispatch a material batch to a verified partner."""
    batch = db.scalar(
        select(MaterialBatch).where(MaterialBatch.id == req.batch_id).with_for_update()
    )
    if not batch:
        raise NotFoundError("Batch material tidak ditemukan.")

    if batch.status not in [BatchStatus.BATCHED.value, BatchStatus.ALLOCATED.value]:
        raise ValidationError(
            f"Batch material dengan status '{batch.status}' tidak dapat dikirim."
        )

    if req.dispatched_weight_kg > float(batch.total_weight_kg):
        raise ValidationError(
            f"Jumlah material yang dikirim ({req.dispatched_weight_kg:.2f} kg) "
            f"melebihi kuantitas yang tersedia pada batch ({batch.total_weight_kg:.2f} kg)."
        )

    partner = db.scalar(select(Partner).where(Partner.id == req.partner_id))
    if not partner:
        raise NotFoundError("Mitra tidak ditemukan.")

    # Quality Gate Requirement: Unverified partner CANNOT be selected as confirmed delivery target
    if partner.verification_status != PartnerVerificationStatus.VERIFIED.value:
        raise ValidationError(
            f"Mitra '{partner.name}' belum berstatus terverifikasi (status: {partner.verification_status}). "
            f"Hanya mitra terverifikasi yang sah menjadi tujuan akhir pengiriman material."
        )

    delivery = DeliveryRecord(
        batch_id=batch.id,
        partner_id=partner.id,
        dispatched_weight_kg=req.dispatched_weight_kg,
        status=DeliveryStatus.DISPATCHED.value,
        dispatched_by=dispatcher.id,
        dispatched_at=datetime.now(UTC),
        notes=req.notes,
    )
    db.add(delivery)
    batch.status = BatchStatus.SHIPPED.value

    audit = AuditLog(
        action="DELIVERY_DISPATCHED",
        actor_id=dispatcher.id,
        entity_type="DELIVERY_RECORD",
        entity_id=delivery.id,
        request_id=request_id,
        payload_after={
            "batch_id": batch.id,
            "partner_id": partner.id,
            "dispatched_weight_kg": req.dispatched_weight_kg,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(delivery)
    return delivery


def confirm_delivery_receipt(
    db: Session,
    receiver: User,
    delivery_id: str,
    req: DeliveryReceiptRequest,
    request_id: str | None = None,
) -> DeliveryRecord:
    """Record receipt confirmation at partner facility without silently altering source records."""
    delivery = db.scalar(
        select(DeliveryRecord).where(DeliveryRecord.id == delivery_id).with_for_update()
    )
    if not delivery:
        raise NotFoundError("Catatan pengiriman tidak ditemukan.")

    if delivery.status != DeliveryStatus.DISPATCHED.value:
        raise ValidationError(
            f"Penerimaan tidak dapat dikonfirmasi pada status pengiriman '{delivery.status}'."
        )

    discrepancy = round(req.received_weight_kg - float(delivery.dispatched_weight_kg), 3)
    final_status = (
        DeliveryStatus.DISPUTED.value if discrepancy != 0.0 else DeliveryStatus.DELIVERED.value
    )

    delivery.received_weight_kg = req.received_weight_kg
    delivery.weight_discrepancy_kg = discrepancy
    delivery.status = final_status
    delivery.received_at = datetime.now(UTC)
    if req.notes:
        delivery.notes = f"{delivery.notes or ''}\n[Penerimaan]: {req.notes}".strip()

    batch = db.scalar(
        select(MaterialBatch).where(MaterialBatch.id == delivery.batch_id).with_for_update()
    )
    if batch:
        # Note: Status is RECEIVED (Diterima Mitra), NOT PROCESSED_CONFIRMED yet
        batch.status = BatchStatus.RECEIVED.value

    audit = AuditLog(
        action="DELIVERY_RECEIVED",
        actor_id=receiver.id,
        entity_type="DELIVERY_RECORD",
        entity_id=delivery.id,
        request_id=request_id,
        payload_after={
            "received_weight_kg": req.received_weight_kg,
            "discrepancy_kg": discrepancy,
            "status": final_status,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(delivery)
    return delivery


def confirm_delivery_processing(
    db: Session,
    actor: User,
    delivery_id: str,
    req: DeliveryConfirmProcessingRequest,
    request_id: str | None = None,
) -> DeliveryRecord:
    """Explicitly confirm that received material has been processed/recycled with verified proof."""
    delivery = db.scalar(
        select(DeliveryRecord).where(DeliveryRecord.id == delivery_id).with_for_update()
    )
    if not delivery:
        raise NotFoundError("Catatan pengiriman tidak ditemukan.")

    if delivery.status not in [DeliveryStatus.DELIVERED.value, DeliveryStatus.DISPUTED.value]:
        raise ValidationError(
            "Pemrosesan tidak dapat dikonfirmasi sebelum material berstatus diterima."
        )

    batch = db.scalar(
        select(MaterialBatch).where(MaterialBatch.id == delivery.batch_id).with_for_update()
    )
    if batch:
        batch.status = BatchStatus.PROCESSED_CONFIRMED.value

    delivery.notes = f"{delivery.notes or ''}\n[Bukti Pemrosesan]: {req.notes}".strip()

    audit = AuditLog(
        action="DELIVERY_PROCESSED_CONFIRMED",
        actor_id=actor.id,
        entity_type="DELIVERY_RECORD",
        entity_id=delivery.id,
        reason="Konfirmasi material telah diproses/didaur ulang oleh mitra hilir dengan bukti sah",
        request_id=request_id,
        payload_after={"batch_status": BatchStatus.PROCESSED_CONFIRMED.value},
    )
    db.add(audit)
    db.commit()
    db.refresh(delivery)
    return delivery


# ==============================================================================
# Material Demand & Supply Offers
# ==============================================================================


def create_material_offer(
    db: Session,
    req: MaterialOfferCreateRequest,
    creator_id: str,
) -> MaterialOffer:
    """Create a supply or demand listing with price and expiry timestamp."""
    cat = db.get(WasteCategory, req.category_id)
    if not cat:
        raise NotFoundError("Kategori sampah tidak ditemukan.")

    req_valid = req.valid_until
    if req_valid.tzinfo is None:
        req_valid = req_valid.replace(tzinfo=UTC)
    if req_valid <= datetime.now(UTC):
        raise ValidationError("Masa berlaku penawaran (valid_until) harus di masa depan.")

    if req.min_quantity_kg > req.max_quantity_kg:
        raise ValidationError("Kuantitas minimum tidak boleh melebihi kuantitas maksimum.")

    offer_no = f"OFR-{req.offer_type.value[:3]}-{datetime.now(UTC).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"

    offer = MaterialOffer(
        offer_no=offer_no,
        offer_type=req.offer_type.value,
        partner_id=req.partner_id,
        facility_id=req.facility_id,
        category_id=req.category_id,
        min_quantity_kg=req.min_quantity_kg,
        max_quantity_kg=req.max_quantity_kg,
        quality_grade=req.quality_grade,
        price_indicative_idr=req.price_indicative_idr,
        valid_until=req.valid_until,
        status=OfferStatus.OPEN.value,
        notes=req.notes,
        created_by=creator_id,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


def list_material_offers(
    db: Session,
    offer_type: str | None = None,
    category_id: str | None = None,
    status: str | None = None,
) -> list[MaterialOffer]:
    """Retrieve active material offers."""
    stmt = select(MaterialOffer)
    if offer_type:
        stmt = stmt.where(MaterialOffer.offer_type == offer_type)
    if category_id:
        stmt = stmt.where(MaterialOffer.category_id == category_id)
    if status:
        stmt = stmt.where(MaterialOffer.status == status)
    stmt = stmt.order_by(MaterialOffer.created_at.desc())
    return list(db.scalars(stmt).all())


def accept_material_offer(
    db: Session,
    offer_id: str,
    req: MaterialOfferAcceptRequest,
    actor_id: str,
    request_id: str | None = None,
) -> MaterialOffer:
    """Accept an offer with strict expiration and inventory availability checks."""
    stmt = select(MaterialOffer).where(MaterialOffer.id == offer_id).with_for_update()
    offer = db.scalar(stmt)
    if not offer:
        raise NotFoundError("Penawaran material tidak ditemukan.")

    # Quality Gate Requirement: Expired offers CANNOT be accepted without renewal
    valid_until = offer.valid_until
    if valid_until.tzinfo is None:
        valid_until = valid_until.replace(tzinfo=UTC)
    now = datetime.now(UTC)
    if valid_until <= now or offer.status == OfferStatus.EXPIRED.value:
        offer.status = OfferStatus.EXPIRED.value
        db.commit()
        raise ValidationError(
            f"Penawaran material #{offer.offer_no} telah kedaluwarsa pada "
            f"{offer.valid_until.isoformat()} dan tidak dapat diterima."
        )

    if offer.status != OfferStatus.OPEN.value:
        raise ValidationError(f"Penawaran dalam status '{offer.status}' tidak dapat diterima.")

    # Quality Gate Requirement: Allocated quantity CANNOT exceed available inventory/quantity
    if req.allocated_quantity_kg > float(offer.max_quantity_kg):
        raise ValidationError(
            f"Jumlah alokasi ({req.allocated_quantity_kg:.2f} kg) melebihi batas penawaran "
            f"({offer.max_quantity_kg:.2f} kg)."
        )

    # If it is a supply offer from a facility, check current stock
    if offer.offer_type == OfferType.SUPPLY.value and offer.facility_id:
        current_stock = get_category_stock(db, offer.facility_id, offer.category_id)
        if current_stock < req.allocated_quantity_kg:
            raise ValidationError(
                f"Jumlah alokasi ({req.allocated_quantity_kg:.2f} kg) melebihi stok fisik "
                f"yang tersedia di fasilitas ({current_stock:.2f} kg)."
            )

    offer.status = OfferStatus.ALLOCATED.value

    audit = AuditLog(
        action="MATERIAL_OFFER_ACCEPTED",
        actor_id=actor_id,
        entity_type="MATERIAL_OFFER",
        entity_id=offer.id,
        reason=f"Persetujuan penawaran material #{offer.offer_no} dengan alokasi {req.allocated_quantity_kg} kg",
        request_id=request_id,
        payload_after={
            "offer_no": offer.offer_no,
            "allocated_quantity_kg": req.allocated_quantity_kg,
            "status": offer.status,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(offer)
    return offer


# ==============================================================================
# Verified Organic Processing
# ==============================================================================


def record_organic_processing_start(
    db: Session,
    req: OrganicProcessingStartRequest,
    operator_user_id: str,
    request_id: str | None = None,
) -> OrganicProcessingRecord:
    """Start an organic bioconversion or composting process at an active facility."""
    facility = db.get(Facility, req.facility_id)
    if not facility or not facility.is_active:
        raise ValidationError("Fasilitas pengolah organik tidak ditemukan atau tidak aktif.")

    batch_no = f"ORG-{datetime.now(UTC).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"

    record = OrganicProcessingRecord(
        batch_no=batch_no,
        facility_id=req.facility_id,
        operator_user_id=operator_user_id,
        process_type=req.process_type.value,
        input_weight_kg=req.input_weight_kg,
        status=OrganicStatus.IN_PROGRESS.value,
        started_at=datetime.now(UTC),
        notes=req.notes,
    )
    db.add(record)

    audit = AuditLog(
        action="ORGANIC_PROCESSING_STARTED",
        actor_id=operator_user_id,
        entity_type="ORGANIC_PROCESSING",
        entity_id=record.id,
        reason=f"Mulai proses pengolahan organik #{batch_no}: {req.process_type.value} input {req.input_weight_kg} kg",
        request_id=request_id,
        payload_after={"batch_no": batch_no, "input_weight_kg": req.input_weight_kg},
    )
    db.add(audit)
    db.commit()
    db.refresh(record)
    return record


def record_organic_processing_completion(
    db: Session,
    record_id: str,
    req: OrganicProcessingCompleteRequest,
    operator_user_id: str,
    request_id: str | None = None,
) -> OrganicProcessingRecord:
    """Record completion of organic processing with actual compost/larvae output and residue."""
    stmt = select(OrganicProcessingRecord).where(OrganicProcessingRecord.id == record_id).with_for_update()
    record = db.scalar(stmt)
    if not record:
        raise NotFoundError("Catatan pengolahan organik tidak ditemukan.")

    if record.status != OrganicStatus.IN_PROGRESS.value:
        raise ValidationError(f"Proses dalam status '{record.status}' tidak dapat diselesaikan lagi.")

    record.output_product_weight_kg = req.output_product_weight_kg
    record.residue_weight_kg = req.residue_weight_kg
    record.status = req.status.value
    record.completed_at = datetime.now(UTC)
    if req.notes:
        record.notes = f"{record.notes or ''}\n[Penyelesaian]: {req.notes}".strip()

    audit = AuditLog(
        action="ORGANIC_PROCESSING_COMPLETED",
        actor_id=operator_user_id,
        entity_type="ORGANIC_PROCESSING",
        entity_id=record.id,
        reason=f"Penyelesaian batch organik #{record.batch_no}: output {req.output_product_weight_kg} kg, residu {req.residue_weight_kg} kg",
        request_id=request_id,
        payload_after={
            "batch_no": record.batch_no,
            "output_weight_kg": req.output_product_weight_kg,
            "residue_weight_kg": req.residue_weight_kg,
            "status": req.status.value,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(record)
    return record


# ==============================================================================
# Commercial Generators (B2B)
# ==============================================================================


def check_b2b_user_access(db: Session, user: User, organization_id: str) -> None:
    """Ensure user has verified membership in organization or is system admin."""
    # Admins always have access
    user_roles = [r.role.code for r in user.roles if r.verification_status == "ACTIVE" and r.role]
    if "ADMIN" in user_roles:
        return

    # Check organization membership
    stmt = select(B2BOrganizationMember).where(
        B2BOrganizationMember.organization_id == organization_id,
        B2BOrganizationMember.user_id == user.id,
    )
    member = db.scalar(stmt)
    if not member:
        raise AuthorizationError("Akses ditolak: Anda tidak memiliki akses ke data organisasi usaha ini.")


def create_b2b_organization(
    db: Session,
    req: B2BOrganizationCreateRequest,
    creator_user: User,
) -> B2BOrganization:
    """Register a new commercial generator organization (Hotel, Resto, Villa)."""
    org = B2BOrganization(
        name=req.name,
        business_type=req.business_type.value,
        tax_id=req.tax_id,
        billing_contact_name=req.billing_contact_name,
        billing_contact_phone=req.billing_contact_phone,
        billing_contact_email=req.billing_contact_email,
        is_active=True,
    )
    db.add(org)
    db.flush()

    # Add creator as OWNER member
    member = B2BOrganizationMember(
        organization_id=org.id,
        user_id=creator_user.id,
        role="OWNER",
    )
    db.add(member)

    audit = AuditLog(
        action="B2B_ORGANIZATION_CREATED",
        actor_id=creator_user.id,
        entity_type="B2B_ORGANIZATION",
        entity_id=org.id,
        reason=f"Pendaftaran pelaku usaha baru {org.name} ({org.business_type})",
        payload_after={"name": org.name, "type": org.business_type},
    )
    db.add(audit)
    db.commit()
    db.refresh(org)
    return org


def create_b2b_location(
    db: Session,
    req: B2BLocationCreateRequest,
    current_user: User,
) -> B2BLocation:
    """Create a specific pickup site for a B2B organization."""
    check_b2b_user_access(db, current_user, req.organization_id)

    org = db.get(B2BOrganization, req.organization_id)
    if not org or not org.is_active:
        raise NotFoundError("Organisasi usaha tidak ditemukan atau tidak aktif.")

    location = B2BLocation(
        organization_id=req.organization_id,
        name=req.name,
        address=req.address,
        service_area_id=req.service_area_id,
        contact_person=req.contact_person,
        contact_phone=req.contact_phone,
        estimated_daily_kg=req.estimated_daily_kg,
        pickup_frequency=req.pickup_frequency,
        access_instructions=req.access_instructions,
        is_active=True,
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


def list_b2b_locations(
    db: Session,
    organization_id: str,
    current_user: User,
) -> list[B2BLocation]:
    """List pickup locations belonging to an organization with tenant isolation."""
    check_b2b_user_access(db, current_user, organization_id)
    stmt = (
        select(B2BLocation)
        .where(B2BLocation.organization_id == organization_id)
        .order_by(B2BLocation.name.asc())
    )
    return list(db.scalars(stmt).all())


def create_b2b_pickup_request(
    db: Session,
    req: B2BPickupCreateRequest,
    current_user: User,
) -> B2BPickupRequest:
    """Schedule a commercial waste collection request."""
    loc = db.get(B2BLocation, req.location_id)
    if not loc or not loc.is_active:
        raise NotFoundError("Lokasi penjemputan B2B tidak ditemukan atau tidak aktif.")

    check_b2b_user_access(db, current_user, loc.organization_id)

    cat = db.get(WasteCategory, req.category_id)
    if not cat:
        raise NotFoundError("Kategori sampah tidak valid.")

    request_no = f"B2B-{datetime.now(UTC).strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"

    pickup = B2BPickupRequest(
        request_no=request_no,
        location_id=req.location_id,
        category_id=req.category_id,
        scheduled_date=req.scheduled_date,
        estimated_weight_kg=req.estimated_weight_kg,
        status=B2BPickupStatus.SCHEDULED.value,
        notes=req.notes,
    )
    db.add(pickup)
    db.commit()
    db.refresh(pickup)
    return pickup


def update_b2b_pickup_status(
    db: Session,
    pickup_id: str,
    req: B2BPickupStatusUpdateRequest,
    current_user: User,
) -> B2BPickupRequest:
    """Update progress of a B2B pickup request."""
    pickup = db.get(B2BPickupRequest, pickup_id)
    if not pickup:
        raise NotFoundError("Permintaan pickup B2B tidak ditemukan.")

    pickup.status = req.status
    if req.actual_weight_kg is not None:
        pickup.actual_weight_kg = req.actual_weight_kg
    if req.notes:
        pickup.notes = f"{pickup.notes or ''}\n[{req.status}]: {req.notes}".strip()

    db.commit()
    db.refresh(pickup)
    return pickup


def get_b2b_operational_report(
    db: Session,
    organization_id: str,
    current_user: User,
) -> dict[str, Any]:
    """Generate an operational breakdown report segregating requests, pickups, receipts, and processing."""
    check_b2b_user_access(db, current_user, organization_id)
    org = db.get(B2BOrganization, organization_id)
    if not org:
        raise NotFoundError("Organisasi usaha tidak ditemukan.")

    stmt = (
        select(B2BPickupRequest)
        .join(B2BLocation, B2BPickupRequest.location_id == B2BLocation.id)
        .where(B2BLocation.organization_id == organization_id)
    )
    pickups = list(db.scalars(stmt).all())

    scheduled = sum(1 for p in pickups if p.status == B2BPickupStatus.SCHEDULED.value)
    collected = sum(1 for p in pickups if p.status == B2BPickupStatus.COLLECTED.value)
    received = sum(1 for p in pickups if p.status == B2BPickupStatus.RECEIVED_FACILITY.value)
    processed = sum(1 for p in pickups if p.status == B2BPickupStatus.PROCESSED.value)
    cancelled = sum(1 for p in pickups if p.status == B2BPickupStatus.CANCELLED.value)

    total_est = sum(float(p.estimated_weight_kg or 0.0) for p in pickups)
    total_act = sum(float(p.actual_weight_kg or 0.0) for p in pickups if p.actual_weight_kg is not None)

    # Category breakdown
    cat_breakdown: dict[str, float] = {}
    for p in pickups:
        cat = db.get(WasteCategory, p.category_id)
        cat_name = cat.name if cat else "Lainnya"
        wt = float(p.actual_weight_kg if p.actual_weight_kg is not None else p.estimated_weight_kg or 0.0)
        cat_breakdown[cat_name] = round(cat_breakdown.get(cat_name, 0.0) + wt, 3)

    loop_rate = round((processed / len(pickups) * 100.0), 1) if pickups else 0.0

    return {
        "organization_id": org.id,
        "organization_name": org.name,
        "total_requests": len(pickups),
        "scheduled_count": scheduled,
        "collected_count": collected,
        "received_facility_count": received,
        "processed_count": processed,
        "cancelled_count": cancelled,
        "total_estimated_weight_kg": round(total_est, 3),
        "total_actual_weight_kg": round(total_act, 3),
        "verified_loop_completion_rate": loop_rate,
        "breakdown_by_category": cat_breakdown,
        "audit_disclaimer": (
            "Laporan Operasional Green Hospitality Kedas. Disusun berdasarkan rekaman riwayat alur "
            "material terverifikasi fasilitas (operational audit trail), bukan sertifikasi lingkungan tanpa bukti lapangan."
        ),
    }
