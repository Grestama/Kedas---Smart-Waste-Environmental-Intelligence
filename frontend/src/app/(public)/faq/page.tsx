import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function FAQPage() {
  const faqs = [
    {
      q: "Apa itu WastePoints dan bagaimana cara mendapatkannya?",
      a: "WastePoints adalah reward apresiasi untuk warga yang memilah sampah dengan bersih. Setiap kilogram sampah yang disetor dan diverifikasi oleh petugas akan menghasilkan poin sesuai jenis material (misal: Organik 10 poin/kg, Plastik PET 30 poin/kg).",
    },
    {
      q: "Apakah layanan penjemputan dipungut biaya?",
      a: "Tidak. Selama fase banjar pilot, penjemputan sampah terpilah didanai oleh program sirkular desa dan gratis bagi seluruh krama banjar yang mematuhi jadwal.",
    },
    {
      q: "Apa yang terjadi jika sampah saya tercampur kotoran/minyak?",
      a: "Petugas pos timbang akan mencatat status kontaminasi. Jika kontaminasi ringan, sistem dapat menerapkan penyesuaian bobot bersih. Jika kontaminasi berat (misal tercampur bangkai, pecahan kaca tanpa wadah, atau minyak kotor), setoran dapat ditolak demi keselamatan petugas.",
    },
    {
      q: "Kapan WastePoints bisa ditukarkan?",
      a: "Poin langsung tercatat di buku besar digital akun Anda. Katalog penukaran voucher sembako desa, pupuk organik banjar, dan bibit tanaman akan dibuka secara berkala oleh pengurus banjar.",
    },
    {
      q: "Bagaimana jika jadwal penjemputan bertepatan dengan hari raya di Bali?",
      a: "Pada hari Purnama, Tilem, atau Galungan/Kuningan, jadwal penjemputan dialihkan ke hari berikutnya dan diberitahukan lewat pengumuman banjar dan tab Notifikasi aplikasi.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Pertanyaan Umum</span>
        </div>
        <h1 className="text-3xl font-bold text-brand-900 tracking-tight">
          FAQ Seputar Operasional WasteLink
        </h1>
        <p className="mt-2 text-text-secondary leading-relaxed">
          Pertanyaan yang sering diajukan warga mengenai tata cara pemilahan, penjemputan petugas, dan sistem poin.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-surface border border-border shadow-sm space-y-2"
          >
            <h2 className="text-base font-bold text-brand-900">{faq.q}</h2>
            <p className="text-xs text-text-secondary leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-canvas border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-brand-900">
            Punya pertanyaan lain seputar banjar Anda?
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Hubungi sekretariat operasional banjar atau prajuru desa.
          </p>
        </div>
        <Link href="/app/bantuan">
          <Button size="sm" variant="secondary" leftIcon={<Phone className="w-3.5 h-3.5" />}>
            Kontak Pos Banjar
          </Button>
        </Link>
      </div>
    </div>
  );
}
