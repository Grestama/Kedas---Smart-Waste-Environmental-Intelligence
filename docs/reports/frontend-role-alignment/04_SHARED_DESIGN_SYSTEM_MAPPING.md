# PEMETAAN SISTEM DESAIN BERSAMA (SHARED DESIGN SYSTEM MAPPING)
**Dokumen:** `04_SHARED_DESIGN_SYSTEM_MAPPING.md`  
**Status:** Disetujui & Terimplementasi (Tahap 2)  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Normalisasi Design Token

Penyelarasan seluruh ruang kerja Kedas berlandaskan pada sistem token yang diekstrak langsung dari Public Main Website. Seluruh token didefinisikan secara terpusat di `frontend/src/tokens/index.ts`, `frontend/src/tokens/icons.ts`, dan diekspos melalui CSS Variables di `frontend/src/app/globals.css` serta utilitas `frontend/tailwind.config.ts`.

### 1.1 Brand Color Hierarchy & Semantic Mapping
| Token CSS Variable | Nilai HEX | Nama Token TS | Peruntukan & Panduan Penggunaan |
|---|---|---|---|
| `--kedas-forest-950` | `#122620` | `colors.kedas.forest[950]` | Utility workspace bar, footer, logo mark Kedas, display heading tertinggi. |
| `--kedas-forest-900` | `#16352D` | `colors.kedas.forest[900]` | Permukaan kartu gelap, header modal/drawer, bar nilai proposisi publik. |
| `--kedas-forest-800` | `#1D3F35` | `colors.kedas.forest[800]` (`brand-900`) | Tombol aksi primer (CTA), judul seksi, border hover interaktif pada kartu putih. |
| `--kedas-forest-700` | `#285747` | `colors.kedas.forest[700]` | Hover state tombol primer, active sidebar navigation, tab aktif. |
| `--kedas-leaf-600` | `#219B72` | `colors.kedas.leaf[600]` | Aksen hijau terukur, indikator verifikasi sah, link teks primer. |
| `--kedas-leaf-500` | `#2DBA87` | `colors.kedas.leaf[500]` | Aksen interaktif terbatas, icon hero glow, indikator aktif POS. |
| `--kedas-ivory-50` | `#F6F6F1` | `colors.kedas.neutrals.ivory50` (`canvas`) | Latar utama kanvas seluruh halaman (*warm off-white / ivory*). |
| `--kedas-paper-0` | `#FFFFFF` | `colors.kedas.neutrals.paper0` (`surface`) | Permukaan kartu (*card surface*), baris tabel, formulir, popup. |
| `--kedas-sage-100` | `#E8F0E9` | `colors.kedas.neutrals.sage100` (`brand-100`) | Soft container background, context pill, tag kategori, hover ringan. |
| `--kedas-sage-200` | `#D7E4D9` | `colors.kedas.neutrals.sage200` | Garis pembatas halus, soft card border, border tag. |
| `--kedas-slate-700` | `#53645E` | `colors.kedas.neutrals.slate700` | Teks isi (*body copy*) dengan rasio kontras tinggi (> 4.5:1). |
| `--kedas-slate-600` | `#64736D` | `colors.kedas.neutrals.slate600` | Teks sekunder, keterangan penjelas, subtitle, metadata. |
| `--kedas-slate-400` | `#9AA7A0` | `colors.kedas.neutrals.slate400` | Teks non-aktif, placeholder, border disabled. |
| `--kedas-border` | `#DDE3DD` | `colors.kedas.neutrals.border` | Border standar kartu pasif, garis pembagi formulir dan tabel. |

### 1.2 Semantic Status Tokens
Seluruh status operasional di semua role wajib menggunakan token semantik berikut tanpa pengecualian:
- **Success (Selesai / Terverifikasi):** Teks `#276749`, Latar `#E7F4EA`, Border `#BCE1C7`.
- **Warning (Menunggu / Perlu Perhatian / Dalam Proses):** Teks `#98631C`, Latar `#FFF4D9`, Border `#F7E1A0`.
- **Danger (Dibatalkan / Ditolak / Bahaya B3):** Teks `#A43F35`, Latar `#FBEAE7`, Border `#F5C6BF`.
- **Info (Diajukan / Terjadwal):** Teks `#315F86`, Latar `#EAF2F9`, Border `#BDD8EF`.
- **Neutral (Draf / Catatan / Arsip):** Teks `#5D6B63`, Latar `#EFF2F0`, Border `#DCE3DD`.

*Aturan Ketat:* Dilarang menggunakan warna neon, ungu AI (`purple-*`, `indigo-*` yang tidak berdasar), atau cyan glow.

### 1.3 Border & Radius Scale
- **Ketebalan Border:**
  - `border-default` (1px / `#DDE3DD`): Input formulir pasif, divider pemisah section, baris tabel data.
  - `border-strong` (**2px** / `border-2`): **Wajib untuk seluruh kartu interaktif, tile layanan, panel ringkasan, dan radio pilihan setoran**. Penegasan 2px ini memastikan tidak ada pergeseran tata letak (*layout shift*) saat elemen mendapat fokus atau hover state (`hover:border-brand-800`).
- **Skala Radius:**
  - `rounded-lg` (8–10px): Kontrol input, select box, small buttons.
  - `rounded-xl` (12–14px): Kontainer ikon (`IconContainer`), action cards kompak, modal internal.
  - `rounded-2xl` (16–20px): Kartu layanan utama, dialog/modal container, panel ringkasan dashboard, feature tiles.
  - `rounded-full` (9999px): Seluruh status badge semantik, pills, avatar profil, trigger widget EcoGuide.

### 1.4 Elevation & Shadows
- `shadow-xs`: `0 1px 2px rgba(20, 43, 35, 0.05)` (kartu pasif).
- `shadow-nav`: `0 1px 0 rgba(18, 38, 32, .08)` (header sticky publik & hospitality).
- `shadow-interactive`: `0 8px 24px rgba(20, 48, 39, 0.09)` (hover state kartu).
- `shadow-interactive-hover`: `0 12px 30px rgba(18, 38, 32, 0.12)` (lifted state `-translate-y-1` hingga `-translate-y-1.5`).
- `shadow-popover`: `0 16px 40px rgba(18, 38, 32, .14)` (modal, drawer, dropdown popup).

### 1.5 Motion Tokens
- `duration-fast`: `160ms`
- `duration-normal`: `220ms`
- `ease-soft`: `cubic-bezier(0.22, 1, 0.36, 1)` (kurva pegas lembut untuk hover lift kartu).
- `ease-standard`: `cubic-bezier(0.2, 0, 0, 1)` (transisi tombol dan dropdown).
- `prefers-reduced-motion`: Dinonaktifkan otomatis melalui CSS media query di `globals.css`.

---

## 2. Penyelarasan Workspace Shells

### 2.1 Public Header & Footer
- Sumber kebenaran arsitektur: Brand mark Kedas (`rounded-xl bg-brand-900` dengan ikon `Recycle` berwarna emerald), navigasi teks minimalis, CTA primer `Daftar Warga` berikon panah, dan footer 4 kolom berlatar `#122620`.

### 2.2 User Shell (`UserSidebar.tsx`)
- Menggunakan permukaan putih `bg-surface border-r border-border`.
- Item navigasi aktif kini diselaraskan dengan aksen garis tebal: `bg-brand-100 text-brand-900 font-semibold shadow-xs border-l-4 border-brand-900 pl-2.5`.
- Kartu Saldo WastePoints diperbarui menjadi `rounded-2xl border-2 border-border/80 bg-[#FAFBF9]` dengan efek interaktif halus.

### 2.3 Staff Shell (`StaffSidebar.tsx`)
- Mempertahankan tema gelap berdaya kontras tinggi `#122620` untuk kebutuhan lapangan luar ruangan (sinar matahari Bali).
- Active item beraksen tegas: `bg-[#1D3F35] text-white font-semibold shadow-xs border-l-4 border-emerald-400 pl-2.5`.
- Dilengkapi indikator stasiun POS, giliran aktif (*shift*), dan banner status antrean luring (`OfflineOutboxBanner`).

### 2.4 Admin Console Shell (`AdminSidebar.tsx`)
- Diselaraskan dari aksen hijau neon sebelumnya (`bg-emerald-600`) menjadi tema deep evergreen resmi Kedas:
  - Brand Mark: `w-9 h-9 rounded-xl bg-[#1D3F35] border border-emerald-500/30 text-emerald-300 shadow-xs`.
  - Item Navigasi Aktif: `bg-[#1D3F35] text-white font-semibold shadow-xs border-l-4 border-emerald-400 pl-2.5`.
  - Badge angka antrean: `bg-emerald-400 text-[#122620]` saat aktif, dan `bg-emerald-500/20 text-emerald-300 border border-emerald-400/20` saat inaktif.

### 2.5 Hospitality Shell (`HospitalityLayout.tsx`)
- Header navigasi ditingkatkan dari `shadow-xs` ke `shadow-nav` setinggi 64px dengan brand mark Kedas Hospitality yang proporsional.
- Pemilih tenant properti (*Tenant Selector*) dibersihkan dari kelas warna non-token (`sand-100`) menjadi token standar:
  - Tombol pemilih: `rounded-xl bg-brand-100 hover:bg-[#D7E4D9] border-2 border-border/80 font-semibold text-brand-900`.
  - Menu popover: `rounded-2xl bg-surface border-2 border-border shadow-popover p-2.5 z-50 animate-scale-in`.
  - Dilengkapi atribut aksesibilitas `aria-haspopup="true"` dan `aria-expanded`.
