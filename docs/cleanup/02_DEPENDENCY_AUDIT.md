# AUDIT INTEGRITAS DEPENDENSI KEDAS
**Dokumen:** `02_DEPENDENCY_AUDIT.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Waktu Audit:** 1 November 2026, 02:20:30+08:00  
**Status:** TAHAP 2 COMPLETE (100% Dependensi Terbukti Aktif)

---

## 1. Audit Dependensi Frontend (`frontend/package.json`)

Frontend Kedas memiliki manajemen dependensi yang sangat ramping (*lean*) dengan total hanya 7 paket produksi dan 14 paket pengembangan:

### 1.1 Dependensi Produksi (`dependencies`)

| Paket | Versi | Status Penggunaan | Lokasi Bukti Import | Rekomendasi |
| :--- | :--- | :--- | :--- | :--- |
| **`clsx`** | `^2.1.1` | **AKTIF** | `src/lib/utils.ts` (Fungsi helper `cn()`) | **KEEP** |
| **`lucide-react`** | `^0.475.0` | **AKTIF** | Seluruh komponen UI, navigasi, dan halaman (Ikon grafis) | **KEEP** |
| **`next`** | `15.5.28` | **AKTIF** | Framework App Router, Server Components, API routes | **KEEP** |
| **`react`** | `^19.0.0` | **AKTIF** | Library inti React 19 UI | **KEEP** |
| **`react-dom`** | `^19.0.0` | **AKTIF** | DOM renderer untuk React 19 | **KEEP** |
| **`tailwind-merge`**| `^3.0.1` | **AKTIF** | `src/lib/utils.ts` (Resolusi konflik kelas Tailwind `cn()`) | **KEEP** |
| **`zod`** | `^4.6.7` | **AKTIF** | `src/config/env.ts` (Validasi skema environment variabel) | **KEEP** |

### 1.2 Dependensi Pengembangan (`devDependencies`)

| Paket | Versi | Peran & Penggunaan | Rekomendasi |
| :--- | :--- | :--- | :--- |
| **`@testing-library/jest-dom`** | `^6.6.3` | Matcher DOM untuk pengujian unit Vitest | **KEEP** |
| **`@testing-library/react`** | `^16.2.0` | Runner render komponen untuk testing | **KEEP** |
| **`@types/node`** | `^22.13.4` | Definisi tipe Node.js | **KEEP** |
| **`@types/react`** | `^19.0.8` | Definisi tipe React 19 | **KEEP** |
| **`@types/react-dom`** | `^19.0.3` | Definisi tipe React-DOM 19 | **KEEP** |
| **`@vitejs/plugin-react`** | `^6.1.2` | Plugin kompilasi JSX untuk Vitest | **KEEP** |
| **`autoprefixer`** | `^10.4.20` | Vendor-prefixing CSS Tailwind | **KEEP** |
| **`eslint`** | `^9.20.1` | Linter analisis statis kode | **KEEP** |
| **`eslint-config-next`** | `15.5.28` | Aturan linting resmi Next.js | **KEEP** |
| **`jsdom`** | `^26.0.0` | Simulasi browser environment di Vitest | **KEEP** |
| **`postcss`** | `^8.5.32` | Processor pipeline Tailwind CSS | **KEEP** |
| **`tailwindcss`** | `^3.4.17` | Utility-first CSS framework | **KEEP** |
| **`typescript`** | `^5.7.3` | Kompiler & pemeriksa tipe TypeScript | **KEEP** |
| **`vitest`** | `^4.1.12` | Framework testing frontend (126 unit tests) | **KEEP** |

---

## 2. Audit Dependensi Backend (`backend/pyproject.toml`)

Backend FastAPI menggunakan dependensi terverifikasi yang didefinisikan secara deklaratif:

| Paket | Versi Minimum | Peruntukan Fungsional | Rekomendasi |
| :--- | :--- | :--- | :--- |
| **`fastapi`** | `>=0.115.0` | Framework REST API backend utama | **KEEP** |
| **`uvicorn[standard]`** | `>=0.30.0` | Server ASGI performa tinggi | **KEEP** |
| **`sqlalchemy[asyncio]`**| `>=2.0.30` | ORM async untuk pemodelan basis data | **KEEP** |
| **`alembic`** | `>=1.13.0` | Alat manajemen migrasi skema database | **KEEP** |
| **`psycopg2-binary`** | `>=2.9.9` | Driver PostgreSQL untuk deployment produksi | **KEEP** |
| **`pydantic`** | `>=2.7.0` | Validasi skema data dan serialisasi JSON | **KEEP** |
| **`pydantic-settings`** | `>=2.3.0` | Pengelolaan konfigurasi environment backend | **KEEP** |
| **`python-multipart`** | `>=0.0.9` | Parsing multipart form-data untuk upload foto bukti | **KEEP** |
| **`argon2-cffi`** | `>=23.1.0` | Hashing kata sandi berbasis Argon2id (standar OWASP) | **KEEP** |
| **`email-validator`** | `>=2.0.0` | Validasi format alamat email pengguna | **KEEP** |
| **`httpx`** | `>=0.27.0` | Client HTTP asinkron untuk evaluasi & RAG AI | **KEEP** |
| **`pytest` / `pytest-asyncio` / `pytest-cov`** | Berbagai | Runner pengujian backend & laporan coverage | **KEEP** |
| **`ruff`** | `>=0.5.0` | Linter & formatter super cepat Python | **KEEP** |
| **`mypy`** | `>=1.10.0` | Type checker statis mode strict Python | **KEEP** |

---

## 3. Audit Dependensi Mobile (`mobile/package.json`)

Subproyek mobile mengandalkan stack Expo dan React Native:
- `expo`: `^58.0.21` (Platform runtime mobile)
- `react`: `^19.3.1` & `react-native`: `^0.88.1` (Framework UI mobile)
- `typescript` & `vitest`: Testing dan validasi tipe (15 tests passed)

---

## 4. Evaluasi Kebersihan & Keputusan Akhir

- **Tidak Ada Paket Tidak Terpakai (*Zero Dead Packages*):** Tidak ditemukan paket eksternal "hantu" yang terpasang tanpa digunakan.
- **Konsistensi Lockfile:** `frontend/package-lock.json` dan `mobile/package-lock.json` sinkron dengan `package.json`.
- **Tidak Dilakukan Bulk Uninstall:** Sesuai prinsip *safety*, tidak ada dependency yang dihapus karena seluruhnya merupakan dependensi aktif runtime atau testing pipeline.
