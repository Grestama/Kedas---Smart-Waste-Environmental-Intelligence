# Laporan Audit Visual & Inventarisasi Ikon Kedas (Stage 1)
**Tanggal:** 30 Oktober 2026  
**Cakupan:** Frontend-only Visual Polish (Public, Guest, Warga, Petugas, Facility, Hospitality, Community, Admin)  
**Tujuan:** Memetakan status visual awal, inventarisasi icon system, dan ketidakkonsistenan antarmuka untuk persiapan migrasi Icon-First & Premium UI Polish.

---

## 1. Inventarisasi Icon Library & Ekosistem
- **Pustaka Utama:** `lucide-react` (v0.475.0 terpasang di `frontend/package.json`).
- **Gaya Visual Konsisten:** Outline / stroke-based dengan ketebalan standar 1.8–2px, sudut lengkung (*rounded join/cap*).
- **Temuan Karakter Khusus / Non-Standar:**
  - Ditemukan karakter emoji `💡` di dalam `frontend/src/components/ai/AIAbstainState.tsx:40`. Emoji ini harus diganti dengan ikon Lucide semantic (`Lightbulb`) berukuran standar.
  - Seluruh tombol kontrol berbasis ikon (*icon-only button*) seperti tombol Tutup (`X`), Refresh (`RefreshCw`), dan Feedback (`ThumbsUp`/`ThumbsDown`) memerlukan standardisasi `aria-label`, visible focus indicator, serta hit target minimum 40×40 px (44×44 px pada mobile).

---

## 2. Pemetaan Semantik Ikon (Lucide React)
Berikut inventarisasi pemetaan semantik konsep produk Kedas ke ikon Lucide yang telah divalidasi ketersediaannya:

| Konsep Desain | Ikon Lucide | Makna & Penggunaan |
| :--- | :--- | :--- |
| **Beranda / Overview** | `LayoutDashboard` | Dashboard aktivitas utama di seluruh role |
| **Wilayah / Kawasan** | `MapPinned` / `MapPin` | Area layanan, banjar, dan zonasi geografis |
| **Komunitas / Banjar** | `Users` / `Landmark` | Desa adat, krama banjar, gotong royong |
| **Warga** | `Home` / `UserCheck` | Rumah tangga, profil warga penyetor |
| **Petugas Lapangan** | `Truck` / `HardHat` | Armada motor roda tiga, kru pengangkutan |
| **Fasilitas / TPS3R** | `Building2` / `Factory` | Pos timbang, TPS3R, TPST, pengomposan |
| **Sirkular / Bank Sampah** | `Recycle` | Ekosistem daur ulang, alur pengolahan |
| **Hospitality** | `Building2` / `UtensilsCrossed` | Hotel, villa, restoran mitra B2B |
| **Wisatawan / Tamu** | `Compass` / `Globe2` | Pengunjung destinasi, panduan multibahasa |
| **Sampah / Material** | `Package` | Wadah timbulan, jenis material umum |
| **Organik** | `Leaf` | Sisa makanan, dedaunan, upakara/canang |
| **Plastik / Daur Ulang** | `Box` / `Recycle` | PET, HDPE, kaleng, kardus bernilai daur ulang |
| **Kertas / Kardus** | `FileText` | Dokumen, karton, buku bekas |
| **Timbangan / QC Fisik** | `Scale` | Verifikasi timbangan digital tara-bruto |
| **Jadwal & Waktu** | `Calendar` / `Clock` | Slot penjemputan armada, jam operasional |
| **Waste Passport / Bukti** | `QrCode` / `FileCheck` | Ledger batch sirkular, sertifikat serah-terima |
| **Kecerdasan Buatan (AI)** | `BrainCircuit` / `Sparkles` | RAG EcoGuide, Kedas Vision, Copilot |
| **EcoGuide / Edukasi** | `BookOpenCheck` / `MessageSquare` | Asisten regulasi Pergub Bali No. 47/2019 |
| **Vision / Kamera** | `Camera` / `ScanSearch` | Klasifikasi foto material timbulan |
| **Laporan & Analitik** | `FileBarChart2` / `TrendingUp` | Rekap ESG, laju diversi TPA, tonase |
| **Integritas / Keamanan** | `ShieldCheck` / `ShieldAlert` | Safety gating limbah B3, audit trail |
| **Poin & Reward** | `Coins` / `Award` | Saldo WastePoints warga & krama |
| **Sukses / Terverifikasi** | `CheckCircle2` | Status selesai, tervalidasi timbangan |
| **Peringatan / Perhatian** | `AlertTriangle` | Ambang batas kontaminasi, kuota menipis |
| **Bahaya / B3 / Ditolak** | `AlertOctagon` / `XCircle` | Residu berbahaya, penolakan QC |
| **Navigasi Kembali** | `ArrowLeft` | Tombol kembali berhirarki jelas |

---

## 3. Inventarisasi Status Visual & Token Antarmuka
### Warna & Permukaan
- **Canvas:** Warm ivory (`#F6F6F1`) memberikan kesan hangat ramah komunitas.
- **Surface:** Pure white (`#FFFFFF`) untuk kartu, panel form, dan modal.
- **Brand Primary:** Deep Evergreen (`#122620`, `#16352D`, `#1D3F35`).
- **Accent Muted:** Leaf green (`#219B72`, `#2DBA87`) dan sage (`#E8F0E9`, `#D7E4D9`).
- **Status Surfaces:**
  - Sukses: background `#E7F4EA`, border `#BCE1C7`, teks `#276749`.
  - Peringatan: background `#FFF4D9`, border `#F7E1A0`, teks `#98631C`.
  - Bahaya: background `#FBEAE7`, border `#F5C6BF`, teks `#A43F35`.
  - Netral: background `#FAFBF9`, border `#DDE3DD`, teks `#53645E`.

### Hirarki Border & Radius
- Border default 1px untuk layout umum, pembagi list, dan form inputs.
- Border strong 2px (`border-2`) telah distandardisasi pada seluruh kartu dan box interaktif pop-up untuk mencegah layout shift.
- Radius bertingkat:
  - Buttons / Inputs: 10–12px (`rounded-xl` / `rounded-lg`).
  - Kartu & Panel: 16–20px (`rounded-2xl` / `rounded-xl`).
  - Status Badges / Pills: 9999px (`rounded-full`).

---

## 4. Rangkuman Cakupan Rute per Role (45 Halaman)
| Role / Domain | Rute Utama | Kondisi Awal & Rencana Perbaikan |
| :--- | :--- | :--- |
| **Public Website** | `/`, `/area-layanan`, `/daftar`, `/faq`, `/masuk`, `/lupa-password`, `/panduan`, `/tanya` | Bersih; tautan `/tanya` dan floating EcoGuide aktif. Perlu standardisasi icon container pada service tiles dan guide categories. |
| **Guest Companion** | `/guest` | Multilingual companion. Perlu konsistensi icon 3-stream sorting box dan penghapusan teks deskripsi repetitif. |
| **Warga (Citizen)** | `/app`, `/app/setoran`, `/app/setoran/baru`, `/app/setoran/[id]`, `/app/waste-points`, `/app/dampak`, `/app/profil`, `/app/bantuan`, `/app/notifikasi` | Dashboard warga, form setoran baru, dan mutasi ledger. Standardisasi IconButton pada tabel riwayat dan KPI badge. |
| **Petugas Lapangan** | `/staff`, `/staff/tugas/tersedia`, `/staff/tugas/saya`, `/staff/tugas/[id]`, `/staff/riwayat`, `/staff/panduan-keselamatan`, `/staff/profil` | Terminal timbangan & QC lapangan. Perlu icon berukuran besar (icon-xl) pada task banner dan status sync yang sangat jelas. |
| **Hospitality (HOREKA)** | `/hospitality`, `/hospitality/setoran`, `/hospitality/esg`, `/hospitality/guest-companion`, `/hospitality/lapor` | Dashboard B2B hotel. KPI tonase, kartu aksi shift timbang, dan tabel penjemputan B2B. |
| **Admin & Facility** | `/admin`, `/admin/permintaan`, `/admin/kategori`, `/admin/mitra`, `/admin/audit-log`, `/admin/laporan`, `/admin/pendanaan`, `/admin/pengetahuan`, `/admin/pengguna`, `/admin/pengajuan-petugas`, `/admin/waste-points/rules` | Konsol supervisi banjar & TPS3R. Kerapatan informasi tinggi, tabel batch sirkular, dan audit log. |
| **Mobile Simulation** | `/mobile` | Simulator viewport ponsel untuk kru penjemput dan warga di lapangan. |

---

## 5. Rencana Tahap Lanjutan
- **Stage 2:** Pembuatan central visual tokens (`frontend/src/tokens/icons.ts` dan pembaruan `frontend/src/tokens/index.ts` serta dokumentasi `docs/design/kedas-visual-tokens.md`).
- **Stage 3:** Pembuatan shared components (`IconButton`, `IconContainer`, standardisasi `StatusBadge`, `StatCard`, `Button`, `EmptyState`).
- **Stage 4:** Polish surface, border, elevation, dan transition ring.
- **Stage 5:** Migrasi visual bertahap lintas seluruh role.
- **Stage 6:** Aksesibilitas, keyboard ring, dan performa responsive.
- **Stage 7:** Verifikasi regresi, testing, dan laporan handover final.
