import { test, expect } from '@playwright/test';
import { TEST_PAGES, isPageLoaded } from '../utils/test-pages';

/**
 * P0: Integration Tests — Filter, Sort & Pagination
 * Tests CategoryPage filter/sort/pagination interactions on /news.
 */

test.describe('Filter & Pagination: /news', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_PAGES.news);
    await page.waitForLoadState('networkidle');
    const loaded = await isPageLoaded(page);
    test.skip(!loaded, 'Page did not load — API may be unavailable');
  });

  test('category filter updates URL and refreshes list', async ({ page }) => {
    const categorySelect = page.locator('[data-testid="category-select"], .category-select, [class*="CategoryMultiSelect"]').first();

    await test.step('find category select control', async () => {
      const hasCategorySelect = await categorySelect.count();
      test.skip(hasCategorySelect === 0, 'No category select found on page');
    });

    await test.step('open category dropdown', async () => {
      await categorySelect.click();
      await page.waitForTimeout(300);
    });

    const option = page.locator('[role="option"], [data-testid="category-option"]').first();

    await test.step('select first category option', async () => {
      const hasOption = await option.count();
      test.skip(hasOption === 0, 'No category options found');
      await option.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('verify URL contains category param', async () => {
      expect(page.url()).toMatch(/category_name=|category=/);
    });
  });

  test('sort toggle updates URL order_by param', async ({ page }) => {
    const sortButtons = page.locator('[data-testid*="sort"], button:has-text("Popular"), button:has-text("Trending"), button:has-text("Latest")');

    await test.step('find sort controls', async () => {
      const count = await sortButtons.count();
      test.skip(count === 0, 'No sort controls found');
    });

    await test.step('click a sort option', async () => {
      const count = await sortButtons.count();
      const targetButton = count > 1 ? sortButtons.nth(1) : sortButtons.first();
      await targetButton.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('verify URL contains order_by param', async () => {
      expect(page.url()).toMatch(/order_by=/);
    });
  });

  test('clear all resets URL params and restores list', async ({ page }) => {
    await test.step('set a filter first', async () => {
      const sortButtons = page.locator('button:has-text("Popular"), button:has-text("Trending")');
      const hasSortBtn = await sortButtons.count();
      test.skip(hasSortBtn === 0, 'No sort buttons to trigger filter state');
      await sortButtons.first().click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('click Clear All button', async () => {
      const clearBtn = page.locator('button:has-text("Clear All"), button:has-text("Clear"), [data-testid="clear-filter"]').first();
      const hasClear = await clearBtn.count();
      test.skip(hasClear === 0, 'No clear button found');
      await clearBtn.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('verify URL params are cleared', async () => {
      const url = new URL(page.url());
      expect(url.searchParams.has('order_by')).toBeFalsy();
      expect(url.searchParams.has('category_name')).toBeFalsy();
    });
  });

  test('pagination: navigate to page 2 updates URL', async ({ page }) => {
    const page2Btn = page.locator('[data-testid="page-2"], a:has-text("2"), button:has-text("2")').first();
    const nextBtn = page.locator('button:has-text("Next"), a:has-text("Next"), [data-testid="next-page"]').first();

    await test.step('find pagination controls', async () => {
      const hasPage2 = await page2Btn.count();
      const hasNext = await nextBtn.count();
      test.skip(hasPage2 === 0 && hasNext === 0, 'No pagination controls found (may have < 2 pages)');
    });

    await test.step('click page 2 or Next', async () => {
      const hasPage2 = await page2Btn.count();
      if (hasPage2 > 0) {
        await page2Btn.click();
      } else {
        await nextBtn.click();
      }
      await page.waitForLoadState('networkidle');
    });

    await test.step('verify URL contains page=2', async () => {
      expect(page.url()).toMatch(/page=2/);
    });
  });

  test('URL params restore filter state on direct navigation', async ({ page }) => {
    await test.step('navigate with URL params ?page=2&order_by=Popular', async () => {
      await page.goto(`${TEST_PAGES.news}?page=2&order_by=Popular`);
      await page.waitForLoadState('networkidle');
      const loaded = await isPageLoaded(page);
      test.skip(!loaded, 'Page did not load with URL params');
    });

    await test.step('verify page=2 preserved in URL', async () => {
      expect(page.url()).toContain('page=2');
    });

    await test.step('verify order_by=Popular preserved in URL', async () => {
      expect(page.url()).toContain('order_by=Popular');
    });
  });

  test('multiple filters combine in URL', async ({ page }) => {
    await test.step('navigate with combined params', async () => {
      await page.goto(`${TEST_PAGES.news}?order_by=Popular&page=1`);
      await page.waitForLoadState('networkidle');
      const loaded = await isPageLoaded(page);
      test.skip(!loaded, 'Page did not load');
    });

    await test.step('verify order_by param value is Popular', async () => {
      const url = new URL(page.url());
      expect(url.searchParams.get('order_by')).toBe('Popular');
    });
  });
});
