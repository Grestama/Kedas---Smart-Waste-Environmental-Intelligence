"use client";

import React, { useState } from "react";
import { ClipboardList, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { mockRequests } from "@/mocks/previewData";
import { formatWITA, formatWeightKg } from "@/tokens";

export default function AdminRequestsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = mockRequests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const columns: Column<(typeof mockRequests)[0]>[] = [
    {
      key: "id",
      header: "ID Permintaan",
      render: (item) => (
        <span className="font-mono font-bold text-brand-900">{item.id}</span>
      ),
    },
    {
      key: "user_name",
      header: "Warga Pemohon",
      render: (item) => (
        <div>
          <span className="font-semibold block">{item.user_name}</span>
          <span className="text-[11px] text-text-secondary truncate max-w-[200px] block">
            {item.address}
          </span>
        </div>
      ),
    },
    {
      key: "category_name",
      header: "Kategori",
      render: (item) => item.category_name,
    },
    {
      key: "scheduled_at",
      header: "Jadwal",
      render: (item) => (
        <span className="text-xs font-mono">{formatWITA(item.scheduled_at)}</span>
      ),
    },
    {
      key: "weight",
      header: "Bobot (Kg)",
      render: (item) => (
        <span>
          {item.actual_weight
            ? formatWeightKg(item.actual_weight)
            : `Est. ${formatWeightKg(item.estimated_weight)}`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const badge = getStatusBadgeConfig(item.status);
        return <StatusBadge variant={badge.variant} label={badge.label} size="sm" />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Permintaan Warga"
        description="Pantau seluruh alur permohonan setoran sampah di tingkat banjar."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Permintaan Warga" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "Semua Permintaan" },
          { id: "diajukan", label: "Diajukan" },
          { id: "dijemput", label: "Sedang Dijemput" },
          { id: "selesai", label: "Selesai" },
          { id: "dibatalkan", label: "Dibatalkan" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === tab.id
                ? "bg-brand-900 text-white shadow-sm"
                : "bg-surface text-text-secondary border border-border hover:bg-[#F3F5F3]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
