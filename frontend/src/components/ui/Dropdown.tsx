"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isDestructive?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "left",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          const item = items[focusedIndex];
          if (!item.disabled && item.onClick) {
            item.onClick();
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        }
        break;
      case "Tab":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left", className)}
      onKeyDown={handleKeyDown}
    >
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer inline-flex items-center"
      >
        {trigger}
      </div>

      {isOpen && (
        <ul
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-40 mt-1.5 w-52 rounded-xl border border-border bg-surface p-1 shadow-popover animate-scale-in focus:outline-none",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, index) => {
            const isFocused = focusedIndex === index;
            return (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled && item.onClick) {
                      item.onClick();
                      setIsOpen(false);
                      setFocusedIndex(-1);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors duration-fast",
                    item.disabled
                      ? "opacity-40 cursor-not-allowed"
                      : isFocused
                      ? "bg-kedas-sage-100 text-brand-900"
                      : "text-text-primary hover:bg-black/5 active:bg-black/10",
                    item.isDestructive &&
                      !item.disabled &&
                      "text-[#A43F35] hover:bg-[#FDF8F7] hover:text-[#A43F35]"
                  )}
                >
                  {item.icon && (
                    <span className="shrink-0 w-4 h-4 text-text-secondary">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
