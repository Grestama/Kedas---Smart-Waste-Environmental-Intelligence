"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Globe2,
  Leaf,
  Trash2,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Heart,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconContainer } from "@/components/ui/IconContainer";

type Language = "id" | "en";

export default function GuestGreenCompanionPage() {
  const [lang, setLang] = useState<Language>("en");

  const content = {
    en: {
      tagline: "Guest Green Companion",
      title: "Clean Destination Guide & Responsible Travel in Bali",
      subtitle:
        "Welcome to the Island of the Gods! Help us preserve Bali's sacred landscape, banjar communities, and pristine beaches through coordinated waste sorting.",
      switchLang: "Bahasa Indonesia",
      etiquetteTitle: "Tri Hita Karana & Environmental Etiquette",
      etiquetteDesc:
        "Under Balinese philosophy and Governor Regulation (Pergub) No. 47/2019, tourism operates in harmony with nature. Respect ritual sites, avoid single-use plastics, and dispose of offerings (canang sari) respectfully.",
      sortingTitle: "How to Sort Waste in Bali",
      sortingSubtitle: "Standard 3-Stream Separation for Visitors & Accommodations",
      bins: [
        {
          name: "Green Bin (Organic / Alami)",
          items: "Spent canang sari offerings, food scraps, coconut husks, fruit peel, leaves.",
          dest: "Transported to community TPS3R for aerobic composting and organic soil regeneration.",
          color: "border-emerald-300 bg-emerald-50 text-emerald-900",
          iconColor: "text-emerald-700",
        },
        {
          name: "Yellow Bin (Recyclables / Anorganik)",
          items: "Clean PET water bottles, aluminum beverage cans, cardboard, paper bags, glass bottles.",
          dest: "Aggregated, baled, and transferred to verified local circular recycling partners.",
          color: "border-amber-300 bg-amber-50 text-amber-900",
          iconColor: "text-amber-700",
        },
        {
          name: "Grey / Red Bin (Residual / Residu)",
          items: "Wet wipes, laminated food wrappers, styrofoam, broken composite items.",
          dest: "Strictly isolated for sanitary managed landfill transfer without open burning.",
          color: "border-slate-300 bg-slate-50 text-slate-900",
          iconColor: "text-slate-700",
        },
      ],
      waterRefillTitle: "Zero-Plastic Hydration",
      waterRefillDesc:
        "Say no to single-use plastic bottles. Look for certified RefillMyBottle stations across Ubud, Sanur, Canggu, and Seminyak.",
      eventsTitle: "Join a Banjar EcoLoop Cleanup",
      eventsDesc:
        "Connect with local villagers and environmental volunteers. Visitors are warmly welcomed at community beach cleanups (Gotong Royong / Ngayah).",
      eventsCta: "Explore Community Cleanups",
      feedbackTitle: "Notice an Overflowing Bin or Issue?",
      feedbackDesc:
        "Help our banjar cleaning crew take action promptly. Share a location report anonymously.",
      feedbackCta: "Report Public Cleanliness Issue",
      footerNote:
        "Kedas Destination Operations — Powered by Banjar Adat & Sustainable Tourism Facilities in Bali.",
    },
    id: {
      tagline: "Guest Green Companion",
      title: "Panduan Kebersihan Destinasi & Wisata Bertanggung Jawab di Bali",
      subtitle:
        "Selamat datang di Pulau Dewata! Bantu kami menjaga kesucian alam Bali, komunitas banjar, dan keasrian pantai melalui pemilahan sampah yang terkoordinasi.",
      switchLang: "English",
      etiquetteTitle: "Tri Hita Karana & Etika Lingkungan",
      etiquetteDesc:
        "Berdasarkan kearifan lokal Tri Hita Karana dan Pergub Bali No. 47/2019, kelestarian alam dijaga bersama. Hormati area persembahyangan, hindari kantong plastik sekali pakai, dan letakkan sisa canang pada wadah organik.",
      sortingTitle: "Cara Memilah Sampah di Kawasan",
      sortingSubtitle: "Standar Pemilahan 3 Jalur untuk Wisatawan & Akomodasi",
      bins: [
        {
          name: "Tempat Sampah Hijau (Organik)",
          items: "Sisa canang sari, sisa makanan dapur, batok kelapa, kulit buah, serasah daun.",
          dest: "Diolah di TPS3R banjar menjadi kompos alami dan pakan maggot BSF.",
          color: "border-emerald-300 bg-emerald-50 text-emerald-900",
          iconColor: "text-emerald-700",
        },
        {
          name: "Tempat Sampah Kuning (Daur Ulang)",
          items: "Botol plastik PET bersih, kaleng minuman, kardus box, kertas, botol kaca.",
          dest: "Dikumpulkan dan disalurkan ke mitra industri daur ulang terverifikasi.",
          color: "border-amber-300 bg-amber-50 text-amber-900",
          iconColor: "text-amber-700",
        },
        {
          name: "Tempat Sampah Abu/Merah (Residu)",
          items: "Tisu basah, bungkus sachet berlapis foil, puntung rokok, kemasan styrofoam.",
          dest: "Dipisahkan secara aman menuju TPA resmi tanpa pembakaran liar.",
          color: "border-slate-300 bg-slate-50 text-slate-900",
          iconColor: "text-slate-700",
        },
      ],
      waterRefillTitle: "Hidrasi Bebas Botol Sekali Pakai",
      waterRefillDesc:
        "Kurangi sampah plastik. Isi ulang tumbler Anda di stasiun air minum terverifikasi di Ubud, Sanur, Canggu, dan Seminyak.",
      eventsTitle: "Ikuti Gotong Royong EcoLoop Banjar",
      eventsDesc:
        "Rasakan kebersamaan dengan krama banjar dan relawan lingkungan. Wisatawan dipersilakan ikut serta dalam aksi ngayah kebersihan pantai.",
      eventsCta: "Lihat Jadwal Gotong Royong",
      feedbackTitle: "Menemukan Tempat Sampah Penuh?",
      feedbackDesc:
        "Bantu armada kebersihan banjar bertindak cepat. Kirimkan laporan titik lokasi secara aman.",
      feedbackCta: "Laporkan Masalah Kebersihan",
      footerNote:
        "Operasi Kebersihan Kawasan Kedas — Dikoordinasikan bersama Banjar Adat & Pelaku Usaha Pariwisata Bali.",
    },
  };

  const t = content[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Top Header & Bilingual Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-800 bg-brand-100 px-3 py-1 rounded-full">
          <Compass className="w-3.5 h-3.5" />
          {t.tagline}
        </div>
        <button
          onClick={() => setLang(lang === "en" ? "id" : "en")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-sand-100 text-brand-900 transition-colors"
        >
          <Globe2 className="w-3.5 h-3.5 text-brand-700" />
          <span>{t.switchLang}</span>
        </button>
      </div>

      {/* Hero Welcome */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-900 tracking-tight leading-tight">
          {t.title}
        </h1>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Cultural Etiquette Alert */}
      <div className="p-6 rounded-2xl bg-brand-50 border-2 border-brand-200 hover:border-brand-700 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer flex items-start gap-4">
        <IconContainer variant="soft" size="lg" className="shrink-0">
          <Heart className="w-5 h-5 text-brand-900" />
        </IconContainer>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-brand-900">{t.etiquetteTitle}</h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t.etiquetteDesc}
          </p>
        </div>
      </div>

      {/* 3-Stream Sorting Cards */}
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-brand-900 tracking-tight">
            {t.sortingTitle}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {t.sortingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.bins.map((bin, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border-2 ${bin.color} hover:-translate-y-1.5 hover:shadow-interactive hover:border-brand-900 transition-all duration-fast ease-soft cursor-pointer flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trash2 className={`w-5 h-5 ${bin.iconColor}`} />
                  <h3 className="font-bold text-sm sm:text-base">{bin.name}</h3>
                </div>
                <div className="text-xs space-y-1.5 opacity-90">
                  <div className="font-semibold">Contoh / Examples:</div>
                  <p className="leading-relaxed">{bin.items}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 text-[11px] opacity-80 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{bin.dest}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zero Plastic Hydration */}
      <div className="p-6 rounded-2xl bg-surface border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <IconContainer variant="info" size="lg" className="shrink-0">
            <Droplets className="w-5 h-5 text-blue-700" />
          </IconContainer>
          <div>
            <h3 className="text-base font-bold text-brand-900">{t.waterRefillTitle}</h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              {t.waterRefillDesc}
            </p>
          </div>
        </div>
        <a
          href="https://refillmybottle.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-full sm:w-auto"
        >
          <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1.5">
            Refill Stations
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>
      </div>

      {/* EcoLoop Community Events & Cleanups */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-sand-50 to-sand-100 border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-4">
        <div className="flex items-center gap-2 text-brand-900 font-bold text-lg">
          <Calendar className="w-5 h-5 text-brand-700" />
          {t.eventsTitle}
        </div>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t.eventsDesc}
        </p>
        <div>
          <Link href="/faq">
            <Button size="sm" variant="secondary">
              {t.eventsCta}
            </Button>
          </Link>
        </div>
      </div>

      {/* Public Feedback & Overflowing Bin Reporting */}
      <div className="p-6 rounded-2xl bg-surface border-2 border-border hover:border-amber-600 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-900 font-bold text-base">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            {t.feedbackTitle}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t.feedbackDesc}
          </p>
        </div>
        <Link href="/faq" className="shrink-0 w-full sm:w-auto">
          <Button size="sm" variant="outline" className="w-full">
            {t.feedbackCta}
          </Button>
        </Link>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-6 border-t border-border text-xs text-text-muted">
        <p>{t.footerNote}</p>
      </div>
    </div>
  );
}
