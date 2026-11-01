# LOG PERUBAHAN PEMBERSIHAN REPOSITORY (CHANGELOG)
**Dokumen:** `03_CLEANUP_CHANGELOG.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Waktu Eksekusi:** 1 November 2026, 02:21:30+08:00  
**Status:** TAHAP 3 COMPLETE (Pembersihan Terukur & Terverifikasi)

---

## 1. Ringkasan Aksi Pembersihan

Pembersihan pada Tahap 3 dilakukan secara konservatif dan berbasis bukti dengan prinsip:
1. Menghapus hanya build artifacts / test cache yang tidak sengaja terbentuk di root dan terbukti dapat dibuat ulang.
2. Memperbaiki kebijakan `.gitignore` root agar cache dan database lokal tidak masuk ke version control.
3. Menjaga 100% berkas kode sumber, aset desain, migrasi database, dan data operasional lokal.

---

## 2. Rincian Aksi per Item

### 2.1 Pembersihan Root `node_modules/` (CAN-01)
- **Jalur Asal:** `node_modules/.vite/vitest/`
- **Tipe:** Build Artifact & Test Cache
- **Aksi:** `DELETE`
- **Alasan & Bukti:** Root repository tidak memiliki `package.json` (hanya `frontend/` dan `mobile/` yang memilikinya). Direktori `node_modules/` di root hanya berisi cache Vitest dari eksekusi historis di level root.
- **Dampak:** Bersih dari pelacakan Git, menghemat ruang disk, menghilangkan untracked clutter.
- **Validasi:** `npm test` di `frontend/` dan `mobile/` tetap berjalan lancar 100%.

### 2.2 Pembersihan Root `.coverage` (CAN-02)
- **Jalur Asal:** `.coverage` (Root)
- **Tipe:** Test Coverage Output Binary (Python)
- **Aksi:** `DELETE`
- **Alasan & Bukti:** Berkas binary temporer yang dihasilkan oleh plugin `pytest-cov`. Sudah tercantum dalam `.gitignore` namun tertinggal di working tree.
- **Dampak:** Aman, dapat digenerasi ulang secara otomatis saat perintah coverage backend dieksekusi.

### 2.3 Pembaruan Root `.gitignore` (CAN-07)
- **Jalur:** `.gitignore` (Root)
- **Tipe:** Repository Configuration
- **Aksi:** `UPDATE_POLICY`
- **Perubahan yang Ditambahkan:**
  - `node_modules/` (Mencegah folder dependensi root masuk ke git)
  - `*.db`, `*.sqlite`, `*.sqlite3` (Melindungi basis data lokal seperti `backend/wastelink.db` agar tidak sengaja ter-commit)
  - `.next/`, `dist/`, `build/` (Melindungi artefak kompilasi framework)
- **Dampak:** `backend/wastelink.db` kini otomatis berstatus ignored oleh Git tanpa menghapus berkasnya di disk.

---

## 3. Analisis Berkas yang Dipertahankan (Preserved Items)

1. **`backend/wastelink.db`:**
   - Database lokal SQLite (~1.07 MB) berisi seed demo data akun warga, petugas, hotel, dan banjar.
   - **Tindakan:** **DIPERTAHANKAN (KEEP)** dan diamankan dengan ignore rules.
2. **`frontend/public/images/` (`hero-cleanup.jpg`, `mosaic-1.jpg`, `mosaic-2.jpg`):**
   - Aset visual aktif yang di-render oleh Next.js Image di Public Main Website.
   - **Tindakan:** **DIPERTAHANKAN (KEEP)**.
3. **`docs/Contoh_UI/`:**
   - Foto referensi desain awal dari prototype.
   - **Tindakan:** **DIPERTAHANKAN (KEEP)** sebagai artefak dokumentasi historis.
4. **`PAKET_DOKUMEN_KEDAS_AI_WEB_INNOVATION/`:**
   - Bundel dokumen spesifikasi resmi arsitektur Kedas AI.
   - **Tindakan:** **DIPERTAHANKAN (KEEP)**.

---
*Status: Seluruh perubahan tercatat rapi dan dapat dipertanggungjawabkan.*
