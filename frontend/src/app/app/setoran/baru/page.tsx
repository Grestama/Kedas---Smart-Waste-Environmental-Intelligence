"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { mockCategories, mockUsers } from "@/mocks/previewData";

export default function NewDepositPage() {
  const router = useRouter();
  const toast = useToast();

  const [categoryId, setCategoryId] = useState("cat_anorganik_pet");
  const [pickupType, setPickupType] = useState<"pickup" | "dropoff">("pickup");
  const [estimatedWeight, setEstimatedWeight] = useState("3.5");
  const [address, setAddress] = useState(
    "Banjar Kaja, Jl. Kenanga No. 14, Desa Sukawati, Gianyar"
  );
  const [scheduledSlot, setScheduledSlot] = useState("2026-10-31T09:00:00+08:00");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = mockCategories.find((c) => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(estimatedWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error("Bobot Tidak Valid", "Estimasi bobot harus lebih dari 0 kg.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        "Permintaan Setoran Terkirim (Pratinjau)",
        "Permintaan Anda telah masuk antrean penjemputan petugas TPS3R banjar."
      );
      router.push("/app/setoran");
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Buat Permintaan Setoran Sampah"
        description="Pilih kategori sampah yang telah dipilah dan atur jadwal penjemputan oleh petugas TPS3R."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Setoran", href: "/app/setoran" },
          { label: "Setoran Baru" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Kategori */}
        <Panel
          title="1. Pilih Kategori Sampah Terpilah"
          subtitle="Pastikan sampah sudah dibersihkan dari minyak dan residu kotoran."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockCategories.map((cat) => {
              const isSelected = cat.id === categoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-brand-900 bg-brand-100/40 shadow-sm"
                      : "border-border bg-surface hover:border-brand-700/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-900">
                      {cat.code}
                    </span>
                    <span className="text-xs font-semibold text-[#276749]">
                      +{cat.pointRate} poin/kg
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-brand-900 mt-2">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {selectedCategory && (
            <div className="mt-4 p-3 rounded-lg bg-[#E7F4EA] border border-[#BCE1C7] text-xs text-[#276749] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Standar: <strong>{selectedCategory.contaminationThreshold}</strong>.
              </span>
            </div>
          )}
        </Panel>

        {/* Step 2: Metode & Bobot */}
        <Panel
          title="2. Metode Penyerahan & Estimasi Bobot"
          subtitle="Tentukan apakah petugas menjemput ke rumah atau Anda membawa ke pos TPS3R banjar."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickupType("pickup")}
                className={`p-3.5 rounded-xl border text-left transition-colors ${
                  pickupType === "pickup"
                    ? "border-brand-900 bg-brand-900 text-white font-semibold"
                    : "border-border bg-surface text-text-primary hover:bg-[#F3F5F3]"
                }`}
              >
                <div className="text-sm">Dijemput Petugas</div>
                <div className={`text-xs mt-0.5 ${pickupType === "pickup" ? "text-brand-100" : "text-text-secondary"}`}>
                  Petugas TPS3R mendatangi rumah Anda
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPickupType("dropoff")}
                className={`p-3.5 rounded-xl border text-left transition-colors ${
                  pickupType === "dropoff"
                    ? "border-brand-900 bg-brand-900 text-white font-semibold"
                    : "border-border bg-surface text-text-primary hover:bg-[#F3F5F3]"
                }`}
              >
                <div className="text-sm">Antar Sendiri ke Pos</div>
                <div className={`text-xs mt-0.5 ${pickupType === "dropoff" ? "text-brand-100" : "text-text-secondary"}`}>
                  Drop-off ke Pos Kompos Banjar Sukawati
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Estimasi Bobot (Kilogram)"
                type="number"
                step="0.1"
                min="0.5"
                required
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(e.target.value)}
                placeholder="Contoh: 3.5"
                helperText="Bobot final akan ditimbang resmi oleh timbangan digital petugas"
              />

              <Select
                label="Pilihan Slot Waktu Penjemputan"
                required
                value={scheduledSlot}
                onChange={(e) => setScheduledSlot(e.target.value)}
                options={[
                  {
                    value: "2026-10-31T09:00:00+08:00",
                    label: "Sabtu, 31 Okt 2026 (08:30 - 10:00 WITA)",
                  },
                  {
                    value: "2026-11-02T09:00:00+08:00",
                    label: "Senin, 02 Nov 2026 (08:30 - 10:00 WITA)",
                  },
                  {
                    value: "2026-11-04T09:00:00+08:00",
                    label: "Rabu, 04 Nov 2026 (08:30 - 10:00 WITA)",
                  },
                ]}
              />
            </div>

            {pickupType === "pickup" && (
              <Input
                label="Alamat Penjemputan di Banjar"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nama jalan, nomor rumah, atau patokan di banjar"
              />
            )}

            <Textarea
              label="Catatan Tambahan untuk Petugas (Opsional)"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sampah dimasukkan dalam 2 karung terikat di samping garasi."
            />
          </div>
        </Panel>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/app/setoran">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Batal
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Kirim Permintaan Setoran
          </Button>
        </div>
      </form>
    </div>
  );
}
