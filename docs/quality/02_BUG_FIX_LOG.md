# 02. Log Perbaikan Bug (Bug Fix Log) — WasteLink Bali

**Tanggal**: 30 Oktober 2026  
**Auditor/Engineer**: Principal Software Engineer & QA Automation Engineer  
**Cakupan**: Implementasi aman temuan WL-AUD-001 hingga WL-AUD-005

---

## 1. Log Detail Perbaikan Bug

### WL-AUD-001: Penghapusan Silent Fallback pada `collectionService`
- **ID**: `WL-AUD-001`
- **Tanggal**: 30 Oktober 2026
- **Modul**: G2 Warga / Frontend Service (`frontend/src/services/collection.ts`)
- **Deskripsi Masalah**:
  Saat backend menolak pembuatan permintaan jemput (misalnya karena `OVER_CAPACITY` 400 atau `UNAUTHORIZED` 401), service menangkap error dan mengembalikan objek mock sukses seolah-olah penjemputan berhasil terjadwal di sistem. Hal ini menyembunyikan penolakan server dari pandangan pengguna dan menimbulkan desinkronisasi fatal.
- **Root Cause Analysis**:
  Blok `catch (err)` mengasumsikan seluruh kegagalan adalah kegagalan jaringan offline (`status === 0`), padahal kegagalan dengan kode status HTTP `400/401/403/409/422/500` adalah penolakan resmi dari backend server.
- **Solusi yang Diterapkan**:
  Memvalidasi tipe dan status error HTTP:
  ```typescript
  if (err instanceof ApiError && err.status !== 0) {
    throw err;
  }
  ```
  Dengan aturan ini, jika error memiliki status HTTP selain 0 (network failure murni), error dilempar kembali (re-throw) agar form/UI dapat menampilkan pesan error validasi yang tepat kepada warga.
- **File yang Diubah**:
  `frontend/src/services/collection.ts` (pada `createPickupRequest` dan `cancelPickupRequest`)
- **Test Validasi**:
  `frontend/src/test/collection.test.tsx` -> `re-throws server rejection ApiError on createPickupRequest` & `re-throws server rejection ApiError on cancelPickupRequest`.

---

### WL-AUD-002: Pencegahan Mutasi Mock saat Server Menolak Perubahan Status Tugas Petugas
- **ID**: `WL-AUD-002`
- **Tanggal**: 30 Oktober 2026
- **Modul**: G3 Petugas / Field Service (`frontend/src/services/staff.ts`)
- **Deskripsi Masalah**:
  Pada `acceptTask` dan `updateTaskStatus`, jika server menolak klaim tugas (misalnya karena sudah diambil petugas lain / `409 Conflict`, atau transisi status tidak valid / `400 Bad Request`), service menangkap error tersebut dan secara diam-diam memutasi `mockTasksStore` lokal, memperbarui status tugas di layar petugas seolah aksi berhasil.
- **Root Cause Analysis**:
  Penanganan error tidak membedakan antara respon error HTTP server aktif dengan kondisi offline murni tanpa koneksi.
- **Solusi yang Diterapkan**:
  Pengecekan respon error:
  ```typescript
  if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status !== 0) {
    throw err;
  }
  ```
  Hanya kegagalan offline murni yang diizinkan untuk antrian lokal; penolakan server resmi langsung dilemparkan kembali.
- **File yang Diubah**:
  `frontend/src/services/staff.ts` (pada `acceptTask` dan `updateTaskStatus`)
- **Test Validasi**:
  `frontend/src/test/staff.test.tsx` -> `re-throws server 400/409 error on task status transition instead of mutating mock store`.

---

### WL-AUD-003: Reaktivitas Data dan Integrasi Auth pada Halaman Warga
- **ID**: `WL-AUD-003`
- **Tanggal**: 30 Oktober 2026
- **Modul**: G2 Warga / UI Pages (`frontend/src/app/app/`)
- **Deskripsi Masalah**:
  Halaman dashboard warga (`/app`), ringkasan poin (`/app/waste-points`), dan kalkulator dampak (`/app/dampak`) menggunakan mock data statis yang tidak mencerminkan profil pengguna yang sedang login (`useAuth()`) atau riwayat penjemputan nyata.
- **Root Cause Analysis**:
  Data mock hardcoded ditaruh langsung di level render komponen tanpa hook asynchronous ke service layer.
- **Solusi yang Diterapkan**:
  1. Menghubungkan hook `useAuth()` untuk mendapatkan nama pengguna aktif (`user?.full_name`) dan avatar.
  2. Memanggil `collectionService.getMyPickupRequests()` secara asinkron saat mount untuk mengambil data setoran riil.
  3. Memanggil `collectionService.getPointsBalance()` dan `getPointsLedger()` secara dinamis.
  4. Menjaga graceful fallback data lokal jika backend offline.
- **File yang Diubah**:
  - `frontend/src/app/app/page.tsx`
  - `frontend/src/app/app/waste-points/page.tsx`
  - `frontend/src/app/app/dampak/page.tsx`
- **Test Validasi**:
  Eksekusi `npm run build` Next.js berhasil mengompilasi seluruh 37 rute statis tanpa type error atau SSR issue.

---

### WL-AUD-004: Serialisasi Row-Level Locking pada Pemilahan Fasilitas
- **ID**: `WL-AUD-004`
- **Tanggal**: 30 Oktober 2026
- **Modul**: G4 TPS3R / Facility Processing (`backend/app/modules/facility/service.py`)
- **Deskripsi Masalah**:
  Pada operasi `sort_received_waste`, dua operator yang memproses tumpukan sampah secara paralel dapat membaca nilai `incoming_unprocessed_kg` yang sama dan melakukan pengurangan secara konkuren, yang berpotensi menghasilkan stok negatif (inventory deficit anomaly).
- **Root Cause Analysis**:
  Query pemuatan model `Facility` tidak menyertakan klausa pesimis `with_for_update()`.
- **Solusi yang Diterapkan**:
  Menambahkan `with_for_update()` pada session query fasilitas:
  ```python
  stmt = (
      select(Facility)
      .where(Facility.id == facility_id)
      .with_for_update()
  )
  ```
  Ini menjamin serialisasi transaksi di level RDBMS sehingga pengurangan stok incoming dan penambahan output terpilah selalu konsisten.
- **File yang Diubah**:
  `backend/app/modules/facility/service.py`
- **Test Validasi**:
  `backend/tests/api/test_phase4_facility_and_waste_bank.py` (5 passed) dan `test_phase3_petugas_dispatch.py`.

---

### WL-AUD-005: Penambahan Mapping Status Domain pada Komponen `StatusBadge`
- **ID**: `WL-AUD-005`
- **Tanggal**: 30 Oktober 2026
- **Modul**: Shared UI Components (`frontend/src/components/ui/StatusBadge.tsx`)
- **Deskripsi Masalah**:
  Status-status operasional lanjutan yang dikembalikan oleh backend (seperti `INSPECTION`, `WEIGHED`, `SAFELY_DISPOSED`, `HARVESTED`, `PROCESSED_CONFIRMED`, `RESOLVED`, `BATCHED`, `DELIVERED_TO_FACILITY`, `IN_TRANSIT`) tidak dikenali oleh helper `getStatusBadgeConfig`, sehingga menghasilkan badge berlabel "Status Tidak Diketahui".
- **Root Cause Analysis**:
  Kamus konfigurasi badge belum diperbarui mengikuti penambahan state machine dari Tahap 3 hingga Tahap 6.
- **Solusi yang Diterapkan**:
  Menambahkan pemetaan lengkap untuk semua status domain ke warna varian Semantic Badge (warning, info, success, neutral) dan label bahasa Indonesia yang ramah operasional.
- **File yang Diubah**:
  `frontend/src/components/ui/StatusBadge.tsx`
- **Test Validasi**:
  `frontend/src/test/collection.test.tsx` -> `StatusBadge renders correct badge variant for extended statuses (INSPECTION, WEIGHED, SAFELY_DISPOSED)`.
