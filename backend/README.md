# WasteLink Bali — Backend Service Platform

Backend modular monolith untuk platform pengelolaan sampah berbasis komunitas dan ekonomi sirkular WasteLink Bali (Pilot Banjar/Desa di Bali).

- **Bahasa & Framework:** Python 3.11+ / FastAPI
- **Database & ORM:** PostgreSQL 16+ / SQLAlchemy 2.0 (Alembic Migrations)
- **Keamanan:** Opaque Server-Side Session Tokens (SHA-256), Verifikasi Hak Akses Multi-Role Server-Side, Proteksi IDOR Komprehensif, Sanitasi CSV Anti Formula Injection
- **Zona Waktu Operasional:** WITA (`Asia/Makassar`) / Internal UTC-aware
- **Mata Uang:** IDR (Integer / Decimal)

---

## 1. Struktur Modul & Arsitektur Direktori

```text
backend/
├── alembic/                      # Script migrasi basis data berurutan (0001 - 0004)
├── app/
│   ├── api/v1/                   # REST API Routers (/auth, /me, /pickup-requests, /admin, dll.)
│   ├── cli/                      # Command line tools (bootstrap_admin.py)
│   ├── common/                   # Reusable components (pagination, request_id, envelope)
│   ├── core/                     # Config, security, dependencies, storage adapter, errors
│   ├── db/                       # Base, session engine, audit log model
│   ├── modules/
│   │   ├── account/              # Identitas, registrasi, sesi, multi-role, suspensi
│   │   ├── taxonomy/             # Kategori sampah, panduan pemilahan, safety gating
│   │   ├── collection/           # Wilayah banjar, slot waktu, atomic pickup task claim
│   │   ├── inspection/           # QC kontaminasi, penolakan setoran
│   │   ├── weight/               # Penimbangan bruto/tara/bersih & riwayat koreksi
│   │   ├── points/               # Buku besar append-only WastePoints & evaluasi reward
│   │   ├── marketplace/          # Batching material sirkular, delivery, dispute
│   │   ├── funding/              # Program dana sponsor & batas kapasitas alokasi
│   │   ├── notification/         # Transactional Outbox pattern & retry worker
│   │   └── reporting/            # Metrik agregat (WITA), estimasi vs verified, CSV export
├── tests/
│   ├── api/                      # Integrasi modul & 5 End-to-End Acceptance Journeys
│   └── unit/                     # Unit test untuk config, error envelope, pagination
└── pyproject.toml                # Pinned dependencies & quality tooling configuration
```

---

## 2. Prasyarat & Instalasi Lingkungan

### A. Prasyarat
* Python 3.11 atau lebih tinggi
* PostgreSQL 16+ (atau Docker Compose untuk DB lokal)
* Git

### B. Pasang Dependencies
```bash
cd backend
python -m pip install -e ".[dev]"
```

### C. Konfigurasi Environment (`.env`)
Salin berkas template lingkungan:
```bash
cp .env.example .env
```
Contoh parameter kunci pada `.env`:
```ini
APP_ENV=local
DEBUG=true
DATABASE_URL=postgresql://wastelink:wastelink_secret@localhost:5432/wastelink_bali
SESSION_SECRET_KEY=change_this_to_a_secure_random_string_in_production_32_chars
STORAGE_ADAPTER=local
STORAGE_LOCAL_PATH=./uploads
```

---

## 3. Database Migrations & CLI Provisioning

### A. Jalankan Migrasi Basis Data
```bash
alembic upgrade head
```

### B. Bootstrap Akun Administrator Pertama
Sistem menyediakan CLI command mandiri untuk membuat akun administrator pertama:
```bash
python -m app.cli.bootstrap_admin --email admin@wastelink.bali.id --password "RahasiaSuper123!" --name "Administrator Utama"
```

---

## 4. Menjalankan Server Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* **Health Liveness:** `http://localhost:8000/api/v1/health/live`
* **Health Readiness:** `http://localhost:8000/api/v1/health/ready`
* **OpenAPI Docs (Swagger UI):** `http://localhost:8000/docs` (dinonaktifkan di production)

---

## 5. Pengujian & Quality Tooling

### A. Menjalankan Seluruh Test Suite & Coverage
```bash
# Jalankan seluruh test suite (46 unit, integration, & 5 E2E journeys)
pytest

# Jalankan pengujian beserta laporan cakupan kode (Target >= 85%)
pytest --cov=app --cov-report=term-missing
```
*Hasil aktual: **46 passed**, **90% code coverage**.*

### B. Pemeriksaan Kualitas Kode (Linting, Formatting & Type-Checking)
```bash
# Linting kode dengan Ruff
python -m ruff check backend

# Pemeriksaan format kode
python -m ruff format --check backend

# Static Type Checking dengan Mypy (Strict mode)
python -m mypy backend/app
```

---

## 6. End-to-End Acceptance Journeys (Verifikasi MVP)

Sistem telah dilengkapi dengan 5 skenario uji integrasi hulu-ke-hilir:
1. `tests/api/test_journey_1_happy_path.py`: Siklus lengkap rantai nilai sirkular (Registrasi -> Booking -> Klaim -> QC -> Timbang -> WastePoints -> Batching -> Mitra Pengolah).
2. `tests/api/test_journey_2_permissions_idor.py`: Verifikasi isolasi data warga (IDOR), pemisahan hak akses role, suspensi akun & pencabutan sesi seketika.
3. `tests/api/test_journey_3_concurrency_idempotency.py`: Uji kontensi kuota slot habis (409 Conflict), perebutan klaim tugas simultan dua petugas, pencegahan double-batching.
4. `tests/api/test_journey_4_safety_exceptions.py`: Safety gating kategori `SPECIAL` (B3 ditolak 422), penolakan kontaminasi QC, validasi unggahan file berbahaya, koreksi timbangan berprinsip append-only reversal, dispute selisih timbangan mitra.
5. `tests/api/test_journey_5_reporting_integrity.py`: Integritas pelaporan agregat (pemisahan estimasi vs verified weight), filter rentang waktu WITA, ekspor CSV dengan proteksi anti formula injection, transactional outbox notification retry worker.

---

## 7. Referensi Dokumen & ADR
* [API Reference](file:///docs/api/API_REFERENCE.md) — Kontrak lengkap seluruh REST endpoint `/api/v1`.
* [Architecture Decision Records (ADR Log)](file:///docs/adr/ADR_LOG.md) — Catatan keputusan arsitektur (ADR-001 s/d ADR-006).
* [Phase 4 Acceptance Report](file:///docs/implementation/phase-4-acceptance-report.md) — Matriks penelusuran kebutuhan & verifikasi rilis.
