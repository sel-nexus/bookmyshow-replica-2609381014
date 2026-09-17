# Worker findings — 2a796a3a59ce

- state: done
- produced_output: True
- summary: worker completed

## Brief
You are a test critic. Your job is to review the test files in this workspace against the PRD and source code, and produce a structured verdict. You are read-only — you cannot modify files. You cannot spawn sub-agents.

Follow the procedure in the test-critic reference exactly:
  fetch_skill("testing", reference="test-critic")

Workspace root: . (the current workspace folder; the app code is at the workspace root)
LLD path: none — no LLD exists. Derive the contract from the PRD at /discovery/PRD - BookMyShow Replica.md (read with a leading slash from the task root).
PLAN.md path: PLAN.md
Source directories: backend/src, frontend/app, frontend/components, frontend/context, frontend/lib
Test directories: backend/src/__tests__, frontend/src/__tests__
E2E directory: frontend/e2e
App type: FULLSTACK
E2E runner: PLAYWRIGHT

Database engine declared: SQLite (embedded, file-backed via better-sqlite3). Note: D-01 targets server databases (MongoDB/PostgreSQL/MySQL/MariaDB); SQLite is the PRD-specified embedded production database, so verify the app uses a real SQLite driver (better-sqlite3) and file-backed persistence rather than in-memory dicts.

Round: 1

Test run output (most recent full backend unit/API run):
  ✓ src/__tests__/bookings.service.test.ts (4 tests)
  ✓ src/__tests__/auth.service.test.ts (7 tests)
  ✓ src/__tests__/api.test.ts (10 tests)
  Test Files 3 passed (3), Tests 21 passed (21)
Frontend component tests (LoginPage 4, MoviesPage 3, PaymentPage 4) all pass.

Execute the 4-pass procedure:
  Pass 1: Read the PRD (no LLD exists), extract the contract.
  Pass 2: Read the source code, extract the inventory.
  Pass 3: Read the test files, extract the inventory.
  Pass 4: Cross-reference and produce the verdict.

Hand the verdict back as the `report` field of `complete_task`, in the exact output format specified in the test-critic reference. Every FAIL must include reason, evidence (file:line from PRD + source + test), fix_hint, and severity.

**Output procedure (MUST follow exactly):**
1. Call `complete_task` with a one-line `summary` (e.g. "Test critic round 1: FAIL, score 0.28") AND the full verdict block as `report`.
2. Do NOT call `record` — it writes to the parent's state and will fail.
3. Do NOT call `grep` with `max_results` — use `glob` + `read_file` instead.
4. Always `glob` a directory before `read_file` on its files — never read a path you have not confirmed exists.

## What the worker reported
TEST CRITIC VERDICT
===================
Round: 1
Overall: FAIL
Score: 0.62
Weighted: 41 / 108
High fails: 4
Total checks: 52
Passed: 29
Failed: 20
N/A: 2
Carried from previous round: 0

No LLD exists; contract derived from the PRD (/discovery/PRD - BookMyShow Replica.md). App type FULLSTACK, E2E runner PLAYWRIGHT, DB = SQLite (embedded, PRD-specified). D-01 adapted to verify a real better-sqlite3 file-backed driver rather than a server DB.

FAILED CHECKS (fix these before running tests):

── A-01 (high) ─────────────────────────────────────
  reason: The core booking endpoint POST /api/bookings (FR-BOOK-02) has NO API test; api.test.ts covers health/movies/theatres/auth but never exercises the booking POST.
  evidence:
    LLD: PRD line 84 (FR-BOOK-02 POST /api/bookings shall accept booking details, save, return confirmation ID); PLAN.md:41
    source: backend/src/routes/bookings.routes.ts:23 (bookingsRouter.post "/")
    test: backend/src/__tests__/api.test.ts:1-122 — no describe/it for POST /api/bookings
  fix_hint: Add a describe("POST /api/bookings") block to api.test.ts with a happy-path 201 test asserting confirmationId/movie/theatre/seats, plus error-path tests (see A-02/A-09).

── A-10 (high) ─────────────────────────────────────
  reason: No security-boundary tests exist at any API boundary (no SQL-injection, XSS, or oversized/malformed payload cases).
  evidence:
    LLD: PRD section 5 (input-accepting endpoints /api/auth/login, /api/auth/verify, /api/bookings)
    source: backend/src/routes/auth.routes.ts:6-17, backend/src/routes/bookings.routes.ts:6-13 (zod boundaries); backend/src/db/database.ts (prepared statements)
    test: backend/src/__tests__/api.test.ts:1-122 — no injection/XSS/oversized-payload case
  fix_hint: Add API tests sending SQL-injection strings in mobile/otp, an XSS string in text fields, and an oversized/malformed JSON body, asserting 400 and no 500/stack leak.

── E-02 (high) ─────────────────────────────────────
  reason: No Playwright config with a webServer/server-start block exists — the E2E specs cannot be launched against the app.
  evidence:
    LLD: PLAN.md:102 lists `frontend/playwright.config.ts` as a deliverable
    source: glob `**/playwright.config.*` returned 0 matches (file absent)
    test: frontend/e2e/auth.spec.ts:1, frontend/e2e/booking.spec.ts:1 import "@playwright/test" but no config wires baseURL/webServer
  fix_hint: Create frontend/playwright.config.ts with a webServer block (frontend+backend) that starts the app and sets baseURL.

── T-01 (high) ─────────────────────────────────────
  reason: The E2E runner @playwright/test is not declared in any dependency manifest, so the E2E specs cannot run.
  evidence:
    LLD: PLAN.md:129 (E2E command uses @playwright/test/cli.js)
    source: frontend/package.json:17-31 devDependencies — no @playwright/test; grep "playwright" in frontend/package.json = 0 matches
    test: frontend/e2e/*.spec.ts import "@playwright/test" (unresolvable)
  fix_hint: Add @playwright/test to frontend devDependencies and an "e2e" script; install the browser binary before the E2E run.

── U-01 (medium) ─────────────────────────────────────
  reason: Several feature modules with behavior have no test file (OtpPage, SeatsPage, SuccessPage, MovieTheatresPage, BookingContext, api client).
  evidence:
    LLD: PLAN.md:83-90
    source: frontend/app/login/otp/page.tsx, frontend/app/seats/page.tsx, frontend/app/success/page.tsx, frontend/app/movies/[id]/page.tsx, frontend/context/BookingContext.tsx, frontend/lib/api.ts
    test: frontend/src/__tests__/ has only LoginPage/MoviesPage/PaymentPage tests
  fix_hint: Add component tests for the OTP, Seats, Success, and theatre-selection pages, a BookingContext hook test, and an api-client test (mock fetch).

── U-05 (medium) ─────────────────────────────────────
  reason: PaymentPage.test.tsx contains only happy-path/render assertions — no negative/edge-case test.
  evidence:
    LLD: PRD FR-PAY-01..04
    source: frontend/app/payment/page.tsx:42-68 (handlePay, error branch at 62-67)
    test: frontend/src/__tests__/PaymentPage.test.tsx:33-57 — all four tests are render/toggle happy paths; no createBooking-failure or validation-error case
  fix_hint: Add a test where createBooking rejects (ApiError) and assert the error message renders and processing state clears.

── U-06 (medium) ─────────────────────────────────────
  reason: Negative-case coverage is incomplete — missing boundary, non-existent-resource (getBooking), and invalid-type/large-payload categories.
  evidence:
    LLD: PRD section 5
    source: backend/src/services/bookings.service.ts:94-122 (getBooking undefined branch); backend/src/routes/bookings.routes.ts:6-13 (type/enum validation)
    test: bookings.service.test.ts (no getBooking-not-found test); api.test.ts (no invalid-type/enum/oversized cases)
  fix_hint: Add boundary and invalid-type cases (paymentMethod not in enum, empty seats array, non-integer movieId) and a getBooking(nonexistent) undefined test.

── U-08 (medium) ─────────────────────────────────────
  reason: Branch coverage gap — BookingsService.getBooking's not-found branch (returns undefined) is untested.
  evidence:
    LLD: PLAN.md:66
    source: backend/src/services/bookings.service.ts:110 (`if (!row) return undefined;`)
    test: backend/src/__tests__/bookings.service.test.ts:57-73 — only the found branch is exercised
  fix_hint: Add a test asserting getBooking(9999) returns undefined.

── A-02 (medium) ─────────────────────────────────────
  reason: POST /api/bookings has neither happy-path nor error-path API tests (both missing).
  evidence:
    LLD: PRD line 84; PLAN.md:41
    source: backend/src/routes/bookings.routes.ts:23-34
    test: backend/src/__tests__/api.test.ts — no POST /api/bookings block
  fix_hint: Add a 201 happy-path test and 4xx error-path tests (invalid body, non-existent movie/theatre) for POST /api/bookings.

── A-05 (medium) ─────────────────────────────────────
  reason: Schema constraints (unique confirmation_id, foreign keys, not-null) are not tested.
  evidence:
    LLD: PRD NFR-DATA-01 / FR-BOOK-02
    source: backend/src/db/database.ts:62-72 (bookings: confirmation_id UNIQUE, FKs to movies/theatres)
    test: bookings.service.test.ts / api.test.ts — no unique/FK/not-null violation test
  fix_hint: Add a test that a duplicate confirmation_id or violated FK surfaces the constraint (or that the service guards it).

── A-09 (medium) ─────────────────────────────────────
  reason: Input validation on POST /api/bookings is untested (missing fields one at a time, invalid types, empty seats, invalid paymentMethod enum).
  evidence:
    LLD: PRD FR-BOOK-02
    source: backend/src/routes/bookings.routes.ts:6-13 (bookingSchema); backend/src/middleware/validate.ts:17-32
    test: backend/src/__tests__/api.test.ts — no booking validation case
  fix_hint: Add API tests omitting each required field and sending invalid types/empty seats/wrong paymentMethod, asserting 400.

── I-02 (medium) ─────────────────────────────────────
  reason: The cross-feature flow auth→catalog→booking is not exercised as a chained flow at the API/service level (no test uses a verified session to drive a booking end to end).
  evidence:
    LLD: PRD section 7 user journey; RG-01..RG-07
    source: backend/src/routes/*.ts (auth, movies, bookings are separate routers sharing the DB)
    test: backend/src/__tests__/api.test.ts — endpoints tested in isolation, no chained flow
  fix_hint: Add an integration test that logs in (verify), fetches movies/theatres, then POSTs a booking and verifies it persisted, in one flow.

── I-03 (medium) ─────────────────────────────────────
  reason: Error propagation across features is untested (e.g. booking referencing a non-existent movie/theatre via the API).
  evidence:
    LLD: PRD FR-BOOK-02
    source: backend/src/services/bookings.service.ts:44-55 (404 branches); backend/src/routes/bookings.routes.ts
    test: backend/src/__tests__/api.test.ts — no cross-feature error case
  fix_hint: Add an API test POSTing a booking with a non-existent movieId/theatreId and assert 404 with the error envelope (no 500).

── E-05 (medium) ─────────────────────────────────────
  reason: No E2E spec verifies an empty/no-data state renders (not blank, not crash).
  evidence:
    LLD: PRD section 5 (catalog/theatre lists)
    source: frontend/app/movies/page.tsx:46-65 (loading/error/list, no explicit empty branch)
    test: frontend/e2e/auth.spec.ts, booking.spec.ts — no empty-state assertion
  fix_hint: Add a spec (or stub the catalog response) asserting the app renders a defined empty state when no movies/theatres are returned.

── E-08 (medium) ─────────────────────────────────────
  reason: Persistence is not tested in E2E — no spec reloads or navigates away/back to verify server-persisted data survives.
  evidence:
    LLD: PRD FR-BOOK-01/02 (booking persisted in DB)
    source: backend/src/services/bookings.service.ts (persists to SQLite)
    test: frontend/e2e/booking.spec.ts:9-70 — single pass, no reload/re-fetch of a persisted booking
  fix_hint: Add a spec that completes a booking, reloads (or re-fetches), and asserts the persisted data is still served.

── E-10 (medium) ─────────────────────────────────────
  reason: Network calls are not asserted — no waitForResponse/intercept verifies the frontend actually called the backend.
  evidence:
    LLD: PRD NFR-ARCH-01 (functional backend API)
    source: frontend/lib/api.ts:68-120 (fetch wrappers)
    test: frontend/e2e/booking.spec.ts:9-70 — no page.waitForResponse on /api/movies, /api/theatres, or /api/bookings
  fix_hint: Add page.waitForResponse assertions for the catalog, theatres, and booking POST calls during the journey.

── E-12 (medium) ─────────────────────────────────────
  reason: Console-error capture is incomplete — specs listen only to 'pageerror', not 'console', and auth.spec.ts's second test (incorrect OTP) sets up no error capture at all.
  evidence:
    LLD: testing skill E2E console-capture rule
    source: —
    test: frontend/e2e/auth.spec.ts:38-48 (no page.on handler); auth.spec.ts:12 and booking.spec.ts:11 use only page.on("pageerror"), not page.on("console")
  fix_hint: Register both page.on("console") (severity 'error') and page.on("pageerror") before navigation in every test, including the negative auth test.

── E-13 (low) ─────────────────────────────────────
  reason: Not every spec asserts no console errors at the end — auth.spec.ts's incorrect-OTP test has no terminal errors assertion.
  evidence:
    LLD: testing skill E2E rule
    source: —
    test: frontend/e2e/auth.spec.ts:38-48 — ends without expect(consoleErrors).toEqual([])
  fix_hint: Assert the captured error array is empty at the end of every E2E test.

── E-14 (low) ─────────────────────────────────────
  reason: No spec tests a mobile viewport.
  evidence:
    LLD: PRD NFR-UI-01 (consumer UI)
    source: —
    test: frontend/e2e/*.spec.ts — no page.setViewportSize or mobile project
  fix_hint: Add a mobile-viewport test (page.setViewportSize or a Playwright mobile project) for at least one journey.

── T-05 (low) ─────────────────────────────────────
  reason: No screenshots are saved for human review in any spec.
  evidence:
    LLD: testing skill E2E preflight
    source: —
    test: frontend/e2e/auth.spec.ts, booking.spec.ts — no page.screenshot() calls
  fix_hint: Add page.screenshot() captures at key steps (login, catalog, seats, payment, success) for the human reviewer.

PASSED CHECKS (29):
  U-02: PASS — tests conventionally named/placed (`*.test.ts(x)` in `__tests__/`).
  U-03: PASS — no tests for config/type-only/constants files.
  U-04: PASS — every test file has at least one happy-path test.
  U-07: PASS — state transitions verified (bookings.service.test.ts:57-73 re-queries persisted booking via getBooking).
  U-09: PASS — tests assert on behavior (getByRole/getByText; API status+body), not internal state.
  U-10: PASS — external deps mocked in unit/component tests; DB is real file-backed SQLite, not mocked.
  U-11: PASS — async assertions awaited (findBy*, waitFor, await request(app)).
  U-12: PASS — no toMatchSnapshot calls.
  U-13: PASS — test names describe behavior and expected outcome.
  U-14: PASS — unit tests exercise service methods (AuthService, BookingsService), not DTO getters.
  A-03: PASS — status codes explicitly asserted (toBe(200/400/401/404)).
  A-04: PASS — API tests run against real file-backed SQLite (temp DB via DATABASE_PATH, supertest in-process), not mocked.
  A-07: PASS — non-existent movie returns 404 (api.test.ts:74-78), not 500.
  A-08: PASS — wrong-OTP rejected with 401 (api.test.ts:115-121; auth.service.test.ts:35-43).
  I-01: PASS — booking.spec.ts E2E chains auth→movies→theatres→seats→payment→success (3+ features) in one flow.
  I-04: PASS — shared-state consistency verified at service level (bookings.service.test.ts:57-73 persisted booking matches confirmation).
  E-01: PASS — specs click to navigate after the single initial page.goto("/login").
  E-03: PASS — one spec per user-facing feature area (auth, booking).
  E-04: PASS — booking.spec.ts is a cross-feature journey.
  E-06: PASS — error state tested (auth.spec.ts:38-48 invalid OTP; MoviesPage error test).
  E-07: PASS — loading/processing state tested (booking.spec.ts:59 "Processing Payment...").
  E-09: PASS — asserts on backend-served content (movie/theatre names, A1, 450, Congratulations).
  E-11: PASS — assertions depend on backend data; journey fails if backend is down.
  E-16: PASS — auth boundary tested (wrong-OTP rejection + full authenticated journey).
  E-17: PASS — every PRD user-facing feature exercised in E2E.
  E-18: PASS — PRD specifies no optional query params; path param (movie id) exercised incl. invalid/non-numeric.
  T-02: PASS — "test" script wired in both backend and frontend package.json (vitest run).
  R-04: PASS — no skipped/commented-out tests or placeholder assertions.
  R-05: PASS — no weakened assertions; tests assert the PRD contract.
  D-01: PASS — better-sqlite3 driver in deps (backend/package.json:14) and a real file-backed connection (database.ts:30 new Database(config.databasePath), WAL, foreign_keys ON); no in-memory dict repositories.

N/A (2):
  A-06: N/A — single-tenant app; PRD specifies no workspace/tenant isolation.
  E-15: N/A — no feature is reachable via multiple entry points requiring duplicate-path testing.

ADDITIONAL CONCERNS (outside the checklist — reported, not scored):

── JWT issued but never verified; booking endpoint unauthenticated ─────────────────────────────────────
  concern: The backend issues a signed JWT on OTP verify but no endpoint (including POST /api/bookings) verifies it, so the auth boundary is cosmetic and bookings can be created without any session.
  evidence: backend/src/services/auth.service.ts:53 (jwt.sign); backend/src/routes/bookings.routes.ts:23-34 (no auth middleware); backend/src/app.ts:37-40 (routers mounted with no auth guard)
  impact: FR-AUTH-03's "authenticated session" is not enforced; any client can POST a booking without logging in, so the login gate does not protect the booking funnel.
  fix_hint: Add an auth middleware that verifies the JWT (Authorization: Bearer) and mount it on POST /api/bookings; add an API test that a booking without a token is rejected 401.

── Payment form accepts empty Card/UPI fields ─────────────────────────────────────
  concern: The payment form uses noValidate and handlePay never validates the card number/expiry/CVV or UPI ID, so an empty payment detail set is submitted.
  evidence: frontend/app/payment/page.tsx:112 (form noValidate), frontend/app/payment/page.tsx:42-49 (handlePay sets processing with no field validation)
  impact: FR-PAY-02/03 collect payment details but they can be blank; the demo can complete a booking with empty card/UPI data.
  fix_hint: Validate required payment fields in handlePay (or rely on
