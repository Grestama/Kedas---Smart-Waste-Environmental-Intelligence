"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ShieldAlert, Lock, AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  workspaceName?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  workspaceName = "Operasional",
}: AuthGuardProps) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const pathname = usePathname();
  const { user, roles, status, hasRole, activeRole } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      routerRef.current.push(`/masuk?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-900 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-text-secondary">
          Memverifikasi hak akses & sesi {workspaceName}...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF4D9] text-[#98631C] flex items-center justify-center mb-4 border border-[#F7E1A0]">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-brand-900 tracking-tight">
          Autentikasi Diperlukan
        </h2>
        <p className="text-xs text-text-secondary max-w-sm mt-1.5 leading-relaxed">
          Halaman ini dilindungi dan memerlukan akun yang terautentikasi. Anda sedang dialihkan ke halaman masuk...
        </p>
        <div className="mt-5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push(`/masuk?redirect=${encodeURIComponent(pathname)}`)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Masuk ke Akun
          </Button>
        </div>
      </div>
    );
  }

  // Account suspension check
  if (user.account_status === "SUSPENDED") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FBEAE7] text-[#A43F35] flex items-center justify-center mb-4 border border-[#F5C6BF]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#A43F35] tracking-tight">
          Akun Sedang Ditangguhkan
        </h2>
        <p className="text-xs text-text-secondary max-w-md mt-1.5 leading-relaxed">
          Akun Anda ({user.email || user.phone}) telah dinonaktifkan sementara oleh pengurus banjar. Silakan hubungi koordinator TPS3R Banjar Sukawati untuk klarifikasi status.
        </p>
      </div>
    );
  }

  // Role authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = hasRole(allowedRoles);

    if (!isAuthorized) {
      // Check if user specifically applied for COLLECTOR but is still PENDING or REJECTED
      const collectorRole = roles.find((r) => r.code === "COLLECTOR");
      if (allowedRoles.includes("COLLECTOR") && collectorRole) {
        if (collectorRole.verification_status === "PENDING") {
          return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF4D9] text-[#98631C] flex items-center justify-center mb-4 border border-[#F7E1A0]">
                <Clock className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-brand-900 tracking-tight">
                Permohonan Petugas: Menunggu Verifikasi
              </h2>
              <p className="text-xs text-text-secondary max-w-md mt-1.5 leading-relaxed">
                Akun Anda telah terdaftar sebagai calon Petugas Pengangkut Sampah dan sedang ditinjau oleh Operator Admin TPS3R. Operasional lapangan POS baru dapat diakses setelah status peran diverifikasi (ACTIVE).
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => router.push("/app")}
                >
                  Kembali ke Dashboard Warga
                </Button>
              </div>
            </div>
          );
        }

        if (collectorRole.verification_status === "REJECTED") {
          return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FBEAE7] text-[#A43F35] flex items-center justify-center mb-4 border border-[#F5C6BF]">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-[#A43F35] tracking-tight">
                Permohonan Petugas Belum Disetujui
              </h2>
              <p className="text-xs text-text-secondary max-w-md mt-1.5 leading-relaxed">
                Pengajuan Anda sebagai Petugas Lapangan belum dapat disetujui oleh pengurus banjar. Silakan hubungi koordinator TPS3R Banjar Sukawati untuk informasi lebih lanjut.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => router.push("/app")}
                >
                  Kembali ke Dashboard Warga
                </Button>
              </div>
            </div>
          );
        }
      }

      const targetWorkspace =
        activeRole === "ADMIN" ? "/admin" : activeRole === "COLLECTOR" ? "/staff" : "/app";

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FBEAE7] text-[#A43F35] flex items-center justify-center mb-4 border border-[#F5C6BF]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-brand-900 tracking-tight">
            Akses Ditolak (403 Forbidden)
          </h2>
          <p className="text-xs text-text-secondary max-w-md mt-1.5 leading-relaxed">
            Halaman {workspaceName} hanya dapat diakses oleh peran:{" "}
            <strong>{allowedRoles.join(" atau ")}</strong>. Akun Anda saat ini memiliki peran aktif <strong>{activeRole}</strong>.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              onClick={() => router.push(targetWorkspace)}
            >
              Kembali ke Workspace Saya
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
