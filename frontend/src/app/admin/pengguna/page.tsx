"use client";

import React from "react";
import { Users, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockUsers } from "@/mocks/previewData";
import { formatPoints, formatWeightKg } from "@/tokens";

export default function AdminUsersPage() {
  const users = [
    {
      id: "usr-01",
      name: "Wayan Sudarsana",
      email: "wayan.sudarsana@example.com",
      role: "Warga",
      banjar: "Banjar Kaja Sukawati",
      points: 1250,
      totalKg: 48.5,
      status: "active",
    },
    {
      id: "usr-02",
      name: "Ni Putu Lestari",
      email: "putu.lestari@example.com",
      role: "Warga",
      banjar: "Banjar Tengah Sukawati",
      points: 840,
      totalKg: 32.0,
      status: "active",
    },
    {
      id: "usr-03",
      name: "I Made Artawan",
      email: "made.collector@wastelink.bali.id",
      role: "Petugas Lapangan",
      banjar: "TPS3R Sukawati",
      points: 0,
      totalKg: 280.0,
      status: "active",
    },
  ];

  const columns: Column<(typeof users)[0]>[] = [
    {
      key: "name",
      header: "Nama Pengguna",
      render: (item) => (
        <div>
          <span className="font-semibold block">{item.name}</span>
          <span className="text-[11px] text-text-secondary font-mono">{item.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Peran Akun",
      render: (item) => (
        <span className="px-2 py-0.5 rounded text-xs bg-brand-100 text-brand-900 font-semibold">
          {item.role}
        </span>
      ),
    },
    {
      key: "banjar",
      header: "Wilayah Banjar",
      render: (item) => item.banjar,
    },
    {
      key: "points",
      header: "Saldo Poin",
      align: "right",
      render: (item) => (
        <span className="font-semibold text-brand-900">{formatPoints(item.points)}</span>
      ),
    },
    {
      key: "totalKg",
      header: "Total Kontribusi",
      align: "right",
      render: (item) => formatWeightKg(item.totalKg),
    },
    {
      key: "status",
      header: "Status",
      render: () => <StatusBadge variant="success" label="Aktif" size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Basis Pengguna & Warga Terdaftar"
        description="Direktori warga dan petugas yang berpartisipasi dalam program banjar pilot."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Basis Pengguna" },
        ]}
      />

      <DataTable columns={columns} data={users} keyExtractor={(item) => item.id} />
    </div>
  );
}
