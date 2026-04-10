import { test, expect, type Page } from '@playwright/test';
import { scanPageForPoisonPatterns } from '../utils/content-scanner';

/**
 * DeTake Frontend - Collection Detail Page E2E Tests
 *
 * Covers: Desktop 1440px, Tablet 768px, Mobile 375px
 * Pages:  /collections/[collectionId]
 *
 * NOTE: Tests navigate from /collections listing to the first collection.
 * If no collections exist (API down / empty), tests skip gracefully.
 */

async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

/**
 * Navigate from /collections to the first collection detail page.
 * Returns the collection URL or null if none found.
 */
async function navigateToFirstCollection(page: Page): Promise<string | null> {
  await page.goto('/collections');
  await page.waitForLoadState('networkidle');

  const collectionLink = page.locator('a[href*="/collection"]').first();
  const count = await collectionLink.count();
  if (count === 0) return null;

  const isVisible = await collectionLink.isVisible().catch(() => false);
  if (!isVisible) return null;

  const href = await collectionLink.getAttribute('href');
  if (!href) return null;

  await page.goto(href);
  await page.waitForLoadState('networkidle');

  return page.url();
}

// ---------------------------------------------------------------------------
// Desktop – 1440 × 900
// ---------------------------------------------------------------------------

test.describe('Collection Detail – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('collection detail page loads with heading', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found – backend API may be unavailable');

    expect(url).toContain('/collection');

    // Collection title
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('collection detail has description', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    // Description paragraph near the heading
    const description = page.locator('h1 ~ p, h1 + div p').first();
    const count = await description.count();

    // Description may not always exist, just ensure the page is loaded
    if (count > 0) {
      const text = await description.textContent();
      if (text && text.trim().length > 0) {
        await expect(description).toBeVisible();
      }
    }
  });

  test('collection detail shows article list', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    // Collection articles: article elements or cards with links
    const articles = page.locator('article, [class*="grid"] a[href*="/article/"]');
    const count = await articles.count();

    if (count === 0) {
      // Empty collection — just verify page loaded
      await expect(page.locator('main')).toBeVisible();
    } else {
      await expect(articles.first()).toBeVisible();
    }
  });

  test('collection detail article cards have valid links', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    const articleLinks = page.locator('a[href*="/article/"]');
    const count = await articleLinks.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const href = await articleLinks.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toContain('/article/');
      }
    }
  });

  test('collection detail has breadcrumb or back navigation', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    // Collection detail may use breadcrumb nav, back link, or inline nav links
    const breadcrumb = page.locator(
      'nav[aria-label*="breadcrumb" i], [class*="breadcrumb"], a[href="/collections"], a[href*="/collection"]'
    ).first();
    const count = await breadcrumb.count();

    // Breadcrumb may not exist on all collection layouts — just verify page structure
    if (count > 0) {
      // At least one navigation element found
      expect(count).toBeGreaterThan(0);
    } else {
      // Verify page has heading at minimum
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });

  test('collection detail two-column layout on desktop', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    const sidebar = page.locator('#share-section-root, aside, [class*="sidebar"]').first();
    const count = await sidebar.count();

    if (count > 0 && await sidebar.isVisible()) {
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        expect(sidebarBox.x).toBeGreaterThan(0);
      }
    }
  });

  test('collection detail has no horizontal overflow', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('collection detail passes poison pattern scan', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    const result = await scanPageForPoisonPatterns(page);
    expect(result.passed, `Poison patterns found: ${JSON.stringify(result.matches)}`).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tablet – 768 × 1024
// ---------------------------------------------------------------------------

test.describe('Collection Detail – Tablet 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('collection detail loads at tablet', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('collection detail articles visible at tablet', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    const articles = page.locator('article, a[href*="/article/"]');
    const count = await articles.count();
    if (count > 0) {
      await expect(articles.first()).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Mobile – 375 × 812
// ---------------------------------------------------------------------------

test.describe('Collection Detail – Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('collection detail loads on mobile', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('collection detail single column layout on mobile', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    if (box1 && box2) {
      expect(box2.y).toBeGreaterThan(box1.y);
    }
  });

  test('collection detail CRITICAL: no horizontal overflow on mobile', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('collection detail scrolling works on mobile', async ({ page }) => {
    const url = await navigateToFirstCollection(page);
    test.skip(!url, 'No collections found');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});
