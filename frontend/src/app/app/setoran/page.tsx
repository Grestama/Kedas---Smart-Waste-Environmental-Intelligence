"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Package, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { mockRequests } from "@/mocks/previewData";
import { formatWITA, formatWeightKg } from "@/tokens";

export default function UserDepositsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const filteredData = mockRequests.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const columns: Column<(typeof mockRequests)[0]>[] = [
    {
      key: "id",
      header: "ID Setoran",
      render: (item) => (
        <span className="font-mono font-semibold text-brand-900">{item.id}</span>
      ),
    },
    {
      key: "category_name",
      header: "Kategori & Tipe",
      render: (item) => (
        <div>
          <span className="font-semibold block">{item.category_name}</span>
          <span className="text-[11px] text-text-secondary">
            {item.pickup_type === "pickup" ? "Jemput di Rumah" : "Antar ke Pos Banjar"}
          </span>
        </div>
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
    {
      key: "weight",
      header: "Bobot",
      render: (item) => (
        <span>
          {item.actual_weight
            ? formatWeightKg(item.actual_weight)
            : `Est. ${formatWeightKg(item.estimated_weight)}`}
        </span>
      ),
    },
    {
      key: "points",
      header: "Poin Diperoleh",
      align: "right",
      render: (item) => (
        <span className={item.points_earned ? "font-bold text-[#276749]" : "text-text-secondary"}>
          {item.points_earned ? `+${item.points_earned} poin` : "-"}
        </span>
      ),
    },
    {
      key: "action",
      header: "Detail",
      align: "right",
      render: (item) => (
        <Link href={`/app/setoran/${item.id}`} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Setoran Sampah Terpilah"
        description="Kelola dan pantau seluruh riwayat permohonan setoran sampah Anda."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Setoran Saya" },
        ]}
        actions={
          <Link href="/app/setoran/baru">
            <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Buat Setoran Baru
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "Semua Setoran" },
          { id: "diajukan", label: "Diajukan" },
          { id: "dijemput", label: "Dalam Penjemputan" },
          { id: "selesai", label: "Selesai Ditimbang" },
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => router.push(`/app/setoran/${item.id}`)}
        emptyTitle="Tidak Ada Setoran Ditemukan"
        emptyDescription="Belum ada setoran pada kategori filter ini. Anda dapat membuat setoran sampah baru sekarang."
        emptyAction={
          <Link href="/app/setoran/baru">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Buat Setoran Sekarang
            </Button>
          </Link>
        }
      />
    </div>
  );
}
