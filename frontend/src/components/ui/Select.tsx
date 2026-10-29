import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      errorMessage,
      options = [],
      placeholder,
      id,
      disabled,
      required,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            {label}
            {required && <span className="text-[#A43F35] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            className={cn(
              "w-full h-10 pl-3.5 pr-10 text-sm rounded-lg bg-surface text-text-primary border appearance-none transition-colors",
              "disabled:bg-[#f1f3f1] disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:border-[#2f6552]",
              hasError
                ? "border-[#A43F35] focus-visible:ring-[#F5C6BF]"
                : "border-border hover:border-[#b0beb5]",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          <ChevronDown className="absolute right-3.5 w-4 h-4 pointer-events-none text-text-secondary" />
        </div>

        {hasError ? (
          <p
            id={`${selectId}-error`}
            role="alert"
            className="text-xs text-[#A43F35] font-medium"
          >
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="text-xs text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
