# Kedas AI — Data Migration & Schema Integrity Report

**Alat Migrasi:** Alembic 1.13.0+  
**Status Head:** `0010_ai_knowledge_and_interactions` (Single Active Head)  
**Total Revisi:** 10 Migrasi Terverifikasi  

---

## 1. Urutan Silsilah Migrasi Basis Data (Alembic Revision History)

| No. Revisi | ID Revisi | Deskripsi Migrasi | Tabel yang Dibuat / Diubah |
|---|---|---|---|
| 1 | `0001_baseline_audit_log` | Baseline migration: pembuatan tabel audit trail sistem. | `audit_logs` |
| 2 | `0002_identity_taxonomy_collection` | Identitas pengguna, taksonomi sampah, area layanan, slot jemput, dan pickup. | `users`, `roles`, `user_roles`, `user_addresses`, `auth_sessions`, `waste_categories`, `service_areas`, `collection_slots`, `pickup_requests`, `pickup_status_events` |
| 3 | `0003_inspection_weight_points_marketplace` | Inspeksi QC, timbangan digital, ledger WastePoints, dan batch material. | `inspection_records`, `weight_records`, `ledger_entries`, `reward_rules`, `material_batches`, `material_batch_items`, `material_offers`, `partners`, `evidence_files` |
| 4 | `0004_notification_outbox` | Pola Transactional Outbox untuk notifikasi reliabel. | `notifications`, `notification_outbox` |
| 5 | `0005_pickup_idempotency_and_service_mode` | Penambahan kunci idempotency dan mode layanan setoran (`PICKUP` vs `DROP_OFF`). | Kolom `idempotency_key` dan `service_mode` pada `pickup_requests` |
| 6 | `0006_facility_receipts_stock_and_waste_bank` | Penerimaan fasilitas TPS3R, pergerakan stok, dan rekening bank sampah. | `facilities`, `facility_receipts`, `stock_movements`, `waste_bank_members`, `waste_bank_transactions` |
| 7 | `0007_partner_marketplace_b2b_and_organic` | Entitas B2B perhotelan, lokasi, pengomposan organik, dan pengiriman batch. | `b2b_organizations`, `b2b_locations`, `b2b_organization_members`, `b2b_pickup_requests`, `organic_processing_records`, `delivery_records` |
| 8 | `0008_community_programs_funding_and_special_features` | Profil banjar adat, aksi gotong royong, program pendanaan, dan manifest B3. | `banjar_profiles`, `banjar_officials`, `community_events`, `cleanup_actions`, `community_complaints`, `funding_programs`, `program_budget_allocations`, `program_sponsorships`, `hazardous_waste_manifests` |
| 9 | `0009_cdoa_and_destination_agreements` | Perjanjian Operasional Destinasi Kawasan (CDOA Pergub Bali 47/2019). | `cdoa_agreements`, `material_acceptance_rules` |
| 10 | `0010_ai_knowledge_and_interactions` | Dokumen pengetahuan SOP/CDOA, chunking RAG, dan log interaksi AI. | `knowledge_documents`, `knowledge_chunks`, `ai_interaction_logs` |

---

## 2. Pengujian Rollback & Integritas Skema
- Migrasi dieksekusi dan diuji secara otomatis pada [`backend/tests/api/test_db_migration.py`](file:///c:/Users/gresn/Documents/Kumpulan%20Project%20Seru/HackAthon-Bali/backend/tests/api/test_db_migration.py).
- Pengujian memverifikasi bahwa skema database dapat dibuat secara bersih, konsisten, dan bebas dari konflik foreign key cyclic.
