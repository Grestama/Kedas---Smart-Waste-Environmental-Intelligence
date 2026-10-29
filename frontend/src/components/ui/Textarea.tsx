import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      errorMessage,
      id,
      disabled,
      required,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {label}
            {required && <span className="text-[#A43F35] ml-1">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          className={cn(
            "w-full p-3 text-sm rounded-lg bg-surface text-text-primary border transition-colors",
            "placeholder:text-text-secondary/60 disabled:bg-[#f1f3f1] disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:border-[#2f6552]",
            hasError
              ? "border-[#A43F35] focus-visible:ring-[#F5C6BF]"
              : "border-border hover:border-[#b0beb5]",
            className
          )}
          {...props}
        />

        {hasError ? (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-xs text-[#A43F35] font-medium"
          >
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="text-xs text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
