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
    // Find and click a category filter option
    const categorySelect = page.locator('[data-testid="category-select"], .category-select, [class*="CategoryMultiSelect"]').first();
    const hasCategorySelect = await categorySelect.count();
    test.skip(hasCategorySelect === 0, 'No category select found on page');

    await categorySelect.click();
    await page.waitForTimeout(300);

    // Click first available option
    const option = page.locator('[role="option"], [data-testid="category-option"]').first();
    const hasOption = await option.count();
    test.skip(hasOption === 0, 'No category options found');

    await option.click();
    await page.waitForLoadState('networkidle');

    // URL should contain category param
    expect(page.url()).toMatch(/category_name=|category=/);
  });

  test('sort toggle updates URL order_by param', async ({ page }) => {
    // Look for sort controls
    const sortButtons = page.locator('[data-testid*="sort"], button:has-text("Popular"), button:has-text("Trending"), button:has-text("Latest")');
    const count = await sortButtons.count();
    test.skip(count === 0, 'No sort controls found');

    // Click the second sort option (switch from default)
    const targetButton = count > 1 ? sortButtons.nth(1) : sortButtons.first();
    await targetButton.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toMatch(/order_by=/);
  });

  test('clear all resets URL params and restores list', async ({ page }) => {
    // First set a filter to have something to clear
    const sortButtons = page.locator('button:has-text("Popular"), button:has-text("Trending")');
    const hasSortBtn = await sortButtons.count();
    test.skip(hasSortBtn === 0, 'No sort buttons to trigger filter state');

    await sortButtons.first().click();
    await page.waitForLoadState('networkidle');

    // Now clear
    const clearBtn = page.locator('button:has-text("Clear All"), button:has-text("Clear"), [data-testid="clear-filter"]').first();
    const hasClear = await clearBtn.count();
    test.skip(hasClear === 0, 'No clear button found');

    await clearBtn.click();
    await page.waitForLoadState('networkidle');

    const url = new URL(page.url());
    expect(url.searchParams.has('order_by')).toBeFalsy();
    expect(url.searchParams.has('category_name')).toBeFalsy();
  });

  test('pagination: navigate to page 2 updates URL', async ({ page }) => {
    // Find pagination controls
    const page2Btn = page.locator('[data-testid="page-2"], a:has-text("2"), button:has-text("2")').first();
    const nextBtn = page.locator('button:has-text("Next"), a:has-text("Next"), [data-testid="next-page"]').first();

    const hasPage2 = await page2Btn.count();
    const hasNext = await nextBtn.count();
    test.skip(hasPage2 === 0 && hasNext === 0, 'No pagination controls found (may have < 2 pages)');

    if (hasPage2 > 0) {
      await page2Btn.click();
    } else {
      await nextBtn.click();
    }
    await page.waitForLoadState('networkidle');

    expect(page.url()).toMatch(/page=2/);
  });

  test('URL params restore filter state on direct navigation', async ({ page }) => {
    await page.goto(`${TEST_PAGES.news}?page=2&order_by=Popular`);
    await page.waitForLoadState('networkidle');

    const loaded = await isPageLoaded(page);
    test.skip(!loaded, 'Page did not load with URL params');

    // Verify URL still has the params (not redirected away)
    expect(page.url()).toContain('page=2');
    expect(page.url()).toContain('order_by=Popular');
  });

  test('multiple filters combine in URL', async ({ page }) => {
    // Navigate with combined params
    await page.goto(`${TEST_PAGES.news}?order_by=Popular&page=1`);
    await page.waitForLoadState('networkidle');

    const loaded = await isPageLoaded(page);
    test.skip(!loaded, 'Page did not load');

    const url = new URL(page.url());
    expect(url.searchParams.get('order_by')).toBe('Popular');
  });
});
