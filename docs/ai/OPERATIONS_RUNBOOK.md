# Kedas AI — Operations & Incident Response Runbook

Dokumen ini menyediakan panduan operasional bagi Administrator, Koordinator Wilayah, dan Operator Fasilitas dalam menjalankan dan mengawasi ekosistem AI Kedas.

---

## 1. Menjalankan Server Backend

```powershell
# Jalankan backend FastAPI
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 2. Menjalankan Suite Evaluasi & Benchmark AI

```powershell
# Eksekusi benchmark AI lengkap (Safety, RAG, Vision, Copilot)
python backend/app/cli/evaluate_ai.py
```

## 3. Menjalankan Seeder Data Pilot

```powershell
# Inisialisasi kategori standar, area percontohan, dan SOP RAG
python -m backend.app.cli.seed_demo
```

---

## 4. Prosedur Tanggap Darurat & Insiden (Incident Response)

### Skenario A: Putus Jaringan ke Cloud AI Provider (Gemini / OpenAI Outage)
1. **Dampak:** Panggilan API eksternal gagal (*timeout* atau HTTP 503).
2. **Perilaku Sistem:** `AIProviderAdapter` mendeteksi anomali jaringan dan secara otomatis mengaktifkan mode `kedas-local-resilient-fallback`.
3. **Tindakan Operator:** Tidak diperlukan restart manual. Operasi penjemputan, timbangan, dan transaksi poin warga tetap berjalan 100% tanpa hambatan (*zero downtime*).

### Skenario B: Terdeteksi Percobaan Prompt Injection atau Scraping Massal
1. **Dampak:** Pengguna mencoba mengekstrak prompt sistem atau memanipulasi aturan banjar.
2. **Perilaku Sistem:** Request diblokir oleh `check_prompt_injection()`. Status dikembalikan sebagai `BLOCKED_BY_SAFETY_FILTER`.
3. **Tindakan Operator:** Periksa `ai_interaction_logs` pada konsol admin untuk meninjau IP atau akun yang memicu peringatan berulang. Jika perlu, nonaktifkan akun pengguna terkait via `/api/v1/admin/users`.

### Skenario C: Dokumen SOP Kedaluwarsa atau Mengalami Revisi Paruman Banjar
1. **Tindakan Operator:**
   - Unggah revisi dokumen baru melalui `/api/v1/ai/knowledge` dengan nomor versi baru (misal: v1.1).
   - Perbarui status dokumen lama menjadi `RETIRED` melalui `PATCH /api/v1/ai/knowledge/{id}/status`.
   - Dokumen berstatus `RETIRED` otomatis dikeluarkan dari indeks sitasi aktif EcoGuide.
