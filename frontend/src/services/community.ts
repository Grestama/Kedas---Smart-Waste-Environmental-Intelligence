/**
 * WasteLink Bali — Community Banjar, Funding Programs, Clean-up Actions & Hazardous Waste Service Layer
 * Interacts with /api/v1/community/* and /api/v1/programs/*
 */

import { apiClient } from "@/lib/api-client";
import {
  BanjarOfficial,
  BanjarOfficialCreateRequest,
  BanjarProfile,
  BanjarProfileCreateRequest,
  BanjarRegionalDashboard,
  BudgetAllocationCreateRequest,
  CDOAResponse,
  CleanupAction,
  CleanupActionCompleteRequest,
  CleanupActionCreateRequest,
  CleanupActionStatus,
  CleanupActionType,
  CleanupActionVerifyRequest,
  CommunityComplaint,
  CommunityComplaintCreateRequest,
  CommunityComplaintResolveRequest,
  CommunityEvent,
  CommunityEventAttendanceRequest,
  CommunityEventCreateRequest,
  CommunityEventStatus,
  ComplaintStatus,
  FundingProgram,
  FundingProgramStatus,
  HazardousManifestCreateRequest,
  HazardousManifestDisposalRequest,
  HazardousManifestStatus,
  HazardousManifestStatusUpdateRequest,
  HazardousWasteManifest,
  ProgramBudgetAllocation,
  ProgramCreateRequest,
  ProgramSponsorship,
  ProgramType,
  ServiceDirectoryResponse,
  SponsorshipCreateRequest,
} from "@/types/community";

// ==============================================================================
// Banjar Profiles & Officials
// ==============================================================================

export async function createOrUpdateBanjarProfile(
  payload: BanjarProfileCreateRequest
): Promise<BanjarProfile> {
  return apiClient.post<BanjarProfile>("/community/banjar/profile", payload);
}

export async function getBanjarProfile(serviceAreaId: string): Promise<BanjarProfile> {
  return apiClient.get<BanjarProfile>(`/community/banjar/${serviceAreaId}/profile`);
}

export async function assignBanjarOfficial(
  payload: BanjarOfficialCreateRequest
): Promise<BanjarOfficial> {
  return apiClient.post<BanjarOfficial>("/community/banjar/officials", payload);
}

export async function listBanjarOfficials(serviceAreaId: string): Promise<BanjarOfficial[]> {
  return apiClient.get<BanjarOfficial[]>(`/community/banjar/${serviceAreaId}/officials`);
}

export async function getBanjarDashboard(serviceAreaId: string): Promise<BanjarRegionalDashboard> {
  return apiClient.get<BanjarRegionalDashboard>(`/community/banjar/${serviceAreaId}/dashboard`);
}

// ==============================================================================
// Community Events
// ==============================================================================

export async function createCommunityEvent(
  payload: CommunityEventCreateRequest
): Promise<CommunityEvent> {
  return apiClient.post<CommunityEvent>("/community/events", payload);
}

export async function listCommunityEvents(options?: {
  serviceAreaId?: string;
  status?: CommunityEventStatus;
}): Promise<CommunityEvent[]> {
  const query = new URLSearchParams();
  if (options?.serviceAreaId) query.set("service_area_id", options.serviceAreaId);
  if (options?.status) query.set("status", options.status);
  const queryString = query.toString();
  return apiClient.get<CommunityEvent[]>(
    `/community/events${queryString ? `?${queryString}` : ""}`
  );
}

export async function recordEventAttendance(
  eventId: string,
  payload: CommunityEventAttendanceRequest
): Promise<CommunityEvent> {
  return apiClient.post<CommunityEvent>(`/community/events/${eventId}/attendance`, payload);
}

// ==============================================================================
// Community Complaints
// ==============================================================================

export async function createCommunityComplaint(
  payload: CommunityComplaintCreateRequest
): Promise<CommunityComplaint> {
  return apiClient.post<CommunityComplaint>("/community/complaints", payload);
}

export async function listCommunityComplaints(options?: {
  serviceAreaId?: string;
  status?: ComplaintStatus;
}): Promise<CommunityComplaint[]> {
  const query = new URLSearchParams();
  if (options?.serviceAreaId) query.set("service_area_id", options.serviceAreaId);
  if (options?.status) query.set("status", options.status);
  const queryString = query.toString();
  return apiClient.get<CommunityComplaint[]>(
    `/community/complaints${queryString ? `?${queryString}` : ""}`
  );
}

export async function resolveCommunityComplaint(
  complaintId: string,
  payload: CommunityComplaintResolveRequest
): Promise<CommunityComplaint> {
  return apiClient.post<CommunityComplaint>(
    `/community/complaints/${complaintId}/resolve`,
    payload
  );
}

// ==============================================================================
// Clean-up Actions (Role 11 - Volunteer Beach / River Cleanup)
// ==============================================================================

export async function createCleanupAction(
  payload: CleanupActionCreateRequest
): Promise<CleanupAction> {
  return apiClient.post<CleanupAction>("/community/cleanups", payload);
}

export async function listCleanupActions(options?: {
  actionType?: CleanupActionType;
  status?: CleanupActionStatus;
}): Promise<CleanupAction[]> {
  const query = new URLSearchParams();
  if (options?.actionType) query.set("action_type", options.actionType);
  if (options?.status) query.set("status", options.status);
  const queryString = query.toString();
  return apiClient.get<CleanupAction[]>(
    `/community/cleanups${queryString ? `?${queryString}` : ""}`
  );
}

export async function completeCleanupAction(
  actionId: string,
  payload: CleanupActionCompleteRequest
): Promise<CleanupAction> {
  return apiClient.post<CleanupAction>(`/community/cleanups/${actionId}/complete`, payload);
}

export async function verifyCleanupAction(
  actionId: string,
  payload: CleanupActionVerifyRequest
): Promise<CleanupAction> {
  return apiClient.post<CleanupAction>(`/community/cleanups/${actionId}/verify`, payload);
}

// ==============================================================================
// Hazardous Waste Manifests (Role 12 - Limbah Khusus B3 Terkendali)
// ==============================================================================

export async function createHazardousManifest(
  payload: HazardousManifestCreateRequest
): Promise<HazardousWasteManifest> {
  return apiClient.post<HazardousWasteManifest>("/community/hazardous-manifests", payload);
}

export async function listHazardousManifests(
  status?: HazardousManifestStatus
): Promise<HazardousWasteManifest[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiClient.get<HazardousWasteManifest[]>(
    `/community/hazardous-manifests${query}`
  );
}

export async function updateHazardousManifestStatus(
  manifestId: string,
  payload: HazardousManifestStatusUpdateRequest
): Promise<HazardousWasteManifest> {
  return apiClient.patch<HazardousWasteManifest>(
    `/community/hazardous-manifests/${manifestId}/status`,
    payload
  );
}

export async function recordHazardousDisposal(
  manifestId: string,
  payload: HazardousManifestDisposalRequest
): Promise<HazardousWasteManifest> {
  return apiClient.post<HazardousWasteManifest>(
    `/community/hazardous-manifests/${manifestId}/disposal`,
    payload
  );
}

// ==============================================================================
// Programs & Funding (Role 10)
// ==============================================================================

export async function createFundingProgram(
  payload: ProgramCreateRequest
): Promise<FundingProgram> {
  return apiClient.post<FundingProgram>("/programs", payload);
}

export async function listFundingPrograms(options?: {
  programType?: ProgramType;
  status?: FundingProgramStatus;
}): Promise<FundingProgram[]> {
  const query = new URLSearchParams();
  if (options?.programType) query.set("program_type", options.programType);
  if (options?.status) query.set("status", options.status);
  const queryString = query.toString();
  return apiClient.get<FundingProgram[]>(`/programs${queryString ? `?${queryString}` : ""}`);
}

export async function recordSponsorship(
  programId: string,
  payload: SponsorshipCreateRequest
): Promise<ProgramSponsorship> {
  return apiClient.post<ProgramSponsorship>(`/programs/${programId}/sponsorships`, payload);
}

export async function allocateProgramBudget(
  programId: string,
  payload: BudgetAllocationCreateRequest
): Promise<ProgramBudgetAllocation> {
  return apiClient.post<ProgramBudgetAllocation>(`/programs/${programId}/allocations`, payload);
}

// ==============================================================================
// CDOA & Service Directory (Tata Kelola Destinasi & Area Layanan)
// ==============================================================================

export async function getServiceDirectory(serviceAreaId: string): Promise<ServiceDirectoryResponse> {
  return apiClient.get<ServiceDirectoryResponse>(`/community/service-directory/${serviceAreaId}`);
}

export async function listCDOAsByArea(serviceAreaId: string): Promise<CDOAResponse[]> {
  return apiClient.get<CDOAResponse[]>(`/community/banjar/${serviceAreaId}/cdoas`);
}

