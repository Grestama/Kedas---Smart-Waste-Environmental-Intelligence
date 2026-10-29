import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      errorMessage,
      leftAddon,
      rightAddon,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {label}
            {required && <span className="text-[#A43F35] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-text-secondary">
              {leftAddon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={cn(
              "w-full h-10 px-3.5 text-sm rounded-lg bg-surface text-text-primary border transition-colors",
              "placeholder:text-text-secondary/60 disabled:bg-[#f1f3f1] disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:border-[#2f6552]",
              leftAddon ? "pl-10" : "",
              rightAddon ? "pr-10" : "",
              hasError
                ? "border-[#A43F35] focus-visible:ring-[#F5C6BF]"
                : "border-border hover:border-[#b0beb5]",
              className
            )}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 flex items-center text-text-secondary">
              {rightAddon}
            </div>
          )}
        </div>

        {hasError ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-[#A43F35] font-medium"
          >
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
