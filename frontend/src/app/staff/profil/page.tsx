import React from "react";
import { User, Truck, Shield, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { mockUsers } from "@/mocks/previewData";

export default function StaffProfilePage() {
  const staff = mockUsers.petugas;

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

      <Panel title="Identitas Kolektor">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-secondary block">Nama Petugas:</span>
            <span className="font-bold text-text-primary text-sm mt-0.5 block">
              {staff.name}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Email Akun POS:</span>
            <span className="font-semibold text-text-primary mt-0.5 block font-mono">
              {staff.email}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Pos Induk:</span>
            <span className="font-semibold text-brand-900 mt-0.5 block">
              {staff.baseStation}
            </span>
          </div>

          <div>
            <span className="text-text-secondary block">Shift Operasional:</span>
            <span className="font-semibold text-brand-900 mt-0.5 block font-mono">
              {staff.activeShift}
            </span>
          </div>
        </div>
      </Panel>

      <Panel title="Kendaraan & Alat Timbang Lapangan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-canvas rounded-xl border border-border">
            <span className="text-text-secondary block font-semibold">
              Kendaraan Operasional
            </span>
            <span className="font-bold text-brand-900 mt-1 block">
              Motor Roda Tiga Viar Karya 150 (DK-4821-GA)
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 block">
              Kapasitas muat: 300 kg
            </span>
          </div>

          <div className="p-3.5 bg-canvas rounded-xl border border-border">
            <span className="text-text-secondary block font-semibold">
              Unit Timbangan Digital
            </span>
            <span className="font-bold text-brand-900 mt-1 block">
              Digital Hanging Scale Crane 150 kg (TIMB-04)
            </span>
            <span className="text-[11px] text-[#276749] mt-0.5 block font-semibold">
              Status: Tera Ulang Valid 2026
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
