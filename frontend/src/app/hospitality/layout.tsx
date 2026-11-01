"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Hotel,
  LayoutDashboard,
  ClipboardPen,
  FileBarChart2,
  QrCode,
  AlertTriangle,
  Leaf,
  ChevronDown,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";
import { EcoGuideWidget } from "@/components/ai/EcoGuideWidget";

interface HospitalityTenant {
  id: string;
  name: string;
  type: string;
  area: string;
  cdoaNo: string;
  dailyQuotaKg: number;
}

const SAMPLE_TENANTS: HospitalityTenant[] = [
  {
    id: "org-alila-ubud",
    name: "Alila Ubud Resort & Spa",
    type: "Resort Hotel (5-Star)",
    area: "Desa Payangan / Ubud, Gianyar",
    cdoaNo: "CDOA-HOREKA-ALILA-2026",
    dailyQuotaKg: 850,
  },
  {
    id: "org-maya-sanur",
    name: "Maya Sanur Resort",
    type: "Luxury Beach Resort",
    area: "Sanur Kauh, Denpasar Selatan",
    cdoaNo: "CDOA-HOREKA-MAYA-2026",
    dailyQuotaKg: 650,
  },
  {
    id: "org-kayumanis-ubud",
    name: "Kayumanis Ubud Private Villa",
    type: "Boutique Villa",
    area: "Sayan, Ubud, Gianyar",
    cdoaNo: "CDOA-HOREKA-KAYUMANIS-2026",
    dailyQuotaKg: 400,
  },
];

export default function HospitalityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [selectedTenant, setSelectedTenant] = useState<HospitalityTenant>(SAMPLE_TENANTS[0]);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);

  const navItems = [
    {
      href: "/hospitality",
      label: "Ringkasan Operasional",
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      href: "/hospitality/setoran",
      label: "Catat Timbulan Harian",
      icon: <ClipboardPen className="w-4 h-4" />,
    },
    {
      href: "/hospitality/esg",
      label: "Laporan ESG & Karbon",
      icon: <FileBarChart2 className="w-4 h-4" />,
    },
    {
      href: "/hospitality/guest-companion",
      label: "Guest Companion (QR)",
      icon: <QrCode className="w-4 h-4" />,
    },
    {
      href: "/hospitality/lapor",
      label: "Lapor Kawasan (EcoLoop)",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-brand-950 font-sans">
      {/* Top Hospitality Navbar */}
      <header className="bg-surface/95 backdrop-blur-sm border-b border-border sticky top-[var(--workspace-bar-height)] z-30 shadow-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Workspace Tag */}
          <div className="flex items-center gap-3">
            <Link href="/hospitality" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-xs group-hover:bg-[#152e27] transition-colors">
                <Hotel className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-base text-brand-900 tracking-tight leading-none block">
                  Kedas Hospitality
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block mt-0.5">
                  Green Tourism & HOREKA Workspace
                </span>
              </div>
            </Link>

            <div className="h-6 w-px bg-border hidden sm:block" />

            {/* Tenant Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isTenantDropdownOpen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-100 hover:bg-[#D7E4D9] border-2 border-border/80 text-xs font-semibold text-brand-900 transition-all duration-fast shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-700" />
                <span className="max-w-[150px] sm:max-w-[200px] truncate">{selectedTenant.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              {isTenantDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-surface border-2 border-border shadow-popover p-2.5 z-50 animate-scale-in">
                  <div className="text-[10px] uppercase font-bold text-text-secondary px-2.5 py-1 tracking-wider">
                    Pilih Entitas Usaha HOREKA
                  </div>
                  <div className="space-y-1 mt-1">
                    {SAMPLE_TENANTS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTenant(t);
                          setIsTenantDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all duration-fast flex flex-col gap-0.5 ${
                          t.id === selectedTenant.id
                            ? "bg-brand-100 text-brand-900 font-bold border-2 border-brand-900/30"
                            : "hover:bg-[#F3F5F3] text-text-primary border border-transparent"
                        }`}
                      >
                        <div className="font-bold truncate text-brand-900">{t.name}</div>
                        <div className="text-[11px] text-text-secondary flex justify-between">
                          <span>{t.type}</span>
                          <span>Kuota: {t.dailyQuotaKg} kg/hari</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F4EA] text-[#276749] text-[11px] font-semibold border border-[#BCE1C7]">
              <Leaf className="w-3.5 h-3.5 text-[#276749]" />
              <span>Sertifikasi Hijau: ESG Tier 1</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono bg-[#E8F0E9] px-2.5 py-1 rounded-xl border border-border">
              <Clock className="w-3.5 h-3.5 text-brand-700" />
              <span>WITA (UTC+8)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-border/80 bg-surface/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-brand-900 text-white shadow-xs"
                      : "text-text-secondary hover:text-brand-900 hover:bg-sand-100"
                  }`}
                >
                  <span className={isActive ? "text-emerald-300" : "text-text-muted"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating EcoGuide Widget with Tourism / Hospitality context */}
      <EcoGuideWidget
        destinationName={selectedTenant.name}
        initialPrompts={[
          "Bagaimana standar pemilahan sisa makanan dapur hotel?",
          "Berapa sisa kuota penjemputan harian CDOA hotel kami?",
          "Bagaimana cara mendapatkan sertifikat jejak karbon untuk tamu?",
        ]}
      />
    </div>
  );
}
