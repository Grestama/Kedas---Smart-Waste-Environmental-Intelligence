"""WasteLink Bali — Waste Taxonomy & Acceptance Rules Domain Service."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.modules.taxonomy.models import CategoryType, MaterialAcceptanceRule, WasteCategory
from app.modules.taxonomy.schemas import (
    MaterialAcceptanceRuleCreateRequest,
    WasteCategoryCreateRequest,
    WasteCategoryUpdateRequest,
)


def list_categories(db: Session, active_only: bool = True) -> list[WasteCategory]:
    """Retrieve waste taxonomy categories ordered by display_order."""
    stmt = select(WasteCategory)
    if active_only:
        stmt = stmt.where(WasteCategory.is_active.is_(True))
    stmt = stmt.order_by(WasteCategory.display_order.asc(), WasteCategory.name.asc())
    return list(db.scalars(stmt).all())


def get_category_by_id(db: Session, category_id: str) -> WasteCategory:
    """Retrieve a single category by ID."""
    category = db.get(WasteCategory, category_id)
    if not category:
        raise NotFoundError("Kategori sampah tidak ditemukan.")
    return category


def create_category(db: Session, req: WasteCategoryCreateRequest) -> WasteCategory:
    """Admin creates a new waste category."""
    existing = db.scalar(select(WasteCategory).where(WasteCategory.code == req.code))
    if existing:
        raise ConflictError(f"Kategori dengan kode [{req.code}] sudah ada.")

    # Validate category_type
    valid_types = {t.value for t in CategoryType}
    if req.category_type not in valid_types:
        raise ValidationError(
            f"Tipe kategori [{req.category_type}] tidak valid. Pilihan: {valid_types}"
        )

    category = WasteCategory(
        code=req.code,
        name=req.name,
        category_type=req.category_type,
        description=req.description,
        preparation_guide=req.preparation_guide,
        safety_notes=req.safety_notes,
        is_active=req.is_active,
        display_order=req.display_order,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(
    db: Session, category_id: str, req: WasteCategoryUpdateRequest
) -> WasteCategory:
    """Admin updates an existing waste category."""
    category = get_category_by_id(db, category_id)

    if req.name is not None:
        category.name = req.name
    if req.category_type is not None:
        valid_types = {t.value for t in CategoryType}
        if req.category_type not in valid_types:
            raise ValidationError(f"Tipe kategori [{req.category_type}] tidak valid.")
        category.category_type = req.category_type
    if req.description is not None:
        category.description = req.description
    if req.preparation_guide is not None:
        category.preparation_guide = req.preparation_guide
    if req.safety_notes is not None:
        category.safety_notes = req.safety_notes
    if req.is_active is not None:
        category.is_active = req.is_active
    if req.display_order is not None:
        category.display_order = req.display_order

    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def configure_acceptance_rule(
    db: Session, req: MaterialAcceptanceRuleCreateRequest
) -> MaterialAcceptanceRule:
    """Configure or update an acceptance rule for a category in a service area."""
    # Ensure category exists
    get_category_by_id(db, req.category_id)

    stmt = select(MaterialAcceptanceRule).where(
        MaterialAcceptanceRule.category_id == req.category_id,
        MaterialAcceptanceRule.service_area_id == req.service_area_id,
    )
    rule = db.scalar(stmt)
    if rule:
        rule.is_accepted = req.is_accepted
        rule.special_route_confirmed = req.special_route_confirmed
        rule.notes = req.notes
    else:
        rule = MaterialAcceptanceRule(
            category_id=req.category_id,
            service_area_id=req.service_area_id,
            is_accepted=req.is_accepted,
            special_route_confirmed=req.special_route_confirmed,
            notes=req.notes,
        )
        db.add(rule)

    db.commit()
    db.refresh(rule)
    return rule


def seed_default_categories(db: Session) -> list[WasteCategory]:
    """Seed the 4 mandatory baseline categories with Indonesian labels."""
    defaults = [
        {
            "code": "ORGANIC",
            "name": "Sampah Organik",
            "category_type": CategoryType.ORGANIC.value,
            "description": "Sisa makanan, sayuran, buah, dan sisa bahan dapur yang mudah membusuk.",
            "preparation_guide": "Tiriskan air/kuah, pisahkan dari wadah plastik/kemasan.",
            "safety_notes": "Jangan campur dengan tulang besar atau minyak jelantah berlebih.",
            "display_order": 1,
        },
        {
            "code": "RECYCLABLE",
            "name": "Anorganik Daur Ulang",
            "category_type": CategoryType.RECYCLABLE.value,
            "description": "Kardus, kertas, botol plastik PET, kaleng aluminium, dan logam bernilai.",
            "preparation_guide": "Bersihkan dari kotoran sisa makanan, bilas singkat, dan keringkan.",
            "safety_notes": "Lipat kardus agar rapi, amankan tutup kaleng tajam.",
            "display_order": 2,
        },
        {
            "code": "RESIDUAL",
            "name": "Sampah Residu",
            "category_type": CategoryType.RESIDUAL.value,
            "description": "Tisu basah, popok sekali pakai, kemasan saset multilayer kotor.",
            "preparation_guide": "Kemas dalam kantong tertutup rapat.",
            "safety_notes": "Tidak mendapatkan WastePoints; untuk pengangkutan ke TPA berizin.",
            "display_order": 3,
        },
        {
            "code": "SPECIAL",
            "name": "Limbah Khusus / Berbahaya",
            "category_type": CategoryType.SPECIAL.value,
            "description": "Baterai bekas, lampu neon, e-waste, wadah racun/pestisida, benda medis.",
            "preparation_guide": "Pisahkan secara mandiri dalam wadah khusus berlabel.",
            "safety_notes": "PERINGATAN: DILARANG dicampur ke penjemputan umum tanpa konfirmasi rute dan izin khusus.",
            "display_order": 4,
        },
    ]

    seeded = []
    for item in defaults:
        cat = db.scalar(select(WasteCategory).where(WasteCategory.code == item["code"]))
        if not cat:
            cat = WasteCategory(**item)
            db.add(cat)
        seeded.append(cat)
    db.commit()
    for cat in seeded:
        db.refresh(cat)
    return seeded
