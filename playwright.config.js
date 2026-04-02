import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration for DeTake Frontend
 * Supports multi-browser, desktop and mobile viewport testing
 * @see https://playwright.dev/docs/test-configuration
 *
 * Default: Chromium only with custom breakpoint viewports (fast, ~125 tests)
 * Full:    Set FULL_BROWSER=1 to also run Firefox, WebKit, and real device emulation
 *
 * Usage:
 *   pnpm test                           # Chromium + breakpoint viewports
 *   FULL_BROWSER=1 pnpm test            # All browsers + devices + breakpoints
 *   npx playwright test --project=chromium   # Single project
 */

const isFullBrowser = !!process.env.FULL_BROWSER;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.{ts,js}',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Increase timeout for SSR pages that depend on backend API */
  timeout: 60_000,

  /* Reporter to use */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:4321',

    /* Collect trace when retrying the failed test */
    trace: 'off',

    /* Screenshot on failure */
    screenshot: process.env.CI ? 'off' : 'only-on-failure',

    /* Video on failure */
    video: process.env.CI ? 'off' : 'retain-on-failure',
  },

/* Configure projects for browsers and viewports */
  projects: [
    // === Default: Chromium desktop (1280x720) ===
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // === Custom Breakpoint Viewports (always enabled) ===
    {
      name: 'viewport-mobile-375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'viewport-tablet-768',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'viewport-desktop-1024',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'viewport-desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },

    // === Extra browsers & devices (FULL_BROWSER=1 only) ===
    ...(isFullBrowser
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
          {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
          },
          {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
          },
          {
            name: 'tablet',
            use: { ...devices['iPad (gen 7)'] },
          },
        ]
      : []),
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
