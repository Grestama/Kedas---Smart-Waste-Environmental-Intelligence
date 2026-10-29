"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  Camera,
  AlertTriangle,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { mockStaffTasks } from "@/mocks/previewData";

export default function StaffTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const taskId = (params?.id as string) || "TSK-083";
  const task =
    mockStaffTasks.find((t) => t.id === taskId) || mockStaffTasks[1];

  const [actualWeight, setActualWeight] = useState("12.4");
  const [contamination, setContamination] = useState("clean");
  const [collectorNotes, setCollectorNotes] = useState(
    "Kardus kering bersih, diikat 3 bundel rapat tanpa plastik residu."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = parseFloat(actualWeight);
    if (isNaN(weightVal) || weightVal <= 0) {
      toast.error("Bobot Tidak Valid", "Harap masukkan bobot timbangan yang valid.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Penimbangan Berhasil Diverifikasi (Pratinjau)",
        `Setoran ${task.requestId} telah selesai ditimbang (${weightVal} kg). WastePoints otomatis diterbitkan ke warga.`
      );
      router.push("/staff/riwayat");
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={`Formulir Penimbangan Lapangan — ${task.id}`}
        description={`Setoran ${task.requestId} • Kategori: ${task.category}`}
        breadcrumbs={[
          { label: "Meja Operasional", href: "/staff" },
          { label: "Tugas", href: "/staff/tugas/saya" },
          { label: task.id },
        ]}
        actions={
          <Link href="/staff/tugas/saya">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Kembali
            </Button>
          </Link>
        }
      />

      {/* Citizen and Location summary */}
      <Panel title="Detail Permintaan Warga">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-secondary block">Nama Warga / Pemilik:</span>
            <span className="font-bold text-text-primary text-sm mt-0.5 block">
              {task.citizenName}
            </span>
            <span className="text-text-secondary font-mono">{task.phone}</span>
          </div>

          <div>
            <span className="text-text-secondary block">Alamat Penjemputan:</span>
            <span className="font-semibold text-text-primary mt-0.5 block">
              {task.address}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Estimasi Awal Warga:</span>
            <span className="font-bold text-brand-900 mt-0.5 block">
              {task.estimatedWeight}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Kategori Sampah:</span>
            <span className="font-bold text-brand-900 mt-0.5 block">
              {task.category}
            </span>
          </div>
        </div>
      </Panel>

      {/* Official Weighing and Inspection Form */}
      <form onSubmit={handleSubmitWeighing} className="space-y-6">
        <Panel
          title="Input Hasil Timbangan & Inspeksi Kualitas"
          subtitle="Masukkan data resmi dari timbangan digital lapangan dan periksa kontaminasi."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bobot Timbangan Aktual (Kilogram)"
                type="number"
                step="0.05"
                min="0.1"
                required
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                placeholder="Contoh: 12.4"
                helperText="Nilai terbaca pada layar timbangan digital"
              />

              <Select
                label="Hasil Inspeksi Kebersihan / Kontaminasi"
                required
                value={contamination}
                onChange={(e) => setContamination(e.target.value)}
                options={[
                  {
                    value: "clean",
                    label: "Bersih & Sesuai Standar (Poin Penuh)",
                  },
                  {
                    value: "moderate",
                    label: "Kontaminasi Ringan / Sedikit Lembab (Penyesuaian 10%)",
                  },
                  {
                    value: "dirty",
                    label: "Kotor / Kontaminasi Tinggi (Ditolak / Draf)",
                  },
                ]}
              />
            </div>

            {/* Photo proof mock input */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Foto Bukti Timbangan & Kondisi Sampah
              </label>
              <div className="p-6 rounded-xl border border-dashed border-border bg-[#FAFBF9] flex flex-col items-center justify-center text-center">
                <Camera className="w-8 h-8 text-brand-700 mb-2" />
                <p className="text-xs font-semibold text-brand-900">
                  Ambil Foto Langsung dari Kamera POS atau Unggah
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Foto menunjukkan jarum/layar digital timbangan serta kondisi karung sampah.
                </p>
                <Button variant="secondary" size="sm" className="mt-3">
                  Pilih / Ambil Foto Bukti
                </Button>
              </div>
            </div>

            <Textarea
              label="Catatan Lapangan Petugas"
              rows={2}
              value={collectorNotes}
              onChange={(e) => setCollectorNotes(e.target.value)}
              placeholder="Catatan kondisi material atau kendala akses"
            />
          </div>
        </Panel>

        {/* Action button */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/staff/tugas/saya">
            <Button variant="secondary">Batal</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            className="bg-emerald-800 hover:bg-emerald-900"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Verifikasi & Terbitkan WastePoints
          </Button>
        </div>
      </form>
    </div>
  );
}
