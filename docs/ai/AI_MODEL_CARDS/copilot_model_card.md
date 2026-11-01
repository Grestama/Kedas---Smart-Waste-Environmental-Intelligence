# Model Card: Kedas Operations Copilot (AI-03)

## Model Details
- **Developer:** Kedas AI Engineering Team
- **Model Architecture:** Tool-Augmented LLM Orchestrator + Deterministic Constraint Guard + ActionProposal State Machine
- **Primary Model Backend:** Google Gemini 2.0 Flash (`gemini-2.0-flash`) with Scoped SQL Tool Execution Engine
- **Version:** 1.0 (operations_copilot_v1 runtime prompt)

## Intended Use
- **Primary Use Case:** Membantu koordinator banjar, operator fasilitas TPS3R, dan admin supervisi dalam mendiagnosis anomali operasional (misal: antrean penjemputan overload, deviasi timbangan susut material, kuota fasilitas menipis) dan menyusun draft proposal tindakan yang dapat dieksekusi.
- **Out-of-Scope Uses:** Mengubah data basis data secara otonom tanpa otorisasi manusia, menerbitkan atau menghapus poin sepihak tanpa bukti timbangan fisik, atau membatalkan penjemputan sepihak.

## Guardrails & Governance
1. **Read-Only Tool Registry:** Model hanya memiliki akses ke tool baca (`list_overdue_pickups`, `get_facility_capacity`, `check_weight_discrepancies`). Model TIDAK memiliki tool tulis langsung ke database.
2. **ActionProposal Lifecycle:** Rekomendasi tindakan dikemas ke dalam objek proposal (`DRAFT` -> `PENDING_APPROVAL` -> `APPROVED` -> `EXECUTED`).
3. **Re-validation on Approval:** Saat admin menyetujui proposal, sistem memeriksa ulang izin aktor, kuota fasilitas terkini, dan status entitas sebelum mutasi dijalankan dalam transaksi atomik.
4. **Complete Audit Trail:** Setiap eksekusi proposal dicatat ke tabel `audit_logs` dengan `actor_user_id`, `action`, `reason`, dan `request_id`.

## Performance Metrics
- Deterministic Constraint Adherence: **100.0%**
- Direct State Mutation Rate: **0.0%** (zero unauthorized write)
- Evidence Coverage: **100.0%** (setiap rekomendasi terikat pada ID transaksi riil)
