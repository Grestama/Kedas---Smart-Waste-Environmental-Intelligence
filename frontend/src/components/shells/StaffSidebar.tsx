"use client";

import React, { useState } from "react";
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
  Menu,
  X,
  MapPin,
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

export const staffNavItems = [
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

export function StaffSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const toast = useToast();

  const collectorName = user?.full_name || mockUsers.petugas.name;
  const baseStation = mockUsers.petugas.baseStation;
  const activeShift = mockUsers.petugas.activeShift;

  const handleLogout = async () => {
    toast.info("Keluar Akun", "Anda telah keluar dari POS petugas.");
    await logout();
  };

  return (
    <aside className="w-64 bg-[#122620] text-white/90 border-r border-[#1D3F35] flex flex-col shrink-0 h-full overflow-y-auto select-none">
      {/* Pos Station Info */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1D3F35] to-[#285747] border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            POS
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white block leading-tight truncate">
              {baseStation}
            </span>
            <span className="text-[11px] text-emerald-400 block font-medium mt-0.5">
              Terminal POS Kolektor
            </span>
          </div>
        </div>
      </div>

      {/* Shift status card */}
      <div className="px-3.5 py-3 bg-white/[0.04] mx-3 my-3 rounded-xl border border-white/10 shrink-0 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Petugas Aktif
          </span>
          <span className="text-[11px] text-white/60 font-medium">
            {activeShift}
          </span>
        </div>
        <p className="text-xs text-white font-semibold truncate">
          {collectorName}
        </p>
        <p className="text-[11px] text-white/60 truncate flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-400/80 shrink-0" />
          {mockUsers.petugas.assignedBanjar}
        </p>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-1 space-y-1">
        {staffNavItems.map((item) => {
          const isActive =
            item.href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-[#1D3F35] text-white font-semibold shadow-xs border-l-4 border-emerald-400 pl-2.5"
                  : "text-white/75 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? "text-emerald-300" : "text-white/60"}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                    isActive
                      ? "bg-emerald-400 text-[#122620]"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/20"
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
      <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/15 rounded-xl border border-rose-500/25 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi POS</span>
        </button>

        <div className="text-[11px] text-white/60 pt-2 border-t border-white/10 space-y-0.5">
          <p className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Standar APD Wajib
          </p>
          <p className="leading-tight text-white/50">
            Gunakan sarung tangan tebal dan sepatu boot saat menimbang.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function StaffHeader() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const collectorName = user?.full_name || mockUsers.petugas.name;
  const initials = getInitials(collectorName);

  return (
    <>
      <header className="h-14 bg-surface/95 backdrop-blur-sm border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-[var(--workspace-bar-height)] z-30 shadow-xs">
        {/* Left Side: Mobile Menu Button & Status Badge */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Buka navigasi menu petugas"
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors border border-border"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Terminal Lapangan Online
            </span>
            <span className="text-xs text-text-secondary hidden md:inline">
              Sinkronisasi Otomatis Timbangan Lapangan
            </span>
          </div>
        </div>

        {/* Right Side: Clock & Profile */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-text-secondary font-medium bg-canvas px-3 py-1.5 rounded-lg border border-border">
            <Clock className="w-3.5 h-3.5 text-brand-700" />
            <span>WITA (Asia/Makassar)</span>
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1D3F35] text-white flex items-center justify-center font-bold text-xs border border-emerald-400/30">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-semibold text-text-primary block leading-none">
                {collectorName}
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Kolektor Banjar Pilot
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[calc(var(--workspace-bar-height)+3.5rem)] z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-50 bg-[#122620] shadow-xl">
            <StaffSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
