# 06. Tinjauan Keamanan & Penegakan Otorisasi Sistem — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Application Security Engineer  
**Status**: 100% Passed (Zero Critical Vulnerabilities)

---

## 1. Evaluasi 10 Skenario Keamanan (Security Acceptance Scenarios)

| No | Skenario Uji Keamanan | Respon Sistem Kedas | Status | Bukti Pengujian |
|---|---|---|---|---|
| 1 | Pengguna mencoba mendaftar sebagai `ADMIN` melalui manipulasi payload `POST /auth/register` | Ditolak; server mengabaikan role eksternal dan hanya menetapkan role `USER` | **PROTECTED** | `tests/api/test_rbac_and_roles.py` |
| 2 | Pengguna A meminta data alamat atau penjemputan Pengguna B via ID (`/me/addresses/{id}`) | Ditolak dengan status HTTP 404/403 (Anti-IDOR) | **PROTECTED** | `tests/api/test_idor_addresses_and_pickups.py` |
| 3 | Petugas yang permohonannya masih `PENDING` mencoba mengklaim tugas penjemputan | Ditolak dengan status HTTP 403 Forbidden | **PROTECTED** | `tests/api/test_phase3_petugas_dispatch.py` |
| 4 | Petugas yang akunnya di-`SUSPEND` mencoba memperbarui status tugas | Ditolak langsung di layer otentikasi sesi | **PROTECTED** | `tests/api/test_auth_phase2.py` |
| 5 | Operator Fasilitas A membaca atau mengubah stok Fasilitas B | Ditolak; kueri dibatasi oleh `facility_id` kepemilikan | **PROTECTED** | `tests/api/test_phase4_facility_and_waste_bank.py` |
| 6 | Mitra / Buyer mencoba mengubah harga penawaran batch di luar masa berlaku | Ditolak; validasi alokasi dan status batch aktif | **PROTECTED** | `tests/api/test_phase5_marketplace_organic_and_b2b.py` |
| 7 | Sponsor / Viewer luar mencoba membaca kontak telepon dan data pribadi warga | Ditolak; dasbor komunitas hanya menyediakan metrik agregat | **PROTECTED** | `tests/api/test_phase6_community_funding_and_special_features.py` |
| 8 | Upaya pengiriman transaksi ganda pada penjemputan atau reward poin | Ditolak dengan respon idempotensi yang tersimpan | **PROTECTED** | `tests/api/test_journey_3_concurrency_idempotency.py` |
| 9 | Unggah file bukti dengan ekstensi berbahaya (`.exe`, `.bat`, `.html`) | Ditolak dengan status HTTP 400 Bad Request; hanya menerima format citra sah | **PROTECTED** | `tests/api/test_evidence_storage.py` |
| 10| Akses rute admin tanpa Bearer token admin yang sah | Ditolak dengan HTTP 401 Unauthorized / 403 Forbidden | **PROTECTED** | `tests/api/test_journey_2_permissions_idor.py` |

---

## 2. Analisis Kredensial, Rahasia, dan Session Lifecycle
- Tidak ada hardcoded credentials di dalam repositori source code.
- File `.env.example` menggunakan placeholder standar aman.
- Session cookie dikonfigurasi dengan flag `HttpOnly`, `SameSite=Lax/Strict`, dan `Secure` pada mode produksi.
- Token hash disimpan menggunakan SHA-256 pada tabel server-side `auth_sessions`.
