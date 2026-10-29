"use client";

import React, { useState } from "react";
import {
  MobilePhoneFrame,
  MobileTab,
} from "@/components/shells/MobilePhoneFrame";
import {
  Package,
  PlusCircle,
  Coins,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { mockUsers, mockRequests, mockCategories } from "@/mocks/previewData";
import { formatWITA, formatWeightKg, formatPoints } from "@/tokens";
import { useToast } from "@/components/ui/Toast";

export default function MobileSimulatorPage() {
  const toast = useToast();
  const [tab, setTab] = useState<MobileTab>("beranda");
  const user = mockUsers.warga;
  const latestRequest = mockRequests[0];

  // Mobile deposit form states
  const [mobileCategory, setMobileCategory] = useState("cat_anorganik_pet");
  const [mobileWeight, setMobileWeight] = useState("3.5");
  const [mobileSubmitted, setMobileSubmitted] = useState(false);

  const handleMobileDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileSubmitted(true);
    toast.success(
      "Setoran Berhasil Dibuat (Mobile)",
      "Permintaan penjemputan Anda telah dijadwalkan."
    );
    setTimeout(() => {
      setMobileSubmitted(false);
      setTab("aktivitas");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-canvas py-6">
      <MobilePhoneFrame activeTab={tab} onTabChange={setTab}>
        {/* TAB 1: BERANDA */}
        {tab === "beranda" && (
          <div className="p-4 space-y-4">
            {/* Header Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold block">
                  {user.banjar}
                </span>
                <h2 className="text-base font-bold text-brand-900">
                  Om Swastiastu, Wayan
                </h2>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                WS
              </div>
            </div>

            {/* WastePoints Mobile Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1D3F35] to-[#2F6552] text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-brand-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <Coins className="w-4 h-4 text-amber-300" /> Saldo WastePoints
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                  Buku Besar
                </span>
              </div>
              <div className="text-2xl font-black tracking-tight">
                {formatPoints(user.pointsBalance)}
              </div>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-brand-100/90">
                <span>Total Disetor: {formatWeightKg(user.totalKgDeposited)}</span>
                <button
                  type="button"
                  onClick={() => setTab("poin")}
                  className="font-semibold underline hover:no-underline"
                >
                  Detail &rarr;
                </button>
              </div>
            </div>

            {/* Prominent Action Button */}
            <button
              type="button"
              onClick={() => setTab("setor")}
              className="w-full py-3 px-4 rounded-xl bg-brand-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Jadwalkan Setoran Sampah</span>
            </button>

            {/* Active Deposit Card */}
            {latestRequest && (
              <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-900">
                    Setoran Aktif ({latestRequest.id})
                  </span>
                  <StatusBadge
                    variant={getStatusBadgeConfig(latestRequest.status).variant}
                    label={getStatusBadgeConfig(latestRequest.status).label}
                    size="sm"
                  />
                </div>
                <p className="text-[11px] text-text-secondary">
                  {latestRequest.category_name} &bull; Est. {formatWeightKg(latestRequest.estimated_weight)}
                </p>
                <div className="text-[10px] text-brand-700 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatWITA(latestRequest.scheduled_at)}</span>
                </div>
              </div>
            )}

            {/* Category Quick Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-900 block">
                Kategori Terpilah Banjar
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {mockCategories.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setMobileCategory(c.id);
                      setTab("setor");
                    }}
                    className="p-2.5 rounded-xl bg-surface border border-border cursor-pointer hover:border-brand-900 active:bg-brand-100/30 transition-all"
                  >
                    <span className="text-[9px] font-mono font-bold text-brand-900 bg-brand-100 px-1.5 py-0.5 rounded">
                      +{c.pointRate} pt/kg
                    </span>
                    <p className="font-bold text-brand-900 text-[11px] mt-1.5 truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-text-secondary line-clamp-1">
                      {c.contaminationThreshold}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SETOR */}
        {tab === "setor" && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-base font-bold text-brand-900">
                Setor Sampah Terpilah
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Petugas TPS3R menjemput ke alamat Anda di Banjar Kaja Sukawati.
              </p>
            </div>

            <form onSubmit={handleMobileDepositSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                  Pilih Kategori Sampah
                </label>
                <select
                  value={mobileCategory}
                  onChange={(e) => setMobileCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700"
                >
                  {mockCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (+{c.pointRate} poin/kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                  Estimasi Bobot (Kilogram)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={mobileWeight}
                  onChange={(e) => setMobileWeight(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700"
                  placeholder="3.5"
                  required
                />
                <span className="text-[10px] text-text-secondary mt-1 block">
                  Bobot final akan ditimbang resmi oleh petugas dengan timbangan digital.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                  Pilihan Jadwal Jemput
                </label>
                <select className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700">
                  <option>Sabtu, 31 Okt (08:30 - 10:00 WITA)</option>
                  <option>Senin, 02 Nov (08:30 - 10:00 WITA)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                  Alamat Rumah
                </label>
                <input
                  type="text"
                  readOnly
                  value="Banjar Kaja, Jl. Kenanga No. 14"
                  className="w-full h-10 px-3 rounded-lg bg-canvas border border-border text-xs text-text-secondary"
                />
              </div>

              <button
                type="submit"
                disabled={mobileSubmitted}
                className="w-full py-3 rounded-xl bg-brand-900 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                {mobileSubmitted ? "Mengirim..." : "Konfirmasi & Kirim Setoran"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: AKTIVITAS */}
        {tab === "aktivitas" && (
          <div className="p-4 space-y-3">
            <h3 className="text-base font-bold text-brand-900">
              Riwayat & Aktivitas Setor
            </h3>

            <div className="space-y-2 text-xs">
              {mockRequests.map((req) => {
                const b = getStatusBadgeConfig(req.status);
                return (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-surface border border-border shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-900 text-[11px]">
                        {req.id}
                      </span>
                      <StatusBadge variant={b.variant} label={b.label} size="sm" />
                    </div>
                    <p className="font-semibold text-text-primary text-xs">
                      {req.category_name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 border-t border-border">
                      <span>
                        {req.actual_weight
                          ? formatWeightKg(req.actual_weight)
                          : `Est. ${formatWeightKg(req.estimated_weight)}`}
                      </span>
                      {req.points_earned && (
                        <span className="font-bold text-[#276749]">
                          +{req.points_earned} Poin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: POIN */}
        {tab === "poin" && (
          <div className="p-4 space-y-4">
            <div className="p-4 rounded-2xl bg-brand-900 text-white space-y-2 text-center">
              <span className="text-xs text-brand-100">Saldo WastePoints</span>
              <div className="text-3xl font-extrabold tracking-tight">
                {formatPoints(user.pointsBalance)}
              </div>
              <p className="text-[10px] text-brand-100/80">
                Buku besar diverifikasi sistem banjar desa
              </p>
            </div>

            {/* Catalog notice banner */}
            <div className="p-3 rounded-xl bg-[#FAFBF9] border border-border text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-brand-900 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Katalog Penukaran Segera Hadir</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Poin Anda tersimpan permanen dan dapat ditukarkan pupuk kompos banjar atau sembako BUMDes pada paruman November.
              </p>
            </div>

            {/* Mini Ledger */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-900 block">
                Mutasi Buku Besar Poin
              </span>
              <div className="divide-y divide-border bg-surface rounded-xl border border-border text-xs">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-xs">Setoran Organik</span>
                    <span className="text-[10px] text-text-secondary">28 Okt 2026</span>
                  </div>
                  <span className="font-bold text-[#276749]">+82 Poin</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-xs">Setoran PET Bersih</span>
                    <span className="text-[10px] text-text-secondary">21 Okt 2026</span>
                  </div>
                  <span className="font-bold text-[#276749]">+150 Poin</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AKUN */}
        {tab === "akun" && (
          <div className="p-4 space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="w-12 h-12 rounded-full bg-brand-900 text-white flex items-center justify-center text-sm font-bold">
                WS
              </div>
              <div>
                <h3 className="font-bold text-brand-900 text-sm">
                  {user.name}
                </h3>
                <span className="text-[11px] text-text-secondary block">
                  {user.phone}
                </span>
                <span className="text-[10px] font-semibold text-[#276749]">
                  {user.banjar}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-text-secondary tracking-wider block">
                Bantuan & Informasi
              </span>
              <div className="bg-surface rounded-xl border border-border divide-y divide-border">
                <a
                  href="tel:081234567890"
                  className="p-3 flex items-center justify-between hover:bg-canvas transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-700" /> Kontak Pos TPS3R Banjar
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
                </a>
                <div
                  onClick={() => setTab("beranda")}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-canvas transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-700" /> Standar Pemilahan Bersih
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-text-secondary">
              WasteLink Bali Mobile v0.1.0 (Pilot Banjar Sukawati)
            </div>
          </div>
        )}
      </MobilePhoneFrame>
    </div>
  );
}
