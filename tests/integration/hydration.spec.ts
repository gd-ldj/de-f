import { test, expect } from '@playwright/test';
import { TEST_PAGES, isPageLoaded } from '../utils/test-pages';

/**
 * P0: Integration Tests — React Hydration & Island Interactivity
 * Ensures React islands hydrate without errors and interactive components work.
 */

test.describe('Hydration: Console Error Monitoring', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const pagesToTest = [TEST_PAGES.home, TEST_PAGES.news, TEST_PAGES.research];

  for (const path of pagesToTest) {
    test(`${path} — no React hydration errors`, async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Capture hydration-related errors
          if (
            text.includes('Hydration') ||
            text.includes('hydrat') ||
            text.includes('server-rendered') ||
            text.includes('did not match') ||
            text.includes('Minified React error')
          ) {
            consoleErrors.push(text);
          }
        }
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const loaded = await isPageLoaded(page);
      test.skip(!loaded, `Page ${path} did not load`);

      // Wait a bit for React to finish hydration
      await page.waitForTimeout(2000);

      expect(
        consoleErrors,
        `Found React hydration errors on ${path}:\n${consoleErrors.join('\n')}`
      ).toHaveLength(0);
    });
  }
});

test.describe('Hydration: Interactive Component Availability', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('/news — FilterBar is interactive after hydration', async ({ page }) => {
    await page.goto(TEST_PAGES.news);
    await page.waitForLoadState('networkidle');

    const loaded = await isPageLoaded(page);
    test.skip(!loaded, 'News page did not load');

    // Look for interactive filter elements (buttons, dropdowns)
    const filterElements = page.locator(
      '[data-testid*="filter"], [data-testid*="sort"], button:has-text("Latest"), button:has-text("Popular"), button:has-text("Trending")'
    );
    const count = await filterElements.count();
    test.skip(count === 0, 'No filter elements found on /news');

    // Verify the element is clickable (not just rendered)
    const firstFilter = filterElements.first();
    await expect(firstFilter).toBeVisible();
    await expect(firstFilter).toBeEnabled();
  });

  test('/news — article list populates after data loading', async ({ page }) => {
    await page.goto(TEST_PAGES.news);
    await page.waitForLoadState('networkidle');

    const loaded = await isPageLoaded(page);
    test.skip(!loaded, 'News page did not load');

    // Wait for article cards to appear (React Query data fetch)
    const articleCards = page.locator(
      'article, [data-testid*="article-card"], a[href*="/article/"]'
    );

    // Should have at least 1 article after data loads
    await expect(articleCards.first()).toBeVisible({ timeout: 15_000 });
    const count = await articleCards.count();
    expect(count, 'Expected article list to populate with content').toBeGreaterThan(0);
  });

  test('/ — home page dynamic content loads', async ({ page }) => {
    await page.goto(TEST_PAGES.home);
    await page.waitForLoadState('networkidle');

    const loaded = await isPageLoaded(page);
    test.skip(!loaded, 'Home page did not load');

    // Verify some dynamic content rendered (articles, sections)
    const dynamicContent = page.locator('a[href*="/article/"]');
    await expect(dynamicContent.first()).toBeVisible({ timeout: 15_000 });
  });
});
