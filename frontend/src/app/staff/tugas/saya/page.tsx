"use client";

import React from "react";
import Link from "next/link";
import { Truck, Scale, MapPin, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockStaffTasks } from "@/mocks/previewData";

export default function MyActiveTasksPage() {
  const myTasks = mockStaffTasks.filter((t) => t.status === "dalam_tugas");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tugas Sedang Aktif"
        description="Daftar setoran yang saat ini sedang dalam proses penjemputan oleh Anda."
        breadcrumbs={[
          { label: "Meja Operasional", href: "/staff" },
          { label: "Tugas Saya" },
        ]}
      />

      {myTasks.length === 0 ? (
        <Panel>
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-brand-900">
              Tidak Ada Tugas Berjalan
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Seluruh penjemputan telah selesai. Anda dapat mengambil tugas baru dari antrean.
            </p>
            <div className="mt-4">
              <Link href="/staff/tugas/tersedia">
                <Button size="sm" variant="primary">
                  Buka Antrean Tersedia
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="space-y-4">
          {myTasks.map((task) => (
            <Panel
              key={task.id}
              title={`Sedang Dijemput: ${task.category}`}
              subtitle={`Kode Tugas: ${task.id} • Permintaan: ${task.requestId}`}
              action={<StatusBadge variant="warning" label="Sedang Dijemput" />}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary text-sm">
                      {task.citizenName}
                    </span>
                    <a
                      href={`tel:${task.phone}`}
                      className="text-brand-700 font-mono flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {task.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-text-secondary">
                    <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                    <span>{task.address}</span>
                  </div>
                  <p className="text-text-secondary">
                    Estimasi Awal Warga: <strong>{task.estimatedWeight}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <Link href={`/staff/tugas/${task.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-800 hover:bg-emerald-900"
                      leftIcon={<Scale className="w-3.5 h-3.5" />}
                    >
                      Buka Form Timbang Digital
                    </Button>
                  </Link>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
