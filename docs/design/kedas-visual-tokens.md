# Kedas Visual Tokens & Design System Specification (Stage 2)
**Versi:** 2.1 (Icon-First & Premium Visual Polish)  
**Dokumen Pengendali:** `design_web.md`  
**Implementasi Kode:** `frontend/src/tokens/index.ts`, `frontend/src/tokens/icons.ts`, dan `frontend/src/app/globals.css`

---

## 1. Color System (60–30–10 Disciplined Ratio)
| Token Nama | Nilai HEX | Peran & Penggunaan |
| :--- | :--- | :--- |
| `kedas-forest-950` | `#122620` | Utility strip, navbar logo text, heading tingkat tertinggi |
| `kedas-forest-900` | `#16352D` | Permukaan brand utama, header modal / drawer |
| `kedas-forest-800` | `#1D3F35` | Tombol CTA primer, judul section, border hover |
| `kedas-forest-700` | `#285747` | Hover state tombol primer, active navigation |
| `kedas-leaf-600` | `#219B72` | Aksen hijau terukur (icon pill, indikator terverifikasi) |
| `kedas-leaf-500` | `#2DBA87` | Aksen interaktif terbatas |
| `kedas-ivory-50` | `#F6F6F1` | Latar utama kanvas (*warm ivory*) |
| `kedas-paper-0` | `#FFFFFF` | Permukaan kartu, formulir, popup (*pure white*) |
| `kedas-sage-100` | `#E8F0E9` | Soft tint surface container, context pill |
| `kedas-sage-200` | `#D7E4D9` | Border halus, pembatas section |
| `kedas-slate-700` | `#53645E` | Teks body / isi dengan kontras tinggi |
| `kedas-slate-600` | `#64736D` | Teks sekunder / keterangan penjelas |
| `kedas-slate-400` | `#9AA7A0` | Teks non-aktif / muted metadata |

---

## 2. Icon Scale & Stroke Tokens
Dikelola terpusat di `frontend/src/tokens/icons.ts`:

| Token | Ukuran (px) | Ketebalan Stroke | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| `icon-xs` | 14 px | 1.85 | Metadata, tanggal/jam, tag inline status |
| `icon-sm` | 16 px | 1.85 | Kontrol kompak, aksi baris tabel |
| `icon-md` | 18 px | 1.85 | Field input, menu navigasi, tombol standar |
| `icon-lg` | 22 px | 1.85 | Subjudul kartu, header navigasi |
| `icon-xl` | 26 px | 1.85 | Kartu KPI analitik, tile layanan utama |
| `icon-2xl` | 34 px | 1.85 | Empty state, icon fitur section |
| `icon-display` | 44 px | 1.85 | Simbol ilustrasi hero atau feature besar |

### Icon Container Variants
- **`soft`:** `rounded-xl bg-[#E8F0E9] text-[#1D3F35] border border-[#D7E4D9]/60`
- **`brand`:** `rounded-xl bg-[#122620] text-emerald-400 shadow-xs`
- **`outline`:** `rounded-xl bg-white border border-[#DDE3DD] text-[#1D3F35] shadow-2xs`
- **`inverse`:** `rounded-xl bg-white/10 text-emerald-300 border border-white/15`

---

## 3. Border Hierarchy
| Token | Ketebalan | Penggunaan |
| :--- | :--- | :--- |
| `border-hairline` | 1 px | Garis pembagi (*divider*), border baris tabel |
| `border-default` | 1 px | Input formulir dan kartu standar statis |
| `border-emphasis` | 1.5 px | Kontainer terpilih (*selected state*), form focus |
| `border-strong` | 2 px | Seluruh kartu & box dengan efek hover pop-up (`border-2`) |
| `border-feature` | 3 px | Aksen tepi terbatas (*featured components*) |

---

## 4. Radius Scale
- `radius-xs`: 6 px (tag kecil, indicator badge)
- `radius-sm`: 9 px (input kompak, small button)
- `radius-md`: 12 px (button standar, alert bar)
- `radius-lg`: 16 px (kartu standar, table container)
- `radius-xl`: 20 px (kartu hero, modal container)
- `radius-2xl`: 26 px (feature panel, floating widget)
- `radius-pill`: 9999 px (pills, status badges, avatar)

---

## 5. Elevation & Shadow Scale
- `shadow-xs`: `0 1px 2px rgba(20, 43, 35, 0.05)` (kartu datar / list item)
- `shadow-sm`: `0 2px 6px rgba(20, 43, 35, 0.06), 0 1px 2px rgba(20, 43, 35, 0.04)`
- `shadow-md`: `0 8px 20px rgba(20, 43, 35, 0.08), 0 2px 6px rgba(20, 43, 35, 0.04)` (kartu terangkat / popover)
- `shadow-lg`: `0 16px 36px rgba(20, 43, 35, 0.11)` (modal, drawer)
- `shadow-xl`: `0 24px 56px rgba(20, 43, 35, 0.14)` (critical overlay)
- `shadow-interactive`: `0 8px 24px rgba(20, 48, 39, 0.09)` (hover state kartu interaktif)
- `shadow-interactive-hover`: `0 12px 30px rgba(18, 38, 32, 0.12)` (lifted state -3px)

---

## 6. Aturan Aksesibilitas Kontrol Icon-Only
1. Setiap tombol tanpa teks wajib menyertakan atribut `aria-label` yang jelas dan deskriptif.
2. Ukuran target klik (*hit target*) minimum 40×40 px di desktop, 44×44 px di layar mobile/touch.
3. Fokus keyboard wajib menghasilkan cincin outline yang jelas (`focus-visible:ring-2 focus-visible:ring-[#83b6a0]`).
4. Tombol aksi berbahaya (*destructive actions* seperti Hapus/Tolak) tidak boleh hanya berupa ikon tanpa konfirmasi atau teks eksplisit.
