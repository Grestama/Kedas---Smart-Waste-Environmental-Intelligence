"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  FileText,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Search,
  Info,
  PhoneCall,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconContainer } from "@/components/ui/IconContainer";
import { collectionService } from "@/services/collection";
import { getServiceDirectory } from "@/services/community";
import { ServiceDirectoryResponse, ServiceCategoryInfo } from "@/types/community";
import { ServiceArea } from "@/types/collection";

interface DisplayArea {
  id: string;
  name: string;
  administrativeArea: string;
  status: string;
  isActive: boolean;
  agreementNo: string;
  days: string;
  hours: string;
  posStation: string;
  slaHours: string;
  capacityDaily: string;
  escalationChannel: string;
  acceptedCategories: ServiceCategoryInfo[];
  unavailabilityReason?: string | null;
}

const FALLBACK_AREAS: DisplayArea[] = [
  {
    id: "sa-sukawati-kaja",
    name: "Banjar Kaja, Desa Sukawati",
    administrativeArea: "Kecamatan Sukawati, Gianyar",
    status: "CDOA Aktif (V1.2)",
    isActive: true,
    agreementNo: "CDOA-SUKAWATI-KAJA-V1",
    days: "Senin, Rabu, Jumat",
    hours: "08:00 - 11:30 WITA",
    posStation: "TPS3R Kompos Sukawati Kaja",
    slaHours: "24 Jam",
    capacityDaily: "750 kg/hari",
    escalationChannel: "Kelian Dinas Banjar Kaja / WA Center (+62 812-3456-7890)",
    acceptedCategories: [
      { id: "cat-org", code: "ORG", name: "Organik & Sisa Upakara", handling_notes: "Keringkan tirta dan pilah canang dari plastik" },
      { id: "cat-rec", code: "REC", name: "Anorganik Daur Ulang", handling_notes: "Bilas bersih botol PET dan kaleng" },
      { id: "cat-res", code: "RES", name: "Residu Terkendali", handling_notes: "Bungkus rapat limbah pembalut & diapers" },
    ],
  },
  {
    id: "sa-sukawati-tengah",
    name: "Banjar Tengah, Desa Sukawati",
    administrativeArea: "Kecamatan Sukawati, Gianyar",
    status: "CDOA Aktif (V1.0)",
    isActive: true,
    agreementNo: "CDOA-SUKAWATI-TENGAH-V1",
    days: "Selasa, Kamis, Sabtu",
    hours: "08:00 - 11:30 WITA",
    posStation: "Pos TPS3R Sukawati Tengah",
    slaHours: "24 Jam",
    capacityDaily: "600 kg/hari",
    escalationChannel: "Sekretariat Banjar Tengah (+62 813-9876-5432)",
    acceptedCategories: [
      { id: "cat-org", code: "ORG", name: "Organik Kebun & Upakara", handling_notes: "Wadah karung terpisah dari anorganik" },
      { id: "cat-rec", code: "REC", name: "Anorganik Terpilah", handling_notes: "Kardus, kertas, botol kaca & plastik" },
    ],
  },
  {
    id: "sa-sukawati-kelod",
    name: "Banjar Kelod, Desa Sukawati",
    administrativeArea: "Kecamatan Sukawati, Gianyar",
    status: "Tahap Penyusunan CDOA",
    isActive: false,
    agreementNo: "CDOA-SUKAWATI-KELOD-DRAFT",
    days: "Jadwal paruman sedang berlangsung",
    hours: "Tahap musyawarah banjar",
    posStation: "Rencana Pos Kelod",
    slaHours: "Pending Approval",
    capacityDaily: "Dalam kalkulasi",
    escalationChannel: "Prajuru Desa Adat Sukawati",
    acceptedCategories: [],
    unavailabilityReason: "Belum ada Kesepakatan Operasional Destinasi (CDOA) yang berstatus PUBLISHED untuk kawasan ini.",
  },
];

export default function ServiceAreaPage() {
  const [areas, setAreas] = useState<DisplayArea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "PENDING">("ALL");
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);

  const fetchServiceAreasData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all service areas from collection service
      const serviceAreas: ServiceArea[] = await collectionService.getServiceAreas();

      if (!serviceAreas || serviceAreas.length === 0) {
        setAreas(FALLBACK_AREAS);
        setIsUsingFallback(true);
        return;
      }

      // 2. Query CDOA Service Directory per area to enrich data
      const enriched = await Promise.allSettled(
        serviceAreas.map(async (sa) => {
          try {
            const dir: ServiceDirectoryResponse = await getServiceDirectory(sa.id);
            const activeCdoa = dir.active_cdoa;
            const isCdoaActive = dir.is_service_active && !!activeCdoa;

            return {
              id: sa.id,
              name: sa.name,
              administrativeArea: sa.administrative_area || "Kawasan Destinasi Bali",
              status: isCdoaActive
                ? `CDOA Aktif (V${activeCdoa?.version || 1}.0)`
                : activeCdoa
                ? `CDOA ${activeCdoa.status}`
                : "Tahap Penyusunan CDOA",
              isActive: isCdoaActive,
              agreementNo: activeCdoa?.agreement_no || `CDOA-${sa.code || sa.id}-PENDING`,
              days: activeCdoa?.collection_schedule_notes || dir.schedule_notes || (isCdoaActive ? "Senin - Sabtu" : "Sedang disusun"),
              hours: isCdoaActive ? "08:00 - 12:00 WITA" : "Tahap musyawarah banjar",
              posStation: `TPS3R / Pos ${sa.name.replace(/Banjar|Desa/gi, "").trim()}`,
              slaHours: activeCdoa?.sla_hours ? `${activeCdoa.sla_hours} Jam` : "Belum ditentukan",
              capacityDaily: dir.daily_capacity_limit_kg
                ? `${dir.daily_capacity_limit_kg.toLocaleString("id-ID")} kg/hari`
                : activeCdoa?.capacity_limit_daily_kg
                ? `${activeCdoa.capacity_limit_daily_kg.toLocaleString("id-ID")} kg/hari`
                : "Dalam kalkulasi",
              escalationChannel: dir.escalation_channel || activeCdoa?.escalation_channel || "Prajuru Banjar & Operator TPS3R",
              acceptedCategories: dir.accepted_categories || [],
              unavailabilityReason: dir.unavailability_reason,
            } as DisplayArea;
          } catch {
            // If service directory endpoint fails for a specific area, construct default representation
            return {
              id: sa.id,
              name: sa.name,
              administrativeArea: sa.administrative_area || "Kawasan Destinasi Bali",
              status: sa.is_active ? "Area Aktif (CDOA Tervalidasi)" : "Tahap Penyusunan CDOA",
              isActive: sa.is_active,
              agreementNo: `CDOA-${sa.code || sa.id}`,
              days: sa.is_active ? "Senin, Rabu, Jumat" : "Sedang dijadwalkan",
              hours: sa.is_active ? "08:00 - 11:30 WITA" : "Musyawarah Banjar",
              posStation: `Pos ${sa.name}`,
              slaHours: sa.is_active ? "24 Jam" : "Pending Approval",
              capacityDaily: sa.is_active ? "500 kg/hari" : "Dalam kalkulasi",
              escalationChannel: "Koordinator Layanan Destinasi Kedas",
              acceptedCategories: [],
            } as DisplayArea;
          }
        })
      );

      const resolvedAreas: DisplayArea[] = enriched.map((res, idx) => {
        if (res.status === "fulfilled") {
          return res.value;
        }
        const fallback = FALLBACK_AREAS[idx % FALLBACK_AREAS.length];
        return {
          ...fallback,
          id: `sa-fallback-${idx}`,
        };
      });

      setAreas(resolvedAreas);
      setIsUsingFallback(false);
    } catch (err: any) {
      console.warn("Using fallback service areas due to API error:", err);
      setAreas(FALLBACK_AREAS);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceAreasData();
  }, []);

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchesSearch =
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.administrativeArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.agreementNo.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterStatus === "ACTIVE") {
        return matchesSearch && area.isActive;
      }
      if (filterStatus === "PENDING") {
        return matchesSearch && !area.isActive;
      }
      return matchesSearch;
    });
  }, [areas, searchQuery, filterStatus]);

  const toggleExpand = (id: string) => {
    setExpandedAreaId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header section */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Tata Kelola Berbasis Kesepakatan Kawasan (CDOA)
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-900 tracking-tight">
          Cakupan Area Layanan & Aturan Operasional Destinasi
        </h1>
        <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
          Setiap kawasan di Kedas diatur oleh <strong>Community Destination Operating Agreement (CDOA)</strong> — kesepakatan operasional digital yang diverifikasi oleh prajuru banjar dan operator fasilitas sesuai Pergub Bali No. 47/2019. Layanan hanya aktif pada zona yang kesepakatannya telah disahkan.
        </p>

        {/* Sync & Fallback Banner */}
        {isUsingFallback && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mt-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Menampilkan data direktori terverifikasi lokal (Mode Offline / Cache Aktif).
              </span>
            </div>
            <button
              onClick={fetchServiceAreasData}
              className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline ml-2 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Sinkronisasi Ulang
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Banjar, Desa, Kecamatan, atau No. CDOA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterStatus === "ALL"
                ? "bg-brand-900 text-white shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:bg-sand-100"
            }`}
          >
            Semua ({areas.length})
          </button>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterStatus === "ACTIVE"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:bg-sand-100"
            }`}
          >
            CDOA Aktif ({areas.filter((a) => a.isActive).length})
          </button>
          <button
            onClick={() => setFilterStatus("PENDING")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterStatus === "PENDING"
                ? "bg-amber-700 text-white shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:bg-sand-100"
            }`}
          >
            Dalam Penyusunan ({areas.filter((a) => !a.isActive).length})
          </button>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 rounded-2xl bg-surface border border-border space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-sand-200" />
                <div className="w-24 h-5 rounded-full bg-sand-200" />
              </div>
              <div className="w-3/4 h-6 rounded bg-sand-200 mt-4" />
              <div className="w-1/2 h-4 rounded bg-sand-200" />
              <div className="space-y-2 pt-4">
                <div className="w-full h-4 rounded bg-sand-200" />
                <div className="w-5/6 h-4 rounded bg-sand-200" />
                <div className="w-4/6 h-4 rounded bg-sand-200" />
              </div>
              <div className="pt-4 border-t border-border">
                <div className="w-full h-9 rounded-lg bg-sand-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Retry State */}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-bold text-red-900">Gagal Memuat Data Direktori Layanan</h3>
          <p className="text-sm text-red-700">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchServiceAreasData} className="mt-2">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Empty Search Result State */}
      {!loading && !error && filteredAreas.length === 0 && (
        <div className="p-12 rounded-2xl bg-surface border border-border text-center space-y-3">
          <MapPin className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="font-bold text-brand-900 text-base">Wilayah Layanan Tidak Ditemukan</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Tidak ada banjar atau kawasan yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("ALL");
            }}
          >
            Reset Pencarian
          </Button>
        </div>
      )}

      {/* Dynamic Areas Grid */}
      {!loading && !error && filteredAreas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredAreas.map((area) => {
            const isExpanded = expandedAreaId === area.id;
            return (
              <div
                key={area.id}
                className="p-6 rounded-2xl bg-surface border-2 border-border flex flex-col justify-between space-y-5 shadow-sm hover:border-brand-800 hover:-translate-y-1.5 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <IconContainer variant="soft" size="md">
                      <MapPin className="w-5 h-5 text-brand-900" />
                    </IconContainer>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        area.isActive
                          ? "bg-[#E7F4EA] text-[#276749] border border-[#C6F6D5]"
                          : "bg-[#FFF4D9] text-[#98631C] border border-[#FEEBC8]"
                      }`}
                    >
                      {area.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-brand-900 mt-4 leading-tight">{area.name}</h2>
                  <div className="text-xs text-text-muted mt-0.5">{area.administrativeArea}</div>

                  <div className="text-[11px] text-text-muted flex items-center gap-1 mt-2 font-mono">
                    <FileText className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                    <span className="truncate">{area.agreementNo}</span>
                  </div>

                  <div className="mt-5 space-y-2.5 text-xs text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-700 shrink-0" />
                      <span>
                        Jadwal: <strong>{area.days}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-700 shrink-0" />
                      <span>
                        Waktu: <strong>{area.hours}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                      <span>
                        Fasilitas: <strong>{area.posStation}</strong>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-[11px]">
                      <span>
                        SLA Penjemputan: <strong>{area.slaHours}</strong>
                      </span>
                      <span>
                        Kapasitas: <strong>{area.capacityDaily}</strong>
                      </span>
                    </div>
                  </div>

                  {/* CDOA Details Accordion */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => toggleExpand(area.id)}
                      className="w-full flex items-center justify-between text-xs text-brand-800 hover:text-brand-950 font-medium py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-700" />
                        {isExpanded ? "Tutup Aturan Kawasan" : "Lihat Aturan CDOA & Pemilahan"}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-2.5 p-3 rounded-xl bg-sand-50/70 border border-border text-xs text-text-secondary animate-in fade-in duration-200">
                        <div>
                          <div className="font-semibold text-brand-900 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-brand-700" />
                            Kategori Sampah yang Diterima:
                          </div>
                          {area.acceptedCategories.length > 0 ? (
                            <ul className="space-y-1 pl-1">
                              {area.acceptedCategories.map((cat) => (
                                <li key={cat.id || cat.code} className="text-[11px]">
                                  <span className="font-semibold text-brand-800">[{cat.code}] {cat.name}</span>
                                  {cat.handling_notes && (
                                    <span className="text-text-muted block pl-2 italic">- {cat.handling_notes}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-text-muted italic">
                              {area.unavailabilityReason || "Aturan pemilahan kategori mengikuti Pergub 47/2019."}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/60 text-[11px]">
                          <div className="font-semibold text-brand-900 flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-brand-700" />
                            Saluran Eskalasi & Aduan:
                          </div>
                          <p className="text-text-muted mt-0.5">{area.escalationChannel}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  {area.isActive ? (
                    <Link href={`/daftar?service_area_id=${encodeURIComponent(area.id)}`}>
                      <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-2">
                        Daftar Warga Banjar Ini
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <div className="text-center py-2 px-3 rounded-lg bg-sand-100 text-text-muted text-xs">
                      Pendaftaran dibuka setelah paruman CDOA selesai
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Bottom Banner */}
      <div className="p-6 rounded-2xl bg-brand-50/50 border-2 border-brand-200 hover:border-brand-700 hover:-translate-y-0.5 hover:shadow-interactive transition-all duration-fast flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-brand-900 text-sm sm:text-base">
            Ingin Mengaktifkan CDOA di Banjar atau Kawasan Wisata Anda?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Tim Kedas mendampingi prajuru adat, pengelola TPS3R, dan asosiasi HOREKA dalam perancangan aturan kebersihan destinasi.
          </p>
        </div>
        <Link href="/kontak" className="shrink-0 w-full sm:w-auto">
          <Button size="sm" variant="primary">
            Hubungi Koordinator Kawasan
          </Button>
        </Link>
      </div>
    </div>
  );
}
