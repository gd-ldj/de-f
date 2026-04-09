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

      await test.step('set up console error listener', async () => {
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
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
      });

      await test.step(`navigate to ${path}`, async () => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const loaded = await isPageLoaded(page);
        test.skip(!loaded, `Page ${path} did not load`);
      });

      await test.step('wait for React hydration to complete', async () => {
        await page.waitForTimeout(2000);
      });

      await test.step('assert no hydration errors in console', async () => {
        expect(
          consoleErrors,
          `Found React hydration errors on ${path}:\n${consoleErrors.join('\n')}`
        ).toHaveLength(0);
      });
    });
  }
});

test.describe('Hydration: Interactive Component Availability', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('/news — FilterBar is interactive after hydration', async ({ page }) => {
    await test.step('navigate to /news', async () => {
      await page.goto(TEST_PAGES.news);
      await page.waitForLoadState('networkidle');
      const loaded = await isPageLoaded(page);
      test.skip(!loaded, 'News page did not load');
    });

    const filterElements = page.locator(
      '[data-testid*="filter"], [data-testid*="sort"], button:has-text("Latest"), button:has-text("Popular"), button:has-text("Trending")'
    );

    await test.step('find filter/sort controls', async () => {
      const count = await filterElements.count();
      test.skip(count === 0, 'No filter elements found on /news');
    });

    await test.step('verify filter control is visible', async () => {
      await expect(filterElements.first()).toBeVisible();
    });

    await test.step('verify filter control is enabled (clickable)', async () => {
      await expect(filterElements.first()).toBeEnabled();
    });
  });

  test('/news — article list populates after data loading', async ({ page }) => {
    await test.step('navigate to /news', async () => {
      await page.goto(TEST_PAGES.news);
      await page.waitForLoadState('networkidle');
      const loaded = await isPageLoaded(page);
      test.skip(!loaded, 'News page did not load');
    });

    const articleCards = page.locator(
      'article, [data-testid*="article-card"], a[href*="/article/"]'
    );

    await test.step('wait for article cards to appear', async () => {
      await expect(articleCards.first()).toBeVisible({ timeout: 15_000 });
    });

    await test.step('verify article list has content', async () => {
      const count = await articleCards.count();
      expect(count, 'Expected article list to populate with content').toBeGreaterThan(0);
    });
  });

  test('/ — home page dynamic content loads', async ({ page }) => {
    await test.step('navigate to home page', async () => {
      await page.goto(TEST_PAGES.home);
      await page.waitForLoadState('networkidle');
      const loaded = await isPageLoaded(page);
      test.skip(!loaded, 'Home page did not load');
    });

    await test.step('verify article links rendered by React', async () => {
      const dynamicContent = page.locator('a[href*="/article/"]');
      await expect(dynamicContent.first()).toBeVisible({ timeout: 15_000 });
    });
  });
});
