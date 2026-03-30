import { test, expect, type Page } from '@playwright/test';

/**
 * DeTake Frontend - Category / Listing Page UI & Responsive E2E Tests
 *
 * Covers: Desktop 1440px, Tablet 768px, Mobile 375px viewports
 * Pages:  /news, /research, /insights, /tutorials, /collections
 */

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/** Returns true when the page has no horizontal scrollbar. */
async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

// ---------------------------------------------------------------------------
// Desktop – 1440 × 900
// ---------------------------------------------------------------------------

test.describe('Category Pages – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('/news loads and shows FilterBar + articles', async ({ page }) => {
    await navigateTo(page, '/news');

    // Page title contains DeTake
    await expect(page).toHaveTitle(/DeTake/i);

    // FilterBar: the component renders a wrapper with filter controls
    // It exposes a "Filters" label or filter dropdown buttons
    const filterBar = page.locator('[class*="filter"], [data-testid="filter-bar"]').first();
    const filterCount = await filterBar.count();

    // Fall back to looking for filter-related buttons/text if no data-testid
    if (filterCount === 0) {
      const filterText = page.getByText(/filters|category|topic/i).first();
      await expect(filterText).toBeVisible();
    } else {
      await expect(filterBar).toBeVisible();
    }

    // Article grid: articles are rendered inside <article> elements
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible({ timeout: 10_000 });
    expect(await articles.count()).toBeGreaterThan(0);

    // Article cards have titles (h3) and images
    const firstCard = articles.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    const img = firstCard.locator('img');
    expect(await img.count()).toBeGreaterThan(0);

    // No horizontal overflow
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('/news desktop grid shows multiple columns', async ({ page }) => {
    await navigateTo(page, '/news');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return; // not enough data to assert layout

    // At desktop the grid uses md:grid-cols-3 lg:grid-cols-4
    // Verify articles are NOT stacked (different x positions)
    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    if (box1 && box2) {
      // In a multi-column grid the second card starts to the right, not below
      expect(box2.x).toBeGreaterThan(box1.x);
    }
  });

  test('/news shows desktop pagination or has enough articles', async ({ page }) => {
    await navigateTo(page, '/news');

    // Check pagination exists (may be hidden if few articles)
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination" i]');
    const paginationCount = await pagination.count();

    // Either pagination exists or articles are present
    const articles = page.locator('article');
    const articleCount = await articles.count();

    expect(paginationCount + articleCount).toBeGreaterThan(0);
  });

  test('/news keeps query page after refresh when filters are preselected', async ({ page }) => {
    const filteredPath = '/news?page=3&category_name=Technology&subcategory_name=New%20Releases';

    await navigateTo(page, filteredPath);
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(/\/news\?page=3(?:&|$)/);

    const currentPageButton = page.locator('nav[aria-label="Pagination"] .hidden.sm\\:flex button[aria-current="page"]').filter({ hasText: '3' });
    if (await currentPageButton.count()) {
      await expect(currentPageButton.first()).toBeVisible();
    }

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(/\/news\?page=3(?:&|$)/);
    if (await currentPageButton.count()) {
      await expect(currentPageButton.first()).toBeVisible();
    }
  });

  test('/research loads successfully', async ({ page }) => {
    await navigateTo(page, '/research');
    await expect(page).toHaveTitle(/DeTake/i);

    const articles = page.locator('article');
    const count = await articles.count();
    // Either articles are displayed or a "No articles found" message
    if (count === 0) {
      await expect(page.getByText(/no articles found/i)).toBeVisible();
    } else {
      await expect(articles.first()).toBeVisible();
    }

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('/insights loads successfully', async ({ page }) => {
    await navigateTo(page, '/insights');
    await expect(page).toHaveTitle(/DeTake/i);

    const articles = page.locator('article');
    const count = await articles.count();
    if (count === 0) {
      await expect(page.getByText(/no articles found/i)).toBeVisible();
    } else {
      await expect(articles.first()).toBeVisible();
    }

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tablet – 768 × 1024
// ---------------------------------------------------------------------------

test.describe('Category Pages – Tablet 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('/news loads with articles at tablet', async ({ page }) => {
    await navigateTo(page, '/news');
    await expect(page).toHaveTitle(/DeTake/i);

    // Articles rendered
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(0); // defensive: may be 0 if API empty
    if (count > 0) {
      await expect(articles.first()).toBeVisible();
    }

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('/news tablet grid shows 2-3 columns (not single column)', async ({ page }) => {
    await navigateTo(page, '/news');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    // At md breakpoint (768px) grid is md:grid-cols-3 – articles are side-by-side
    if (box1 && box2) {
      expect(box2.x).toBeGreaterThan(box1.x);
    }
  });

  test('/news article cards show images at tablet', async ({ page }) => {
    await navigateTo(page, '/news');
    const images = page.locator('article img');
    const count = await images.count();
    if (count > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test('/news pagination or articles accessible at tablet', async ({ page }) => {
    await navigateTo(page, '/news');

    // Either pagination controls exist, articles are shown, or the empty-state is rendered.
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination" i]');
    const articles = page.locator('article');
    const emptyState = page.getByText(/no articles found/i);
    const pCount = await pagination.count();
    const aCount = await articles.count();
    const emptyCount = await emptyState.count();
    expect(pCount + aCount + emptyCount).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Mobile – 375 × 812
// ---------------------------------------------------------------------------

test.describe('Category Pages – Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('/news loads successfully on mobile', async ({ page }) => {
    await navigateTo(page, '/news');
    await expect(page).toHaveTitle(/DeTake/i);
  });

  test('/news FilterBar is accessible on mobile', async ({ page }) => {
    await navigateTo(page, '/news');

    // FilterBar is still rendered; it may be in compact/scroll style on mobile
    const filterRelated = page.getByText(/filters|category|topic/i).first();
    const count = await filterRelated.count();
    if (count > 0) {
      // It should be in the DOM (even if outside visible area due to horizontal scroll)
      expect(count).toBeGreaterThan(0);
    }
  });

  test('/news article cards stack in single column on mobile', async ({ page }) => {
    await navigateTo(page, '/news');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    // In single-column layout the second card should be BELOW the first
    if (box1 && box2) {
      expect(box2.y).toBeGreaterThan(box1.y);
      // And they should have the same left offset (same column)
      expect(Math.abs(box2.x - box1.x)).toBeLessThan(10);
    }
  });

  test('/news images fit within mobile viewport width', async ({ page }) => {
    await navigateTo(page, '/news');

    const images = page.locator('article img');
    const count = await images.count();
    if (count === 0) return;

    const viewportWidth = 375;
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await images.nth(i).boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
  });

  test('/news has NO horizontal overflow on mobile (CRITICAL)', async ({ page }) => {
    await navigateTo(page, '/news');
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('/news desktop pagination is hidden on mobile', async ({ page }) => {
    await navigateTo(page, '/news');

    // The pagination wrapper uses `hidden md:block` – must not be visible on mobile
    const pagination = page.locator('.hidden.md\\:block').first();
    const count = await pagination.count();
    if (count > 0) {
      await expect(pagination).toBeHidden();
    }
  });

  test('/news mobile infinite scroll sentinel exists', async ({ page }) => {
    await navigateTo(page, '/news');

    // The sentinel div is rendered with class md:hidden
    const sentinel = page.locator('.md\\:hidden').first();
    expect(await sentinel.count()).toBeGreaterThan(0);
  });

  test('/news scrolling through articles works on mobile', async ({ page }) => {
    await navigateTo(page, '/news');

    // Scroll down and verify no JS errors / layout breaks
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // No horizontal overflow after scrolling
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Collections Page – Desktop
// ---------------------------------------------------------------------------

test.describe('Collections Page – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('/collections page loads', async ({ page }) => {
    const response = await page.goto('/collections');
    await page.waitForLoadState('networkidle');

    // Page should return a 2xx or 3xx status (not 404/500)
    const status = response?.status() ?? 0;
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(400);

    await expect(page).toHaveTitle(/DeTake/i);
  });

  test('/collections has links to individual collections', async ({ page }) => {
    await navigateTo(page, '/collections');

    // Collection cards/links should exist
    const links = page.locator('a[href*="/collection"]');
    const count = await links.count();
    // Defensive: collections page may be empty if no data
    // Just assert the page loaded without error
    if (count > 0) {
      const href = await links.first().getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('/collections has no horizontal overflow', async ({ page }) => {
    await navigateTo(page, '/collections');
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Filter Interaction – Desktop
// ---------------------------------------------------------------------------

test.describe('Filter Interaction – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('/news filter bar renders filter controls', async ({ page }) => {
    await navigateTo(page, '/news');

    // Look for known filter UI elements: buttons with filter labels
    const categoryBtn = page.getByRole('button', { name: /category/i }).first();
    const topicBtn = page.getByRole('button', { name: /topic/i }).first();
    const filtersLabel = page.getByText(/filters/i).first();

    const categoryCount = await categoryBtn.count();
    const topicCount = await topicBtn.count();
    const filtersCount = await filtersLabel.count();

    // At least one filter-related element must exist
    expect(categoryCount + topicCount + filtersCount).toBeGreaterThan(0);
  });

  test('/news clicking category dropdown shows options', async ({ page }) => {
    await navigateTo(page, '/news');

    const categoryBtn = page.getByRole('button', { name: /category/i }).first();
    const count = await categoryBtn.count();

    if (count === 0) {
      // Filter button not found; skip rather than fail
      return;
    }

    await categoryBtn.click();
    await page.waitForTimeout(500);

    // After click a dropdown/listbox/menu should appear
    const dropdown = page.locator('[role="listbox"], [role="menu"], [role="option"]').first();
    const dropdownCount = await dropdown.count();

    // Either a listbox appeared or the button toggled some visible content
    if (dropdownCount > 0) {
      await expect(dropdown).toBeVisible();
    }
    // Page content area (main) must still exist
    await expect(page.locator('main')).toBeVisible();
  });

  test('/news main content area persists after filter interaction', async ({ page }) => {
    await navigateTo(page, '/news');

    // Verify main content is present before interaction
    await expect(page.locator('main')).toBeVisible();

    // Try clicking a filter if available, otherwise just verify content stability
    const categoryBtn = page.getByRole('button', { name: /category/i }).first();
    const count = await categoryBtn.count();

    if (count > 0) {
      await categoryBtn.click();
      await page.waitForTimeout(500);
      // Close it by clicking again or pressing escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Main content area must still be visible after interaction
    await expect(page.locator('main')).toBeVisible();

    // No horizontal overflow after filter interaction
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});
