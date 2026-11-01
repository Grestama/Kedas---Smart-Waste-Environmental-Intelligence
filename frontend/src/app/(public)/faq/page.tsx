import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";

export default function FAQPage() {
  const faqs = [
    {
      id: "faq-detail-1",
      question: "Apa itu WastePoints dan bagaimana cara mendapatkannya?",
      answer:
        "WastePoints adalah reward apresiasi untuk warga yang memilah sampah dengan bersih. Setiap kilogram sampah yang disetor dan diverifikasi oleh petugas akan menghasilkan poin sesuai jenis material (misal: Organik 10 poin/kg, Plastik PET 30 poin/kg).",
    },
    {
      id: "faq-detail-2",
      question: "Apakah layanan penjemputan dipungut biaya?",
      answer:
        "Tidak. Selama fase pilot banjar, penjemputan sampah terpilah didanai oleh program sirkular desa dan bebas biaya bagi seluruh krama banjar yang mematuhi jadwal pemilahan.",
    },
    {
      id: "faq-detail-3",
      question: "Apa yang terjadi jika sampah saya tercampur kotoran/minyak?",
      answer:
        "Petugas pos timbang akan mencatat status kontaminasi. Jika kontaminasi ringan, sistem menerapkan penyesuaian bobot bersih. Jika kontaminasi berat (misal tercampur bangkai, pecahan kaca tanpa wadah aman, atau minyak kotor berlebih), setoran dapat ditolak demi keselamatan petugas dan kualitas kompos.",
    },
    {
      id: "faq-detail-4",
      question: "Kapan WastePoints bisa ditukarkan?",
      answer:
        "Poin langsung tercatat di buku besar digital akun Anda. Katalog penukaran voucher sembako desa, pupuk organik banjar, dan bibit tanaman dibuka secara berkala oleh pengurus banjar dan pengelola TPS3R.",
    },
    {
      id: "faq-detail-5",
      question: "Bagaimana jika jadwal penjemputan bertepatan dengan hari raya di Bali?",
      answer:
        "Pada hari Purnama, Tilem, atau Galungan/Kuningan, jadwal penjemputan dialihkan ke hari kerja berikutnya dan diberitahukan lewat pengumuman banjar serta tab Notifikasi aplikasi.",
    },
    {
      id: "faq-detail-6",
      question: "Bagaimana perlindungan data pribadi rumah tangga saya?",
      answer:
        "Kedas mematuhi prinsip privasi data. Riwayat timbangan individu hanya dapat diakses oleh pemilik akun dan petugas penimbang berwenang. Data yang ditampilkan ke publik dan agregasi wilayah hanya berupa angka rekapitulasi komunitas tanpa identitas rumah tangga.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Bantuan & FAQ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#122620] tracking-tight">
          FAQ Seputar Operasional Kedas
        </h1>
        <p className="text-base text-[#53645E] leading-relaxed">
          Pertanyaan yang sering diajukan warga mengenai tata cara pemilahan, penjemputan petugas, verifikasi Waste Passport, dan sistem poin sirkular.
        </p>
      </div>

      <Accordion items={faqs} defaultOpenId="faq-detail-1" />

      <div className="p-8 rounded-2xl bg-[#E8F0E9] border-2 border-[#D7E4D9] hover:border-brand-800 hover:-translate-y-0.5 hover:shadow-interactive transition-all duration-fast flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-brand-900">
            Punya pertanyaan lain seputar banjar Anda?
          </h2>
          <p className="text-xs text-brand-700 leading-relaxed max-w-lg">
            Gunakan asisten tanya jawab EcoGuide untuk konsultasi cepat mengenai jenis sampah canang, sisa upakara, atau jadwal TPS3R.
          </p>
        </div>
        <div className="shrink-0 flex gap-3">
          <Link href="/tanya">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Tanya EcoGuide
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
