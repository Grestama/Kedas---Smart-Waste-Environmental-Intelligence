import React from "react";
import { cn } from "@/lib/utils";
import { iconContainerVariants, IconContainerVariant } from "@/tokens/icons";

export interface IconContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: IconContainerVariant;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function IconContainer({
  variant = "soft",
  size = "md",
  className,
  children,
  ...props
}: IconContainerProps) {
  const sizeStyles = {
    sm: "w-8 h-8 rounded-lg text-xs",
    md: "w-10 h-10 rounded-xl text-sm",
    lg: "w-12 h-12 rounded-xl text-base",
    xl: "w-14 h-14 rounded-2xl text-lg",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0 transition-transform duration-fast ease-soft",
        iconContainerVariants[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
