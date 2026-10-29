/**
 * WasteLink Bali — Collector POS & Operational Field Types
 * Sesuai kontrak backend /api/v1/collector/tasks, /pickup-requests/{id}/inspections,
 * /pickup-requests/{id}/weights, dan /evidence/upload
 */

import { PickupRequest, PickupStatus } from "./collection";

export type { PickupRequest, PickupStatus };

export interface TaskStatusUpdateRequest {
  status: string;
  reason?: string | null;
}

export type InspectionResult =
  | "ACCEPTED"
  | "ACCEPTED_WITH_CONTAMINATION"
  | "PARTIALLY_ACCEPTED"
  | "REJECTED"
  | "NEEDS_REVIEW";

export type ContaminationLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export interface InspectionCreateRequest {
  result: InspectionResult;
  contamination_level?: ContaminationLevel;
  accepted_weight_kg?: number | null;
  rejected_weight_kg?: number | null;
  rejection_reason_code?: string | null;
  rejection_notes?: string | null;
}

export interface InspectionResponse {
  id: string;
  pickup_id: string;
  inspector_id: string;
  result: InspectionResult;
  contamination_level: ContaminationLevel;
  accepted_weight_kg: number | null;
  rejected_weight_kg: number | null;
  rejection_reason_code: string | null;
  rejection_notes: string | null;
  created_at: string;
}

export type WeighingMethod =
  | "MANUAL_SCALE"
  | "DIRECT_NET"
  | "AUTOMATED_SCALE";

export interface WeightRecordCreateRequest {
  method?: WeighingMethod;
  gross_weight_kg?: number | null;
  tare_weight_kg?: number | null;
  net_weight_kg?: number | null;
  correction_reason?: string | null;
}

export interface WeightRecordResponse {
  id: string;
  pickup_id: string;
  version: number;
  recorder_id: string;
  verifier_id: string | null;
  method: WeighingMethod;
  gross_weight_kg: number | null;
  tare_weight_kg: number | null;
  net_weight_kg: number;
  verification_status: string;
  supersedes_id: string | null;
  correction_reason: string | null;
  created_at: string;
}

export interface EvidenceResponse {
  id: string;
  storage_key: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  uploader_id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  created_at: string;
}

export interface CollectorTask extends PickupRequest {
  citizen_name?: string;
  citizen_phone?: string;
  address_display?: string;
  banjar_name?: string;
  category_name?: string;
  slot_time_display?: string;
  inspections?: InspectionResponse[];
  weights?: WeightRecordResponse[];
  evidences?: EvidenceResponse[];
}

export interface CollectorDashboardStats {
  available_count: number;
  my_active_count: number;
  completed_today_count: number;
  total_tonnage_kg: number;
}
