"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Tooltip } from "./Tooltip";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  "aria-label": string;
  tooltip?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      icon,
      "aria-label": ariaLabel,
      tooltip,
      variant = "ghost",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl transition-all duration-fast ease-soft active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:ring-offset-2 shrink-0 select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-brand-900 text-white hover:bg-[#152e27] active:bg-[#0f221d] shadow-sm hover:shadow-interactive",
      secondary:
        "bg-white text-text-primary border-2 border-border hover:border-brand-800 hover:bg-[#f4f6f4] shadow-2xs hover:shadow-interactive",
      soft:
        "bg-brand-100 text-brand-900 hover:bg-[#d8e6db] active:bg-[#cadacb]",
      outline:
        "border-2 border-border text-brand-900 bg-transparent hover:border-brand-800 hover:bg-brand-100/50",
      ghost:
        "bg-transparent text-text-secondary hover:text-brand-900 hover:bg-black/5 active:bg-black/10",
      danger:
        "bg-[#FBEAE7] text-[#A43F35] border border-[#F5C6BF] hover:bg-[#A43F35] hover:text-white",
    };

    const sizeStyles = {
      sm: "w-8 h-8 min-w-[32px] min-h-[32px] sm:w-9 sm:h-9 text-xs",
      md: "w-10 h-10 min-w-[40px] min-h-[40px] text-sm", // standard 40px desktop hit target
      lg: "w-12 h-12 min-w-[44px] min-h-[44px] text-base", // 44px mobile touch target
    };

    const buttonElement = (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          icon
        )}
      </button>
    );

    if (tooltip) {
      return (
        <Tooltip content={tooltip}>
          {buttonElement}
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

IconButton.displayName = "IconButton";
