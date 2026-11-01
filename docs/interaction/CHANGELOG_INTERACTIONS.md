# Log Perubahan Interaksi & Motion Design — Kedas Platform

Dokumen ini mencatat seluruh pembaruan, penambahan file, penyempurnaan komponen primitif, dan penerapan interaksi mikro di seluruh frontend Kedas.

---

## [1.0.0] — 2026-10-30

### 1. Motion Tokens & Fondasi Desain
- **`frontend/src/app/globals.css`:**
  - Menambahkan token durasi CSS: `--motion-instant` (100ms), `--motion-fast` (160ms), `--motion-normal` (220ms), `--motion-emphasis` (320ms), `--motion-enter` (420ms), `--motion-slow` (600ms).
  - Menambahkan token easing kurva bezier: `--ease-standard`, `--ease-enter`, `--ease-exit`, `--ease-soft`.
  - Menambahkan displacement variables: `--motion-distance-xs` (2px), `--motion-distance-sm` (4px), `--motion-distance-md` (8px), `--motion-distance-lg` (14px).
  - Menambahkan bayangan interaktif: `--shadow-interactive`, `--shadow-interactive-hover`.
  - Memperluas keyframes: `fadeIn`, `fadeOut`, `scaleIn`, `scaleOut`, `slideInRight`, `slideInBottom`, `slideUp`, `toastSlideIn`, `toastSlideOut`, `subtlePulse`.
  - Menambahkan utility classes: `.card-interactive`, `.btn-press`.
  - Memperkuat aturan `@media (prefers-reduced-motion: reduce)` dengan `animation-duration: 0.001ms`, `transition-duration: 0.001ms`, dan `transform: none !important`.
- **`frontend/tailwind.config.ts`:**
  - Memperluas `boxShadow` dengan token `interactive` dan `interactive-hover`.
  - Memperluas `transitionDuration` dengan token durasi Kedas.
  - Memperluas `transitionTimingFunction` dengan token kurva bezier Kedas.

### 2. Komponen Primitif Interaktif (UI Primitives)
- **`frontend/src/components/ui/Button.tsx`:**
  - Menambahkan respon taktil tekan `active:scale-[0.98]`.
  - Menambahkan icon nudging pada hover (`group-hover:translate-x-0.5` dan `-translate-x-0.5`).
  - Menambahkan status `disabled:active:scale-100` dan accessible `focus-visible:ring-2`.
- **`frontend/src/components/ui/Panel.tsx`:**
  - Menambahkan properti `interactive?: boolean` yang mengaktifkan hover lift (`card-interactive`) dan kursor pointer.
- **`frontend/src/components/ui/StatCard.tsx`:**
  - Mengintegrasikan hover lift terukur (-2px translateY) dan bayangan bertingkat `--shadow-interactive`.
- **`frontend/src/components/ui/Modal.tsx`:**
  - Menambahkan focus trap untuk cycling Tab dan Shift+Tab.
  - Menambahkan penyimpanan `previousActiveElement` untuk mengembalikan fokus keyboard saat modal ditutup.
  - Menambahkan listener tombol `Escape` untuk dismiss instan.
  - Memperhalus animasi masuk backdrop (`animate-fade-in`) dan container (`animate-scale-in`).
- **`frontend/src/components/ui/Drawer.tsx` (Baru):**
  - Komponen side sheet dan bottom sheet terpadu untuk panel detail.
  - Mendukung side `"right"` (desktop), `"bottom"` (mobile), dan `"left"`.
  - Focus trapping, backdrop dismissal, dan keyboard navigation.
- **`frontend/src/components/ui/Tooltip.tsx` (Baru):**
  - Tooltip aksesibel dengan penundaan buka 300ms pada pointer hover dan buka seketika pada focus keyboard.
  - Menghubungkan trigger dan tooltip melalui atribut WAI-ARIA `aria-describedby` dan `role="tooltip"`.
- **`frontend/src/components/ui/Dropdown.tsx` (Baru):**
  - Komponen menu dropdown interaktif dengan dukungan navigasi tombol panah (`ArrowDown`, `ArrowUp`), seleksi via `Enter`/`Space`, dan pembatalan via `Escape`.
- **`frontend/src/components/ui/Accordion.tsx`:**
  - Mengganti toggle hidden/block dengan CSS Grid transition (`grid-template-rows: 0fr -> 1fr`) yang mulus.
  - Menambahkan rotasi panah chevron 180° tersinkronisasi.
- **`frontend/src/components/ui/Toast.tsx`:**
  - Memperbarui animasi slide-up dan fade-in dengan `--motion-normal` dan `--ease-enter`.
  - Menambahkan interaksi tombol close `active:scale-[0.92]`.
- **`frontend/src/components/ui/Input.tsx` & `Checkbox.tsx`:**
  - Menambahkan transisi focus ring halus dan tactile press feedback pada checkbox (`active:scale-90`).
- **`frontend/src/components/ui/index.ts` (Baru):**
  - Barrel export untuk seluruh komponen antarmuka pengguna.

### 3. Pengalaman Peran Pengguna (Role Experiences)
- **Top Bar & Header Navigasi:**
  - `WorkspaceSwitchBar.tsx`: Link perpindahan peran memiliki efek `active:scale-[0.96]` dan transisi latar belakang halus.
  - `PublicHeader.tsx`: Tombol hamburger mobile menu memiliki tactile scale.
- **Role Publik (`/`):**
  - Value proposition bar memiliki hover container feedback.
  - Empat ubin layanan (Service Tiles) memiliki hover lift 4px, bayangan terangkat, dan animasi panah geser.
- **Role Tamu / Turis (`/guest`):**
  - Tombol pengalih bahasa (Bilingual switcher) memiliki tactile feedback.
  - Kartu pemilahan 3 kategori memiliki hover lift.
  - Widget EcoGuide (`EcoGuideWidget.tsx` & `AIAssistantPanel.tsx`) dilengkapi backdrop blur, dismiss ESC, chip pertanyaan cepat interaktif, dan feedback jempol.
- **Role Warga (`/app` & `/app/setoran/baru`):**
  - Kartu seleksi radio mode layanan (Trike vs Drop-Off) dan kategori sampah mendukung seleksi keyboard (Space/Enter).
  - Modal Kedas Vision terbuka dengan animasi `animate-scale-in` dan backdrop blur.
- **Role Petugas POS (`/staff` & `/staff/tugas/[id]`):**
  - Kotak penimbangan digital (Net = Bruto - Tara) menghitung secara instan saat angka diketik dengan feedback visual jelas.
  - Indikator peringatan jika tara wadah melebihi berat kotor.
- **Role Hospitality (`/hospitality`):**
  - KPI timbulan dan emisi menggunakan kartu interaktif dengan bayangan teduh.
  - Baris tabel penjemputan B2B memiliki hover highlight lembut.
- **Role Admin (`/admin` & `/admin/audit-log`):**
  - Kartu log audit memiliki hover lift interaktif.
  - Proposal tindakan Copilot (`ActionProposalModal.tsx`) memiliki backdrop overlay, dismiss ESC, dan status proses jujur.

### 4. Pengujian & Penjaminan Kualitas
- **`frontend/src/test/interaction-components.test.tsx` (Baru):**
  - 8 pengujian unit baru memverifikasi Drawer, Tooltip, Dropdown, Modal Focus Trap, dan Accordion.
- **Hasil Pengujian Keseluruhan:**
  - Vitest: 14 test file, 124 passed (100%).
  - Typecheck: 0 error.
  - Next Build: 44 static/dynamic routes terkompilasi optimal.

### 5. Dokumentasi Terbitan
1. `docs/interaction/INTERACTION_AUDIT.md`
2. `docs/interaction/MOTION_SYSTEM.md`
3. `docs/interaction/INTERACTION_COMPONENTS.md`
4. `docs/interaction/INTERACTION_QA_REPORT.md`
5. `docs/interaction/CHANGELOG_INTERACTIONS.md`
