# Log Eksekusi Tahap 3: Role Application, Organization Onboarding, Verification, Approval, dan Role Switch

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Full-Stack Architect & IAM Engineer  
**Status Quality Gate**: **PASSED**

---

## 1. Tujuan Tahap
Menyelesaikan alur pengajuan peran calon petugas dari sisi antarmuka warga (Journey B), menghubungkan siklus permohonan ke konsol verifikasi admin, memastikan pemisahan organisasi/tenancy, dan memvalidasi matriks hak akses.

## 2. Perubahan & Peningkatan yang Dilakukan
- `frontend/src/app/app/profil/page.tsx`:
  - Menambahkan integrasi API `GET /collector-applications/mine` untuk membaca status permohonan petugas pengguna aktif secara langsung.
  - Menambahkan panel antarmuka "Kemitraan Petugas Pengangkut Sampah" dengan indikator status dinamis (`PENDING`, `APPROVED`, `REJECTED`, atau penawaran pendaftaran).
  - Menambahkan Modal interaktif `Formulir Pengajuan Petugas Pengangkut Sampah` dengan pilihan armada (Motor roda tiga, Pick-up, Gerobak listrik), catatan pengalaman wilayah, dan komitmen keselamatan APD.
  - Menyediakan tombol pintas langsung ke Meja Petugas (`/staff`) ketika permohonan telah disetujui.
- Verifikasi konsistensi terhadap `backend/app/api/v1/collector_applications.py` dan `frontend/src/app/admin/pengajuan-petugas/page.tsx`.

## 3. Hasil Pengujian yang Dijalankan
- `npm --prefix frontend run typecheck`: 0 errors.
- `pytest tests/api/test_rbac_and_roles.py`: 3/3 passed.
- `pytest tests/api/test_phase3_petugas_dispatch.py`: 7/7 passed.

## 4. Deliverables yang Dihasilkan
1. `docs/iam/03_ROLE_AND_ORGANIZATION_ONBOARDING.md`
2. `docs/iam/03_PERMISSION_MATRIX.md`
3. `docs/iam/03_VERIFICATION_WORKFLOW.md`

## 5. Status Quality Gate & Tahap Berikutnya
- **Status Gate**: **PASSED**.
- **Langkah Berikutnya**: Langsung melanjutkan otomatis ke **Tahap 4: Operational Workspace, Role Dashboard, dan End-to-End System Management**.
