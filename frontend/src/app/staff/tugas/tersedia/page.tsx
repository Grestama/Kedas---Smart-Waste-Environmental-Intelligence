"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  ArrowRight,
  MapPin,
  Clock,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { fetchAvailableTasks, acceptTask } from "@/services/staff";
import { CollectorTask } from "@/types/staff";
import { ApiError } from "@/lib/api-client";

export default function AvailableTasksPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<CollectorTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    setConflictWarning(null);
    try {
      const data = await fetchAvailableTasks();
      setTasks(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat antrean tugas dari server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleClaimTask = async (task: CollectorTask) => {
    setClaimingId(task.id);
    setConflictWarning(null);
    try {
      await acceptTask(task.id);
      showToast(
        "success",
        `Tugas ${task.public_code} berhasil Anda klaim! Mengalihkan ke halaman tugas aktif...`
      );
      // Refresh local list and redirect
      setTimeout(() => {
        router.push(`/staff/tugas/${task.id}`);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setConflictWarning(
          `Gagal Mengambil Tugas: Permintaan ${task.public_code} baru saja diambil oleh petugas lain atau status telah berubah. Daftar antrean diperbarui otomatis.`
        );
        showToast(
          "error",
          "Konflik: Tugas sudah diambil petugas lain (409 Conflict)."
        );
        // Refresh available tasks to clear stale task
        loadTasks();
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengklaim tugas.";
        showToast("error", msg);
      }
    } finally {
      setClaimingId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.public_code.toLowerCase().includes(q) ||
      (t.category_name && t.category_name.toLowerCase().includes(q)) ||
      (t.banjar_name && t.banjar_name.toLowerCase().includes(q)) ||
      (t.address_display && t.address_display.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Antrean Tugas Penjemputan Banjar"
        description="Daftar setoran sampah terpilah warga yang siap dijemput. Klaim tugas untuk memulai rute perjalanan operasional Anda."
        breadcrumbs={[
          { label: "Operasional POS", href: "/staff" },
          { label: "Antrean Tersedia", active: true },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={loadTasks}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Segarkan Antrean
          </Button>
        }
      />

      {/* Concurrency Conflict Banner (409 Conflict Feedback) */}
      {conflictWarning && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#FBEAE7] border-2 border-[#A43F35] text-[#A43F35] flex items-start gap-3 shadow-sm animate-pulse"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">Peringatan Konflik Antrean (Race Condition)</h4>
            <p className="leading-relaxed">{conflictWarning}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <Panel className="p-3 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari kode tiket, kategori, atau banjar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-canvas border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-text-secondary font-medium">
            <span>
              Menampilkan <strong>{filteredTasks.length}</strong> tugas tersedia
            </span>
          </div>
        </div>
      </Panel>

      {/* Tasks Table / Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-20 rounded-xl" />
          <LoadingSkeleton className="h-20 rounded-xl" />
          <LoadingSkeleton className="h-20 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Antrean Tugas"
          description={error}
          onRetry={loadTasks}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="Tidak Ada Tugas Penjemputan Tersedia"
          description={
            searchQuery
              ? `Tidak ada tugas yang cocok dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
              : "Semua permohonan setoran banjar saat ini telah diklaim oleh petugas atau belum ada jadwal aktif baru."
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={loadTasks}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Periksa Kembali Antrean
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Panel
              key={task.id}
              className="p-4 bg-surface hover:border-brand-500 transition-colors border border-border shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Task Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {task.public_code}
                    </span>
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-text-muted">
                      Estimasi: <strong>{task.estimated_weight_kg || 0} kg</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-primary">
                    {task.category_name}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                      <span className="truncate">{task.address_display}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>{task.slot_time_display}</span>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-text-muted italic bg-canvas px-2.5 py-1.5 rounded border border-border max-w-2xl">
                      &ldquo;{task.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right Action Button */}
                <div className="shrink-0 flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={claimingId === task.id}
                    onClick={() => handleClaimTask(task)}
                    leftIcon={
                      claimingId === task.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Truck className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {claimingId === task.id ? "Mengklaim..." : "Ambil Tugas Ini"}
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
