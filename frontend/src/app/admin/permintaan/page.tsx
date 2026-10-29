"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, Filter, RefreshCw, UserCheck, Search, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { fetchAvailableTasks, fetchMyTasks } from "@/services/staff";
import { reassignPickup } from "@/services/admin";
import { CollectorTask } from "@/types/staff";

export default function AdminRequestsPage() {
  const { showToast } = useToast();

  const [requests, setRequests] = useState<CollectorTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Reassignment Modal
  const [reassigningTask, setReassigningTask] = useState<CollectorTask | null>(null);
  const [newCollectorId, setNewCollectorId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [avail, mine] = await Promise.all([
        fetchAvailableTasks(),
        fetchMyTasks(),
      ]);
      // Combine unique tasks
      const all = [...mine];
      avail.forEach((a) => {
        if (!all.some((t) => t.id === a.id)) {
          all.push(a);
        }
      });
      setRequests(all);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat permintaan penjemputan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleConfirmReassign = async () => {
    if (!reassigningTask) return;
    if (!newCollectorId.trim() || !reassignReason.trim()) {
      showToast("error", "ID Petugas baru dan alasan penugasan ulang wajib diisi.");
      return;
    }

    setIsSubmittingReassign(true);
    try {
      await reassignPickup(reassigningTask.id, {
        new_collector_id: newCollectorId.trim(),
        reason: reassignReason.trim(),
      });

      showToast(
        "success",
        `Tugas ${reassigningTask.public_code} berhasil ditugaskan ulang ke petugas baru.`
      );
      setReassigningTask(null);
      setNewCollectorId("");
      setReassignReason("");
      await loadRequests();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menugaskan ulang petugas.";
      showToast("error", msg);
    } finally {
      setIsSubmittingReassign(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.public_code.toLowerCase().includes(q) ||
      (r.category_name && r.category_name.toLowerCase().includes(q)) ||
      (r.citizen_name && r.citizen_name.toLowerCase().includes(q)) ||
      (r.address_display && r.address_display.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervisi Seluruh Permintaan Penjemputan"
        description="Pantau alur perjalanan penjemputan warga banjar, status armada, dan lakukan reassignment tugas bila diperlukan."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Permintaan", active: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadRequests}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Segarkan
          </Button>
        }
      />

      {/* Filter Ribbon & Search */}
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

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "PENDING_ASSIGNMENT", "ACCEPTED", "EN_ROUTE", "ARRIVED", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-brand-900 text-white"
                    : "bg-surface text-text-secondary hover:bg-canvas border border-border"
                }`}
              >
                {st === "ALL" ? "Semua Status" : st}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-24 rounded-xl" />
          <LoadingSkeleton className="h-24 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState title="Gagal Memuat Permintaan" description={error} onRetry={loadRequests} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Permintaan"
          description="Tidak ditemukan data permintaan penjemputan dengan filter yang dipilih."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Panel
              key={item.id}
              className="p-5 bg-surface border border-border hover:border-brand-500 transition-colors shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {item.public_code}
                    </span>
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-text-muted">
                      Estimasi: <strong>{item.estimated_weight_kg || 0} kg</strong>
                    </span>
                    {item.actual_weight_kg && (
                      <span className="text-xs font-bold text-brand-900">
                        &bull; Real: {item.actual_weight_kg} kg
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-text-primary">
                    {item.category_name} &bull; Warga: {item.citizen_name}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                      {item.address_display}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      {item.slot_time_display}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-text-muted italic bg-canvas px-3 py-1.5 rounded border border-border">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Reassignment Action for Active Pickups */}
                {item.status !== "COMPLETED" && item.status !== "CANCELLED" && (
                  <div className="shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReassigningTask(item);
                        setNewCollectorId("");
                        setReassignReason("");
                      }}
                      leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    >
                      Tugaskan Ulang (Reassign)
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Reassign Modal */}
      <Modal
        isOpen={Boolean(reassigningTask)}
        onClose={() => {
          if (!isSubmittingReassign) {
            setReassigningTask(null);
            setNewCollectorId("");
            setReassignReason("");
          }
        }}
        title={`Tugaskan Ulang Petugas: ${reassigningTask?.public_code}`}
      >
        <div className="space-y-4">
          <Input
            label="ID Petugas Baru *"
            placeholder="Contoh: usr_staff_02"
            value={newCollectorId}
            onChange={(e) => setNewCollectorId(e.target.value)}
            required
          />

          <Textarea
            label="Alasan Penugasan Ulang *"
            placeholder="Contoh: Kendaraan petugas sebelumnya mengalami kendala rantai putus, dialihkan ke armada terdekat."
            value={reassignReason}
            onChange={(e) => setReassignReason(e.target.value)}
            rows={3}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingReassign}
              onClick={() => {
                setReassigningTask(null);
                setNewCollectorId("");
                setReassignReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmittingReassign || !newCollectorId.trim() || !reassignReason.trim()}
              onClick={handleConfirmReassign}
            >
              {isSubmittingReassign ? "Menugaskan..." : "Konfirmasi Reassign"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
