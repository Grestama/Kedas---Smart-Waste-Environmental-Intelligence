# 01. Peta Perjalanan Registrasi dan Autentikasi — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Identity & Access Management Engineer  
**Status**: As-Built Analysis

---

## 1. Peta Perjalanan Akun (Account Journeys)

### Journey A: Warga Baru (Citizen Signup to First Deposit)
```mermaid
flowchart TD
    J1[1. Pengunjung Membuka /daftar] --> J2[2. Isi Nama, Email/No HP, Password]
    J2 --> J3[3. Setujui Syarat & Ketentuan Banjar]
    J3 --> J4[4. Submit Form Registrasi]
    J4 --> J5{Validasi Server}
    J5 -- Gagal (Email Kembar / Password Lemah) --> J2
    J5 -- Sukses --> J6[5. Backend Buat Akun: Role USER, Status ACTIVE]
    J6 --> J7[6. Terbitkan Sesi Server-Side & Cookie Auth]
    J7 --> J8[7. Masuk ke Dasbor Warga /app]
    J8 --> J9[8. Tambah Alamat Penjemputan di /app/profil]
    J9 --> J10[9. Siap Membuat Permintaan Jemput di /app/setoran/baru]
```
- **Kondisi As-Built**: Berjalan penuh. Server-side rule menetapkan default role `USER` dan status `ACTIVE`.
- **Temuan Gap**: Form registrasi di client sempat memiliki fallback mock saat offline; penolakan duplikasi email kini diteruskan secara aman ke UI tanpa membocorkan data pengguna lain.

---

### Journey B: Calon Petugas Pengangkut Sampah (Collector Application & Approval)
```mermaid
flowchart TD
    C1[1. Warga Terdaftar Login] --> C2[2. Mengakses Menu Pengajuan Petugas]
    C2 --> C3[3. Isi Tipe Kendaraan & Catatan Wilayah Operasional]
    C3 --> C4[4. Kirim POST /collector-applications]
    C4 --> C5[5. Status Tercatat: PENDING]
    C5 --> C6[6. Admin Membuka /admin/pengajuan-petugas]
    C6 --> C7{Keputusan Admin}
    C7 -- Tolak --> C8[Status REJECTED + Alasan Wajib Disimpan]
    C7 -- Setujui --> C9[Status APPROVED + Insert Role COLLECTOR di user_roles]
    C9 --> C10[7. Rekam Event di audit_logs]
    C10 --> C11[8. Pengguna Beralih ke Peran COLLECTOR]
    C11 --> C12[9. Akses Dasbor /staff Terbuka Secara Sah di Backend]
```
- **Kondisi As-Built**: Backend API (`POST /collector-applications`, `POST /admin/collector-applications/{id}/review`) dan panel Admin (`/admin/pengajuan-petugas`) sudah terimplementasi dan teruji di `test_phase3_petugas_dispatch.py`.
- **Area Peningkatan UX**: Menyediakan form interaktif permohonan petugas langsung pada halaman profil warga `/app/profil` agar calon petugas tidak perlu mengakses API manual.

---

### Journey C: Mitra Daur Ulang & Pengolah Material (B2B Marketplace)
- **Alur**:
  1. Perwakilan mitra mendaftar dengan akun dasar.
  2. Profil mitra dan nomor izin usaha didaftarkan ke tabel `partners`.
  3. Administrator platform memverifikasi kelayakan izin usaha dan status aktif.
  4. Pengguna diberikan grant peran `PARTNER` dengan batasan akses ke penawaran batch di `/api/v1/marketplace/batches`.
- **Kondisi As-Built**: Diverifikasi via `test_phase5_marketplace_organic_and_b2b.py`. Akses pembelian material diblokir jika mitra belum berstatus terverifikasi.

---

### Journey D: Pengelola Fasilitas TPS3R & Bank Sampah
- **Alur**:
  1. Profil fasilitas TPS3R didaftarkan dalam tabel `facilities`.
  2. Operator ditugaskan oleh Admin melalui keanggotaan `facility_id` spesifik.
  3. Operator fasilitas hanya berwenang mencatat penerimaan sampah dan pemilahan pada fasilitas tempat ia bernaung.
- **Kondisi As-Built**: Diverifikasi via `test_phase4_facility_and_waste_bank.py`. Operator Fasilitas A diblokir saat mencoba mengubah stok Fasilitas B.

---

### Journey E: Admin & Role Privileged
- **Alur**:
  - Pendaftaran publik **dilarang keras** memberikan role `ADMIN` atau hak istimewa lainnya.
  - Role `ADMIN` hanya dapat diberikan melalui seed awal atau pemberian oleh Super Admin yang tercatat dalam `audit_logs`.
- **Kondisi As-Built**: Diverifikasi via `test_rbac_and_roles.py` dan `test_journey_2_permissions_idor.py`. Setiap percobaan injeksi payload role dari client publik secara tegas diabaikan oleh backend.
