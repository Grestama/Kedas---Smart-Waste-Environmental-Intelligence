"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Recycle, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/panduan", label: "Panduan Pilah" },
    { href: "/area-layanan", label: "Area Layanan" },
    { href: "/faq", label: "FAQ & Bantuan" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-sm">
            <Recycle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-brand-900 block leading-tight">
              WasteLink <span className="text-emerald-700">Bali</span>
            </span>
            <span className="text-[10px] text-text-secondary font-medium tracking-wide block uppercase">
              Sirkular Banjar Desa
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-text-secondary">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-brand-900",
                pathname === item.href && "text-brand-900 font-semibold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/masuk">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/daftar">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Daftar Warga
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-secondary hover:text-brand-900 focus-visible:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 py-4 space-y-3">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-text-primary py-1.5"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link href="/masuk" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full">
                Masuk ke Akun
              </Button>
            </Link>
            <Link href="/daftar" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">
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
    <footer className="bg-[#1D3F35] text-white/80 text-sm border-t border-[#152e27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Recycle className="w-6 h-6 text-emerald-400" />
              <span className="font-bold text-white text-lg">WasteLink Bali</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Platform pengelolaan sampah komunitas berbasis banjar dan ekonomi sirkular desa di Bali. Menghubungkan warga, petugas TPS3R, dan mitra daur ulang.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] bg-white/10 px-2.5 py-1 rounded border border-white/15 text-emerald-300">
                Waktu Operasional: 07:00 - 17:00 WITA
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Layanan Warga
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app/setoran/baru" className="hover:text-white transition-colors">
                  Jemput Sampah Terpilah
                </Link>
              </li>
              <li>
                <Link href="/panduan" className="hover:text-white transition-colors">
                  Standar Pemilahan Sampah
                </Link>
              </li>
              <li>
                <Link href="/app/waste-points" className="hover:text-white transition-colors">
                  Katalog WastePoints
                </Link>
              </li>
              <li>
                <Link href="/area-layanan" className="hover:text-white transition-colors">
                  Cakupan Banjar Pilot
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Portal Khusus
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/staff" className="hover:text-white transition-colors">
                  Meja Operasional Petugas (POS Desktop)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Konsol Admin & Koordinator Banjar
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="hover:text-white transition-colors">
                  Simulator Aplikasi Mobile Warga
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Kontak & Pos Kompos
            </h4>
            <p className="text-xs text-white/70">
              Sekretariat TPS3R Banjar Pilot Sukawati<br />
              Kabupaten Gianyar, Bali 80582<br />
              Email: kontak@wastelink.bali.id
            </p>
            <p className="text-xs text-white/50 mt-4">
              &copy; {new Date().getFullYear()} WasteLink Bali. Hak cipta dilindungi undang-undang.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
