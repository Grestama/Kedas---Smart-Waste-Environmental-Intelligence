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
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
          <LoadingSkeleton className="h-28 rounded-xl" />
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
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Terminal POS Lapangan Petugas"
        description="Operasional terpadu: klaim tugas banjar, inspeksi QC, timbangan digital bersertifikat, dan pencatatan sampah terpilah."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Segarkan Data
            </Button>
            <Link href="/staff/tugas/tersedia">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Truck className="w-4 h-4" />}
              >
                Antrean Tugas Banjar
              </Button>
            </Link>
          </div>
        }
      />

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
          icon={<CheckCircle2 className="w-5 h-5 text-[#2E6B4F]" />}
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
        <Panel className="border-2 border-brand-700 bg-surface shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-brand-100 text-brand-900 border border-brand-200">
                  Tugas Sedang Berjalan
                </span>
                <StatusBadge status={primaryTask.status} />
                <span className="text-xs font-mono font-semibold text-text-muted">
                  {primaryTask.public_code}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary">
                {primaryTask.category_name} &bull; Estimasi:{" "}
                {primaryTask.estimated_weight_kg || 0} kg
              </h3>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1 font-medium text-text-primary">
                  <MapPin className="w-3.5 h-3.5 text-brand-700" />
                  {primaryTask.address_display}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  {primaryTask.citizen_name} ({primaryTask.citizen_phone})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  {primaryTask.slot_time_display}
                </span>
              </div>
              {primaryTask.notes && (
                <p className="text-xs text-text-muted italic bg-canvas p-2 rounded border border-border">
                  &ldquo;{primaryTask.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link href={`/staff/tugas/${primaryTask.id}`}>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Buka Terminal Timbang & QC
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      ) : (
        <Panel className="bg-canvas border border-dashed border-border text-center py-6">
          <Truck className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-text-primary">
            Tidak Ada Tugas Aktif Sedang Berjalan
          </h4>
          <p className="text-xs text-text-muted max-w-md mx-auto mt-1 mb-4">
            Anda belum mengambil tugas penjemputan. Periksa antrean pool banjar untuk mengklaim setoran warga terdekat.
          </p>
          <Link href="/staff/tugas/tersedia">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Truck className="w-4 h-4" />}
            >
              Lihat Antrean Tugas Tersedia
            </Button>
          </Link>
        </Panel>
      )}

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl bg-[#FFF4D9] border border-[#F7E1A0] flex items-start gap-3 text-[#98631C]">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#98631C]" />
        <div className="space-y-1 text-xs leading-relaxed">
          <p className="font-bold">
            Prosedur Keselamatan Kerja & Kebijakan B3 TPS3R Banjar Sukawati
          </p>
          <p className="text-[#7A4E12]">
            Wajib mengenakan sarung tangan karet tebal dan sepatu tertutup saat menimbang.{" "}
            <strong>Limbah B3/Spesifik:</strong> Apabila menemukan jarum suntik, baterai aki basah bocor, atau bahan kimia berbahaya saat inspeksi QC, jangan angkut. Berikan hasil QC <em>REJECTED</em> dengan alasan kode B3 dan laporkan segera ke koordinator TPS3R.
          </p>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel className="p-4 hover:border-brand-500 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-800">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-text-primary">
                Antrean Tugas Tersedia
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Klaim permintaan penjemputan warga yang siap diambil di banjar Anda.
              </p>
              <div className="pt-2">
                <Link
                  href="/staff/tugas/tersedia"
                  className="text-xs font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
                >
                  Buka Antrean Pool &rarr;
                </Link>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-4 hover:border-brand-500 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-800">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-text-primary">
                Tugas Saya ({activeTasks.length})
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Kelola status perjalanan, navigasi alamat, dan kontak warga setoran.
              </p>
              <div className="pt-2">
                <Link
                  href="/staff/tugas/saya"
                  className="text-xs font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
                >
                  Kelola Tugas Saya &rarr;
                </Link>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-4 hover:border-brand-500 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-800">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-text-primary">
                Riwayat & Log Timbang
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Audit verifikasi timbangan digital, versi berat tara-bruto, dan foto bukti.
              </p>
              <div className="pt-2">
                <Link
                  href="/staff/riwayat"
                  className="text-xs font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
                >
                  Lihat Riwayat Selesai &rarr;
                </Link>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
