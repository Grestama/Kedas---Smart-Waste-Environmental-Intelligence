"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Clock, PlusCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { fetchServiceAreas, fetchSlotsForArea } from "@/services/collection";
import { createServiceArea, createCollectionSlot } from "@/services/admin";
import { ServiceArea, CollectionSlot } from "@/types/collection";

export default function AdminAreaSchedulePage() {
  const { showToast } = useToast();

  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [slots, setSlots] = useState<CollectionSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Area Modal State
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaCode, setAreaCode] = useState("");
  const [areaName, setAreaName] = useState("");
  const [administrativeArea, setAdministrativeArea] = useState("");
  const [isSubmittingArea, setIsSubmittingArea] = useState(false);

  // Slot Modal State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotEndTime, setSlotEndTime] = useState("11:30");
  const [slotCapacity, setSlotCapacity] = useState("15");
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

  const loadAreas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchServiceAreas();
      setAreas(data);
      if (data.length > 0 && !selectedAreaId) {
        setSelectedAreaId(data[0].id);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat wilayah layanan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedAreaId) return;
    const loadSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const slotData = await fetchSlotsForArea(selectedAreaId);
        setSlots(slotData);
      } catch {
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedAreaId]);

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaCode.trim() || !areaName.trim()) {
      showToast("error", "Kode dan nama wilayah wajib diisi.");
      return;
    }

    setIsSubmittingArea(true);
    try {
      const created = await createServiceArea({
        code: areaCode.trim().toUpperCase(),
        name: areaName.trim(),
        administrative_area: administrativeArea.trim() || "Kecamatan Sukawati, Gianyar",
        is_active: true,
      });
      showToast("success", `Wilayah layanan ${created.name} berhasil dibuat.`);
      setIsAreaModalOpen(false);
      setAreaCode("");
      setAreaName("");
      setAdministrativeArea("");
      await loadAreas();
      setSelectedAreaId(created.id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menambah wilayah layanan.";
      showToast("error", msg);
    } finally {
      setIsSubmittingArea(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAreaId) return;

    setIsSubmittingSlot(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const startIso = `${today}T${slotStartTime}:00+08:00`;
      const endIso = `${today}T${slotEndTime}:00+08:00`;

      await createCollectionSlot(selectedAreaId, {
        service_area_id: selectedAreaId,
        start_time: startIso,
        end_time: endIso,
        max_capacity: parseInt(slotCapacity, 10) || 10,
        is_active: true,
      });

      showToast("success", "Slot jadwal penjemputan berhasil ditambahkan.");
      setIsSlotModalOpen(false);

      // Refresh slots
      const slotData = await fetchSlotsForArea(selectedAreaId);
      setSlots(slotData);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menambah slot jadwal.";
      showToast("error", msg);
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wilayah Layanan & Kapasitas Jadwal Slot"
        description="Pengaturan zona penjemputan banjar, batas kapasitas slot harian, dan ketersediaan kuota armada."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Area & Jadwal", active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAreas}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Segarkan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAreaModalOpen(true)}
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Tambah Area Baru
            </Button>
          </div>
        }
      />

      {/* Main Grid: Area selector on left, Slots on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Areas List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Daftar Wilayah Layanan Aktif ({areas.length})
          </h3>

          {isLoading ? (
            <LoadingSkeleton className="h-36 rounded-xl" />
          ) : error ? (
            <ErrorState title="Gagal Memuat Area" description={error} onRetry={loadAreas} />
          ) : (
            <div className="space-y-2">
              {areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedAreaId === area.id
                      ? "bg-brand-50 border-brand-700 shadow-xs"
                      : "bg-surface border-border hover:border-brand-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-900">
                      {area.code}
                    </span>
                    <span className="text-[10px] font-bold text-[#2E6B4F] bg-[#E7F4EA] px-2 py-0.5 rounded-full">
                      AKTIF
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary mt-1.5">
                    {area.name}
                  </h4>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                    {area.administrative_area}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (2 Cols): Slots for Selected Area */}
        <div className="lg:col-span-2 space-y-4">
          <Panel className="p-5 bg-surface border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Kapasitas Slot Penjemputan
                </span>
                <h3 className="text-base font-bold text-brand-900">
                  {selectedArea?.name || "Pilih Wilayah Layanan"}
                </h3>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedAreaId}
                onClick={() => setIsSlotModalOpen(true)}
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Tambah Slot Jadwal
              </Button>
            </div>

            {isLoadingSlots ? (
              <LoadingSkeleton className="h-32 rounded-xl" />
            ) : slots.length === 0 ? (
              <EmptyState
                title="Belum Ada Slot Jadwal Penjemputan"
                description="Tambahkan slot waktu penjemputan dan tentukan kapasitas batas muatan armada untuk banjar ini."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsSlotModalOpen(true)}
                  >
                    Tambah Slot Pertama
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => {
                  const isFull = slot.remaining_capacity <= 0;
                  const capacityPct =
                    slot.max_capacity > 0
                      ? Math.round(
                          (slot.booked_capacity / slot.max_capacity) * 100
                        )
                      : 0;

                  return (
                    <div
                      key={slot.id}
                      className="p-4 rounded-xl border border-border bg-canvas/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-brand-700 shrink-0" />
                          <span className="text-sm font-bold text-text-primary">
                            {new Date(slot.start_time).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Makassar",
                            })}{" "}
                            -{" "}
                            {new Date(slot.end_time).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Makassar",
                            })}{" "}
                            WITA
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          Kuota Terisi: <strong>{slot.booked_capacity}</strong> dari{" "}
                          <strong>{slot.max_capacity}</strong> setoran
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              isFull
                                ? "bg-[#FBEAE7] text-[#A43F35]"
                                : "bg-[#E7F4EA] text-[#276749]"
                            }`}
                          >
                            {isFull
                              ? "Kuota Penuh"
                              : `Sisa ${slot.remaining_capacity} Kuota`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Add Area Modal */}
      <Modal
        isOpen={isAreaModalOpen}
        onClose={() => {
          if (!isSubmittingArea) setIsAreaModalOpen(false);
        }}
        title="Daftarkan Wilayah Layanan Baru"
      >
        <form onSubmit={handleCreateArea} className="space-y-4">
          <Input
            label="Kode Unik Wilayah *"
            placeholder="Contoh: SA_SUKAWATI_KAJA"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value.toUpperCase())}
            required
          />
          <Input
            label="Nama Wilayah / Banjar *"
            placeholder="Contoh: Banjar Kaja Sukawati"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            required
          />
          <Input
            label="Wilayah Administratif *"
            placeholder="Contoh: Desa Sukawati, Kec. Sukawati, Gianyar"
            value={administrativeArea}
            onChange={(e) => setAdministrativeArea(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmittingArea}
              onClick={() => setIsAreaModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingArea}
            >
              {isSubmittingArea ? "Menyimpan..." : "Simpan Wilayah"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => {
          if (!isSubmittingSlot) setIsSlotModalOpen(false);
        }}
        title={`Tambah Slot Jadwal: ${selectedArea?.name}`}
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai (WITA) *"
              type="time"
              value={slotStartTime}
              onChange={(e) => setSlotStartTime(e.target.value)}
              required
            />
            <Input
              label="Jam Selesai (WITA) *"
              type="time"
              value={slotEndTime}
              onChange={(e) => setSlotEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Kapasitas Maksimal Setoran (Batas Armada) *"
            type="number"
            min="1"
            max="100"
            value={slotCapacity}
            onChange={(e) => setSlotCapacity(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmittingSlot}
              onClick={() => setIsSlotModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingSlot}
            >
              {isSubmittingSlot ? "Menyimpan..." : "Tambah Slot"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
