# 01. Hasil Pengujian Baseline Sistem — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: QA Automation Engineer  
**Status**: 100% Passed (185/185 Tests Green)

---

## 1. Ringkasan Eksekusi Pengujian Lintas Lapisan

| Lapisan Sistem | Runner / Tooling | Perintah Eksekusi | Hasil Pengujian | Exit Code | Durasi |
|---|---|---|---|---|---|
| **Backend API & Domain** | `pytest 9.1.1` | `pytest -v` | **76 passed** (0 failed) | 0 | 43.01s |
| **Backend Code Style** | `ruff 0.8.4` | `ruff check .` | **0 errors, 0 warnings** | 0 | 0.82s |
| **Backend Type Safety** | `mypy 1.13.0` | `mypy app` | **0 errors in 79 files** | 0 | 2.11s |
| **Frontend Web & UI** | `vitest 3.2.7` | `vitest run` | **94 passed** (0 failed) | 0 | 8.21s |
| **Frontend Type Safety** | `tsc 5.7.2` | `tsc --noEmit` | **0 type errors** | 0 | 4.88s |
| **Frontend Production Build** | `next 15.1.7` | `next build` | **37/37 static routes compiled** | 0 | 18.4s |
| **Mobile Offline Engine** | `vitest 5.0.5` | `vitest run` | **15 passed** (0 failed) | 0 | 0.32s |
| **Mobile Type Safety** | `tsc 5.7.2` | `tsc --noEmit` | **0 type errors** | 0 | 1.12s |
| **Total Pengujian Otomatis** | — | — | **185 Passed / 0 Failed** | — | **~78.8s** |

---

## 2. Cakupan Verifikasi Modul Kritis
- **IAM & Otentikasi**: Registrasi warga, verifikasi status aktif, login anti-enumerasi akun, pemblokiran akun tersuspensi.
- **Konkurensi & Idempotensi**: Pencegahan double-claim tugas petugas, pencegahan overbooking slot penjemputan, idempotensi buku besar poin.
- **Integritas Inventaris**: Penguncian baris fasilitas pesimistik (`with_for_update()`) mencegah inventaris negatif saat pemilahan paralel.
- **Proteksi IDOR**: Pembatasan akses alamat dan penjemputan antar-pengguna.
- **Offline Resilience**: Antrean mutasi offline mobile dengan sinkronisasi deterministik.
