# AUDIT KESIAPAN DEPLOYMENT & BASELINE FREEZE KEDAS KE VERCEL
**Dokumen:** `DEPLOYMENT_READINESS_AUDIT.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Target:** Vercel Hosting (Web Frontend)  
**Tanggal Audit:** 1 November 2026, 08:16:00+08:00  
**Status Quality Gate:** TAHAP 1 PASS (Baseline & Guardrails Secured)  
**Prinsip Utama:** **DESIGN FREEZE** (0% Perubahan Desain, Layout, Komponen, Tipografi, Warna, Maupun Aset)

---

## 1. Baseline Git & Integritas Monorepo

Berdasarkan audit langsung working tree Git:
- **Current Branch:** `master`
- **Current HEAD Commit:** `84789d639ff3ad4a47670ca6f9ca0c0fdf7ea99a` (`feat(phase-7): complete master e2e integration test, quality assurance, and pilot runbook`)
- **Status Working Tree:** Monorepo bersih dari artefak cache, basis data SQLite lokal (`backend/wastelink.db`) terproteksi oleh `.gitignore`.
- **Topologi Monorepo:**
  ```text
  HackAthon-Bali/
  ├── frontend/       # Target Deployment Vercel (Next.js 15.5.28 App Router)
  ├── backend/        # FastAPI, SQLAlchemy, Alembic, PostgreSQL/SQLite
  ├── mobile/         # Expo 58, React Native 0.88 (Aplikasi Warga Sukawati)
  ├── docs/           # Dokumentasi arsitektur, PRD, SRS, laporan implementasi
  └── PAKET_DOKUMEN_KEDAS_AI_WEB_INNOVATION/ # Dokumen resmi AI Kedas
  ```

---

## 2. Penemuan Framework, Runtime & Package Manager

| Parameter | Temuan Aktual | Verifikasi |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15.5.28 (App Router) | Terverifikasi di `frontend/package.json` |
| **UI Library** | React 19.0.0 & React DOM 19.0.0 | Terverifikasi di `frontend/package.json` |
| **CSS Framework** | Tailwind CSS 3.4.17 + PostCSS 8.5 | Terverifikasi di `frontend/tailwind.config.ts` |
| **Icon Library** | Lucide React 0.475.0 (stroke 1.85px) | Terverifikasi di seluruh komponen UI |
| **Runtime Language** | TypeScript 5.7.3 (`tsconfig.json`) | Strict mode, zero errors |
| **Package Manager** | `npm` (Lockfile: `package-lock.json`) | `npm ci` kompatibel |
| **Node.js Support** | Node.js >= 18.x (diuji pada v24.15.0) | Kompatibel Vercel Node 20.x/22.x |

---

## 3. Pemetaan Arsitektur Rute & Autentikasi (45 Routes)

Next.js App Router mengelola 45 rute terverifikasi:
- **Public Website (7 rute):** `/` (Visual Source of Truth), `/area-layanan`, `/tanya`, `/faq`, `/panduan`, `/mobile`, `/_not-found`.
- **Guest Companion (1 rute):** `/guest` (Wisatawan tanpa login).
- **Authentication (3 rute):** `/masuk`, `/daftar`, `/lupa-password`.
- **Warga Workspace (10 rute):** `/app`, `/app/setoran`, `/app/setoran/baru`, `/app/setoran/[id]`, `/app/waste-points`, `/app/dampak`, `/app/profil`, `/app/notifikasi`, `/app/panduan`, `/app/bantuan`.
- **Petugas Lapangan (7 rute):** `/staff`, `/staff/tugas/tersedia`, `/staff/tugas/saya`, `/staff/tugas/[id]`, `/staff/riwayat`, `/staff/profil`, `/staff/panduan-keselamatan`.
- **Green Hospitality (5 rute):** `/hospitality`, `/hospitality/setoran`, `/hospitality/lapor`, `/hospitality/esg`, `/hospitality/guest-companion`.
- **Admin Console (12 rute):** `/admin`, `/admin/permintaan`, `/admin/pengajuan-petugas`, `/admin/pengguna`, `/admin/area-jadwal`, `/admin/kategori`, `/admin/mitra`, `/admin/pendanaan`, `/admin/waste-points/rules`, `/admin/pengetahuan`, `/admin/laporan`, `/admin/audit-log`.

---

## 4. Penilaian Kesesuaian Topologi Vercel (Vercel Suitability Assessment)

Dievaluasi 4 skenario deployment:

| Skenario | Deskripsi | Risiko / Keterbatasan | Rekomendasi |
| :--- | :--- | :--- | :--- |
| **Opsi A: Single Root App** | Root repo langsung menjadi Next.js app | Repo adalah monorepo (`frontend`, `backend`, `mobile`). Memaksa root akan merusak struktur. | **DITOLAK** |
| **Opsi B & C: Monorepo Frontend di Vercel + Backend Terpisah** | Frontend di-deploy di Vercel dengan Root Directory `frontend/`. Backend FastAPI di-hosting terpisah pada server container/VPS/PaaS. | Sangat stabil, decoupled, performa CDN Next.js optimal, tidak terikat batasan serverless. | **DISETUJUI (TOPOLOGI RESMI)** |
| **Opsi D: FastAPI sebagai Vercel Serverless Function** | Memasukkan backend Python ke dalam folder `api/` Vercel Functions | 116 endpoints REST, 44 tabel ORM, SQLite/PostgreSQL persistent connection, dan heavy AI dependencies akan melampaui ukuran bundle & batas timeout 15s. | **DITOLAK** |

**Keputusan Topologi:** **Frontend Monorepo di Vercel** dengan konfigurasi Root Directory `frontend` terhubung via API base URL HTTPS ke backend FastAPI.

---

## 5. Penguncian Baseline Desain & Geometri (Strict Design Freeze)

Sesuai **Instruksi 0.1**, seluruh elemen visual dikunci (*frozen*):
1. **Palet Warna:** 60% Ivory/White Canvas (`#FAFBF9`, `#FFFFFF`), 30% Deep Forest (`#122620`, `#1D3F35`), 10% Emerald Accent (`#10B981`).
2. **Tipografi:** *Plus Jakarta Sans*, tracking rapat (`tracking-tight`), dan angka tabular (`tabular-nums`) pada timbangan/metrik.
3. **Sistem Border & Radius:** `border-2` solid kontras tinggi (`border-border`), `rounded-2xl` (16px) untuk card & modal, `rounded-xl` (12px) untuk input, `rounded-full` untuk badge/pill.
4. **Geometri:**
   - Navigasi kerja (`WorkspaceSwitchBar`): tinggi 36px (`--workspace-bar-height`).
   - Header utama (`PublicHeader`): tinggi 64px (`--navbar-height`).
   - Container max width: `max-w-7xl` (1280px) dengan padding `px-4 sm:px-6 lg:px-8`.
   - Sidebar lebar tetap: 260px (`AdminSidebar`, `UserSidebar`, `StaffSidebar`).
5. **Aset Gambar Publik:**
   - Hero background: `/images/hero-cleanup.jpg` (Full-bleed scenery dengan atmospheric scrim).
   - Mosaic cards: `/images/mosaic-1.jpg` dan `/images/mosaic-2.jpg`.

---

## 6. Verifikasi Kualitas Baseline Lokal (Quality Gate Tahap 1)

Perintah verifikasi yang dijalankan pada direktori `frontend/`:
- `npm run lint` -> **✔ No ESLint warnings or errors**
- `npx tsc --noEmit` -> **0 type errors**
- `npm test` -> **14 test files passed, 126 unit tests passed** (100% pass rate)
- `npm run build` -> **45/45 static/dynamic pages compiled successfully** dalam 7.1s.

---
*Kesimpulan Tahap 1: Seluruh kriteria kelulusan Tahap 1 terpenuhi. Siap lanjut otomatis ke Tahap 2.*
