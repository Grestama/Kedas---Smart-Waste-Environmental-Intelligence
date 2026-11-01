# KEDAS — Web Design System
## AI-Powered Community & Green Tourism Interface System

> **Versi:** 1.0  
> **Tanggal:** 30 Oktober 2026  
> **Cakupan:** Public website, authenticated workspace, admin/operations, HOREKA, community, facility, guest QR, dan AI interaction components.

---

## 1. Design Direction

### 1.1 Brand idea

**Kedas** berasal dari kata Bali yang bermakna bersih. Identitas visual harus menyampaikan kebersihan, keteraturan, kepercayaan, kearifan lokal, dan kecerdasan teknologi tanpa tampil seperti dashboard template atau aplikasi green-tech generik.

Tagline: **Bergerak Bersama untuk Lingkungan yang Lebih Bersih.**

Product descriptor: **AI-powered Community & Green Tourism Intelligence Platform.**

### 1.2 Visual concept

- **Island modernity:** hangat, natural, dan terinspirasi material/landscape Bali secara abstrak, bukan dekorasi budaya yang berlebihan.
- **Operational clarity:** tabel, status, angka, dan alur kerja harus mudah dipindai.
- **AI with evidence:** jawaban AI divisualisasikan bersama sumber, status confidence, dan konteks data.
- **Human-centered:** antarmuka tidak menghakimi warga/petugas dan tidak mempermalukan komunitas.

### 1.3 Avoid

- Neon green/cyberpunk sebagai default.
- Gradient di semua card.
- Dekorasi daun berulang sebagai pengganti visual hierarchy.
- Animasi terus-menerus pada halaman operasional.
- AI chat bubble yang menutupi tindakan utama.
- Chart tanpa definisi, periode, unit, dan provenance.
- Badge warna yang menyampaikan status tanpa teks.

---

## 2. Design Principles

1. **Clarity before decoration:** tindakan berikutnya harus jelas.
2. **Evidence before claims:** angka dan jawaban memiliki sumber.
3. **Role-aware, not role-fragmented:** satu sistem, workspace sesuai pekerjaan.
4. **Progressive disclosure:** detail teknis muncul saat dibutuhkan.
5. **Accessible by default:** keyboard, screen reader, contrast, reduced motion.
6. **Responsive web:** alur utama tetap tersedia di browser ponsel.
7. **Calm operational UI:** dashboard profesional dan tidak bising.
8. **AI must be distinguishable:** konten AI, sumber, confidence, dan keputusan manusia memiliki visual berbeda.

---

## 3. Color Tokens

### 3.1 Brand palette

| Token | Hex | Usage |
|---|---|---|
| `kedas-forest-950` | `#12352E` | Primary dark / wordmark / headings |
| `kedas-forest-800` | `#1C5143` | Primary button / navigation |
| `kedas-forest-700` | `#276B56` | Primary hover / links |
| `kedas-leaf-600` | `#43856A` | Secondary positive emphasis |
| `kedas-mint-100` | `#E3F1E9` | Soft surface / callout |
| `kedas-mint-50` | `#F3F8F4` | Canvas tint |
| `kedas-sand-100` | `#F2EBDD` | Warm neutral section |
| `kedas-sand-50` | `#FAF8F3` | Public background |
| `kedas-ink-950` | `#202B27` | Main text |
| `kedas-ink-700` | `#46534D` | Secondary text |
| `kedas-ink-500` | `#718078` | Muted text |
| `kedas-line` | `#DDE5DE` | Border/divider |
| `kedas-ocean-700` | `#28657A` | Information/data visualization |
| `kedas-amber-700` | `#94601D` | Warning |
| `kedas-red-700` | `#A84442` | Error/destructive |

### 3.2 Semantic colors

| Semantic token | Light | Usage |
|---|---|---|
| `--color-bg` | `#FAF8F3` | App background |
| `--color-surface` | `#FFFFFF` | Cards/panels |
| `--color-surface-muted` | `#F3F8F4` | Secondary surface |
| `--color-text` | `#202B27` | Main text |
| `--color-text-muted` | `#64736A` | Supporting text |
| `--color-border` | `#DDE5DE` | Border |
| `--color-primary` | `#1C5143` | Primary action |
| `--color-primary-hover` | `#276B56` | Hover |
| `--color-success` | `#28724F` | Confirmed/complete |
| `--color-warning` | `#94601D` | Pending/attention |
| `--color-danger` | `#A84442` | Error/rejected |
| `--color-info` | `#28657A` | Information |
| `--color-ai` | `#5365A6` | AI-generated content marker; never imply verified |

### 3.3 Dark mode

Dark mode may be added after light mode is stable. If implemented, maintain contrast and semantics; do not simply invert hex colors. Charts require separate accessible palette. Dark mode is P2 unless the existing app already supports it.

### 3.4 CSS variables

```css
:root {
  --kedas-forest-950: #12352e;
  --kedas-forest-800: #1c5143;
  --kedas-forest-700: #276b56;
  --kedas-leaf-600: #43856a;
  --kedas-mint-100: #e3f1e9;
  --kedas-mint-50: #f3f8f4;
  --kedas-sand-100: #f2ebdd;
  --kedas-sand-50: #faf8f3;
  --kedas-ink-950: #202b27;
  --kedas-ink-700: #46534d;
  --kedas-ink-500: #718078;
  --kedas-line: #dde5de;
  --kedas-ocean-700: #28657a;
  --kedas-amber-700: #94601d;
  --kedas-red-700: #a84442;
  --color-ai: #5365a6;

  --color-bg: var(--kedas-sand-50);
  --color-surface: #ffffff;
  --color-surface-muted: var(--kedas-mint-50);
  --color-text: var(--kedas-ink-950);
  --color-text-muted: var(--kedas-ink-700);
  --color-border: var(--kedas-line);
  --color-primary: var(--kedas-forest-800);
  --color-primary-hover: var(--kedas-forest-700);
  --radius-card: 16px;
  --radius-control: 10px;
  --shadow-card: 0 8px 28px rgba(18, 53, 46, 0.06);
}
```

---

## 4. Typography

### 4.1 Font system

- Heading: **Plus Jakarta Sans** (or locally available equivalent).
- Body/UI: **Inter** (or system sans fallback).
- Numeric/metric: Inter with tabular numbers.
- Fallback: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

Do not make external font service a runtime dependency if network availability is uncertain. Self-host only if license and repository policy permit.

### 4.2 Scale

| Token | Size / line-height | Usage |
|---|---|---|
| `display` | 48/56 | Landing hero only |
| `h1` | 32/40 | Page title |
| `h2` | 24/32 | Section title |
| `h3` | 20/28 | Card/major panel title |
| `h4` | 16/24 | Subsection |
| `body-lg` | 16/26 | Intro/long text |
| `body` | 14/22 | Default UI |
| `body-sm` | 13/20 | Helper text |
| `caption` | 12/18 | Metadata |
| `label` | 12/16, 600 | Form label |

Use sentence case. Avoid all-caps headings except compact metadata labels.

---

## 5. Spacing, Grid, Radius, and Elevation

### 5.1 Spacing scale (4px base)

`space-1: 4px`, `space-2: 8px`, `space-3: 12px`, `space-4: 16px`, `space-5: 20px`, `space-6: 24px`, `space-8: 32px`, `space-10: 40px`, `space-12: 48px`, `space-16: 64px`, `space-20: 80px`.

### 5.2 Layout

- Main content max width: 1440px (dashboard), 1200px (public content), 760px (long form/reading).
- Desktop dashboard: 12-column grid; 24px gutter.
- Tablet: 8-column; 20px gutter.
- Mobile: 4-column; 16px gutter.
- Sidebar desktop: 248px expanded, 72px collapsed where supported.
- Page padding: 32px desktop, 24px tablet, 16px mobile.

### 5.3 Breakpoints

- `sm: 640px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`
- `2xl: 1536px`

### 5.4 Radius and elevation

- Small control: 8–10px.
- Card: 14–16px.
- Modal/drawer: 18px.
- Pill: 999px.
- Shadows are subtle; rely on border and spacing rather than deep shadows.

---

## 6. Iconography and Illustration

- Use one icon family consistently (e.g. Lucide) with consistent 1.75–2px stroke.
- Icon size: 16px inline, 18–20px control, 24px feature, 32px empty state.
- Every icon-only button needs accessible name/tooltip.
- Illustrations should use restrained editorial line/shape style, not stock-photo collage in dashboards.
- Photography is appropriate for landing page, guest guide, and material examples; avoid decorative photos in dense task tables.

---

## 7. Component Inventory

### 7.1 Foundations

- Button: primary, secondary, outline, ghost, destructive, loading, disabled.
- IconButton with accessible label.
- Input, textarea, select, combobox, date range, numeric input, file upload.
- Checkbox, radio, switch, segmented control.
- Tooltip, popover, dropdown menu.
- Tabs, breadcrumbs, pagination.
- Modal, drawer, confirmation dialog.
- Toast, inline alert, banner.
- Skeleton, spinner, empty state, error state.

### 7.2 Data components

- Metric card with label/value/unit/period/delta/provenance.
- Table with server pagination, sort/filter, row actions, responsive strategy.
- Status badge with text + optional icon; never color-only.
- Timeline/event list.
- Chart card with title, period, unit, source, accessible summary.
- Capacity gauge with numeric remaining capacity and freshness state.
- Material tag/category chip.
- Evidence attachment preview.

### 7.3 Kedas domain components

| Component | Purpose | Required states |
|---|---|---|
| `DestinationSwitcher` | Select destination/workspace | loading, no membership, selected |
| `CDOARulePanel` | View applicable local rule | published, draft, expired |
| `MaterialGuideCard` | Show material preparation | accepted, conditional, not accepted, unknown |
| `WastePassportHeader` | Show passport ID/category/current state | active, exception, completed |
| `PassportTimeline` | Trace events | pending, verified, rejected, correction |
| `FacilityCapacityCard` | Show accepted categories/capacity | available, near-full, full, unknown, offline |
| `HospitalityLedgerTable` | HOREKA records | self-reported, verified, disputed |
| `CommunityActivityCard` | Community programs | open, ongoing, closed |
| `GuestQRLanding` | Public destination entry | live, inactive, not found |

### 7.4 AI components

**`AIAssistantPanel`**
- persistent but dismissible panel;
- clear product identity (`Kedas EcoGuide`);
- input, suggested prompts, streaming state, error and quota state;
- no hidden auto-submit.

**`AICitationList` / `AICitationCard`**
- source title, version/date, section/page, link or source detail;
- distinguish official/local/internal source;
- show “source expired” warning if appropriate.

**`AIConfidenceIndicator`**
- label high/medium/low or review-needed;
- text explanation, not color-only.

**`AISuggestionReview`**
- AI candidate vs user/manual selection;
- confirm/edit/reject controls;
- explicit note that AI output is a suggestion.

**`OperationRecommendationCard`**
- recommendation, reason, constraints passed, missing/stale data, alternatives;
- explicit “review and continue” action leading to normal workflow.

**`AIDataProvenance`**
- metric snapshot ID, period, source categories, last updated.

**`AIAbstainState`**
- explains insufficient/ambiguous evidence;
- recommends a safe next step.

---

## 8. Design Patterns by Workspace

### 8.1 Public destination / Guest Green Companion

- warm landing page with destination selector or QR context;
- quick links: sorting guide, local rules, service information, report issue if public workflow exists;
- EcoGuide prominent but not obstructive;
- language switch ID/EN;
- display public sources/update date;
- no personal data requirement by default.

### 8.2 Warga

- simple dashboard showing next action, current requests, points/history if supported;
- EcoGuide quick ask;
- Vision upload integrated with sorting guide;
- large clear CTA; plain language.

### 8.3 HOREKA

- organization context visible;
- period filter and ledger;
- cards separated into self-reported vs verified;
- report generator with preview, sources, and limitations;
- exception list at top when action required.

### 8.4 Petugas and facility

- work queue, next action, short task details;
- big touch targets for mobile browser;
- no unnecessary motion;
- acceptance/capacity and exception state explicit;
- AI suggestions do not replace confirmation steps.

### 8.5 Community coordinator

- upcoming activities, open issues, verified participation;
- community targets with realistic context;
- no shame-based leaderboard;
- aggregate view for residents unless user consents.

### 8.6 Admin/operator

- data table and filters;
- audit and pending approvals;
- knowledge freshness and publish queue;
- facility capacity/acceptance configuration;
- AI provider usage/error dashboard.

---

## 9. Motion and Interaction Guidelines

### 9.1 Duration

- micro interaction: 100–160 ms;
- control feedback: 140–200 ms;
- panel/drawer: 180–260 ms;
- route/page transition: 180–280 ms, only when it does not slow navigation.

### 9.2 Allowed motion

- button press/hover feedback;
- subtle card elevation;
- accordion and drawer transitions;
- skeleton shimmer only if restrained;
- progress indication for file upload and AI generation;
- timeline reveal on first view;
- success confirmation after explicit user action.

### 9.3 Disallowed motion

- continuous decorative animations in task screens;
- forced parallax that affects readability;
- motion-only status changes;
- animated charts that delay access to data;
- bouncing/pulsing CTA loops;
- auto-playing video/audio.

### 9.4 Reduced motion

When `prefers-reduced-motion: reduce`, eliminate nonessential movement and replace transition with instant state change or opacity only.

---

## 10. Accessibility Standards

- WCAG 2.2 AA target.
- Contrast at least 4.5:1 for normal text, 3:1 for large text/UI boundaries where applicable.
- Full keyboard support; focus visible and not trapped incorrectly.
- Every control has accessible name; form errors associated to field.
- Tables have headings and responsive alternative.
- Charts include text summary/table alternative.
- Do not rely on green/red alone.
- Dialog manages focus and restores it when closed.
- Screen reader announces AI generation status without repeating every token.

---

## 11. Responsive Behavior

| Area | Desktop | Tablet | Mobile browser |
|---|---|---|---|
| Public hero | Split content/media | Stacked/split | Stacked |
| Dashboard | Sidebar + main + optional panel | Collapsible nav | Compact top/nav drawer |
| Tables | Full data table | Hide low-priority columns | Card rows or horizontal scroll with label |
| AI assistant | Side panel or integrated | Drawer | Full-height sheet/page |
| Form | Two columns where useful | One/two columns | One column |
| Timeline | Horizontal if meaningful | Vertical | Vertical |
| Chart | 2–3 columns | 2 columns | 1 column |

---

## 12. Content and Microcopy

- Use clear Bahasa Indonesia, active voice, and short instructions.
- Do not use “AI memastikan” for uncertain output; use “AI menyarankan”.
- Use status terms consistently: `Menunggu`, `Dijadwalkan`, `Dalam proses`, `Perlu verifikasi`, `Terverifikasi`, `Ditolak`, `Selesai`—map to actual backend enums.
- Explain why a material is unavailable and what alternative is safe.
- Use source date labels: “Diperbarui 30 Okt 2026”.
- Avoid unsupported environmental claims such as “menyelamatkan X pohon” without a validated methodology.

---

## 13. Design QA Checklist

- [ ] Design tokens used; no random one-off colors/spacing.
- [ ] All components have hover/focus/disabled/loading/error states.
- [ ] AI output visually distinct from verified system data.
- [ ] Citation/source panel works with keyboard.
- [ ] Responsive layout validated at 360, 768, 1024, 1440 px.
- [ ] Contrast and focus tested.
- [ ] Reduced motion tested.
- [ ] Charts display units, period, provenance, and text summary.
- [ ] No fake live status or fake AI accuracy claim.
- [ ] Empty/error states helpful and actionable.
- [ ] No operation can be submitted accidentally due to animation/layout.

---

## 14. Implementation Notes

Before replacing the current visual system, inspect `designweb.md`, `designapps.md`, Tailwind config, global CSS, component library, existing tokens, and actual app routes. Build an incremental migration map. Do not replace all pages at once if it creates regressions. Preserve brand assets where still compatible and update obsolete WasteLink naming to Kedas only in user-facing surfaces while preserving technical IDs where required.
