# DAFTAR KANDIDAT CLEANUP & ANALISIS AWAL
**Dokumen:** `01_CLEANUP_CANDIDATES.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Waktu Audit:** 1 November 2026, 02:18:00+08:00  
**Status:** TAHAP 1 COMPLETE (Evaluasi Awal Kandidat)

---

## 1. Prinsip Penilaian Kandidat Cleanup

Berdasarkan **Master Instruction 0.3 & 0.4**:
- Tidak ada file yang dihapus pada Tahap 1. Tahap 1 hanya menghasilkan inventarisasi kandidat dan bukti awal.
- Keputusan pembersihan wajib berbasis bukti (*evidence-based*): tidak menghapus file aktif, tidak merusak alur kerja peran, tidak menghapus basis data, tidak menghapus rahasia/env, dan tidak merusak visual *source of truth*.

---

## 2. Tabel Kandidat Temuan & Rekomendasi Awal

| ID | Jalur Berkas / Direktori | Kategori | Temuan & Bukti | Risiko | Rekomendasi Awal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CAN-01** | `node_modules/.vite/vitest/` | Build Artifact / Cache | Cache eksekusi vitest di root. Muncul sebagai untracked di git karena root `.gitignore` tidak mencantumkan `node_modules/`. | **SANGAT RENDAH** | **SAFE_TO_REMOVE** pada Tahap 3, serta perbaiki root `.gitignore`. |
| **CAN-02** | `root/.coverage` | Test Coverage Output | Berkas binary hasil `pytest-cov` di root. Sudah ada dalam `.gitignore` root, tidak di-track oleh git. | **SANGAT RENDAH** | **SAFE_TO_REMOVE** (dapat di-generate ulang kapan pun saat `pytest --cov` dijalankan). |
| **CAN-03** | `backend/wastelink.db` | User Data / Local Database | Database lokal SQLite (~1.07 MB) berisi data seed demo Kedas. Saat ini berstatus untracked karena `*.db` belum di-ignore. | **KRITIS** | **KEEP / DO NOT DELETE**. Tambahkan aturan `*.db` dan `wastelink.db` ke `.gitignore` agar tidak sengaja ter-commit. |
| **CAN-04** | `docs/Contoh_UI/*.jpg` | Design Asset (Historis) | Berisi 3 foto referensi UI mockup prototype (`17a7bf38...jpg`, `b8c0c089...jpg`, `fa600161...jpg`). Dua di antaranya identik hash dengan `frontend/public/images/mosaic-*.jpg`. | **SEDANG** | **KEEP**. Merupakan artefak referensi desain historis dalam `docs/`, sedangkan `frontend/public/images/` adalah aset aktif runtime web. |
| **CAN-05** | `PAKET_DOKUMEN_KEDAS_AI_WEB_INNOVATION/` | Dokumentasi Inti | 7 dokumen PRD, SRS, HDD, Design System, dan AI Runtime Prompt Library. | **TINGGI** | **KEEP**. Sumber pengetahuan esensial arsitektur AI Kedas. |
| **CAN-06** | `mobile/src/lib/offline-draft.ts` | Active Source Code | Mengandung kata `draft`, namun terbukti merupakan modul logika penyimpanan draf offline di aplikasi mobile warga. | **KRITIS** | **KEEP**. Bukan file sampah, melainkan fitur active offline queue. |
| **CAN-07** | Root `.gitignore` (Aturan Tidak Lengkap) | Configuration Policy | Root `.gitignore` belum memasukkan `node_modules/`, `*.db`, `*.sqlite*`, `.next/`. | **RENDAH** | **UPDATE_POLICY**. Tambahkan ignore rule yang presisi pada Tahap 3. |

---

## 3. Verifikasi File Suffix Khusus (Old / Backup / Copy / Temp)

Pencarian mendalam di seluruh workspace menggunakan pola regex `copy|backup|temp|old|\(1\)|\.tmp`:
- **Hasil:** **Nihil berkas sampah**. Tidak ditemukan file sisa seperti `page_old.tsx`, `backup.ts`, atau `test (1).py` di direktori kode.
- Satu-satunya kecocokan adalah `mobile/src/lib/offline-draft.ts` yang telah diverifikasi sebagai modul aplikasi mobile aktif.

---

## 4. Analisis Duplikasi Konten (SHA256 Content Hash)

Dari pemindaian hash SHA256 terhadap seluruh berkas non-git (>100 bytes):
1. **Tooling Caches:**
   - `.mypy_cache/CACHEDIR.TAG` identik dengan `backend/.mypy_cache/CACHEDIR.TAG` (file tag cache resmi Python tool).
   - `.pytest_cache/CACHEDIR.TAG` dan `README.md` identik dengan yang di `backend/.pytest_cache/` (file tag cache resmi Pytest).
2. **Design Assets:**
   - `docs/Contoh_UI/17a7bf...jpg` == `frontend/public/images/mosaic-1.jpg`
   - `docs/Contoh_UI/fa6001...jpg` == `frontend/public/images/mosaic-2.jpg`
   - **Keputusan:** File dalam `frontend/public/images/` adalah aset publik yang di-render oleh komponen Next.js Image di Public Main Website. File dalam `docs/Contoh_UI/` adalah dokumentasi referensi desain asli. Keduanya dipertahankan sesuai domain fungsinya masing-masing.

---
*Kesimpulan Tahap 1: Seluruh kandidat telah dianalisis risikonya. Tidak ada kode aktif yang akan dihapus.*
