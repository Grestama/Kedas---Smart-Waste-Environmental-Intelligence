"""WasteLink Bali — Phase 6 API Tests: Community Banjar, Programs & CSR Funding, Cleanups & Hazardous Waste."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from app.cli.bootstrap_admin import bootstrap_admin
from app.modules.account.models import Role, UserRole
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import ServiceAreaCreateRequest
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


def test_banjar_profile_official_assignment_and_territorial_dashboard(client, db_session):
    """Test 1: Banjar institutional profile, prajuru assignment, and territorial dashboard access."""
    # 1. Setup Admin & Areas
    admin_email = f"admin_banjar_{uuid.uuid4().hex[:6]}@wastelink.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin Banjar")
    admin_token = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    area1 = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_SUKAWATI_{uuid.uuid4().hex[:4].upper()}",
            name="Banjar Sukawati Kaja",
            administrative_area="Gianyar",
        ),
    )
    collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_SANUR_{uuid.uuid4().hex[:4].upper()}",
            name="Banjar Sanur Kauh",
            administrative_area="Denpasar",
        ),
    )

    # 2. Create Banjar Profile for Area 1
    prof_resp = client.post(
        "/api/v1/community/banjar/profile",
        json={
            "service_area_id": area1.id,
            "desa_adat_name": "Desa Adat Sukawati",
            "kelian_banjar_name": "I Made Sujana",
            "contact_phone": "+6281234567890",
            "household_count": 350,
            "target_sorting_percent": 80.0,
        },
        headers=admin_headers,
    )
    assert prof_resp.status_code == 201
    assert prof_resp.json()["desa_adat_name"] == "Desa Adat Sukawati"

    # 3. Setup Prajuru User for Area 1 & Non-Prajuru User for Area 2
    prajuru_token, prajuru_user = _register(
        client, f"prajuru_{uuid.uuid4().hex[:6]}@banjar.bali", "I Wayan Prajuru"
    )
    _grant_role(db_session, prajuru_user["id"], "COMMUNITY_LEADER")
    prajuru_headers = {"Authorization": f"Bearer {prajuru_token}"}

    other_token, other_user = _register(
        client, f"other_{uuid.uuid4().hex[:6]}@sanur.bali", "I Ketut Warga Luar"
    )
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Assign Prajuru to Area 1
    assign_resp = client.post(
        "/api/v1/community/banjar/officials",
        json={
            "user_id": prajuru_user["id"],
            "service_area_id": area1.id,
            "official_title": "Prajuru Lingkungan Hidup Banjar",
        },
        headers=admin_headers,
    )
    assert assign_resp.status_code == 201

    # 4. Prajuru accesses Area 1 dashboard -> 200 OK
    dash_resp = client.get(
        f"/api/v1/community/banjar/{area1.id}/dashboard",
        headers=prajuru_headers,
    )
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["service_area_name"] == "Banjar Sukawati Kaja"
    assert dash_data["kelian_banjar_name"] == "I Made Sujana"
    assert dash_data["household_count"] == 350
    assert dash_data["sorting_compliance_percent"] == 80.0

    # 5. Non-prajuru accesses Area 1 dashboard -> 403 Forbidden (Territorial Isolation)
    unauth_resp = client.get(
        f"/api/v1/community/banjar/{area1.id}/dashboard",
        headers=other_headers,
    )
    assert unauth_resp.status_code == 403
    assert "akses ditolak" in unauth_resp.json()["message"].lower()


def test_community_events_and_complaint_escalation(client, db_session):
    """Test 2: Banjar event scheduling and citizen grievance escalation & resolution."""
    # 1. Setup Admin, Prajuru, Citizen & Area
    admin_email = f"admin_event_{uuid.uuid4().hex[:6]}@wastelink.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin Event")
    admin_token = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_UBAL_{uuid.uuid4().hex[:4].upper()}",
            name="Banjar Ubud Kaja",
            administrative_area="Gianyar",
        ),
    )

    citizen_token, citizen_user = _register(
        client, f"warga_ubud_{uuid.uuid4().hex[:6]}@gmail.com", "Ni Luh Warga"
    )
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # 2. Schedule Community Event (Gotong Royong)
    event_date = datetime.now(UTC) + timedelta(days=3)
    evt_resp = client.post(
        "/api/v1/community/events",
        json={
            "service_area_id": area.id,
            "title": "Ngayah Bersih-Bersih Saluran Got Banjar",
            "description": "Pembersihan sedimen dan sampah anorganik sebelum purnama",
            "event_date": event_date.isoformat(),
            "event_type": "GOTONG_ROYONG",
            "expected_attendees": 60,
        },
        headers=admin_headers,
    )
    assert evt_resp.status_code == 201
    event_id = evt_resp.json()["id"]
    assert evt_resp.json()["event_no"].startswith("EVT-BANJAR-")
    assert evt_resp.json()["status"] == "SCHEDULED"

    # Record attendance
    attend_resp = client.post(
        f"/api/v1/community/events/{event_id}/attendance",
        json={
            "actual_attendees": 54,
            "status": "COMPLETED",
        },
        headers=admin_headers,
    )
    assert attend_resp.status_code == 200
    assert attend_resp.json()["actual_attendees"] == 54
    assert attend_resp.json()["status"] == "COMPLETED"

    # 3. Citizen files a waste complaint (tumpukan sampah liar)
    cmp_resp = client.post(
        "/api/v1/community/complaints",
        json={
            "service_area_id": area.id,
            "title": "Tumpukan sampah plastik di pojok gang setra",
            "description": "Ada tumpukan kantong plastik hitam liar berbau di dekat pos kamling gang setra",
            "location_detail": "Jl. Raya Ubud Gang Setra No. 3",
        },
        headers=citizen_headers,
    )
    assert cmp_resp.status_code == 201
    ticket_id = cmp_resp.json()["id"]
    assert cmp_resp.json()["ticket_no"].startswith("CMP-")
    assert cmp_resp.json()["status"] == "REPORTED"

    # 4. Prajuru / Admin resolves the complaint
    resolve_resp = client.post(
        f"/api/v1/community/complaints/{ticket_id}/resolve",
        json={
            "status": "RESOLVED",
            "resolution_notes": "Truk kebersihan desa telah mengangkut 4 karung sampah liar ke TPS3R",
        },
        headers=admin_headers,
    )
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["status"] == "RESOLVED"
    assert "Truk kebersihan" in resolve_resp.json()["resolution_notes"]


def test_program_funding_sponsorship_and_budget_allocation(client, db_session):
    """Test 3: CSR funding programs, sponsorship deposit, and banjar budget allocation."""
    # 1. Setup Admin
    admin_email = f"admin_csr_{uuid.uuid4().hex[:6]}@wastelink.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin CSR")
    admin_token = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_CSR_{uuid.uuid4().hex[:4].upper()}",
            name="Banjar Canggu Permai",
            administrative_area="Badung",
        ),
    )

    # 2. Create Funding Program
    prog_code = f"PROG_CSR_{uuid.uuid4().hex[:4].upper()}"
    prog_resp = client.post(
        "/api/v1/programs",
        json={
            "code": prog_code,
            "name": "Program CSR Bali Bersih Bebas Sampah 2026",
            "sponsor_name": "PT Bank BPD Bali & Pertamina Foundation",
            "program_type": "CSR",
            "target_service_area_id": area.id,
            "total_budget_idr": 150_000_000,
            "points_capacity": 1_500_000,
        },
        headers=admin_headers,
    )
    assert prog_resp.status_code == 201
    prog_id = prog_resp.json()["id"]
    assert prog_resp.json()["total_budget_idr"] == 150_000_000

    # 3. Record CSR Sponsorship injection
    spons_resp = client.post(
        f"/api/v1/programs/{prog_id}/sponsorships",
        json={
            "sponsor_name": "PT Bank BPD Bali",
            "sponsor_type": "CSR",
            "amount_idr": 50_000_000,
            "contract_ref": "CSR-BPDBALI-2026-009",
            "notes": "Penyaluran dana CSR kuartal 4 pemulihan pesisir",
        },
        headers=admin_headers,
    )
    assert spons_resp.status_code == 201
    assert spons_resp.json()["amount_idr"] == 50_000_000

    # Verify total budget increased: 150M + 50M = 200M
    progs_resp = client.get("/api/v1/programs", headers=admin_headers)
    target_prog = next(p for p in progs_resp.json() if p["id"] == prog_id)
    assert target_prog["total_budget_idr"] == 200_000_000

    # 4. Allocate budget to Banjar
    alloc_resp = client.post(
        f"/api/v1/programs/{prog_id}/allocations",
        json={
            "service_area_id": area.id,
            "allocated_amount_idr": 35_000_000,
            "purpose": "Pengadaan 50 set komposter aerobik rumah tangga banjar",
        },
        headers=admin_headers,
    )
    assert alloc_resp.status_code == 201
    assert alloc_resp.json()["allocated_amount_idr"] == 35_000_000

    # 5. Over-allocation fails
    over_resp = client.post(
        f"/api/v1/programs/{prog_id}/allocations",
        json={
            "service_area_id": area.id,
            "allocated_amount_idr": 250_000_000,  # Exceeds remaining budget
            "purpose": "Dana berlebih",
        },
        headers=admin_headers,
    )
    assert over_resp.status_code == 422
    assert "melebihi sisa anggaran" in over_resp.json()["message"].lower()


def test_volunteer_cleanup_action_and_metric_isolation(client, db_session):
    """Test 4: Role 11 volunteer beach & river cleanup action, weight breakdown, and isolation from citizen pickups."""
    # 1. Setup Admin & Volunteer Coordinator
    admin_email = f"admin_cln_{uuid.uuid4().hex[:6]}@wastelink.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin Cleanup")
    admin_token = _login(client, admin_email, "admin_secret_123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_SANUR_{uuid.uuid4().hex[:4].upper()}",
            name="Sanur Pesisir",
            administrative_area="Denpasar",
        ),
    )

    coord_token, coord_user = _register(
        client, f"coord_{uuid.uuid4().hex[:6]}@cleanbali.org", "Wayan Volunteer Coordinator"
    )
    _grant_role(db_session, coord_user["id"], "VOLUNTEER_COORDINATOR")
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # 2. Schedule Beach Cleanup Action
    action_resp = client.post(
        "/api/v1/community/cleanups",
        json={
            "action_type": "BEACH_CLEANUP",
            "location_name": "Pantai Mertasari Sanur",
            "service_area_id": area.id,
            "event_date": datetime.now(UTC).isoformat(),
            "duration_hours": 3.0,
            "volunteer_count": 85,
        },
        headers=coord_headers,
    )
    assert action_resp.status_code == 201
    action_id = action_resp.json()["id"]
    assert action_resp.json()["action_no"].startswith("CLN-BEACH-")
    assert action_resp.json()["status"] == "PLANNED"

    # 3. Complete Action with Waste Breakdown
    comp_resp = client.post(
        f"/api/v1/community/cleanups/{action_id}/complete",
        json={
            "total_collected_weight_kg": 420.5,
            "plastic_weight_kg": 250.0,
            "organic_weight_kg": 90.5,
            "residual_weight_kg": 80.0,
            "evidence_notes": "Foto timbangan dan karung terpilah di posko pantai Sanur",
        },
        headers=coord_headers,
    )
    assert comp_resp.status_code == 200
    assert comp_resp.json()["status"] == "COMPLETED"
    assert comp_resp.json()["total_collected_weight_kg"] == 420.5

    # 4. Verify Cleanup Action
    ver_resp = client.post(
        f"/api/v1/community/cleanups/{action_id}/verify",
        json={"notes": "Dokumentasi lengkap dan berat sesuai serah terima TPS3R Sanur"},
        headers=admin_headers,
    )
    assert ver_resp.status_code == 200
    assert ver_resp.json()["status"] == "VERIFIED"

    # 5. Crucial Invariant: Citizen pickup requests count and weights in this area are NOT mutated by cleanup actions
    dash_resp = client.get(f"/api/v1/community/banjar/{area.id}/dashboard", headers=admin_headers)
    assert dash_resp.status_code == 200
    assert dash_resp.json()["total_pickups_count"] == 0
    assert (
        dash_resp.json()["total_weight_kg"] == 0.0
    )  # Clean isolation between cleanup actions and regular citizen pickups


def test_hazardous_waste_manifest_and_partner_license_gating(client, db_session):
    """Test 5: Role 12 hazardous waste manifest, partner verification gating, and safe destruction certificate."""
    # 1. Setup Admin, Handler User, & Category
    admin_email = f"admin_b3_{uuid.uuid4().hex[:6]}@wastelink.bali"
    bootstrap_admin(email=admin_email, password="admin_secret_123", full_name="Admin B3")

    handler_token, handler_user = _register(
        client, f"b3_officer_{uuid.uuid4().hex[:6]}@wastelink.bali", "I Ketut B3 Handler"
    )
    _grant_role(db_session, handler_user["id"], "HAZARDOUS_HANDLER")
    handler_headers = {"Authorization": f"Bearer {handler_token}"}

    cats = taxonomy_service.seed_default_categories(db_session)
    special_cat = next(c for c in cats if c.code == "SPECIAL")

    # 2. Create Unverified Partner -> Manifest creation MUST FAIL
    unverified_partner = marketplace_service.create_partner(
        db_session,
        PartnerCreateRequest(
            name="CV Transporter Belum Izin",
            contact_email="unverified@transporter.id",
            contact_phone="+6281234567000",
            address="Denpasar Barat",
            partner_type="PENDAUR_ULANG",
            is_verified=False,
        ),
    )

    fail_resp = client.post(
        "/api/v1/community/hazardous-manifests",
        json={
            "category_id": special_cat.id,
            "handler_partner_id": unverified_partner.id,
            "transporter_license_no": "IZIN-B3-TIDAK-VALID",
            "weight_kg": 45.0,
            "hazard_type": "TOXIC",
            "handling_sop_code": "SOP-B3-TOXIC-01",
        },
        headers=handler_headers,
    )
    assert fail_resp.status_code == 422
    assert "wajib melalui mitra terverifikasi" in fail_resp.json()["message"].lower()

    # 3. Create Verified Partner
    verified_partner = marketplace_service.create_partner(
        db_session,
        PartnerCreateRequest(
            name="PT Bali Limbah B3 Sejahtera",
            contact_email="official@balib3sejahtera.co.id",
            contact_phone="+628113901234",
            address="Kawasan Industri Pelabuhan Benoa",
            partner_type="PENDAUR_ULANG",
            is_verified=True,
        ),
    )

    # 4. Now manifest creation succeeds
    man_resp = client.post(
        "/api/v1/community/hazardous-manifests",
        json={
            "category_id": special_cat.id,
            "handler_partner_id": verified_partner.id,
            "transporter_license_no": "KLHK-B3-BALI-2026-9901",
            "weight_kg": 45.0,
            "hazard_type": "BATTERY",
            "handling_sop_code": "SOP-B3-ACCU-SAFE",
            "notes": "Aki bekas dan limbah baterai litium rumah tangga",
        },
        headers=handler_headers,
    )
    assert man_resp.status_code == 201
    manifest_id = man_resp.json()["id"]
    assert man_resp.json()["manifest_no"].startswith("MAN-B3-")
    assert man_resp.json()["status"] == "IN_TRANSIT"

    # 5. Update Transit Status
    stat_resp = client.patch(
        f"/api/v1/community/hazardous-manifests/{manifest_id}/status",
        json={
            "status": "DELIVERED_TO_FACILITY",
            "notes": "Tiba di fasilitas pengolahan limbah B3 Benoa",
        },
        headers=handler_headers,
    )
    assert stat_resp.status_code == 200
    assert stat_resp.json()["status"] == "DELIVERED_TO_FACILITY"

    # 6. Certify Safe Destruction / Disposal
    disp_resp = client.post(
        f"/api/v1/community/hazardous-manifests/{manifest_id}/disposal",
        json={
            "destruction_cert_no": "CERT-DISPOSAL-B3-2026-8812",
            "notes": "Penetralan asam sulfat dan peleburan timbal sesuai baku mutu KLHK",
        },
        headers=handler_headers,
    )
    assert disp_resp.status_code == 200
    assert disp_resp.json()["status"] == "SAFELY_DISPOSED"
    assert disp_resp.json()["destruction_cert_no"] == "CERT-DISPOSAL-B3-2026-8812"
    assert disp_resp.json()["disposed_at"] is not None
