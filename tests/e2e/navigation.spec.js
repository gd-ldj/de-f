import { test, expect } from '@playwright/test';

/**
 * DeTake Frontend - Navigation E2E Tests
 * Tests navigation and routing functionality
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to category pages', async ({ page }) => {
    // Look for category links (news, research, insights, etc.)
    const categoryLinks = page.locator('a[href*="/news"], a[href*="/research"], a[href*="/insights"]');
    const count = await categoryLinks.count();

    if (count > 0) {
      const firstCategory = categoryLinks.first();
      const href = await firstCategory.getAttribute('href');

      await firstCategory.click();
      await page.waitForLoadState('networkidle');

      // Check we navigated
      expect(page.url()).toContain(href);
    }
  });

  test('should navigate to authors page', async ({ page }) => {
    // Look for author links
    const authorLinks = page.locator('a[href*="/authors/"]');
    const count = await authorLinks.count();

    if (count > 0) {
      const firstAuthor = authorLinks.first();
      await firstAuthor.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/authors/');
    }
  });

  test('should navigate to collections', async ({ page }) => {
    // Look for collections link in nav
    const collectionsLink = page.locator('a[href*="/collections"]').first();

    const isVisible = await collectionsLink.isVisible().catch(() => false);

    if (isVisible) {
      await collectionsLink.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/collections');
    }
  });

  test('should handle back navigation', async ({ page }) => {
    // Click on an article
    const articleLink = page.locator('a[href*="/article/"]').first();
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    const articleUrl = page.url();

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be back at homepage
    expect(page.url()).toBe('http://localhost:4321/');

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Should be back at article
    expect(page.url()).toBe(articleUrl);
  });

  test('should navigate using browser URL', async ({ page }) => {
    // Direct navigation to news category
    await page.goto('http://localhost:4321/news');
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should handle 404 for invalid routes', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('http://localhost:4321/this-page-does-not-exist-12345');

    // Should return 404 or show 404 page
    expect(response.status()).toBe(404);
  });
});
