# KEDAS — AI Ecosystem & Backend Engineering Blueprint

> Paket spesifikasi dan instruksi implementasi untuk memperkuat ekosistem AI dan backend Kedas.
> Nama produk: **Kedas** · Positioning: **AI-Powered Community & Green Tourism Intelligence Platform**
> Bahasa dokumen: Indonesia · Zona waktu target: Asia/Makassar (WITA)
> Status: **Engineering blueprint / target design**, bukan pernyataan bahwa seluruh kemampuan telah tersedia di repository.

## 1. Tujuan paket

Paket ini menerjemahkan strategi produk Kedas menjadi rancangan AI dan backend yang dapat diimplementasikan, diuji, diobservasi, dan dievaluasi secara kuantitatif. Tujuannya bukan menambahkan banyak model tanpa arah, melainkan membangun satu **Environmental Intelligence Layer** yang menghubungkan pengetahuan lokal, bukti material, fasilitas, hospitality, komunitas, dan keputusan operasional.

Prinsip desain utama:

1. PostgreSQL dan domain service tetap menjadi sumber kebenaran transaksi.
2. LLM/vision model memberi saran, interpretasi, dan ranking; tidak menjadi otoritas transaksi.
3. Semua rekomendasi harus menyertakan provenance, batasan, dan status keyakinan bila relevan.
4. Tindakan berkonsekuensi melewati deterministic rules, authorization, dan human approval.
5. Data dari satu destination/organization tidak boleh bocor ke scope lain.
6. Fitur yang kekurangan data harus berstatus `EXPERIMENTAL`, `INSUFFICIENT_DATA`, atau `NEEDS_REVIEW`, bukan menghasilkan angka palsu.
7. Implementasi menjaga modular monolith FastAPI kecuali audit repository dan ADR membuktikan kebutuhan lain.

## 2. Dokumen dalam paket

| File | Tujuan |
|---|---|
| `01_STRATEGI_EKOSISTEM_AI_KEDAS.md` | Peta seluruh kapabilitas AI, positioning, prioritas, dependency, dan target kemampuan. |
| `02_PRD_EKOSISTEM_AI_KEDAS.md` | Kebutuhan produk, persona, business outcome, scope, KPI, dan user journey AI. |
| `03_SRS_AI_BACKEND_KEDAS.md` | Functional/non-functional requirements, kontrak perilaku, acceptance criteria, dan batas sistem. |
| `04_HDD_ARSITEKTUR_AI_BACKEND_KEDAS.md` | Arsitektur backend, AI orchestration, RAG, Vision, Copilot, workers, deployment, dan ADR. |
| `05_DATA_MODEL_API_CONTRACT_AI_KEDAS.md` | Model konseptual, data contract, API proposal, schema response, event, dan migrasi. |
| `06_AI_EVALUATION_GOVERNANCE_KEDAS.md` | Dataset, metrik, evaluasi per capability, release gate, model card, dan human review. |
| `07_AI_SECURITY_MLOPS_RUNBOOK_KEDAS.md` | Security, privacy, prompt-injection, observability, cost, deployment, fallback, incident response. |
| `08_MASTER_PROMPT_AGENTIC_AI_AI_BACKEND_KEDAS_12_TAHAP.md` | Master prompt implementasi 12 tahap dengan otomatisasi dan quality gates. |
| `09_RUNTIME_PROMPT_LIBRARY_KEDAS.md` | Prompt runtime yang terversi untuk EcoGuide, Vision, Copilot, reports, dan structured analysis. |

## 3. Sumber kebenaran dan urutan prioritas

Agent harus membaca repository aktual terlebih dahulu. Prioritas sumber:

1. Source code, OpenAPI, migration history, database schema, tests, runtime config, dan deployment config yang aktif.
2. Laporan audit as-built Kedas tanggal 30 Oktober 2026 yang diberikan tim.
3. PRD, SRS, HDD, strategi produk, dan prompt terdahulu.
4. Dokumen blueprint ini sebagai **target design**.

### Catatan konflik baseline historis

Dokumen Kedas yang lebih lama pernah mencantumkan 48 endpoint dan 19 model data. Laporan audit lebih baru yang diberikan tim mencantumkan 116 endpoint, 44 tabel SQLAlchemy, 10 migrasi Alembic, 38 rute web, dan 203/203 tes lulus. Angka tersebut merupakan klaim audit yang harus diverifikasi ulang. Jangan menggabungkan atau memilih angka secara manual. Repository dan hasil command terkini menentukan baseline aktual.

## 4. Cara menggunakan paket

1. Berikan seluruh folder/ZIP kepada agentic AI dengan akses repository.
2. Mulai dari master prompt tahap 0/1; jangan langsung meminta implementasi semua model.
3. Minta agent memetakan setiap requirement ke kode existing sebelum membuat tabel, router, service, atau provider baru.
4. Jalankan tahap berurutan. Agent melanjutkan otomatis ketika quality gate lolos.
5. Keputusan yang membutuhkan data, legal approval, provider credential, fasilitas nyata, atau persetujuan manusia harus dicatat sebagai blocker/dependency—agent tetap mengerjakan bagian yang tidak terblokir.
6. Setelah implementasi, gunakan dokumen Evaluation & Governance untuk menguji kualitas AI secara terpisah dari unit test software.

## 5. Output akhir yang diharapkan

- AI capability registry yang menunjukkan status `EXISTING_VERIFIED`, `PARTIAL`, `NEW`, `EXPERIMENTAL`, atau `BLOCKED`.
- Backend AI architecture yang tetap modular dan provider-agnostic.
- Kontrak API dan schema tervalidasi.
- Dataset evaluasi dengan provenance dan split yang benar.
- Evaluasi per capability dan release gate yang dapat direproduksi.
- Security/privacy controls dan AI observability.
- Migration plan yang aman dan reversible.
- Implementation report, test evidence, known limitations, dan demo readiness.

## 6. Istilah status

- `VERIFIED`: terbukti lewat kode dan test/runtime.
- `PARTIAL`: sebagian alur ada, belum memenuhi acceptance.
- `PROPOSED`: target design, belum tentu diimplementasikan.
- `EXPERIMENTAL`: boleh diuji terbatas, bukan rekomendasi operasional default.
- `INSUFFICIENT_DATA`: tidak ada data yang cukup untuk prediksi/claim.
- `NEEDS_HUMAN_REVIEW`: membutuhkan verifikasi manusia.
- `BLOCKED`: memerlukan kredensial, dokumen, mitra, atau keputusan eksternal.

## 7. Prinsip keberhasilan

Kedas dinilai berhasil bukan dari jumlah endpoint, jumlah model, atau panjang jawaban AI. Ukuran keberhasilan adalah **ketepatan rekomendasi, bukti yang dapat ditelusuri, tidak adanya pelanggaran aturan, penggunaan yang membantu pengguna, keandalan backend, dan dampak yang dihitung secara jujur**.
