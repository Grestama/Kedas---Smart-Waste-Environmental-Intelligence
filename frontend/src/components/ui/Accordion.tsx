"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  defaultOpenId?: string;
}

export function Accordion({ items, className, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn("divide-y divide-border rounded-xl border border-border bg-white shadow-sm overflow-hidden", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="transition-colors">
            <h3>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-desc-${item.id}`}
                id={`accordion-btn-${item.id}`}
                className="w-full py-4 px-5 text-left font-semibold text-text-primary flex items-center justify-between gap-4 hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:ring-inset transition-colors"
              >
                <span className="text-sm sm:text-base">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-text-secondary shrink-0 transition-transform duration-200",
                    isOpen && "transform rotate-180 text-brand-900"
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`accordion-desc-${item.id}`}
              role="region"
              aria-labelledby={`accordion-btn-${item.id}`}
              className={cn(
                "grid transition-[grid-template-rows] duration-normal ease-standard overflow-hidden",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
