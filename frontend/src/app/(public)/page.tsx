import React from "react";
import Link from "next/link";
import {
  Recycle,
  Truck,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { mockCategories } from "@/mocks/previewData";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pilot Project Banjar Sukawati &bull; Bali</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-900 leading-[1.15]">
            Pengelolaan Sampah Terpilah Berbasis Banjar & Ekonomi Sirkular.
          </h1>

          <p className="text-lg text-text-secondary leading-relaxed">
            WasteLink Bali menghubungkan warga desa, pos timbang TPS3R, dan mitra daur ulang berlisensi. Pilah sampah dari rumah, jadwalkan penjemputan petugas, dan kumpulkan WastePoints untuk ekonomi sirkular desa.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/daftar">
              <Button
                size="lg"
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Mulai Setor Sampah
              </Button>
            </Link>
            <Link href="/panduan">
              <Button size="lg" variant="secondary">
                Lihat Panduan Pilah
              </Button>
            </Link>
            <Link href="/mobile">
              <Button size="lg" variant="soft">
                Coba Simulator Mobile Warga
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Operational Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <StatCard
            label="Total Sampah Terkelola"
            value="1.420 kg"
            hint="Bulan berjalan (Oktober 2026)"
            icon={<Scale className="w-5 h-5 text-emerald-800" />}
          />
          <StatCard
            label="Tereduksi dari TPA"
            value="78,4%"
            hint="Target Banjar Pilot > 70%"
            highlight
            icon={<Recycle className="w-5 h-5 text-white" />}
          />
          <StatCard
            label="WastePoints Terdistribusi"
            value="42.850"
            hint="Dapat ditukar bibit & pupuk kompos"
            icon={<Coins className="w-5 h-5 text-amber-700" />}
          />
          <StatCard
            label="Petugas TPS3R Bertugas"
            value="6 Kolektor"
            hint="Wilayah Banjar Kaja & Tengah"
            icon={<Truck className="w-5 h-5 text-brand-700" />}
          />
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="bg-surface py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Alur Operasional Sederhana
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-900 mt-2">
              Bagaimana WasteLink Bekerja di Banjar Anda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-canvas border border-border space-y-4">
              <div className="w-10 h-10 rounded-lg bg-brand-900 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-brand-900">
                Pilah di Rumah & Jadwalkan
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Pilah sampah sesuai kategori resmi: Organik, Plastik PET, Kardus/Kertas, atau Kaca. Tentukan jadwal penjemputan atau antar langsung ke pos TPS3R banjar.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-canvas border border-border space-y-4">
              <div className="w-10 h-10 rounded-lg bg-brand-900 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-brand-900">
                Timbang Transparan oleh Petugas
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Petugas TPS3R menimbang dengan timbangan digital terkalibrasi, memeriksa tingkat kontaminasi, dan mencatat langsung ke sistem POS lapangan.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-canvas border border-border space-y-4">
              <div className="w-10 h-10 rounded-lg bg-brand-900 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-brand-900">
                Dapatkan WastePoints & Pantau Dampak
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Poin otomatis masuk ke akun warga secara transparan sesuai ledger poin. Sampah disalurkan ke fasilitas kompos banjar dan mitra daur ulang terverifikasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Sampah Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Kategori Terpilah
            </span>
            <h2 className="text-2xl font-bold text-brand-900 mt-1">
              Standar Penerimaan Sampah Banjar
            </h2>
          </div>
          <Link href="/panduan">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Panduan Lengkap Kebersihan
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-900 font-semibold">
                  {cat.code}
                </span>
                <h3 className="text-base font-bold text-brand-900 mt-2.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Reward Poin</span>
                <span className="font-bold text-[#276749]">
                  +{cat.pointRate} poin/kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Governance & Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-[#1D3F35] text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparansi & Akuntabilitas Banjar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Semua Setoran Dicatat dalam Buku Besar Terbuka
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              WasteLink menerapkan state machine ketat dan audit trail menyeluruh. Tidak ada perubahan berat timbangan atau poin fiktif yang dapat dimanipulasi tanpa verifikasi ganda koordinator banjar.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link href="/daftar">
              <Button
                variant="soft"
                size="lg"
                className="bg-white text-brand-900 hover:bg-emerald-50"
              >
                Daftar Sebagai Warga
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
