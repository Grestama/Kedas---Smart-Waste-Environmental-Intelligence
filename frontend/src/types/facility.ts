/**
 * WasteLink Bali — Facility, Stock Movement, and Bank Sampah TypeScript Types
 * Sesuai kontrak backend /api/v1/facilities/*
 */

export type FacilityType = "TPS3R" | "TPST" | "BANK_SAMPAH" | "MATERIAL_RECOVERY";
export type QualityGrade = "GRADE_A" | "GRADE_B" | "GRADE_C" | "REJECTED";
export type ReceiptStatus = "ACCEPTED" | "PARTIALLY_ACCEPTED" | "REJECTED";
export type MovementType =
  | "INTAKE_RECEIPT"
  | "SORTING_IN"
  | "SORTING_OUTPUT"
  | "SORTING_RESIDUE"
  | "PROCESSING_OUTPUT"
  | "HANDOVER_OUT"
  | "STOCK_ADJUSTMENT";
export type BankTransactionType = "DEPOSIT" | "WITHDRAWAL" | "ADJUSTMENT" | "REVERSAL";

export interface Facility {
  id: string;
  code: string;
  name: string;
  facility_type: FacilityType;
  service_area_id: string | null;
  address: string;
  capacity_kg_per_day: number;
  is_active: boolean;
  created_at: string;
}

export interface FacilityCreateRequest {
  code: string;
  name: string;
  facility_type?: FacilityType;
  service_area_id?: string | null;
  address: string;
  capacity_kg_per_day?: number;
}

export interface FacilityReceipt {
  id: string;
  receipt_no: string;
  facility_id: string;
  pickup_id: string | null;
  category_id: string;
  receiver_user_id: string;
  sender_user_id: string | null;
  gross_weight_kg: number | null;
  tare_weight_kg: number | null;
  received_weight_kg: number;
  discrepancy_kg: number;
  discrepancy_reason: string | null;
  quality_grade: QualityGrade;
  contamination_percent: number;
  receipt_status: ReceiptStatus;
  idempotency_key: string | null;
  notes: string | null;
  created_at: string;
}

export interface FacilityReceiptCreateRequest {
  facility_id: string;
  category_id: string;
  pickup_id?: string | null;
  sender_user_id?: string | null;
  gross_weight_kg?: number | null;
  tare_weight_kg?: number | null;
  received_weight_kg: number;
  quality_grade?: QualityGrade;
  contamination_percent?: number;
  receipt_status?: ReceiptStatus;
  discrepancy_reason?: string | null;
  idempotency_key?: string | null;
  notes?: string | null;
}

export interface SortingOutputItem {
  category_id: string;
  quantity_kg: number;
  is_residue?: boolean;
  notes?: string | null;
}

export interface SortingProcessRequest {
  facility_id: string;
  input_category_id: string;
  input_weight_kg: number;
  outputs: SortingOutputItem[];
  tolerance_kg?: number;
  notes?: string | null;
}

export interface StockMovement {
  id: string;
  facility_id: string;
  category_id: string;
  batch_id: string | null;
  movement_type: MovementType;
  quantity_kg: number;
  reference_id: string | null;
  actor_user_id: string;
  notes: string | null;
  created_at: string;
}

export interface FacilityStockItem {
  category_id: string;
  category_name: string;
  current_stock_kg: number;
}

export interface FacilityStockSummary {
  facility_id: string;
  facility_name: string;
  items: FacilityStockItem[];
  total_stock_kg: number;
}

export interface WasteBankMember {
  id: string;
  account_no: string;
  user_id: string;
  facility_id: string;
  current_balance_idr: number;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  created_at: string;
}

export interface WasteBankMemberCreateRequest {
  user_id: string;
  facility_id: string;
  account_no?: string | null;
}

export interface WasteBankDepositRequest {
  member_id: string;
  category_id: string;
  weight_kg: number;
  unit_price_idr: number;
  receipt_id?: string | null;
  notes?: string | null;
}

export interface WasteBankWithdrawRequest {
  member_id: string;
  amount_idr: number;
  notes?: string | null;
}

export interface WasteBankReversalRequest {
  reason: string;
}

export interface WasteBankTransaction {
  id: string;
  transaction_no: string;
  member_id: string;
  category_id: string | null;
  transaction_type: BankTransactionType;
  weight_kg: number | null;
  unit_price_idr: number | null;
  amount_idr: number;
  running_balance_idr: number;
  receipt_id: string | null;
  reverses_transaction_id: string | null;
  recorded_by: string;
  status: "CONFIRMED" | "REVERSED";
  notes: string | null;
  created_at: string;
}
