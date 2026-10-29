"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Coins,
  Scale,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockUsers, mockRequests } from "@/mocks/previewData";
import { formatWITA, formatWeightKg, formatPoints } from "@/tokens";

export default function UserDashboard() {
  const latestRequest = mockRequests[0];
  const user = mockUsers.warga;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Om Swastiastu, ${user.name}`}
        description={`${user.banjar} • Pantau setoran sampah terpilah dan kontribusi sirkular banjar Anda.`}
        actions={
          <Link href="/app/setoran/baru">
            <Button
              variant="primary"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Setor Sampah Baru
            </Button>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Saldo WastePoints"
          value={formatPoints(user.pointsBalance)}
          hint="Dapat ditukarkan di pos komposting banjar"
          icon={<Coins className="w-5 h-5 text-amber-700" />}
        />
        <StatCard
          label="Total Sampah Disetor"
          value={formatWeightKg(user.totalKgDeposited)}
          hint="Tereduksi dari pembakaran & TPA"
          icon={<Scale className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          label="Status Banjar Pilot"
          value="Sukawati Kaja"
          hint="Jadwal jemput: Senin, Rabu, Jumat"
          icon={<Calendar className="w-5 h-5 text-brand-700" />}
        />
      </div>

      {/* Active Deposit Card */}
      {latestRequest && (
        <Panel
          title="Setoran Aktif Terbaru"
          subtitle={`Nomor Permintaan: ${latestRequest.id}`}
          action={
            <Link href={`/app/setoran/${latestRequest.id}`}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Lihat Detail Status
              </Button>
            </Link>
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-canvas border border-border">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <StatusBadge
                  variant={getStatusBadgeConfig(latestRequest.status).variant}
                  label={getStatusBadgeConfig(latestRequest.status).label}
                />
                <span className="text-xs font-semibold text-text-primary">
                  {latestRequest.category_name}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Estimasi Bobot: <strong>{formatWeightKg(latestRequest.estimated_weight)}</strong> &bull; Alamat: {latestRequest.address}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-text-secondary font-medium block">
                Jadwal Penjemputan
              </span>
              <span className="text-xs font-semibold text-brand-900 block mt-0.5">
                {formatWITA(latestRequest.scheduled_at)}
              </span>
            </div>
          </div>
        </Panel>
      )}

      {/* Recent Activity Table */}
      <Panel
        title="Riwayat Setoran Terbaru"
        subtitle="Daftar setoran sampah terpilah yang telah diajukan atau selesai ditimbang."
        action={
          <Link href="/app/setoran">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Lihat Semua Setoran
            </Button>
          </Link>
        }
      >
        <div className="divide-y divide-border -mx-5 -my-2">
          {mockRequests.map((req) => {
            const badge = getStatusBadgeConfig(req.status);

            return (
              <div
                key={req.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFBF9] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-brand-900 shrink-0 mt-0.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-900">
                        {req.id}
                      </span>
                      <StatusBadge variant={badge.variant} label={badge.label} size="sm" />
                    </div>
                    <p className="text-xs font-medium text-text-primary mt-1">
                      {req.category_name} &bull; {req.pickup_type === "pickup" ? "Dijemput Petugas" : "Antar ke Pos"}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Dibuat pada {formatWITA(req.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-bold text-brand-900">
                    {req.actual_weight
                      ? formatWeightKg(req.actual_weight)
                      : `Est. ${formatWeightKg(req.estimated_weight)}`}
                  </div>
                  {req.points_earned ? (
                    <div className="text-xs font-semibold text-[#276749]">
                      +{req.points_earned} WastePoints
                    </div>
                  ) : (
                    <div className="text-[11px] text-text-secondary">
                      Menunggu timbang
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
