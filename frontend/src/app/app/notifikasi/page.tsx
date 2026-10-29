import React from "react";
import { Bell, CheckCircle2, Clock, Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

export default function UserNotificationsPage() {
  const notifications = [
    {
      id: "notif-1",
      title: "Setoran REQ-2026-0009 Telah Selesai",
      description: "Hasil timbangan 8.2 kg organik telah diverifikasi. +82 WastePoints telah ditambahkan.",
      time: "28 Okt 2026, 09:15 WITA",
      read: false,
    },
    {
      id: "notif-2",
      title: "Pengingat Jadwal Penjemputan",
      description: "Petugas TPS3R dijadwalkan menjemput setoran Anda besok pagi pukul 09:00 WITA.",
      time: "27 Okt 2026, 17:00 WITA",
      read: true,
    },
    {
      id: "notif-3",
      title: "Pemberitahuan Hari Raya Tilem",
      description: "Operasional penjemputan TPS3R libur sementara pada hari suci Tilem dan berlanjut keesokan harinya.",
      time: "24 Okt 2026, 10:00 WITA",
      read: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Pusat Notifikasi"
        description="Informasi penting mengenai status setoran, poin, dan jadwal banjar."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Notifikasi" },
        ]}
      />

      <Panel title="Pemberitahuan Terbaru">
        <div className="divide-y divide-border -mx-5 -my-2 text-xs">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-3.5 transition-colors ${
                !n.read ? "bg-[#FAFBF9]" : "bg-white"
              }`}
            >
              <div className="p-2 rounded-lg bg-brand-100 text-brand-900 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-brand-900">
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-text-secondary font-mono">
                    {n.time}
                  </span>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  {n.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
