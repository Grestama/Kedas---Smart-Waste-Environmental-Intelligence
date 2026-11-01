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
import { aiService, CopilotResponseData } from "@/services/ai";
import { OperationRecommendationCard, AIDataProvenance } from "@/components/ai";
import { DCLIRadarChart } from "@/components/analytics/DCLIRadarChart";
import { Sparkles } from "lucide-react";

export default function AdminReportsPage() {
  const { showToast } = useToast();

  const [report, setReport] = useState<OperationalSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Copilot State
  const [copilotData, setCopilotData] = useState<CopilotResponseData | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [activeIntent, setActiveIntent] = useState<
    "PRIORITIZE_TASKS" | "FIND_ELIGIBLE_FACILITY" | "ANOMALY_SUMMARY"
  >("PRIORITIZE_TASKS");

  const loadCopilot = async (
    intent: "PRIORITIZE_TASKS" | "FIND_ELIGIBLE_FACILITY" | "ANOMALY_SUMMARY"
  ) => {
    setActiveIntent(intent);
    setCopilotLoading(true);
    try {
      const data = await aiService.queryCopilot({ intent });
      setCopilotData(data);
    } catch {
      // Graceful fallback handled by backend
    } finally {
      setCopilotLoading(false);
    }
  };

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
    loadCopilot("PRIORITIZE_TASKS");
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

      {/* Kedas Operations Copilot Panel */}
      <Panel className="p-5 bg-gradient-to-br from-white via-indigo-50/20 to-emerald-50/20 border border-indigo-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">
                  Kedas Operations Copilot
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Read-Only Assistive
                </span>
                {copilotData && (
                  <AIDataProvenance level={copilotData.provenance} />
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Dukungan keputusan operasional berbasis aturan deterministik kapasitas dan integritas neraca massa.
              </p>
            </div>
          </div>

          {/* Intent Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => loadCopilot("PRIORITIZE_TASKS")}
              disabled={copilotLoading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                activeIntent === "PRIORITIZE_TASKS"
                  ? "bg-white text-indigo-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Prioritas Tugas
            </button>
            <button
              type="button"
              onClick={() => loadCopilot("FIND_ELIGIBLE_FACILITY")}
              disabled={copilotLoading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                activeIntent === "FIND_ELIGIBLE_FACILITY"
                  ? "bg-white text-indigo-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Kapasitas Fasilitas
            </button>
            <button
              type="button"
              onClick={() => loadCopilot("ANOMALY_SUMMARY")}
              disabled={copilotLoading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                activeIntent === "ANOMALY_SUMMARY"
                  ? "bg-white text-indigo-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Deteksi Anomali
            </button>
          </div>
        </div>

        {copilotLoading ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-indigo-700">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Copilot sedang mengevaluasi data operasional dan batasan deterministik...</span>
          </div>
        ) : copilotData ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-white/80 backdrop-blur-xs rounded-lg border border-indigo-100/80 text-xs text-stone-800 leading-relaxed">
              <p className="font-medium">{copilotData.summary}</p>
              {copilotData.data_snapshot && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-stone-100">
                  {Object.entries(copilotData.data_snapshot).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px] text-stone-700"
                    >
                      {k}: <strong>{String(v)}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {copilotData.recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {copilotData.recommendations.map((rec) => (
                  <OperationRecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onExecute={(id) => {
                      showToast("info", `Aksi '${id}' dapat dieksekusi melalui modul operasional terkait.`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Tidak ditemukan rekomendasi kritis mendesak untuk fokus operasional ini.</span>
              </div>
            )}

            <p className="text-[11px] text-stone-500 italic">
              {copilotData.disclaimer}
            </p>
          </div>
        ) : null}
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

          {/* DCLI Radar & Mass-Balance Analytics (GAP-006) */}
          <DCLIRadarChart />

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
