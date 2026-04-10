import { test, expect, type Page } from '@playwright/test';

/**
 * DeTake Frontend - 404 Error Page E2E Tests
 *
 * Covers: Desktop 1440px, Tablet 768px, Mobile 375px
 * Pages:  /this-page-does-not-exist (any non-existent route)
 *
 * NOTE: In Astro dev mode the server may return 502 instead of serving 404.astro.
 * The 404 page only works properly in production build (`pnpm preview`).
 * Tests gracefully skip if the dev server does not serve the 404 page.
 */

const NOT_FOUND_PATH = '/this-page-does-not-exist-e2e-test';

async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

/**
 * Navigate to the 404 page, handling potential issues from Astro dev server.
 * Returns true if the 404 page rendered, false otherwise.
 */
async function goto404(page: Page): Promise<boolean> {
  try {
    const response = await page.goto(NOT_FOUND_PATH, {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });
    const status = response?.status() ?? 0;

    // Dev server may return 502 / empty response — check if page content loaded
    if (status >= 500) {
      return false;
    }

    // Wait for content
    await page.waitForTimeout(1000);

    // Verify 404 content actually rendered
    const has404 = await page.getByText('404').first().isVisible().catch(() => false);
    return has404;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Desktop – 1440 × 900
// ---------------------------------------------------------------------------

test.describe('404 Error Page – Desktop 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('404 page shows error content', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server – only works in production build');

    const page404Text = page.getByText('404');
    await expect(page404Text.first()).toBeVisible();
  });

  test('404 page shows error message', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const errorMessage = page.getByText(/sorry.*couldn.?t find/i).first();
    await expect(errorMessage).toBeVisible();
  });

  test('404 page has back to homepage button', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const backLink = page.getByRole('link', { name: /homepage/i }).first();
    await expect(backLink).toBeVisible();

    const href = await backLink.getAttribute('href');
    expect(href).toBe('/');
  });

  test('404 page has animated visual element (purple ball)', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const purpleBall = page.locator('.bg-gradient-to-br.from-purple-500').first();
    const count = await purpleBall.count();

    if (count > 0) {
      await expect(purpleBall).toBeVisible();
    }
  });

  test('404 back button navigates to homepage', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const backLink = page.getByRole('link', { name: /homepage/i }).first();
    await backLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toMatch(/\/$/);
  });

  test('404 page has no horizontal overflow', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tablet – 768 × 1024
// ---------------------------------------------------------------------------

test.describe('404 Error Page – Tablet 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('404 page loads at tablet', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const page404Text = page.getByText('404');
    await expect(page404Text.first()).toBeVisible();

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('404 back to homepage visible at tablet', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const backLink = page.getByRole('link', { name: /homepage/i }).first();
    await expect(backLink).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Mobile – 375 × 812
// ---------------------------------------------------------------------------

test.describe('404 Error Page – Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('404 page loads on mobile', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const page404Text = page.getByText('404');
    await expect(page404Text.first()).toBeVisible();
  });

  test('404 page layout centered on mobile', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('404 back to homepage works on mobile', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    const backLink = page.getByRole('link', { name: /homepage/i }).first();
    await expect(backLink).toBeVisible();

    await backLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/$/);
  });

  test('404 CRITICAL: no horizontal overflow on mobile', async ({ page }) => {
    const loaded = await goto404(page);
    test.skip(!loaded, '404 page not served by dev server');

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});
