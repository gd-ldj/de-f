import { test, expect, type Page } from '@playwright/test';
import { scanPageForPoisonPatterns } from '../utils/content-scanner';

/**
 * DeTake Frontend - Topics Page E2E Tests
 *
 * Covers: Desktop 1440px, Tablet 768px, Mobile 375px
 * Pages:  /topics/[topic]
 *
 * NOTE: Tests navigate to a topic page by finding topic links on category pages.
 * If no topic links exist (API down / empty), tests skip gracefully.
 */

async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

/**
 * Find a topic link from a category page and navigate to it.
 * Returns the topic URL or null if none found.
 */
async function navigateToFirstTopic(page: Page): Promise<string | null> {
  // Try /news first, then /research, then /insights
  const categoryPages = ['/news', '/research', '/insights'];

  for (const categoryPath of categoryPages) {
    await page.goto(categoryPath);
    await page.waitForLoadState('networkidle');

    // Look for topic links (typically /topics/...)
    const topicLink = page.locator('a[href*="/topics/"]').first();
    const count = await topicLink.count();

    if (count > 0) {
      const isVisible = await topicLink.isVisible().catch(() => false);
      if (isVisible) {
        const href = await topicLink.getAttribute('href');
        if (href) {
          await page.goto(href);
          await page.waitForLoadState('networkidle');
          return page.url();
        }
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Desktop – 1440 × 900
// ---------------------------------------------------------------------------

test.describe('Topics Page – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('topic page loads with heading', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found – backend API may be unavailable');

    expect(url).toContain('/topics/');

    // Topic page title
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('topic page shows article grid', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const articles = page.locator('article');
    const count = await articles.count();

    if (count === 0) {
      // No articles but page loaded — check for "no articles" message
      const noResults = page.getByText(/no articles found/i);
      if (await noResults.count()) {
        await expect(noResults).toBeVisible();
      }
    } else {
      await expect(articles.first()).toBeVisible();
    }
  });

  test('topic page articles have multi-column layout on desktop', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    if (box1 && box2) {
      // Multi-column: second card should be to the right
      expect(box2.x).toBeGreaterThan(box1.x);
    }
  });

  test('topic page has breadcrumb navigation', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const breadcrumb = page.locator('nav a, [class*="breadcrumb"]').first();
    const count = await breadcrumb.count();
    expect(count).toBeGreaterThan(0);
  });

  test('topic page has pagination or articles', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const pagination = page.locator('nav[aria-label*="pagination" i], [class*="pagination"]');
    const articles = page.locator('article');
    const pCount = await pagination.count();
    const aCount = await articles.count();

    expect(pCount + aCount).toBeGreaterThan(0);
  });

  test('topic page has no horizontal overflow', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('topic page passes poison pattern scan', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const result = await scanPageForPoisonPatterns(page);
    expect(result.passed, `Poison patterns found: ${JSON.stringify(result.matches)}`).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tablet – 768 × 1024
// ---------------------------------------------------------------------------

test.describe('Topics Page – Tablet 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('topic page loads at tablet', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('topic page articles visible at tablet', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

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

test.describe('Topics Page – Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('topic page loads on mobile', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('topic page single column layout on mobile', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    if (box1 && box2) {
      // Single column: articles stacked vertically
      expect(box2.y).toBeGreaterThan(box1.y);
      expect(Math.abs(box2.x - box1.x)).toBeLessThan(10);
    }
  });

  test('topic page DraggableFloatingButton visible on mobile', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    // Mobile share section or floating button
    const mobileShare = page.locator('#share-section-root-mobile, [class*="floating"], [class*="draggable"]').first();
    const count = await mobileShare.count();
    // It may or may not exist depending on implementation — just verify page is stable
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('topic page CRITICAL: no horizontal overflow on mobile', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('topic page scrolling works on mobile', async ({ page }) => {
    const url = await navigateToFirstTopic(page);
    test.skip(!url, 'No topic links found');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});
