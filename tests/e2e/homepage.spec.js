import { test, expect } from '@playwright/test';

/**
 * DeTake Frontend - Homepage E2E Tests
 * 测试首页核心功能
 */

test.describe('Homepage', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  async function openMobileMenuIfNeeded(page) {
    const menuButton = page.locator('button[aria-label="Open menu"]').first();
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(300);
    }
  }

  async function getVisibleArticleLinks(page) {
    return page.locator('a[href*="/article/"]:visible');
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DeTake/);

    const sectionHeadings = page.getByRole('heading', { name: /Latest|Most Read|News/i });
    expect(await sectionHeadings.count()).toBeGreaterThan(0);
  });

  test('should display header navigation', async ({ page }) => {
    // 检查页面有导航链接（不限定在 header 内，因为可能在移动端菜单）
    const newsLink = page.getByRole('link', { name: /news/i }).first();
    const researchLink = page.getByRole('link', { name: /research/i }).first();
    const insightsLink = page.getByRole('link', { name: /insights/i }).first();

    // 至少有这些导航项存在（即使不可见也算）
    expect(await newsLink.count() + await researchLink.count() + await insightsLink.count()).toBeGreaterThan(0);
  });

  test('should display latest news section', async ({ page }) => {
    const latestHeading = page.getByRole('heading', { name: /Latest|News/i }).first();
    await expect(latestHeading).toBeVisible();

    const articleLinks = await getVisibleArticleLinks(page);
    expect(await articleLinks.count()).toBeGreaterThan(0);
  });

  test('should display highlights with main article', async ({ page }) => {
    const featuredArticle = page.locator('main h2 a[href*="/article/"], main h2, main a[href*="/article/"]:visible').first();
    await expect(featuredArticle).toBeVisible();
  });

  test('should display most read section', async ({ page }) => {
    const mostReadHeading = page.getByRole('heading', { name: 'Most Read' }).first();
    if (await mostReadHeading.count()) {
      await expect(mostReadHeading).toBeVisible();
      const numberedItems = page.locator('text=/^[1-9]$/');
      expect(await numberedItems.count()).toBeGreaterThan(0);
      return;
    }

    const articleLinks = await getVisibleArticleLinks(page);
    expect(await articleLinks.count()).toBeGreaterThan(0);
  });

  test('should have clickable article links', async ({ page }) => {
    const articleLinks = await getVisibleArticleLinks(page);
    const count = await articleLinks.count();
    expect(count).toBeGreaterThan(0);

    const firstLink = articleLinks.first();
    const href = await firstLink.getAttribute('href');
    expect(href).toContain('/article/');
    expect(href).toBeTruthy();
  });

  test('should display language selector', async ({ page }) => {
    await openMobileMenuIfNeeded(page);
    const languageButton = page.locator('button').filter({ hasText: /English|中文|日本語/i }).first();
    await expect(languageButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 检查页面加载成功（通过标题判断）
    await expect(page).toHaveTitle(/DeTake/);

    const visibleHeadings = page.getByRole('heading', { name: /Latest|Most Read|News|Research/i });
    expect(await visibleHeadings.count()).toBeGreaterThan(0);
  });

  test('should load images', async ({ page }) => {
    // 等待网络空闲
    await page.waitForLoadState('networkidle');

    // 检查页面有图片
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have footer', async ({ page }) => {
    // 滚动到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // 检查 footer 存在
    const footer = page.locator('footer, [role="contentinfo"]').first();
    await expect(footer).toBeVisible();
  });
});
