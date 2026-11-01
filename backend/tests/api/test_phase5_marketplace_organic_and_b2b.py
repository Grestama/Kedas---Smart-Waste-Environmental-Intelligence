"""WasteLink Bali — Tahap 5: Jaringan Mitra Material, Pengolah Organik & B2B Test Suite.

Verifies:
1. Mitra tidak terverifikasi tidak bisa menjadi tujuan pengiriman material terkonfirmasi.
2. Penawaran kedaluwarsa tidak bisa di-accept tanpa pembaruan/konfirmasi.
3. Jumlah yang dialokasikan tidak melampaui kuantitas/stok yang tersedia.
4. Transaksi delivery memiliki sumber batch dan kedua pihak yang sah.
5. Selisih penerimaan mencatat diskrepansi tanpa mengubah nilai dispatched_weight asal.
6. Tenant isolation: Organisasi usaha tidak bisa membaca data lokasi organisasi usaha lain (403 Forbidden).
7. Laporan operasional B2B membedakan permintaan, pickup, penerimaan fasilitas, dan pemrosesan.
8. Laporan dampak tidak menganggap material diterima berarti telah didaur ulang sampai ada bukti pemrosesan sah.
9. Jalur pengolahan organik memerlukan konfigurasi fasilitas & operator aktif, mencatat hasil kompos dan residu.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from app.modules.account.models import Role, UserRole
from app.modules.facility.models import FacilityType
from app.modules.marketplace.models import (
    BatchStatus,
    DeliveryStatus,
    OfferType,
    PartnerType,
    PartnerVerificationStatus,
)
from app.modules.taxonomy import service as taxonomy_service
from app.modules.taxonomy.schemas import WasteCategoryCreateRequest


def _register(client, email: str, name: str) -> tuple[str, dict]:
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": "Password123#"},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def _grant_role(db, user_id: str, role_code: str, status: str = "ACTIVE"):
    role = db.query(Role).filter(Role.code == role_code).first()
    if not role:
        role = Role(code=role_code, name=role_code, description=role_code)
        db.add(role)
        db.commit()
    user_role = UserRole(
        user_id=user_id,
        role_id=role.id,
        verification_status=status,
        granted_at=datetime.now(UTC),
    )
    db.add(user_role)
    db.commit()


def test_unverified_partner_cannot_receive_delivery(client, db_session):
    admin_token, admin = _register(
        client, f"admin_p5_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin P5"
    )
    _grant_role(db_session, admin["id"], "ADMIN")
    a_headers = {"Authorization": f"Bearer {admin_token}"}

    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"PET_P5_{uuid.uuid4().hex[:4]}", name="PET Bening", category_type="RECYCLABLE"
        ),
    )

    # 1. Register Unverified Partner (PENDING)
    resp_partner = client.post(
        "/api/v1/admin/partners",
        headers=a_headers,
        json={
            "name": "PT Bali Daur Ulang Mandiri",
            "contact_email": "halo@balidaurulang.id",
            "contact_phone": "0812-9988-7766",
            "address": "Jl. Bypass Ngurah Rai, Denpasar",
            "partner_type": PartnerType.PENDAUR_ULANG.value,
            "is_verified": False,
        },
    )
    assert resp_partner.status_code == 201
    partner = resp_partner.json()
    assert partner["verification_status"] == PartnerVerificationStatus.PENDING.value
    partner_id = partner["id"]

    # Create dummy batch directly
    from app.modules.marketplace.models import MaterialBatch

    batch = MaterialBatch(
        batch_code=f"BATCH-{uuid.uuid4().hex[:6].upper()}",
        category_id=cat.id,
        total_weight_kg=500.0,
        status=BatchStatus.BATCHED.value,
        created_by=admin["id"],
    )
    db_session.add(batch)
    db_session.commit()

    # 2. Try dispatch to unverified partner -> MUST FAIL (Quality Gate)
    resp_dispatch_fail = client.post(
        "/api/v1/admin/deliveries",
        headers=a_headers,
        json={
            "batch_id": batch.id,
            "partner_id": partner_id,
            "dispatched_weight_kg": 500.0,
        },
    )
    assert resp_dispatch_fail.status_code == 422
    assert "belum berstatus terverifikasi" in resp_dispatch_fail.json()["message"]

    # 3. Admin verifies partner
    resp_verify = client.post(
        f"/api/v1/admin/partners/{partner_id}/verify",
        headers=a_headers,
        json={
            "verification_status": "VERIFIED",
            "notes": "Izin lingkungan dan TDP terverifikasi sah",
        },
    )
    assert resp_verify.status_code == 200
    assert resp_verify.json()["verification_status"] == "VERIFIED"

    # 4. Now dispatch succeeds
    resp_dispatch_ok = client.post(
        "/api/v1/admin/deliveries",
        headers=a_headers,
        json={
            "batch_id": batch.id,
            "partner_id": partner_id,
            "dispatched_weight_kg": 500.0,
            "notes": "Surat jalan #SJ-2026-001 via truk pickup",
        },
    )
    assert resp_dispatch_ok.status_code == 201
    delivery = resp_dispatch_ok.json()
    assert delivery["status"] == DeliveryStatus.DISPATCHED.value
    assert delivery["dispatched_weight_kg"] == 500.0


def test_delivery_receipt_discrepancy_and_processing_confirmation(client, db_session):
    admin_token, admin = _register(
        client, f"admin_rec_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin Delivery"
    )
    _grant_role(db_session, admin["id"], "ADMIN")
    a_headers = {"Authorization": f"Bearer {admin_token}"}

    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"KRT_P5_{uuid.uuid4().hex[:4]}", name="Kardus Box", category_type="RECYCLABLE"
        ),
    )

    resp_partner = client.post(
        "/api/v1/admin/partners",
        headers=a_headers,
        json={
            "name": "Pabrik Kertas Gianyar",
            "contact_email": "logistik@pabrikkertas.id",
            "contact_phone": "0811-2233-4455",
            "address": "Gianyar",
            "partner_type": "PENDAUR_ULANG",
            "is_verified": True,
        },
    )
    partner_id = resp_partner.json()["id"]

    from app.modules.marketplace.models import MaterialBatch

    batch = MaterialBatch(
        batch_code=f"BATCH-KRT-{uuid.uuid4().hex[:6].upper()}",
        category_id=cat.id,
        total_weight_kg=1000.0,
        status=BatchStatus.BATCHED.value,
        created_by=admin["id"],
    )
    db_session.add(batch)
    db_session.commit()

    # Dispatch 1000 kg
    delivery_resp = client.post(
        "/api/v1/admin/deliveries",
        headers=a_headers,
        json={"batch_id": batch.id, "partner_id": partner_id, "dispatched_weight_kg": 1000.0},
    )
    delivery_id = delivery_resp.json()["id"]

    # 1. Partner receives 980 kg (Discrepancy -20.0 kg due to moisture loss)
    receipt_resp = client.post(
        f"/api/v1/admin/deliveries/{delivery_id}/receipt",
        headers=a_headers,
        json={"received_weight_kg": 980.0, "notes": "Penyusutan kelembapan 2%"},
    )
    assert receipt_resp.status_code == 200
    rec_data = receipt_resp.json()

    # Dispatched weight MUST NOT be altered
    assert rec_data["dispatched_weight_kg"] == 1000.0
    assert rec_data["received_weight_kg"] == 980.0
    assert rec_data["weight_discrepancy_kg"] == -20.0
    assert rec_data["status"] == DeliveryStatus.DISPUTED.value

    # Batch status should be RECEIVED, NOT yet PROCESSED_CONFIRMED (Quality Gate)
    db_session.refresh(batch)
    assert batch.status == BatchStatus.RECEIVED.value

    # 2. Confirm processing with explicit recycling proof
    proc_resp = client.post(
        f"/api/v1/admin/deliveries/{delivery_id}/confirm-processing",
        headers=a_headers,
        json={
            "notes": "Kardus telah dipotong dan dilebur menjadi bubur kertas pulp daur ulang #BATCH-PULP-88"
        },
    )
    assert proc_resp.status_code == 200

    db_session.refresh(batch)
    assert batch.status == BatchStatus.PROCESSED_CONFIRMED.value


def test_material_offer_expiration_and_allocation_bounds(client, db_session):
    admin_token, admin = _register(
        client, f"admin_ofr_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin Offer"
    )
    _grant_role(db_session, admin["id"], "ADMIN")
    a_headers = {"Authorization": f"Bearer {admin_token}"}

    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"ALU_P5_{uuid.uuid4().hex[:4]}",
            name="Aluminium Kaleng",
            category_type="RECYCLABLE",
        ),
    )

    # 1. Create offer with valid future expiry
    future_expiry = (datetime.now(UTC) + timedelta(days=7)).isoformat()
    offer_resp = client.post(
        "/api/v1/marketplace/offers",
        headers=a_headers,
        json={
            "offer_type": OfferType.DEMAND.value,
            "category_id": cat.id,
            "min_quantity_kg": 50.0,
            "max_quantity_kg": 200.0,
            "quality_grade": "GRADE_A",
            "price_indicative_idr": 15000,
            "valid_until": future_expiry,
            "notes": "Dicari kaleng aluminium bersih kemasan minuman",
        },
    )
    assert offer_resp.status_code == 201
    offer = offer_resp.json()
    offer_id = offer["id"]
    assert offer["status"] == "OPEN"

    # 2. Attempt allocation exceeding max_quantity_kg (try 300 kg when max is 200 kg) -> Fails
    resp_overbound = client.post(
        f"/api/v1/marketplace/offers/{offer_id}/accept",
        headers=a_headers,
        json={"allocated_quantity_kg": 300.0},
    )
    assert resp_overbound.status_code == 422
    assert "melebihi batas penawaran" in resp_overbound.json()["message"]

    # 3. Simulate expired offer by updating valid_until into the past
    from app.modules.marketplace.models import MaterialOffer

    db_offer = db_session.get(MaterialOffer, offer_id)
    db_offer.valid_until = datetime.now(UTC) - timedelta(hours=2)
    db_session.commit()

    # Attempting to accept expired offer -> MUST FAIL (Quality Gate)
    resp_expired = client.post(
        f"/api/v1/marketplace/offers/{offer_id}/accept",
        headers=a_headers,
        json={"allocated_quantity_kg": 100.0},
    )
    assert resp_expired.status_code == 422
    assert "telah kedaluwarsa" in resp_expired.json()["message"]


def test_organic_processing_lifecycle(client, db_session):
    staff_token, staff = _register(
        client, f"staff_org_{uuid.uuid4().hex[:6]}@tps3r.bali", "Operator Organik"
    )
    _grant_role(db_session, staff["id"], "OPERATOR")
    s_headers = {"Authorization": f"Bearer {staff_token}"}

    admin_token, admin = _register(client, f"admin_org_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin")
    _grant_role(db_session, admin["id"], "ADMIN")

    fac_resp = client.post(
        "/api/v1/facilities",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "code": f"TPS_ORG_{uuid.uuid4().hex[:6].upper()}",
            "name": "TPS3R Rumah Kompos Sukawati",
            "facility_type": FacilityType.TPS3R.value,
            "address": "Sukawati",
            "capacity_kg_per_day": 3000.0,
        },
    )
    facility_id = fac_resp.json()["id"]

    # 1. Start Composting Batch
    resp_start = client.post(
        "/api/v1/organic/processing/start",
        headers=s_headers,
        json={
            "facility_id": facility_id,
            "process_type": "COMPOSTING_AEROBIC",
            "input_weight_kg": 500.0,
            "notes": "Daun cacah + sisa sayur dapur organik Sukawati",
        },
    )
    assert resp_start.status_code == 201
    batch_proc = resp_start.json()
    proc_id = batch_proc["id"]
    assert batch_proc["status"] == "IN_PROGRESS"
    assert batch_proc["input_weight_kg"] == 500.0

    # 2. Complete Composting Batch (Produces 220 kg compost, 30 kg residue, 250 kg moisture/gas reduction)
    resp_comp = client.post(
        f"/api/v1/organic/processing/{proc_id}/complete",
        headers=s_headers,
        json={
            "output_product_weight_kg": 220.0,
            "residue_weight_kg": 30.0,
            "status": "MATURED",
            "notes": "Kompos matang terayak halus siap kemas 5 kg",
        },
    )
    assert resp_comp.status_code == 200
    comp_data = resp_comp.json()
    assert comp_data["status"] == "MATURED"
    assert comp_data["output_product_weight_kg"] == 220.0
    assert comp_data["residue_weight_kg"] == 30.0


def test_b2b_commercial_tenant_isolation_and_reporting(client, db_session):
    # Two separate commercial accounts: Hotel Ubud & Resto Sanur
    u1_token, u1 = _register(client, "gm@hotelubud.bali", "GM Hotel Ubud")
    u2_token, u2 = _register(client, "owner@restosanur.bali", "Owner Resto Sanur")

    cat_org = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"CAT_B2B_{uuid.uuid4().hex[:4]}", name="Organik Resto", category_type="ORGANIC"
        ),
    )

    # 1. User 1 registers Hotel Ubud
    resp_org1 = client.post(
        "/api/v1/b2b/organizations",
        headers={"Authorization": f"Bearer {u1_token}"},
        json={
            "name": "Mandapa Luxury Resort",
            "business_type": "HOTEL",
            "tax_id": "NPWP-01.234.567.8-901.000",
            "billing_contact_name": "I Ketut Finance",
            "billing_contact_phone": "0812-3344-5566",
            "billing_contact_email": "finance@mandapa.id",
        },
    )
    assert resp_org1.status_code == 201
    org1 = resp_org1.json()
    org1_id = org1["id"]

    # 2. User 1 adds location to Hotel Ubud
    resp_loc1 = client.post(
        "/api/v1/b2b/locations",
        headers={"Authorization": f"Bearer {u1_token}"},
        json={
            "organization_id": org1_id,
            "name": "Main Kitchen & Bakery",
            "address": "Jl. Raya Kedewatan, Ubud",
            "contact_person": "Chef Wayan",
            "contact_phone": "0812-7788-9900",
            "estimated_daily_kg": 120.0,
            "pickup_frequency": "DAILY",
        },
    )
    assert resp_loc1.status_code == 201
    loc1_id = resp_loc1.json()["id"]

    # 3. User 2 (Resto Sanur) tries to list locations of Hotel Ubud -> MUST BE 403 FORBIDDEN (Quality Gate)
    resp_idor = client.get(
        f"/api/v1/b2b/organizations/{org1_id}/locations",
        headers={"Authorization": f"Bearer {u2_token}"},
    )
    assert resp_idor.status_code == 403
    assert "Akses ditolak" in resp_idor.json()["message"]

    # 4. Schedule B2B Pickups for Hotel Ubud
    pickup_date = (datetime.now(UTC) + timedelta(days=1)).isoformat()
    resp_p1 = client.post(
        "/api/v1/b2b/pickups",
        headers={"Authorization": f"Bearer {u1_token}"},
        json={
            "location_id": loc1_id,
            "category_id": cat_org.id,
            "scheduled_date": pickup_date,
            "estimated_weight_kg": 120.0,
            "notes": "2 tong sampah organik dapur restoran utama",
        },
    )
    assert resp_p1.status_code == 201
    p1_id = resp_p1.json()["id"]

    resp_p2 = client.post(
        "/api/v1/b2b/pickups",
        headers={"Authorization": f"Bearer {u1_token}"},
        json={
            "location_id": loc1_id,
            "category_id": cat_org.id,
            "scheduled_date": pickup_date,
            "estimated_weight_kg": 80.0,
        },
    )
    p2_id = resp_p2.json()["id"]

    # Operator updates p1 to COLLECTED, p2 to PROCESSED
    admin_token, admin = _register(client, f"admin_b2b_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin")
    _grant_role(db_session, admin["id"], "ADMIN")
    a_headers = {"Authorization": f"Bearer {admin_token}"}

    client.patch(
        f"/api/v1/b2b/pickups/{p1_id}/status",
        headers=a_headers,
        json={"status": "COLLECTED", "actual_weight_kg": 125.0},
    )
    client.patch(
        f"/api/v1/b2b/pickups/{p2_id}/status",
        headers=a_headers,
        json={"status": "PROCESSED", "actual_weight_kg": 78.5},
    )

    # 5. Check B2B Operational Report (Segregated lifecycle breakdown)
    resp_rep = client.get(
        f"/api/v1/b2b/organizations/{org1_id}/report",
        headers={"Authorization": f"Bearer {u1_token}"},
    )
    assert resp_rep.status_code == 200
    report = resp_rep.json()
    assert report["total_requests"] == 2
    assert report["collected_count"] == 1
    assert report["processed_count"] == 1
    assert report["total_estimated_weight_kg"] == 200.0  # 120 + 80
    assert report["total_actual_weight_kg"] == 203.5  # 125 + 78.5
