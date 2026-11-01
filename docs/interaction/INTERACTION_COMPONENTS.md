# Katalog Komponen & Primitif Interaktif — Kedas Platform

Dokumen ini mendokumentasikan katalog lengkap komponen interaktif, perilaku status (state matrix), kontrak aksesibilitas (WAI-ARIA), dan panduan implementasi pada platform Kedas.

---

## 1. Matriks Status Komponen Dasar (Base State Matrix)

| Komponen | Default State | Hover State (Pointer) | Focus-Visible (Keyboard) | Active / Pressed (Click/Tap) | Disabled State | Loading State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Button** | Shadow-sm, border/bg varian, font-medium | Lift/tint, `--shadow-interactive`, anak panah geser 1px | `ring-2 ring-[#83b6a0] ring-offset-2` | `scale-[0.98]` tactile press | `opacity-50`, kursor tidak diizinkan | Spinner berputar konstan, label "Memproses..." |
| **Card / Panel** | Border `#DDE3DD`, shadow `0 1px 3px` | `translateY(-2px)`, border `#C3CDC6`, shadow interaktif | `ring-2 ring-[#83b6a0]` jika tabIndex={0} | Skala stabil, tidak distorsi | N/A | Skeleton shimmer bergradasi lembut |
| **StatCard** | Background varian, shadow halus | `translateY(-2px)`, border penegasan, shadow interaktif | `ring-2 ring-[#83b6a0]` | N/A | N/A | Skeleton shimmer angka & label |
| **Input / Textarea** | Border `#DDE3DD`, text-primary | Border `#b0beb5` | `ring-2 ring-[#83b6a0] border-[#2f6552]` | N/A | Background `#f1f3f1`, teks pudar | N/A |
| **Checkbox** | Border `#DDE3DD`, kotak kosong | Border hover tint | `ring-2 ring-[#83b6a0] ring-offset-1` | `scale-90` tactile squeeze | Opacity 50%, tidak aktif | N/A |
| **Select / Dropdown**| Tertutup, icon chevron normal | Border hover tint | `ring-2 ring-[#83b6a0]` | Trigger toggle | Opacity 50%, tidak bisa dibuka | N/A |
| **Modal** | Tertutup (unmounted) | N/A | Focus terperangkap (trap) dalam modal | N/A | N/A | Backdrop blur tetap stabil |
| **Drawer** | Tertutup (unmounted) | N/A | Focus terperangkap (trap) dalam sheet | N/A | N/A | Konten scrolling aman |
| **Toast** | Meluncur masuk (`animate-toast-enter`) | Bayangan stabil | `ring-2 ring-[#83b6a0]` pada tombol tutup | Tombol tutup `scale-[0.92]` | N/A | N/A |
| **Tooltip** | Tersembunyi | Muncul setelah delay 300ms | Muncul instan saat focus-visible | N/A | N/A | N/A |
| **Accordion** | Collapsed (`grid-rows-[0fr]`) | Background subtle hover | `ring-2 ring-[#83b6a0] ring-inset` | Background pressed tint | N/A | N/A |

---

## 2. Rincian & Kontrak Aksesibilitas Komponen

### 2.1 Modal (`Modal.tsx`)
- **Peran:** Dialog modal tingkat atas untuk konfirmasi penting, review inspeksi, atau proposal aksi AI.
- **WAI-ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`, `aria-describedby="modal-desc"`.
- **Keyboard:**
  - `Escape`: Menutup modal secara instan.
  - `Tab` / `Shift+Tab`: Focus loop terjebak di dalam elemen interaktif modal (tidak tembus ke latar belakang).
- **Restorasi Focus:** Menyimpan elemen pemicu (`document.activeElement`) saat dibuka dan mengembalikan fokus ke elemen tersebut saat ditutup.
- **Scroll Lock:** Mengunci `document.body.style.overflow = "hidden"` untuk mencegah scrolling ganda.

### 2.2 Drawer / Side Sheet (`Drawer.tsx`)
- **Peran:** Panel samping untuk formulir mendalam, detail tiket tugas petugas, panduan cepat, atau menu mobile.
- **WAI-ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-label={title}`.
- **Posisi:** Meluncur dari tepi kanan (desktop/tablet) atau bawah (mobile).
- **Keyboard:** Didukung penuh dengan ESC dismiss dan focus trapping.

### 2.3 Tooltip (`Tooltip.tsx`)
- **Peran:** Memberikan penjelasan singkat kontekstual tanpa mengganggu alur kerja.
- **WAI-ARIA:** Elemen trigger memiliki `aria-describedby={tooltipId}`, panel tooltip memiliki `role="tooltip"`.
- **Timing:** Delay 300ms pada pointer hover untuk mencegah kedipan tak sengaja. Terbuka instan saat tombol menerima focus keyboard.

### 2.4 Dropdown Menu (`Dropdown.tsx`)
- **Peran:** Menu tindakan cepat, filter tabel, dan opsi navigasi multi-pilihan.
- **WAI-ARIA:** Trigger memiliki `aria-haspopup="true"`, `aria-expanded={isOpen}`, menu berupa `<ul role="menu">` dengan item `<button role="menuitem">`.
- **Keyboard:**
  - `ArrowDown` & `ArrowUp`: Navigasi fokus item demi item.
  - `Enter` / `Space`: Memilih item yang sedang disorot.
  - `Escape`: Menutup menu dan mengembalikan fokus ke trigger.

### 2.5 Accordion (`Accordion.tsx`)
- **Peran:** Pengungkapan informasi bertahap (FAQ, rincian teknis kriteria pilah).
- **WAI-ARIA:** Header tombol memiliki `aria-expanded={isOpen}` dan `aria-controls="accordion-desc-{id}"`. Panel memiliki `role="region"`.
- **Motion:** Transisi CSS Grid (`grid-template-rows: 0fr -> 1fr`) berdurasi 220ms dengan rotasi panah chevron 180°.

### 2.6 Toast Feedback (`Toast.tsx`)
- **Peran:** Notifikasi non-intrusif hasil aksi pengguna (simpan data, salin tautan, verifikasi timbangan).
- **WAI-ARIA:** `aria-live="polite"`, `role="status"` (untuk info/success) atau `role="alert"` (untuk error).
- **Motion:** `animate-toast-enter` dengan slide-up dan fade-in terpadu.

---

## 3. Aturan Penggunaan & Anti-Pola

1. **Dilarang:** Menumpuk animasi transform bertingkat pada elemen anak dan induk sekaligus yang dapat menyebabkan layout shaking.
2. **Dilarang:** Membuat modal yang tidak bisa ditutup dengan tombol ESC atau klik di luar backdrop.
3. **Dilarang:** Memberikan toast notifikasi sukses jika operasi belum benar-benar berhasil atau tidak ada pemicu yang valid.
4. **Wajib:** Menggunakan token durasi dan easing yang telah disepakati (`globals.css`) dan tidak memasukkan angka acak seperti `duration-[734ms]`.
