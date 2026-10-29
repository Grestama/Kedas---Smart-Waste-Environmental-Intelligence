# WasteLink Bali — Backend API Reference

Dokumen referensi kontrak RESTful API untuk klien Web Portal dan Aplikasi Mobile WasteLink Bali.
Semua rute bernaung di bawah prefix `/api/v1`. Zona waktu standar: WITA (`Asia/Makassar`). Nilai moneter dalam IDR.

---

## 1. Authentication & Session (`/auth`)
* `POST /api/v1/auth/register` — Registrasi warga baru (mendapatkan role default `USER`).
* `POST /api/v1/auth/login` — Autentikasi dengan email/nomor telepon + password. Menghasilkan session token server-side.
* `POST /api/v1/auth/logout` — Mencabut session aktif di server (invalidation).

## 2. Profile, Active Role & Addresses (`/me`)
* `GET /api/v1/me` — Ambil profil pengguna saat ini.
* `PATCH /api/v1/me` — Perbarui data profil (nama lengkap, nomor telepon terverifikasi).
* `GET /api/v1/me/roles` — Daftar role aktif yang dimiliki akun (`USER`, `COLLECTOR`, `ADMIN`, `FINANCE`).
* `POST /api/v1/me/active-role` — Ganti preferensi tampilan UI (`active_role`). Server memvalidasi kepemilikan role asli.
* `GET /api/v1/me/addresses` — Daftar alamat tempat tinggal milik sendiri.
* `POST /api/v1/me/addresses` — Tambah alamat baru dengan relasi ke wilayah layanan banjar (`service_area_id`).
* `GET /api/v1/me/addresses/{id}` — Detail alamat terdaftar (IDOR-protected).
* `PATCH /api/v1/me/addresses/{id}` — Perbarui data alamat (IDOR-protected).
* `DELETE /api/v1/me/addresses/{id}` — Hapus alamat (IDOR-protected).

## 3. Taxonomy & Service Areas (`/waste-categories`, `/service-areas`)
* `GET /api/v1/waste-categories` — Daftar kategori sampah aktif (e.g. `ORGANIC`, `RECYCLABLE`, `RESIDUAL`, `SPECIAL`).
* `GET /api/v1/waste-categories/{id}` — Detail kategori, instruksi pemilahan, dan aturan keselamatan.
* `POST /api/v1/waste-categories` — `[Admin]` Tambah atau perbarui taksonomi sampah.
* `GET /api/v1/service-areas` — Daftar area banjar/desa yang didukung operasional.
* `POST /api/v1/service-areas` — `[Admin]` Buat area layanan banjar baru.
* `GET /api/v1/service-areas/{id}/slots` — Daftar slot waktu jadwal penjemputan beserta sisa kapasitas.
* `POST /api/v1/service-areas/{id}/slots` — `[Admin]` Buka slot jadwal penjemputan baru.

## 4. Collector Applications (`/collector-applications`)
* `POST /api/v1/collector-applications` — Pengajuan diri menjadi petugas pos operasional (kendaraan, plat nomor, nomor HP).
* `GET /api/v1/collector-applications/mine` — Cek status pengajuan petugas milik sendiri.
* `GET /api/v1/admin/collector-applications` — `[Admin]` Daftar pengajuan calon petugas yang menunggu review.
* `POST /api/v1/admin/collector-applications/{id}/review` — `[Admin]` Persetujuan / penolakan pengajuan (otomatis provisioning role `COLLECTOR`).

## 5. Waste Pickup Requests (`/pickup-requests`)
* `POST /api/v1/pickup-requests` — Pemesanan penjemputan sampah oleh warga.
  - *Catatan Keselamatan*: Sampah kategori `SPECIAL` ditolak dengan status 422.
* `GET /api/v1/pickup-requests/mine` — Histori penjemputan sampah milik warga yang sedang login.
* `GET /api/v1/pickup-requests/{id}` — Detail status penjemputan dan audit event lifecycle (IDOR-protected).
* `POST /api/v1/pickup-requests/{id}/cancel` — Batalkan permintaan penjemputan dengan pelepasan kuota slot atomik.

## 6. Collector Operations (`/collector/tasks`)
* `GET /api/v1/collector/tasks/available` — `[Collector]` Daftar tugas penjemputan berstatus `PENDING_ASSIGNMENT` di banjar.
* `GET /api/v1/collector/tasks/mine` — `[Collector]` Daftar tugas yang telah diklaim petugas login.
* `POST /api/v1/collector/tasks/{id}/accept` — `[Collector]` Klaim tugas atomik dengan row lock (`with_for_update`).
* `POST /api/v1/collector/tasks/{id}/status` — `[Collector]` Transisi state machine (`EN_ROUTE`, `ARRIVED`, `COLLECTED`, dll.).

## 7. Inspection & Weighing (`/pickup-requests/{id}`)
* `POST /api/v1/pickup-requests/{id}/inspections` — `[Collector]` Catat hasil QC (kontaminasi: `NONE`, `LOW`, `MEDIUM`, `HIGH`).
  - Hasil `REJECTED` membatalkan penjemputan dan memblokir penerbitan poin.
* `GET /api/v1/pickup-requests/{id}/inspections` — Riwayat inspeksi QC penjemputan.
* `POST /api/v1/pickup-requests/{id}/weights` — `[Collector]` Catat timbangan tervalidasi (Gross, Tare, Net).
  - Memicu evaluasi reward WastePoints secara otomatis.
  - Koreksi timbangan menghasilkan revisi versi baru (v2, v3) dengan reversal poin otomatis.
* `GET /api/v1/pickup-requests/{id}/weights` — Riwayat versi penimbangan (termasuk status `SUPERSEDED` dan `VERIFIED`).

## 8. Evidence Storage (`/evidence`)
* `POST /api/v1/evidence/upload` — Unggah bukti foto setoran, QC, timbangan, atau surat jalan.
  - Validasi ketat MIME (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) dan ukuran maksimal 10MB.
* `GET /api/v1/evidence/{id}/download` — Unduh berkas bukti terverifikasi (private access control).
* `GET /api/v1/evidence` — Daftar bukti yang terlampir pada entitas domain tertentu.

## 9. WastePoints & Funding Ledger (`/points`, `/admin/points`)
* `GET /api/v1/points/balance` — Saldo WastePoints aktif milik pengguna.
* `GET /api/v1/points/ledger` — Buku besar mutasi poin milik pengguna (append-only, immutable).
* `POST /api/v1/admin/points/rules` — `[Admin]` Konfigurasi aturan perolehan poin per kg per kategori.
* `POST /api/v1/admin/points/adjust` — `[Finance/Admin]` Penyesuaian poin manual dengan alasan audit.

## 10. Circular Marketplace & Off-taker Deliveries (`/admin`)
* `POST /api/v1/admin/partners` — Daftarkan mitra daur ulang / pengolah material.
* `GET /api/v1/admin/partners` — Daftar mitra terverifikasi.
* `POST /api/v1/admin/batches` — Gabungkan setoran `COMPLETED` ke dalam batch material sirkular.
  - Mencegah setoran yang sama masuk ke lebih dari 1 batch (409 Conflict).
* `GET /api/v1/admin/batches` — Daftar batch material.
* `POST /api/v1/admin/deliveries` — Buat surat jalan pengiriman batch ke mitra pengolah.
* `POST /api/v1/admin/deliveries/{id}/receipt` — Konfirmasi penerimaan timbangan oleh mitra.
  - Selisih berat dicatat otomatis; status menjadi `DISPUTED` jika terdapat perbedaan berat.

## 11. Admin Operations, Reports & System Auditing (`/admin`)
* `GET /api/v1/admin/dashboard` — Dashboard metrik real-time.
* `GET /api/v1/admin/reports/summary` — Laporan agregat metrik operasional dengan filter rentang waktu (WITA).
  - Memisahkan secara ketat `total_estimated_weight_kg` vs `total_verified_weight_kg`.
* `GET /api/v1/admin/reports/export` — Unduh CSV laporan operasional tersanitasi (pencegahan formula injection `=, +, -, @`).
* `GET /api/v1/admin/users` — Manajemen akun pengguna (filter status, role, pagination).
* `PATCH /api/v1/admin/users/{id}/status` — Ubah status akun (`SUSPENDED`) dengan pencabutan seluruh session aktif seketika.
* `GET /api/v1/admin/audit-logs` — Audit log penelusuran seluruh tindakan sensitif sistem (read-only).

---

## Standar Format Respon Error (RFC-Compliant Envelope)
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Pesan deskripsi kesalahan dalam Bahasa Indonesia",
  "request_id": "c1f7a0b3-199b-4e89-a2e6-764fba158319",
  "details": [
    {
      "field": "phone_number",
      "message": "Format nomor telepon tidak valid",
      "code": "invalid_phone"
    }
  ]
}
```
