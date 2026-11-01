# Batasan Teknis & Asumsi Operasional (Known Limitations) — Kedas

**Proyek**: Kedas  
**Tanggal**: 30 Oktober 2026  
**Auditor**: Software Architect & Hackathon Technical Lead  
**Prinsip**: Kejujuran Rekayasa Perangkat Lunak (No False Claims)

---

## 1. Batasan Integrasi Pihak Ketiga (External Dependencies)

1. **Pengiriman SMS / WhatsApp OTP Riil**:
   - Sistem saat ini beroperasi dengan *Sandbox / Direct Credential Engine* untuk lingkungan lokal hackathon.
   - Belum terhubung dengan gateway SMS (Twilio/Zenziva) atau WhatsApp Business API berbayar.
   - Skenario pengujian lupa sandi dialihkan ke panduan verifikasi fisik di sekretariat TPS3R dan kredensial sandbox resmi di [docs/DEMO_ACCOUNTS.md](file:///docs/DEMO_ACCOUNTS.md).
2. **Integrasi Sensor Timbangan Digital Nirkabel (IoT BLE)**:
   - Penginputan bobot timbangan saat ini masih dilakukan melalui antarmuka layar ponsel/web petugas (*manual input*).
   - Integrasi langsung via Bluetooth Low Energy (BLE) ke timbangan digital lapangan masuk dalam roadmap Tahap 4 operasional.
3. **Pencairan Saldo Tabungan Bank Sampah Otomatis (Payment Gateway)**:
   - Pencairan saldo rupiah nasabah bank sampah saat ini dicatat secara akuntansi di buku kas digital, namun pencairan fisik uang tunai dilakukan di meja kasir bank sampah.
   - Integrasi otomatis dengan sistem kliring perbankan (BI-FAST / Midtrans / Xendit) memerlukan perjanjian kerja sama legal dengan BPD Bali atau bank mitra.

---

## 2. Asumsi Operasional Pilot

1. **Zona Wilayah Uji Coba**: Dibatasi pada Banjar percontohan (Kecamatan Sukawati, Gianyar dan Denpasar Selatan).
2. **Konektivitas Lapangan**: Diasumsikan petugas mengalami *blank spot* seluler sesekali; mekanisme *offline mutation queue* di client mobile telah terverifikasi aman untuk skenario ini.
3. **Ambang Batas Toleransi Deviasi Timbangan**: Disetel secara default sebesar $5\%$ antara timbangan awal petugas dan timbangan pos masuk TPS3R.
