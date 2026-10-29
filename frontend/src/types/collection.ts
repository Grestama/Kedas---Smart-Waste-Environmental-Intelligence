/**
 * WasteLink Bali — Collection & Waste Taxonomy Types
 * Sesuai kontrak backend /api/v1/pickup-requests, /waste-categories, & /service-areas
 */

import { Address } from "./auth";

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
  created_at?: string;
  pointRate?: number; // UI metadata enrichment
}

export interface ServiceArea {
  id: string;
  code: string;
  name: string;
  administrative_area: string;
  is_active: boolean;
  created_at?: string;
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

export interface PickupStatusEvent {
  id: string;
  from_status: string;
  to_status: string;
  actor_user_id: string | null;
  reason: string | null;
  created_at: string;
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

export interface PickupRequest {
  id: string;
  public_code: string;
  reporter_user_id: string;
  service_area_id: string;
  category_id: string;
  address_id: string;
  slot_id: string;
  status: PickupStatus;
  service_mode?: "PICKUP" | "DROP_OFF";
  idempotency_key?: string | null;
  assigned_collector_id: string | null;
  estimated_weight_kg: number | null;
  notes: string | null;
  created_at: string;
  // UI enrichment details
  category?: WasteCategory;
  address?: Address;
  slot?: CollectionSlot;
  events?: PickupStatusEvent[];
  actual_weight_kg?: number | null;
  points_earned?: number | null;
}

export interface CreatePickupPayload {
  category_id: string;
  address_id: string;
  slot_id: string;
  estimated_weight_kg?: number;
  notes?: string;
  service_mode?: "PICKUP" | "DROP_OFF";
  idempotency_key?: string | null;
}

export interface CancelPickupPayload {
  reason: string;
}
