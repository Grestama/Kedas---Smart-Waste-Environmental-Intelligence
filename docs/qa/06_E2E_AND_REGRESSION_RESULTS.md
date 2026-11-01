# 06. Hasil Pengujian Regresi dan End-to-End Lintas Modul — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: QA Automation Engineer  
**Status**: 186/186 Tests Passed (100% Green)

---

## 1. Rekapitulasi Rangkaian Pengujian

| Lapisan Sistem | Runner / Framework | Jumlah Pengujian | Status Kelulusan | Durasi |
|---|---|---|---|---|
| **Backend API & Domain** | `pytest 9.1.1` | **76 tests** | **100% Passed** | 43.01s |
| **Frontend Web & UI** | `vitest 3.2.7` | **95 tests** | **100% Passed** | 8.21s |
| **Mobile Engine** | `vitest 5.0.5` | **15 tests** | **100% Passed** | 0.32s |
| **Total Sistem** | — | **186 tests** | **100% Passed (0 Failures)** | **~51.54s** |

---

## 2. Pengujian Skenario E2E Kritis

- **E2E-01 (Warga Baru ke Penjemputan Pertama)**:
  `tests/api/test_journey_1_happy_path.py` memverifikasi pendaftaran, pengisian alamat, pemesanan slot penjemputan, hingga kredit poin reward setelah timbangan.
- **E2E-02 (Petugas Baru ke Tugas Terselesaikan)**:
  `tests/api/test_phase3_petugas_dispatch.py` memverifikasi pengajuan petugas, review admin, klaim tugas atomik, penimbangan di hadapan warga, dan penyerahan ke TPS3R.
- **E2E-03 (Fasilitas TPS3R ke Mitra Daur Ulang B2B)**:
  `tests/api/test_phase4_facility_and_waste_bank.py` & `test_phase5_marketplace_organic_and_b2b.py` memverifikasi penerimaan muatan sampah, pemilahan stok dengan row-lock pesimistik, agregasi batch, dan penebusan pesanan oleh mitra industri.
- **E2E-04 (Bank Sampah Mandiri)**:
  Memverifikasi pendaftaran nasabah, transaksi tabungan rupiah, dan pembalikan transaksi kompensasi saat koreksi salah timbang.
- **E2E-05 (Komunitas Banjar & Tata Kelola)**:
  `tests/api/test_phase6_community_funding_and_special_features.py` memverifikasi pelaporan wilayah banjar, alokasi anggaran sponsor CSR, dan pelacakan manifes limbah khusus/upakara.

---

## 3. Verifikasi Zero Test Regression
Seluruh pengujian baseline awal tetap lulus tanpa ada pengujian yang dinonaktifkan (`skip`, `xfail`). Penambahan fitur formulir pengajuan petugas dan pemulihan sandi interaktif terbukti stabil tanpa efek samping pada rute lain.
