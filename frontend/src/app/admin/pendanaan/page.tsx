"use client";

import React, { useEffect, useState } from "react";
import { BadgeDollarSign, Building, TrendingUp, ShieldCheck, Coins, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchAdminDashboard } from "@/services/admin";
import { OperationalSummaryReport } from "@/types/admin";
import { formatIDR } from "@/tokens";

export default function AdminFundingPage() {
  const [report, setReport] = useState<OperationalSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDashboard();
      setReport(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat status pendanaan."
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
          title="Pendanaan Komunitas & Kapasitas Poin"
          description="Memuat ringkasan anggaran operasional..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          title="Pendanaan Komunitas & Kapasitas Poin"
          description="Transparansi anggaran operasional TPS3R Sukawati"
        />
        <ErrorState title="Gagal Memuat Pendanaan" description={error || ""} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendanaan Komunitas & Alokasi BUMDes"
        description="Transparansi dana operasional TPS3R Sukawati, kapasitas penerbitan WastePoints, dan cadangan penyaluran reward warga."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pendanaan Komunitas", active: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Anggaran Dana Pilot"
          value={formatIDR(report.funding_budget_total_idr)}
          highlight
          icon={<BadgeDollarSign className="w-5 h-5 text-white" />}
          hint="BUMDes & Dana Desa Sukawati"
        />
        <StatCard
          label="Kapasitas Poin Maksimal"
          value={report.funding_points_capacity.toLocaleString("id-ID")}
          unit="Pts"
          icon={<Coins className="w-5 h-5 text-[#98631C]" />}
          hint={`Telah tersalur: ${report.funding_points_disbursed.toLocaleString("id-ID")} Pts`}
        />
        <StatCard
          label="Sisa Cadangan Poin"
          value={report.funding_remaining_capacity.toLocaleString("id-ID")}
          unit="Pts"
          icon={<TrendingUp className="w-5 h-5 text-[#2E6B4F]" />}
          hint="Cadangan Aman (Solven)"
        />
      </div>

      <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-brand-800 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed">
          <p className="font-bold">Batasan Hukum & Definisi WastePoints</p>
          <p className="text-brand-800">
            Sistem WastePoints adalah reward keterlibatan sosial dan bukan sistem perbankan, uang elektronik (e-money), atau dompet digital berizin pembayaran. Poin hanya dapat ditukar dengan benefit komunitas (bibit kompos, pupuk, suvenir desa) sesuai paruman banjar.
          </p>
        </div>
      </div>
    </div>
  );
}
