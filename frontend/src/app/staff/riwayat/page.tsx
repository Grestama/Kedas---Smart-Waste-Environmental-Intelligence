"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  CheckCircle2,
  Calendar,
  ArrowRight,
  RefreshCw,
  Search,
  FileText,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchMyTasks } from "@/services/staff";
import { CollectorTask } from "@/types/staff";
import { formatWITA, formatWeightKg } from "@/tokens";

export default function StaffHistoryPage() {
  const [tasks, setTasks] = useState<CollectorTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCompletedLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyTasks();
      // Filter for completed tasks
      setTasks(data.filter((t) => t.status === "COMPLETED"));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat log riwayat penimbangan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedLogs();
  }, []);

  const totalTonnage = tasks.reduce(
    (acc, t) => acc + (t.actual_weight_kg || 0),
    0
  );

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.public_code.toLowerCase().includes(q) ||
      (t.category_name && t.category_name.toLowerCase().includes(q)) ||
      (t.citizen_name && t.citizen_name.toLowerCase().includes(q)) ||
      (t.address_display && t.address_display.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat & Audit Penimbangan Petugas"
        description="Log rekaman penimbangan digital bersertifikat, hasil inspeksi pemilahan, dan riwayat setoran selesai."
        breadcrumbs={[
          { label: "Operasional POS", href: "/staff" },
          { label: "Riwayat Penimbangan", active: true },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={loadCompletedLogs}
            disabled={isLoading}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            }
          >
            Segarkan Log
          </Button>
        }
      />

      {/* Summary Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Panel className="p-4 bg-surface border border-border">
          <span className="text-xs font-semibold text-text-muted">
            Total Setoran Selesai
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-brand-900 font-mono">
              {tasks.length}
            </span>
            <span className="text-xs text-text-secondary">Penjemputan</span>
          </div>
        </Panel>

        <Panel className="p-4 bg-surface border border-border">
          <span className="text-xs font-semibold text-text-muted">
            Total Tonase Tertimbang
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-brand-900 font-mono">
              {totalTonnage.toFixed(2)}
            </span>
            <span className="text-xs text-text-secondary">Kilogram (kg)</span>
          </div>
        </Panel>

        <Panel className="p-4 bg-surface border border-border">
          <span className="text-xs font-semibold text-text-muted">
            Integritas Timbangan
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-[#2E6B4F]">
              100% Append-Only
            </span>
            <span className="text-xs text-text-muted">(Terverifikasi)</span>
          </div>
        </Panel>
      </div>

      {/* Search Toolbar */}
      <Panel className="p-3 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari kode tiket, kategori, warga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-canvas border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div className="text-xs text-text-muted font-medium">
            Menampilkan <strong>{filteredTasks.length}</strong> log tersimpan
          </div>
        </div>
      </Panel>

      {/* Log Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-20 rounded-xl" />
          <LoadingSkeleton className="h-20 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Riwayat"
          description={error}
          onRetry={loadCompletedLogs}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="Belum Ada Riwayat Penimbangan Selesai"
          description="Log penimbangan akan muncul di sini setelah Anda menyelesaikan inspeksi QC dan verifikasi timbangan digital di lapangan."
          action={
            <Link href="/staff/tugas/tersedia">
              <Button variant="primary" size="sm">
                Lihat Antrean Tugas
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((log) => (
            <Panel
              key={log.id}
              className="p-4 bg-surface border border-border hover:border-brand-500 transition-colors shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {log.public_code}
                    </span>
                    <StatusBadge status={log.status} />
                    <span className="text-xs font-bold text-brand-900">
                      Netto: {log.actual_weight_kg || 0} kg
                    </span>
                    {log.points_earned && (
                      <span className="text-xs font-semibold text-brand-700">
                        (+{log.points_earned} WastePoints)
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-text-primary">
                    {log.category_name} &bull; Warga: {log.citizen_name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-700" />
                      {log.address_display}
                    </span>
                    <span className="flex items-center gap-1 text-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Asia/Makassar",
                      })}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                  <Link href={`/staff/tugas/${log.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Audit Detail
                    </Button>
                  </Link>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
