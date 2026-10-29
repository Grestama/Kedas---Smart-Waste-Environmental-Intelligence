import React from "react";
import { Scale, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatWITA, formatWeightKg } from "@/tokens";

export default function StaffHistoryPage() {
  const completedLogs = [
    {
      id: "LOG-041",
      requestId: "REQ-2026-0009",
      citizenName: "Wayan Sudarsana",
      category: "Organik (Kompos Banjar)",
      weight: 8.2,
      pointsIssued: 82,
      time: "2026-10-28T08:30:00+08:00",
      status: "verified",
    },
    {
      id: "LOG-040",
      requestId: "REQ-2026-0005",
      citizenName: "Ketut Wijaya",
      category: "Plastik PET Bersih",
      weight: 6.5,
      pointsIssued: 195,
      time: "2026-10-27T10:15:00+08:00",
      status: "verified",
    },
    {
      id: "LOG-039",
      requestId: "REQ-2026-0003",
      citizenName: "Ni Luh Made",
      category: "Kardus & Kertas",
      weight: 14.0,
      pointsIssued: 280,
      time: "2026-10-27T09:00:00+08:00",
      status: "verified",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Penimbangan & Log Petugas"
        description="Rekapitulasi seluruh setoran warga yang telah Anda timbang dan verifikasi di lapangan."
        breadcrumbs={[
          { label: "Meja Operasional", href: "/staff" },
          { label: "Riwayat Timbang" },
        ]}
      />

      <Panel title="Log Penimbangan Terverifikasi">
        <div className="divide-y divide-border -mx-5 -my-2 text-xs">
          {completedLogs.map((log) => (
            <div
              key={log.id}
              className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFBF9] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-900">
                    {log.id}
                  </span>
                  <StatusBadge variant="success" label="Terverifikasi" size="sm" />
                  <span className="font-semibold text-text-primary">
                    {log.citizenName}
                  </span>
                </div>
                <p className="text-text-secondary">
                  Permintaan {log.requestId} &bull; <strong>{log.category}</strong>
                </p>
                <span className="text-[11px] text-text-secondary font-mono block">
                  Ditimbang pada {formatWITA(log.time)}
                </span>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-sm font-bold text-brand-900 block">
                  {formatWeightKg(log.weight)}
                </span>
                <span className="text-xs font-semibold text-[#276749] block">
                  +{log.pointsIssued} WastePoints
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
