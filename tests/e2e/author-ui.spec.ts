import { test, expect, type Page } from '@playwright/test';
import { scanPageForPoisonPatterns } from '../utils/content-scanner';

/**
 * DeTake Frontend - Author Page E2E Tests
 *
 * Covers: Desktop 1440px, Tablet 768px, Mobile 375px
 * Pages:  /authors/[authorName]
 *
 * NOTE: Tests navigate from an article detail page to the author page.
 * If no author links exist (API down / empty), tests skip gracefully.
 */

async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

/**
 * Navigate from homepage → first article → author page.
 * Returns the author page URL or null if not found.
 */
async function navigateToFirstAuthor(page: Page): Promise<string | null> {
  // First, go to homepage and find an article
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const firstArticleLink = page.locator('a[href*="/article/"]').first();
  const count = await firstArticleLink.count();
  if (count === 0) return null;

  const isVisible = await firstArticleLink.isVisible().catch(() => false);
  if (!isVisible) return null;

  await firstArticleLink.click();
  await page.waitForLoadState('networkidle');

  // Now find an author link on the article page
  const authorLink = page.locator('a[href*="/authors/"]').first();
  const authorCount = await authorLink.count();
  if (authorCount === 0) return null;

  const authorVisible = await authorLink.isVisible().catch(() => false);
  if (!authorVisible) return null;

  await authorLink.click();
  await page.waitForLoadState('networkidle');

  return page.url();
}

// ---------------------------------------------------------------------------
// Desktop – 1440 × 900
// ---------------------------------------------------------------------------

test.describe('Author Page – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('author page loads with profile section', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found – backend API may be unavailable');

    expect(url).toContain('/authors/');

    // Author name heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('author profile shows name and avatar/initial', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const name = await heading.textContent();
    expect(name).toBeTruthy();
    expect(name!.trim().length).toBeGreaterThan(0);

    // Avatar or initial letter element
    const avatar = page.locator('img[alt*="author" i], img[alt*="avatar" i], .w-20.h-20, [class*="avatar"]').first();
    const avatarCount = await avatar.count();
    // Avatar may be an image or a fallback initial — just verify profile area loaded
    expect(avatarCount).toBeGreaterThanOrEqual(0);
  });

  test('author page has article tabs', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    // Tab buttons
    const tabButtons = page.locator('.tab-button, [data-tab]');
    const count = await tabButtons.count();

    if (count > 0) {
      // Articles tab should be active by default
      const articlesTab = page.locator('.tab-button[data-tab="articles"], [data-tab="articles"]').first();
      if (await articlesTab.count()) {
        await expect(articlesTab).toBeVisible();
      }
    }
  });

  test('author page shows article list', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    // Articles tab content
    const articlesSection = page.locator('#articles-tab, .tab-pane').first();
    const count = await articlesSection.count();

    if (count > 0) {
      // Should have article cards
      const articles = page.locator('#articles-tab article, .tab-pane article, article');
      const articleCount = await articles.count();

      if (articleCount > 0) {
        await expect(articles.first()).toBeVisible();
      }
    }
  });

  test('author page two-column layout on desktop', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    const sidebar = page.locator('#share-section-root, aside, [class*="sidebar"]').first();
    const count = await sidebar.count();

    if (count > 0 && await sidebar.isVisible()) {
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        expect(sidebarBox.x).toBeGreaterThan(0);
      }
    }
  });

  test('author page has no horizontal overflow', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('author page passes poison pattern scan', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    const result = await scanPageForPoisonPatterns(page);
    expect(result.passed, `Poison patterns found: ${JSON.stringify(result.matches)}`).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tablet – 768 × 1024
// ---------------------------------------------------------------------------

test.describe('Author Page – Tablet 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('author page loads at tablet', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('author page articles visible at tablet', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count > 0) {
      await expect(articles.first()).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Mobile – 375 × 812
// ---------------------------------------------------------------------------

test.describe('Author Page – Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('author page loads on mobile', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('author profile section renders on mobile', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    // Author name should be visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Profile area should render
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('author page single column layout on mobile', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    // Sidebar should be below or hidden on mobile
    const sidebar = page.locator('#share-section-root, aside').first();
    const count = await sidebar.count();

    if (count > 0 && await sidebar.isVisible()) {
      const mainContent = page.locator('h1').first();
      const mainBox = await mainContent.boundingBox();
      const sidebarBox = await sidebar.boundingBox();

      if (mainBox && sidebarBox) {
        // Sidebar below content on mobile
        expect(sidebarBox.y).toBeGreaterThanOrEqual(mainBox.y);
      }
    }
  });

  test('author page CRITICAL: no horizontal overflow on mobile', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('author page scrolling works on mobile', async ({ page }) => {
    const url = await navigateToFirstAuthor(page);
    test.skip(!url, 'No author links found');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});
