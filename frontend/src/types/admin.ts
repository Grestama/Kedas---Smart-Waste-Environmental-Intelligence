/**
 * WasteLink Bali — Admin & Operator Types
 * Sesuai kontrak backend /api/v1/admin/*, /waste-categories, & /service-areas
 */

import { WasteCategory, ServiceArea, CollectionSlot, PickupRequest } from "./collection";

export interface CategoryWeightMetric {
  category_code: string;
  category_name: string;
  verified_weight_kg: number;
  percentage: number;
}

export interface ServiceAreaMetric {
  area_code: string;
  area_name: string;
  total_pickups: number;
  verified_weight_kg: number;
}

export interface OperationalSummaryReport {
  generated_at: string;
  timezone: string;
  date_from: string | null;
  date_to: string | null;
  total_pickups: number;
  pickups_submitted: number;
  pickups_in_progress: number;
  pickups_completed: number;
  pickups_cancelled: number;
  total_estimated_weight_kg: number;
  total_verified_weight_kg: number;
  total_batched_weight_kg: number;
  total_dispatched_weight_kg: number;
  total_received_weight_kg: number;
  total_weight_discrepancy_kg: number;
  total_points_issued: number;
  total_points_reversed: number;
  net_points_in_circulation: number;
  funding_budget_total_idr: number;
  funding_points_capacity: number;
  funding_points_disbursed: number;
  funding_remaining_capacity: number;
  category_metrics: CategoryWeightMetric[];
  area_metrics: ServiceAreaMetric[];
}

export interface CollectorApplicationResponse {
  id: string;
  user_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  vehicle_type: string | null;
  operational_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  applicant_name?: string;
  applicant_phone?: string;
}

export interface CollectorApplicationReviewRequest {
  approved: boolean;
  reason?: string | null;
}

export interface AdminReassignRequest {
  new_collector_id: string;
  reason: string;
}

export interface WasteCategoryCreateRequest {
  code: string;
  name: string;
  category_type: "ORGANIC" | "RECYCLABLE" | "RESIDUAL" | "SPECIAL";
  description?: string | null;
  preparation_guide?: string | null;
  safety_notes?: string | null;
  is_active?: boolean;
  display_order?: number;
}

export interface WasteCategoryUpdateRequest {
  name?: string | null;
  category_type?: string | null;
  description?: string | null;
  preparation_guide?: string | null;
  safety_notes?: string | null;
  is_active?: boolean | null;
  display_order?: number | null;
}

export interface ServiceAreaCreateRequest {
  code: string;
  name: string;
  administrative_area: string;
  is_active?: boolean;
}

export interface CollectionSlotCreateRequest {
  service_area_id: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  is_active?: boolean;
}

export interface RewardRuleCreateRequest {
  category_id: string;
  points_per_kg: number;
  minimum_weight_kg?: number;
  max_points_per_pickup?: number | null;
}

export interface RewardRuleResponse {
  id: string;
  category_id: string;
  version: number;
  status: string;
  points_per_kg: number;
  minimum_weight_kg: number;
  max_points_per_pickup: number | null;
  effective_from: string;
  category_name?: string;
}

export interface AdminPointAdjustmentRequest {
  user_id: string;
  points_delta: number;
  reason: string;
  idempotency_key: string;
}

export interface PartnerCreateRequest {
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export interface PartnerResponse {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  verification_status: string;
  created_at: string;
}

export interface MaterialBatchCreateRequest {
  category_id: string;
  pickup_ids: string[];
}

export interface MaterialBatchResponse {
  id: string;
  batch_code: string;
  category_id: string;
  total_weight_kg: number;
  status: string;
  created_by: string;
  created_at: string;
  items: string[];
}

export interface DeliveryCreateRequest {
  batch_id: string;
  partner_id: string;
  dispatched_weight_kg: number;
  notes?: string | null;
}

export interface DeliveryReceiptRequest {
  received_weight_kg: number;
  notes?: string | null;
}

export interface DeliveryResponse {
  id: string;
  batch_id: string;
  partner_id: string;
  dispatched_weight_kg: number;
  received_weight_kg: number | null;
  weight_discrepancy_kg: number | null;
  status: string;
  dispatched_at: string;
  received_at: string | null;
  notes: string | null;
}

export interface UserAdminView {
  id: string;
  email: string | null;
  phone: string;
  name: string;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  roles: string[];
  created_at: string;
}

export interface UserStatusUpdateRequest {
  status: "ACTIVE" | "SUSPENDED";
  reason: string;
}

export interface AuditLogItem {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  reason: string | null;
  request_id: string | null;
  details_json: string | null;
  created_at: string;
}

export interface PaginatedAdminResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
