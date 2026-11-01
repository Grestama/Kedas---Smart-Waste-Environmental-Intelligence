# LAPORAN DEPENDENSI & KEBERSIHAN MANIFEST KEDAS
**Dokumen:** `KEDAS_DEPENDENCY_CLEANUP_REPORT.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Waktu Audit:** 1 November 2026  
**Status:** PASS (0 Unused Dependencies, 100% Active)

---

## 1. Rangkuman Dependensi Frontend (`frontend/package.json`)

Frontend Kedas mempertahankan struktur dependensi yang sangat ramping:
- **7 Production Dependencies:** `clsx`, `lucide-react`, `next`, `react`, `react-dom`, `tailwind-merge`, `zod`.
  - Seluruhnya terbukti di-import secara langsung dalam komponen UI, validasi environment variabel (`zod`), dan pembentukan styling dinamis (`clsx` + `tailwind-merge`).
- **14 Development Dependencies:** `@testing-library/jest-dom`, `@testing-library/react`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `autoprefixer`, `eslint`, `eslint-config-next`, `jsdom`, `postcss`, `tailwindcss`, `typescript`, `vitest`.
  - Seluruhnya terbukti esensial untuk pipeline kompilasi Tailwind, linting Next.js, dan testing unit Vitest.

---

## 2. Rangkuman Dependensi Backend (`backend/pyproject.toml`)

- **Produksi:** `fastapi`, `uvicorn[standard]`, `sqlalchemy[asyncio]`, `alembic`, `psycopg2-binary`, `pydantic`, `pydantic-settings`, `python-multipart`, `argon2-cffi`, `email-validator`, `httpx`.
- **Pengembangan:** `pytest`, `pytest-asyncio`, `pytest-cov`, `ruff`, `mypy`, `httpx`.
- Seluruh paket terpasang aktif untuk kebutuhan runtime API asinkron, migrasi skema database, hashing kata sandi OWASP, dan validasi data.

---

## 3. Rangkuman Dependensi Mobile (`mobile/package.json`)

- Subproyek mobile didukung oleh `expo`, `react`, `react-native`, `typescript`, dan `vitest`.
- 15 pengujian unit mobile berjalan sukses dan konsisten.

---

## 4. Rekomendasi Pemeliharaan Dependensi

1. Tidak ada dependensi yang perlu dihapus saat ini (*zero dead dependencies*).
2. Hindari melakukan *bulk update* dependensi utama (seperti React 19 atau Next.js 15) tanpa pengujian regresi komprehensif.
3. Kunci versi dependensi menggunakan `package-lock.json` untuk menjamin reproduktibilitas build tim.
