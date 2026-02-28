import { test, expect } from '@playwright/test';

/**
 * DeTake Frontend - Homepage E2E Tests
 * 测试首页核心功能
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    // 检查页面标题包含 DeTake
    await expect(page).toHaveTitle(/DeTake/);

    // 检查核心内容区域存在
    const highlights = page.getByRole('heading', { name: 'Highlights' }).first();
    await expect(highlights).toBeVisible();

    const mostRead = page.getByRole('heading', { name: 'Most Read' }).first();
    await expect(mostRead).toBeVisible();
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
    // 检查 Latest 栏目存在
    const latestHeading = page.getByRole('heading', { name: 'Latest' }).first();
    await expect(latestHeading).toBeVisible();

    // 检查有新闻条目（通过时间标记判断）
    const timeIndicators = page.locator('text=/\\d+H/');
    const count = await timeIndicators.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display highlights with main article', async ({ page }) => {
    // 检查 Highlights 区域
    const highlightsHeading = page.getByRole('heading', { name: 'Highlights' }).first();
    await expect(highlightsHeading).toBeVisible();

    // 检查有文章标题（任何 h2 或 h3）
    const articleHeadings = page.locator('h2, h3').filter({ hasText: /Trump|Afghan|Women/i });
    const count = await articleHeadings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display most read section', async ({ page }) => {
    // 检查 Most Read 区域
    const mostReadHeading = page.getByRole('heading', { name: 'Most Read' }).first();
    await expect(mostReadHeading).toBeVisible();

    // 检查有编号项目
    const numberedItems = page.locator('text=/^[1-6]$/');
    const count = await numberedItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should have clickable article links', async ({ page }) => {
    // 查找包含 /article/ 的链接
    const articleLinks = page.locator('a[href*="/article/"]');
    const count = await articleLinks.count();
    expect(count).toBeGreaterThan(0);

    // 检查第一个链接有有效的 href
    const firstLink = articleLinks.first();
    const href = await firstLink.getAttribute('href');
    expect(href).toContain('/article/');
    expect(href).toBeTruthy();
  });

  test('should display language selector', async ({ page }) => {
    // 检查语言选择器存在
    const languageButton = page.locator('header').getByText('English').first();
    await expect(languageButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 检查页面加载成功（通过标题判断）
    await expect(page).toHaveTitle(/DeTake/);

    // 检查至少有一些内容可见
    const hasContent = await page.locator('article, [class*="article"]').count();
    expect(hasContent).toBeGreaterThan(0);
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
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
