# WasteLink Bali — Frontend Architecture Decisions & Engineering Standards

Dokumen ini mencatat seluruh keputusan arsitektural dan standar rekayasa (*decision log*) untuk frontend WasteLink Bali (Web & Mobile User).

---

## 1. Keputusan Stack & Arsitektur Monorepo/Struktur Direktori

### ADR-FE-001: Next.js App Router (TypeScript + Tailwind CSS) untuk Web Portal & Mobile User Simulator
* **Konteks**: Sistem WasteLink Bali memiliki tiga workspace web dengan kebutuhan berbeda:
  1. **User/Warga Web**: Responsif, ramah perangkat sentuh, alur wizard pembuatan setoran.
  2. **Petugas Sampah Web**: Desktop pos operasional TPU, antrean tugas, formulir inspeksi & penimbangan dengan validasi desimal, penanganan konkurensi klaim tugas.
  3. **Admin/Operator Web**: Dashboard metrik agregat, verifikasi petugas, master data, batching material, pelaporan WITA, audit log.
  4. **Mobile User App**: Pengalaman warga di smartphone dengan navigasi 5 tab tetap (Beranda, Setor, Aktivitas, Poin, Profil).
* **Keputusan**: Mengimplementasikan frontend web modern dalam direktori `frontend/` menggunakan **Next.js 15 (App Router)** + **TypeScript Strict** + **Tailwind CSS** + **Lucide Icons** + **TanStack Query** (React Query) + **Zod**.
  - Menyediakan workspace route terisolasi: `(public)`, `app` (User), `staff` (Petugas), `admin` (Admin/Operator), dan `mobile` (Dedicated interactive mobile simulator).
  - Menyediakan package tokens terpusat yang dapat diimpor langsung oleh web maupun target React Native/Expo.
* **Konsekuensi**:
  - Arsitektur Next.js App Router memisahkan layout antarmuka secara tegas (`layout.tsx` per subfolder), mencegah kebocoran layout antar role.
  - Backend di `backend/` tetap utuh tanpa gangguan struktur repositori.

---

## 2. Strategi Autentikasi & Manajemen Sesi

### ADR-FE-002: Dual-Mode Token & Cookie Session Management
* **Konteks**: Backend WasteLink Bali mengadopsi token sesi berbasis server (*opaque session token*, SHA-256) yang dikembalikan dalam response JSON (`session_token`) sekaligus diatur dalam header `Set-Cookie` (`wastelink_session`, HttpOnly).
* **Keputusan**:
  - Web client menyertakan `credentials: "include"` pada seluruh request fetch untuk mendukung cookie browser otomatis, DAN menyimpan token sesi di memori / session manager untuk meneruskan header `Authorization: Bearer <session_token>`.
  - Auth context (`AuthContext` / `useAuth`) memelihara status eksplisit: `INITIALIZING`, `ANONYMOUS`, `AUTHENTICATED`, `SESSION_EXPIRED`.
  - Pada status `401 Unauthorized` atau `403 Forbidden (SUSPENDED)`, sesi lokal dicabut seketika, cache query dibersihkan, dan pengguna dialihkan ke `/masuk` dengan pesan ramah.
  - Parameter `active_role` hanya digunakan sebagai preferensi konteks UI; hak akses diuji dan ditegakkan oleh server pada setiap pemanggilan endpoint.

---

## 3. Design System: "Calm Field Operations"

### ADR-FE-003: Palet Warna & Token Visual Konsisten
Sesuai arahan `designweb.md` dan `designapps.md`, antarmuka menggunakan palet tenang dan profesional:
- `brand-900`: `#1D3F35` (Sidebar aktif, heading dominan)
- `brand-700`: `#2F6552` (Tombol utama, aksen interaktif)
- `brand-100`: `#E8F0E9` (Surface aksen, selected item)
- `canvas`: `#F6F6F1` (Latar belakang aplikasi)
- `surface`: `#FFFFFF` (Panel, kartu, dialog, tabel)
- `text-primary`: `#1E2A25` (Teks judul & badan)
- `text-secondary`: `#5D6B63` (Teks pendukung & helper)
- `border`: `#DCE3DD` (Pembatas & garis tabel)
- `warning`: `#98631C` / `warning-bg`: `#FFF4D9`
- `danger`: `#A43F35` / `danger-bg`: `#FBEAE7`
- `info`: `#315F86` / `info-bg`: `#EAF2F9`
- `success`: `#276749` / `success-bg`: `#E7F4EA`
- Focus ring: `3px solid #83b6a0` (Visible focus outline untuk aksesibilitas keyboard).

---

## 4. Penanganan Kesalahan & Integritas Data

### ADR-FE-004: Standardized Error Envelope Handling & Anti-Fake UI
* **Konteks**: Klien tidak boleh mengasumsikan sukses jika server mengembalikan error, dan tidak boleh menampilkan angka simulasi seolah-olah data server.
* **Keputusan**:
  - Response error backend selalu diparse sesuai format:
    ```json
    {
      "code": "ERROR_CODE",
      "message": "Pesan deskripsi dalam Bahasa Indonesia",
      "request_id": "uuid",
      "details": []
    }
    ```
  - Penanganan spesifik HTTP code:
    - `401`: Sesi berakhir -> redirect ke `/masuk`.
    - `403`: Akses ditolak / Akun disuspend -> tampilkan banner izin / suspensi.
    - `409`: Konflik status / slot penuh / tugas sudah diambil -> tampilkan peringatan kontensi dan refresh data terbaru secara otomatis.
    - `422`: Validasi data / Safety gating (e.g. sampah `SPECIAL` ditolak) -> tandai field yang tidak valid.
    - `5xx` / Network Error: Tampilkan `ErrorState` ramah dengan tombol *Coba Lagi* aman.
  - Data mock hanya diisolasi dalam development fixtures dengan label visual tegas: `"Pratinjau Data (Mode Pengujian)"`.

---

## 5. Strategi Pengujian Frontend

### ADR-FE-005: Vitest & React Testing Library
* **Konteks**: Pengujian frontend harus memverifikasi perilaku komponen nyata, format token, validasi form, dan isolasi route, bukan snapshot statis.
* **Keputusan**: Menggunakan **Vitest** + **@testing-library/react** + **jsdom** untuk eksekusi unit dan component test yang cepat dan akurat.
