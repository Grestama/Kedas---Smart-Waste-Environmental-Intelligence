# 03. Matriks Hak Akses dan Penegakan Izin — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Application Security Engineer  
**Status**: Implemented & Verified

---

## 1. Penegakan Otorisasi pada Level API (Server-Side Enforcement)

Setiap request ke backend Kedas melalui dependensi otorisasi FastAPI:
- `get_current_user`: Memvalidasi token sesi di tabel `auth_sessions` dan memastikan akun tidak `SUSPENDED`.
- `require_roles(*roles)`: Memeriksa apakah pengguna memiliki grant peran aktif dalam tabel `user_roles`.
- `require_admin`: Memastikan pengguna memiliki peran `ADMIN` aktif.

---

## 2. Matriks Detail Peran vs Endpoint

| Endpoint API | Method | `USER` | `COLLECTOR` | `FACILITY_OPERATOR` | `ADMIN` | Mekanisme Proteksi Data |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `/auth/register`, `/auth/login` | POST | Publik | Publik | Publik | Publik | Anti-enumerasi kredensial |
| `/me`, `/me/addresses` | GET/PATCH | ✅ | ✅ | ✅ | ✅ | Scoped kepemilikan `user_id == current_user.id` |
| `/collector-applications` | POST | ✅ | ❌ | ❌ | ❌ | Hanya akun dengan role dasar USER |
| `/admin/collector-applications/*` | GET/POST | ❌ | ❌ | ❌ | ✅ | `require_admin` + pencatatan audit log |
| `/pickup-requests` | POST | ✅ | ❌ | ❌ | ❌ | Validasi kuota slot area layanan |
| `/pickup-requests/my` | GET | ✅ | ❌ | ❌ | ❌ | Hanya mengembalikan tiket miliknya sendiri |
| `/collector/tasks/available` | GET | ❌ | ✅ | ❌ | ✅ | Filter wilayah penugasan petugas |
| `/collector/tasks/{id}/claim` | POST | ❌ | ✅ | ❌ | ❌ | Atomic row-level claim (bebas double-claim) |
| `/inspections`, `/weights` | POST | ❌ | ✅ | ❌ | ❌ | Validasi tugas milik petugas yang mengklaim |
| `/facilities/{id}/receipts` | POST | ❌ | ❌ | ✅ | ✅ | Scoped ke `facility_id` operator |
| `/facilities/{id}/sort` | POST | ❌ | ❌ | ✅ | ✅ | Pesimistik lock `with_for_update()` |
| `/waste-bank/transactions` | POST | ❌ | ❌ | ❌ | ✅ | Double-entry ledger append-only |
| `/admin/*` | ALL | ❌ | ❌ | ❌ | ✅ | `require_admin` wajib |

---

## 3. Negative Authorization Tests (Bukti Pengujian)
- `tests/api/test_rbac_and_roles.py`:
  - `test_user_cannot_access_admin_or_collector_tasks`: Warga biasa yang mencoba memanggil endpoint admin atau klaim tugas petugas langsung ditolak dengan status HTTP 403 Forbidden.
  - `test_active_role_switch_validation`: Warga biasa yang mencoba beralih `preferred_active_role` ke `ADMIN` tanpa grant ditolak dengan HTTP 403.
- `tests/api/test_phase3_petugas_dispatch.py`:
  - `test_unverified_or_inactive_collector_cannot_claim_task`: Petugas yang permohonannya masih `PENDING` atau berstatus `SUSPENDED` ditolak saat mencoba mengklaim tugas.
