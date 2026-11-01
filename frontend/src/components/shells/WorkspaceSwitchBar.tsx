"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Globe,
  User as UserIcon,
  Truck,
  ShieldAlert,
  Building2,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function WorkspaceSwitchBar() {
  const pathname = usePathname();
  const { user, activeRole, isAuthenticated, logout } = useAuth();

  const links = [
    {
      href: "/",
      label: "Publik",
      icon: <Globe className="w-3.5 h-3.5" />,
      active:
        pathname === "/" ||
        pathname.startsWith("/panduan") ||
        pathname.startsWith("/area-layanan") ||
        pathname.startsWith("/faq") ||
        pathname.startsWith("/masuk") ||
        pathname.startsWith("/daftar"),
    },
    {
      href: "/app",
      label: "Warga Web",
      icon: <UserIcon className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/app"),
    },
    {
      href: "/staff",
      label: "Petugas",
      icon: <Truck className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/staff"),
    },
    {
      href: "/admin",
      label: "Admin",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/admin"),
    },
    {
      href: "/hospitality",
      label: "Hospitality",
      icon: <Building2 className="w-3.5 h-3.5" />,
      active: pathname.startsWith("/hospitality"),
    },
  ];

  return (
    <nav
      aria-label="Navigasi Ruang Kerja Kedas"
      className="h-[var(--workspace-bar-height)] bg-[#122620] text-white text-xs px-4 border-b border-[#1D3F35] flex items-center justify-between z-50 sticky top-0 overflow-x-auto shadow-sm gap-3 font-sans box-border"
    >
      <div className="flex items-center space-x-2 shrink-0">
        <span className="font-bold tracking-wider uppercase text-emerald-400 text-[11px]">
          Kedas
        </span>
        <span className="text-white/30" aria-hidden="true">|</span>
        {isAuthenticated && user ? (
          <span className="text-[11px] text-white/80 hidden lg:inline">
            Sesi: <strong>{user.full_name}</strong> ({activeRole})
          </span>
        ) : (
          <span className="text-white/60 text-[11px] hidden sm:inline">
            Ruang Kerja
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-fast ease-soft active:scale-[0.96] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400",
              link.active
                ? "bg-white/20 text-white font-semibold shadow-inner"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => logout()}
            title="Keluar dari sesi saat ini"
            className="ml-2 flex items-center gap-1 px-2 py-1 rounded text-[11px] text-rose-300 hover:text-white hover:bg-rose-950/80 active:scale-[0.96] transition-all duration-fast ease-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        )}
      </div>
    </nav>
  );
}
