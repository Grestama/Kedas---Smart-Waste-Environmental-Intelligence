# INVENTARISASI WORKSPACE & RUTE ROLE KEDAS
**Dokumen:** `02_ROLE_WORKSPACE_INVENTORY.md`  
**Status:** Audit Komprehensif Arsitektur Frontend  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Inventarisasi Ruang Kerja (Workspaces)

Pemeriksaan aktual terhadap seluruh struktur folder di bawah `frontend/src/app` mengidentifikasi status ketersediaan workspace sebagai berikut:

### 1.1 Public Main Website
- **Rute:** `/`, `/panduan`, `/area-layanan`, `/faq`, `/tanya`, `/masuk`, `/daftar`, `/lupa-password`
- **Layout:** `src/app/(public)/layout.tsx` (`PublicHeader`, `PublicFooter`, `EcoGuideWidget`)
- **Navigasi:** Beranda, Panduan Pilah, Area Layanan, Guest Companion, FAQ & Bantuan, Masuk, Daftar Warga.
- **Tugas Utama:** Memberikan edukasi pemilahan sampah, transparansi regulasi Pergub 47/2019, direktori operasional TPS3R kawasan, registrasi akun warga, dan konsultasi AI grounded RAG.
- **Komponen Shared:** `Button`, `Accordion`, `EcoGuideWidget`, `IconContainer`.
- **Status:** **Tersedia Penuh (Visual Source of Truth)**.

---

### 1.2 Guest Green Companion
- **Rute:** `/guest`
- **Layout:** Menggunakan `src/app/(public)/layout.tsx`
- **Navigasi:** Pengalih bahasa (ID/EN), tautan direktori isi ulang air minum non-plastik, pelaporan kebersihan destinasi.
- **Tugas Utama:** Memberikan panduan pemilahan 3 tempat sampah (Organik, Daur Ulang, Residu) bagi turis dan tamu hotel, tata cara peletakan sisa upakara/canang sari berlandaskan Tri Hita Karana, dan peta pos hidrasi.
- **Komponen Shared:** `Button`, `IconContainer`, `PublicHeader`, `PublicFooter`.
- **Status:** **Tersedia Penuh**.

---

### 1.3 Warga / Resident Workspace (`/app`)
- **Rute yang Tersedia:**
  - `/app` — Ringkasan dashboard warga, saldo WastePoints, status setoran terkini, metrik daur ulang.
  - `/app/setoran` — Daftar riwayat setoran sampah terpilah warga.
  - `/app/setoran/baru` — Wizard pengajuan setoran baru (pilih jenis layanan, kategori sampah, estimasi berat, jadwal, dan opsi analisis AI Vision).
  - `/app/setoran/[id]` — Detail rekam jejak setoran (Waste Passport digital, bukti timbangan bruto/tara/netto, status QC lapangan).
  - `/app/waste-points` — Rincian mutasi WastePoints dan opsi penukaran insentif sembako.
  - `/app/dampak` — Analitik dampak lingkungan personal dan kontribusi terhadap DCLI kawasan.
  - `/app/notifikasi` — Pusat pemberitahuan kedatangan armada dan verifikasi timbangan.
  - `/app/panduan` — Panduan pemilahan internal warga banjar.
  - `/app/bantuan` — Kontak banjar dan pengajuan kendala operasional.
  - `/app/profil` — Pengaturan data warga, alamat penjemputan, dan preferensi akun.
- **Layout:** `src/app/app/layout.tsx` (`UserSidebar`, `AuthGuard`, container `bg-canvas`).
- **Navigasi:** Sidebar 8 item navigasi + tombol Keluar Akun.
- **Komponen Shared:** `UserSidebar`, `PageHeader`, `Panel`, `StatCard`, `DataTable`, `StatusBadge`, `StatusTimeline`, `Button`, `Input`, `VisionUploadModal`.
- **Data/API Dependencies:** `collectionService` (`getMyPickupRequests`, `createPickupRequest`, `getPointsBalance`, `getCategories`), `aiService` (`analyzeImageVision`).
- **Status:** **Tersedia Penuh**.

---

### 1.4 Petugas / Field Staff POS Workspace (`/staff`)
- **Rute yang Tersedia:**
  - `/staff` — Meja operasional petugas, statistik giliran aktif, kuota armada, tugas terjadwal.
  - `/staff/tugas/tersedia` — Antrean tugas penjemputan warga yang siap diambil petugas.
  - `/staff/tugas/saya` — Daftar tugas aktif yang sedang dikerjakan petugas saat ini.
  - `/staff/tugas/[id]` — Alur eksekusi tugas lapangan: inspeksi kualitas sampah, grading kontaminasi (PASS/DEGRADE/REJECT), input timbangan digital (bruto - tara = netto), unggah foto bukti, dan penerbitan catatan timbang sah.
  - `/staff/riwayat` — Riwayat transaksi penjemputan dan log timbangan sah.
  - `/staff/panduan-keselamatan` — Standar K3, APD wajib, dan penanganan darurat limbah B3.
  - `/staff/profil` — Identitas petugas dan nomor armada trike banjar.
- **Layout:** `src/app/staff/layout.tsx` (`StaffSidebar`, `AuthGuard`, `OfflineOutboxBanner`).
- **Navigasi:** Sidebar operasional bertema kontras tinggi (`bg-[#122620]`).
- **Komponen Shared:** `StaffSidebar`, `OfflineOutboxBanner`, `PageHeader`, `Panel`, `StatCard`, `StatusBadge`, `Button`, `Input`, `DataTable`.
- **Data/API Dependencies:** `services/staff.ts` (`fetchMyTasks`, `claimTask`, `updateTaskStatus`, `submitWeightQC`, `getCollectorStats`).
- **Status:** **Tersedia Penuh**.

---

### 1.5 Green Hospitality Workspace (`/hospitality`)
- **Rute yang Tersedia:**
  - `/hospitality` — Dashboard B2B hotel/villa/restoran, metrik timbulan sampah harian, diversion rate, kepatuhan kuota CDOA.
  - `/hospitality/setoran` — Formulir pencatatan timbulan sampah komersial harian berbasis timbangan internal.
  - `/hospitality/esg` — Laporan keberlanjutan, estimasi emisi karbon yang dihindari, dan sertifikat partisipasi sirkular.
  - `/hospitality/guest-companion` — Portal materi edukasi tamu hotel (QR code meja/kamar).
  - `/hospitality/lapor` — Pelaporan timbulan berlebih atau insiden persampahan kawasan.
- **Layout:** `src/app/hospitality/layout.tsx` (Top navigation bar khusus tenant B2B dengan pemilih properti).
- **Navigasi:** 5 tab horizontal (Ringkasan, Catat Timbulan, Laporan ESG, Guest QR, Lapor Kawasan).
- **Komponen Shared:** `Button`, `Panel`, `StatCard`, `StatusBadge`, `DataTable`, `IconContainer`.
- **Data/API Dependencies:** `services/marketplace.ts` (`getB2BReport`, `createHospitalityDeposit`), `services/community.ts` (`createCommunityComplaint`).
- **Status:** **Tersedia Penuh**.

---

### 1.6 Admin / Destination Console Workspace (`/admin`)
- **Rute yang Tersedia:**
  - `/admin` — Ringkasan pengawasan destinasi, deteksi anomali Copilot, proposal tindakan administratif.
  - `/admin/permintaan` — Pengawasan seluruh permintaan penjemputan kawasan banjar.
  - `/admin/pengajuan-petugas` — Verifikasi pendaftaran petugas lapangan dan armada.
  - `/admin/pengguna` — Manajemen akun warga dan organisasi kawasan.
  - `/admin/kategori` — Konfigurasi kategori sampah, ambang kontaminasi, dan tarif WastePoints.
  - `/admin/area-jadwal` — Konfigurasi area layanan banjar dan jadwal armada.
  - `/admin/mitra` — Manajemen fasilitas daur ulang dan batch serah-terima material.
  - `/admin/waste-points/rules` — Kebijakan rasio konversi dan insentif WastePoints.
  - `/admin/pendanaan` — Program sponsor dan alokasi dana lingkungan.
  - `/admin/pengetahuan` — Manajemen dokumen regulasi dan materi grounded RAG EcoGuide.
  - `/admin/laporan` — Ekspor laporan berkala kepatuhan Pergub 47/2019.
  - `/admin/audit-log` — Jejak rekam transaksi dan perubahan data sistem yang tidak dapat diubah (immutable).
- **Layout:** `src/app/admin/layout.tsx` (`AdminSidebar`, `AuthGuard`).
- **Navigasi:** Multi-section sidebar (Monitoring Operasional, Master Data & Logistik, Governansi & Audit).
- **Komponen Shared:** `AdminSidebar`, `PageHeader`, `Panel`, `StatCard`, `DataTable`, `StatusBadge`, `ActionProposalModal`, `Button`, `Input`.
- **Data/API Dependencies:** `services/admin.ts`, `services/knowledge.ts`.
- **Status:** **Tersedia Penuh**.

---

### 1.7 Mobile Simulator (Demo Route)
- **Rute:** `/mobile`
- **Layout:** Standalone viewport frame simulator (`MobilePhoneFrame.tsx`).
- **Tujuan:** Simulasi pengalaman mobile warga untuk pengujian prototipe.
- **Status:** **Tersedia Sebagai Rute Demo (Tetap dipertahankan tanpa perubahan fungsional)**.

---

### 1.8 Scope yang Dicatat sebagai Missing Scope (Sesuai Directive 0.3)
Sesuai aturan ketat Master Directive:
> *"Role atau workspace yang belum benar-benar tersedia harus dicatat sebagai missing scope. Jangan membuat implementasi fiktif untuk menutupi ketiadaan route."*

1. **Facility Workspace (TPS3R / TPST / Bank Sampah):**
   - **Status Berkas:** Service layer (`services/facility.ts`), tipe data (`types/facility.ts`), dan suite tes (`src/test/facility.test.ts`) telah terimplementasi dan lulus tes secara solid (pencatatan material intake, sorting, stok material, transaksi tabungan sampah bank sampah).
   - **Ketiadaan Rute:** Belum ada folder rute mandiri `src/app/facility/` di frontend. Fungsionalitas fasilitas saat ini diakses melalui modul Mitra di Admin (`/admin/mitra`) dan penyerahan tugas petugas.
   - **Pencatatan Audit:** Dicatat sebagai **Missing Route Scope** (tidak dibuat rute fiktif, kapabilitas service layer dipertahankan).
2. **Community / Banjar Workspace:**
   - **Status Berkas:** Service layer (`services/community.ts`), tipe data (`types/community.ts`), dan suite tes (`src/test/community.test.ts`) telah terimplementasi dan lulus tes (profil banjar, sponsorship, event gotong royong, aduan masyarakat).
   - **Ketiadaan Rute:** Belum ada folder rute mandiri `src/app/community/` di frontend. Tampilan banjar terintegrasi di Area Layanan Publik (`/area-layanan`), Area & Jadwal Admin (`/admin/area-jadwal`), dan Lapor Hospitality (`/hospitality/lapor`).
   - **Pencatatan Audit:** Dicatat sebagai **Missing Route Scope** (tidak dibuat rute fiktif).

---

## 2. Matriks Komponen & Risiko Operasional Seluruh Workspace

| Workspace | Rute Teridentifikasi | Layout Eksisting | Tugas Utama | Komponen Shared yang Digunakan | Visual Gaps Teridentifikasi | Risiko Fungsional & Permission |
|---|---|---|---|---|---|---|
| **Publik** | `/`, `/panduan`, `/area-layanan`, `/faq`, `/tanya`, `/masuk`, `/daftar`, `/lupa-password` | `PublicLayout` (`PublicHeader`, `PublicFooter`) | Edukasi warga, jadwal banjar, registrasi, asisten EcoGuide | `Button`, `Accordion`, `EcoGuideWidget`, `IconContainer` | **Acuan Utama (0 gap)** | Resiko nol; rute publik terbuka |
| **Guest** | `/guest` | `PublicLayout` | Panduan turis, 3 tempat sampah, hidrasi non-plastik | `IconContainer`, `Button` | Konsistensi kartu sudah baik, perlu dipastikan kontras border 2px seragam | Bebas login; tidak boleh meminta data privasi |
| **Warga** | `/app/**` (10 rute) | `UserLayout` (`UserSidebar`) | Setoran sampah, tracking timbangan, WastePoints, profil | `UserSidebar`, `PageHeader`, `Panel`, `StatCard`, `DataTable`, `StatusBadge` | Beberapa panel form menggunakan border 1px bukan 2px; card hover elevation belum seragam dengan public | Validasi Zod pada formulir setoran baru & kuota banjar harian wajib terjaga |
| **Petugas** | `/staff/**` (7 rute) | `StaffLayout` (`StaffSidebar`, `OfflineBanner`) | Antrean tugas, penimbangan tara-netto, inspeksi QC fisik | `StaffSidebar`, `PageHeader`, `Panel`, `StatCard`, `StatusBadge`, `DataTable` | Form timbangan dan inspeksi QC memerlukan keterbacaan kontras tinggi saat di luar ruangan | Tombol irreversible (Selesai Timbang/Reject) wajib memiliki konfirmasi; mode offline outbox tidak boleh rusak |
| **Hospitality** | `/hospitality/**` (5 rute) | `HospitalityLayout` (Top Nav) | Timbulan hotel B2B, log harian, ESG report, guest QR | `Panel`, `StatCard`, `StatusBadge`, `DataTable`, `IconContainer` | Top navigation memiliki border dan padding sedikit berbeda dengan PublicHeader; tenant selector dropdown perlu visual polish | Autentikasi B2B tenant & fallback mock data saat unauthenticated harus tetap aman |
| **Admin** | `/admin/**` (12 rute) | `AdminLayout` (`AdminSidebar`) | Pengawasan kawasan, verifikasi petugas, master data, audit | `AdminSidebar`, `PageHeader`, `Panel`, `StatCard`, `DataTable`, `ActionProposalModal` | Tabel data densitas tinggi memerlukan styling baris dan pagination yang selaras dengan tema forest | Role check ADMIN, aksi approval Copilot wajib persetujuan manual manusia |
| **Facility** | *(Service Layer Only)* | N/A | Intake material, stok gudang, bank sampah | N/A | Missing route scope (terintegrasi di Admin Mitra & Staff) | Tidak ada regresi rute; unit test 4/4 wajib terjaga |
| **Community** | *(Service Layer Only)* | N/A | Profil banjar, event ngayah, sponsorship | N/A | Missing route scope (terintegrasi di Area Layanan & Admin) | Tidak ada regresi rute; unit test 5/5 wajib terjaga |
