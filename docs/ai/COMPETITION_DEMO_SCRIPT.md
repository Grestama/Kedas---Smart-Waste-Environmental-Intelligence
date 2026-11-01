# Kedas AI — Competition Live Demo Script (10-Step Environmental Intelligence Loop)

Panduan naskah demonstrasi langsung (live demo) untuk memamerkan keunggulan ekosistem AI dan backend Kedas di hadapan dewan juri.

---

## Urutan Skenario Demonstrasi (5–7 Menit)

### Langkah 1: Registrasi & Publikasi Dokumen Kebijakan Kawasan (CDOA)
- **Aktor:** Admin Kawasan.
- **Aksi:** Tunjukkan pendaftaran draf dokumen kesepakatan operasional banjar (`CDOA-SUKAWATI-V1`) melalui endpoint `/api/v1/ai/knowledge`.
- **Narasi Juri:** *"Kedas tidak mengandalkan pengetahuan umum yang diasumsikan berlaku lokal, melainkan menghubungkan AI langsung ke dokumen kesepakatan kawasan dan Pergub Bali 47/2019 yang tervalidasi."*

### Langkah 2: Wisatawan & Warga Bertanya ke EcoGuide
- **Aktor:** Wisatawan / Warga.
- **Aksi:** Buka halaman `/tanya` atau kirim query ke `/api/v1/ai/ecoguide`: *"Kapan jadwal penjemputan sampah anorganik dan bagaimana memilah sisa canang sari?"*
- **Hasil:** EcoGuide menjawab dalam hitungan milidetik dengan sitasi resmi ke dokumen SOP Banjar.
- **Uji Negatif:** Tanyakan pertanyaan di luar topik (misal: kurs dollar). Tunjukkan bahwa EcoGuide secara jujur melakukan **Abstain** tanpa mengarang jawaban.

### Langkah 3: Asistensi Visual Pemilahan (Kedas Vision)
- **Aktor:** Warga Rumah Tangga.
- **Aksi:** Unggah foto botol plastik kemasan.
- **Hasil:** Kedas Vision mendeteksi kategori `PLASTIK-PET` dengan instruksi pembersihan (*bilas & pipihkan*) serta menyertakan klausul persetujuan warga.

### Langkah 4: Pemesanan Penjemputan Terjadwal & Idempotency
- **Aktor:** Warga.
- **Aksi:** Pilih mode layanan `ARMADA TRIKE` dan slot waktu pagi.
- **Hasil:** Kode unik setoran diterbitkan (misal: `PKP-SUKAWATI-001`). Idempotency key mencegah pembuatan order ganda jika tombol ditekan berulang.

### Langkah 5: Petugas Mengklaim Tugas & Melakukan Inspeksi QC
- **Aktor:** Petugas Lapangan POS.
- **Aksi:** Petugas mengklaim tugas dari antrean, memeriksa kebersihan fisik material, dan mencatat kontaminasi `CLEAN`.

### Langkah 6: Verifikasi Timbangan Digital Lapangan (Netto = Bruto - Tara)
- **Aktor:** Petugas Lapangan POS.
- **Aksi:** Masukkan berat kotor wadah (3.5 kg) dan berat tara (0.5 kg).
- **Hasil:** Sistem menghitung netto bersih (3.0 kg) dan menerbitkan catatan timbang sah.

### Langkah 7: Pengkreditan WastePoints Otomatis ke Buku Kas
- **Aktor:** Sistem / Warga.
- **Aksi:** Buka portal warga. Saldo poin bertambah secara instan sesuai aturan per kategori yang tercatat pada double-entry ledger.

### Langkah 8: Copilot Mendeteksi Kapasitas & Menerbitkan ActionProposal
- **Aktor:** Operator Fasilitas TPS3R.
- **Aksi:** Query `/api/v1/ai/copilot`. Copilot mendeteksi lonjakan pasokan dan menyusun draft `ActionProposal` pengalihan sebagian residu.
- **Hasil:** Proposal berstatus `DRAFT` dan tidak mengubah data sebelum disetujui.

### Langkah 9: Admin Menyetujui Proposal (Human-in-the-Loop)
- **Aktor:** Admin.
- **Aksi:** Eksekusi `/api/v1/ai/copilot/execute` dengan `confirmed_by_admin: true`.
- **Hasil:** Sistem mengeksekusi mutasi data secara atomik dan mencatat riwayat audit lengkap.

### Langkah 10: Laporan Sirkular B2B & Skor DCLI Terverifikasi
- **Aktor:** Manajer Green Hospitality (Hotel Partner).
- **Aksi:** Buka dashboard hospitality `/hospitality`.
- **Hasil:** Tampilkan laju diversi TPA (84.6%), reduksi emisi CO2e (3,980 kg CO2e) berdasarkan faktor emisi resmi IPCC, dan skor Destination Circularity Loop Index (DCLI).
