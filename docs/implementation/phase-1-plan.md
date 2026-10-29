# WasteLink Bali — Phase 1 Implementation Plan
## Fondasi Backend, Konfigurasi, Database, dan Quality Tooling

> **Dokumen acuan:** PRD, HRD, SDD, SRS WasteLink Bali  
> **Status:** Executing  
> **Author:** Senior Backend & QA Engineer  
> **Target:** Backend foundation bootable, testable, fully verified with quality gates.

---

## 1. Temuan Audit Repository

1. **Struktur repositori awal:**
   - Direktori `docs/` berisi 6 dokumen: `PRD_WasteLink_Bali.md`, `HRD_WasteLink_Bali.md`, `SDD_WasteLink_Bali.md`, `SRS_WasteLink_Bali.md`, `designweb.md`, dan `designapps.md`.
   - Repositori belum memiliki implementasi backend, environment setup, database tooling, atau test runner.
2. **Kesesuaian Spesifikasi:**
   - Arsitektur: Modular monolith menggunakan **FastAPI** + **SQLAlchemy 2** + **Alembic** + **PostgreSQL** + **Pydantic v2**.
   - API versioning prefix: `/api/v1`.
   - Logging terstruktur (JSON di staging/prod, readable di local), tanpa data sensitif.
   - Standardized Error Contract: `code`, `message`, `request_id`, dan `details`.
   - Timezone kanonis: UTC-aware di database, interpretasi operasional WITA (`Asia/Makassar`).
3. **Penyelarasan Dependency:**
   - Python runtime: >=3.11 (saat ini lingkungan runtime Python 3.13.5).
   - Database driver: `psycopg2-binary` (PostgreSQL) + fallback `sqlite3` memory/file test isolation untuk runner tanpa PostgreSQL container lokal.

---

## 2. Struktur Modul Backend

```
backend/
├── app/
│   ├── main.py                     # FastAPI application factory, middleware, lifespan
│   ├── api/
│   │   └── v1/
│   │       ├── router.py           # Master v1 router aggregating domain routers
│   │       └── health.py           # /health/live and /health/ready endpoints
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings, validated env config
│   │   ├── logging.py              # Structured logging and sensitive field filter
│   │   ├── errors.py               # Standardized error classes & exception handlers
│   │   └── security.py             # Security headers, token generators, CSRF primitives
│   ├── db/
│   │   ├── session.py              # Engine, sessionmaker, pool settings, Base metadata
│   │   └── base.py                 # Central import of all SQLAlchemy models for Alembic
│   ├── common/
│   │   ├── pagination.py           # Standardized pagination models & max limit guard
│   │   └── request_id.py           # Correlation ID middleware (X-Request-ID)
│   └── modules/                    # Domain packages (account, collection, taxonomy, etc.)
├── alembic/
│   ├── env.py                      # Migration environment using app config & metadata
│   ├── script.py.mako              # Template for new migration scripts
│   └── versions/                   # Migration history
├── tests/
│   ├── conftest.py                 # Pytest fixtures, test database setup, test client
│   ├── unit/
│   │   ├── test_config.py          # Settings validation & secret constraints
│   │   ├── test_errors.py          # Error contracts & redaction
│   │   └── test_pagination.py      # Pagination parameters & limit enforcement
│   └── api/
│       ├── test_health.py          # /health/live and /health/ready probes
│       ├── test_middleware.py      # Request ID & security headers
│       └── test_db_migration.py    # Database connection & migration verification
├── pyproject.toml                  # Project metadata, dependencies, ruff, mypy, pytest
├── alembic.ini                     # Alembic configuration file
├── compose.yaml                    # Docker Compose for local PostgreSQL development
├── Dockerfile                      # Production/dev container definition
├── .env.example                    # Template with safe non-secret placeholders
└── README.md                       # Comprehensive setup, run, test, and migration guide
```

---

## 3. Asumsi dan Keputusan Desain (ADR)

1. **ADR-001 (Modular Monolith):** Seluruh domain dipisahkan sebagai Python packages di `app/modules/`, berbagi koneksi PostgreSQL tunggal, mencegah overhead microservices.
2. **ADR-002 (Error Contract):** Seluruh HTTP error response menghasilkan format seragam `{ "code": ..., "message": ..., "request_id": ..., "details": [...] }` dan traceback server internal tidak pernah bocor ke client.
3. **ADR-003 (Database Isolation):** Test suite menggunakan database test terisolasi atau SQLite in-memory / mock engine bila PostgreSQL lokal tidak aktif di environment runner, tanpa merusak database dev/prod.
4. **ADR-004 (Liveness vs Readiness):**
   - `/health/live`: Mengembalikan 200 OK selama proses Python/FastAPI berjalan.
   - `/health/ready`: Menjalankan query `SELECT 1` ke database. Jika gagal, mengembalikan HTTP 503 dengan rincian status terdegradasi.

---

## 4. Acceptance Criteria Tahap 1

- [x] Backend bootable secara lokal melalui command standar.
- [x] `/api/v1/health/live` mengembalikan status OK proses tanpa dependensi eksternal.
- [x] `/api/v1/health/ready` mengembalikan 200 saat DB sehat dan 503 saat DB tidak terhubung.
- [x] Alembic dan SQLAlchemy 2 disiapkan dengan konvensi penamaan constraint standar.
- [x] Response error seragam dan tidak mengekspos stack trace atau path sistem.
- [x] Request ID middleware bekerja dan memvalidasi `X-Request-ID`.
- [x] Konfigurasi environment divalidasi via Pydantic Settings tanpa secret hardcoded.
- [x] Unit dan API test suite berjalan hijau di local runner.
- [x] Linting (ruff) dan type checking (mypy) tervalidasi.
