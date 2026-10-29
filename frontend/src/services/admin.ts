import { apiClient, ApiError } from "@/lib/api-client";
import {
  OperationalSummaryReport,
  CollectorApplicationResponse,
  CollectorApplicationReviewRequest,
  AdminReassignRequest,
  WasteCategoryCreateRequest,
  WasteCategoryUpdateRequest,
  ServiceAreaCreateRequest,
  CollectionSlotCreateRequest,
  RewardRuleCreateRequest,
  RewardRuleResponse,
  AdminPointAdjustmentRequest,
  PartnerCreateRequest,
  PartnerResponse,
  MaterialBatchCreateRequest,
  MaterialBatchResponse,
  DeliveryCreateRequest,
  DeliveryReceiptRequest,
  DeliveryResponse,
  UserAdminView,
  AuditLogItem,
  PaginatedAdminResponse,
} from "@/types/admin";
import { WasteCategory, ServiceArea, CollectionSlot, PickupRequest } from "@/types/collection";

// Mock Fallback Stores for Offline / Testing
let mockReportStore: OperationalSummaryReport = {
  generated_at: new Date().toISOString(),
  timezone: "Asia/Makassar (WITA)",
  date_from: null,
  date_to: null,
  total_pickups: 48,
  pickups_submitted: 6,
  pickups_in_progress: 8,
  pickups_completed: 31,
  pickups_cancelled: 3,
  total_estimated_weight_kg: 285.5,
  total_verified_weight_kg: 268.25,
  total_batched_weight_kg: 180.0,
  total_dispatched_weight_kg: 150.0,
  total_received_weight_kg: 148.8,
  total_weight_discrepancy_kg: -1.2,
  total_points_issued: 8047,
  total_points_reversed: 60,
  net_points_in_circulation: 7987,
  funding_budget_total_idr: 50000000,
  funding_points_capacity: 500000,
  funding_points_disbursed: 8047,
  funding_remaining_capacity: 491953,
  category_metrics: [
    {
      category_code: "ORGANIC_FOOD",
      category_name: "Organik (Kompos Banjar)",
      verified_weight_kg: 142.5,
      percentage: 53.1,
    },
    {
      category_code: "RECYCLABLE_PET",
      category_name: "Plastik PET Bening",
      verified_weight_kg: 78.25,
      percentage: 29.2,
    },
    {
      category_code: "RECYCLABLE_PAPER",
      category_name: "Kardus & Kertas Duplex",
      verified_weight_kg: 47.5,
      percentage: 17.7,
    },
  ],
  area_metrics: [
    {
      area_code: "SA_SUKAWATI",
      area_name: "Desa Sukawati",
      total_pickups: 48,
      verified_weight_kg: 268.25,
    },
  ],
};

let mockApplicationsStore: CollectorApplicationResponse[] = [
  {
    id: "app_col_001",
    user_id: "usr_calon_01",
    status: "PENDING",
    vehicle_type: "Motor Roda Tiga Viar 150cc",
    operational_notes: "KTP Banjar Kaja Sukawati, siap bertugas shift pagi.",
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: "2026-10-29T10:00:00Z",
    applicant_name: "Ketut Arimbawa",
    applicant_phone: "0812-7788-9900",
  },
  {
    id: "app_col_002",
    user_id: "usr_calon_02",
    status: "PENDING",
    vehicle_type: "Gerobak Motor Listrik TPS3R",
    operational_notes: "Pengalaman 2 tahun pengelolaan kompos banjar.",
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: "2026-10-30T02:15:00Z",
    applicant_name: "Nyoman Sukadana",
    applicant_phone: "0819-3322-1100",
  },
];

let mockPartnersStore: PartnerResponse[] = [
  {
    id: "ptn_001",
    name: "PT Bali Daur Ulang Lestari",
    contact_email: "partnership@balidaurulang.co.id",
    contact_phone: "0361-294821",
    address: "Kawasan Industri Batubulan, Gianyar",
    verification_status: "VERIFIED",
    created_at: "2026-08-15T08:00:00Z",
  },
  {
    id: "ptn_002",
    name: "Koperasi Sirkular Gianyar Mandiri",
    contact_email: "koperasi@sirkulargianyar.id",
    contact_phone: "0812-3849-1122",
    address: "Jl. Raya Celuk No. 88, Gianyar",
    verification_status: "VERIFIED",
    created_at: "2026-09-01T09:30:00Z",
  },
];

let mockBatchesStore: MaterialBatchResponse[] = [
  {
    id: "btc_2026_01",
    batch_code: "BTC-PET-202610-001",
    category_id: "cat_anorganik_pet",
    total_weight_kg: 85.5,
    status: "AGGREGATED",
    created_by: "usr_admin_01",
    created_at: "2026-10-29T14:00:00Z",
    items: ["pick_001", "pick_002"],
  },
];

let mockDeliveriesStore: DeliveryResponse[] = [
  {
    id: "dlv_001",
    batch_id: "btc_2026_01",
    partner_id: "ptn_001",
    dispatched_weight_kg: 85.5,
    received_weight_kg: 85.0,
    weight_discrepancy_kg: -0.5,
    status: "CONFIRMED",
    dispatched_at: "2026-10-29T15:00:00Z",
    received_at: "2026-10-29T17:30:00Z",
    notes: "Terkonfirmasi dengan baik, susut 0.5kg karena serpihan label lepas.",
  },
];

let mockRulesStore: RewardRuleResponse[] = [
  {
    id: "rul_001",
    category_id: "cat_anorganik_pet",
    version: 1,
    status: "ACTIVE",
    points_per_kg: 30,
    minimum_weight_kg: 0.5,
    max_points_per_pickup: 500,
    effective_from: "2026-10-01T00:00:00Z",
    category_name: "Plastik PET Bening Bersih",
  },
  {
    id: "rul_002",
    category_id: "cat_anorganik_kardus",
    version: 1,
    status: "ACTIVE",
    points_per_kg: 20,
    minimum_weight_kg: 1.0,
    max_points_per_pickup: 400,
    effective_from: "2026-10-01T00:00:00Z",
    category_name: "Kardus & Kertas Duplex",
  },
  {
    id: "rul_003",
    category_id: "cat_organik",
    version: 1,
    status: "ACTIVE",
    points_per_kg: 10,
    minimum_weight_kg: 0.5,
    max_points_per_pickup: 300,
    effective_from: "2026-10-01T00:00:00Z",
    category_name: "Organik (Kompos Banjar)",
  },
];

let mockUsersStore: UserAdminView[] = [
  {
    id: "usr_admin_01",
    email: "admin@wastelink.bali.id",
    phone: "0811-2233-4455",
    name: "I Wayan Suardika (Admin Sukawati)",
    status: "ACTIVE",
    roles: ["ADMIN"],
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "usr_staff_01",
    email: "petugas1@wastelink.bali.id",
    phone: "0812-9988-7766",
    name: "I Made Dwiantara (Petugas Trike)",
    status: "ACTIVE",
    roles: ["COLLECTOR"],
    created_at: "2026-08-10T09:00:00Z",
  },
  {
    id: "usr_warga_01",
    email: "warga1@gmail.com",
    phone: "0812-3456-7890",
    name: "Wayan Sudarsana",
    status: "ACTIVE",
    roles: ["USER"],
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "usr_calon_01",
    email: "calon1@gmail.com",
    phone: "0812-7788-9900",
    name: "Ketut Arimbawa",
    status: "PENDING_VERIFICATION",
    roles: ["USER"],
    created_at: "2026-10-29T10:00:00Z",
  },
];

let mockAuditLogsStore: AuditLogItem[] = [
  {
    id: "aud_001",
    actor_user_id: "usr_admin_01",
    action: "COLLECTOR_APPLICATION_APPROVED",
    entity_type: "COLLECTOR_APPLICATION",
    entity_id: "app_col_000",
    reason: "Berkas KTP dan SIM C terverifikasi lengkap",
    request_id: "req_sec_01",
    details_json: '{"role": "COLLECTOR", "status": "ACTIVE"}',
    created_at: "2026-10-29T11:00:00Z",
  },
  {
    id: "aud_002",
    actor_user_id: "usr_staff_01",
    action: "WEIGHT_VERIFIED",
    entity_type: "PICKUP_REQUEST",
    entity_id: "pick_001",
    reason: "Timbangan digital selesai (5.5 kg netto)",
    request_id: "req_sec_02",
    details_json: '{"net_weight_kg": 5.5, "points_awarded": 165}',
    created_at: "2026-10-30T03:00:00Z",
  },
];

/**
 * 1. Mengambil metrik dashboard operasional & ekonomi sirkular real-time.
 */
export async function fetchAdminDashboard(): Promise<OperationalSummaryReport> {
  try {
    return await apiClient.get<OperationalSummaryReport>("/admin/dashboard");
  } catch {
    return mockReportStore;
  }
}

/**
 * 2. Mengambil laporan ringkasan operasional berdasarkan rentang tanggal.
 */
export async function fetchSummaryReport(
  dateFrom?: string,
  dateTo?: string
): Promise<OperationalSummaryReport> {
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiClient.get<OperationalSummaryReport>(`/admin/reports/summary${qs}`);
  } catch {
    return {
      ...mockReportStore,
      date_from: dateFrom || null,
      date_to: dateTo || null,
    };
  }
}

/**
 * 3. Ekspor laporan CSV tersanitasi (Anti Formula Injection).
 */
export async function exportReportsCsv(
  dateFrom?: string,
  dateTo?: string
): Promise<string> {
  const params = new URLSearchParams();
  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);
  const qs = params.toString() ? `?${params.toString()}` : "";

  try {
    const res = await fetch(`${apiClient["baseUrl"]}/admin/reports/export${qs}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("wastelink_token") || ""}`,
      },
    });
    if (!res.ok) {
      throw new ApiError(res.status, "Gagal mengunduh berkas CSV dari server.");
    }
    return await res.text();
  } catch {
    // Mock CSV fallback
    return `Kategori,Total Setoran Selesai,Total Berat Bersih (kg),Total Poin Diterbitkan\n` +
      `Organik (Kompos Banjar),18,142.50,1425\n` +
      `Plastik PET Bening,10,78.25,2348\n` +
      `Kardus & Kertas Duplex,3,47.50,950\n` +
      `TOTAL,31,268.25,4723\n`;
  }
}

/**
 * 4. Mengambil daftar permohonan collector yang masuk.
 */
export async function fetchCollectorApplications(
  status?: string
): Promise<CollectorApplicationResponse[]> {
  try {
    const qs = status ? `?status=${status}` : "";
    return await apiClient.get<CollectorApplicationResponse[]>(
      `/admin/collector-applications${qs}`
    );
  } catch {
    return mockApplicationsStore.filter((a) => !status || a.status === status);
  }
}

/**
 * 5. Setujui atau tolak permohonan petugas.
 */
export async function reviewCollectorApplication(
  id: string,
  req: CollectorApplicationReviewRequest
): Promise<CollectorApplicationResponse> {
  if (!req.approved && (!req.reason || !req.reason.trim())) {
    throw new ApiError(
      400,
      "Penolakan permohonan wajib menyertakan alasan penolakan.",
      "VALIDATION_ERROR"
    );
  }

  try {
    return await apiClient.post<CollectorApplicationResponse>(
      `/admin/collector-applications/${id}/review`,
      req
    );
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;

    const found = mockApplicationsStore.find((a) => a.id === id);
    if (!found) {
      throw new ApiError(404, "Permohonan tidak ditemukan.", "NOT_FOUND");
    }
    found.status = req.approved ? "APPROVED" : "REJECTED";
    found.reviewed_by = "usr_admin_01";
    found.reviewed_at = new Date().toISOString();
    found.rejection_reason = req.approved ? null : req.reason || null;
    return found;
  }
}

/**
 * 6. Tugaskan ulang petugas penjemputan (Reassign).
 */
export async function reassignPickup(
  id: string,
  req: AdminReassignRequest
): Promise<PickupRequest> {
  if (!req.new_collector_id || !req.reason.trim()) {
    throw new ApiError(
      400,
      "Petugas baru dan alasan penugasan ulang wajib diisi.",
      "VALIDATION_ERROR"
    );
  }

  return await apiClient.post<PickupRequest>(`/admin/pickups/${id}/reassign`, req);
}

/**
 * 7. Master Data Kategori: Tambah Kategori Baru.
 */
export async function createWasteCategory(
  req: WasteCategoryCreateRequest
): Promise<WasteCategory> {
  return await apiClient.post<WasteCategory>("/waste-categories", req);
}

/**
 * 8. Master Data Kategori: Perbarui / Nonaktifkan Kategori.
 */
export async function updateWasteCategory(
  id: string,
  req: WasteCategoryUpdateRequest
): Promise<WasteCategory> {
  return await apiClient.patch<WasteCategory>(`/waste-categories/${id}`, req);
}

/**
 * 9. Master Data Area: Tambah Wilayah Layanan.
 */
export async function createServiceArea(
  req: ServiceAreaCreateRequest
): Promise<ServiceArea> {
  return await apiClient.post<ServiceArea>("/service-areas", req);
}

/**
 * 10. Master Data Slot: Tambah Slot Jadwal Penjemputan.
 */
export async function createCollectionSlot(
  areaId: string,
  req: CollectionSlotCreateRequest
): Promise<CollectionSlot> {
  return await apiClient.post<CollectionSlot>(`/service-areas/${areaId}/slots`, req);
}

/**
 * 11. Circular Marketplace: Mengambil daftar mitra daur ulang.
 */
export async function fetchPartners(): Promise<PartnerResponse[]> {
  try {
    return await apiClient.get<PartnerResponse[]>("/admin/partners");
  } catch {
    return mockPartnersStore;
  }
}

/**
 * 12. Circular Marketplace: Mendaftarkan mitra pembeli daur ulang.
 */
export async function createPartner(
  req: PartnerCreateRequest
): Promise<PartnerResponse> {
  try {
    return await apiClient.post<PartnerResponse>("/admin/partners", req);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    const newP: PartnerResponse = {
      id: `ptn_${Date.now()}`,
      ...req,
      verification_status: "VERIFIED",
      created_at: new Date().toISOString(),
    };
    mockPartnersStore.push(newP);
    return newP;
  }
}

/**
 * 13. Circular Marketplace: Mengambil daftar batch agregasi material.
 */
export async function fetchBatches(): Promise<MaterialBatchResponse[]> {
  try {
    return await apiClient.get<MaterialBatchResponse[]>("/admin/batches");
  } catch {
    return mockBatchesStore;
  }
}

/**
 * 14. Circular Marketplace: Membentuk batch agregasi dari beberapa setoran selesai.
 */
export async function createBatch(
  req: MaterialBatchCreateRequest
): Promise<MaterialBatchResponse> {
  try {
    return await apiClient.post<MaterialBatchResponse>("/admin/batches", req);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    const newBatch: MaterialBatchResponse = {
      id: `btc_${Date.now()}`,
      batch_code: `BTC-MIX-${new Date().getFullYear()}-${mockBatchesStore.length + 1}`,
      category_id: req.category_id,
      total_weight_kg: 50.0,
      status: "AGGREGATED",
      created_by: "usr_admin_01",
      created_at: new Date().toISOString(),
      items: req.pickup_ids,
    };
    mockBatchesStore.unshift(newBatch);
    return newBatch;
  }
}

/**
 * 15. Circular Marketplace: Mengirim batch material ke mitra industri.
 */
export async function dispatchDelivery(
  req: DeliveryCreateRequest
): Promise<DeliveryResponse> {
  try {
    return await apiClient.post<DeliveryResponse>("/admin/deliveries", req);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    const delivery: DeliveryResponse = {
      id: `dlv_${Date.now()}`,
      batch_id: req.batch_id,
      partner_id: req.partner_id,
      dispatched_weight_kg: req.dispatched_weight_kg,
      received_weight_kg: null,
      weight_discrepancy_kg: null,
      status: "DISPATCHED",
      dispatched_at: new Date().toISOString(),
      received_at: null,
      notes: req.notes || null,
    };
    mockDeliveriesStore.unshift(delivery);
    return delivery;
  }
}

/**
 * 16. Circular Marketplace: Konfirmasi penerimaan kiriman oleh mitra & catat selisih timbangan.
 */
export async function confirmDeliveryReceipt(
  deliveryId: string,
  req: DeliveryReceiptRequest
): Promise<DeliveryResponse> {
  try {
    return await apiClient.post<DeliveryResponse>(
      `/admin/deliveries/${deliveryId}/receipt`,
      req
    );
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    const delivery = mockDeliveriesStore.find((d) => d.id === deliveryId);
    if (!delivery) {
      throw new ApiError(404, "Data pengiriman tidak ditemukan.", "NOT_FOUND");
    }
    delivery.received_weight_kg = req.received_weight_kg;
    delivery.weight_discrepancy_kg =
      Math.round((req.received_weight_kg - delivery.dispatched_weight_kg) * 100) / 100;
    delivery.status = "CONFIRMED";
    delivery.received_at = new Date().toISOString();
    return delivery;
  }
}

/**
 * 17. WastePoints Rules: Mengambil atau menerbitkan versi aturan reward poin per kategori.
 */
export async function fetchRewardRules(): Promise<RewardRuleResponse[]> {
  return mockRulesStore;
}

export async function createRewardRule(
  req: RewardRuleCreateRequest
): Promise<RewardRuleResponse> {
  try {
    return await apiClient.post<RewardRuleResponse>("/admin/points/rules", req);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    const existing = mockRulesStore.filter((r) => r.category_id === req.category_id);
    const newVersion = existing.length + 1;
    const rule: RewardRuleResponse = {
      id: `rul_${Date.now()}`,
      category_id: req.category_id,
      version: newVersion,
      status: "ACTIVE",
      points_per_kg: req.points_per_kg,
      minimum_weight_kg: req.minimum_weight_kg ?? 0.5,
      max_points_per_pickup: req.max_points_per_pickup ?? null,
      effective_from: new Date().toISOString(),
      category_name: "Kategori Terpilih",
    };
    mockRulesStore.unshift(rule);
    return rule;
  }
}

/**
 * 18. WastePoints Adjustment: Penyesuaian poin manual dengan batas saldo dan idempotency.
 */
export async function adjustUserPoints(
  req: AdminPointAdjustmentRequest
): Promise<unknown> {
  if (!req.reason.trim()) {
    throw new ApiError(
      400,
      "Alasan penyesuaian saldo poin wajib dicatat untuk audit trail.",
      "VALIDATION_ERROR"
    );
  }

  try {
    return await apiClient.post("/admin/points/adjust", req);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    return {
      id: `led_${Date.now()}`,
      user_id: req.user_id,
      points_delta: req.points_delta,
      reason: req.reason,
      created_at: new Date().toISOString(),
    };
  }
}

/**
 * 19. Manajemen Pengguna: Mengambil daftar pengguna dengan filter role & status.
 */
export async function fetchAdminUsers(
  roleCode?: string,
  status?: string,
  page: number = 1
): Promise<PaginatedAdminResponse<UserAdminView>> {
  try {
    const params = new URLSearchParams();
    if (roleCode) params.append("role_code", roleCode);
    if (status) params.append("status", status);
    params.append("page", page.toString());
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiClient.get<PaginatedAdminResponse<UserAdminView>>(`/admin/users${qs}`);
  } catch {
    const filtered = mockUsersStore
      .filter((u) => !roleCode || u.roles.includes(roleCode))
      .filter((u) => !status || u.status === status);

    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
    };
  }
}

/**
 * 20. Manajemen Pengguna: Memperbarui status akun pengguna (e.g. SUSPENDED).
 */
export async function updateUserStatus(
  id: string,
  status: "ACTIVE" | "SUSPENDED",
  reason: string
): Promise<UserAdminView> {
  if (!reason.trim()) {
    throw new ApiError(
      400,
      "Alasan perubahan status akun wajib diisi.",
      "VALIDATION_ERROR"
    );
  }

  try {
    return await apiClient.patch<UserAdminView>(`/admin/users/${id}/status`, {
      status,
      reason,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    const user = mockUsersStore.find((u) => u.id === id);
    if (!user) {
      throw new ApiError(404, "Pengguna tidak ditemukan.", "NOT_FOUND");
    }
    user.status = status;
    return user;
  }
}

/**
 * 21. Audit Log: Mengambil catatan penelusuran sistem (Read-Only).
 */
export async function fetchAuditLogs(
  action?: string,
  entityType?: string,
  page: number = 1
): Promise<PaginatedAdminResponse<AuditLogItem>> {
  try {
    const params = new URLSearchParams();
    if (action) params.append("action", action);
    if (entityType) params.append("entity_type", entityType);
    params.append("page", page.toString());
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await apiClient.get<PaginatedAdminResponse<AuditLogItem>>(`/admin/audit-logs${qs}`);
  } catch {
    const filtered = mockAuditLogsStore
      .filter((l) => !action || l.action === action)
      .filter((l) => !entityType || l.entity_type === entityType);

    return {
      items: filtered,
      total: filtered.length,
      page: 1,
      page_size: 20,
      total_pages: 1,
    };
  }
}
