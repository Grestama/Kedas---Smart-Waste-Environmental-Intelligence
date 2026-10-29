import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  errorMessage?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, label, description, errorMessage, id, disabled, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start gap-3 text-left">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={cn(
              "peer w-4 h-4 rounded border border-border appearance-none cursor-pointer transition-colors",
              "checked:bg-brand-900 checked:border-brand-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:ring-offset-1",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
          <Check className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>

        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-sm font-medium text-text-primary cursor-pointer select-none",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-text-secondary">{description}</p>
            )}
            {errorMessage && (
              <p className="text-xs text-[#A43F35] font-medium">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
