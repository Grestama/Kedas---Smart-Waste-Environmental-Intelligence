# Laporan Akhir Audit Registrasi dan Manajemen Identitas (IAM) — Kedas

**Proyek**: Kedas (sebelumnya WasteLink Bali)  
**Versi**: 1.0.0-hackathon-release  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Senior Full-Stack Architect & IAM Engineer  
**Status**: **VERIFIED & SECURED**

---

## 1. Peta Jalur Pendaftaran dan Onboarding

Sistem Kedas memberlakukan segmentasi alur registrasi untuk mencegah eskalasi hak istimewa (*privilege escalation*):

### A. Jalur Warga Desa (Public Self-Registration)
- **Rute**: `/daftar` $\rightarrow$ `POST /api/v1/auth/register`
- **Aturan**: Hanya membutuhkan data minimal (Nama Lengkap, Email/No WhatsApp, Banjar, Kata Sandi).
- **Hasil**: Server secara eksklusif menetapkan peran dasar `USER` dengan status akun `ACTIVE`. Setiap payload yang mencoba menyuntikkan role `ADMIN` atau peran operasional lain diabaikan secara tegas oleh server.

### B. Jalur Calon Petugas Pengangkut Sampah (Collector Role Application)
- **Rute**: `/app/profil` $\rightarrow$ `POST /api/v1/collector-applications`
- **Aturan**: Warga terdaftar mengajukan permohonan dengan menyertakan jenis kendaraan pengangkut (Motor roda tiga, Pick-up, Gerobak listrik), catatan ketersediaan wilayah, dan komitmen keselamatan APD.
- **Hasil**: Permohonan berstatus `PENDING`. Status permohonan dipantau langsung oleh pemohon di `/app/profil`.
- **Persetujuan Admin**: Koordinator Banjar meninjau di `/admin/pengajuan-petugas`. Jika disetujui, peran `COLLECTOR` disisipkan ke tabel `user_roles` dan pemohon dapat beralih ke meja kerja petugas `/staff`. Jika ditolak, alasan penolakan wajib dicatat dan ditampilkan kepada pemohon.

### C. Jalur Fasilitas TPS3R & Bank Sampah
- Operator TPS3R ditugaskan dengan batasan `facility_id` spesifik. Operator Fasilitas A diblokir saat mencoba mengakses atau memutasi stok Fasilitas B.
- Pengurus bank sampah memiliki hak akses khusus untuk mencatat tabungan rupiah nasabah, yang dipisahkan secara struktural dari poin promosi platform Kedas.

### D. Jalur Mitra Daur Ulang & B2B
- Mitra industri daur ulang mendaftarkan nomor izin usaha daur ulang. Akses transaksi penebusan batch material di bursa Kedas hanya dibuka setelah admin memverifikasi legalitas mitra.

### E. Jalur Akun Privileged (Admin & Koordinator)
- Dilarang keras melalui pendaftaran publik. Disediakan melalui seed awal atau pemberian hak oleh Super Admin yang tercatat dalam `audit_logs`.

---

## 2. Desain Autentikasi dan Sesi Aktual

1. **Opaque Server-Side Session Token**:
   - Token sesi diacak dengan UUIDv4 dan disimpan dalam hash SHA-256 pada tabel `auth_sessions`.
   - Masa berlaku sesi: 24 jam (`expires_at`), dengan dukungan pencabutan eksplisit (`revoked_at`) saat logout.
2. **Keamanan Kredensial**:
   - Menggunakan hashing Argon2id / PBKDF2 via Passlib dengan salt kriptografis.
   - Pengecekan status akun: Akun berstatus `SUSPENDED` atau `DEACTIVATED` langsung ditolak di layer autentikasi dengan status HTTP 403 Forbidden.
3. **Pencegahan Enumerasi Akun**:
   - Respon login terhadap identifier yang tidak terdaftar maupun password yang salah menghasilkan respon HTTP 401 Unauthorized yang identik: `"Email/Nomor telepon atau kata sandi tidak valid"`.

---

## 3. Matriks Hak Akses & Bukti Negative Authorization Tests

| Endpoint / Tindakan | Skenario Uji Akses Ilegal | Respon Backend | Status |
|---|---|---|---|
| `POST /auth/register` | Mengirim parameter `role: "ADMIN"` dalam JSON body | Parameter diabaikan; user tetap mendapat role `USER` | **LULUS** |
| `POST /collector/tasks/{id}/claim` | Akun berstatus `USER` biasa mencoba klaim tugas | HTTP 403 Forbidden | **LULUS** |
| `POST /collector/tasks/{id}/claim` | Petugas berstatus `SUSPENDED` mencoba klaim tugas | HTTP 403 Forbidden | **LULUS** |
| `GET /me/addresses/{id}` | User A mengakses ID alamat kepemilikan User B | HTTP 404 / 403 Forbidden (Anti-IDOR) | **LULUS** |
| `POST /admin/*` | Pengguna non-admin mengakses konsol pengawasan | HTTP 403 Forbidden | **LULUS** |

---

## 4. Batasan Teknis & Rekomendasi Fase Berikutnya
- Saat ini sistem menggunakan simulasi kredensial sandbox pada lingkungan lokal; pengiriman OTP melalui SMS gateway pihak ketiga perlu ditambahkan adapter produksi pada saat pilot lapangan regional.
- Implementasi Multi-Factor Authentication (MFA / TOTP) direkomendasikan untuk peran Administrator sebelum rilis publik skala penuh.
