"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  User,
  Role,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from "@/types/auth";
import { mockUsers } from "@/mocks/previewData";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  roles: Role[];
  activeRole: string;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  switchActiveRole: (roleCode: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roleCode: string | string[]) => boolean;
  loginAsMockRole: (roleType: "user" | "collector" | "admin") => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRole, setActiveRole] = useState<string>("USER");
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wastelink_token");
      localStorage.removeItem("wastelink_mock_user");
    }
    setUser(null);
    setRoles([]);
    setActiveRole("USER");
    setStatus("unauthenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("wastelink_token");
    const mockStorage = localStorage.getItem("wastelink_mock_user");

    // If a mock session was explicitly chosen in dev preview mode
    if (mockStorage && !token) {
      try {
        const parsed = JSON.parse(mockStorage);
        setUser(parsed.user);
        setRoles(parsed.roles);
        setActiveRole(parsed.user.preferred_active_role || "USER");
        setStatus("authenticated");
        return;
      } catch {
        localStorage.removeItem("wastelink_mock_user");
      }
    }

    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    try {
      setStatus("loading");
      const [profileData, rolesData] = await Promise.all([
        apiClient.get<User>("/me"),
        apiClient.get<Role[]>("/me/roles"),
      ]);

      setUser(profileData);
      setRoles(rolesData || []);
      setActiveRole(profileData.preferred_active_role || "USER");
      setStatus("authenticated");
    } catch (err) {
      console.warn("Gagal merehidrasi sesi pengguna:", err);
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    refreshUser();

    // Listen to unauthorized event dispatched by apiClient on 401
    const handleUnauthorized = () => {
      clearSession();
      routerRef.current.push("/masuk?expired=1");
    };

    window.addEventListener("wastelink:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("wastelink:unauthorized", handleUnauthorized);
    };
  }, [refreshUser, clearSession]);

  const login = async (credentials: LoginPayload): Promise<User> => {
    setStatus("loading");
    try {
      const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
      if (typeof window !== "undefined") {
        localStorage.setItem("wastelink_token", res.session_token);
        localStorage.removeItem("wastelink_mock_user");
      }

      setUser(res.user);
      setActiveRole(res.user.preferred_active_role || "USER");

      try {
        const rolesData = await apiClient.get<Role[]>("/me/roles");
        setRoles(rolesData || []);
      } catch {
        setRoles([
          {
            code: res.user.preferred_active_role || "USER",
            name: res.user.preferred_active_role || "User",
            verification_status: "ACTIVE",
            description: null,
          },
        ]);
      }

      setStatus("authenticated");
      return res.user;
    } catch (error) {
      setStatus("unauthenticated");
      throw error;
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    setStatus("loading");
    try {
      const res = await apiClient.post<AuthResponse>("/auth/register", payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("wastelink_token", res.session_token);
        localStorage.removeItem("wastelink_mock_user");
      }

      setUser(res.user);
      setActiveRole("USER");
      setRoles([
        {
          code: "USER",
          name: "Warga",
          description: "Warga desa penyetor sampah",
          verification_status: "ACTIVE",
        },
      ]);
      setStatus("authenticated");
      return res.user;
    } catch (error) {
      setStatus("unauthenticated");
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.warn("Logout request failed or server unreachable:", err);
    } finally {
      clearSession();
      router.push("/masuk");
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
    const updated = await apiClient.patch<User>("/me", payload);
    setUser(updated);
    return updated;
  };

  const switchActiveRole = async (roleCode: string): Promise<void> => {
    try {
      const updated = await apiClient.post<User>("/me/active-role", {
        role_code: roleCode,
      });
      setUser(updated);
      setActiveRole(roleCode);
    } catch (err) {
      // If offline/preview mode, set locally
      setActiveRole(roleCode);
    }
  };

  const hasRole = (roleCode: string | string[]): boolean => {
    if (!user) return false;
    const required = Array.isArray(roleCode) ? roleCode : [roleCode];
    const userRoleCodes = roles
      .filter((r) => r.verification_status === "ACTIVE")
      .map((r) => r.code.toUpperCase());

    // Also include user.preferred_active_role
    if (user.preferred_active_role) {
      userRoleCodes.push(user.preferred_active_role.toUpperCase());
    }

    return required.some((r) => userRoleCodes.includes(r.toUpperCase()));
  };

  /**
   * Helper pengujian & demo: memungkinkan login instan ke peran yang dipilih
   */
  const loginAsMockRole = (roleType: "user" | "collector" | "admin") => {
    let mockUser: User;
    let mockRolesList: Role[];

    if (roleType === "user") {
      mockUser = {
        id: "usr_mock_warga",
        email: mockUsers.warga.email,
        phone: mockUsers.warga.phone,
        full_name: mockUsers.warga.name,
        account_status: "ACTIVE",
        preferred_active_role: "USER",
        created_at: new Date().toISOString(),
      };
      mockRolesList = [
        {
          code: "USER",
          name: "Warga Desa",
          description: "Penyetor sampah banjar",
          verification_status: "ACTIVE",
        },
      ];
    } else if (roleType === "collector") {
      mockUser = {
        id: "usr_mock_collector",
        email: mockUsers.petugas.email,
        phone: "081222333444",
        full_name: mockUsers.petugas.name,
        account_status: "ACTIVE",
        preferred_active_role: "COLLECTOR",
        created_at: new Date().toISOString(),
      };
      mockRolesList = [
        {
          code: "COLLECTOR",
          name: "Petugas Lapangan TPS3R",
          description: "Kolektor penjemputan sampah",
          verification_status: "ACTIVE",
        },
      ];
    } else {
      mockUser = {
        id: "usr_mock_admin",
        email: mockUsers.admin.email,
        phone: "081999888777",
        full_name: mockUsers.admin.name,
        account_status: "ACTIVE",
        preferred_active_role: "ADMIN",
        created_at: new Date().toISOString(),
      };
      mockRolesList = [
        {
          code: "ADMIN",
          name: "Administrator Banjar",
          description: "Pengelola operasional sistem",
          verification_status: "ACTIVE",
        },
      ];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "wastelink_mock_user",
        JSON.stringify({ user: mockUser, roles: mockRolesList })
      );
    }

    setUser(mockUser);
    setRoles(mockRolesList);
    setActiveRole(mockUser.preferred_active_role);
    setStatus("authenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        activeRole,
        status,
        isLoading: status === "loading",
        isAuthenticated: status === "authenticated",
        login,
        register,
        logout,
        updateProfile,
        switchActiveRole,
        refreshUser,
        hasRole,
        loginAsMockRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
