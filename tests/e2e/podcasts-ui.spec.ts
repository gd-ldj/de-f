import { test, expect } from '@playwright/test';

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
});
