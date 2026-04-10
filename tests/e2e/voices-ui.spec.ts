import { test, expect, type Page } from '@playwright/test';
import { scanPageForPoisonPatterns } from '../utils/content-scanner';
import { validateTitles, validateImages, validateLinks } from '../utils/semantic-validators';

/**
 * DeTake Frontend - Voices Page E2E Tests
 *
 * Covers: Desktop 1440px, Tablet 768px, Mobile 375px
 * Pages:  /voices
 */

async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

// ---------------------------------------------------------------------------
// Desktop – 1440 × 900
// ---------------------------------------------------------------------------

test.describe('Voices Page – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('/voices loads and shows articles or empty state', async ({ page }) => {
    await navigateTo(page, '/voices');
    await expect(page).toHaveTitle(/DeTake/i);

    const articles = page.locator('article');
    const count = await articles.count();

    if (count === 0) {
      // API may have no data — check for empty state message
      const noArticles = page.getByText(/no articles found/i);
      await expect(noArticles).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(articles.first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test('/voices article cards have titles and images', async ({ page }) => {
    await navigateTo(page, '/voices');

    const articles = page.locator('article');
    const count = await articles.count();
    test.skip(count === 0, 'No articles found – API may be unavailable');

    const firstCard = articles.first();
    // Should have a title (h3 or h4)
    const title = firstCard.locator('h3, h4').first();
    await expect(title).toBeVisible();

    // Should have an image
    const img = firstCard.locator('img');
    expect(await img.count()).toBeGreaterThan(0);
  });

  test('/voices desktop grid shows multiple columns', async ({ page }) => {
    await navigateTo(page, '/voices');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    if (box1 && box2) {
      expect(box2.x).toBeGreaterThan(box1.x);
    }
  });

  test('/voices FilterBar renders filter controls', async ({ page }) => {
    await navigateTo(page, '/voices');

    const categoryBtn = page.getByRole('button', { name: /category/i }).first();
    const topicBtn = page.getByRole('button', { name: /topic/i }).first();
    const filtersLabel = page.getByText(/filters/i).first();

    const categoryCount = await categoryBtn.count();
    const topicCount = await topicBtn.count();
    const filtersCount = await filtersLabel.count();

    // FilterBar may not render if API has no data — graceful skip
    if (categoryCount + topicCount + filtersCount === 0) {
      const noArticles = page.getByText(/no articles found/i);
      // If empty state shown, filter bar absence is expected
      if (await noArticles.count()) return;
    }
    expect(categoryCount + topicCount + filtersCount).toBeGreaterThan(0);
  });

  test('/voices shows desktop pagination or articles or empty state', async ({ page }) => {
    await navigateTo(page, '/voices');

    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination" i]');
    const articles = page.locator('article');
    const noArticles = page.getByText(/no articles found/i);
    const pCount = await pagination.count();
    const aCount = await articles.count();
    const emptyCount = await noArticles.count();

    expect(pCount + aCount + emptyCount).toBeGreaterThan(0);
  });

  test('/voices validates article titles', async ({ page }) => {
    await navigateTo(page, '/voices');

    const articles = page.locator('article');
    if (await articles.count() === 0) return;

    const result = await validateTitles(page);
    expect(result.passed, `Title issues: ${JSON.stringify(result.issues)}`).toBe(true);
  });

  test('/voices validates article images', async ({ page }) => {
    await navigateTo(page, '/voices');

    const articles = page.locator('article');
    if (await articles.count() === 0) return;

    const result = await validateImages(page);
    expect(result.passed, `Image issues: ${JSON.stringify(result.issues)}`).toBe(true);
  });

  test('/voices validates article links', async ({ page }) => {
    await navigateTo(page, '/voices');

    const articles = page.locator('article');
    if (await articles.count() === 0) return;

    const result = await validateLinks(page);
    expect(result.passed, `Link issues: ${JSON.stringify(result.issues)}`).toBe(true);
  });

  test('/voices has no horizontal overflow', async ({ page }) => {
    await navigateTo(page, '/voices');
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('/voices passes poison pattern scan', async ({ page }) => {
    await navigateTo(page, '/voices');

    const result = await scanPageForPoisonPatterns(page);
    expect(result.passed, `Poison patterns found: ${JSON.stringify(result.matches)}`).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tablet – 768 × 1024
// ---------------------------------------------------------------------------

test.describe('Voices Page – Tablet 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('/voices loads with articles at tablet', async ({ page }) => {
    await navigateTo(page, '/voices');
    await expect(page).toHaveTitle(/DeTake/i);

    const articles = page.locator('article');
    const count = await articles.count();
    if (count > 0) {
      await expect(articles.first()).toBeVisible();
    }

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('/voices tablet grid shows multi-column layout', async ({ page }) => {
    await navigateTo(page, '/voices');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    if (box1 && box2) {
      expect(box2.x).toBeGreaterThan(box1.x);
    }
  });

  test('/voices article cards show images at tablet', async ({ page }) => {
    await navigateTo(page, '/voices');
    const images = page.locator('article img');
    const count = await images.count();
    if (count > 0) {
      await expect(images.first()).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Mobile – 375 × 812
// ---------------------------------------------------------------------------

test.describe('Voices Page – Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('/voices loads on mobile', async ({ page }) => {
    await navigateTo(page, '/voices');
    await expect(page).toHaveTitle(/DeTake/i);
  });

  test('/voices article cards stack in single column on mobile', async ({ page }) => {
    await navigateTo(page, '/voices');

    const articles = page.locator('article');
    const count = await articles.count();
    if (count < 2) return;

    const box1 = await articles.nth(0).boundingBox();
    const box2 = await articles.nth(1).boundingBox();

    if (box1 && box2) {
      expect(box2.y).toBeGreaterThan(box1.y);
      expect(Math.abs(box2.x - box1.x)).toBeLessThan(10);
    }
  });

  test('/voices images fit within mobile viewport width', async ({ page }) => {
    await navigateTo(page, '/voices');

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

  test('/voices CRITICAL: no horizontal overflow on mobile', async ({ page }) => {
    await navigateTo(page, '/voices');
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('/voices desktop pagination hidden on mobile', async ({ page }) => {
    await navigateTo(page, '/voices');

    const pagination = page.locator('.hidden.md\\:block').first();
    const count = await pagination.count();
    if (count > 0) {
      await expect(pagination).toBeHidden();
    }
  });

  test('/voices scrolling through articles works on mobile', async ({ page }) => {
    await navigateTo(page, '/voices');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});
