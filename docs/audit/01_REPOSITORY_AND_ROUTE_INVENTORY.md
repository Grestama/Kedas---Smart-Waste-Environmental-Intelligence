# 01. Inventarisasi Repositori dan Rute Sistem — Kedas

**Proyek**: Kedas (sebelumnya WasteLink Bali)  
**Tanggal Audit**: 30 Oktober 2026  
**Auditor**: Senior System Analyst & Software Architect  
**Tahap**: Tahap 1 — Full Discovery & Baseline Audit

---

## 1. Struktur Repositori As-Built

Repositori Kedas dibangun dengan pola **Modular Monolith** yang memisahkan client presentation, core service domain, dan data persistence:

```
HackAthon-Bali/
├── backend/
│   ├── alembic/                # 8 migrasi database reversibel
│   ├── app/
│   │   ├── api/v1/             # 19 sub-router API publik dan terproteksi
│   │   ├── core/               # Konfigurasi, middleware, dependensi keamanan & RBAC
│   │   ├── db/                 # Koneksi database SQLAlchemy & Base model
│   │   ├── modules/            # 16 domain business logic modules
│   │   └── main.py             # Entry point FastAPI application
│   └── tests/                  # 76 test files (Unit, Concurrency, E2E)
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js 15 App Router (37 rute halaman)
│   │   ├── components/         # Design system & shared shells
│   │   ├── context/            # AuthContext & Session management
│   │   ├── lib/                # API client, HTTP interceptors, utils
│   │   ├── services/           # Service layer frontend
│   │   └── test/               # Vitest suite (94 tests)
│   └── public/                 # Static assets & icons
├── mobile/
│   ├── src/                    # Offline-first engine & TypeScript models
│   └── src/test/               # Vitest suite (15 tests)
└── docs/                       # Dokumentasi arsitektur, spesifikasi, dan laporan
```

---

## 2. Inventarisasi Rute Frontend Web (Next.js 15)

| Rute URL | Platform | Tipe Akses | Target Peran / Scope | Fungsi & Fitur Halaman | Status As-Built |
|---|---|---|---|---|---|
| `/` | Web | Publik | Semua Pengunjung | Landing page Kedas, edukasi sirkular banjar | Implemented & verified |
| `/masuk` | Web | Publik | Pengunjung / User | Form login multi-role dengan demo switcher | Implemented & verified |
| `/daftar` | Web | Publik | Warga Baru | Registrasi akun warga (role dasar USER) | Implemented & verified |
| `/lupa-password` | Web | Publik | Pengguna Lupa Sandi | Informasi SOP pemulihan kata sandi banjar | Implemented & verified |
| `/panduan` | Web | Publik | Warga / Komunitas | Panduan 4 kategori pemilahan sampah | Implemented & verified |
| `/area-layanan` | Web | Publik | Publik | Jadwal dan wilayah pilot Banjar Sukawati | Implemented & verified |
| `/faq` | Web | Publik | Publik | Pertanyaan umum tata cara operasional | Implemented & verified |
| `/mobile` | Web/Mobile | Publik / Demo | Warga / Penguji | Frame emulator aplikasi mobile Kedas | Implemented & verified |
| `/app` | Web / PWA | Terproteksi | `USER` | Dasbor utama warga, ringkasan poin & setoran | Implemented & verified |
| `/app/profil` | Web / PWA | Terproteksi | `USER` | Kelola profil, nomor telepon, alamat jemput | Implemented & verified |
| `/app/setoran` | Web / PWA | Terproteksi | `USER` | Daftar riwayat setoran & status penjemputan | Implemented & verified |
| `/app/setoran/baru` | Web / PWA | Terproteksi | `USER` | Form pembuatan setoran mandiri / penjemputan | Implemented & verified |
| `/app/setoran/[id]` | Web / PWA | Terproteksi | `USER` | Detail tiket setoran dan lini masa status | Implemented & verified |
| `/app/waste-points` | Web / PWA | Terproteksi | `USER` | Buku besar perolehan poin dan penukaran | Implemented & verified |
| `/app/dampak` | Web / PWA | Terproteksi | `USER` | Kalkulator dampak lingkungan & pengurangan CO2 | Implemented & verified |
| `/app/notifikasi` | Web / PWA | Terproteksi | `USER` | Pusat notifikasi aktivitas setoran | Implemented & verified |
| `/app/bantuan` | Web / PWA | Terproteksi | `USER` | Kontak pos komando & call center banjar | Implemented & verified |
| `/staff` | Web POS | Terproteksi | `COLLECTOR` | Dasbor shift petugas pengangkut sampah | Implemented & verified |
| `/staff/tugas/tersedia`| Web POS | Terproteksi | `COLLECTOR` | Daftar tugas siap ambil di wilayah tugas | Implemented & verified |
| `/staff/tugas/saya` | Web POS | Terproteksi | `COLLECTOR` | Tugas aktif yang sedang dikerjakan petugas | Implemented & verified |
| `/staff/tugas/[id]` | Web POS | Terproteksi | `COLLECTOR` | Alur timbang, foto bukti, inspeksi kualitas | Implemented & verified |
| `/staff/riwayat` | Web POS | Terproteksi | `COLLECTOR` | Rekapitulasi tugas penjemputan terselesaikan | Implemented & verified |
| `/staff/profil` | Web POS | Terproteksi | `COLLECTOR` | Profil petugas, kendaraan, dan zona banjar | Implemented & verified |
| `/staff/panduan-keselamatan` | Web POS | Terproteksi | `COLLECTOR` | SOP APD dan keselamatan pengangkutan | Implemented & verified |
| `/admin` | Web Konsol | Terproteksi | `ADMIN` / `DISPATCHER` | Dasbor metrik eksekutif & operasional banjar | Implemented & verified |
| `/admin/permintaan` | Web Konsol | Terproteksi | `ADMIN` / `DISPATCHER` | Monitoring seluruh tiket setoran warga | Implemented & verified |
| `/admin/pengajuan-petugas` | Web Konsol | Terproteksi | `ADMIN` | Verifikasi dan persetujuan calon petugas | Implemented & verified |
| `/admin/area-jadwal`| Web Konsol | Terproteksi | `ADMIN` | Pengaturan kuota slot & jadwal penjemputan | Implemented & verified |
| `/admin/kategori` | Web Konsol | Terproteksi | `ADMIN` | Katalog kategori material dan tarif poin | Implemented & verified |
| `/admin/waste-points/rules` | Web Konsol | Terproteksi | `ADMIN` | Manajemen aturan penerbitan poin & plafon | Implemented & verified |
| `/admin/mitra` | Web Konsol | Terproteksi | `ADMIN` | Daftar mitra industri daur ulang berizin | Implemented & verified |
| `/admin/pendanaan` | Web Konsol | Terproteksi | `ADMIN` | Alokasi anggaran program sponsorship CSR | Implemented & verified |
| `/admin/laporan` | Web Konsol | Terproteksi | `ADMIN` | Laporan tonase sampah & neraca massa | Implemented & verified |
| `/admin/audit-log` | Web Konsol | Terproteksi | `ADMIN` | Jejak audit kepatuhan & perubahan data | Implemented & verified |
| `/admin/pengguna` | Web Konsol | Terproteksi | `ADMIN` | Manajemen akun dan status keaktifan user | Implemented & verified |

---

## 3. Inventarisasi Endpoint Backend REST API (FastAPI)

Terdapat 48 endpoint RESTful yang terkelompok dalam sub-router:
- **Autentikasi & Akun**: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me`, `PATCH /me`, `GET /me/roles`, `POST /me/active-role`, `GET /me/addresses`, `POST /me/addresses`.
- **Aplikasi Petugas**: `POST /collector-applications`, `GET /collector-applications/mine`, `GET /admin/collector-applications`, `POST /admin/collector-applications/{id}/review`.
- **Area & Taksonomi**: `GET /service-areas`, `GET /waste-categories`.
- **Penjemputan Warga**: `POST /pickup-requests`, `GET /pickup-requests/my`, `POST /pickup-requests/{id}/cancel`.
- **Operasional Petugas**: `GET /collector/tasks/available`, `POST /collector/tasks/{id}/claim`, `POST /collector/tasks/{id}/status`, `POST /inspections`, `POST /weights`.
- **Fasilitas & Bank Sampah**: `POST /facilities/{id}/receipts`, `POST /facilities/{id}/sort`, `POST /waste-bank/accounts`, `POST /waste-bank/transactions`.
- **Marketplace B2B**: `GET /marketplace/batches`, `POST /marketplace/batches`, `POST /marketplace/orders`.
- **Komunitas & Tata Kelola**: `GET /community/banjars/{id}/dashboard`, `POST /community/cleanups`, `POST /community/hazardous-manifests`.
- **Health & Audit**: `GET /health/live`, `GET /health/ready`, `GET /admin/audit-logs`.
