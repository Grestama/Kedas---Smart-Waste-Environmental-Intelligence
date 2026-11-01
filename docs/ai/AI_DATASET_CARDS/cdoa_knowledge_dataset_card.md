# Dataset Card: Kedas CDOA & Local Policy Knowledge Base

## Dataset Summary
- **Dataset ID:** `DS-CDOA-KNOWLEDGE-V1`
- **Owner:** Kedas Community Governance & Pilot Coordinators
- **Scope:** Kawasan Banjar Sukawati Kaja, Banjar Tebesaya Ubud, dan Sanur Kauh Denpasar.

## Ingestion & Versioning Lifecycle
- Dokumen terdaftar pada tabel `knowledge_documents` dengan SHA-256 checksum unik untuk mencegah duplikasi konten.
- Dokumen dipecah (*chunked*) menjadi segmen 200–500 token dengan mempertahankan judul bab dan pasal kesepakatan pada tabel `knowledge_chunks`.
- Status siklus hidup dokumen:
  - `DRAFT`: Draf awal, tidak dapat diretrieve oleh pengguna publik.
  - `PUBLISHED`: Telah ditinjau dan disahkan oleh Kelian Banjar / Admin; aktif untuk sitasi RAG.
  - `RETIRED`: Versi terdahulu yang telah digantikan kesepakatan baru; otomatis dinonaktifkan dari retrieval aktif.
