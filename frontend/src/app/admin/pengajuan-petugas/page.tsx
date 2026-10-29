"use client";

"use client";

import React from "react";
import { UserCheck, Check, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function StaffVerificationPage() {
  const applications = [
    {
      id: "APP-COL-03",
      name: "I Gusti Ngurah Oka",
      phone: "081333444555",
      banjar: "Banjar Kaja Sukawati",
      vehicle: "Motor Roda Tiga Pribadi",
      date: "28 Okt 2026",
      status: "pending",
    },
    {
      id: "APP-COL-02",
      name: "I Made Artawan",
      phone: "081222333444",
      banjar: "Banjar Kaja Sukawati",
      vehicle: "Armada Desa Sukawati",
      date: "25 Okt 2026",
      status: "approved",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Pengajuan Petugas Lapangan"
        description="Persetujuan dan onboarding calon kolektor sampah TPS3R banjar."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Verifikasi Petugas" },
        ]}
      />

      <div className="space-y-4">
        {applications.map((app) => (
          <Panel
            key={app.id}
            title={app.name}
            subtitle={`Pengajuan ID: ${app.id} • Tanggal: ${app.date}`}
            action={
              app.status === "approved" ? (
                <StatusBadge variant="success" label="Aktif Bertugas" />
              ) : (
                <StatusBadge variant="warning" label="Menunggu Verifikasi Prajuru" />
              )
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-text-secondary">
                  Wilayah Banjar: <strong>{app.banjar}</strong> &bull; Telepon: {app.phone}
                </p>
                <p className="text-text-secondary">
                  Kendaraan Angkut: <strong>{app.vehicle}</strong>
                </p>
              </div>

              {app.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" leftIcon={<X className="w-3.5 h-3.5" />}>
                    Tolak
                  </Button>
                  <Button variant="primary" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />}>
                    Setujui & Terbitkan Akun POS
                  </Button>
                </div>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
