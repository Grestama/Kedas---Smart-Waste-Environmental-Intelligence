# Kedas AI Ecosystem & Backend — Blockers and Assumptions

---

## 1. Asumsi Teknis (Assumptions)

1. **Database:** Sistem mendukung PostgreSQL untuk deployment produksi dengan extension UUID dan JSON/JSONB. Untuk lingkungan lokal dan CI test suite, SQLite digunakan secara terisolasi tanpa memerlukan container eksternal.
2. **Kredensial Pihak Ketiga:** Kunci API Google Gemini (`GEMINI_API_KEY`) atau OpenAI (`OPENAI_API_KEY`) bersifat opsional saat pengujian lokal berkat tersedianya `kedas-local-resilient-fallback`.
3. **Zona Waktu:** Seluruh stempel waktu transaksi disimpan dalam format UTC di database dan disajikan dalam zona waktu resmi Bali: **WITA (`Asia/Makassar`, UTC+8)**.
4. **Regulasi Lokal:** Aturan pemilahan dan kesepakatan kawasan mengacu pada regulasi riil: **Peraturan Gubernur Bali No. 47 Tahun 2019** tentang Pengelolaan Sampah Berbasis Sumber di Desa Adat dan Kawasan Pariwisata.

---

## 2. Ketergantungan Eksternal & Status Blocker (Dependencies & Blockers)

| Komponen | Status | Mitigasi / Penanganan Aman |
|---|---|---|
| **Kredensial Cloud LLM (Gemini / OpenAI API Key)** | Non-Blocking | Diabstraksi oleh `AIProviderAdapter`. Jika variabel lingkungan tidak diisi, sistem otomatis mengaktifkan fallback lokal berbasis aturan pengetahuan lokal terakreditasi. Tidak ada error 500. |
| **Hardware Timbangan IoT / Sensor Load Cell** | Non-Blocking | Data timbangan disimulasikan melalui REST API `/api/v1/weight-records` dengan verifikasi tara, bruto, netto, dan toleransi kalibrasi. |
| **Katalog Foto Sampah Nyata (500 Foto)** | Managed / Experimental | Sesuai aturan blueprint, kapabilitas Vision ditandai sebagai `AUTO_GUIDANCE / NEEDS_REVIEW` dan mewajibkan konfirmasi visual pengguna atau verifikasi fisik petugas. Tidak ada klaim akurasi palsu. |
| **Penyimpanan Objek S3 / Cloud Storage** | Non-Blocking | Berkas foto disimpan di direktori aman `uploads/evidence/` dengan verifikasi MIME type dan batasan ukuran berkas maksimal 10 MB. |
