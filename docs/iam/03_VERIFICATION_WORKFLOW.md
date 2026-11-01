# 03. Alur Kerja Verifikasi & Persetujuan Hak Akses — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Software Architect & QA Lead  
**Status**: Implemented & Verified

---

## 1. Siklus Hidup Permohonan Petugas (`collector_applications`)

State machine permohonan petugas memiliki status diskrit:
- **`DRAFT`**: Krama desa mengisi data formulir armada pengangkut di `/app/profil`.
- **`PENDING`**: Permohonan terkirim ke server dan menunggu tinjauan dari Koordinator Banjar.
- **`APPROVED`**: Disetujui oleh Koordinator Banjar. Sistem secara otomatis menyisipkan peran `COLLECTOR` aktif ke akun pemohon.
- **`REJECTED`**: Ditolak oleh Koordinator Banjar dengan alasan wajib (misal: armada tidak memenuhi standar bak tertutup). Pemohon dapat memperbaiki data dan mengajukan ulang.
- **`SUSPENDED`**: Hak operasional dibekukan sementara jika terdapat pelanggaran SOP keselamatan kerja atau sengketa timbangan berulang.

---

## 2. Antarmuka Verifikasi Admin (`/admin/pengajuan-petugas`)

Antarmuka konsol admin menyediakan kontrol operasional:
1. **Filter Status**: `ALL`, `PENDING`, `APPROVED`, `REJECTED`.
2. **Detail Permohonan**: Nama krama pemohon, nomor kontak telepon, jenis armada kendaraan, tanggal pengajuan.
3. **Modal Penolakan Beralasan**: Saat tombol tolak ditekan, modal mewajibkan pengisian alasan penolakan agar pemohon mendapatkan umpan balik yang adil.
4. **Pencatatan Audit**: Setiap keputusan review tercatat dalam tabel `audit_logs` dengan ID admin pemeriksa, IP address, dan timestamp.
