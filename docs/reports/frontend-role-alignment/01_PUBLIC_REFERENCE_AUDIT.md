# AUDIT REFERENSI VISUAL PUBLIC MAIN WEBSITE KEDAS
**Dokumen:** `01_PUBLIC_REFERENCE_AUDIT.md`  
**Status:** Disetujui sebagai Sumber Kebenaran Desain (Design Source of Truth)  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Rute dan Struktur Halaman Publik Aktual

Berdasarkan penelusuran struktur rute Next.js 15 App Router di `frontend/src/app/(public)/`, ditemukan rute publik aktif sebagai berikut:

| Rute URL | Berkas Sumber | Peran & Deskripsi Halaman |
|---|---|---|
| `/` | `src/app/(public)/page.tsx` | **Landing Page Utama (Source of Truth Visual)**: Menampilkan hero photographic full-bleed, bar proposisi nilai, 4 tile layanan terintegrasi, komitmen & editorial mozaik peran, metrik dampak angka, showcase kapabilitas AI transparan, alur operasional 5 tahap, dan FAQ interaktif. |
| `/panduan` | `src/app/(public)/panduan/page.tsx` | **Panduan Pemilahan Sampah Terstandar**: Menjelaskan 4 kategori pemilahan resmi Pergub Bali 47/2019 (Organik, Anorganik Daur Ulang, Residu, B3), kondisi yang diterima vs ditolak, nilai WastePoints per kg, dan ambang batas kontaminasi. |
| `/area-layanan` | `src/app/(public)/area-layanan/page.tsx` | **Cakupan Wilayah & Direktori Fasilitas**: Menampilkan informasi banjar pilot (Ubud, Sanur, Sukawati), jadwal operasional TPS3R, kapasitas harian, dan kontak darurat koordinator kawasan. |
| `/guest` | `src/app/(public)/guest/page.tsx` | **Guest Green Companion**: Pengalaman pemandu kebersihan destinasi bagi wisatawan tanpa perlu login (bilingual ID/EN), panduan 3 tempat sampah kawasan, peta air isi ulang non-plastik, dan pelaporan anomali kebersihan. |
| `/faq` | `src/app/(public)/faq/page.tsx` | **Pusat Bantuan & Pertanyaan Umum**: Dokumentasi komprehensif operasional, validasi timbangan digital, Waste Passport, dan ekonomi sirkular. |
| `/tanya` | `src/app/(public)/tanya/page.tsx` | **Asisten EcoGuide Berbasis Regulasi**: Antarmuka interaktif konsultasi regulasi persampahan berbasis RAG dengan sitasi transparan Pergub Bali No. 47/2019. |
| `/masuk` | `src/app/(public)/masuk/page.tsx` | **Gerbang Masuk Akun**: Form autentikasi multi-peran dengan validasi Zod dan integrasi auth context. |
| `/daftar` | `src/app/(public)/daftar/page.tsx` | **Pendaftaran Warga Baru**: Form registrasi terstruktur berbasis nomor banjar dan desa adat. |
| `/lupa-password` | `src/app/(public)/lupa-password/page.tsx` | **Pemulihan Sandi Pengguna**: Alur mandiri verifikasi identitas akun warga. |

---

## 2. Layout, Navigasi, dan Komposisi Ruang

### 2.1 Shell Header & Footer Publik
- **Workspace Switch Bar (`WorkspaceSwitchBar.tsx`):**
  - Utility strip berposisi `sticky top-0 z-50` setinggi 32px (`var(--workspace-bar-height)`).
  - Background: Deep Forest `#122620` dengan garis pembatas bawah `#1D3F35`.
  - Mengakomodasi tombol pintas ke seluruh ruang kerja (Publik, Warga Web, Petugas, Admin, Hospitality, Tamu).
- **Public Header (`PublicHeader.tsx`):**
  - Posisi: `sticky top-[var(--workspace-bar-height)] z-40`.
  - Surface: `bg-white/95 backdrop-blur`, border bawah `#DDE3DD` (`border-border`), bayangan `shadow-nav`.
  - Brand Mark: Kotak sudut melengkung `w-10 h-10 rounded-xl bg-brand-900` (`#1D3F35`) dengan ikon `Recycle` berwarna `text-emerald-400`. Tipografi judul `Kedas` berbobot `font-extrabold text-brand-900 tracking-tight` disertai tagline penjelas `"Lingkungan Bersih & Sirkular"`.
  - Navigasi Desktop: Menu teks terarah dengan indikator aktif berupa garis bawah tebal `border-b-2 border-brand-900 font-bold`.
  - Aksi Header: Tombol sekunder `Masuk` (ghost) dan tombol primer `Daftar Warga` (`Button variant="primary"` berikon panah `ArrowRight`).
  - Responsif Mobile: Tombol burger `Menu`/`X` aksesibel (`aria-expanded`, target sentuh `p-2 rounded-lg`) yang membuka drawer menu bersudut rapi.
- **Public Footer (`PublicFooter`):**
  - Background: Deepest Forest `#122620`, teks `text-white/80`, border atas `#1D3F35`.
  - Struktur: 4 kolom responsif (Identitas & Visi, Layanan & Rute Cepat, Regulasi & Panduan, Kontak Operasional Kawasan Bali).
  - Badge Khusus: Indikator operasional berformat pill monospaced `bg-white/10 text-emerald-300 border border-white/15` disertai ikon `Sparkles`.

---

## 3. Ekstraksi Design Tokens Aktual (Source of Truth)

Nilai-nilai ini diambil langsung dari kode aktual `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`, `frontend/src/tokens/index.ts`, dan `frontend/src/tokens/icons.ts`:

### 3.1 Palet Warna & Semantic Ratio (60–30–10 Disciplined Ratio)
1. **Brand Forest (30% - Identitas & Tipografi Penegasan):**
   - `kedas-forest-950`: `#122620` — Utility bar, footer, logo mark, heading tingkat tertinggi.
   - `kedas-forest-900`: `#16352D` — Permukaan kartu dark, header modal/drawer operasional.
   - `kedas-forest-800` (`brand-900`): `#1D3F35` — Tombol CTA primer, judul section, border hover.
   - `kedas-forest-700`: `#285747` — Hover state tombol primer, active link, nav selected.
2. **Restrained Accent Leaf / Emerald (10% - Fokus Perhatian & Aksi):**
   - `kedas-leaf-600`: `#219B72` / `text-emerald-700` — Icon pill, verifikasi sah, link aksi.
   - `kedas-leaf-500`: `#2DBA87` / `text-emerald-400` — Aksen interaktif terbatas, icon hero glow.
   - Tints: `bg-emerald-50`, `border-emerald-200`, `text-emerald-700`.
3. **Neutrals & Surfaces (60% - Kanvas Bersih & Bernapas):**
   - `kedas-ivory-50` (`canvas`): `#F6F6F1` — Latar utama kanvas halaman (*warm ivory*).
   - `kedas-paper-0` (`surface`): `#FFFFFF` — Permukaan kartu, formulir, panel informasi (*pure white*).
   - `kedas-sage-100` (`brand-100`): `#E8F0E9` — Soft container background, context pill, tag kategori.
   - `kedas-sage-200`: `#D7E4D9` — Border halus pembatas section & soft card border.
   - `kedas-slate-700` (`text-primary`): `#122620` / `#1E2A25` — Teks judul & isi kontras tinggi.
   - `kedas-slate-600` (`text-secondary`): `#53645E` — Keterangan penjelas, subtitle, metadata.
   - `kedas-slate-400`: `#9AA7A0` — Teks nonaktif / disabled.
   - `kedas-border`: `#DDE3DD` — Border standar kartu & tabel.
4. **Semantic Status Tokens:**
   - **Success (Selesai/Terverifikasi):** Teks `#276749`, Latar `#E7F4EA`, Border `#BCE1C7`.
   - **Warning (Menunggu/Perlu Perhatian):** Teks `#98631C`, Latar `#FFF4D9`, Border `#F7E1A0`.
   - **Danger (Ditolak/Dibatalkan/B3):** Teks `#A43F35`, Latar `#FBEAE7`, Border `#F5C6BF`.
   - **Info (Diajukan/Terjadwal):** Teks `#315F86`, Latar `#EAF2F9`, Border `#BDD8EF`.
   - **Neutral (Draf/Catatan):** Teks `#5D6B63`, Latar `#EFF2F0`, Border `#DCE3DD`.

### 3.2 Tipografi & Skala Teks
- **Font Family:** `Plus Jakarta Sans`, `Inter`, `system-ui`, `sans-serif`.
- **Display Hero:** `text-3xl sm:text-5xl lg:text-[54px]`, `font-extrabold`, `leading-[1.08]`, `tracking-tight`.
- **Section Heading:** `text-2xl sm:text-3xl lg:text-4xl`, `font-extrabold / font-bold`, `tracking-tight`.
- **Card Title:** `text-lg sm:text-xl font-bold text-[#122620]`.
- **Body Regular:** `text-sm sm:text-base text-[#53645E] leading-relaxed`.
- **Caption / Helper:** `text-xs text-[#53645E]`.
- **Context Pill / Overline:** `text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200`.

### 3.3 Geometri, Border & Elevation
- **Border Hierarchy:**
  - `border-default`: 1 px (`#DDE3DD`) untuk input formulir dan pembatas pasif.
  - `border-strong`: **2 px** (`border-2`) untuk seluruh kartu interaktif dan tile layanan guna mencegah layout shift saat hover.
  - Hover state: `hover:border-brand-800` pada permukaan terang, `hover:border-emerald-400` pada permukaan gelap.
- **Radius Scale:**
  - `rounded-lg` (9–12px): Kontrol input, tombol standar, pill kecil.
  - `rounded-xl` (12–16px): Kontainer ikon (`IconContainer`), badge panel, modal internal.
  - `rounded-2xl` (16–20px): Kartu layanan utama, panel fitur, hero dialog.
  - `rounded-full` (9999px): Status badge, tombol aksi bulat, EcoGuide trigger.
- **Elevation / Shadows:**
  - `shadow-xs`: `0 1px 2px rgba(20, 43, 35, 0.05)`.
  - `shadow-sm`: `0 2px 6px rgba(20, 43, 35, 0.06)`.
  - `shadow-interactive`: `0 8px 24px rgba(20, 48, 39, 0.09)` (hover state kartu).
  - `shadow-interactive-hover`: `0 12px 30px rgba(18, 38, 32, 0.12)` (lifted state `-translate-y-1.5`).

### 3.4 Iconography Language
- **Library:** `lucide-react` (v0.475.0) secara konsisten di seluruh aplikasi.
- **Stroke Width:** `1.85` (default balance antara ketegasan dan keterbacaan).
- **Prinsip Utama:** Icon-led, bukan icon-only. Ikon selalu didampingi teks deskriptif kecuali pada kontrol navigasi standar yang sudah memiliki `aria-label` dan tooltip.
- **Ukuran Standar:**
  - `14px` (`xs`): Metadata, jam, inline status.
  - `16px` (`sm`): Tombol kecil, aksi baris tabel.
  - `18px` (`md`): Tombol utama, menu navigasi, input field.
  - `24px` (`xl`): Kartu KPI, tile layanan utama.

### 3.5 Interaksi & Motion
- **Durasi & Easing:**
  - `duration-fast`: `160ms` dengan kurva `ease-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`) atau `ease-standard` (`cubic-bezier(0.2, 0, 0, 1)`).
- **Hover Micro-interaction:**
  - Kartu interaktif: `hover:-translate-y-1` atau `hover:-translate-y-1.5` dengan peningkatan bayangan `hover:shadow-interactive`.
  - Tombol: `active:scale-[0.98]` untuk memberikan tactile feedback.
- **Aksesibilitas Fokus & Gerak:**
  - Outline fokus tegas: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:ring-offset-2`.
  - `prefers-reduced-motion`: Transisi transformasi dan animasi scale/translate dinonaktifkan secara otomatis bagi pengguna dengan preferensi vestibular.

---

## 4. Keterbatasan Otomasi Screenshot & Verifikasi Pengujian

Sesuai direktif 1.1:
> *"Jika screenshot automation tidak tersedia, gunakan browser testing yang sudah ada atau dokumentasikan keterbatasan. Jangan mengaku telah membuat screenshot jika tidak ada file bukti."*

- **Pencatatan Keterbatasan:** Repository saat ini tidak menginstal runner browser headless (seperti Puppeteer, Playwright, atau Cypress) di `package.json`.
- **Metode Verifikasi Alternatif yang Sah:**
  1. Audit statis berkas JSX/TSX di seluruh rute publik untuk memastikan kelas CSS Tailwind dan struktur DOM sesuai spesifikasi.
  2. Verifikasi suite unit & komponen Vitest (`npm test`) yang mencakup 14 berkas tes dan 126 tes (semuanya lulus 100%).
  3. Verifikasi typecheck TypeScript (`tsc --noEmit`) tanpa error.
  4. Verifikasi linting ESLint (`next lint`) tanpa warning atau error.
