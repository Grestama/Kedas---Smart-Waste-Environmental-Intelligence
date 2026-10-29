# WasteLink Bali — Frontend Setup & Release Guide

Panduan lengkap untuk menginstal, mengonfigurasi, menguji, dan menjalankan frontend WasteLink Bali (Web Portal & Aplikasi Mobile Warga).

---

## 1. Persyaratan Sistem

- **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan `v20.x LTS`)
- **Package Manager**: `npm` (versi 9+) atau `pnpm`
- **Backend API**: Server FastAPI berjalan di `http://localhost:8000` (atau URL staging)
- **Zona Waktu Operasional**: Seluruh data waktu diformat dalam **WITA (Asia/Makassar, UTC+8)**
- **Mata Uang**: **IDR (Rupiah)**

---

## 2. Struktur Direktori Frontend

```
HackAthon-Bali/
├── frontend/             # Next.js 15 Web Portal (Warga, Petugas POS, Admin Console)
│   ├── src/
│   │   ├── app/          # App Router: (public), app/, staff/, admin/, mobile/
│   │   ├── components/   # UI components, layout shells, form controls
│   │   ├── context/      # AuthContext & Session Provider
│   │   ├── services/     # API Client services (auth, collection, staff, admin)
│   │   ├── tokens/       # Design tokens (colors, spacing, typography, WITA)
│   │   └── types/        # TypeScript domain models & schemas
│   └── package.json
│
├── mobile/               # React Native / Expo Citizen App (Khusus Warga)
│   ├── src/
│   │   ├── context/      # MobileAuthContext
│   │   ├── lib/          # MobileApiClient, OfflineDraftManager, DevicePermissionsManager
│   │   ├── navigation/   # BottomTabNavigator (5-Tab UI)
│   │   ├── screens/      # Beranda, Setor (5-step), Aktivitas, Poin, Profil
│   │   ├── tokens/       # Mobile design tokens & 48dp touch targets
│   │   └── types/        # Mobile data models
│   ├── App.tsx           # Mobile root entry point
│   ├── app.json          # Expo manifest & permission rationale
│   └── package.json
```

---

## 3. Menjalankan Web Portal (`frontend/`)

### A. Instalasi Dependensi
```bash
cd frontend
npm install
```

### B. Konfigurasi Lingkungan (`.env.local`)
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi konfigurasi standar:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_TIMEZONE=Asia/Makassar
NEXT_PUBLIC_APP_CURRENCY=IDR
```

### C. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada:
- **Landing Page & Edukasi**: `http://localhost:3000`
- **Login / Masuk**: `http://localhost:3000/masuk`
- **User / Warga Web**: `http://localhost:3000/app`
- **Petugas POS Web (Desktop)**: `http://localhost:3000/staff`
- **Admin & Operator Console**: `http://localhost:3000/admin`
- **Interactive Mobile Simulator**: `http://localhost:3000/mobile`

### D. Pengujian & Quality Gate Web
```bash
# Jalankan test suite Vitest
npm test

# Jalankan Typecheck TypeScript
npm run typecheck

# Jalankan Production Build
npm run build
```

---

## 4. Menjalankan Aplikasi Mobile Warga (`mobile/`)

> **PENTING**: Aplikasi mobile dirancang khusus untuk **User/Warga**. Petugas armada sampah dan admin menggunakan Terminal POS Web Desktop di komputer operasional.

### A. Instalasi Dependensi
```bash
cd mobile
npm install
```

### B. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi:
```env
# Catatan Emulator/Device Fisik:
# Jangan gunakan localhost jika menjalankan di HP fisik atau Android Emulator!
# - Android Emulator: gunakan http://10.0.2.2:8000/api/v1
# - Perangkat Fisik (Expo Go): gunakan IP LAN komputer, e.g. http://192.168.1.15:8000/api/v1
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_DEFAULT_SERVICE_AREA=sa_sukawati
```

### C. Menjalankan Expo Bundler
```bash
npm start
```
- Tekan `w` untuk menjalankan di web browser.
- Tekan `a` untuk emulator Android.
- Tekan `i` untuk simulator iOS.
- Scan QR code dengan aplikasi **Expo Go** pada smartphone Android/iOS Anda.

### D. Pengujian & Quality Gate Mobile
```bash
# Jalankan test suite Vitest Mobile
npm test

# Jalankan Typecheck TypeScript Mobile
npm run typecheck
```

---

## 5. Kredensial Uji Lokal (Development Seed Accounts)

| Peran (Role) | Nomor HP / Email | Password / PIN | Akses Workspace |
| :--- | :--- | :--- | :--- |
| **Warga (User)** | `0812-3456-7890` / `warga@sukawati.id` | `Warga123!` | `/app` & `mobile/` |
| **Petugas (Collector)** | `0819-3456-7890` / `petugas@sukawati.id` | `Petugas123!` | `/staff` (Desktop POS) |
| **Admin / Operator** | `0811-3456-7890` / `admin@sukawati.id` | `Admin123!` | `/admin` (Admin Console) |

---

## 6. Checklist Rilis & Keamanan (Security Verification)

- [x] Tidak ada API Key, secret, atau credential privat di dalam git repository.
- [x] Menggunakan session berbasis HttpOnly Cookie dan Bearer Token dengan otorisasi ketat di sisi server.
- [x] Input berat sampah mewajibkan validasi numerik positif dan kalkulasi bobot bersih sah (`net = gross - tare`).
- [x] Gating limbah berbahaya (B3 Spesifik) memblokir permohonan penjemputan armada trike harian.
- [x] State machine penjemputan menegakkan transisi berurutan dan penanganan kontensi `409 Conflict`.
- [x] Mode luring (offline) memberi label eksplisit `DRAFT_LOKAL_OFFLINE` dan tidak mengklaim kuota server sampai sinkronisasi daring berhasil.
