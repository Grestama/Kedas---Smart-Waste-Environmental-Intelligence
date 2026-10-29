"use client";

import React, { useEffect, useState } from "react";
import { UserCheck, Check, X, RefreshCw, AlertCircle, Phone, Truck, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import {
  fetchCollectorApplications,
  reviewCollectorApplication,
} from "@/services/admin";
import { CollectorApplicationResponse } from "@/types/admin";

export default function StaffVerificationPage() {
  const { showToast } = useToast();

  const [applications, setApplications] = useState<CollectorApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Rejection modal state
  const [rejectingApp, setRejectingApp] =
    useState<CollectorApplicationResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCollectorApplications();
      setApplications(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat permohonan petugas dari server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (app: CollectorApplicationResponse) => {
    setIsSubmittingReview(true);
    try {
      await reviewCollectorApplication(app.id, { approved: true });
      showToast(
        "success",
        `Permohonan ${app.applicant_name || app.id} telah disetujui (ACTIVE). Hak akses operasional petugas kini aktif.`
      );
      await loadApplications();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyetujui permohonan.";
      showToast("error", msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingApp) return;
    if (!rejectionReason.trim()) {
      showToast("error", "Alasan penolakan permohonan wajib diisi.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewCollectorApplication(rejectingApp.id, {
        approved: false,
        reason: rejectionReason,
      });
      showToast(
        "success",
        `Permohonan ${rejectingApp.applicant_name || rejectingApp.id} telah ditolak.`
      );
      setRejectingApp(null);
      setRejectionReason("");
      await loadApplications();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menolak permohonan.";
      showToast("error", msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (statusFilter === "ALL") return true;
    return app.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Pengajuan Petugas Lapangan"
        description="Persetujuan berkas dan onboarding calon kolektor sampah TPS3R banjar. Hak akses operasional lapangan hanya diberikan setelah permohonan diverifikasi."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Verifikasi Petugas", active: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplications}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Segarkan Daftar
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold">
        {[
          { key: "ALL", label: "Semua Permohonan" },
          { key: "PENDING", label: "Menunggu Verifikasi" },
          { key: "APPROVED", label: "Disetujui" },
          { key: "REJECTED", label: "Ditolak" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
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
          <LoadingSkeleton className="h-24 rounded-xl" />
          <LoadingSkeleton className="h-24 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Permohonan Petugas"
          description={error}
          onRetry={loadApplications}
        />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title="Tidak Ada Permohonan Petugas"
          description="Tidak ditemukan berkas pendaftaran calon petugas dengan kriteria status yang dipilih."
        />
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <Panel
              key={app.id}
              className="p-5 bg-surface border border-border hover:border-brand-500 transition-colors shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {app.id}
                    </span>
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(app.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Asia/Makassar",
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary">
                    {app.applicant_name || `Calon Petugas (${app.user_id.substring(0, 8)})`}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>{app.applicant_phone || "Kontak terdaftar di profil"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                      <span>{app.vehicle_type || "Kendaraan Operasional Banjar"}</span>
                    </div>
                  </div>

                  {app.operational_notes && (
                    <p className="text-xs text-text-muted italic bg-canvas px-3 py-1.5 rounded border border-border">
                      &ldquo;{app.operational_notes}&rdquo;
                    </p>
                  )}

                  {app.rejection_reason && (
                    <p className="text-xs text-[#A43F35] font-semibold bg-[#FBEAE7] px-3 py-1.5 rounded border border-[#F5C6BF]">
                      Alasan Penolakan: &ldquo;{app.rejection_reason}&rdquo;
                    </p>
                  )}
                </div>

                {/* Action Buttons for Pending */}
                {app.status === "PENDING" && (
                  <div className="shrink-0 flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isSubmittingReview}
                      onClick={() => handleApprove(app)}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Setujui (Approve)
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isSubmittingReview}
                      onClick={() => setRejectingApp(app)}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={Boolean(rejectingApp)}
        onClose={() => {
          if (!isSubmittingReview) {
            setRejectingApp(null);
            setRejectionReason("");
          }
        }}
        title="Tolak Permohonan Calon Petugas"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Berikan alasan penolakan untuk calon petugas{" "}
            <strong>{rejectingApp?.applicant_name || rejectingApp?.id}</strong>. Alasan ini akan tercatat dalam audit log dan disampaikan ke calon pelamar.
          </p>

          <Textarea
            label="Alasan Penolakan *"
            placeholder="Contoh: Berkas SIM C tidak valid, wilayah domisili di luar banjar pilot, atau kuota petugas shift telah penuh."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingReview}
              onClick={() => {
                setRejectingApp(null);
                setRejectionReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSubmittingReview || !rejectionReason.trim()}
              onClick={handleConfirmReject}
            >
              {isSubmittingReview ? "Menolak..." : "Konfirmasi Penolakan"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
