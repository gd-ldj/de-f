# Testing Patterns

**Analysis Date:** 2026-04-09

Derived from `playwright.config.js`, `package.json` scripts, and the contents of `tests/`.

## Test Framework

- **Single framework: Playwright.** `@playwright/test@^1.58.2` with `@axe-core/playwright@^4.11.1` for accessibility assertions.
- **No unit test framework.** There is no Vitest / Jest / React Testing Library config. All testing is end-to-end against a running `pnpm dev` server.
- Config: `playwright.config.js` (root).
- Test discovery: `testDir: './tests'`, `testMatch: '**/*.spec.{ts,js}'`.
- Test timeout: `60_000 ms` per test (SSR pages depend on backend API).
- Reporters: `html` + `list` + `json` (`test-results/results.json`).
- `fullyParallel: true`.

## Dev Server

Playwright auto-starts the dev server:

```js
webServer: {
  command: 'pnpm dev',
  url: 'http://localhost:4321',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}
```

Base URL for all `page.goto(...)` calls is `http://localhost:4321`.

## Test Suites

Each suite is a sibling folder under `tests/`. The npm scripts map 1:1.

| Suite | Location | Script | Purpose |
|---|---|---|---|
| E2E (default) | `tests/e2e/` | `pnpm test` / `pnpm test:e2e` | Core user flows and UI checks |
| Accessibility | `tests/a11y/` | `pnpm test:a11y` | axe-core scans |
| Integration | `tests/integration/` | `pnpm test:integration` | Data contracts, hydration, i18n, filter+pagination |
| Performance | `tests/performance/` | `pnpm test:perf` | Web vitals |
| Content Health | `tests/content-health/` | `pnpm test:health` | Content/page health validations |
| UI Anomaly | `tests/ui-anomaly/` | `pnpm test:ui-anomaly` | Layout/visual anomaly detection |
| All | all of the above | `pnpm test:all` | Full Playwright run |

### Existing Spec Catalog

- `tests/e2e/homepage-ui.spec.ts` — homepage sections, responsive breakpoints, no-horizontal-overflow check.
- `tests/e2e/homepage.spec.js`
- `tests/e2e/article-ui.spec.ts`
- `tests/e2e/article.spec.js`
- `tests/e2e/category-ui.spec.ts`
- `tests/e2e/navigation-responsive.spec.ts`
- `tests/e2e/navigation.spec.js`
- `tests/e2e/recent-research.spec.ts`
- `tests/a11y/accessibility.spec.ts`
- `tests/integration/data-contract.spec.ts`
- `tests/integration/filter-pagination.spec.ts`
- `tests/integration/hydration.spec.ts`
- `tests/integration/i18n.spec.ts`
- `tests/performance/web-vitals.spec.ts`
- `tests/content-health/content-validation.spec.ts`
- `tests/content-health/pages-health.spec.ts`
- `tests/ui-anomaly/ui-anomaly.spec.ts`

Newer `.ts` specs use `test.step(...)` blocks to structure scenarios (see recent commit `3ac6b2c test: add test.step structure to a11y, integration, and performance specs`). Follow that pattern for new tests.

## Projects (Browsers & Viewports)

Defined in `playwright.config.js`. Default runs are **Chromium only + custom breakpoint viewports** (fast, ~125 tests).

**Always enabled:**

- `chromium` — `Desktop Chrome` defaults (1280×720).
- `viewport-mobile-375` — 375×812 (mobile breakpoint).
- `viewport-tablet-768` — 768×1024 (md).
- `viewport-desktop-1024` — 1024×768 (lg).
- `viewport-desktop-1440` — 1440×900 (max content width).

**Gated behind `FULL_BROWSER=1`:**

- `firefox` — `Desktop Firefox`
- `webkit` — `Desktop Safari`
- `mobile-chrome` — `Pixel 5`
- `mobile-safari` — `iPhone 12`
- `tablet` — `iPad (gen 7)`

Run commands:

```bash
pnpm test                        # Chromium + breakpoint viewports (default)
FULL_BROWSER=1 pnpm test         # All browsers + real device emulation
pnpm test:chromium               # Chromium project only
pnpm test:firefox                # Firefox (needs FULL_BROWSER=1)
pnpm test:webkit                 # WebKit  (needs FULL_BROWSER=1)
pnpm test:mobile                 # Mobile Chrome + Mobile Safari (needs FULL_BROWSER=1)
pnpm test:ui                     # Playwright UI mode
pnpm test:debug                  # Debug mode
pnpm test:report                 # Show last HTML report
```

## Shared `use` Settings

```js
use: {
  baseURL: 'http://localhost:4321',
  trace: 'off',
  screenshot: process.env.CI ? 'off' : 'only-on-failure',
  video: process.env.CI ? 'off' : 'retain-on-failure',
}
```

- Local runs capture screenshots + video only on failure.
- CI disables screenshots/video/trace for speed.

## Test Helpers (`tests/utils/`)

Shared utilities imported by specs:

- `tests/utils/test-pages.ts` — centralized route constants and navigation helpers. Exports `TEST_PAGES` (`home`, `news`, `research`, `insights`, `tutorials`, `collections`), `ARTICLE_LIST_PAGES`, and `navigateToFirstArticle(page)`. **Use these constants instead of hard-coding URLs** in new specs.
- `tests/utils/content-scanner.ts` — content-health scanning helpers.
- `tests/utils/data-contract-validator.ts` — validates API response shapes in integration tests.
- `tests/utils/semantic-validators.ts` — semantic DOM/heading validators.
- `tests/utils/ui-anomaly-detector.ts` — anomaly detection used by `ui-anomaly.spec.ts`.

## Writing New Tests — Patterns

Import form (from `tests/e2e/homepage-ui.spec.ts`):

```ts
import { test, expect } from '@playwright/test';
```

- Prefer TypeScript `.spec.ts` for new tests. Legacy `.spec.js` files exist and still run but should not be expanded.
- Use `getByRole`, `getByText`, and other accessible locators over brittle CSS.
- Wrap scenario steps in `test.step('description', async () => { ... })` — matches the house style adopted across `a11y/`, `integration/`, `performance/` suites.
- Assertions on layout/breakpoint behavior should reuse the Tailwind v4 breakpoint comments at the top of `homepage-ui.spec.ts` (sm 640, md 768, lg 1024, xl 1280, 2xl 1536; max content 1440px; mobile header 56px).
- Debounce/network-dependent assertions should `await page.waitForLoadState('networkidle')` — SSR pages depend on a backend API and can be slow.

## Visual / Screenshot Testing

- **No Playwright `toMatchSnapshot` / visual regression baselines in the repo.** Screenshots are captured only `only-on-failure` for debugging.
- UI regressions are caught via the `ui-anomaly` suite (`tests/ui-anomaly/ui-anomaly.spec.ts` + `tests/utils/ui-anomaly-detector.ts`) which programmatically inspects layout rather than comparing pixel baselines.
- Per the global UI self-validation rule, humans/agents changing UI should still manually screenshot the affected pages via Playwright MCP / dev tools before claiming a task is done — but this is a developer-time check, not a CI gate.

## Accessibility

- `tests/a11y/accessibility.spec.ts` drives `@axe-core/playwright` scans across key routes from `TEST_PAGES`.
- Failures should be addressed at the source (missing alt text, labels, heading order) rather than suppressed.

## CI Considerations

Set via env in `playwright.config.js`:

- `forbidOnly: !!process.env.CI` — `.only()` in a test fails the CI build.
- `retries: process.env.CI ? 2 : 0` — 2 automatic retries on CI, none locally.
- `workers: process.env.CI ? 1 : undefined` — single worker on CI (stability > speed).
- CI disables screenshots, video, and trace capture.
- `reuseExistingServer: !process.env.CI` — CI always starts a fresh dev server.

## Helper Scripts

- `pnpm dev-test` → `./dev-test.sh` — project-specific dev + test convenience wrapper.
- `pnpm test:report` — opens the last HTML report from `playwright-report/`.

---

*Testing analysis: 2026-04-09*
