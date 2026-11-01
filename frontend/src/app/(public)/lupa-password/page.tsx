"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  ArrowLeft,
  PhoneCall,
  Building2,
  CheckCircle2,
  AlertCircle,
  Send,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage("Silakan masukkan alamat email atau nomor WhatsApp terdaftar.");
      return;
    }

    // Basic email or phone validation
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const isPhone = /^[0-9+()-\s]{9,16}$/.test(trimmed);

    if (!isEmail && !isPhone) {
      setErrorMessage("Format email atau nomor telepon tidak valid. Periksa kembali.");
      return;
    }

    setIsSubmitting(true);
    // Simulate safe password reset token dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6 text-brand-800" />
          </div>
          <h1 className="text-xl font-bold text-brand-900 tracking-tight">
            Pemulihan Kata Sandi Kedas
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Masukkan email atau nomor HP akun warga Anda untuk instruksi pemulihan.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instruksi Pemulihan Terkirim</span>
              </div>
              <p className="leading-relaxed">
                Jika akun dengan pengenal <strong>{identifier}</strong> terdaftar di sistem Kedas,
                tautan reset kata sandi atau kode verifikasi telah dikirimkan ke kontak Anda.
              </p>
              <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-700">
                <strong>Catatan Lingkungan Demo / Hackathon:</strong> Untuk akun demo (misal:{" "}
                <em>wayan.sudarsana@example.com</em>), silakan gunakan kata sandi demo resmi:{" "}
                <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">warga123!@#</code>.
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setIdentifier("");
              }}
            >
              Kirim Ulang Permintaan
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Email atau Nomor WhatsApp Terdaftar"
              placeholder="nama@email.com atau 08123456789"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isSubmitting}
              autoComplete="username"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Kirim Tautan Pemulihan
            </Button>
          </form>
        )}

        {/* Community Secretariat Fallback SOP */}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-brand-700" />
            <span>Verifikasi Langsung di Banjar</span>
          </div>
          <div className="p-3.5 rounded-xl bg-canvas border border-border text-[11px] text-text-secondary space-y-2">
            <div className="flex items-start gap-2">
              <Building2 className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
              <span>
                <strong>Pos TPS3R Banjar Sukawati:</strong> Gedung Kompos Banjar Kaja (Senin–Sabtu, 08:00–15:00 WITA).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
              <span>
                <strong>Hotline Koordinator:</strong> WhatsApp 0812-3456-7890 (Format: <em>Reset Sandi - [Nama Lengkap]</em>).
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/masuk"
            className="text-xs font-semibold text-brand-800 hover:text-brand-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
