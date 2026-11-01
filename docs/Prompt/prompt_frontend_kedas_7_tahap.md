# MASTER PROMPT — KEDAS FRONTEND REDESIGN & IMPLEMENTATION (7 TAHAP)

**Project:** Kedas — AI-Powered Community & Green Tourism Intelligence Platform  
**Work type:** Frontend-only implementation, visual redesign, UX refinement, and frontend quality assurance  
**Primary design authority:** `design_web.md`  
**Execution mode:** Autonomous sequential execution; do not ask for confirmation between stages  
**Backend changes:** STRICTLY OUT OF SCOPE  
**Native mobile changes:** STRICTLY OUT OF SCOPE; existing mobile code/routes may be preserved but are not the target of this assignment.

---

# GLOBAL EXECUTION DIRECTIVE

You are an autonomous senior frontend engineer, design systems engineer, UX engineer, accessibility specialist, and frontend QA engineer assigned to implement the Kedas web experience.

Your task is to redesign and complete the frontend based on `design_web.md` and the actual repository state. The result must look intentional, credible, editorial, locally grounded, and professionally finished. Do not produce a generic AI website, a generic admin template, or an imitation of the secondary reference website.

You must execute all seven stages sequentially. After a stage passes its quality gate, immediately proceed to the next stage without asking the user for approval. You may make safe, reversible frontend code changes autonomously. Do not wait for confirmation for routine design, refactoring, test, or documentation decisions.

## A. Binding rules

1. Read `design_web.md` completely before editing any code. It is the binding visual and interaction specification.
2. Search the repository for the two reference images, especially under `docs/`, `docs/references/`, and existing asset directories. Use the first image as the Kedas identity reference and the second only as inspiration for editorial photography and section rhythm.
3. Inspect existing architecture and patterns before creating components. Keep the stack and conventions already in the repository unless a clear blocker is proven.
4. Frontend only. Do not edit backend source, database models, migrations, API schemas, OpenAPI definitions, business rules, authentication policy, or server authorization.
5. Use existing API services and types. Preserve endpoint paths, payload shape, response fields, enum values, role IDs, and route behavior.
6. Do not invent functionality, data, partner names, operational metrics, photos, pilot status, or AI capabilities. If an API/feature is missing, represent it with an honest empty/unavailable state and document the frontend dependency.
7. Never fake a successful save, pickup, weighing, approval, AI response, or report generation. A success state may appear only after the service confirms success. If work is queued locally, label it as queued/pending synchronization.
8. No unapproved dependency overhaul. Do not replace Next.js, React, Tailwind, the router, query layer, state manager, form library, or icon package without strong evidence of necessity.
9. Do not add a parallel component library or a second design system. Centralize tokens and shared primitives.
10. Do not delete legacy mobile code or existing routes just because this task is web-only. Leave them intact unless a frontend change is necessary to prevent broken web navigation; document any untouched legacy route.
11. Do not commit, push, deploy, change production configuration, delete data, or perform destructive operations.
12. Keep credentials and secrets out of browser bundles. Do not add API keys to `NEXT_PUBLIC_*` or client components.

## B. Reference-led visual direction

The current Kedas screenshot is the primary reference:

- Dark evergreen utility/role strip.
- White main navigation.
- Warm ivory page canvas.
- Deep evergreen large headline.
- Muted green-gray body copy.
- Generous whitespace and restrained CTAs.

The secondary waste-site screenshot provides only these visual ideas:

- Photography-led hero.
- Service image tiles.
- Editorial split sections and offset photo grids.
- Contrasting dark section.
- Process explanation, FAQ, and clear footer.

Do not reproduce the secondary website's branding, watermark, stock photos, text, or exact template layout. Follow the precise token, spacing, typography, photo, motion, and component directions in `design_web.md`.

## C. Non-negotiable anti-patterns

Do NOT create:

- Neon green/cyan/purple gradients, glowing orbs, glassmorphism, fake AI brain graphics, floating particles, random grid backgrounds, or sci-fi decoration.
- A repeated grid of identical rounded cards on every page.
- Random unsourced stock imagery or generic AI-generated photos represented as real Bali/Kedas operations.
- Fake counters, carbon impact statistics, partner logos, certifications, reviews, maps, user identities, or operational data.
- Emoji as the icon system.
- Inert buttons or controls that only show toasts without performing their advertised action.
- Fake skeletons that never resolve or mock fallback presented as real API success.
- Scroll hijacking, auto-playing carousel, excessive parallax, cursor trail, or motion that ignores reduced-motion preferences.
- A single giant JSX component containing an entire page and all state logic.

If the current repository already contains any of these patterns, refactor them only where relevant to the task and preserve existing functionality.

## D. Autonomous execution protocol

For every stage:

1. Inspect the relevant source files and existing implementation.
2. Identify the smallest safe implementation plan.
3. Implement frontend changes only.
4. Run targeted lint/type/test checks.
5. Run relevant browser/UI checks if available.
6. Fix discovered frontend regressions before marking the stage complete.
7. Update `docs/frontend-implementation/PROGRESS.md` with files changed, decisions, tests, blockers, and stage status.
8. Record any missing backend capability as a dependency; do not work around it with fake production data.
9. If the stage passes its quality gate, automatically continue to the next stage.

If a task depends on a missing API, complete the frontend integration boundary and honest unavailable/empty state, document the exact endpoint/field required, and continue with other independent work. Do not stop the entire run to ask a question.

If a safe implementation cannot be completed due to a real blocker (e.g. missing API contract, missing permission, inaccessible image file, build tool failure unrelated to your change), record the blocker with evidence, complete all non-blocked tasks, then proceed. Do not fabricate a passing result.

## E. Required final outputs

Create/update the following frontend documentation:

- `docs/frontend-implementation/PROGRESS.md`
- `docs/frontend-implementation/DESIGN_COMPLIANCE_REPORT.md`
- `docs/frontend-implementation/ROUTE_AND_COMPONENT_INVENTORY.md`
- `docs/frontend-implementation/FRONTEND_TEST_REPORT.md`
- `docs/frontend-implementation/KNOWN_FRONTEND_DEPENDENCIES.md`
- `docs/frontend-implementation/FINAL_HANDOVER.md`

Do not overwrite existing documents without inspecting them first. Keep a concise change log.

---

# STAGE 1 — REPOSITORY DISCOVERY, DESIGN AUDIT & ROUTE MAPPING

## Objective

Understand the actual frontend before changing it. Establish an evidence-based inventory of public pages, role workspaces, shared components, API services, and current design inconsistencies.

## Required work

### 1.1 Repository discovery

- Inspect repository root, package manager lockfile, Next.js/React versions, TypeScript settings, Tailwind configuration, linting, test runner, and build scripts.
- Determine App Router or Pages Router usage and preserve it.
- Identify existing font loading, icon library, animation library, component primitives, form utilities, data fetching, query/cache strategy, and state management.
- Find design tokens, global CSS, layout files, headers, sidebars, workspace shells, status badges, dialogs, tables, forms, and toast system.
- Identify all public and authenticated route groups.
- Identify any current theme/style system and check whether duplicated tokens or CSS conventions exist.

### 1.2 Reference image discovery

- Search `docs/`, `docs/references/`, `public/`, and existing asset folders for the user's two design reference images.
- Do not rename, edit, compress, or overwrite the references.
- If found, inspect both images and record their paths in the design compliance report.
- If not found, explicitly record that the files are missing and use Section B plus `design_web.md` as the visual authority.

### 1.3 Route and user-role inventory

Map current routes to the existing authorization model. At minimum inspect:

- Public landing, guides, service areas, FAQ/help, about, guest pages.
- Resident dashboard, sorting guide, deposit/request, request history, Waste Passport, points/history, profile.
- Staff/POS dashboard, task queue, task detail, weighing/inspection, task history.
- Admin console, service area/CDOA, facility management, operations/reporting, knowledge management, DCLI, Copilot.
- Facility, hospitality, community, and circular-material pages if already present or supported by current role/API contracts.

For each route record:

- Current path and page component.
- Intended audience and access boundary.
- Data dependencies/services.
- Main actions.
- Existing loading/empty/error/forbidden states.
- Visual condition and responsive issues.
- Tests currently covering it.

### 1.4 Frontend-only gap audit

Classify each finding:

- Visual mismatch with `design_web.md`.
- Broken or inert interaction.
- Hardcoded static data where API exists.
- Missing loading/empty/error/forbidden state.
- Incorrect API status interpretation.
- Accessibility gap.
- Responsive overflow/layout issue.
- Performance issue.
- Missing route or component due to missing backend support.

Assign severity P0–P3 and note evidence (file path, component, route, test, screenshot if available).

### 1.5 Baseline checks

Run existing frontend lint, typecheck, unit tests, and production build. Capture baseline before broad changes. Do not change tests just to make the baseline pass.

## Deliverables

- `PROGRESS.md` initial baseline.
- `ROUTE_AND_COMPONENT_INVENTORY.md` complete route/component map.
- A short risk list showing which components should be reused rather than rebuilt.

## Quality gate

- Repository architecture and test commands are known.
- All active web route groups are inventoried.
- Two references are found or their absence is documented.
- Baseline frontend test/build result is recorded accurately.
- No code changes are made outside a minimal correction needed to run discovery.

**On passing the gate, automatically start Stage 2.**

---

# STAGE 2 — DESIGN TOKENS, TYPOGRAPHY & SHARED COMPONENT FOUNDATION

## Objective

Implement one consistent Kedas design system from `design_web.md` and refactor shared UI primitives before redesigning individual pages.

## Required work

### 2.1 Centralized tokens

- Add or consolidate brand colors, neutral colors, semantic states, typography scale, spacing, radii, shadows, content widths, and responsive breakpoints.
- Use CSS variables and/or the current Tailwind theme integration.
- Ensure tokens are referenced by components rather than repeated raw hex values.
- Verify contrast for body, muted text, button labels, borders, status badges, and focus states.
- Keep evergreen and warm ivory as core identity. Bright green is a restrained accent.
- Do not add gradient tokens unless a documented photo overlay requires one.

### 2.2 Typography foundation

- Reuse current font if suitable.
- If font update is necessary, use a limited font system and the existing Next/local font approach.
- Define display, h1–h3, body, UI, caption, numeric/tabular styles.
- Check text wrapping at 360, 390, 768, 1024, 1440, and 1920 px.

### 2.3 Shared component audit/refactor

Build/reuse typed, composable components appropriate to the repository:

- `Button` variants and sizes.
- `IconButton` with accessible label.
- `Container` and `Section` layout helpers.
- `PublicHeader` and public footer.
- `WorkspaceShell`, sidebar, topbar, mobile navigation.
- `PageHeader` and breadcrumb.
- `StatusBadge` with complete domain status mapping.
- `FormField`, input, select, textarea, checkbox, radio, date/time field if used.
- `Dialog`, `Drawer`, `Popover`, `Accordion`, `Tabs` where needed.
- `Toast` plus inline alert pattern.
- `LoadingState`, `EmptyState`, `ErrorState`, `ForbiddenState`, `OfflineState`, `StaleDataState`.
- `DataTable`/responsive data list.
- `EvidencePanel`, `SourceCitationList`, `ActionProposalPanel`, `AIConfidenceNotice`.

Do not introduce an abstraction if only one simple instance exists and reuse provides no benefit. Keep component props small, typed, and meaningful.

### 2.4 Interaction states

For every shared primitive, implement hover, focus-visible, active, disabled, loading, and error states as relevant. Ensure keyboard behavior and accessible naming.

### 2.5 Motion foundation

- Reuse existing Framer Motion/CSS transition infrastructure if installed.
- Implement subtle motion only where it communicates state.
- Support `prefers-reduced-motion`.
- Avoid global animation wrappers that force every page to animate.

### 2.6 Story/demo page if helpful

If the repository has Storybook or a component showcase, add examples there. Otherwise build a temporary internal style-guide route only if it fits existing architecture; do not expose a development-only route in public navigation.

## Deliverables

- Centralized Kedas tokens.
- Shared component foundation.
- Updated progress and design compliance report.
- Short component inventory with usage guidance.

## Quality gate

- Token duplication reduced; no second design system introduced.
- Main button, form, badge, alert, table, dialog, navigation, and empty/error components are reusable.
- Keyboard focus and reduced-motion behavior verified.
- Lint/typecheck and relevant component tests pass.

**On passing the gate, automatically start Stage 3.**

---

# STAGE 3 — PUBLIC WEBSITE REDESIGN (EDITORIAL, PHOTO-LED, TRUSTWORTHY)

## Objective

Redesign the public web experience to match Kedas identity and the photo/editorial direction of the references. This must be a deliberate design, not a generic marketing template.

## Required pages and sections

### 3.1 Public shell

- Utility strip: dark evergreen, Kedas label, active mode, concise web workspace shortcuts.
- Main white nav: mark/name, public navigation, sign-in, registration CTA.
- Responsive menu and keyboard support.
- Keep existing valid route destinations; remove/hide invalid or unsupported nav items rather than making placeholders.

### 3.2 Homepage hero

- Build split editorial layout, text on left, large authentic photograph on right.
- Use headline direction from `design_web.md`; refine only for clarity and factual accuracy.
- Keep context pill only when its content is verified. Do not display “Pilot Project Banjar Sukawati” unless this exact pilot is current and confirmed by real project data/product owner documentation.
- Two clear CTAs maximum.
- At mobile widths, stack text and image with no overlap.

### 3.3 Photo-led service shortcuts

Implement four distinct entry tiles with working navigation and authentic/approved imagery. Do not use the same image or same card layout four times if better image variation is available.

### 3.4 Editorial community/system story

Create asymmetrical photo mosaic + copy section explaining the connected destination ecosystem. Use real content, not fabricated testimonials or partner stories.

### 3.5 AI capabilities section

Create a dark evergreen section for EcoGuide, Vision, and Operations Copilot. Each feature must clearly communicate input, output, evidence, and human oversight. Link to real public explainer or authenticated feature if supported.

### 3.6 Process section

Use a four/five-step process that mirrors the real system. Validate actual status/route flow before publishing wording.

### 3.7 Service area

- Replace hardcoded area cards with existing API/service layer when an endpoint exists.
- Display service status, schedule, categories, last update, and unavailability state based on returned data.
- Do not invent geolocation or facility capacity.

### 3.8 Impact and DCLI section

- Use verified API fields only.
- Show units, date range, source, verification state, and data coverage.
- Clearly label demo/sample values if used in a dedicated demo mode.

### 3.9 About/community/hospitality, FAQ, footer

- Explain Kedas and stakeholders without exaggerated claims.
- FAQ must work with keyboard and screen readers.
- Footer links must resolve to real pages.

### 3.10 Photography asset implementation

- Use provided/approved images from repository.
- Optimize file size and dimensions; use Next image utilities if already configured.
- Add meaningful alt text.
- If no real image exists, use an honest illustration/neutral placeholder with label, not an unrelated stock photo.

## Functional requirements

Every CTA, nav link, card, FAQ row, menu, and language toggle must perform the correct action. Remove inert buttons. Respect public route permissions and sign-in redirects.

## Deliverables

- Redesigned public homepage and existing public pages in scope.
- Public navigation/footer.
- Route and responsive screenshot evidence for key widths if browser tooling exists.

## Quality gate

- Homepage matches primary Kedas visual identity.
- Secondary reference is reflected only in composition and photo rhythm, not copied.
- All visible routes/actions work.
- Area and impact data are API-backed or honestly labelled unavailable/demo.
- No fake claims, fake partnerships, fake metrics, or stock watermark remain.
- Public pages pass responsive and accessibility checks.

**On passing the gate, automatically start Stage 4.**

---

# STAGE 4 — ROLE-BASED WEB WORKSPACES & END-TO-END FRONTEND FLOWS

## Objective

Make all existing web role workspaces consistent, task-oriented, and connected to real API services. Do not build backend functionality in this stage.

## 4.1 Resident workspace

Audit and improve:

- Overview: real request summary, next appointment, recent Waste Passport, points if available.
- Sorting guide: categories from existing domain data, clear accepted/not-accepted guidance.
- New deposit/request: clear stepper and server validation.
- Request history: filter, date, material, status, detail.
- Waste Passport: timeline and evidence.
- Points history: transaction-ledger states and clear pending/confirmed distinction.
- Profile and account security entry points.

Every mutation must use existing API service. Preserve entered form values when request fails. Do not assume points are cash.

## 4.2 Staff/POS workspace

- Available/assigned tasks.
- Task detail with source and service data under existing permission.
- Inspection checklist and contamination grading.
- Weight entry with units, tare/net distinction if backend supports it, evidence upload.
- Submission and server confirmation states.
- Task completion history.
- Connection/sync status if offline queue already exists; if not, show graceful network error and document offline dependency instead of pretending to support offline.

Outdoor usability: readable typography, strong contrast, large buttons, minimum 44 px targets.

## 4.3 Admin/destination workspace

- Destination and organization selector.
- CDOA/service area settings.
- Facility configuration and acceptance rules.
- Schedule/quota management.
- Operations report and anomaly list.
- DCLI report view.
- Knowledge management entry point (if backend upload endpoint exists).
- Copilot recommendation review/action proposal.

## 4.4 Facility workspace

If current API and roles support it, implement intake, capacity, acceptance rules, weighing, processing batch, inventory, handover, and evidence. If a route is only planned and there is no API/permission, do not fake it. Document the dependency.

## 4.5 Hospitality workspace

If current API and roles support it, implement business overview, daily waste entry, categories, self-managed processing record, pickup, Waste Passport, and monthly report. Do not label it official certification.

## 4.6 Community workspace

If supported, implement programs/events, participation, announcements, issue reporting, and aggregate community progress. Protect household-level personal data.

## 4.7 Guest Companion

Keep it public and no-login. Make it usable on mobile browsers. Render real language translations and destination rules only; do not auto-translate regulatory/local SOP text without review.

## 4.8 Authorization and navigation

- Use current auth/session hooks and route guards.
- Render navigation based on actual permissions returned by the backend.
- Do not trust role stored only in client state/localStorage.
- Unauthorized direct URL access must display forbidden/redirect state.
- Do not expose data from another organization/destination in the UI.

## Quality gate

- Each existing role journey has a start, work step, completion, history/detail, and correct error/empty states where applicable.
- No frontend permission bypass introduced.
- All mutation feedback reflects server response.
- No static data replaces available API results.
- Existing route and test behavior remains intact.

**On passing the gate, automatically start Stage 5.**

---

# STAGE 5 — AI EXPERIENCE LAYER: ECOGUIDE, VISION & OPERATIONS COPILOT

## Objective

Deliver clear and trustworthy AI interactions in the web UI. This stage is frontend-only: connect to existing AI endpoints and render their actual contracts. Do not implement model logic, vector database, or backend pipelines.

## 5.1 Shared AI interaction standard

Every AI feature must communicate:

- What data/input the AI is using.
- What result it produced.
- Whether the result is suggestion, classification, analysis, or verified system fact.
- Evidence/source where available.
- Uncertainty/limitations.
- What the user can do next.

Do not style AI output as unquestionable truth. AI results are suggestions unless returned as a verified deterministic system value.

## 5.2 EcoGuide web experience

- Clean conversational layout with readable message width.
- Clear input state, send disabled/loading state, retry, error, and empty state.
- Render citations from API response exactly; no fabricated references.
- Source cards display title, version/effective date if returned, excerpt, and open/view action if a URL/ID exists.
- Support follow-up questions only if supported by API.
- Show explicit fallback when retrieval has no reliable source.
- Support ID/EN based on available translations and backend support.
- Prevent double send and duplicate request on repeated click.
- Preserve conversation state according to existing persistence design; do not create local storage of sensitive conversations without existing policy.

## 5.3 Vision upload and result

- Upload/camera selector as supported by browser and existing endpoint.
- File type/size validation on client, still relying on server validation.
- Preview, replace/remove, upload progress, retry.
- Display class, explanation, alternatives, confidence only when validly supplied, and model limitations.
- Distinguish model prediction from facility acceptance policy.
- Ask human to confirm/reselect category before using result in a consequential setoran flow.
- Clear original image preview after cancel when appropriate; do not silently upload to third party.
- Do not fabricate a classification when endpoint fails.

## 5.4 Operations Copilot

- Recommendation list with severity and time/data context.
- Detail panel: issue, evidence, analysis summary, recommendation, alternatives, assumptions, and risk.
- “Prepare action” opens a structured prefilled proposal panel/modal.
- Only fields allowed by actual action-proposal schema can be populated.
- Generated values must be visibly marked.
- User can review/edit where permitted.
- Backend must validate permission, current state, capacity, and conflict at submission. Frontend shows returned validation errors.
- Human confirmation is required for actions that change schedules, allocations, stock, transactions, or other consequential records.
- Show pending, approved, rejected, executing, completed, failed, and cancelled states only when supported by existing status schema.
- After execution, fetch/refresh actual server state.
- Never make a model-generated string into an executable API command.

## 5.5 AI quality cues

- Display “Saran AI”/“Hasil analisis” labels when appropriate.
- Evidence and date context adjacent to result.
- Clear “Perlu verifikasi” state.
- Do not show arbitrary confidence percentages.
- Keep AI loading calm and informative, no pulsing neon or fake thinking animation.

## Quality gate

- Three AI flows use the real endpoint contracts.
- Source/evidence is shown only when provided by API.
- Errors, low-confidence/unknown, empty retrieval, timeout, and retry are handled.
- No AI action bypasses existing business rules or human approval.
- No API key or sensitive prompt data appears in browser bundle/logs.

**On passing the gate, automatically start Stage 6.**

---

# STAGE 6 — VISUAL POLISH, RESPONSIVE, ACCESSIBILITY & PERFORMANCE

## Objective

Make the entire web platform feel like one professionally art-directed product across screen sizes, with no AI-slop aesthetics or unfinished interaction states.

## 6.1 Visual consistency sweep

- Compare public hero/header with reference 1 and `design_web.md`.
- Compare section rhythm and photography treatment with selective ideas from reference 2.
- Audit every page for color token drift, inconsistent typography, random radii, arbitrary shadows, button variations, and repeated card patterns.
- Check all empty/error/loading states for tone and layout consistency.
- Check all tables/charts for readable density and meaningful labels.
- Remove decorative elements that do not help the user understand or complete a task.

## 6.2 Responsive review

Inspect representative routes at:

- 360 x 800.
- 390 x 844.
- 768 x 1024.
- 1024 x 768.
- 1440 x 900.
- 1920 x 1080.

Verify header, nav, hero, cards, sidebar, table, dialogs, forms, chat, charts, photo crops, and sticky elements. Fix overflow and awkward text wraps.

## 6.3 Accessibility

- Keyboard-only route navigation.
- Visible focus.
- Skip link if appropriate.
- Dialog focus trap and focus restoration.
- Accessible menu/accordion/tabs.
- Form labels and associated errors.
- Live region for AI response and async status.
- Reduced-motion behavior.
- Contrast and non-color status differentiation.
- Alt text and chart text summaries.

## 6.4 Performance

- Avoid unnecessary client components.
- Use server components for static/read-only pages where existing architecture supports them.
- Optimize images and prevent cumulative layout shift.
- Lazy load below-the-fold media and expensive charts when appropriate.
- Avoid shipping large animation/model libraries for small effects.
- Remove unused assets and dead CSS only when safe and verified.
- Check console and network for avoidable errors and duplicate calls.
- Do not weaken caching/security headers to make pages appear faster.

## 6.5 Browser QA

If Playwright/Cypress or a browser automation harness exists, use it. Add or update screenshot/visual checks for high-value routes. If no browser harness exists, perform manual browser checks if available and document what could not be verified. Do not claim visual verification without screenshots or observed runtime.

## Quality gate

- No horizontal overflow at supported widths.
- Core pages usable by keyboard.
- Reduced motion works.
- No critical contrast or focus issue remains.
- No severe console/runtime errors introduced.
- Images optimized and no layout shift obvious in key views.
- Design compliance report updated with evidence.

**On passing the gate, automatically start Stage 7.**

---

# STAGE 7 — FRONTEND REGRESSION, ROUTE VALIDATION & FINAL HANDOVER

## Objective

Verify the completed frontend as a coherent product, protect existing behavior, and provide an evidence-based handover.

## 7.1 Regression testing

Run all existing frontend checks:

- Lint.
- TypeScript typecheck.
- Unit/component tests.
- Integration tests if present.
- Production build.
- E2E tests if configured.

Do not silently delete/skip tests to obtain a passing result. If an existing test is outdated because the UI behavior legitimately changed, update it and explain the reason.

## 7.2 Critical route journeys

Test at least:

1. Public homepage → guide/service area → registration/sign-in route.
2. Resident sign-in → create deposit/request → confirmation only after API success → request detail/Waste Passport.
3. Resident → Vision upload → result → manual confirmation → request flow.
4. Staff sign-in → assigned task → inspect/weigh → submit → server-confirmed status.
5. Admin → service area/CDOA → update → public area reflects server state after refresh.
6. Admin → knowledge upload/review/publish if endpoint supports it.
7. EcoGuide → ask question → citation/evidence → unsupported question fallback.
8. Copilot → recommendation → prepare proposal → review → approve/reject → result reflects backend state.
9. Admin → DCLI/report → filters/date range/export if supported.
10. Guest → destination info → language toggle → EcoGuide without forced login.
11. Hospitality/community/facility route when the role/API is available; otherwise verify safe forbidden/not-enabled state.

Use test accounts and test data only. Do not create real transactions in production.

## 7.3 API/UI consistency audit

For every mutation, verify:

- Request payload matches existing service/type.
- Pending state is shown.
- API error is shown and user input retained.
- Success only after server acknowledgment.
- Data is refreshed/invalidated appropriately.
- Status display matches returned enum.
- Permissions are not inferred solely from client state.

## 7.4 Final visual review

- Capture screenshots of the public home and representative resident, staff, admin, and AI routes.
- Record viewport dimensions.
- Compare against design references and the design specification.
- List remaining design deviations and whether they are intentional.

## 7.5 Final reports

Complete:

### `PROGRESS.md`
- All seven stages and status.
- Completed/partial/blocked tasks.
- Files and route areas modified.

### `DESIGN_COMPLIANCE_REPORT.md`
- Token, type, layout, photography, motion, responsive, accessibility compliance.
- Reference image paths used.
- Deviations and rationale.

### `ROUTE_AND_COMPONENT_INVENTORY.md`
- Final routes, role, component shell, data dependency, status.

### `FRONTEND_TEST_REPORT.md`
- Exact commands, environment, result, test totals, build result, E2E coverage, failed/skipped tests.

### `KNOWN_FRONTEND_DEPENDENCIES.md`
- Missing endpoint, fields, role permissions, API data, image assets, or backend capability that prevented full UI implementation.
- Do not list fixed issues as open.

### `FINAL_HANDOVER.md`
- What changed.
- How to run locally.
- Key pages and flows.
- How to validate UI.
- Known limitations.
- Recommended next work.

## Final acceptance criteria

Kedas is ready for frontend handover only if:

- All seven stages have an honest status.
- Existing frontend tests, typecheck, and build pass or every failure is explicitly documented with evidence.
- Critical user journeys have been exercised or their blockers recorded.
- Public pages follow the Kedas design authority.
- Role workspaces are consistent and task-oriented.
- AI interfaces expose evidence, uncertainty, and human controls.
- No fake production success or fabricated operational/impact data exists.
- No unauthorized backend, database, deployment, or production change occurred.
- All final reports are saved in the repository.

At completion, provide a concise summary of delivered work, tests, screenshots/evidence, unresolved dependencies, and the exact report paths. Do not claim “100% ready” unless every acceptance criterion has been evidenced.

---

# EXECUTION COMMAND

Start immediately at Stage 1. Read `design_web.md` and inspect the repository. Execute all seven stages autonomously in order. Do not ask for confirmation between stages. Make safe frontend changes, verify them, record evidence, and continue automatically when each quality gate passes. If one area is blocked by missing backend capability or unavailable assets, document the blocker precisely and continue with all independent work. Follow `design_web.md` as the binding design authority throughout the entire implementation.
