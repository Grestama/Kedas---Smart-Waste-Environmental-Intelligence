"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  PackageCheck,
  PlusCircle,
  Truck,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import {
  fetchPartners,
  createPartner,
  fetchBatches,
  dispatchDelivery,
  confirmDeliveryReceipt,
} from "@/services/admin";
import {
  PartnerResponse,
  MaterialBatchResponse,
  DeliveryResponse,
} from "@/types/admin";

export default function AdminPartnersPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"PARTNERS" | "BATCHES" | "DELIVERIES">("PARTNERS");
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [batches, setBatches] = useState<MaterialBatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Partner Modal
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerAddress, setPartnerAddress] = useState("");
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);

  // Delivery Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [confirmingDeliveryId, setConfirmingDeliveryId] = useState<string | null>(null);
  const [dispatchedWeight, setDispatchedWeight] = useState(0);
  const [receivedWeightInput, setReceivedWeightInput] = useState("");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pts, bts] = await Promise.all([fetchPartners(), fetchBatches()]);
      setPartners(pts);
      setBatches(bts);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data mitra dan batch sirkular."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerPhone.trim()) {
      showToast("error", "Nama dan telepon mitra wajib diisi.");
      return;
    }

    setIsSubmittingPartner(true);
    try {
      const created = await createPartner({
        name: partnerName.trim(),
        contact_email: partnerEmail.trim() || "info@mitra.co.id",
        contact_phone: partnerPhone.trim(),
        address: partnerAddress.trim() || "Kawasan Industri Denpasar",
      });
      showToast("success", `Mitra ${created.name} berhasil didaftarkan.`);
      setIsPartnerModalOpen(false);
      setPartnerName("");
      setPartnerEmail("");
      setPartnerPhone("");
      setPartnerAddress("");
      await loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mendaftarkan mitra.";
      showToast("error", msg);
    } finally {
      setIsSubmittingPartner(false);
    }
  };

  const handleConfirmReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingDeliveryId) return;

    const receivedNum = parseFloat(receivedWeightInput);
    if (isNaN(receivedNum) || receivedNum <= 0) {
      showToast("error", "Berat terima harus angka valid lebih dari 0 kg.");
      return;
    }

    setIsSubmittingReceipt(true);
    try {
      await confirmDeliveryReceipt(confirmingDeliveryId, {
        received_weight_kg: receivedNum,
        notes: receiptNotes || null,
      });

      showToast(
        "success",
        `Konfirmasi terima kiriman berhasil dicatat (${receivedNum} kg). Selisih susut tersimpan.`
      );
      setIsReceiptModalOpen(false);
      setConfirmingDeliveryId(null);
      setReceivedWeightInput("");
      setReceiptNotes("");
      await loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengonfirmasi penerimaan kiriman.";
      showToast("error", msg);
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mitra Daur Ulang & Alur Batch Sirkular"
        description="Kelola mitra offtaker industri, agregasi setoran fisik menjadi batch komersial, dan rekap selisih timbangan kirim-terima."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Mitra & Batch", active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Segarkan Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPartnerModalOpen(true)}
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Daftarkan Mitra Baru
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold">
        {[
          { key: "PARTNERS", label: `Mitra Terverifikasi (${partners.length})` },
          { key: "BATCHES", label: `Batch Agregasi (${batches.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-brand-900 text-white shadow-xs"
                : "bg-surface text-text-secondary hover:bg-canvas border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-24 rounded-xl" />
          <LoadingSkeleton className="h-24 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState title="Gagal Memuat Data" description={error} onRetry={loadData} />
      ) : activeTab === "PARTNERS" ? (
        /* Tab 1: Partners List */
        <div className="space-y-3">
          {partners.map((partner) => (
            <Panel
              key={partner.id}
              className="p-5 bg-surface border border-border hover:border-brand-500 transition-colors shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {partner.id}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E7F4EA] text-[#276749]">
                      {partner.verification_status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary">
                    {partner.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-text-muted" />
                      {partner.contact_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-text-muted" />
                      {partner.contact_phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-700" />
                      {partner.address}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="text-xs font-bold text-[#2E6B4F] bg-[#E7F4EA] px-3 py-1 rounded-full border border-[#BCE1C7]">
                    Mitra Terverifikasi
                  </span>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        /* Tab 2: Batches List */
        <div className="space-y-3">
          {batches.map((batch) => (
            <Panel
              key={batch.id}
              className="p-5 bg-surface border border-border shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {batch.batch_code}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-900 uppercase">
                      {batch.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary">
                    Total Berat Batch: {batch.total_weight_kg.toFixed(2)} kg
                  </h3>

                  <p className="text-xs text-text-muted">
                    Memuat {batch.items.length} tiket setoran fisik selesai dari warga.
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="text-xs font-mono font-bold text-brand-900 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200">
                    Siap Dikirim ke Mitra
                  </span>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Register Partner Modal */}
      <Modal
        isOpen={isPartnerModalOpen}
        onClose={() => {
          if (!isSubmittingPartner) setIsPartnerModalOpen(false);
        }}
        title="Daftarkan Mitra Daur Ulang Baru"
      >
        <form onSubmit={handleCreatePartner} className="space-y-4">
          <Input
            label="Nama Perusahaan / Koperasi Mitra *"
            placeholder="Contoh: PT Bali Daur Ulang Mandiri"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Resmi *"
              type="email"
              placeholder="kemitraan@perusahaan.co.id"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              required
            />
            <Input
              label="Nomor Telepon / WhatsApp *"
              placeholder="0812-xxxx-xxxx"
              value={partnerPhone}
              onChange={(e) => setPartnerPhone(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Alamat Gudang / Pabrik Pengolahan *"
            placeholder="Alamat lengkap fasilitas daur ulang offtaker..."
            value={partnerAddress}
            onChange={(e) => setPartnerAddress(e.target.value)}
            rows={2}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmittingPartner}
              onClick={() => setIsPartnerModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingPartner}
            >
              {isSubmittingPartner ? "Menyimpan..." : "Daftarkan Mitra"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
