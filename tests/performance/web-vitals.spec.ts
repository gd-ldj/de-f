import { test, expect } from '@playwright/test';
import { TEST_PAGES, navigateToFirstArticle, isPageLoaded } from '../utils/test-pages';

/**
 * P3: Performance Smoke Tests — Web Vitals & Runtime Error Monitoring
 * Ensures key metrics don't regress and no runtime errors appear.
 * Thresholds are lenient (dev server is slower than production).
 */

// Dev server thresholds (more lenient than production)
const THRESHOLDS = {
  LCP_MS: 4000, // Largest Contentful Paint < 4s
  CLS: 0.25, // Cumulative Layout Shift < 0.25
};

// Known harmless console errors to ignore
const IGNORED_ERROR_PATTERNS = [
  /third-party/i,
  /CORS/i,
  /Failed to load resource.*third/i,
  /favicon/i,
  /analytics/i,
  /gtag/i,
  /cloudflare/i,
  /sentry/i,
  /clerk/i,
  /vercel/i,
  /fingerprintjs/i,
  /ERR_BLOCKED_BY_CLIENT/i, // Ad blockers
];

// Known third-party URLs to exclude from network error checks
const IGNORED_URL_PATTERNS = [
  /analytics/,
  /gtag/,
  /cloudflare/,
  /sentry/,
  /clerk/,
  /vercel/,
  /fingerprintjs/,
  /fonts\.googleapis/,
  /google/,
  /facebook/,
];

const PAGES_TO_TEST = [TEST_PAGES.home, TEST_PAGES.news];

test.describe('Performance: LCP (Largest Contentful Paint)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of PAGES_TO_TEST) {
    test(`${path} — LCP < ${THRESHOLDS.LCP_MS}ms`, async ({ page }) => {
      // Set up LCP observer before navigation
      const lcpPromise = page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let lastLCP = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              lastLCP = entry.startTime;
            }
          });
          observer.observe({ type: 'largest-contentful-paint', buffered: true });

          // Resolve after page settles
          setTimeout(() => {
            observer.disconnect();
            resolve(lastLCP);
          }, 5000);
        });
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const loaded = await isPageLoaded(page);
      test.skip(!loaded, `Page ${path} did not load`);

      const lcp = await lcpPromise;

      // LCP of 0 means observer didn't fire (page may have no LCP candidate)
      if (lcp > 0) {
        expect(
          lcp,
          `LCP on ${path} is ${lcp.toFixed(0)}ms (threshold: ${THRESHOLDS.LCP_MS}ms)`
        ).toBeLessThan(THRESHOLDS.LCP_MS);
      }
    });
  }
});

test.describe('Performance: CLS (Cumulative Layout Shift)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of PAGES_TO_TEST) {
    test(`${path} — CLS < ${THRESHOLDS.CLS}`, async ({ page }) => {
      // Set up CLS observer before navigation
      const clsPromise = page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let cumulativeCLS = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Only count layout shifts without user input
              if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
                cumulativeCLS += (entry as PerformanceEntry & { value: number }).value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });

          // Wait for page to settle
          setTimeout(() => {
            observer.disconnect();
            resolve(cumulativeCLS);
          }, 5000);
        });
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const loaded = await isPageLoaded(page);
      test.skip(!loaded, `Page ${path} did not load`);

      const cls = await clsPromise;

      expect(
        cls,
        `CLS on ${path} is ${cls.toFixed(3)} (threshold: ${THRESHOLDS.CLS})`
      ).toBeLessThan(THRESHOLDS.CLS);
    });
  }
});

test.describe('Performance: Console Error Monitoring', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of PAGES_TO_TEST) {
    test(`${path} — no unexpected console errors`, async ({ page }) => {
      const unexpectedErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          const isIgnored = IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(text));
          if (!isIgnored) {
            unexpectedErrors.push(text.slice(0, 200));
          }
        }
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const loaded = await isPageLoaded(page);
      test.skip(!loaded, `Page ${path} did not load`);

      // Wait for async operations
      await page.waitForTimeout(3000);

      expect(
        unexpectedErrors,
        `Found ${unexpectedErrors.length} unexpected console errors on ${path}:\n${unexpectedErrors.join('\n')}`
      ).toHaveLength(0);
    });
  }
});

test.describe('Performance: Network Error Monitoring', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of PAGES_TO_TEST) {
    test(`${path} — no 5xx errors on critical API calls`, async ({ page }) => {
      const serverErrors: string[] = [];

      page.on('response', (response) => {
        const url = response.url();
        const status = response.status();

        // Only check for server errors (5xx)
        if (status >= 500) {
          const isIgnored = IGNORED_URL_PATTERNS.some((pattern) => pattern.test(url));
          if (!isIgnored) {
            serverErrors.push(`${status} ${url.slice(0, 150)}`);
          }
        }
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const loaded = await isPageLoaded(page);
      test.skip(!loaded, `Page ${path} did not load`);

      await page.waitForTimeout(2000);

      expect(
        serverErrors,
        `Found ${serverErrors.length} server errors (5xx) on ${path}:\n${serverErrors.join('\n')}`
      ).toHaveLength(0);
    });
  }

  test('article detail — no 5xx errors', async ({ page }) => {
    const serverErrors: string[] = [];

    page.on('response', (response) => {
      const status = response.status();
      if (status >= 500) {
        const url = response.url();
        const isIgnored = IGNORED_URL_PATTERNS.some((pattern) => pattern.test(url));
        if (!isIgnored) {
          serverErrors.push(`${status} ${url.slice(0, 150)}`);
        }
      }
    });

    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article found — API may be unavailable');

    await page.waitForTimeout(2000);

    expect(
      serverErrors,
      `Found ${serverErrors.length} server errors on article detail:\n${serverErrors.join('\n')}`
    ).toHaveLength(0);
  });
});
