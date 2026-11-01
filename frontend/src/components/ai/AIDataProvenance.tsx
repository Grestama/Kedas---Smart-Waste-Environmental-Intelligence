"use client";

import React from "react";
import { ShieldCheck, UserCheck, Calculator, Sparkles, HelpCircle } from "lucide-react";

export type ProvenanceLevel = "VERIFIED" | "SELF_REPORTED" | "ESTIMATED" | "SIMULATED" | "UNKNOWN";

interface AIDataProvenanceProps {
  level: ProvenanceLevel;
  className?: string;
  sourceText?: string;
}

export function AIDataProvenance({ level, className = "", sourceText }: AIDataProvenanceProps) {
  const configs: Record<
    ProvenanceLevel,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    VERIFIED: {
      label: "Terverifikasi Sistem",
      bg: "bg-[#E7F4EA]",
      text: "text-[#276749]",
      border: "border-[#BCE1C7]",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#276749]" aria-hidden="true" />,
    },
    SELF_REPORTED: {
      label: "Laporan Mandiri",
      bg: "bg-[#FFF4D9]",
      text: "text-[#98631C]",
      border: "border-[#F7E1A0]",
      icon: <UserCheck className="w-3.5 h-3.5 text-[#98631C]" aria-hidden="true" />,
    },
    ESTIMATED: {
      label: "Estimasi Model",
      bg: "bg-[#EAF2F9]",
      text: "text-[#315F86]",
      border: "border-[#BDD8EF]",
      icon: <Calculator className="w-3.5 h-3.5 text-[#315F86]" aria-hidden="true" />,
    },
    SIMULATED: {
      label: "Data Demo / Simulasi",
      bg: "bg-[#E8F0E9]",
      text: "text-[#1D3F35]",
      border: "border-[#D7E4D9]",
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />,
    },
    UNKNOWN: {
      label: "Belum Terverifikasi",
      bg: "bg-[#EFF2F0]",
      text: "text-[#5D6B63]",
      border: "border-[#DCE3DD]",
      icon: <HelpCircle className="w-3.5 h-3.5 text-[#5D6B63]" aria-hidden="true" />,
    },
  };

  const config = configs[level] || configs.UNKNOWN;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
      title={sourceText || config.label}
    >
      {config.icon}
      <span>{config.label}</span>
      {sourceText && <span className="opacity-70 text-[10px]">({sourceText})</span>}
    </span>
  );
}
