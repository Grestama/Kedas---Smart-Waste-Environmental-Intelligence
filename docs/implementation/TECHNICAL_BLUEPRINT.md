# KEDAS TECHNICAL BLUEPRINT
## Arsitektur Sistem, Alur Data, dan Spesifikasi Teknis Platform Kedas

**Versi:** 1.0  
**Dokumen:** Technical Blueprint  
**Status:** Approved for Implementation  
**Tanggal:** 2026-10-30T12:32:00+08:00 (WITA)

---

## 1. System Context & Container Architecture

Platform Kedas dirancang menggunakan pola **Modular Monolith** yang memisahkan boundary domain dengan tegas di tingkat service, model, dan API sub-router tanpa kompleksitas jaringan microservices.

```mermaid
flowchart TB
    subgraph Clients["Aktor & Klien Platform"]
        Warga["Warga / Tamu<br/>(Web Mobile / App)"]
        Petugas["Petugas Lapangan<br/>(Mobile Offline Engine)"]
        Horeka["Staf & Manajer HOREKA<br/>(Web Dashboard)"]
        Operator["Operator TPS3R/TPST<br/>(Web / Tablet)"]
        Banjar["Prajuru Banjar<br/>(Web Dashboard)"]
        Mitra["Mitra Pembeli B2B<br/>(Web Portal)"]
        Admin["Administrator Kawasan<br/>(Web Portal)"]
        Guest["Wisatawan (Tanpa Login)<br/>(Bilingual QR Microsite)"]
    end

    subgraph Frontend["Frontend Container (Next.js 15.1.7)"]
        AppRouter["Next.js App Router (37 Routes)"]
        AuthContext["Auth Context & RBAC Guard"]
        ApiClient["HTTP ApiClient (No Mock Fallbacks)"]
        MotionEngine["CSS / Motion Tokens (a11y reduced-motion)"]
    end

    subgraph Backend["Backend Container (FastAPI 0.115 Modular Monolith)"]
        Router["FastAPI Central Router (/api/v1/*, 114 Endpoints)"]
        AuthMiddleware["Session Auth & Scoped Organization Guard"]
        
        subgraph CoreModules["12 Bounded Context Service Modules"]
            BC01["BC-01: Account & RBAC"]
            BC02["BC-02: Destination & CDOA"]
            BC03["BC-03: Taxonomy & Rules"]
            BC04["BC-04: Collection & Passport"]
            BC05["BC-05: Facility & Intake"]
            BC06["BC-06: Batch Traceability"]
            BC07["BC-07: Circular Exchange"]
            BC08["BC-08: Green Hospitality Ledger"]
            BC09["BC-09: EcoLoop & Banjar"]
            BC10["BC-10: Guest Companion"]
            BC11["BC-11: Points & CSR Funding"]
            BC12["BC-12: Analytics & DCLI Engine"]
        end
        
        AuditEngine["Append-Only Audit Engine & Outbox"]
    end

    subgraph Persistence["Storage & Data Layer"]
        Database[("PostgreSQL / SQLite Storage<br/>(44 Tables, SQLAlchemy 2.0)")]
        EvidenceStorage[("Secured File Storage<br/>(Evidence Files & Hash Verification)")]
    end

    Clients --> Frontend
    Frontend --> Router
    Router --> AuthMiddleware
    AuthMiddleware --> CoreModules
    CoreModules --> AuditEngine
    CoreModules --> Database
    CoreModules --> EvidenceStorage
```

---

## 2. Canonical Data Flow: Source to Verified Circular Outcome

Alur perjalanan material dari sumber (rumah tangga / HOREKA) hingga pemanfaatan terverifikasi dijamin oleh **Kedas Waste Passport**:

```mermaid
sequenceDiagram
    autonumber
    actor Source as Warga / HOREKA
    participant FE as Frontend Portal
    participant API as FastAPI Backend
    actor Collector as Petugas Armada
    actor Facility as Operator TPS3R
    actor Buyer as Mitra Offtaker

    Source->>FE: Input Permintaan / Daily Waste Log
    FE->>API: POST /pickup-requests (Validasi CDOA & Slot)
    API-->>FE: Passport Created (ID, Opaque QR Token)
    
    Collector->>API: GET /collector/tasks/available
    Collector->>API: POST /collector/tasks/{id}/accept (Atomic Row Lock)
    Collector->>API: POST /collector/tasks/{id}/status (IN_PROGRESS -> COLLECTED)
    Note over Collector,API: Catat berat di sumber & upload foto timbangan
    
    Collector->>Facility: Antar Material ke Fasilitas
    Facility->>API: POST /facilities/receipts (Scan Passport, Gross/Tare/Net)
    Note over Facility,API: Inspeksi kontaminasi & validasi kapasitas fasilitas
    
    alt Material Diterima
        API->>API: Status ACCEPTED -> Terbitkan WastePoints ke Ledger
        Facility->>API: POST /facilities/sorting (Split Batch: Organik, Plastik, Residu)
        Note over Facility,API: Hitung Mass Balance: Input = Output + Residu + Loss
        
        Facility->>API: POST /marketplace/offers (Tawarkan Stok Unreserved)
        Buyer->>API: POST /marketplace/offers/{id}/accept
        API->>API: Reserve Stok & Buat Delivery Record
        Buyer->>API: POST /admin/deliveries/{id}/confirm-processing
        API->>API: Close Passport dengan Bukti Serah Terima Sah
    else Material Ditolak
        API->>API: Status REJECTED dengan Reason Code & Foto Bukti
        API->>API: Bebaskan Reservasi Kapasitas
    end
```

---

## 3. Data Integrity & Security Architecture

1. **Precision & Unit Enforcement**:
   - Seluruh kalkulasi berat menggunakan tipe data `Decimal` (bukan IEEE floating point) untuk mencegah floating rounding errors.
   - Unit berat standar adalah kilogram (`kg`), dengan toleransi selisih penimbangan yang tercatat eksplisit.

2. **Access Control & Anti-IDOR**:
   - Setiap endpoint sensitif memeriksa:
     - `current_user`: Token sesi aktif terverifikasi.
     - `RBAC Role`: Hak akses berbasis salah satu dari 8 role resmi.
     - `Ownership & Organization Scope`: ID objek harus dimiliki pengguna atau berada dalam entitas organisasi/banjar/fasilitas yang menjadi wewenang aktifnya.
     - Upaya mengakses data lintas tenant/organisasi menghasilkan error `403 FORBIDDEN` dengan log audit otomatis.

3. **Concurrency & Race Condition Prevention**:
   - Pengambilan kuota slot penjemputan dan klaim tugas menggunakan `with_for_update()` row-level locking pada database transaction.
   - Penambahan/pengurangan saldo WastePoints menggunakan pattern append-only transaction ledger dengan idempotency key.

4. **Kedas Waste Passport & QR Token Security**:
   - QR code tidak mengekspos ID auto-increment database dan tidak mengekspos PII warga.
   - Token QR bersifat random opaque URL-safe string yang diverifikasi melalui signature server.
