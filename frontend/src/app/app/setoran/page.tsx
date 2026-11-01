"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Package, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { collectionService } from "@/services/collection";
import { PickupRequest } from "@/types/collection";
import { formatWITA, formatWeightKg, formatPoints } from "@/tokens";

export default function UserDepositsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadRequests = useCallback(async (currentFilter: string) => {
    setIsLoading(true);
    try {
      const data = await collectionService.getMyPickupRequests(currentFilter);
      setRequests(data);
    } catch (err) {
      console.error("Gagal memuat daftar setoran:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests(filter);
  }, [filter, loadRequests]);

  const columns: Column<PickupRequest>[] = [
    {
      key: "public_code",
      header: "Kode / ID Setoran",
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-brand-900 block">
            {item.public_code || item.id}
          </span>
          <span className="text-[11px] text-text-secondary font-mono">
            {item.id}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori Material",
      render: (item) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-text-primary">
              {item.category?.name || "Material Terpilah"}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand-100 text-brand-900 border border-brand-200">
              {item.service_mode === "DROP_OFF" ? "Setor Mandiri" : "Jemput Trike"}
            </span>
          </div>
          <span className="text-[11px] text-text-secondary font-mono">
            Dibuat: {formatWITA(item.created_at, { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status Penjemputan",
      render: (item) => {
        const badge = getStatusBadgeConfig(item.status);
        return <StatusBadge variant={badge.variant} label={badge.label} size="sm" />;
      },
    },
    {
      key: "weight",
      header: "Bobot Timbang",
      render: (item) => (
        <span>
          {item.actual_weight_kg
            ? formatWeightKg(item.actual_weight_kg)
            : item.estimated_weight_kg
            ? `Est. ${formatWeightKg(item.estimated_weight_kg)}`
            : "-"}
        </span>
      ),
    },
    {
      key: "points",
      header: "WastePoints",
      align: "right",
      render: (item) => (
        <span
          className={
            item.points_earned
              ? "font-bold text-[#276749]"
              : "text-text-secondary text-xs"
          }
        >
          {item.points_earned ? `+${formatPoints(item.points_earned)}` : "Menunggu Timbang"}
        </span>
      ),
    },
    {
      key: "action",
      header: "Detail",
      align: "right",
      render: (item) => (
        <Link href={`/app/setoran/${item.id}`} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" aria-label={`Buka detail ${item.id}`}>
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
        description="Kelola dan pantau seluruh riwayat permohonan setoran sampah rumah tangga Anda."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Setoran Saya" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadRequests(filter)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Muat Ulang
            </Button>
            <Link href="/app/setoran/baru">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Buat Setoran Baru
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter status setoran">
        {[
          { id: "all", label: "Semua Setoran" },
          { id: "PENDING_ASSIGNMENT", label: "Diajukan" },
          { id: "EN_ROUTE", label: "Dalam Penjemputan" },
          { id: "COMPLETED", label: "Selesai Ditimbang" },
          { id: "CANCELLED", label: "Dibatalkan" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-fast ease-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] cursor-pointer ${
              filter === tab.id
                ? "bg-brand-900 text-white shadow-xs"
                : "bg-surface text-text-secondary border border-border hover:border-brand-800 hover:text-brand-900 hover:bg-[#F3F5F3]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => router.push(`/app/setoran/${item.id}`)}
        emptyTitle="Belum Ada Setoran"
        emptyDescription="Belum ada setoran sampah pada kriteria filter ini. Mulai pilah sampah dan buat jadwal penjemputan sekarang."
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
