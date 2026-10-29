import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  label?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<
  BadgeVariant,
  {
    bg: string;
    text: string;
    border: string;
    dotColor: string;
    defaultLabel: string;
  }
> = {
  success: {
    bg: "bg-[#E7F4EA]",
    text: "text-[#276749]",
    border: "border-[#BCE1C7]",
    dotColor: "bg-[#276749]",
    defaultLabel: "Selesai",
  },
  warning: {
    bg: "bg-[#FFF4D9]",
    text: "text-[#98631C]",
    border: "border-[#F7E1A0]",
    dotColor: "bg-[#98631C]",
    defaultLabel: "Menunggu",
  },
  danger: {
    bg: "bg-[#FBEAE7]",
    text: "text-[#A43F35]",
    border: "border-[#F5C6BF]",
    dotColor: "bg-[#A43F35]",
    defaultLabel: "Dibatalkan",
  },
  info: {
    bg: "bg-[#EAF2F9]",
    text: "text-[#315F86]",
    border: "border-[#BDD8EF]",
    dotColor: "bg-[#315F86]",
    defaultLabel: "Diajukan",
  },
  neutral: {
    bg: "bg-[#EFF2F0]",
    text: "text-[#5D6B63]",
    border: "border-[#DCE3DD]",
    dotColor: "bg-[#7E8C84]",
    defaultLabel: "Draf",
  },
};

export function StatusBadge({
  variant = "neutral",
  dot = true,
  label,
  size = "md",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const config = variantStyles[variant];
  const content = children || label || config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2 py-0.5 text-xs gap-1.5" : "px-2.5 py-1 text-xs gap-1.5",
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            config.dotColor,
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
          )}
          aria-hidden="true"
        />
      )}
      <span>{content}</span>
    </span>
  );
}

/**
 * Helper otomatis memetakan string status backend ke BadgeVariant yang tepat
 */
export function getStatusBadgeConfig(statusStr: string): {
  variant: BadgeVariant;
  label: string;
} {
  const normalized = (statusStr || "").toLowerCase().trim();

  switch (normalized) {
    case "completed":
    case "selesai":
    case "verified":
    case "terverifikasi":
    case "active":
    case "aktif":
    case "clean":
    case "bersih":
    case "diterima":
      return { variant: "success", label: "Selesai" };

    case "pending":
    case "diajukan":
    case "submitted":
      return { variant: "info", label: "Diajukan" };

    case "confirmed":
    case "dikonfirmasi":
    case "scheduled":
    case "terjadwal":
      return { variant: "info", label: "Terjadwal" };

    case "in_progress":
    case "picked_up":
    case "dijemput":
    case "diproses":
    case "sedang_berlangsung":
    case "assigned":
      return { variant: "warning", label: "Dalam Penjemputan" };

    case "cancelled":
    case "dibatalkan":
    case "rejected":
    case "ditolak":
    case "failed":
    case "gagal":
    case "kotor":
      return { variant: "danger", label: "Dibatalkan" };

    default:
      return { variant: "neutral", label: statusStr || "Tidak Diketahui" };
  }
}
