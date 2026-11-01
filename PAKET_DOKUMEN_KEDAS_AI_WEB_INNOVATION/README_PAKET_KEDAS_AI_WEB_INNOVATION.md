# Paket Penyelarasan Kedas — AI Web Innovation

Paket ini menyiapkan Kedas sebagai **AI-Powered Community & Green Tourism Intelligence Platform** dengan fokus pengembangan web, bukan aplikasi mobile native.

## File di dalam paket

1. `PRD_KEDAS_AI_WEB_INNOVATION.md` — kebutuhan dan strategi produk.
2. `SRS_KEDAS_AI_WEB_INNOVATION.md` — kebutuhan software dan acceptance criteria.
3. `HDD_KEDAS_AI_WEB_INNOVATION.md` — desain sistem tingkat tinggi (HDD dimaknai sebagai High-Level Design Document; istilah umum lain adalah HLD).
4. `DESIGN_SYSTEM_KEDAS_AI_WEB.md` — design tokens, komponen, pola halaman, animasi, dan aksesibilitas.
5. `MASTER_PROMPT_KEDAS_AI_WEB_INNOVATION_10_TAHAP.md` — instruksi agentic AI untuk audit, dokumentasi, implementasi web AI, pengujian, dan handover.
6. `AI_RUNTIME_PROMPT_LIBRARY_KEDAS.md` — template system/developer prompt yang dipakai saat EcoGuide, Vision, Operations Copilot, dan report generator berjalan.

## Urutan penggunaan

1. Baca PRD, SRS, dan HDD untuk menyepakati scope.
2. Berikan Master Prompt ke coding agent yang memiliki akses repository.
3. Jalankan sepuluh tahap berurutan dengan quality gate otomatis.
4. Gunakan design system sebagai kontrak visual.
5. Pastikan agent memverifikasi kondisi as-built; angka dari laporan lama adalah baseline historis, bukan hasil audit terbaru.

## Penyesuaian utama

- Kedas tetap mempertahankan Community & Green Tourism.
- AI dijadikan inti: EcoGuide (RAG), Vision (foto material), Operations Copilot (read-only decision support).
- Seluruh alur kompetisi berjalan melalui browser dengan layout responsif.
- Aplikasi mobile yang sudah ada tidak dihapus, tetapi pengembangan fitur native dibekukan untuk scope lomba ini.
- IoT, integrasi timbangan, live GPS, dan model AI khusus tidak menjadi syarat MVP.
- AI tidak boleh mengubah berat, reward, penerimaan material, status transaksi, atau penugasan tanpa human confirmation dan domain service yang sah.

## Catatan eligibility kompetisi

Salah satu listing pihak ketiga untuk AI Web Innovation Challenge 2026 yang terkait Bali Digifest menuliskan peserta jenjang SMA, D1, dan D2, tanpa menyebut S1. Guidebook resmi yang memverifikasi ketentuan tersebut belum ditemukan saat paket disusun. Konfirmasi langsung kepada penyelenggara wajib dilakukan sebelum registrasi/submission. Jangan menjadikan listing pihak ketiga sebagai bukti final kelayakan.
