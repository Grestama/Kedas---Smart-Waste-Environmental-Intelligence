import { apiClient, ApiError } from "@/lib/api-client";
import {
  CollectorTask,
  TaskStatusUpdateRequest,
  InspectionCreateRequest,
  InspectionResponse,
  WeightRecordCreateRequest,
  WeightRecordResponse,
  EvidenceResponse,
  CollectorDashboardStats,
} from "@/types/staff";
import { PickupRequest } from "@/types/collection";

// Initial mock state for local preview & offline demo
let mockTasksStore: CollectorTask[] = [
  {
    id: "pick_sukawati_001",
    public_code: "WL-2026-SKW-001",
    reporter_user_id: "usr_warga_01",
    service_area_id: "sa_sukawati",
    category_id: "cat_anorganik_pet",
    address_id: "addr_01",
    slot_id: "slot_01",
    status: "PENDING_ASSIGNMENT",
    assigned_collector_id: null,
    estimated_weight_kg: 5.5,
    notes: "Botol plastik PET 3 karung, sudah bersih dan digepengkan di depan garasi.",
    created_at: "2026-10-30T07:30:00Z",
    citizen_name: "Wayan Sudarsana",
    citizen_phone: "0812-3456-7890",
    address_display: "Banjar Kaja, Jl. Kenanga No. 14, Sukawati",
    banjar_name: "Banjar Kaja Sukawati",
    category_name: "Plastik PET Bening Bersih",
    slot_time_display: "Hari Ini, 09:00 - 10:30 WITA",
  },
  {
    id: "pick_sukawati_002",
    public_code: "WL-2026-SKW-002",
    reporter_user_id: "usr_warga_02",
    service_area_id: "sa_sukawati",
    category_id: "cat_anorganik_kardus",
    address_id: "addr_02",
    slot_id: "slot_01",
    status: "PENDING_ASSIGNMENT",
    assigned_collector_id: null,
    estimated_weight_kg: 12.0,
    notes: "Kardus bekas packing buah dan duplex tebal, sudah diikat tali rafia rapi.",
    created_at: "2026-10-30T08:00:00Z",
    citizen_name: "Ni Putu Lestari",
    citizen_phone: "0819-8765-4321",
    address_display: "Banjar Tengah, Jl. Melati Gang 2, Sukawati",
    banjar_name: "Banjar Tengah Sukawati",
    category_name: "Kardus & Kertas Duplex",
    slot_time_display: "Hari Ini, 09:00 - 10:30 WITA",
  },
  {
    id: "pick_sukawati_003",
    public_code: "WL-2026-SKW-003",
    reporter_user_id: "usr_warga_03",
    service_area_id: "sa_sukawati",
    category_id: "cat_organik",
    address_id: "addr_03",
    slot_id: "slot_02",
    status: "ACCEPTED",
    assigned_collector_id: "usr_staff_01",
    estimated_weight_kg: 8.0,
    notes: "Kompos daun ketapang dan sisa sayur dapur organik, wadah ember biru.",
    created_at: "2026-10-30T06:15:00Z",
    citizen_name: "I Made Sujana",
    citizen_phone: "0813-1122-3344",
    address_display: "Banjar Belang Kaja No. 8, Sukawati",
    banjar_name: "Banjar Belang Sukawati",
    category_name: "Organik (Kompos Banjar)",
    slot_time_display: "Hari Ini, 11:00 - 12:30 WITA",
  },
  {
    id: "pick_sukawati_004",
    public_code: "WL-2026-SKW-004",
    reporter_user_id: "usr_warga_04",
    service_area_id: "sa_sukawati",
    category_id: "cat_anorganik_pet",
    address_id: "addr_04",
    slot_id: "slot_01",
    status: "ARRIVED",
    assigned_collector_id: "usr_staff_01",
    estimated_weight_kg: 6.2,
    notes: "Sudah di pos jaga depan banjar kaja.",
    created_at: "2026-10-30T06:00:00Z",
    citizen_name: "Gusti Ayu Mirah",
    citizen_phone: "0815-9988-7766",
    address_display: "Banjar Kaja, Jl. Cempaka Putih No. 2, Sukawati",
    banjar_name: "Banjar Kaja Sukawati",
    category_name: "Plastik PET Bening Bersih",
    slot_time_display: "Hari Ini, 09:00 - 10:30 WITA",
  },
];

let mockInspectionsStore: Record<string, InspectionResponse[]> = {};
let mockWeightsStore: Record<string, WeightRecordResponse[]> = {};
let mockEvidenceStore: Record<string, EvidenceResponse> = {};

/**
 * Mengambil daftar tugas penjemputan yang tersedia di pool banjar (status PENDING_ASSIGNMENT).
 */
export async function fetchAvailableTasks(
  serviceAreaId?: string
): Promise<CollectorTask[]> {
  try {
    const query = serviceAreaId ? `?service_area_id=${serviceAreaId}` : "";
    const res = await apiClient.get<PickupRequest[]>(`/collector/tasks/available${query}`);
    return res.map(enrichTaskWithMetadata);
  } catch {
    // Mock fallback
    return mockTasksStore
      .filter((t) => t.status === "PENDING_ASSIGNMENT")
      .filter((t) => !serviceAreaId || t.service_area_id === serviceAreaId);
  }
}

/**
 * Mengambil daftar tugas yang sudah ditugaskan kepada petugas aktif.
 */
export async function fetchMyTasks(status?: string): Promise<CollectorTask[]> {
  try {
    const query = status ? `?status=${status}` : "";
    const res = await apiClient.get<PickupRequest[]>(`/collector/tasks/mine${query}`);
    return res.map(enrichTaskWithMetadata);
  } catch {
    // Mock fallback
    return mockTasksStore
      .filter((t) => t.assigned_collector_id === "usr_staff_01" || t.status !== "PENDING_ASSIGNMENT")
      .filter((t) => !status || t.status === status);
  }
}

/**
 * Mengambil detail tugas penjemputan spesifik beserta inspeksi dan timbangan.
 */
export async function getTaskDetail(id: string): Promise<CollectorTask> {
  try {
    const res = await apiClient.get<PickupRequest>(`/pickup-requests/${id}`);
    const task = enrichTaskWithMetadata(res);
    task.inspections = await listInspections(id).catch(() => []);
    task.weights = await listWeights(id).catch(() => []);
    task.evidences = await listEvidence("PICKUP_REQUEST", id).catch(() => []);
    return task;
  } catch {
    // Mock fallback
    const found = mockTasksStore.find((t) => t.id === id || t.public_code === id);
    if (!found) {
      throw new ApiError(404, "Tugas penjemputan tidak ditemukan.", "NOT_FOUND");
    }
    return {
      ...found,
      inspections: mockInspectionsStore[found.id] || [],
      weights: mockWeightsStore[found.id] || [],
      evidences: Object.values(mockEvidenceStore).filter((e) => e.entity_id === found.id),
    };
  }
}

/**
 * Mengklaim tugas penjemputan secara atomik.
 * Menangani 409 Conflict jika petugas lain telah mengambil tugas.
 */
export async function acceptTask(id: string): Promise<CollectorTask> {
  try {
    const res = await apiClient.post<PickupRequest>(`/collector/tasks/${id}/accept`);
    return enrichTaskWithMetadata(res);
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 409) {
      throw err; // Lempar ulang 409 agar UI dapat menampilkan feedback conflict
    }

    // Mock fallback mutation
    const task = mockTasksStore.find((t) => t.id === id || t.public_code === id);
    if (!task) {
      throw new ApiError(404, "Tugas penjemputan tidak ditemukan.", "NOT_FOUND");
    }
    if (task.status !== "PENDING_ASSIGNMENT" || task.assigned_collector_id !== null) {
      throw new ApiError(
        409,
        "Tugas penjemputan sudah diambil oleh petugas lain atau status tidak valid.",
        "CONFLICT"
      );
    }

    task.status = "ACCEPTED";
    task.assigned_collector_id = "usr_staff_01";
    return task;
  }
}

/**
 * Memperbarui status penjemputan sesuai state machine server.
 */
export async function updateTaskStatus(
  id: string,
  payload: TaskStatusUpdateRequest
): Promise<CollectorTask> {
  try {
    const res = await apiClient.post<PickupRequest>(`/collector/tasks/${id}/status`, payload);
    return enrichTaskWithMetadata(res);
  } catch {
    // Mock fallback
    const task = mockTasksStore.find((t) => t.id === id || t.public_code === id);
    if (!task) {
      throw new ApiError(404, "Tugas tidak ditemukan.", "NOT_FOUND");
    }
    task.status = payload.status as any;
    return task;
  }
}

/**
 * Mencatat hasil inspeksi QC lapangan.
 */
export async function recordInspection(
  id: string,
  payload: InspectionCreateRequest
): Promise<InspectionResponse> {
  // Validasi bisnis wajib sisi klien sebelum mengirim
  if (payload.result === "REJECTED") {
    if (!payload.rejection_reason_code && (!payload.rejection_notes || !payload.rejection_notes.trim())) {
      throw new ApiError(
        400,
        "Penolakan setoran (REJECTED) wajib menyertakan kode alasan atau catatan penolakan spesifik.",
        "VALIDATION_ERROR"
      );
    }
  }

  if (payload.result === "PARTIALLY_ACCEPTED") {
    if (payload.accepted_weight_kg === null || payload.rejected_weight_kg === null) {
      throw new ApiError(
        400,
        "Penerimaan sebagian (PARTIALLY_ACCEPTED) wajib memisahkan berat diterima dan berat ditolak.",
        "VALIDATION_ERROR"
      );
    }
  }

  try {
    return await apiClient.post<InspectionResponse>(`/pickup-requests/${id}/inspections`, payload);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) {
      throw err;
    }

    // Mock fallback
    const inspection: InspectionResponse = {
      id: `insp_${Date.now()}`,
      pickup_id: id,
      inspector_id: "usr_staff_01",
      result: payload.result,
      contamination_level: payload.contamination_level || "NONE",
      accepted_weight_kg: payload.accepted_weight_kg ?? null,
      rejected_weight_kg: payload.rejected_weight_kg ?? null,
      rejection_reason_code: payload.rejection_reason_code ?? null,
      rejection_notes: payload.rejection_notes ?? null,
      created_at: new Date().toISOString(),
    };

    if (!mockInspectionsStore[id]) {
      mockInspectionsStore[id] = [];
    }
    mockInspectionsStore[id].unshift(inspection);

    // Update status task jika ditolak
    const task = mockTasksStore.find((t) => t.id === id);
    if (task) {
      if (payload.result === "REJECTED") {
        task.status = "CANCELLED";
      } else {
        task.status = "ARRIVED";
      }
    }

    return inspection;
  }
}

/**
 * Mengambil riwayat inspeksi QC untuk setoran tertentu.
 */
export async function listInspections(id: string): Promise<InspectionResponse[]> {
  try {
    return await apiClient.get<InspectionResponse[]>(`/pickup-requests/${id}/inspections`);
  } catch {
    return mockInspectionsStore[id] || [];
  }
}

/**
 * Mencatat hasil penimbangan tervalidasi & memicu reward WastePoints secara otomatis di backend.
 */
export async function recordWeight(
  id: string,
  payload: WeightRecordCreateRequest
): Promise<WeightRecordResponse> {
  // Validasi tara & bruto konsistensi matematis
  if (payload.gross_weight_kg !== undefined && payload.gross_weight_kg !== null &&
      payload.tare_weight_kg !== undefined && payload.tare_weight_kg !== null) {
    if (payload.tare_weight_kg > payload.gross_weight_kg) {
      throw new ApiError(
        400,
        "Berat tara wadah/keranjang tidak boleh melebihi berat bruto kotor.",
        "VALIDATION_ERROR"
      );
    }
  }

  try {
    return await apiClient.post<WeightRecordResponse>(`/pickup-requests/${id}/weights`, payload);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) {
      throw err;
    }

    // Mock fallback
    const computedNet =
      payload.gross_weight_kg !== undefined && payload.gross_weight_kg !== null &&
      payload.tare_weight_kg !== undefined && payload.tare_weight_kg !== null
        ? Math.round((payload.gross_weight_kg - payload.tare_weight_kg) * 1000) / 1000
        : payload.net_weight_kg ?? 0;

    const previousWeights = mockWeightsStore[id] || [];
    const newVersion = previousWeights.length + 1;

    const record: WeightRecordResponse = {
      id: `wgt_${Date.now()}`,
      pickup_id: id,
      version: newVersion,
      recorder_id: "usr_staff_01",
      verifier_id: "usr_staff_01",
      method: payload.method || "MANUAL_SCALE",
      gross_weight_kg: payload.gross_weight_kg ?? null,
      tare_weight_kg: payload.tare_weight_kg ?? null,
      net_weight_kg: computedNet,
      verification_status: "VERIFIED",
      supersedes_id: previousWeights.length > 0 ? previousWeights[0].id : null,
      correction_reason: payload.correction_reason ?? null,
      created_at: new Date().toISOString(),
    };

    if (!mockWeightsStore[id]) {
      mockWeightsStore[id] = [];
    }
    mockWeightsStore[id].unshift(record);

    // Update status task to COMPLETED
    const task = mockTasksStore.find((t) => t.id === id);
    if (task) {
      task.status = "COMPLETED";
      task.actual_weight_kg = computedNet;
      task.points_earned = Math.round(computedNet * 30);
    }

    return record;
  }
}

/**
 * Mengambil riwayat versi penimbangan setoran.
 */
export async function listWeights(id: string): Promise<WeightRecordResponse[]> {
  try {
    return await apiClient.get<WeightRecordResponse[]>(`/pickup-requests/${id}/weights`);
  } catch {
    return mockWeightsStore[id] || [];
  }
}

/**
 * Mengunggah berkas bukti foto lapangan (Layar Timbangan Digital, Kondisi Pemilahan, Surat Jalan).
 */
export async function uploadEvidence(
  file: File,
  entityType: string,
  entityId: string
): Promise<EvidenceResponse> {
  // Validasi ukuran berkas (maks 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new ApiError(
      400,
      "Ukuran berkas melebihi batas maksimum 10MB.",
      "FILE_TOO_LARGE"
    );
  }

  // Validasi MIME type
  const allowedMime = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedMime.includes(file.type)) {
    throw new ApiError(
      400,
      `Format berkas tidak didukung (${file.type}). Gunakan JPG, PNG, atau WebP.`,
      "INVALID_MIME_TYPE"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", entityType.toUpperCase());
  formData.append("entity_id", entityId);

  try {
    return await apiClient.post<EvidenceResponse>("/evidence/upload", formData);
  } catch (err) {
    if (err instanceof ApiError && err.status !== 0) {
      throw err;
    }

    // Mock fallback
    const evidence: EvidenceResponse = {
      id: `evd_${Date.now()}`,
      storage_key: `uploads/${entityType.toLowerCase()}/${entityId}/${file.name}`,
      original_filename: file.name,
      mime_type: file.type,
      file_size_bytes: file.size,
      sha256_hash: "mock_sha256_" + Math.random().toString(36).substring(2, 10),
      uploader_id: "usr_staff_01",
      entity_type: entityType.toUpperCase(),
      entity_id: entityId,
      status: "STORED",
      created_at: new Date().toISOString(),
    };

    mockEvidenceStore[evidence.id] = evidence;
    return evidence;
  }
}

/**
 * Mengambil daftar bukti berkas terkait entitas.
 */
export async function listEvidence(
  entityType: string,
  entityId: string
): Promise<EvidenceResponse[]> {
  try {
    return await apiClient.get<EvidenceResponse[]>(
      `/evidence?entity_type=${entityType.toUpperCase()}&entity_id=${entityId}`
    );
  } catch {
    return Object.values(mockEvidenceStore).filter(
      (e) => e.entity_type === entityType.toUpperCase() && e.entity_id === entityId
    );
  }
}

/**
 * Menghitung ringkasan statistik operasional petugas (tersedia, aktif, selesai, total kg).
 */
export async function getCollectorStats(): Promise<CollectorDashboardStats> {
  const available = await fetchAvailableTasks();
  const myTasks = await fetchMyTasks();

  const completedToday = myTasks.filter((t) => t.status === "COMPLETED");
  const totalTonnage = completedToday.reduce((acc, t) => acc + (t.actual_weight_kg || 0), 0);

  return {
    available_count: available.length,
    my_active_count: myTasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED").length,
    completed_today_count: completedToday.length,
    total_tonnage_kg: Math.round(totalTonnage * 100) / 100,
  };
}

/**
 * Utility helper untuk memperkaya objek pickup mentah dari server dengan label tampilan yang ramah.
 */
function enrichTaskWithMetadata(pickup: PickupRequest): CollectorTask {
  const existing = mockTasksStore.find((t) => t.id === pickup.id);
  return {
    ...pickup,
    citizen_name: existing?.citizen_name || `Warga (${pickup.reporter_user_id.substring(0, 8)})`,
    citizen_phone: existing?.citizen_phone || "0812-xxxx-xxxx",
    address_display: existing?.address_display || "Banjar Sukawati, Gianyar",
    banjar_name: existing?.banjar_name || "Banjar Sukawati",
    category_name: existing?.category_name || "Anorganik Daur Ulang",
    slot_time_display: existing?.slot_time_display || "Hari Ini",
  };
}

export const staffService = {
  getAvailableTasks: fetchAvailableTasks,
  getMyTasks: fetchMyTasks,
  getTaskDetail,
  acceptTask,
  updateTaskStatus,
  recordInspection,
  fetchInspectionHistory: listInspections,
  recordWeight,
  fetchWeightHistory: listWeights,
  uploadEvidence,
  fetchEvidenceList: listEvidence,
  getCollectorStats,
};
