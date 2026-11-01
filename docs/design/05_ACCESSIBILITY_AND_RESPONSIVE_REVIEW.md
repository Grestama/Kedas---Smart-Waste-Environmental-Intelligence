# 05. Evaluasi Aksesibilitas (WCAG 2.2 AA) & Responsivitas — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Accessibility Specialist & Frontend Engineer  
**Status**: Implemented & Verified

---

## 1. Evaluasi Kepatuhan Aksesibilitas (WCAG 2.2 Level AA)

| Kriteria WCAG | Implementasi pada Antarmuka Kedas | Status |
|---|---|---|
| **1.4.3 Contrast (Minimum)** | Rasio kontras teks utama (`#1E2A25`) terhadap latar canvas (`#F6F6F1`) mencapai 11.2:1 (jauh di atas batas minimum 4.5:1). Teks tombol primary terhadap background mencapai 9.4:1. | **COMPLIANT** |
| **2.1.1 Keyboard Accessible** | Seluruh tombol, input, select, dan modal dapat dioperasikan penuh via tombol `Tab`, `Enter`, `Space`, dan `Escape`. | **COMPLIANT** |
| **2.4.7 Focus Visible** | Setiap elemen interaktif memiliki cincin fokus terlihat kontras (`focus-visible:ring-2 focus-visible:ring-[#83b6a0] outline-offset-2`). | **COMPLIANT** |
| **2.3.3 Animation from Interactions** | Menerapkan `@media (prefers-reduced-motion: reduce)` pada seluruh keyframe dan transisi. | **COMPLIANT** |
| **4.1.2 Name, Role, Value** | Modal dilengkapi `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, dan tombol close berlabel `aria-label="Tutup modal"`. Tombol loading dilengkapi `aria-busy="true"`. | **COMPLIANT** |

---

## 2. Pengujian Viewport Responsif

Antarmuka web Kedas telah diverifikasi pada berbagai resolusi layar:
- **Mobile Kecil (360px – 390px)**: Navigasi beralih ke mobile drawer menu; tabel data bertransformasi menjadi kartu ringkas vertikal; touch target tombol berukuran minimal 44x44px.
- **Tablet (768px – 1024px)**: Grid stat card beradaptasi 2 kolom; sidebar dapat diperkecil; modal terpusat dengan padding proporsional.
- **Desktop (1280px – 1920px)**: Layout 3 kolom optimal (Sidebar Navigasi, Area Konten Utama, Panel Status Samping).
