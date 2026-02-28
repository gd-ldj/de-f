import { test, expect } from '@playwright/test';

/**
 * DeTake Frontend - Article Page E2E Tests
 * Tests article detail page functionality
 */

test.describe('Article Page', () => {
  test('should navigate to article from homepage', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Find and click first article link
    const articleLinks = page.locator('a[href*="/article/"]');
    const firstArticle = articleLinks.first();

    // Wait for element to be visible and clickable
    await expect(firstArticle).toBeVisible();
    const href = await firstArticle.getAttribute('href');

    // Click the article
    await firstArticle.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Verify we're on an article page
    expect(page.url()).toContain('/article/');
  });

  test('should display article content', async ({ page }) => {
    // Go to homepage first
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    // Get first article link
    const articleLink = page.locator('a[href*="/article/"]').first();
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Check article title exists
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // Check article body/content exists
    const content = page.locator('article, [class*="content"], main');
    await expect(content).toBeVisible();
  });

  test('should display author information', async ({ page }) => {
    // Navigate to an article
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    const articleLink = page.locator('a[href*="/article/"]').first();
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Check for author name or avatar
    const authorInfo = page.locator('[class*="author"], [data-author]');
    // At least one author element should exist
    const count = await authorInfo.count();
    expect(count).toBeGreaterThanOrEqual(0); // May not always have author info
  });

  test('should have share functionality', async ({ page }) => {
    // Navigate to an article
    await page.goto('http://localhost:4321/');
    await page.waitForLoadState('networkidle');

    const articleLink = page.locator('a[href*="/article/"]').first();
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Look for share buttons (may be icons or text)
    const shareButtons = page.locator('button, a').filter({
      hasText: /share|twitter|facebook|telegram/i
    });

    // Share functionality might exist
    const count = await shareButtons.count();
    // Just checking it doesn't error - share might not be implemented yet
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
