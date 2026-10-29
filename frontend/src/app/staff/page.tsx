"use client";

import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockStaffTasks, mockUsers } from "@/mocks/previewData";

export default function StaffDashboardPage() {
  const staff = mockUsers.petugas;
  const activeTask = mockStaffTasks[1];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meja Operasional Petugas (POS Lapangan)"
        description={`Operator: ${staff.name} • ${staff.baseStation} • Shift: ${staff.activeShift}`}
        actions={
          <Link href="/staff/tugas/tersedia">
            <Button
              variant="primary"
              className="bg-emerald-800 hover:bg-emerald-900"
              leftIcon={<Truck className="w-4 h-4" />}
            >
              Ambil Tugas Baru
            </Button>
          </Link>
        }
      />

      {/* POS Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tugas Sedang Aktif"
          value="1 Penjemputan"
          highlight
          icon={<Truck className="w-5 h-5 text-white" />}
          hint="Ni Putu Lestari - Kardus & Kertas"
        />
        <StatCard
          label="Antrean Tugas Tersedia"
          value="2 Tugas"
          icon={<ClipboardList className="w-5 h-5 text-brand-700" />}
          hint="Wilayah Banjar Kaja Sukawati"
        />
        <StatCard
          label="Timbangan Selesai Hari Ini"
          value="4 Setoran"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
          hint="Total bobot: 38,4 kg"
        />
        <StatCard
          label="Status Kalibrasi Timbangan"
          value="Terkalibrasi"
          icon={<Scale className="w-5 h-5 text-amber-700" />}
          hint="Tera digital berlaku s/d Des 2026"
        />
      </div>

      {/* Active Mission Alert Panel */}
      {activeTask && (
        <Panel
          title="Tugas Penjemputan Sedang Berjalan"
          subtitle={`Kode Tugas: ${activeTask.id} • Permintaan: ${activeTask.requestId}`}
          action={
            <Link href={`/staff/tugas/${activeTask.id}`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-800 hover:bg-emerald-900"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Buka Form Timbang & Selesaikan
              </Button>
            </Link>
          }
        >
          <div className="p-4 rounded-xl bg-[#FAFBF9] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <StatusBadge variant="warning" label="Sedang Dijemput" />
                <span className="font-bold text-text-primary text-sm">
                  {activeTask.citizenName}
                </span>
                <span className="text-text-secondary">({activeTask.phone})</span>
              </div>
              <p className="text-text-secondary">
                Alamat: <strong>{activeTask.address}</strong>
              </p>
              <p className="text-text-secondary">
                Kategori: <strong>{activeTask.category}</strong> (Est. {activeTask.estimatedWeight})
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] text-text-secondary uppercase font-semibold block">
                Target Waktu Tiba
              </span>
              <span className="text-xs font-bold text-brand-900 block mt-0.5">
                {activeTask.scheduledSlot}
              </span>
            </div>
          </div>
        </Panel>
      )}

      {/* Available Task Queue Preview */}
      <Panel
        title="Antrean Tugas Tersedia di Wilayah Anda"
        subtitle="Daftar setoran warga yang belum diambil oleh kolektor pos TPS3R."
        action={
          <Link href="/staff/tugas/tersedia">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Lihat Seluruh Antrean
            </Button>
          </Link>
        }
      >
        <div className="divide-y divide-border -mx-5 -my-2 text-xs">
          {mockStaffTasks
            .filter((t) => t.status === "tersedia")
            .map((task) => (
              <div
                key={task.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFBF9] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-900">
                      {task.id}
                    </span>
                    <StatusBadge variant="info" label="Tersedia" size="sm" />
                    <span className="font-semibold text-text-primary">
                      {task.citizenName}
                    </span>
                  </div>
                  <p className="text-text-secondary mt-1">
                    {task.address} &bull; <strong>{task.category}</strong> ({task.estimatedWeight})
                  </p>
                </div>

                <Link href={`/staff/tugas/${task.id}`}>
                  <Button variant="secondary" size="sm">
                    Klaim Tugas Ini
                  </Button>
                </Link>
              </div>
            ))}
        </div>
      </Panel>
    </div>
  );
}
