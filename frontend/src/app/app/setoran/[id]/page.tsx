"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  CheckCircle2,
  Leaf,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { StatusTimeline, TimelineStep } from "@/components/ui/StatusTimeline";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { collectionService } from "@/services/collection";
import { PickupRequest } from "@/types/collection";
import { formatWITA, formatWeightKg, formatPoints } from "@/tokens";
import { ApiError } from "@/lib/api-client";
import { AIDataProvenance } from "@/components/ai";

export default function DepositDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const reqId = (params?.id as string) || "";
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cancel modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(
    "Jadwal berhalangan / sampah sudah dibawa ke pos banjar mandiri"
  );
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true);
      try {
        const data = await collectionService.getPickupRequestDetail(reqId);
        setRequest(data);
      } catch (err) {
        console.error("Gagal memuat detail setoran:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (reqId) {
      loadDetail();
    }
  }, [reqId]);

  const handleConfirmCancel = async () => {
    if (!request) return;
    setIsCancelling(true);
    try {
      const updated = await collectionService.cancelPickupRequest(
        request.id,
        cancelReason
      );
      setRequest(updated);
      setIsCancelModalOpen(false);
      toast.success(
        "Setoran Dibatalkan",
        `Permintaan setoran ${request.public_code || request.id} berhasil dibatalkan. Kuota slot telah dikembalikan.`
      );
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Gagal membatalkan permohonan setoran.";
      toast.error("Gagal Membatalkan", msg);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !request) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Memuat Detail Setoran..."
          description="Mengambil data status dan riwayat timbangan dari server..."
        />
        <div className="p-12 rounded-xl bg-surface border border-border flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-text-secondary">
            Memuat data transaksi setoran...
          </span>
        </div>
      </div>
    );
  }

  const badge = getStatusBadgeConfig(request.status);
  const isCancellable =
    request.status === "PENDING_ASSIGNMENT" || request.status === "ACCEPTED";

  // Build timeline steps
  const timelineSteps: TimelineStep[] = [
    {
      title: "Permintaan Diajukan",
      description: "Permintaan dibuat dan masuk ke antrean pos TPS3R banjar.",
      timestamp: formatWITA(request.created_at),
      status: "completed",
    },
    {
      title: "Dikonfirmasi & Dijadwalkan",
      description: request.assigned_collector_id
        ? "Kolektor TPS3R telah ditugaskan."
        : "Menunggu alokasi rute kolektor.",
      timestamp: request.assigned_collector_id
        ? formatWITA(request.created_at)
        : undefined,
      status:
        request.status === "PENDING_ASSIGNMENT"
          ? "current"
          : request.status === "CANCELLED"
          ? "error"
          : "completed",
    },
    {
      title: "Penjemputan & Inspeksi",
      description:
        request.status === "EN_ROUTE"
          ? "Petugas sedang meluncur ke lokasi Anda."
          : request.status === "ARRIVED"
          ? "Petugas tiba di lokasi penjemputan."
          : request.status === "INSPECTION"
          ? "Pemeriksaan tingkat kontaminasi sampah."
          : request.status === "COLLECTED" || request.status === "COMPLETED"
          ? "Sampah telah diangkut ke pos TPS3R."
          : "Menunggu kedatangan petugas.",
      status:
        request.status === "EN_ROUTE" ||
        request.status === "ARRIVED" ||
        request.status === "INSPECTION" ||
        request.status === "COLLECTED"
          ? "current"
          : request.status === "COMPLETED"
          ? "completed"
          : "upcoming",
    },
    {
      title: "Penimbangan Resmi & Poin Terbit",
      description:
        request.status === "COMPLETED"
          ? `Timbangan tervalidasi (${formatWeightKg(request.actual_weight_kg || 0)}), WastePoints otomatis diterbitkan.`
          : "Penimbangan digital terkalibrasi di pos.",
      status: request.status === "COMPLETED" ? "completed" : "upcoming",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Setoran: ${request.public_code || request.id}`}
        description={`Diajukan pada ${formatWITA(request.created_at)}`}
        badge={<StatusBadge variant={badge.variant} label={badge.label} />}
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Setoran", href: "/app/setoran" },
          { label: request.public_code || request.id },
        ]}
        actions={
          <Link href="/app/setoran">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Kembali ke Daftar
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
                  {request.category?.name || "Plastik PET Bening"}
                </span>
                <span className="text-[11px] text-text-secondary font-mono mt-0.5 block">
                  Tipe: {request.category?.category_type || "RECYCLABLE"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-secondary uppercase tracking-wider block font-semibold">
                  Metode Penyerahan
                </span>
                <span className="text-base font-bold text-brand-900 mt-1 block">
                  {request.service_mode === "DROP_OFF"
                    ? "Setor Mandiri ke TPS3R"
                    : "Jemput di Rumah (Armada Trike)"}
                </span>
                <span className="text-[11px] text-text-secondary mt-0.5 block">
                  {request.service_mode === "DROP_OFF"
                    ? "Pos Penerimaan TPS3R Sukawati"
                    : "Motor Roda Tiga Desa"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-secondary uppercase tracking-wider block font-semibold">
                  Estimasi Awal Warga
                </span>
                <span className="text-base font-bold text-brand-900 mt-1 block">
                  {formatWeightKg(request.estimated_weight_kg || 0)}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  request.status === "COMPLETED"
                    ? "bg-[#E7F4EA] border-[#BCE1C7]"
                    : "bg-canvas border-border"
                }`}
              >
                <span
                  className={`text-xs uppercase tracking-wider block font-semibold ${
                    request.status === "COMPLETED" ? "text-[#276749]" : "text-text-secondary"
                  }`}
                >
                  Bobot Resmi Timbangan
                </span>
                <span
                  className={`text-base font-bold mt-1 block ${
                    request.status === "COMPLETED" ? "text-[#276749]" : "text-text-primary"
                  }`}
                >
                  {request.actual_weight_kg
                    ? formatWeightKg(request.actual_weight_kg)
                    : "Menunggu Verifikasi POS"}
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

          {/* Kedas Digital Waste Passport */}
          <Panel className="p-6 bg-surface rounded-2xl border-2 border-brand-900/25 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-900 tracking-tight">
                    Kedas Digital Waste Passport
                  </h3>
                  <span className="text-[11px] text-text-secondary font-mono">
                    ID Paspor: PASSPORT-{request.public_code || request.id}
                  </span>
                </div>
              </div>
              <AIDataProvenance
                level={request.status === "COMPLETED" ? "VERIFIED" : "ESTIMATED"}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                  Sumber Terverifikasi (Source)
                </span>
                <p className="font-bold text-brand-900 mt-1">
                  Banjar Adat / Warga Terdaftar
                </p>
                <span className="text-[11px] text-text-secondary font-mono block mt-0.5">
                  UID: {request.reporter_user_id ? `${request.reporter_user_id.slice(0, 8)}...` : "Tervalidasi"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                  Rantai Angkut (Chain of Custody)
                </span>
                <p className="font-bold text-brand-900 mt-1">
                  {request.service_mode === "DROP_OFF"
                    ? "Setoran Mandiri Warga ke Pos TPS3R"
                    : "Armada Trike Banjar Berjadwal"}
                </p>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  Kolektor: {request.assigned_collector_id || "Terjadwal"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                  Fasilitas Pemrosesan Destinasi
                </span>
                <p className="font-bold text-brand-900 mt-1">
                  TPS3R Sukawati Kaja
                </p>
                <span className="text-[11px] text-text-secondary font-mono block mt-0.5">
                  CDOA: CDOA-SUKAWATI-KAJA-V1
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                  Estimasi Dampak Lingkungan
                </span>
                <p className="font-bold text-[#276749] mt-1 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {(
                      (request.actual_weight_kg || request.estimated_weight_kg || 0) * 1.82
                    ).toFixed(2)}{" "}
                    kg CO₂e Terhindar
                  </span>
                </p>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  {(request.actual_weight_kg || request.estimated_weight_kg || 0).toFixed(1)} kg lolos dari TPA
                </span>
              </div>
            </div>
          </Panel>

          {/* Location & Slot Schedule */}
          <Panel title="Lokasi & Alokasi Slot Banjar">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block">
                    Alamat Penjemputan Resmi
                  </span>
                  <span className="text-text-secondary">
                    {request.address?.address_text || "Banjar Kaja, Jl. Kenanga No. 14, Desa Sukawati"}
                  </span>
                  {request.notes && (
                    <p className="mt-1 p-2 rounded bg-canvas border border-border italic">
                      Catatan warga: &ldquo;{request.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2.5 border-t border-border">
                <Clock className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block">
                    ID Alokasi Slot Kuota
                  </span>
                  <span className="text-text-secondary font-mono">
                    {request.slot_id} (Kolektor: {request.assigned_collector_id || "Menunggu penugasan"})
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Timeline & Action */}
        <div className="space-y-6">
          <Panel title="Tahapan Status Transaksi">
            <StatusTimeline steps={timelineSteps} />
          </Panel>

          {isCancellable && (
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
              <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                Batalkan Permohonan
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Anda dapat membatalkan permohonan selama petugas belum tiba di lokasi. Kuota slot penjemputan akan otomatis dilepas kembali.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Batalkan Setoran Ini
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Konfirmasi Pembatalan Setoran"
        description={`Setoran: ${request.public_code || request.id}`}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={isCancelling}
              onClick={() => setIsCancelModalOpen(false)}
            >
              Kembali
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleConfirmCancel}
            >
              Ya, Batalkan Setoran
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-text-secondary">
            Alasan pembatalan diperlukan untuk evaluasi rute operasional pos TPS3R banjar:
          </p>
          <Input
            label="Alasan Pembatalan"
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Tuliskan alasan pembatalan..."
          />
        </div>
      </Modal>
    </div>
  );
}
