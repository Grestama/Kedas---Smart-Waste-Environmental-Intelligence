import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  acceptMaterialOffer,
  completeOrganicProcessing,
  confirmDeliveryProcessing,
  confirmDeliveryReceipt,
  createB2BLocation,
  createB2BOrganization,
  createB2BPickup,
  createBatch,
  createMaterialOffer,
  createPartner,
  dispatchDelivery,
  getB2BReport,
  listB2BLocations,
  listBatches,
  listMaterialOffers,
  listPartners,
  startOrganicProcessing,
  updateB2BPickupStatus,
  verifyPartner,
} from "@/services/marketplace";
import {
  B2BLocation,
  B2BOperationalReport,
  B2BOrganization,
  B2BPickupRequest,
  DeliveryRecord,
  MaterialBatch,
  MaterialOffer,
  OrganicProcessingRecord,
  Partner,
} from "@/types/marketplace";

describe("WasteLink Bali — Tahap 5: Marketplace, Downstream Partners, Organic & B2B Frontend Service Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Partner listing and verification gating works as expected", async () => {
    const mockPartner: Partner = {
      id: "part_recycle_bali",
      name: "PT Bali Daur Ulang Mandiri",
      contact_email: "info@balirecycle.id",
      contact_phone: "+6281234567890",
      address: "Kawasan Industri Benoa, Denpasar Selatan",
      partner_type: "PENDAUR_ULANG",
      capacity_kg_per_month: 50000,
      service_area_id: "sa_denpasar",
      verification_status: "VERIFIED",
      verified_at: "2026-10-30T08:00:00Z",
      verified_by: "usr_admin_01",
      created_at: "2026-10-30T07:00:00Z",
    };

    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce([mockPartner]);
    const partners = await listPartners({ verifiedOnly: true, partnerType: "PENDAUR_ULANG" });

    expect(getSpy).toHaveBeenCalledWith("/admin/partners?verified_only=true&partner_type=PENDAUR_ULANG");
    expect(partners).toHaveLength(1);
    expect(partners[0].partner_type).toBe("PENDAUR_ULANG");
    expect(partners[0].verification_status).toBe("VERIFIED");

    // Test verify partner
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      ...mockPartner,
      verification_status: "VERIFIED",
    });

    const verified = await verifyPartner("part_recycle_bali", {
      verification_status: "VERIFIED",
      notes: "Audit fasilitas daur ulang lengkap dan legalitas valid",
    });

    expect(postSpy).toHaveBeenCalledWith("/admin/partners/part_recycle_bali/verify", {
      verification_status: "VERIFIED",
      notes: "Audit fasilitas daur ulang lengkap dan legalitas valid",
    });
    expect(verified.verification_status).toBe("VERIFIED");
  });

  it("2. Delivery lifecycle preserves dispatched weight, records receipt discrepancy, and gates processing proof", async () => {
    const mockDelivery: DeliveryRecord = {
      id: "del_001",
      batch_id: "batch_pet_001",
      partner_id: "part_recycle_bali",
      dispatched_weight_kg: 500.0,
      received_weight_kg: null,
      weight_discrepancy_kg: null,
      status: "DISPATCHED",
      dispatched_at: "2026-10-30T08:15:00Z",
      received_at: null,
      notes: "Truk Isuzu DK-1234-AB",
    };

    // Dispatch delivery
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockDelivery);
    const dispatched = await dispatchDelivery({
      batch_id: "batch_pet_001",
      partner_id: "part_recycle_bali",
      dispatched_weight_kg: 500.0,
      notes: "Truk Isuzu DK-1234-AB",
    });
    expect(dispatched.dispatched_weight_kg).toBe(500.0);
    expect(dispatched.status).toBe("DISPATCHED");

    // Receive delivery with discrepancy
    const mockReceived: DeliveryRecord = {
      ...mockDelivery,
      received_weight_kg: 492.0,
      weight_discrepancy_kg: -8.0,
      status: "DELIVERED",
      received_at: "2026-10-30T09:30:00Z",
      notes: "Timbangan pabrik tara 492 kg",
    };
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockReceived);
    const received = await confirmDeliveryReceipt("del_001", {
      received_weight_kg: 492.0,
      notes: "Timbangan pabrik tara 492 kg",
    });
    expect(received.dispatched_weight_kg).toBe(500.0); // Never mutated
    expect(received.received_weight_kg).toBe(492.0);
    expect(received.weight_discrepancy_kg).toBe(-8.0);

    // Confirm processing (Explicit recycling proof)
    const mockProcessed: DeliveryRecord = {
      ...mockReceived,
      notes: "Bukti peleburan flake PET: Sertifikat Daur Ulang #RC-9981",
    };
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockProcessed);
    const processed = await confirmDeliveryProcessing("del_001", {
      notes: "Bukti peleburan flake PET: Sertifikat Daur Ulang #RC-9981",
    });
    expect(processed.notes).toContain("Sertifikat Daur Ulang #RC-9981");
  });

  it("3. Material offers handle supply/demand listings and allocation", async () => {
    const mockOffer: MaterialOffer = {
      id: "ofr_001",
      offer_no: "OFR-DEMAND-202610300800-A1B2",
      offer_type: "DEMAND",
      category_id: "cat_kardus",
      partner_id: "part_recycle_bali",
      facility_id: null,
      min_quantity_kg: 200,
      max_quantity_kg: 1000,
      quality_grade: "GRADE_A",
      price_indicative_idr: 2500,
      valid_until: "2026-11-06T00:00:00Z",
      status: "OPEN",
      notes: "Kardus bersih kering minim lem",
      created_by: "usr_partner_01",
      created_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockOffer);
    const createdOffer = await createMaterialOffer({
      offer_type: "DEMAND",
      category_id: "cat_kardus",
      min_quantity_kg: 200,
      max_quantity_kg: 1000,
      price_indicative_idr: 2500,
      valid_until: "2026-11-06T00:00:00Z",
      notes: "Kardus bersih kering minim lem",
    });
    expect(createdOffer.offer_no).toMatch(/^OFR-DEMAND-/);
    expect(createdOffer.status).toBe("OPEN");

    // Accept offer
    const allocatedOffer: MaterialOffer = {
      ...mockOffer,
      status: "ALLOCATED",
    };
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(allocatedOffer);
    const accepted = await acceptMaterialOffer("ofr_001", {
      allocated_quantity_kg: 500,
      target_facility_id: "fac_sukawati",
    });
    expect(accepted.status).toBe("ALLOCATED");
  });

  it("4. Organic processing lifecycle tracks composting and Maggot BSF bioconversion", async () => {
    const mockStarted: OrganicProcessingRecord = {
      id: "org_001",
      batch_no: "ORG-MAGGOT_BSF-202610300800-XYZ1",
      facility_id: "fac_sukawati",
      operator_user_id: "usr_operator_01",
      process_type: "MAGGOT_BSF",
      input_weight_kg: 850.0,
      output_product_weight_kg: 0.0,
      residue_weight_kg: 0.0,
      status: "IN_PROGRESS",
      started_at: "2026-10-30T08:00:00Z",
      completed_at: null,
      notes: "Bioreaktor larva BSF biokonversi sisa makanan hotel",
      created_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockStarted);
    const started = await startOrganicProcessing({
      facility_id: "fac_sukawati",
      process_type: "MAGGOT_BSF",
      input_weight_kg: 850.0,
      notes: "Bioreaktor larva BSF biokonversi sisa makanan hotel",
    });
    expect(started.process_type).toBe("MAGGOT_BSF");
    expect(started.status).toBe("IN_PROGRESS");
    expect(started.input_weight_kg).toBe(850.0);

    // Complete processing
    const mockCompleted: OrganicProcessingRecord = {
      ...mockStarted,
      output_product_weight_kg: 170.0, // Maggot larva
      residue_weight_kg: 210.0, // Kasgot (pupuk organik bekas larva)
      status: "HARVESTED",
      completed_at: "2026-10-30T16:00:00Z",
      notes: "Panen larva segar 170kg dan pupuk kasgot 210kg",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockCompleted);
    const completed = await completeOrganicProcessing("org_001", {
      output_product_weight_kg: 170.0,
      residue_weight_kg: 210.0,
      status: "HARVESTED",
      notes: "Panen larva segar 170kg dan pupuk kasgot 210kg",
    });
    expect(completed.status).toBe("HARVESTED");
    expect(completed.output_product_weight_kg).toBe(170.0);
    expect(completed.residue_weight_kg).toBe(210.0);
  });

  it("5. B2B Commercial generator onboarding, location listing, pickup scheduling and operational reporting", async () => {
    // 1. Create Organization
    const mockOrg: B2BOrganization = {
      id: "org_hotel_seminyak",
      name: "The Seminyak Beach Resort & Spa",
      business_type: "HOTEL",
      tax_id: "01.234.567.8-901.000",
      billing_contact_name: "Wayan Sudarma",
      billing_contact_phone: "+628113801234",
      billing_contact_email: "finance@theseminyak.com",
      is_active: true,
      created_at: "2026-10-30T07:30:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockOrg);
    const org = await createB2BOrganization({
      name: "The Seminyak Beach Resort & Spa",
      business_type: "HOTEL",
      tax_id: "01.234.567.8-901.000",
      billing_contact_name: "Wayan Sudarma",
      billing_contact_phone: "+628113801234",
      billing_contact_email: "finance@theseminyak.com",
    });
    expect(org.id).toBe("org_hotel_seminyak");
    expect(org.business_type).toBe("HOTEL");

    // 2. List Locations
    const mockLocation: B2BLocation = {
      id: "loc_main_kitchen",
      organization_id: "org_hotel_seminyak",
      name: "Dapur Utama & Loading Dock",
      address: "Jl. Kayu Aya No. 12, Seminyak, Kuta",
      service_area_id: "sa_seminyak",
      contact_person: "Chef Ketut",
      contact_phone: "+6281234567899",
      estimated_daily_kg: 180.0,
      pickup_frequency: "DAILY_MORNING",
      access_instructions: "Masuk lewat loading dock basement selatan, hubungi sekuriti",
      is_active: true,
      created_at: "2026-10-30T07:45:00Z",
    };

    vi.spyOn(apiClient, "get").mockResolvedValueOnce([mockLocation]);
    const locations = await listB2BLocations("org_hotel_seminyak");
    expect(locations).toHaveLength(1);
    expect(locations[0].name).toBe("Dapur Utama & Loading Dock");

    // 3. Create B2B Pickup
    const mockPickup: B2BPickupRequest = {
      id: "b2b_pck_001",
      request_no: "B2B-202610300800-HOTEL1",
      location_id: "loc_main_kitchen",
      category_id: "cat_organik_dapur",
      scheduled_date: "2026-10-31",
      estimated_weight_kg: 150.0,
      actual_weight_kg: null,
      status: "SCHEDULED",
      collector_id: null,
      notes: "Sampah organik sisa sarapan pagi",
      created_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockPickup);
    const pickup = await createB2BPickup({
      location_id: "loc_main_kitchen",
      category_id: "cat_organik_dapur",
      scheduled_date: "2026-10-31",
      estimated_weight_kg: 150.0,
      notes: "Sampah organik sisa sarapan pagi",
    });
    expect(pickup.request_no).toMatch(/^B2B-/);
    expect(pickup.status).toBe("SCHEDULED");

    // 4. Update B2B Pickup Status
    const mockUpdatedPickup: B2BPickupRequest = {
      ...mockPickup,
      status: "COLLECTED",
      actual_weight_kg: 146.5,
      notes: "Terangkut oleh armada TPS3R Seminyak",
    };
    vi.spyOn(apiClient, "patch").mockResolvedValueOnce(mockUpdatedPickup);
    const updated = await updateB2BPickupStatus("b2b_pck_001", {
      status: "COLLECTED",
      actual_weight_kg: 146.5,
      notes: "Terangkut oleh armada TPS3R Seminyak",
    });
    expect(updated.status).toBe("COLLECTED");
    expect(updated.actual_weight_kg).toBe(146.5);

    // 5. Get B2B Segregated Operational Report
    const mockReport: B2BOperationalReport = {
      organization_id: "org_hotel_seminyak",
      organization_name: "The Seminyak Beach Resort & Spa",
      total_requests: 1,
      scheduled_count: 0,
      collected_count: 1,
      received_facility_count: 0,
      processed_count: 0,
      cancelled_count: 0,
      total_estimated_weight_kg: 150.0,
      total_actual_weight_kg: 146.5,
    };
    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockReport);
    const report = await getB2BReport("org_hotel_seminyak");
    expect(report.organization_name).toBe("The Seminyak Beach Resort & Spa");
    expect(report.collected_count).toBe(1);
    expect(report.received_facility_count).toBe(0); // Cleanly segregated!
    expect(report.total_actual_weight_kg).toBe(146.5);
  });
});
