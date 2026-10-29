import React from "react";
import { BadgeDollarSign, Building, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { formatIDR } from "@/tokens";

export default function AdminFundingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendanaan Komunitas & Alokasi BUMDes"
        description="Transparansi dana operasional TPS3R, penjualan material daur ulang, dan sponsor program sirkular."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pendanaan Komunitas" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Dana Terkumpul"
          value={formatIDR(28500000)}
          highlight
          icon={<BadgeDollarSign className="w-5 h-5 text-white" />}
          hint="Periode Pilot 2026"
        />
        <StatCard
          label="Hasil Penjualan Material"
          value={formatIDR(12200000)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-700" />}
          hint="Dari offtaker plastik & kertas"
        />
        <StatCard
          label="Cadangan Reward WastePoints"
          value={formatIDR(8500000)}
          icon={<Building className="w-5 h-5 text-brand-700" />}
          hint="Dialokasikan untuk sembako desa"
        />
      </div>

      <Panel title="Sumber Pendanaan Resmi Program Pilot">
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <div className="p-3 bg-canvas rounded-lg border border-border flex items-center justify-between">
            <div>
              <strong className="text-text-primary block">Dana Desa & Kas Banjar Sukawati</strong>
              Subsidi operasional pemilahan dan armada roda tiga TPS3R
            </div>
            <span className="font-bold text-brand-900">{formatIDR(15000000)}</span>
          </div>

          <div className="p-3 bg-canvas rounded-lg border border-border flex items-center justify-between">
            <div>
              <strong className="text-text-primary block">CSR Mitra Lingkungan & Pariwisata Berkelanjutan</strong>
              Pendanaan timbangan digital dan perlengkapan APD petugas
            </div>
            <span className="font-bold text-brand-900">{formatIDR(13500000)}</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
