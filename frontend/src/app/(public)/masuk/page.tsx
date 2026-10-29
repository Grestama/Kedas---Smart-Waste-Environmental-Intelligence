"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Recycle, ArrowRight, ShieldCheck, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { mockUsers } from "@/mocks/previewData";

type RoleType = "user" | "collector" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedRole, setSelectedRole] = useState<RoleType>("user");
  const [email, setEmail] = useState("wayan.sudarsana@example.com");
  const [password, setPassword] = useState("warga123!@#");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    if (role === "user") {
      setEmail("wayan.sudarsana@example.com");
      setPassword("warga123!@#");
    } else if (role === "collector") {
      setEmail("made.collector@wastelink.bali.id");
      setPassword("collector123!@#");
    } else {
      setEmail("admin.operasional@wastelink.bali.id");
      setPassword("admin123!@#");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        "Masuk Berhasil (Pratinjau)",
        `Selamat datang kembali di WasteLink Bali sebagai ${selectedRole}.`
      );

      if (selectedRole === "user") {
        router.push("/app");
      } else if (selectedRole === "collector") {
        router.push("/staff");
      } else {
        router.push("/admin");
      }
    }, 600);
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
            <User className="w-4 h-4 mb-1" />
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Alamat Email Terdaftar"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
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

        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-secondary">
          Belum memiliki akun warga?{" "}
          <Link href="/daftar" className="font-semibold text-brand-700 hover:text-brand-900">
            Daftar Warga Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
