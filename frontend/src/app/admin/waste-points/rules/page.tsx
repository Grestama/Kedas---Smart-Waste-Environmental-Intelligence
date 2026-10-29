"use client";

import React from "react";
import { Coins, ShieldAlert, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminWastePointsRulesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Aturan Konversi & Kebijakan WastePoints"
        description="Atur rasio perolehan poin per kg sampah dan kebijakan anti-fraud pembobotan."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Aturan WastePoints" },
        ]}
      />

      <Panel title="Formula Konversi Poin per Kilogram">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organik (Kompos Banjar)"
              type="number"
              defaultValue="10"
              helperText="Poin per 1.0 kg"
            />
            <Input
              label="Plastik PET Bersih"
              type="number"
              defaultValue="30"
              helperText="Poin per 1.0 kg"
            />
            <Input
              label="Kardus & Kertas"
              type="number"
              defaultValue="20"
              helperText="Poin per 1.0 kg"
            />
            <Input
              label="Kaca & Botol Beling"
              type="number"
              defaultValue="15"
              helperText="Poin per 1.0 kg"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              Setiap perubahan tarif poin otomatis tercatat dalam Audit Log sistem.
            </span>
            <Button variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Simpan Aturan Konversi
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Batas Keamanan & Pencegahan Manipulasi (Anti-Fraud)">
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            Maksimum setoran tunggal per rumah tangga tanpa persetujuan manual koordinator: <strong>50 kg</strong>. Setoran di atas batas ini wajib disertai verifikasi fisik kepala regu TPS3R.
          </p>
          <p>
            Toleransi selisih antara estimasi warga dengan timbangan digital lapangan: <strong>&plusmn;30%</strong>. Selisih lebih dari ambang batas memicu audit review.
          </p>
        </div>
      </Panel>
    </div>
  );
}
