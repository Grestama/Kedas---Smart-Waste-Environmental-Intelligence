# BUKU PANDUAN DEPLOYMENT VERCEL (DEPLOYMENT RUNBOOK)
**Dokumen:** `DEPLOYMENT_RUNBOOK.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Target:** Vercel Hosting (Web Frontend)  
**Versi:** 1.0  
**Tanggal:** 1 November 2026, 08:18:15+08:00  

---

## 1. Ikhtisar Alur Deployment

Aplikasi web Kedas telah siap 100% untuk di-hosting di Vercel. Terdapat dua metode resmi yang dapat dipilih oleh pemilik repositori:

---

## METODE 1: Deployment Otomatis via Vercel Dashboard & GitHub (SANGAT DIREKOMENDASIKAN)

Metode ini merupakan praktik terbaik (*best practice*) untuk Next.js karena menyediakan CI/CD otomatis, preview deployment untuk setiap pull request, dan sertifikat SSL otomatis.

### Langkah 1: Hubungkan Repositori ke Vercel
1. Masuk ke akun Anda di [vercel.com](https://vercel.com).
2. Klik tombol **"Add New..."** > **"Project"**.
3. Pilih repositori **`HackAthon-Bali`** dari daftar repositori Git Anda.

### Langkah 2: Konfigurasi Project Settings (PENTING!)
Pada halaman *Configure Project*, pastikan pengaturan berikut diatur:
- **Framework Preset:** Pilih **`Next.js`**.
- **Root Directory:** Klik tombol *Edit* dan pilih folder **`frontend`** (bukan root!).
- **Build and Output Settings:** Biarkan default (Vercel otomatis menjalankan `npm run build` dan mendeteksi `.next`).
- **Install Command:** Biarkan default (`npm ci` atau `npm install`).

### Langkah 3: Tambahkan Environment Variables
Pada bagian **Environment Variables**, tambahkan 3 variabel berikut:

| Key | Value Contoh | Target Environment |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.kedas.id/api/v1` (atau URL backend Anda) | Production, Preview |
| `NEXT_PUBLIC_APP_ENV` | `production` | Production |
| `NEXT_PUBLIC_TIMEZONE` | `Asia/Makassar` | Production, Preview |

### Langkah 4: Klik "Deploy"
1. Klik tombol **"Deploy"**.
2. Vercel akan mengunduh subfolder `frontend/`, menjalankan `npm ci`, mengompilasi seluruh 45 halaman dengan Next.js 15.5.28, dan menerbitkan URL preview/production dalam waktu $\sim 1\text{ menit}$.

---

## METODE 2: Deployment Cepat via Vercel CLI (Terminal Lokal)

Jika Anda ingin melakukan deployment langsung dari terminal komputer Anda:

### Langkah 1: Login ke Vercel CLI
Buka terminal PowerShell di komputer Anda:
```powershell
npx vercel login
```
*Ikuti tautan browser untuk mengonfirmasi autentikasi akun Vercel Anda.*

### Langkah 2: Jalankan Preview Deployment
Masuk ke subdirektori `frontend/` dan jalankan perintah:
```powershell
cd frontend
npx vercel
```
*Jawab pertanyaan prompt interaktif Vercel:*
- `Set up and deploy "~/HackAthon-Bali/frontend"?` -> **`Y`**
- `Which scope do you want to deploy to?` -> *Pilih akun/tim Anda*
- `Link to existing project?` -> **`N`** (atau `Y` jika proyek sudah dibuat)
- `What's your project's name?` -> **`kedas-web`**
- `In which directory is your code located?` -> **`./`** (karena Anda sudah berada di dalam `frontend/`)
- `Want to modify these settings?` -> **`N`**

Vercel akan mengunggah berkas, membangun aplikasi, dan menghasilkan **Preview URL** unik (misal: `https://kedas-web-xxx.vercel.app`).

### Langkah 3: Publikasikan ke Production (Setelah Preview Terverifikasi)
Setelah memverifikasi bahwa URL Preview berjalan sempurna:
```powershell
npx vercel --prod
```

---

## 2. Prosedur Rollback Cepat (Bila Terjadi Insiden)

Jika rilis produksi mengalami kendala tak terduga:
1. Buka **Vercel Dashboard** > Proyek **`kedas-web`** > Tab **Deployments**.
2. Cari deployment sebelumnya yang berstatus hijau (*Ready*).
3. Klik menu titik tiga (**...**) pada deployment tersebut > Pilih **"Promote to Production"**.
4. Dalam hitungan detik ($\sim 2\text{ detik}$), lalu lintas pengunjung akan langsung dialihkan kembali ke versi stabil sebelumnya secara instan (*zero downtime rollback*).

---
*Runbook ini dirancang untuk memastikan proses penerbitan berjalan mulus tanpa deviasi.*
