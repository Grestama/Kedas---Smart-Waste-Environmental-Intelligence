"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { collectionService } from "@/services/collection";
import {
  WasteCategory,
  CollectionSlot,
} from "@/types/collection";
import { Address } from "@/types/auth";
import { formatWITA } from "@/tokens";
import { ApiError } from "@/lib/api-client";

export default function NewDepositPage() {
  const router = useRouter();
  const toast = useToast();

  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [serviceMode, setServiceMode] = useState<"PICKUP" | "DROP_OFF">("PICKUP");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [slots, setSlots] = useState<CollectionSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [estimatedWeight, setEstimatedWeight] = useState("3.5");
  const [notes, setNotes] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load categories and addresses on mount
  useEffect(() => {
    async function initData() {
      setIsLoadingData(true);
      try {
        const [cats, addrs] = await Promise.all([
          collectionService.getCategories(),
          collectionService.getMyAddresses(),
        ]);

        setCategories(cats);
        if (cats.length > 0) {
          // Default to first non-SPECIAL category
          const defaultCat = cats.find((c) => c.category_type !== "SPECIAL") || cats[0];
          setSelectedCategoryId(defaultCat.id);
        }

        setAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        }

        // Fetch slots for the first area
        const areaId = addrs[0]?.service_area_id || "area_sukawati_kaja";
        const availableSlots = await collectionService.getAreaSlots(areaId);
        setSlots(availableSlots);
        if (availableSlots.length > 0) {
          setSelectedSlotId(availableSlots[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat opsi form setoran:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    initData();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const isSpecialCategory = selectedCategory?.category_type === "SPECIAL";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Safety Gating Check (Frontend guard)
    if (isSpecialCategory) {
      setErrorMessage(
        "Kategori ini diklasifikasikan sebagai B3/Residu Khusus. Regulasi banjar melarang penjemputan mandiri demi keselamatan petugas."
      );
      toast.error(
        "Kategori Ditolak (Safety Gating)",
        "Limbah B3/Khusus wajib diserahkan langsung ke TPS3R sesuai jadwal khusus."
      );
      return;
    }

    const weightNum = parseFloat(estimatedWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorMessage("Estimasi bobot harus lebih dari 0 kg.");
      return;
    }

    if (!selectedAddressId) {
      setErrorMessage("Silakan pilih alamat penjemputan.");
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage("Silakan pilih slot waktu penjemputan yang tersedia.");
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `wlb_web_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      const created = await collectionService.createPickupRequest({
        category_id: selectedCategoryId,
        address_id: selectedAddressId,
        slot_id: selectedSlotId,
        service_mode: serviceMode,
        idempotency_key: idempotencyKey,
        estimated_weight_kg: weightNum,
        notes: notes.trim() || undefined,
      });

      const modeText =
        serviceMode === "DROP_OFF"
          ? "Setoran Mandiri TPS3R"
          : "Penjemputan Armada Trike";

      toast.success(
        "Permintaan Setoran Berhasil Dibuat",
        `Kode: ${created.public_code} (${modeText}). Status dapat dipantau secara real-time.`
      );
      router.push(`/app/setoran/${created.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan saat mengirimkan permintaan setoran.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader
          title="Buat Permintaan Setoran Sampah"
          description="Memuat data kategori, alamat, dan slot jadwal penjemputan..."
        />
        <div className="p-8 rounded-xl bg-surface border border-border flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-text-secondary">
            Menyiapkan formulir setoran...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Buat Permintaan Setoran Sampah"
        description="Pilih kategori sampah yang telah dipilah, tentukan alamat dan slot penjemputan TPS3R."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Setoran", href: "/app/setoran" },
          { label: "Setoran Baru" },
        ]}
      />

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#FBEAE7] border border-[#F5C6BF] text-[#A43F35] text-xs flex items-start gap-2.5"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Perhatian: Permintaan Tidak Dapat Dikirim</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Mode Layanan */}
        <Panel
          title="1. Jalur Penyerahan Sampah"
          subtitle="Pilih apakah sampah dijemput armada motor roda tiga banjar atau Anda serahkan langsung ke TPS3R."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setServiceMode("PICKUP")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                serviceMode === "PICKUP"
                  ? "border-brand-900 bg-brand-100/40 shadow-sm"
                  : "border-border bg-surface hover:border-brand-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-900">
                  ARMADA TRIKE
                </span>
                <span className="text-xs font-semibold text-brand-900">Dijemput</span>
              </div>
              <h4 className="text-sm font-bold text-brand-900 mt-2">
                Penjemputan ke Rumah (Pickup)
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                Petugas kebersihan banjar menjemput sampah terpilah langsung di depan pekarangan atau toko Anda.
              </p>
            </div>

            <div
              onClick={() => setServiceMode("DROP_OFF")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                serviceMode === "DROP_OFF"
                  ? "border-brand-900 bg-brand-100/40 shadow-sm"
                  : "border-border bg-surface hover:border-brand-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  POS TPS3R
                </span>
                <span className="text-xs font-semibold text-[#276749]">Mandiri</span>
              </div>
              <h4 className="text-sm font-bold text-brand-900 mt-2">
                Setoran Mandiri ke TPS3R (Drop-Off)
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                Bawa sampah langsung ke fasilitas Pos Penerimaan TPS3R Sukawati (Senin–Sabtu 08:00–15:00 WITA).
              </p>
            </div>
          </div>

          {serviceMode === "DROP_OFF" && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
              <span>
                <strong>Petunjuk Setor Mandiri:</strong> Bawa sampah terpilah ke Pos TPS3R Sukawati sesuai jadwal. Tunjukkan kode setoran ke petugas timbang fasilitas untuk verifikasi bobot instan dan pencatatan WastePoints langsung.
              </span>
            </div>
          )}
        </Panel>

        {/* Step 2: Kategori */}
        <Panel
          title="2. Pilih Kategori Sampah Terpilah"
          subtitle="Pastikan material telah dibersihkan sesuai standar kebersihan banjar."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              const isSpecial = cat.category_type === "SPECIAL";

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? isSpecial
                        ? "border-[#A43F35] bg-[#FBEAE7] shadow-sm"
                        : "border-brand-900 bg-brand-100/40 shadow-sm"
                      : "border-border bg-surface hover:border-brand-700/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isSpecial
                          ? "bg-[#A43F35] text-white"
                          : "bg-brand-100 text-brand-900"
                      }`}
                    >
                      {cat.code}
                    </span>
                    {isSpecial ? (
                      <span className="text-[11px] font-bold text-[#A43F35]">
                        Safety Gating
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#276749]">
                        +{cat.pointRate || 20} poin/kg
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-brand-900 mt-2">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {selectedCategory && (
            <div className="mt-4">
              {isSpecialCategory ? (
                <div className="p-3.5 rounded-lg bg-[#FBEAE7] border border-[#F5C6BF] text-xs text-[#A43F35] flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Peringatan Regulasi Khusus:</strong> Kategori ini mengandung potensi racun / bahaya fisik. Tidak dapat dijemput menggunakan rute motor roda tiga standar. Silakan serahkan pada drop box TPS3R terjadwal.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-[#E7F4EA] border border-[#BCE1C7] text-xs text-[#276749] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Petunjuk Pemilahan:</strong> {selectedCategory.preparation_guide || "Pastikan material kering dan bebas minyak."}
                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>

        {/* Step 3: Alamat & Jadwal */}
        <Panel
          title="3. Alamat Penjemputan / Asal & Jadwal Slot Banjar"
          subtitle="Pilih lokasi rumah/usaha Anda dan waktu kedatangan atau penyerahan ke TPS3R."
        >
          <div className="space-y-4">
            {/* Address Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Alamat Terdaftar di Banjar
              </label>
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-brand-900 bg-brand-100/30"
                        : "border-border bg-surface hover:bg-[#FAFBF9]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address_choice"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary mt-0.5">
                        {addr.address_text}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Collection Slot Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Pilih Slot Waktu Penjemputan (Sesuai Kuota Harian)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isFull = slot.remaining_capacity <= 0;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => !isFull && setSelectedSlotId(slot.id)}
                      className={`p-3.5 rounded-xl border text-xs transition-colors ${
                        isFull
                          ? "opacity-50 cursor-not-allowed bg-[#FAFBF9] border-border"
                          : isSelected
                          ? "border-brand-900 bg-brand-900 text-white shadow-sm cursor-pointer"
                          : "border-border bg-surface hover:border-brand-700/60 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {formatWITA(slot.start_time, { dateStyle: "medium" })}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            isFull
                              ? "bg-rose-100 text-rose-800"
                              : isSelected
                              ? "bg-white/20 text-white"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isFull ? "Kuota Penuh" : `Sisa ${slot.remaining_capacity} Kuota`}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 opacity-90">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatWITA(slot.start_time, { timeStyle: "short" })} -{" "}
                          {formatWITA(slot.end_time, { timeStyle: "short" })} WITA
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Estimasi Bobot Sampah (Kg)"
                type="number"
                step="0.1"
                min="0.5"
                required
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(e.target.value)}
                placeholder="Contoh: 3.5"
                helperText="Bobot resmi tervalidasi akan ditimbang oleh timbangan digital petugas"
              />

              <Textarea
                label="Catatan Lokasi untuk Petugas (Opsional)"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Sampah dalam karung terikat di dekat garasi motor."
              />
            </div>
          </div>
        </Panel>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/app/setoran">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Batal
            </Button>
          </Link>

          <Button
            type="submit"
            variant={isSpecialCategory ? "danger" : "primary"}
            disabled={isSpecialCategory || isSubmitting}
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isSpecialCategory ? "Kategori Khusus Ditolak" : "Kirim Permintaan Setoran"}
          </Button>
        </div>
      </form>
    </div>
  );
}
