# KEBIJAKAN MANAJEMEN GENERATED FILES & .GITIGNORE
**Dokumen:** `03_GITIGNORE_POLICY.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Waktu Audit:** 1 November 2026, 02:21:50+08:00  
**Status:** TAHAP 3 COMPLETE (Kebijakan Terpasang & Tervalidasi)

---

## 1. Tujuan Kebijakan

Menjaga agar seluruh lingkungan kerja monorepo Kedas:
1. Tidak memasukkan folder dependensi (`node_modules/`) atau build cache ke Git.
2. Tidak mengekspos variabel lingkungan rahasia (`.env`, `*.env`).
3. Tidak melakukan commit terhadap basis data lokal SQLite (`*.db`, `*.sqlite`, `*.sqlite3`).
4. Memastikan kode sumber, migrasi basis data, pengujian, aset desain, dan dokumentasi tetap terlacak secara presisi.

---

## 2. Struktur Kebijakan .gitignore Monorepo

### 2.1 Root `.gitignore` (Kebijakan Terpadu)
```gitignore
# Environment variables & secrets
.env
*.env
!.env.example

# Dependencies
node_modules/

# Python
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.coverage
htmlcov/
.mypy_cache/
.ruff_cache/

# Local database files (SQLite/runtime)
*.db
*.sqlite
*.sqlite3

# Build output
.next/
dist/
build/

# Uploads
uploads/

# OS
.DS_Store
Thumbs.db
```

### 2.2 Frontend `.gitignore` (`frontend/.gitignore`)
- Mengabaikan dependensi lokal `/node_modules`, `/.pnp`.
- Mengabaikan output kompilasi `/.next/`, `/out/`, `/build`, `/coverage`.
- Mengabaikan file debug `npm-debug.log*`, `yarn-error.log*`.
- Mengabaikan variabel lokal `.env*.local`.

### 2.3 Backend `.gitignore` (`backend/.gitignore`)
- Mengabaikan bytecode `__pycache__/`, `*.py[cod]`.
- Mengabaikan virtual environments `.venv/`, `venv/`, `env/`.
- Mengabaikan direktori upload lokal `uploads/`.
- Mengabaikan cache testing & linting `.coverage`, `htmlcov/`, `.mypy_cache/`, `.pytest_cache/`, `.ruff_cache/`.

---

## 3. Uji Verifikasi Kebijakan Git

Perintah verifikasi:
```bash
git check-ignore node_modules
git check-ignore backend/wastelink.db
git check-ignore .coverage
```
**Hasil Verifikasi:**
- `node_modules` -> Ter-ignore dengan tepat.
- `backend/wastelink.db` -> Ter-ignore dengan tepat (tidak lagi muncul sebagai untracked file).
- `.coverage` -> Ter-ignore dengan tepat.

---
*Kesimpulan: Kebijakan gitignore baru berhasil mengamankan repositori dari commit artefak yang tidak diinginkan.*
