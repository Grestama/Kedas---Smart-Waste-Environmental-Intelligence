"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Globe, User, Smartphone, Truck, ShieldAlert } from "lucide-react";

export function WorkspaceSwitchBar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Portal Publik",
      icon: <Globe className="w-3.5 h-3.5" />,
      active: pathname === "/" || pathname.startsWith("/panduan") || pathname.startsWith("/masuk") || pathname.startsWith("/daftar"),
    },
    {
      href: "/app",
      label: "Warga (Web)",
      icon: <User className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/app"),
    },
    {
      href: "/mobile",
      label: "Warga (Mobile Simulator)",
      icon: <Smartphone className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/mobile"),
    },
    {
      href: "/staff",
      label: "Petugas / Collector (POS)",
      icon: <Truck className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/staff"),
    },
    {
      href: "/admin",
      label: "Admin / Operator",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/admin"),
    },
  ];

  return (
    <div className="bg-[#152e27] text-white text-xs py-1.5 px-4 border-b border-[#244b3f] flex items-center justify-between z-50 sticky top-0 overflow-x-auto shadow-sm">
      <div className="flex items-center space-x-2 shrink-0 mr-4">
        <span className="font-bold tracking-wider uppercase text-emerald-400 text-[11px]">
          WasteLink Bali
        </span>
        <span className="text-white/40">|</span>
        <span className="text-white/70 hidden sm:inline text-[11px]">
          Pratinjau Navigasi Multi-Workspace
        </span>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
              link.active
                ? "bg-white/20 text-white font-semibold shadow-inner"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
