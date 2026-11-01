# 03. Tinjauan Keamanan Sistem (Security Review) — WasteLink Bali

**Tanggal**: 30 Oktober 2026  
**Auditor**: Application Security Engineer & Software Architect  
**Cakupan**: Evaluasi OWASP Top 10, Otorisasi & Batas Peran, Keamanan File & Upload, Manajemen Kredensial, dan Sanitasi Kueri.

---

## 1. Evaluasi OWASP Top 10 untuk WasteLink Bali

| OWASP Category | Evaluasi Sistem WasteLink Bali | Status | Bukti Pengujian |
|---|---|---|---|
| **A01: Broken Access Control** | Penerapan dependensi `require_roles`, isolasi kepemilikan data (`user_id == current_user.id`), serta pencegahan IDOR pada rute alamat, permintaan jemput, dan tugas petugas. | **PROTECTED** | `test_idor_addresses_and_pickups.py`, `test_rbac_and_roles.py`, `test_journey_2_permissions_idor.py` |
| **A02: Cryptographic Failures** | Menggunakan Argon2 / PBKDF2 via `passlib` untuk hashing kata sandi. Validasi panjang minimal secret key (>= 32 karakter). Header HSTS aktif. | **PROTECTED** | `test_config.py` (`test_session_secret_key_too_short`), `test_middleware.py` |
| **A03: Injection (SQL/Command)** | 100% kueri database menggunakan SQLAlchemy 2.0 ORM dengan parameter binding terotomatisasi. Tidak ada raw string concatenation kueri SQL. | **PROTECTED** | Seluruh test suite DB, parameterized Alembic migrations |
| **A04: Insecure Design** | State machine divalidasi ketat di lapisan domain service (mencegah lompatan status acak); model transaksi debit/kredit saldo bank sampah menggunakan immutable ledger ganda. | **PROTECTED** | `test_phase3_petugas_dispatch.py`, `test_points_and_ledger.py` |
| **A05: Security Misconfiguration** | Header keamanan bawaan di middleware FastAPI (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`). Endpoint error tidak membocorkan stack trace internal ke client publik. | **PROTECTED** | `test_middleware.py`, `test_errors.py` (`test_unexpected_error_does_not_leak_details`) |
| **A06: Vulnerable & Outdated Components** | Menggunakan Python 3.13, FastAPI modern, Next.js 15.1.7, React 19, Vitest, dan dependensi terisolasi bebas dari advisory kritis. | **PROTECTED** | `pyproject.toml`, `package.json`, automated build pass |
| **A07: Identification & Authentication Failures** | Proteksi serangan brute-force via penolakan seragam tanpa enumerasi akun ("Invalid credentials" untuk email ada maupun tidak ada). Token sesi tervalidasi masa berlaku dan status aktif pengguna. | **PROTECTED** | `test_auth_phase2.py` (`test_invalid_credentials_prevent_account_enumeration`, `test_suspended_user_blocked`) |
| **A08: Software and Data Integrity Failures** | Idempotency key diimplementasikan pada seluruh operasi mutasi krusial (booking setoran, klaim tugas, penerimaan fasilitas, transaksi bank sampah) mencegah pemrosesan ulang/replay. | **PROTECTED** | `test_collection_concurrency.py`, `test_journey_3_concurrency_idempotency.py` |
| **A09: Security Logging and Monitoring Failures** | Tabel `audit_logs` merekam aktor, aksi, entity_id, payload lama, payload baru, IP, dan timestamp untuk setiap tindakan administratif atau perubahan status timbangan. | **PROTECTED** | `test_journey_5_reporting_integrity.py`, `test_phase3_petugas_dispatch.py` |
| **A10: Server-Side Request Forgery (SSRF)** | Tidak ada fungsionalitas fetch URL acak dari pengguna eksternal. Seluruh komunikasi webhook atau integrasi menggunakan whitelist internal. | **PROTECTED** | Architecture boundary review |

---

## 2. Audit Otorisasi & Batas Peran (RBAC & Multi-Tenancy)

Sistem mengadopsi 8 peran eksplisit:
1. `USER` (Warga/Rumah Tangga)
2. `COLLECTOR` (Petugas Lapangan/Pengangkut)
3. `DISPATCHER` / `SUPERVISOR` (Pengatur Tugas & Rute)
4. `FACILITY_OPERATOR` (Operator TPS3R/TPST)
5. `WASTE_BANK_STAFF` (Petugas Bank Sampah)
6. `PARTNER` (Mitra Pembeli Material / Pengolah Organik)
7. `COMMUNITY_LEADER` (Kelian Banjar / Kepala Desa)
8. `ADMIN` (Super Administrator Sistem)

### Mekanisme Pengamanan:
- **Prinsip *Least Privilege***: Pengguna dengan peran `USER` secara otomatis diblokir saat mencoba mengakses rute petugas (`/api/v1/dispatch/*`) atau rute fasilitas (`/api/v1/facility/*`) dengan respon HTTP `403 Forbidden`.
- **Anti-IDOR (Insecure Direct Object Reference)**:
  - Warga A tidak dapat melihat, mengubah, atau membatalkan penjemputan milik Warga B (`test_idor_addresses_and_pickups.py`).
  - Alamat penjemputan diverifikasi kepemilikannya sebelum dikaitkan dengan tiket penjemputan baru.
- **Tenant Isolation**:
  - Fasilitas A tidak dapat mengonfirmasi atau memodifikasi batch penerimaan milik Fasilitas B.
  - Prajuru Banjar hanya dapat mengakses dashboard analitik agregat pada lingkup wilayah teritorial banjar mereka sendiri (`banjar_id`).

---

## 3. Keamanan File Upload & Penyimpanan Bukti (Evidence Storage)

Modul pengunggahan foto bukti (bukti sampah, bukti timbangan, bukti sengketa, dan manifes limbah khusus) diuji secara ketat dalam `test_evidence_storage.py`:
- **Validasi MIME Type**: Hanya menerima tipe konten aman (`image/jpeg`, `image/png`, `application/pdf`). Format yang berpotensi mengeksekusi script (`text/html`, `application/javascript`, `.exe`, `.bat`) langsung ditolak dengan kode `400 Bad Request`.
- **Pencegahan Path Traversal**: Nama file diacak menggunakan UUIDv4 dan ekstensi yang dinormalisasi, mencegah manipulasi karakter `../` atau `..\\` untuk menimpa file sistem operasi.
- **Batasan Ukuran**: File dibatasi maksimal 5 MB per payload unggahan.

---

## 4. Manajemen Rahasia, Kredensial, dan Variabel Lingkungan

- **Secret Scanning**: Tidak ditemukan kredensial produksi, private key API eksternal, atau token live yang ter-commit ke dalam repositori.
- **Konfigurasi `.env.example`**: Menggunakan placeholder aman (`change-me-in-production-min-32-chars-key`).
- **Enforcement Panjang Kunci**: Di level startup aplikasi (`backend/app/core/config.py`), sistem memvalidasi bahwa `SECRET_KEY` memiliki panjang minimal 32 karakter. Jika kurang, sistem menolak proses boot untuk mencegah enkripsi token lemah.

---

## 5. Rekomendasi Hardening untuk Production Deployment

1. **Reverse Proxy & TLS**: Wajib mengaktifkan TLS 1.3 pada reverse proxy (Caddy / Nginx / Cloudflare) dengan cipher suite modern dan sertifikat terkelola otomatis.
2. **Cookie Flags**: Jika berpindah ke model session cookie untuk web, gunakan atribut `HttpOnly`, `Secure`, dan `SameSite=Strict`.
3. **Penyimpanan Objek Produksi**: Ganti penyimpanan file lokal (`uploads/`) dengan bucket Amazon S3 atau Google Cloud Storage dengan akses pre-signed URL terbatas waktu (maksimal 15 menit per URL bukti).
4. **Rate Limiting**: Pasang Redis-backed sliding window rate limiter di depan endpoint `/auth/login` (5 req/menit) dan `/auth/register` (3 req/menit) untuk mencegah credential stuffing.
