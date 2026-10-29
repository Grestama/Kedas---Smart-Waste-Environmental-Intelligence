"use client";

import React from "react";
import Link from "next/link";
import { Truck, ArrowRight, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockStaffTasks } from "@/mocks/previewData";

export default function AvailableTasksPage() {
  const availableTasks = mockStaffTasks.filter((t) => t.status === "tersedia");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Antrean Tugas Tersedia"
        description="Pilih dan klaim setoran sampah warga yang telah diverifikasi untuk rute jemput Anda."
        breadcrumbs={[
          { label: "Meja Operasional", href: "/staff" },
          { label: "Tugas Tersedia" },
        ]}
      />

      <div className="space-y-4">
        {availableTasks.map((task) => (
          <Panel
            key={task.id}
            title={`${task.category} — ${task.estimatedWeight}`}
            subtitle={`Kode Tugas: ${task.id} • Permintaan: ${task.requestId}`}
            action={<StatusBadge variant="info" label="Tersedia untuk Diklaim" />}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary text-sm">
                    {task.citizenName}
                  </span>
                  <span className="text-text-secondary font-mono">
                    ({task.phone})
                  </span>
                </div>
                <div className="flex items-start gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                  <span>{task.address}</span>
                </div>
                {task.notes && (
                  <p className="p-2.5 rounded-lg bg-canvas border border-border text-text-secondary italic">
                    &ldquo;{task.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-text-secondary block">
                    Slot Penjemputan
                  </span>
                  <span className="font-semibold text-brand-900 block">
                    {task.scheduledSlot}
                  </span>
                </div>
                <Link href={`/staff/tugas/${task.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-800 hover:bg-emerald-900"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Klaim Tugas Ini
                  </Button>
                </Link>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
