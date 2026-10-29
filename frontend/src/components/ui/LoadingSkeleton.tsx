import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "card" | "table-row";
}

export function LoadingSkeleton({
  variant = "rectangular",
  className,
  ...props
}: LoadingSkeletonProps) {
  if (variant === "text") {
    return (
      <div
        className={cn(
          "h-4 w-full bg-[#E5EAE6] animate-pulse rounded",
          className
        )}
        {...props}
      />
    );
  }

  if (variant === "circular") {
    return (
      <div
        className={cn(
          "w-10 h-10 rounded-full bg-[#E5EAE6] animate-pulse",
          className
        )}
        {...props}
      />
    );
  }

  if (variant === "table-row") {
    return (
      <div className="flex items-center space-x-4 py-3 border-b border-border animate-pulse">
        <div className="h-4 w-24 bg-[#E5EAE6] rounded" />
        <div className="h-4 w-40 bg-[#E5EAE6] rounded flex-1" />
        <div className="h-4 w-16 bg-[#E5EAE6] rounded" />
        <div className="h-6 w-20 bg-[#E5EAE6] rounded-full" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-5 rounded-xl border border-border bg-surface space-y-3 animate-pulse",
          className
        )}
        {...props}
      >
        <div className="h-3 w-24 bg-[#E5EAE6] rounded" />
        <div className="h-7 w-36 bg-[#E5EAE6] rounded" />
        <div className="h-3 w-48 bg-[#E5EAE6] rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn("bg-[#E5EAE6] animate-pulse rounded-lg", className)}
      {...props}
    />
  );
}
