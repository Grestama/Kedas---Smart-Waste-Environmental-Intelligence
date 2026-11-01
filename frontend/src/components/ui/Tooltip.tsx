"use client";

import React, { useState, useRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<any>;
  position?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delayMs = 300,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useId();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const childProps = children.props as Record<string, any>;
  const trigger = React.cloneElement(children, {
    "aria-describedby": isVisible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur();
      childProps.onBlur?.(e);
    },
  } as any);

  return (
    <div className="relative inline-flex items-center">
      {trigger}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-[#122620] rounded-md shadow-md pointer-events-none whitespace-nowrap animate-fade-in",
            positionClasses[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
