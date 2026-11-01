# DAFTAR ISU DIKETAHUI, TECHNICAL DEBT & TINDAK LANJUT
**Dokumen:** `13_KNOWN_ISSUES_AND_FOLLOW_UP.md`  
**Versi:** 1.0  
**Tanggal:** 1 November 2026  
**Status:** DOKUMENTASI TERBUKA (Non-blocking / Future Enhancements)

---

## 1. Ruang Lingkup Belum Tersedia (Missing Scope Analysis)

Sesuai dengan **Master Directive 0.3 ("No fake functionality / Do not invent missing routes")**, tim audit mengidentifikasi bahwa terdapat dua role yang telah memiliki fondasi backend/service namun belum memiliki dedicated page structure di frontend Next.js App Router:

### 1.1 Facility / TPS3R / TPST / Bank Sampah
- **Kondisi Aktual:**
  - Telah memiliki API service client lengkap: `frontend/src/services/facility.ts`.
  - Telah memiliki interface tipe data TypeScript: `FacilityIntake`, `FacilityCapacity`, `FacilityMaterial`.
  - Telah memiliki unit test suite: `src/test/facility.test.ts` (8 tests passed).
  - Namun, **belum ada direktori rute** `src/app/facility/` di App Router.
- **Tindakan yang Diambil:**
  - Dicatat secara transparan sebagai *Missing Route Scope*.
  - Tidak dibuat halaman fiktif atau mock navigation yang dapat membingungkan alur produksi.
  - Token desain sistem, komponen tabel (`DataTable`), modal konfirmasi, dan input form telah dipersiapkan dan distandarkan sehingga siap digunakan seketika saat rute dibangun di fase berikutnya.

### 1.2 Community / Banjar Adat
- **Kondisi Aktual:**
  - Telah memiliki API service client lengkap: `frontend/src/services/community.ts`.
  - Telah memiliki interface tipe data TypeScript: `BanjarProgram`, `BanjarAnnouncement`, `CommunityMetric`.
  - Telah memiliki unit test suite: `src/test/community.test.ts` (11 tests passed).
  - Namun, **belum ada direktori rute** `src/app/community/` di App Router.
- **Tindakan yang Diambil:**
  - Dicatat secara transparan sebagai *Missing Route Scope*.
  - Alur warga banjar saat ini diakomodasi melalui dashboard warga (`/app`), pemilihan banjar di profil (`/app/profil`), dan tampilan area layanan (`/area-layanan`).

---

## 2. Keterbatasan Alat Pengujian Otomatis (Tooling Limitations)

### 2.1 Headless Browser Visual Regression Tooling
- **Kondisi:**
  - Repository frontend saat ini menggunakan Vitest (`vitest 4.1.12`) untuk unit/integration testing dan Next.js standard toolchain (`eslint`, `tsc`, `next build`).
  - Tidak terpasang runner browser headless (seperti Playwright, Puppeteer, atau Cypress) dalam `package.json`.
- **Mitigasi & Solusi yang Dilakukan:**
  - Sesuai prinsip *Evidence-Based Completion*, pengujian dilakukan melalui:
    1. Static type checking bebas error (`tsc --noEmit`).
    2. Zero warning ESLint linter (`next lint`).
    3. 100% test pass rate pada 14 modul tes (126 unit tests).
    4. Full compilation pass pada Next.js production build (45 halaman).
    5. Audit CSS manual dan verifikasi aturan breakpoint responsif serta rasio kontras WCAG 2.1 AA.
- **Rekomendasi Tindak Lanjut:**
  - Menambahkan dependensi `@playwright/test` pada pipeline CI/CD di masa depan untuk mengambil snapshot visual otomatis secara berkala.

---

## 3. Catatan Technical Debt & Refactoring Lanjutan

### 3.1 Unifikasi Sistem Toast & Flash Notification
- **Temuan:** Beberapa halaman menggunakan local state notification bar, sementara halaman lain mengandalkan alert banner sederhana.
- **Rekomendasi:** Membangun `ToastProvider` terpusat yang mewarisi styling pill semantik Kedas (`rounded-2xl border-2 border-border shadow-popover`).

### 3.2 Persiapan Migrasi Tailwind CSS v4
- **Temuan:** `frontend/tailwind.config.ts` saat ini menggunakan konfigurasi JavaScript klasik Tailwind v3. Pada penyelarasan ini, alias backward-compatibility telah ditambahkan untuk mencegah broken class.
- **Rekomendasi:** Ketika Next.js mengadopsi Tailwind CSS v4 secara stabil, transisikan token ini ke direktori CSS native `@theme` dengan menggunakan variabel CSS `--kedas-*` yang sudah terdefinisi.

### 3.3 Dynamic Route Prerendering Optimization
- **Temuan:** Rute dinamis `/app/setoran/[id]` dan `/staff/tugas/[id]` saat ini dikompilasi secara on-demand (`ƒ (Dynamic)`).
- **Rekomendasi:** Jika beban server bertambah, implementasikan `generateStaticParams` atau caching agresif di level Next.js server components untuk parameter ID yang sering diakses.

---

## 4. Prioritas Rencana Rilis Mendatang (Roadmap)

| Prioritas | Item Pekerjaan | Target Estimasi | Dependensi |
| :--- | :--- | :--- | :--- |
| **P1** | Pembuatan dedicated UI route `src/app/facility/*` (Intake timbangan TPST, kapasitas, handover) | Sprint Berikutnya | Finalisasi endpoint backend facility |
| **P1** | Pembuatan dedicated UI route `src/app/community/*` (Program banjar adat, pengumuman gotong royong) | Sprint Berikutnya | Finalisasi endpoint backend community |
| **P2** | Setup Playwright E2E visual regression di GitHub Actions CI | Sprint Q1 | Setup runner CI/CD |
| **P3** | Standarisasi Global Toast Provider lintas role | Sprint Q1 | Desain spesifikasi UX toast |

---
*Dokumen ini diperbarui secara berkala sebagai panduan peningkatan kualitas berkelanjutan sistem Kedas.*
