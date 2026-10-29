import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function StaffSafetyGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Panduan Keselamatan & Kesehatan Kerja (K3) Petugas"
        description="Standar Operasional Prosedur (SOP) keselamatan lapangan dan perlengkapan APD wajib TPS3R."
        breadcrumbs={[
          { label: "Meja Operasional", href: "/staff" },
          { label: "Panduan APD & K3" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Perlengkapan APD Wajib Digunakan">
          <ul className="space-y-3 text-xs text-text-secondary">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#276749] shrink-0 mt-0.5" />
              <span><strong>Sarung Tangan Karet Tebal / Kulit:</strong> Mencegah luka akibat pecahan kaca atau benda tajam terselip.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#276749] shrink-0 mt-0.5" />
              <span><strong>Sepatu Boot Berujung Kuat:</strong> Melindungi dari rembesan lindi basah dan benturan benda berat.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#276749] shrink-0 mt-0.5" />
              <span><strong>Masker Respirator / Medis:</strong> Menyaring spora jamur dan debu saat memindahkan kardus/organik kering.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#276749] shrink-0 mt-0.5" />
              <span><strong>Rompi Reflektif TPS3R:</strong> Terlihat jelas oleh kendaraan saat bertugas di jalan banjar.</span>
            </li>
          </ul>
        </Panel>

        <Panel title="Prosedur Penanganan Sampah Terkontaminasi Berbahaya">
          <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
            <div className="p-3 bg-[#FBEAE7] rounded-lg border border-[#F5C6BF] text-[#A43F35]">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Benda Tajam & B3 Medis
              </div>
              Jangan menyentuh jarum suntik, baterai pecah, atau pecahan kaca tanpa wadah pelindung. Laporkan dan tandai sebagai setoran ditolak.
            </div>
            <p>
              Apabila terjadi kecelakaan kerja atau luka robek, segera bersihkan dengan antiseptik di kotak P3K kendaraan dan laporkan ke koordinator pos banjar.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
