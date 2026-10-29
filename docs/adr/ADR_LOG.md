# WasteLink Bali — Architecture Decision Records (ADR Log)

Dokumen ini mencatat seluruh keputusan arsitektur kunci (Architectural Decision Records) yang ditetapkan selama pembangunan MVP backend WasteLink Bali.

---

## ADR-001: Modular Monolith Architecture
* **Status**: Accepted
* **Context**: Pilot WasteLink Bali berfokus pada 1 banjar/desa dengan target skalabilitas awal 1.000 warga dan 20 petugas operasional. Membangun microservices terdistribusi akan memperkenalkan network overhead, kompleksitas distributed transaction (2PC/Saga), dan overhead infrastruktur yang tidak proporsional dengan risiko kegagalan tinggi.
* **Decision**: Mengadopsi arsitektur **Modular Monolith** berbasis FastAPI + SQLAlchemy ORM. Domain dipisahkan secara tegas ke dalam modul internal (`account`, `taxonomy`, `collection`, `inspection`, `weight`, `points`, `marketplace`, `funding`, `notification`, `reporting`).
* **Consequences**:
  - Transaksi ACID multi-domain dapat dieksekusi secara atomik dalam satu unit database session.
  - Batas antar modul tetap dijaga melalui schema Pydantic dan service interface tanpa ketergantungan silang liar.
  - Memudahkan transisi ke arsitektur layanan mandiri di masa depan bila throughput operasional membutuhkan skalabilitas independen.

---

## ADR-002: Opaque Server-Side Session Tokens over Stateless JWT
* **Status**: Accepted
* **Context**: Dalam sistem penjemputan sampah lapangan dan peran administratif berisiko (Finance, Admin, Collector), pencabutan akses seketika (*instant session revocation*) merupakan kebutuhan keamanan mendesak saat akun disuspend atau petugas dinonaktifkan. Stateless JWT sulit dicabut tanpa memelihara token blacklist terdistribusi yang menghapus keuntungan statelessness.
* **Decision**: Menggunakan **Opaque Server-Side Session Tokens** (32 byte CSPRNG hex) yang disimpan dalam tabel `auth_sessions` dengan SHA-256 hash. Klien mengirimkan token via header `Authorization: Bearer <token>` atau HttpOnly Cookie.
* **Consequences**:
  - Logout dan suspensi akun efektif seketika (1 kali query DB menghapus atau mengubah `revoked_at`).
  - Database lookup terjadi per request, teroptimasi menggunakan B-Tree index pada kolom `token_hash`.
  - Mencegah token credential exposure di storage klien.

---

## ADR-003: Pessimistic Row-Level Locking (`with_for_update`) for Slot Capacity & Task Assignment
* **Status**: Accepted
* **Context**: Dua petugas di pos operasional TPU dapat menekan tombol klaim tugas pada detik yang sama untuk setoran yang sama. Demikian pula dua warga dapat memesan 1 slot kapasitas sisa secara bersamaan.
* **Decision**: Menerapkan **Pessimistic Row-Level Locking** (`SELECT ... FOR UPDATE`) pada transaksi pemesanan slot (`CollectionSlot`) dan klaim tugas petugas (`PickupRequest`).
* **Consequences**:
  - Tepat 1 transaksi yang berhasil memperoleh lock; transaksi kedua mendeteksi status telah berubah atau kapasitas penuh, lalu mengembalikan HTTP 409 Conflict secara konsisten.
  - Menjamin zero double-booking dan zero double-assignment tanpa anomali race condition.

---

## ADR-004: Append-Only Immutable Ledger with Compensating Reversals for WastePoints
* **Status**: Accepted
* **Context**: Saldo WastePoints memiliki nilai moneter (dapat ditukar reward/sembako/pembayaran iuran banjar) yang didanai oleh budget program CSR/sponsor. Mengubah atau menghapus baris transaksi poin secara in-place melanggar prinsip akuntansi dan menghancurkan audit trail finansial.
* **Decision**: Seluruh mutasi WastePoints diimplementasikan sebagai **Buku Besar Append-Only** (`points_ledger`). Mutasi sebelumnya yang dibatalkan atau dikoreksi (misal kalibrasi ulang timbangan dari 10 kg ke 8 kg) **tidak pernah diupdate atau dihapus**. Sebaliknya, sistem memposting transaksi kompensasi bertipe `REVERSAL` dengan nilai negatif, disusul posting transaksi baru versi terkini.
* **Consequences**:
  - Saldo aktif selalu setara dengan `SUM(points_delta)` dari seluruh entri berstatus `POSTED`.
  - Audit trail 100% transparan dan dapat direkonsiliasi kapan saja dengan saldo program dana sponsor.

---

## ADR-005: Safety Gating & Dedicated Handling for Special / Hazardous Waste (`SPECIAL`)
* **Status**: Accepted
* **Context**: Sampah B3 rumah tangga (baterai bekas, cat, pestisida, limbah medis) membahayakan keselamatan petugas pos dan dilarang dicampur dengan sampah daur ulang umum di gerobak motor banjar.
* **Decision**: Kategori sampah dengan kode `SPECIAL` atau `requires_special_handling = True` **diblokir di level API** saat pembuatan permintaan penjemputan warga umum (`POST /api/v1/pickup-requests`) dengan status HTTP 422 Unprocessable Entity.
* **Consequences**:
  - Warga diarahkan ke protokol penanganan khusus atau drop-point B3 desa yang diawasi operator berizin.
  - Mencegah kontaminasi berbahaya pada muatan material daur ulang komunitas.

---

## ADR-006: Transactional Outbox Pattern for Asynchronous Notifications
* **Status**: Accepted
* **Context**: Panggilan HTTP ke pihak ketiga (SMS gateway, WhatsApp API, Push notification) rentan mengalami timeout atau kegagalan jaringan sementara. Melakukan panggilan API eksternal di dalam blok transaksi database dapat menahan lock transaksi terlalu lama atau menyebabkan inkonsistensi status (DB rollback tetapi pesan eksternal terlanjur terkirim).
* **Decision**: Menerapkan **Transactional Outbox Pattern** melalui tabel `notification_outbox`. Perubahan status domain menyimpan event ke outbox dalam transaksi database yang sama. Service background runner memproses batch event outbox dengan batas retry eksponensial (maksimal 3 kali) dan dead-letter logging saat gagal permanen.
* **Consequences**:
  - Menjamin pengiriman notifikasi berprinsip *at-least-once delivery*.
  - Menjaga latensi request API tetap rendah dan bebas dari ketergantungan langsung ke latency gateway eksternal.
