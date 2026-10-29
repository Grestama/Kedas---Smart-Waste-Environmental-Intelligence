import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, PhoneCall, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6 text-amber-700" />
        </div>

        <h1 className="text-xl font-bold text-brand-900 tracking-tight">
          Pemulihan Kata Sandi Akun
        </h1>

        <div className="mt-4 p-4 rounded-xl bg-[#FAFBF9] border border-border text-left space-y-3">
          <p className="text-xs text-text-primary leading-relaxed">
            Untuk menjaga integritas saldo WastePoints dan keamanan akun warga, pemulihan akun dilakukan melalui verifikasi identitas resmi di pos koordinasi banjar:
          </p>

          <div className="space-y-2 text-xs text-text-secondary">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
              <span>
                <strong>Sekretariat TPS3R Banjar Sukawati:</strong> Gedung Kompos Banjar Kaja (Senin - Sabtu, 08:00 - 15:00 WITA).
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
              <span>
                <strong>Hotline Koordinator:</strong> WhatsApp 0812-3456-7890 (Ketik: <em>Lupa Password - [Nama Lengkap]</em>).
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link href="/masuk">
            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali ke Halaman Masuk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
