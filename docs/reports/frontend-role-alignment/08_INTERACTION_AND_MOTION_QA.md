# LAPORAN QA INTERAKSI & SISTEM MOTION (INTERACTION & MOTION QA)
**Dokumen:** `08_INTERACTION_AND_MOTION_QA.md`  
**Status:** Terverifikasi & Lulus (Tahap 4)  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Audit State Interaktif Komponen

Seluruh komponen interaktif diuji pada 11 status (*states*) guna memastikan tidak ada ambiguitas visual dan tidak hanya bergantung pada warna semata:

| Komponen | Default | Hover | Focus-Visible | Active/Pressed | Disabled | Loading | Success | Error | Empty |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Button** | Lulus | Lulus (`hover:bg-[#152e27]`, shadow) | Lulus (`ring-2 ring-[#83b6a0]`) | Lulus (`scale-[0.98]`) | Lulus (`opacity-50`, no cursor) | Lulus (`Loader2` spin) | Lulus | Lulus (`bg-[#A43F35]`) | - |
| **IconButton** | Lulus | Lulus (border/bg highlight) | Lulus (`ring-2 ring-[#83b6a0]`) | Lulus (`scale-95`) | Lulus (`opacity-40`) | Lulus (`Loader2` spin) | Lulus | Lulus | - |
| **Input & Select** | Lulus (border-1) | Lulus (`border-[#b0beb5]`) | Lulus (`ring-2 ring-[#83b6a0]`) | Lulus | Lulus (`bg-[#f1f3f1]`) | - | - | Lulus (`border-[#A43F35]`) | - |
| **Card / Panel** | Lulus (border-2) | Lulus (`-translate-y-1`, shadow) | Lulus (`ring-2 ring-[#83b6a0]`) | Lulus (`scale-[0.99]`) | Lulus | Lulus (`LoadingSkeleton`) | Lulus | Lulus | Lulus (`EmptyState`) |
| **Dropdown / Popover** | Lulus | Lulus (bg highlight) | Lulus (`bg-kedas-sage-100`) | Lulus | Lulus (`opacity-40`) | - | - | Lulus (Destructive red) | - |
| **Modal & Drawer** | Lulus | Lulus (close btn) | Lulus (focus trapped) | Lulus | - | - | - | - | - |

---

## 2. Standarisasi Motion Language

Motion di seluruh aplikasi Kedas diatur secara disiplin berdasarkan `docs/design/design_web.md` dan `frontend/src/app/globals.css`:

1. **Durasi Terukur:**
   - Mikro-taktil (klik tombol/ikon): `100ms` (`--motion-instant`)
   - Hover kartu & dropdown transisi: `160ms` (`--motion-fast`)
   - Modal fade-in & scale-in: `220ms` (`--motion-normal`)
   - Drawer slide-in & sheet buka: `320ms` (`--motion-emphasis`)
2. **Kurva Easing Alami:**
   - Interaksi kartu: `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-soft`) memberikan efek pegas lembut tanpa goyangan berlebih.
   - Dialog dan popover: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-enter`).
3. **Pencegahan Anti-Pattern:**
   - Tidak ada animasi berulang tanpa fungsi (*infinite bouncing/glowing*).
   - Tidak ada parallax berat yang membebani GPU atau memicu layout shift pada scrolling tabel data.
   - Seluruh kartu interaktif menggunakan ketebalan border 2px tetap (`border-width: 2px !important`) sehingga hover tidak memicu pergeseran elemen sekitar.
4. **Prefers-Reduced-Motion:**
   - CSS media query `@media (prefers-reduced-motion: reduce)` diterapkan global pada `globals.css`. Jika pengguna mengaktifkan preferensi kurangi gerak di OS, seluruh durasi animasi menjadi `0.001ms`, transformasi nonaktif, dan transisi menjadi instan demi kenyamanan vestibular.

---

## 3. Overlay & Focus Management Verification

- **Modal Dialog (`Modal.tsx`):**
  - Mengunci scrolling latar belakang (`document.body.style.overflow = "hidden"`).
  - Mengimplementasikan focus trap (fokus Tab berputar di dalam modal tanpa bocor ke elemen latar).
  - Mendukung tombol `Escape` untuk menutup modal dengan aman.
  - Mengembalikan fokus keyboard ke elemen pemicu sebelumnya saat modal ditutup.
- **Drawer Slide-over (`Drawer.tsx`):**
  - Mendukung penutupan dengan tombol ESC dan backdrop click.
  - Varian bottom mobile menggunakan animasi slide dari bawah (`animate-slide-in-bottom`) dengan sudut melengkung `rounded-t-2xl`.
- **Dropdown Menu (`Dropdown.tsx`):**
  - Mendukung navigasi keyboard penuh: `ArrowDown`/`ArrowUp` untuk memindahkan fokus antar-item, `Enter`/`Space` untuk memilih, dan `Escape`/`Tab` untuk menutup.
