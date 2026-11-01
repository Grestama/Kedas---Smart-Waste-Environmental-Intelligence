import React from "react";
import { cn } from "@/lib/utils";

export interface PanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  interactive?: boolean;
}

export function Panel({
  title,
  subtitle,
  action,
  footer,
  bodyClassName,
  headerClassName,
  footerClassName,
  interactive = false,
  children,
  className,
  ...props
}: PanelProps) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-fast ease-soft",
        interactive && "card-interactive cursor-pointer border-2 hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive",
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex items-center justify-between px-5 py-4 border-b border-border bg-white",
            headerClassName
          )}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-brand-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={cn("p-5", bodyClassName)}>{children}</div>

      {footer && (
        <div
          className={cn(
            "px-5 py-3.5 bg-[#FAFBF9] border-t border-border flex items-center justify-between text-xs text-text-secondary",
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
