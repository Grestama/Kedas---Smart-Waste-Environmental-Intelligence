import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  variant?: "inline" | "card" | "full";
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message,
  description,
  onRetry,
  className,
  variant = "card",
}: ErrorStateProps) {
  const finalMessage =
    description ||
    message ||
    "Gagal memuat data operasional. Periksa koneksi jaringan Anda atau coba kembali beberapa saat lagi.";
  if (variant === "inline") {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-start gap-3 p-3.5 rounded-lg bg-[#FBEAE7] border border-[#F5C6BF] text-[#A43F35] text-sm",
          className
        )}
      >
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-[#A43F35]/90 mt-0.5">{finalMessage}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-semibold underline hover:no-underline ml-2 shrink-0"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-[#F5C6BF] bg-[#FDF8F7]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#FBEAE7] flex items-center justify-center text-[#A43F35] mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#A43F35] tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-text-secondary max-w-md">{finalMessage}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Muat Ulang
          </Button>
        </div>
      )}
    </div>
  );
}
