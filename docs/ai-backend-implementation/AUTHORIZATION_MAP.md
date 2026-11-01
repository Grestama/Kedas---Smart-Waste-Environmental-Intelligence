# Kedas Backend — Authorization & Role-Based Access Control (RBAC) Map

**Standar Otorisasi:** Server-side Token/Cookie Session + Explicit Role Guards + Destination/Organization Membership Isolation  
**Prinsip Non-Negotiable:** Otorisasi tidak pernah disimpulkan hanya dari rute UI atau parameter input klien. Semua scope divalidasi dari entitas di sisi server.

---

## 1. Definisi Peran (Roles)

| Peran Sistem (`Role.name`) | Deskripsi & Lingkup Otoritas | Lingkup Data yang Diizinkan |
|---|---|---|
| `PUBLIC` (Unauthenticated) | Pengguna umum / wisatawan tanpa akun login. | Halaman beranda, panduan pemilahan publik, direktori area CDOA published, EcoGuide publik, Vision publik (tanpa akses log privat). |
| `USER` / `CITIZEN` | Warga banjar terdaftar. | Data profil sendiri, alamat sendiri, setoran sendiri, riwayat WastePoints sendiri, panduan kawasan. |
| `COLLECTOR` / `STAFF` | Petugas pengangkut armada trike banjar. | Antrean tugas penjemputan banjar tugas, input inspeksi QC & timbangan, log serah-terima lapangan. |
| `FACILITY_OPERATOR` | Operator fasilitas TPS3R / TPST / PDU. | Penerimaan material fasilitas, pencatatan timbangan bruto/tara, manajemen stok TPS3R, buku kas bank sampah. |
| `DISPATCHER` | Koordinator logistik armada banjar. | Penjadwalan slot penjemputan, penugasan petugas armada trike, pemantauan rute operasional. |
| `COMMUNITY_LEADER` | Prajuru banjar adat / Kelian dinas. | Profil banjar, usulan dan ratifikasi CDOA, persetujuan manifest limbah khusus, pengaduan lingkungan warga. |
| `PARTNER` / `B2B_MEMBER` | Mitra industri daur ulang atau pelaku usaha hospitality (hotel/villa/restoran). | Organisasi B2B sendiri, log setoran limbah komersial hotel, penawaran batch daur ulang, laporan ESG. |
| `ADMIN` | Koordinator supervisi kawasan / Administrator platform. | Akses penuh supervisi operasional, master kategori, aturan poin, pendanaan, audit log, manajemen SOP RAG, dan verifikasi akun petugas. |

---

## 2. Pemetaan Otorisasi Endpoint Berdasarkan Modul

### 2.1 Modul AI Innovation (`/api/v1/ai/*`)

| Endpoint | Method | Izin Minimal | Mekanisme Guard & Scope Isolation |
|---|---|---|---|
| `/api/v1/ai/ecoguide` | POST | `PUBLIC` / `USER` | `get_optional_current_user`. Scoping dokumen terbatas pada `is_public=True` jika unauthenticated. |
| `/api/v1/ai/vision/analyze` | POST | `PUBLIC` / `USER` | `get_optional_current_user`. Validasi MIME & ukuran berkas; user_id dilekatkan jika login. |
| `/api/v1/ai/copilot` | POST | `ADMIN`, `FACILITY_OPERATOR`, `DISPATCHER`, `COMMUNITY_LEADER`, `PARTNER` | `RequireRole(...)`. Scoping tool dan data agregat terbatas pada destinasi/organisasi aktor. |
| `/api/v1/ai/copilot/execute` | POST | `ADMIN`, `FACILITY_OPERATOR`, `DISPATCHER`, `COMMUNITY_LEADER` | Validasi permission eksplisit terhadap target action, validasi versi entitas (ETag/state), domain service mutation. |
| `/api/v1/ai/knowledge` | POST | `ADMIN` | `RequireRole('ADMIN')`. Hanya admin yang dapat mendaftarkan dokumen SOP/CDOA baru. |
| `/api/v1/ai/knowledge` | GET | `ADMIN`, `FACILITY_OPERATOR`, `DISPATCHER`, `COMMUNITY_LEADER`, `PARTNER` | `RequireRole(...)`. Menampilkan dokumen berstatus published/draft sesuai scope. |
| `/api/v1/ai/knowledge/{id}` | GET | `ADMIN`, `FACILITY_OPERATOR`, `DISPATCHER`, `COMMUNITY_LEADER`, `PARTNER` | `RequireRole(...)`. Mengembalikan dokumen dan seluruh chunking-nya. |
| `/api/v1/ai/knowledge/{id}/status` | PATCH | `ADMIN` | `RequireRole('ADMIN')`. Mengubah status siklus dokumen (`DRAFT`, `PUBLISHED`, `RETIRED`). |
| `/api/v1/ai/knowledge/{id}` | DELETE | `ADMIN` | `RequireRole('ADMIN')`. Menghapus dokumen beserta seluruh relasi chunk di database. |
| `/api/v1/ai/feedback` | POST | `PUBLIC` / `USER` | `get_optional_current_user`. Mencatat rating ke `ai_interaction_logs`. |
| `/api/v1/ai/health` | GET | `PUBLIC` | Monitoring latensi dan status provider adapter. |

### 2.2 Modul Identitas & Sesi Akun (`/api/v1/auth/*`, `/api/v1/me/*`)

| Endpoint | Method | Izin Minimal | Mekanisme Guard & Scope Isolation |
|---|---|---|---|
| `/api/v1/auth/register` | POST | `PUBLIC` | Registrasi akun baru (default role: `USER`). |
| `/api/v1/auth/login` | POST | `PUBLIC` | Verifikasi password dengan Argon2id; penerbitan cookie sesi terenkripsi. |
| `/api/v1/auth/logout` | POST | `AUTHENTICATED` | Invalidation sesi pada tabel `auth_sessions`. |
| `/api/v1/me/profile` | GET | `AUTHENTICATED` | Hanya mengembalikan data pengguna pemilik sesi aktif. |
| `/api/v1/me/addresses` | GET/POST | `USER` | Akses hanya terhadap alamat milik `user_id` yang sedang login. |
| `/api/v1/me/addresses/{id}` | PUT/DELETE | `USER` | Validasi kepemilikan (`address.user_id == user.id`), proteksi IDOR. |

### 2.3 Modul Pengumpulan Sampah (`/api/v1/pickup-requests/*`)

| Endpoint | Method | Izin Minimal | Mekanisme Guard & Scope Isolation |
|---|---|---|---|
| `/api/v1/pickup-requests` | POST | `USER` | Validasi kepemilikan alamat, pengecekan slot aktif, idempotency key check. |
| `/api/v1/pickup-requests/mine` | GET | `USER` | Filter ketat `PickupRequest.user_id == current_user.id`. |
| `/api/v1/pickup-requests/{id}` | GET | `USER` / `STAFF` / `ADMIN` | User hanya bisa melihat milik sendiri; petugas melihat tugas yang ditugaskan; admin melihat semua. |
| `/api/v1/pickup-requests/{id}/cancel` | POST | `USER` / `ADMIN` | Pembatalan hanya jika status masih `PENDING` atau `SCHEDULED`. |

### 2.4 Modul Lapangan & Timbangan (`/api/v1/collector/*`, `/api/v1/weight-records/*`, `/api/v1/inspections/*`)

| Endpoint | Method | Izin Minimal | Mekanisme Guard & Scope Isolation |
|---|---|---|---|
| `/api/v1/collector/tasks/available` | GET | `COLLECTOR`, `ADMIN` | Menampilkan antrean tugas penjemputan di banjar yang ditugaskan kepada petugas. |
| `/api/v1/collector/tasks/mine` | GET | `COLLECTOR` | Menampilkan tugas aktif yang diklaim petugas bersangkutan. |
| `/api/v1/collector/tasks/{id}/claim` | POST | `COLLECTOR` | Penguncian tugas (concurrency-safe) untuk mencegah double-claim. |
| `/api/v1/inspections` | POST | `COLLECTOR`, `FACILITY_OPERATOR`, `ADMIN` | Pencatatan hasil pemeriksaan fisik/QC dan tingkat kontaminasi material. |
| `/api/v1/weight-records` | POST | `COLLECTOR`, `FACILITY_OPERATOR`, `ADMIN` | Validasi timbangan digital (netto = bruto - tara) dan penerbitan bukti timbang. |

### 2.5 Modul Supervisi Admin (`/api/v1/admin/*`)

| Endpoint | Method | Izin Minimal | Mekanisme Guard & Scope Isolation |
|---|---|---|---|
| `/api/v1/admin/dashboard` | GET | `ADMIN` | Agregasi statistik operasional dan finansial kawasan terpadu. |
| `/api/v1/admin/users` | GET | `ADMIN` | Daftar pengguna terdaftar, status akun, dan peran. |
| `/api/v1/admin/collector-applications` | GET/POST | `ADMIN` | Tinjauan dan persetujuan berkas KYC calon petugas lapangan. |
| `/api/v1/admin/audit-logs` | GET | `ADMIN` | Penelusuran riwayat log audit mutasi data sistem. |
| `/api/v1/admin/reports/*` | GET | `ADMIN` | Laporan tonase dan ekspor data operasional CSV. |
