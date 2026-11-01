"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  Camera,
  AlertTriangle,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Upload,
  RefreshCw,
  FileText,
  AlertCircle,
  Truck,
  HelpCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import {
  getTaskDetail,
  updateTaskStatus,
  recordInspection,
  recordWeight,
  uploadEvidence,
} from "@/services/staff";
import {
  CollectorTask,
  InspectionResult,
  ContaminationLevel,
  WeighingMethod,
  InspectionResponse,
  WeightRecordResponse,
  EvidenceResponse,
} from "@/types/staff";
import { ApiError } from "@/lib/api-client";
import { enqueueWeighing } from "@/lib/offline-queue";
import { OfflineOutboxBanner } from "@/components/staff/OfflineOutboxBanner";

export default function TaskDetailPosTerminalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;
  const router = useRouter();
  const { showToast } = useToast();

  const [task, setTask] = useState<CollectorTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status progression loading
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Step 1: QC Inspection Form State
  const [inspectionResult, setInspectionResult] =
    useState<InspectionResult>("ACCEPTED");
  const [contaminationLevel, setContaminationLevel] =
    useState<ContaminationLevel>("NONE");
  const [acceptedWeightKg, setAcceptedWeightKg] = useState<string>("");
  const [rejectedWeightKg, setRejectedWeightKg] = useState<string>("");
  const [rejectionReasonCode, setRejectionReasonCode] = useState<string>("");
  const [rejectionNotes, setRejectionNotes] = useState<string>("");
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false);

  // Step 2: Scale Weigh-in Form State
  const [weighingMethod, setWeighingMethod] =
    useState<WeighingMethod>("MANUAL_SCALE");
  const [grossWeightInput, setGrossWeightInput] = useState<string>("");
  const [tareWeightInput, setTareWeightInput] = useState<string>("");
  const [directNetInput, setDirectNetInput] = useState<string>("");
  const [correctionReasonInput, setCorrectionReasonInput] = useState<string>("");
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);

  // Step 3: Evidence Upload State
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceResponse[]>([]);

  const loadTask = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTaskDetail(taskId);
      setTask(data);
      if (data.evidences) {
        setEvidenceFiles(data.evidences);
      }
      // Prefill gross weight with estimation if empty
      if (data.estimated_weight_kg && !grossWeightInput) {
        setGrossWeightInput(data.estimated_weight_kg.toString());
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat detail tugas penjemputan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // Handle status progression
  const handleAdvanceStatus = async (nextStatus: string, reason?: string) => {
    if (!task) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateTaskStatus(task.id, {
        status: nextStatus,
        reason: reason || `Petugas memperbarui status operasional ke ${nextStatus}`,
      });
      setTask((prev) => (prev ? { ...prev, status: updated.status } : null));
      showToast("success", `Status penjemputan kini: ${nextStatus}`);
      await loadTask();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui status tugas.";
      showToast("error", msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle QC Inspection Submit
  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    if (inspectionResult === "REJECTED") {
      if (!rejectionReasonCode && !rejectionNotes.trim()) {
        showToast(
          "error",
          "Penolakan wajib menyertakan kode alasan atau catatan penolakan spesifik."
        );
        return;
      }
    }

    if (inspectionResult === "PARTIALLY_ACCEPTED") {
      if (!acceptedWeightKg || !rejectedWeightKg) {
        showToast(
          "error",
          "Penerimaan sebagian wajib memisahkan berat diterima dan ditolak."
        );
        return;
      }
    }

    setIsSubmittingInspection(true);
    try {
      const res = await recordInspection(task.id, {
        result: inspectionResult,
        contamination_level: contaminationLevel,
        accepted_weight_kg: acceptedWeightKg ? parseFloat(acceptedWeightKg) : null,
        rejected_weight_kg: rejectedWeightKg ? parseFloat(rejectedWeightKg) : null,
        rejection_reason_code: rejectionReasonCode || null,
        rejection_notes: rejectionNotes || null,
      });

      showToast("success", `Inspeksi QC tersimpan (${res.result}).`);
      await loadTask();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mencatat inspeksi QC.";
      showToast("error", msg);
    } finally {
      setIsSubmittingInspection(false);
    }
  };

  // Compute live net weight
  const grossNum = parseFloat(grossWeightInput) || 0;
  const tareNum = parseFloat(tareWeightInput) || 0;
  const isGrossTareMode = weighingMethod !== "DIRECT_NET";
  const computedNet = isGrossTareMode
    ? Math.max(0, Math.round((grossNum - tareNum) * 1000) / 1000)
    : parseFloat(directNetInput) || 0;
  const isTareInvalid = isGrossTareMode && tareNum > grossNum && grossNum > 0;

  // Handle Weigh-in Submit
  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    if (isGrossTareMode) {
      if (grossNum <= 0) {
        showToast("error", "Berat bruto harus lebih besar dari 0 kg.");
        return;
      }
      if (tareNum >= grossNum) {
        showToast(
          "error",
          "Berat tara wadah/keranjang tidak boleh sama atau melebihi berat bruto."
        );
        return;
      }
    } else {
      if (computedNet <= 0) {
        showToast("error", "Berat bersih harus lebih besar dari 0 kg.");
        return;
      }
    }

    const weightPayload = {
      method: weighingMethod,
      gross_weight_kg: isGrossTareMode ? grossNum : null,
      tare_weight_kg: isGrossTareMode ? tareNum : null,
      net_weight_kg: computedNet,
      correction_reason: correctionReasonInput || null,
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueWeighing(task.id, task.public_code, weightPayload);
      showToast(
        "info",
        `Mode Offline: Timbangan (${computedNet} kg) diamankan ke antrean lokal perangkat. Akan disinkronkan saat online.`
      );
      return;
    }

    setIsSubmittingWeight(true);
    try {
      const res = await recordWeight(task.id, weightPayload);

      showToast(
        "success",
        `Timbangan berhasil diverifikasi: ${res.net_weight_kg} kg! Reward poin diterbitkan.`
      );
      await loadTask();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan hasil timbangan.";
      if (
        typeof navigator !== "undefined" &&
        (!navigator.onLine ||
          msg.includes("fetch failed") ||
          msg.includes("Jaringan Error") ||
          msg.includes("NETWORK_ERROR"))
      ) {
        enqueueWeighing(task.id, task.public_code, weightPayload);
        showToast(
          "info",
          `Koneksi terputus: Timbangan (${computedNet} kg) diamankan ke antrean lokal perangkat.`
        );
      } else {
        showToast("error", msg);
      }
    } finally {
      setIsSubmittingWeight(false);
    }
  };

  // Handle Evidence Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !task) return;
    const file = e.target.files[0];

    setIsUploadingEvidence(true);
    try {
      const uploaded = await uploadEvidence(file, "PICKUP_REQUEST", task.id);
      showToast("success", `Bukti ${file.name} berhasil diunggah.`);
      setEvidenceFiles((prev) => [uploaded, ...prev]);
      await loadTask();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengunggah berkas bukti.";
      showToast("error", msg);
    } finally {
      setIsUploadingEvidence(false);
      // Reset input value
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Terminal Timbang & QC Petugas"
          description="Memuat data penjemputan..."
        />
        <LoadingSkeleton className="h-48 rounded-xl" />
        <LoadingSkeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Terminal Timbang & QC Petugas"
          description="Operasional penimbangan dan verifikasi lapangan"
        />
        <ErrorState
          title="Tugas Penjemputan Tidak Ditemukan"
          description={error || "Data tugas tidak tersedia di sistem."}
          onRetry={loadTask}
        />
      </div>
    );
  }

  const latestInspection =
    task.inspections && task.inspections.length > 0
      ? task.inspections[0]
      : null;
  const isInspectionPassed =
    latestInspection &&
    [
      "ACCEPTED",
      "ACCEPTED_WITH_CONTAMINATION",
      "PARTIALLY_ACCEPTED",
    ].includes(latestInspection.result);
  const isInspectionRejected = latestInspection?.result === "REJECTED";

  const latestWeight =
    task.weights && task.weights.length > 0 ? task.weights[0] : null;

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <PageHeader
        title={`Terminal POS: ${task.public_code}`}
        description="Pencatatan inspeksi pemilahan material, timbangan digital tara-bruto, dan bukti foto lapangan."
        breadcrumbs={[
          { label: "Operasional POS", href: "/staff" },
          { label: "Tugas Saya", href: "/staff/tugas/saya" },
          { label: task.public_code, active: true },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link href="/staff/tugas/saya">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Kembali ke Tugas Saya
              </Button>
            </Link>
          </div>
        }
      />

      {/* Offline Outbox Queue Banner (GAP-005) */}
      <OfflineOutboxBanner onSyncComplete={loadTask} />

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Operational Workflow Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Ticket Overview & Status Controls */}
          <Panel className="p-5 bg-surface border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Tiket Penjemputan
                </span>
                <h3 className="text-lg font-bold text-brand-900">
                  {task.public_code}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
              <div className="space-y-1">
                <p className="font-semibold text-text-muted">Kategori Sampah:</p>
                <p className="text-sm font-bold text-text-primary">
                  {task.category_name}
                </p>
                <p className="text-text-muted">
                  Estimasi Warga: <strong>{task.estimated_weight_kg || 0} kg</strong>
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-text-muted">Kontak & Lokasi Warga:</p>
                <p className="font-bold text-text-primary flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  {task.citizen_name} ({task.citizen_phone})
                </p>
                <p className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                  {task.address_display}
                </p>
              </div>
            </div>

            {task.notes && (
              <div className="p-3 bg-canvas rounded-lg border border-border text-xs text-text-secondary">
                <p className="font-semibold text-text-muted mb-0.5">Catatan Tambahan:</p>
                <p className="italic">&ldquo;{task.notes}&rdquo;</p>
              </div>
            )}

            {/* In-field Progression Actions */}
            {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
              <div className="pt-3 border-t border-border flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-text-muted mr-1">
                  Transisi Status Lapangan:
                </span>
                {task.status === "ACCEPTED" && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isUpdatingStatus}
                    onClick={() => handleAdvanceStatus("EN_ROUTE")}
                  >
                    1. Mulai Jalan (En Route)
                  </Button>
                )}
                {task.status === "EN_ROUTE" && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isUpdatingStatus}
                    onClick={() => handleAdvanceStatus("ARRIVED")}
                  >
                    2. Konfirmasi Tiba di Lokasi (Arrived)
                  </Button>
                )}
                {task.status === "ARRIVED" && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isUpdatingStatus}
                    onClick={() => handleAdvanceStatus("INSPECTION")}
                  >
                    3. Buka Tahap Inspeksi QC
                  </Button>
                )}
              </div>
            )}
          </Panel>

          {/* Section 2: QC Inspection Form */}
          <Panel className="p-5 bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Inspeksi Kualitas & Pemilahan (QC)
                  </h3>
                  <p className="text-xs text-text-muted">
                    Periksa kemurnian material dan pastikan bebas dari kontaminasi berbahaya.
                  </p>
                </div>
              </div>
              {latestInspection && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Telah Diinspeksi
                </span>
              )}
            </div>

            {/* Rejection Warning Banner */}
            {inspectionResult === "REJECTED" && (
              <div
                role="alert"
                className="p-3 bg-[#FBEAE7] border border-[#F5C6BF] rounded-lg text-xs text-[#A43F35] flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Konsekuensi Penolakan Setoran (REJECTED):</p>
                  <p>
                    Setoran akan dibatalkan, armada tidak akan mengangkut, dan warga tidak menerima WastePoints. Kode alasan penolakan wajib dicatat untuk audit banjar.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveInspection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Hasil Evaluasi QC *"
                  value={inspectionResult}
                  onChange={(e) =>
                    setInspectionResult(e.target.value as InspectionResult)
                  }
                  options={[
                    {
                      value: "ACCEPTED",
                      label: "ACCEPTED — Diterima Penuh (Kualitas Baik)",
                    },
                    {
                      value: "ACCEPTED_WITH_CONTAMINATION",
                      label: "ACCEPTED_WITH_CONTAMINATION — Kontaminasi Ringan",
                    },
                    {
                      value: "PARTIALLY_ACCEPTED",
                      label: "PARTIALLY_ACCEPTED — Diterima Sebagian",
                    },
                    {
                      value: "REJECTED",
                      label: "REJECTED — Ditolak Total (Tidak Sesuai / B3)",
                    },
                    {
                      value: "NEEDS_REVIEW",
                      label: "NEEDS_REVIEW — Perlu Tinjauan Koordinator",
                    },
                  ]}
                  required
                />

                <Select
                  label="Tingkat Kontaminasi Material *"
                  value={contaminationLevel}
                  onChange={(e) =>
                    setContaminationLevel(e.target.value as ContaminationLevel)
                  }
                  options={[
                    { value: "NONE", label: "NONE — Bersih Bebas Kontaminasi" },
                    { value: "LOW", label: "LOW — Rendah (< 5%)" },
                    { value: "MEDIUM", label: "MEDIUM — Sedang (5 - 20%)" },
                    { value: "HIGH", label: "HIGH — Tinggi (> 20%)" },
                  ]}
                  required
                />
              </div>

              {/* Conditional: Partially Accepted Weights */}
              {inspectionResult === "PARTIALLY_ACCEPTED" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-canvas rounded-lg border border-border">
                  <Input
                    label="Estimasi Berat Diterima (kg) *"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Contoh: 3.5"
                    value={acceptedWeightKg}
                    onChange={(e) => setAcceptedWeightKg(e.target.value)}
                    required
                  />
                  <Input
                    label="Estimasi Berat Ditolak (kg) *"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Contoh: 1.0"
                    value={rejectedWeightKg}
                    onChange={(e) => setRejectedWeightKg(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Conditional: Rejected Reason Code */}
              {inspectionResult === "REJECTED" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-canvas rounded-lg border border-border">
                  <Select
                    label="Kode Alasan Penolakan *"
                    value={rejectionReasonCode}
                    onChange={(e) => setRejectionReasonCode(e.target.value)}
                    options={[
                      { value: "", label: "Pilih Kode Alasan..." },
                      {
                        value: "B3_HAZARDOUS",
                        label: "B3_HAZARDOUS — Mengandung Limbah B3 / Medis",
                      },
                      {
                        value: "HEAVILY_CONTAMINATED",
                        label: "HEAVILY_CONTAMINATED — Tercampur Lumpur / Minyak",
                      },
                      {
                        value: "WRONG_CATEGORY",
                        label: "WRONG_CATEGORY — Tidak Sesuai Kategori Dipilih",
                      },
                      {
                        value: "UNSAFE_LOCATION",
                        label: "UNSAFE_LOCATION — Akses Tidak Aman / Terhalang",
                      },
                    ]}
                    required
                  />
                  <Input
                    label="Catatan Detail Penolakan *"
                    placeholder="Jelaskan alasan penolakan secara spesifik..."
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-muted">
                  Hasil QC dicatat secara permanen dalam sistem audit log.
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingInspection}
                >
                  {isSubmittingInspection
                    ? "Menyimpan QC..."
                    : "Simpan Hasil Inspeksi QC"}
                </Button>
              </div>
            </form>

            {/* Past inspections list */}
            {task.inspections && task.inspections.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border space-y-2">
                <p className="text-xs font-bold text-text-muted">
                  Riwayat Inspeksi QC:
                </p>
                <div className="space-y-1.5">
                  {task.inspections.map((insp) => (
                    <div
                      key={insp.id}
                      className="p-2.5 rounded bg-canvas border border-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-brand-900 mr-2">
                          {insp.result}
                        </span>
                        <span className="text-text-muted">
                          Kontaminasi: {insp.contamination_level}
                        </span>
                        {insp.rejection_reason_code && (
                          <span className="text-[#A43F35] ml-2 font-mono">
                            [{insp.rejection_reason_code}]
                          </span>
                        )}
                      </div>
                      <span className="text-text-muted font-mono text-[11px]">
                        {new Date(insp.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Makassar",
                        })}{" "}
                        WITA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* Section 3: Digital Scale & Weigh-In Form */}
          <Panel className="p-5 bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isInspectionPassed
                      ? "bg-brand-100 text-brand-900"
                      : "bg-border text-text-muted"
                  }`}
                >
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Penimbangan Digital & Perhitungan Tara-Bruto
                  </h3>
                  <p className="text-xs text-text-muted">
                    Hitung berat bersih (Net = Bruto - Tara) sesuai standar sertifikasi timbangan banjar.
                  </p>
                </div>
              </div>

              {latestWeight && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E7F4EA] text-[#276749] border border-[#BCE1C7]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Versi {latestWeight.version} ({latestWeight.net_weight_kg} kg)
                </span>
              )}
            </div>

            {/* Gating Check: Must pass inspection first */}
            {!isInspectionPassed ? (
              <div className="p-4 bg-canvas border border-dashed border-border rounded-xl text-center space-y-2">
                <Lock className="w-6 h-6 text-text-secondary mx-auto opacity-60" />
                <h4 className="text-xs font-bold text-text-primary">
                  Formulir Penimbangan Terkunci
                </h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {isInspectionRejected
                    ? "Penimbangan tidak dapat dilakukan karena status inspeksi QC adalah REJECTED (Ditolak)."
                    : "Harap selesaikan inspeksi QC dengan hasil ACCEPTED terlebih dahulu sebelum mencatat timbangan."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveWeight} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Metode Timbangan *"
                    value={weighingMethod}
                    onChange={(e) =>
                      setWeighingMethod(e.target.value as WeighingMethod)
                    }
                    options={[
                      {
                        value: "MANUAL_SCALE",
                        label: "MANUAL_SCALE — Timbangan Digital Portabel",
                      },
                      {
                        value: "AUTOMATED_SCALE",
                        label: "AUTOMATED_SCALE — Timbangan IoT Gantung",
                      },
                      {
                        value: "DIRECT_NET",
                        label: "DIRECT_NET — Timbang Bersih Langsung",
                      },
                    ]}
                    required
                  />

                  {isGrossTareMode ? (
                    <>
                      <Input
                        label="Berat Bruto / Kotor (kg) *"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="Contoh: 5.850"
                        value={grossWeightInput}
                        onChange={(e) => setGrossWeightInput(e.target.value)}
                        required
                      />
                      <Input
                        label="Berat Tara Wadah (kg) *"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="Contoh: 0.350"
                        value={tareWeightInput}
                        onChange={(e) => setTareWeightInput(e.target.value)}
                        error={
                          isTareInvalid
                            ? "Tara tidak boleh melebihi bruto!"
                            : undefined
                        }
                        required
                      />
                    </>
                  ) : (
                    <Input
                      label="Berat Bersih / Netto (kg) *"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Contoh: 5.500"
                      value={directNetInput}
                      onChange={(e) => setDirectNetInput(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* Live Computed Net Display Box */}
                <div className="p-4 bg-[#E8F0E9] border-2 border-[#D7E4D9] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      Hasil Perhitungan Berat Bersih (Net Weight):
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-extrabold text-brand-900 font-mono">
                        {computedNet.toFixed(3)}
                      </span>
                      <span className="text-sm font-bold text-brand-700">kg</span>
                    </div>
                    {isGrossTareMode && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        Rumus: Bruto ({grossNum.toFixed(3)} kg) - Tara ({tareNum.toFixed(3)} kg)
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-brand-900">
                    <p className="font-bold">Estimasi WastePoints:</p>
                    <p className="text-base font-extrabold text-[#276749] font-mono">
                      +{Math.round(computedNet * 30)} Pts
                    </p>
                    <span className="text-[11px] text-text-secondary">
                      (Dihitung otomatis oleh server backend)
                    </span>
                  </div>
                </div>

                {/* If adjusting existing weight: correction reason */}
                {task.weights && task.weights.length > 0 && (
                  <div className="p-3 bg-[#FFF4D9] rounded-lg border border-[#F7E1A0]">
                    <Input
                      label="Alasan Koreksi / Penimbangan Ulang (Versi Koreksi) *"
                      placeholder="Contoh: Tara wadah belum di-nolkan, penyesuaian kalibrasi timbangan..."
                      value={correctionReasonInput}
                      onChange={(e) => setCorrectionReasonInput(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-text-muted">
                    Nilai terekam adalah append-only dan tidak dapat dihapus.
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingWeight || isTareInvalid || computedNet <= 0}
                  >
                    {isSubmittingWeight
                      ? "Menyimpan Timbangan..."
                      : task.weights && task.weights.length > 0
                      ? "Simpan Versi Koreksi Timbangan"
                      : "Verifikasi & Simpan Timbangan Digital"}
                  </Button>
                </div>
              </form>
            )}

            {/* Versioned weight history */}
            {task.weights && task.weights.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border space-y-2">
                <p className="text-xs font-bold text-text-muted">
                  Riwayat Versi Timbangan (Append-Only):
                </p>
                <div className="space-y-1.5">
                  {task.weights.map((wgt) => (
                    <div
                      key={wgt.id}
                      className="p-2.5 rounded bg-canvas border border-border flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-900 font-mono">
                            Versi {wgt.version}
                          </span>
                          <span className="font-bold text-text-primary">
                            Netto: {wgt.net_weight_kg} kg
                          </span>
                          {wgt.gross_weight_kg && wgt.tare_weight_kg && (
                            <span className="text-text-muted text-[11px]">
                              (Bruto: {wgt.gross_weight_kg} kg, Tara: {wgt.tare_weight_kg} kg)
                            </span>
                          )}
                        </div>
                        {wgt.correction_reason && (
                          <p className="text-xs text-[#98631C] italic">
                            Koreksi: &ldquo;{wgt.correction_reason}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-text-muted font-mono text-[11px]">
                        {new Date(wgt.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Makassar",
                        })}{" "}
                        WITA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* Section 4: Evidence Photo Upload */}
          <Panel className="p-5 bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Unggah Bukti Lapangan (Foto Timbangan & Pemilahan)
                  </h3>
                  <p className="text-xs text-text-muted">
                    Wajib menyertakan foto layar timbangan digital dan kondisi fisik sampah.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-text-muted">
                {evidenceFiles.length} Berkas Terunggah
              </span>
            </div>

            <div className="p-4 bg-canvas border-2 border-dashed border-border rounded-xl text-center space-y-3">
              <Camera className="w-8 h-8 text-text-muted mx-auto opacity-70" />
              <div>
                <p className="text-xs font-bold text-text-primary">
                  Ambil Foto Layar Timbangan Digital / Material
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Format JPG, PNG, atau WebP (Maksimum 10MB per berkas).
                </p>
              </div>

              <div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center justify-center font-medium rounded-lg px-3 py-1.5 text-xs bg-brand-900 text-white hover:bg-brand-800 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {isUploadingEvidence ? "Mengunggah Bukti..." : "Pilih / Ambil Foto Bukti"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isUploadingEvidence}
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Evidence Gallery / List */}
            {evidenceFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-text-muted">
                  Berkas Bukti Terverifikasi Server:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {evidenceFiles.map((evd) => (
                    <div
                      key={evd.id}
                      className="p-3 bg-surface rounded-lg border border-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-brand-700 shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-text-primary truncate">
                            {evd.original_filename}
                          </p>
                          <p className="text-[11px] text-text-muted font-mono">
                            {(evd.file_size_bytes / 1024).toFixed(1)} KB &bull;{" "}
                            {evd.sha256_hash.substring(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-800 border border-brand-200 uppercase">
                        {evd.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* Section 5: Task Completion */}
          {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
            <Panel className="p-5 bg-brand-50 border-2 border-brand-700 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-brand-900">
                    Selesaikan Tugas Penjemputan Lapangan
                  </h4>
                  <p className="text-xs text-brand-700 leading-relaxed">
                    Pastikan inspeksi QC telah tersimpan, timbangan digital tervalidasi, dan bukti foto telah terunggah.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!latestWeight || evidenceFiles.length === 0}
                  onClick={() => handleAdvanceStatus("COMPLETED")}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Selesaikan Tugas Ini
                </Button>
              </div>

              {(!latestWeight || evidenceFiles.length === 0) && (
                <p className="text-[11px] text-text-muted italic">
                  * Tombol penyelesaian akan aktif setelah timbangan digital dan minimal 1 foto bukti terunggah.
                </p>
              )}
            </Panel>
          )}
        </div>

        {/* Right Column (1 Col): Operational Guidelines & K3 Bali Rules */}
        <div className="space-y-6">
          {/* Quick Summary Card */}
          <Panel className="p-4 bg-surface border border-border shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Status Ringkasan Operasional
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Tiket:</span>
                <span className="font-mono font-bold text-text-primary">
                  {task.public_code}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Hasil QC:</span>
                <span className="font-bold text-brand-900">
                  {latestInspection ? latestInspection.result : "Belum QC"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Berat Bersih:</span>
                <span className="font-mono font-bold text-brand-900">
                  {latestWeight ? `${latestWeight.net_weight_kg} kg` : "Belum Ditimbang"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Foto Bukti:</span>
                <span className="font-bold text-text-primary">
                  {evidenceFiles.length} berkas
                </span>
              </div>
            </div>
          </Panel>

          {/* Safety Standards (K3 Lapangan) */}
          <Panel className="p-4 bg-[#FFF4D9] border border-[#F7E1A0] text-[#98631C] space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#98631C]" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Protokol K3 & Keselamatan Kerja
              </h4>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-[#7A4E12]">
              <p>
                <strong>1. Alat Pelindung Diri (APD):</strong> Selalu kenakan sarung tangan karet tebal, sepatu keselamatan, dan masker pelindung.
              </p>
              <p>
                <strong>2. Limbah Medis & B3:</strong> Segera hentikan penanganan jika menemukan jarum suntik, obat kedaluwarsa, atau baterai aki basah. Pilih hasil QC <em>REJECTED</em>.
              </p>
              <p>
                <strong>3. Batas Beban Trike:</strong> Kapasitas maksimal angkut trike TPS3R adalah 250 kg. Jangan memaksakan muatan berlebih.
              </p>
            </div>

            <div className="pt-2 border-t border-[#F7E1A0]">
              <Link
                href="/staff/panduan-keselamatan"
                className="text-xs font-bold text-[#98631C] hover:underline inline-flex items-center gap-1"
              >
                Baca Panduan Keselamatan Lengkap &rarr;
              </Link>
            </div>
          </Panel>

          {/* Banjar Coordinator Contact */}
          <Panel className="p-4 bg-canvas border border-border space-y-2 text-xs">
            <h4 className="font-bold text-text-primary">
              Bantuan Supervisor / Koordinator
            </h4>
            <p className="text-text-secondary leading-relaxed">
              Jika mengalami kendala penimbangan atau perselisihan warga, hubungi Koordinator Pos TPS3R Sukawati:
            </p>
            <div className="p-2.5 bg-surface rounded border border-border font-medium text-text-primary">
              <p>Pos Koordinator: Banjar Sukawati</p>
              <p className="text-brand-700 font-bold">Telp: 0812-3344-5566</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
