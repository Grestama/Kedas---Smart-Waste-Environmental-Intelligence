"use client";

import React from "react";
import { Tags, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { mockCategories } from "@/mocks/previewData";

export default function AdminCategoriesPage() {
  const columns: Column<(typeof mockCategories)[0]>[] = [
    {
      key: "code",
      header: "Kode Material",
      render: (item) => (
        <span className="font-mono font-bold text-brand-900 bg-brand-100 px-2 py-0.5 rounded text-xs">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nama Kategori",
      render: (item) => (
        <div>
          <span className="font-semibold block">{item.name}</span>
          <span className="text-[11px] text-text-secondary">{item.description}</span>
        </div>
      ),
    },
    {
      key: "pointRate",
      header: "Tarif WastePoints",
      align: "right",
      render: (item) => (
        <span className="font-bold text-[#276749]">
          +{item.pointRate} poin / kg
        </span>
      ),
    },
    {
      key: "contaminationThreshold",
      header: "Batas Kontaminasi",
      render: (item) => item.contaminationThreshold,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Kategori & Nilai Tukar Poin"
        description="Konfigurasi material sampah terpilah yang diterima TPS3R beserta standar kebersihannya."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Kategori Sampah" },
        ]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Tambah Kategori Baru
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={mockCategories}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
