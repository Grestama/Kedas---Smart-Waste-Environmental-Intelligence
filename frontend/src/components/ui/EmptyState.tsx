import React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-[#FAFBF9]",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-900 mb-4">
        {icon || <Inbox className="w-6 h-6 text-brand-700" />}
      </div>
      <h3 className="text-base font-semibold text-brand-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-text-secondary max-w-md">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
