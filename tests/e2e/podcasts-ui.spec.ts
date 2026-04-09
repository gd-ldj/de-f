import { test, expect } from '@playwright/test';

const PODCAST_ID = 'dtc-Wvf2J1fG';
const PODCAST_SLUG = `${PODCAST_ID}-8195b27a`;

test.describe('Podcasts UI', () => {
  test('/voices/podcasts loads dedicated podcasts API and renders podcast detail links', async ({ page }) => {
    const podcastRequests: string[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/v1/podcasts')) {
        podcastRequests.push(request.url());
      }
    });

    await page.goto('/voices/podcasts');

    const firstCardLink = page.locator('[data-article-link]').first();
    await expect(firstCardLink).toBeVisible({ timeout: 15000 });

    expect(
      podcastRequests.some((url) => url.includes('/api/v1/podcasts')),
      `Expected dedicated podcasts API request, got: ${podcastRequests.join(', ')}`,
    ).toBeTruthy();

    const href = await firstCardLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/\/article\/podcasts\/dtc-[A-Za-z0-9]+-/);
  });

  test('podcast detail page loads dedicated detail API and renders transcript content', async ({ page }) => {
    await page.goto(`/article/podcasts/${PODCAST_SLUG}`);

    await expect(page.locator('article').getByText('Unable to set response.')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/article/podcasts/${PODCAST_SLUG}$`));
    await expect(page.locator('article h1').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.prose p').first()).toBeVisible({ timeout: 15000 });
  });

  test('podcast detail page only exposes supported translation buttons and can switch to zh', async ({ page }) => {
    await page.goto(`/article/podcasts/${PODCAST_SLUG}`);

    await expect(page.getByRole('link', { name: '中' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'A' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'RU' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'ع' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'あ' })).toHaveCount(0);

    await page.getByRole('link', { name: '中' }).first().click();
    await page.waitForURL(`**/zh/article/podcasts/${PODCAST_SLUG}`, { timeout: 15000 });
    await expect(page.locator('article').getByText('Unable to set response.')).toHaveCount(0);
    await expect(page.locator('article[lang="zh"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('article h1').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.prose p').first()).toBeVisible({ timeout: 15000 });
  });
});
