"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  Users,
  Tags,
  MapPin,
  Building2,
  Coins,
  BadgeDollarSign,
  FileBarChart2,
  History,
  Shield,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/Toast";
import { mockUsers } from "@/mocks/previewData";

interface NavSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export function AdminSidebar() {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "Monitoring Operasional",
      items: [
        {
          href: "/admin",
          label: "Ringkasan",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          href: "/admin/permintaan",
          label: "Permintaan Warga",
          icon: <ClipboardList className="w-4 h-4" />,
          badge: "18",
        },
        {
          href: "/admin/pengajuan-petugas",
          label: "Verifikasi Petugas",
          icon: <UserCheck className="w-4 h-4" />,
        },
        {
          href: "/admin/pengguna",
          label: "Basis Pengguna",
          icon: <Users className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Master Data & Logistik",
      items: [
        {
          href: "/admin/kategori",
          label: "Kategori Sampah",
          icon: <Tags className="w-4 h-4" />,
        },
        {
          href: "/admin/area-jadwal",
          label: "Area & Jadwal Banjar",
          icon: <MapPin className="w-4 h-4" />,
        },
        {
          href: "/admin/mitra",
          label: "Mitra & Batch Daur Ulang",
          icon: <Building2 className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Governansi & Audit",
      items: [
        {
          href: "/admin/waste-points/rules",
          label: "Aturan WastePoints",
          icon: <Coins className="w-4 h-4" />,
        },
        {
          href: "/admin/pendanaan",
          label: "Pendanaan & Sponsor",
          icon: <BadgeDollarSign className="w-4 h-4" />,
        },
        {
          href: "/admin/laporan",
          label: "Laporan & Dampak",
          icon: <FileBarChart2 className="w-4 h-4" />,
        },
        {
          href: "/admin/pengetahuan",
          label: "Basis SOP & Regulasi (RAG)",
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          href: "/admin/audit-log",
          label: "Audit Log Sistem",
          icon: <History className="w-4 h-4" />,
        },
      ],
    },
  ];

  const { user, logout } = useAuth();
  const toast = useToast();
  const adminName = user?.full_name || mockUsers.admin.name;

  const handleLogout = async () => {
    toast.info("Keluar Akun", "Anda telah keluar dari konsol admin.");
    await logout();
  };

  return (
    <aside className="w-64 bg-[#122620] text-white/90 border-r border-[#1D3F35] flex flex-col shrink-0 h-full overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1D3F35] border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-xs">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-tight">
              Kedas Admin
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              Konsol Koordinator Banjar
            </span>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {section.title}
            </h4>
            <div className="mt-1.5 space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#1D3F35] text-white font-semibold shadow-xs border-l-4 border-emerald-400 pl-2.5"
                        : "text-white/75 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-emerald-300" : "text-white/60"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
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
            </div>
          </div>
        ))}
      </div>

      {/* Admin Profile Footer & Logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-200 flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {adminName}
            </p>
            <p className="text-[10px] text-white/50 truncate">
              {user?.email || mockUsers.admin.jurisdiction}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-300 hover:bg-white/10 rounded-lg border border-rose-400/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Konsol Admin</span>
        </button>
      </div>
    </aside>
  );
}

export function AdminHeader() {
  return (
    <header className="h-14 bg-surface/95 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between sticky top-[var(--workspace-bar-height)] z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
          Supervisi Banjar Pilot Sukawati
        </span>
        <span className="text-xs text-text-secondary hidden md:inline">
          Akses Kendali Penuh & Transparansi Audit
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-text-secondary bg-canvas px-3 py-1.5 rounded-md border border-border">
          Zona: WITA (UTC+8)
        </span>
        <div className="h-6 w-px bg-border" />
        <span className="text-xs font-semibold text-brand-900 bg-brand-100 px-2.5 py-1 rounded-md">
          Role: Admin Operator
        </span>
      </div>
    </header>
  );
}
