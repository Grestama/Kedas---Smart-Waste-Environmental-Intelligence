# 02. Hasil Pengujian Siklus Akun & Autentikasi — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: QA Automation Engineer  
**Status**: 100% Passed

---

## 1. Rincian Pengujian Autentikasi & Akun (`tests/api/test_auth_phase2.py`)

1. **`test_register_and_login_flow` (PASSED)**:
   - Menguji registrasi warga baru dengan payload valid.
   - Memverifikasi akun berstatus `ACTIVE` dan mendapatkan role `USER`.
   - Menguji login dengan kredensial baru, penerbitan cookie sesi, dan akses ke endpoint `/me`.
2. **`test_invalid_credentials_prevent_account_enumeration` (PASSED)**:
   - Menguji percobaan login dengan email acak yang tidak terdaftar.
   - Menguji percobaan login dengan email terdaftar tetapi password salah.
   - Memverifikasi kedua percobaan menghasilkan kode status HTTP 401 yang identik dengan pesan kesalahan generik.
3. **`test_suspended_user_blocked` (PASSED)**:
   - Menguji pengguna yang ditandai dengan `account_status = 'SUSPENDED'`.
   - Memverifikasi permintaan login ditolak dengan HTTP 403 Forbidden.

---

## 2. Pengujian Frontend AuthContext & Guard (`frontend/src/test/auth.test.tsx`)

1. **`renders login form with role switcher tabs` (PASSED)**: Memverifikasi tab warga, petugas, admin.
2. **`logs in successfully as user and redirects` (PASSED)**: Memverifikasi persistensi sesi dan pengalihan ke `/app`.
3. **`logs in as collector and redirects to /staff` (PASSED)**: Memverifikasi pengalihan petugas.
4. **`clears user and token when logout is triggered` (PASSED)**: Memverifikasi pencabutan token dan penghapusan state lokal.
5. **`AuthGuard protects restricted dashboard routes` (PASSED)**: Memverifikasi proteksi rute terhadap pengguna tanpa sesi.

---

## 3. Pengujian Alamat & Profil (`tests/api/test_phase2_warga_source.py`)
- `test_multi_address_management_and_default_toggle` (PASSED): Memverifikasi toggle alamat default dan isolasi antar pengguna.
- `test_cannot_book_with_other_user_address` (PASSED): Memverifikasi penolakan pembuatan tiket penjemputan dengan alamat milik pengguna lain (Anti-IDOR).
