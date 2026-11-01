# Kedas AI — Known Limitations & Honest Disclosure

Sesuai prinsip non-negotiable **Rule 11: Never invent datasets, metrics, local policies, facility capacity, partners, prices, carbon factors, or model accuracy**, dokumen ini secara transparan mendokumentasikan batasan sistem yang ada pada rilis saat ini.

---

## 1. Batasan Kapabilitas Pengenalan Citra (Kedas Vision)
- **Tidak Menentukan Berat Fisik:** Foto tidak dapat dan dilarang digunakan untuk menentukan berat timbangan resmi. Berat wajib diukur menggunakan timbangan digital fisik di pos banjar.
- **Bukan Alat Uji Kimiawi / Toksisitas:** Foto tidak dapat mendeteksi zat beracun mikroskopis atau membedakan cairan kimia berbahaya. Segala cairan kimia atau B3 wajib diserahkan sesuai protokol penanganan B3 TPS3R.
- **Ketergantungan Pencahayaan:** Foto yang sangat gelap, blur, atau tertutup kantong plastik hitam buram akan ditandai dengan flag `ambiguity_flag: true` dan diarahkan ke pemeriksaan manual petugas.

## 2. Batasan Kapabilitas RAG (EcoGuide)
- **Cakupan Dokumen:** EcoGuide hanya dapat menjawab berdasarkan dokumen SOP, CDOA, dan regulasi yang telah disahkan (`PUBLISHED`) di database. Untuk pertanyaan umum di luar konteks persampahan kawasan Bali, EcoGuide akan menolak menjawab (*abstain*) demi menghindari halusinasi.
- **Bahasa Daerah Bali:** Bahasa Bali halus (Basa Alus) saat ini didukung pada istilah kunci budaya dan persampahan (misal: *canang sari*, *teba modern*, *danyuh*, *luu luhu*), sementara narasi utama disajikan dalam Bahasa Indonesia dan Bahasa Inggris.

## 3. Batasan Optimasi Rute (AI-15 & AI-16)
- **Rute Spasial Armada Trike:** Optimasi rute dinamis (TSP/VRP) berstatus `PROPOSED_FUTURE` karena membutuhkan pemasangan sensor GPS IoT dan pelacakan telemetri armada lapangan secara kontinu. Saat ini penjemputan diatur berdasarkan slot waktu terjadwal per banjar.
