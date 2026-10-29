import React from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, XCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { mockCategories } from "@/mocks/previewData";

export default function UserGuidePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Panduan Pemilahan Sampah Banjar"
        description="Standar pemilahan resmi TPS3R Desa Sukawati untuk memastikan poin penuh dan kelancaran proses daur ulang."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Panduan Pemilahan" },
        ]}
        actions={
          <Link href="/app/setoran/baru">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Buat Setoran
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCategories.map((cat) => (
          <Panel
            key={cat.id}
            title={cat.name}
            subtitle={`Kode Kategori: ${cat.code}`}
            action={
              <span className="text-xs font-bold text-[#276749] bg-[#E7F4EA] px-2.5 py-1 rounded-full">
                +{cat.pointRate} poin/kg
              </span>
            }
          >
            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                {cat.description}
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#E7F4EA] rounded-lg border border-[#BCE1C7] text-[#276749] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Syarat Bersih:</strong> {cat.contaminationThreshold}
                  </span>
                </div>
                <div className="p-3 bg-[#FBEAE7] rounded-lg border border-[#F5C6BF] text-[#A43F35] flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hindari:</strong> Pencampuran dengan sisa makanan berlemak atau sampah B3/residu medis.
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
