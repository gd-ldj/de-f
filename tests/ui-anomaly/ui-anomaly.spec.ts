import { test, expect } from '@playwright/test';
import {
  detectBrokenImages,
  detectOverflow,
  detectInvisibleContent,
  detectLayoutAnomalies,
  detectTextReadabilityIssues,
  detectInteractionIssues,
} from '../utils/ui-anomaly-detector';
import { navigateToFirstArticle, isPageLoaded } from '../utils/test-pages';

/**
 * Layer 3: UI Anomaly Detection Tests
 *
 * Heuristic-based UI checks that detect real problems without baseline screenshots.
 * Each detector runs independently and reports specific anomalies.
 *
 * No baselines needed — rules are self-contained.
 */

// ─────────────────────────────────────────────
// Test matrix
// ─────────────────────────────────────────────

const PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'News', path: '/news' },
  { name: 'Research', path: '/research' },
  { name: 'Insights', path: '/insights' },
] as const;

const VIEWPORTS = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 375, height: 812 },
] as const;

// ─────────────────────────────────────────────
// Standard page tests
// ─────────────────────────────────────────────

for (const pageInfo of PAGES) {
  for (const viewport of VIEWPORTS) {
    test.describe(`${pageInfo.name} @ ${viewport.width}px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');

        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `${pageInfo.name} did not load`);
      });

      test('no broken images', async ({ page }) => {
        const result = await detectBrokenImages(page);
        expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
      });

      test('no overflow', async ({ page }) => {
        const result = await detectOverflow(page, viewport.width);
        expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
      });

      test('no empty containers', async ({ page }) => {
        const result = await detectInvisibleContent(page);
        expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
      });

      test('layout integrity', async ({ page }) => {
        const result = await detectLayoutAnomalies(page, {
          pagePath: pageInfo.path,
          viewportWidth: viewport.width,
        });
        expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
      });

      test('text readability', async ({ page }) => {
        const result = await detectTextReadabilityIssues(page);
        expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
      });

      test('interactive elements accessible', async ({ page }) => {
        const result = await detectInteractionIssues(page);
        expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
      });
    });
  }
}

// ─────────────────────────────────────────────
// Article detail page tests
// ─────────────────────────────────────────────

for (const viewport of VIEWPORTS) {
  test.describe(`Article Detail @ ${viewport.width}px`, () => {
    let articleUrl: string | null = null;

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      articleUrl = await navigateToFirstArticle(page);
      test.skip(!articleUrl, 'No article links found — backend API may be unavailable');
    });

    test('no broken images', async ({ page }) => {
      const result = await detectBrokenImages(page);
      expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
    });

    test('no overflow', async ({ page }) => {
      const result = await detectOverflow(page, viewport.width);
      expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
    });

    test('no empty containers', async ({ page }) => {
      const result = await detectInvisibleContent(page);
      expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
    });

    test('layout integrity', async ({ page }) => {
      const pagePath = articleUrl ? new URL(articleUrl).pathname : '/article/unknown';
      const result = await detectLayoutAnomalies(page, {
        pagePath,
        viewportWidth: viewport.width,
      });
      expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
    });

    test('text readability', async ({ page }) => {
      const result = await detectTextReadabilityIssues(page);
      expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
    });

    test('interactive elements accessible', async ({ page }) => {
      const result = await detectInteractionIssues(page);
      expect(result.anomalies.filter((a) => a.severity === 'error')).toEqual([]);
    });
  });
}
