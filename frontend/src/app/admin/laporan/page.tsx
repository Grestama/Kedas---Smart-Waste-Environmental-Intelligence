"use client";

import React, { useEffect, useState } from "react";
import {
  FileBarChart2,
  Download,
  Calendar,
  RefreshCw,
  Scale,
  Recycle,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { fetchSummaryReport, exportReportsCsv } from "@/services/admin";
import { OperationalSummaryReport } from "@/types/admin";

export default function AdminReportsPage() {
  const { showToast } = useToast();

  const [report, setReport] = useState<OperationalSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSummaryReport(dateFrom || undefined, dateTo || undefined);
      setReport(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat laporan operasional."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csvContent = await exportReportsCsv(
        dateFrom || undefined,
        dateTo || undefined
      );

      // Trigger browser file download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `wastelink_laporan_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("success", "Berkas CSV laporan operasional berhasil diunduh.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengekspor laporan CSV.";
      showToast("error", msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Operasional & Audit Sirkular"
        description="Ringkasan performa pemilahan material, aliran ke mitra industri, dan kepatuhan akuntansi WastePoints."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Laporan & Rekap", active: true },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            disabled={isExporting}
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            {isExporting ? "Mengekspor CSV..." : "Ekspor CSV (Sanitized)"}
          </Button>
        }
      />

      {/* Date Range Filter Toolbar */}
      <Panel className="p-4 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="w-40">
              <Input
                label="Tanggal Dari"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Input
                label="Sampai Tanggal"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="pt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={loadReport}
                disabled={isLoading}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              >
                Terapkan Filter
              </Button>
            </div>
          </div>

          <div className="text-xs text-text-muted text-right">
            <span>Zona Waktu: <strong>Asia/Makassar (WITA)</strong></span>
          </div>
        </div>
      </Panel>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-48 rounded-xl" />
        </div>
      ) : error || !report ? (
        <ErrorState title="Gagal Memuat Laporan" description={error || ""} onRetry={loadReport} />
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Panel className="p-4 bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted">Total Setoran</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-brand-900 font-mono">
                  {report.total_pickups}
                </span>
                <span className="text-xs text-[#2E6B4F]">({report.pickups_completed} Selesai)</span>
              </div>
            </Panel>

            <Panel className="p-4 bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted">Berat Fisik Terverifikasi</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-brand-900 font-mono">
                  {report.total_verified_weight_kg.toFixed(2)}
                </span>
                <span className="text-xs text-text-secondary">kg</span>
              </div>
            </Panel>

            <Panel className="p-4 bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted">Diterima Industri Mitra</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-brand-900 font-mono">
                  {report.total_received_weight_kg.toFixed(2)}
                </span>
                <span className="text-xs text-[#2E6B4F]">kg</span>
              </div>
            </Panel>

            <Panel className="p-4 bg-surface border border-border">
              <span className="text-xs font-semibold text-text-muted">Net WastePoints Beredar</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-brand-900 font-mono">
                  {report.net_points_in_circulation.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-[#98631C]">Pts</span>
              </div>
            </Panel>
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Table */}
            <Panel className="p-5 bg-surface border border-border">
              <h3 className="text-sm font-bold text-brand-900 border-b border-border pb-3 mb-4">
                Rekap Berat per Kategori Material
              </h3>

              <div className="space-y-3">
                {report.category_metrics.map((cat) => (
                  <div
                    key={cat.category_code}
                    className="p-3 bg-canvas/40 rounded-lg border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-text-primary">{cat.category_name}</p>
                      <span className="font-mono text-[11px] text-text-muted">{cat.category_code}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-brand-900">
                        {cat.verified_weight_kg.toFixed(2)} kg
                      </p>
                      <span className="text-[11px] text-text-muted">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Area Breakdown Table */}
            <Panel className="p-5 bg-surface border border-border">
              <h3 className="text-sm font-bold text-brand-900 border-b border-border pb-3 mb-4">
                Rekap Penjemputan per Wilayah Layanan
              </h3>

              <div className="space-y-3">
                {report.area_metrics.map((area) => (
                  <div
                    key={area.area_code}
                    className="p-3 bg-canvas/40 rounded-lg border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-text-primary">{area.area_name}</p>
                      <span className="font-mono text-[11px] text-text-muted">{area.area_code}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-brand-900">
                        {area.verified_weight_kg.toFixed(2)} kg
                      </p>
                      <span className="text-[11px] text-text-muted">{area.total_pickups} setoran</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
