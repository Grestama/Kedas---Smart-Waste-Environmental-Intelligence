"use client";

import React from "react";
import { FileBarChart2, Download, Printer, Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { mockAdminStats } from "@/mocks/previewData";
import { formatWeightKg } from "@/tokens";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Operasional & Analisis Lingkungan"
        description="Ringkasan berkala performa pengelolaan sampah banjar untuk rapat paruman dan dinas lingkungan hidup."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Laporan & Dampak" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Cetak Dokumen
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Ekspor CSV / PDF
            </Button>
          </div>
        }
      />

      <Panel title="Ringkasan Performa Bulan Berjalan (Oktober 2026)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="text-text-secondary block font-semibold">
              Total Tonase Terkumpul
            </span>
            <span className="text-xl font-bold text-brand-900 mt-1 block">
              {formatWeightKg(mockAdminStats.totalWeightThisMonthKg)}
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 block">
              +14,2% dari bulan September
            </span>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="text-text-secondary block font-semibold">
              Tingkat Reduksi ke TPA
            </span>
            <span className="text-xl font-bold text-[#276749] mt-1 block">
              {mockAdminStats.divertedFromLandfillPct}
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 block">
              Mencapai target pilot desa
            </span>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="text-text-secondary block font-semibold">
              Partisipasi Rumah Tangga
            </span>
            <span className="text-xl font-bold text-brand-900 mt-1 block">
              184 KK (74%)
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 block">
              Dari 248 total KK Banjar Kaja & Tengah
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
