"use client";

import React from "react";
import { User as UserIcon, Truck, Shield, MapPin, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/auth-context";
import { mockUsers } from "@/mocks/previewData";

export default function StaffProfilePage() {
  const { user } = useAuth();
  const staff = mockUsers.petugas;

  const collectorName = user?.full_name || staff.name;
  const collectorEmail = user?.email || staff.email;
  const collectorPhone = user?.phone || "081222333444";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Profil Petugas & Peralatan Lapangan"
        description="Identitas resmi kolektor lapangan TPS3R Banjar Sukawati."
        breadcrumbs={[
          { label: "Meja Operasional", href: "/staff" },
          { label: "Profil Petugas" },
        ]}
      />

      <Panel
        title="Identitas Kolektor Lapangan"
        action={<StatusBadge variant="success" label="Petugas Terverifikasi" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-secondary block">Nama Lengkap:</span>
            <span className="font-bold text-text-primary text-sm mt-0.5 block">
              {collectorName}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Email Akun POS:</span>
            <span className="font-semibold text-text-primary mt-0.5 block font-mono">
              {collectorEmail}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Nomor Telepon Operasional:</span>
            <span className="font-semibold text-brand-900 mt-0.5 block font-mono">
              {collectorPhone}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Pos Induk TPS3R:</span>
            <span className="font-semibold text-brand-900 mt-0.5 block">
              {staff.baseStation}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Shift Kerja:</span>
            <span className="font-semibold text-brand-900 mt-0.5 block font-mono">
              {staff.activeShift}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Wilayah Penjemputan:</span>
            <span className="font-semibold text-brand-900 mt-0.5 block">
              {staff.assignedBanjar}
            </span>
          </div>
        </div>
      </Panel>

      <Panel title="Armada & Perlengkapan Kerja Lapangan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-canvas rounded-xl border border-border">
            <span className="text-text-secondary block font-semibold">
              Kendaraan Angkut
            </span>
            <span className="font-bold text-brand-900 mt-1 block">
              Motor Roda Tiga Viar Karya 150 (DK-4821-GA)
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 block">
              Kapasitas angkut maksimum: 300 kg
            </span>
          </div>

          <div className="p-3.5 bg-canvas rounded-xl border border-border">
            <span className="text-text-secondary block font-semibold">
              Timbangan Digital Lapangan
            </span>
            <span className="font-bold text-brand-900 mt-1 block">
              Digital Crane Scale 150 kg (TIMB-04)
            </span>
            <span className="text-[11px] text-[#276749] mt-0.5 block font-semibold">
              Status: Tera Digital Sah 2026
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
