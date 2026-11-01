"""Kedas — Initial Demo Data Seeder CLI.

Seeds baseline categories, pilot service areas, slots, and AI knowledge documents
so that the Kedas web and mobile apps have realistic data for demonstration.

Usage:
    python -m app.cli.seed_demo
"""

# ruff: noqa: T201

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select

import app.db.base  # Register all ORM models into Base metadata
from app.db.session import get_session_factory
from app.modules.account.models import Role, User, UserRole, VerificationStatus
from app.modules.ai.knowledge import seed_default_knowledge_if_empty
from app.modules.collection.models import CollectionSlot, ServiceArea
from app.modules.taxonomy.service import seed_default_categories


def seed_demo_data() -> None:
    session_factory = get_session_factory()
    with session_factory() as db:
        print("1. Menyiapkan Kategori Sampah Standar...")
        cats = seed_default_categories(db)
        print(f"   -> Berhasil memuat {len(cats)} kategori sampah.")

        # Find or create admin user ID for knowledge doc provenance
        admin_user = db.scalar(
            select(User)
            .join(UserRole, UserRole.user_id == User.id)
            .join(Role, Role.id == UserRole.role_id)
            .where(Role.code == "ADMIN")
        )
        admin_id = admin_user.id if admin_user else "system-admin-id"

        print("2. Menyiapkan Area Layanan Pilot Bali...")
        demo_areas = [
            {
                "code": "SA-UBUD-TEBESAYA",
                "name": "Banjar Tebesaya Ubud",
                "administrative_area": "Ubud, Gianyar",
            },
            {
                "code": "SA-GIANYAR-SUKAWATI",
                "name": "Banjar Batubulan Sukawati",
                "administrative_area": "Sukawati, Gianyar",
            },
            {
                "code": "SA-DPS-SANURKAUH",
                "name": "Banjar Sanur Kauh Denpasar",
                "administrative_area": "Denpasar Selatan, Denpasar",
            },
        ]

        areas: list[ServiceArea] = []
        for area_data in demo_areas:
            area = db.scalar(select(ServiceArea).where(ServiceArea.code == area_data["code"]))
            if not area:
                area = ServiceArea(
                    code=area_data["code"],
                    name=area_data["name"],
                    administrative_area=area_data["administrative_area"],
                    is_active=True,
                )
                db.add(area)
                db.flush()
                print(f"   + Area dibuat: {area.name}")
            else:
                print(f"   * Area sudah ada: {area.name}")
            areas.append(area)

        print("3. Menyiapkan Slot Penjemputan Pilot...")
        now = datetime.now(UTC).replace(minute=0, second=0, microsecond=0)
        for area in areas:
            existing_slots = db.scalars(
                select(CollectionSlot).where(CollectionSlot.service_area_id == area.id)
            ).all()
            if not existing_slots:
                # Slot pagi (08:00 - 11:00) besok
                tomorrow_morning = (now + timedelta(days=1)).replace(hour=8)
                slot1 = CollectionSlot(
                    service_area_id=area.id,
                    start_time=tomorrow_morning,
                    end_time=tomorrow_morning + timedelta(hours=3),
                    max_capacity=20,
                    booked_capacity=0,
                    is_active=True,
                )
                # Slot sore (14:00 - 17:00) besok
                tomorrow_afternoon = (now + timedelta(days=1)).replace(hour=14)
                slot2 = CollectionSlot(
                    service_area_id=area.id,
                    start_time=tomorrow_afternoon,
                    end_time=tomorrow_afternoon + timedelta(hours=3),
                    max_capacity=20,
                    booked_capacity=0,
                    is_active=True,
                )
                db.add_all([slot1, slot2])
                print(f"   + 2 Slot dibuat untuk {area.name}")

        print("4. Menyiapkan Dokumen Regulasi & SOP AI Knowledge Base...")
        seed_default_knowledge_if_empty(db, admin_id=admin_id)
        print("   -> Regulasi Pergub 47/2019 & SOP TPS3R Tebesaya terdaftar.")

        db.commit()
        print("\nSEMUA DATA DEMO BERHASIL DI-SEED!")


if __name__ == "__main__":
    seed_demo_data()
