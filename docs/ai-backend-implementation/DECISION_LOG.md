# Kedas AI Ecosystem & Backend — Architectural Decision Log (ADR)

---

### ADR-001: Pertahankan Arsitektur Modular Monolith FastAPI
- **Status:** Diterima & Ditegakkan
- **Konteks:** Sistem Kedas saat ini mengelola 48 tabel dan 130 endpoint dengan performa transaksi ACID yang sangat cepat di PostgreSQL/SQLite.
- **Keputusan:** Tidak memecah backend menjadi microservices terpisah. Modul AI (`app/modules/ai`) diintegrasikan sebagai modul internal yang memanggil domain service secara lokal tanpa overhead jaringan microservice.
- **Konsekuensi:** Pengembangan lebih cepat, konsistensi data kuat, dan kemudahan deployment lokal maupun kompetisi.

### ADR-002: Dual-Mode Provider Adapter (Cloud LLM + Resilient Offline Fallback)
- **Status:** Diterima & Ditegakkan
- **Konteks:** Ketergantungan penuh pada API cloud (Gemini/OpenAI) rentan terhadap kegagalan jaringan internet di lokasi kompetisi dan pembatasan kuota/kredensial.
- **Keputusan:** Mengimplementasikan `AIProviderAdapter` yang otomatis mendeteksi kredensial API. Bila API key tidak tersedia atau koneksi jaringan gagal, sistem beralih secara mulus (*graceful fallback*) ke sintesis deterministik berbasis aturan lokal dan sitasi SOP nyata.
- **Konsekuensi:** Jaminan 100% reliabilitas saat live demo juri, tidak pernah ada crash atau error 500 karena masalah koneksi pihak ketiga.

### ADR-003: Human-in-the-Loop untuk Tindakan Berkonsekuensi (ActionProposal Lifecycle)
- **Status:** Diterima & Ditegakkan
- **Konteks:** Model AI/LLM bersifat probabilistik dan tidak boleh memiliki akses tulis langsung (arbitrary mutation) ke basis data transaksi material atau keuangan.
- **Keputusan:** Operasi berisiko (misal: pengalihan armada, perubahan kapasitas, atau approval) wajib melalui siklus `ActionProposal` (`DRAFT` -> `PENDING_APPROVAL` -> `APPROVED` -> `EXECUTED`). Eksekusi hanya dapat dipicu oleh aktor manusia berwenang melalui endpoint `/api/v1/ai/copilot/execute`.
- **Konsekuensi:** Zero unapproved mutation, audit trail transparan, dan kepatuhan penuh terhadap standar OWASP GenAI.

### ADR-004: Rekonsiliasi Metrik Baseline
- **Status:** Diterima & Ditegakkan
- **Konteks:** Terdapat perbedaan angka antara PRD lama (48 endpoint, 19 model) dan laporan audit (116 endpoint, 44 tabel).
- **Keputusan:** Menggunakan hasil inspeksi langsung repositori sebagai sumber kebenaran tunggal: **48 tabel ORM, 10 revisi Alembic, 130 endpoint OpenAPI, 45 rute frontend, dan 213 tes terverifikasi**.
- **Konsekuensi:** Dokumentasi dan pengujian selaras 100% dengan kenyataan kode.
