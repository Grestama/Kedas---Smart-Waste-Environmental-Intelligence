"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Truck,
  ClipboardList,
  CheckCircle2,
  Scale,
  ShieldCheck,
  User as UserIcon,
  Clock,
  Radio,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/Toast";
import { mockUsers } from "@/mocks/previewData";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StaffSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const toast = useToast();

  const collectorName = user?.full_name || mockUsers.petugas.name;
  const baseStation = mockUsers.petugas.baseStation;
  const activeShift = mockUsers.petugas.activeShift;

  const navItems = [
    {
      href: "/staff",
      label: "Meja Operasional",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      href: "/staff/tugas/tersedia",
      label: "Antrean Tugas Tersedia",
      icon: <Truck className="w-4 h-4" />,
      badge: "2",
    },
    {
      href: "/staff/tugas/saya",
      label: "Tugas Sedang Aktif",
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: "1",
    },
    {
      href: "/staff/riwayat",
      label: "Riwayat & Log Timbang",
      icon: <Scale className="w-4 h-4" />,
    },
    {
      href: "/staff/panduan-keselamatan",
      label: "Panduan APD & K3",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      href: "/staff/profil",
      label: "Profil & Kendaraan",
      icon: <UserIcon className="w-4 h-4" />,
    },
  ];

  const handleLogout = async () => {
    toast.info("Keluar Akun", "Anda telah keluar dari POS petugas.");
    await logout();
  };

  return (
    <aside className="w-64 bg-[#1E2A25] text-white/90 border-r border-[#15201C] flex flex-col shrink-0 min-h-screen">
      {/* Pos Station Info */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            POS
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-tight">
              {baseStation}
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono mt-0.5">
              Meja POS Collector Desk
            </span>
          </div>
        </div>
      </div>

      {/* Shift status card */}
      <div className="px-4 py-3 bg-black/20 mx-3 my-3 rounded-lg border border-white/10">
        <div className="flex items-center justify-between text-xs text-white/70 mb-1">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Radio className="w-3 h-3 animate-pulse" /> Petugas Aktif
          </span>
          <span className="font-mono text-[11px]">{activeShift}</span>
        </div>
        <p className="text-xs text-white/90 font-medium truncate">
          {collectorName}
        </p>
        <p className="text-[10px] text-white/60 truncate">
          Wilayah: {mockUsers.petugas.assignedBanjar}
        </p>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-700/80 text-white font-semibold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-white" : "text-white/60"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
                    isActive
                      ? "bg-white text-emerald-800"
                      : "bg-white/10 text-emerald-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout button & Safety Notice in Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-300 hover:bg-white/10 rounded-lg border border-rose-400/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi POS</span>
        </button>

        <div className="text-[11px] text-white/60 pt-1 border-t border-white/10">
          <p className="flex items-center gap-1.5 text-amber-300 font-semibold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Standar APD Wajib
          </p>
          <p>Gunakan sarung tangan tebal dan sepatu boot saat menimbang.</p>
        </div>
      </div>
    </aside>
  );
}

export function StaffHeader() {
  const { user } = useAuth();
  const collectorName = user?.full_name || mockUsers.petugas.name;
  const initials = getInitials(collectorName);

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-8 z-30">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
          Terminal Lapangan Online
        </span>
        <span className="text-xs text-text-secondary hidden md:inline">
          Sinkronisasi Otomatis Timbangan Lapangan
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 text-text-secondary font-mono bg-canvas px-3 py-1.5 rounded-md border border-border">
          <Clock className="w-3.5 h-3.5 text-brand-700" />
          <span>WITA (Asia/Makassar)</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-semibold text-xs">
            {initials}
          </div>
          <div className="text-left hidden md:block">
            <span className="text-xs font-semibold text-text-primary block leading-none">
              {collectorName}
            </span>
            <span className="text-[10px] text-text-secondary block mt-0.5">
              Kolektor Banjar Pilot
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
