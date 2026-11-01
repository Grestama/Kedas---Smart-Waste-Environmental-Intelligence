"""WasteLink Bali — Tahap 4: TPS3R/TPST & Bank Sampah Test Suite.

Verifies:
1. Facility registration & RBAC gating.
2. Facility intake receipt generation, pickup cross-reference, and scale discrepancy audit (|Delta| > 0.5 kg).
3. Facility intake receipt idempotency preventing double stock accretion.
4. Physical inventory stock tracking & category summary.
5. Material sorting & processing mass balance invariant with explicit residue fractions.
6. Negative stock prevention and mass balance violation rejection.
7. Bank Sampah member account opening and append-only monetary savings ledger (IDR).
8. Bank Sampah deposit calculation, withdrawal limits, and compensating reversal transactions.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from app.modules.account.models import Role, UserRole
from app.modules.collection import service as collection_service
from app.modules.collection.schemas import (
    CollectionSlotCreateRequest,
    ServiceAreaCreateRequest,
)
from app.modules.facility.models import FacilityType
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


def test_facility_registration_and_rbac(client, db_session):
    admin_token, _ = _register(
        client, f"admin_fac_{uuid.uuid4().hex[:6]}@wastelink.bali", "Admin TPS3R"
    )
    _grant_role(
        db_session,
        client.get("/api/v1/me", headers={"Authorization": f"Bearer {admin_token}"}).json()["id"],
        "ADMIN",
    )

    user_token, _ = _register(
        client, f"user_fac_{uuid.uuid4().hex[:6]}@wastelink.bali", "Warga Biasa"
    )

    # 1. Citizen cannot create facility (403)
    resp = client.post(
        "/api/v1/facilities",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "code": "TPS3R_SUKAWATI_TEST",
            "name": "TPS3R Sukawati Kaja",
            "facility_type": "TPS3R",
            "address": "Jl. Raya Sukawati, Gianyar",
            "capacity_kg_per_day": 3500.0,
        },
    )
    assert resp.status_code == 403

    # 2. Admin can create facility (201)
    code = f"TPS3R_{uuid.uuid4().hex[:6].upper()}"
    resp = client.post(
        "/api/v1/facilities",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "code": code,
            "name": "TPS3R Sukawati Asri",
            "facility_type": FacilityType.TPS3R.value,
            "address": "Banjar Kaja, Sukawati",
            "capacity_kg_per_day": 2500.0,
        },
    )
    assert resp.status_code == 201
    fac = resp.json()
    assert fac["code"] == code
    assert fac["capacity_kg_per_day"] == 2500.0

    # 3. Public/User can list facilities
    resp_list = client.get("/api/v1/facilities")
    assert resp_list.status_code == 200
    facilities = resp_list.json()
    assert any(f["code"] == code for f in facilities)


def test_facility_receipt_with_pickup_and_discrepancy(client, db_session):
    staff_token, staff_user = _register(
        client, f"staff_{uuid.uuid4().hex[:6]}@tps3r.bali", "Operator TPS3R"
    )
    _grant_role(db_session, staff_user["id"], "OPERATOR")

    collector_token, collector_user = _register(
        client, f"col_{uuid.uuid4().hex[:6]}@tps3r.bali", "Petugas Pengangkut"
    )
    _grant_role(db_session, collector_user["id"], "COLLECTOR")

    citizen_token, citizen_user = _register(
        client, f"cit_{uuid.uuid4().hex[:6]}@warga.bali", "Warga Sukawati"
    )
    headers_citizen = {"Authorization": f"Bearer {citizen_token}"}
    headers_col = {"Authorization": f"Bearer {collector_token}"}

    # Setup area, slot, category
    area = collection_service.create_service_area(
        db_session,
        ServiceAreaCreateRequest(
            code=f"AREA_FAC_{uuid.uuid4().hex[:6]}",
            name="Banjar Tengah Sukawati",
            administrative_area="Gianyar",
            is_active=True,
        ),
    )
    slot = collection_service.create_collection_slot(
        db_session,
        CollectionSlotCreateRequest(
            service_area_id=area.id,
            start_time=datetime.now(UTC) + timedelta(hours=1),
            end_time=datetime.now(UTC) + timedelta(hours=3),
            max_capacity=20,
        ),
    )
    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"CAT_ORG_{uuid.uuid4().hex[:4]}",
            name="Organik Sisa Dapur",
            category_type="ORGANIC",
            requires_special_handling=False,
        ),
    )

    # Setup Facility
    admin_token, admin_user = _register(client, f"admin_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin")
    _grant_role(db_session, admin_user["id"], "ADMIN")
    fac_resp = client.post(
        "/api/v1/facilities",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "code": f"TPS_{uuid.uuid4().hex[:6].upper()}",
            "name": "TPS3R Sukawati Operasional",
            "facility_type": "TPS3R",
            "service_area_id": area.id,
            "address": "Jl. Kaja Sukawati",
            "capacity_kg_per_day": 2000.0,
        },
    )
    facility_id = fac_resp.json()["id"]

    # Citizen adds address and creates pickup request
    addr_resp = client.post(
        "/api/v1/me/addresses",
        headers=headers_citizen,
        json={
            "label": "Rumah",
            "address_text": "Banjar Tengah Sukawati",
            "service_area_id": area.id,
        },
    )
    addr_id = addr_resp.json()["id"]

    pickup_resp = client.post(
        "/api/v1/pickup-requests",
        headers=headers_citizen,
        json={
            "category_id": cat.id,
            "address_id": addr_id,
            "slot_id": slot.id,
            "estimated_weight_kg": 10.0,
            "service_mode": "PICKUP",
            "notes": "Sampah dapur terpilah",
        },
    )
    assert pickup_resp.status_code == 201
    pickup_id = pickup_resp.json()["id"]

    # Collector accepts task
    client.post(f"/api/v1/collector/tasks/{pickup_id}/accept", headers=headers_col)
    client.post(
        f"/api/v1/collector/tasks/{pickup_id}/status",
        headers=headers_col,
        json={"status": "IN_TRANSIT"},
    )

    # Collector QC & verified weigh: 10.0 kg net
    client.post(
        f"/api/v1/pickup-requests/{pickup_id}/inspections",
        headers=headers_col,
        json={
            "result": "ACCEPTED",
            "contamination_level": "NONE",
        },
    )
    client.post(
        f"/api/v1/pickup-requests/{pickup_id}/weights",
        headers=headers_col,
        json={
            "method": "MANUAL_SCALE",
            "gross_weight_kg": 12.0,
            "tare_weight_kg": 2.0,
        },
    )

    # Facility receives trike with 11.5 kg (gross 13.5, tare 2.0). Field was 10.0 kg -> Discrepancy is +1.5 kg
    resp_receipt = client.post(
        "/api/v1/facilities/receipts",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "facility_id": facility_id,
            "category_id": cat.id,
            "pickup_id": pickup_id,
            "gross_weight_kg": 13.5,
            "tare_weight_kg": 2.0,
            "received_weight_kg": 11.5,
            "quality_grade": "GRADE_A",
            "contamination_percent": 2.0,
            "notes": "Muatan gerobak motor roda 3 telah diterima dan ditimbang ulang di timbangan jembatan/lantai",
        },
    )
    assert resp_receipt.status_code == 201
    rcpt = resp_receipt.json()
    assert rcpt["received_weight_kg"] == 11.5
    assert rcpt["discrepancy_kg"] == 1.5
    assert "Diskrepansi timbangan terdeteksi" in rcpt["discrepancy_reason"]

    # Verify pickup status is now COMPLETED
    p_status = client.get(f"/api/v1/pickup-requests/{pickup_id}", headers=headers_citizen).json()
    assert p_status["status"] == "COMPLETED"


def test_facility_receipt_idempotency(client, db_session):
    staff_token, staff_user = _register(
        client, f"staff_idemp_{uuid.uuid4().hex[:6]}@tps3r.bali", "Operator"
    )
    _grant_role(db_session, staff_user["id"], "OPERATOR")

    cat = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"CAT_IDEMP_{uuid.uuid4().hex[:4]}",
            name="Plastik Daur Ulang",
            category_type="RECYCLABLE",
            requires_special_handling=False,
        ),
    )

    admin_token, admin_user = _register(
        client, f"admin_idemp_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin"
    )
    _grant_role(db_session, admin_user["id"], "ADMIN")
    fac_resp = client.post(
        "/api/v1/facilities",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "code": f"TPS_IDEMP_{uuid.uuid4().hex[:6].upper()}",
            "name": "TPS3R Idempotent Test",
            "facility_type": "TPS3R",
            "address": "Sukawati",
            "capacity_kg_per_day": 2000.0,
        },
    )
    facility_id = fac_resp.json()["id"]

    idemp_key = f"IDEMP-RCPT-{uuid.uuid4().hex[:8]}"
    payload = {
        "facility_id": facility_id,
        "category_id": cat.id,
        "received_weight_kg": 25.0,
        "quality_grade": "GRADE_A",
        "idempotency_key": idemp_key,
    }

    # First call
    resp1 = client.post(
        "/api/v1/facilities/receipts",
        headers={"Authorization": f"Bearer {staff_token}"},
        json=payload,
    )
    assert resp1.status_code == 201
    id1 = resp1.json()["id"]

    # Duplicate call with same idempotency key
    resp2 = client.post(
        "/api/v1/facilities/receipts",
        headers={"Authorization": f"Bearer {staff_token}"},
        json=payload,
    )
    assert resp2.status_code == 201
    id2 = resp2.json()["id"]
    assert id1 == id2

    # Stock should be exactly 25.0 kg (not 50.0 kg)
    stock_resp = client.get(
        f"/api/v1/facilities/{facility_id}/stock",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert stock_resp.status_code == 200
    assert stock_resp.json()["total_stock_kg"] == 25.0


def test_sorting_process_mass_balance_and_residue(client, db_session):
    staff_token, staff_user = _register(
        client, f"staff_sort_{uuid.uuid4().hex[:6]}@tps3r.bali", "Staff Sortir"
    )
    _grant_role(db_session, staff_user["id"], "OPERATOR")

    # Categories: Mixed Inorganic (input), PET (output), Metal (output), Residue (output)
    cat_mixed = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"MIX_{uuid.uuid4().hex[:4]}",
            name="Anorganik Campur",
            category_type="RECYCLABLE",
            requires_special_handling=False,
        ),
    )
    cat_pet = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"PET_{uuid.uuid4().hex[:4]}",
            name="Plastik PET Bening",
            category_type="RECYCLABLE",
            requires_special_handling=False,
        ),
    )
    cat_metal = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"MET_{uuid.uuid4().hex[:4]}",
            name="Logam / Kaleng",
            category_type="RECYCLABLE",
            requires_special_handling=False,
        ),
    )
    cat_residue = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"RES_{uuid.uuid4().hex[:4]}",
            name="Residu TPA",
            category_type="RESIDUAL",
            requires_special_handling=False,
        ),
    )

    admin_token, admin_user = _register(
        client, f"admin_sort_{uuid.uuid4().hex[:6]}@tps3r.bali", "Admin"
    )
    _grant_role(db_session, admin_user["id"], "ADMIN")
    fac_resp = client.post(
        "/api/v1/facilities",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "code": f"TPS_SORT_{uuid.uuid4().hex[:6].upper()}",
            "name": "TPS3R Sorting Hub",
            "facility_type": "TPS3R",
            "address": "Sukawati",
            "capacity_kg_per_day": 2000.0,
        },
    )
    facility_id = fac_resp.json()["id"]

    # Intake 100 kg of Mixed Inorganic
    client.post(
        "/api/v1/facilities/receipts",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"facility_id": facility_id, "category_id": cat_mixed.id, "received_weight_kg": 100.0},
    )

    # 1. Attempt sorting with mass balance discrepancy > tolerance (e.g. input 50, output 30 -> diff 20 > 0.5)
    resp_violation = client.post(
        "/api/v1/facilities/sorting",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "facility_id": facility_id,
            "input_category_id": cat_mixed.id,
            "input_weight_kg": 50.0,
            "outputs": [
                {"category_id": cat_pet.id, "quantity_kg": 20.0, "is_residue": False},
                {"category_id": cat_metal.id, "quantity_kg": 10.0, "is_residue": False},
            ],
            "tolerance_kg": 0.5,
        },
    )
    assert resp_violation.status_code == 422
    assert "mass balance error" in resp_violation.json()["message"]

    # 2. Attempt sorting more than available inventory (input 200 kg when stock is 100 kg)
    resp_nostock = client.post(
        "/api/v1/facilities/sorting",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "facility_id": facility_id,
            "input_category_id": cat_mixed.id,
            "input_weight_kg": 200.0,
            "outputs": [
                {"category_id": cat_pet.id, "quantity_kg": 150.0, "is_residue": False},
                {"category_id": cat_residue.id, "quantity_kg": 50.0, "is_residue": True},
            ],
        },
    )
    assert resp_nostock.status_code == 422
    assert "Stok material awal tidak mencukupi" in resp_nostock.json()["message"]

    # 3. Valid sorting: 50 kg input -> 25 kg PET, 15 kg Metal, 9.8 kg Residue (diff 0.2 <= tolerance 0.5)
    resp_valid = client.post(
        "/api/v1/facilities/sorting",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "facility_id": facility_id,
            "input_category_id": cat_mixed.id,
            "input_weight_kg": 50.0,
            "outputs": [
                {"category_id": cat_pet.id, "quantity_kg": 25.0, "is_residue": False},
                {"category_id": cat_metal.id, "quantity_kg": 15.0, "is_residue": False},
                {
                    "category_id": cat_residue.id,
                    "quantity_kg": 9.8,
                    "is_residue": True,
                    "notes": "Residu sisa pilah",
                },
            ],
            "tolerance_kg": 0.5,
            "notes": "Proses pemilahan manual ban berjalan shift pagi",
        },
    )
    assert resp_valid.status_code == 201
    movements = resp_valid.json()
    assert len(movements) == 4  # 1 deduction + 3 additions

    # Check updated stock
    summary = client.get(
        f"/api/v1/facilities/{facility_id}/stock",
        headers={"Authorization": f"Bearer {staff_token}"},
    ).json()
    stock_map = {item["category_id"]: item["current_stock_kg"] for item in summary["items"]}
    assert stock_map[cat_mixed.id] == 50.0  # 100 - 50 = 50
    assert stock_map[cat_pet.id] == 25.0
    assert stock_map[cat_metal.id] == 15.0
    assert stock_map[cat_residue.id] == 9.8


def test_waste_bank_savings_and_compensating_reversal(client, db_session):
    staff_token, staff_user = _register(
        client, f"staff_bank_{uuid.uuid4().hex[:6]}@banksampah.bali", "Petugas Bank Sampah"
    )
    _grant_role(db_session, staff_user["id"], "OPERATOR")

    citizen_token, citizen_user = _register(
        client, f"nasabah_{uuid.uuid4().hex[:6]}@banjar.bali", "I Wayan Nasabah"
    )

    cat_karton = taxonomy_service.create_category(
        db_session,
        WasteCategoryCreateRequest(
            code=f"KRT_{uuid.uuid4().hex[:4]}",
            name="Kardus Cokelat",
            category_type="RECYCLABLE",
            requires_special_handling=False,
        ),
    )

    admin_token, admin_user = _register(
        client, f"admin_bank_{uuid.uuid4().hex[:6]}@banksampah.bali", "Admin"
    )
    _grant_role(db_session, admin_user["id"], "ADMIN")
    fac_resp = client.post(
        "/api/v1/facilities",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "code": f"BS_{uuid.uuid4().hex[:6].upper()}",
            "name": "Bank Sampah Banjar Kaja",
            "facility_type": "BANK_SAMPAH",
            "address": "Banjar Kaja",
            "capacity_kg_per_day": 1000.0,
        },
    )
    facility_id = fac_resp.json()["id"]

    # 1. Register Member Account
    resp_member = client.post(
        "/api/v1/facilities/waste-bank/members",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"user_id": citizen_user["id"], "facility_id": facility_id},
    )
    assert resp_member.status_code == 201
    member = resp_member.json()
    member_id = member["id"]
    assert member["current_balance_idr"] == 0

    # 2. Deposit: 10 kg @ Rp 2,500 = Rp 25,000
    resp_dep = client.post(
        "/api/v1/facilities/waste-bank/deposit",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "member_id": member_id,
            "category_id": cat_karton.id,
            "weight_kg": 10.0,
            "unit_price_idr": 2500,
            "notes": "Setoran kardus bersih",
        },
    )
    assert resp_dep.status_code == 201
    tx_dep = resp_dep.json()
    assert tx_dep["amount_idr"] == 25000
    assert tx_dep["running_balance_idr"] == 25000

    # 3. Second Deposit: 5 kg @ Rp 2,500 = Rp 12,500 -> Running balance = Rp 37,500
    resp_dep2 = client.post(
        "/api/v1/facilities/waste-bank/deposit",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "member_id": member_id,
            "category_id": cat_karton.id,
            "weight_kg": 5.0,
            "unit_price_idr": 2500,
        },
    )
    assert resp_dep2.status_code == 201
    tx_dep2 = resp_dep2.json()
    assert tx_dep2["amount_idr"] == 12500
    assert tx_dep2["running_balance_idr"] == 37500

    # 4. Withdrawal: Rp 15,000 -> Running balance = Rp 22,500
    resp_wdr = client.post(
        "/api/v1/facilities/waste-bank/withdraw",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"member_id": member_id, "amount_idr": 15000, "notes": "Tarik tunai uang saku"},
    )
    assert resp_wdr.status_code == 201
    tx_wdr = resp_wdr.json()
    assert tx_wdr["amount_idr"] == -15000
    assert tx_wdr["running_balance_idr"] == 22500

    # 5. Withdrawal exceeding balance (try Rp 30,000 when balance is Rp 22,500) -> 422
    resp_wdr_fail = client.post(
        "/api/v1/facilities/waste-bank/withdraw",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"member_id": member_id, "amount_idr": 30000},
    )
    assert resp_wdr_fail.status_code == 422
    assert "Saldo tabungan tidak mencukupi" in resp_wdr_fail.json()["message"]

    # 6. Compensating Reversal of second deposit (Rp 12,500)
    resp_rev = client.post(
        "/api/v1/facilities/waste-bank/transactions/{id}/reverse".replace("{id}", tx_dep2["id"]),
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"reason": "Koreksi salah input nota timbang nasabah"},
    )
    assert resp_rev.status_code == 200
    tx_rev = resp_rev.json()
    assert tx_rev["transaction_type"] == "REVERSAL"
    assert tx_rev["amount_idr"] == -12500
    assert tx_rev["running_balance_idr"] == 10000  # 22,500 - 12,500 = 10,000
    assert tx_rev["reverses_transaction_id"] == tx_dep2["id"]

    # 7. Member transaction audit trail
    resp_txs = client.get(
        f"/api/v1/facilities/waste-bank/members/{member_id}/transactions",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp_txs.status_code == 200
    txs = resp_txs.json()
    assert len(txs) == 4  # dep1, dep2, wdr, rev
