import React, { createContext, useContext, useState, useEffect } from "react";
import { MobileUser } from "@/types";
import { mobileApiClient } from "@/lib/api-client";

interface MobileAuthContextValue {
  user: MobileUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthContextValue | undefined>(
  undefined
);

// Default mock citizen account for Banjar Sukawati pilot
const defaultCitizenUser: MobileUser = {
  id: "usr_warga_01",
  name: "Wayan Sudarsana",
  phone: "0812-3456-7890",
  email: "wayan.sudarsana@gmail.com",
  banjar: "Banjar Kaja Sukawati",
  active_role: "USER",
  token: "mock_jwt_token_citizen_warga_sukawati",
};

export function MobileAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MobileUser | null>(defaultCitizenUser);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    "authenticated"
  );

  useEffect(() => {
    if (user?.token) {
      mobileApiClient.setToken(user.token);
    }
  }, [user]);

  const login = async (phone: string, pin: string) => {
    setStatus("loading");
    try {
      // Authenticate via mobile client
      const res = await mobileApiClient.post<{ access_token: string; user: any }>(
        "/auth/login",
        { phone, password: pin }
      ).catch(() => {
        // Fallback demo citizen login
        return {
          access_token: "mock_jwt_token_warga",
          user: {
            id: "usr_warga_01",
            full_name: "Wayan Sudarsana",
            phone: phone || "0812-3456-7890",
            email: "warga@sukawati.id",
          },
        };
      });

      const citizen: MobileUser = {
        id: res.user.id,
        name: res.user.full_name,
        phone: res.user.phone,
        email: res.user.email || null,
        banjar: "Banjar Kaja Sukawati",
        active_role: "USER",
        token: res.access_token,
      };

      setUser(citizen);
      mobileApiClient.setToken(res.access_token);
      setStatus("authenticated");
    } catch {
      setStatus("unauthenticated");
      throw new Error("Nomor HP atau PIN salah.");
    }
  };

  const logout = async () => {
    setUser(null);
    mobileApiClient.setToken(null);
    setStatus("unauthenticated");
  };

  return (
    <MobileAuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) {
    throw new Error("useMobileAuth harus digunakan di dalam MobileAuthProvider");
  }
  return context;
}
