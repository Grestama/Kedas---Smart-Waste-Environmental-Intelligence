import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  allocateProgramBudget,
  assignBanjarOfficial,
  completeCleanupAction,
  createCleanupAction,
  createCommunityComplaint,
  createCommunityEvent,
  createFundingProgram,
  createHazardousManifest,
  createOrUpdateBanjarProfile,
  getBanjarDashboard,
  recordEventAttendance,
  recordHazardousDisposal,
  recordSponsorship,
  resolveCommunityComplaint,
  updateHazardousManifestStatus,
  verifyCleanupAction,
} from "@/services/community";
import {
  BanjarOfficial,
  BanjarProfile,
  BanjarRegionalDashboard,
  CleanupAction,
  CommunityComplaint,
  CommunityEvent,
  FundingProgram,
  HazardousWasteManifest,
  ProgramBudgetAllocation,
  ProgramSponsorship,
} from "@/types/community";

describe("WasteLink Bali — Tahap 6: Community Banjar, Funding Programs, Cleanups & Hazardous Waste Frontend Service Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Banjar Profile, Official Assignment, and Regional Dashboard KPI metrics", async () => {
    // 1. Create Profile
    const mockProfile: BanjarProfile = {
      id: "prof_sukawati",
      service_area_id: "area_sukawati_kaja",
      desa_adat_name: "Desa Adat Sukawati",
      kelian_banjar_name: "I Made Sujana",
      contact_phone: "+6281234567890",
      household_count: 350,
      target_sorting_percent: 85.0,
      created_at: "2026-10-30T08:00:00Z",
      updated_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockProfile);
    const profile = await createOrUpdateBanjarProfile({
      service_area_id: "area_sukawati_kaja",
      desa_adat_name: "Desa Adat Sukawati",
      kelian_banjar_name: "I Made Sujana",
      contact_phone: "+6281234567890",
      household_count: 350,
      target_sorting_percent: 85.0,
    });
    expect(profile.desa_adat_name).toBe("Desa Adat Sukawati");
    expect(profile.target_sorting_percent).toBe(85.0);

    // 2. Assign Official
    const mockOfficial: BanjarOfficial = {
      id: "off_01",
      user_id: "usr_prajuru_01",
      service_area_id: "area_sukawati_kaja",
      official_title: "Prajuru Lingkungan Banjar",
      is_active: true,
      created_at: "2026-10-30T08:05:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockOfficial);
    const official = await assignBanjarOfficial({
      user_id: "usr_prajuru_01",
      service_area_id: "area_sukawati_kaja",
      official_title: "Prajuru Lingkungan Banjar",
    });
    expect(official.official_title).toBe("Prajuru Lingkungan Banjar");

    // 3. Get Dashboard
    const mockDashboard: BanjarRegionalDashboard = {
      service_area_id: "area_sukawati_kaja",
      service_area_name: "Banjar Sukawati Kaja",
      desa_adat_name: "Desa Adat Sukawati",
      kelian_banjar_name: "I Made Sujana",
      household_count: 350,
      total_pickups_count: 120,
      total_weight_kg: 840.5,
      sorting_compliance_percent: 85.0,
      open_complaints_count: 1,
      upcoming_events_count: 2,
      active_programs_count: 1,
    };

    vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockDashboard);
    const dashboard = await getBanjarDashboard("area_sukawati_kaja");
    expect(dashboard.service_area_name).toBe("Banjar Sukawati Kaja");
    expect(dashboard.household_count).toBe(350);
    expect(dashboard.open_complaints_count).toBe(1);
  });

  it("2. Community event lifecycle and citizen complaint escalation and resolution", async () => {
    // 1. Create Event
    const mockEvent: CommunityEvent = {
      id: "evt_001",
      event_no: "EVT-BANJAR-202610300800-A1B2",
      service_area_id: "area_sukawati_kaja",
      title: "Ngayah Resik Sampah Banjar",
      description: "Gotong royong pembersihan saluran got banjar",
      event_date: "2026-11-02T07:00:00Z",
      event_type: "GOTONG_ROYONG",
      status: "SCHEDULED",
      organizer_user_id: "usr_prajuru_01",
      expected_attendees: 50,
      actual_attendees: 0,
      created_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockEvent);
    const event = await createCommunityEvent({
      service_area_id: "area_sukawati_kaja",
      title: "Ngayah Resik Sampah Banjar",
      event_date: "2026-11-02T07:00:00Z",
      event_type: "GOTONG_ROYONG",
      expected_attendees: 50,
    });
    expect(event.event_no).toMatch(/^EVT-BANJAR-/);

    // 2. Record Attendance
    const completedEvent: CommunityEvent = {
      ...mockEvent,
      actual_attendees: 48,
      status: "COMPLETED",
    };
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(completedEvent);
    const attended = await recordEventAttendance("evt_001", {
      actual_attendees: 48,
      status: "COMPLETED",
    });
    expect(attended.actual_attendees).toBe(48);
    expect(attended.status).toBe("COMPLETED");

    // 3. Citizen Complaint
    const mockComplaint: CommunityComplaint = {
      id: "cmp_001",
      ticket_no: "CMP-202610300800-XYZ9",
      service_area_id: "area_sukawati_kaja",
      reporter_user_id: "usr_citizen_01",
      title: "Tumpukan plastik liar di tebing sungai banjar",
      description: "Ada pembuangan liar karung plastik di dekat pura beji",
      location_detail: "Dekat Pura Beji Sukawati",
      status: "REPORTED",
      resolution_notes: null,
      resolved_by: null,
      resolved_at: null,
      created_at: "2026-10-30T08:15:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockComplaint);
    const complaint = await createCommunityComplaint({
      service_area_id: "area_sukawati_kaja",
      title: "Tumpukan plastik liar di tebing sungai banjar",
      description: "Ada pembuangan liar karung plastik di dekat pura beji",
      location_detail: "Dekat Pura Beji Sukawati",
    });
    expect(complaint.ticket_no).toMatch(/^CMP-/);
    expect(complaint.status).toBe("REPORTED");

    // 4. Resolve Complaint
    const resolvedComplaint: CommunityComplaint = {
      ...mockComplaint,
      status: "RESOLVED",
      resolution_notes: "Prajuru banjar mengerahkan tim kebersihan untuk mengangkut sampah",
      resolved_by: "usr_prajuru_01",
      resolved_at: "2026-10-30T10:00:00Z",
    };
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(resolvedComplaint);
    const resolved = await resolveCommunityComplaint("cmp_001", {
      status: "RESOLVED",
      resolution_notes: "Prajuru banjar mengerahkan tim kebersihan untuk mengangkut sampah",
    });
    expect(resolved.status).toBe("RESOLVED");
    expect(resolved.resolution_notes).toContain("Prajuru banjar");
  });

  it("3. CSR Funding program onboarding, sponsorship contribution, and banjar budget allocation", async () => {
    // 1. Create Program
    const mockProgram: FundingProgram = {
      id: "prog_csr_bali",
      code: "BALI_CSR_2026",
      name: "Program CSR Bali Asri",
      sponsor_name: "PT Bank BPD Bali",
      program_type: "CSR",
      target_service_area_id: "area_sukawati_kaja",
      total_budget_idr: 100_000_000,
      disbursed_budget_idr: 0,
      total_points_disbursed: 0,
      points_capacity: 1_000_000,
      status: "ACTIVE",
      created_at: "2026-10-30T08:00:00Z",
      updated_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockProgram);
    const program = await createFundingProgram({
      code: "BALI_CSR_2026",
      name: "Program CSR Bali Asri",
      sponsor_name: "PT Bank BPD Bali",
      program_type: "CSR",
      target_service_area_id: "area_sukawati_kaja",
      total_budget_idr: 100_000_000,
      points_capacity: 1_000_000,
    });
    expect(program.code).toBe("BALI_CSR_2026");
    expect(program.total_budget_idr).toBe(100_000_000);

    // 2. Record Sponsorship
    const mockSponsorship: ProgramSponsorship = {
      id: "spons_001",
      program_id: "prog_csr_bali",
      sponsor_name: "PT Bank BPD Bali",
      sponsor_type: "CSR",
      amount_idr: 50_000_000,
      contract_ref: "CSR-BPD-2026-Q4",
      contributed_at: "2026-10-30T08:30:00Z",
      notes: "Sponsorship dana hibah bank sampah banjar",
      created_at: "2026-10-30T08:30:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockSponsorship);
    const sponsorship = await recordSponsorship("prog_csr_bali", {
      sponsor_name: "PT Bank BPD Bali",
      amount_idr: 50_000_000,
      contract_ref: "CSR-BPD-2026-Q4",
    });
    expect(sponsorship.amount_idr).toBe(50_000_000);

    // 3. Allocate Budget to Banjar
    const mockAlloc: ProgramBudgetAllocation = {
      id: "alloc_001",
      program_id: "prog_csr_bali",
      service_area_id: "area_sukawati_kaja",
      allocated_amount_idr: 25_000_000,
      spent_amount_idr: 0,
      purpose: "Pengadaan 30 komposter aerobik banjar",
      allocated_at: "2026-10-30T09:00:00Z",
      created_at: "2026-10-30T09:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockAlloc);
    const alloc = await allocateProgramBudget("prog_csr_bali", {
      service_area_id: "area_sukawati_kaja",
      allocated_amount_idr: 25_000_000,
      purpose: "Pengadaan 30 komposter aerobik banjar",
    });
    expect(alloc.allocated_amount_idr).toBe(25_000_000);
    expect(alloc.purpose).toContain("komposter aerobik");
  });

  it("4. Role 11 Volunteer Clean-up Action scheduling, waste breakdown completion, and supervisor verification", async () => {
    // 1. Create Beach Cleanup Action
    const mockAction: CleanupAction = {
      id: "cln_001",
      action_no: "CLN-BEACH-202610300800-MERT",
      action_type: "BEACH_CLEANUP",
      location_name: "Pantai Mertasari Sanur",
      service_area_id: "area_sanur",
      coordinator_user_id: "usr_coord_01",
      event_date: "2026-10-31T06:30:00Z",
      duration_hours: 3.0,
      volunteer_count: 75,
      total_collected_weight_kg: 0.0,
      plastic_weight_kg: 0.0,
      organic_weight_kg: 0.0,
      residual_weight_kg: 0.0,
      evidence_notes: null,
      status: "PLANNED",
      verified_by: null,
      verified_at: null,
      created_at: "2026-10-30T08:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockAction);
    const action = await createCleanupAction({
      action_type: "BEACH_CLEANUP",
      location_name: "Pantai Mertasari Sanur",
      service_area_id: "area_sanur",
      event_date: "2026-10-31T06:30:00Z",
      volunteer_count: 75,
    });
    expect(action.action_no).toMatch(/^CLN-BEACH-/);
    expect(action.status).toBe("PLANNED");

    // 2. Complete Action with Waste Breakdown
    const completedAction: CleanupAction = {
      ...mockAction,
      total_collected_weight_kg: 345.5,
      plastic_weight_kg: 210.0,
      organic_weight_kg: 65.5,
      residual_weight_kg: 70.0,
      evidence_notes: "Ditimbang di posko relawan Sanur",
      status: "COMPLETED",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(completedAction);
    const completed = await completeCleanupAction("cln_001", {
      total_collected_weight_kg: 345.5,
      plastic_weight_kg: 210.0,
      organic_weight_kg: 65.5,
      residual_weight_kg: 70.0,
      evidence_notes: "Ditimbang di posko relawan Sanur",
    });
    expect(completed.status).toBe("COMPLETED");
    expect(completed.total_collected_weight_kg).toBe(345.5);

    // 3. Verify Action
    const verifiedAction: CleanupAction = {
      ...completedAction,
      status: "VERIFIED",
      verified_by: "usr_admin_01",
      verified_at: "2026-10-30T12:00:00Z",
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(verifiedAction);
    const verified = await verifyCleanupAction("cln_001", {
      notes: "Dokumentasi foto dan serah terima residu valid",
    });
    expect(verified.status).toBe("VERIFIED");
    expect(verified.verified_by).toBe("usr_admin_01");
  });

  it("5. Role 12 Hazardous Waste Manifest lifecycle with license and certified destruction", async () => {
    // 1. Create Manifest
    const mockManifest: HazardousWasteManifest = {
      id: "man_001",
      manifest_no: "MAN-B3-202610300800-BATT",
      category_id: "cat_b3_battery",
      service_area_id: "area_sukawati_kaja",
      source_pickup_id: null,
      handler_partner_id: "part_b3_licensed",
      transporter_license_no: "KLHK-B3-BALI-2026-0012",
      weight_kg: 35.0,
      hazard_type: "BATTERY",
      handling_sop_code: "SOP-B3-BATTERY-TRANSPORT",
      status: "IN_TRANSIT",
      destruction_cert_no: null,
      notes: "Limbah baterai aki bekas warga banjar",
      created_by: "usr_b3_handler",
      created_at: "2026-10-30T08:00:00Z",
      disposed_at: null,
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce(mockManifest);
    const manifest = await createHazardousManifest({
      category_id: "cat_b3_battery",
      handler_partner_id: "part_b3_licensed",
      transporter_license_no: "KLHK-B3-BALI-2026-0012",
      weight_kg: 35.0,
      hazard_type: "BATTERY",
      handling_sop_code: "SOP-B3-BATTERY-TRANSPORT",
    });
    expect(manifest.manifest_no).toMatch(/^MAN-B3-/);
    expect(manifest.status).toBe("IN_TRANSIT");

    // 2. Update Status
    const inDeliveryManifest: HazardousWasteManifest = {
      ...mockManifest,
      status: "DELIVERED_TO_FACILITY",
    };
    vi.spyOn(apiClient, "patch").mockResolvedValueOnce(inDeliveryManifest);
    const updated = await updateHazardousManifestStatus("man_001", {
      status: "DELIVERED_TO_FACILITY",
      notes: "Tiba di fasilitas insinerator B3 Benoa",
    });
    expect(updated.status).toBe("DELIVERED_TO_FACILITY");

    // 3. Certified Safe Disposal
    const disposedManifest: HazardousWasteManifest = {
      ...inDeliveryManifest,
      status: "SAFELY_DISPOSED",
      destruction_cert_no: "CERT-KLHK-B3-DESTRUCT-8899",
      disposed_at: "2026-10-30T16:00:00Z",
    };
    vi.spyOn(apiClient, "post").mockResolvedValueOnce(disposedManifest);
    const disposed = await recordHazardousDisposal("man_001", {
      destruction_cert_no: "CERT-KLHK-B3-DESTRUCT-8899",
      notes: "Penetralan limbah baterai tuntas",
    });
    expect(disposed.status).toBe("SAFELY_DISPOSED");
    expect(disposed.destruction_cert_no).toBe("CERT-KLHK-B3-DESTRUCT-8899");
  });
});
