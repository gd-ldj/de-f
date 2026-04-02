import { test, expect, type Page } from '@playwright/test';

/**
 * DeTake Frontend - Article Detail Page UI & Responsive Tests
 * Tests article page layout, typography, and responsiveness across viewports.
 *
 * NOTE: Article tests depend on backend API availability.
 * If the homepage fails to load articles (502 / empty), tests skip gracefully.
 */

/**
 * Navigate from homepage to the first article found.
 * Returns null if no article links are available (API down / empty data).
 */
async function navigateToFirstArticle(page: Page): Promise<string | null> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const firstArticleLink = page.locator('a[href*="/article/"]').first();
  const count = await firstArticleLink.count();
  if (count === 0) return null;

  const isVisible = await firstArticleLink.isVisible().catch(() => false);
  if (!isVisible) return null;

  await firstArticleLink.click();
  await page.waitForLoadState('networkidle');

  return page.url();
}

// ─────────────────────────────────────────────
// Desktop 1440px
// ─────────────────────────────────────────────
test.describe('Article UI - Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('should navigate from homepage to article page', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');
    expect(url).toContain('/article/');
  });

  test('article title (h1) is visible', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const title = page.locator('h1').first();
    await expect(title).toBeVisible();

    // Desktop h1 should have reasonable font size (at least 30px)
    const fontSize = await title.evaluate((el) =>
      parseFloat(getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(30);
  });

  test('article body content exists (.prose or article element)', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const articleBody = page.locator('.prose, article').first();
    await expect(articleBody).toBeVisible();
  });

  test('two-column layout: sidebar is visible alongside content', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    // Sidebar should be visible on desktop
    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    const sidebarCount = await sidebar.count();

    if (sidebarCount > 0) {
      await expect(sidebar).toBeVisible();

      const main = page.locator('main, .prose, article').first();
      const mainBox = await main.boundingBox();
      const sidebarBox = await sidebar.boundingBox();

      if (mainBox && sidebarBox) {
        // On desktop, sidebar should start to the right of main content area
        expect(sidebarBox.x).toBeGreaterThan(mainBox.x);
      }
    }
  });

  test('share/social buttons exist', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const shareButtons = page.locator(
      '[class*="share"], [aria-label*="share" i], [aria-label*="twitter" i], [aria-label*="telegram" i], [aria-label*="facebook" i], a[href*="twitter.com"], a[href*="x.com"], a[href*="t.me"], a[href*="facebook.com"]'
    );
    const count = await shareButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('images within article have valid src attributes', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const articleImages = page.locator('.prose img, article img');
    const count = await articleImages.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const src = await articleImages.nth(i).getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).not.toBe('');
      }
    }
  });

  test('no horizontal overflow on desktop', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(1440 + 5);
  });

  test('header and footer are present', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('breadcrumb or category tag is visible', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const breadcrumbOrCategory = page.locator(
      'nav[aria-label*="breadcrumb" i], [class*="breadcrumb"], [class*="category"], [class*="tag"]'
    );
    const count = await breadcrumbOrCategory.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// Tablet 768px
// ─────────────────────────────────────────────
test.describe('Article UI - Tablet 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('article loads and title is visible', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');
    expect(url).toContain('/article/');

    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('content takes more width on tablet', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const articleBody = page.locator('.prose, article').first();
    await expect(articleBody).toBeVisible();

    const bodyBox = await articleBody.boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeGreaterThan(400);
    }
  });

  test('no horizontal overflow on tablet', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(768 + 5);
  });

  test('images fit within the viewport width', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      if (!isVisible) continue;

      const box = await img.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(768 + 5);
      }
    }
  });
});

// ─────────────────────────────────────────────
// Mobile 375px
// ─────────────────────────────────────────────
test.describe('Article UI - Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('article loads successfully and title is visible', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');
    expect(url).toContain('/article/');

    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('single column layout: sidebar stacks below content or is hidden', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const articleBody = page.locator('.prose, article').first();
    await expect(articleBody).toBeVisible();

    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    const sidebarCount = await sidebar.count();

    if (sidebarCount > 0) {
      const isVisible = await sidebar.isVisible();
      if (isVisible) {
        const articleBox = await articleBody.boundingBox();
        const sidebarBox = await sidebar.boundingBox();

        if (articleBox && sidebarBox) {
          // Sidebar should be below the article content
          expect(sidebarBox.y).toBeGreaterThanOrEqual(articleBox.y);
        }
      }
    }
  });

  test('article title is visible and readable on mobile', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const title = page.locator('h1').first();
    await expect(title).toBeVisible();

    const fontSize = await title.evaluate((el) =>
      parseFloat(getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(20);
  });

  test('CRITICAL: no horizontal overflow on mobile', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375 + 2);
  });

  test('images scale to fit viewport width on mobile', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      if (!isVisible) continue;

      const box = await img.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375 + 5);
      }
    }
  });

  test('text is readable on mobile (no tiny font issues)', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    const paragraphs = page.locator('.prose p, article p');
    const pCount = await paragraphs.count();

    if (pCount > 0) {
      const fontSize = await paragraphs.first().evaluate((el) =>
        parseFloat(getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
  });

  test('can scroll through entire article on mobile', async ({ page }) => {
    const url = await navigateToFirstArticle(page);
    test.skip(!url, 'No article links found – backend API may be unavailable');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });
});
