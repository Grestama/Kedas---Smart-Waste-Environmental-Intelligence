# Laporan QA & Verifikasi Interaksi — Kedas Platform

Dokumen ini memvalidasi hasil pengujian interaksi, aksesibilitas keyboard, kepatuhan gerak vestibular, dan stabilitas fungsional di seluruh peran pengguna pada platform web Kedas setelah implementasi Motion & Micro-Interactions System.

---

## 1. Ringkasan Eksekutif QA

| Parameter Uji | Standar Verifikasi | Hasil Pengujian | Status |
| :--- | :--- | :--- | :--- |
| **Linting & Typecheck** | TypeScript 5.x tanpa kompromi `any` liar | `tsc --noEmit` keluar dengan kode 0 (0 error) | **PASS** |
| **Unit & Integration Tests** | Vitest suite lengkap untuk UI dan alur bisnis | 14 test file, 124 tests berhasil (100% lulus) | **PASS** |
| **Production Build** | Next.js 15 App Router compilation | 44/44 halaman statis & dinamis terkompilasi optimal | **PASS** |
| **Reduced Motion Mode** | WCAG 2.1 AAA Vestibular Safety | Seluruh transisi collapse ke `0.001ms` dan `transform: none` | **PASS** |
| **Keyboard Accessibility** | Trap fokus, ESC dismiss, loop tab teratur | Berfungsi pada Modal, Drawer, Dropdown, Accordion | **PASS** |
| **Cross-Role Continuity** | 7 area peran terintegrasi tanpa layout shift | Skala font 90% dan `--workspace-bar-height: 32px` presisi | **PASS** |

---

## 2. Matriks Pengujian Lintas Peran (Role Test Matrix)

### 2.1 Peran: Publik & Editorial (`/(public)`)
- **Hero Photographic Section:**
  - Background imagery bersih tanpa kartu melayang yang menutupi pemandangan.
  - Display headline terbaca tajam dengan rasio kontras WCAG AAA.
  - Tombol CTA utama "Jelajahi Cara Kerja" dan "Masuk ke Ruang Kerja" memiliki respon taktil `active:scale-[0.98]` dan shadow interaktif.
- **Value Propositions Bar:**
  - 4 pilar layanan banjar memiliki efek hover container halus tanpa pergeseran tata letak.
- **Service Tiles (4 Pintu Masuk Layanan):**
  - Efek hover lift (translateY -4px) dengan bayangan bertingkat `--shadow-interactive-hover`.
  - Icon arrow geser +1.5px ke kanan saat hover.
- **FAQ Accordion:**
  - Animasi pembukaan menggunakan CSS grid transition (`grid-template-rows: 0fr -> 1fr`) yang mulus tanpa kedipan teks.
  - Rotasi chevron 180° tersinkronisasi.

### 2.2 Peran: Tamu / Wisatawan (`/guest` - EcoGuide Companion)
- **Bilingual Switcher:**
  - Beralih antara Bahasa Indonesia dan Bahasa Inggris secara instan dengan tactile feedback `active:scale-95`.
- **Kartu Pemilahan 3 Jalur (Green, Yellow, Grey):**
  - Efek hover lift kartu interaktif dan kontras warna kearifan lokal yang teduh.
- **AIAssistantPanel (EcoGuide Widget):**
  - Masuk dari kanan dengan transisi `animate-slide-in-right` (320ms).
  - Dilengkapi backdrop overlay gelap yang dapat diklik untuk menutup.
  - Mendukung penutupan via tombol keyboard `Escape`.
  - Chip pertanyaan populer responsif saat ditekan.
  - Feedback jempol (thumbs up/down) interaktif.

### 2.3 Peran: Warga Rumah Tangga (`/app`)
- **Dashboard Warga:**
  - StatCard (Saldo WastePoints, Total Sampah Disetor, Status Banjar) merespons kursor pointer dengan hover lift 2px.
- **Alur Setor Sampah Baru (`/app/setoran/baru`):**
  - Kartu seleksi radio mode layanan (Trike vs Drop-Off) dapat dinavigasi via keyboard (Space/Enter).
  - Kartu kategori sampah memiliki penanda seleksi tegas.
  - Gating pengaman B3/Residu Khusus mencegah pengiriman sampah berbahaya dengan peringatan informatif.
  - Modal Kedas Vision terbuka dengan animasi `animate-scale-in` dan backdrop blur.

### 2.4 Peran: Petugas POS Lapangan (`/staff`)
- **Meja Operasional Petugas:**
  - Kartu tugas aktif memiliki status live pulse indicator.
- **Terminal Penimbangan (`/staff/tugas/[id]`):**
  - Kotak perhitungan timbangan neto (Net = Bruto - Tara) menghitung secara otomatis dan instan saat petugas mengetik angka.
  - Input tara otomatis memberikan validasi error visual jika tara melebihi bruto.
  - OfflineOutboxBanner memunculkan indikator status jaringan dan tombol sinkronisasi dengan animasi putar saat mengirim ke server.

### 2.5 Peran: Pelaku Pariwisata / Hospitality (`/hospitality`)
- **Dashboard Sirkular B2B:**
  - KPI timbulan dan emisi karbon menggunakan `.card-interactive` dengan bayangan teduh.
  - Indikator bar pemakaian kuota CDOA harian beranimasi transisi lebar halus.
  - Baris tabel riwayat penjemputan B2B menonjolkan sorotan hover lembut saat kursor melintas.

### 2.6 Peran: Konsol Admin & AI Copilot (`/admin`)
- **Audit Log Penelusuran (`/admin/audit-log`):**
  - Kartu log audit merespons filter pencarian instan dan hover kartu interaktif.
- **ActionProposalModal (`/components/ai/ActionProposalModal.tsx`):**
  - Modal review proposal tindakan otomatis mengunci scrolling body.
  - Mendukung penutupan dengan tombol ESC dan klik latar belakang.
  - Tombol eksekusi menampilkan loading state jujur "Memproses...".

---

## 3. Pengujian Aksesibilitas & Responsivitas (A11y & Viewport)

### 3.1 Responsivitas Viewport
- **Desktop (>= 1280px):** Tata letak grid penuh, sidebars sticky terpasang rapi di bawah top utility bar (tinggi 32px), tidak ada tumpang tindih.
- **Tablet (768px - 1024px):** Komposisi 2 kolom adaptif, modal terpusat dengan padding nyaman.
- **Mobile (< 768px):** Menu drawer publik dan staff meluncur mulus, formulir penimbangan tersusun vertikal, tombol berukuran tap target minimal 44x44px.

### 3.2 Kepatuhan `prefers-reduced-motion`
- Menguji via emulation Chrome DevTools / CSS media query `prefers-reduced-motion: reduce`.
- **Hasil:** Seluruh animasi `@keyframes` dan transisi CSS langsung di-bypass (`duration: 0.001ms`), tidak ada efek parallax atau getaran transform, kursor dan elemen tetap berada di posisi akhir secara tenang dan seketika.

### 3.3 Keyboard Navigation & WAI-ARIA
- **Focus Indicators:** Indikator focus-visible ring (`#83b6a0`, offset 2px) terlihat jelas di seluruh tombol, link, radio card, input, dan select.
- **Focus Trapping:** Telah terverifikasi pada komponen `Modal.tsx`, `Drawer.tsx`, dan `ActionProposalModal.tsx` sehingga fokus Tab tidak bocor ke elemen di belakang overlay.
- **Focus Restoration:** Setelah modal atau drawer ditutup, fokus keyboard otomatis dikembalikan ke tombol pemicu sebelumnya.
