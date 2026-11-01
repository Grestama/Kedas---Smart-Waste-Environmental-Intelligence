# Akun Demo & Lingkungan Sandbox — Kedas

**Proyek**: Kedas  
**Lingkungan**: Local Sandbox / Hackathon Demo Environment  
**Peringatan Keamanan**: Kredensial di bawah ini **HANYA BERLAKU** untuk database demo/test lokal dan **TIDAK PERNAH DIGUNAKAN** di lingkungan produksi.

---

## 1. Daftar Akun Demo Resmi per Peran

| Peran Sistem | Nama Tampilan Demo | Identitas Login (Email) | Kata Sandi Demo | Dasbor Target | Deskripsi Skenario Demo |
|---|---|---|---|---|---|
| **Warga Desa (`USER`)** | I Wayan Sudarsana | `wayan.sudarsana@example.com` | `warga123!@#` | `/app` | Membuat setoran penjemputan terpilah, melihat poin reward, kelola alamat, ajukan kemitraan petugas. |
| **Petugas Lapangan (`COLLECTOR`)** | I Made Suartana | `made.collector@wastelink.bali.id` | `collector123!@#` | `/staff` | Mengambil tugas penjemputan, input inspeksi kontaminasi, input berat timbangan, laporkan kendala. |
| **Koordinator / Admin (`ADMIN`)** | I Ketut Dharma | `admin.operasional@wastelink.bali.id` | `admin123!@#` | `/admin` | Memverifikasi permohonan petugas, memantau permintaan, audit log, laporan tonase banjar. |
| **Calon Petugas (`USER` - Pending)** | I Nyoman Wirawan | `nyoman.wirawan@example.com` | `warga123!@#` | `/app/profil` | Mengajukan armada pick-up di `/app/profil` untuk didemokan proses persetujuannya oleh admin. |

---

## 2. Cara Cepat Masuk Saat Demo (One-Click Role Switcher)

Pada halaman login [http://localhost:3000/masuk](http://localhost:3000/masuk), sistem telah dilengkapi **Role Switcher Tabs**:
1. Klik tab **"Warga"** $\rightarrow$ Form otomatis terisi kredensial demo warga.
2. Klik tab **"Petugas"** $\rightarrow$ Form otomatis terisi kredensial demo petugas lapangan.
3. Klik tab **"Koordinator"** $\rightarrow$ Form otomatis terisi kredensial demo koordinator/admin.
4. Klik tombol **"Masuk ke Kedas"** untuk langsung membuka dasbor terkait.
