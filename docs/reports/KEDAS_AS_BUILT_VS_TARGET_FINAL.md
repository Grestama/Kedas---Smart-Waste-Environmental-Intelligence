# KEDAS — AS-BUILT VS TARGET GAP RECONCILIATION FINAL
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Versi Dokumen:** 1.0  
**Tanggal:** 30 Oktober 2026  

---

## 1. Pendahuluan

Dokumen ini menyajikan audit rekonsiliasi akhir antara desain target (*intended design* berdasarkan dokumen arsitektur dan strategi produk Kedas) dengan sistem aktual yang terbangun di dalam repositori (*as-built system*).

Prinsip evaluasi:
- **TERPENUHI (Implemented & Verified):** Fitur telah memiliki model database, logika bisnis backend, endpoint API, pengujian otomatis, dan antarmuka pengguna yang terverifikasi.
- **SEBAGIAN (Partially Implemented):** Fitur memiliki backend fungsional dan model data lengkap, namun antarmuka frontend masih beroperasi secara manual atau terbatas pada simulasi role.
- **DITANGGUHKAN KE FASE PILOT (Deferred to Pilot Deployment):** Fitur yang membutuhkan integrasi perangkat keras eksternal (hardware scale IoT, GPS telematika kendaraan fisik, payment gateway QRIS bank nasional).

---

## 2. Matriks Rekonsiliasi Per Domain

### Domain 1: Multi-Tenancy Kawasan, Destinasi & CDOA
| Aspek Desain Target | Kondisi Aktual As-Built | Status | Bukti Kode / Verifikasi |
|---|---|---|---|
| Perjanjian Operasional Kawasan Destinasi (CDOA) | Entitas `CDOAAgreement` terintegrasi pada migrasi `0009`. Mendukung state: DRAFT, UNDER_REVIEW, APPROVED, PUBLISHED, SUPERSEDED, SUSPENDED. | `TERPENUHI` | `backend/app/modules/community/models.py`, `tests/api/test_cdoa_and_membership.py` |
| Direktori Layanan Publik Berdasarkan CDOA | Endpoint `/api/v1/community/service-directory/{area_id}` menyajikan kategori yang diterima, kapasitas harian, SLA, dan kontak eskalasi. | `TERPENUHI` | `backend/app/api/v1/community.py`, `frontend/src/app/(public)/area-layanan/page.tsx` |
| Isolasi Wilayah Banjar / Desa Adat | `service_area_id` menjadi foreign key wajib di setiap pemesanan penjemputan dan profil operasional. | `TERPENUHI` | `backend/app/modules/collection/models.py` |

### Domain 2: Kecerdasan Fasilitas & Aturan Kelayakan Layanan
| Aspek Desain Target | Kondisi Aktual As-Built | Status | Bukti Kode / Verifikasi |
|---|---|---|---|
| Deterministic Service Eligibility Engine | Endpoint `/api/v1/pickup-requests/eligibility` mengevaluasi 7 kriteria deterministik sebelum pemesanan dibuat (CDOA aktif, status fasilitas, kuota slot, aturan material, isolasi alamat). | `TERPENUHI` | `backend/app/modules/collection/service.py:check_service_eligibility` |
| Jam Operasional & Status Fasilitas | Fasilitas memiliki status OPERATIONAL, MAINTENANCE, TEMPORARILY_CLOSED. Penjemputan otomatis diblokir jika fasilitas penerima tidak operasional. | `TERPENUHI` | `tests/api/test_facility_intelligence_and_eligibility.py` |
| Kapasitas Slot Harian | Kapasitas slot memiliki kontrol konkurensi atomik (`booked_capacity < max_capacity`). Menolak overbooking. | `TERPENUHI` | `tests/api/test_collection_concurrency.py` |

### Domain 3: Operasi Penjemputan & Paspor Sampah
| Aspek Desain Target | Kondisi Aktual As-Built | Status | Bukti Kode / Verifikasi |
|---|---|---|---|
| Kedas Waste Passport Publik | Endpoint `/api/v1/pickup-requests/passport/public/{code}` dapat diakses publik via QR code tanpa kebocoran PII (nama, email, telepon disamarkan/ditiadakan). | `TERPENUHI` | `backend/app/modules/collection/service.py:get_waste_passport_public` |
| Kedas Waste Passport Terotentikasi | Endpoint `/api/v1/pickup-requests/{id}/passport` dengan pengecekan RBAC & kepemilikan anti-IDOR. | `TERPENUHI` | `tests/api/test_waste_passport_traceability.py` |
| State Machine Rantai Pasok | Siklus hidup status: SUBMITTED -> ASSIGNED -> EN_ROUTE -> ARRIVED -> INSPECTION -> WEIGHED -> COLLECTED -> COMPLETED. Transisi ilegal dicegah. | `TERPENUHI` | `tests/api/test_phase3_petugas_dispatch.py` |

### Domain 4: Green Hospitality Ledger (HOREKA)
| Aspek Desain Target | Kondisi Aktual As-Built | Status | Bukti Kode / Verifikasi |
|---|---|---|---|
| Ledger Operasional B2B | Endpoint rekapitulasi operasional B2B per tenant mitra komersial dengan isolasi data ketat. | `TERPENUHI` | `backend/app/modules/marketplace/service.py:get_b2b_operational_report` |
| Rincian Kategori & Loop Rate | Menghitung volume residu vs terpilah serta rasio *verified loop completion rate*. | `TERPENUHI` | `backend/app/modules/marketplace/schemas.py:B2BOperationalReportResponse` |
| Disclaimer Audit Operasional | Payload laporan menyertakan disclaimer hukum bahwa ledger ini adalah catatan operasional internal dan bukan audit kepatuhan ISO/AMDAL formal. | `TERPENUHI` | `tests/api/test_phase5_marketplace_organic_and_b2b.py` |

### Domain 5: Guest Green Companion & Komunitas EcoLoop
| Aspek Desain Target | Kondisi Aktual As-Built | Status | Bukti Kode / Verifikasi |
|---|---|---|---|
| Guest Companion Microsite | Rute `/guest` publik ramah ponsel, dwibahasa (ID/EN), etika Tri Hita Karana, panduan 3 wadah pemilahan, dan peta titik stasiun isi ulang air. | `TERPENUHI` | `frontend/src/app/(public)/guest/page.tsx` |
| Pengaduan Sampah Liar Banjar | Model dan API `CommunityComplaint` dengan eskalasi dan resolusi berstatus. | `TERPENUHI` | `backend/app/modules/community/models.py`, `tests/api/test_phase6*` |
| Kegiatan Bersih-Bersih Sukarela | Model dan API `CleanupAction` dengan verifikasi admin/koordinator. | `TERPENUHI` | `tests/api/test_phase6*` |

### Domain 6: Neraca Massa & Jaringan Material Sirkular
| Aspek Desain Target | Kondisi Aktual As-Built | Status | Bukti Kode / Verifikasi |
|---|---|---|---|
| Formula Konversi Neraca Massa | Validasi sorting fasilitas: $\text{Input} = \text{Output} + \text{Residu} \pm \text{Toleransi}$. Selisih di luar ambang batas memicu ValidationError. | `TERPENUHI` | `backend/app/modules/facility/service.py:record_sorting_process` |
| Penguncian Stok Atomik | Menghindari *race condition* dan *double-selling* stok material olahan ke pembeli industri/daur ulang. | `TERPENUHI` | `tests/api/test_phase4_facility_and_waste_bank.py` |
| Lisensi Mitra Pembeli | Pembeli wajib berstatus lisensi aktif sebelum serah-terima material dikonfirmasi. | `TERPENUHI` | `tests/api/test_phase5*` |

### Domain 7: Destination Clean Loop Index (DCLI)
| Aspek Desain Target | Kondisi Aktual As-Built | Status | Bukti Kode / Verifikasi |
|---|---|---|---|
| Formula DCLI 5 Dimensi | Menghitung Service Reliability (25%), Acceptance Rate (20%), Traceability (20%), Mass Balance (20%), Community Participation (15%). | `TERPENUHI` | `backend/app/modules/community/service.py:calculate_destination_clean_loop_index` |
| Guardrail Anti-Greenwashing | Menolak memberikan skor (return `status="INSUFFICIENT_DATA"` & `overall_score=None`) jika data penjemputan < 3 siklus. | `TERPENUHI` | `tests/api/test_dcli_analytics.py` |
| Disclaimer Eksplisit | Payload DCLI selalu menyertakan peringatan bahwa skor adalah indikator operasional internal, bukan sertifikasi legal formal. | `TERPENUHI` | `tests/api/test_dcli_analytics.py` |

---

## 3. Aspek yang Ditangguhkan ke Fase Pilot Fisik Lapangan

1. **Integrasi Sensor Timbangan IoT Bluetooth / Serial:** Saat ini input berat menggunakan validasi numerik presisi tinggi pada form penimbangan petugas, bukan driver hardware langsung.
2. **Pelacakan GPS Telematika Kendaraan Real-Time:** Pelacakan armada menggunakan koordinat latitude/longitude statis titik jemput dan status check-in, bukan WebSocket live GPS streaming.
3. **Penyelesaian Transaksi Keuangan Bank Sampah:** Transaksi tabungan sampah saat ini menggunakan buku besar internal (*Points & Ledger Ledger*), belum dihubungkan ke API pencairan e-wallet/bank eksternal.
