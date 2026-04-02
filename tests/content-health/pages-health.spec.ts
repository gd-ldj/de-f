import { test, expect } from '@playwright/test';
import { TEST_PAGES, navigateToFirstArticle, isPageLoaded } from '../utils/test-pages';
import { scanPageForPoisonPatterns } from '../utils/content-scanner';

/**
 * Layer 1: Content Health Scan
 * Scans all major pages for "poison patterns" — rendering bugs that indicate
 * data mapping errors, serialization failures, or missing translations.
 *
 * Examples caught:
 * - Author name showing as [object Object]
 * - Dates showing "undefined" or "NaN"
 * - Raw i18n keys like "common.loadMore" displayed to users
 * - TODO/FIXME/PLACEHOLDER markers in production
 */

test.describe('Content Health: Poison Pattern Scan', () => {
  // Use a single viewport for health checks
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const [name, path] of Object.entries(TEST_PAGES)) {
    test(`${name} page (${path}) — no poison patterns`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const loaded = await isPageLoaded(page);
      test.skip(!loaded, `Page ${path} did not load — API may be unavailable`);

      const result = await scanPageForPoisonPatterns(page);

      if (!result.passed) {
        const summary = result.matches
          .map((m) => `  [${m.pattern}] in "${m.selector}": "${m.text.slice(0, 100)}"`)
          .join('\n');
        expect(result.passed, `Found poison patterns on ${path}:\n${summary}`).toBe(true);
      }
    });
  }

  test('article detail page — no poison patterns', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found — backend API may be unavailable');

    const result = await scanPageForPoisonPatterns(page);

    if (!result.passed) {
      const summary = result.matches
        .map((m) => `  [${m.pattern}] in "${m.selector}": "${m.text.slice(0, 100)}"`)
        .join('\n');
      expect(result.passed, `Found poison patterns on article page:\n${summary}`).toBe(true);
    }
  });
});
