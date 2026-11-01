# KEDAS — FRONTEND REDESIGN FINAL HANDOVER

**Product:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Tagline:** Bergerak Bersama untuk Lingkungan yang Lebih Bersih  
**Design Authority:** `docs/design/design_web.md`  
**Completion Date:** 30 October 2026  
**Implementation Scope:** Frontend Web Experience, Design System, AI Interactions, and QA  

---

## 1. Executive Summary

The Kedas frontend web experience has been successfully redesigned, refined, and verified across all 7 stages in strict accordance with the binding design authority `docs/design/design_web.md`.

The resulting web interface is:
- **Grounded & Editorial:** Built on a calm warm ivory canvas (`#F6F6F1`), deep forest typography (`#122620`), evergreen action surfaces (`#1D3F35`), and authentic local context rooted in Bali's Pergub No. 47/2019.
- **Reference-Compliant:** Adopts the primary identity cues of Reference 1 (two-tier dark evergreen utility strip and clean white navigation) and reinterprets the photography-led, editorial section rhythm of Reference 2 (Wastex) without copying foreign branding, watermarks, or stock templates.
- **Anti-Pattern Free:** Strictly free from neon gradients, floating glowing orbs, fake AI brains, repetitive card grids, emoji iconography, inert buttons, or fabricated carbon impact claims.
- **Transparent in AI:** EcoGuide, Vision, and Operations Copilot expose their inputs, outputs, source document citations, data provenance levels, and mandatory human confirmation checkpoints.

---

## 2. Key Pages & Workspaces

### A. Public Destination Portal
- **Homepage (`/`):**
  - Editorial split hero: 56% copy with context pill + 44% focal operational status card.
  - 4 visual service tiles: Panduan Pilah, Penjemputan, Waste Passport, dan Area Layanan.
  - Asymmetric community mosaic explaining the connected destination ecosystem.
  - Dark evergreen section highlighting Kedas AI capabilities.
  - 5-step operational timeline matching the real state machine.
  - Truthful pilot area highlight (Ubud, Sukawati, Sanur).
  - WAI-ARIA accessible FAQ accordion with keyboard support.
- **Area Layanan (`/area-layanan`):** Searchable service areas, CDOA agreements, and active collection slot quotas.
- **Panduan Pilah (`/panduan`):** 4 standardized categories (Organik, Daur Ulang, Residu, B3) with preparation guides and contamination limits.
- **FAQ & Bantuan (`/faq`):** Accessible accordion answering resident and operator questions.
- **Guest Green Companion (`/guest`):** No-login destination guide for tourists with local rules and EcoGuide assistant.

### B. Role-Based Workspaces
- **Resident Portal (`/app`):** Overview of pickups, next appointment, Waste Passport detail, Points history, and deposit requests.
- **Field Staff POS (`/staff`):** High-contrast outdoor terminal, task queue, digital scale weighing (gross, tare, net), inspection checklist, photo evidence upload, and offline sync outbox.
- **Admin Console (`/admin`):** Operational metrics, service area quota management, collector review, knowledge base ingestion, and audit logs.
- **Green Hospitality (`/hospitality`):** Daily commercial waste logging, verified manifest audit trail, and internal ESG ledger.

---

## 3. How to Run Locally

### Prerequisites
- Node.js v18+ (tested on Node v22)
- Python 3.11+ (backend FastAPI running on port 8000)

### Running the Services

1. **Start Backend (if not already running):**
   ```powershell
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend Web Application:**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Open in Browser:**
   - Public Website: `http://localhost:3000`
   - Resident Workspace: `http://localhost:3000/app`
   - Staff POS Workspace: `http://localhost:3000/staff`
   - Admin Console: `http://localhost:3000/admin`
   - Hospitality Workspace: `http://localhost:3000/hospitality`
   - Guest Companion: `http://localhost:3000/guest`

4. **Default Demonstration Account:**
   - **Email:** `admin@kedas.bali`
   - **Password:** `AdminKedas2026!`

---

## 4. Verification & QA Evidence

- **TypeScript Typecheck:** `tsc --noEmit` &rarr; **0 errors**.
- **Vitest Unit & Integration:** 13 test files passed, 116 tests passed (100%).
- **Next.js Production Build:** `next build` &rarr; **44 routes compiled with 0 errors and 0 linter warnings**.
- **Accessibility:** Visible focus rings (`:focus-visible`), WAI-ARIA expanded/control attributes on accordions and modals, and `@media (prefers-reduced-motion: reduce)`.
- **Backend & Mobile Code:** 0 backend files modified; 0 mobile files deleted.
