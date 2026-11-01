# WasteLink Bali — Inventarisasi Sistem Lengkap (System Inventory)
**Versi Dokumen:** 1.0  
**Tanggal Audit:** 30 Oktober 2026  
**Auditor:** Principal Software Engineer & Autonomous QA Auditor  
**Status Git:** Branch `master`, Commit `84789d6`, Working Tree Bersih  

---

## 1. Peta Repositori & Aplikasi

WasteLink Bali mengusung arsitektur **Modular Monolith Terintegrasi** yang memisahkan boundary aplikasi berdasarkan peruntukan pengguna namun berbagi kontrak domain data yang konsisten:

| Komponen Aplikasi | Lokasi Direktori | Framework & Runtime | Peran & Tanggung Jawab Utama |
|---|---|---|---|
| **Backend REST API** | `backend/` | Python 3.11+, FastAPI v0.115, SQLAlchemy v2.0, Alembic v1.13, Pydantic v2.7, Argon2id | Sumber kebenaran domain (*single source of truth*), otorisasi RBAC/ABAC teritorial, ledger WastePoints append-only, kontrol persediaan fisik (*mass balance*), dan integrasi 12 peran. |
| **Frontend Web Portal** | `frontend/` | Next.js 15.1.7 (App Router), React 19, TypeScript v5.7, Tailwind CSS v3.4, Vitest v3.0 | Portal terintegrasi untuk Warga (`/app`), Petugas Kebersihan (`/staff`), dan Manajemen Fasilitas/Admin (`/admin`). Menghasilkan 37 rute statis teroptimasi. |
| **Mobile Warga App** | `mobile/` | Expo v58.0, React Native v0.88, React 19.3, TypeScript v7.0, Vitest v5.0 | Aplikasi mobile khusus warga (percontohan Banjar Sukawati & Sanur Kauh) untuk setoran mandiri, permintaan pickup trike, pemantauan status luring/daring (*offline-ready*), dan tracking poin. |
| **Dokumentasi & Arsitektur** | `docs/` & root | Markdown, Mermaid | Spesifikasi sistem lengkap (PRD, HRD, SRS, SDD, perancangan lanjutan, ADR, dan PILOT_RUNBOOK.md). |

---

## 2. Inventarisasi Modul Domain (12 Kelompok Ekosistem G1–G12)

| Kode | Domain Ekosistem | Modul Backend (`backend/app/modules/`) | Endpoint API Terkait (`backend/app/api/v1/`) | Antarmuka Frontend / Mobile |
|---|---|---|---|---|
| **G1** | **Warga / Rumah Tangga** | `account/`, `collection/`, `points/`, `taxonomy/` | `/auth/*`, `/me/*`, `/pickup-requests/*`, `/points/balance` | Frontend: `/app`, `/app/setoran/*`<br>Mobile: `HomeScreen`, `NewDepositScreen`, `ActivityScreen`, `PointsScreen` |
| **G2** | **Petugas Pengangkut** | `collection/`, `inspection/`, `weight/`, `evidence/` | `/collector/tasks/*`, `/pickup-requests/{id}/inspections`, `/pickup-requests/{id}/weights`, `/evidence/upload` | Frontend: `/staff`, `/staff/tugas/*`, `/staff/riwayat` |
| **G3** | **Supervisor / Dispatcher** | `collection/`, `account/` | `/admin/pickups/{id}/reassign`, `/service-areas/*` | Frontend: `/admin/area-jadwal`, `/admin/permintaan` |
| **G4** | **Operator TPS3R** | `facility/` | `/facilities`, `/facilities/receipts`, `/facilities/sorting`, `/facilities/{id}/stock` | Frontend: `/admin/fasilitas`, `/admin/stok` |
| **G5** | **Operator TPST** | `facility/`, `marketplace/` | `/facilities`, `/admin/batches`, `/admin/deliveries` | Frontend: `/admin/fasilitas`, `/admin/mitra` |
| **G6** | **Bank Sampah Banjar** | `facility/` | `/facilities/waste-bank/members`, `/facilities/waste-bank/deposit`, `/facilities/waste-bank/withdraw` | Frontend: `/admin/bank-sampah` |
| **G7** | **Mitra Daur Ulang / Pengepul** | `marketplace/` | `/admin/partners`, `/admin/deliveries/{id}/receipt`, `/admin/deliveries/{id}/confirm-processing` | Frontend: `/admin/mitra` |
| **G8** | **Pelaku Usaha (B2B)** | `marketplace/` | `/b2b/organizations`, `/b2b/locations`, `/b2b/pickups`, `/b2b/organizations/{id}/report` | Frontend: `/admin/b2b` |
| **G9** | **Pengolah Organik (BSF & Kompos)** | `marketplace/` | `/organic/processing/start`, `/organic/processing/{id}/complete` | Frontend: `/admin/organik` |
| **G10** | **Komunitas / Relawan Pantai** | `community/` | `/community/events`, `/community/cleanups/*` | Frontend: `/admin/komunitas` |
| **G11** | **Pengendali Limbah B3 / Khusus** | `community/`, `taxonomy/` | `/community/hazardous-manifests/*` | Frontend: `/admin/limbah-b3` |
| **G12** | **Admin / CSR / Program Manager** | `funding/`, `reporting/`, `account/` | `/programs/*`, `/admin/points/rules`, `/admin/dashboard`, `/admin/audit-logs` | Frontend: `/admin`, `/admin/pendanaan`, `/admin/laporan`, `/admin/audit-log` |

---

## 3. Database & Migrasi Skema (Alembic)

Skema database PostgreSQL dikelola secara append-only dan teruji *up/down* melalui 8 berkas migrasi:
1. `0001_baseline_audit_log.py`: Fondasi tabel `audit_logs` untuk ketertelusuran seluruh mutasi sensitif.
2. `0002_identity_taxonomy_collection.py`: Entitas pengguna, peran, sesi autentikasi, kategori sampah, wilayah layanan, slot jadwal, dan permintaan penjemputan warga.
3. `0003_inspection_weight_points_marketplace.py`: Entitas QC inspeksi, timbangan terverifikasi multi-versi, buku besar poin (ledger), mitra pembeli, batch material, dan pengiriman.
4. `0004_notification_outbox.py`: Notifikasi pengguna dan pola transaksi outbox.
5. `0005_pickup_idempotency_and_service_mode.py`: Idempotency keys untuk penjemputan warga dan dukungan mode layanan setor mandiri (`DROP_OFF`).
6. `0006_facility_receipts_stock_and_waste_bank.py`: Entitas fasilitas TPS3R/TPST, tanda terima jembatan timbang, mutasi stok fisik, rekening nasabah bank sampah, dan mutasi saldo tabungan IDR.
7. `0007_partner_marketplace_b2b_and_organic.py`: Verifikasi mitra daur ulang, penawaran material, biokonversi maggot BSF & komposting organik, profil pelaku usaha B2B komersial multi-tenant.
8. `0008_community_programs_funding_and_special_features.py`: Profil banjar adat, penugasan prajuru, gotong royong, aduan masyarakat, aksi bersih pantai komunitas, manifest limbah B3 berizin KLHK, program pendanaan CSR.

---

## 4. Daftar Perintah Pengujian & Verifikasi Kualitas

| Kategori Pengujian | Perintah Eksekusi | Lingkungan / Dependensi |
|---|---|---|
| **Backend Lint** | `cd backend; ruff check .` | Python 3.11+, Ruff v0.5 |
| **Backend Static Typecheck** | `cd backend; mypy app` | Python 3.11+, Mypy v1.10 (Strict) |
| **Backend Full Test Suite** | `cd backend; pytest -v` | Pytest v9.1, AnyIO, AsyncIO, Pytest-Cov |
| **Backend Migration Test** | `cd backend; pytest tests/api/test_db_migration.py` | Alembic v1.13 (Test DB in-memory) |
| **Frontend Lint** | `npm --prefix frontend run lint` | Next.js ESLint Plugin |
| **Frontend Typecheck** | `npm --prefix frontend run typecheck` | TypeScript v5.7 (`tsc --noEmit`) |
| **Frontend Unit & Component** | `npm --prefix frontend test -- --run` | Vitest v3.2, Testing Library |
| **Frontend Production Build** | `npm --prefix frontend run build` | Next.js 15.1.7 App Router |
| **Mobile Typecheck** | `npm --prefix mobile run typecheck` | TypeScript v7.0 (`tsc --noEmit`) |
| **Mobile Unit Test** | `npm --prefix mobile test -- --run` | Vitest v5.0 |

---

## 5. Batasan Lingkungan Audit
- Tidak ada koneksi aktif ke basis data produksi atau eksternal; seluruh pengujian backend dijalankan pada SQLite in-memory / test harness PostgreSQL terisolasi.
- Seluruh pengujian frontend dan mobile dijalankan secara headless di lingkungan lokal Windows PowerShell tanpa membuka browser grafis atau emulator perangkat fisik.
