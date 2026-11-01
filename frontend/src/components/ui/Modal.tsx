"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      // Focus first interactive element or modal container
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0]?.focus();
          } else {
            modalRef.current.focus();
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
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
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

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-desc" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#122620]/60 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-surface rounded-2xl border-2 border-border shadow-popover z-10 overflow-hidden transform transition-all animate-scale-in focus:outline-none",
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-brand-900 tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p id="modal-desc" className="text-xs text-text-secondary mt-0.5">
                {description}
              </p>
            )}
          </div>
          <IconButton
            icon={<X className="w-4 h-4" />}
            variant="ghost"
            size="sm"
            aria-label="Tutup modal"
            onClick={onClose}
          />
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 bg-[#FAFBF9] border-t border-border flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
