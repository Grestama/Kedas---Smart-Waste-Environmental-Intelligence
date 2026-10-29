"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Recycle, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { register, loginAsMockRole } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [banjar, setBanjar] = useState("banjar_kaja");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreeTerms) {
      setErrorMessage("Harap setujui syarat & ketentuan pemilahan banjar.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Kata sandi harus minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await register({
        full_name: name,
        email: email || undefined,
        phone: phone || undefined,
        password,
      });

      toast.success(
        "Pendaftaran Berhasil",
        `Selamat datang di WasteLink Bali, ${newUser.full_name}!`
      );
      router.push("/app");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 0 || err.code === "NETWORK_ERROR") {
          toast.info(
            "Mode Pengujian Diaktifkan",
            "Server backend lokal belum aktif. Mendaftarkan akun dalam mode simulasi."
          );
          loginAsMockRole("user");
          router.push("/app");
          return;
        }
        setErrorMessage(err.message || "Gagal mendaftarkan akun. Periksa data Anda.");
      } else {
        setErrorMessage("Terjadi kesalahan sistem saat registrasi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-900 text-white flex items-center justify-center mx-auto mb-3">
            <Recycle className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-brand-900 tracking-tight">
            Pendaftaran Warga Desa
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Bergabunglah dalam program pemilahan sampah banjar pilot WasteLink Bali
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-[#FBEAE7] border border-[#F5C6BF] text-[#A43F35] text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Gagal Mendaftar</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Sesuai KTP"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: I Wayan Sudarsana"
          />

          <Input
            label="Alamat Email Aktif"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
          />

          <Input
            label="Nomor WhatsApp / HP"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="081234567890"
            helperText="Untuk konfirmasi penjemputan oleh petugas TPS3R"
          />

          <Select
            label="Wilayah Banjar / Desa Pilot"
            required
            value={banjar}
            onChange={(e) => setBanjar(e.target.value)}
            options={[
              { value: "banjar_kaja", label: "Banjar Kaja — Desa Sukawati" },
              { value: "banjar_tengah", label: "Banjar Tengah — Desa Sukawati" },
              { value: "banjar_kelod", label: "Banjar Kelod — Desa Sukawati (Segera)" },
            ]}
          />

          <Input
            label="Kata Sandi (Minimal 8 Karakter)"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="pt-2">
            <Checkbox
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              label="Saya berkomitmen memilah sampah dari rumah"
              description="Mematuhi standar kebersihan sampah, batas kontaminasi, dan jadwal penjemputan banjar."
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Daftar & Buat Akun Warga
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-secondary">
          Sudah memiliki akun?{" "}
          <Link href="/masuk" className="font-semibold text-brand-700 hover:text-brand-900">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
