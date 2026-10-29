import React from "react";
import Link from "next/link";
import { MapPin, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ServiceAreaPage() {
  const areas = [
    {
      name: "Banjar Kaja, Desa Sukawati",
      status: "Aktif Penuh",
      days: "Senin, Rabu, Jumat",
      hours: "08:00 - 11:30 WITA",
      posStation: "TPS3R Kompos Sukawati Kaja",
      collectorCount: 3,
    },
    {
      name: "Banjar Tengah, Desa Sukawati",
      status: "Aktif Penuh",
      days: "Selasa, Kamis, Sabtu",
      hours: "08:00 - 11:30 WITA",
      posStation: "Pos TPS3R Sukawati Tengah",
      collectorCount: 3,
    },
    {
      name: "Banjar Kelod, Desa Sukawati",
      status: "Tahap Sosialisasi (Segera)",
      days: "Jadwal sedang disusun krama banjar",
      hours: "-",
      posStation: "Rencana Pos Kelod",
      collectorCount: 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">
          Cakupan Area Layanan & Jadwal Penjemputan
        </h1>
        <p className="mt-2 text-text-secondary leading-relaxed">
          Pilot operasional WasteLink Bali saat ini melayani banjar percontohan di Desa Sukawati, Gianyar. Layanan penjemputan disesuaikan dengan ritme paruman dan jadwal kebersihan desa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {areas.map((area, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-brand-100 text-brand-900">
                  <MapPin className="w-5 h-5" />
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    area.status.startsWith("Aktif")
                      ? "bg-[#E7F4EA] text-[#276749]"
                      : "bg-[#FFF4D9] text-[#98631C]"
                  }`}
                >
                  {area.status}
                </span>
              </div>

              <h2 className="text-lg font-bold text-brand-900 mt-4">{area.name}</h2>

              <div className="mt-4 space-y-2 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-700 shrink-0" />
                  <span>Hari: <strong>{area.days}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-700 shrink-0" />
                  <span>Waktu: <strong>{area.hours}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                  <span>Pos: {area.posStation}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Link href="/daftar">
                <Button size="sm" variant="secondary" className="w-full">
                  Daftar Warga Banjar Ini
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
