# Kedas AI & Backend — As-Built Baseline & Technical Reconciliation

**Tanggal Verifikasi:** 30 Oktober 2026  
**Status Baseline:** Terverifikasi 100% dari Kode Nyata (Source Code as Truth)  
**Lingkungan:** Python 3.13.5 · FastAPI 0.115+ · SQLAlchemy 2.0.30+ · Node.js v20+ / Next.js 15.5.28  

---

## 1. Rekonsiliasi Metrik Baseline (Audited vs Actual Truth)

Tabel berikut merekonsiliasi perbedaan klaim angka antara dokumen lama, laporan audit 30 Oktober 2026, dan **hasil verifikasi aktual repositori**:

| Dimensi Arsitektur | Klaim Dokumen Lama (Legacy PRD) | Klaim Laporan Audit (30 Okt 2026) | Hasil Verifikasi Repositori Aktual | Keterangan & Analisis Rekonsiliasi |
|---|---|---|---|---|
| **Tabel ORM (SQLAlchemy)** | 19 entitas konseptual | 44 tabel | **48 tabel terdaftar** | `Base.metadata.tables` mendaftarkan 48 tabel lengkap, mencakup tabel B2B, CDOA, log AI, dan transactional outbox. |
| **Migrasi Database (Alembic)** | 3–6 revisi | 10 revisi | **10 revisi (`0001` - `0010`)** | Terverifikasi utuh dari `0001_baseline_audit_log` hingga `0010_ai_knowledge_and_interactions`. Head tunggal aktif. |
| **Endpoint REST API** | 48 endpoint | 116 endpoint | **130 endpoint OpenAPI** (135 internal routes) | OpenAPI mengekspor 130 operasi RESTful ber-tag, termasuk AI innovation (`/ai/*`), CDOA, B2B, dan supervisi admin. |
| **Rute Frontend (Next.js)** | ~20 halaman | 38 rute | **45 rute statis/dinamis** | Next.js production build mengompilasi 45 rute lengkap (termasuk halaman publik `/tanya`, portal hospitality, dan konsol admin). |
| **Automated Tests** | 185 tes | 203 tes | **213 tes lulus 100%** | **87 tes backend** (pytest) + **126 tes frontend** (vitest) = 213 tes otomatis hijau tanpa regresi. |

---

## 2. Struktur Repositori & Paket

- **Monorepo Structure:**
  - `backend/`: FastAPI modular monolith (clean architecture dengan pemisahan `app/api`, `app/core`, `app/db`, dan `app/modules/*`).
  - `frontend/`: Next.js App Router dengan Tailwind CSS, token visual terpusat, dan typed API client.
  - `docs/`: Dokumentasi blueprint AI backend, audit, PRD, SRS, HDD, dan laporan pengujian.
- **Ketergantungan Backend Utama (`pyproject.toml`):**
  - Web framework: `fastapi>=0.115.0`, `uvicorn[standard]>=0.30.0`
  - ORM & Migrasi: `sqlalchemy[asyncio]>=2.0.30`, `alembic>=1.13.0`, `psycopg2-binary>=2.9.9`
  - Validasi & Settings: `pydantic>=2.7.0`, `pydantic-settings>=2.3.0`
  - Keamanan & Auth: `argon2-cffi>=23.1.0`, `python-multipart>=0.0.9`, `email-validator>=2.0.0`
  - HTTP & Testing: `httpx>=0.27.0`, `pytest>=8.2.0`, `pytest-asyncio>=0.23.0`, `pytest-cov>=5.0.0`
  - Linter & Typecheck: `ruff>=0.5.0`, `mypy>=1.10.0`

---

## 3. Modul Backend Eksisting (`backend/app/modules/`)

1. **`account`:** Manajemen pengguna, sesi auth berbasis cookie, registrasi warga, profil alamat, verifikasi KYC petugas, dan RBAC.
2. **`taxonomy`:** Master kategori sampah (Organik, Daur Ulang, Residu, Khusus/B3) dan aturan penerimaan material kawasan.
3. **`collection`:** Permintaan setoran sampah (`PickupRequest`), slot waktu penjemputan (`CollectionSlot`), area layanan (`ServiceArea`), dan idempotency key.
4. **`inspection`:** Inspeksi mutu oleh petugas lapangan, tingkat kontaminasi (`CLEAN`, `MINOR`, `DEGRADED`, `REJECTED`), dan audit trail.
5. **`weight`:** Pencatatan timbangan digital, perhitungan tara-bruto-netto, dan verifikasi timbangan lapangan.
6. **`points`:** Ledger WastePoints berbasis double-entry, aturan reward per kategori, dan mutasi saldo warga.
7. **`facility`:** Penerimaan fasilitas TPS3R, pergerakan stok material, dan integrasi rekening bank sampah banjar.
8. **`marketplace`:** Batching material terpilah, penawaran ke industri daur ulang, modul B2B Green Hospitality, dan pengomposan organik.
9. **`community`:** Profil banjar adat, kesepakatan CDOA (Pergub Bali No. 47/2019), pengaduan warga, gotong royong, dan manifest limbah B3.
10. **`funding`:** Program pendanaan sirkular, sponsor program, dan alokasi budget reward WastePoints.
11. **`notification`:** Notifikasi pengguna dan pola Transactional Outbox untuk reliabilitas pengiriman pesan.
12. **`evidence`:** Manajemen berkas bukti fisik (foto timbangan, bukti pemilahan) dengan metadata checksum dan tipe entitas.
13. **`reporting`:** Rekapitulasi metrik operasional, ringkasan tonase, dan ekspor CSV untuk koordinator banjar.
14. **`ai`:** Fondasi modul AI: adapter provider netral (`AIProviderAdapter`), EcoGuide RAG, analisis material Vision, dan Operations Copilot.

---

## 4. Status Ekosistem AI Eksisting

- **Provider Neutral Adapter (`AIProviderAdapter`):**
  - Terintegrasi di [`backend/app/modules/ai/adapter.py`](file:///c:/Users/gresn/Documents/Kumpulan%20Project%20Seru/HackAthon-Bali/backend/app/modules/ai/adapter.py).
  - Mendukung Google Gemini (`gemini-2.0-flash`), OpenAI (`gpt-4o-mini`), dan fallback deterministik lokal berlatensi rendah untuk pengujian offline dan keandalan demo kompetisi.
- **EcoGuide RAG Service:**
  - Terintegrasi di [`backend/app/modules/ai/service.py`](file:///c:/Users/gresn/Documents/Kumpulan%20Project%20Seru/HackAthon-Bali/backend/app/modules/ai/service.py) dan diuji di [`backend/tests/api/test_ai_foundation_and_ecoguide.py`](file:///c:/Users/gresn/Documents/Kumpulan%20Project%20Seru/HackAthon-Bali/backend/tests/api/test_ai_foundation_and_ecoguide.py).
  - Mendukung klasifikasi intent, deteksi injeksi prompt, scoping destinasi, sitasi dokumen SOP, dan status jawaban (`ANSWERED`, `PARTIAL`, `ABSTAINED`).
- **Vision Material Pipeline:**
  - Menerima foto material, mengekstrak kandidat kategori dari taksonomi aktif, menetapkan confidence band, dan menandai `human_review_required`.
- **Operations Copilot & ActionProposal Lifecycle:**
  - Endpoint `/api/v1/ai/copilot` dan `/api/v1/ai/copilot/execute` mendukung proposal tindakan terstruktur (`DRAFT` -> `APPROVED` -> `EXECUTED`) dengan verifikasi permission dan domain service transaction.

---

## 5. Ringkasan Kepatuhan & Quality Gate Phase 1

- [x] Baseline tes berjalan dan tercatat: **87 backend + 126 frontend = 213 passing tests**.
- [x] Inventarisasi OpenAPI & 48 tabel ORM berhasil diekspor.
- [x] Perbedaan data historis berhasil direkonsiliasi secara transparan.
- [x] Tidak ada perubahan kode destruktif pada backend domain service.
