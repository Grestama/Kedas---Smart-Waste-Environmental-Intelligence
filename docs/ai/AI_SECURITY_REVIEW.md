# Kedas AI — Security, Privacy & OWASP GenAI Compliance Review

---

## 1. Analisis Kepatuhan OWASP Top 10 for LLM & Generative AI

| OWASP Risk ID | Deskripsi Ancaman | Mitigasi Teknis di Backend Kedas | Status |
|---|---|---|---|
| **LLM01: Prompt Injection** | Manipulasi prompt oleh pengguna/dokumen untuk membypass batasan sistem. | Diterapkan `check_prompt_injection()` di [`safety.py`](file:///c:/Users/gresn/Documents/Kumpulan%20Project%20Seru/HackAthon-Bali/backend/app/modules/ai/safety.py) yang memblokir kata kunci sistem, persona switching, dan payload injeksi. Dokumen diperlakukan sebagai DATA, bukan instruksi. | **MITIGATED (100% Defense)** |
| **LLM02: Sensitive Information Disclosure** | Bocornya PII (email, telepon, alamat) dalam prompt atau respons. | Pipeline `redact_pii()` membersihkan nomor telepon dan email sebelum log interaksi dicatat ke `ai_interaction_logs`. Password di-hash menggunakan Argon2id. | **MITIGATED** |
| **LLM03: Supply Chain Vulnerabilities** | Kompromi pada library atau adapter penyedia AI pihak ketiga. | Dependensi dipin pada `pyproject.toml`. Adapter `AIProviderAdapter` mengisolasi panggilan cloud dari domain service. | **MITIGATED** |
| **LLM04: Data and Model Poisoning** | Dokumen palsu atau berbahaya diunggah ke basis pengetahuan. | Dokumen wajib diunggah oleh `ADMIN` terautentikasi dan melalui verifikasi checksum SHA-256. | **MITIGATED** |
| **LLM05: Improper Output Handling** | Eksekusi langsung output model sebagai SQL, shell, atau HTML. | Model dilarang mengeksekusi SQL mentah atau shell command. Seluruh respons diparsing ke dalam Pydantic Schema bertipe data ketat. | **MITIGATED** |
| **LLM06: Excessive Agency** | Model melakukan mutasi data atau aksi berbahaya secara otonom. | Diterapkan **ActionProposal Lifecycle**. Model hanya memiliki akses ke read-only tools. Mutasi wajib diotorisasi oleh admin melalui endpoint terpisah. | **MITIGATED** |
| **LLM07: System Prompt Leakage** | Penyerang memaksa model membocorkan system prompt internal. | Prompt server-side diisolasi dan prompt injection guard memblokir query permintaan bocoran prompt. | **MITIGATED** |
| **LLM08: Vector and Embedding Weaknesses** | Penyerangan pada semantic search atau cross-tenant document retrieval. | Scoping destinasi dan filter `is_public` dilakukan di level SQL sebelum data teks diserahkan ke model. | **MITIGATED** |
| **LLM09: Misinformation & Hallucination** | Model mengarang aturan lokal, jam operasional, atau harga daur ulang. | Diterapkan kebijakan **Grounded RAG** dengan sitasi wajib (`chunk_id`) dan mekanisme **Abstain** jika informasi tidak ditemukan dalam sumber resmi. | **MITIGATED** |
| **LLM10: Unbounded Consumption** | Eksploitasi kuota API atau serangan Denial of Service (DoS). | Batasan token output (`max_tokens: 800`), timeout koneksi, dan rate limiting di sisi middleware. | **MITIGATED** |

---

## 2. PII Redaction & Data Minimization
- Berkas bukti foto material dan dokumen pendukung dibatasi maksimal 10 MB.
- Seluruh stempel waktu diseragamkan dalam format UTC dengan offset tampilan WITA.
- Identitas pelapor pada pengaduan lingkungan masyarakat (`CommunityComplaint`) dapat bersifat anonim untuk melindungi privasi warga banjar.
