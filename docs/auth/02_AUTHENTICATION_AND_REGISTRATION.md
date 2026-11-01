# 02. Spesifikasi Autentikasi dan Registrasi Akun — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Identity & Access Management Specialist  
**Status**: Implemented & Verified

---

## 1. Arsitektur Otentikasi & Sesi Pengguna

Kedas menerapkan kombinasi **Bearer Token Opaque Server-Side** dan **HTTP-Only Secure Cookie** untuk otentikasi RESTful API yang aman:
- **Penyimpanan Sesi Server**: Tabel `auth_sessions` menyimpan hash token (`token_hash`), `expires_at` (24 jam), `user_agent`, dan `ip_address`.
- **Hashing Kredensial**: Menggunakan Argon2id via Passlib dengan salt acak yang tidak dapat dibalik.
- **Pencegahan Enumerasi Akun**: Respon terhadap kredensial salah menghasilkan pesan seragam: `"Email/Nomor telepon atau kata sandi tidak valid"` dengan status HTTP 401, mencegah penyerang memetakan keberadaan akun terdaftar.
- **Isolasi Status Akun**: Pengguna dengan status `SUSPENDED` atau `DEACTIVATED` diblokir langsung di level middleware autentikasi dengan status HTTP 403.

---

## 2. Alur Registrasi Warga Baru (Citizen Signup)

1. **Endpoint**: `POST /api/v1/auth/register`
2. **Payload Masukan**:
   - `full_name`: Nama lengkap warga (minimal 3 karakter).
   - `email`: Alamat email unik (opsional jika nomor telepon diberikan).
   - `phone`: Nomor WhatsApp/HP aktif unik.
   - `password`: Kata sandi minimal 8 karakter.
3. **Validasi & Penetapan Aturan Server**:
   - Backend memverifikasi keunikan email dan nomor telepon.
   - Akun baru otomatis memperoleh status `ACTIVE` dan role dasar `USER` dalam tabel `user_roles`.
   - Token sesi langsung diterbitkan sehingga warga langsung terotentikasi dan diarahkan ke dasbor warga `/app`.

---

## 3. Pemulihan Akses & Pengelolaan Akun (Password Recovery & Lifecycle)

- **Halaman `/lupa-password`**:
  - Menyediakan form input pengenal (email / nomor telepon) dengan validasi regex format.
  - Memberikan umpan balik konfirmasi pengiriman yang aman tanpa membocorkan eksistensi akun.
  - Menyediakan catatan kredensial sandbox resmi untuk keperluan evaluasi hackathon.
  - Menyediakan SOP offline sekretariat TPS3R dan kontak WhatsApp koordinator banjar untuk verifikasi fisik.
- **Pembaruan Profil (`PATCH /api/v1/me`)**:
  - Warga dapat memperbarui nama lengkap dan nomor telepon kontak penjemputan.
  - Perubahan data tercatat dalam jejak sesi aktif.
- **Manajemen Alamat (`/api/v1/me/addresses`)**:
  - Warga dapat mendaftarkan beberapa titik jemput (rumah utama, toko, bale) dan menentukan satu alamat `is_default`.
  - Akses alamat dilindungi dari IDOR (`user_id == current_user.id`).
