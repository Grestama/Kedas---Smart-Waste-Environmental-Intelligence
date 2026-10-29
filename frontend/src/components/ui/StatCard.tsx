import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  hint?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  hint,
  trend,
  highlight = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-xl border transition-all duration-150",
        highlight
          ? "bg-brand-900 text-white border-brand-900 shadow-sm"
          : "bg-surface text-text-primary border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            highlight ? "text-brand-100" : "text-text-secondary"
          )}
        >
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              highlight
                ? "bg-white/10 text-white"
                : "bg-brand-100 text-brand-900"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div
          className={cn(
            "text-2xl font-bold tracking-tight flex items-baseline gap-1.5",
            highlight ? "text-white" : "text-brand-900"
          )}
        >
          <span>{value}</span>
          {unit && (
            <span
              className={cn(
                "text-xs font-normal",
                highlight ? "text-brand-100" : "text-text-secondary"
              )}
            >
              {unit}
            </span>
          )}
        </div>

        {(hint || trend) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive
                    ? highlight
                      ? "text-emerald-300"
                      : "text-[#276749]"
                    : highlight
                    ? "text-rose-300"
                    : "text-[#A43F35]"
                )}
              >
                {trend.value}
              </span>
            )}
            <span
              className={cn(
                highlight ? "text-brand-100/80" : "text-text-secondary"
              )}
            >
              {hint || trend?.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
