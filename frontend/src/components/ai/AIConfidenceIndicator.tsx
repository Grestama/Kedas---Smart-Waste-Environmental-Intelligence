"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

export type ConfidenceBand = "HIGH" | "MEDIUM" | "NEEDS_REVIEW";

interface AIConfidenceIndicatorProps {
  band: ConfidenceBand;
  score?: number; // 0.0 - 1.0 or 0 - 100
  className?: string;
  showDetails?: boolean;
}

export function AIConfidenceIndicator({
  band,
  score,
  className = "",
  showDetails = true,
}: AIConfidenceIndicatorProps) {
  const normalizedScore = score !== undefined ? (score > 1 ? score : Math.round(score * 100)) : null;

  const configs: Record<
    ConfidenceBand,
    { label: string; text: string; bg: string; border: string; icon: React.ReactNode }
  > = {
    HIGH: {
      label: "Tinggi",
      text: "text-[#276749]",
      bg: "bg-[#E7F4EA]",
      border: "border-[#BCE1C7]",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#276749]" aria-hidden="true" />,
    },
    MEDIUM: {
      label: "Sedang",
      text: "text-[#98631C]",
      bg: "bg-[#FFF4D9]",
      border: "border-[#F7E1A0]",
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#98631C]" aria-hidden="true" />,
    },
    NEEDS_REVIEW: {
      label: "Perlu Verifikasi Manusia",
      text: "text-[#A43F35]",
      bg: "bg-[#FBEAE7]",
      border: "border-[#F5C6BF]",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#A43F35]" aria-hidden="true" />,
    },
  };

  const config = configs[band] || configs.NEEDS_REVIEW;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-2xs ${className}`}
      role="status"
    >
      {config.icon}
      <span>Tingkat Keyakinan AI: <strong>{config.label}</strong></span>
      {normalizedScore !== null && showDetails && (
        <span className="opacity-80">({normalizedScore}%)</span>
      )}
    </div>
  );
}
