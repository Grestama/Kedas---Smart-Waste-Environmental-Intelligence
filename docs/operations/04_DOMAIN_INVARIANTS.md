# 04. Invarian Domain & Integritas Transaksional — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Software Architect & Database Engineer  
**Status**: Implemented & Verified

---

## 1. Daftar Invarian Domain Kritis

Sistem Kedas memberlakukan invarian bisnis yang wajib dipatuhi di tingkat service dan database:

1. **Invarian 1: Otoritas Penimbangan Final Berada pada Pihak Berwenang**
   - Timbangan petugas di lapangan adalah acuan kredit poin awal warga, namun penerimaan fasilitas di TPS3R adalah acuan neraca massa resmi.
   - Deviasi timbangan di atas 5% memicu status sengketa `DISCREPANCY_FLAGGED` dan membekukan status penyelesaian sampai koordinator memverifikasi foto bukti timbangan.
2. **Invarian 2: Perhitungan Berat Bersih Tidak Boleh Negatif**
   - Setiap entri berat sampah wajib memenuhi aturan $\text{berat\_kg} > 0$.
   - Validasi skema Pydantic (`gt=0`) dan database check constraint mencegah angka 0 atau negatif.
3. **Invarian 3: Penerbitan Reward Bersifat Server-Side dan Idempotent**
   - Poin apresiasi warga dihitung dan dikreditkan langsung oleh modul backend berdasarkan tarif resmi kategori sampah.
   - Pengiriman ganda permintaan timbangan dengan `idempotency_key` yang sama tidak menggandakan saldo warga.
4. **Invarian 4: Buku Besar Bersifat Append-Only**
   - Tabel `points_ledger` dan `waste_bank_transactions` tidak pernah mengizinkan operasi `UPDATE` atau `DELETE` pada baris transaksi yang telah committed.
   - Koreksi penimbangan salah dilakukan melalui transaksi pembalik kompensasi (*compensating transaction / reversal*).
5. **Invarian 5: Konservasi Massa pada Pemilahan Fasilitas (Mass Balance)**
   - Pada pemilahan fasilitas TPS3R:
     $$\text{Input Unprocessed (kg)} = \sum \text{Output Terpilah (kg)} + \text{Residu TPA (kg)}$$
   - Sistem menolak pemilahan jika total output melebihi kuantitas sampah masuk yang tersedia.
6. **Invarian 6: Serialisasi Pengurangan Stok Fasilitas (Pessimistic Locking)**
   - Operasi `sort_received_waste` menggunakan query SQLAlchemy `.with_for_update()` pada baris `Facility`.
   - Mengeliminasi anomali *lost update* dan mencegah stok negatif saat dua operator memproses sampah secara paralel.
7. **Invarian 7: Pemisahan Mutlak Saldo Uang Nasabah Bank Sampah dari Poin Promosi**
   - Saldo rupiah nasabah bank sampah dicatat pada tabel `waste_bank_accounts` dengan mata uang IDR.
   - Poin reward Kedas dicatat pada `points_ledger`. Keduanya tidak dapat dipertukarkan tanpa aturan likuiditas resmi.
