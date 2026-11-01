# Sistem Motion & Desain Interaksi — Kedas Platform

Dokumen ini mendefinisikan prinsip, spesifikasi matematis, token CSS, dan panduan penggunaan sistem motion dan interaksi mikro untuk platform Kedas (AI-Powered Community & Green Tourism Intelligence Platform).

---

## 1. Prinsip Desain Motion (Core Philosophy)

1. **Tenang & Berakar (Calm & Grounded)**
   Tidak ada pergerakan agresif, bouncing kartun, atau kilauan neon. Setiap transisi mencerminkan ketelitian operasional dan keanggunan visual Bali yang matang.
2. **Tepat & Fungsional (Purposeful & Functional)**
   Animasi hanya dihadirkan untuk menjelaskan affordance, hierarki, perubahan status, atau konfirmasi aksi. Tidak ada animasi murni dekoratif yang membuang waktu pengguna.
3. **Cepat & Ringan (Snappy & Lightweight)**
   Durasi mikro berkisar antara 100ms hingga 220ms. Interaksi terasa instan, tanpa penundaan persepsi yang menghambat pekerjaan lapangan petugas atau input warga.
4. **Lokal & Nyata (Authentic & Tangible)**
   Elemen memiliki bobot fisik yang realistis: tombol terasa membal saat ditekan (`active:scale-[0.98]`), kartu terangkat halus (2px) dengan bayangan teduh.
5. **Aksesibel & Menghormati Vestibular (Accessible & Respectful)**
   Kepatuhan penuh terhadap standar WCAG 2.1 AAA. Ketika pengguna mengaktifkan mode `prefers-reduced-motion: reduce`, seluruh durasi animasi direduksi menjadi instan (`0.001ms`) tanpa pergeseran transform.

---

## 2. Token Waktu, Easing, dan Displasemen (Motion Tokens)

### 2.1 Durasi (Time Tokens)
Dideklarasikan di `:root` dalam `globals.css` dan diintegrasikan pada `tailwind.config.ts`:

| Token | Nilai | Penggunaan Rekomendasi |
| :--- | :--- | :--- |
| `--motion-instant` | `100ms` | Micro-feedback, tactile press state (`:active`), switch toggling. |
| `--motion-fast` | `160ms` | Hover lift, hover tint, icon shift (+1-2px), tooltip dismissal. |
| `--motion-normal` | `220ms` | Dropdown reveal, toast entrance, alert disclosure, badge update. |
| `--motion-emphasis` | `320ms` | Modal window scale-in, drawer slide-in, tab pane switch. |
| `--motion-enter` | `420ms` | Scroll reveal konten baru, hero page load, sequence stagger. |
| `--motion-slow` | `600ms` | Shimmer skeleton, pulse indikator status jaringan/outbox. |

### 2.2 Kurva Easing (Timing Functions)

| Token | Nilai Bezier | Karakteristik & Aplikasi |
| :--- | :--- | :--- |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Gerakan umum UI, dropdown menu, tooltip, perubahan warna dan border. |
| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elemen masuk layar (deceleration mulus tanpa overshoot/bouncing). |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elemen keluar layar (acceleration halus menuju hilang). |
| `--ease-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hover lift kartu, tactile button press, dan transisi elevasi natural. |

### 2.3 Jarak Pergeseran (Displacement)

| Token | Jarak | Penggunaan |
| :--- | :--- | :--- |
| `--motion-distance-xs` | `2px` | Tombol hover lift, nudging panah ikon. |
| `--motion-distance-sm` | `4px` | Pill chips hover, tooltip entrance offset. |
| `--motion-distance-md` | `8px` | Toast stack offset, dropdown popover vertical travel. |
| `--motion-distance-lg` | `14px` | Scroll reveal section entrance, bottom sheet initial offset. |

### 2.4 Bayangan Interaktif (Interactive Shadows)

| Token | CSS Value | Deskripsi |
| :--- | :--- | :--- |
| `--shadow-interactive` | `0 8px 24px rgba(20, 48, 39, 0.09)` | Bayangan default saat hover pada tombol utama dan kartu. |
| `--shadow-interactive-hover` | `0 12px 30px rgba(18, 38, 32, 0.12)` | Bayangan terangkat saat kartu interaktif di-hover aktif. |

---

## 3. Spesifikasi Komponen & Utility

### 3.1 Tombol (Button)
- **Default:** `transition-all duration-fast ease-standard shadow-sm`
- **Hover:** Subtle tint background, `hover:shadow-interactive`, anak panah `group-hover:translate-x-0.5`.
- **Active / Pressed:** `active:scale-[0.98]` untuk memberikan rasa klik taktil.
- **Focus Visible:** `focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:ring-offset-2`.
- **Loading:** Ikon spinner terintegrasi berputar konstan dengan label jujur "Memproses...".

### 3.2 Kartu & Panel (Card & Panel)
- **Utility:** `.card-interactive`
- **Perilaku Hover:** `transform: translateY(-2px)` dipadukan dengan elevasi bayangan `--shadow-interactive-hover` dan penegasan border `#C3CDC6`.
- **Perangkat Sentuh:** Mengabaikan lift pada pointer coarse (`@media (hover: none)`), mempertahankan touch highlight responsif.

### 3.3 Dialog & Modal
- **Backdrop:** Fade-in `200ms` dengan opacity lembut (`bg-kedas-forest-950/60 backdrop-blur-[2px]`).
- **Modal Container:** Scale-in `0.97 -> 1.0` dengan durasi normal (`220ms`) menggunakan `--ease-enter`.
- **Dismiss:** ESC keydown listener, klik backdrop luar, focus kembali ke trigger element saat ditutup.

### 3.4 Drawer / Side Sheet
- **Arah Masuk:** Meluncur dari tepi kanan (desktop/tablet) atau bawah (mobile).
- **Easing:** `--ease-enter` (320ms).
- **Body Lock:** Menghindari layout shift dengan mempertahankan scrollbar width padding jika diperlukan.

---

## 4. Kepatuhan Reduced Motion (Vestibular Safety)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
    transform: none !important;
  }
}
```
Ketika sistem operasi atau browser mendeteksi preferensi vestibular ini, seluruh efek animasi dan transform diubah menjadi transisi instan tanpa gerakan ruang, menjamin kenyamanan 100% bagi pengguna berkebutuhan khusus.
