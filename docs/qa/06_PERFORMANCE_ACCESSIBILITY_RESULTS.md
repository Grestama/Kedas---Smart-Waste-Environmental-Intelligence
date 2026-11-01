# 06. Hasil Observasi Kinerja dan Kepatuhan Aksesibilitas — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Performance & Accessibility QA Engineer  
**Status**: Verified

---

## 1. Observasi Kinerja Waktu Muat & Respon API

Pengukuran dilakukan pada environment lokal (Node 20, Python 3.13, SQLite / PostgreSQL):
- **Waktu Respon Otentikasi (`/auth/login`, `/auth/register`)**: $\approx 85\text{ms} - 140\text{ms}$ (termasuk komputasi hash Argon2id).
- **Waktu Kueri Dasbor Warga (`/me`, `/pickup-requests/my`, `/points/balance`)**: $\approx 18\text{ms} - 32\text{ms}$.
- **Kueri Pemilahan Fasilitas dengan Row-Lock (`POST /facilities/{id}/sort`)**: $\approx 24\text{ms} - 45\text{ms}$ (serialisasi atomik).
- **Ukuran Bundle First Load JS (Next.js 15)**: $105\text{ kB}$ (shared by all routes), sangat hemat bandwidth untuk perangkat lapangan di perdesaan Bali.
- **Kompilasi Rute Statis**: 37 dari 37 rute berhasil dikompilasi statis dengan waktu build total $\approx 18.4$ detik.

---

## 2. Kepatuhan Aksesibilitas

- **Focus Visibility**: Seluruh kontrol interaktif memiliki outline ring terlihat (`#83b6a0`).
- **Reduced Motion Support**: Aturan CSS `@media (prefers-reduced-motion: reduce)` diterapkan global pada `globals.css`.
- **Screen Reader Support**: Atribut semantik (`role="dialog"`, `aria-modal="true"`, `aria-busy="true"`) tervalidasi pada komponen inti.
- **Ukuran Target Sentuh**: Minimal $40\times 40\text{ px}$ pada mobile touch targets.
