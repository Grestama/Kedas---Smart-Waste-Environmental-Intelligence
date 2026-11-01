import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Recycle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  CheckCircle2,
  Building2,
  Users,
  Bot,
  MapPin,
  Calendar,
  Check,
  FileText,
  Clock,
  ArrowUpRight,
  HelpCircle,
  Truck,
  Coins,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";

export default function HomePage() {
  const faqItems = [
    {
      id: "faq-1",
      question: "Apa itu platform Kedas?",
      answer:
        "Kedas adalah platform operasional pengelolaan sampah kawasan dan kecerdasan sirkular terpadu di Bali. Kedas menghubungkan warga rumah tangga, petugas pengangkut TPS3R, pengelola fasilitas, dan pelaku usaha pariwisata agar setiap aliran material tercatat secara transparan dan berlandaskan bukti fisik.",
    },
    {
      id: "faq-2",
      question: "Bagaimana alur penjemputan sampah terpilah?",
      answer:
        "Warga memilah sampah menjadi 4 kategori standar (Organik, Daur Ulang, Residu, dan Khusus). Melalui web Kedas, warga memesan slot penjemputan armada banjar. Petugas datang sesuai jadwal, memeriksa tingkat kebersihan/kontaminasi, menimbang dengan timbangan digital terkalibrasi, dan menerbitkan catatan timbang sah di tempat.",
    },
    {
      id: "faq-3",
      question: "Apa itu Waste Passport dan mengapa penting?",
      answer:
        "Waste Passport adalah paspor digital rekam jejak material yang mencatat tanggal setoran, nama sumber, petugas pemeriksa, berat kotor (bruto), berat wadah (tara), berat bersih (netto), tingkat kontaminasi, dan tujuan akhir pengolahan (seperti pengomposan TPS3R atau pabrik daur ulang mitra).",
    },
    {
      id: "faq-4",
      question: "Apakah kecerdasan buatan (AI) di Kedas otomatis menentukan timbangan?",
      answer:
        "Tidak. AI di Kedas (EcoGuide, Vision, dan Copilot) berfungsi sebagai asisten pembantu informasi dan rekomendasi. Penentuan berat resmi, kualitas material, dan kelayakan setoran tetap dilakukan secara fisik oleh petugas berwenang di lapangan. Setiap tindakan sistem berisiko selalu memerlukan persetujuan manusia.",
    },
    {
      id: "faq-5",
      question: "Apakah fasilitas hotel, villa, atau restoran dapat bergabung?",
      answer:
        "Ya. Kedas menyediakan modul Green Hospitality untuk pelaku usaha pariwisata guna mencatat sampah komersial harian, mengelola pengolahan sisa makanan mandiri, dan mendapatkan ringkasan Green Hospitality Ledger yang terverifikasi.",
    },
  ];

  return (
    <div className="font-sans">
      {/* 1. FULL-BLEED PHOTOGRAPHIC HERO (Inspired by Wastex & GreenHaul) */}
      <section className="relative min-h-[500px] lg:min-h-[560px] flex items-center overflow-hidden border-b border-[#1D3F35]">
        {/* Background Scenery Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-cleanup.jpg"
            alt="Pemandangan gotong royong aksi bersih sampah kawasan Bali"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center lg:object-[center_35%]"
          />
          {/* Atmospheric Evergreen Gradient Scrim (WCAG AAA Contrast on Left) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#122620]/95 via-[#122620]/85 to-[#122620]/40 sm:to-[#122620]/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#122620] via-transparent to-[#122620]/40 pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl space-y-6 text-white">
            {/* Bold White Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-sm">
              Sampah kawasan lebih terkelola, dari sumber hingga tujuan.
            </h1>

            {/* Editorial Description */}
            <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-2xl drop-shadow-sm">
              Kedas menghubungkan warga, komunitas desa adat, fasilitas TPS3R, dan usaha pariwisata. Informasi pemilahan, jadwal penjemputan berkala, dan bukti perjalanan material tersaji dalam satu alur yang dapat ditelusuri.
            </p>

            {/* CTAs (Green accent CTA + Translucent secondary button) */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a href="#layanan-terpadu">
                <Button
                  size="lg"
                  variant="primary"
                  className="bg-emerald-500 hover:bg-emerald-400 text-[#122620] font-bold shadow-lg shadow-emerald-950/30 min-h-[46px]"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Jelajahi Cara Kerja
                </Button>
              </a>
              <Link href="/masuk">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/25 backdrop-blur-md min-h-[46px]"
                >
                  Masuk ke Ruang Kerja
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS BAR (Directly inspired by GreenHaul & Wastex) */}
      <section className="bg-[#16352D] text-white py-6 border-b border-[#1D3F35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5 p-4 rounded-xl border-2 border-emerald-400/25 bg-white/[0.04] hover:bg-white/[0.08] hover:border-emerald-400 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center text-emerald-300 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Penjemputan Terjadwal</h4>
                <p className="text-xs text-white/70 mt-0.5">Armada trike banjar tepat waktu sesuai slot.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl border-2 border-emerald-400/25 bg-white/[0.04] hover:bg-white/[0.08] hover:border-emerald-400 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center text-emerald-300 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Timbang Netto Digital</h4>
                <p className="text-xs text-white/70 mt-0.5">Sertifikasi tara-bruto di tempat tanpa tebakan.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl border-2 border-emerald-400/25 bg-white/[0.04] hover:bg-white/[0.08] hover:border-emerald-400 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center text-emerald-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Waste Passport Sah</h4>
                <p className="text-xs text-white/70 mt-0.5">Rekam jejak alur material transparan & QR audit.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl border-2 border-emerald-400/25 bg-white/[0.04] hover:bg-white/[0.08] hover:border-emerald-400 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center text-emerald-300 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ekonomi Sirkular</h4>
                <p className="text-xs text-white/70 mt-0.5">WastePoints insentif warga tukar sembako.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR SERVICE / ENTRY TILES (design_web.md Section 3.3) */}
      <section id="layanan-terpadu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Layanan Terintegrasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#122620] mt-3 tracking-tight">
            Pintu Masuk Pengelolaan Sampah Kawasan
          </h2>
          <p className="text-sm text-[#53645E] mt-1.5 max-w-2xl">
            Empat akses utama yang menghubungkan kebutuhan warga, pelaku usaha, dan pengelola kawasan dalam satu sistem terpadu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tile 1: Panduan Pilah */}
          <Link
            href="/panduan"
            className="group p-6 rounded-2xl bg-white border-2 border-border shadow-sm hover:shadow-interactive-hover hover:-translate-y-1.5 hover:border-brand-800 active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0E9] text-brand-900 flex items-center justify-center font-bold group-hover:bg-brand-900 group-hover:text-white transition-colors">
                <Recycle className="w-6 h-6 text-emerald-700 group-hover:text-emerald-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Kategori Standar
                </span>
                <h3 className="text-lg font-bold text-[#122620] group-hover:text-brand-900 transition-colors">
                  Pilah dengan Panduan Tepat
                </h3>
                <p className="text-xs text-[#53645E] mt-2 leading-relaxed">
                  Pahami 4 kategori pemilahan standar Bali: Organik, Anorganik Daur Ulang, Residu, dan Limbah Khusus/B3.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-border flex items-center text-xs font-semibold text-brand-900 group-hover:translate-x-1.5 transition-transform duration-fast ease-soft">
              <span>Buka Panduan Pilah</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Tile 2: Jadwal Penjemputan */}
          <Link
            href="/app/setoran/baru"
            className="group p-6 rounded-2xl bg-white border-2 border-border shadow-sm hover:shadow-interactive-hover hover:-translate-y-1.5 hover:border-brand-800 active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0E9] text-brand-900 flex items-center justify-center font-bold group-hover:bg-brand-900 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6 text-emerald-700 group-hover:text-emerald-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Layanan Warga
                </span>
                <h3 className="text-lg font-bold text-[#122620] group-hover:text-brand-900 transition-colors">
                  Ajukan & Pantau Penjemputan
                </h3>
                <p className="text-xs text-[#53645E] mt-2 leading-relaxed">
                  Jadwalkan pengumpulan sampah terpilah sesuai kuota harian armada banjar tanpa risiko penumpukan liar.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-border flex items-center text-xs font-semibold text-brand-900 group-hover:translate-x-1.5 transition-transform duration-fast ease-soft">
              <span>Buat Permintaan</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Tile 3: Waste Passport */}
          <Link
            href="/app/setoran"
            className="group p-6 rounded-2xl bg-white border-2 border-border shadow-sm hover:shadow-interactive-hover hover:-translate-y-1.5 hover:border-brand-800 active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0E9] text-brand-900 flex items-center justify-center font-bold group-hover:bg-brand-900 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6 text-emerald-700 group-hover:text-emerald-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Rekam Jejak Bukti
                </span>
                <h3 className="text-lg font-bold text-[#122620] group-hover:text-brand-900 transition-colors">
                  Telusuri Waste Passport
                </h3>
                <p className="text-xs text-[#53645E] mt-2 leading-relaxed">
                  Lihat bukti timbangan digital, tara/netto, tingkat kontaminasi, dan transparansi distribusi WastePoints.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-border flex items-center text-xs font-semibold text-brand-900 group-hover:translate-x-1.5 transition-transform duration-fast ease-soft">
              <span>Periksa Riwayat Setoran</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Tile 4: Area Layanan Pilot */}
          <Link
            href="/area-layanan"
            className="group p-6 rounded-2xl bg-white border-2 border-border shadow-sm hover:shadow-interactive-hover hover:-translate-y-1.5 hover:border-brand-800 active:scale-[0.99] transition-all duration-fast ease-soft flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0E9] text-brand-900 flex items-center justify-center font-bold group-hover:bg-brand-900 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6 text-emerald-700 group-hover:text-emerald-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Cakupan Wilayah
                </span>
                <h3 className="text-lg font-bold text-[#122620] group-hover:text-brand-900 transition-colors">
                  Kenali Area & Fasilitas
                </h3>
                <p className="text-xs text-[#53645E] mt-2 leading-relaxed">
                  Tinjau status operasional banjar pilot (Ubud, Sukawati, Sanur), jadwal armada, dan kontak koordinator TPS3R.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-border flex items-center text-xs font-semibold text-brand-900 group-hover:translate-x-1.5 transition-transform duration-fast ease-soft">
              <span>Cek Jadwal & Wilayah</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. ABOUT & COMMITMENT MOSAIC (Inspired by Wastex Image 2 & GreenHaul Image 3) */}
      <section className="bg-white py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Offset Asymmetrical Grid of Role Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#F6F6F1] border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#122620] text-sm">Warga Rumah Tangga</h4>
                <p className="text-xs text-[#53645E]">Memilah mandiri dari sumber dapur dan pekarangan desa.</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#E8F0E9] border-2 border-[#D7E4D9] hover:border-brand-800 hover:translate-y-2 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2 translate-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-brand-900 text-sm">Petugas POS</h4>
                <p className="text-xs text-brand-700">Timbang digital tara-netto dan catat foto bukti.</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#E8F0E9] border-2 border-[#D7E4D9] hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-brand-900 text-sm">Fasilitas TPS3R</h4>
                <p className="text-xs text-brand-700">Pengomposan organik dan pencacahan daur ulang.</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#F6F6F1] border-2 border-border hover:border-brand-800 hover:translate-y-2 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2 translate-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#122620] text-sm">Pelaku Wisata HOREKA</h4>
                <p className="text-xs text-[#53645E]">Pencatatan limbah hotel/villa berbasis transparansi.</p>
              </div>
            </div>

            {/* Right: Editorial Story */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Tentang Ekosistem Kedas
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#122620] tracking-tight leading-tight">
                Mengubah Pengelolaan Sampah Kawasan Menjadi Masa Depan Bali yang Bersih & Berkelanjutan
              </h2>
              <p className="text-base text-[#53645E] leading-relaxed">
                Pengelolaan sampah bukan sekadar memindahkan sisa material ke tempat lain. Setiap tahapan memiliki pelaku, tanggung jawab, dan rekam jejak yang jelas: dari pemilahan awal di rumah, penjemputan berkala oleh petugas TPS3R, penimbangan digital, hingga penyaluran ke industri daur ulang berizin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-[#122620]">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Tidak ada data timbangan yang dimanipulasi tanpa jejak audit</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#122620]">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Kapasitas harian TPS3R terlindungi dari penumpukan liar</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#122620]">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Warga menerima apresiasi WastePoints secara terukur</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#122620]">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Pelaku pariwisata mendapatkan Green Hospitality Ledger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMPACT NUMBERS / STATS STRIP (Directly inspired by GreenHaul Image 3) */}
      <section className="bg-canvas py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-white border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1D3F35]">100%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-1">
                Tercatat Digital
              </div>
              <p className="text-[11px] text-[#53645E] mt-1">
                Setiap serah-terima sampah tercatat sah tanpa manipulasi data.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1D3F35]">4 Kategori</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-1">
                Standar Desa
              </div>
              <p className="text-[11px] text-[#53645E] mt-1">
                Organik, Daur Ulang, Residu, & B3 sesuai Pergub Bali 47/2019.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1D3F35]">0 Ton</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-1">
                Toleransi Emisi Liar
              </div>
              <p className="text-[11px] text-[#53645E] mt-1">
                Mencegah pembakaran terbuka & pembuangan liar ke jurang/sungai.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-border shadow-xs hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1D3F35]">WITA</div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-1">
                Audit Waktu Nyata
              </div>
              <p className="text-[11px] text-[#53645E] mt-1">
                Sinkronisasi jam operasional stasiun timbang dan log penjemputan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DARK EVERGREEN AI CAPABILITIES SECTION (design_web.md Section 3.5 & Wastex bottom) */}
      <section className="bg-[#122620] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/10">
              <Bot className="w-3.5 h-3.5" />
              <span>Kecerdasan Artifisial Transparan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI untuk Keputusan Nyata, Bukan Sekadar Estetika
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Tiga kapabilitas AI Kedas dirancang membantu warga dan koordinator wilayah memahami aturan, mengenali material, dan memitigasi anomali dengan rujukan bukti dan persetujuan manusia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI 1: EcoGuide */}
            <div className="p-6 rounded-2xl bg-[#16352D] border-2 border-white/15 hover:border-emerald-400 hover:-translate-y-1.5 hover:shadow-interactive transition-all duration-fast ease-soft flex flex-col justify-between space-y-6 cursor-pointer">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">EcoGuide (Grounded RAG)</h3>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">
                    Tanya jawab regulasi dan SOP pemilahan material upakara, canang, atau kemasan komersial berbasis Pergub Bali No. 47/2019 dan SOP TPS3R.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5 text-xs">
                  <div className="text-[11px] text-emerald-400 font-mono">Input & Output:</div>
                  <div className="text-white/80">Pertanyaan warga &rarr; Panduan praktis dengan nomor pasal rujukan.</div>
                  <div className="text-[11px] text-white/50 pt-1">Kendali: Sitasi transparan tanpa halusinasi data.</div>
                </div>
              </div>
              <Link href="/tanya" className="w-full block">
                <Button variant="secondary" size="sm" className="w-full text-xs font-bold" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Tanya Asisten EcoGuide
                </Button>
              </Link>
            </div>

            {/* AI 2: Vision Classification */}
            <div className="p-6 rounded-2xl bg-[#16352D] border-2 border-white/15 hover:border-emerald-400 hover:-translate-y-1.5 hover:shadow-interactive transition-all duration-fast ease-soft flex flex-col justify-between space-y-6 cursor-pointer">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Vision (Klasifikasi Sampah)</h3>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">
                    Analisis foto material dari kamera ponsel untuk mendeteksi kategori sampah dan instruksi pembersihan sebelum diserahkan ke pos penjemputan.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5 text-xs">
                  <div className="text-[11px] text-emerald-400 font-mono">Input & Output:</div>
                  <div className="text-white/80">Foto material &rarr; Prediksi kategori & ambang kontaminasi.</div>
                  <div className="text-[11px] text-white/50 pt-1">Kendali: Wajib dikonfirmasi oleh warga sebelum kirim.</div>
                </div>
              </div>
              <Link href="/app/setoran/baru">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Coba Klasifikasi Foto
                </Button>
              </Link>
            </div>

            {/* AI 3: Operations Copilot */}
            <div className="p-6 rounded-2xl bg-[#16352D] border-2 border-white/15 hover:border-emerald-400 hover:-translate-y-1.5 hover:shadow-interactive transition-all duration-fast ease-soft flex flex-col justify-between space-y-6 cursor-pointer">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Operations Copilot</h3>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">
                    Deteksi anomali volume sampah di banjar, peringatan overload kapasitas TPS3R, dan rekomendasi realokasi rute armada secara transparan.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5 text-xs">
                  <div className="text-[11px] text-emerald-400 font-mono">Input & Output:</div>
                  <div className="text-white/80">Data agregat harian &rarr; Proposal tindakan administratif terstruktur.</div>
                  <div className="text-[11px] text-white/50 pt-1">Kendali: Persetujuan manual koordinator TPS3R wajib.</div>
                </div>
              </div>
              <Link href="/admin">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Tinjau Konsol Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OPERATIONAL TIMELINE (5 Tahap Pengelolaan) */}
      <section id="alur-kerja" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Alur Terverifikasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#122620] mt-3 tracking-tight">
            Lima Tahap dari Pemilahan hingga Daur Ulang Sah
          </h2>
          <p className="text-sm text-[#53645E] mt-1.5">
            Setiap gram sampah memiliki alur perjalanan yang jelas, dapat diaudit, dan tidak berakhir di tempat pembuangan liar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-white border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2">
            <span className="text-xs font-bold text-emerald-700">Tahap 01</span>
            <h4 className="font-bold text-sm text-[#122620]">Pilah di Sumber</h4>
            <p className="text-xs text-[#53645E]">Warga memisahkan organik, daur ulang, residu, dan B3.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2">
            <span className="text-xs font-bold text-emerald-700">Tahap 02</span>
            <h4 className="font-bold text-sm text-[#122620]">Jadwal Penjemputan</h4>
            <p className="text-xs text-[#53645E]">Warga memesan slot sesuai kuota harian armada banjar.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2">
            <span className="text-xs font-bold text-emerald-700">Tahap 03</span>
            <h4 className="font-bold text-sm text-[#122620]">Timbang & QC Fisik</h4>
            <p className="text-xs text-[#53645E]">Petugas menimbang tara-netto dan mencatat foto bukti.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2">
            <span className="text-xs font-bold text-emerald-700">Tahap 04</span>
            <h4 className="font-bold text-sm text-[#122620]">Waste Passport</h4>
            <p className="text-xs text-[#53645E]">Sertifikat alur material dan WastePoints diterbitkan.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#E8F0E9] border-2 border-[#D7E4D9] hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer space-y-2">
            <span className="text-xs font-bold text-emerald-800">Tahap 05</span>
            <h4 className="font-bold text-sm text-brand-900">Daur Ulang di TPS3R</h4>
            <p className="text-xs text-brand-700">Pengomposan lokal atau kirim ke pabrik daur ulang resmi.</p>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION (WAI-ARIA Accessible) */}
      <section className="bg-white py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Pertanyaan Umum
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#122620] tracking-tight">
              Hal yang Sering Ditanyakan seputar Kedas
            </h2>
            <p className="text-xs sm:text-sm text-[#53645E]">
              Penjelasan ringkas mengenai operasional, integritas timbangan, dan keterlibatan komunitas.
            </p>
          </div>

          <Accordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}
