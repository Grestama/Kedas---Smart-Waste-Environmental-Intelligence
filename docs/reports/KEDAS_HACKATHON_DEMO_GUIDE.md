# KEDAS — HACKATHON LIVE DEMO SCRIPT & PITCH GUIDE
## Community & Green Tourism — Integrated Destination Waste Operations Platform
**Durasi Demo:** 5–7 Menit  
**Target Audiens:** Dewan Juri Hackathon, Praktisi Lingkungan, Stakeholder Pariwisata Bali  

---

## 1. Narasi Pembuka & Masalah (0:00 – 1:00)

> *"Bapak dan Ibu Dewan Juri yang kami hormati. Setiap hari, destinasi pariwisata di Bali menghasilkan ribuan ton sampah yang mengalir tanpa kepastian. Wisatawan ingin memilah, hotel ingin laporan ESG yang sah, warga ingin desanya bersih, tetapi fasilitas TPS3R kerap kelebihan beban atau menerima sampah tercampur yang akhirnya berakhir di TPA Suwung.*
>
> *Aplikasi on-demand biasa gagal di Bali karena mengabaikan kearifan Banjar Adat dan kapasitas riil TPS3R.*
>
> *Hari ini kami mempersembahkan **Kedas: Bergerak Bersama untuk Lingkungan yang Lebih Bersih**. Platform digital operasional material terpadu berbasis komunitas dan pariwisata hijau."*

---

## 2. Alur Demonstrasi Langsung (Live Interactive Demo)

### Babak 1: Direktori Layanan Kawasan & CDOA (1:00 – 2:00)
- **Halaman yang Ditampilkan:** `http://localhost:3000/area-layanan`
- **Poin yang Ditonjolkan:**
  - Tunjukkan kesepakatan adat **CDOA** (misal: *CDOA-UBD-2026-001 - Banjar Tebesaya Ubud*).
  - Tunjukkan bahwa layanan penjemputan bukan sekadar 'panggil driver', melainkan terikat jadwal resmi adat, kuota harian fasilitas, dan SLA 24 jam.
  - Tunjukkan bagaimana transparansi aturan mencegah penumpukan sampah liar.

### Babak 2: Pemesanan Cerdas Warga & Service Eligibility Engine (2:00 – 3:15)
- **Akun Login:** Warga Ubud (`warga@kedas.bali` / `password_123`)
- **Aksi Demo:**
  - Buka menu **Pesan Penjemputan**.
  - Pilih alamat rumah di Ubud dan jenis material Anorganik Daur Ulang.
  - Tunjukkan verifikasi instan **Service Eligibility Engine**: sistem memastikan fasilitas buka dan kuota slot tersedia secara deterministik.
  - Klik **Kirim Permintaan**. Tiket langsung terbit lengkap dengan **Kode Paspor Sampah (Kedas Waste Passport)**.

### Babak 3: Lapangan — Dispatching Petugas & Timbang Digital (3:15 – 4:30)
- **Akun Beralih Peran (Workspace Switch):** Petugas Kolektor (`kolektor@kedas.bali`)
- **Aksi Demo:**
  - Buka tab **Tugas Penjemputan**.
  - Ambil tiket penjemputan warga. Tunjukkan proteksi *atomic claim* yang mencegah dua pengemudi mengambil tiket yang sama.
  - Masukkan penimbangan digital: Berat Kotor $12.5\ kg$, Residu $0.5\ kg$.
  - Selesaikan serah terima. Seketika poin warga bertambah dan jejak audit tercatat aman.

### Babak 4: Fasilitas TPS3R & Neraca Massa (Mass Balance) (4:30 – 5:15)
- **Akun Login:** Operator Fasilitas (`operator@kedas.bali`)
- **Aksi Demo:**
  - Buka menu **Pemilahan & Neraca Massa**.
  - Tunjukkan formula audit: $\text{Total Masuk } (100\ kg) = \text{PET } (60\ kg) + \text{Karton } (30\ kg) + \text{Residu } (10\ kg)$.
  - Tunjukkan penolakan otomatis jika operator mencoba memasukkan angka fiktif yang tidak seimbang. Inilah jaminan anti-greenwashing Kedas!

### Babak 5: Wisatawan & Green Companion (5:15 – 6:00)
- **Halaman yang Ditampilkan:** `http://localhost:3000/guest`
- **Poin yang Ditonjolkan:**
  - Buka halaman publik `/guest` tanpa login.
  - Alihkan bahasa ke **English** dengan satu klik.
  - Tunjukkan panduan 3 wadah pemilahan berbasis nilai lokal Tri Hita Karana dan peta titik isi ulang air minum gratis untuk menekan timbulan botol plastik.

---

## 3. Penutup & Kalimat Kunci Pitch (6:00 – 6:30)

> *"Kedas bukan sekadar aplikasi pengangkut sampah. Kedas adalah ekosistem tata kelola material terintegrasi di mana:*
>
> 1. **Setiap sumber sampah terhubung dengan layanan yang tersedia.**
> 2. **Setiap serah-terima tercatat dengan paspor digital terverifikasi.**
> 3. **Setiap klaim dampak didukung bukti nyata neraca massa.**
>
> *Bersama Kedas, kita wujudkan Bali yang bersih, berdaulat material, dan lestari untuk generasi masa depan. Terima kasih!"*

---

## 4. Antisipasi Pertanyaan Dewan Juri (Q&A Defense)

**T: Apa bedanya Kedas dengan aplikasi ojek sampah swasta yang sudah ada di Bali?**  
*J: Aplikasi swasta bersifat individual dan sering kali mengangkut sampah ke TPA yang sama tanpa verifikasi hilir. Kedas mengintegrasikan struktur Banjar Adat melalui CDOA, memberdayakan TPS3R desa yang sudah dibangun pemerintah agar neraca massanya transparan, dan menyediakan paspor material berantai audit.*

**T: Bagaimana jika ada hotel yang mengklaim 100% daur ulang padahal buang sampah campur?**  
*J: Sistem Kedas memiliki Green Hospitality Ledger dengan indikator Loop Rate dan DCLI. Jika volume residunya tinggi atau serah terima fasilitas belum terbukti 3 siklus, sistem menolak mengeluarkan skor hijau dan otomatis mencantumkan disclaimer ketidakcukupan data operasional.*
