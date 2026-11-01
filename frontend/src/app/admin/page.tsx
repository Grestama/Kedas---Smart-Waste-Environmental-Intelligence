"use client";

import React, { useEffect, useState } from "react";
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
  RefreshCw,
  Truck,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { IconContainer } from "@/components/ui/IconContainer";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchAdminDashboard, fetchCollectorApplications } from "@/services/admin";
import { OperationalSummaryReport, CollectorApplicationResponse } from "@/types/admin";
import { formatWITA } from "@/tokens";

export default function AdminDashboardPage() {
  const [report, setReport] = useState<OperationalSummaryReport | null>(null);
  const [pendingApps, setPendingApps] = useState<CollectorApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashData, apps] = await Promise.all([
        fetchAdminDashboard(),
        fetchCollectorApplications("PENDING"),
      ]);
      setReport(dashData);
      setPendingApps(apps);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat metrik dashboard admin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Konsol Supervisi Banjar Pilot"
          description="Memuat metrik operasional dan ekonomi sirkular real-time..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Konsol Supervisi Banjar Pilot"
          description="Monitoring operasional dan pengawasan banjar"
        />
        <ErrorState
          title="Gagal Memuat Dashboard Operasional"
          description={error || "Data server tidak dapat diakses."}
          onRetry={loadData}
        />
      </div>
    );
  }

  const diversionRatePct =
    report.total_estimated_weight_kg > 0
      ? Math.round(
          (report.total_verified_weight_kg / report.total_estimated_weight_kg) * 1000
        ) / 10
      : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konsol Supervisi Banjar Pilot"
        description="Monitoring terpadu operasional penjemputan TPS3R Sukawati, verifikasi timbangan digital, alur batch daur ulang, dan integritas ledger poin."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Segarkan Metrik
            </Button>
            <Link href="/admin/laporan">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              >
                Unduh Rekap CSV
              </Button>
            </Link>
          </div>
        }
      />

      {/* Pending Application Alert Banner */}
      {pendingApps.length > 0 && (
        <div className="p-4 rounded-xl bg-[#FFF4D9] border-2 border-[#F7E1A0] text-[#98631C] flex items-center justify-between gap-3 shadow-xs hover:border-[#98631C]/50 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#98631C]" />
            <div className="text-xs">
              <p className="font-bold">
                Terdapat {pendingApps.length} Permohonan Petugas Baru Menunggu Verifikasi
              </p>
              <p className="text-[#7A4E12]">
                Calon petugas belum dapat mengakses terminal operasional sebelum disetujui oleh Operator Admin.
              </p>
            </div>
          </div>
          <Link href="/admin/pengajuan-petugas">
            <Button variant="secondary" size="sm">
              Tinjau Sekarang &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Setoran Selesai"
          value={report.pickups_completed}
          unit="Setoran"
          hint={`Dari ${report.total_pickups} total permohonan`}
          icon={<ClipboardList className="w-5 h-5 text-brand-700" />}
        />
        <StatCard
          label="Total Tonase Fisik Bersih"
          value={report.total_verified_weight_kg.toFixed(2)}
          unit="kg"
          hint={`Estimasi awal: ${report.total_estimated_weight_kg} kg`}
          icon={<Scale className="w-5 h-5 text-brand-900" />}
        />
        <StatCard
          label="Tersalur ke Industri Mitra"
          value={report.total_received_weight_kg.toFixed(2)}
          unit="kg"
          hint={`Selisih susut: ${report.total_weight_discrepancy_kg} kg`}
          icon={<Recycle className="w-5 h-5 text-[#2E6B4F]" />}
        />
        <StatCard
          label="Poin Beredar di Warga"
          value={report.net_points_in_circulation.toLocaleString("id-ID")}
          unit="Pts"
          hint={`Kapasitas sisa: ${report.funding_remaining_capacity.toLocaleString("id-ID")} Pts`}
          icon={<Coins className="w-5 h-5 text-[#98631C]" />}
        />
      </div>

      {/* Category Breakdown & Circular Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Material Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <Panel className="p-5 bg-surface rounded-2xl border-2 border-border/80 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-brand-900">
                  Komposisi Material Terpilah TPS3R (Berdasarkan Berat Nyata)
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Data fisik tervalidasi dari timbangan digital petugas di pos banjar.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-brand-700">
                Total: {report.total_verified_weight_kg.toFixed(2)} kg
              </span>
            </div>

            <div className="space-y-3">
              {report.category_metrics.map((cat) => (
                <div key={cat.category_code} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-primary">{cat.category_name}</span>
                    <span className="text-brand-900 font-mono">
                      {cat.verified_weight_kg.toFixed(2)} kg ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-canvas rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-brand-700 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span>Zona Waktu Operasional: {report.timezone}</span>
              <Link
                href="/admin/kategori"
                className="font-bold text-brand-700 hover:text-brand-900"
              >
                Kelola Master Kategori &rarr;
              </Link>
            </div>
          </Panel>

          {/* Quick Shortcuts to Admin Operational Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Panel interactive className="p-4 bg-surface border-2 border-border hover:border-brand-800 transition-colors">
              <div className="flex items-start gap-3">
                <IconContainer variant="brand" size="md">
                  <Truck className="w-5 h-5 text-white" />
                </IconContainer>
                <div className="space-y-1 flex-1 text-xs">
                  <h4 className="font-bold text-text-primary text-sm">
                    Mitra Daur Ulang & Batch
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    Bentuk batch material dari setoran selesai dan kirim ke mitra industri.
                  </p>
                  <Link
                    href="/admin/mitra"
                    className="pt-1.5 font-bold text-brand-700 inline-block hover:underline"
                  >
                    Buka Marketplace Sirkular &rarr;
                  </Link>
                </div>
              </div>
            </Panel>

            <Panel interactive className="p-4 bg-surface border-2 border-border hover:border-brand-800 transition-colors">
              <div className="flex items-start gap-3">
                <IconContainer variant="brand" size="md">
                  <History className="w-5 h-5 text-white" />
                </IconContainer>
                <div className="space-y-1 flex-1 text-xs">
                  <h4 className="font-bold text-text-primary text-sm">
                    Audit Log Penelusuran
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    Inspeksi rekaman mutasi poin, aksi penimbangan, dan perubahan status pengguna.
                  </p>
                  <Link
                    href="/admin/audit-log"
                    className="pt-1.5 font-bold text-brand-700 inline-block hover:underline"
                  >
                    Buka Audit Log &rarr;
                  </Link>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Right Column (1 Col): Budget & Funding Integrity */}
        <div className="space-y-6">
          <Panel className="p-5 bg-surface rounded-2xl border-2 border-border/80 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Integritas Finansial
              </span>
              <h3 className="text-sm font-bold text-brand-900 mt-0.5">
                Kapasitas Budget WastePoints
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Total Dana Pilot:</span>
                <span className="font-bold text-text-primary font-mono">
                  Rp {report.funding_budget_total_idr.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Kapasitas Poin Maksimal:</span>
                <span className="font-bold text-text-primary font-mono">
                  {report.funding_points_capacity.toLocaleString("id-ID")} Pts
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Poin Telah Diterbitkan:</span>
                <span className="font-bold text-brand-700 font-mono">
                  {report.funding_points_disbursed.toLocaleString("id-ID")} Pts
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Sisa Kapasitas Cadangan:</span>
                <span className="font-bold text-[#2E6B4F] font-mono">
                  {report.funding_remaining_capacity.toLocaleString("id-ID")} Pts
                </span>
              </div>
            </div>

            <div className="p-3 bg-canvas rounded-lg border border-border text-[11px] text-text-muted leading-relaxed">
              * Aturan reward terikat pada versi aturan per kategori. Petugas lapangan tidak memiliki izin menambah atau memotong saldo di luar penimbangan fisik.
            </div>

            <Link href="/admin/pendanaan" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full">
                Lihat Detail Pendanaan & Poin
              </Button>
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}
