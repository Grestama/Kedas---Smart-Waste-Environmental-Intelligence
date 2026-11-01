/**
 * WasteLink Bali — Circular Marketplace, Offers, Organic Processing & B2B TypeScript Types
 * Sesuai kontrak backend /api/v1/marketplace/*, /admin/partners, /admin/deliveries, /organic/*, & /b2b/*
 */

export type PartnerType =
  | "PENGEPUL"
  | "AGREGATOR"
  | "PENDAUR_ULANG"
  | "PENGERAJIN"
  | "PENGOLAH_ORGANIK";

export type PartnerVerificationStatus = "PENDING" | "VERIFIED" | "SUSPENDED";
export type BatchStatus =
  | "COLLECTED"
  | "BATCHED"
  | "ALLOCATED"
  | "SHIPPED"
  | "RECEIVED"
  | "PROCESSED_CONFIRMED";

export type DeliveryStatus = "DISPATCHED" | "DELIVERED" | "DISPUTED";
export type OfferType = "SUPPLY" | "DEMAND";
export type OfferStatus = "OPEN" | "ALLOCATED" | "COMPLETED" | "EXPIRED" | "CANCELLED";

export type OrganicProcessType = "COMPOSTING_AEROBIC" | "MAGGOT_BSF" | "ANAEROBIC_DIGESTION";
export type OrganicStatus = "IN_PROGRESS" | "MATURED" | "HARVESTED" | "FAILED";

export type B2BBusinessType = "HOTEL" | "RESTAURANT" | "VILLA" | "MARKET" | "OFFICE" | "COMMERCIAL";
export type B2BPickupStatus =
  | "SCHEDULED"
  | "DISPATCHED"
  | "COLLECTED"
  | "RECEIVED_FACILITY"
  | "PROCESSED"
  | "CANCELLED";

export interface Partner {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  partner_type: PartnerType;
  capacity_kg_per_month: number | null;
  service_area_id: string | null;
  verification_status: PartnerVerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface PartnerCreateRequest {
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  partner_type?: PartnerType;
  capacity_kg_per_month?: number | null;
  service_area_id?: string | null;
  is_verified?: boolean;
}

export interface PartnerVerifyRequest {
  verification_status: PartnerVerificationStatus;
  notes?: string | null;
}

export interface MaterialBatchCreateRequest {
  category_id: string;
  pickup_ids: string[];
}

export interface MaterialBatchItem {
  id: string;
  batch_id: string;
  pickup_id: string;
  weight_kg: number;
}

export interface MaterialBatch {
  id: string;
  batch_code: string;
  category_id: string;
  total_weight_kg: number;
  status: BatchStatus;
  created_by: string;
  created_at: string;
  items?: MaterialBatchItem[];
}

export interface DeliveryRecord {
  id: string;
  batch_id: string;
  partner_id: string;
  dispatched_weight_kg: number;
  received_weight_kg: number | null;
  weight_discrepancy_kg: number | null;
  status: DeliveryStatus;
  dispatched_at: string;
  received_at: string | null;
  notes: string | null;
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

export interface DeliveryConfirmProcessingRequest {
  notes: string;
}

export interface MaterialOffer {
  id: string;
  offer_no: string;
  offer_type: OfferType;
  category_id: string;
  partner_id: string | null;
  facility_id: string | null;
  min_quantity_kg: number;
  max_quantity_kg: number;
  quality_grade: string;
  price_indicative_idr: number | null;
  valid_until: string;
  status: OfferStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface MaterialOfferCreateRequest {
  offer_type: OfferType;
  category_id: string;
  partner_id?: string | null;
  facility_id?: string | null;
  min_quantity_kg: number;
  max_quantity_kg: number;
  quality_grade?: string;
  price_indicative_idr?: number | null;
  valid_until: string;
  notes?: string | null;
}

export interface MaterialOfferAcceptRequest {
  allocated_quantity_kg: number;
  target_partner_id?: string | null;
  target_facility_id?: string | null;
  notes?: string | null;
}

export interface OrganicProcessingRecord {
  id: string;
  batch_no: string;
  facility_id: string;
  operator_user_id: string;
  process_type: OrganicProcessType;
  input_weight_kg: number;
  output_product_weight_kg: number;
  residue_weight_kg: number;
  status: OrganicStatus;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrganicProcessingStartRequest {
  facility_id: string;
  process_type?: OrganicProcessType;
  input_weight_kg: number;
  notes?: string | null;
}

export interface OrganicProcessingCompleteRequest {
  output_product_weight_kg: number;
  residue_weight_kg: number;
  status?: OrganicStatus;
  notes?: string | null;
}

export interface B2BOrganization {
  id: string;
  name: string;
  business_type: B2BBusinessType;
  tax_id: string | null;
  billing_contact_name: string;
  billing_contact_phone: string;
  billing_contact_email: string;
  is_active: boolean;
  created_at: string;
}

export interface B2BOrganizationCreateRequest {
  name: string;
  business_type?: B2BBusinessType;
  tax_id?: string | null;
  billing_contact_name: string;
  billing_contact_phone: string;
  billing_contact_email: string;
}

export interface B2BLocation {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  service_area_id: string | null;
  contact_person: string;
  contact_phone: string;
  estimated_daily_kg: number;
  pickup_frequency: string;
  access_instructions: string | null;
  is_active: boolean;
  created_at: string;
}

export interface B2BLocationCreateRequest {
  organization_id: string;
  name: string;
  address: string;
  service_area_id?: string | null;
  contact_person: string;
  contact_phone: string;
  estimated_daily_kg?: number;
  pickup_frequency?: string;
  access_instructions?: string | null;
}

export interface B2BPickupRequest {
  id: string;
  request_no: string;
  location_id: string;
  category_id: string;
  scheduled_date: string;
  estimated_weight_kg: number;
  actual_weight_kg: number | null;
  status: B2BPickupStatus;
  collector_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface B2BPickupCreateRequest {
  location_id: string;
  category_id: string;
  scheduled_date: string;
  estimated_weight_kg: number;
  notes?: string | null;
}

export interface B2BPickupStatusUpdateRequest {
  status: B2BPickupStatus;
  actual_weight_kg?: number | null;
  notes?: string | null;
}

export interface B2BOperationalReport {
  organization_id: string;
  organization_name: string;
  total_requests: number;
  scheduled_count: number;
  collected_count: number;
  received_facility_count: number;
  processed_count: number;
  cancelled_count: number;
  total_estimated_weight_kg: number;
  total_actual_weight_kg: number;
  verified_loop_completion_rate?: number;
  breakdown_by_category?: Record<string, number>;
  audit_disclaimer?: string;
}
