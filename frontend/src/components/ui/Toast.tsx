"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (
    toastOrType: Omit<ToastItem, "id"> | ToastType,
    title?: string,
    message?: string,
    duration?: number
  ) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      toastOrType: Omit<ToastItem, "id"> | ToastType,
      title?: string,
      message?: string,
      duration: number = 4000
    ) => {
      let item: Omit<ToastItem, "id">;
      if (typeof toastOrType === "string") {
        item = { type: toastOrType, title: title || "", message, duration };
      } else {
        item = toastOrType;
      }
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, ...item }]);

      const finalDuration = item.duration !== undefined ? item.duration : 4000;
      if (finalDuration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, finalDuration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "success", title, message }),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "error", title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "warning", title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "info", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, success, error, warning, info }}
    >
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const iconConfig = {
            success: <CheckCircle2 className="w-5 h-5 text-[#276749]" />,
            warning: <AlertTriangle className="w-5 h-5 text-[#98631C]" />,
            error: <AlertCircle className="w-5 h-5 text-[#A43F35]" />,
            info: <Info className="w-5 h-5 text-[#315F86]" />,
          };

          const borderColors = {
            success: "border-[#BCE1C7] bg-[#F3F9F5]",
            warning: "border-[#F7E1A0] bg-[#FFFBF0]",
            error: "border-[#F5C6BF] bg-[#FDF8F7]",
            info: "border-[#BDD8EF] bg-[#F4F8FC]",
          };

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-interactive animate-toast-enter transition-all duration-fast ease-soft",
                borderColors[toast.type]
              )}
            >
              <div className="shrink-0">{iconConfig[toast.type]}</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-text-primary">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-xs text-text-secondary mt-0.5">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-black/5 active:scale-[0.92] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan dalam ToastProvider");
  }
  return context;
}
