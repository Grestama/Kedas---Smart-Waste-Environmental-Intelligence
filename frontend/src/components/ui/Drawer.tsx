"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  side?: "right" | "bottom" | "left";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  side = "right",
  size = "md",
  children,
  footer,
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0]?.focus();
          } else {
            drawerRef.current.focus();
          }
        }
      }, 50);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "unset";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClassesRight = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full",
  };

  const isBottom = side === "bottom";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
      className="fixed inset-0 z-50 flex overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#122620]/60 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex flex-col bg-surface border-border shadow-popover focus:outline-none",
          isBottom
            ? "mt-auto w-full max-h-[85vh] rounded-t-2xl border-t animate-slide-in-bottom"
            : side === "left"
            ? "mr-auto h-full w-full max-w-md border-r animate-fade-in"
            : "ml-auto h-full w-full border-l animate-slide-in-right",
          !isBottom && sizeClassesRight[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shrink-0">
          <div>
            <h2 className="text-base font-semibold text-brand-900 tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-text-secondary mt-0.5">{description}</p>
            )}
          </div>
          <IconButton
            icon={<X className="w-4 h-4" />}
            variant="ghost"
            size="sm"
            aria-label="Tutup panel"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[#FAFBF9] border-t border-border flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
