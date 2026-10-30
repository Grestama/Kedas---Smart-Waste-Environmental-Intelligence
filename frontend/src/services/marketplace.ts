/**
 * WasteLink Bali — Marketplace, Downstream Partners, Organic Processing & B2B Service Layer
 * Interacts with /api/v1/marketplace/*, /admin/partners, /admin/deliveries, /organic/*, & /b2b/*
 */

import { apiClient } from "@/lib/api-client";
import {
  B2BLocation,
  B2BLocationCreateRequest,
  B2BOperationalReport,
  B2BOrganization,
  B2BOrganizationCreateRequest,
  B2BPickupCreateRequest,
  B2BPickupRequest,
  B2BPickupStatusUpdateRequest,
  DeliveryConfirmProcessingRequest,
  DeliveryCreateRequest,
  DeliveryReceiptRequest,
  DeliveryRecord,
  MaterialBatch,
  MaterialBatchCreateRequest,
  MaterialOffer,
  MaterialOfferAcceptRequest,
  MaterialOfferCreateRequest,
  OfferStatus,
  OfferType,
  OrganicProcessingCompleteRequest,
  OrganicProcessingRecord,
  OrganicProcessingStartRequest,
  Partner,
  PartnerCreateRequest,
  PartnerType,
  PartnerVerifyRequest,
} from "@/types/marketplace";

// ==============================================================================
// Partners
// ==============================================================================

export async function createPartner(payload: PartnerCreateRequest): Promise<Partner> {
  return apiClient.post<Partner>("/admin/partners", payload);
}

export async function verifyPartner(
  partnerId: string,
  payload: PartnerVerifyRequest
): Promise<Partner> {
  return apiClient.post<Partner>(`/admin/partners/${partnerId}/verify`, payload);
}

export async function listPartners(options?: {
  verifiedOnly?: boolean;
  partnerType?: PartnerType;
}): Promise<Partner[]> {
  const query = new URLSearchParams();
  if (options?.verifiedOnly !== undefined) {
    query.set("verified_only", String(options.verifiedOnly));
  }
  if (options?.partnerType) {
    query.set("partner_type", options.partnerType);
  }
  const queryString = query.toString();
  return apiClient.get<Partner[]>(`/admin/partners${queryString ? `?${queryString}` : ""}`);
}

// ==============================================================================
// Batches & Deliveries
// ==============================================================================

export async function createBatch(payload: MaterialBatchCreateRequest): Promise<MaterialBatch> {
  return apiClient.post<MaterialBatch>("/admin/batches", payload);
}

export async function listBatches(status?: string): Promise<MaterialBatch[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiClient.get<MaterialBatch[]>(`/admin/batches${query}`);
}

export async function dispatchDelivery(payload: DeliveryCreateRequest): Promise<DeliveryRecord> {
  return apiClient.post<DeliveryRecord>("/admin/deliveries", payload);
}

export async function confirmDeliveryReceipt(
  deliveryId: string,
  payload: DeliveryReceiptRequest
): Promise<DeliveryRecord> {
  return apiClient.post<DeliveryRecord>(`/admin/deliveries/${deliveryId}/receipt`, payload);
}

export async function confirmDeliveryProcessing(
  deliveryId: string,
  payload: DeliveryConfirmProcessingRequest
): Promise<DeliveryRecord> {
  return apiClient.post<DeliveryRecord>(
    `/admin/deliveries/${deliveryId}/confirm-processing`,
    payload
  );
}

// ==============================================================================
// Material Demand & Supply Offers
// ==============================================================================

export async function createMaterialOffer(
  payload: MaterialOfferCreateRequest
): Promise<MaterialOffer> {
  return apiClient.post<MaterialOffer>("/marketplace/offers", payload);
}

export async function listMaterialOffers(options?: {
  offerType?: OfferType;
  categoryId?: string;
  status?: OfferStatus;
}): Promise<MaterialOffer[]> {
  const query = new URLSearchParams();
  if (options?.offerType) query.set("offer_type", options.offerType);
  if (options?.categoryId) query.set("category_id", options.categoryId);
  if (options?.status) query.set("status", options.status);
  const queryString = query.toString();
  return apiClient.get<MaterialOffer[]>(
    `/marketplace/offers${queryString ? `?${queryString}` : ""}`
  );
}

export async function acceptMaterialOffer(
  offerId: string,
  payload: MaterialOfferAcceptRequest
): Promise<MaterialOffer> {
  return apiClient.post<MaterialOffer>(`/marketplace/offers/${offerId}/accept`, payload);
}

// ==============================================================================
// Organic Processing
// ==============================================================================

export async function startOrganicProcessing(
  payload: OrganicProcessingStartRequest
): Promise<OrganicProcessingRecord> {
  return apiClient.post<OrganicProcessingRecord>("/organic/processing/start", payload);
}

export async function completeOrganicProcessing(
  recordId: string,
  payload: OrganicProcessingCompleteRequest
): Promise<OrganicProcessingRecord> {
  return apiClient.post<OrganicProcessingRecord>(
    `/organic/processing/${recordId}/complete`,
    payload
  );
}

// ==============================================================================
// Commercial Generators (B2B)
// ==============================================================================

export async function createB2BOrganization(
  payload: B2BOrganizationCreateRequest
): Promise<B2BOrganization> {
  return apiClient.post<B2BOrganization>("/b2b/organizations", payload);
}

export async function createB2BLocation(payload: B2BLocationCreateRequest): Promise<B2BLocation> {
  return apiClient.post<B2BLocation>("/b2b/locations", payload);
}

export async function listB2BLocations(organizationId: string): Promise<B2BLocation[]> {
  return apiClient.get<B2BLocation[]>(`/b2b/organizations/${organizationId}/locations`);
}

export async function createB2BPickup(payload: B2BPickupCreateRequest): Promise<B2BPickupRequest> {
  return apiClient.post<B2BPickupRequest>("/b2b/pickups", payload);
}

export async function updateB2BPickupStatus(
  pickupId: string,
  payload: B2BPickupStatusUpdateRequest
): Promise<B2BPickupRequest> {
  return apiClient.patch<B2BPickupRequest>(`/b2b/pickups/${pickupId}/status`, payload);
}

export async function getB2BReport(organizationId: string): Promise<B2BOperationalReport> {
  return apiClient.get<B2BOperationalReport>(`/b2b/organizations/${organizationId}/report`);
}
