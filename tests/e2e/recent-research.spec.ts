import { test, expect, type Page } from '@playwright/test';

const DEFAULT_PROMOTE_CODE = 'xG0zT';

function getApiBaseUrl(): string {
  const env = process.env.PUBLIC_SITE_ENV || 'beta';
  const lang = process.env.PUBLIC_SOURCE_LANGUAGE || 'en';
  const domainMap: Record<string, string> = {
    beta: 'beta-api.detake.com',
    web2: 'beta-api.detake.com',
    web3: 'api.detake.com',
    beta_dev: 'preview-api.detake.com',
  };

  return `https://${lang}-${domainMap[env] || domainMap.beta}`;
}

async function resolveArticlePath(): Promise<string | null> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/articles?locale=en&page=1&limit=1`);
  if (!response.ok) return null;

  const payload = await response.json();
  const article = payload?.data?.list?.[0];
  if (!article?.slug || !article?.business_type_name) return null;

  const businessPath = String(article.business_type_name).toLowerCase();
  return article.user_id && !article.is_promoted
    ? `/user/${article.user_id}/article/${businessPath}/${article.slug}-${DEFAULT_PROMOTE_CODE}`
    : `/article/${businessPath}/${article.slug}-${DEFAULT_PROMOTE_CODE}`;
}

async function navigateToFirstArticle(page: Page): Promise<boolean> {
  const articlePath = await resolveArticlePath();
  if (!articlePath) return false;

  await page.goto(articlePath);
  await page.waitForLoadState('networkidle');
  return page.url().includes('/article/');
}

test.describe('Recent Research recommendations', () => {
  test('desktop: recent research section renders recommended cards and links work', async ({ page }) => {
    const navigated = await navigateToFirstArticle(page);
    test.skip(!navigated, 'No article links found - backend API may be unavailable');

    const section = page.getByTestId('recent-research');
    await expect(section).toBeVisible();

    const items = section.locator('[data-testid^="recent-research-item-"]');
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);

    const firstItem = items.first();
    const beforeUrl = page.url();
    const firstTitle = (await firstItem.locator('h4').first().textContent())?.trim();
    const firstLink = firstItem.locator('a[href*="/article/"]').first();

    await expect(firstItem).not.toContainText('[object Object]');

    await firstLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toBe(beforeUrl);
    expect(page.url()).toContain('/article/');
    if (firstTitle) {
      await expect(page.locator('h1').first()).toHaveText(firstTitle);
    }

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(1440 + 5);
  });

  test('mobile: recent research section keeps cards inside viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const navigated = await navigateToFirstArticle(page);
    test.skip(!navigated, 'No article links found - backend API may be unavailable');

    const section = page.getByTestId('recent-research');
    await expect(section).toBeVisible();

    const firstItem = section.locator('[data-testid^="recent-research-item-"]').first();
    await expect(firstItem).toBeVisible();

    const itemBox = await firstItem.boundingBox();
    expect(itemBox).not.toBeNull();
    if (itemBox) {
      expect(itemBox.width).toBeLessThanOrEqual(375);
    }

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375 + 5);
  });
});
