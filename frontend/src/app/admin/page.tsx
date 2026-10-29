"use client";

import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  Scale,
  Users,
  Building2,
  Recycle,
  ArrowRight,
  TrendingUp,
  Coins,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { mockAdminStats, mockRequests } from "@/mocks/previewData";
import { formatWITA, formatWeightKg } from "@/tokens";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Konsol Supervisi Banjar Pilot"
        description="Monitoring terpadu operasional penjemputan, verifikasi timbangan TPS3R, dan aliran material sirkular."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/permintaan">
              <Button variant="secondary" size="sm">
                Lihat Semua Permintaan
              </Button>
            </Link>
            <Link href="/admin/laporan">
              <Button variant="primary" size="sm">
                Unduh Rekap Laporan
              </Button>
            </Link>
          </div>
        }
      />

      {/* Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Permintaan Aktif Hari Ini"
          value={mockAdminStats.activeRequestsToday}
          highlight
          icon={<ClipboardList className="w-5 h-5 text-white" />}
          hint="Banjar Kaja & Tengah"
        />
        <StatCard
          label="Total Tonase Terkumpul"
          value={formatWeightKg(mockAdminStats.totalWeightThisMonthKg)}
          icon={<Scale className="w-5 h-5 text-brand-700" />}
          hint="Bulan Oktober 2026"
        />
        <StatCard
          label="Tereduksi dari TPA"
          value={mockAdminStats.divertedFromLandfillPct}
          icon={<Recycle className="w-5 h-5 text-emerald-700" />}
          hint="Target minimal desa: 70%"
        />
        <StatCard
          label="Batch Daur Ulang Terverifikasi"
          value={mockAdminStats.verifiedBatches}
          icon={<Building2 className="w-5 h-5 text-amber-700" />}
          hint="Siap kirim ke mitra daur ulang"
        />
      </div>

      {/* Recent System Requests */}
      <Panel
        title="Permintaan Setoran Masuk Terkini"
        subtitle="Permintaan baru dari warga desa yang membutuhkan alokasi atau sedang dalam proses penjemputan."
        action={
          <Link href="/admin/permintaan">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Buka Manajemen Permintaan
            </Button>
          </Link>
        }
      >
        <div className="divide-y divide-border -mx-5 -my-2 text-xs">
          {mockRequests.map((req) => {
            const badge = getStatusBadgeConfig(req.status);

            return (
              <div
                key={req.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFBF9] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-900">
                      {req.id}
                    </span>
                    <StatusBadge variant={badge.variant} label={badge.label} size="sm" />
                    <span className="font-semibold text-text-primary">
                      {req.user_name}
                    </span>
                  </div>
                  <p className="text-text-secondary mt-1">
                    {req.category_name} &bull; {req.address}
                  </p>
                  <span className="text-[11px] text-text-secondary font-mono block mt-0.5">
                    Jadwal: {formatWITA(req.scheduled_at)}
                  </span>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="font-bold text-brand-900 text-sm block">
                    {req.actual_weight
                      ? formatWeightKg(req.actual_weight)
                      : `Est. ${formatWeightKg(req.estimated_weight)}`}
                  </span>
                  <span className="text-[11px] text-text-secondary block">
                    {req.points_earned ? `+${req.points_earned} Poin` : "Belum ditimbang"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
