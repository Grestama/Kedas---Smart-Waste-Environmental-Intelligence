# PETA MIGRASI KOMPONEN BERSAMA (COMPONENT MIGRATION MAP)
**Dokumen:** `05_COMPONENT_MIGRATION_MAP.md`  
**Status:** Disetujui & Terverifikasi (Tahap 2)  
**Versi:** 1.0  
**Tanggal:** 2026-11-01  

---

## 1. Matriks Konsolidasi Komponen Antar-Workspace

| Komponen Shared | Berkas Sumber | Konsumen Role | Implementasi Sebelum | Implementasi Selaras (Public Standard) | Status Migrasi |
|---|---|---|---|---|:---:|
| **Button** | `components/ui/Button.tsx` | Seluruh Role | 6 varian (`primary`, `secondary`, `soft`, `danger`, `outline`, `ghost`) | Mempertahankan 6 varian dengan `active:scale-[0.98]`, outline fokus `#83b6a0`, dan shadow interactive. | **KONSISTEN** |
| **IconButton** | `components/ui/IconButton.tsx` | Seluruh Role | Tombol aksi ikonik dengan hit target 40px/44px | Dilengkapi `aria-label` wajib, tooltip bawaan, border-2 interaktif, dan `active:scale-95`. | **KONSISTEN** |
| **IconContainer** | `components/ui/IconContainer.tsx` | Public, Guest, User, Hospitality, Admin | 7 varian semantik (`soft`, `brand`, `outline`, `inverse`, `warning`, `danger`, `info`) | Kontainer `rounded-xl` dengan rasio warna terkalibrasi dan stroke `1.85`. | **KONSISTEN** |
| **StatusBadge** | `components/ui/StatusBadge.tsx` | Seluruh Role | Status indikator dot/ikon | `rounded-full`, ikon semantik (`CheckCircle2`, `Clock`, `AlertTriangle`, dll.), rasio kontras WCAG AA. | **KONSISTEN** |
| **StatCard** | `components/ui/StatCard.tsx` | User, Staff, Hospitality, Admin | Kartu metrik KPI operasional | `border-2 border-border rounded-xl`, hover lift `-translate-y-1` dan `hover:shadow-interactive`. | **KONSISTEN** |
| **Panel** | `components/ui/Panel.tsx` | Seluruh Workspace | Kontainer konten & formulir | Permukaan `bg-surface rounded-xl/rounded-2xl`, opsi `interactive` ber-border 2px dengan hover lift. | **KONSISTEN** |
| **DataTable** | `components/ui/DataTable.tsx` | User, Staff, Hospitality, Admin | Tabel data operasional densitas tinggi | Header tabel dipertegas: `bg-[#F4F6F4] text-brand-900 border-b-2 border-border font-bold uppercase`. Baris hover taktil. | **TERSELARASKAN** |
| **Modal** | `components/ui/Modal.tsx` | User, Staff, Admin, Hospitality | Dialog konfirmasi & formulir modal | Diperbarui ke `rounded-2xl border-2 border-border shadow-popover` dengan focus trapping dan ESC listener. | **TERSELARASKAN** |
| **Drawer** | `components/ui/Drawer.tsx` | Public, User, Staff | Panel slide-over samping/bawah | `border-border shadow-popover`, focus trapping, `rounded-t-2xl` pada varian bottom mobile. | **KONSISTEN** |
| **Dropdown** | `components/ui/Dropdown.tsx` | Seluruh Workspace | Menu konteks dan aksi baris | Menu popup `rounded-xl border border-border shadow-popover`, keyboard Arrow/Enter/Space navigation. | **KONSISTEN** |
| **AICitationCard** | `components/ai/AICitationCard.tsx` | Public, User, Admin | Kartu rujukan regulasi grounded RAG | **Dimigrasikan dari `stone-*` ke token Kedas**: `bg-[#FAFBF9] border-border rounded-xl text-text-primary`. | **TERSELARASKAN** |
| **AIAbstainState** | `components/ai/AIAbstainState.tsx` | Public, User, Admin | Tampilan kejujuran ketidaksediaan data | **Dimigrasikan dari `stone-*` ke token Kedas**: `bg-[#FAFBF9] border-2 border-border/80 rounded-2xl p-4`. | **TERSELARASKAN** |
| **AIConfidenceIndicator** | `components/ai/AIConfidenceIndicator.tsx` | User, Admin, Hospitality | Indikator tingkat keyakinan AI | **Dimigrasikan dari `rose-*` ke token Kedas**: `rounded-full` pill semantik Success/Warning/Danger. | **TERSELARASKAN** |
| **AIDataProvenance** | `components/ai/AIDataProvenance.tsx` | Seluruh Workspace | Label asal-usul data (Provenance) | **Dimigrasikan dari `indigo/purple` ke token Kedas**: `rounded-full` dengan palet hijau, amber, info, dan sage. | **TERSELARASKAN** |
| **AdminSidebar** | `components/shells/AdminSidebar.tsx` | Admin Console | Navigasi admin | **Dimigrasikan dari `emerald-600` neon ke deep evergreen**: `bg-[#1D3F35] border-l-4 border-emerald-400 pl-2.5`. | **TERSELARASKAN** |
| **UserSidebar** | `components/shells/UserSidebar.tsx` | Warga Web | Navigasi warga | Aksen aktif dipertegas `border-l-4 border-brand-900 pl-2.5`, kartu poin diperbarui `rounded-2xl border-2`. | **TERSELARASKAN** |
| **HospitalityLayout** | `app/hospitality/layout.tsx` | Hospitality Tenant | Shell navigasi B2B | **Dimigrasikan dari `sand-100` ke token Kedas**: header `shadow-nav`, tenant dropdown `rounded-2xl border-2`. | **TERSELARASKAN** |

---

## 2. Verifikasi Kualitas Komponen & State Coverage

Setiap komponen yang telah diselaraskan memenuhi checklist kelengkapan state berikut:

1. **Default State:** Menggunakan warna kontras memadai, border default atau strong (2px), dan latar kanvas/permukaan bersih.
2. **Hover State:** Efek pengangkatan fisik halus (`hover:-translate-y-1` atau `-1.5px`) disertai penguatan bayangan `hover:shadow-interactive` dan border warna brand (`hover:border-brand-800` pada permukaan terang, `hover:border-emerald-400` pada permukaan gelap).
3. **Focus-Visible State:** Cincin fokus keyboard yang tegas `focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:ring-offset-2 focus-visible:outline-none`.
4. **Active/Pressed State:** Tactile feedback mikro `active:scale-[0.98]` atau `active:scale-95`.
5. **Disabled State:** Opasitas 40–50% yang konsisten (`disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`).
6. **Loading State:** Penggantian label dengan spinner `Loader2` beranimasi putar dan atribut `aria-busy="true"`.
7. **Empty & Error States:** Desain visual ramah dengan kontainer terstruktur, ikon semantik, dan tombol tindakan korektif / coba lagi.
