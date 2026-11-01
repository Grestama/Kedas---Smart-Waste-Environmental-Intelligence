# WasteLink Bali — Daftar Temuan Audit Sistem (Audit Findings)
**Versi Dokumen:** 1.0  
**Tanggal Audit:** 30 Oktober 2026  
**Auditor:** Principal Software Engineer & Application Security Auditor  

---

## Matriks Temuan Berdasarkan Tingkat Keparahan (Severity Summary)

| Finding ID | Severity | Domain Terdampak | Judul Temuan | Status |
|---|---|---|---|---|
| **WL-AUD-001** | **High** | G1 (Warga) | `collection.ts` menelan error HTTP dari server dan mengembalikan objek tiruan (mock) saat permohonan setoran gagal atau dibatalkan | Terkonfirmasi |
| **WL-AUD-002** | **High** | G2 (Petugas) | `staff.ts` menelan error status transisi, inspeksi, dan penimbangan dari server lalu mengubah store mock lokal | Terkonfirmasi |
| **WL-AUD-003** | **Medium** | G1 (Warga) | Dasbor beranda warga (`/app`), poin (`/app/waste-points`), dan dampak (`/app/dampak`) masih memakai konstanta mock preview alih-alih data sesi & API dinamis | Terkonfirmasi |
| **WL-AUD-004** | **Medium** | G4, G5 (TPS3R/TPST) | Risiko *race condition* pada pemilahan stok (`record_sorting_process`) tanpa row lock eksplisit pada entitas fasilitas | Terkonfirmasi |
| **WL-AUD-005** | **Low** | G1, G2, G4 | Konfigurasi pemetaan badge status pada `frontend/src/tokens/index.ts` belum mencakup status operasional lengkap (`INSPECTION`, `WEIGHED`, `SAFELY_DISPOSED`, `HARVESTED`) | Terkonfirmasi |

---

## Rincian Temuan Audit

### 1. WL-AUD-001: Silent Fallback pada Mutasi Setoran Warga
- **Severity:** High
- **Likelihood:** Medium
- **Impact:** High
- **Confidence:** Confirmed
- **Origin:** Pre-existing (Sisa scaffold tahap awal frontend)
- **Fixability:** Safe to fix
- **Affected Roles/Domains:** G1 (Warga / Rumah Tangga), G3 (Supervisor)
- **Lokasi Kode:** [frontend/src/services/collection.ts](file:///frontend/src/services/collection.ts#L199-L227) dan [frontend/src/services/collection.ts](file:///frontend/src/services/collection.ts#L342-L363)
- **Bukti Kode:**
  ```typescript
  // createPickupRequest catch block
  try {
    const res = await apiClient.post<PickupRequest>("/pickup-requests", payload);
    return res;
  } catch (err) {
    if (err instanceof ApiError && err.code === "SPECIAL_CATEGORY_BLOCKED") {
      throw err;
    }
    // Mengembalikan simulated request sukses palsu saat server menolak!
    const newMockRequest: PickupRequest = { ... };
    return newMockRequest;
  }
  ```
- **Analisis Dampak:** Jika server melempar error validasi (misal slot jadwal penuh, area tidak aktif, atau token sesi kedaluwarsa), fungsi ini menelan error tersebut dan mengembalikan objek setoran sukses palsu. Pengguna melihat notifikasi "Permintaan berhasil dibuat", padahal transaksi ditolak di server.
- **Rekomendasi Perbaikan:** Jika `err instanceof ApiError` dan `err.status !== 0` (server merespons dengan HTTP 400, 401, 403, 404, 409, 422, 500), lemparkan error kembali (`throw err`) agar UI menampilkan pesan kegagalan yang sebenarnya.

---

### 2. WL-AUD-002: Silent Fallback pada Mutasi Tugas Petugas di Lapangan
- **Severity:** High
- **Likelihood:** Medium
- **Impact:** High
- **Confidence:** Confirmed
- **Origin:** Pre-existing
- **Fixability:** Safe to fix
- **Affected Roles/Domains:** G2 (Petugas Pengangkut / Kebersihan)
- **Lokasi Kode:** [frontend/src/services/staff.ts](file:///frontend/src/services/staff.ts#L170-L195), [frontend/src/services/staff.ts](file:///frontend/src/services/staff.ts#L225-L250), [frontend/src/services/staff.ts](file:///frontend/src/services/staff.ts#L320-L345)
- **Bukti Kode:**
  ```typescript
  export async function updateTaskStatus(id: string, payload: TaskStatusUpdatePayload): Promise<CollectorTask> {
    try {
      const res = await apiClient.post<PickupRequest>(`/collector/tasks/${id}/status`, payload);
      return enrichTaskWithMetadata(res);
    } catch {
      // Mock fallback mutation in-memory
      const task = mockTasksStore.find((t) => t.id === id);
      task.status = payload.status;
      return task;
    }
  }
  ```
- **Analisis Dampak:** Saat petugas mengirim transisi status ilegal atau penimbangan dengan tara > bruto, penolakan server 422 ditelan oleh blok `catch`, dan status tugas diubah secara lokal di browser petugas. Petugas mengira tugas telah selesai padahal ditolak backend.
- **Rekomendasi Perbaikan:** Periksa `err instanceof ApiError && err.status !== 0`, lemparkan error langsung ke caller agar form petugas menampilkan pesan validasi error server secara eksplisit.

---

### 3. WL-AUD-003: Dasbor Warga Menggunakan Data Statis Mock Preview
- **Severity:** Medium
- **Likelihood:** High
- **Impact:** Medium
- **Confidence:** Confirmed
- **Origin:** Pre-existing
- **Fixability:** Safe to fix
- **Affected Roles/Domains:** G1 (Warga)
- **Lokasi Kode:** [frontend/src/app/app/page.tsx](file:///frontend/src/app/app/page.tsx#L25-L27), [frontend/src/app/app/waste-points/page.tsx](file:///frontend/src/app/app/waste-points/page.tsx#L12-L39), [frontend/src/app/app/dampak/page.tsx](file:///frontend/src/app/app/dampak/page.tsx#L10)
- **Bukti Kode:**
  ```tsx
  // UserDashboard
  const latestRequest = mockRequests[0];
  const user = mockUsers.warga;
  ```
- **Analisis Dampak:** Ketika warga login dengan akun riilnya, dasbor utama (`/app`) dan buku besar poin (`/app/waste-points`) tetap menampilkan nama dummy "Ni Wayan Warga" dan transaksi mock lawas alih-alih mengambil data riil dari `/points/balance`, `/points/ledger`, dan `/pickup-requests/mine`.
- **Rekomendasi Perbaikan:** Integrasikan hooks `useAuth()` untuk mendapatkan identitas pengguna aktif, panggil `collectionService.getMyPickupRequests()` dan API poin untuk menampilkan metrik dan histori riil.

---

### 4. WL-AUD-004: Potensi Konkurensi Tanpa Row-Level Locking pada Fasilitas Saat Pemilahan Stok
- **Severity:** Medium
- **Likelihood:** Low
- **Impact:** High
- **Confidence:** Confirmed
- **Origin:** Introduced in Phase 4
- **Fixability:** Safe to fix
- **Affected Roles/Domains:** G4, G5 (Operator TPS3R / TPST)
- **Lokasi Kode:** [backend/app/modules/facility/service.py](file:///backend/app/modules/facility/service.py#L262-L270)
- **Bukti Kode:**
  ```python
  def record_sorting_process(db: Session, req: SortingProcessRequest, actor_id: str, ...) -> list[StockMovement]:
      facility = get_facility(db, req.facility_id)
      current_stock = get_category_stock(db, req.facility_id, req.input_category_id)
      if current_stock < req.input_weight_kg:
          raise ValidationError(...)
  ```
- **Analisis Dampak:** `get_facility` melakukan query `db.get(Facility, id)` standar tanpa `with_for_update()`. Jika dua operator di TPS3R yang sama melakukan pemilahan kategori yang sama pada milidetik yang sama, kedua transaksi dapat membaca stok yang sama dan memotong stok melebihi saldo fisik riil, memicu persediaan negatif.
- **Rekomendasi Perbaikan:** Kunci baris fasilitas dengan `select(Facility).where(Facility.id == req.facility_id).with_for_update()` untuk menserialisasi mutasi stok di fasilitas tersebut.

---

### 5. WL-AUD-005: Pemetaan Badge Status Belum Meliputi Seluruh Status Domain
- **Severity:** Low
- **Likelihood:** Medium
- **Impact:** Low
- **Confidence:** Confirmed
- **Origin:** Pre-existing
- **Fixability:** Safe to fix
- **Affected Roles/Domains:** G1, G2, G4, G11
- **Lokasi Kode:** [frontend/src/tokens/index.ts](file:///frontend/src/tokens/index.ts#L45-L65) dan [frontend/src/components/ui/StatusBadge.tsx](file:///frontend/src/components/ui/StatusBadge.tsx)
- **Bukti Kode:** Status seperti `INSPECTION`, `WEIGHED`, `SAFELY_DISPOSED`, `HARVESTED` belum terdaftar dalam dictionary varian warna, sehingga jatuh ke fallback abu-abu default.
- **Rekomendasi Perbaikan:** Lengkapi dictionary `statusConfig` dengan status-status domain operasional agar warna dan label tampil konsisten di seluruh aplikasi.
