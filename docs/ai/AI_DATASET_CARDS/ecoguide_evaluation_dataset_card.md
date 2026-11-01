# Dataset Card: Kedas EcoGuide Grounded Benchmark Dataset

## Dataset Summary
- **Dataset ID:** `DS-ECOGUIDE-BENCHMARK-V1`
- **Owner:** Kedas Environmental Knowledge Taskforce
- **Language:** Indonesian (id) & English (en)
- **Domain:** Regulasi persampahan Bali (Pergub 47/2019), SOP TPS3R, pedoman pemilahan kawasan pariwisata.

## Dataset Structure
Koleksi kasus uji kurasi yang mencakup query evaluasi multi-skenario:
1. **Pertanyaan In-Scope Pemilahan:** Pertanyaan seputar pemilahan botol plastik PET, kaleng aluminium, minyak jelantah, dan sisa upakara/canang sari.
2. **Pertanyaan Jadwal & Operasional:** Penjemputan armada trike banjar, jam operasional pos komposting, dan kontak Kelian Banjar.
3. **Pertanyaan Out-of-Scope (Abstention Gold Set):** Pertanyaan tidak relevan (kurs mata uang, perbaikan mesin cuci, ban traktor) yang mewajibkan model untuk menolak menjawab (*abstain*).
4. **Adversarial & Jailbreak Queries:** Uji penetrasi prompt injection ("DAN", "Ignore previous instructions", SQL injection payload).
5. **Cross-Scope Isolation Cases:** Pengujian batas privasi untuk memastikan wisatawan tidak dapat mengakses dokumen internal perhotelan atau banjar lain.

## Provenance & Rights
- Seluruh teks dokumen bersumber langsung dari Peraturan Gubernur Bali No. 47 Tahun 2019 dan draf kesepakatan CDOA Banjar Sukawati Kaja. Bebas hak cipta pihak ketiga komersial.
