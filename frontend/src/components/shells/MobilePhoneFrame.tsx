"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  PlusCircle,
  Clock,
  Coins,
  User,
  Wifi,
  BatteryMedium,
  Sparkles,
} from "lucide-react";

export type MobileTab = "beranda" | "setor" | "aktivitas" | "poin" | "akun";

export interface MobilePhoneFrameProps {
  children?: React.ReactNode;
  activeTab?: MobileTab;
  onTabChange?: (tab: MobileTab) => void;
}

export function MobilePhoneFrame({
  children,
  activeTab: controlledTab,
  onTabChange,
}: MobilePhoneFrameProps) {
  const [internalTab, setInternalTab] = useState<MobileTab>("beranda");
  const currentTab = controlledTab ?? internalTab;

  const handleTabClick = (tab: MobileTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const navItems: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: "beranda", label: "Beranda", icon: <Home className="w-5 h-5" /> },
    { id: "setor", label: "Setor", icon: <PlusCircle className="w-5 h-5" /> },
    { id: "aktivitas", label: "Aktivitas", icon: <Clock className="w-5 h-5" /> },
    { id: "poin", label: "Poin", icon: <Coins className="w-5 h-5" /> },
    { id: "akun", label: "Akun", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Device frame banner note */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          Aplikasi Mobile Khusus Warga Desa (Bukan Petugas)
        </span>
        <p className="text-xs text-text-secondary mt-1">
          Petugas & Admin beroperasi menggunakan Web Desktop POS di Pos TPU.
        </p>
      </div>

      {/* Hardware Frame */}
      <div className="relative w-[375px] h-[780px] bg-black rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-white/20 flex flex-col">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#151515] mr-2" />
          <div className="w-2 h-2 rounded-full bg-[#0a1f18]" />
        </div>

        {/* Screen container */}
        <div className="relative w-full h-full bg-canvas rounded-[38px] overflow-hidden flex flex-col border border-border">
          {/* Status Bar */}
          <div className="h-11 px-6 pt-3 flex items-center justify-between text-[11px] font-semibold text-text-primary shrink-0 z-30 bg-surface/80 backdrop-blur-sm">
            <span className="font-mono">09:41 WITA</span>
            <div className="flex items-center space-x-1.5 text-text-secondary">
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4 text-brand-900" />
            </div>
          </div>

          {/* Screen Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-16">
            {children}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="absolute bottom-0 inset-x-0 h-16 bg-surface/95 backdrop-blur border-t border-border px-3 flex items-center justify-around z-30">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 py-1 rounded-lg transition-colors focus-visible:outline-none",
                    isActive
                      ? "text-brand-900 font-bold"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "p-1 rounded-md transition-all",
                      isActive && "bg-brand-100"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[10px] mt-0.5 leading-none">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full pointer-events-none z-40" />
        </div>
      </div>
    </div>
  );
}
