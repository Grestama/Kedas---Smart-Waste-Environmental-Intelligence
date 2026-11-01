# BASELINE PERUBAHAN PRA-EXISTING (GIT SAFETY AUDIT)
**Dokumen:** `01_PRE_EXISTING_CHANGES.md`  
**Proyek:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Waktu Audit:** 1 November 2026, 02:17:00+08:00  
**Git Branch:** `master`  
**Git HEAD Commit:** `84789d639ff3ad4a47670ca6f9ca0c0fdf7ea99a` (`feat(phase-7): complete master e2e integration test, quality assurance, and pilot runbook`)  
**Status Working Tree:** Dirty (77 modified, 2 deleted, 263 untracked files)

---

## 1. Kebijakan Keselamatan Git (Safety Lock)

Sesuai **Master Instruction 0.4 & 0.5**:
1. Seluruh perubahan yang ada di working tree sebelum proses cleanup ini dimulai diklasifikasikan sebagai **`PRE_EXISTING_USER_CHANGE`**.
2. **Dilarang keras** melakukan `git reset`, `git checkout .`, `git clean -fd`, atau perintah destruktif apa pun yang menghilangkan atau menimpa perubahan tersebut.
3. Seluruh modifikasi backend, migrasi database, model data, dokumentasi PRD/SRS/HDD, komponen frontend, dan test yang sudah dibuat oleh user/agent sebelumnya **wajib dipertahankan**.

---

## 2. Ringkasan Perubahan Pra-Existing

| Kategori Perubahan | Jumlah Berkas | Keterangan |
| :--- | :--- | :--- |
| **Modified Files (Unstaged)** | 77 berkas | Perubahan fungsional backend, frontend components/pages, tests, tokens, styling. |
| **Deleted Files (Unstaged)** | 2 berkas | Berkas prompt lama yang dihapus sebelum sesi (`prompt_pack_frontend.txt`, `prompt_pengembangan_wastelink_7_tahap.md`). |
| **Untracked Files** | 263 berkas | Berkas dokumentasi, modul AI backend, rute baru frontend, migrasi database, dan cache lokal. |
| **Staged Changes** | 0 berkas | Tidak ada perubahan yang sedang di-stage ke index Git. |

---

## 3. Daftar Berkas Termodifikasi Pra-Existing (`PRE_EXISTING_USER_CHANGE`)

Berikut adalah daftar lengkap 77 berkas yang telah dimodifikasi oleh user/agent sebelum inisiasi cleanup:

### 3.1 Dokumentasi & Root
1. `README.md` (Update status eksekusi Kedas dan tautan navigasi)

### 3.2 Backend (FastAPI, Alembic, Modules & DB Base)
2. `backend/app/api/v1/community.py` (Endpoint program banjar & agregasi komunitas)
3. `backend/app/api/v1/pickup_requests.py` (Logika verifikasi setoran dan dispatch)
4. `backend/app/api/v1/router.py` (Pendaftaran rute API v1 terpadu)
5. `backend/app/core/dependencies.py` (Injeksi dependensi sesi dan perizinan)
6. `backend/app/db/base.py` (Registrasi model SQLAlchemy)
7. `backend/app/modules/collection/schemas.py` (Skema Pydantic setoran sampah)
8. `backend/app/modules/collection/service.py` (Layanan alur penjemputan & intake)
9. `backend/app/modules/community/models.py` (Model basis data banjar adat)
10. `backend/app/modules/community/schemas.py` (Skema Pydantic komunitas)
11. `backend/app/modules/community/service.py` (Layanan agregasi komunitas & banjar)
12. `backend/app/modules/evidence/models.py` (Model bukti foto timbangan)
13. `backend/app/modules/facility/models.py` (Model fasilitas TPST/TPS3R)
14. `backend/app/modules/facility/service.py` (Layanan kapasitas fasilitas)
15. `backend/app/modules/inspection/models.py` (Model inspeksi lapangan)
16. `backend/app/modules/marketplace/models.py` (Model katalog reward & material)
17. `backend/app/modules/marketplace/schemas.py` (Skema marketplace)
18. `backend/app/modules/marketplace/service.py` (Layanan transaksi poin)
19. `backend/app/modules/notification/models.py` (Model antrean notifikasi)
20. `backend/app/modules/points/models.py` (Model WastePoints warga)
21. `backend/app/modules/weight/models.py` (Model timbangan operasional)

### 3.3 Frontend Package & Config
22. `frontend/package-lock.json`
23. `frontend/package.json` (Dependensi UI & testing)
24. `frontend/tailwind.config.ts` (Alias token backward compatibility)
25. `frontend/vitest.config.ts` (Konfigurasi runner pengujian frontend)

### 3.4 Frontend Routes (App Router)
26. `frontend/src/app/(public)/area-layanan/page.tsx`
27. `frontend/src/app/(public)/daftar/page.tsx`
28. `frontend/src/app/(public)/faq/page.tsx`
29. `frontend/src/app/(public)/layout.tsx`
30. `frontend/src/app/(public)/lupa-password/page.tsx`
31. `frontend/src/app/(public)/masuk/page.tsx`
32. `frontend/src/app/(public)/page.tsx`
33. `frontend/src/app/(public)/panduan/page.tsx`
34. `frontend/src/app/admin/audit-log/page.tsx`
35. `frontend/src/app/admin/laporan/page.tsx`
36. `frontend/src/app/admin/layout.tsx`
37. `frontend/src/app/admin/page.tsx`
38. `frontend/src/app/app/dampak/page.tsx`
39. `frontend/src/app/app/layout.tsx`
40. `frontend/src/app/app/page.tsx`
41. `frontend/src/app/app/profil/page.tsx`
42. `frontend/src/app/app/setoran/[id]/page.tsx`
43. `frontend/src/app/app/setoran/baru/page.tsx`
44. `frontend/src/app/app/setoran/page.tsx`
45. `frontend/src/app/app/waste-points/page.tsx`
46. `frontend/src/app/globals.css`
47. `frontend/src/app/layout.tsx`
48. `frontend/src/app/mobile/page.tsx`
49. `frontend/src/app/staff/layout.tsx`
50. `frontend/src/app/staff/page.tsx`
51. `frontend/src/app/staff/tugas/[id]/page.tsx`

### 3.5 Frontend Shells & Components
52. `frontend/src/components/shells/AdminSidebar.tsx`
53. `frontend/src/components/shells/PublicHeader.tsx`
54. `frontend/src/components/shells/StaffSidebar.tsx`
55. `frontend/src/components/shells/UserSidebar.tsx`
56. `frontend/src/components/shells/WorkspaceSwitchBar.tsx`
57. `frontend/src/components/ui/Button.tsx`
58. `frontend/src/components/ui/Checkbox.tsx`
59. `frontend/src/components/ui/DataTable.tsx`
60. `frontend/src/components/ui/Input.tsx`
61. `frontend/src/components/ui/Modal.tsx`
62. `frontend/src/components/ui/Panel.tsx`
63. `frontend/src/components/ui/StatCard.tsx`
64. `frontend/src/components/ui/StatusBadge.tsx`
65. `frontend/src/components/ui/Toast.tsx`

### 3.6 Frontend Services, Tokens & Tests
66. `frontend/src/lib/api-client.ts`
67. `frontend/src/services/collection.ts`
68. `frontend/src/services/community.ts`
69. `frontend/src/services/staff.ts`
70. `frontend/src/test/admin.test.tsx`
71. `frontend/src/test/collection.test.tsx`
72. `frontend/src/test/design-system.test.tsx`
73. `frontend/src/test/setup.ts`
74. `frontend/src/test/staff.test.tsx`
75. `frontend/src/tokens/index.ts`
76. `frontend/src/types/community.ts`
77. `frontend/src/types/marketplace.ts`

---

## 4. Berkas Terhapus Pra-Existing
1. `docs/prompt_pack_frontend.txt` (Dihapus sebelumnya)
2. `docs/prompt_pengembangan_wastelink_7_tahap.md` (Dihapus sebelumnya)

---

## 5. Ringkasan Berkas Untracked Pra-Existing
1. **`PAKET_DOKUMEN_KEDAS_AI_WEB_INNOVATION/` (7 berkas):** Dokumen spesifikasi inti AI, PRD, SRS, HDD, Design System.
2. **`backend/` (18 berkas):**
   - Migrasi Alembic: `0009_cdoa_and_destination_agreements.py`, `0010_ai_knowledge_and_interactions.py`
   - Modul AI: `api/v1/ai.py`, `cli/evaluate_ai.py`, `cli/seed_demo.py`, `modules/ai/*` (6 berkas)
   - Testing API: 5 file test `backend/tests/api/test_*.py`
   - Database runtime lokal: `backend/wastelink.db` (dilarang dihapus, data operasional demo)
3. **`frontend/` (39 berkas):**
   - Asset publik: `frontend/public/images/hero-cleanup.jpg`, `mosaic-1.jpg`, `mosaic-2.jpg`
   - Rute baru: `app/(public)/guest/page.tsx`, `app/(public)/tanya/page.tsx`, `app/admin/pengetahuan/page.tsx`, `app/hospitality/*` (6 berkas)
   - Komponen UI & AI: `components/ai/*` (11 berkas), `components/ui/*` (7 berkas), `components/analytics/DCLIRadarChart.tsx`, `components/staff/OfflineOutboxBanner.tsx`
   - Service & Lib: `services/ai.ts`, `lib/offline-queue.ts`, `tokens/icons.ts`
   - Test suites: 5 file pengujian baru (`ai-components.test.tsx`, `hospitality.test.tsx`, `interaction-components.test.tsx`, `knowledge-admin.test.tsx`, `service-area.test.tsx`)
4. **`docs/` (196 berkas):**
   - Laporan audit, arsitektur, laporan implementasi (`docs/reports/`, `docs/reports/frontend-role-alignment/`, dll.)
5. **`node_modules/` (2 berkas di root):**
   - `.vite/vitest/CACHEDIR.TAG` dan file cache hasil test. Ini adalah **build artifact / cache** yang tidak sengaja terbentuk di root akibat eksekusi vitest terdahulu dan belum ter-ignore di root `.gitignore`.

---
*Kesimpulan: Seluruh berkas di atas dicatat secara akurat dan tidak akan disentuh secara destruktif.*
