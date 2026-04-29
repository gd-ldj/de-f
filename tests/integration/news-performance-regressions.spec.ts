import { expect, test } from '@playwright/test';

const mockArticle = {
  entry_id: 'dtc-test-1',
  title: 'Test article',
  sub_title: 'Test subtitle',
  slug: 'test-article',
  body: 'Test body',
  author_name: 'DeTake',
  created_at: '2026-04-29T00:00:00.000Z',
  updated_at: '2026-04-29T00:00:00.000Z',
  category_names: ['AI'],
  subcategory_names: ['LLM'],
  business_type_name: 'News',
  tags: ['AI'],
  topic_names: ['AI'],
  img_url: '',
};

const mockArticlesResponse = {
  code: 2000,
  data: {
    list: Array.from({ length: 12 }, (_, index) => ({
      ...mockArticle,
      entry_id: `dtc-test-${index + 1}`,
      slug: `test-article-${index + 1}`,
      title: `Test article ${index + 1}`,
    })),
    pagination: {
      total: 12,
      limit: 12,
      next: false,
      next_cursor: null,
    },
  },
};

async function mockNewsPageData(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/articles?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockArticlesResponse),
    });
  });

  await page.route('**/api/cf-headers', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        headers: {
          'cf-ray': 'cf-test-ray',
          'cf-ipcountry': 'US',
        },
        clientIP: '127.0.0.1',
        country: 'US',
        visitorId: 'cf_test_visitor',
        timestamp: new Date().toISOString(),
        requestId: 'req_test',
      }),
    });
  });
}

test.describe('News page regression checks', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const newsHeading = (page: import('@playwright/test').Page) =>
    page.getByRole('heading', { name: 'News', exact: true }).first();

  test('/news should not throw runtime syntax errors during hydration', async ({ page }) => {
    const pageErrors: string[] = [];

    await mockNewsPageData(page);

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/news');
    await page.waitForLoadState('networkidle');
    await expect(newsHeading(page)).toBeVisible();
    await page.waitForTimeout(1000);

    expect(pageErrors).toEqual([]);
  });

  test('/news should not prefetch search recommendations before the overlay opens', async ({ page }) => {
    let passiveRecommendedRequests = 0;

    await mockNewsPageData(page);

    page.on('request', (request) => {
      const url = new URL(request.url());
      if (!url.pathname.endsWith('/api/v1/articles')) return;

      const limit = url.searchParams.get('limit');
      const pageParam = url.searchParams.get('page');
      const businessType = url.searchParams.get('business_type_name');

      if (limit === '8' && pageParam === '1' && !businessType) {
        passiveRecommendedRequests += 1;
      }
    });

    await page.goto('/news');
    await page.waitForLoadState('networkidle');
    await expect(newsHeading(page)).toBeVisible();
    await page.waitForTimeout(1000);

    expect(passiveRecommendedRequests).toBe(0);
  });

  test('/news should request /api/cf-headers only once on initial load', async ({ page }) => {
    let cfHeadersRequests = 0;

    await mockNewsPageData(page);

    page.on('request', (request) => {
      if (request.url().includes('/api/cf-headers')) {
        cfHeadersRequests += 1;
      }
    });

    await page.goto('/news');
    await page.waitForLoadState('networkidle');
    await expect(newsHeading(page)).toBeVisible();
    await page.waitForTimeout(1000);

    expect(cfHeadersRequests).toBe(1);
  });

  test('/news should not initialize Clerk before any auth interaction', async ({ page }) => {
    let clerkRequests = 0;

    await mockNewsPageData(page);

    page.on('request', (request) => {
      if (/clerk/i.test(request.url())) {
        clerkRequests += 1;
      }
    });

    await page.goto('/news');
    await page.waitForLoadState('networkidle');
    await expect(newsHeading(page)).toBeVisible();
    await page.waitForTimeout(1000);

    expect(clerkRequests).toBe(0);
  });
});
