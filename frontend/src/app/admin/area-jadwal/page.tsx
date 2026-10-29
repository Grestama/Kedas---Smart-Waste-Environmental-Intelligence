"use client";

import React from "react";
import { MapPin, Calendar, Clock, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function AdminAreaSchedulePage() {
  const areas = [
    {
      id: "AREA-01",
      name: "Banjar Kaja Sukawati",
      schedule: "Senin, Rabu, Jumat (08:00 - 11:30 WITA)",
      posBase: "TPS3R Sukawati Kaja",
      assignedCollectors: 3,
      status: "active",
    },
    {
      id: "AREA-02",
      name: "Banjar Tengah Sukawati",
      schedule: "Selasa, Kamis, Sabtu (08:00 - 11:30 WITA)",
      posBase: "Pos TPS3R Tengah",
      assignedCollectors: 3,
      status: "active",
    },
    {
      id: "AREA-03",
      name: "Banjar Kelod Sukawati",
      schedule: "Dalam penyusunan paruman banjar",
      posBase: "Pos Rencana Kelod",
      assignedCollectors: 0,
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Area Wilayah & Jadwal Penjemputan"
        description="Atur matrix jadwal dan penugasan armada berdasarkan kesepakatan paruman banjar."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Area & Jadwal Banjar" },
        ]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Tambah Wilayah Banjar
          </Button>
        }
      />

      <div className="space-y-4">
        {areas.map((a) => (
          <Panel
            key={a.id}
            title={a.name}
            subtitle={`ID Area: ${a.id} • Pangkalan: ${a.posBase}`}
            action={
              a.status === "active" ? (
                <StatusBadge variant="success" label="Jadwal Aktif" />
              ) : (
                <StatusBadge variant="warning" label="Persiapan" />
              )
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-700" />
                  <span className="font-semibold text-text-primary">
                    {a.schedule}
                  </span>
                </div>
                <p className="text-text-secondary">
                  Petugas Ditugaskan: <strong>{a.assignedCollectors} Kolektor Aktif</strong>
                </p>
              </div>

              <Button variant="secondary" size="sm">
                Ubah Matrix Jadwal
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
