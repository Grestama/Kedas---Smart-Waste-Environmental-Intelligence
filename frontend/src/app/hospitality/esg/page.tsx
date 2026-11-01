"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileBarChart2,
  Download,
  Printer,
  ShieldCheck,
  Leaf,
  Scale,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function HospitalityEsgPage() {
  const toast = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("Oktober 2026");

  const esgData = {
    tenantName: "Alila Ubud Resort & Spa",
    cdoaNo: "CDOA-HOREKA-ALILA-2026",
    period: "1 Oktober - 30 Oktober 2026",
    tier: "Tier 1 Green Tourism Leader",
    totalWasteKg: 12450.5,
    divertedKg: 10532.0,
    residualKg: 1918.5,
    diversionRate: 84.6,
    carbonAvoidedKg: 3980.2,
    streams: [
      { name: "Organik Dapur (Compost / Maggot BSF)", weightKg: 7850.0, pct: 63.1, color: "bg-emerald-500" },
      { name: "Organik Kebun (Mulch & Kompos)", weightKg: 1200.0, pct: 9.6, color: "bg-teal-500" },
      { name: "Karton & Kertas Daur Ulang", weightKg: 820.0, pct: 6.6, color: "bg-blue-500" },
      { name: "Plastik PET Bersih", weightKg: 412.0, pct: 3.3, color: "bg-amber-500" },
      { name: "Botol Kaca & Logam", weightKg: 250.0, pct: 2.0, color: "bg-purple-500" },
      { name: "Residu Terkendali TPA", weightKg: 1918.5, pct: 15.4, color: "bg-zinc-400" },
    ],
    auditLogs: [
      {
        batchId: "BATCH-ALILA-2026-1029",
        date: "2026-10-29",
        category: "Organik Dapur",
        weightKg: 280.5,
        destination: "TPS3R Desa Sayan / Ubud",
        shaProof: "8f4b1d...c902",
        status: "VERIFIED_AT_FACILITY",
      },
      {
        batchId: "BATCH-ALILA-2026-1027",
        date: "2026-10-27",
        category: "Karton & PET",
        weightKg: 145.0,
        destination: "Pusat Daur Ulang Gianyar Bersih",
        shaProof: "3e710a...11ef",
        status: "VERIFIED_AT_FACILITY",
      },
      {
        batchId: "BATCH-ALILA-2026-1025",
        date: "2026-10-25",
        category: "Organik Dapur",
        weightKg: 295.0,
        destination: "TPS3R Desa Sayan / Ubud",
        shaProof: "c2901a...f89a",
        status: "VERIFIED_AT_FACILITY",
      },
    ],
  };

  const handleExportPdf = () => {
    toast.success("Mengunduh Laporan Kepatuhan ESG Kedas (Format PDF Terverifikasi)...");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Breadcrumb & Period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/hospitality"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-foreground font-semibold"
          >
            <option value="Oktober 2026">Oktober 2026 (Berjalan)</option>
            <option value="September 2026">September 2026</option>
            <option value="Agustus 2026">Agustus 2026</option>
          </select>
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor PDF
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-foreground hover:bg-canvas transition"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> {esgData.tier}
            </div>
            <h1 className="text-2xl font-black text-foreground">{esgData.tenantName}</h1>
            <p className="text-xs text-muted mt-1 font-mono">
              Nomor Registrasi CDOA: {esgData.cdoaNo} • Periode Audit: {esgData.period}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-muted uppercase font-bold tracking-wider">
              Tingkat Diversi Sampah
            </span>
            <div className="text-3xl font-black text-emerald-600">{esgData.diversionRate}%</div>
            <span className="text-xs text-emerald-700 font-medium">Lolos Ambang Batas Hijau (≥ 70%)</span>
          </div>
        </div>

        {/* ESG Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Timbulan Terkelola
            </span>
            <div className="text-xl font-extrabold text-foreground mt-1">
              {esgData.totalWasteKg.toLocaleString("id-ID")} kg
            </div>
            <p className="text-xs text-muted mt-1">100% tercatat di timbangan digital</p>
          </div>
          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Teralihkan dari TPA Suwung
            </span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">
              {esgData.divertedKg.toLocaleString("id-ID")} kg
            </div>
            <p className="text-xs text-emerald-700 mt-1">Dikelola TPS3R & Mitra Daur Ulang</p>
          </div>
          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Emisi Karbon Terhindar
            </span>
            <div className="text-xl font-extrabold text-teal-600 mt-1">
              {esgData.carbonAvoidedKg.toLocaleString("id-ID")} kg CO₂e
            </div>
            <p className="text-xs text-muted mt-1">Model konversi IPCC Anaerobic Prevention</p>
          </div>
        </div>
      </div>

      {/* Stream Breakdown Bar */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-foreground">Komposisi Fraksi Material</h2>
        {/* Progress Bar */}
        <div className="h-4 w-full bg-canvas rounded-full overflow-hidden flex shadow-inner">
          {esgData.streams.map((stream, idx) => (
            <div
              key={idx}
              className={`${stream.color} h-full transition-all`}
              style={{ width: `${stream.pct}%` }}
              title={`${stream.name}: ${stream.pct}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {esgData.streams.map((stream, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-canvas border border-border text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${stream.color}`} />
                <span className="font-medium text-foreground">{stream.name}</span>
              </div>
              <span className="font-bold text-foreground font-mono">{stream.weightKg} kg ({stream.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Traceability Audit Trail */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Rantai Lacak Bukti Fisik (Audit Trail)</h2>
            <p className="text-xs text-muted">
              Data manifest serah-terima yang diverifikasi oleh fasilitas penerima (bukan self-claim).
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-canvas border border-border font-mono text-muted">
            SHA-256 Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-y border-border text-xs uppercase text-muted font-semibold">
              <tr>
                <th className="py-2.5 px-3">ID Manifest / Batch</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Berat (kg)</th>
                <th className="py-2.5 px-3">Fasilitas Penerima</th>
                <th className="py-2.5 px-3 text-center">Status Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {esgData.auditLogs.map((log) => (
                <tr key={log.batchId} className="hover:bg-canvas/50">
                  <td className="py-2.5 px-3 font-mono text-xs font-semibold text-foreground">
                    {log.batchId}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-muted">{log.date}</td>
                  <td className="py-2.5 px-3 text-xs font-medium text-foreground">{log.category}</td>
                  <td className="py-2.5 px-3 text-right text-xs font-bold text-foreground font-mono">
                    {log.weightKg.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-muted">{log.destination}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" /> Terverifikasi Fasilitas
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Audit Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold block mb-1">Catatan Independensi & Integritas Bukti:</span>
          <p className="leading-relaxed">
            Laporan Operasional Green Hospitality Kedas. Disusun berdasarkan rekaman riwayat alur material
            terverifikasi fasilitas (operational audit trail), bukan sertifikasi lingkungan tanpa bukti lapangan.
            Seluruh data penimbangan dapat ditelusuri ke tiket timbang digital TPS3R dan mitra berizin terkait.
          </p>
        </div>
      </div>
    </div>
  );
}
