"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Globe,
  Printer,
  Sparkles,
  Leaf,
  Apple,
  Wine,
  Trash,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Droplet,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface LanguageGuide {
  name: string;
  code: string;
  greeting: string;
  title: string;
  subtitle: string;
  organicTitle: string;
  organicDesc: string;
  recycleTitle: string;
  recycleDesc: string;
  residualTitle: string;
  residualDesc: string;
  tip1: string;
  tip2: string;
}

const GUIDES: Record<string, LanguageGuide> = {
  id: {
    name: "Bahasa Indonesia",
    code: "id",
    greeting: "Om Swastyastu! Selamat Datang di Bali.",
    title: "Panduan Pemilahan Sampah Tamu",
    subtitle: "Bantu kami menjaga kesucian alam Bali dengan memilah sampah langsung dari kamar Anda.",
    organicTitle: "Tempat Sampah Hijau (Organik)",
    organicDesc: "Sisa buah, makanan, ampas kopi/teh, bunga canang kering.",
    recycleTitle: "Tempat Sampah Kuning (Daur Ulang)",
    recycleDesc: "Botol plastik bersih, kaleng minuman, kemasan karton, botol kaca.",
    residualTitle: "Tempat Sampah Abu-Abu (Residu)",
    residualDesc: "Tisu basah, pembalut, plastik berminyak, masker sekali pakai.",
    tip1: "Gunakan stasiun isi ulang air minum gratis di area lobi & restoran.",
    tip2: "Hormati tradisi Tri Hita Karana: harmoni manusia, alam, dan spiritual.",
  },
  en: {
    name: "English",
    code: "en",
    greeting: "Om Swastyastu! Welcome to Bali.",
    title: "Guest Waste Sorting Companion",
    subtitle: "Help us preserve the pristine beauty of the Island of the Gods by sorting your waste.",
    organicTitle: "Green Bin (Organic)",
    organicDesc: "Leftover fruit, food scraps, coffee grounds, dried flower offerings (Canang).",
    recycleTitle: "Yellow Bin (Recyclables)",
    recycleDesc: "Clean plastic bottles, beverage cans, cardboard packaging, glass bottles.",
    residualTitle: "Grey Bin (Residual)",
    residualDesc: "Wet wipes, tissues, contaminated packaging, single-use sanitary items.",
    tip1: "Use free water refill stations available throughout the resort.",
    tip2: "Honor Tri Hita Karana: living in harmony with nature and local communities.",
  },
  ja: {
    name: "日本語 (Japanese)",
    code: "ja",
    greeting: "オム・スワスティアストゥ！バリ島へようこそ。",
    title: "ゲスト専用 ごみ分別ガイド",
    subtitle: "バリ島の美しい自然を守るため、お部屋でのごみ分別にご協力ください。",
    organicTitle: "緑のゴミ箱 (生ごみ・有機物)",
    organicDesc: "果物の皮、食べ残し、コーヒーかす、乾燥したお供え花。",
    recycleTitle: "黄色のゴミ箱 (リサイクル資源)",
    recycleDesc: "清潔なペットボトル、アルミ缶、紙パック、ガラス瓶。",
    residualTitle: "灰色のゴミ箱 (一般ごみ・残渣)",
    residualDesc: "ウェットティッシュ、使用済みティッシュ、汚れの落ちないプラ包装。",
    tip1: "リゾート内の無料給水ステーションをご利用ください。",
    tip2: "自然と人々との調和（トリ・ヒタ・カラナ）の精神を大切にしています。",
  },
  ru: {
    name: "Русский (Russian)",
    code: "ru",
    greeting: "Ом Свастьясту! Добро пожаловать на Бали.",
    title: "Инструкция по сортировке отходов для гостей",
    subtitle: "Помогите нам сохранить природу Бали, разделяя отходы в номере.",
    organicTitle: "Зеленый контейнер (Органика)",
    organicDesc: "Остатки фруктов, еды, кофейная гуща, сухие цветы.",
    recycleTitle: "Желтый контейнер (Вторсырье)",
    recycleDesc: "Чистые пластиковые бутылки, банки, картон, стеклянные бутылки.",
    residualTitle: "Серый контейнер (Прочие отходы)",
    residualDesc: "Влажные салфетки, гигиенические средства, загрязненная упаковка.",
    tip1: "Используйте станции бесплатного наполнения питьевой воды в отеле.",
    tip2: "Уважайте философию Три Хита Карана: гармония с природой и культурой.",
  },
};

export default function HospitalityGuestCompanionPage() {
  const toast = useToast();
  const [activeLang, setActiveLang] = useState<string>("en");
  const guide = GUIDES[activeLang] || GUIDES.en;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/hospitality"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak Kartu Tamu / Villa
        </button>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <Globe className="w-4 h-4 text-brand-600" />
          <span>Pilih Bahasa Tampilan:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GUIDES).map(([key, lang]) => (
            <button
              key={key}
              onClick={() => setActiveLang(key)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                activeLang === key
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-canvas text-muted hover:text-foreground hover:bg-border/40"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Card Preview (Printable Area) */}
      <div className="bg-surface rounded-2xl border-2 border-brand-200 p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle background motif */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial from-brand-100/30 to-transparent pointer-events-none rounded-bl-full" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Green Tourism Initiative • Tri Hita Karana
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">{guide.title}</h1>
            <p className="text-xs text-muted mt-1 italic font-medium">{guide.greeting}</p>
            <p className="text-xs text-muted mt-1 max-w-lg">{guide.subtitle}</p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center bg-canvas p-3 rounded-xl border border-border shrink-0 self-center sm:self-auto">
            <div className="w-24 h-24 bg-white p-1 rounded-lg border border-border flex items-center justify-center">
              <QrCode className="w-20 h-20 text-brand-950" />
            </div>
            <span className="text-[10px] font-mono font-bold text-muted mt-1">SCAN FOR ECOGUIDE</span>
          </div>
        </div>

        {/* Sorting Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Organic Bin */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-3">
              <Apple className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-emerald-950">{guide.organicTitle}</h3>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">{guide.organicDesc}</p>
            <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Dialirkan ke Kompos & Maggot
            </div>
          </div>

          {/* Recyclables Bin */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-3">
              <Wine className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-amber-950">{guide.recycleTitle}</h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">{guide.recycleDesc}</p>
            <div className="mt-3 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Disalurkan ke Pabrik Daur Ulang
            </div>
          </div>

          {/* Residual Bin */}
          <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300">
            <div className="w-9 h-9 rounded-lg bg-zinc-700 text-white flex items-center justify-center mb-3">
              <Trash className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">{guide.residualTitle}</h3>
            <p className="text-xs text-zinc-700 mt-1 leading-relaxed">{guide.residualDesc}</p>
            <div className="mt-3 text-[11px] font-semibold text-zinc-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Residu Minimal ke TPA Resmi
            </div>
          </div>
        </div>

        {/* Tourist Eco Tips */}
        <div className="mt-6 p-4 rounded-xl bg-canvas border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Droplet className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{guide.tip1}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{guide.tip2}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
