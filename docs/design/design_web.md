# KEDAS — Web Design Direction & Frontend Design System

**Status:** Design specification / source of truth for frontend implementation  
**Product:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Tagline:** Bergerak Bersama untuk Lingkungan yang Lebih Bersih.  
**Scope:** Web public experience and role-based web workspaces. Native mobile application redesign is out of scope.  
**Reference basis:** The two visual references supplied by the product owner. The first image is the primary reference for Kedas identity and current visual language. The second image is a secondary reference for editorial composition, photography, page rhythm, and service storytelling—not a template to copy.

---

## 0. Design intent: what Kedas should feel like

Kedas must feel like a credible environmental service platform rooted in a real community and destination—not a generic SaaS dashboard, a recycled website theme, or an AI-generated landing page.

The visual personality is:

- **Grounded:** warm off-white surfaces, deep evergreen typography, restrained green accents, real contextual photography.
- **Editorial:** confident headlines, generous whitespace, asymmetric image compositions, clear section rhythm, concise copy.
- **Operational:** status, capacity, evidence, timestamps, and next actions are easy to scan.
- **Human:** show residents, community coordinators, field workers, hospitality operators, and facilities as real participants—not anonymous decorative stock imagery.
- **Intelligent, not theatrical:** AI features should look useful and explainable. Do not use glowing brains, robot illustrations, neon grids, fake terminal UI, or floating AI orbs.
- **Locally respectful:** use Bali context only when the location, partner, image, or story is verified. Do not invent banjar names, facility partnerships, certifications, or impact numbers.

### 0.1 Reference interpretation

**Reference image 1 — current Kedas website (primary identity reference):**

- A dark evergreen utility strip at the top with mode/role shortcuts.
- A separate white navigation bar containing the Kedas mark, primary public navigation, sign-in, and a strong registration CTA.
- A warm ivory/off-white page background.
- Deep green, oversized, left-aligned display typography.
- A small pale-green context pill above the hero headline.
- Muted slate-green body copy and a dark evergreen primary CTA.
- Strong negative space and simple, confident composition.

Keep these recognizable identity cues. Improve the layout and storytelling, but do not discard the existing Kedas identity.

**Reference image 2 — visual composition reference (secondary):**

Take inspiration from:

- A photograph-led hero with a strong focal image.
- A row of visual service shortcuts.
- Editorial split sections combining photography and concise explanatory copy.
- Offset photo collages with different image proportions.
- A darker, high-contrast section to create visual rhythm.
- A clear process/explanation section, FAQ, and strong footer close.

Do **not** copy its brand, logo, layout pixel-for-pixel, stock-photo choices, watermark, text, green button treatment, or generic waste-template visual language. Reinterpret only its content rhythm and photography-led storytelling in Kedas' own visual system.

### 0.2 Visual anti-patterns — prohibited

Do not implement:

- A generic AI landing page made of gradient blobs, glassmorphism panels, floating glowing circles, random orbit graphics, or neon cyan/purple accents.
- A wall of identical rounded cards. Not every section should be a card.
- Oversized rounded corners on every element. Use square/low-radius editorial surfaces for most content; reserve large radii for selected photos, dialogs, and feature panels.
- Fake KPI counters, fabricated carbon savings, fake partner logos, fake testimonials, fake maps, fake user avatars, or invented certification badges.
- Emoji as the primary icon system.
- Random Lucide icons on every heading just to decorate it.
- Unnecessary animations, parallax on every section, scroll hijacking, cursor trails, or auto-playing video with sound.
- Generic stock photos that imply a real Kedas partner, community, facility, or event when they are not genuine.
- Huge black/dark hero overlays that make the website feel like an unrelated waste-management template.
- A mobile-app mockup as the main hero visual. The current competition scope is web-first.
- Decorative dashboard charts without a clear unit, timeframe, source, or explanation.

---

## 1. Product and information architecture

Kedas is a web platform connecting community, destination operators, waste facilities, hospitality businesses, field staff, and material partners. The interface must make these distinct jobs understandable without forcing all roles into one generic dashboard.

### 1.1 Primary web experiences

1. **Public website** — explains Kedas, how the destination system works, sorting guidance, service areas, FAQ, and entry points to sign-in/registration.
2. **Resident workspace** — household profile, sorting guidance, collection/deposit requests, Waste Passport tracking, points/history, and community programs.
3. **Field staff / POS workspace** — assigned tasks, collection/receipt workflow, inspection, weighing entry, evidence, and synchronization status where supported.
4. **Admin / destination console** — destination and CDOA configuration, service areas, facility information, operations overview, knowledge management, DCLI, reports, and Copilot proposals.
5. **Facility workspace** — facility acceptance rules, capacity, intake, weighing, sorting/processing records, inventory, and material batches, subject to existing role/API support.
6. **Hospitality workspace** — daily waste records, pickups, destination evidence, monthly ledger, and reports for participating businesses, subject to existing role/API support.
7. **Community workspace** — community program, announcements, events, participation, issue reports, and community-level summaries, subject to existing role/API support.
8. **Guest Green Companion** — a public, no-login, mobile-friendly destination information experience. It is still a web page, not a native mobile app.

Do not create new authorization roles casually. Preserve existing account roles and use organization membership/permissions already supported by the backend. If an experience is not enabled by the current API or role model, show a clear not-enabled state or keep the route behind the existing authorization boundary—do not simulate access.

### 1.2 Navigation principles

- Keep the **utility role/mode strip** separate from the **main navigation**.
- The role strip is a workspace switcher, not a second copy of the main menu.
- Public navigation stays minimal: Beranda, Cara Kerja, Panduan Pilah, Area Layanan, Tentang Kedas, FAQ/Bantuan.
- Authentication actions remain visually distinct: Masuk (secondary text/button) and Daftar (primary CTA).
- Inside workspaces, use a role-aware sidebar or compact top navigation with clear active state, page title, breadcrumb where needed, and account/workspace switcher.
- Do not show links to a role that the current signed-in user cannot access.
- Hide legacy mobile simulator navigation from primary competition presentation unless it is intentionally retained as a clearly labelled legacy/demo route. Do not delete its route or backend assumptions without authorization.

---

## 2. Brand system

### 2.1 Brand attributes

| Attribute | Direction |
|---|---|
| Brand character | Calm, capable, community-rooted, transparent |
| Visual metaphor | A well-run destination ecosystem; material flows with clear provenance |
| Primary emotion | Trust and clarity, not fear or guilt |
| Density | Spacious for public/editorial pages; efficient and information-dense for workspaces |
| Voice | Plain Indonesian, active, specific, respectful; English only where user context calls for it |

### 2.2 Color tokens

The values below are a starting design token set sampled/estimated from the primary reference image. Verify contrast in implementation and adjust only when necessary; document any adjustment.

```css
:root {
  /* Brand */
  --kedas-forest-950: #122620; /* utility bar / deepest text */
  --kedas-forest-900: #16352D; /* primary brand surface */
  --kedas-forest-800: #1D3F35; /* primary CTA / headings */
  --kedas-forest-700: #285747; /* hover / selected */
  --kedas-leaf-600: #219B72;   /* restrained accent */
  --kedas-leaf-500: #2DBA87;   /* interactive accent, sparingly */

  /* Neutrals */
  --kedas-ivory-50: #F6F6F1;   /* page background */
  --kedas-paper-0: #FFFFFF;    /* nav / cards / form surfaces */
  --kedas-sage-100: #E8F0E9;   /* pill / subtle section surface */
  --kedas-sage-200: #D7E4D9;   /* soft borders */
  --kedas-slate-700: #53645E;  /* body copy */
  --kedas-slate-600: #64736D;  /* secondary copy */
  --kedas-slate-400: #9AA7A0;  /* disabled/muted */
  --kedas-border: #DDE3DD;

  /* Semantic */
  --kedas-success: #247A55;
  --kedas-warning: #A96C18;
  --kedas-danger: #B5473D;
  --kedas-info: #356F89;

  /* Status surface */
  --kedas-success-bg: #EAF4ED;
  --kedas-warning-bg: #FAF1E2;
  --kedas-danger-bg: #F9ECEA;
  --kedas-info-bg: #EAF2F6;
}
```

Rules:

- Evergreen is the main identity. Bright green is an accent, not a background for every CTA.
- Use warm off-white as the main public canvas, white for navigation and contained work surfaces.
- Do not use gradients as a default. A subtle photo overlay is allowed only to preserve text contrast on a photograph.
- Semantic colors indicate actual status only. Never use green to imply successful environmental impact if the record is pending or unverified.
- All text/background combinations must meet WCAG 2.2 AA contrast as far as applicable; do not rely on color alone to convey state.

### 2.3 Typography

Use the font family already installed in the repository if it is legible and consistent. Do not add multiple font families just for novelty. If the existing setup has no deliberate type system, use a restrained sans-serif family such as **Plus Jakarta Sans** for display/headings and **Inter** for body/UI, loaded with the project's existing local/Next font strategy. Avoid remote runtime font dependencies where possible.

| Style | Desktop | Mobile | Weight / line height | Use |
|---|---:|---:|---|---|
| Display XL | 64–76 px | 40–48 px | 750–800 / 0.98–1.05 | Public hero only |
| Display L | 52–60 px | 36–42 px | 750–800 / 1.02 | Major editorial statement |
| H1 | 40–48 px | 32–36 px | 700–750 / 1.08–1.15 | Page title |
| H2 | 32–38 px | 28–32 px | 700 / 1.15 | Section title |
| H3 | 22–26 px | 20–22 px | 650–700 / 1.2 | Feature title |
| Body L | 18–20 px | 17–18 px | 400–450 / 1.6 | Hero and lead copy |
| Body | 16 px | 15–16 px | 400 / 1.55–1.65 | Main text |
| UI | 14–15 px | 14 px | 500–600 / 1.4 | Navigation, controls |
| Caption | 12–13 px | 12 px | 450–500 / 1.45 | Metadata, helper text |

Typography rules:

- Use sentence case, not all-caps headings.
- Avoid letter spacing on normal paragraph text.
- Hero headline should wrap intentionally into 2–4 lines at desktop, not stretch across the whole viewport.
- Limit paragraph width to about 58–68 characters for reading comfort.
- Use tabular numerals for weights, points, percentages, and operational metrics.

### 2.4 Spacing, layout, shape, and elevation

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --radius-pill: 999px;

  --shadow-nav: 0 1px 0 rgba(18, 38, 32, .08);
  --shadow-card: 0 8px 24px rgba(18, 38, 32, .06);
  --shadow-popover: 0 16px 40px rgba(18, 38, 32, .14);
}
```

- Desktop content max-width: 1240–1320 px. Wide editorial photo sections may extend to 1440 px.
- Main horizontal gutter: 44–56 px desktop, 24–32 px tablet, 18–20 px mobile.
- Public section spacing: 88–120 px desktop, 64–80 px tablet, 48–64 px mobile.
- Workspace section spacing: 24–32 px; reduce decorative whitespace to preserve task efficiency.
- Prefer borders and whitespace over nested cards and heavy shadows.
- Use large radius only for photos, large feature panels, dialogs, and selected CTA surfaces. Inputs and table containers should remain functional, not bubbly.

### 2.5 Iconography

- Use the icon library already used by the repository (likely Lucide if present); do not install another icon package without need.
- Default stroke width around 1.75–2 px.
- Icons support meaning; labels must remain visible for key navigation and status.
- Use icons consistently for category, navigation, status, and action. Do not mix emoji, filled icons, outline icons, and illustrations arbitrarily.

---

## 3. Public homepage composition

The homepage should communicate what Kedas does in five seconds, show that it is grounded in a real workflow, and lead users to the right next action. It should not be a generic AI-first sales page.

### 3.1 Header

**Utility strip (approximately 44–48 px):**

- Evergreen background.
- KEDAS wordmark on the left, subtle divider, current mode label (e.g. Publik).
- Right-aligned workspace shortcuts available to the current context (Publik, Warga Web, Petugas, Admin). Use compact text + icon. Mark active mode with a lighter evergreen/gray-green surface.
- At narrow widths, collapse role shortcuts into a labelled workspace menu; never allow horizontal overflow.

**Main nav (approximately 84–92 px desktop):**

- White background and subtle bottom border.
- Left: Kedas mark and wordmark with small descriptor “LINGKUNGAN BERSIH & SIRKULAR”.
- Center: Beranda, Cara Kerja, Panduan Pilah, Area Layanan, Tentang Kedas, FAQ & Bantuan.
- Right: Masuk and primary Daftar CTA.
- Sticky behavior is optional; if enabled, keep it compact and do not create a second giant header while scrolling.

### 3.2 Hero

Use an editorial split layout rather than a plain text block spanning the entire canvas.

Desktop grid:

- 52–56% text column; 44–48% media column.
- Hero has a warm ivory background and generous top/bottom padding (76–100 px).
- Left column: context label (e.g. “Pilot kawasan komunitas • Bali” only if the pilot location is verified), one strong H1, body copy, two CTAs, optional small proof line.
- Right column: one dominant real photograph (community sorting/field operation/facility) with one smaller supporting crop or a quiet metadata caption. Do not turn this into a floating dashboard collage.

Suggested content direction (edit to match verified project status):

**Headline:** “Sampah kawasan lebih terkelola, dari sumber hingga tujuan.”

**Body:** “Kedas menghubungkan warga, komunitas, fasilitas pengolahan, dan usaha pariwisata. Informasi pemilahan, layanan, dan perjalanan material tersaji dalam satu alur yang dapat ditelusuri.”

**Primary CTA:** “Jelajahi cara kerja Kedas”  
**Secondary CTA:** “Masuk ke Kedas”

Do not claim “AI-powered” in every sentence. Explain AI in its own section with specific outcomes and limits.

Mobile hero:

- Stack text then image; keep H1 to a readable 3–5 lines.
- Primary CTA full-width or paired only if there is enough room.
- No decorative floating card that covers the photograph or CTA.

### 3.3 Service/entry tiles

After the hero, create a horizontal row or responsive 2x2 set of **four image-led entry tiles**. Each tile has a distinct photo crop, short title, and a single-line explanation. Examples:

1. Pilah dengan panduan yang tepat.
2. Ajukan atau pantau layanan.
3. Telusuri Waste Passport.
4. Kenali program kawasan.

Avoid four identical generic icon cards. Use photos with consistent color treatment and clear focal subjects. Clicking a tile must navigate to a real page/section, not an inert decorative surface.

### 3.4 Editorial “one destination, connected system” section

- Two-column composition: left is a 2x2 offset photo mosaic (not equal-size grid); right is a section label, headline, body, and a short numbered list.
- Suggested headline: “Satu kawasan. Banyak peran. Satu alur yang saling terhubung.”
- Explain how residents, staff, facilities, hospitality, and community coordinators fit together.
- Use authentic Kedas/pilot photos where available. If none exist, use clearly neutral illustrative imagery without implying a specific partner or event.

### 3.5 AI capabilities section

Use a deep evergreen section as a deliberate visual break, not as the background for every section.

Present the three AI capabilities as three editorial columns/rows with meaningful examples:

- **EcoGuide:** answers based on approved local knowledge and shows sources.
- **Vision:** suggests material category from an uploaded photo; human confirmation remains necessary.
- **Operations Copilot:** helps operators understand issues and prepare actions; authorized humans approve consequential changes.

Each capability must show: input → useful output → evidence/limitation. Avoid abstract AI artwork. Use a genuine product screenshot, small interaction preview, or simple workflow illustration.

### 3.6 How Kedas works

Show a four- or five-step horizontal process on desktop, vertical timeline on mobile. Suggested steps:

1. Kenali aturan kawasan.
2. Pilah dan catat material.
3. Koordinasikan pengumpulan.
4. Terima dan verifikasi di fasilitas.
5. Telusuri hasil pengelolaan.

The step sequence must reflect real backend workflow and status enums. Do not invent a step that the application cannot represent.

### 3.7 Service area / destination section

- Use a clean list/map split only when real geospatial data or a real map provider is available.
- Otherwise prioritize searchable service-area cards with location, accepted material categories, facility status, service schedule, and last-updated timestamp.
- Always display data freshness. Do not show a pin map with invented coordinates.
- Public page must be API-driven; no static hardcoded banjar/service data when a backend endpoint exists.

### 3.8 Impact / DCLI section

Show a restrained, evidence-based impact summary:

- Material collected / received / processed / handed over are separate concepts.
- Show period, unit, source, verification status, and update time.
- A DCLI score must expose its dimensions and data coverage. Avoid a single unexplained “green score”.
- If using sample/demo data, label it **Data simulasi** persistently and never mix it with real metrics.

### 3.9 Community and hospitality section

Use one editorial story block for community participation and one for hospitality operations. Avoid overloading the homepage with every role's full feature list. Provide a relevant CTA to learn more or sign in.

### 3.10 FAQ, final CTA, and footer

- FAQ uses accessible accordion behavior, keyboard support, and direct answers.
- Final CTA repeats one clear next step, not multiple competing buttons.
- Footer includes Kedas description, navigation, help/contact links only when valid, privacy/terms links if they exist, and a compact “data and impact are based on verified records” note where appropriate.

---

## 4. Workspace design patterns

Public pages are editorial and spacious. Workspaces are task-oriented and information-dense. Do not apply the public hero style to dashboards.

### 4.1 Shared workspace shell

- Persistent left sidebar on desktop, compact collapsible navigation on tablet/mobile.
- Main topbar includes page title/breadcrumb, current organization/destination where relevant, notifications if supported, and account menu.
- Page content begins with a clear page title, short context sentence, and primary action.
- Keep a consistent maximum content width; wide tables may use full available width.
- Preserve existing route paths and permission checks. Visual navigation must reflect the actual backend authorization.

### 4.2 Resident workspace

Priority modules:

- Overview: current requests, next scheduled service, recent Waste Passport, point balance only if retrieved from real API.
- New deposit/request: clear stepper, material selection, quantity or estimate inputs, pickup slot, confirmation.
- Vision assistance: upload/photo capture, loading, result, confidence/uncertainty, suggested category, facility rule, manual confirmation.
- Waste Passport detail: timeline, source, collection evidence, intake weight, discrepancy, facility processing, final destination when verified.
- History and points: filterable table/list with statuses and transaction evidence.
- Community: relevant announcements/programs.

Do not show successful setoran state before backend confirmation. If Vision is unavailable, provide manual category selection.

### 4.3 Field staff / POS workspace

- Default landing: today’s assigned/available tasks with priority, location label, material type, and status.
- Task detail: clear next action, resident/source info with privacy controls, map/deep link only if reliable location exists, checklist, evidence capture, weight/measurement, submit.
- Use large touch targets (minimum 44x44 CSS px) and high readability in outdoor conditions.
- Display connection/sync state where offline support exists. Do not present unsynced local data as server-confirmed.
- Confirmation states must distinguish saved locally, queued for sync, submitted, and accepted by server.

### 4.4 Admin / destination console

Primary modules:

- Destination/organization and CDOA settings.
- Service areas, schedule/quotas, and service eligibility.
- Facilities, capacity, accepted material rules, and maintenance status.
- Operations overview and anomaly list.
- Operations Copilot: recommendation evidence, alternative actions, pre-filled proposal, impact preview, approval/rejection, execution status, audit trail.
- Knowledge management: upload, metadata, review, approval, publish/version, archive, ingestion status.
- DCLI and reports: period, dimension, data coverage, trend, source, export.

The Copilot must never execute consequential actions directly from a model-generated response. The user must review a typed action proposal and the backend must enforce permission and validation.

### 4.5 Facility workspace

Where current API and permissions allow:

- Intake queue and expected arrival.
- Accepted/rejected rules per material category.
- Capacity utilization and alert thresholds.
- Weighing and discrepancy review.
- Sorting/processing batch and material inventory.
- Handover/sales and evidence.

Capacity and stock use clear units and timestamps. No capacity meter without a defined numerator/denominator.

### 4.6 Hospitality workspace

Where current API and permissions allow:

- Daily record of waste by category.
- Self-managed organic processing record, if supported.
- Pickup/collection request and evidence.
- Destination and Waste Passport history.
- Monthly Green Hospitality Ledger.
- Report export with period and verification status.

Do not present the interface as an official certification or legal compliance certificate.

### 4.7 Community workspace

Where current API and permissions allow:

- Community program overview.
- Events/clean-up schedule.
- Participation records.
- Announcements and issue reports.
- Community-level performance summaries.

Avoid public shaming or competitive ranking that exposes individual household performance.

### 4.8 Guest Green Companion

- No forced registration.
- Simple language toggle (ID/EN at minimum, only if translations exist).
- Destination-specific rules and visitor guidance.
- EcoGuide with cited local knowledge.
- Public service/facility information with current data timestamp.
- Mobile-first responsive web, fast loading, large touch targets.

---

## 5. Interaction and component standards

### 5.1 Buttons

- Primary: evergreen solid, white label, clear verb.
- Secondary: white/transparent with evergreen border/text.
- Tertiary: text button, reserved for low-priority actions.
- Destructive: red semantic style and explicit confirmation.
- Button labels describe results: “Ajukan penjemputan”, “Simpan perubahan”, “Tinjau rekomendasi”, not vague “Submit”.
- Every button must have an implemented action, a disabled state with reason, or not be rendered.

### 5.2 Forms

- Use visible labels, helper text, validation message, required indicator, and field-level errors.
- Preserve input after API errors.
- Validate at the field and form level; server validation remains authoritative.
- Do not rely on placeholder as the only label.
- Use stepper only for a genuinely sequential workflow.
- Confirm destructive or consequential actions.

### 5.3 Tables and lists

- Table header sticky only when useful; maintain mobile alternative card/list view.
- Numeric columns right-aligned and tabular.
- Include empty, loading, error, and pagination states.
- Filters must be reflected in query parameters when appropriate so the view can be refreshed/shared.
- Never fabricate row values to fill empty space.

### 5.4 Status and evidence

Use explicit status labels and a consistent semantic mapping. Status color must not be the only signal. Every evidence item should show at least relevant timestamp/source/type and verification state where available.

### 5.5 AI-specific components

**EcoGuide chat:**

- Distinguish user messages from AI answers without excessive bubble ornament.
- Show streaming or loading state only if the API supports it.
- Render citations/source cards with document title, version/date, relevant excerpt, and link where available.
- Include uncertainty/“belum ditemukan di sumber” state.
- Offer helpful next questions only if they are grounded in the current context.

**Vision result:**

- Show uploaded image and predicted category.
- Show confidence only if the backend provides a calibrated/meaningful value; otherwise omit numeric confidence.
- Show alternatives and why human confirmation is requested.
- Show facility acceptance rule separately from image model prediction.
- Provide “Ganti kategori” and “Konfirmasi” actions.

**Operations Copilot:**

- Every recommendation must show observed condition, data timestamp, reasoning summary, source metrics, assumptions, risks, and suggested action.
- Render action proposal as a structured review panel, not a chat-generated arbitrary form.
- Auto-fill only fields that are supported by the proposal schema. Clearly mark generated values.
- Show before/after impact preview only if computed by deterministic API or clearly labelled estimate.
- Require human approval for consequential action.
- Show execution result from server and provide rollback/compensation path when supported.

### 5.6 Notifications

- Toasts are for short transient feedback, not the only place to explain an error.
- Success toast only after successful server response.
- Persistent issues belong in inline alerts/activity center.
- No “success” toast for mocked or queued actions unless the label clearly says “Disimpan di perangkat” / “Menunggu sinkronisasi”.

---

## 6. Motion and feedback system

Motion should clarify hierarchy and system state. It must never make the interface feel like a template demo.

### 6.1 Allowed motion

- Subtle opacity/translate page entrance (120–220 ms).
- Button hover/focus transition (120–160 ms).
- Accordion height/opacity transition (160–220 ms).
- Dialog/popover entrance (140–200 ms).
- Progress indicator for a real asynchronous operation.
- Very restrained image reveal on initial viewport only; no repeated scroll spectacle.
- Number changes may animate only when value update is real and animation does not obscure comprehension.

### 6.2 Prohibited motion

- Auto-playing carousels.
- Parallax on every section.
- Scroll hijacking or snap scrolling on long content.
- Constantly pulsing status indicators without live data.
- Glowing AI rings, floating blobs, particle backgrounds, or cursor-following effects.
- Skeleton loading that never resolves or is used instead of an error/empty state.

### 6.3 Reduced motion

Respect `prefers-reduced-motion`. Disable non-essential transitions and reveal effects. All functionality must remain available with motion disabled.

---

## 7. Photography and image direction

The visual references rely on photography to create trust and texture. Kedas should use a small, intentional image library rather than hundreds of random photos.

### 7.1 Desired image categories

1. Real community members sorting or participating in a community activity.
2. Field workers and collection activities in context.
3. Actual or representative waste sorting/processing facilities.
4. Clean, well-lit material close-ups (plastic, paper, metal, organic material) for guidance.
5. Hospitality back-of-house waste sorting where permission is available.
6. Destination/community context in Bali only where location attribution is accurate.

### 7.2 Image selection rules

- Prefer user-provided, project-owned, partner-approved, or correctly licensed assets.
- Never infer that a photo depicts Banjar Sukawati, a specific TPS3R, a named partner, or a real Kedas operation unless verified.
- Do not use photos with visible stock-site watermarks or promotional text.
- Do not crop out context in a misleading way.
- Use a consistent photo treatment: natural light, documentary feel, authentic color, no heavy green tint.
- Keep subject faces respectful and avoid identifiable individuals unless there is permission/authorization.
- Provide meaningful alt text for informative images; decorative imagery gets empty alt text.
- Provide width/height or aspect ratio to prevent layout shift; optimize using the framework's image component.

### 7.3 Image aspect ratios

| Use | Target ratio |
|---|---|
| Public hero | 4:3 or 5:4 desktop; 4:3 mobile |
| Service tile | 4:3 |
| Editorial mosaic | 3:4, 4:3, and 1:1 mix |
| Article/guide thumbnail | 16:9 |
| Avatar | 1:1 |
| Workspace evidence | Original aspect, constrained to a readable container |

If authentic photos are missing, use a neutral color block with a clear “Foto ilustrasi” label or a real material texture. Do not silently pass generic imagery off as local evidence.

---

## 8. Responsive behavior

Breakpoints should follow the repository's existing Tailwind/config system. If no standard exists, use these reference breakpoints:

- Small mobile: 360–389 px.
- Mobile: 390–767 px.
- Tablet: 768–1023 px.
- Desktop: 1024–1439 px.
- Wide: 1440 px and above.

Rules:

- No horizontal scroll at 320 px except intentionally scrollable tables/media.
- Header collapses into a proper menu; role switcher becomes a menu, not a horizontally clipped row.
- Public hero stacks cleanly; imagery does not push the main CTA below excessive content.
- Workspaces use collapsible navigation and stack cards in task order.
- Data tables convert to compact cards or allow a clearly labelled horizontal scroll area.
- Modal/dialog width respects safe viewport margins; forms should not become tiny in a desktop two-column layout.
- Touch targets minimum 44x44 px; key controls have visible focus.
- Do not simply scale down the desktop screenshot; redesign content hierarchy for mobile widths.

---

## 9. Accessibility and usability

Target WCAG 2.2 AA for major flows.

- Semantic landmarks: header, nav, main, aside, footer.
- One primary H1 per page and a logical heading hierarchy.
- Full keyboard operation for navigation, menus, accordions, dialogs, forms, tables where interactive, and AI chat controls.
- Visible focus indicator with sufficient contrast.
- Correct label/description/error association for inputs.
- Announce async status and form errors with appropriate live regions.
- Do not rely on color alone for state, charts, or alerts.
- Provide chart summaries/table alternatives for screen readers.
- Respect reduced motion and browser zoom.
- Alt text describes the content/function, not “image of”.
- Provide language metadata and correct language switching behavior.

---

## 10. Frontend architecture and implementation constraints

This is a design specification, not permission to change the backend.

- Inspect the actual repository before implementing. Preserve the existing Next.js/React/Tailwind conventions and existing component library where possible.
- Do not replace the router, state manager, data-fetching library, form library, or UI primitives without a concrete technical reason.
- Keep visual tokens centralized as CSS variables/Tailwind theme values.
- Reuse shared components: `PublicHeader`, `WorkspaceShell`, `Sidebar`, `PageHeader`, `Button`, `StatusBadge`, `EmptyState`, `ErrorState`, `LoadingState`, `DataTable`, `FormField`, `Dialog`, `Toast`, `EvidencePanel`, `AiSourceList`, `ActionProposalPanel`.
- Do not introduce a second design system in parallel.
- Keep UI components typed and composable. Avoid a single mega-component per page.
- Keep API calls in existing service/query layers. No `fetch()` duplicated throughout components if the repo has a service layer.
- Preserve backend field names, enum values, API routes, and permission model. Map them to display labels at the UI boundary.
- Do not hardcode production data when API endpoints exist.
- If API is unavailable, display a proper loading/error/empty/unavailable state. Demo fixtures are allowed only behind an explicit demo mode, clearly labelled in the UI and code.
- Never treat a local optimistic update as server-confirmed success unless rollback/error behavior is implemented.

---

## 11. Required component/state matrix

Every data-driven page must implement the states that apply:

| State | Expected behavior |
|---|---|
| Initial loading | Stable skeleton or progress indicator, no layout jump |
| Empty | Explain why no data exists and the next available action |
| Error | Show concise issue and retry path; preserve user input |
| Forbidden | Explain access is not available; do not leak data |
| Offline | Show connection status and whether action can be queued |
| Stale data | Display last updated time and refresh action |
| Partial data | Explain which fields/sections are unavailable |
| Success | Confirm only after server acknowledgment |
| Pending review | Show who/what is awaiting review and current status |

---

## 12. Frontend quality gates

An implementation is not complete because it looks attractive in one screenshot. It must pass all applicable gates:

1. **Design fidelity:** follows this file's tokens, layout rules, visual hierarchy, photo direction, and anti-pattern list.
2. **Functional behavior:** every visible control navigates, submits, filters, opens, or is clearly disabled with a reason.
3. **Data integrity:** no hardcoded success, fabricated metrics, or mismatched API status.
4. **Responsive:** verified at 360, 390, 768, 1024, 1440, and 1920 px (or nearest practical project test widths).
5. **Accessibility:** keyboard, focus, form errors, contrast, alt text, reduced motion.
6. **Performance:** optimized images, no unnecessary client components, no avoidable layout shift, no console errors.
7. **Regression:** existing routes and role navigation still work; frontend tests and production build pass.

---

## 13. Reference images to place in the repository

The product owner will add the two supplied visual references into the project documentation. The coding agent must search for them in `docs/`, `docs/references/`, or another documented asset folder before implementation.

Suggested filenames (if the owner has not already named them):

- `docs/references/kedas-current-home-reference.png` — primary Kedas identity reference.
- `docs/references/editorial-waste-site-reference.png` — secondary photo/editorial composition reference.

If actual names differ, use the existing files. Do not rename or overwrite user-provided references without permission. If files are not found in the repository, use the visual descriptions in Section 0 and report that the images were not available in the working tree.

---

## 14. Definition of done

The web design is ready when:

- Public website has a clear, credible, photo-led Kedas identity consistent with reference 1 and selectively inspired by reference 2.
- Public pages explain the end-to-end system with truthful content and real destinations.
- Workspace pages are task-oriented and visually consistent without being generic.
- AI interfaces show evidence, uncertainty, limits, and controlled actions.
- Every core route has loading, empty, error, forbidden, and success behavior as relevant.
- Responsive, keyboard, and reduced-motion checks pass.
- Existing backend/API contracts and domain rules are preserved.
- No fabricated partner, metric, service area, photo attribution, impact claim, or action success appears.
- No prohibited visual anti-pattern remains.

**This document is the binding frontend design authority for Kedas. When an implementation decision conflicts with a visual preference in a generated mockup or a generic template, follow this specification unless the product owner explicitly changes it.**
