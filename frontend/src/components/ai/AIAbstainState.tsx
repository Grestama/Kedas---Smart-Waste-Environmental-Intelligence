"use client";

import React from "react";
import { Info, HelpCircle, PhoneCall, ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";

interface AIAbstainStateProps {
  reason: string;
  suggestedAction?: string;
  contactChannel?: string;
  serviceDirectoryUrl?: string;
  className?: string;
}

export function AIAbstainState({
  reason,
  suggestedAction,
  contactChannel,
  serviceDirectoryUrl = "/area-layanan",
  className = "",
}: AIAbstainStateProps) {
  return (
    <div
      className={`bg-[#FAFBF9] border-2 border-border/80 rounded-2xl p-4 my-2 text-text-primary text-sm shadow-xs ${className}`}
      role="region"
      aria-label="Pemberitahuan Keterbatasan Informasi AI"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-brand-100 text-brand-900 border border-[#D7E4D9]/60 shrink-0">
          <Info className="w-4 h-4 text-brand-700" aria-hidden="true" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="font-semibold text-brand-900 flex items-center gap-1.5">
            <span>Informasi Terverifikasi Belum Tersedia</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{reason}</p>

          {suggestedAction && (
            <div className="text-xs font-medium text-text-primary bg-white p-2.5 rounded-xl border border-border flex items-start gap-1.5 shadow-2xs">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>Langkah yang disarankan:</strong> {suggestedAction}</span>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            {contactChannel && (
              <span className="inline-flex items-center gap-1 text-text-secondary">
                <PhoneCall className="w-3.5 h-3.5 text-brand-700" />
                <span>Kontak Desa/Banjar: <strong>{contactChannel}</strong></span>
              </span>
            )}
            <Link
              href={serviceDirectoryUrl}
              className="inline-flex items-center gap-1 text-brand-800 font-semibold hover:underline ml-auto"
            >
              <span>Periksa Direktori Layanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
