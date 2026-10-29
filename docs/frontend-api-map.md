# WasteLink Bali — Frontend to Backend API Map

Dokumen ini memetakan seluruh kontrak API aktual backend WasteLink Bali (`/api/v1`) hasil ekstraksi langsung dari OpenAPI schema aktif dan test suite backend ke fitur frontend Web & Mobile.

---

## 1. Matriks Pemetaan API Aktual

| No | Fitur / Domain | Method & Path Aktual | Auth / Permission | Payload Utama (Request) | Response Utama (200/201) | Error & Pagination | Status Integrasi | Catatan Gap & Adaptasi |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **1** | Registrasi Warga | `POST /api/v1/auth/register` | Publik | `{full_name, email?, phone?, password}` | `{session_token, user: {id, email, phone, full_name, account_status}, expires_at}` | 400 (Conflict), 422 (Validation) | Siap Integrasi | Default role `USER` otomatis diberikan server. |
| **2** | Login Pengguna | `POST /api/v1/auth/login` | Publik | `{identifier, password}` | `{session_token, user, expires_at}` + Set-Cookie `wastelink_session` | 401 (Invalid creds), 403 (Suspended) | Siap Integrasi | Server-side opaque session token (SHA-256). |
| **3** | Logout Pengguna | `POST /api/v1/auth/logout` | Authenticated | Tidak ada (Session via Bearer/Cookie) | `{message: "Logout berhasil"}` | 401 (Expired/Invalid) | Siap Integrasi | Menghapus token dari `auth_sessions`. |
| **4** | Lupa Password | *Tidak tersedia di backend* | - | - | - | - | **GAP (Backend)** | Backend MVP belum memiliki endpoint reset password. UI menampilkan status "Belum tersedia" dan kontak bantuan. |
| **5** | Profil Saya | `GET /api/v1/me` | Authenticated | - | `UserResponse` (`id, email, phone, full_name, account_status, preferred_active_role`) | 401 (Unauth), 403 (Suspended) | Siap Integrasi | Sumber kebenaran identitas pengguna. |
| **6** | Update Profil | `PATCH /api/v1/me` | Authenticated | `{full_name?, phone?}` | `UserResponse` | 409 (Phone conflict), 422 | Siap Integrasi | Hanya update nama & telepon. |
| **7** | Daftar Role Saya | `GET /api/v1/me/roles` | Authenticated | - | `list[{code, name, description, verification_status}]` | 401 | Siap Integrasi | Hanya role berstatus `ACTIVE` yang valid. |
| **8** | Switch Active Role | `POST /api/v1/me/active-role` | Authenticated | `{role_code}` | `UserResponse` | 403 (Jika user tidak memiliki role tersebut) | Siap Integrasi | Hanya preferensi UI context, bukan hak akses backend. |
| **9** | Daftar Alamat | `GET /api/v1/me/addresses` | Authenticated | - | `list[AddressResponse]` | 401 | Siap Integrasi | IDOR-protected (hanya alamat milik user). |
| **10** | Tambah Alamat | `POST /api/v1/me/addresses` | Authenticated | `{label, address_text, service_area_id, notes?, is_default?}` | `AddressResponse` | 422 | Siap Integrasi | Terhubung ke `service_area_id` banjar. |
| **11** | Detail Alamat | `GET /api/v1/me/addresses/{id}` | Authenticated | - | `AddressResponse` | 404 (Not found / Bukan pemilik) | Siap Integrasi | IDOR-protected. |
| **12** | Update Alamat | `PATCH /api/v1/me/addresses/{id}` | Authenticated | `{label?, address_text?, service_area_id?, notes?, is_default?}` | `AddressResponse` | 404, 422 | Siap Integrasi | IDOR-protected. |
| **13** | Hapus Alamat | `DELETE /api/v1/me/addresses/{id}` | Authenticated | - | 204 No Content | 404 | Siap Integrasi | IDOR-protected. |
| **14** | Kategori Sampah | `GET /api/v1/waste-categories` | Publik / Auth | `?active_only=true` | `list[WasteCategoryResponse]` | - | Siap Integrasi | Menampilkan kode (`ORGANIC`, `RECYCLABLE`, `RESIDUAL`, `SPECIAL`), instruksi pemilahan. |
| **15** | Detail Kategori | `GET /api/v1/waste-categories/{id}` | Publik / Auth | - | `WasteCategoryDetailResponse` | 404 | Siap Integrasi | Memuat panduan pemilahan detail. |
| **16** | Kelola Kategori | `POST /api/v1/waste-categories`, `PATCH .../{id}` | Role: `ADMIN` | Schema kategori sampah | `WasteCategoryResponse` | 403 (Forbidden), 409 | Siap Integrasi | Khusus Admin. |
| **17** | Area Layanan | `GET /api/v1/service-areas` | Publik / Auth | `?active_only=true` | `list[ServiceAreaResponse]` | - | Siap Integrasi | Wilayah banjar / desa pilot. |
| **18** | Slot Jadwal Area | `GET /api/v1/service-areas/{id}/slots` | Publik / Auth | `?available_only=true` | `list[CollectionSlotResponse]` | 404 | Siap Integrasi | Memuat `start_time`, `end_time`, `max_capacity`, `booked_capacity`. |
| **19** | Buat Slot Jadwal | `POST /api/v1/service-areas/{id}/slots` | Role: `ADMIN` | `{start_time, end_time, max_capacity}` | `CollectionSlotResponse` | 403, 422 | Siap Integrasi | Admin membuka slot kuota penjemputan. |
| **20** | Buat Setoran Warga | `POST /api/v1/pickup-requests` | Role: `USER` | `{category_id, address_id, slot_id, estimated_weight_kg?, notes?}` | `PickupResponse` (`id, public_code, status="PENDING_ASSIGNMENT", ...`) | 409 (Slot penuh), 422 (SPECIAL category ditolak) | Siap Integrasi | Atomik decrement slot kuota; kategori `SPECIAL` diblokir (Safety Gating). |
| **21** | Setoran Saya | `GET /api/v1/pickup-requests/mine` | Role: `USER` | `?status=...` | `list[PickupResponse]` | 401 | Siap Integrasi | Riwayat setoran pribadi. |
| **22** | Detail Setoran | `GET /api/v1/pickup-requests/{id}` | Owner / Collector / Admin | - | `PickupDetailResponse` + `events: list[PickupStatusEvent]` | 403 (Bukan hak akses), 404 | Siap Integrasi | Memuat riwayat transisi status, bukti, dan timbangan. |
| **23** | Batalkan Setoran | `POST /api/v1/pickup-requests/{id}/cancel` | Owner / Admin | `{reason}` | `PickupResponse` | 403, 409 (Sudah diproses) | Siap Integrasi | Mengembalikan kuota slot secara atomik. |
| **24** | Antrean Tugas Tersedia | `GET /api/v1/collector/tasks/available` | Role: `COLLECTOR` | `?service_area_id=...` | `list[PickupResponse]` | 403 | Siap Integrasi | Menampilkan setoran `PENDING_ASSIGNMENT` tanpa collector. |
| **25** | Tugas Saya (Petugas) | `GET /api/v1/collector/tasks/mine` | Role: `COLLECTOR` | `?status=...` | `list[PickupResponse]` | 403 | Siap Integrasi | Daftar tugas yang telah diklaim petugas login. |
| **26** | Klaim Tugas Petugas | `POST /api/v1/collector/tasks/{id}/accept` | Role: `COLLECTOR` | - | `PickupResponse` (`status="ACCEPTED"`) | 403, 409 (Sudah diambil petugas lain) | Siap Integrasi | Row-level locking (`with_for_update`), proteksi race condition. |
| **27** | Update Status Tugas | `POST /api/v1/collector/tasks/{id}/status` | Assigned Collector / Admin | `{status, reason?}` | `PickupResponse` | 403, 422 (Invalid state transition) | Siap Integrasi | State machine: `ACCEPTED` -> `EN_ROUTE` -> `ARRIVED` -> `INSPECTION` -> `COLLECTED` -> `COMPLETED`. |
| **28** | Inspeksi QC | `POST /api/v1/pickup-requests/{id}/inspections` | Collector / Admin | `{result, contamination_level, rejection_reason_code?, rejection_notes?}` | `InspectionResponse` | 403, 422 | Siap Integrasi | Hasil `REJECTED` membatalkan penjemputan dan memblokir penerbitan poin. |
| **29** | Riwayat Inspeksi | `GET /api/v1/pickup-requests/{id}/inspections` | Owner / Collector / Admin | - | `list[InspectionResponse]` | 401, 404 | Siap Integrasi | Riwayat QC. |
| **30** | Catat Timbangan | `POST /api/v1/pickup-requests/{id}/weights` | Collector / Admin | `{method, gross_weight_kg, tare_weight_kg, correction_reason?}` | `WeightRecordResponse` (`net_weight_kg, version, verification_status`) | 400 (Tare >= Gross), 403, 404 | Siap Integrasi | Evaluasi otomatis reward WastePoints; revisi v2 memposting kompensasi reversal. |
| **31** | Riwayat Timbangan | `GET /api/v1/pickup-requests/{id}/weights` | Owner / Collector / Admin | - | `list[WeightRecordResponse]` | 401, 404 | Siap Integrasi | Versi timbangan (`SUPERSEDED` vs `VERIFIED`). |
| **32** | Upload Bukti Foto | `POST /api/v1/evidence/upload` | Authenticated (Stakeholder) | Multipart form: `file, entity_type, entity_id` | `EvidenceResponse` (`id, storage_key, mime_type, file_size_bytes`) | 400 (Bad MIME / >10MB), 403 | Siap Integrasi | Format: JPG, PNG, WEBP, PDF. Anti path traversal. |
| **33** | Download Bukti Foto | `GET /api/v1/evidence/{id}/download` | Authenticated (Stakeholder) | - | File binary (image/jpeg, etc.) | 403, 404 | Siap Integrasi | Private-by-default access control. |
| **34** | Saldo WastePoints | `GET /api/v1/points/balance` | Role: `USER` | - | `{user_id, current_balance}` | 401 | Siap Integrasi | Saldo resmi hasil kalkulasi server (append-only ledger). |
| **35** | Buku Besar Poin | `GET /api/v1/points/ledger` | Role: `USER` | - | `list[LedgerEntryResponse]` (`points_delta, entry_type, balance_after, status`) | 401 | Siap Integrasi | Audit trail mutasi poin imutabel. |
| **36** | Katalog Benefit | *Tidak tersedia di backend* | - | - | - | - | **GAP (Backend)** | Modul katalog redemption belum ada di backend. UI menampilkan info program benefit & label "Katalog penukaran segera hadir". |
| **37** | Pengajuan Petugas | `POST /api/v1/collector-applications` | Role: `USER` | `{phone_number, vehicle_type, vehicle_plate_number, service_area_ids, notes?}` | `CollectorApplicationResponse` | 409 (Sudah mengajukan), 422 | Siap Integrasi | Alur warga mengajukan diri menjadi petugas pos. |
| **38** | Status Pengajuan Saya | `GET /api/v1/collector-applications/mine` | Role: `USER` | - | `list[CollectorApplicationResponse]` | 401 | Siap Integrasi | Status: `PENDING`, `APPROVED`, `REJECTED`. |
| **39** | Review Pengajuan | `POST /api/v1/admin/collector-applications/{id}/review` | Role: `ADMIN` | `{approved: bool, notes?}` | `CollectorApplicationResponse` | 403, 404 | Siap Integrasi | Jika disetujui, server memprovision role `COLLECTOR` aktif. |
| **40** | Batching Material | `POST /api/v1/admin/batches`, `GET` | Role: `COLLECTOR` / `ADMIN` | `{category_id, pickup_ids: list[str]}` | `MaterialBatchResponse` (`batch_code, total_weight_kg, status`) | 409 (Pickup sudah di batch lain), 422 | Siap Integrasi | Agregasi setoran `COMPLETED` untuk mitra pengolah. |
| **41** | Pengiriman ke Mitra | `POST /api/v1/admin/deliveries` | Role: `COLLECTOR` / `ADMIN` | `{batch_id, partner_id, dispatched_weight_kg}` | `DeliveryResponse` (`delivery_code, status="DISPATCHED"`) | 403, 404 | Siap Integrasi | Manifest surat jalan sirkular. |
| **42** | Konfirmasi Mitra | `POST /api/v1/admin/deliveries/{id}/receipt` | Role: `COLLECTOR` / `ADMIN` | `{received_weight_kg, notes?}` | `DeliveryResponse` (`weight_discrepancy_kg, status="DELIVERED"\|"DISPUTED"`) | 400 (Invalid state), 403 | Siap Integrasi | Selisih berat otomatis memicu status `DISPUTED`. |
| **43** | Dashboard Admin | `GET /api/v1/admin/dashboard` | Role: `ADMIN` | - | `OperationalSummaryReport` | 403 | Siap Integrasi | Metrik real-time: setoran, berat terverifikasi, batch, points, funding. |
| **44** | Laporan Ringkasan | `GET /api/v1/admin/reports/summary` | Role: `ADMIN` | `?date_from=...&date_to=...` | `OperationalSummaryReport` | 403, 422 | Siap Integrasi | Filter waktu WITA (`Asia/Makassar`). Strictly memisahkan berat estimasi vs tervalidasi. |
| **45** | Ekspor Laporan CSV | `GET /api/v1/admin/reports/export` | Role: `ADMIN` | `?date_from=...&date_to=...` | `text/csv` stream | 403 | Siap Integrasi | Sanitasi anti formula injection (`=, +, -, @`). |
| **46** | Daftar Pengguna | `GET /api/v1/admin/users` | Role: `ADMIN` | `?role_code=...&status=...&page=1&page_size=20` | `PaginatedResponse[UserResponse]` | 403 | Siap Integrasi | Pagination standar server-side. |
| **47** | Suspensi Akun | `PATCH /api/v1/admin/users/{id}/status` | Role: `ADMIN` | `{status: "SUSPENDED"\|"ACTIVE", reason}` | `UserResponse` | 403, 404 | Siap Integrasi | Suspensi mencabut seluruh token sesi aktif seketika. |
| **48** | Audit Log Sistem | `GET /api/v1/admin/audit-logs` | Role: `ADMIN` | `?action=...&entity_type=...&page=1&page_size=20` | `PaginatedResponse[AuditLogResponse]` | 403 | Siap Integrasi | Log imutabel seluruh operasi sensitif sistem. |
| **49** | Notifikasi In-App | `GET /api/v1/notifications`, `PATCH .../{id}/read` | Authenticated | - | `list[NotificationResponse]` | 401 | Siap Integrasi | Notifikasi setoran, inspeksi, timbang, reward. |
| **50** | Health Check | `GET /api/v1/health/live`, `/ready` | Publik | - | `{status: "alive"\|"ready", database: "connected"}` | 503 jika DB down | Siap Integrasi | Liveness & readiness probes. |

---

## 2. Rangkuman Gap Analisis Backend vs Kebutuhan Frontend

1. **Lupa Password / Reset Password (`/auth/forgot-password`)**:
   - *Status*: Belum diimplementasikan di backend.
   - *Tindakan Frontend*: Halaman `/lupa-password` menampilkan status informatif bahwa pemulihan mandiri belum diaktifkan dan memberikan jalur kontak koordinator pos banjar.
2. **Katalog Penukaran WastePoints (`/points/redeem`)**:
   - *Status*: Backend MVP memvalidasi saldo dan ledger append-only, namun endpoint penukaran barang/sembako belum dirilis.
   - *Tindakan Frontend*: Menampilkan saldo terverifikasi, riwayat ledger, dan kartu edukasi benefit program dengan status "Katalog Penukaran Segera Hadir". Tidak membuat tombol fiktif yang mengurangi poin secara sepihak di client.
3. **Push Notification Native (FCM / APNs)**:
   - *Status*: Backend menggunakan `notifications` database table dan `notification_outbox` untuk integrasi eksternal.
   - *Tindakan Frontend Mobile*: Menggunakan polling/in-app notification fetcher dari endpoint `/api/v1/notifications`. Izin sistem push diminta secara kontekstual dengan fallback in-app inbox.
