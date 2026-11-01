# 02. Rencana Remediasi (Remediation Plan) — WasteLink Bali

**Tanggal**: 30 Oktober 2026  
**Status Audit**: Tahap 2 — Autonomous Safe Fix & Logic Hardening  
**Prinsip**: Safe remediation within repository boundaries without destructive actions or unauthorized business policy modifications.

---

## 1. Tabel Rencana Perbaikan

| ID Temuan | Severity | Modul | Deskripsi Masalah | Root Cause | Rencana Solusi | File Terdampak | Regression Test | Status |
|---|---|---|---|---|---|---|---|---|
| **WL-AUD-001** | High | G2 Warga (Frontend) | `collectionService` menelan error server nyata dan jatuh kembali ke simulasi mock, menyamarkan kegagalan backend. | `catch (err)` di `createPickupRequest` dan `cancelPickupRequest` tidak membedakan offline network error (`status === 0`) dengan penolakan validasi server (`status 400/409/422`). | Periksa status error HTTP (`err.status !== 0`); jika server merespons kode error, rethrow error ke UI/form agar user melihat pesan validasi riil. | `frontend/src/services/collection.ts` | `frontend/src/test/collection.test.tsx` (`re-throws server rejection ApiError`) | **FIXED** |
| **WL-AUD-002** | High | G3 Petugas (Frontend) | `staffService` menelan status error server pada `acceptTask` dan `updateTaskStatus`, lalu memutasi store lokal mock seolah aksi berhasil. | Error penolakan transisi status atau race condition dari server dianggap fallback offline di seluruh skenario error. | Hanya izinkan fallback mock jika kegagalan adalah koneksi murni (`status === 0`); re-throw semua respon error server (`status !== 0`). | `frontend/src/services/staff.ts` | `frontend/src/test/staff.test.tsx` (`re-throws server 400/409 error on task status transition`) | **FIXED** |
| **WL-AUD-003** | Medium | G2 Warga (Frontend UI) | Halaman beranda warga (`/app`), poin (`/app/waste-points`), dan dampak (`/app/dampak`) menggunakan mock data statis yang tidak terhubung dengan sesi auth dan service riil. | Integrasi frontend-to-service belum disambungkan secara reaktif ke `useAuth()`, `collectionService.getMyPickupRequests()`, dan `collectionService.getPointsBalance()`. | Ganti state statis dengan hook `useAuth()` dan service API terintegrasi, dengan fallback offline ramah saat server belum aktif. | `frontend/src/app/app/page.tsx`<br>`frontend/src/app/app/waste-points/page.tsx`<br>`frontend/src/app/app/dampak/page.tsx` | Next.js Build verification (37/37 static routes compiled successfully) & Vitest | **FIXED** |
| **WL-AUD-004** | Medium | G4 TPS3R (Backend) | Potensi race condition / concurrency anomaly pada pemilahan fasilitas (`sort_received_waste`), dapat menyebabkan inventaris negatif jika diproses paralel. | Operasi pemilahan membaca dan mengurangi `incoming_unprocessed_kg` tanpa mengunci baris fasilitas secara eksplisit di level database. | Tambahkan row-level locking `with_for_update()` pada pemuatan baris `Facility` di session SQLAlchemy sebelum mutasi stok. | `backend/app/modules/facility/service.py` | `backend/tests/api/test_phase4_facility_and_waste_bank.py` | **FIXED** |
| **WL-AUD-005** | Low | UI Components (Frontend) | Komponen `StatusBadge` belum memetakan status domain operasional lanjutan (`INSPECTION`, `WEIGHED`, `SAFELY_DISPOSED`, `BATCHED`, dll.) ke styling badge yang tepat. | Pemetaan status di `StatusBadge.tsx` hanya menangani subset status dasar pickup. | Perluas kamus varian dan label `StatusBadge` untuk mencakup seluruh domain state machine WasteLink Bali secara konsisten. | `frontend/src/components/ui/StatusBadge.tsx` | `frontend/src/test/collection.test.tsx` (`StatusBadge renders correct badge variant for extended statuses`) | **FIXED** |

---

## 2. Kriteria Keberhasilan Perbaikan
1. **Zero Silent Fallback**: Setiap penolakan HTTP server (4xx, 5xx) dilempar langsung ke UI/komponen tanpa disamarkan oleh mock success generator.
2. **Data Consistency**: Mutasi stok fasilitas terlindungi dari race condition dengan serialisasi row-level locking.
3. **Domain Visual Coherence**: Seluruh status lifecycle tervisualisasikan dengan label dan styling yang akurat.
4. **Non-Breaking Verification**: Seluruh rangkaian test suite (Backend, Frontend, Mobile) tetap 100% hijau tanpa ada test yang di-skip atau diabaikan.
