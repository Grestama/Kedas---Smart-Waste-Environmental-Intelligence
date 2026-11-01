# LOG PERUBAHAN PENYELARASAN WORKSPACE ROLE (ROLE ALIGNMENT CHANGELOG)
**Dokumen:** `06_ROLE_ALIGNMENT_CHANGELOG.md`  
**Status:** Disetujui & Terverifikasi (Tahap 3)  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Ringkasan Perubahan per Domain Role

Penyelarasan visual pada Tahap 3 dilakukan secara aman dengan prinsip *frontend-only* dan *zero functional regression*. Seluruh rute, hook, servis API, validasi formulir, dan hak akses otentikasi dipertahankan 100%.

### 1.1 Warga / Resident Workspace (`/app/**`)
- **Rute yang Diselaraskan:** `/app`, `/app/setoran`, `/app/setoran/baru`, `/app/setoran/[id]`, `/app/waste-points`, `/app/dampak`.
- **Perubahan Visual & Interaksi:**
  - **Formulir Setoran Baru (`/app/setoran/baru`):** Banner panduan Kedas Vision ditingkatkan ke `rounded-2xl border-2 border-[#D7E4D9] bg-[#E8F0E9]` dengan tombol `Button` taktil `active:scale-95`. Kartu radio mode penyerahan dan kategori sampah distandarkan menggunakan `border-2` dengan hover lift `-translate-y-0.5` dan `shadow-interactive`. Badge kuota slot jadwal diperbarui dengan status semantik `bg-[#E7F4EA] text-[#276749] border-[#BCE1C7]`.
  - **Digital Waste Passport (`/app/setoran/[id]`):** Menghilangkan gradien dekoratif generik (`bg-gradient-to-br from-white via-emerald-50/20 to-stone-50`), digantikan dengan panel paspor kredibel `rounded-2xl border-2 border-brand-900/25 bg-surface shadow-sm` berheader rapi dengan icon container `ShieldCheck`, label `text-brand-900`, dan 4 kartu data kanvas terstandar (`bg-canvas border-border`).
  - **Filter Status Setoran (`/app/setoran`):** Mengganti tab tombol kotak biasa menjadi pill tombol melengkung penuh (`rounded-full px-3.5 py-1.5`) dengan state aktif `bg-brand-900 text-white shadow-xs` dan feedback taktil.

### 1.2 Petugas Lapangan POS Workspace (`/staff/**`)
- **Rute yang Diselaraskan:** `/staff`, `/staff/tugas/tersedia`, `/staff/tugas/saya`, `/staff/tugas/[id]`, `/staff/riwayat`.
- **Perubahan Visual & Interaksi:**
  - **Meja Eksekusi Timbangan (`/staff/tugas/[id]`):** Box kalkulasi berat bersih (Netto = Bruto - Tara) distandarkan ke `bg-[#E8F0E9] border-2 border-[#D7E4D9] rounded-2xl` dengan tipografi monospaced kontras tinggi `text-3xl font-extrabold text-brand-900`.
  - **Status Gating Inspeksi QC:** Indikator status hasil inspeksi distandarkan ke semantic badge `bg-[#E7F4EA] text-[#276749] border-[#BCE1C7]`. Form penimbangan terkunci (*locked state*) memiliki ikon gembok dan border putus-putus yang mudah dipahami saat di bawah terik matahari lapangan.
  - **Pencegahan Regresi:** Logika antrean luring (`OfflineOutboxBanner`, `enqueueWeighing`) tetap utuh tanpa modifikasi logika.

### 1.3 Green Hospitality Workspace (`/hospitality/**`)
- **Rute yang Diselaraskan:** `/hospitality`, `/hospitality/setoran`, `/hospitality/esg`, `/hospitality/guest-companion`, `/hospitality/lapor`.
- **Perubahan Visual & Interaksi:**
  - **Welcome Banner Hero:** Menghilangkan gradien SaaS ungu/teal generic (`from-emerald-900 via-teal-900 to-brand-900`), digantikan dengan panel evergreen berwibawa `bg-[#122620] border-2 border-[#1D3F35] rounded-2xl p-6 sm:p-8 shadow-card` dengan pill konteks `bg-white/10 text-emerald-300 border border-white/15` yang selaras dengan Public Main.
  - **Pembersihan Kelas Warna Non-Token:** Menghapus penggunaan kelas `sand-100` dan mengintegrasikan alias `foreground` dan `muted` di `tailwind.config.ts` sehingga seluruh teks sekunder dan heading B2B merender warna `#122620` dan `#53645E`.

### 1.4 Admin / Destination Console Workspace (`/admin/**`)
- **Rute yang Diselaraskan:** `/admin`, `/admin/pengetahuan`, `/admin/permintaan`, `/admin/kategori`, `/admin/mitra`, `/admin/audit-log`.
- **Perubahan Visual & Interaksi:**
  - **Konsol Pengawasan (`/admin`):** Seluruh panel ringkasan komposisi material TPS3R dan kapasitas pendanaan ditingkatkan ke `rounded-2xl border-2 border-border/80 shadow-xs`.
  - **Manajemen Basis Pengetahuan Grounded RAG (`/admin/pengetahuan`):** Standarisasi badge tipe sumber dokumen regulasi: Regulasi (Info biru Kedas `#315F86`), SOP TPS3R (Success hijau `#276749`), CDOA (Sage `#1D3F35`), dan Edukasi (Warning `#98631C`).
  - **Sidebar Admin:** Penyeragaman ke tema deep evergreen `#1D3F35` beraksen `border-l-4 border-emerald-400 pl-2.5`.

---

## 2. Pemeliharaan Kontrak & Dependensi Frontend

Tidak ada satu pun kode backend, controller, endpoint FastAPI, skema basis data SQLite/PostgreSQL, maupun policy RBAC yang disentuh. Seluruh 126 unit dan integration tests Vitest serta typecheck TypeScript tetap lulus 100%.
