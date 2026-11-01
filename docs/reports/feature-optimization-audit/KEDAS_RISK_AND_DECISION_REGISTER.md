# Kedas — Risk & Decision Register

**Dokumen ID:** DOC-RISK-REG-001  
**Produk:** Kedas (Historical: WasteLink Bali)  
**Tanggal Audit:** 30 Oktober 2026  
**Status:** ACTIVE REGISTER  

---

## 1. Matriks Risiko Rekayasa, Keamanan & Operasional

| Risk ID | Deskripsi Risiko | Likelihood | Impact | Severity | Bukti / Konteks Lapangan | Strategi Mitigasi Terverifikasi | Peran Pemilik | Keputusan yang Dibutuhkan | Batas Waktu / Ketergantungan |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :--- | :--- |
| **RISK-001** | **Eksklusi Jenjang Pendidikan S1 pada Bali Digifest 2026** | Medium | Critical | **P0** | Dokumen third-party pendaftaran menyebut kategori SMA/D1/D2 tanpa menyebut S1 secara eksplisit. | Lakukan klarifikasi langsung ke helpdesk panitia Bali Digifest 2026 atau siapkan registrasi delegasi tim sesuai kriteria. | Product Owner / Team Lead | Ajukan surat konfirmasi formal status kepesertaan ke sekretariat kompetisi. | H-3 sebelum penutupan registrasi |
| **RISK-002** | **Ketergantungan Kuota & Biaya Cloud Provider AI** | Medium | Medium | **P1** | Jika lonjakan request API Gemini/OpenAI melampaui kuota, pemanggilan eksternal dapat mengalami error 429. | Telah diimplementasikan **Dual-Mode Adapter** dengan *Resilient Local Fallback* deterministik; sistem tetap hidup 100%. | AI Engineer | Tetapkan batas anggaran bulanan ($50-$100) dan aktifkan caching respon EcoGuide. | Sebelum peluncuran skala pilot |
| **RISK-003** | **Konektivitas Internet Buruk di Wilayah Pelosok Banjar** | High | High | **P1** | Armada motor roda tiga banjar beroperasi di area perbukitan/pedesaan dengan sinyal seluler fluktuatif. | Web app saat ini memerlukan koneksi online untuk mutasi status penjemputan. | Lead Frontend Engineer | Implementasikan ServiceWorker & IndexedDB local queue untuk offline-first recording timbangan. | Sprint 2 Pasca-Hackathon |
| **RISK-004** | **Kalibrasi Timbangan & Manipulasi Data Bobot Setoran** | Medium | High | **P1** | Warga atau oknum dapat mengklaim bobot sampah berlebih untuk memburu reward WastePoints. | Telah diimplementasikan verifikasi fisik wajib oleh petugas di pos TPS3R dan dual-entry mass balance verification. | Facility Operations Lead | Integrasikan timbangan digital berkoneksi Bluetooth/WebSerial API untuk input langsung tanpa ketik manual. | Pilot Fase 2 (Q1 2027) |
| **RISK-005** | **Halusinasi Jawaban Aturan Sampah pada EcoGuide** | Low | High | **P1** | Jika AI mengarang jadwal atau menerima material berbahaya (B3), terjadi pencemaran lingkungan. | Telah diimplementasikan *Scoped Chunk Retrieval* dan *Protokol Abstensi Eksplisit* (`INSUFFICIENT_CONTEXT`). | AI Governance Lead | Terus pertahankan kebijakan bahwa aturan baru hanya aktif setelah CDOA disahkan Prajuru Banjar. | Berkelanjutan |
| **RISK-006** | **Penyusupan Dokumen Pengetahuan Palsu (Knowledge Poisoning)**| Low | High | **P2** | Dokumen SOP palsu diunggah untuk menyesatkan panduan pemilahan material. | Endpoint `/api/v1/ai/knowledge` dilindungi otorisasi ketat RBAC `ADMIN` & `SUPER_ADMIN`; warga biasa ditolak 403. | Security Engineer | Tambahkan audit trail tanda tangan digital prajuru adat pada dokumen sebelum dipublikasikan. | Sprint 3 |
| **RISK-007** | **Inkonsistensi Data Dinamis pada Halaman Area Layanan** | Medium | Low | **P2** | `/area-layanan` saat ini merender array statis alih-alih mengambil data relasional live dari API `/api/v1/service-areas`. | Mengakibatkan perubahan nama pos atau jam operasional banjar di database tidak langsung terrefleksi di UI. | Frontend Engineer | Sambungkan fetch data ke service `collectionService.listServiceAreas()` di komponen halaman. | Sprint 1 (Quick Win) |
| **RISK-008** | **Ketiadaan Portal Khusus Mitra HOREKA (B2B)** | Medium | Medium | **P2** | Pelaku usaha hotel/restoran saat ini harus meminjam alur setoran umum warga. | Model database B2B telah tersedia di `marketplace/models.py` namun rute `/hospitality` belum diisolasi. | Product Manager | Bangun dedicated workspace `/hospitality` untuk pencatatan sampah dapur hotel dan kontrak daur ulang. | Horizon 2 (Complete Core) |

---

## 2. Register Keputusan Terbuka (Open Decisions)

| Decision ID | Area Keputusan | Pilihan Alternatif | Dampak Teknis / Operasional | Rekomendasi Auditor | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **OD-01** | **Mekanisme Pendaftaran Kompetisi** | A: Tetap mendaftar dengan akun ketua mahasiswa.<br>B: Mengajukan waiver delegasi resmi. | Risiko diskualifikasi jika kriteria jenjang pendidikan kaku. | **Pilih B:** Kirim surat konfirmasi resmi ke panitia hari ini. | **OPEN** |
| **OD-02** | **Provider AI Default Produksi** | A: Google Gemini 2.0 Flash.<br>B: OpenAI GPT-4o-mini.<br>C: Pure On-Premise SLM (Ollama). | Biaya operasional vs. kecepatan respon dan kepatuhan data residensi. | **Pilih A:** Gemini 2.0 Flash efisien, latensi rendah, selaras dengan stack hackathon. | **RESOLVED** (Gemini) |
| **OD-03** | **Teknologi Vector Database Kedas** | A: PostgreSQL `pgvector` extension.<br>B: Dedicated Vector DB (Qdrant/Pinecone).<br>C: In-Memory TF-IDF (Current). | Kompleksitas infrastruktur vs. skalabilitas pencarian semantik. | **Pilih A:** `pgvector` menyatu dengan PostgreSQL 16 yang sudah dipakai, tanpa menambah server baru. | **RECOMMENDED** |
| **OD-04** | **Strategi Pengunggahan Foto Sampah** | A: Simpan file fisik di disk lokal server.<br>B: Cloud Object Storage (S3 / Cloud Storage / MinIO). | Risiko kapasitas disk lokal server desa vs. biaya cloud egress. | **Pilih B:** Gunakan Cloudflare R2 / S3-compatible storage dengan signed URL berjangka. | **RECOMMENDED** |
| **OD-05** | **Alur Eksekusi Rekomendasi Copilot** | A: Tombol eksekusi langsung mengubah DB.<br>B: Tombol eksekusi membuka form dialog terisi otomatis (pre-filled). | Risiko halusinasi mutasi vs. efisiensi waktu kerja operator TPS3R. | **Pilih B:** Menjaga human-in-the-loop dan akuntabilitas hukum adat. | **APPROVED** |
