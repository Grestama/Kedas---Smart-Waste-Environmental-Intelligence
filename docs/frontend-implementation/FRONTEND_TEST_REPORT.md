# KEDAS — FRONTEND TEST REPORT

**Authority:** `docs/design/design_web.md`  
**Generated:** Stage 7 Final Regression (30 October 2026)  
**Status:** ALL TESTS & BUILDS PASSING (100%)  

---

## 1. Test Environment

- **Operating System:** Windows 11 (PowerShell)
- **Node.js:** v22.12.0
- **Framework:** Next.js 15.5.28 (App Router)
- **Runtime / Test Runner:** Vitest v4.1.12 with `@vitejs/plugin-react`
- **Compiler:** TypeScript v5.7.3 (`tsc --noEmit`)

---

## 2. Test Execution Details

### A. TypeScript Typecheck
- **Command:** `npm --prefix frontend run typecheck`
- **Output:**
  ```
  > wastelink-bali-frontend@0.1.0 typecheck
  > tsc --noEmit
  ```
- **Exit Code:** `0` (0 errors)

### B. Vitest Unit & Integration Suites
- **Command:** `npm --prefix frontend test -- --run`
- **Results:**
  ```
   Test Files  13 passed (13)
        Tests  116 passed (116)
     Duration  10.78s
  ```
- **Test File Breakdown:**
  1. `src/test/marketplace.test.ts` (5 tests) — PASSED
  2. `src/test/integration.test.ts` (15 tests) — PASSED
  3. `src/test/facility.test.ts` (4 tests) — PASSED
  4. `src/test/community.test.ts` (5 tests) — PASSED
  5. `src/test/design-system.test.tsx` (13 tests) — PASSED
  6. `src/test/auth.test.tsx` (8 tests) — PASSED
  7. `src/test/staff.test.tsx` (18 tests) — PASSED
  8. `src/test/collection.test.tsx` (11 tests) — PASSED
  9. `src/test/ai-components.test.tsx` (7 tests) — PASSED
  10. `src/test/admin.test.tsx` (17 tests) — PASSED
  11. `src/test/knowledge-admin.test.tsx` (4 tests) — PASSED
  12. `src/test/service-area.test.tsx` (4 tests) — PASSED
  13. `src/test/hospitality.test.tsx` (5 tests) — PASSED

### C. Production Build Verification
- **Command:** `npm --prefix frontend run build`
- **Output:**
  ```
  ✓ Compiled successfully in 7.9s
  Linting and checking validity of types ...
  Collecting page data ...
  Generating static pages (44/44) ...
  ✓ Generating static pages (44/44)
  Finalizing page optimization ...
  ```
- **Exit Code:** `0`
- **Total Web Routes Compiled:** 44 routes (all static or on-demand dynamic routes pre-rendered cleanly with 0 linter warnings).
