import React from "react";
import { HelpCircle, Phone, MessageSquare, Building2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

export default function UserHelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Bantuan & Kontak Banjar"
        description="Pusat komunikasi warga dengan tim pos TPS3R dan koordinator lingkungan banjar."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Bantuan Banjar" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Sekretariat TPS3R Banjar Sukawati">
          <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary block">Alamat Pos Timbang:</strong>
                Gedung TPS3R Sukawati Kaja, Jl. Kenanga No. 1, Gianyar
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary block">Hotline Operasional Lapangan:</strong>
                0812-3456-7890 (Senin - Sabtu, 07:00 - 15:00 WITA)
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Alur Penanganan Komplain & Ketidaksesuaian">
          <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
            <p>
              Apabila terdapat perbedaan antara catatan bobot timbang dengan poin yang diterbitkan, silakan hubungi koordinator banjar dengan menyertakan <strong>Nomor Permintaan (ID Setoran)</strong>.
            </p>
            <p className="p-3 rounded-lg bg-[#FAFBF9] border border-border">
              Koordinator pos akan memeriksa log timbangan digital dan foto verifikasi lapangan dalam waktu 1x24 jam kerja.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
