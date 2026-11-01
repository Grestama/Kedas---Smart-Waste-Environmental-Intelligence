# SPESIFIKASI KONFIGURASI VERCEL MONOREPO KEDAS
**Dokumen:** `VERCEL_CONFIGURATION.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Target:** Vercel Hosting (Web Frontend)  
**Tanggal:** 1 November 2026, 08:16:30+08:00  
**Status Quality Gate:** TAHAP 2 PASS (Konfigurasi Terverifikasi)

---

## 1. Pengaturan Proyek Vercel (Project Settings)

Saat membuat atau mengonfigurasi proyek Kedas di Vercel Dashboard atau melalui Vercel CLI, gunakan parameter deklaratif berikut:

| Parameter Pengaturan | Nilai Konfigurasi | Keterangan / Rasional |
| :--- | :--- | :--- |
| **Project Name** | `kedas-web` (atau `wastelink-bali-frontend`) | Nama proyek di Vercel Dashboard |
| **Framework Preset** | `Next.js` | Deteksi native Vercel untuk App Router |
| **Root Directory** | `frontend` | **WAJIB:** Monorepo boundary (mengisolasi dari backend/mobile) |
| **Build Command** | `npm run build` (atau `next build`) | Kompilasi production Next.js 15.5.28 |
| **Install Command** | `npm ci` | Deterministic dependency install berbasis `package-lock.json` |
| **Output Directory** | `.next` (Dikelola otomatis oleh preset) | Jangan override manual agar cache Vercel bekerja |
| **Node.js Version** | `20.x` atau `22.x` | Kompatibel penuh dengan React 19 & Next.js 15 |
| **Production Branch** | `master` | Cabang rilis utama |

---

## 2. Berkas Konfigurasi `vercel.json` (Minimal & Aman)

Dibuat berkas konfigurasi minimal di dalam folder `frontend/vercel.json` untuk menjamin keamanan header HTTP tanpa mengubah perilaku visual atau merusak Next.js router:

```json
{
  "framework": "nextjs",
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 3. Isolasi Monorepo & Keamanan Berkas (Monorepo Safety)

1. **Pemisahan Konteks Build:**
   - Dengan menetapkan Root Directory ke `frontend`, Vercel hanya akan mengunggah dan membangun berkas di dalam subdirektori `frontend/`.
   - Berkas backend (`backend/app`, `wastelink.db`, `backend/uploads`), mobile (`mobile/`), dan dokumentasi internal tidak akan ikut terkirim ke serverless build bundle Vercel.
2. **Ketersediaan Lockfile:**
   - `frontend/package-lock.json` tersedia secara mandiri di dalam folder `frontend/`, sehingga instalasi `npm ci` tidak bergantung pada root repositori.

---

## 4. Analisis Konektivitas Backend API & CORS

- **Mekanisme Autentikasi:** Frontend menggunakan token JWT Bearer yang dikirimkan melalui header HTTP `Authorization: Bearer <token>` dan disimpan pada `localStorage` browser. 
- **Keuntungan Arsitektural:** Penggunaan header `Authorization` terhindar dari kendala blokir pihak ketiga (*third-party cookie blocking*) atau batasan `SameSite=None; Secure` yang sering terjadi pada domain yang berbeda antara frontend Vercel (`*.vercel.app`) dan backend API terpisah.
- **Kebijakan CORS Backend:** Backend FastAPI harus mendaftarkan origin domain Vercel ke dalam daftar `ALLOWED_ORIGINS`:
  - `https://kedas-web.vercel.app` (Preview deployment default)
  - `https://*.vercel.app` (Preview branches)
  - Domain kustom produksi (misal `https://kedas.id`)

---
*Kesimpulan Tahap 2: Konfigurasi Vercel telah terdefinisi secara minimalis dan aman.*
