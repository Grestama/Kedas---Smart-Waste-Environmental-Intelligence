# KEDAS — SECURITY AND DATA INTEGRITY REVIEW
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Versi Dokumen:** 1.0  
**Tanggal:** 30 Oktober 2026  
**Klasifikasi:** Technical Security & Compliance Audit  

---

## 1. Ringkasan Eksekutif Keamanan

Audit keamanan menyeluruh telah dilakukan pada seluruh lapisan platform Kedas (Backend FastAPI, Frontend Next.js, dan Mobile React Native/Expo). Evaluasi difokuskan pada perlindungan data sensitif warga dan wisatawan, pencegahan eskalasi hak akses (*privilege escalation*), pencegahan manipulasi data operasional (*anti-IDOR* dan *mass balance integrity*), serta pencegahan *greenwashing* pada pelaporan metrik ESG/lingkungan.

Hasil audit:
- **Zero Critical Vulnerabilities:** Tidak ditemukan kerentanan kritis yang memungkinkan akses tidak sah ke database atau eksekusi kode jarak jauh.
- **Strict Role-Based Access Control (RBAC):** Seluruh endpoint operasional dan administratif dilindungi dependensi otorisasi deklaratif.
- **Zero PII Exposure on Public QR Passports:** Endpoint paspor publik (`/api/v1/pickup-requests/passport/public/{code}`) secara deterministik menyaring seluruh data identitas pribadi (PII).

---

## 2. Rincian Tinjauan Keamanan Per Aspek

### 2.1 Autentikasi dan Manajemen Sesi
- **Penyimpanan Password:** Menggunakan algoritma hash adaptif argon2/bcrypt dengan salt unik per pengguna. Password mentah tidak pernah dicatat dalam log sistem.
- **Sesi & Token:** Menggunakan token sesi kriptografis berbasis basis data dengan masa berlaku terbatas, diikat ke IP/User-Agent, dan dicabut (*revoked*) secara instan saat pengguna logout.
- **Anti-Enumerasi Akun:** Endpoint login (`/api/v1/auth/login`) mengembalikan pesan generik yang sama (*"Identitas atau password tidak valid"*) terlepas dari apakah email/telepon terdaftar atau tidak, mencegah teknik *user enumeration*.
- **Pemblokiran Akun Nonaktif:** Pengguna dengan status `SUSPENDED` atau `DEACTIVATED` ditolak secara otomatis oleh middleware otorisasi pada setiap permintaan.

### 2.2 Role-Based Access Control (RBAC) & Anti-Escalation
- **8 Role Sistem:** `USER`, `COLLECTOR`, `DISPATCHER`, `FACILITY_OPERATOR`, `WASTE_BANK_STAFF`, `PARTNER`, `COMMUNITY_LEADER`, `ADMIN`.
- **Pencegahan Self-Promotion:** Pendaftaran role kolektor lapangan, operator fasilitas, dan mitra daur ulang berstatus `PENDING` dan wajib diverifikasi manual oleh pengguna ber-role `ADMIN`. Pengguna tidak dapat menaikkan hak aksesnya sendiri.
- **Konteks Role Aktif:** Pergantian peran aktif (`preferred_active_role`) divalidasi ketat terhadap daftar peran yang sah dan terverifikasi di basis data; peran yang belum disetujui akan ditolak dengan error 403 Forbidden.

### 2.3 Pencegahan Insecure Direct Object References (Anti-IDOR)
- **Alamat Warga (`UserAddress`):** Setiap operasi baca, ubah, dan hapus alamat memverifikasi bahwa `address.user_id == current_user.id` kecuali pemanggil adalah Admin.
- **Tiket Penjemputan (`PickupRequest`):** Pengguna warga hanya dapat melihat tiket penjemputan miliknya sendiri. Petugas lapangan hanya dapat mengakses tiket yang ditugaskan kepadanya atau yang tersedia di wilayah operasionalnya.
- **Paspor Sampah Detail (`/pickup-requests/{id}/passport`):** Hanya dapat diakses oleh pemilik tiket, petugas yang ditugaskan, operator fasilitas terkait, atau admin. Upaya akses lintas pengguna ditolak dengan 403 Forbidden.

### 2.4 Privasi & Perlindungan PII pada QR Paspor Publik
- **Kebutuhan Bisnis:** Paspor sampah perlu memiliki QR code fisik yang ditempel pada wadah atau karung material agar dapat dipindai oleh publik, pengelola kawasan, atau wisatawan yang ingin memeriksa keabsahan alur daur ulang.
- **Solusi Rekayasa:** Endpoint `/api/v1/pickup-requests/passport/public/{public_code}` secara eksplisit dilarang menyertakan:
  - Nama lengkap warga / pelapor.
  - Alamat email dan nomor telepon.
  - Alamat jalan privat dan koordinat rumah presisi.
- **Data yang Ditampilkan Publik:** Hanya kode tracking publik, nama banjar/desa operasional, kategori material sampah, estimasi dan berat aktual terverifikasi, status pemrosesan saat ini, dan riwayat waktu serah-terima.

### 2.5 Isolasi Multi-Tenant Bisnis HOREKA & Mitra Daur Ulang
- **Isolasi Data Komersial:** Data transaksi, volume sampah, dan riwayat setoran hotel, restoran, dan kafe diisolasi berdasarkan identitas tenant (`partner_id`).
- **Pencegahan Kebocoran Kompetitor:** Mitra komersial A tidak dapat melihat ledger, komposisi sampah, atau tingkat daur ulang dari Mitra komersial B.
- **Disclaimer Hukum:** Semua ekspor ledger B2B menyertakan disclaimer bahwa laporan tersebut adalah catatan operasional internal dan bukan dokumen audit lingkungan berlisensi resmi pemerintah.

### 2.6 Integritas Matematika Neraca Massa (Mass Balance)
- **Formula Validasi Ketat:**
  $$\text{Input Weight} = \sum \text{Output Fraction Weights} + \text{Residue Weight} \pm \text{Permissible Tolerance}$$
- **Pencegahan Manipulasi Data:** Operator fasilitas tidak dapat menerbitkan sertifikat pemrosesan atau mengalokasikan stok material daur ulang yang melebihi jumlah sampah yang sebenarnya masuk ke fasilitas.
- **Penolakan Anomali:** Input dengan selisih yang melebihi batas toleransi yang ditetapkan langsung ditolak dengan `ValidationError`.

### 2.7 Audit Trail & Idempotency Key
- **Tabel `audit_logs`:** Mencatat identitas aktor (`actor_id`), alamat IP, kode tindakan, ID entitas target, serta *snapshot* perubahan data (`old_values` dan `new_values`).
- **Idempotency Protection:** Pemesanan penjemputan dan transaksi setoran tabungan sampah dilengkapi `idempotency_key` untuk mencegah pemesanan ganda akibat gangguan jaringan di lapangan atau penekanan tombol berulang.
- **Security Headers:** Middleware keamanan menyematkan header `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, dan Content-Security-Policy standar.
