# Catatan Perubahan Akhir (Final Changelog) — Kedas

**Proyek**: Kedas  
**Versi**: 1.0.0-hackathon-release  
**Tanggal**: 30 Oktober 2026

---

## Ringkasan Perubahan Utama (Tahap 1 s/d Tahap 7)

### 1. Penyelarasan Identitas & Branding (Tahap 1 & 2)
- Mengganti seluruh nama tampilan dari **WasteLink Bali** menjadi **Kedas** pada header, navigasi publik, dasbor warga, konsol admin, frame mobile, metadata aplikasi, dan README.
- Menjaga seluruh identifier teknis lama (tabel DB, path API, kunci storage) demi menjamin 100% kompatibilitas mundur.

### 2. Penguatan Siklus Akun & IAM (Tahap 2 & 3)
- Menambahkan formulir pengajuan petugas pengangkut sampah mandiri di halaman profil warga `/app/profil` dengan pilihan armada (Motor roda tiga, Pick-up, Gerobak listrik), catatan pengalaman wilayah, dan komitmen keselamatan APD.
- Menghubungkan alur pengajuan tersebut dengan antrean review admin di `/admin/pengajuan-petugas` lengkap dengan modal penolakan beralasan dan pemberian role `COLLECTOR` otomatis saat disetujui.
- Meningkatkan halaman `/lupa-password` menjadi formulir interaktif mandiri yang aman dan ramah pengujian demo hackathon.

### 3. Integritas Operasional & Domain Invariants (Tahap 4)
- Menerapkan *pessimistic row-level locking* (`with_for_update()`) pada mutasi stok pemilahan fasilitas TPS3R untuk mencegah race condition dan anomali inventaris negatif.
- Mengeliminasi *silent mock fallback* pada service client penjemputan dan tugas petugas sehingga penolakan server nyata (400/409) selalu dilemparkan secara transparan ke UI.

### 4. Desain Sistem Gerak & Aksesibilitas (Tahap 5)
- Menambahkan keyframes animasi terstandar di `globals.css` (`fadeIn`, `scaleIn`, `slideInRight`, `slideUp`).
- Menambahkan dukungan `@media (prefers-reduced-motion: reduce)` pada seluruh animasi global.
- Memperbarui komponen `Modal` dengan backdrop fade-in dan dialog card scale-in.
- Memperbarui komponen `Button` dengan respon taktil `active:scale-[0.98]`.
- Memperbarui komponen `StatCard` dengan efek hover elevasi `hover:-translate-y-0.5 hover:shadow-md`.

### 5. Penjaminan Mutu & Pengujian (Tahap 6 & 7)
- Menambahkan 6 pengujian baru pada test suite frontend vitest (total meningkat dari 89 menjadi **95 tests passed**).
- Memverifikasi total **186 automated tests** lintas backend, frontend, dan mobile lulus 100%.
- Memverifikasi build produksi Next.js 15 berhasil mengompilasi 37 dari 37 rute statis.
- Menyusun naskah demo pitch 3–5 menit dan 7–10 menit di `docs/DEMO_SCRIPT.md`.
- Menyusun daftar kredensial demo di `docs/DEMO_ACCOUNTS.md`.
