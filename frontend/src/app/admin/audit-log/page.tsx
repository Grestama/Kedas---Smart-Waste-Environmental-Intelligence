"use client";

import React from "react";
import { History, ShieldCheck, Key } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { formatWITA } from "@/tokens";

export default function AdminAuditLogPage() {
  const auditLogs = [
    {
      id: "AUD-1082",
      timestamp: "2026-10-28T09:15:22+08:00",
      actor: "made.collector@wastelink.bali.id",
      action: "SETORAN_WEIGHED",
      details: "Penimbangan REQ-2026-0009: 8.2 kg Organik diverifikasi, +82 poin diterbitkan.",
      ipAddress: "192.168.10.42 (POS TPU)",
    },
    {
      id: "AUD-1081",
      timestamp: "2026-10-28T08:02:10+08:00",
      actor: "admin.operasional@wastelink.bali.id",
      action: "TASK_ASSIGNED",
      details: "Penugasan tugas TSK-083 kepada kolektor I Made Artawan.",
      ipAddress: "10.0.4.15",
    },
    {
      id: "AUD-1080",
      timestamp: "2026-10-27T16:00:15+08:00",
      actor: "wayan.sudarsana@example.com",
      action: "SETORAN_CREATED",
      details: "Pembuatan permohonan setoran REQ-2026-0009 (Organik, dropoff).",
      ipAddress: "182.253.112.9",
    },
    {
      id: "AUD-1079",
      timestamp: "2026-10-26T14:30:00+08:00",
      actor: "admin.operasional@wastelink.bali.id",
      action: "RULE_UPDATED",
      details: "Pembaruan rasio poin plastik PET menjadi 30 poin/kg.",
      ipAddress: "10.0.4.15",
    },
  ];

  const columns: Column<(typeof auditLogs)[0]>[] = [
    {
      key: "id",
      header: "ID Audit",
      render: (item) => (
        <span className="font-mono font-bold text-brand-900">{item.id}</span>
      ),
    },
    {
      key: "timestamp",
      header: "Waktu (WITA)",
      render: (item) => (
        <span className="font-mono text-xs">{formatWITA(item.timestamp)}</span>
      ),
    },
    {
      key: "action",
      header: "Aksi Transaksi",
      render: (item) => (
        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-900">
          {item.action}
        </span>
      ),
    },
    {
      key: "actor",
      header: "Pelaku (Akun)",
      render: (item) => (
        <div>
          <span className="font-mono text-xs block">{item.actor}</span>
          <span className="text-[10px] text-text-secondary">{item.ipAddress}</span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Detail Perubahan",
      render: (item) => (
        <span className="text-xs text-text-secondary">{item.details}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log Sistem & Integritas Transaksi"
        description="Buku jejak audit yang tidak dapat dimanipulasi (append-only) untuk seluruh mutasi timbangan dan poin."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Audit Log" },
        ]}
      />

      <DataTable
        columns={columns}
        data={auditLogs}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
