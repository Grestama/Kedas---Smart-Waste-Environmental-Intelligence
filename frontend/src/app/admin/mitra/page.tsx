"use client";

import React from "react";
import { Building2, PackageCheck, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function AdminPartnersPage() {
  const partners = [
    {
      id: "PTR-01",
      name: "PT Bali Sirkular Daur Ulang",
      type: "Offtaker Plastik PET & HDPE",
      location: "Denpasar Barat",
      batchesCompleted: 14,
      status: "active",
    },
    {
      id: "PTR-02",
      name: "Kelompok Tani Subak Sukawati",
      type: "Penerima Kompos Organik Banjar",
      location: "Sukawati, Gianyar",
      batchesCompleted: 8,
      status: "active",
    },
    {
      id: "PTR-03",
      name: "Pabrik Kertas Karton Jawa-Bali",
      type: "Offtaker Kardus & Kertas Duplex",
      location: "Kuta Selatan",
      batchesCompleted: 6,
      status: "active",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mitra Daur Ulang & Agregasi Batch"
        description="Kelola offtaker berlisensi dan batch agregasi sampah terpilah dari pos TPS3R."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Mitra & Batch" },
        ]}
        actions={
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Tambah Mitra Offtaker
          </Button>
        }
      />

      <div className="space-y-4">
        {partners.map((p) => (
          <Panel
            key={p.id}
            title={p.name}
            subtitle={`${p.type} • Lokasi: ${p.location}`}
            action={<StatusBadge variant="success" label="Mitra Terverifikasi" />}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-text-secondary">
                  Batch Tersalurkan: <strong>{p.batchesCompleted} Pengiriman Resmi</strong>
                </p>
                <p className="text-text-secondary">
                  Perjanjian Kerjasama (PKS) aktif s/d Desember 2027.
                </p>
              </div>

              <Button variant="secondary" size="sm">
                Lihat Log Batch Material
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
