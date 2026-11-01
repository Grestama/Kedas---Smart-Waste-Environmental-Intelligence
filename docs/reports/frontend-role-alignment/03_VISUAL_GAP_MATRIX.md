# MATRIKS EVALUASI KESENJANGAN VISUAL (VISUAL GAP MATRIX)
**Dokumen:** `03_VISUAL_GAP_MATRIX.md`  
**Status:** Penilaian Kualitas Desain Antar-Ruang Kerja  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Metodologi Penilaian

Setiap ruang kerja dinilai dengan skala 0 hingga 5 pada sembilan (9) dimensi visual dan interaksi, menggunakan **Public Main Website** sebagai patokan ideal (benchmark skor 5.0):

- **5 (Sempurna / Master Benchmark):** Mengikuti sepenuhnya design token, hierarki tipografi, palet 60-30-10, border 2px interaktif, icon-led balance, dan state lengkap.
- **4 (Sangat Baik / Minor Alignment Needed):** Struktur dasar selaras, namun ada inkonsistensi minor pada radius, padding, atau varian shadow.
- **3 (Cukup / Moderate Gap):** Memiliki struktur fungsi yang baik, tetapi masih menggunakan token warna paralel (misalnya kelas Tailwind generik seperti `stone-*`, `slate-*` tanpa variabel Kedas), atau border 1px pasif pada elemen interaktif.
- **2 (Kurang / Significant Gap):** Terdapat perbedaan mencolok pada layout, density, icon language, atau ketiadaan state visual kunci.
- **1 (Buruk / Severe Regression):** Tidak mengikuti identitas visual brand Kedas sama sekali.
- **0 (Tidak Tersedia / Missing Scope):** Modul rute tidak ada di frontend.

---

## 2. Tabel Penilaian Kesenjangan Visual Antar-Workspace

| Dimensi Desain | Public Main (Source) | Guest Companion | Warga (`/app`) | Petugas (`/staff`) | Hospitality (`/hospitality`) | Admin (`/admin`) | Mobile Simulator (`/mobile`) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1. Brand Consistency** | 5.0 | 4.8 | 4.4 | 4.6 | 4.3 | 4.5 | 4.2 |
| **2. Typography Consistency** | 5.0 | 4.7 | 4.3 | 4.4 | 4.2 | 4.4 | 4.3 |
| **3. Color Consistency (60-30-10)** | 5.0 | 4.8 | 4.2 | 4.5 | 4.1 | 4.3 | 4.1 |
| **4. Layout & Grid Composition** | 5.0 | 4.6 | 4.3 | 4.3 | 4.2 | 4.4 | 4.0 |
| **5. Component Consistency** | 5.0 | 4.7 | 4.2 | 4.4 | 4.1 | 4.3 | 4.2 |
| **6. Iconography (Lucide 1.85 & Icon-led)** | 5.0 | 4.9 | 4.5 | 4.6 | 4.4 | 4.5 | 4.4 |
| **7. Interaction & Motion** | 5.0 | 4.6 | 4.1 | 4.2 | 4.0 | 4.1 | 4.0 |
| **8. Responsive Quality** | 5.0 | 4.7 | 4.3 | 4.4 | 4.2 | 4.2 | 4.5 |
| **9. Accessibility & Focus States** | 5.0 | 4.8 | 4.4 | 4.5 | 4.2 | 4.4 | 4.3 |
| **Rata-rata Skor** | **5.00** | **4.73** | **4.30** | **4.43** | **4.19** | **4.34** | **4.19** |

---

## 3. Rincian Temuan & Bukti Kesenjangan Visual (Visual Gaps)

### 3.1 Workspace Warga (`/app`) — Rata-rata 4.30
- **Color & Token Gap:** Pada beberapa komponen AI dan form input (misal `AICitationCard`, `AIAbstainState`), masih ditemukan kelas warna netral generik Tailwind (`stone-50`, `stone-200`, `stone-600`) alih-alih token Kedas (`kedas-ivory-50`, `kedas-paper-0`, `kedas-slate-700`, `border-border`).
- **Border & Radius Gap:** Pada form deposit baru (`/app/setoran/baru`), beberapa panel pembungkus menggunakan border default 1px pasif dan radius `rounded-xl`, sedangkan Public Main menggunakan border interaktif 2px (`border-2 border-border`) dengan radius `rounded-2xl` dan hover lift.
- **Interaction/Motion Gap:** Transisi pada list transaksi setoran belum menyertakan `ease-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`) yang seragam seperti kartu layanan publik.

### 3.2 Workspace Petugas POS (`/staff`) — Rata-rata 4.43
- **Brand & Theme Rationale:** Petugas menggunakan tema sidebar gelap `#122620` yang sangat tepat untuk operasional luar ruangan (high-contrast sunlight readability). Ini adalah variasi fungsional yang sah.
- **Form Weighing Gap:** Kartu input timbangan digital di `/staff/tugas/[id]` memerlukan penegasan border interaktif saat aktif (`border-2 border-brand-800` atau `border-emerald-400`) agar pembacaan berat netto lebih tegas.
- **Micro-interaction:** Tombol konfirmasi QC pass/reject memerlukan feedback state yang lebih taktil (`active:scale-[0.98]`) tanpa menambah animasi berat yang memperlambat alur kerja fisik.

### 3.3 Workspace Green Hospitality (`/hospitality`) — Rata-rata 4.19
- **Top Navigation Gap:** Header navigasi tenant menggunakan tinggi 64px (`h-16`) yang sedikit berbeda dari proporsi `PublicHeader` (80px `h-20`). Border bawah menggunakan `shadow-xs` sederhana tanpa standardisasi `shadow-nav`.
- **Tenant Selector Dropdown:** Dropdown pemilih properti villa/hotel (`SAMPLE_TENANTS`) memiliki gaya popup yang belum sepenuhnya memanfaatkan token `rounded-2xl`, border 2px, dan bayangan `shadow-popover`.
- **StatCard Styling:** Sebagian kartu KPI metrik sampah komersial menggunakan container inline alih-alih komponen shared `StatCard` dengan standardisasi border 2px dan hover lift.

### 3.4 Workspace Admin Console (`/admin`) — Rata-rata 4.34
- **High-Density Table Contrast:** Tabel data pengguna, pengajuan petugas, dan audit log memiliki latar header `#F8F9F8` yang sedikit pucat. Perlu diselaraskan dengan aksen sage `bg-[#E8F0E9]/60` atau border bawah tegas `border-b-2 border-brand-900/10`.
- **AI Copilot Insight Cards:** Kartu proposal tindakan Copilot di `/admin` sudah memiliki indikator, namun rujukan sitasi dan pembagian tombol tindakan (*Approve*, *Edit*, *Reject*) perlu diselaraskan dengan hierarki tombol Public Main.

### 3.5 Guest Green Companion (`/guest`) — Rata-rata 4.73
- **Konsistensi Tinggi:** Merupakan halaman yang paling mendekati Public Main karena berbagi layout shell publik.
- **Penyelarasan Minor:** Kartu tempat sampah 3 aliran (Hijau, Kuning, Abu-abu) perlu dipastikan memiliki ketebalan border 2px seragam dan hover elevation `shadow-interactive`.

---

## 4. Prioritas Rencana Perbaikan (Tahap 2 & Tahap 3)

1. **Normalisasi Token Desain:** Pastikan seluruh komponen bersama (`Panel`, `StatCard`, `DataTable`, `PageHeader`, `AICitationCard`, `AIAbstainState`, `AIConfidenceIndicator`) menggunakan token warna, border, dan radius yang 100% konsisten dengan Public Main.
2. **Penyelarasan Shell Navigasi:** Perhalus `UserSidebar`, `StaffSidebar`, `AdminSidebar`, dan top navbar `HospitalityLayout` agar irama visual, avatar profil, badge peran, dan interaksi link identik dengan brand Kedas.
3. **Pemberian Border 2px & Hover Lift pada Kartu Interaktif:** Menerapkan standardisasi `border-2 border-border hover:border-brand-800 hover:-translate-y-1 hover:shadow-interactive` pada seluruh kartu data dan ringkasan di semua ruang kerja.
4. **Pembersihan Kelas Warna Generik:** Menggantikan sisa warna non-token (`stone-*`, `slate-*`, `rose-*`) dengan token semantik Kedas yang tepat.
