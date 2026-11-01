"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Truck,
  FileText,
  Clock,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { Address } from "@/types/auth";
import { mockUsers } from "@/mocks/previewData";

interface CollectorApp {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  vehicle_type?: string;
  operational_notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export default function UserProfilePage() {
  const toast = useToast();
  const { user, updateProfile, roles, activeRole, switchActiveRole } = useAuth();

  const [name, setName] = useState(user?.full_name || mockUsers.warga.name);
  const [email] = useState(user?.email || mockUsers.warga.email);
  const [phone, setPhone] = useState(user?.phone || mockUsers.warga.phone);
  const [isLoading, setIsLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr_default_01",
      user_id: user?.id || "usr_warga_01",
      label: "Rumah Utama",
      address_text: "Banjar Kaja, Jl. Kenanga No. 14, Desa Sukawati, Gianyar, Bali",
      service_area_id: "area_sukawati_kaja",
      notes: "Pagar depan samping bale dangin",
      is_default: true,
      created_at: new Date().toISOString(),
    },
  ]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("Rumah");
  const [newAddressText, setNewAddressText] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Collector Application state
  const [collectorApp, setCollectorApp] = useState<CollectorApp | null>(null);
  const [isCollectorModalOpen, setIsCollectorModalOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState("Motor Roda Tiga (Viar / Tosa)");
  const [operationalNotes, setOperationalNotes] = useState("");
  const [isSubmittingCollectorApp, setIsSubmittingCollectorApp] = useState(false);

  // Sync state if user updates
  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setPhone(user.phone || "");
    }
  }, [user]);

  // Fetch real addresses and collector application status from backend if available
  useEffect(() => {
    async function fetchData() {
      try {
        const addrData = await apiClient.get<Address[]>("/me/addresses");
        if (addrData && addrData.length > 0) {
          setAddresses(addrData);
        }
      } catch {
        // Keep fallback mock address if backend offline
      }

      try {
        const appData = await apiClient.get<CollectorApp | null>(
          "/collector-applications/mine"
        );
        if (appData) {
          setCollectorApp(appData);
        }
      } catch {
        // Keep null if backend offline
      }
    }
    fetchData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: name,
        phone: phone || undefined,
      });
      toast.success(
        "Profil Berhasil Diperbarui",
        "Data identitas akun warga Anda telah disimpan."
      );
    } catch {
      toast.success(
        "Profil Disimpan (Pratinjau)",
        "Perubahan informasi profil berhasil diperbarui."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;

    try {
      const created = await apiClient.post<Address>("/me/addresses", {
        label: newLabel,
        address_text: newAddressText,
        notes: newNotes,
        is_default: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, created]);
      toast.success("Alamat Ditambahkan", "Alamat baru berhasil disimpan.");
    } catch {
      // Fallback local addition
      const mockAddr: Address = {
        id: `addr_${Date.now()}`,
        user_id: user?.id || "usr_warga_01",
        label: newLabel,
        address_text: newAddressText,
        service_area_id: "area_sukawati_kaja",
        notes: newNotes,
        is_default: false,
        created_at: new Date().toISOString(),
      };
      setAddresses((prev) => [...prev, mockAddr]);
      toast.success("Alamat Disimpan (Pratinjau)", "Alamat baru berhasil ditambahkan.");
    } finally {
      setIsAddressModalOpen(false);
      setNewAddressText("");
      setNewNotes("");
    }
  };

  const handleApplyCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCollectorApp(true);
    try {
      const res = await apiClient.post<CollectorApp>("/collector-applications", {
        vehicle_type: vehicleType,
        operational_notes: operationalNotes,
      });
      setCollectorApp(res);
      setIsCollectorModalOpen(false);
      toast.success(
        "Permohonan Terkirim",
        "Permohonan Anda menjadi petugas pengangkut telah diajukan ke koordinator banjar."
      );
    } catch (err: unknown) {
      toast.error(
        "Gagal Mengajukan",
        err instanceof Error ? err.message : "Terjadi kesalahan sistem."
      );
    } finally {
      setIsSubmittingCollectorApp(false);
    }
  };

  const isCollectorRoleActive = roles.some((r) => r.code === "COLLECTOR");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Profil & Pengaturan Akun Warga"
        description="Kelola informasi pribadi, nomor kontak, daftar alamat penjemputan, dan status peran."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Profil Warga" },
        ]}
      />

      {/* Account Status & Roles Card */}
      <Panel title="Status Akun & Peran Terdaftar">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-text-secondary block">Status Keanggotaan:</span>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge
                variant={user?.account_status === "ACTIVE" ? "success" : "warning"}
                label={user?.account_status === "ACTIVE" ? "Akun Aktif" : user?.account_status || "Aktif"}
              />
              <span className="text-text-secondary">
                Banjar: <strong>{mockUsers.warga.banjar}</strong>
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-text-secondary block">Peran Aktif Saat Ini:</span>
            <span className="inline-block px-2.5 py-1 rounded bg-brand-100 text-brand-900 font-bold mt-1">
              {activeRole}
            </span>
          </div>
        </div>
      </Panel>

      {/* Collector Application Panel */}
      <Panel
        title="Kemitraan Petugas Pengangkut Sampah"
        subtitle="Program pemberdayaan krama banjar untuk bergabung dalam armada resmi penjemputan sampah terpilah Kedas."
      >
        <div className="text-xs space-y-3.5">
          {isCollectorRoleActive ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 block">
                    Peran Petugas Kebersihan Resmi Aktif
                  </span>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Akun Anda telah diverifikasi oleh koordinator banjar untuk menjalankan penjemputan sampah terpilah.
                  </p>
                </div>
              </div>
              <Link href="/staff">
                <Button size="sm" variant="primary" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Buka Meja Petugas
                </Button>
              </Link>
            </div>
          ) : collectorApp?.status === "PENDING" ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900">
                      Permohonan Sedang Ditinjau
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      PENDING
                    </span>
                  </div>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Kendaraan: <strong>{collectorApp.vehicle_type || "-"}</strong>. Koordinator banjar sedang memverifikasi kelaikan armada Anda di pos TPS3R.
                  </p>
                </div>
              </div>
            </div>
          ) : collectorApp?.status === "REJECTED" ? (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-900 block">
                    Permohonan Belum Disetujui
                  </span>
                  <p className="text-rose-700 text-[11px] mt-0.5">
                    Alasan: {collectorApp.rejection_reason || "Tidak memenuhi kriteria kelayakan armada banjar."}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCollectorModalOpen(true)}
              >
                Ajukan Ulang
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-canvas border border-border">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-text-primary block">
                    Tertarik Menjadi Petugas Kebersihan Banjar?
                  </span>
                  <p className="text-text-secondary text-[11px] mt-0.5">
                    Dapatkan insentif operasional dan jadwal penjemputan tetap di lingkungan Banjar Sukawati.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsCollectorModalOpen(true)}
              >
                Ajukan Menjadi Petugas
              </Button>
            </div>
          )}
        </div>
      </Panel>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Panel title="Identitas Krama Banjar">
          <div className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Alamat Email (Akun)"
                value={email || "-"}
                disabled
                helperText="Email digunakan sebagai identitas akun utama"
              />
              <Input
                label="Nomor WhatsApp / HP"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                helperText="Untuk konfirmasi penjemputan petugas TPS3R"
              />
            </div>
          </div>
        </Panel>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Perubahan Profil
          </Button>
        </div>
      </form>

      {/* Addresses Section */}
      <Panel
        title="Daftar Alamat Penjemputan"
        subtitle="Alamat resmi di banjar pilot yang dapat dipilih saat membuat setoran."
        action={
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setIsAddressModalOpen(true)}
          >
            Tambah Alamat
          </Button>
        }
      >
        <div className="divide-y divide-border -mx-5 -my-2 text-xs">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-[#FAFBF9] transition-colors"
            >
              <div className="space-y-1">
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
                <p className="text-text-secondary flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
                  <span>{addr.address_text}</span>
                </p>
                {addr.notes && (
                  <p className="text-[11px] text-text-secondary italic">
                    Patokan: {addr.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Tambah Alamat Penjemputan Baru"
        description="Masukkan alamat lengkap rumah atau lokasi setoran di wilayah banjar pilot."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddAddress}
            >
              Simpan Alamat
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddAddress} className="space-y-3.5">
          <Input
            label="Label Alamat (Contoh: Rumah, Toko, Pos Kamling)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            required
          />
          <Input
            label="Alamat Lengkap Jalan / Gang di Banjar"
            value={newAddressText}
            onChange={(e) => setNewAddressText(e.target.value)}
            placeholder="Contoh: Jl. Kenanga Gang 2 No. 8, Banjar Kaja"
            required
          />
          <Input
            label="Catatan Patokan Lokasi (Opsional)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Contoh: Depan warung Men Rai, pagar hitam"
          />
        </form>
      </Modal>

      {/* Collector Application Modal */}
      <Modal
        isOpen={isCollectorModalOpen}
        onClose={() => setIsCollectorModalOpen(false)}
        title="Formulir Pengajuan Petugas Pengangkut Sampah"
        description="Lengkapi data armada pengangkutan sampah untuk diverifikasi oleh koordinator banjar."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCollectorModalOpen(false)}
              disabled={isSubmittingCollectorApp}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyCollector}
              isLoading={isSubmittingCollectorApp}
            >
              Kirim Permohonan
            </Button>
          </>
        }
      >
        <form onSubmit={handleApplyCollector} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Jenis Kendaraan Pengangkut
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-brand-700"
            >
              <option value="Motor Roda Tiga (Viar / Tosa)">Motor Roda Tiga (Viar / Tosa)</option>
              <option value="Mobil Pick-up Bak Terbuka">Mobil Pick-up Bak Terbuka</option>
              <option value="Gerobak Motor Listrik">Gerobak Motor Listrik</option>
              <option value="Gerobak Dorong Manual">Gerobak Dorong Manual</option>
            </select>
          </div>

          <Textarea
            label="Catatan Pengalaman / Wilayah Tugas yang Diinginkan"
            value={operationalNotes}
            onChange={(e) => setOperationalNotes(e.target.value)}
            placeholder="Contoh: Siap bertugas di area Banjar Kaja & Banjar Tengah setiap hari kerja pk 08:00 - 12:00 WITA."
            rows={3}
          />

          <div className="p-3 rounded-lg bg-canvas border border-border text-[11px] text-text-secondary leading-relaxed space-y-1">
            <span className="font-semibold text-text-primary block">Komitmen Keselamatan Kerja:</span>
            <p>
              Dengan mengirim permohonan ini, saya bersedia mematuhi SOP keselamatan kerja Kedas (menggunakan sarung tangan pelindung, sepatu boot, dan masker) serta menjaga akurasi penimbangan di hadapan warga.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
