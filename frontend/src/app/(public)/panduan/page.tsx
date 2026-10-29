import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mockCategories } from "@/mocks/previewData";

export default function GuidePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Standar Operasional Banjar Pilot</span>
        </div>
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">
          Panduan Pemilahan Sampah Terstandar
        </h1>
        <p className="mt-2 text-text-secondary leading-relaxed">
          Agar proses daur ulang dan pengomposan berjalan optimal serta bernilai poin penuh, ikuti standar pembersihan dan pemilahan berikut sebelum menyerahkan ke petugas TPS3R.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockCategories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-brand-100 text-brand-900">
                  {cat.code}
                </span>
                <span className="text-xs font-semibold text-[#276749]">
                  +{cat.pointRate} WastePoints / kg
                </span>
              </div>

              <h2 className="text-xl font-bold text-brand-900 mt-3">{cat.name}</h2>
              <p className="text-xs text-text-secondary mt-1">{cat.description}</p>

              <div className="mt-6 space-y-3">
                <div className="p-3 bg-[#E7F4EA] rounded-lg border border-[#BCE1C7] text-xs text-[#276749] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Kondisi yang Diterima:</strong> Bersih, kering, tidak tercampur residu minyak atau tanah pekat.
                  </div>
                </div>

                <div className="p-3 bg-[#FBEAE7] rounded-lg border border-[#F5C6BF] text-xs text-[#A43F35] flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Penyebab Penolakan / Degradasi:</strong> Mengandung pecahan kaca tajam tanpa pengaman, baterai/B3, atau kontaminasi basah berjamur.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span>Ambang Kontaminasi: {cat.contaminationThreshold}</span>
              <Link href="/app/setoran/baru">
                <Button size="sm" variant="outline">
                  Setor Kategori Ini
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-[#FFF4D9] border border-[#F7E1A0] flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-[#98631C] shrink-0 mt-1" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#98631C]">
            Prinsip Timbang Jujur di Lapangan
          </h3>
          <p className="text-xs text-[#98631C]/90 leading-relaxed">
            Petugas berhak menolak atau menurunkan kategori (downgrade) jika sampah yang disetor tidak memenuhi standar kebersihan minimum. Langkah ini melindungi mesin pencacah dan kesehatan tim komposting banjar.
          </p>
        </div>
      </div>
    </div>
  );
}
