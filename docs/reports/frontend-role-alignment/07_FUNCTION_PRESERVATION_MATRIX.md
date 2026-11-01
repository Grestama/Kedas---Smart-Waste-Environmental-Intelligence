# MATRIKS PRESERVASI FUNGSI OPERASIONAL (FUNCTION PRESERVATION MATRIX)
**Dokumen:** `07_FUNCTION_PRESERVATION_MATRIX.md`  
**Status:** Verifikasi Jaminan Fungsionalitas & Zero Regression (Tahap 3)  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Verifikasi Checklist Preservasi Fungsi per Rute & Domain

| Area Pemeriksaan | Public & Guest | Warga (`/app`) | Petugas POS (`/staff`) | Hospitality (`/hospitality`) | Admin (`/admin`) | Status Kepatuhan |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **1. Integritas Rute & Parameter URL** | LULUS | LULUS (`[id]` setoran) | LULUS (`[id]` tugas) | LULUS | LULUS (`rules`, dll.) | **100% PRESERVED** |
| **2. API Service Layer Integration** | LULUS (`aiService`, `collectionService`) | LULUS (`collectionService`, `aiService`) | LULUS (`staffService`, `offlineQueue`) | LULUS (`marketplaceService`, `communityService`) | LULUS (`adminService`, `knowledgeService`) | **100% PRESERVED** |
| **3. Auth & Sesi Pengguna (`AuthGuard`)** | LULUS | LULUS (role USER) | LULUS (role COLLECTOR) | LULUS (tenant scope) | LULUS (role ADMIN) | **100% PRESERVED** |
| **4. Validasi Formulir & Form State** | LULUS (Login/Daftar) | LULUS (Kategori, Kuota, Bobot min. 0.5kg) | LULUS (Bruto > Tara, QC reason) | LULUS (Input timbulan shift) | LULUS (Modal Ingestion RAG) | **100% PRESERVED** |
| **5. Feedback State (Toast & Dialogs)** | LULUS | LULUS (Toast sukses/error asli) | LULUS (Toast timbang & offline info) | LULUS | LULUS (Toast verifikasi & sync) | **100% PRESERVED** |
| **6. Loading, Error & Empty States** | LULUS | LULUS (`DataTable` empty, skeleton) | LULUS (`LoadingSkeleton`, `ErrorState`) | LULUS | LULUS (`ErrorState` with retry) | **100% PRESERVED** |
| **7. Ketahanan Mode Offline Outbox** | N/A | N/A | LULUS (`enqueueWeighing` tetap aktif) | N/A | N/A | **100% PRESERVED** |
| **8. Integritas Data Tanpa Mock Fiktif** | LULUS | LULUS | LULUS | LULUS | LULUS | **100% PRESERVED** |

---

## 2. Rincian Pembuktian Alur Kerja Kritis (Critical User Journeys)

1. **Warga Membuat Permintaan Setoran:**
   - Masuk ke `/app/setoran/baru` -> Opsi kategori dimuat dari `collectionService.getCategories()` -> Pilih jalur penyerahan (`PICKUP` vs `DROP_OFF`) -> Pilih kategori (dapat dibantu modal analisis `VisionUploadModal`) -> Pilih slot jadwal yang memiliki sisa kuota -> Submit menghasilkan ID transaksi sah dan dialihkan otomatis ke `/app/setoran/[id]`.
2. **Petugas Melakukan Penimbangan Lapangan & QC:**
   - Membuka `/staff/tugas/[id]` -> Melakukan transisi status lapangan (Mulai Jalan -> Tiba di Lokasi -> Inspeksi QC) -> Mengisi form QC (ACCEPTED / REJECTED) -> Jika lolos, form timbangan terbuka -> Input bruto dan tara -> Sistem menghitung netto otomatis secara real-time -> Klik simpan mengirim data append-only ke API atau mengamankannya ke `localStorage` jika koneksi terputus (Offline Outbox).
3. **Pengelola Hospitality Memantau Diversi CDOA:**
   - Membuka `/hospitality` -> Memilih properti tenant pada dropdown -> Data kuota harian dan ringkasan timbulan dihitung proporsional terhadap target Pergub Bali 47/2019 -> Riwayat penjemputan B2B ditampilkan dalam tabel terstruktur.
4. **Admin Memverifikasi Regulasi RAG:**
   - Membuka `/admin/pengetahuan` -> Dokumen regulasi terfilter berdasarkan tipe (REGULATION, SOP, CDOA, EDUCATIONAL) -> Menekan tombol 'Unggah / Tambah Dokumen' membuka modal formulir penyerahan dokumen RAG dengan validasi field lengkap.

---

## 3. Hasil Uji Regresi Fungsional

- **Hasil Vitest:** 14 test suite, 126 unit/integration tests **LULUS 100%**.
- **Hasil TypeScript:** `tsc --noEmit` **0 errors**.
- **Hasil ESLint:** `next lint` **0 warnings / 0 errors**.
- **Hasil Runtime Backend Scope:** 0 berkas backend disentuh, 0 skema basis data diubah.
