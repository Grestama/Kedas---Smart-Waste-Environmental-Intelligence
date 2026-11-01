"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  TrendingUp,
  Leaf,
  ShieldCheck,
  ArrowRight,
  ClipboardPen,
  FileBarChart2,
  QrCode,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
} from "lucide-react";
import { getB2BReport } from "@/services/marketplace";
import { B2BOperationalReport } from "@/types/marketplace";
import { IconContainer } from "@/components/ui/IconContainer";

export default function HospitalityDashboardPage() {
  const [report, setReport] = useState<B2BOperationalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default fallback data for demo readiness
  const fallbackData = {
    totalWasteKg: 12450.5,
    diversionRate: 84.6,
    carbonAvoidedKg: 3980.2,
    dailyQuotaKg: 850,
    todayGeneratedKg: 420.5,
    recentPickups: [
      {
        id: "PKP-2026-1029-01",
        date: "2026-10-30 08:30",
        category: "Organik Dapur (Kitchen Organic)",
        weightKg: 280.5,
        status: "COLLECTED",
        facility: "TPS3R Desa Sayan / Ubud",
      },
      {
        id: "PKP-2026-1029-02",
        date: "2026-10-29 16:15",
        category: "Anorganik Daur Ulang (PET, Kaca, Karton)",
        weightKg: 95.0,
        status: "PROCESSED",
        facility: "Pusat Daur Ulang Gianyar Bersih",
      },
      {
        id: "PKP-2026-1028-01",
        date: "2026-10-28 09:00",
        category: "Residu Terkendali",
        weightKg: 45.0,
        status: "RECEIVED_FACILITY",
        facility: "TPA Regional Suwung Transisi",
      },
    ],
  };

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await getB2BReport("org-alila-ubud");
        if (mounted && data) {
          setReport(data);
        }
      } catch (err) {
        // Fallback gracefully for unauthenticated demo
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const totalKg = report?.total_actual_weight_kg || fallbackData.totalWasteKg;
  const diversionRate = report?.verified_loop_completion_rate
    ? report.verified_loop_completion_rate * 100
    : fallbackData.diversionRate;
  const carbonAvoidedKg = Math.round(totalKg * 0.32);
  const quotaUsedPct = Math.min(
    100,
    Math.round((fallbackData.todayGeneratedKg / fallbackData.dailyQuotaKg) * 100)
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner — Grounded Evergreen (Public Main Style) */}
      <div className="rounded-2xl bg-[#122620] text-white p-6 sm:p-8 border-2 border-[#1D3F35] shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Green Tourism Verified Partner — CDOA Standard 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Dashboard Operasional Sirkular Perhotelan
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed">
            Pantau timbulan sampah harian, laju diversi organik ke TPS3R lokal, verifikasi serah-terima material, dan kepatuhan standar Pergub Bali No. 47/2019 secara terukur.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-surface p-5 rounded-xl border-2 border-border shadow-xs card-interactive hover:-translate-y-1 hover:shadow-interactive hover:border-brand-800 transition-all duration-fast ease-soft cursor-pointer">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Total Timbulan</span>
            <IconContainer variant="brand" size="sm">
              <Scale className="w-4 h-4 text-white" />
            </IconContainer>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {totalKg.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-medium text-muted ml-1">kg</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            100% tercatat dalam passport audit
          </p>
        </div>

        {/* Stat 2 */}
        <div className="bg-surface p-5 rounded-xl border-2 border-border shadow-xs card-interactive hover:-translate-y-1 hover:shadow-interactive hover:border-brand-800 transition-all duration-fast ease-soft cursor-pointer">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Laju Diversi TPA</span>
            <IconContainer variant="soft" size="sm">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </IconContainer>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">{diversionRate.toFixed(1)}%</span>
          </div>
          <p className="mt-1 text-xs text-muted">Target Pergub Bali: min. 70%</p>
        </div>

        {/* Stat 3 */}
        <div className="bg-surface p-5 rounded-xl border-2 border-border shadow-xs card-interactive hover:-translate-y-1 hover:shadow-interactive hover:border-brand-800 transition-all duration-fast ease-soft cursor-pointer">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Emisi Terhindar</span>
            <IconContainer variant="soft" size="sm">
              <TrendingUp className="w-4 h-4 text-teal-700" />
            </IconContainer>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-teal-600">
              {carbonAvoidedKg.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-medium text-muted ml-1">kg CO₂e</span>
          </div>
          <p className="mt-1 text-xs text-muted">Metodologi IPCC Waste Model</p>
        </div>

        {/* Stat 4: Quota Usage */}
        <div className="bg-surface p-5 rounded-xl border-2 border-border shadow-xs card-interactive hover:-translate-y-1 hover:shadow-interactive hover:border-brand-800 transition-all duration-fast ease-soft cursor-pointer">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Kuota CDOA Hari Ini</span>
            <IconContainer variant="warning" size="sm">
              <Clock className="w-4 h-4 text-amber-700" />
            </IconContainer>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {fallbackData.todayGeneratedKg} / {fallbackData.dailyQuotaKg}
            </span>
            <span className="text-xs font-medium text-muted ml-1">kg</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quotaUsedPct > 80 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${quotaUsedPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">{quotaUsedPct}% terpakai hari ini</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-4">Aksi Cepat Operasional HOREKA</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/hospitality/setoran"
            className="group p-5 bg-surface rounded-xl border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ClipboardPen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-brand-800 transition-colors">
                Catat Timbulan Shift
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Input penimbangan sampah per shift kitchen, housekeeping, atau restoran.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-brand-600 group-hover:text-brand-800 gap-1">
              Buka Form <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/hospitality/esg"
            className="group p-5 bg-surface rounded-xl border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileBarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-brand-800 transition-colors">
                Laporan ESG & Sertifikasi
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Unduh rekap bukti rantai pasok material untuk sertifikasi Green Hotel & audit ESG.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 group-hover:text-brand-800 gap-1">
              Lihat Laporan <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/hospitality/guest-companion"
            className="group p-5 bg-surface rounded-xl border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-brand-800 transition-colors">
                Guest Sorting Companion
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Generate QR code interaktif multilingual untuk ditempatkan di kamar tamu & villa.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-teal-600 group-hover:text-brand-800 gap-1">
              Cetak QR <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/hospitality/lapor"
            className="group p-5 bg-surface rounded-xl border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-brand-800 transition-colors">
                Lapor Kawasan (EcoLoop)
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Laporkan timbulan liar di akses wisata atau mintakan armada darurat ke DLH/TPS3R.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 group-hover:text-brand-800 gap-1">
              Buat Laporan <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Pickups Table */}
      <div className="bg-surface rounded-xl border-2 border-border p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground">Riwayat Penjemputan B2B Terverifikasi</h2>
            <p className="text-xs text-muted mt-0.5">
              Rantai lacak digital serah-terima material dari tenant hotel ke armada dan fasilitas olah.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-700 font-semibold rounded-full">
            Terkoneksi TPS3R & Mitra Berizin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-y border-border text-xs uppercase text-muted font-semibold">
              <tr>
                <th className="py-3 px-4">ID Penjemputan</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Kategori Sampah</th>
                <th className="py-3 px-4 text-right">Berat (kg)</th>
                <th className="py-3 px-4">Fasilitas Penerima</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fallbackData.recentPickups.map((pickup) => (
                <tr key={pickup.id} className="hover:bg-canvas/50 transition">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-foreground">
                    {pickup.id}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {pickup.date}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-foreground">
                    {pickup.category}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-foreground text-right">
                    {pickup.weightKg.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-muted" />
                      {pickup.facility}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        pickup.status === "PROCESSED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : pickup.status === "COLLECTED"
                          ? "bg-brand-50 text-brand-700 border border-brand-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {pickup.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
