"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Scale,
  Calendar,
  MapPin,
  Coins,
  ShieldCheck,
  User,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { StatusTimeline, TimelineStep } from "@/components/ui/StatusTimeline";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { mockRequests } from "@/mocks/previewData";
import { formatWITA, formatWeightKg, formatPoints } from "@/tokens";

export default function DepositDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const reqId = (params?.id as string) || "REQ-2026-0012";
  const request =
    mockRequests.find((r) => r.id === reqId) || mockRequests[0];

  const badge = getStatusBadgeConfig(request.status);

  const timelineSteps: TimelineStep[] = [
    {
      title: "Permintaan Diajukan",
      description: "Permintaan dibuat dan masuk ke antrean pos TPS3R banjar.",
      timestamp: formatWITA(request.created_at),
      status: "completed",
    },
    {
      title: "Dikonfirmasi & Dijadwalkan",
      description: "Jadwal penjemputan disetujui koordinator lapangan.",
      timestamp: formatWITA(request.scheduled_at),
      status:
        request.status === "diajukan"
          ? "current"
          : request.status === "dibatalkan"
          ? "error"
          : "completed",
    },
    {
      title: "Penjemputan Lapangan",
      description: "Petugas meluncur ke lokasi warga untuk mengangkut sampah.",
      status:
        request.status === "dijemput"
          ? "current"
          : request.status === "selesai"
          ? "completed"
          : "upcoming",
    },
    {
      title: "Penimbangan Resmi & Poin Terbit",
      description: "Hasil timbang digital diverifikasi dan poin masuk ke buku besar.",
      status: request.status === "selesai" ? "completed" : "upcoming",
    },
  ];

  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false);
    toast.success(
      "Setoran Dibatalkan (Pratinjau)",
      `Permintaan setoran ${request.id} telah dibatalkan.`
    );
    router.push("/app/setoran");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Detail Setoran ${request.id}`}
        description={`Diajukan pada ${formatWITA(request.created_at)}`}
        badge={<StatusBadge variant={badge.variant} label={badge.label} />}
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Setoran", href: "/app/setoran" },
          { label: request.id },
        ]}
        actions={
          <Link href="/app/setoran">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Kembali
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Panel title="Informasi Material & Hasil Timbang">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-secondary uppercase tracking-wider block font-semibold">
                  Kategori Sampah
                </span>
                <span className="text-base font-bold text-brand-900 mt-1 block">
                  {request.category_name}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-secondary uppercase tracking-wider block font-semibold">
                  Metode Penyerahan
                </span>
                <span className="text-base font-bold text-brand-900 mt-1 block">
                  {request.pickup_type === "pickup"
                    ? "Jemput di Rumah"
                    : "Antar Sendiri ke Pos"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-secondary uppercase tracking-wider block font-semibold">
                  Estimasi Awal Warga
                </span>
                <span className="text-base font-bold text-brand-900 mt-1 block">
                  {formatWeightKg(request.estimated_weight)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#E7F4EA] border border-[#BCE1C7]">
                <span className="text-xs text-[#276749] uppercase tracking-wider block font-semibold">
                  Bobot Resmi Timbangan
                </span>
                <span className="text-base font-bold text-[#276749] mt-1 block">
                  {request.actual_weight
                    ? formatWeightKg(request.actual_weight)
                    : "Menunggu Timbang Lapangan"}
                </span>
              </div>
            </div>

            {request.points_earned ? (
              <div className="mt-4 p-4 rounded-xl bg-[#FAFBF9] border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">
                      WastePoints Diterbitkan
                    </span>
                    <span className="text-base font-bold text-brand-900">
                      +{formatPoints(request.points_earned)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E7F4EA] text-[#276749]">
                  Tercatat di Ledger
                </span>
              </div>
            ) : null}
          </Panel>

          {/* Location & Schedule */}
          <Panel title="Lokasi & Jadwal Penjemputan">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block">
                    Alamat Penjemputan
                  </span>
                  <span className="text-text-secondary">{request.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <Calendar className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block">
                    Jadwal Penjemputan Resmi
                  </span>
                  <span className="text-text-secondary">
                    {formatWITA(request.scheduled_at)}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="space-y-6">
          <Panel title="Progres Status Setoran">
            <StatusTimeline steps={timelineSteps} />
          </Panel>

          {request.status === "diajukan" && (
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
              <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                Tindakan Permintaan
              </h4>
              <p className="text-xs text-text-secondary">
                Anda dapat membatalkan permohonan selama petugas belum ditugaskan.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Batalkan Permintaan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Konfirmasi Pembatalan Setoran"
        description={`Apakah Anda yakin ingin membatalkan permohonan setoran ${request.id}?`}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Kembali
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
            >
              Ya, Batalkan Setoran
            </Button>
          </>
        }
      >
        <p className="text-xs text-text-secondary">
          Setelah dibatalkan, petugas TPS3R tidak akan dijadwalkan ke alamat Anda. Anda dapat membuat permintaan baru kapan saja jika sudah siap.
        </p>
      </Modal>
    </div>
  );
}
