# WasteLink Bali — Backend Service

Backend modular monolith untuk platform pengelolaan sampah berbasis komunitas dan ekonomi sirkular WasteLink Bali.

- **Bahasa / Framework:** Python 3.11+ / FastAPI
- **Database:** PostgreSQL (SQLAlchemy 2.0 ORM + Alembic migrations)
- **Zona Waktu:** WITA (`Asia/Makassar`) / Internal UTC-aware
- **Mata Uang:** IDR (Integer / Decimal)

---

## 1. Prasyarat

- Python 3.11+
- PostgreSQL 16+ (atau Docker Compose untuk DB lokal)
- Git

---

## 2. Pengaturan Lingkungan (Local Development)

### A. Salin File Konfigurasi
```bash
cp .env.example .env
```
> **PENTING:** Jangan pernah melakukan commit file `.env` yang berisi kredensial nyata ke repositori git.

### B. Pasang Dependencies
```bash
python -m pip install -e ".[dev]"
```

### C. Jalankan Database Lokal (Docker Compose)
```bash
docker compose up -d db
```

---

## 3. Database Migration (Alembic)

Jalankan migrasi pada database kosong:
```bash
alembic upgrade head
```

Rollback migrasi satu tahap:
```bash
alembic downgrade -1
```

Buat migrasi baru otomatis:
```bash
alembic revision --autogenerate -m "nama_migrasi"
```

---

## 4. Menjalankan Server Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Health Liveness:** `http://localhost:8000/api/v1/health/live`
- **Health Readiness:** `http://localhost:8000/api/v1/health/ready`
- **OpenAPI Swagger:** `http://localhost:8000/docs` (dinonaktifkan di production)

---

## 5. Menjalankan Pengujian (Testing)

Jalankan seluruh test suite:
```bash
pytest
```

Jalankan test dengan coverage report:
```bash
pytest --cov=app --cov-report=term-missing
```

---

## 6. Quality Checks (Linting & Type-Checking)

Format dan periksa linting:
```bash
ruff check .
ruff format --check .
```

Pemeriksaan tipe statis:
```bash
mypy app
```

---

## 7. Arsitektur & Kontrak Error

Semua response error mengikuti format standar:
```json
{
  "code": "VALIDATION_ERROR | FORBIDDEN | NOT_FOUND | CONFLICT | RATE_LIMIT_EXCEEDED | INTERNAL_ERROR",
  "message": "Deskripsi kesalahan yang aman untuk ditampilkan",
  "request_id": "c1f7b02c-4b53-48b2-b13e-...",
  "details": [
    {
      "field": "category_id",
      "message": "Field required",
      "code": "missing"
    }
  ]
}
```
Stack trace internal dan error SQL tidak pernah diekspos ke client.
