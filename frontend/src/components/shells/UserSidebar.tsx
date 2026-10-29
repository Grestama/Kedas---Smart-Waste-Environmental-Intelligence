"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  PlusCircle,
  Coins,
  BookOpen,
  Leaf,
  Bell,
  HelpCircle,
  User,
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mockUsers } from "@/mocks/previewData";

export function UserSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/app", label: "Beranda", icon: <Home className="w-4 h-4" /> },
    {
      href: "/app/setoran",
      label: "Setoran Saya",
      icon: <Package className="w-4 h-4" />,
    },
    {
      href: "/app/waste-points",
      label: "WastePoints & Poin",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      href: "/app/panduan",
      label: "Panduan Pemilahan",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      href: "/app/dampak",
      label: "Dampak Lingkungan",
      icon: <Leaf className="w-4 h-4" />,
    },
    {
      href: "/app/notifikasi",
      label: "Notifikasi",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      href: "/app/profil",
      label: "Profil & Alamat",
      icon: <User className="w-4 h-4" />,
    },
    {
      href: "/app/bantuan",
      label: "Bantuan Banjar",
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 min-h-screen">
      {/* Brand & Context */}
      <div className="p-5 border-b border-border">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center text-white">
            <Recycle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-brand-900 leading-none block">
              WasteLink Warga
            </span>
            <span className="text-[10px] text-text-secondary mt-1 block">
              {mockUsers.warga.banjar}
            </span>
          </div>
        </Link>
      </div>

      {/* Prominent "+ Buat Setoran" CTA */}
      <div className="p-4">
        <Link href="/app/setoran/baru">
          <Button
            variant="primary"
            className="w-full justify-center shadow-sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Buat Setoran Baru
          </Button>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-100 text-brand-900 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-[#F3F5F3]"
              )}
            >
              <span className={isActive ? "text-brand-900" : "text-text-secondary"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Point Balance Card in Sidebar */}
      <div className="p-4 border-t border-border">
        <div className="bg-[#FAFBF9] border border-border rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Saldo WastePoints</span>
            <Coins className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-brand-900">
            {mockUsers.warga.pointsBalance.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-text-secondary">Poin</span>
          </div>
          <Link
            href="/app/waste-points"
            className="mt-2 block text-[11px] font-semibold text-brand-700 hover:text-brand-900"
          >
            Lihat Riwayat & Poin &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function UserHeader() {
  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-8 z-30">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          Banjar Pilot Aktif
        </span>
        <span className="text-xs text-text-secondary hidden sm:inline">
          Zona Operasional: WITA (Asia/Makassar)
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/app/notifikasi"
          aria-label="Notifikasi"
          className="relative p-2 text-text-secondary hover:text-brand-900 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-surface" />
        </Link>

        <div className="h-6 w-px bg-border" />

        <Link
          href="/app/profil"
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center text-xs font-semibold">
            WS
          </div>
          <div className="text-left hidden md:block">
            <span className="text-xs font-semibold text-text-primary block leading-tight">
              {mockUsers.warga.name}
            </span>
            <span className="text-[10px] text-text-secondary block">
              Warga Terdaftar
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
