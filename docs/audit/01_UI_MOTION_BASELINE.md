# 01. Baseline Desain Sistem dan Animasi Antarmuka — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Product Designer & Motion / Interaction Designer  
**Status**: Baseline Audit

---

## 1. Status Eksisting Sistem Visual & Motion

### A. Komponen Desain Token (Tailwind CSS)
- **Warna Utama**: Hijau Alam Bali (`brand-900: #122620`, `brand-800: #1b382f`, `brand-700: #265043`, `emerald-600`, `emerald-500`).
- **Warna Canvas & Permukaan**: `canvas: #F4F6F0`, `surface: #FFFFFF`, `border: #E2E8F0`.
- **Warna Semantik**: Sukses (Emerald), Peringatan (Amber), Bahaya (Rose/Red), Info (Sky/Blue).
- **Tipografi**: Font sans-serif modern (`Inter` / system UI sans) dengan skala hierarki:
  - Display / Title: 32–48px (Bold/Extrabold)
  - Section Header: 20–24px (Bold)
  - Card & Label: 14–16px (Semibold/Medium)
  - Body & Microcopy: 12–14px (Regular)
- **Komponen UI Bersama**: `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Modal`, `Toast`, `StatusBadge`, `StatusTimeline`, `StatCard`, `DataTable`, `LoadingSkeleton`, `EmptyState`, `ErrorState`, `PageHeader`, `Panel`.

### B. Evaluasi Animasi Eksisting
- **Transisi Dasar**: Transisi CSS Tailwind (`transition-colors duration-150`, `hover:bg-brand-800`).
- **Loading State**: `LoadingSkeleton` dengan animasi pulse halus (`animate-pulse`).
- **Peluang Peningkatan (Motion Upgrade)**:
  1. *Modal & Drawer*: Animasi kemunculan modal belum menggunakan scale-in dan fade-in terstruktur; backdrop belum memiliki fade-in halus.
  2. *Toast Notification*: Notifikasi toast muncul secara mendadak; diperlukan transisi slide-in dari pojok kanan atas dan fade-out saat dismissal.
  3. *Tombol Interaktif*: Perlu penambahan efek press feedback (`active:scale-[0.98]`) pada tombol penting untuk responsivitas taktil.
  4. *Card Lift Effect*: Penambahan subtle lift (`hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`) pada kartu ringkasan dasbor.
  5. *Aksesibilitas Gerak (`prefers-reduced-motion`)*: Wajib menambahkan media query `@media (prefers-reduced-motion: reduce)` pada CSS global agar animasi dinonaktifkan secara otomatis bagi pengguna dengan preferensi vestibular sensitive.

---

## 2. Pedoman Durasi dan Easing yang Ditetapkan

- **Micro-interactions (Button press, Checkbox, Icon toggle)**: 120ms – 160ms (`ease-out`).
- **Component Transitions (Dropdown, Tooltip, Badge update)**: 180ms – 220ms (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Surface Transitions (Modal scale, Toast slide, Sheet expand)**: 240ms – 300ms (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Zero Distraction Invariant**: Tidak boleh ada animasi berulang tanpa henti pada tombol tindakan utama, tidak ada scroll hijacking, dan tidak ada animasi sukses sebelum server mengonfirmasi respon resmi.
