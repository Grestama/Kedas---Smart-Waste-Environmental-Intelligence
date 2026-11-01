# Dataset Card: Kedas Vision Waste Material Dataset

## Dataset Summary
- **Dataset ID:** `DS-VISION-MATERIAL-V1`
- **Owner:** Kedas AI & Field Inspection Team
- **Classes:** 4 Kategori Induk Sesuai Pergub Bali No. 47/2019:
  1. `ORGANIK` (Sisa makanan dapur, canang sari, dedaunan)
  2. `ANORGANIK_DAUR_ULANG` (Botol plastik PET, kaleng aluminium, kardus, kertas)
  3. `RESIDU` (Tisu basah, kemasan sachet berlapis foil, styrofoam)
  4. `KHUSUS_B3` (Baterai bekas, limbah elektronik, minyak jelantah, pecahan kaca tajam)

## Collection & Privacy Protocol
- Pengambilan foto dilakukan di area pekarangan rumah dan TPS3R percontohan tanpa menampilkan wajah manusia, anak-anak, nomor plat kendaraan, atau nomor identitas pribadi.
- EXIF metadata (koordinat GPS dan merek kamera) dibersihkan secara otomatis oleh pipeline backend sebelum pengujian.

## Labeling Protocol & Quality Gate
- Setiap foto dilabeli oleh 2 orang inspektur terlatih. Jika terdapat ambiguitas atau ketidaksepakatan label, status ditetapkan sebagai `NEEDS_EXPERT_REVIEW` dan model diwajibkan menampilkan disclaimer ke pengguna.
