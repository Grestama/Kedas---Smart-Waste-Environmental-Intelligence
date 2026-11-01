# 05. Panduan Desain Sistem & Gerak Antarmuka (Motion Guideline) — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Product Designer & Motion / Interaction Designer  
**Status**: Implemented & Verified

---

## 1. Filosofi Desain Visual Kedas

Kedas merefleksikan harmoni antara kebersihan lingkungan, kearifan lokal Bali (*Tri Hita Karana*), dan teknologi sirkular yang terpercaya. Prinsip visual utama:
- **Clean & Calm Operations**: Menghindari gradien neon yang melelahkan mata petugas di lapangan. Menggunakan palet hijau botol teredam (`#1D3F35`, `#2F6552`) dan kanvas natural hangat (`#F6F6F1`).
- **Tactile Accessibility**: Setiap tombol memiliki umpan balik taktil saat ditekan (`active:scale-[0.98]`) dan cincin fokus keyboard kontras tinggi (`focus-visible:ring-2 focus-visible:ring-[#83b6a0]`).
- **Data Clarity**: Kartu ringkasan metrik menggunakan kontras tinggi dan efek elevasi halus (`hover:-translate-y-0.5 hover:shadow-md`) untuk keterbacaan cepat.

---

## 2. Token Motion & Spesifikasi Durasi

```
Micro-interaction (Button press, Checkbox, Icon toggle):
├── Durasi: 120ms – 160ms
└── Easing: ease-out / cubic-bezier(0.16, 1, 0.3, 1)

Component Transition (Modal scale-in, Dropdown, Toast):
├── Durasi: 200ms – 240ms
└── Easing: cubic-bezier(0.16, 1, 0.3, 1)

Surface / Page Transition (Fade-in backdrop):
├── Durasi: 200ms – 260ms
└── Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

### Animasi Kunci yang Diterapkan di `globals.css`:
- `.animate-fade-in`: Animasi opasitas halus untuk backdrop modal dan overlay.
- `.animate-scale-in`: Animasi skala `0.96 -> 1.0` untuk kotak dialog modal.
- `.animate-slide-in-right`: Transisi masuk untuk notifikasi toast di pojok kanan bawah/atas.
- `.animate-slide-up`: Transisi naik halus untuk form pengajuan dan kartu baru.

---

## 3. Dukungan Aksesibilitas Vestibular (`prefers-reduced-motion`)

Kedas secara ketat mematuhi preferensi sistem pengguna yang sensitif terhadap mabuk gerak (*vestibular motion sickness*):
```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Ketika preferensi ini aktif pada sistem operasi pengguna (Windows, macOS, iOS, Android), seluruh animasi dan transisi dieliminasi seketika tanpa mengurangi kejelasan feedback atau fungsionalitas tombol.
