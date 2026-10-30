import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  listFacilities,
  getFacility,
  createFacility,
  getFacilityStock,
  createFacilityReceipt,
  recordSorting,
  createWasteBankMember,
  depositWasteBank,
  withdrawWasteBank,
  reverseWasteBankTransaction,
  listWasteBankTransactions,
} from "@/services/facility";
import {
  Facility,
  FacilityReceipt,
  FacilityStockSummary,
  StockMovement,
  WasteBankMember,
  WasteBankTransaction,
} from "@/types/facility";

describe("WasteLink Bali — Tahap 4: Facility & Waste Bank Frontend Service Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. listFacilities returns registered operational facilities", async () => {
    const mockFacilities: Facility[] = [
      {
        id: "fac_sukawati",
        code: "TPS3R_SUKAWATI",
        name: "TPS3R Sukawati Kaja",
        facility_type: "TPS3R",
        service_area_id: "sa_sukawati",
        address: "Banjar Kaja, Sukawati, Gianyar",
        capacity_kg_per_day: 2500,
        is_active: true,
        created_at: "2026-10-30T07:00:00Z",
      },
    ];

    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockFacilities);

    const result = await listFacilities();
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("TPS3R_SUKAWATI");
    expect(result[0].facility_type).toBe("TPS3R");
  });

  it("2. createFacilityReceipt posts intake receipt with scale discrepancy tracking", async () => {
    const mockReceipt: FacilityReceipt = {
      id: "rcpt_001",
      receipt_no: "FCR-202610300800-ABC123",
      facility_id: "fac_sukawati",
      pickup_id: "pick_001",
      category_id: "cat_anorganik",
      receiver_user_id: "usr_staff_01",
      sender_user_id: "usr_warga_01",
      gross_weight_kg: 13.5,
      tare_weight_kg: 2.0,
      received_weight_kg: 11.5,
      discrepancy_kg: 1.5,
      discrepancy_reason: "Diskrepansi timbangan terdeteksi: lapang 10.00 kg, fasilitas 11.50 kg",
      quality_grade: "GRADE_A",
      contamination_percent: 1.5,
      receipt_status: "ACCEPTED",
      idempotency_key: "IDEMP-001",
      notes: "Timbangan jembatan/lantai",
      created_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockReceipt);

    const result = await createFacilityReceipt({
      facility_id: "fac_sukawati",
      category_id: "cat_anorganik",
      pickup_id: "pick_001",
      gross_weight_kg: 13.5,
      tare_weight_kg: 2.0,
      received_weight_kg: 11.5,
      quality_grade: "GRADE_A",
      contamination_percent: 1.5,
    });

    expect(result.receipt_no).toMatch(/^FCR-/);
    expect(result.received_weight_kg).toBe(11.5);
    expect(result.discrepancy_kg).toBe(1.5);
  });

  it("3. recordSorting posts mass balance sorting with fractions and explicit residue", async () => {
    const mockMovements: StockMovement[] = [
      {
        id: "mov_001",
        facility_id: "fac_sukawati",
        category_id: "cat_mixed",
        batch_id: null,
        movement_type: "SORTING_IN",
        quantity_kg: -50.0,
        reference_id: "SORT-001",
        actor_user_id: "usr_staff_01",
        notes: "Input pemilahan",
        created_at: "2026-10-30T08:30:00Z",
      },
      {
        id: "mov_002",
        facility_id: "fac_sukawati",
        category_id: "cat_pet",
        batch_id: null,
        movement_type: "SORTING_OUTPUT",
        quantity_kg: 30.0,
        reference_id: "SORT-001",
        actor_user_id: "usr_staff_01",
        notes: "PET Bening",
        created_at: "2026-10-30T08:30:00Z",
      },
      {
        id: "mov_003",
        facility_id: "fac_sukawati",
        category_id: "cat_residue",
        batch_id: null,
        movement_type: "SORTING_RESIDUE",
        quantity_kg: 20.0,
        reference_id: "SORT-001",
        actor_user_id: "usr_staff_01",
        notes: "Residu pilahan",
        created_at: "2026-10-30T08:30:00Z",
      },
    ];

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockMovements);

    const movements = await recordSorting({
      facility_id: "fac_sukawati",
      input_category_id: "cat_mixed",
      input_weight_kg: 50.0,
      outputs: [
        { category_id: "cat_pet", quantity_kg: 30.0, is_residue: false },
        { category_id: "cat_residue", quantity_kg: 20.0, is_residue: true },
      ],
      tolerance_kg: 0.5,
    });

    expect(movements).toHaveLength(3);
    expect(movements[0].movement_type).toBe("SORTING_IN");
    expect(movements[2].movement_type).toBe("SORTING_RESIDUE");
  });

  it("4. Bank Sampah member savings deposit and compensating reversal", async () => {
    const mockDepositTx: WasteBankTransaction = {
      id: "tx_001",
      transaction_no: "TX-DEP-20261030-001",
      member_id: "mem_001",
      category_id: "cat_kardus",
      transaction_type: "DEPOSIT",
      weight_kg: 10.0,
      unit_price_idr: 2500,
      amount_idr: 25000,
      running_balance_idr: 25000,
      receipt_id: null,
      reverses_transaction_id: null,
      recorded_by: "usr_staff_01",
      status: "CONFIRMED",
      notes: "Setoran kardus",
      created_at: "2026-10-30T09:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockDepositTx);

    const depResult = await depositWasteBank({
      member_id: "mem_001",
      category_id: "cat_kardus",
      weight_kg: 10.0,
      unit_price_idr: 2500,
    });

    expect(depResult.amount_idr).toBe(25000);
    expect(depResult.running_balance_idr).toBe(25000);

    // Reversal
    const mockReversalTx: WasteBankTransaction = {
      id: "tx_rev_001",
      transaction_no: "TX-REV-20261030-002",
      member_id: "mem_001",
      category_id: "cat_kardus",
      transaction_type: "REVERSAL",
      weight_kg: 10.0,
      unit_price_idr: 2500,
      amount_idr: -25000,
      running_balance_idr: 0,
      receipt_id: null,
      reverses_transaction_id: "tx_001",
      recorded_by: "usr_staff_01",
      status: "CONFIRMED",
      notes: "Kompensasi koreksi",
      created_at: "2026-10-30T09:10:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockReversalTx);

    const revResult = await reverseWasteBankTransaction("tx_001", {
      reason: "Koreksi salah input nota timbang",
    });

    expect(revResult.transaction_type).toBe("REVERSAL");
    expect(revResult.amount_idr).toBe(-25000);
    expect(revResult.reverses_transaction_id).toBe("tx_001");
  });
});
