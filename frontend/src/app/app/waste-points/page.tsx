import React from "react";
import Link from "next/link";
import { Coins, Sparkles, History, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { mockUsers } from "@/mocks/previewData";
import { formatPoints, formatWITA } from "@/tokens";

export default function WastePointsPage() {
  const user = mockUsers.warga;

  const mockLedger = [
    {
      id: "LED-0091",
      date: "2026-10-28T09:15:00+08:00",
      description: "Setoran Organik (Kompos Banjar) — REQ-2026-0009",
      amount: 82,
      type: "credit",
      weight: "8.2 kg",
    },
    {
      id: "LED-0074",
      date: "2026-10-21T10:30:00+08:00",
      description: "Setoran Plastik PET Bersih — REQ-2026-0002",
      amount: 150,
      type: "credit",
      weight: "5.0 kg",
    },
    {
      id: "LED-0050",
      date: "2026-10-14T08:45:00+08:00",
      description: "Setoran Kardus & Kertas — REQ-2026-0001",
      amount: 120,
      type: "credit",
      weight: "6.0 kg",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="WastePoints & Buku Besar Transaksi"
        description="Pantau akumulasi reward hasil pemilahan sampah Anda secara transparan."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "WastePoints" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Saldo Tersedia"
          value={formatPoints(user.pointsBalance)}
          highlight
          icon={<Coins className="w-5 h-5 text-white" />}
          hint="Buku besar diverifikasi sistem banjar"
        />
        <StatCard
          label="Poin Didapat Bulan Ini"
          value="+352 Poin"
          icon={<Sparkles className="w-5 h-5 text-amber-700" />}
          hint="Dari 3 kali setoran terverifikasi"
        />
        <StatCard
          label="Status Penukaran Reward"
          value="Katalog Segera Hadir"
          icon={<ShoppingBag className="w-5 h-5 text-brand-700" />}
          hint="Sosialisasi paruman banjar November 2026"
        />
      </div>

      {/* Catalog Notice Banner (Per ADR & Backend Gap) */}
      <div className="p-5 rounded-xl bg-[#FAFBF9] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-700" />
            <h3 className="text-sm font-bold text-brand-900">
              Katalog Penukaran Reward Banjar
            </h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Sistem WasteLink menjaga seluruh poin Anda tersimpan aman dan tidak akan kedaluwarsa. Penukaran dengan voucher sembako BUMDes, pupuk organik TPS3R, dan bibit tanaman akan dibuka serentak setelah evaluasi pilot banjar selesai.
          </p>
        </div>
        <Link href="/app/panduan">
          <Button variant="outline" size="sm" className="shrink-0">
            Pelajari Nilai Poin Kategori
          </Button>
        </Link>
      </div>

      {/* Immutable Ledger Table */}
      <Panel
        title="Buku Besar Poin (Ledger Transaksi)"
        subtitle="Catatan kronologis penerbitan WastePoints dari hasil timbangan resmi petugas."
      >
        <div className="divide-y divide-border -mx-5 -my-2 text-xs">
          {mockLedger.map((tx) => (
            <div
              key={tx.id}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FAFBF9] transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-900">
                    {tx.id}
                  </span>
                  <span className="text-[11px] text-text-secondary font-mono">
                    {formatWITA(tx.date)}
                  </span>
                </div>
                <p className="font-medium text-text-primary">
                  {tx.description} ({tx.weight})
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-[#276749]">
                  +{tx.amount} Poin
                </span>
                <span className="text-[10px] text-text-secondary block">
                  Kredit Terverifikasi
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
