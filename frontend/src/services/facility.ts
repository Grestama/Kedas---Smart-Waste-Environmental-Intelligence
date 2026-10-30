/**
 * WasteLink Bali — Facility & Waste Bank Domain Service Layer
 * Interacts with /api/v1/facilities/*
 */

import { apiClient } from "@/lib/api-client";
import {
  Facility,
  FacilityCreateRequest,
  FacilityReceipt,
  FacilityReceiptCreateRequest,
  FacilityStockSummary,
  SortingProcessRequest,
  StockMovement,
  WasteBankDepositRequest,
  WasteBankMember,
  WasteBankMemberCreateRequest,
  WasteBankReversalRequest,
  WasteBankTransaction,
  WasteBankWithdrawRequest,
} from "@/types/facility";

export async function listFacilities(activeOnly = true): Promise<Facility[]> {
  return apiClient.get<Facility[]>(`/facilities?active_only=${activeOnly}`);
}

export async function getFacility(id: string): Promise<Facility> {
  return apiClient.get<Facility>(`/facilities/${id}`);
}

export async function createFacility(payload: FacilityCreateRequest): Promise<Facility> {
  return apiClient.post<Facility>("/facilities", payload);
}

export async function getFacilityStock(id: string): Promise<FacilityStockSummary> {
  return apiClient.get<FacilityStockSummary>(`/facilities/${id}/stock`);
}

export async function createFacilityReceipt(
  payload: FacilityReceiptCreateRequest
): Promise<FacilityReceipt> {
  return apiClient.post<FacilityReceipt>("/facilities/receipts", payload);
}

export async function recordSorting(
  payload: SortingProcessRequest
): Promise<StockMovement[]> {
  return apiClient.post<StockMovement[]>("/facilities/sorting", payload);
}

export async function createWasteBankMember(
  payload: WasteBankMemberCreateRequest
): Promise<WasteBankMember> {
  return apiClient.post<WasteBankMember>("/facilities/waste-bank/members", payload);
}

export async function depositWasteBank(
  payload: WasteBankDepositRequest
): Promise<WasteBankTransaction> {
  return apiClient.post<WasteBankTransaction>("/facilities/waste-bank/deposit", payload);
}

export async function withdrawWasteBank(
  payload: WasteBankWithdrawRequest
): Promise<WasteBankTransaction> {
  return apiClient.post<WasteBankTransaction>("/facilities/waste-bank/withdraw", payload);
}

export async function reverseWasteBankTransaction(
  transactionId: string,
  payload: WasteBankReversalRequest
): Promise<WasteBankTransaction> {
  return apiClient.post<WasteBankTransaction>(
    `/facilities/waste-bank/transactions/${transactionId}/reverse`,
    payload
  );
}

export async function listWasteBankTransactions(
  memberId: string,
  limit = 50
): Promise<WasteBankTransaction[]> {
  return apiClient.get<WasteBankTransaction[]>(
    `/facilities/waste-bank/members/${memberId}/transactions?limit=${limit}`
  );
}
