# KEDAS ARCHITECTURAL DECISION LOG (ADR)
## Log Keputusan Arsitektur dan Rekayasa Sistem Kedas

**Proyek:** Kedas (Community-led Destination Waste Operations & Green Tourism Platform)  
**Dokumen:** Architectural Decision Records (ADR)  
**Status:** Living Document  
**Tanggal:** 2026-10-30T12:33:00+08:00 (WITA)

---

## ADR-01: Pemeliharaan Pola Modular Monolith

- **Konteks:** Sistem saat ini dibangun sebagai modular monolith dengan FastAPI di backend dan Next.js App Router di frontend. Terdapat godaan umum dalam proyek skala hackathon/enterprise untuk memecah sistem menjadi microservices terdistribusi.
- **Keputusan:** Mempertahankan arsitektur **Modular Monolith**. Seluruh boundary domain dipisahkan secara tegas melalui module packages (`app/modules/*`), API sub-routers, dan domain services yang terisolasi.
- **Konsekuensi Positif:** Transaksi database bersifat ACID murni (row-locking, rollback, atomic updates), tidak ada overhead jaringan antar-layanan, zero distributed consensus failures, serta waktu build dan testing yang sangat cepat (<60 detik untuk seluruh suite).
- **Konsekuensi Negatif:** Skalabilitas horizontal dilakukan di tingkat container monolitik, yang sudah lebih dari cukup untuk fase pilot dan ribuan transaksi harian kawasan.

---

## ADR-02: Pemisahan Account Roles dengan Scoped Organization Memberships

- **Konteks:** Seorang individu di Bali sering kali memiliki peran ganda: seorang warga rumah tangga yang juga merupakan prajuru (pengurus) banjar, staf hotel di Sanur, atau relawan kebersihan.
- **Keputusan:** Mempertahankan **8 System Account Roles** (`USER`, `COLLECTOR`, `DISPATCHER`, `FACILITY_OPERATOR`, `WASTE_BANK_STAFF`, `PARTNER`, `COMMUNITY_LEADER`, `ADMIN`) sebagai wewenang otorisasi global/primitif, dan membangun lapisan **Scoped Organization Membership** untuk mengaitkan akun dengan entitas spesifik (misal: ID Banjar, ID Properti Hotel HOREKA, atau ID TPS3R).
- **Konsekuensi Positif:** Satu akun email dapat memiliki multi-keanggotaan tanpa duplikasi kredensial atau duplikasi record `users`. Keamanan dijamin di tingkat API middleware dengan memeriksa apakah user aktif dalam organisasi target.

---

## ADR-03: Versioned Community Destination Operating Agreement (CDOA)

- **Konteks:** Karakteristik pengelolaan sampah di Bali sangat bergantung pada otonomi desa adat/banjar dan regulasi lokal (seperti Pergub Bali No. 47/2019). Jadwal dan kategori yang diterima di satu kawasan berbeda dengan kawasan lain.
- **Keputusan:** Mengimplementasikan CDOA sebagai **versioned digital configuration record** dengan status siklus hidup eksplisit: `draft`, `under_review`, `approved`, `published`, `superseded`, dan `suspended`. Transaksi lama mengunci versi CDOA saat transaksi dibuat; aturan baru tidak boleh memutasi riwayat transaksi lama.
- **Konsekuensi Positif:** Transparansi aturan layanan, kepatuhan hukum adat, dan auditability penuh. Jika belum ada persetujuan manusia/lapangan, status CDOA tetap `draft` / `pending_validation` sehingga sistem tidak mengaktifkan rute palsu secara sepihak.

---

## ADR-04: Kedas Waste Passport & Opaque Token QR

- **Konteks:** Pelacakan material memerlukan pembuktian digital yang dapat dipindai oleh petugas, operator fasilitas, dan wisatawan. Jika QR code mengekspos ID auto-increment database atau NIK/nama warga, maka akan tercipta celah keamanan enumerasi (IDOR) dan pelanggaran privasi (PII).
- **Keputusan:** Token QR Waste Passport menggunakan **opaque URL-safe random string** dengan tandatangan server. Pindaian publik hanya membuka halaman safe-to-share (status alur, kategori, destinasi terverifikasi tanpa nama/alamat warga). Pindaian operasional (intake/timbang) mewajibkan autentikasi dan wewenang operator.
- **Konsekuensi Positif:** Aman dari serangan enumerasi IDOR dan memenuhi prinsip perlindungan data pribadi (UU PDP).

---

## ADR-05: Isolasi WastePoints Ledger dari Saldo Kas / Moneter

- **Konteks:** Platform menyediakan poin reward (WastePoints) untuk mendorong pemilahan sampah di rumah tangga. Terdapat risiko regulasi finansial jika poin disamakan dengan uang elektronik tanpa lisensi Bank Indonesia.
- **Keputusan:** WastePoints dicatat dalam **append-only ledger** murni berbasis bobot dan aturan terverifikasi. Nilai WastePoints terisolasi dari saldo buku tabungan bank sampah (yang berbasis rupiah) dan dilarang dikonversi ke kas secara sepihak sebelum mitra penukaran resmi disetujui.
- **Konsekuensi Positif:** Zero regulatory financial violation risk, zero double-credit issue berkat idempotency key.

---

## ADR-06: Destination Clean Loop Index (DCLI) dengan Guardrail Data Coverage

- **Konteks:** Menghitung indeks keberlanjutan dan sirkularitas destinasi sangat rentan terhadap *greenwashing* jika dihitung dari data parsial atau sampel yang sangat kecil.
- **Keputusan:** Menghitung DCLI sebagai metrik eksperimental. Jika cakupan data (data coverage) di suatu kawasan berada di bawah ambang batas minimum validasi (misal <50% sumber sampah terverifikasi), sistem menampilkan status `insufficient_data` secara jujur daripada mengarang skor tinggi.
- **Konsekuensi Positif:** Integritas pelaporan Kedas terjaga dan dapat dipertanggungjawabkan di hadapan auditor dan juri hackathon.
