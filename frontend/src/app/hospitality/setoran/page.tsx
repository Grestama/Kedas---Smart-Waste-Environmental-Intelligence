"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardPen,
  Scale,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Plus,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface WasteEntry {
  category: string;
  weightKg: number;
  origin: string;
}

export default function HospitalitySetoranPage() {
  const toast = useToast();
  const [shift, setShift] = useState("Pagi (06:00 - 14:00)");
  const [picName, setPicName] = useState("Wayan Sukerta");
  const [department, setDepartment] = useState("Main Kitchen & Banquet");
  const [entries, setEntries] = useState<WasteEntry[]>([
    { category: "Organik Dapur (Food Waste)", weightKg: 145.5, origin: "Main Kitchen" },
    { category: "Anorganik - Botol Kaca & Kaleng", weightKg: 28.0, origin: "Bar & Pool" },
    { category: "Anorganik - Kardus & Paperboard", weightKg: 35.5, origin: "Gudang Logistik" },
  ]);
  const [newCategory, setNewCategory] = useState("Organik Dapur (Food Waste)");
  const [newWeight, setNewWeight] = useState<string>("");
  const [newOrigin, setNewOrigin] = useState("Housekeeping");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);

  const totalKg = entries.reduce((acc, curr) => acc + curr.weightKg, 0);
  const organicKg = entries
    .filter((e) => e.category.toLowerCase().includes("organik"))
    .reduce((acc, curr) => acc + curr.weightKg, 0);
  const estimatedCarbonOffset = Math.round(organicKg * 0.45);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error("Masukkan berat timbulan yang valid (> 0 kg)");
      return;
    }
    setEntries([...entries, { category: newCategory, weightKg: weightNum, origin: newOrigin }]);
    setNewWeight("");
    toast.success(`Berhasil menambahkan ${newCategory} (${weightNum} kg)`);
  };

  const handleRemoveEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const handleSimulateAiScan = () => {
    setIsAiScanning(true);
    setAiVerdict(null);
    setTimeout(() => {
      setIsAiScanning(false);
      setAiVerdict(
        "Kedas Vision Verified: 98.4% Kemurnian Organik. Tidak terdeteksi kontaminasi plastik di atas toleransi (0.5%). Memenuhi syarat intake TPS3R CDOA."
      );
      toast.success("Verifikasi visual AI berhasil!");
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entries.length === 0) {
      toast.error("Harap tambahkan minimal satu catatan timbulan");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Berhasil mencatat setoran shift ${shift}. Total: ${totalKg.toFixed(1)} kg.`);
      // Reset or keep entries for review
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/hospitality"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
          Standar Pergub Bali No. 47/2019
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <ClipboardPen className="w-6 h-6 text-brand-600" />
          Pencatatan Timbulan Sampah Harian
        </h1>
        <p className="mt-1 text-sm text-muted">
          Catat pemilahan sampah per shift secara real-time untuk menjamin ketertelusuran data
          (data traceability) sebelum diserah-terimakan ke armada angkut TPS3R.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shift & PIC metadata card */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-600" />
            Informasi Shift & Penanggung Jawab
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Shift Kerja</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full text-sm bg-canvas border border-border rounded-lg px-3 py-2 text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                <option value="Pagi (06:00 - 14:00)">Pagi (06:00 - 14:00)</option>
                <option value="Sore (14:00 - 22:00)">Sore (14:00 - 22:00)</option>
                <option value="Malam (22:00 - 06:00)">Malam (22:00 - 06:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Departemen / Area</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-sm bg-canvas border border-border rounded-lg px-3 py-2 text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Petugas Timbang (PIC)</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full text-sm bg-canvas border border-border rounded-lg px-3 py-2 text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Current Waste Entries Table */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-600" />
              Rincian Fraksi Timbulan ({entries.length} Komponen)
            </h2>
            <span className="text-xs font-bold text-foreground bg-canvas px-3 py-1 rounded-full border border-border">
              Total Saat Ini: {totalKg.toFixed(1)} kg
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas border-y border-border text-xs uppercase text-muted font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Asal Area</th>
                  <th className="py-2.5 px-3 text-right">Berat (kg)</th>
                  <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-canvas/50">
                    <td className="py-2.5 px-3 font-medium text-foreground">{entry.category}</td>
                    <td className="py-2.5 px-3 text-xs text-muted">{entry.origin}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground font-mono">
                      {entry.weightKg.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveEntry(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-sm hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick add entry row */}
          <div className="p-3 bg-canvas rounded-lg border border-border flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-muted block mb-1">Pilih Kategori</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs bg-surface border border-border rounded-md px-2.5 py-1.5 text-foreground"
              >
                <option value="Organik Dapur (Food Waste)">Organik Dapur (Food Waste)</option>
                <option value="Organik Taman (Dedaunan & Ranting)">Organik Taman (Dedaunan & Ranting)</option>
                <option value="Anorganik - Botol PET / Plastik Bersih">Anorganik - Botol PET / Plastik Bersih</option>
                <option value="Anorganik - Botol Kaca & Kaleng">Anorganik - Botol Kaca & Kaleng</option>
                <option value="Anorganik - Kardus & Paperboard">Anorganik - Kardus & Paperboard</option>
                <option value="Residu Non-Daur Ulang">Residu Non-Daur Ulang</option>
              </select>
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs font-semibold text-muted block mb-1">Asal Area</label>
              <input
                type="text"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                placeholder="Contoh: Bar"
                className="w-full text-xs bg-surface border border-border rounded-md px-2.5 py-1.5 text-foreground"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="text-xs font-semibold text-muted block mb-1">Berat (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="0.0"
                className="w-full text-xs bg-surface border border-border rounded-md px-2.5 py-1.5 text-foreground font-mono"
              />
            </div>
            <div className="w-full sm:w-auto self-end">
              <button
                type="button"
                onClick={handleAddEntry}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-brand-600 text-white hover:bg-brand-700 transition"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>
          </div>
        </div>

        {/* AI Vision Verification Module */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Kedas Vision — Audit Visual Kemurnian</h3>
                <p className="text-xs text-muted">
                  Verifikasi visual kepatuhan pemilahan sebelum kontainer diangkut armada.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSimulateAiScan}
              disabled={isAiScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              {isAiScanning ? "Menganalisis Visual..." : "Uji Coba Verifikasi AI"}
            </button>
          </div>

          {aiVerdict && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="leading-relaxed">{aiVerdict}</p>
            </div>
          )}
        </div>

        {/* Environmental Impact Summary */}
        <div className="bg-emerald-950 text-white rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
              Estimasi Manfaat Sirkular Shift Ini
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {estimatedCarbonOffset} kg CO₂e
              </span>
              <span className="text-xs text-emerald-200">
                potensi emisi gas metana terhindar dari {organicKg.toFixed(1)} kg organik
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? "Menyimpan Data..." : "Simpan Catatan Timbulan"}
          </button>
        </div>
      </form>
    </div>
  );
}
