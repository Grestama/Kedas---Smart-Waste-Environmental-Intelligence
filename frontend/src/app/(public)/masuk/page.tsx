"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Recycle, ArrowRight, ShieldCheck, Truck, User as UserIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";

type RoleType = "user" | "collector" | "admin";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { login, loginAsMockRole, isAuthenticated, user } = useAuth();

  const redirectUrl = searchParams.get("redirect");
  const isSessionExpired = searchParams.get("expired") === "1";

  const [selectedRole, setSelectedRole] = useState<RoleType>("user");
  const [identifier, setIdentifier] = useState("wayan.sudarsana@example.com");
  const [password, setPassword] = useState("warga123!@#");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSessionExpired) {
      toast.warning(
        "Sesi Berakhir",
        "Sesi Anda telah kedaluwarsa. Silakan masuk kembali untuk melanjutkan."
      );
    }
  }, [isSessionExpired, toast]);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "user") {
      setIdentifier("wayan.sudarsana@example.com");
      setPassword("warga123!@#");
    } else if (role === "collector") {
      setIdentifier("made.collector@wastelink.bali.id");
      setPassword("collector123!@#");
    } else {
      setIdentifier("admin.operasional@wastelink.bali.id");
      setPassword("admin123!@#");
    }
  };

  const determineRedirect = (userRole?: string) => {
    if (redirectUrl) return redirectUrl;
    const roleUpper = (userRole || selectedRole).toUpperCase();
    if (roleUpper === "ADMIN") return "/admin";
    if (roleUpper === "COLLECTOR") return "/staff";
    return "/app";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login({ identifier, password });
      toast.success(
        "Masuk Berhasil",
        `Selamat datang kembali, ${loggedInUser.full_name}!`
      );
      router.push(determineRedirect(loggedInUser.preferred_active_role));
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 0 || err.code === "NETWORK_ERROR") {
          // Backend offline - offer quick mock mode
          toast.info(
            "Mode Pengujian Diaktifkan",
            "Server backend lokal tidak terdeteksi. Menggunakan simulasi akun peran untuk pengujian UI."
          );
          loginAsMockRole(selectedRole);
          router.push(determineRedirect(selectedRole));
          return;
        }
        setErrorMessage(err.message || "Kredensial tidak valid atau akun dinonaktifkan.");
      } else {
        setErrorMessage("Terjadi kesalahan sistem saat mencoba masuk.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMockLogin = () => {
    loginAsMockRole(selectedRole);
    toast.success(
      "Masuk Cepat Mode Pengujian",
      `Berhasil masuk sebagai ${selectedRole.toUpperCase()}.`
    );
    router.push(determineRedirect(selectedRole));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-900 text-white flex items-center justify-center mx-auto mb-3">
            <Recycle className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-brand-900 tracking-tight">
            Masuk ke WasteLink Bali
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Pilih peran akun Anda untuk masuk ke sistem operasional
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-canvas rounded-lg border border-border mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect("user")}
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-semibold transition-colors ${
              selectedRole === "user"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <UserIcon className="w-4 h-4 mb-1" />
            <span>Warga</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("collector")}
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-semibold transition-colors ${
              selectedRole === "collector"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Truck className="w-4 h-4 mb-1" />
            <span>Petugas</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("admin")}
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-semibold transition-colors ${
              selectedRole === "admin"
                ? "bg-white text-brand-900 shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-1" />
            <span>Admin</span>
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-[#FBEAE7] border border-[#F5C6BF] text-[#A43F35] text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Gagal Masuk</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email atau Nomor Telepon"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="nama@email.com atau 081234567890"
          />

          <div className="space-y-1">
            <Input
              label="Kata Sandi (Password)"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="text-right">
              <Link
                href="/lupa-password"
                className="text-xs text-brand-700 hover:text-brand-900 font-medium"
              >
                Lupa kata sandi?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Masuk Sekarang
          </Button>
        </form>

        {/* Fast dev test button */}
        <div className="mt-3 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={handleQuickMockLogin}
            className="w-full py-2 px-3 text-xs font-medium rounded-lg border border-dashed border-border bg-[#FAFBF9] text-text-secondary hover:text-brand-900 hover:bg-[#F1F3F1] transition-colors"
          >
            ⚡ Masuk Cepat Demo ({selectedRole.toUpperCase()})
          </button>
        </div>

        <div className="mt-5 text-center text-xs text-text-secondary">
          Belum memiliki akun warga?{" "}
          <Link href="/daftar" className="font-semibold text-brand-700 hover:text-brand-900">
            Daftar Warga Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Memuat...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
