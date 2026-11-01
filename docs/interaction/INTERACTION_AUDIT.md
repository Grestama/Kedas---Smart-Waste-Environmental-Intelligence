# Audit Interaksi & Motion Design — Kedas Platform

Dokumen ini merupakan hasil audit komprehensif terhadap seluruh elemen interaktif, transisi, feedback pengguna, dan motion state pada platform web Kedas (AI-Powered Community & Green Tourism Intelligence Platform) sebelum implementasi penyempurnaan interaksi.

---

## 1. Ringkasan Eksekutif & Temuan Global

| Parameter Audit | Kondisi Saat Ini | Sasaran Target Sempurna |
| :--- | :--- | :--- |
| **Motion Tokens** | Tersebar dan parsial di `globals.css` (hanya 4 keyframes dasar). Belum ada token CSS variabel terpadu untuk durasi, easing, dan displacement. | Sentralisasi motion tokens di `:root` CSS dan `tailwind.config.ts` sesuai pedoman Section 2.2. |
| **Micro-Interactions Tombol** | Menggunakan transisi Tailwind generik (`transition-colors`). Belum ada tactile feedback saat ditekan (`active:scale-[0.98]`), feedback fokus konsisten, atau icon nudging. | Tombol memiliki default, hover (lift/tint), active/pressed scale, focus-visible ring yang presisi, dan subtle icon shift (+1px s/d +2px). |
| **Kartu & Surface Panel** | Sebagian besar statis (`border border-kedas-border`). Kartu interaktif tidak memberikan sinyal hover lift yang halus atau bayangan bertingkat. | Hover lift terukur (1-2px translateY, `--shadow-interactive`), kursor yang tepat, dan keyboard accessible jika bertindak sebagai link/aksi. |
| **Overlay (Modal & Drawer)** | `Modal.tsx` memiliki backdrop dasar dan focus trap parsial, namun belum mendukung side drawer fleksibel untuk desktop/tablet/mobile dan transisi masuk/keluar terstandarisasi. | Modal & Drawer dengan animasi enter/exit terpadu, scroll-lock body yang bebas layout shift, dismiss via ESC dan klik luar, serta return focus ke elemen pemicu. |
| **Feedback Sistem (Toast & Banner)** | `Toast.tsx` menggunakan layout dasar tanpa staggered animation yang mulus atau visual countdown timer. | Toast container dengan animasi slide & fade masuk/keluar, ARIA live region terverifikasi, dan feedback aksi yang jujur. |
| **Tooltip & Popover** | Belum ada komponen Tooltip terdedikasi yang dapat diakses dengan keyboard atau penundaan hover yang nyaman (300-350ms). | Komponen Tooltip dan Popover aksesibel dengan pointer delay, instant keyboard focus, dan posisi presisi. |
| **Scroll Reveal** | Halaman publik menggunakan static rendering tanpa IntersectionObserver terukur, sehingga terasa datar saat pertama kali di-scroll. | Staggered reveal bertahap yang tenang (12-16px translateY, 320ms durasi, tanpa bouncing/parallax berlebihan). |
| **Aksesibilitas Gerak** | Blok media query `prefers-reduced-motion` dasar sudah ada, tetapi perlu dipastikan seluruh utility baru mematuhi zero-motion/instant fallback. | Kepatuhan penuh WCAG 2.1 AAA untuk vestibular safety (`prefers-reduced-motion: reduce`). |

---

## 2. Tabel Audit Detail Berdasarkan Area & Komponen

| Area | Elemen | Kondisi Saat Ini | Interaksi yang Dibutuhkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Fondasi & Tokens** | CSS Motion Variables (`globals.css`) | Keyframes ada tetapi tidak ada variabel token durasi (`--motion-instant`, dll) dan easing (`--ease-standard`, dll). | Deklarasikan token durasi (instant 90ms, fast 160ms, normal 220ms, emphasis 320ms, enter 420ms) dan easing kurva bezier terpadu. | Prioritized |
| **Fondasi & Tokens** | Tailwind Motion Utilities (`tailwind.config.ts`) | Hanya transisi bawaan Tailwind (`transition-all`, `duration-200`). | Tambahkan extended timing function, transition property, and keyframes terdaftar. | Prioritized |
| **Fondasi & Tokens** | Reduced Motion Mode | Menyetel durasi `0.01ms` global. | Pastikan transisi transform, opacity, dan scroll tidak menimbulkan efek flash atau disorientasi. | Prioritized |
| **UI Primitives** | `Button.tsx` | Transisi warna dasar. State hover standar tanpa pergeseran tactile. | Tambahkan `active:scale-[0.98]`, subtle hover background tint, icon shift pada hover anak panah, dan loading spinner terintegrasi yang tidak mengubah lebar tombol. | Prioritized |
| **UI Primitives** | `Panel.tsx` & `StatCard.tsx` | Kartu statis. Varian interaktif belum konsisten mengangkat elevasi dan shadow. | Berikan opsi `interactive` dengan hover lift (translateY -2px), bayangan halus bertingkat, dan border tint lembut. | Prioritized |
| **UI Primitives** | `Modal.tsx` | Modal muncul dengan fade instan/kasar, focus trapping belum sempurna saat tab cycling. | Transisi backdrop fade-in halus (200ms), modal container scale-in & translate-y (220ms), trap focus ke elemen pertama, ESC dismiss, dan return focus. | Prioritized |
| **UI Primitives** | `Drawer.tsx` (Baru) | Belum ada komponen drawer umum untuk side sheets dan bottom sheets (hanya ada drawer ad-hoc di staff). | Ciptakan komponen `Drawer.tsx` yang dapat meluncur dari kanan (desktop/tablet) atau bawah (mobile) dengan backdrop overlay, ESC handling, dan focus lock. | Prioritized |
| **UI Primitives** | `Tooltip.tsx` (Baru) | Tidak ada tooltip; deskripsi teknis hanya mengandalkan teks statis atau atribut title default browser. | Ciptakan komponen `Tooltip.tsx` dengan penundaan buka 300ms, tutup instan saat mouse leave, muncul langsung saat focus-visible, dan role `tooltip`. | Prioritized |
| **UI Primitives** | `Toast.tsx` | Toast ada tetapi transisi masuk/keluar kaku dan dismiss belum memiliki animasi fade-out. | Staggered entrance, smooth exit slide, ARIA live `status`/`alert`, action button feedback, dan timer progress visual opsional. | Prioritized |
| **UI Primitives** | `Accordion.tsx` | Toggle sederhana tanpa transisi tinggi CSS yang mulus (`grid-template-rows: 0fr -> 1fr`). | Implementasikan ekspansi smooth dengan CSS grid transition, rotasi icon chevron 180°, dan status ARIA `aria-expanded`. | Prioritized |
| **UI Primitives** | `Select.tsx` & `Dropdown.tsx` | Menggunakan native `<select>` atau dropdown statis. | Buat Custom Dropdown / Select interaktif dengan popover enter animation, keyboard navigation (ArrowUp/Down, Enter), dan checkmark indicator. | Prioritized |
| **UI Primitives** | `Input.tsx` & `Textarea.tsx` | Border focus standar. Tidak ada micro-interaction saat validasi sukses atau error. | Focus ring bertingkat (`--focus-ring`), clear button interaktif, dan animasi goyangan mikro halus (shake 3px) saat error submit. | Prioritized |
| **Header & Nav** | `WorkspaceSwitchBar.tsx` | Link berpindah role dengan hover background biasa. | Hover pill dengan transisi halus, badge indicator role aktif, dan focus ring presisi. | Prioritized |
| **Header & Nav** | `PublicHeader.tsx` | Navigasi publik statis. Menu mobile toggle belum ada animasi hamburger-ke-silang halus. | Navlink indicator hover underline halus, transisi mobile menu drawer, dan backdrop blur yang konsisten. | Prioritized |
| **Role: Public** | Hero Section & CTAs | Hero statis tanpa scroll affordance atau button pulse yang ramah. | Staggered fade & slide up saat dimuat, tombol CTA utama dengan tactile hover, scroll reveal pada 4 pilar fitur di bawah hero. | Prioritized |
| **Role: Public** | Service Tiles & Mosaic | Grid layanan dan galeri foto statis. | Hover lift halus pada kartu layanan dengan arrow icon shift, gambar mosaic dengan subtle zoom (scale 1.02) saat hover container, dan scroll reveal observer. | Prioritized |
| **Role: Guest** | `/guest` (EcoGuide) | Pertanyaan instan (quick prompt chips) belum memberikan feedback klik yang jelas. | Tactile chips dengan active press state, scrollable chips row dengan indikator gradien halus, modal petunjuk pilah instan, dan audio/bilingual switch micro-feedback. | Prioritized |
| **Role: Warga** | `/app` (Household) | Form booking jemputan step-by-step belum memiliki transisi pergantian langkah yang mulus. | Animasi transisi step wizard (slide-in horizontal terarah), seleksi slot waktu dengan radio card hover/active state, dan micro-interaction upload gambar pilah. | Prioritized |
| **Role: Warga** | `/app/passport` & Poin | Daftar riwayat penjemputan dan kartu poin statis. | Timeline item hover card lift, point badge subtle pulse saat data termutakhirkan, dan modal rincian inspeksi pilah. | Prioritized |
| **Role: Staff** | `/staff` (Petugas POS) | Kartu tugas lapangan statis; input timbangan bruto-tara belum memiliki indikator kalkulasi neto instan. | Kartu tugas interaktif dengan swipe/hover feedback, kalkulasi timbangan neto otomatis dengan highlight visual angka (animasi angka lembut), offline outbox sync feedback. | Prioritized |
| **Role: Facility** | `/hospitality` & Fasilitas | Form input penerimaan sampah dan filter tanggal riwayat statis. | Filter date-range popover interaktif, sertifikat CDOA preview modal dengan aksi cetak/unduh responsif, dan table row hover lift lembut. | Prioritized |
| **Role: Admin** | `/admin` & AI Copilot | Tabel audit dan monitoring wilayah statis; proposal tindakan AI hanya berupa card biasa. | Table row highlight pada hover, proposal review dialog yang lengkap dengan tombol tolak/setujui interaktif (dengan loading state jujur), dan filter popover. | Prioritized |
| **AI States** | EcoGuide & Copilot Widgets | Respon AI tampil serentak tanpa skeleton loading kontekstual atau indikator streaming ramah. | Indikator berpikir AI yang tenang (3 titik pulsa lembut tanpa efek sci-fi), sitasi referensi yang dapat diklik untuk membuka popover penjelasan sumber, dan feedback thumbs up/down. | Prioritized |

---

## 3. Rencana Eksekusi Bertahap

Audit ini menjadi dasar pelaksanaan 6 tahap implementasi berikutnya:
1. **Tahap 2:** Penerapan Token Motion & Fondasi Desain (`globals.css`, `tailwind.config.ts`, `Button.tsx`, `Panel.tsx`, `StatCard.tsx`).
2. **Tahap 3:** Pembangunan Sistem Overlay Terpadu (`Modal.tsx`, `Drawer.tsx`, `Tooltip.tsx`, `Toast.tsx`, `Accordion.tsx`, `Dropdown.tsx`).
3. **Tahap 4:** Penyempurnaan Pengalaman Publik, Tamu/Turis (EcoGuide), dan Warga Rumah Tangga.
4. **Tahap 5:** Penyempurnaan Pengalaman Petugas POS Lapangan, Fasilitas TPS3R, dan Mitra Hospitality B2B.
5. **Tahap 6:** Penyempurnaan Pengalaman Admin Console, Pengawasan Regulasi, dan Interaksi AI Copilot.
6. **Tahap 7:** Verifikasi Lintas Perangkat, Pengujian Aksesibilitas (Keyboard & Reduced Motion), serta Laporan QA & Changelog.
