/**
 * WasteLink Bali — Community Banjar, Funding Programs, Clean-up Actions & Hazardous Waste Types
 * Sesuai kontrak backend /api/v1/community/* dan /api/v1/programs/*
 */

// ==============================================================================
// Enums
// ==============================================================================

export type CommunityEventType =
  | "GOTONG_ROYONG"
  | "EDUCATION"
  | "BULK_COLLECTION"
  | "CEREMONY_CLEANUP";

export type CommunityEventStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ComplaintStatus = "REPORTED" | "INVESTIGATING" | "RESOLVED" | "REJECTED";

export type CleanupActionType =
  | "BEACH_CLEANUP"
  | "RIVER_CLEANUP"
  | "PUBLIC_PARK"
  | "COMMUNITY_VOLUNTEERING";

export type CleanupActionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED";

export type HazardType =
  | "TOXIC"
  | "CORROSIVE"
  | "FLAMMABLE"
  | "INFECTIOUS"
  | "E_WASTE"
  | "BATTERY";

export type HazardousManifestStatus =
  | "COLLECTED"
  | "IN_TRANSIT"
  | "DELIVERED_TO_FACILITY"
  | "SAFELY_DISPOSED";

export type ProgramType = "COMMUNITY" | "CSR" | "GOVERNMENT_GRANT" | "DONATION";
export type SponsorType = "CSR" | "GOVERNMENT" | "FOUNDATION" | "INDIVIDUAL" | "COMMUNITY";
export type FundingProgramStatus = "ACTIVE" | "EXHAUSTED" | "SUSPENDED";

// ==============================================================================
// Banjar Profiles & Officials
// ==============================================================================

export interface BanjarProfile {
  id: string;
  service_area_id: string;
  desa_adat_name: string;
  kelian_banjar_name: string;
  contact_phone: string;
  household_count: number;
  target_sorting_percent: number;
  created_at: string;
  updated_at: string;
}

export interface BanjarProfileCreateRequest {
  service_area_id: string;
  desa_adat_name: string;
  kelian_banjar_name: string;
  contact_phone: string;
  household_count?: number;
  target_sorting_percent?: number;
}

export interface BanjarOfficial {
  id: string;
  user_id: string;
  service_area_id: string;
  official_title: string;
  is_active: boolean;
  created_at: string;
}

export interface BanjarOfficialCreateRequest {
  user_id: string;
  service_area_id: string;
  official_title: string;
}

export interface BanjarRegionalDashboard {
  service_area_id: string;
  service_area_name: string;
  desa_adat_name: string | null;
  kelian_banjar_name: string | null;
  household_count: number;
  total_pickups_count: number;
  total_weight_kg: number;
  sorting_compliance_percent: number;
  open_complaints_count: number;
  upcoming_events_count: number;
  active_programs_count: number;
}

// ==============================================================================
// Community Events
// ==============================================================================

export interface CommunityEvent {
  id: string;
  event_no: string;
  service_area_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: CommunityEventType;
  status: CommunityEventStatus;
  organizer_user_id: string;
  expected_attendees: number;
  actual_attendees: number;
  created_at: string;
}

export interface CommunityEventCreateRequest {
  service_area_id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_type?: CommunityEventType;
  expected_attendees?: number;
}

export interface CommunityEventAttendanceRequest {
  actual_attendees: number;
  status?: CommunityEventStatus;
}

// ==============================================================================
// Community Complaints
// ==============================================================================

export interface CommunityComplaint {
  id: string;
  ticket_no: string;
  service_area_id: string;
  reporter_user_id: string;
  title: string;
  description: string;
  location_detail: string;
  status: ComplaintStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface CommunityComplaintCreateRequest {
  service_area_id: string;
  title: string;
  description: string;
  location_detail: string;
}

export interface CommunityComplaintResolveRequest {
  status?: ComplaintStatus;
  resolution_notes: string;
}

// ==============================================================================
// Clean-up Actions (Role 11 - Volunteer Beach / River Cleanup)
// ==============================================================================

export interface CleanupAction {
  id: string;
  action_no: string;
  action_type: CleanupActionType;
  location_name: string;
  service_area_id: string | null;
  coordinator_user_id: string;
  event_date: string;
  duration_hours: number;
  volunteer_count: number;
  total_collected_weight_kg: number;
  plastic_weight_kg: number;
  organic_weight_kg: number;
  residual_weight_kg: number;
  evidence_notes: string | null;
  status: CleanupActionStatus;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface CleanupActionCreateRequest {
  action_type?: CleanupActionType;
  location_name: string;
  service_area_id?: string | null;
  event_date: string;
  duration_hours?: number;
  volunteer_count?: number;
}

export interface CleanupActionCompleteRequest {
  total_collected_weight_kg: number;
  plastic_weight_kg?: number;
  organic_weight_kg?: number;
  residual_weight_kg?: number;
  evidence_notes?: string | null;
}

export interface CleanupActionVerifyRequest {
  notes: string;
}

// ==============================================================================
// Hazardous Waste Manifests (Role 12 - Limbah Khusus B3 Terkendali)
// ==============================================================================

export interface HazardousWasteManifest {
  id: string;
  manifest_no: string;
  category_id: string;
  service_area_id: string | null;
  source_pickup_id: string | null;
  handler_partner_id: string;
  transporter_license_no: string;
  weight_kg: number;
  hazard_type: HazardType;
  handling_sop_code: string;
  status: HazardousManifestStatus;
  destruction_cert_no: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  disposed_at: string | null;
}

export interface HazardousManifestCreateRequest {
  category_id: string;
  handler_partner_id: string;
  transporter_license_no: string;
  weight_kg: number;
  hazard_type?: HazardType;
  handling_sop_code: string;
  service_area_id?: string | null;
  source_pickup_id?: string | null;
  notes?: string | null;
}

export interface HazardousManifestStatusUpdateRequest {
  status: HazardousManifestStatus;
  notes?: string | null;
}

export interface HazardousManifestDisposalRequest {
  destruction_cert_no: string;
  notes?: string | null;
}

// ==============================================================================
// Programs & Funding (Role 10)
// ==============================================================================

export interface FundingProgram {
  id: string;
  code: string;
  name: string;
  sponsor_name: string | null;
  program_type: ProgramType;
  target_service_area_id: string | null;
  total_budget_idr: number;
  disbursed_budget_idr: number;
  total_points_disbursed: number;
  points_capacity: number;
  status: FundingProgramStatus;
  created_at: string;
  updated_at: string;
}

export interface ProgramCreateRequest {
  code: string;
  name: string;
  sponsor_name?: string | null;
  program_type?: ProgramType;
  target_service_area_id?: string | null;
  total_budget_idr: number;
  points_capacity: number;
}

export interface ProgramSponsorship {
  id: string;
  program_id: string;
  sponsor_name: string;
  sponsor_type: SponsorType;
  amount_idr: number;
  contract_ref: string | null;
  contributed_at: string;
  notes: string | null;
  created_at: string;
}

export interface SponsorshipCreateRequest {
  sponsor_name: string;
  sponsor_type?: SponsorType;
  amount_idr: number;
  contract_ref?: string | null;
  notes?: string | null;
}

export interface ProgramBudgetAllocation {
  id: string;
  program_id: string;
  service_area_id: string;
  allocated_amount_idr: number;
  spent_amount_idr: number;
  purpose: string;
  allocated_at: string;
  created_at: string;
}

export interface BudgetAllocationCreateRequest {
  service_area_id: string;
  allocated_amount_idr: number;
  purpose: string;
}

// ==============================================================================
// CDOA & Service Directory (Tata Kelola Destinasi & Area Layanan)
// ==============================================================================

export enum CDOAStatus {
  DRAFT = "DRAFT",
  REVIEWED = "REVIEWED",
  APPROVED = "APPROVED",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface CDOAResponse {
  id: string;
  agreement_no: string;
  service_area_id: string;
  version: number;
  title: string;
  status: CDOAStatus | string;
  eligible_source_types: string;
  accepted_category_ids?: string | null;
  primary_facility_id?: string | null;
  collection_schedule_notes?: string | null;
  capacity_limit_daily_kg: number;
  pic_name: string;
  pic_contact: string;
  escalation_channel: string;
  sla_hours: number;
  effective_from: string;
  effective_until?: string | null;
  created_by: string;
  approved_by?: string | null;
  approval_timestamp?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoryInfo {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  handling_notes?: string | null;
}

export interface ServiceDirectoryResponse {
  service_area_id: string;
  service_area_name: string;
  administrative_area: string;
  is_service_active: boolean;
  active_cdoa?: CDOAResponse | null;
  accepted_categories: ServiceCategoryInfo[];
  schedule_notes?: string | null;
  daily_capacity_limit_kg?: number | null;
  escalation_channel?: string | null;
  unavailability_reason?: string | null;
}

