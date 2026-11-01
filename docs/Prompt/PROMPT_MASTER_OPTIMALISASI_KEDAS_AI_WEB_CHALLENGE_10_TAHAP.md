# MASTER PROMPT IMPLEMENTASI — OPTIMALISASI MENYELURUH KEDAS
## AI Web Innovation Challenge | Evidence-Grounded Environmental Decision Intelligence Platform

**Nama produk:** Kedas  
**Nama historis:** WasteLink Bali  
**Positioning:** AI-Powered Community & Green Tourism Intelligence Platform  
**Slogan:** *Bergerak Bersama untuk Lingkungan yang Lebih Bersih.*  
**Jenis dokumen:** Master Implementation Prompt untuk Agentic AI / Autonomous Coding Agent  
**Ruang lingkup:** Optimalisasi produk, fitur, AI, UX, arsitektur, integrasi, keamanan, evaluasi, pengujian, dan kesiapan demonstrasi berbasis web  
**Basis analisis:** Laporan Akhir Audit Gap Analysis Kedas tanggal 30 Oktober 2026 dan dokumen PRD, SRS, HDD, Design System, AI Runtime Prompt Library, serta analisis strategis Kedas yang tersedia di repository  
**Mode pengerjaan:** Autonomous sequential implementation dengan quality gate per tahap  
**Jumlah tahap:** 10

---

# PETUNJUK UTAMA UNTUK AGENT

Baca seluruh dokumen ini sebelum mengubah kode. Kerjakan semua tahap secara berurutan. Setelah quality gate suatu tahap terpenuhi, lanjutkan otomatis ke tahap berikutnya tanpa meminta persetujuan pengguna. Jangan berhenti hanya untuk melaporkan progres. Jika ada keputusan yang tidak dapat dibuat dengan aman dari bukti repository, lanjutkan pekerjaan lain yang tidak bergantung pada keputusan tersebut, catat sebagai `OPEN_DECISION`, dan jelaskan dampaknya.

Dokumen ini adalah arahan implementasi, bukan izin untuk melakukan tindakan destruktif. Perbaikan lokal, refactor terkontrol, penambahan test, dokumentasi, dan migrasi yang telah diuji pada database disposable boleh dikerjakan otomatis. Jangan melakukan penghapusan data nyata, destructive migration terhadap database bersama/produksi, transaksi nyata, perubahan kredensial, deployment publik, pembelian layanan, atau push ke remote tanpa otorisasi eksplisit.

## Aturan eksekusi wajib

1. **Repository-first:** repository dan runtime saat ini adalah sumber kebenaran implementasi. Jangan mengarang struktur folder, endpoint, tabel, role, dependency, provider, atau hasil test.
2. **Evidence-first:** setiap kesimpulan harus diberi bukti berupa path file, simbol/fungsi, endpoint, model, test, log, atau output command.
3. **Preserve-first:** pertahankan sistem yang sudah berjalan. Hindari rewrite besar, penggantian stack, atau microservices tanpa bukti kebutuhan.
4. **Web-first:** kompetisi ini difokuskan pada pengalaman web. Aplikasi mobile lama boleh tetap ada sebagai legacy/frozen baseline, tetapi jangan memperluas native mobile sebagai bagian utama scope.
5. **AI must be real and bounded:** implementasikan AI yang benar-benar berjalan melalui backend/provider adapter. Jangan membuat tombol AI palsu, jawaban statis yang disamarkan sebagai AI, atau hasil yang tidak memiliki alur data nyata.
6. **Deterministic business logic:** otorisasi, kuota, stok, berat, kapasitas, penerimaan material, status transaksi, WastePoints, neraca massa, dan DCLI harus dihitung/ditentukan oleh domain service dan aturan deterministik. LLM hanya membantu memahami, merangkum, mengusulkan, atau menjelaskan.
7. **Human-in-the-loop:** AI tidak boleh memutasi transaksi atau mengubah kebijakan/aturan kawasan secara langsung. Tindakan operasional harus menjadi proposal, melewati validasi backend, lalu dikonfirmasi aktor berwenang.
8. **Truthful claims:** jangan mengarang dataset, angka akurasi, hasil uji, jumlah pengguna, partner, transaksi, kapasitas, emisi yang dihindari, sertifikasi, atau dampak. Bedakan data nyata, data demo/simulasi, self-reported, estimated, dan verified.
9. **Compatibility:** pertahankan kontrak `/api/v1/...`, skema database, login/session, identifier teknis historis, dan integrasi yang telah digunakan kecuali audit membuktikan perubahan diperlukan. Perubahan breaking harus memiliki alasan, migration plan, test, dan compatibility layer bila dibutuhkan.
10. **No hidden mock success:** bila API, provider AI, atau integrasi gagal, tampilkan error/fallback secara jujur. Jangan mengubah kegagalan menjadi sukses simulasi.
11. **Test before and after:** jalankan baseline sebelum implementasi, kemudian test spesifik dan regression test setelah setiap tahap.
12. **Autonomous stage transition:** jangan meminta persetujuan antar-tahap. Lanjutkan otomatis ketika gate lulus. Bila gate gagal, perbaiki secara aman, jalankan ulang, dan catat hasilnya.
13. **No production assumptions:** seluruh pengujian destruktif/migrasi dilakukan di environment lokal/test/disposable. Jangan menyentuh data produksi.
14. **Document decisions:** setiap asumsi, keterbatasan, kompromi, keputusan arsitektur, dan fitur yang ditunda wajib dicatat.

---

# A. IDENTITAS PRODUK DAN MISI SISTEM

## A.1 Product statement

Kedas adalah platform web AI untuk membantu warga, wisatawan, komunitas/banjar, pengelola kawasan, usaha pariwisata, petugas, fasilitas pengolahan, dan mitra material memahami serta mengelola persoalan sampah secara kontekstual. Kedas menghubungkan pengetahuan lokal, identifikasi material, data operasional, rekomendasi berbasis bukti, tindakan yang tervalidasi, dan pengukuran hasil.

## A.2 Core product promise

**Local Knowledge → Material Understanding → Operational Decision → Verified Action → Measurable Outcome.**

Kedas tidak boleh berhenti pada chatbot atau dashboard. Setiap pengalaman AI harus membantu pengguna memahami konteks, melihat bukti, mengambil keputusan yang benar, dan mengukur hasil berdasarkan data yang dapat ditelusuri.

## A.3 Tiga kemampuan AI inti

### 1. Kedas EcoGuide — Grounded Local Knowledge Assistant

Asisten pengetahuan kawasan berbasis retrieval-augmented generation (RAG). EcoGuide menjawab berdasarkan dokumen/sumber yang sudah dikelola, disetujui, dan berlaku pada destination/organization scope yang relevan. Jawaban harus menyertakan sitasi, tanggal berlaku, pemilik sumber, serta batasan informasi. Jika bukti tidak memadai, EcoGuide wajib abstain atau meminta klarifikasi.

### 2. Kedas Vision — Context-Aware Waste Recognition

Asisten klasifikasi foto material. Vision memberi kandidat kategori/subkategori, indikasi kontaminasi bila dapat diamati, confidence/uncertainty, saran persiapan material, dan aturan penerimaan fasilitas yang berlaku pada kawasan. Hasil AI adalah rekomendasi; kategori akhir tetap dikonfirmasi pengguna/petugas. Vision tidak menentukan berat, keamanan bahan berbahaya, atau sertifikasi material.

### 3. Kedas Operations Copilot — Evidence-Based Decision Support

Asisten analisis operasional yang membaca data melalui read-only tools yang diizinkan, mendeteksi isu, menjelaskan bukti, membandingkan opsi, dan membuat typed action proposal. Proposal dapat dipreview serta diedit, divalidasi ulang oleh backend, dan hanya dieksekusi setelah konfirmasi manusia yang berwenang.

## A.4 Keunggulan non-AI yang wajib memperkuat AI

- Dynamic Destination, Service Area, dan Community Destination Operating Agreement (CDOA).
- Knowledge Management & Governance Workspace.
- Facility Intelligence dan deterministic service eligibility.
- Digital Waste Passport dan material traceability.
- Green Hospitality Ledger.
- Community EcoLoop.
- Guest Green Companion.
- Circular Demand Board, bila kesiapan data dan buyer tersedia.
- Destination Clean Loop Index (DCLI) dan evidence-based reporting.
- Audit trail, provenance, data quality, dan AI evaluation.

---

# B. BASELINE AS-BUILT — WAJIB DIVERIFIKASI ULANG

Laporan audit 30 Oktober 2026 yang diberikan tim mencatat:

| Indikator | Angka dalam laporan audit | Perlakuan agent |
|---|---:|---|
| ORM relational tables | 44 | Verifikasi model aktual dan migration history |
| Alembic migrations | 10 (0001–0010) | Verifikasi status migration lokal/test |
| FastAPI REST endpoints | 116 | Verifikasi router/OpenAPI aktual |
| Next.js web routes | 38 | Verifikasi route tree aktual |
| Automated tests | 203/203 passed | Jalankan ulang; jangan menganggap masih lulus |
| Backend pytest | 86 passed | Jalankan ulang |
| Frontend Vitest | 102 passed | Jalankan ulang |
| Mobile Vitest | 15 passed | Legacy baseline; jangan perluas native scope |
| Production build | 38/38 halaman | Jalankan ulang dengan konfigurasi aktif |
| Average feature maturity | 3.42/5 | Anggap skor historis, bukan pengukuran baru |

Temuan audit yang harus ditelusuri:

- `GAP-001`: halaman `/area-layanan` memakai data statis, bukan binding API/CODA dinamis.
- `GAP-002`: CTA Operations Copilot hanya menampilkan toast, belum membuat pre-filled action proposal.
- `GAP-003`: EcoGuide memakai exact token set intersection, belum hybrid semantic retrieval.
- `GAP-004`: model B2B/HOREKA tersedia, tetapi workspace mandiri `/hospitality` belum tersedia.
- `GAP-005`: form timbang/inspeksi petugas memerlukan koneksi; belum memiliki offline outbox.
- `GAP-006`: formula DCLI backend tersedia, tetapi visualisasi radar/interaktif belum lengkap.
- `GAP-007`: endpoint knowledge ingestion tersedia, tetapi admin belum memiliki form web untuk upload/review/publish SOP.
- Alur Guest, warga + Vision, petugas + timbang, Waste Passport, dan admin + Copilot dilaporkan telah dapat didemonstrasikan. Verifikasi ulang source, test, dan runtime sebelum menyebutnya complete.
- Arsitektur AI menggunakan dual-mode provider adapter; secret tidak boleh berada di browser.
- Aturan transaksi dan perhitungan operasional tetap deterministik.

**Penting:** laporan lama PRD/SRS/HDD mungkin memiliki baseline angka berbeda karena dibuat sebelum audit terbaru. Gunakan audit terbaru sebagai hipotesis baseline, tetapi repository saat ini tetap menjadi bukti final. Catat perbedaan versi dokumen dan jangan menggabungkan angka dari snapshot berbeda seolah satu waktu.

---

# C. OUTPUT WAJIB DAN SISTEM PELACAKAN

Buat direktori dokumentasi implementasi yang konsisten, misalnya:

`docs/implementation/kedas-ai-optimization/`

Nama boleh disesuaikan dengan konvensi repository, tetapi lokasi final harus dicatat.

Berkas minimal:

1. `IMPLEMENTATION_MASTER_PLAN.md` — ringkasan tahap dan scope aktual.
2. `KEDAS_AS_BUILT_BASELINE.md` — hasil audit ulang repository.
3. `KEDAS_REQUIREMENT_TRACEABILITY.csv` — requirement → file/API/data/test/evidence.
4. `KEDAS_AI_EVALUATION_PLAN.md` — dataset, metric, benchmark, threshold, limitation.
5. `KEDAS_AI_EVALUATION_RESULTS.md` — hasil eksperimen aktual.
6. `KEDAS_ARCHITECTURE_DECISIONS.md` — ADR dan keputusan yang belum selesai.
7. `KEDAS_SECURITY_AND_PRIVACY_REVIEW.md` — temuan dan kontrol.
8. `KEDAS_FEATURE_OPTIMIZATION_BACKLOG.md` — backlog dengan prioritas dan effort.
9. `KEDAS_IMPLEMENTATION_PROGRESS.md` — update otomatis per tahap.
10. `KEDAS_FINAL_OPTIMIZATION_REPORT.md` — laporan akhir berbasis bukti.
11. `KEDAS_DEMO_RUNBOOK.md` — akun demo, seed, skrip demo, reset, fallback.
12. `KEDAS_CLAIM_REGISTER.md` — klaim produk/AI/dampak dan bukti pendukung.

Untuk setiap tahap, simpan:
- tujuan;
- fitur yang disentuh;
- daftar file aktual yang berubah;
- migration/API contract bila ada;
- test command dan hasil;
- screenshot/runtime evidence jika relevan;
- risiko dan keputusan terbuka;
- quality gate result;
- status `PASS`, `PASS_WITH_LIMITATIONS`, atau `BLOCKED`.

Jangan mengklaim keseluruhan tahap lulus bila ada bagian kritis yang belum diuji. Gunakan `PASS_WITH_LIMITATIONS` jika fitur berjalan dengan keterbatasan yang telah dinyatakan.

---

# D. GLOBAL ARCHITECTURE AND DESIGN RULES

## D.1 Pertahankan modular monolith

Jangan memecah sistem menjadi microservices hanya untuk menambah kompleksitas. Pertahankan batas domain/module yang ada. Tambahkan service layer yang terpisah secara logis untuk AI orchestration, retrieval, vision, copilot, evaluation, dan knowledge governance.

## D.2 Source of truth

- PostgreSQL/domain entities adalah sumber kebenaran transaksi dan konfigurasi.
- Backend domain service adalah otoritas business rules.
- AI provider menghasilkan konten probabilistik, bukan fakta transaksi.
- Uploaded files dan retrieved documents adalah untrusted input.
- Browser/client tidak boleh menentukan role, tenant, berat resmi, saldo, kapasitas, atau status final.
- Data demo harus memiliki `demo/simulated` marker yang terlihat dan tidak tercampur dengan data nyata.

## D.3 Shared Area Context

Semua AI/domain module harus menggunakan context resolver yang konsisten:

- destination/service-area ID;
- organization/tenant membership;
- user role dan permissions;
- CDOA version/status;
- active material taxonomy;
- facility acceptance rules;
- facility capacity snapshot dan freshness;
- applicable knowledge documents/version;
- locale/language;
- reporting period.

Jangan menyusun context dari parameter frontend tanpa validasi server-side. Hindari query berulang yang berbeda definisi untuk EcoGuide, Vision, dan Copilot.

## D.4 API and contracts

- Audit OpenAPI dan generated client sebelum menambah endpoint.
- Reuse API yang ada jika sesuai.
- Tambahkan typed request/response schema.
- Standardisasi error code, validation details, request ID, pagination, filtering, dan timestamps.
- Jangan expose provider keys atau internal prompts ke client.
- Jangan membuat endpoint write generik yang dapat mengeksekusi arbitrary action.

## D.5 Database changes

- Audit apakah entity/column sudah ada sebelum menambah migration.
- Migration harus additive bila memungkinkan.
- Uji migration upgrade/downgrade pada database disposable.
- Tambahkan index dan constraints berdasarkan query/use case nyata.
- Hindari menyimpan embedding/large binary di kolom yang salah; gunakan storage yang sesuai.
- Dokumen published harus memiliki version history, checksum, effective date, dan audit metadata.

## D.6 Web UX

Gunakan Design System Kedas yang telah tersedia sebagai baseline. Jangan membuat design system kedua yang bertentangan. Perbaiki komponen secara bertahap.

Setiap fitur AI harus mempunyai:
1. konteks input/data yang digunakan;
2. hasil AI;
3. bukti/sumber/confidence/ketidakpastian;
4. next action yang jelas;
5. feedback atau escalation path.

Setiap halaman harus menangani loading, empty, error, stale, permission denied, AI unavailable, dan retry state secara eksplisit.

---

# E. DETAIL SPESIFIKASI POTENSI DAN FITUR

Bagian ini menjadi definisi produk dan engineering untuk seluruh potensi hasil brainstorming. Agent harus memetakan setiap requirement ke komponen existing atau implementasi baru.

## E1. Dynamic Destination, Service Area & CDOA

### Tujuan
Menjadikan informasi kawasan/banjar yang terlihat publik dan digunakan AI selalu berasal dari konfigurasi backend yang memiliki status, versi, dan waktu berlaku.

### Kapabilitas
1. Public service-area listing.
2. Service-area detail.
3. Operational status: `ACTIVE`, `LIMITED`, `TEMPORARILY_CLOSED`, `NOT_YET_AVAILABLE`, `UNKNOWN` (gunakan enum existing jika sudah ada).
4. Operating hours dan holiday/special schedule.
5. Material/service availability.
6. Linked facilities dan accepted categories.
7. Quota/booking availability bila endpoint sumber mendukung.
8. CDOA version dan effective period.
9. Public/private field separation.
10. Last updated timestamp dan data freshness indicator.
11. Admin create/edit draft, preview, review/approval, publish, withdraw, version history.
12. Cache invalidation setelah publish.

### Public UI
- List/detail kawasan.
- Filter berdasarkan area, jenis layanan, status, material.
- Status badge yang tidak hanya berbasis warna.
- Jam layanan, instruksi, kategori diterima, fasilitas terhubung, kontak publik.
- Tampilkan `last_updated_at` dan pesan jika informasi sudah stale.
- Jika data kosong/gagal, tampilkan empty/error state; jangan fallback ke daftar statis yang terlihat real.

### Admin workflow
`Draft → Preview → Review → Approved → Published → Superseded/Withdrawn`.

Jika tidak ada kebutuhan approval multi-aktor di model existing, gunakan approval policy yang paling sederhana dan dokumentasikan keputusan. Jangan mengarang jabatan adat atau kewenangan persetujuan.

### Business rules
- Public hanya membaca published version.
- Perubahan published CDOA menghasilkan versi baru; jangan overwrite sejarah.
- Jadwal dan layanan yang melewati effective date harus diperlakukan sesuai timezone destination.
- Status publik tidak boleh disimpulkan hanya dari cache.
- CDOA yang kedaluwarsa harus diberi peringatan dan tidak boleh menjadi satu-satunya sumber keputusan AI.

### Acceptance criteria
- Semua area card mengambil data dari API.
- Tidak ada fallback static data yang menyamar sebagai data aktual.
- Admin dapat membuat draft dan melihat preview sebelum publish.
- Perubahan published tercermin sesuai invalidation policy.
- Riwayat versi dapat diperiksa.
- Unauthorized user tidak dapat publish.
- API error/empty/stale ditangani dengan benar.

## E2. Knowledge Management & Governance Workspace

### Tujuan
Memungkinkan admin kawasan mengelola knowledge base tanpa memanggil API secara manual, dengan provenance dan approval sebelum dokumen dipakai AI.

### Kapabilitas dokumen
- Upload dokumen yang formatnya didukung repository (misalnya PDF, DOCX, TXT, MD; jangan mengklaim format yang belum tersedia).
- Manual text entry untuk SOP singkat.
- Metadata: title, type, source/issuer, owner, destination/organization scope, language, version, effective date, expiry date, review date, tags, confidentiality, reviewer, checksum.
- Upload validation: MIME, file signature, size, filename normalization, antivirus/scanning bila tersedia.
- Duplicate detection via checksum.
- Extraction/parse status dan error detail.
- Preview extracted text dan metadata sebelum submit review.
- Chunk preview, page/section references.
- Status lifecycle dan version history.
- Approve, reject with reason, publish, supersede, withdraw, expire.
- Re-index/re-embed per version.
- Reprocess failed jobs.
- Audit trail untuk uploader, reviewer, timestamp, dan perubahan.
- Search/filter berdasarkan area, tipe, status, date, language.

### Workflow
`DRAFT → UPLOADED → PROCESSING → NEEDS_REVIEW → IN_REVIEW → APPROVED → PUBLISHED`.

Terminal/exception states: `REJECTED`, `FAILED`, `EXPIRED`, `WITHDRAWN`, `SUPERSEDED`.

### Governance rules
- Dokumen yang diunggah tidak otomatis aktif sebagai sumber EcoGuide.
- Hanya `PUBLISHED` dan effective documents yang bisa diretrieve.
- Dokumen yang expired/withdrawn harus dikecualikan dari retrieval aktif.
- Perubahan konten membentuk versi baru.
- Retrieved text diperlakukan sebagai data tidak tepercaya, bukan instruksi model.
- Admin uploader tidak otomatis menjadi reviewer/approver jika separation-of-duties policy berlaku.
- Sediakan source provenance dan izin publikasi.

### Acceptance criteria
- Admin dapat upload, melihat status processing, preview, submit review, dan melacak hasil.
- Dokumen belum approved tidak muncul dalam jawaban EcoGuide.
- Dokumen expired/withdrawn tidak diambil sebagai sumber aktif.
- Citation mengarah ke versi dokumen yang benar.
- File invalid, terlalu besar, duplikat, atau gagal parse ditangani jelas.

## E3. Kedas EcoGuide — Hybrid RAG dan Local Knowledge Intelligence

### Tujuan
Meningkatkan pencarian dari exact lexical matching menjadi retrieval yang mampu menangani sinonim dan pertanyaan multi-bahasa, tanpa kehilangan kontrol scope dan kualitas sitasi.

### RAG pipeline
1. Resolve actor/session, destination, organization, locale, visibility scope.
2. Validate query length, content, rate limit, and prompt injection patterns.
3. Normalize query tanpa menghilangkan istilah lokal penting.
4. Determine intent: sorting, service availability, schedule, facility acceptance, policy, education, unsupported/out-of-scope.
5. Retrieve lexical candidates.
6. Retrieve dense vector candidates jika vector store/provider tersedia.
7. Apply metadata/authorization filters sebelum context masuk ke model.
8. Merge/deduplicate candidate sets.
9. Rerank berdasarkan relevance, document status, effective date, scope specificity, dan freshness.
10. Build prompt dengan source ID, chunk ID, page/section, document version.
11. Generate structured answer.
12. Validate schema dan citation IDs.
13. Verify setiap citation memang termasuk retrieved chunks dan relevan dengan claim.
14. Apply grounding/abstention policy.
15. Return response + evidence + limitation + feedback controls.
16. Log prompt/model/retrieval version dan metrics tanpa menyimpan PII tidak perlu.

### Hybrid retrieval design
- Pertahankan lexical search sebagai jalur baseline/fallback.
- Tambahkan vector store (contoh pgvector) hanya setelah mengecek PostgreSQL version, extension availability, deployment support, migration, dan backup implications.
- Jangan mengasumsikan pgvector sudah aktif hanya karena direkomendasikan.
- Pilih embedding model melalui provider adapter; simpan provider/model/version/dimension.
- Pastikan model embedding query dan dokumen kompatibel.
- Jika vector provider unavailable, gunakan lexical fallback dan beri status internal; jangan menghasilkan jawaban seolah semantic retrieval berjalan.
- Reranker dapat berupa model/provider atau scoring deterministik; pilih berdasarkan benchmark dan latency.

### Multilingual/local knowledge
- Bahasa utama: Indonesia.
- Bahasa Inggris: dukung terutama untuk wisatawan.
- Bahasa Bali/istilah lokal: tambahkan hanya dari glossary/dataset yang divalidasi penutur atau sumber tepercaya.
- Jangan menerjemahkan istilah adat/ritual secara bebas jika dapat mengubah makna.
- Simpan language dan translation provenance.

### Response contract konseptual
```json
{
  "status": "ANSWERED | NEEDS_CLARIFICATION | ABSTAINED | TEMPORARILY_UNAVAILABLE",
  "answer": "string",
  "destination_context": {"id": "...", "name": "..."},
  "citations": [
    {"document_id": "...", "version": "...", "chunk_id": "...", "title": "...", "section": "...", "effective_date": "...", "source_uri": "..."}
  ],
  "limitations": ["..."],
  "confidence_band": "HIGH | MEDIUM | LOW | NOT_ASSESSED",
  "suggested_next_actions": ["..."],
  "interaction_id": "..."
}
```
Gunakan schema aktual yang telah ada jika kompatibel; jangan menambah kontrak duplikat tanpa kebutuhan.

### Abstention rules
- Tidak ada source relevan.
- Sumber konflik/tidak berlaku.
- Pertanyaan meminta diagnosis/legal certification/penanganan B3 yang tidak didukung.
- Scope kawasan tidak jelas dan jawaban berbeda antarwilayah.
- Citation validation gagal.
- Pertanyaan membutuhkan data real-time yang stale/tidak tersedia.

### Feedback and learning loop
- Helpful/not helpful dengan alasan.
- Flag informasi kedaluwarsa/salah.
- Human reviewer dapat menghubungkan feedback ke knowledge source.
- Feedback tidak otomatis melatih model atau mempublikasikan dokumen.

### Evaluation
Bangun gold set awal 100–200 pertanyaan bila sumber daya memungkinkan. Pisahkan train/dev/test untuk retrieval tuning. Sertakan ID/EN, sinonim, istilah lokal tervalidasi, typo, pertanyaan multi-hop, pertanyaan spesifik destination, sumber konflik, dokumen expired, dan no-answer questions.

Ukur:
- Recall@K, Precision@K, MRR atau nDCG;
- citation correctness;
- answer groundedness;
- factual consistency;
- abstention precision/recall;
- language robustness;
- latency p50/p95 dan cost per request.

Lakukan eksperimen baseline lexical vs hybrid pada pertanyaan yang sama. Target seperti recall >94% hanya boleh disebut target uji sampai hasil terukur tersedia.

## E4. Kedas Vision — Waste Recognition & Sorting Assistant

### Tujuan
Meningkatkan kualitas saran klasifikasi material dari foto dan membuat hasilnya relevan dengan taxonomy serta acceptance rule kawasan.

### Input validation
- Format dan ukuran file dibatasi.
- Validasi MIME + signature, bukan ekstensi saja.
- Strip EXIF/metadata sensitif.
- Re-encode image bila diperlukan.
- Batasi resolusi dan file size.
- Simpan image private; akses melalui signed URL berumur pendek untuk role berizin.
- Tolak file rusak, unsupported, atau berpotensi berbahaya.
- Jangan kirim identitas/PII yang tidak dibutuhkan ke provider AI.

### Classification flow
1. User memilih/menegaskan destination.
2. Upload foto dan input opsional (deskripsi, sumber, kondisi).
3. Backend memvalidasi dan menyimpan private image reference.
4. AI menghasilkan candidate classes dan confidence/logits sesuai provider capability.
5. Backend memetakan hasil ke active Kedas material taxonomy.
6. Backend mengambil acceptance rules dari destination/facility context.
7. Generate preparation guidance hanya dari aturan/sumber yang valid.
8. Tampilkan candidate, uncertainty, visual explanation yang tersedia, dan caveat.
9. User/petugas mengonfirmasi atau mengoreksi.
10. Simpan AI assessment terpisah dari final verified category.
11. Feedback/correction dapat masuk evaluation dataset setelah consent dan review.

### Output fields
- assessment ID;
- candidate category/subcategory;
- confidence value atau confidence band (jelaskan apakah calibrated);
- alternative candidates;
- contamination observation (hanya bila dapat diamati, bukan kepastian);
- image quality flag;
- unknown/out-of-distribution flag;
- local acceptance guidance;
- preparation guidance;
- needs human review;
- model/version and timestamp.

### Mandatory safety behavior
- Jika confidence rendah, kelas tidak dikenal, banyak objek, gambar buram, pencahayaan buruk, atau objek tertutup: tampilkan `NEEDS_CONFIRMATION`/`UNSURE`.
- Jangan memaksa satu kelas.
- Jangan memberi instruksi penanganan limbah berbahaya jika sumber/kompetensi tidak tersedia; arahkan ke prosedur resmi/petugas berwenang.
- Jangan menentukan berat, nilai jual, kandungan kimia, tingkat bahaya, atau kelayakan daur ulang final hanya dari gambar.
- Confidence model tidak boleh disebut probabilitas benar jika belum dikalibrasi.

### Dataset and benchmark
- Audit apakah dataset internal benar-benar tersedia.
- Rencana 500 foto lokal Bali adalah target kurasi awal, bukan dataset yang boleh diklaim ada.
- Buat data card: sumber, lisensi/consent, kategori, distribusi kelas, kondisi gambar, tanggal, annotator, agreement, split, potensi bias.
- Pisahkan train/validation/test dan cegah image leakage antar split.
- Ukur macro-F1, per-class precision/recall, confusion matrix, calibration, OOD detection, latency, dan rejection rate.
- Jangan mengoptimalkan hanya overall accuracy jika kelas tidak seimbang.

### Acceptance criteria
- Invalid upload ditolak dengan benar.
- Prediksi dan final user confirmation tersimpan terpisah.
- Unknown/low-confidence flow berjalan.
- Acceptance guidance mengikuti destination context.
- Evaluation report dapat direproduksi dari dataset version/model version.

## E5. Operations Copilot — Actionable Decision Intelligence

### Tujuan
Mengubah rekomendasi AI yang saat ini berakhir pada toast menjadi workflow tindakan yang dapat ditinjau, diedit, divalidasi, dikonfirmasi, dieksekusi melalui domain API, dan diaudit.

### Use cases prioritas
1. Facility overload/capacity risk.
2. Service request overdue/backlog.
3. Material acceptance mismatch.
4. Pickup vs facility intake weight discrepancy.
5. Contamination trend.
6. Facility downtime/maintenance impact.
7. Material stock/demand mismatch.
8. Destination DCLI dimension deterioration.

Implementasikan use case yang didukung oleh tabel, endpoint, dan data aktual. Untuk use case tanpa data memadai, tampilkan `INSUFFICIENT_DATA` dan jangan mengarang analisis.

### Analysis pipeline
1. Resolve destination and authorized organization scope.
2. Read relevant operational snapshot melalui allowlisted tools.
3. Validate freshness, completeness, and period.
4. Detect deterministic anomalies/rules first.
5. Provide structured evidence to LLM for explanation and alternative generation.
6. Generate recommendation with `issue`, `evidence`, `reasoning_summary`, `options`, `expected_effect`, `risk`, `confidence`, `limitations`.
7. Validate schema and referenced IDs.
8. Create draft action proposal, not direct mutation.
9. Open preview form with prefilled fields.
10. Revalidate current data and permissions on submit.
11. Require authorized human confirmation.
12. Execute only through existing domain command/service.
13. Record audit event and idempotency key.
14. Re-read resulting state and compare before/after.
15. Link result back to original recommendation.

### Typed action proposal
Use a strict discriminated union/allowlist such as:
- `ADJUST_SERVICE_SLOT`;
- `CREATE_STAFF_TASK`;
- `REQUEST_FACILITY_REVIEW`;
- `PROPOSE_ALTERNATE_FACILITY`;
- `CREATE_MAINTENANCE_NOTICE`;
- `REQUEST_MATERIAL_RECHECK`.

Only include actions supported by existing authorized domain APIs. Never allow arbitrary endpoint, SQL, code, URL, or shell command from LLM output.

### Proposal states
`GENERATED → VALIDATING → READY_FOR_REVIEW → APPROVED → EXECUTING → COMPLETED`.

Alternative states: `NEEDS_EDIT`, `REJECTED`, `EXPIRED`, `STALE`, `FAILED`, `CANCELLED`.

### Safety and concurrency
- Backend performs final RBAC/tenant/destination checks.
- Capacity and facility rules are re-evaluated at execution time.
- If source data changed, mark proposal `STALE` and regenerate/refresh preview.
- Idempotency prevents duplicate task/stock movement.
- Concurrency-sensitive writes use transaction/locking patterns consistent with existing domain.
- Reversal uses domain-supported compensating action; never delete audit history.
- Human confirmation must identify what will change and affected records.

### Copilot UI
- Issue summary and severity.
- Evidence drawer with metric, period, source records, freshness.
- Explanation and uncertainty.
- Option comparison.
- Proposed action card.
- Prefilled editable preview modal/drawer.
- Validation results and blockers.
- Confirm / reject / edit / defer actions.
- Post-action status and before-after comparison.

### Success metrics
- recommendation-to-preview conversion;
- recommendation acceptance/edit/rejection rate;
- time-to-action;
- action success/failure rate;
- stale proposal rate;
- policy violation count (target zero);
- outcome verification coverage.

Jangan menggunakan acceptance rate sebagai satu-satunya metrik kualitas; rekomendasi yang ditolak dapat menjadi keputusan benar.

## E6. Facility Intelligence & Deterministic Eligibility

### Kapabilitas
- Facility profile, active status, service area, categories accepted.
- Time-based capacity (daily/shift/window) jika data tersedia.
- Current occupied/available capacity.
- Operating hours, maintenance/downtime, restrictions.
- Incoming schedule and queue.
- Equipment status jika dicatat.
- Intake log, rejection reason, processing status.
- Alerts for near-capacity/overload.
- Alternative facility candidates.
- Facility data freshness and last verified time.

### Eligibility engine
**Hard constraints first:**
1. facility belongs to/serves relevant destination or approved service area;
2. category/subcategory accepted;
3. facility active and available for requested time;
4. capacity sufficient (or explicit split-load policy exists);
5. necessary processing/handling capability exists;
6. maintenance/policy/safety restriction absent;
7. requested schedule is valid.

Only eligible facilities are ranked. Ranking may consider capacity headroom, queue, material suitability, operating time, and route distance only if reliable routing/distance data exists. Do not fabricate travel time or distance.

### Output
- eligible/ineligible;
- reason codes for hard-constraint failures;
- capacity snapshot timestamp;
- matching rule/version;
- ranking explanation;
- unknown/missing data;
- suggested operator action.

LLM may explain the result, but cannot override a failed hard constraint.

## E7. Green Hospitality Ledger / `/hospitality`

### Tujuan
Memberikan workspace mandiri bagi hotel, restoran, vila, dan usaha pariwisata untuk mencatat pengelolaan sampah serta mengakses bukti layanan.

### Role dan tenancy
Audit model role/membership existing. Jangan menambah global role baru jika membership organisasi dapat digunakan. Minimal permission konseptual:
- organization owner/admin;
- waste coordinator/operator;
- report viewer/auditor.

Semua query harus tenant-scoped server-side. User organisasi A tidak boleh membaca atau mengubah data organisasi B.

### Fitur workspace
1. Organization profile dan locations.
2. Daily waste log per tanggal, lokasi, activity/source, kategori, berat/satuan, metode input, source type.
3. Self-reported vs staff-verified vs facility-verified status.
4. Foto/bukti opsional dengan privacy control.
5. Contamination/quality notes.
6. Collection request dan status.
7. Facility intake dan Waste Passport references.
8. Service agreement/partner record jika entity existing mendukung.
9. Monthly/quarterly report.
10. Export PDF/CSV sanitized.
11. Multi-location overview jika didukung tenancy model.
12. Data completeness reminder.

### AI assistance
- Weekly/monthly waste pattern summary.
- Detect unusual/missing logs, clearly labelled as anomaly candidates.
- Suggestions to improve segregation based on category trends and local acceptance rules.
- Forecast only when enough time-series data exists; otherwise label as exploratory/not available.
- Report narrative generated from immutable verified/self-reported metric snapshot.

### Reporting rules
Pisahkan `self_reported`, `collected`, `facility_received`, `processed`, `sold/handed_over`, `residual`. Jangan menyebut semuanya recycled/diverted. Report bukan sertifikat kepatuhan atau audit resmi.

### Acceptance criteria
- Organization isolation test passed.
- Daily log validation and duplicate protection work.
- Reports show provenance and status labels.
- AI narrative values exactly match supplied metric snapshot.

## E8. Community EcoLoop

### Tujuan
Mendukung koordinasi komunitas dan program kebersihan berbasis kawasan, tanpa berubah menjadi social network yang penuh fitur tidak relevan.

### Fitur
- Community/destination profile.
- Program/campaign creation dengan scope, period, objective, organizer, status.
- Activity calendar.
- Participant registration sesuai privacy policy.
- Waste sorting/cleanup event records.
- Task assignment bila task module sudah tersedia.
- Issue/report submission (illegal dumping/overflow/service problem) dengan moderation, location precision controls, photo safety, dan status.
- Announcement/education content yang terikat CDOA dan knowledge source.
- Program progress metrics.
- Aggregate participation and outcome report.
- Community feedback and escalation.

### Rules
- Hindari leaderboard yang mempermalukan atau mengekspos data individu.
- Jangan tampilkan lokasi pribadi secara presisi ke publik tanpa dasar/consent.
- Bedakan laporan warga (unverified) dari temuan verified petugas/admin.
- Moderasi laporan yang mengandung PII, tuduhan, atau foto sensitif.
- Event participation bukan bukti bahwa sampah benar-benar diproses; hubungkan dengan evidence bila ada.

## E9. Guest Green Companion

### Tujuan
Memberikan pengalaman ringan bagi wisatawan tanpa memaksa registrasi.

### Fitur
- Destination landing page.
- Bahasa Indonesia/Inggris.
- QR access yang membawa destination context dengan token/slug publik aman.
- Etika lingkungan dan local guidance.
- Cara memilah material pada fasilitas/akomodasi.
- Public collection/service information.
- EcoGuide guest mode dengan rate limits.
- FAQ dan citation/source panel.
- Report issue tanpa harus login jika kebijakan mengizinkan, dengan anti-spam.
- Accessibility, mobile responsive, low-bandwidth optimization.

### Privacy
- Guest session tidak boleh mengakses data akun atau transaksi personal.
- Public destination data hanya field yang disetujui.
- Avoid tracking invasive; analytics harus privacy-respecting.
- Jangan menyimpan percakapan sensitif lebih lama dari retention policy.

## E10. Digital Waste Passport, Traceability & Mass Balance

### Tujuan
Menghubungkan sumber material dengan proses pengangkutan, penerimaan, pemilahan, pengolahan, penjualan/serah-terima, dan residu berdasarkan event yang dapat ditelusuri.

### Event chain konseptual
`SOURCE_REGISTERED → COLLECTION_REQUESTED → PICKED_UP → FACILITY_RECEIVED → SORTED → PROCESSED / STORED → SOLD_OR_HANDED_OVER / RESIDUAL_ROUTED`.

Gunakan status/event aktual yang sudah ada. Jangan mengganti enum hanya demi diagram.

### Required event evidence
- event ID dan timestamp;
- actor/organization;
- source/destination/facility reference;
- material category;
- measured weight/unit;
- measurement method/device if known;
- evidence/photo reference;
- verification status;
- source type: estimated/self-reported/field-weighed/facility-weighed;
- previous event link;
- correction/supersession link.

### Mass balance
- Input weight harus direkonsiliasi terhadap output material categories, process loss, inventory, dan residual.
- Formula dan tolerance harus mengacu aturan domain yang sudah digunakan.
- Jangan mengubah nilai transaksi lama; koreksi melalui adjustment event dan reason.
- Alert selisih hanya jika denominator dan data valid.
- Audit discrepancy thresholds dan jangan mengarang toleransi 5% atau 15%; gunakan konfigurasi existing/decision register.

### Carbon/impact estimates
- Audit sumber emission factor, unit, geography, material type, baseline scenario, system boundary, uncertainty, and version.
- Jangan menerapkan satu faktor 1.82 kg CO2e/kg ke seluruh kategori tanpa bukti metodologis.
- Tampilkan faktor, sumber, versi, dan label `estimated`.
- Jika metodologi tidak ada, tampilkan mass/flow facts saja dan tandai carbon estimate unavailable.

### Acceptance criteria
- Passport history bersumber dari event backend.
- Perbaikan/correction tidak menghapus event history.
- Recycled claim membutuhkan evidence handover/process sesuai definisi.
- Mass balance dapat direproduksi.
- Data estimated dan verified dibedakan secara visual dan API.

## E11. Circular Demand Board

### Tujuan
Menghubungkan pasokan material terpilah dengan permintaan buyer/recycler, hanya bila data partner dan supply benar-benar tersedia.

### Fitur inti bila backend mendukung
- Supplier/facility organization profile.
- Material specification/taxonomy, grade, contamination limits.
- Available stock/batch references.
- Buyer demand, minimum quantity, acceptance terms, location, validity.
- Match candidates.
- Request quotation/interest.
- Offer/negotiation status.
- Handover/pickup scheduling.
- Evidence timbang dan receipt.
- Transaction status and dispute handling.

### Matching
Gunakan filter deterministik untuk category/spec/quality/quantity/region/status. AI boleh merangkum kandidat dan membantu menulis penawaran, tetapi tidak menetapkan harga/kontrak atau membuat komitmen pembelian secara otomatis.

### Scope control
Jika belum ada buyer nyata atau partner consent, buat workflow internal/demo yang berlabel SIMULATED dan jangan tampilkan daftar buyer palsu seolah mitra resmi. Fitur marketplace penuh dapat ditunda setelah core workflow.

## E12. DCLI — Destination Clean Loop Index & Environmental Analytics

### Tujuan
Menyajikan formula DCLI yang sudah tersedia di backend secara transparan, interaktif, dan mudah ditindaklanjuti.

### Wajib audit terlebih dahulu
- Formula aktual di backend.
- Empat dimensi dan bobot aktual.
- Denominator dan missing data behavior.
- Time period, aggregation, and scope.
- Versioning formula.
- Unit, rounding, and data provenance.

Jangan mengganti formula atau bobot tanpa keputusan produk yang dicatat. Jangan menganggap satu nilai DCLI sebagai sertifikasi atau rating resmi pemerintah.

### Dashboard features
- Overall score/value sesuai formula backend.
- Radar chart empat dimensi.
- Dimension breakdown and definition drawer.
- Time trend.
- Compare period (same destination).
- Compare destination hanya bila metode dan data comparable.
- KPI cards.
- Underlying metric table.
- Data coverage/completeness indicator.
- Source and last updated timestamp.
- Filter destination/period.
- Drill-down ke data agregat atau bukti berizin.
- Download report sanitized.

### Interpretation
- Tampilkan status data tidak lengkap.
- Hindari interpretasi green/yellow/red jika thresholds belum disepakati.
- Jangan tampilkan false precision.
- Jelaskan bahwa skor internal Kedas adalah indikator analitik, bukan sertifikasi.

## E13. Offline-First Staff Capture

### Tujuan
Mengurangi risiko data lapangan hilang saat koneksi internet terputus. Ini pengembangan web/PWA terbatas, bukan target membangun native mobile.

### Scope awal
- Draft inspection;
- draft weight input;
- draft contamination checklist;
- photo evidence queue (jika storage policy mendukung).

### Architecture
- IndexedDB outbox;
- service worker hanya jika kompatibel dengan stack/hosting;
- UUID per local event;
- idempotency key;
- retry with exponential backoff and jitter;
- sync status UI;
- conflict resolution state;
- server-side final validation.

### Sync lifecycle
`LOCAL_DRAFT → QUEUED → SYNCING → SYNCED` dengan state alternatif `CONFLICT`, `FAILED`, `NEEDS_REVIEW`.

### Conflict rules
- Jangan gunakan last-write-wins untuk berat, status final, stock, atau transaksi.
- Bila data server berubah, tampilkan conflict detail dan minta actor berwenang review.
- Simpan device timestamp dan server received timestamp.
- Jangan menganggap local queued item sebagai transaksi committed.
- Logout/tenant switch harus mencegah data lokal tertukar antar akun.

### Prioritas
Implementasikan setelah fitur kompetisi P0 stabil kecuali audit runtime menunjukkan konektivitas merupakan blocker utama demo/pilot.

## E14. AI Governance, Observability & Evaluation Platform

### AI interaction observability
Catat dengan privacy guard:
- interaction ID;
- capability;
- actor/anonymous session identifier yang minimal;
- destination/org scope;
- provider/model/version;
- prompt version;
- retrieval/embedding/reranker version;
- latency dan token/cost bila tersedia;
- status, error class;
- citation/source IDs;
- confidence fields yang relevan;
- user feedback.

Jangan log full PII, private uploads, secret, atau seluruh prompt context tanpa kebutuhan dan retention policy.

### Evaluation harness
- Dataset versioning.
- Prompt/model/embedding versioning.
- Deterministic regression test.
- Offline benchmark script.
- Human review rubric.
- Comparison report.
- Failure case registry.
- Release gate threshold per capability.

### AI safety controls
- Prompt injection defense.
- Retrieved content treated as untrusted data.
- Tool allowlist.
- Schema validation.
- PII minimization/redaction.
- Rate limiting and abuse controls.
- Provider timeout/retry/fallback.
- Output moderation sesuai domain risk.
- Audit and incident handling.

## E15. UX, Visual System and Accessibility

### Design goals
- Professional competition-grade dashboard.
- Clear information hierarchy.
- AI state and evidence are visible.
- Responsive desktop/tablet/mobile web.
- Fast workflows for operator.
- Calm, trustworthy visual design; avoid excessive cyber/AI decoration.

### Common AI interaction pattern
1. User input and context preview.
2. Processing state (retrieve/analyze/classify/validate) without exposing hidden chain-of-thought.
3. Result summary.
4. Evidence/source/confidence/limitations.
5. Suggested next action.
6. Feedback and report issue.

### Required states
- idle;
- loading/progress;
- success;
- partial result;
- no result/abstain;
- invalid input;
- provider unavailable;
- timeout;
- permission denied;
- stale data;
- sync pending;
- conflict;
- rate limited.

### Motion and accessibility
- Reuse current Kedas Design System tokens.
- Maintain keyboard navigation, visible focus, semantic landmarks, labels, contrast, and screen-reader announcements.
- Honor `prefers-reduced-motion`.
- Motion should explain system state, not decorate every component.
- Avoid auto-playing distracting animation and avoid hiding content during transitions.
- Chart must have accessible textual/table alternative.

---

# F. MASTER EXECUTION PLAN — 10 TAHAP

# TAHAP 1 — FULL REPOSITORY DISCOVERY, BASELINE REPRODUCTION & CLAIM VALIDATION

## Objective
Memastikan kondisi sistem terkini benar-benar diketahui sebelum implementasi, mereproduksi baseline test, dan menginventarisasi seluruh gap yang perlu ditangani.

## Required actions
1. Inspect repository tree, git status, active branch, package manifests, Python environment, environment examples, and deployment config.
2. Locate PRD, SRS, HDD, Design System, AI Runtime Prompt Library, prior implementation prompts, audit report, feature backlog, evidence index, and ADRs.
3. Build route inventory (public, citizen, staff, admin, hospitality, guest) from actual Next.js app tree.
4. Build API inventory from FastAPI routers/OpenAPI.
5. Build ORM/migration inventory from SQLAlchemy/Alembic.
6. Map existing role, global role, organization membership, destination scope, and permission policy.
7. Map current AI provider adapter, model config, prompt assembly, EcoGuide retrieval, Vision flow, Copilot flow, logging, and tests.
8. Trace all seven audit gaps to exact code and reproduce them where safe.
9. Run backend/frontend build/type/test/lint commands found in repository. Do not guess command names; inspect scripts/config.
10. Run runtime smoke tests in local/test environment if credentials/config are available.
11. Record environmental blockers honestly (provider secrets, database unavailable, missing seed).
12. Search for detailed 16-item backlog and supporting audit artifacts. If absent, use only findings actually available and mark missing artifact.
13. Verify claims in report: endpoint count, table count, test count, build routes, AI security tests, DCLI formula, Waste Passport carbon factor.
14. Establish test baseline and note pre-existing failures separately from new failures.

## Deliverables
- `KEDAS_AS_BUILT_BASELINE.md`
- `KEDAS_CURRENT_ROUTE_API_DATA_INVENTORY.csv` or equivalent
- `KEDAS_BASELINE_TEST_RESULTS.md`
- `KEDAS_CLAIM_REGISTER.md`
- updated `KEDAS_IMPLEMENTATION_PROGRESS.md`

## Quality gate
- All main modules are mapped to actual paths.
- Each audit gap has code evidence or is explicitly marked not reproducible.
- Baseline tests/build have been attempted and outputs recorded.
- No application code changed in this stage except harmless instrumentation needed for local verification (prefer none).
- Stage status recorded and agent proceeds automatically.

# TAHAP 2 — SHARED DESTINATION CONTEXT, DYNAMIC SERVICE AREA & CDOA

## Objective
Menyelesaikan GAP-001 dan membangun shared area context yang digunakan seluruh fitur AI dan workflow.

## Required actions
1. Audit existing destination/service-area/CDOA entities and API.
2. Define canonical destination context resolver using existing IDs and membership model.
3. Connect `/area-layanan` to actual API.
4. Replace static cards/status with typed API-driven UI.
5. Implement loading, error, empty, stale, not found, and closed states.
6. Add public/private field shaping; never expose internal capacity or contact fields unless intended public.
7. Implement or complete admin CDOA draft/preview/publish workflow if data model allows.
8. Preserve effective date/version history.
9. Implement cache invalidation/revalidation after change.
10. Expose destination context to EcoGuide, Vision, Copilot, facility engine, hospitality, and Guest Companion through backend resolver.
11. Add timezone-aware schedule handling; confirm destination timezone from configuration.
12. Add tests for role boundaries and destination isolation.

## UI deliverables
- Public area list/detail.
- Area status/service schedule.
- CDOA details and version date.
- Admin preview/publish interface if scope is supported.
- Stale data warning and last updated.

## Test cases
- valid area;
- no area;
- inactive/closed area;
- API timeout;
- stale cache;
- unauthorized admin action;
- destination membership mismatch;
- timezone/day-boundary edge case;
- publish then public refresh.

## Quality gate
- no hardcoded operational service-area cards;
- all public area values come from API;
- published CDOA is versioned and scoped;
- AI context resolver can resolve selected destination securely;
- tests and type/build pass.

# TAHAP 3 — KNOWLEDGE ADMINISTRATION, DOCUMENT GOVERNANCE & HYBRID RAG FOUNDATION

## Objective
Menyelesaikan GAP-007 dan membangun fondasi knowledge governance yang mendukung EcoGuide.

## Required actions
1. Audit existing `/api/v1/ai/knowledge` contract, models, parser, storage, and permissions.
2. Reuse existing endpoints and entities; add only missing fields/entities.
3. Build `/admin/pengetahuan` workspace (or route convention actually used).
4. Implement upload/manual entry, metadata form, preview, processing status, review, approval, publish, supersede, withdraw, and version history.
5. Validate MIME/file signature/size/filename and duplicate checksum.
6. Add ingestion job status and user-friendly error state.
7. Ensure non-published docs are excluded from public retrieval.
8. Add reviewer/approver permission and audit log.
9. Implement chunking preserving title, page/section, and provenance.
10. Verify PostgreSQL/extension/deployment feasibility before pgvector migration.
11. Build embedding adapter compatible with existing dual-mode provider adapter.
12. Implement lexical + dense retrieval candidate generation and deterministic merge/rerank baseline.
13. Filter destination, organization, publication status, and effective dates before generation.
14. Preserve lexical fallback if vector component is unavailable.
15. Add index migration only after local disposable DB test.
16. Add knowledge version and embedding version traceability.
17. Add benchmark question set infrastructure and baseline result capture.

## Deliverables
- Knowledge admin UI.
- Document lifecycle and governance.
- Ingestion status observability.
- Hybrid retrieval service (or documented staged implementation if vector dependencies unavailable).
- Evaluation dataset schema and starter question set, with all generated examples marked synthetic.
- Admin user guide.

## Quality gate
- Admin can manage knowledge entirely through web (no direct API call needed).
- Only approved/published/effective docs retrieved.
- Citations reference exact document version/chunk.
- Invalid/malicious upload cases rejected safely.
- Retrieval baseline vs hybrid evaluation is reproducible.
- No secret in browser bundle.

# TAHAP 4 — KEDAS ECOGUIDE: GROUNDED, MULTILINGUAL & CONTEXT-AWARE ASSISTANT

## Objective
Mengoptimalkan EcoGuide dari lexical Q&A menjadi local knowledge intelligence dengan sitasi dan abstention yang terukur.

## Required actions
1. Refactor/extend query pipeline based on Stage 3 retrieval.
2. Add destination/organization-aware query context.
3. Add intent classification or deterministic routing for common question categories.
4. Add ambiguity clarification when destination/material/service context is missing.
5. Add structured response schema and strict validation.
6. Add citation validator tied to retrieved chunks.
7. Add effective-date and scope-aware source presentation.
8. Add no-answer and conflicting-source handling.
9. Add feedback controls and admin feedback review queue.
10. Add conversation continuity with bounded history and privacy controls.
11. Add prompt injection tests for user query and retrieved document instructions.
12. Add ID/EN evaluation coverage; local Bali terminology only from verified glossary.
13. Add loading/progress, source drawer, answer limitations, retry and provider unavailable UI.
14. Ensure Guest mode sees only public knowledge.
15. Capture quality metrics and compare with lexical baseline.

## UI acceptance
- Answer and citation visually separated.
- Each citation reveals title, source owner, version, effective date, section/page.
- Low evidence answer clearly says information not found.
- User can report outdated/incorrect source.
- Guest and authenticated experiences enforce correct scope.

## Quality gate
- Citation IDs are validated server-side.
- No unsupported citation can render.
- Expired/unpublished documents are excluded.
- Abstention tests pass.
- AI unavailable state does not return false success.
- Evaluation report contains real measured outcomes or clearly reports unavailable data.

# TAHAP 5 — KEDAS VISION: ROBUST CLASSIFICATION, UNCERTAINTY & LOCAL ACCEPTANCE GUIDANCE

## Objective
Meningkatkan Vision agar klasifikasi foto transparan, aman, terkait taxonomy, dan relevan dengan aturan fasilitas lokal.

## Required actions
1. Audit current vision endpoint, model/provider, taxonomy, file storage, and UI.
2. Establish canonical taxonomy mapping with accepted/rejected/unknown states.
3. Implement secure image validation and metadata stripping.
4. Add image quality checks where technically supportable.
5. Return multiple candidates/uncertainty according to model capability.
6. Add unknown/OOD/low-confidence flow.
7. Resolve destination/facility acceptance rules via backend context.
8. Generate handling guidance from verified rules/knowledge; do not invent material safety instructions.
9. Separate AI assessment and human confirmed category.
10. Store model version, taxonomy version, source image ref, prediction, confidence, confirmation, correction.
11. Build feedback review/evaluation export.
12. Prepare data card and dataset versioning. Curate local images only if consent/licence and actual data are available.
13. Benchmark class distribution, macro-F1, per-class metrics, calibration, OOD, rejection rate, latency.
14. Add AI states and comparison candidate UI.
15. Ensure no image-derived weight, price, chemical composition, or safety certification.

## Quality gate
- invalid upload securely rejected;
- low confidence/unknown path functional;
- final category requires confirmation where policy says;
- acceptance guidance comes from selected destination rules;
- benchmark is reproducible and limitations visible;
- no accuracy claim without dataset/evaluation evidence.

# TAHAP 6 — FACILITY INTELLIGENCE & ACTIONABLE OPERATIONS COPILOT

## Objective
Menyelesaikan GAP-002 dan menghubungkan operational analytics dengan typed action proposal yang aman.

## Required actions
1. Audit existing facility capacity logic, operational data, anomaly rules, Copilot prompts, tools, and `/admin/laporan` UI.
2. Centralize deterministic facility eligibility rules.
3. Define hard constraints and ranking only for eligible facilities.
4. Add data freshness/completeness to facility snapshot.
5. Add rule-based detectors for overload, overdue request, acceptance mismatch, weight discrepancy, downtime, and stock/demand anomaly where data exists.
6. Use LLM only to explain evidence and generate options, not to create facts.
7. Define typed recommendation/action proposal schema.
8. Implement recommendation IDs and evidence references.
9. Add action proposal lifecycle and stale proposal checks.
10. Replace toast-only CTA with prefilled editable action preview.
11. Validate role, tenant, destination, current capacity, entity state, and action allowlist server-side.
12. Require human confirmation.
13. Execute through existing domain service/API only.
14. Implement idempotency and transaction safety.
15. Write audit log linking source recommendation, actor, command, result, and outcome.
16. Re-fetch post-action state and display before-after.
17. Add rejection/edit/defer reasons and feedback loop.
18. Add `what-if` scenarios only from deterministic simulation inputs. Label estimated results and assumptions.
19. Never create unrestricted LLM tools, raw SQL, generic action executor, shell, or arbitrary endpoint calling.

## Required UI
- operational insight list;
- severity and detected time;
- metric/evidence drawer;
- freshness label;
- recommendation comparison;
- prefilled draft action;
- validation errors and blockers;
- confirmation summary;
- final transaction reference;
- before-after outcome.

## Quality gate
- Copilot recommendation can create a real typed draft.
- invalid/stale/unauthorized proposals cannot execute.
- duplicate confirmation does not duplicate action.
- all mutations go through domain services.
- audit record can be traced.
- LLM output cannot override deterministic facility rules.
- no action occurs without required human confirmation.

# TAHAP 7 — GREEN HOSPITALITY WORKSPACE, COMMUNITY ECOLOOP & GUEST COMPANION

## Objective
Menyelesaikan GAP-004 dan memastikan web mendukung konteks Community & Green Tourism.

## 7.1 Hospitality Workspace

Required actions:
1. Audit marketplace/B2B organization models and current tenant strategy.
2. Add `/hospitality` route group using existing auth/membership.
3. Provide organization/location switcher only if multi-location model exists.
4. Build dashboard, daily waste log, category breakdown, pickup/collection, evidence, Waste Passport references, and reports.
5. Clearly label self-reported, staff verified, facility received, processed, sold/handed-over, residual.
6. Add validation and duplicate prevention for daily logs.
7. Add organization-level permission matrix.
8. Add reports backed by immutable metric snapshots.
9. Add AI summary/suggestions only from scoped verified data; do not certify compliance.
10. Add tenant isolation tests for every read/write route.

## 7.2 Community EcoLoop

Required actions:
1. Audit community, program, notification, and task models.
2. Build community/destination program overview.
3. Add campaign/activity lifecycle and event calendar.
4. Add participation registration and privacy controls.
5. Add issue reporting with moderation, evidence, and verification state.
6. Build announcements/education tied to published knowledge.
7. Add progress indicators based on verified outcome data, not clicks alone.
8. Add community analytics with aggregation/minimum group size privacy where appropriate.
9. Ensure no public exposure of personal precise location or sensitive identity.

## 7.3 Guest Green Companion

Required actions:
1. Audit `/guest` and public destination routes.
2. Add QR/deep-link destination context without exposing private IDs/records.
3. Maintain ID/EN language toggle.
4. Display local sorting guide, area service info, public facility/collection info, and environmental etiquette.
5. Connect guest EcoGuide to public knowledge only.
6. Add non-login issue report only if anti-spam and privacy policy are ready.
7. Optimize low-bandwidth and mobile browser experience.
8. Add accessibility and fallback states.

## Quality gate
- hospitality tenant isolation verified;
- self-reported and verified data are distinct;
- community public/private data boundaries verified;
- Guest cannot access private records;
- all public destination data dynamic and approved;
- no unverified partner/certification claim.

# TAHAP 8 — WASTE PASSPORT, CIRCULAR MATERIAL NETWORK & DCLI ANALYTICS

## Objective
Memperdalam bukti perjalanan material dan membuat hasil operasional dapat dibaca, dibandingkan, serta dilaporkan secara jujur.

## Required actions
1. Audit current passport event model and lifecycle; reuse it.
2. Define immutable event/evidence semantics and correction flow.
3. Ensure each stage records actor, timestamp, scope, material, weight source, verification, evidence reference.
4. Make source/collection/intake/sorting/processing/handover/residual status distinguishable.
5. Add weight discrepancy reconciliation based on actual configured thresholds.
6. Add mass balance report with inputs, sorted outputs, process loss, inventory delta, sold/handed-over and residual.
7. Verify carbon factors and methodology before displaying CO2e; otherwise disable/qualify the metric.
8. Audit DCLI backend formula and dimensions.
9. Implement DCLI radar chart and dimension breakdown without duplicating formula in frontend.
10. Add time trend, data coverage, period filter, source timestamp, and definition drawer.
11. Add snapshots for reports to prevent narrative drift.
12. Build Circular Demand Board only to the level supported by real partner/demand entities.
13. Add deterministic matching by material specification, quantity, acceptance rules, geography, validity, and stock status.
14. Label simulated buyer/supply data clearly.
15. Add evidence export and sanitized reporting.

## Quality gate
- passport events trace to domain records;
- corrections preserve history;
- mass balance reproducible;
- carbon factors cited/versioned or metric disabled;
- DCLI values exactly match backend formula;
- DCLI shows data coverage and is not presented as official certification;
- marketplace does not invent buyer/stock/transaction.

# TAHAP 9 — UX POLISH, OFFLINE-FIRST (SCOPED), SECURITY, OBSERVABILITY & AI EVALUATION

## Objective
Meningkatkan pengalaman web profesional, resiliency, data safety, dan kemampuan mengukur kualitas AI.

## Required actions
1. Audit all changed screens against current Kedas Design System.
2. Improve information hierarchy, navigation, form density, responsive breakpoints, typography, and semantic status.
3. Build consistent AI components: prompt panel, source drawer, candidate list, confidence indicator, uncertainty state, action proposal, evidence timeline, feedback.
4. Implement async AI progress that communicates stages without leaking hidden reasoning.
5. Implement skeleton/error/empty/stale/provider-down/permission-denied states.
6. Add accessible chart alternatives and tables.
7. Test keyboard navigation, contrast, focus, labels, screen-reader semantics, reduced motion.
8. Audit offline capture priority with actual pilot need. If implemented, use IndexedDB queue and idempotent sync as E13; otherwise document why deferred.
9. Implement conflict UI; never imply offline queued event is committed.
10. Add AI observability with model/prompt/retrieval version, latency, usage, status, and source refs while minimizing PII.
11. Build evaluation harness for EcoGuide, Vision, Copilot.
12. Run prompt-injection, retrieval poisoning, tenant-scope, upload, rate-limit, PII and authz regression.
13. Test provider timeout/retry/fallback and malformed structured output.
14. Run performance tests for key pages/API; optimize based on measured bottleneck.
15. Confirm no provider secret leaks into browser assets.
16. Add feature flags for unfinished/experimental AI improvements.

## Quality gate
- main screens pass responsive/accessibility review;
- reduced motion honored;
- AI output can be inspected with evidence;
- all provider failures have safe fallback;
- offline events if any cannot silently duplicate;
- security regression suite passes;
- observability avoids sensitive prompt/file leakage;
- no new severe performance regression.

# TAHAP 10 — END-TO-END VALIDATION, COMPETITION DEMO & FINAL HANDOVER

## Objective
Membuktikan bahwa Kedas bekerja sebagai satu web AI platform dari konteks kawasan sampai tindakan dan pengukuran hasil.

## Required actions
1. Run full backend/frontend tests, type-check, lint, build, migration checks, and smoke tests.
2. Run complete user journeys: guest, citizen, staff, admin, hospitality, facility, community coordinator.
3. Run AI journeys: EcoGuide with valid/no-answer/expired/conflicting docs; Vision confident/low-confidence/unknown; Copilot valid/stale/unauthorized/failed action.
4. Run cross-feature context test: same destination config is reflected consistently across area page, EcoGuide, Vision acceptance guidance, and Copilot facility matching.
5. Run tenant/destination isolation tests.
6. Run mass balance and DCLI consistency tests.
7. Run provider unavailable and network interruption tests.
8. Verify seeded demo data labelled `SIMULATED` and separate from real data.
9. Prepare demo reset script and demo accounts using safe seeded identities only.
10. Create 5–7 minute demo storyline based on verified capability.
11. Prepare presentation evidence screenshots/screen recording only if tools available; never fabricate screenshots.
12. Document limitations, unsupported claims, open decisions, and post-competition backlog.
13. Verify competition eligibility/official requirements only from organizer-approved source if available; do not infer qualification.
14. Freeze final tested commit locally and record commit SHA. Do not push or deploy without authorization.

## Final deliverables
- `KEDAS_FINAL_OPTIMIZATION_REPORT.md`
- `KEDAS_AI_EVALUATION_RESULTS.md`
- `KEDAS_SECURITY_AND_PRIVACY_REVIEW.md`
- `KEDAS_REQUIREMENT_TRACEABILITY.csv`
- `KEDAS_FEATURE_OPTIMIZATION_BACKLOG.md`
- `KEDAS_DEMO_RUNBOOK.md`
- `KEDAS_CLAIM_REGISTER.md`
- `KEDAS_IMPLEMENTATION_PROGRESS.md`
- test/build logs or reproducible commands/results.

## Final quality gate
- no unresolved P0 bug in demo-critical journey;
- no known cross-tenant authorization defect;
- all AI features demonstrate their truthful scope and limitations;
- Copilot action requires valid authorization and human confirmation;
- no false claim about recycled mass, carbon, compliance, partner, or model accuracy;
- demo can run with deterministic seeded data and documented fallback;
- all regression suites pass or failures are transparently explained;
- final report distinguishes completed, partial, deferred, and blocked scope.

---

# G. PRIORITIZATION AND IMPLEMENTATION CONTROL

Gunakan prioritas berikut, namun validasi terhadap deadline aktual dan dependency repository:

## P0 — Competition-critical integrity
- Dynamic Service Area/CDOA binding.
- Knowledge Management web upload/review/publish.
- EcoGuide citations, abstention, destination scope, and hybrid retrieval foundation (hybrid vector path only after feasibility check).
- Copilot action proposal workflow with preview, validation, and human confirmation.
- DCLI visualization with formula/data coverage transparency.
- Unified area context across AI capabilities.
- AI evaluation baseline and demo evidence.

## P1 — Product completeness and robust demo
- Hospitality workspace core.
- Facility eligibility/explainability.
- Waste Passport evidence and mass-balance clarity.
- Vision confidence/unknown and evaluation dataset process.
- Community EcoLoop/Guest Green Companion refinements.
- AI feedback and observability.

## P2 — Pilot hardening / field operations
- Offline-first staff capture.
- Advanced Circular Demand Board with real partner workflows.
- Carbon methodology refinement.
- Hardware weighing integration.
- Advanced multi-destination forecasting.

## P3 — Research / advanced capabilities
- Advanced multilingual/local dialect models after validated corpus.
- Predictive demand/capacity forecasting after enough reliable time-series data.
- Advanced route optimization only if geographic/network data and field validation exist.
- Larger vision dataset and model fine-tuning after data rights/quality review.

**Do not silently drop lower-priority features.** Record them as deferred with rationale, dependency, and acceptance criteria in the backlog.

---

# H. REQUIRED QUALITY ENGINEERING

## H.1 Test layers

1. Unit tests for rules, schemas, ranking, status transitions, and calculations.
2. Integration tests for repositories, services, provider adapters, vector retrieval, file ingestion, and transactions.
3. API contract tests against OpenAPI/client schemas.
4. Authorization tests for global role, organization membership, destination scope, guest/public.
5. Frontend component and interaction tests.
6. End-to-end browser tests for critical workflows.
7. AI evaluation tests with fixed datasets and expected rubric.
8. Security tests for injection, upload, IDOR, rate limit, PII, and tool misuse.
9. Performance/load tests for high-impact pages and AI endpoints where environment permits.
10. Migration tests on disposable PostgreSQL.

## H.2 Mandatory regression cases

- API 4xx/5xx must not become mock success.
- Guest cannot read private knowledge or private tenant data.
- Cross-tenant organization access denied.
- Expired/unpublished document not retrieved.
- Unsupported claim has no citation or must abstain.
- Vision low-confidence requires confirmation.
- Copilot stale proposal cannot execute.
- Copilot action cannot execute without approval.
- Duplicate submit cannot duplicate transaction.
- Facility matching cannot include a candidate violating hard constraints.
- Weight/mass balance cannot become negative due to race condition.
- DCLI formula frontend equals backend response.
- Self-reported mass is not labelled facility-verified/recycled.
- CO2e estimate hidden or qualified if factor is missing/unverified.
- AI provider outage does not block deterministic core workflows unnecessarily.

## H.3 Performance and reliability

- Measure p50/p95 latency separately for ordinary API and AI calls.
- Add bounded timeout and retry; avoid retrying non-idempotent actions.
- Cache only public/non-sensitive data with explicit invalidation.
- Avoid caching permissions, tenant data, or dynamic capacity without strict scope/TTL.
- Optimize image size and lazy load.
- Paginate high-volume tables.
- Add loading state for AI/provider work.
- Do not invent SLA if not measured.

---

# I. DATA, PRIVACY, SECURITY & RESPONSIBLE AI

## I.1 Authorization

- Enforce permissions server-side on every read/write.
- Resolve tenant and destination scope from authenticated context and verified membership.
- Never trust `organization_id`, `destination_id`, `role`, or `actor_id` sent by client without server validation.
- Protect object references against IDOR.
- Admin privilege must be explicit and audited.

## I.2 Data privacy

- Minimize PII in AI prompts and logs.
- Do not send phone/email/address unless necessary for task.
- Strip EXIF from uploads.
- Use private object storage and expiring signed URLs.
- Apply retention/deletion rules for images and conversation logs.
- Avoid publishing exact household location publicly.
- Export only authorized and sanitized fields.

## I.3 AI prompt security

- User input and retrieved document content are untrusted.
- Retrieved SOP/document text must never override system/developer safety rules.
- Tool calls restricted to explicit typed allowlist.
- Validate model output before rendering or action.
- Never pass model-generated SQL/ORM filters/URLs/shell commands.
- Re-check authorization at tool/domain boundary.
- Test prompt injection in ID/EN and in uploaded documents.

## I.4 Transparency

Use clear labels:
- `AI SUGGESTION`;
- `USER CONFIRMED`;
- `STAFF VERIFIED`;
- `FACILITY VERIFIED`;
- `SELF-REPORTED`;
- `ESTIMATED`;
- `SIMULATED DEMO DATA`.

Do not blur these states in UI or report.

---

# J. USER JOURNEYS THAT MUST WORK END-TO-END

## Journey 1 — Guest asks a local sorting question

1. Open destination QR/public page.
2. Destination context resolved.
3. Guest opens EcoGuide.
4. Asks ID/EN question about a material.
5. EcoGuide retrieves published applicable source.
6. Response displays actionable guidance and citations.
7. Guest can inspect source/report issue.
8. If no source, EcoGuide abstains.

## Journey 2 — Citizen uses Vision and service information

1. Authenticated citizen chooses destination.
2. Uploads material photo.
3. Vision validates image and returns candidate/uncertainty.
4. Backend resolves local acceptance rule.
5. User confirms/corrects.
6. System shows service/collection eligibility from current backend data.
7. User creates request using existing authorized workflow.
8. Passport/history shows verified stages only.

## Journey 3 — Staff records material

1. Staff sees authorized task.
2. Opens task and confirms current status.
3. Inputs weight/contamination and evidence.
4. Online save or offline queue (if implemented).
5. Server validates final record.
6. Duplicate/conflict is prevented or escalated.
7. Passport event timeline updates with verification status.

## Journey 4 — Hospitality records waste

1. HOREKA user signs in and resolves organization membership.
2. Selects location.
3. Records daily waste with categories and source type.
4. System validates units/category/date/duplicates.
5. User sees self-reported totals and linked pickup/passport.
6. Monthly report shows verified vs unverified data.
7. AI summary explains trends without certifying compliance.

## Journey 5 — Admin manages knowledge

1. Admin uploads SOP.
2. System validates file and extracts text.
3. Admin previews content and metadata.
4. Authorized reviewer approves.
5. Document published with version/effective date.
6. EcoGuide query retrieves that version.
7. Admin can supersede/withdraw document.
8. Old interactions remain traceable to old cited version.

## Journey 6 — Admin resolves facility overload with Copilot

1. Admin opens dashboard and selects destination/period.
2. Dashboard loads freshness-labelled data.
3. Rule engine detects overload candidate.
4. Copilot reads supporting data and explains issue.
5. Copilot suggests eligible options only.
6. Admin selects one proposal.
7. Pre-filled form appears.
8. Backend revalidates capacity, permissions, current state.
9. Admin confirms.
10. Domain service executes once.
11. Audit log stores action.
12. Dashboard compares before/after state.

## Journey 7 — Community activity and Guest engagement

1. Coordinator creates community program within authorized destination.
2. Public content uses approved CDOA/knowledge source.
3. Residents/guests see accessible instructions.
4. Participants submit issue/activity record.
5. Reports are marked unverified until reviewed.
6. Aggregate outcome appears in dashboard only when supported by evidence.

---

# K. AUTONOMOUS EXECUTION PROTOCOL

## K.1 Stage transitions

For each stage:
1. Read stage scope.
2. Verify dependencies.
3. Implement the highest-value complete vertical slice.
4. Run targeted tests.
5. Run relevant regression tests.
6. Fix failures caused by current change.
7. Update docs/progress/traceability.
8. Evaluate quality gate.
9. If gate passes, proceed automatically.
10. If gate partially passes, mark limitations and continue only if downstream work remains safe.
11. If blocked by an external dependency, record blocker and continue independent work.

## K.2 No approval between stages

Do not ask the user to approve each stage, each refactor, or each safe local correction. Use professional engineering judgment. Keep changes scoped and reversible.

## K.3 Escalation conditions

Stop only the affected action (not necessarily the whole run) when:
- a destructive operation could affect real/shared data;
- a secret/credential is missing and cannot be safely mocked;
- a human legal/organizational decision is required;
- external provider/partner contract is required;
- production deployment or external transaction is requested;
- a migration is irreversible or cannot be tested safely.

Record `OPEN_DECISION` with options, recommendation, risk, and exactly what work can continue.

## K.4 Progress file format

Update `KEDAS_IMPLEMENTATION_PROGRESS.md` after each milestone:

| Stage | Status | Started/Completed | Files/Modules | Tests | Limitation | Next |
|---|---|---|---|---|---|---|

Never mark a stage completed if its acceptance criteria are untested.

---

# L. FINAL REPORTING REQUIREMENTS

At the end, create a concise executive summary and a technical report containing:

1. Executive summary and product outcome.
2. As-built baseline at start vs final measured state.
3. Implemented features mapped to audit gaps.
4. Architecture and database/API changes.
5. EcoGuide design and benchmark.
6. Vision design and benchmark.
7. Copilot action workflow and safety controls.
8. Destination/area context integration.
9. Hospitality/community/guest features.
10. Waste Passport/mass balance/DCLI changes.
11. UX/accessibility/performance changes.
12. Security/privacy assessment.
13. Test matrix with actual command/output.
14. Demo runbook and demo data scope.
15. Completed / partial / deferred / blocked matrix.
16. Risks and open decisions.
17. Competition claims that are supported and unsupported.
18. Post-competition roadmap.

### Claim register must distinguish
- verified from code;
- verified by automated test;
- verified by runtime/manual test;
- demonstrated using simulated data;
- planned but not implemented;
- dependent on field/partner validation.

Never write “100% accurate”, “fully automated recycling”, “zero waste”, “government certified”, “official compliance”, or “production ready” unless there is direct and appropriate evidence.

---

# M. FINAL INSTRUCTION TO AGENT

Mulai sekarang, kerjakan seluruh 10 tahap implementasi master plan ini pada repository Kedas yang aktif.

1. Baca dokumen PRD, SRS, HDD, Design System, AI Runtime Prompt Library, laporan audit, dan file backlog yang tersedia.
2. Lakukan Stage 1 terlebih dahulu dan verifikasi semua angka/temuan terhadap repository.
3. Jangan mengulang implementasi yang sudah berfungsi; optimalkan atau integrasikan.
4. Prioritaskan vertical slice yang benar-benar selesai daripada membuat banyak halaman parsial.
5. Gunakan data simulasi hanya pada seed/demo environment dan tampilkan labelnya.
6. Pertahankan semua business rules, RBAC, tenancy, dan audit trail.
7. Jangan meminta persetujuan antar-tahap. Setelah quality gate terpenuhi, lanjutkan otomatis.
8. Bila ada batasan, dokumentasikan dan teruskan bagian lain yang tidak terblokir.
9. Jalankan regression tests setiap tahap dan full suite pada tahap akhir.
10. Hasil akhir harus berupa sistem web yang berfungsi, bukti pengujian, dokumentasi implementasi, dan laporan evaluasi yang jujur.

**Definisi sukses Kedas:** EcoGuide memahami pengetahuan lokal dengan sitasi yang valid; Vision memberikan saran material dengan ketidakpastian yang jujur dan konteks penerimaan kawasan; Operations Copilot menghasilkan proposal tindakan berbasis bukti yang divalidasi dan dikonfirmasi manusia; semua kemampuan menggunakan konteks kawasan yang konsisten; dan hasil operasional dapat ditelusuri serta dievaluasi melalui data yang memiliki provenance.

Jangan berhenti pada tampilan yang bagus. Implementasikan alur end-to-end, buktikan dengan test, dan dokumentasikan batas kemampuan sistem secara transparan.
