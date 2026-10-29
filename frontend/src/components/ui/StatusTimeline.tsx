import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle } from "lucide-react";

export interface TimelineStep {
  title: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming" | "error";
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function StatusTimeline({ steps, className }: StatusTimelineProps) {
  return (
    <div className={cn("flow-root", className)}>
      <ul className="-mb-8">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <li key={idx} className="relative pb-8">
              {!isLast && (
                <span
                  className={cn(
                    "absolute top-4 left-4 -ml-px h-full w-0.5",
                    step.status === "completed" ? "bg-[#276749]" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3.5">
                <div>
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-surface text-xs font-semibold",
                      step.status === "completed" && "bg-[#276749] text-white",
                      step.status === "current" &&
                        "bg-[#315F86] text-white ring-blue-100",
                      step.status === "upcoming" &&
                        "bg-[#EFF2F0] text-text-secondary border border-border",
                      step.status === "error" && "bg-[#A43F35] text-white"
                    )}
                  >
                    {step.status === "completed" ? (
                      <Check className="w-4 h-4" />
                    ) : step.status === "current" ? (
                      <Clock className="w-4 h-4 animate-pulse" />
                    ) : step.status === "error" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        step.status === "current"
                          ? "text-[#315F86]"
                          : step.status === "completed"
                          ? "text-brand-900"
                          : "text-text-secondary"
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {step.description}
                      </p>
                    )}
                  </div>
                  {step.timestamp && (
                    <div className="text-right text-xs whitespace-nowrap text-text-secondary font-mono">
                      {step.timestamp}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
