"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Recycle, ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/panduan", label: "Panduan Pilah" },
    { href: "/area-layanan", label: "Area Layanan" },
    { href: "/guest", label: "Guest Companion" },
    { href: "/faq", label: "FAQ & Bantuan" },
  ];

  return (
    <header className="sticky top-[var(--workspace-bar-height)] z-40 bg-white/95 backdrop-blur border-b border-border shadow-nav font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-sm group-hover:bg-[#152e27] transition-colors">
            <Recycle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-brand-900 block leading-tight font-sans">
              Kedas
            </span>
            <span className="text-[10px] text-text-secondary font-semibold tracking-wider block uppercase">
              Lingkungan Bersih & Sirkular
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Navigasi Utama Publik" className="hidden lg:flex items-center space-x-8 text-sm font-medium text-text-secondary">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors py-2 border-b-2",
                  isActive
                    ? "border-brand-900 text-brand-900 font-bold"
                    : "border-transparent hover:text-brand-900 hover:border-brand-700/40"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/masuk">
            <Button variant="ghost" size="md">
              Masuk
            </Button>
          </Link>
          <Link href="/daftar">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Daftar Warga
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-secondary hover:text-brand-900 rounded-lg hover:bg-black/5 active:scale-95 transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0]"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-white px-4 py-5 space-y-4 shadow-card animate-slide-up">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-brand-100 text-brand-900 font-bold"
                    : "text-text-primary hover:bg-black/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-border flex flex-col gap-2.5">
            <Link href="/masuk" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full justify-center">
                Masuk ke Akun
              </Button>
            </Link>
            <Link href="/daftar" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center">
                Daftar Sebagai Warga
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#122620] text-white/80 text-sm border-t border-[#1D3F35] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700/50 flex items-center justify-center text-white border border-emerald-500/30">
                <Recycle className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">Kedas</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Platform operasional persampahan kawasan dan kecerdasan sirkular terpadu di Bali. Menghubungkan sumber sampah, petugas lapangan, fasilitas TPS3R, dan mitra daur ulang berizin.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-white/10 px-2.5 py-1 rounded border border-white/15 text-emerald-300 font-mono">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Operasional 07:00 - 17:00 WITA
              </span>
            </div>
          </div>

          {/* Column 2: Public Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Layanan Kawasan
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/tanya" className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Kedas EcoGuide AI (Tanya Regulasi)
                </Link>
              </li>
              <li>
                <Link href="/panduan" className="hover:text-white transition-colors">
                  Panduan Pilah 4 Kategori Standar
                </Link>
              </li>
              <li>
                <Link href="/area-layanan" className="hover:text-white transition-colors">
                  Cakupan Wilayah & Jadwal Penjemputan
                </Link>
              </li>
              <li>
                <Link href="/guest" className="hover:text-white transition-colors">
                  Guest Green Companion (Wisatawan)
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ & Pertanyaan Umum
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Workspaces */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Ruang Kerja Operasional
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Portal Warga (Setoran & Waste Passport)
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-white transition-colors">
                  Meja Petugas POS & Timbang Lapangan
                </Link>
              </li>
              <li>
                <Link href="/hospitality" className="hover:text-white transition-colors">
                  Green Hospitality (Hotel & Restoran)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Konsol Admin & Koordinator Wilayah
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Local Provenance & Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Dasar Regulasi & Wilayah
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Berlandaskan Peraturan Gubernur Bali No. 47 Tahun 2019 tentang Pengelolaan Sampah Berbasis Sumber di Desa Adat dan Kawasan Pariwisata.
            </p>
            <p className="text-xs text-white/50 mt-6 pt-4 border-t border-white/10 font-mono">
              &copy; {new Date().getFullYear()} Kedas. Data tercatat dan terverifikasi.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
