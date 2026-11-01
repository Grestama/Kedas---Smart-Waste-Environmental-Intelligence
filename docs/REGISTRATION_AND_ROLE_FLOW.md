# Alur Registrasi Akun dan Persetujuan Peran — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: IAM Engineer & Technical Lead

---

## 1. Alur Registrasi Warga Baru (Public Signup)

```mermaid
flowchart TD
    Start([Pengunjung]) --> OpenDaftar[Buka Halaman /daftar]
    OpenDaftar --> InputForm[Isi: Nama, Email/No HP, Banjar, Password]
    InputForm --> CheckTerms[Setujui Komitmen Pemilahan Sampah]
    CheckTerms --> Submit[Kirim Formulir: POST /api/v1/auth/register]
    Submit --> ValServer{Validasi Server}
    ValServer -- Gagal --> ShowError[Tampilkan Pesan Error: Email Duplikat / Password Lemah]
    ShowError --> InputForm
    ValServer -- Sukses --> CreateUser[Buat Akun: Role USER, Status ACTIVE]
    CreateUser --> CreateSession[Terbitkan Sesi Server: auth_sessions]
    CreateSession --> RedirectApp[Arahkan Otomatis ke Dasbor Warga /app]
    RedirectApp --> SetupAddress[Lengkapi Alamat Penjemputan di /app/profil]
    SetupAddress --> ReadyPickup([Siap Buat Permintaan Jemput])
```

---

## 2. Alur Pengajuan dan Verifikasi Petugas Kebersihan (Collector Approval)

```mermaid
flowchart TD
    UserLogin([Warga Terdaftar]) --> OpenProfile[Buka /app/profil]
    OpenProfile --> ClickApply[Klik 'Ajukan Menjadi Petugas Banjar']
    ClickApply --> FillModal[Pilih Jenis Kendaraan & Catatan Pengalaman Wilayah]
    FillModal --> SendApp[POST /api/v1/collector-applications]
    SendApp --> StatusPending[Status Permohonan: PENDING]

    AdminLogin([Koordinator Banjar]) --> OpenAdminQueue[Buka /admin/pengajuan-petugas]
    OpenAdminQueue --> ReviewData[Tinjau Kelayakan Armada & Catatan Pemohon]
    ReviewData --> Decision{Keputusan Koordinator}

    Decision -- Tolak --> RejectApp[POST /review: approved=false + Alasan Wajib]
    RejectApp --> AuditLog1[Catat ke audit_logs]
    AuditLog1 --> UserRejection[Warga Melihat Alasan Penolakan di /app/profil & Dapat Ajukan Ulang]

    Decision -- Setujui --> ApproveApp[POST /review: approved=true]
    ApproveApp --> InsertRole[Insert Role COLLECTOR ke user_roles]
    InsertRole --> AuditLog2[Catat ke audit_logs]
    AuditLog2 --> CollectorActive([Hak Akses Petugas Aktif: Akses /staff Terbuka])
```
