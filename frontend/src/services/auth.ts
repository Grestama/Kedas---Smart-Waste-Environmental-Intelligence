import { apiClient } from "@/lib/api-client";
import {
  User,
  Role,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from "@/types/auth";

class AuthService {
  public async login(identifier: string, password: string): Promise<AuthResponse> {
    const payload: LoginPayload = { identifier, password };
    return apiClient.post<AuthResponse>("/auth/login", payload);
  }

  public async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register", payload);
  }

  public async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/logout");
  }

  public async getMe(): Promise<User> {
    return apiClient.get<User>("/me");
  }

  public async getMyRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>("/me/roles");
  }

  public async switchActiveRole(role_code: string): Promise<User> {
    return apiClient.post<User>("/me/active-role", { role_code });
  }

  public async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return apiClient.patch<User>("/me", payload);
  }
}

export const authService = new AuthService();
