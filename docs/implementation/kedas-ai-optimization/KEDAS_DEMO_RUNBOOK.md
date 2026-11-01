# KEDAS DEMO RUNBOOK & COMPETITION WALKTHROUGH
## Step-by-Step Evaluator Guide | AI Web Innovation Challenge
**Product:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Target Audience:** Hackathon Judges, Technical Evaluators, and Demonstration Reviewers  
**Execution Time:** ~8 - 10 Minutes Total  

---

## 1. Quick Setup & Environment Launch

### Prerequisites
- Node.js 18+ and Python 3.11+
- Working directory: Repository root

### Launch Instructions
```bash
# Terminal 1: Backend API
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend Web Experience
cd frontend
npm run dev
```

Open browser at: `http://localhost:3000`

---

## 2. Walkthrough Flow 1: Public Experience & Destination Operating Rules (GAP-001)

1. **Navigate to:** `http://localhost:3000/area-layanan`
2. **Observe:**
   - Dynamic CDOA Destination Directory bound to real backend APIs.
   - Live status badges: `AKTIF (CDOA Berlaku)`, `KAPASITAS TINGGI`, `TERJADWAL`.
   - Search bar: Type `"Tengah"` or `"Ubud"` to filter destinations in real-time.
   - Click on any destination card (e.g. *Banjar Tengah Desa Sayan*) to expand operating rules:
     - Operating hours, daily quota, SLA response time.
     - Accepted waste categories (Organik, Plastik, Kaca, Logam).
     - Official escalation contacts for Kelian Dinas / TPS3R coordinator.

---

## 3. Walkthrough Flow 2: Kedas EcoGuide & Kedas Vision

1. **Trigger EcoGuide:**
   - Click on the floating **Kedas EcoGuide** widget in the bottom-right corner of any page.
   - Switch language between **Indonesia** and **English**.
   - Type query: `"Bagaimana cara memilah sampah sisa upakara bunga canang di Gianyar?"`
   - Observe: Grounded, authentic local response citing specific Gianyar regulations without hallucination.
   - Click the Thumbs Up / Down button to test the telemetry feedback loop.
2. **Trigger Kedas Vision:**
   - In deposit flow (`/setor-sampah` or via EcoGuide), select image upload or click "Uji Coba Verifikasi AI".
   - Observe: High-confidence classification (*Botol Plastik PET Bening*, 94% confidence).
   - Notice the **Mandatory Human Confirmation Gate**: the classification remains a suggestion until the citizen explicitly approves it.
   - EXIF/GPS metadata is stripped automatically on the server for citizen privacy.

---

## 4. Walkthrough Flow 3: Operations Copilot & Action Proposals (GAP-002)

1. **Navigate to:** `http://localhost:3000/admin/laporan`
2. **Observe:**
   - **Kedas Operations Copilot Panel** at the top of the page.
   - Switch between intent tabs: *Prioritas Tugas*, *Kapasitas Fasilitas*, *Deteksi Anomali*.
   - In recommendation card, observe the **Action Proposal**:
     - Action type: `ADJUST_SERVICE_SLOT` or `CREATE_STAFF_TASK`.
     - Click **"Review & Setujui Aksi"**.
   - **Action Proposal Modal opens:**
     - Displays current state vs proposed parameter adjustment.
     - Allows admin to edit parameters (e.g. increase slots from 12 to 16).
     - Click **"Konfirmasi & Eksekusi Perubahan"**.
     - System executes through domain API and writes audited diff to `audit_logs`.

---

## 5. Walkthrough Flow 4: Knowledge Administration UI (GAP-007 & GAP-003)

1. **Navigate to:** `http://localhost:3000/admin/pengetahuan`
2. **Observe:**
   - Knowledge Document Repository with document count, chunk count, and destination filters.
   - Click **"Unggah Dokumen Baru"**:
     - Type document title, category, destination scope, and sample markdown content.
     - Notice the **Real-Time Chunk Estimator**: preview chunk breakdown dynamically before saving.
   - In the document table:
     - Toggle status badge between `PUBLISHED`, `DRAFT`, and `RETIRED`.
     - Click the **Inspect (Eye)** icon to open the **Cryptographic Provenance Modal**:
       - Displays document SHA-256 hash, chunk boundary list, and citation references.

---

## 6. Walkthrough Flow 5: Green Hospitality Workspace (GAP-004)

1. **Navigate to:** `http://localhost:3000/hospitality`
2. **Observe:**
   - HOREKA-specific operational dashboard.
   - Tenant switcher: Toggle between *Alila Ubud*, *Maya Sanur*, and *Kayumanis*.
   - Key KPIs: Total Timbulan, Tingkat Diversi (84.6%), Emisi Terhindar, and Kuota CDOA Hari Ini.
   - Verified B2B pickups table linked to destination facilities.
3. **Explore Sub-Pages:**
   - **`/hospitality/setoran`**: Form to record daily kitchen waste intake per shift with Kedas Vision purity audit.
   - **`/hospitality/esg`**: Comprehensive Green Tourism ESG compliance report with material fraction breakdown, physical manifest audit trail, and IPCC carbon disclaimer.
   - **`/hospitality/guest-companion`**: Multilingual guest companion guide with switchable languages (Indonesian, English, Japanese, Russian) and printable QR code card.
   - **`/hospitality/lapor`**: Community EcoLoop reporting form for waste overflows in tourist corridors.

---

## 7. Walkthrough Flow 6: Scoped Offline Weighing Outbox (GAP-005)

1. **Navigate to:** `http://localhost:3000/staff/tugas/pick_sukawati_001`
2. **Simulate Offline Mode:**
   - Open Chrome DevTools (`F12`), go to the **Network** tab, and toggle throttling to **Offline**.
3. **Observe:**
   - The **Offline Outbox Queue Banner** immediately appears: *"Mode Offline Lapangan Aktif — Hasil timbang disimpan secara lokal di perangkat."*
4. **Input Weighing:**
   - Enter gross weight (e.g. `45.0` kg) and submit.
   - Notice the toast confirmation: *"Mode Offline: Timbangan diamankan ke antrean lokal perangkat."*
5. **Simulate Reconnect:**
   - In DevTools, toggle Network back to **Online**.
   - Notice auto-sync banner and click **"Sinkronkan"**.
   - The queued weighing is replayed and committed cleanly!

---

## 8. Walkthrough Flow 7: DCLI Radar & Mass-Balance Analytics (GAP-006)

1. **Navigate to:** `http://localhost:3000/admin/laporan`
2. **Scroll to:** **Destination Clean Loop Index (DCLI) Radar Chart**
3. **Observe:**
   - Dynamic 5-dimensional SVG radar chart:
     1. Pemilahan di Sumber
     2. Keterlacakan Angkut
     3. Diversi Olah Organik
     4. Sirkularitas Nilai
     5. Minimasi Residu TPA
   - Switch destinations using dropdown (*Ubud Green Corridor* vs *Sanur Coastal Destination* vs *Kuta Urban Destination*).
   - Notice how the score polygon dynamically transforms and dimension metrics update.
   - Inspect the **Mass-Balance Reconciliation Bar**:
     - Mathematical balance: Input = Organic + Recyclable + Residual + Storage + Loss.
     - Variance indicator: `0.38% (Toleransi < 2%)`.
     - Official IPCC carbon avoidance factor methodology disclaimer.
