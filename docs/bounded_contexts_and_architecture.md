# WasteLink Bali — Bounded Contexts & Architecture Design (Tahap 1)

**Tanggal:** 30 Oktober 2026  
**Status:** Disahkan untuk Ekosistem 12 Kelompok

---

## 1. Arsitektur Tingkat Tinggi (Modular Monolith)

Sistem WasteLink Bali dirancang sebagai **Modular Monolith** terpadu. Pendekatan ini dipilih guna menghindari kompleksitas operasional microservices, namun tetap menjaga isolasi domain yang ketat antar-modul, integritas transaksi database lokal, dan kesederhanaan deployment untuk pilot wilayah Banjar Sukawati, Bali.

```mermaid
flowchart TD
    subgraph Clients["User Surfaces & Clients"]
        CW["Citizen Mobile App (Expo / React Native)"]
        UW["Citizen Web Portal (Next.js)"]
        SW["Staff / Collector Desktop POS (Next.js)"]
        AW["Admin / Operator Console (Next.js)"]
    end

    subgraph API_Gateway["FastAPI Application Layer (HTTP / OpenAPI)"]
        AUTH_ROUTER["/api/v1/auth & /api/v1/me"]
        COLLECTION_ROUTER["/api/v1/pickup-requests & /service-areas"]
        STAFF_ROUTER["/api/v1/collector & /weights & /inspections"]
        MARKETPLACE_ROUTER["/api/v1/admin/batches & /deliveries & /partners"]
        ADMIN_ROUTER["/api/v1/admin/dashboard & /reports & /audit-logs"]
    end

    subgraph Domain_Modules["Core Bounded Contexts"]
        BC_IAM["1. Identity & Access Management"]
        BC_GEO["2. Geography & Service Area"]
        BC_TAX["3. Waste Taxonomy & Safety Gating"]
        BC_SRC["4. Source & Collection (Citizen/B2B)"]
        BC_VER["5. Field Verification & Weighing"]
        BC_REW["6. WastePoints & Reward Ledger"]
        BC_EVD["7. Evidence & Media Assets"]
        BC_MAT["8. Material Flow & Facility Intake"]
        BC_PRT["9. Partner Network & Downstream Deliveries"]
        BC_COM["10. Community, Banjar & Programs"]
        BC_REP["11. Reporting & System Audit"]
    end

    subgraph Storage["Persistence & Infrastructure"]
        DB[(Relational DB: PostgreSQL / SQLite)]
        MEDIA_STORE[(Encrypted / Private Media Storage)]
        OUTBOX[(Transactional Notification Outbox)]
    end

    CW --> AUTH_ROUTER & COLLECTION_ROUTER
    UW --> AUTH_ROUTER & COLLECTION_ROUTER
    SW --> AUTH_ROUTER & STAFF_ROUTER
    AW --> AUTH_ROUTER & ADMIN_ROUTER & MARKETPLACE_ROUTER

    AUTH_ROUTER --> BC_IAM
    COLLECTION_ROUTER --> BC_GEO & BC_TAX & BC_SRC
    STAFF_ROUTER --> BC_VER & BC_REW & BC_EVD
    MARKETPLACE_ROUTER --> BC_MAT & BC_PRT
    ADMIN_ROUTER --> BC_COM & BC_REP

    Domain_Modules --> DB
    BC_EVD --> MEDIA_STORE
    Domain_Modules --> OUTBOX
```

---

## 2. Bounded Context & Ownership Matrix

Sesuai arahan `perancangan_lanjutan_wastelink_bali.md`, setiap domain context memiliki tanggung jawab model data, aturan invariant, dan hak akses yang jelas:

```mermaid
graph LR
    subgraph Source_Side["Hulu (Sumber Sampah)"]
        IAM["Identity & Access"]
        GEO["Geography & Slots"]
        TAX["Taxonomy & Rules"]
        SRC["Source & Collection"]
    end

    subgraph Midstream_Side["Operasi Lapangan & Fasilitas"]
        VER["Field Verification & QC"]
        EVD["Evidence Media"]
        MAT["Facility Intake & Batching"]
        WB["Waste Bank Ledger"]
    end

    subgraph Downstream_Side["Hilir, Komunitas & Tata Kelola"]
        PRT["Partner & B2B Deliveries"]
        REW["Platform Reward Ledger"]
        COM["Community & Banjar Programs"]
        REP["Audit & Analytics"]
    end

    IAM --> SRC & VER & MAT & COM
    GEO --> SRC
    TAX --> SRC & MAT & PRT
    SRC --> VER
    VER --> EVD & REW & MAT
    MAT --> WB & PRT
    MAT --> REP
    REW --> REP
    COM --> REP
```

### Rincian Tanggung Jawab Modul:

1. **Identity & Access Management (IAM)**:
   - *Entitas Inti*: `User`, `Role`, `UserRole`, `Session`, `CollectorApplication`.
   - *Tanggung Jawab*: Otentikasi token sesi aman (SHA-256), verifikasi status akun (`ACTIVE`, `SUSPENDED`), penegakan otorisasi server-side.
   - *Invariant*: Tidak ada privilege escalation dari payload profil klien.

2. **Geography & Service Configuration**:
   - *Entitas Inti*: `ServiceArea`, `CollectionSlot`, `Address`.
   - *Tanggung Jawab*: Batas administrasi banjar/desa, konfigurasi slot penjemputan harian (zona waktu WITA), validasi kapasitas trike.
   - *Invariant*: Alamat warga hanya dapat dibuat pada wilayah layanan yang aktif.

3. **Waste Taxonomy & Safety Gating**:
   - *Entitas Inti*: `WasteCategory`, `MaterialAcceptanceRule`.
   - *Tanggung Jawab*: Klasifikasi 4 makro (`ORGANIK`, `ANORGANIK`, `RESIDU`, `B3_SPESIFIK`), panduan pemilahan lokal, pencegahan percampuran B3.
   - *Invariant*: Limbah B3 tidak boleh diangkut oleh armada trike harian biasa.

4. **Source & Collection (Citizen & B2B)**:
   - *Entitas Inti*: `PickupRequest`, `PickupStatusEvent`.
   - *Tanggung Jawab*: Pembuatan tiket setoran warga / lokasi usaha, pemesanan slot kuota atomik, riwayat status transisi.
   - *Invariant*: Kuota slot dikurangi secara atomik; pembatalan mengembalikan kuota secara aman.

5. **Field Verification & Weighing**:
   - *Entitas Inti*: `Inspection`, `WeightRecord`.
   - *Tanggung Jawab*: Inspeksi kebersihan QC (Grade A/B/C/D), pencatatan timbangan tara & bruto, versi timbangan imutabel (`SUPERSEDED`).
   - *Invariant*: $\text{Net Weight} = \text{Gross Weight} - \text{Tare Weight}$; bobot tara tidak boleh melebihi atau sama dengan bobot bruto.

6. **WastePoints & Reward Ledger**:
   - *Entitas Inti*: `RewardRule`, `PointLedger`.
   - *Tanggung Jawab*: Perhitungan poin server-side setelah verifikasi timbang sah, buku besar saldo *append-only*.
   - *Invariant*: Poin tidak pernah dihitung oleh klien; koreksi dilakukan via transaksi *reversal* ber-audit trail.

7. **Evidence & Media Storage**:
   - *Entitas Inti*: `EvidenceAsset`.
   - *Tanggung Jawab*: Penyimpanan foto layar timbangan digital, kondisi pemilahan, dan surat jalan mitra secara privat.
   - *Invariant*: Berkas privat diakses melalui URL bertanda tangan atau endpoint terotorisasi.

8. **Material Flow & Facility Intake (TPS3R / TPST)**:
   - *Entitas Inti*: `FacilityReceipt`, `MaterialBatch`, `StockMovement`.
   - *Tanggung Jawab*: Rekonsiliasi penerimaan material pos timbang fasilitas TPS3R, pembentukan lot/batch daur ulang, pencatatan residu.
   - *Invariant*: Setiap batch harus memiliki riwayat sumber yang dapat ditelusuri; massa batch turunan tidak boleh melebihi input.

9. **Partner Network & Downstream Deliveries**:
   - *Entitas Inti*: `Partner`, `Delivery`, `DeliveryReceipt`.
   - *Tanggung Jawab*: Penyaluran material ke pengepul/pabrik daur ulang, pencatatan surat jalan, deteksi selisih timbang pabrik (`DISPUTED`).
   - *Invariant*: Klaim "didaur ulang" hanya sah jika didukung tanda terima pemrosesan mitra hilir terverifikasi.

10. **Community, Banjar & Programs**:
    - *Entitas Inti*: `CommunityEvent`, `ProgramFunding`, `AssistanceRequest`.
    - *Tanggung Jawab*: Koordinasi jadwal gotong royong banjar, aksi bersih pantai/sungai, pelaporan tumpukan sampah liar, alokasi CSR.
    - *Invariant*: Anggaran CSR dibatasi pagu (*budget cap*); kegiatan relawan dipisahkan dari metrik penjemputan rutin.

11. **Reporting, Outbox & System Audit**:
    - *Entitas Inti*: `AuditLog`, `NotificationOutbox`.
    - *Tanggung Jawab*: Catatan penelusuran operasi sensitif imutabel, pengiriman notifikasi terjamin (*at-least-once delivery*), ekspor metrik tersanitasi.
    - *Invariant*: Audit log bersifat *read-only*; seluruh angka laporan dapat ditelusuri ke query sumber.

---

## 3. Strategi Transaksi & Integritas Data

1. **Konsistensi Transaksional**: Operasi kritis seperti `(Timbang Sah + Terbitkan WastePoints + Update Status Tiket)` dieksekusi dalam satu transaksi database atomik (*ACID*).
2. **Pencegahan Kontensi Bersamaan**: Klaim tugas petugas menggunakan *row-level locking* (`SELECT ... FOR UPDATE`), mengembalikan HTTP 409 Conflict bila tugas telah diambil petugas lain.
3. **Penyimpanan Waktu UTC & Tampilan WITA**: Database menyimpan semua timestamp dalam format UTC ISO-8601 (`created_at`, `updated_at`). Lapisan presentasi memformat waktu ke WITA (`Asia/Makassar`) untuk kenyamanan warga dan petugas di Bali.
