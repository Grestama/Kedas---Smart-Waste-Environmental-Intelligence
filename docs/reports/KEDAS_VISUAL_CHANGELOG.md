# Changelog Penyempurnaan Visual & Bahasa Ikon Kedas (Kedas Visual Changelog)

Seluruh perubahan visual, standardisasi token, dan peningkatan micro-interaction dicatat secara berurutan di bawah ini.

---

### [2026-10-30] — Stage 1 to Stage 7 Complete Implementation

#### 1. Token Sistem & Variabel Global (`frontend/src/tokens/`)
- **Dibuat `frontend/src/tokens/icons.ts`:**
  - Standardisasi skala ukuran ikon: `xs` (14px), `sm` (16px), `md` (18px), `lg` (22px), `xl` (26px), `2xl` (34px), `display` (44px).
  - Standardisasi stroke token: `default` (1.85), `thin` (1.5), `bold` (2.2).
  - Standardisasi varian wadah ikon (`iconContainerVariants`): `soft`, `brand`, `outline`, `inverse`, `warning`, `danger`, `info`.
- **Diperbarui `frontend/src/tokens/index.ts`:**
  - Ekspor skala border: `hairline` (1px), `default` (1px), `emphasis` (1.5px), `strong` (2px), `feature` (3px).
  - Ekspor skala radius: `xs` (6px) hingga `2xl` (26px).
  - Ekspor skala elevation: `elevation-0` hingga `elevation-4`.
  - Ekspor skala surface: `page` (#F4F5F0), `surface` (#FFFFFF), `surfaceSoft` (#FAFBF9), `surfaceRaised` (#FFFFFF), `surfaceInverse` (#122620), `surfaceSelected` (#E5EAE6).
- **Diperbarui `frontend/src/app/globals.css`:**
  - Ditambahkan CSS variables `--border-hairline`, `--border-default`, `--border-emphasis`, `--border-strong`, `--border-feature`.
  - Ditambahkan token radius dan box-shadow elevation yang selaras dengan `design_web.md`.
  - Standardisasi kartu interaktif dengan `border-weight: 2px` (`border-2`) dan `hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive` untuk mencegah layout shift.

#### 2. Komponen UI Inti (`frontend/src/components/ui/`)
- **Dibuat `IconButton.tsx`:**
  - Tombol ikon aksesibel dengan hit area minimum 40×40px pada desktop, 44×44px pada layar sentuh.
  - Wajib `aria-label`, integrasi tooltip instan saat di-hover/focus, dukungan 6 varian (`primary`, `secondary`, `outline`, `ghost`, `soft`, `danger`), dan state loading spinner.
- **Dibuat `IconContainer.tsx`:**
  - Wadah semantik terpadu untuk ikon dengan radius teratur dan warna latar belakang yang sesuai sistem desain Kedas.
- **Diperbarui `StatusBadge.tsx`:**
  - Ditambahkan dukungan semantic icon bawaan (`CheckCircle2` untuk success, `Clock` untuk warning, `AlertTriangle` untuk danger, `Info` untuk info, `FileText` untuk neutral) di samping indikator titik (dot).
- **Diperbarui `Modal.tsx` & `Drawer.tsx`:**
  - Tombol tutup diganti menggunakan `IconButton` standar dengan `variant="ghost"`, ukuran proporsional, dan accessible focus ring.
- **Diperbarui `frontend/src/components/ui/index.ts`:**
  - Mengekspor `IconButton`, `IconButtonProps`, `IconContainer`, dan `IconContainerProps`.

#### 3. Pembersihan Simbol & Emoji Arbitrer
- **Diperbarui `frontend/src/components/ai/AIAbstainState.tsx`:**
  - Menghapus emoji `💡` dan menggantinya dengan ikon semantik `<Lightbulb className="w-3.5 h-3.5 text-amber-600" />`.
  - Memastikan seluruh antarmuka bebas dari emoji generik yang tidak konsisten dengan bahasa visual Kedas.

#### 4. Ruang Kerja & Navigasi Terpadu (`frontend/src/components/shells/`)
- **`WorkspaceSwitchBar.tsx`:**
  - Konsistensi ikon semantik (`Globe`, `User`, `Truck`, `ShieldAlert`, `Building2`, `Compass`).
  - Active state visual yang jelas dengan highlight `bg-white/20 shadow-inner` dan focus ring `emerald-400`.
- **`UserSidebar.tsx` & `UserHeader.tsx`:**
  - Standardisasi ikon menu, kartu saldo WastePoints dengan ikon koin emas terpusat, dan tombol logout berwarna rose dengan border tegas.
- **`StaffSidebar.tsx` & `StaffHeader.tsx`:**
  - Terminal status badge dengan pulsing live dot, navigasi berbasis shift kerja, dan peringatan APD K3 dengan ikon perisai keselamatan.
- **`AdminSidebar.tsx`:**
  - Pengelompokan hierarki 3 section navigasi dengan ikon 16px konsisten dan indikator badge notifikasi numerik.

#### 5. Halaman Peran (Role-wide Enhancements)
- **Portal Warga (`/app`, `/app/setoran/baru`):**
  - Mengintegrasikan `IconContainer` pada riwayat setoran material.
  - Kartu pilihan radio mode layanan (Armada Trike vs Pos Mandiri) menggunakan `border-2` dengan hover lift tanpa pergeseran posisi.
- **Petugas Lapangan (`/staff`):**
  - Kartu penjemputan aktif menggunakan `border-2 border-[#1D3F35]`.
  - Kartu alamat dan kontak warga menggunakan `border-2 border-border hover:border-brand-800` dengan target sentuh responsif.
- **Green Hospitality (`/hospitality`):**
  - KPI stat cards ditingkatkan menggunakan `IconContainer` semantik (`brand`, `soft`, `warning`).
- **Konsol Supervisi Admin (`/admin`):**
  - Pintasan modul operasional (Mitra Daur Ulang dan Audit Log) distandardisasi dengan `IconContainer variant="brand"`.
- **Halaman Tamu (`/guest`) & Area Layanan (`/area-layanan`):**
  - Banner kearifan lokal Tri Hita Karana dan hidrasi bebas botol plastik ditingkatkan menggunakan `IconContainer`.
  - Kartu area layanan distandardisasi dengan `IconContainer` pada ikon pin lokasi.

#### 6. Pengujian & Jaminan Mutu (Quality Assurance)
- 126 unit & integration tests lulus tanpa kegagalan (`vitest run`).
- TypeScript zero error (`tsc --noEmit`).
- Next.js production build sukses mengkompilasi seluruh 45 halaman statis.
