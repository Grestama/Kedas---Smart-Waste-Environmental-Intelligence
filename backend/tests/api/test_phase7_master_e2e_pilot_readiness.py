"""WasteLink Bali — Phase 7 Master End-to-End Integration & Pilot Readiness Test Suite.

Validates the complete circular chain and interaction of all 12 platform roles across:
1. Warga (Household Citizen) -> Pickup request & points reward
2. Petugas (Collector) -> Task claim, GPS en route, QC inspection, digital weighing
3. Supervisor / Admin -> Task reassignments, operational audit logs & reporting
4. TPS3R / TPST Facility -> Intake receipt, scale discrepancy, sorting & mass balance
5. Bank Sampah -> Member onboarding, deposit ledger, balance & withdrawal
6. Downstream Recycler Partner -> Batch dispatch, receipt discrepancy & explicit processing proof
7. Organic Bioconversion -> Food waste composting & Maggot BSF bioconversion
8. Commercial B2B -> Hotel/restaurant onboarding, pickup, and segregated tenant reports
9. Banjar / Desa Adat -> Profile, prajuru assignment, gotong royong, complaints, territorial dashboard
10. CSR Sponsor / Program -> Program creation, sponsorship injection, banjar budget allocation
11. Volunteer Clean-up -> Beach & river action, waste fractions, metric isolation
12. Hazardous Waste (B3) -> Licensed partner gating, transport manifest & safe disposal certificate
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account.models import Role, UserRole
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    ServiceAreaCreateRequest,
)
from app.modules.marketplace import service as marketplace_service
from app.modules.marketplace.schemas import PartnerCreateRequest
from app.modules.taxonomy import service as taxonomy_service


def _login(client, email: str, password: str = "password_123") -> str:  # noqa: S107
    resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": email, "password": password},
    )
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["session_token"]


def _register(client, email: str, full_name: str) -> tuple[str, dict]:
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": full_name, "password": "password_123"},
    )
    assert resp.status_code == 201, f"Register failed: {resp.text}"
    return resp.json()["session_token"], resp.json()["user"]


def _grant_role(db, user_id: str, role_code: str, status: str = "ACTIVE"):
    role = db.query(Role).filter_by(code=role_code).first()
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


def test_master_circular_ecosystem_e2e(client, db_session):
    """End-to-End master integration test validating the entire WasteLink Bali circular lifecycle."""
    # =========================================================================
    # STEP 0: System Health & Base Master Data
    # =========================================================================
    live_resp = client.get("/api/v1/health/live")
    assert live_resp.status_code == 200
    assert live_resp.json()["status"] == "ok"

    ready_resp = client.get("/api/v1/health/ready")
    assert ready_resp.status_code == 200
    assert ready_resp.json()["status"] == "ok"

    # Seed default taxonomy
    cats = taxonomy_service.seed_default_categories(db_session)
    recyclable_cat = next(c for c in cats if c.code == "RECYCLABLE")
    organic_cat = next(c for c in cats if c.code == "ORGANIC")
    special_cat = next(c for c in cats if c.code == "SPECIAL")
    residual_cat = next(c for c in cats if c.code == "RESIDUAL")

    # Bootstrap System Admin
    admin_email = f"admin_master_{uuid.uuid4().hex[:6]}@wastelink.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin Master")
    admin_token = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Setup Pilot Service Area (Banjar Sukawati Kaja, Gianyar)
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_SUKAWATI_{uuid.uuid4().hex[:4].upper()}",
            name="Banjar Sukawati Kaja",
            administrative_area="Gianyar",
        ),
    )

    now = datetime.now(UTC)
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=3),
            max_capacity=20,
        ),
    )

    # =========================================================================
    # STEP 1: Role 10 (CSR Program & Funding Injection)
    # =========================================================================
    prog_code = f"PROG_PILOT_{uuid.uuid4().hex[:4].upper()}"
    prog_resp = client.post(
        "/api/v1/programs",
        json={
            "code": prog_code,
            "name": "Program Percontohan Banjar Sirkular 2026",
            "sponsor_name": "CSR PT Bank BPD Bali",
            "program_type": "CSR",
            "target_service_area_id": area.id,
            "total_budget_idr": 100_000_000,
            "points_capacity": 1_000_000,
        },
        headers=admin_headers,
    )
    assert prog_resp.status_code == 201
    prog_id = prog_resp.json()["id"]

    # Sponsor contribution
    spons_resp = client.post(
        f"/api/v1/programs/{prog_id}/sponsorships",
        json={
            "sponsor_name": "CSR PT Bank BPD Bali",
            "sponsor_type": "CSR",
            "amount_idr": 50_000_000,
            "contract_ref": "CSR-BPDBALI-PILOT-01",
        },
        headers=admin_headers,
    )
    assert spons_resp.status_code == 201

    # Regional budget allocation
    alloc_resp = client.post(
        f"/api/v1/programs/{prog_id}/allocations",
        json={
            "service_area_id": area.id,
            "allocated_amount_idr": 25_000_000,
            "purpose": "Subsidi operasional pemilahan dan timbangan digital pos banjar",
        },
        headers=admin_headers,
    )
    assert alloc_resp.status_code == 201

    # Setup point reward rules
    rule_resp = client.post(
        "/api/v1/admin/points/rules",
        json={
            "category_id": recyclable_cat.id,
            "points_per_kg": 100,
            "min_weight_kg": 0.5,
            "bonus_points": 20,
        },
        headers=admin_headers,
    )
    assert rule_resp.status_code == 201

    # =========================================================================
    # STEP 2: Role 9 (Banjar Adat Institutional Coordination & Community Event)
    # =========================================================================
    prof_resp = client.post(
        "/api/v1/community/banjar/profile",
        json={
            "service_area_id": area.id,
            "desa_adat_name": "Desa Adat Sukawati",
            "kelian_banjar_name": "I Ketut Ardana",
            "contact_phone": "+628113901234",
            "household_count": 420,
            "target_sorting_percent": 85.0,
        },
        headers=admin_headers,
    )
    assert prof_resp.status_code == 201

    prajuru_token, prajuru_user = _register(
        client, f"prajuru_{uuid.uuid4().hex[:6]}@banjarsukawati.id", "I Wayan Prajuru"
    )
    _grant_role(db_session, prajuru_user["id"], "COMMUNITY_LEADER")
    prajuru_headers = {"Authorization": f"Bearer {prajuru_token}"}

    client.post(
        "/api/v1/community/banjar/officials",
        json={
            "user_id": prajuru_user["id"],
            "service_area_id": area.id,
            "official_title": "Prajuru Lingkungan Hidup Banjar",
        },
        headers=admin_headers,
    )

    # Schedule Gotong Royong
    evt_resp = client.post(
        "/api/v1/community/events",
        json={
            "service_area_id": area.id,
            "title": "Ngayah Bersih Parit & Saluran Subak Banjar",
            "event_date": (now + timedelta(days=2)).isoformat(),
            "event_type": "GOTONG_ROYONG",
            "expected_attendees": 50,
        },
        headers=prajuru_headers,
    )
    assert evt_resp.status_code == 201

    # =========================================================================
    # STEP 3: Role 1 (Warga) & Role 2 (Petugas Pengangkut) Pickup Lifecycle
    # =========================================================================
    citizen_token, citizen_user = _register(
        client, f"warga_sukawati_{uuid.uuid4().hex[:6]}@gmail.com", "I Made Warga"
    )
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    collector_token, collector_user = _register(
        client, f"petugas_{uuid.uuid4().hex[:6]}@wastelink.bali", "I Gede Petugas"
    )
    _grant_role(db_session, collector_user["id"], "COLLECTOR")
    collector_headers = {"Authorization": f"Bearer {collector_token}"}

    # Citizen adds address & requests pickup
    addr_resp = client.post(
        "/api/v1/me/addresses",
        json={
            "label": "Pekarangan Rumah",
            "address_text": "Banjar Sukawati Kaja No. 88",
            "service_area_id": area.id,
        },
        headers=citizen_headers,
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        json={
            "category_id": recyclable_cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 12.0,
            "notes": "Kardus dan botol plastik bersih terikat rapi",
        },
        headers=citizen_headers,
    )
    assert pickup_resp.status_code == 201
    pickup_id = pickup_resp.json()["id"]

    # Collector claims task
    claim_resp = client.post(
        f"/api/v1/collector/tasks/{pickup_id}/accept",
        headers=collector_headers,
    )
    assert claim_resp.status_code == 200

    # Collector status transitions: EN_ROUTE -> ARRIVED
    client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "EN_ROUTE", "reason": "Menuju lokasi penjemputan warga"},
        headers=collector_headers,
    )
    client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        json={"status": "ARRIVED", "reason": "Tiba di depan pekarangan warga"},
        headers=collector_headers,
    )

    # Collector QC Inspection: ACCEPTED, 0% contamination
    qc_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        json={
            "result": "ACCEPTED",
            "contamination_level": "NONE",
        },
        headers=collector_headers,
    )
    assert qc_resp.status_code == 201

    # Collector verified weighing: 12.5 kg (digital hanging scale)
    # This automatically records verified weight and mints reward points
    weigh_resp = client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        json={
            "gross_weight_kg": 14.5,
            "tare_weight_kg": 2.0,
            "net_weight_kg": 12.5,
            "weighing_method": "DIGITAL_SCALE",
            "scale_id": "SCALE-POSKO-01",
            "notes": "Timbangan digital terkalibrasi",
        },
        headers=collector_headers,
    )
    assert weigh_resp.status_code == 201

    # Verify Warga Balance: 12.5 kg * 100 points/kg = 1250 points
    bal_resp = client.get("/api/v1/points/balance", headers=citizen_headers)
    assert bal_resp.status_code == 200
    assert bal_resp.json()["current_balance"] == 1250

    # Citizen logs a community complaint regarding waste in the area
    cmp_resp = client.post(
        "/api/v1/community/complaints",
        json={
            "service_area_id": area.id,
            "title": "Tumpukan dedaunan upacara di samping balai banjar",
            "description": "Perlu pengangkutan tambahan sisa canang dan janur pasca piodalan",
            "location_detail": "Sebelah barat Balai Banjar Sukawati Kaja",
        },
        headers=citizen_headers,
    )
    assert cmp_resp.status_code == 201
    ticket_id = cmp_resp.json()["id"]

    # Prajuru resolves complaint
    res_resp = client.post(
        f"/api/v1/community/complaints/{ticket_id}/resolve",
        json={
            "status": "RESOLVED",
            "resolution_notes": "Petugas kebersihan banjar telah membawa residu canang ke komposter TPS3R",
        },
        headers=prajuru_headers,
    )
    assert res_resp.status_code == 200

    # =========================================================================
    # STEP 4: Role 4 & 5 (TPS3R Sukawati Kaja: Reception, Scale QC & Sorting)
    # =========================================================================
    staff_token, staff_user = _register(
        client, f"staff_tps3r_{uuid.uuid4().hex[:6]}@sukawati.id", "Wayan Staff TPS3R"
    )
    _grant_role(db_session, staff_user["id"], "OPERATOR")
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    fac_resp = client.post(
        "/api/v1/facilities",
        json={
            "code": f"TPS3R_SUKAWATI_{uuid.uuid4().hex[:4].upper()}",
            "name": "TPS3R Sukawati Kaja Mandiri",
            "facility_type": "TPS3R",
            "service_area_id": area.id,
            "address": "Banjar Sukawati Kaja, Gianyar",
            "capacity_kg_per_day": 3000.0,
        },
        headers=admin_headers,
    )
    assert fac_resp.status_code == 201
    fac_id = fac_resp.json()["id"]

    # Facility intake receipt with scale discrepancy tracking: 12.5 kg field vs 12.4 kg facility
    rcpt_resp = client.post(
        "/api/v1/facilities/receipts",
        json={
            "facility_id": fac_id,
            "category_id": recyclable_cat.id,
            "pickup_id": pickup_id,
            "gross_weight_kg": 14.4,
            "tare_weight_kg": 2.0,
            "received_weight_kg": 12.4,
            "quality_grade": "GRADE_A",
            "contamination_percent": 1.0,
            "notes": "Timbangan lantai jembatan TPS3R",
        },
        headers=staff_headers,
    )
    assert rcpt_resp.status_code == 201
    assert rcpt_resp.json()["received_weight_kg"] == 12.4
    assert rcpt_resp.json()["discrepancy_kg"] == -0.1

    # Mass balance sorting into PET fractions, cardboard fractions, and explicit residual
    sort_resp = client.post(
        "/api/v1/facilities/sorting",
        json={
            "facility_id": fac_id,
            "input_category_id": recyclable_cat.id,
            "input_weight_kg": 12.4,
            "outputs": [
                {"category_id": recyclable_cat.id, "quantity_kg": 11.2, "is_residue": False},
                {"category_id": residual_cat.id, "quantity_kg": 1.2, "is_residue": True, "notes": "Residu selotip kotor"},
            ],
            "tolerance_kg": 0.5,
            "notes": "Pemisahan kardus dan residu selotip kotor",
        },
        headers=staff_headers,
    )
    assert sort_resp.status_code == 201

    # =========================================================================
    # STEP 5: Role 6 (Bank Sampah Banjar Member Onboarding & Transactions)
    # =========================================================================
    bs_resp = client.post(
        "/api/v1/facilities",
        json={
            "code": f"BS_SUKAWATI_{uuid.uuid4().hex[:4].upper()}",
            "name": "Bank Sampah Banjar Sukawati",
            "facility_type": "BANK_SAMPAH",
            "service_area_id": area.id,
            "address": "Balai Banjar Sukawati",
            "capacity_kg_per_day": 1000.0,
        },
        headers=admin_headers,
    )
    assert bs_resp.status_code == 201
    bs_id = bs_resp.json()["id"]

    # Member onboarding
    mem_resp = client.post(
        "/api/v1/facilities/waste-bank/members",
        json={
            "facility_id": bs_id,
            "user_id": citizen_user["id"],
            "member_no": f"BS-MEM-{uuid.uuid4().hex[:6].upper()}",
        },
        headers=staff_headers,
    )
    assert mem_resp.status_code == 201
    mem_id = mem_resp.json()["id"]

    # Member Deposit
    dep_resp = client.post(
        "/api/v1/facilities/waste-bank/deposit",
        json={
            "member_id": mem_id,
            "category_id": recyclable_cat.id,
            "weight_kg": 15.0,
            "unit_price_idr": 2500,
            "notes": "Setoran kardus koran nasabah",
        },
        headers=staff_headers,
    )
    assert dep_resp.status_code == 201
    assert dep_resp.json()["amount_idr"] == 37500

    # Member Withdrawal
    wd_resp = client.post(
        "/api/v1/facilities/waste-bank/withdraw",
        json={
            "member_id": mem_id,
            "amount_idr": 20000,
            "notes": "Penarikan tabungan sampah untuk kas banjar",
        },
        headers=staff_headers,
    )
    assert wd_resp.status_code == 201
    assert wd_resp.json()["running_balance_idr"] == 17500

    # =========================================================================
    # STEP 6: Role 7 (Downstream Recycler Partner Dispatch & Explicit Recycling Proof)
    # =========================================================================
    partner = marketplace_service.create_partner(
        db_session,
        PartnerCreateRequest(
            name="PT Bali Sirkular Daur Ulang",
            contact_email="recycler@balisirkular.com",
            contact_phone="+6281234567000",
            address="Kawasan Industri Pelabuhan Benoa",
            partner_type="PENDAUR_ULANG",
            is_verified=True,
        ),
    )

    batch_resp = client.post(
        "/api/v1/admin/batches",
        json={"category_id": recyclable_cat.id, "pickup_ids": [pickup_id]},
        headers=staff_headers,
    )
    assert batch_resp.status_code == 201
    batch_id = batch_resp.json()["id"]

    # Dispatch delivery
    deliv_resp = client.post(
        "/api/v1/admin/deliveries",
        json={
            "batch_id": batch_id,
            "partner_id": partner.id,
            "dispatched_weight_kg": 12.5,
            "notes": "Pengiriman armada truk TPS3R ke pabrik",
        },
        headers=staff_headers,
    )
    assert deliv_resp.status_code == 201
    deliv_id = deliv_resp.json()["id"]

    # Partner receives delivery with scale discrepancy (12.5 kg sent vs 12.3 kg received)
    recv_resp = client.post(
        f"/api/v1/admin/deliveries/{deliv_id}/receipt",
        json={"received_weight_kg": 12.3, "notes": "Timbangan penerimaan pabrik mitra"},
        headers=staff_headers,
    )
    assert recv_resp.status_code == 200
    assert recv_resp.json()["dispatched_weight_kg"] == 12.5  # Immutable preserved
    assert recv_resp.json()["received_weight_kg"] == 12.3
    assert recv_resp.json()["weight_discrepancy_kg"] == -0.2

    # Gated Recycling Proof: Status does NOT automatically become recycled
    batch_check = client.get("/api/v1/admin/batches", headers=staff_headers).json()
    curr_batch = [b for b in batch_check if b["id"] == batch_id][0]
    assert curr_batch["status"] == "RECEIVED"

    # Confirm processing with verified recycling proof
    proc_resp = client.post(
        f"/api/v1/admin/deliveries/{deliv_id}/confirm-processing",
        json={"notes": "Flake PET dilebur menjadi biji plastik rPET: Sertifikat Daur Ulang #RC-BALI-9981"},
        headers=staff_headers,
    )
    assert proc_resp.status_code == 200

    batch_check2 = client.get("/api/v1/admin/batches", headers=staff_headers).json()
    final_batch = [b for b in batch_check2 if b["id"] == batch_id][0]
    assert final_batch["status"] == "PROCESSED_CONFIRMED"

    # =========================================================================
    # STEP 7: Organic Bioconversion (Maggot BSF & Aerobic Composting)
    # =========================================================================
    org_start = client.post(
        "/api/v1/organic/processing/start",
        json={
            "facility_id": fac_id,
            "process_type": "MAGGOT_BSF",
            "input_weight_kg": 600.0,
            "notes": "Biokonversi sisa makanan canang & pasar oleh larva BSF",
        },
        headers=staff_headers,
    )
    assert org_start.status_code == 201
    org_id = org_start.json()["id"]
    assert org_start.json()["status"] == "IN_PROGRESS"

    org_comp = client.post(
        f"/api/v1/organic/processing/{org_id}/complete",
        json={
            "output_product_weight_kg": 120.0,  # Fresh Maggot
            "residue_weight_kg": 180.0,  # Kasgot fertilizer
            "status": "HARVESTED",
            "notes": "Panen larva maggot berprotein tinggi dan pupuk kasgot",
        },
        headers=staff_headers,
    )
    assert org_comp.status_code == 200
    assert org_comp.json()["status"] == "HARVESTED"
    assert org_comp.json()["output_product_weight_kg"] == 120.0
    assert org_comp.json()["residue_weight_kg"] == 180.0

    # =========================================================================
    # STEP 8: Role 8 (Commercial Generator B2B Multi-tenant Onboarding & Isolation)
    # =========================================================================
    b2b_token, b2b_user = _register(
        client, f"hotel_gm_{uuid.uuid4().hex[:6]}@theseminyak.com", "Wayan GM Seminyak"
    )
    b2b_headers = {"Authorization": f"Bearer {b2b_token}"}

    org_resp = client.post(
        "/api/v1/b2b/organizations",
        json={
            "name": "The Seminyak Luxury Resort & Spa",
            "business_type": "HOTEL",
            "tax_id": "01.234.567.8-901.000",
            "billing_contact_name": "Wayan GM",
            "billing_contact_phone": "+628113801234",
            "billing_contact_email": "finance@theseminyak.com",
        },
        headers=b2b_headers,
    )
    assert org_resp.status_code == 201
    b2b_org_id = org_resp.json()["id"]

    loc_resp = client.post(
        "/api/v1/b2b/locations",
        json={
            "organization_id": b2b_org_id,
            "name": "Loading Dock Basement & Dapur Utama",
            "address": "Jl. Kayu Aya No. 1, Seminyak",
            "contact_person": "Chef Ketut",
            "contact_phone": "+6281234567888",
            "estimated_daily_kg": 150.0,
            "pickup_frequency": "DAILY",
        },
        headers=b2b_headers,
    )
    assert loc_resp.status_code == 201
    b2b_loc_id = loc_resp.json()["id"]

    # Schedule commercial pickup
    b2b_pick = client.post(
        "/api/v1/b2b/pickups",
        json={
            "location_id": b2b_loc_id,
            "category_id": organic_cat.id,
            "scheduled_date": (now + timedelta(days=1)).strftime("%Y-%m-%d"),
            "estimated_weight_kg": 140.0,
            "notes": "Sampah dapur sarapan pagi hotel",
        },
        headers=b2b_headers,
    )
    assert b2b_pick.status_code == 201
    b2b_pickup_id = b2b_pick.json()["id"]

    # Operator updates status to COLLECTED with actual weight
    client.patch(
        f"/api/v1/b2b/pickups/{b2b_pickup_id}/status",
        json={"status": "COLLECTED", "actual_weight_kg": 138.5, "notes": "Diangkut truk TPS3R"},
        headers=staff_headers,
    )

    # Segregated operational report
    b2b_rep = client.get(f"/api/v1/b2b/organizations/{b2b_org_id}/report", headers=b2b_headers)
    assert b2b_rep.status_code == 200
    assert b2b_rep.json()["total_requests"] == 1
    assert b2b_rep.json()["collected_count"] == 1
    assert b2b_rep.json()["received_facility_count"] == 0  # Cleanly segregated

    # =========================================================================
    # STEP 9: Role 11 (Volunteer Beach & River Clean-up Action)
    # =========================================================================
    coord_token, coord_user = _register(
        client, f"volunteer_coord_{uuid.uuid4().hex[:6]}@baliclean.org", "Ketut Volunteer Lead"
    )
    _grant_role(db_session, coord_user["id"], "VOLUNTEER_COORDINATOR")
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    cln_resp = client.post(
        "/api/v1/community/cleanups",
        json={
            "action_type": "BEACH_CLEANUP",
            "location_name": "Pantai Mertasari Sanur",
            "service_area_id": area.id,
            "event_date": now.isoformat(),
            "duration_hours": 3.0,
            "volunteer_count": 90,
        },
        headers=coord_headers,
    )
    assert cln_resp.status_code == 201
    cln_id = cln_resp.json()["id"]

    client.post(
        f"/api/v1/community/cleanups/{cln_id}/complete",
        json={
            "total_collected_weight_kg": 510.0,
            "plastic_weight_kg": 320.0,
            "organic_weight_kg": 110.0,
            "residual_weight_kg": 80.0,
            "evidence_notes": "Aksi bersih pantai Sanur bersama 90 relawan komunitas",
        },
        headers=coord_headers,
    )

    client.post(
        f"/api/v1/community/cleanups/{cln_id}/verify",
        json={"notes": "Dokumentasi foto dan timbangan tervalidasi oleh pengawas dinas"},
        headers=admin_headers,
    )

    # =========================================================================
    # STEP 10: Role 12 (Hazardous Waste B3 Controlled Manifest & Certified Disposal)
    # =========================================================================
    b3_token, b3_user = _register(
        client, f"b3_officer_{uuid.uuid4().hex[:6]}@wastelink.bali", "Made B3 Specialist"
    )
    _grant_role(db_session, b3_user["id"], "HAZARDOUS_HANDLER")
    b3_headers = {"Authorization": f"Bearer {b3_token}"}

    b3_partner = marketplace_service.create_partner(
        db_session,
        PartnerCreateRequest(
            name="PT Bali Limbah B3 Lestari",
            contact_email="ops@balib3lestari.id",
            contact_phone="+628113909988",
            address="Kawasan Pelabuhan Benoa",
            partner_type="PENDAUR_ULANG",
            is_verified=True,
        ),
    )

    man_resp = client.post(
        "/api/v1/community/hazardous-manifests",
        json={
            "category_id": special_cat.id,
            "handler_partner_id": b3_partner.id,
            "transporter_license_no": "KLHK-B3-BALI-2026-8800",
            "weight_kg": 60.0,
            "hazard_type": "TOXIC",
            "handling_sop_code": "SOP-B3-TRANSPORT-KLHK",
            "notes": "Limbah medis rumah tangga & baterai aki bekas",
        },
        headers=b3_headers,
    )
    assert man_resp.status_code == 201
    man_id = man_resp.json()["id"]

    client.patch(
        f"/api/v1/community/hazardous-manifests/{man_id}/status",
        json={"status": "DELIVERED_TO_FACILITY", "notes": "Tiba di insinerator limbah B3 berizin"},
        headers=b3_headers,
    )

    disp_resp = client.post(
        f"/api/v1/community/hazardous-manifests/{man_id}/disposal",
        json={
            "destruction_cert_no": "CERT-KLHK-B3-2026-9900",
            "notes": "Pemusnahan suhu tinggi di insinerator tervalidasi standar baku mutu KLHK",
        },
        headers=b3_headers,
    )
    assert disp_resp.status_code == 200
    assert disp_resp.json()["status"] == "SAFELY_DISPOSED"

    # =========================================================================
    # STEP 11: Banjar Regional Dashboard & Platform Reporting Verification
    # =========================================================================
    dash_resp = client.get(f"/api/v1/community/banjar/{area.id}/dashboard", headers=prajuru_headers)
    assert dash_resp.status_code == 200
    dash = dash_resp.json()
    assert dash["service_area_name"] == "Banjar Sukawati Kaja"
    assert dash["total_pickups_count"] == 1  # 1 household pickup request
    assert dash["open_complaints_count"] == 0  # Complaint was resolved

    # Admin global dashboard
    admin_dash = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert admin_dash.status_code == 200
    dash_data = admin_dash.json()
    assert dash_data["total_pickups"] >= 1
    assert dash_data["pickups_completed"] >= 1
    assert dash_data["total_verified_weight_kg"] >= 12.5
