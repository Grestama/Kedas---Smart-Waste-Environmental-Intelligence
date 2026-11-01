# KEDAS — Product Requirements Document (PRD)
## AI-Powered Community & Green Tourism Intelligence Platform

> **Dokumen:** Product Requirements Document (PRD) — Revisi AI Web Innovation  
> **Nama produk:** Kedas  
> **Nama historis:** WasteLink Bali  
> **Versi:** 2.0 — Competition-aligned, web-first  
> **Tanggal:** 30 Oktober 2026  
> **Status:** Baseline produk untuk validasi, implementasi web AI, dan demonstrasi  
> **Wilayah awal:** kawasan/komunitas percontohan di Bali  
> **Bahasa utama:** Bahasa Indonesia; bahasa Inggris untuk pengalaman wisatawan  
> **Zona waktu:** Asia/Makassar (WITA)  
> **Mata uang:** IDR

> **Terminologi dokumen:** HDD dalam paket ini digunakan sebagai *High-Level Design Document* (desain sistem tingkat tinggi). Dalam banyak standar, singkatan yang lebih lazim adalah HLD. Dokumen ini bukan Hardware Design Document.

---

## 0. Kontrol Dokumen dan Sumber Kebenaran

### 0.1 Tujuan revisi

PRD ini mengarahkan Kedas agar sesuai dengan karakter **AI Web Innovation Challenge** tanpa menghilangkan visi awal Community & Green Tourism. Perubahan utamanya adalah menjadikan AI sebagai lapisan kecerdasan yang benar-benar terhubung dengan pengetahuan kawasan dan workflow operasional, bukan sekadar chatbot generik.

### 0.2 Baseline as-built yang diberikan tim

Baseline berikut bersumber dari laporan audit yang disampaikan tim Kedas dan harus diverifikasi ulang oleh coding agent terhadap repository sebelum perubahan kode:

| Area | Baseline yang dilaporkan | Implikasi desain |
|---|---|---|
| Backend | FastAPI, Python 3.13; 76 pytest passed; Ruff 0; mypy 0 pada 79 file | Pertahankan modular monolith dan kontrak yang sudah ada |
| Web frontend | Next.js 15, React 19; 94 Vitest passed; TypeScript 0 error; build 37 static routes | Jadikan web sebagai permukaan produk utama |
| Mobile | 15 Vitest passed; TypeScript 0 error | Tidak dikembangkan sebagai aplikasi native untuk submission ini; jangan dihapus atau dirusak |
| Total tes | 185/185 passed pada laporan | Gunakan sebagai baseline historis; jalankan ulang untuk memastikan kondisi terkini |
| API | 48 endpoint terdokumentasi pada laporan | Pertahankan kompatibilitas `/api/v1/...` kecuali ada keputusan migrasi eksplisit |
| Data | 19 model data terdokumentasi pada laporan | Audit skema sebelum menambah tabel/field |
| Akses | 8 role akun tercatat dalam laporan | Jangan membuat role baru tanpa memeriksa role dan permission aktual |
| Arsitektur | Modular monolith | Pertahankan; tambahkan AI orchestration sebagai domain/service terisolasi |

Angka tersebut bukan hasil pengujian ulang dokumen ini dan tidak boleh diklaim sebagai status terbaru sebelum agent menjalankan seluruh quality gate.

### 0.3 Aturan as-built vs target

Setiap requirement/fitur harus diberi status:

- **EXISTING-VERIFIED:** ada di repository, dipakai, dan lulus pengujian.
- **EXISTING-PARTIAL:** komponen ada tetapi alur belum utuh.
- **NEW-P0:** wajib untuk demonstrasi inti AI web.
- **NEW-P1:** memperkuat pengalaman dan integrasi.
- **FUTURE-P2:** setelah validasi pilot atau data cukup.
- **OUT-OF-SCOPE:** tidak dibangun dalam ruang lingkup kompetisi.

Jangan menyatakan fitur baru sebagai fitur existing hanya karena tercantum dalam dokumen lama.

---

## 1. Ringkasan Eksekutif

Kedas adalah platform web berbasis AI untuk membantu komunitas, pengelola kawasan, usaha pariwisata, petugas, dan fasilitas pengolahan mengelola informasi serta proses persampahan secara lebih terkoordinasi. Sistem menggabungkan data operasional Kedas, pengetahuan kawasan yang tervalidasi, dan kemampuan AI untuk membantu pengguna memahami aturan, mengidentifikasi jenis material, memperoleh rekomendasi operasional, serta membaca hasil pengelolaan kawasan.

Kedas tidak hanya menjawab pertanyaan “sampah ini termasuk apa?”, tetapi membantu menjawab pertanyaan yang lebih penting:

1. Material ini sebaiknya dipilah dan dipersiapkan bagaimana?
2. Apakah layanan pengumpulan untuk material tersebut tersedia di kawasan ini?
3. Fasilitas mana yang benar-benar menerima material tersebut dan memiliki kapasitas?
4. Apa yang harus dilakukan ketika material ditolak, tercampur, atau jalur pemanfaatannya belum tersedia?
5. Bagaimana komunitas dan usaha pariwisata dapat melihat hasil pengelolaan berdasarkan data yang dapat ditelusuri?

### 1.1 Product positioning

**Kedas — AI-powered Community & Green Tourism Intelligence Platform.**

*Bergerak Bersama untuk Lingkungan yang Lebih Bersih.*

### 1.2 Core product promise

Kedas membantu pengguna mengambil keputusan pengelolaan sampah yang lebih tepat melalui informasi lokal yang terverifikasi, rekomendasi AI yang dapat dijelaskan, dan workflow web yang terhubung dengan data operasional.

### 1.3 Problem statement

Pengelolaan sampah kawasan wisata melibatkan banyak aktor dengan aturan, kapasitas, dan informasi yang tersebar. Warga dan wisatawan sering tidak mengetahui cara memilah atau tujuan yang benar; usaha pariwisata membutuhkan dokumentasi pengelolaan; operator harus mengoordinasikan jadwal dan kapasitas; sedangkan pengambil keputusan membutuhkan data yang konsisten. Sistem digital yang hanya mencatat permintaan dan berat belum cukup untuk membantu pengguna memahami konteks, memilih tindakan, dan mengevaluasi keputusan.

### 1.4 Solusi utama

- **Kedas EcoGuide:** asisten pengetahuan berbasis RAG yang menjawab berdasarkan SOP, aturan kawasan, dan dokumen yang dikurasi, dengan sitasi sumber.
- **Kedas Vision:** asisten klasifikasi foto material yang memberikan kandidat kategori, indikasi kontaminasi, tingkat keyakinan, dan rekomendasi penanganan.
- **Kedas Operations Copilot:** rekomendasi berbasis data untuk kelayakan layanan, pemilihan fasilitas, prioritas pekerjaan, deteksi anomali, dan ringkasan dampak.
- **Destination Operations Web:** dashboard role-aware yang menghubungkan komunitas, HOREKA, petugas, fasilitas, mitra material, dan pengelola kawasan.
- **Evidence & Traceability:** Waste Passport dan catatan proses agar hasil analitik AI mengacu pada peristiwa operasional yang dapat ditelusuri.

---

## 2. Kesesuaian dengan AI Web Innovation Challenge

### 2.1 Prinsip penyelarasan

Kedas harus terlihat sebagai inovasi web yang memanfaatkan AI untuk menyelesaikan masalah lokal. “Web” bukan sekadar tempat menampilkan chatbot; web adalah pusat interaksi, pengelolaan, verifikasi, dan pengambilan keputusan.

| Dimensi | Keputusan Kedas |
|---|---|
| Web-first | Seluruh fitur kompetisi dapat dijalankan melalui browser desktop dan mobile-responsive |
| AI-native | EcoGuide, Vision, dan Operations Copilot hadir pada workflow utama |
| Real-world problem | Fokus pada pengelolaan sampah komunitas dan destinasi pariwisata |
| Explainable | Jawaban menampilkan sumber, alasan, batasan, dan confidence bila relevan |
| Human-in-the-loop | AI menyarankan; petugas/operator mengesahkan keputusan penting |
| Responsible AI | Tidak membuat klaim palsu, tidak melakukan keputusan B3, tidak menulis ke transaksi tanpa konfirmasi |
| Demonstrable | Satu skenario end-to-end dapat ditunjukkan dalam browser dengan data demo yang diberi label |

### 2.2 Catatan kelayakan kompetisi

Informasi publik pihak ketiga untuk AI Web Innovation Challenge 2026 yang terkait Bali Digifest mencantumkan jenjang SMA, D1, dan D2. S1 tidak terlihat pada daftar tersebut. Ketentuan ini belum dikonfirmasi melalui guidebook resmi yang dapat diakses pada saat dokumen disusun. Tim wajib mengonfirmasi eligibility, format tim, tema, kriteria penilaian, artefak submission, dan deadline secara langsung kepada penyelenggara sebelum mengunci pendaftaran. Dokumen produk ini tetap berguna sebagai arah pengembangan web AI terlepas dari hasil konfirmasi tersebut.

### 2.3 Submission narrative yang disarankan

“Masalah pengelolaan sampah kawasan bukan hanya kurangnya pemilahan, tetapi kurangnya informasi yang kontekstual dan keputusan yang terkoordinasi. Kedas menggunakan AI berbasis pengetahuan lokal dan data operasional untuk membantu warga, wisatawan, usaha pariwisata, serta operator menentukan tindakan yang tepat dan menelusuri hasilnya.”

---

## 3. Visi, Misi, Sasaran, dan Prinsip Produk

### 3.1 Visi

Menjadi platform kecerdasan pengelolaan lingkungan kawasan yang menghubungkan komunitas dan pariwisata secara inklusif, transparan, dan berbasis bukti.

### 3.2 Misi

1. Memudahkan setiap aktor memahami aturan pemilahan dan layanan lokal.
2. Mengubah dokumen dan SOP kawasan menjadi pengetahuan yang dapat diakses melalui AI.
3. Mengurangi kesalahan pemilahan melalui bantuan visual yang aman dan terukur.
4. Membantu operator memilih tindakan berdasarkan kapasitas dan aturan yang berlaku.
5. Menghubungkan catatan operasional dengan pelaporan yang dapat diaudit.
6. Menjaga agar AI menjadi alat bantu, bukan pengganti otoritas dan tanggung jawab manusia.

### 3.3 Sasaran produk

- Membuat pengguna memperoleh jawaban lokal yang relevan dengan sumber rujukan.
- Meningkatkan pemahaman pemilahan melalui panduan interaktif dan visual.
- Mengurangi permintaan layanan yang tidak memenuhi aturan penerimaan.
- Membantu operator melihat kapasitas, antrian, dan alternatif fasilitas yang valid.
- Membuat laporan kawasan dari metrik yang berasal dari transaksi terverifikasi.
- Menyajikan satu pengalaman web yang konsisten untuk semua aktor.

### 3.4 Prinsip non-negotiable

1. Data operasional database adalah sumber kebenaran transaksi; LLM bukan sumber kebenaran.
2. AI harus menampilkan rujukan ketika menjawab dari knowledge base.
3. Jika sumber tidak cukup, AI harus abstain dan mengarahkan pengguna ke petugas/admin.
4. Berat material berasal dari penimbangan terverifikasi, tidak ditaksir dari foto.
5. Keputusan penerimaan material dan perpindahan status penting memerlukan otorisasi manusia.
6. Klaim daur ulang hanya boleh diberikan ketika bukti proses/serah-terima tersedia.
7. Fitur AI harus mempunyai fallback yang jelas ketika provider tidak tersedia.
8. Akses terhadap data dibatasi oleh role, organization membership, destination scope, dan ownership.

---

## 4. Pengguna, Organisasi, dan Jobs-to-be-Done

### 4.1 Stakeholder utama

| Persona/stakeholder | Pekerjaan utama | Masalah yang dihadapi | Nilai Kedas |
|---|---|---|---|
| Warga | Memilah, melaporkan, menyetor, melihat status | Bingung aturan lokal dan jalur setoran | EcoGuide, Vision, Waste Passport |
| Wisatawan | Mengetahui aturan kebersihan destinasi | Tidak mengenal sistem lokal, bahasa, atau titik pengelolaan | Guest Green Companion tanpa login |
| Petugas | Mengerjakan tugas pengumpulan/inspeksi | Informasi tugas dan aturan penerimaan tersebar | Task view dan Operations Copilot |
| Koordinator komunitas | Mengelola program dan komunikasi warga | Sulit melihat partisipasi serta kebutuhan komunitas | Community EcoLoop dan insight |
| HOREKA | Mengelola limbah kegiatan usaha | Sulit menyiapkan pencatatan dan bukti pengelolaan | Green Hospitality Ledger |
| Operator fasilitas | Mengelola material masuk, kapasitas, dan proses | Risiko overload, kontaminasi, dan jalur tidak tersedia | Facility Intelligence |
| Buyer/offtaker | Mencari pasokan sesuai spesifikasi | Kualitas/kuantitas material tidak konsisten | Circular Demand Board |
| Admin/operator kawasan | Mengelola kebijakan, akses, dan pelaporan | Data tersebar dan aturan tidak seragam | Destination dashboard dan AI insight |
| Sponsor/pemerintah | Mengevaluasi program | Sulit memverifikasi hasil dan penggunaan dana | Aggregated impact report |

### 4.2 Role vs organization membership

Jangan mengasumsikan setiap stakeholder baru membutuhkan role akun baru. Pertahankan delapan role akun aktual yang dilaporkan hingga mapping-nya diverifikasi di repository. Gunakan organization membership, project membership, dan permission scope untuk membedakan:

- account role: jenis izin dasar pada sistem;
- organization membership: hubungan akun dengan banjar, usaha, fasilitas, atau mitra;
- destination scope: kawasan/area tempat pengguna boleh mengakses data;
- active workspace: konteks tampilan yang dipilih pengguna;
- permission: tindakan spesifik yang benar-benar diizinkan backend.

Workspace switcher tidak boleh menjadi mekanisme pemberian hak akses.

### 4.3 Persona prioritas kompetisi

Pilih tiga persona untuk demonstrasi:

1. **HOREKA manager:** memakai Green Hospitality Ledger dan EcoGuide.
2. **Destination/facility operator:** memakai Operations Copilot, capacity view, dan traceability.
3. **Community/tourist user:** memakai EcoGuide/Vision dan Guest Green Companion.

---

## 5. Ruang Lingkup Web-First

### 5.1 In scope

- Web app responsif Next.js untuk public site dan authenticated workspaces.
- Web admin dan operator dashboard.
- Portal warga/komunitas/HOREKA/fasilitas/mitra sesuai akses existing.
- Guest microsite melalui QR, tanpa registrasi wajib.
- AI knowledge assistant berbasis RAG.
- AI visual material suggestion.
- AI operations and reporting copilot.
- Document/knowledge administration.
- API FastAPI dan integrasi provider AI melalui adapter server-side.
- Audit trail, AI feedback, evaluation dataset, observability, dan keamanan.

### 5.2 Out of scope untuk kompetisi

- Pengembangan aplikasi native Android/iOS baru.
- Integrasi perangkat IoT timbangan atau sensor sebagai prasyarat.
- Kendali armada atau GPS tracking live tanpa provider/data aktual.
- Automated financial settlement, payout, atau wallet berisi uang nyata.
- Otomatisasi pengangkutan/penugasan yang mengubah transaksi tanpa persetujuan operator.
- Klaim sertifikasi resmi green hotel/green tourism.
- Perluasan operasional seluruh Bali sebelum pilot lokal tervalidasi.
- Fine-tuning model skala besar tanpa dataset berizin dan evaluasi yang layak.

Mobile application yang sudah ada pada repository dipertahankan dan tidak dihapus. Untuk kompetisi ini, fitur mobile native dibekukan sebagai scope pengembangan; seluruh alur yang didemonstrasikan harus dapat dijalankan melalui web responsif.

### 5.3 Platform web dan viewport

- Desktop-first untuk admin, operator, fasilitas, HOREKA, dan analitik.
- Mobile-responsive untuk warga, petugas, serta wisatawan yang mengakses QR.
- Tidak memerlukan instalasi aplikasi native.
- PWA/offline enhancement bersifat P2, bukan syarat AI web MVP.

---

## 6. Product Differentiation dan AI Capabilities

## 6.1 Kedas Green Intelligence — satu lapisan AI, tiga pengalaman

Kedas Green Intelligence adalah lapisan layanan AI bersama yang menggunakan konteks kawasan, permission pengguna, knowledge source yang tervalidasi, dan data operasional yang diizinkan.

### A. Kedas EcoGuide — Grounded Knowledge Assistant

**Tujuan:** menjawab pertanyaan dengan sumber lokal yang sudah diverifikasi.

Contoh pertanyaan:
- “Bagaimana cara menyiapkan sampah organik di kawasan ini?”
- “Apakah botol PET harus dibilas sebelum disetor?”
- “Di mana wisatawan dapat menemukan titik pemilahan terdekat?”
- “Apakah fasilitas kawasan menerima minyak jelantah?”

Kemampuan:
- retrieval dari SOP kawasan, CDOA, panduan pemilahan, daftar material diterima, jadwal publik, dan sumber regulasi yang sudah dikurasi;
- menjawab sesuai destination scope;
- menampilkan nama sumber, versi, tanggal pembaruan, dan bagian relevan;
- membedakan aturan lokal dengan informasi umum;
- abstain ketika tidak ada sumber cukup;
- menerima Bahasa Indonesia dan Inggris pada MVP; frasa Bali hanya jika sudah ditinjau penutur/ahli.

Keunggulan: EcoGuide tidak sekadar memberi jawaban umum tentang daur ulang. Jawabannya terikat pada aturan dan fasilitas yang benar-benar tersedia di kawasan yang dipilih.

### B. Kedas Vision — Visual Waste Recognition

**Tujuan:** membantu pengguna mengidentifikasi material dari foto.

Output minimal:
- kandidat kategori/subkategori;
- penjelasan ciri visual yang dipakai;
- tingkat keyakinan atau kategori confidence (high/medium/low) yang dikalibrasi;
- indikasi kontaminasi yang tampak;
- langkah persiapan;
- status perlu pemeriksaan manusia atau tidak;
- rujukan panduan kawasan.

Batasan:
- foto tidak digunakan untuk menghitung berat;
- tidak menjamin material diterima fasilitas;
- tidak memutuskan status B3/limbah khusus secara final;
- gambar ambigu, campuran, buram, atau berbahaya harus menghasilkan “perlu pemeriksaan”, bukan kepastian;
- keputusan penerimaan ditentukan oleh acceptance rule dan petugas/fasilitas.

### C. Kedas Operations Copilot — Decision Support

**Tujuan:** membantu operator memahami kondisi sistem dan menentukan opsi tindakan.

Fungsi:
- menjawab pertanyaan agregat berdasarkan metrik yang diizinkan;
- merekomendasikan fasilitas kandidat berdasarkan hard constraints: kategori diterima, kapasitas tersedia, wilayah layanan, jam operasi, status fasilitas, dan jadwal;
- memprioritaskan antrian secara explainable berdasarkan SLA, jenis material, umur permintaan, dan kapasitas;
- menandai data tidak biasa (berat ekstrem, penerimaan tertunda, status tidak sinkron, gap mass balance);
- menyusun ringkasan laporan periode dari data terverifikasi;
- menjelaskan alasan, asumsi, data yang digunakan, dan alternatif.

Pemisahan tugas:
- deterministic rule engine menentukan kandidat yang valid;
- AI menjelaskan, merangkum, dan menyarankan di antara kandidat valid;
- manusia meninjau dan mengeksekusi perubahan yang berdampak pada operasi.

Tidak boleh membiarkan LLM membuat SQL bebas, mengubah berat, menerbitkan reward, menugaskan petugas, atau mengubah transaksi langsung.

## 6.2 Diferensiasi non-AI yang memperkuat AI

| Pembeda | Masalah | Cara Kedas menyelesaikan | Bukti yang harus ditampilkan |
|---|---|---|---|
| Community Destination Operating Agreement (CDOA) | Aturan kawasan tersebar | Konfigurasi aturan layanan per kawasan | Versi aturan, approver, tanggal berlaku |
| Waste Passport | Nasib material tidak terlihat | QR/ID batch dan status lineage | Timeline event dan evidence |
| Facility Intelligence | Material diarahkan ke fasilitas tidak sesuai | Capacity + acceptance rules | Kapasitas, kategori diterima, status fasilitas |
| Green Hospitality Ledger | Usaha sulit menyusun laporan | Ledger pencatatan dan bukti | Record, period summary, source data |
| Community EcoLoop | Program komunitas sulit dievaluasi | Event, issue report, engagement | Partisipasi terverifikasi dan tindak lanjut |
| Guest Green Companion | Wisatawan tidak tahu aturan lokal | Public microsite/QR multi-bahasa | Jawaban bersumber dan informasi publik |
| Circular Demand Board | Material sulit menemukan penerima | Demand/offers dan serah-terima | Spesifikasi, status, bukti transaksi |

---

## 7. Prioritas Produk

### 7.1 P0 — minimum differentiating product

1. Existing authentication dan role-based workspace yang sudah stabil.
2. Destination/organization context dan CDOA versi sederhana.
3. Knowledge administration: upload, metadata, review, publish, retire.
4. EcoGuide RAG dengan citations dan abstention.
5. AI Vision untuk material umum yang aman (contoh: kertas/kardus, PET, HDPE, logam, kaca, organik umum) dengan human confirmation.
6. Facility acceptance/capacity read model dari data existing atau konfigurasi pilot.
7. Operations Copilot read-only untuk rekomendasi dan ringkasan.
8. Web demo journey end-to-end.
9. AI usage logging, feedback, security, and evaluation.

### 7.2 P1 — memperkuat nilai produk

- Guest Green Companion QR dengan ID/EN.
- Green Hospitality monthly report.
- Waste Passport timeline dan QR.
- Community EcoLoop events/issue report.
- AI-assisted report narrative berdasarkan aggregated verified data.
- Circular Demand Board read/offer workflow jika existing API mendukung.
- Knowledge freshness alerts dan stale-document detection.

### 7.3 P2 — setelah data dan pilot memadai

- Seasonal waste forecast.
- Anomaly detection model yang dievaluasi pada data historis cukup.
- Destination Clean Loop Index (DCLI) dengan metodologi tervalidasi.
- Advanced multilingual support.
- Integrasi timbangan/perangkat dan offline queue.
- Model khusus/finetuning.

---

## 8. User Journeys Utama

### 8.1 Journey A — warga memakai EcoGuide dan Vision

1. Warga membuka portal Kedas dan memilih kawasan.
2. EcoGuide menjelaskan aturan lokal dengan rujukan.
3. Warga mengambil/mengunggah foto material.
4. Vision menampilkan kandidat kategori, confidence, kontaminasi visual, dan langkah persiapan.
5. UI menampilkan acceptance/service availability yang bersumber dari konfigurasi aktif.
6. Warga mengajukan setoran melalui existing workflow.
7. Petugas/operator memvalidasi hasil lapangan.
8. Waste Passport menampilkan status event yang benar-benar tercatat.

**Sukses jika:** pengguna memahami apa yang harus dilakukan, tidak mendapat janji layanan palsu, dan dapat menelusuri status.

### 8.2 Journey B — HOREKA memakai Green Hospitality Ledger

1. Manager masuk ke workspace organisasi usaha.
2. Memilih periode dan mencatat volume/kategori sesuai form.
3. EcoGuide menjelaskan persiapan material dan aturan kawasan.
4. Sistem memeriksa layanan yang tersedia berdasarkan kategori, kapasitas, dan jadwal.
5. Petugas/fasilitas mencatat penerimaan dan hasil verifikasi.
6. Manager melihat ledger, exception, dan ringkasan periode.
7. Operations Copilot menyusun narasi laporan dari metrik terverifikasi.
8. Manager memeriksa dan mengunduh laporan.

**Sukses jika:** laporan memisahkan data terukur, data yang dilaporkan mandiri, estimasi, dan data yang belum diverifikasi.

### 8.3 Journey C — operator menggunakan Operations Copilot

1. Operator membuka dashboard kawasan.
2. Sistem menampilkan kapasitas, antrian, permintaan terlambat, dan pengecualian.
3. Operator bertanya: “Permintaan organik mana yang perlu diprioritaskan hari ini?”
4. Backend mengambil metrik terotorisasi dan menjalankan filter aturan deterministik.
5. AI menyusun daftar rekomendasi beserta alasan dan sumber data.
6. Operator meninjau rekomendasi.
7. Jika tindakan diperlukan, UI membuka form aksi normal yang membutuhkan konfirmasi pengguna.
8. Semua perubahan transaksi dicatat lewat service domain normal dan audit log.

**Sukses jika:** AI tidak melewati permission dan tidak melakukan mutasi diam-diam.

### 8.4 Journey D — wisatawan menggunakan Guest Green Companion

1. Wisatawan scan QR yang dipasang pengelola kawasan.
2. Microsite terbuka tanpa login.
3. Wisatawan memilih ID/EN.
4. Halaman menampilkan aturan ringkas, peta/titik informasi (jika tersedia), dan EcoGuide dengan sumber publik.
5. Wisatawan dapat bertanya tentang pemilahan dan perilaku ramah lingkungan di kawasan.
6. Data personal tidak diminta kecuali ada fitur yang memerlukan alasan jelas.

---

## 9. AI Trust, Safety, dan Governance

### 9.1 Grounding

Setiap jawaban knowledge assistant harus memiliki retrieval context yang relevan. Tampilkan minimal satu sumber untuk klaim yang berasal dari knowledge base. Sumber memiliki status `DRAFT`, `IN_REVIEW`, `PUBLISHED`, atau `RETIRED`; hanya sumber `PUBLISHED` yang boleh digunakan.

### 9.2 Confidence and abstention

- High: model dapat memberi saran dengan rujukan dan catatan verifikasi.
- Medium: tampilkan sebagai kandidat dan minta konfirmasi.
- Low: jangan tampilkan keputusan kategori final; minta foto lebih baik atau pemeriksaan petugas.
- Safety-sensitive/unknown: stop normal workflow dan tampilkan arahan aman serta kontak/otoritas kawasan yang sudah dikonfigurasi.

Nilai ambang harus dikalibrasi pada evaluation set, bukan ditentukan berdasarkan feeling.

### 9.3 Human-in-the-loop

AI tidak boleh secara langsung:
- mengubah status pickup/material passport;
- menyatakan material diterima/ditolak secara final;
- mengisi berat final;
- menerbitkan/mengubah saldo poin;
- menyelesaikan atau membayar transaksi;
- mempublikasikan dokumen pengetahuan;
- mengubah CDOA atau acceptance rule;
- mengakses data personal lintas organisasi.

### 9.4 Data privacy

- Gunakan data minimum untuk setiap prompt.
- Hapus EXIF dan metadata sensitif dari gambar sebelum provider call bila relevan.
- Jangan mengirim alamat lengkap, nomor telepon, atau identitas warga ke model apabila tidak dibutuhkan.
- Gunakan tenant/destination filter sebelum retrieval.
- API key hanya di environment backend.
- Retensi prompt/response dikonfigurasi dan transparan.

---

## 10. Product Metrics dan Definition of Success

### 10.1 North Star Metric

**Verified Destination Waste Actions**: jumlah tindakan pengelolaan sampah yang mempunyai sumber, tindakan, status, dan bukti/konfirmasi yang lengkap. Metrik ini tidak menghitung hanya interaksi chatbot atau foto unggahan.

### 10.2 Product KPIs

| KPI | Definisi | Catatan |
|---|---|---|
| EcoGuide grounded answer rate | Jawaban substantif dengan rujukan valid / seluruh jawaban substantif | Evaluasi manual + otomatis |
| Citation correctness | Sitasi benar-benar mendukung klaim | Audit sample |
| Abstention precision | Kasus yang seharusnya ditolak dan memang ditolak | Safety evaluation |
| Vision top-1 accuracy | Prediksi kategori benar pada dataset uji terlabel | Pisahkan kategori |
| Vision safe escalation rate | Kasus ambigu/sensitif yang diarahkan ke manusia | Tidak dioptimalkan sekadar rendah |
| Service eligibility accuracy | Keputusan tersedia/tidak tersedia cocok dengan rule engine | Uji kombinasi area/kategori/kapasitas |
| AI recommendation acceptance | Rekomendasi yang diterima operator | Bukan metrik kualitas tunggal |
| Data traceability completeness | Record yang memiliki event wajib lengkap | Berdasarkan tipe alur |
| HOREKA report completeness | Field wajib dan sumber data terisi | Bedakan self-reported/verified |
| Task completion rate | Tugas valid selesai / tugas yang ditugaskan | Berdasarkan periode |

### 10.3 Target awal demonstrasi

Target teknis diatur sebagai sasaran uji, bukan klaim performa lapangan:
- 100% jawaban EcoGuide pada demo memiliki sumber atau abstain.
- 0 AI action menulis transaksi tanpa konfirmasi.
- 100% API AI mengotorisasi role dan destination scope.
- Semua rekomendasi fasilitas lolos hard constraints.
- Semua data demo diberi label `SIMULATED`/`DEMO`.
- Semua laporan AI dapat ditelusuri ke data sumber.

---

## 11. Demo Storyline Kompetisi

### 11.1 Skenario utama: “From Local Knowledge to Verified Action”

1. Pengelola kawasan mempublikasikan aturan pemilahan lokal (CDOA) dan daftar fasilitas.
2. Wisatawan/HOREKA bertanya kepada EcoGuide; jawaban menampilkan sumber resmi/lokal.
3. HOREKA mengunggah foto material; Vision memberikan saran dan mendeteksi bahwa keputusan akhir perlu konfirmasi.
4. Sistem memeriksa acceptance rule dan kapasitas fasilitas.
5. Operations Copilot memberikan rekomendasi opsi fasilitas/prioritas dengan alasan.
6. Operator menyetujui melalui workflow standar.
7. Setelah data demo penerimaan diinput, Waste Passport memperlihatkan jejak batch.
8. Copilot menyusun ringkasan dampak dari metrik yang sudah diverifikasi.

### 11.2 Narasi pembeda

Bukan “AI bisa mengenali sampah”. Pembeda Kedas adalah: **AI memahami konteks aturan dan fasilitas kawasan, menghubungkan saran ke layanan nyata, lalu membantu operator mengambil keputusan yang dapat dijelaskan dan diaudit.**

---

## 12. Risiko Produk dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| S1 mungkin tidak memenuhi eligibility event | Karya tidak dapat disubmit | Konfirmasi guidebook resmi sebelum registrasi |
| RAG menjawab dari sumber kedaluwarsa | Informasi layanan keliru | Versioning, expiry, owner, review, retire |
| Vision salah mengklasifikasikan | Salah pemilahan/penanganan | Human confirmation dan safe escalation |
| LLM membuat fasilitas palsu | Pengiriman tidak tepat | Candidate berasal dari database/rule engine, bukan LLM bebas |
| Data demo dianggap nyata | Klaim dampak menyesatkan | Label data demo dan disclaimer |
| Prompt injection | Data bocor atau jawaban dimanipulasi | Treat retrieved docs as data, filter, policy, test |
| Provider AI down | Fitur AI gagal | Timeout, retry terbatas, graceful fallback |
| Biaya AI tak terkendali | Biaya operasional meningkat | Rate limit, quota, caching, model routing |
| Perubahan merusak as-built | Regression | Baseline tests, migration review, backward compatibility |

---

## 13. Roadmap Produk

### Phase 0 — Eligibility & as-built verification
- Konfirmasi ketentuan lomba.
- Audit repo, API, model, role, dan laporan audit.
- Tetapkan demo scenario dan AI evaluation set.

### Phase 1 — AI foundation
- Knowledge source registry.
- Destination scoping.
- Provider adapter.
- Logging, quota, privacy, feedback.

### Phase 2 — EcoGuide
- RAG retrieval, citations, abstention.
- Public and authenticated contexts.
- Knowledge admin workflow.

### Phase 3 — Vision assistant
- Upload and image validation.
- Category suggestion.
- Confidence and escalation.
- Human feedback/evaluation.

### Phase 4 — Operations Copilot
- Read-only tools.
- Facility eligibility engine.
- Recommendation explanation.
- Reporting narrative with data citations.

### Phase 5 — Unified web experience
- Design system implementation.
- Role-aware pages and responsive UX.
- AI interaction patterns.
- Guest microsite.

### Phase 6 — Validation and competition handover
- Regression, security, accessibility, AI evaluation.
- Demo seed data and reset process.
- Pitch narrative, one-pager, demo recording, and known-limitations report.

---

## 14. Acceptance Summary

Kedas dinyatakan siap untuk demonstrasi AI Web Innovation apabila:

1. tiga capability AI dapat ditunjukkan melalui web;
2. EcoGuide memiliki grounding dan sitasi;
3. Vision memberi hasil probabilistik dengan jalur pemeriksaan manusia;
4. Operations Copilot memakai tools read-only, hard constraints, dan alasan yang dapat ditelusuri;
5. fitur AI tidak melewati RBAC, organization membership, destination scope, atau domain service;
6. tidak ada AI-generated transaction write tanpa aksi manusia yang sah;
7. laporan membedakan verified, self-reported, estimated, dan simulated;
8. seluruh test lama yang relevan tetap lulus;
9. tidak ada secret/API key di frontend atau repository;
10. seluruh halaman utama web responsif, aksesibel, dan memiliki state loading/error/empty yang benar.

---

## 15. Referensi Internal

- Laporan as-built Kedas yang diberikan tim.
- PRD, SRS, SDD, HRD historis WasteLink Bali yang menjadi sumber kebutuhan dan kompatibilitas.
- Kedas Product Strategy & System Design — Community & Green Tourism.
- Master prompt implementasi Kedas 10 tahap sebelumnya.

## 16. Referensi Konteks Kompetisi (perlu verifikasi resmi)

- Bali Digifest official event portal: https://digifest.baliprov.go.id/event
- Informasi rangkaian Bali Digifest 2026: https://timesindonesia.co.id/pendidikan/612576/nyala-kreativitas-di-balidigifest-2026-pemprov-bali-siapkan-roadshow-ke-56-sekolah-dan-kampus
- Daftar event AI Web Innovation Challenge 2026 (sumber pihak ketiga): https://luarkampus.id/events

Informasi jadwal dan eligibility pada sumber pihak ketiga bukan pengganti guidebook/keputusan resmi panitia.
