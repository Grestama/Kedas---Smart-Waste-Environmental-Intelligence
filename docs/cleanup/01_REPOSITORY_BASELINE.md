# REPOSITORY BASELINE & ARCHITECTURE AUDIT
**Dokumen:** `01_REPOSITORY_BASELINE.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Waktu Audit:** 1 November 2026, 02:17:30+08:00  
**Status:** TAHAP 1 COMPLETE (Git Safety & Baseline Secured)

---

## 1. Ikhtisar Arsitektur Repository

Repository **Kedas (Wastelink Bali)** merupakan monorepo multi-tier yang terbagi menjadi empat pilar utama:

```text
HackAthon-Bali/
├── backend/                              # FastAPI, SQLAlchemy, Alembic, Pydantic (Python >=3.11)
├── frontend/                             # Next.js 15.5.28 (App Router), React 19, Tailwind CSS 3.4
├── mobile/                               # Expo 58, React Native 0.88, TypeScript (Warga Sukawati App)
├── docs/                                 # Dokumentasi PRD, SRS, HDD, Desain, IAM, QA, Laporan
│   ├── cleanup/                          # Workspace audit & repositori hygiene (dokumen ini)
│   ├── reports/                          # Laporan komprehensif implementasi & alignment
│   └── Contoh_UI/                        # Aset gambar referensi UI prototype awal
├── PAKET_DOKUMEN_KEDAS_AI_WEB_INNOVATION/# Bundel resmi PRD, SRS, HDD, Design System Kedas AI
├── uploads/                              # Direktori penyimpanan bukti foto timbangan lokal
└── node_modules/                         # Cache vitest tidak sengaja terbentuk di root (.vite/)
```

---

## 2. Inventarisasi Stack Teknologi & Runtime

| Subproyek | Framework / Runtime | Dependency Manifest | Lockfile | Test Runner | Linter / Typecheck |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend** | Python >= 3.11<br>FastAPI 0.115<br>SQLAlchemy 2.0 (async)<br>Alembic 1.13 | `backend/pyproject.toml` | *Mengikuti poetry/pip virtualenv* | Pytest 8.2<br>`pytest-asyncio` | Ruff 0.5<br>Mypy 1.10 (strict) |
| **Frontend** | Node.js (Next.js 15.5.28)<br>React 19.0.0<br>Tailwind CSS 3.4.17 | `frontend/package.json` | `frontend/package-lock.json` | Vitest 4.1.12<br>`@testing-library/react` | ESLint 9 (next/core-web-vitals)<br>`tsc --noEmit` (TS 5.7.3) |
| **Mobile** | Node.js (Expo 58.0.21)<br>React Native 0.88.1<br>React 19.3.1 | `mobile/package.json` | `mobile/package-lock.json` | Vitest 5.0.5 | `tsc --noEmit` (TS 7.0.2) |

---

## 3. Metrik & Distribusi Berkas Repository

- **Total berkas aktif (non-git, non-node_modules, non-.next):** ~821 berkas (~76.16 MB).
- **Distribusi Berkas Berdasarkan Ekstensi Teratas:**
  - `.md` (Markdown Dokumentasi & Laporan): 213 berkas
  - `.py` (Source Code Backend Python): 133 berkas
  - `.pyc` (Bytecode Python dalam `__pycache__`): 133 berkas (sudah di-ignore oleh git)
  - `.tsx` (Komponen & Halaman React): 112 berkas
  - `.jpg` (Aset Gambar, Uploads & UI Mockups): 69 berkas
  - `.ts` (Service, Lib, Test & Token TypeScript): 38 berkas
  - `.db` (32 file cache `.mypy_cache` + 1 file `backend/wastelink.db`): 33 berkas
  - `.json` (Manifest & Data Config): 15 berkas
  - `.gitignore`: 10 berkas
  - `.csv` (Data Matriks & Traceability): 5 berkas
  - `.png`: 4 berkas
- **Status Pelacakan Git:**
  - **Tracked Files:** 285 berkas
  - **Pre-existing Modified Files:** 77 berkas
  - **Pre-existing Deleted Files:** 2 berkas
  - **Untracked Files:** 263 berkas

---

## 4. Evaluasi Kebijakan `.gitignore` (Ignore Rules Baseline)

### 4.1 Root `.gitignore`
```gitignore
# Environment variables & secrets
.env
*.env
!.env.example

# Python
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.coverage
htmlcov/
.mypy_cache/
.ruff_cache/

# Uploads
uploads/

# OS
.DS_Store
Thumbs.db
```
**Temuan Kritis Root `.gitignore`:**
1. **Tidak ada `node_modules/`:** Root `.gitignore` tidak mencantumkan `node_modules/`. Ketika vitest/npm dijalankan di root, terbentuk folder `node_modules/.vite/` yang terdeteksi sebagai untracked files di Git!
2. **Tidak ada `*.db` / `*.sqlite3`:** Berkas database lokal seperti `backend/wastelink.db` menjadi untracked dan rentan secara tidak sengaja ter-commit jika seseorang menjalankan `git add .`.
3. **Tidak ada `.next/`:** Jika build Next.js dijalankan di root atau output terduplikasi, `.next/` di root tidak di-ignore (meskipun `frontend/.gitignore` sudah meng-ignore `frontend/.next/`).

### 4.2 Frontend `.gitignore`
Mengabaikan `/node_modules`, `/.next/`, `/coverage`, `/build`, `.env*.local`, `*.tsbuildinfo`. Kebijakan sudah sangat baik untuk scope `frontend/`.

### 4.3 Backend `.gitignore`
Mengabaikan `__pycache__/`, `.venv/`, `.vscode/`, `.env`, `uploads/`, `.coverage`, `dist/`, `.mypy_cache/`, `.pytest_cache/`, `.ruff_cache/`. Perlu ditambahkan perlindungan untuk `*.db` dan `wastelink.db`.

---

## 5. Indikasi Clutter, Duplikasi & Potensi Risiko Awal

1. **Root `node_modules/` (Clutter/Cache):**
   - Jalur: `node_modules/.vite/vitest/CACHEDIR.TAG` dan `da39a3ee.../results.json`.
   - Penyebab: Hasil sampingan eksekusi `vitest` di direktori root.
   - Status: Murni cache build/test yang dapat direproduksi dan tidak boleh berada di version control.
2. **Duplikasi Identik Foto Desain:**
   - Hash `E06A207B...`: `docs/Contoh_UI/17a7bf383a4720d49dbe2e130fcffed7.jpg` identik dengan `frontend/public/images/mosaic-1.jpg`.
   - Hash `259EB541...`: `docs/Contoh_UI/fa6001618646bf7247219a0b8f83fcab.jpg` identik dengan `frontend/public/images/mosaic-2.jpg`.
   - Analisis: File di `frontend/public/images/` adalah aset runtime aktif untuk Public Main Website (`mosaic-1.jpg`, `mosaic-2.jpg`). File di `docs/Contoh_UI/` adalah mockup desain referensi historis. Keduanya memiliki fungsi berbeda (runtime vs dokumentasi historis), sehingga keduanya dipertahankan (KEEP).
3. **Local Database Runtime (`backend/wastelink.db`):**
   - Ukuran: ~1.07 MB SQLite database.
   - Analisis: Berisi data seed demo untuk alur kerja operasional. Wajib dijaga (KEEP / DO NOT DELETE) dan dimasukkan ke aturan `.gitignore`.
4. **Dokumentasi Terstruktur (`PAKET_DOKUMEN_KEDAS_AI_WEB_INNOVATION` & `docs/`):**
   - Analisis: Berisi PRD, SRS, HDD, arsitektur, dan laporan implementasi. Merupakan source of knowledge berharga bagi tim dan wajib dipertahankan.

---
*Status Baseline: Siap melanjutkan ke pembuatan File Inventory CSV dan Kandidat Cleanup.*
