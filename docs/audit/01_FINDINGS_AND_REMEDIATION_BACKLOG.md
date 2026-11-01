# 01. Daftar Temuan Audit & Backlog Remediasi — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Full-Stack Architect & Product Designer  
**Status**: Active Backlog for Stages 2 to 7

---

## 1. Klasifikasi Prioritas Temuan (P0 s/d P3)

| ID | Prioritas | Domain | Masalah / Kebutuhan Remediasi | Rencana Solusi | Target Tahap |
|---|---|---|---|---|---|
| **KD-IAM-01** | **P1 (High)** | IAM & Warga Onboarding | Alur pengajuan petugas (Journey B) sudah memiliki backend API dan admin review, namun belum tersedia UI terpadu di profil warga (`/app/profil`) untuk mengajukan permohonan dan memantau status persetujuan. | Tambahkan kartu "Pengajuan Menjadi Petugas Kebersihan Banjar" di `/app/profil` lengkap dengan modal formulir kendaraan, catatan, dan badge status riil (`PENDING`, `APPROVED`, `REJECTED`). | **Tahap 2 & 3** |
| **KD-IAM-02** | **P2 (Med)** | Auth & Password Recovery | Halaman `/lupa-password` saat ini hanya menampilkan instruksi kontak offline sekretariat TPS3R, belum menyediakan alur interaktif sandbox bagi penguji demo hackathon. | Tambahkan form permintaan reset kata sandi interaktif dengan validasi format email/telepon dan umpan balik sukses ramah demo tanpa membocorkan secret. | **Tahap 2** |
| **KD-UX-01** | **P2 (Med)** | Motion & UX Components | Komponen `Modal` dan `Toast` masih muncul secara kaku tanpa transisi *scale-in* / *slide-in*, dan CSS global belum memuat aturan `@media (prefers-reduced-motion: reduce)`. | Terapkan utility animasi Tailwind terstandar pada `Modal.tsx`, `Toast.tsx`, dan tambahkan rule reduced-motion di `globals.css`. | **Tahap 5** |
| **KD-UX-02** | **P2 (Med)** | Micro-interactions & Polish | Kartu metrik (`StatCard`), tombol (`Button`), dan panel aksi belum memiliki *tactile feedback* saat di-hover/di-klik pada desktop. | Tambahkan subtle active press scale (`active:scale-[0.98]`) dan hover elevation halus yang hemat performa. | **Tahap 5** |
| **KD-DEMO-01**| **P1 (High)** | Hackathon Demo Readiness | Ketiadaan panduan naskah demo terstruktur dan akun demo yang terisolasi dengan dokumentasi alur presentasi 3–5 menit untuk dewan juri hackathon. | Susun `DEMO_SCRIPT.md`, `DEMO_ACCOUNTS.md`, scorecard evaluasi, dan naskah presentasi terpadu di folder `docs/`. | **Tahap 7** |

---

## 2. Rencana Eksekusi Berurutan
- **Tahap 2**: Penguatan Account Lifecycle, integrasi formulir reset interaktif di `/lupa-password`, dan penyempurnaan onboarding profil.
- **Tahap 3**: Implementasi UI Pengajuan Petugas di `/app/profil`, koneksi end-to-end ke verifikasi admin di `/admin/pengajuan-petugas`, dan verifikasi role switch.
- **Tahap 4**: Pemantapan operasional lintas role (Warga $\rightarrow$ Petugas $\rightarrow$ Fasilitas $\rightarrow$ Bank Sampah $\rightarrow$ Mitra B2B).
- **Tahap 5**: Penerapan Motion Design System, animasi halus, accessibility reduced-motion, dan visual polish.
- **Tahap 6**: Security review menyeluruh, negative tests, dan verifikasi zero regression.
- **Tahap 7**: Pembuatan Demo Script, Demo Accounts, Hackathon Readiness Scorecard, dan Final Handover.
