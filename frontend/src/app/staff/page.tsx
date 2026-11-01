"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Scale,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  ExternalLink,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { getCollectorStats, fetchMyTasks } from "@/services/staff";
import { CollectorDashboardStats, CollectorTask } from "@/types/staff";

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<CollectorDashboardStats | null>(null);
  const [activeTasks, setActiveTasks] = useState<CollectorTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, myTasks] = await Promise.all([
        getCollectorStats(),
        fetchMyTasks(),
      ]);
      setStats(statsData);
      setActiveTasks(
        myTasks.filter(
          (t) => t.status !== "COMPLETED" && t.status !== "CANCELLED"
        )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat ringkasan operasional petugas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Terminal POS Lapangan Petugas"
          description="Memuat data operasional harian..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-28 rounded-2xl" />
          <LoadingSkeleton className="h-28 rounded-2xl" />
          <LoadingSkeleton className="h-28 rounded-2xl" />
          <LoadingSkeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Terminal POS Lapangan Petugas"
          description="Operasional penjemputan, inspeksi QC, dan timbangan digital"
        />
        <ErrorState
          title="Gagal Memuat Dashboard Petugas"
          description={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const primaryTask = activeTasks.length > 0 ? activeTasks[0] : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header with Field Operations Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
              TPS3R Banjar Sukawati
            </span>
            <span className="text-xs text-text-muted">&bull;</span>
            <span className="text-xs text-text-secondary font-medium">
              Shift Operasional Pagi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Meja Operasional Petugas
          </h1>
          <p className="text-xs text-text-secondary mt-0.5 max-w-2xl">
            Pusat komando lapangan: klaim tugas banjar, inspeksi mutu QC, verifikasi timbangan digital, dan penerbitan sertifikat tara-bruto.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan
          </Button>
          <Link href="/staff/tugas/tersedia">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Truck className="w-4 h-4" />}
            >
              Antrean Tugas ({stats?.available_count ?? 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tugas Tersedia di Pool"
          value={stats?.available_count ?? 0}
          unit="Permintaan"
          icon={<Truck className="w-5 h-5 text-brand-700" />}
        />
        <StatCard
          label="Tugas Aktif Saya"
          value={stats?.my_active_count ?? 0}
          unit="Penjemputan"
          icon={<Clock className="w-5 h-5 text-[#98631C]" />}
        />
        <StatCard
          label="Selesai Hari Ini"
          value={stats?.completed_today_count ?? 0}
          unit="Setoran"
          icon={<CheckCircle2 className="w-5 h-5 text-[#247A55]" />}
        />
        <StatCard
          label="Total Ditimbang"
          value={stats?.total_tonnage_kg ?? 0}
          unit="Kg"
          icon={<Scale className="w-5 h-5 text-brand-900" />}
        />
      </div>

      {/* Primary In-Progress Task Banner */}
      {primaryTask ? (
        <section
          aria-label="Tugas Sedang Berjalan"
          className="rounded-2xl border-2 border-[#1D3F35] bg-surface shadow-sm overflow-hidden hover:shadow-interactive-hover hover:-translate-y-1 transition-all duration-fast ease-soft cursor-pointer"
        >
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-[#122620] to-[#1D3F35] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Tugas Sedang Berjalan
              </span>
              <StatusBadge status={primaryTask.status} />
              <span className="text-xs font-mono font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded">
                {primaryTask.public_code}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>{primaryTask.slot_time_display || "Jadwal Hari Ini"}</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary">
                    Kategori & Estimasi Bobot
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mt-0.5 flex items-center gap-2">
                    {primaryTask.category_name || "Sampah Terpilah"}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F0E9] text-[#1D3F35]">
                      Estimasi: {primaryTask.estimated_weight_kg || 0} kg
                    </span>
                  </h3>
                </div>

                {/* Location and Citizen Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-canvas border-2 border-border hover:border-brand-800 hover:-translate-y-0.5 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
                    <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-text-secondary block">
                        Alamat Penjemputan
                      </span>
                      <p className="text-xs font-semibold text-text-primary mt-0.5 leading-snug">
                        {primaryTask.address_display}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-canvas border-2 border-border hover:border-brand-800 hover:-translate-y-0.5 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
                    <Phone className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-text-secondary block">
                        Kontak Warga Setoran
                      </span>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">
                        {primaryTask.citizen_name || "Warga Terdaftar"}
                      </p>
                      {primaryTask.citizen_phone && (
                        <a
                          href={`tel:${primaryTask.citizen_phone}`}
                          className="text-xs text-brand-700 hover:text-brand-900 font-semibold inline-flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          {primaryTask.citizen_phone}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Citizen Notes Callout */}
                {primaryTask.notes && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950">
                    <MessageSquare className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[11px] text-amber-900">
                        Catatan Khusus dari Warga:
                      </span>
                      <p className="mt-0.5 text-amber-900/90 leading-relaxed font-sans">
                        &ldquo;{primaryTask.notes}&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
                <Link href={`/staff/tugas/${primaryTask.id}`} className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center text-sm font-semibold shadow-md min-h-[46px]"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Buka Terminal Timbang & QC
                  </Button>
                </Link>
                <Link href="/staff/tugas/saya" className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-xs"
                  >
                    Kelola Semua Tugas ({activeTasks.length})
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <Panel className="bg-canvas border border-dashed border-border text-center py-8">
          <Truck className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
          <h4 className="text-base font-bold text-text-primary">
            Tidak Ada Tugas Aktif Sedang Berjalan
          </h4>
          <p className="text-xs text-text-secondary max-w-md mx-auto mt-1 mb-5">
            Anda belum mengambil tugas penjemputan. Periksa antrean pool banjar untuk mengklaim setoran warga terdekat.
          </p>
          <Link href="/staff/tugas/tersedia">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Truck className="w-4 h-4" />}
            >
              Lihat Antrean Tugas Tersedia
            </Button>
          </Link>
        </Panel>
      )}

      {/* Safety Notice & Hazardous Waste Policy */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-amber-950 shadow-xs hover:border-amber-300 hover:-translate-y-0.5 hover:shadow-interactive transition-all duration-fast ease-soft">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs flex-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                SOP Lapangan & Keselamatan Kerja
              </span>
              <h4 className="text-sm font-bold text-amber-950 mt-1">
                Prosedur Keselamatan Kerja & Kebijakan B3 TPS3R Banjar Sukawati
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white/70 rounded-xl border-2 border-amber-200/60 hover:border-amber-400 hover:-translate-y-0.5 transition-all duration-fast ease-soft space-y-1">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Standar APD Wajib Digunakan
                </span>
                <p className="text-amber-900/90 leading-relaxed">
                  Wajib mengenakan sarung tangan karet tebal, masker respirator, dan sepatu boot tertutup sebelum mengangkat wadah sampah warga.
                </p>
              </div>

              <div className="p-3 bg-white/70 rounded-xl border-2 border-amber-200/60 hover:border-amber-400 hover:-translate-y-0.5 transition-all duration-fast ease-soft space-y-1">
                <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Protokol Penolakan Limbah B3 / Medis
                </span>
                <p className="text-amber-900/90 leading-relaxed">
                  Apabila menemukan jarum suntik, baterai aki basah, atau cairan kimia berbahaya: <strong>DILARANG ANGKUT</strong>. Berikan status QC <em>REJECTED</em> kode B3 dan laporkan ke koordinator TPS3R.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/staff/tugas/tersedia" className="group block">
          <Panel interactive className="p-5 h-full border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft flex flex-col justify-between cursor-pointer">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                  <Truck className="w-5 h-5 text-brand-800" />
                </div>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {stats?.available_count ?? 0} Tersedia
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-900 transition-colors">
                  Antrean Tugas Tersedia
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">
                  Klaim permintaan penjemputan warga yang siap diambil di area banjar Anda.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-border mt-4 flex items-center justify-between text-xs font-bold text-brand-700 group-hover:text-brand-900">
              <span>Buka Antrean Pool</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Panel>
        </Link>

        <Link href="/staff/tugas/saya" className="group block">
          <Panel interactive className="p-5 h-full border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft flex flex-col justify-between cursor-pointer">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                  <ClipboardList className="w-5 h-5 text-brand-800" />
                </div>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {activeTasks.length} Berjalan
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-900 transition-colors">
                  Tugas Saya ({activeTasks.length})
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">
                  Kelola status perjalanan, panduan rute alamat, dan verifikasi kontak warga setoran.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-border mt-4 flex items-center justify-between text-xs font-bold text-brand-700 group-hover:text-brand-900">
              <span>Kelola Tugas Saya</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Panel>
        </Link>

        <Link href="/staff/riwayat" className="group block">
          <Panel interactive className="p-5 h-full border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft flex flex-col justify-between cursor-pointer">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                  <Scale className="w-5 h-5 text-brand-800" />
                </div>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#E8F0E9] text-[#1D3F35] border border-[#D7E4D9]">
                  {stats?.completed_today_count ?? 0} Selesai
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-900 transition-colors">
                  Riwayat & Log Timbang
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">
                  Audit verifikasi timbangan digital, versi berat tara-bruto, dan arsip foto bukti timbang.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-border mt-4 flex items-center justify-between text-xs font-bold text-brand-700 group-hover:text-brand-900">
              <span>Lihat Riwayat Selesai</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
