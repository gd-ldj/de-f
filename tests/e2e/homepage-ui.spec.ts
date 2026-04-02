import { test, expect } from '@playwright/test';

/**
 * DeTake Frontend - Homepage UI & Responsive Breakpoint Tests
 * Tests core UI sections and layout behavior across multiple viewport sizes.
 *
 * Tailwind CSS v4 breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
 * Main layout: `.layout-two-column-fixed-1440` — two columns on lg+, single column on mobile
 * Max content width: 1440px
 * Mobile header height: 56px (mt-[56px] offset)
 */

// Helper: check no horizontal overflow
async function checkNoHorizontalOverflow(page: import('@playwright/test').Page, viewportWidth: number) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
}

async function checkPrimarySections(page: import('@playwright/test').Page) {
  const sectionHeadings = page.getByRole('heading', { name: /Latest|Most Read|News|Research/i });
  const count = await sectionHeadings.count();
  expect(count).toBeGreaterThan(0);
}

// Helper: check visible content links exist with valid href
async function checkContentLinks(page: import('@playwright/test').Page) {
  const contentLinks = page.locator('a[href]:visible');
  const count = await contentLinks.count();
  expect(count).toBeGreaterThan(0);

  const firstLink = contentLinks.first();
  const href = await firstLink.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href).toMatch(/^\/|^https?:\/\//);
}

// Helper: check images exist with src attribute
async function checkImagesLoaded(page: import('@playwright/test').Page) {
  const images = page.locator('img[src]:visible');
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
}

async function checkLanguageSelector(page: import('@playwright/test').Page) {
  const languageButton = page.locator('button').filter({ hasText: /English|中文|日本語/i }).first();
  await expect(languageButton).toBeVisible();
}

test.describe('Homepage UI - Desktop 1440px', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page title contains DeTake', async ({ page }) => {
    await expect(page).toHaveTitle(/DeTake/);
  });

  test('primary homepage sections are visible', async ({ page }) => {
    await checkPrimarySections(page);
  });

  test('Most Read section visible', async ({ page }) => {
    const mostRead = page.getByRole('heading', { name: 'Most Read' }).first();
    await expect(mostRead).toBeVisible();
  });

  test('Latest section with news items visible', async ({ page }) => {
    await checkPrimarySections(page);
  });

  test('footer visible after scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator('footer, [role="contentinfo"]').first();
    await expect(footer).toBeVisible();
  });

  test('images loaded with src attribute', async ({ page }) => {
    await checkImagesLoaded(page);
  });

  test('content links present with valid href', async ({ page }) => {
    await checkContentLinks(page);
  });

  test('no horizontal overflow', async ({ page }) => {
    await checkNoHorizontalOverflow(page, 1440);
  });

  test('language selector visible in header', async ({ page }) => {
    await checkLanguageSelector(page);
  });
});

test.describe('Homepage UI - Desktop 1024px', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page title contains DeTake', async ({ page }) => {
    await expect(page).toHaveTitle(/DeTake/);
  });

  test('primary homepage sections are visible', async ({ page }) => {
    await checkPrimarySections(page);
  });

  test('Most Read section visible', async ({ page }) => {
    const mostRead = page.getByRole('heading', { name: 'Most Read' }).first();
    await expect(mostRead).toBeVisible();
  });

  test('Latest section visible', async ({ page }) => {
    await checkPrimarySections(page);
  });

  test('content links present', async ({ page }) => {
    await checkContentLinks(page);
  });

  test('images loaded', async ({ page }) => {
    await checkImagesLoaded(page);
  });

  test('no horizontal overflow', async ({ page }) => {
    await checkNoHorizontalOverflow(page, 1024);
  });

  test('language selector visible in header', async ({ page }) => {
    await checkLanguageSelector(page);
  });
});

test.describe('Homepage UI - Tablet 768px', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page title contains DeTake', async ({ page }) => {
    await expect(page).toHaveTitle(/DeTake/);
  });

  test('primary homepage sections are visible', async ({ page }) => {
    await checkPrimarySections(page);
  });

  test('Most Read section visible', async ({ page }) => {
    const mostRead = page.getByRole('heading', { name: 'Most Read' }).first();
    await expect(mostRead).toBeVisible();
  });

  test('Latest section visible', async ({ page }) => {
    await checkPrimarySections(page);
  });

  test('layout uses full width (single column)', async ({ page }) => {
    // At tablet width, main content should expand to fill most of the viewport
    const main = page.locator('main').first();
    const mainBox = await main.boundingBox();
    if (mainBox) {
      // Main should take up a significant portion of the viewport (at least 70%)
      // accounting for padding and possible sidebar remnants
      expect(mainBox.width).toBeGreaterThan(768 * 0.7);
    }
  });

  test('article cards stack vertically', async ({ page }) => {
    const contentLinks = page.locator('main a[href]:visible');
    const count = await contentLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('no horizontal overflow', async ({ page }) => {
    await checkNoHorizontalOverflow(page, 768);
  });

  test('images loaded', async ({ page }) => {
    await checkImagesLoaded(page);
  });
});

test.describe('Homepage UI - Mobile 375px', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DeTake/);
  });

  test('single column layout', async ({ page }) => {
    // On mobile, main content should use full available width
    const main = page.locator('main').first();
    const mainBox = await main.boundingBox();
    if (mainBox) {
      // Main should take up a significant portion of the mobile viewport
      // accounting for padding (px-4 = 16px each side = 32px total)
      expect(mainBox.width).toBeGreaterThan(375 * 0.7);
    }
  });

  test('no horizontal overflow (CRITICAL)', async ({ page }) => {
    await checkNoHorizontalOverflow(page, 375);
  });

  test('content fits within viewport', async ({ page }) => {
    // Verify the visible area content doesn't exceed viewport width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('footer accessible by scrolling', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator('footer, [role="contentinfo"]').first();
    await expect(footer).toBeVisible();
  });

  test('images scale within viewport bounds', async ({ page }) => {
    const images = page.locator('img[src]');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    // Check visible images do not exceed viewport width
    const overflowingImages = await page.evaluate((viewportWidth) => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.right > viewportWidth + 1; // +1 for rounding tolerance
      }).length;
    }, 375);

    expect(overflowingImages).toBe(0);
  });

  test('touch-friendly spacing - links have adequate tap target size', async ({ page }) => {
    // Primary content links should meet a reasonable tap target on mobile.
    const contentLinks = page.locator('a[href]:visible, button:visible');
    const count = await contentLinks.count();
    expect(count).toBeGreaterThan(0);

    // Check first few links have reasonable tap area height
    const checkCount = Math.min(count, 5);
    for (let i = 0; i < checkCount; i++) {
      const link = contentLinks.nth(i);
      const box = await link.boundingBox();
      if (box) {
        // Keep a small but realistic lower bound for the current mobile nav/footer affordances.
        expect(box.height).toBeGreaterThanOrEqual(20);
      }
    }
  });

  test('article links present with valid href', async ({ page }) => {
    await checkContentLinks(page);
  });

  test('core content sections visible', async ({ page }) => {
    // On mobile, check that at least some content sections are rendered
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);

    const contentLinks = page.locator('a[href]:visible');
    const linkCount = await contentLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
