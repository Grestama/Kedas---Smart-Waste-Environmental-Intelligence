"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Scale,
  MapPin,
  Phone,
  ArrowRight,
  Clock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Navigation,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { fetchMyTasks, updateTaskStatus } from "@/services/staff";
import { CollectorTask } from "@/types/staff";

export default function MyActiveTasksPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<CollectorTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Exception / Cancellation modal
  const [cancellingTask, setCancellingTask] = useState<CollectorTask | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyTasks();
      setTasks(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar tugas saya."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdvanceStatus = async (
    task: CollectorTask,
    targetStatus: string,
    reason?: string
  ) => {
    setUpdatingTaskId(task.id);
    try {
      await updateTaskStatus(task.id, {
        status: targetStatus,
        reason: reason || `Petugas memperbarui status ke ${targetStatus}`,
      });
      showToast(
        "success",
        `Status tugas ${task.public_code} diperbarui ke ${targetStatus}.`
      );
      await loadTasks();

      if (targetStatus === "INSPECTION" || targetStatus === "ARRIVED") {
        router.push(`/staff/tugas/${task.id}`);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status tugas di server.";
      showToast("error", msg);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingTask) return;
    if (!cancelReason.trim()) {
      showToast("error", "Alasan kendala penjemputan wajib diisi.");
      return;
    }

    setIsSubmittingCancel(true);
    try {
      await updateTaskStatus(cancellingTask.id, {
        status: "CANCELLED",
        reason: `Kendala Lapangan: ${cancelReason}`,
      });
      showToast(
        "success",
        `Tugas ${cancellingTask.public_code} berhasil ditandai kendala/dibatalkan.`
      );
      setCancellingTask(null);
      setCancelReason("");
      await loadTasks();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal membatalkan tugas.";
      showToast("error", msg);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE")
      return t.status !== "COMPLETED" && t.status !== "CANCELLED";
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Tugas Penjemputan Saya"
        description="Pantau pergerakan armada trike, konfirmasi ketibaan di lokasi warga, dan buka terminal timbangan digital."
        breadcrumbs={[
          { label: "Operasional POS", href: "/staff" },
          { label: "Tugas Saya", active: true },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadTasks}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Segarkan Data
            </Button>
            <Link href="/staff/tugas/tersedia">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Truck className="w-3.5 h-3.5" />}
              >
                Ambil Tugas Baru
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border text-xs font-semibold">
        {[
          { key: "ALL", label: "Semua Tugas" },
          { key: "ACTIVE", label: "Sedang Berjalan" },
          { key: "ACCEPTED", label: "Diterima" },
          { key: "EN_ROUTE", label: "Menuju Lokasi" },
          { key: "ARRIVED", label: "Tiba di Lokasi" },
          { key: "COMPLETED", label: "Selesai" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === tab.key
                ? "bg-brand-900 text-white shadow-xs"
                : "bg-surface text-text-secondary hover:bg-canvas border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Tugas Saya"
          description={error}
          onRetry={loadTasks}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="Tidak Ada Tugas Pada Kategori Ini"
          description="Anda tidak memiliki tugas dengan status yang dipilih. Silakan periksa tab status lain atau ambil tugas baru di antrean banjar."
          action={
            <Link href="/staff/tugas/tersedia">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Truck className="w-3.5 h-3.5" />}
              >
                Cari Tugas di Antrean
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Panel
              key={task.id}
              className={`p-5 bg-surface border transition-colors shadow-xs ${
                task.status === "COMPLETED"
                  ? "border-border opacity-85"
                  : "border-brand-300 hover:border-brand-600"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Details */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {task.public_code}
                    </span>
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-text-muted">
                      Estimasi: <strong>{task.estimated_weight_kg || 0} kg</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary">
                    {task.category_name}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-700 shrink-0" />
                      <span className="truncate">{task.address_display}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-text-muted shrink-0" />
                      <span>
                        {task.citizen_name} ({task.citizen_phone})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-text-muted shrink-0" />
                      <span>{task.slot_time_display}</span>
                    </div>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-text-muted italic bg-canvas px-3 py-1.5 rounded border border-border">
                      &ldquo;{task.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right Status Actions */}
                <div className="shrink-0 flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                  {task.status === "ACCEPTED" && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={updatingTaskId === task.id}
                      onClick={() => handleAdvanceStatus(task, "EN_ROUTE")}
                      leftIcon={<Navigation className="w-3.5 h-3.5" />}
                    >
                      Mulai Jalan (En Route)
                    </Button>
                  )}

                  {task.status === "EN_ROUTE" && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={updatingTaskId === task.id}
                      onClick={() => handleAdvanceStatus(task, "ARRIVED")}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Tiba di Lokasi (Arrived)
                    </Button>
                  )}

                  {task.status === "ARRIVED" && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={updatingTaskId === task.id}
                      onClick={() => handleAdvanceStatus(task, "INSPECTION")}
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                    >
                      Mulai Inspeksi QC
                    </Button>
                  )}

                  {/* Direct Link to Scale & Terminal POS */}
                  <Link href={`/staff/tugas/${task.id}`}>
                    <Button
                      variant={
                        task.status === "COMPLETED" ? "outline" : "secondary"
                      }
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {task.status === "COMPLETED"
                        ? "Lihat Detail Selesai"
                        : "Buka Terminal Timbang"}
                    </Button>
                  </Link>

                  {/* Exception / Cancel Trigger */}
                  {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#A43F35] hover:bg-[#FBEAE7]"
                      onClick={() => setCancellingTask(task)}
                    >
                      Kendala / Batal
                    </Button>
                  )}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Exception / Cancellation Modal */}
      <Modal
        isOpen={Boolean(cancellingTask)}
        onClose={() => {
          if (!isSubmittingCancel) {
            setCancellingTask(null);
            setCancelReason("");
          }
        }}
        title="Catat Kendala Lapangan & Batalkan Penjemputan"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Laporkan kendala operasional untuk tugas{" "}
            <strong>{cancellingTask?.public_code}</strong>. Alasan ini akan tercatat dalam audit log dan disampaikan ke warga.
          </p>

          <Textarea
            label="Alasan Kendala / Pembatalan *"
            placeholder="Contoh: Warga tidak di tempat setelah dikonfirmasi via telepon, gerbang terkunci rapat, atau sampah terbukti mengandung limbah B3/medis."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingCancel}
              onClick={() => {
                setCancellingTask(null);
                setCancelReason("");
              }}
            >
              Kembali
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSubmittingCancel || !cancelReason.trim()}
              onClick={handleConfirmCancel}
            >
              {isSubmittingCancel ? "Menyimpan..." : "Konfirmasi Kendala"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
