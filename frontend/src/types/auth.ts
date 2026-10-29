/**
 * WasteLink Bali — Tipe Data Autentikasi & Akun
 * Berdasarkan kontrak aktual backend /api/v1/auth dan /api/v1/me
 */

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  account_status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | string;
  preferred_active_role: "USER" | "COLLECTOR" | "ADMIN" | string;
  created_at: string;
}

export interface Role {
  code: "USER" | "COLLECTOR" | "ADMIN" | string;
  name: string;
  description: string | null;
  verification_status: "ACTIVE" | "PENDING" | "REJECTED" | string;
}

export interface AuthResponse {
  user: User;
  session_token: string;
  expires_at?: string;
}

export interface LoginPayload {
  identifier: string; // Email atau nomor telepon
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_text: string;
  service_area_id: string | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CreateAddressPayload {
  label: string;
  address_text: string;
  service_area_id?: string | null;
  notes?: string | null;
  is_default?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  address_text?: string;
  service_area_id?: string | null;
  notes?: string | null;
  is_default?: boolean;
}
