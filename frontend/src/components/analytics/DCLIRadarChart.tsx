"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export interface DCLIDimension {
  name: string;
  code: string;
  score: number; // 0 - 100
  target: number; // e.g. 70
  description: string;
}

export interface DestinationDCLI {
  destinationId: string;
  destinationName: string;
  overallScore: number;
  tier: string;
  dimensions: DCLIDimension[];
  massBalance: {
    intakeKg: number;
    organicProcessedKg: number;
    recyclableSoldKg: number;
    residualSentKg: number;
    storageKg: number;
    processLossKg: number;
    variancePct: number;
  };
}

export const SAMPLE_DESTINATIONS: DestinationDCLI[] = [
  {
    destinationId: "dest-ubud",
    destinationName: "Koridor Hijau Ubud & Sayan (Gianyar)",
    overallScore: 86.4,
    tier: "Tier 1 - Destination Leader",
    dimensions: [
      {
        name: "Pemilahan di Sumber",
        code: "SEGREGATION",
        score: 88,
        target: 70,
        description: "Tingkat pemilahan organik vs anorganik oleh rumah tangga & hotel",
      },
      {
        name: "Keterlacakan Angkut",
        code: "TRACEABILITY",
        score: 92,
        target: 75,
        description: "Persentase penjemputan dengan digital manifest GPS & barcode",
      },
      {
        name: "Diversi Olah Organik",
        code: "ORGANIC_DIV",
        score: 85,
        target: 70,
        description: "Sampah organik masuk biokonversi maggot BSF & komposter desa",
      },
      {
        name: "Sirkularitas Nilai",
        code: "CIRCULAR_VAL",
        score: 82,
        target: 65,
        description: "Material anorganik terserap industri daur ulang terverifikasi",
      },
      {
        name: "Minimasi Residu TPA",
        code: "RESIDUAL_MIN",
        score: 85,
        target: 70,
        description: "Rasio residu yang ditekan di bawah 15% dari total timbulan",
      },
    ],
    massBalance: {
      intakeKg: 18450.0,
      organicProcessedKg: 11250.0,
      recyclableSoldKg: 3820.0,
      residualSentKg: 2210.0,
      storageKg: 780.0,
      processLossKg: 390.0,
      variancePct: 0.38,
    },
  },
  {
    destinationId: "dest-sanur",
    destinationName: "Kawasan Wisata Sanur Kauh (Denpasar)",
    overallScore: 78.2,
    tier: "Tier 2 - Good Compliance",
    dimensions: [
      {
        name: "Pemilahan di Sumber",
        code: "SEGREGATION",
        score: 74,
        target: 70,
        description: "Tingkat pemilahan organik vs anorganik oleh rumah tangga & hotel",
      },
      {
        name: "Keterlacakan Angkut",
        code: "TRACEABILITY",
        score: 80,
        target: 75,
        description: "Persentase penjemputan dengan digital manifest GPS & barcode",
      },
      {
        name: "Diversi Olah Organik",
        code: "ORGANIC_DIV",
        score: 79,
        target: 70,
        description: "Sampah organik masuk biokonversi maggot BSF & komposter desa",
      },
      {
        name: "Sirkularitas Nilai",
        code: "CIRCULAR_VAL",
        score: 85,
        target: 65,
        description: "Material anorganik terserap industri daur ulang terverifikasi",
      },
      {
        name: "Minimasi Residu TPA",
        code: "RESIDUAL_MIN",
        score: 73,
        target: 70,
        description: "Rasio residu yang ditekan di bawah 15% dari total timbulan",
      },
    ],
    massBalance: {
      intakeKg: 14200.0,
      organicProcessedKg: 7950.0,
      recyclableSoldKg: 3410.0,
      residualSentKg: 2150.0,
      storageKg: 420.0,
      processLossKg: 270.0,
      variancePct: 0.56,
    },
  },
  {
    destinationId: "dest-kuta",
    destinationName: "Kawasan Urban Kuta & Seminyak (Badung)",
    overallScore: 64.8,
    tier: "Tier 3 - Action Required",
    dimensions: [
      {
        name: "Pemilahan di Sumber",
        code: "SEGREGATION",
        score: 58,
        target: 70,
        description: "Tingkat pemilahan organik vs anorganik oleh rumah tangga & hotel",
      },
      {
        name: "Keterlacakan Angkut",
        code: "TRACEABILITY",
        score: 68,
        target: 75,
        description: "Persentase penjemputan dengan digital manifest GPS & barcode",
      },
      {
        name: "Diversi Olah Organik",
        code: "ORGANIC_DIV",
        score: 62,
        target: 70,
        description: "Sampah organik masuk biokonversi maggot BSF & komposter desa",
      },
      {
        name: "Sirkularitas Nilai",
        code: "CIRCULAR_VAL",
        score: 75,
        target: 65,
        description: "Material anorganik terserap industri daur ulang terverifikasi",
      },
      {
        name: "Minimasi Residu TPA",
        code: "RESIDUAL_MIN",
        score: 61,
        target: 70,
        description: "Rasio residu yang ditekan di bawah 15% dari total timbulan",
      },
    ],
    massBalance: {
      intakeKg: 21500.0,
      organicProcessedKg: 9800.0,
      recyclableSoldKg: 4800.0,
      residualSentKg: 5600.0,
      storageKg: 750.0,
      processLossKg: 550.0,
      variancePct: 1.12,
    },
  },
];

export function DCLIRadarChart() {
  const [selectedDestId, setSelectedDestId] = useState<string>("dest-ubud");
  const destination =
    SAMPLE_DESTINATIONS.find((d) => d.destinationId === selectedDestId) ||
    SAMPLE_DESTINATIONS[0];

  // SVG Geometry constants
  const size = 350;
  const center = size / 2;
  const radius = 120;
  const numAxes = destination.dimensions.length;
  const angleStep = (2 * Math.PI) / numAxes;

  // Helper to compute (x, y) for an index and normalized value (0 - 1)
  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Concentric polygon points (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map((lvl) => {
    const pts = Array.from({ length: numAxes }).map((_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x},${y}`;
    });
    return pts.join(" ");
  });

  // Target baseline polygon (70%)
  const targetPoints = destination.dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(i, dim.target);
      return `${x},${y}`;
    })
    .join(" ");

  // Actual score polygon
  const scorePoints = destination.dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(i, dim.score);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-6">
      {/* Header & Destination Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Destination Clean Loop Index (DCLI) Multi-Dimensional Radar
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Performa Sirkular Lintas Kawasan Destinasi
          </h2>
          <p className="text-xs text-muted">
            Evaluasi 5 dimensi efektivitas penutupan siklus material berbasis data lapangan TPS3R.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
          <select
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            className="text-xs font-semibold bg-canvas border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          >
            {SAMPLE_DESTINATIONS.map((d) => (
              <option key={d.destinationId} value={d.destinationId}>
                {d.destinationName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Radar & KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Radar Chart (7 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-2 bg-canvas/60 rounded-xl border border-border relative">
          <svg
            width={size}
            height={size}
            className="overflow-visible"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Concentric Grid Rings */}
            {gridPolygons.map((pts, idx) => (
              <polygon
                key={idx}
                points={pts}
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeWidth={1}
                strokeDasharray={idx === 2 ? "2,2" : undefined}
              />
            ))}

            {/* Radial Axes */}
            {Array.from({ length: numAxes }).map((_, i) => {
              const { x, y } = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth={1}
                />
              );
            })}

            {/* Target 70% Baseline Polygon (Dashed Amber) */}
            <polygon
              points={targetPoints}
              fill="rgba(245, 158, 11, 0.08)"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />

            {/* Destination Score Polygon (Emerald) */}
            <polygon
              points={scorePoints}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#059669"
              strokeWidth={2.5}
              className="transition-all duration-500 ease-out"
            />

            {/* Vertex Dots */}
            {destination.dimensions.map((dim, i) => {
              const { x, y } = getCoordinates(i, dim.score);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4.5}
                  className="fill-emerald-600 stroke-white stroke-2 transition-all duration-500"
                />
              );
            })}

            {/* Axis Labels */}
            {destination.dimensions.map((dim, i) => {
              const { x, y } = getCoordinates(i, 118);
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[10px] font-bold fill-foreground"
                >
                  {dim.name}
                </text>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium pt-3 text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-foreground">Skor Aktual ({destination.overallScore})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed border-amber-600 inline-block" />
              <span>Target Ambang (70)</span>
            </div>
          </div>
        </div>

        {/* Dimension Breakdown Cards (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-4 rounded-xl bg-canvas border border-border flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-bold">
                Skor Indeks DCLI Wilayah
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-0.5">
                {destination.overallScore} <span className="text-sm font-semibold text-muted">/ 100</span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                destination.overallScore >= 80
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : destination.overallScore >= 70
                  ? "bg-teal-100 text-teal-800 border border-teal-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {destination.tier}
            </span>
          </div>

          <div className="space-y-2">
            {destination.dimensions.map((dim) => {
              const isPassing = dim.score >= dim.target;
              return (
                <div
                  key={dim.code}
                  className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between text-xs"
                >
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{dim.name}</span>
                      {isPassing ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted truncate">{dim.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-foreground text-sm">
                      {dim.score}
                    </span>
                    <span className="text-[10px] text-muted block">Target: {dim.target}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mass-Balance Reconciliation Bar */}
      <div className="p-5 rounded-xl bg-canvas border border-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              Rekonsiliasi Neraca Massa (Mass-Balance Audit)
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              Variansi: {destination.massBalance.variancePct}% (Toleransi &lt; 2%)
            </span>
          </div>
          <span className="text-xs text-muted font-mono">
            Total Input: {destination.massBalance.intakeKg.toLocaleString("id-ID")} kg
          </span>
        </div>

        {/* Formula breakdown ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-muted block">1. Olah Kompos/BSF</span>
            <span className="font-bold text-emerald-600 font-mono">
              {destination.massBalance.organicProcessedKg.toLocaleString("id-ID")} kg
            </span>
          </div>
          <div className="p-2 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-muted block">2. Daur Ulang Industri</span>
            <span className="font-bold text-blue-600 font-mono">
              {destination.massBalance.recyclableSoldKg.toLocaleString("id-ID")} kg
            </span>
          </div>
          <div className="p-2 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-muted block">3. Residu Suwung</span>
            <span className="font-bold text-zinc-600 font-mono">
              {destination.massBalance.residualSentKg.toLocaleString("id-ID")} kg
            </span>
          </div>
          <div className="p-2 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-muted block">4. Stok Penyimpanan</span>
            <span className="font-bold text-amber-600 font-mono">
              {destination.massBalance.storageKg.toLocaleString("id-ID")} kg
            </span>
          </div>
          <div className="p-2 bg-surface rounded-lg border border-border">
            <span className="text-[10px] text-muted block">5. Susut Evaporasi</span>
            <span className="font-bold text-muted font-mono">
              {destination.massBalance.processLossKg.toLocaleString("id-ID")} kg
            </span>
          </div>
        </div>

        {/* Carbon Factor Methodology Disclaimer */}
        <div className="text-[11px] text-muted flex items-start gap-2 pt-2 border-t border-border">
          <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Metodologi Faktor Karbon:</strong> Perhitungan emisi terhindar menggunakan model IPCC 2006 / Standar KLHK (0.45 kg CO₂e per kg sampah organik terkelola aerobik yang terhindar dari dekomposisi anaerobik TPA terbuka).
          </p>
        </div>
      </div>
    </div>
  );
}
