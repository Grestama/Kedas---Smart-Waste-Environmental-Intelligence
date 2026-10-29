# WasteLink Bali — Phase 2 Implementation Plan
## Identity, Access Control, Waste Taxonomy, Scheduling, dan Waste Collection

> **Dokumen acuan:** PRD, HRD, SDD, SRS WasteLink Bali  
> **Status:** Executing  
> **Target:** Autentikasi sesi server-side aman, RBAC & collector review, taksonomi sampah 4 kategori dengan gating limbah khusus, penjadwalan berkapasitas atomik, dan alur penjemputan warga-petugas terlacak end-to-end.

---

## 1. Lingkup & Batas Modul Tahap 2

### A. Account & Identity (`app/modules/account`)
- **Users**: Identifier unik (`email` / `phone`), password ter-hash Argon2id, status akun (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`).
- **Sessions**: Opaque server-side sessions dengan token hash SHA-256 tersimpan di database, dikirim via cookie `HttpOnly` atau header `Authorization: Bearer <session_token>`. Lifecycle: waktu kadaluarsa, pencabutan saat logout atau suspend.
- **Roles & Grants**:
  - Role sistem inti: `USER` (diberikan saat registrasi), `COLLECTOR` (melalui aplikasi & persetujuan admin), `ADMIN` (melalui bootstrapping aman/provisioning). Role lanjutan: `FINANCE`, `BUYER` (tidak aktif default).
  - `active_role`: Preferensi UI pengguna yang tervalidasi pada role yang benar-benar dimiliki. **Bukan sumber otorisasi backend**.
- **Collector Applications**: Alur pengajuan dengan status `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN`. Persetujuan admin mencatat actor, reason, dan timestamp ke `audit_logs`.
- **User Addresses**: Pengelolaan alamat milik warga dengan verifikasi ownership (proteksi IDOR) dan keterkaitan dengan `service_area_id`.
- **Admin Bootstrap CLI**: Perintah mandiri aman untuk membuat akun admin pertama tanpa password hardcoded.

### B. Waste Taxonomy (`app/modules/taxonomy`)
- **Kategori Utama**: `ORGANIC`, `RECYCLABLE`, `RESIDUAL`, `SPECIAL`. Label Bahasa Indonesia melalui field `name` / `display_name`.
- **Subkategori & Panduan**: Contoh material yang diterima, material yang ditolak, instruksi persiapan, petunjuk keselamatan.
- **Material Acceptance Rules**: Aturan ketersediaan per area layanan.
- **Gating Keselamatan**: Limbah `SPECIAL` dilarang masuk ke alur pickup umum jika belum memiliki jalur/mitra berizin yang terkonfirmasi.

### C. Service Areas & Scheduling (`app/modules/collection`)
- **Service Areas**: Wilayah layanan (pilot desa/banjar di Bali) dengan status aktif.
- **Collection Slots**: Slot waktu operasional timezone-aware dalam WITA (`Asia/Makassar`), kapasitas booking, dan kategori yang dilayani.
- **Pencegahan Overbooking**: Locking baris transaksional (`with_for_update`) pada pencatatan kapasitas slot saat pembuatan pickup secara bersamaan.

### D. Waste Collection / Pickup Requests (`app/modules/collection`)
- **State Machine Inti**:
  - `SUBMITTED` -> `PENDING_ASSIGNMENT` -> `ACCEPTED` -> `EN_ROUTE` -> `ARRIVED` -> `INSPECTION` / `CANCELLED`
- **Atomic Task Acceptance**: Collector terverifikasi mengklaim tugas dari daftar tersedia dengan database lock (`with_for_update`), menjamin tepat 1 petugas menang dan request kompetitor menerima `409 Conflict`.
- **Pickup Status Events**: Riwayat append-only mencatat `from_status`, `to_status`, `actor_user_id`, `reason`, dan `request_id`.
- **Ownership & Access Scoping**: Warga hanya dapat membaca dan membatalkan pickup miliknya; petugas hanya melihat tugas di wilayahnya dan tugas yang telah di-assign; admin memiliki akses operasional menyeluruh dengan audit log.

---

## 2. Model Data Baru & Relasi (Alembic Revision 0002)

1. `users`: data profil, password hash, account status, preferred active role.
2. `auth_sessions`: id, user_id, session_token_hash, expires_at, revoked_at, ip_address, user_agent.
3. `roles`: id, code, name, description.
4. `user_roles`: user_id, role_id, verification_status, granted_by, granted_at, notes.
5. `collector_applications`: user_id, status, vehicle_type, operational_notes, reviewed_by, reviewed_at, rejection_reason.
6. `user_addresses`: user_id, label, address_text, service_area_id, notes, is_default.
7. `service_areas`: code, name, administrative_area, is_active.
8. `collection_slots`: service_area_id, start_time, end_time, max_capacity, booked_capacity, is_active.
9. `waste_categories`: code, name, category_type (`ORGANIC`, `RECYCLABLE`, `RESIDUAL`, `SPECIAL`), description, preparation_guide, safety_notes, is_active, display_order.
10. `material_acceptance_rules`: category_id, service_area_id, is_accepted, special_route_confirmed.
11. `pickup_requests`: public_code, reporter_user_id, service_area_id, category_id, address_id, slot_id, status, assigned_collector_id, estimated_weight_kg, notes, cancellation_reason.
12. `pickup_status_events`: pickup_request_id, from_status, to_status, actor_user_id, reason, request_id, created_at.

---

## 3. Matriks Endpoint API Baru (`/api/v1`)

| Endpoint | Method | Role / Auth | Deskripsi |
|---|---|---|---|
| `/auth/register` | POST | Public | Registrasi akun baru (role default `USER`) |
| `/auth/login` | POST | Public | Autentikasi kredensial, membuat session server-side |
| `/auth/logout` | POST | Authenticated | Mencabut session saat ini |
| `/me` | GET, PATCH | Authenticated | Profil pengguna sendiri |
| `/me/roles` | GET | Authenticated | Daftar role yang dimiliki pengguna |
| `/me/active-role` | POST | Authenticated | Memilih active-role (harus role yang dimiliki) |
| `/me/addresses` | GET, POST | Authenticated | Pengelolaan alamat sendiri |
| `/me/addresses/{id}` | GET, PATCH, DELETE | Authenticated | Detail & update alamat sendiri |
| `/collector-applications` | POST, GET | Authenticated (`USER`) | Pengajuan & cek status aplikasi collector sendiri |
| `/admin/collector-applications` | GET | Admin | Daftar pengajuan collector |
| `/admin/collector-applications/{id}/review` | POST | Admin | Persetujuan / penolakan pengajuan collector |
| `/waste-categories` | GET | Public / All | Panduan taksonomi & kategori aktif |
| `/waste-categories` | POST, PATCH | Admin | CRUD & toggle status aktif kategori |
| `/service-areas` | GET | Public / All | Daftar area layanan aktif |
| `/service-areas/{id}/slots` | GET | Public / All | Daftar slot waktu dan ketersediaan kapasitas |
| `/pickup-requests` | POST | Authenticated (`USER`) | Mengajukan setoran / pickup sampah |
| `/pickup-requests/mine` | GET | Authenticated (`USER`) | Riwayat setoran milik pengguna sendiri |
| `/pickup-requests/{id}` | GET | Owner / Collector / Admin | Detail setoran (disesuaikan hak akses) |
| `/pickup-requests/{id}/cancel` | POST | Owner / Admin | Membatalkan setoran dengan alasan |
| `/collector/tasks/available` | GET | Verified `COLLECTOR` | Daftar tugas tersedia di area layanan |
| `/collector/tasks/mine` | GET | Verified `COLLECTOR` | Daftar tugas yang telah diambil |
| `/collector/tasks/{id}/accept` | POST | Verified `COLLECTOR` | Klaim tugas penjemputan (atomik) |
| `/collector/tasks/{id}/status` | POST | Assigned `COLLECTOR` | Transisi status tugas penjemputan |
| `/admin/pickups/{id}/reassign` | POST | Admin | Reassign petugas sampah dengan audit |

---

## 4. Rencana Pengujian Wajib Tahap 2

1. **Auth & Session Tests**: Registrasi identitas ganda, login sukses/gagal, session timeout & revocation, akun tersuspensi.
2. **Access Control & Privilege Escalation Tests**: User normal ditolak akses admin/collector; collector berstatus PENDING ditolak klaim task; penetapan role ilegal ditolak.
3. **IDOR Tests**: User A mengakses alamat atau pickup milik User B mendapatkan 404/403.
4. **Special Waste Gating Tests**: Pengajuan setoran kategori `SPECIAL` tanpa rute terkonfirmasi ditolak secara eksplisit dengan error domain.
5. **Slot Capacity Race Tests**: Simulasi dua pemesanan bersamaan pada kapasitas sisa 1 -> tepat 1 berhasil, 1 ditolak overbooking.
6. **Task Claim Race Tests**: Simulasi dua petugas mengklaim tugas yang sama bersamaan -> tepat 1 berhasil menang, 1 mendapatkan 409 Conflict.
7. **End-to-End Happy Path**: Bootstrap Admin -> Pengajuan & Verifikasi Collector -> Buat Setoran Warga -> Klaim Petugas -> Transisi Status -> Riwayat Event.
