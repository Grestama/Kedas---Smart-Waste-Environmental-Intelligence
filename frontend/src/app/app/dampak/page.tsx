import React from "react";
import { Leaf, Award, Recycle, CloudSun, TreePine } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { mockUsers } from "@/mocks/previewData";
import { formatWeightKg } from "@/tokens";

export default function UserImpactPage() {
  const user = mockUsers.warga;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dampak Lingkungan & Jejak Hijau"
        description="Kontribusi nyata Anda dan krama banjar dalam mengurangi timbunan sampah menuju TPA Suwung."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Dampak Lingkungan" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sampah Disetor"
          value={formatWeightKg(user.totalKgDeposited)}
          highlight
          icon={<Recycle className="w-5 h-5 text-white" />}
          hint="Terverifikasi timbangan TPS3R"
        />
        <StatCard
          label="Emisi Karbon Dihindari"
          value="68,2 kg CO₂e"
          icon={<CloudSun className="w-5 h-5 text-emerald-700" />}
          hint="Berdasarkan reduksi dekomposisi metana anaerobik"
        />
        <StatCard
          label="Kompos Dihasilkan"
          value="24,5 kg"
          icon={<Leaf className="w-5 h-5 text-amber-700" />}
          hint="Disalurkan ke kebun kelompok tani banjar"
        />
        <StatCard
          label="Peringkat Partisipasi"
          value="Krama Teladan"
          icon={<Award className="w-5 h-5 text-brand-700" />}
          hint="Top 15% di Banjar Kaja Sukawati"
        />
      </div>

      <Panel
        title="Pencapaian & Lencana Hijau Desa"
        subtitle="Lencana penghargaan adat dan lingkungan yang telah Anda raih."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[#BCE1C7] bg-[#E7F4EA] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#276749] text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-[#276749]">Pilah Pertama</h4>
            <p className="text-xs text-[#276749]/80">
              Menyelesaikan setoran sampah terpilah pertama kali di pos TPS3R.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#BCE1C7] bg-[#E7F4EA] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#276749] text-white flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-[#276749]">Penjaga Kebersihan</h4>
            <p className="text-xs text-[#276749]/80">
              Mencapai 25 kg sampah terpilah dengan 0% penolakan kontaminasi.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-[#FAFBF9] space-y-2 opacity-60">
            <div className="w-8 h-8 rounded-lg bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-text-primary">Pelopor Sirkular Banjar</h4>
            <p className="text-xs text-text-secondary">
              Mencapai 100 kg sampah terpilah (Sedang berjalan: 48,5 / 100 kg).
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
