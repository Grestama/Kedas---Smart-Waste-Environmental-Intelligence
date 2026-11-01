# INVENTARISASI VARIABEL LINGKUNGAN (ENVIRONMENT VARIABLES)
**Dokumen:** `ENVIRONMENT_VARIABLES.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Target:** Vercel Hosting (Web Frontend)  
**Tanggal:** 1 November 2026, 08:16:45+08:00  
**Status:** ZERO SECRETS EXPOSED (Hanya Nama dan Fungsi Deklaratif)

---

## 1. Aturan Keamanan Non-Negotiable

1. **Dilarang Menyimpan Nilai Rahasia dalam Dokumen atau Chat:** Seluruh nilai API key, kredensial basis data, private token, dan secret wajib dimasukkan secara langsung melalui **Vercel Project Dashboard > Settings > Environment Variables** atau Vercel CLI yang terautentikasi.
2. **Tidak Ada Secret dengan Prefix `NEXT_PUBLIC_`:** Seluruh variabel dengan awalan `NEXT_PUBLIC_` akan dibundel ke dalam file JavaScript publik yang dapat diinspeksi oleh siapa saja melalui browser console/network tab. Jangan pernah memberikan prefix ini pada kunci rahasia.
3. **Penyelarasan `.env.local`:** Berkas `.env.local` di lingkungan lokal telah masuk dalam `.gitignore` dan tidak akan ter-commit ke Git.

---

## 2. Matriks Variabel Lingkungan Frontend

| Nama Variabel | Cakupan (Scope) | Lingkungan (Environments) | Apakah Rahasia (Secret)? | Wajib Diisi (Required)? | Nilai Contoh / Placeholder Aman |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`NEXT_PUBLIC_API_BASE_URL`** | Client & Server | Development, Preview, Production | **Tidak** (Publik) | **Ya** | `https://api.kedas.id/api/v1` (Prod)<br>`https://staging-api.kedas.id/api/v1` (Preview)<br>`http://localhost:8000/api/v1` (Dev) |
| **`NEXT_PUBLIC_APP_ENV`** | Client & Server | Development, Preview, Production | **Tidak** (Publik) | **Ya** | `production` / `staging` / `development` |
| **`NEXT_PUBLIC_TIMEZONE`** | Client & Server | Development, Preview, Production | **Tidak** (Publik) | Opsional (Default: `Asia/Makassar`) | `Asia/Makassar` (WITA standard Bali) |

---

## 3. Penjelasan Fungsional Variabel

### 3.1 `NEXT_PUBLIC_API_BASE_URL`
- **Fungsi:** Menentukan endpoint dasar (*base URL*) untuk seluruh panggilan API asinkron dari browser ke backend FastAPI (`/auth`, `/waste/pickup-requests`, `/community`, `/staff`, `/marketplace`, dll.).
- **Perilaku Validasi:** Divalidasi secara ketat oleh skema Zod di `frontend/src/config/env.ts`. Jika nilai bukan merupakan URL valid, proses build akan memunculkan pesan error deskriptif tanpa membocorkan credential.

### 3.2 `NEXT_PUBLIC_APP_ENV`
- **Fungsi:** Mengatur status lingkungan aplikasi. Digunakan untuk mengaktifkan logging diagnostik di preview atau mematikan fitur eksperimental di production.

### 3.3 `NEXT_PUBLIC_TIMEZONE`
- **Fungsi:** Menyeragamkan pemformatan tanggal dan waktu operasional penjemputan sampah ke zona Waktu Indonesia Tengah (WITA, UTC+8) di seluruh perangkat pengguna.

---

## 4. Panduan Pengaturan di Vercel Dashboard

1. Buka **Vercel Dashboard** > Pilih Proyek **`kedas-web`**.
2. Masuk ke **Settings** > **Environment Variables**.
3. Tambahkan:
   - **Key:** `NEXT_PUBLIC_API_BASE_URL`  
     **Value:** URL publik HTTPS backend FastAPI Anda  
     **Target:** Centang `Production` dan `Preview`.
   - **Key:** `NEXT_PUBLIC_APP_ENV`  
     **Value:** `production` (untuk Production), `staging` (untuk Preview)  
   - **Key:** `NEXT_PUBLIC_TIMEZONE`  
     **Value:** `Asia/Makassar` (untuk Production & Preview)
4. Lakukan **Redeploy** agar variabel baru diterapkan ke bundel build berikutnya.
