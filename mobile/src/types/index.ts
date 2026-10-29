/**
 * WasteLink Bali Mobile — Domain Data Types
 */

export type WasteCategoryType = "ORGANIC" | "RECYCLABLE" | "RESIDUAL" | "SPECIAL";

export interface WasteCategory {
  id: string;
  code: string;
  name: string;
  category_type: WasteCategoryType;
  description: string | null;
  preparation_guide: string | null;
  safety_notes: string | null;
  is_active: boolean;
  display_order: number;
}

export interface CollectionSlot {
  id: string;
  service_area_id: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  booked_capacity: number;
  remaining_capacity: number;
  is_active: boolean;
}

export interface CitizenAddress {
  id: string;
  label: string;
  address_line: string;
  banjar_name: string;
  notes?: string;
  is_default: boolean;
}

export type PickupStatus =
  | "SUBMITTED"
  | "PENDING_ASSIGNMENT"
  | "ACCEPTED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "INSPECTION"
  | "WEIGHED"
  | "COLLECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface PickupStatusEvent {
  id: string;
  from_status: string;
  to_status: string;
  actor_user_id: string | null;
  reason: string | null;
  created_at: string;
}

export interface PickupRequest {
  id: string;
  public_code: string;
  reporter_user_id: string;
  service_area_id: string;
  category_id: string;
  address_id: string;
  slot_id: string;
  status: PickupStatus;
  assigned_collector_id: string | null;
  estimated_weight_kg: number | null;
  actual_weight_kg?: number | null;
  points_earned?: number | null;
  notes: string | null;
  created_at: string;
  events?: PickupStatusEvent[];
  // Local display enrichments
  category_name?: string;
  address_display?: string;
  slot_display?: string;
}

export interface OfflinePickupDraft {
  local_id: string;
  category_id: string;
  category_name: string;
  address_id: string;
  address_display: string;
  slot_id: string;
  slot_display: string;
  estimated_weight_kg?: number;
  photo_uri?: string;
  notes?: string;
  created_at: string;
  is_draft: true;
  status_label: "DRAFT_LOKAL_OFFLINE";
}

export interface WastePointsBalance {
  total_balance: number;
  total_earned_all_time: number;
  total_redeemed_all_time: number;
}

export interface PointLedgerItem {
  id: string;
  entry_type: "REWARD" | "REVERSAL" | "REDEMPTION" | "ADJUSTMENT";
  points_delta: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

export interface MobileUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  banjar: string;
  active_role: "USER";
  token?: string;
}
