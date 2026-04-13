import { test, expect } from '@playwright/test';

const firstPageResults = [
  {
    type: 'article',
    entry_id: 'article-1',
    title: 'AI chips reshape the cloud market',
    sub_title: 'Cloud vendors are racing to adapt their infrastructure.',
    slug: 'ai-chips-reshape-cloud-market',
    language: 'en',
    author_name: 'JANE DOE',
    author_avatar: null,
    channel_name: null,
    duration: null,
    created_at: '2026-03-13T08:00:00Z',
    updated_at: '2026-03-13T08:00:00Z',
    img_url: null,
    category_names: ['Technology'],
    subcategory_names: ['New Releases'],
    business_type_name: 'News',
    tags: ['AI'],
  },
  {
    type: 'podcast',
    entry_id: 'podcast-1',
    title: 'AI founders weekly',
    sub_title: 'A podcast on builders and research labs.',
    slug: null,
    language: 'en',
    author_name: null,
    author_avatar: null,
    channel_name: 'DETAKE FM',
    duration: 3600,
    created_at: '2026-03-12T08:00:00Z',
    updated_at: '2026-03-12T08:00:00Z',
    img_url: null,
  },
];

const secondPageResults = [
  {
    type: 'article',
    entry_id: 'article-2',
    title: 'AI regulation enters a new phase',
    sub_title: 'Governments are revisiting deployment rules.',
    slug: 'ai-regulation-enters-new-phase',
    language: 'en',
    author_name: 'JOHN SMITH',
    author_avatar: null,
    channel_name: null,
    duration: null,
    created_at: '2026-03-11T08:00:00Z',
    updated_at: '2026-03-11T08:00:00Z',
    img_url: null,
    category_names: ['Policy'],
    subcategory_names: ['AI Governance'],
    business_type_name: 'Insights',
    tags: ['Policy'],
  },
];

function createSearchResponse(list: unknown[], nextCursor: string | null) {
  return {
    code: 2000,
    msg: {
      en: 'success',
      zh: '成功',
    },
    data: {
      list,
      pagination: {
        total: 3,
        page: nextCursor ? 1 : 2,
        limit: 8,
        next: Boolean(nextCursor),
        next_cursor: nextCursor,
      },
    },
  };
}

async function mockSearchApi(page: import('@playwright/test').Page) {
  const searchRequests: string[] = [];

  await page.route('**/api/v1/articles?*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 2000,
        msg: { en: 'success', zh: '成功' },
        data: {
          list: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 8,
            next: false,
            next_cursor: null,
          },
        },
      }),
    });
  });

  await page.route('**/api/v1/search?*', async (route) => {
    const url = new URL(route.request().url());
    searchRequests.push(url.toString());

    const cursor = url.searchParams.get('cursor');
    const body = cursor === 'cursor-1'
      ? createSearchResponse(secondPageResults, null)
      : createSearchResponse(firstPageResults, 'cursor-1');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  return searchRequests;
}

test.describe('Search overlay - desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('uses /api/v1/search and appends cursor-based results', async ({ page }) => {
    const searchRequests = await mockSearchApi(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('desktop-search-btn').click();
    await expect(page.getByTestId('search-overlay')).toBeVisible();

    const input = page.getByTestId('search-input');
    await input.fill('AI');

    await expect.poll(() => searchRequests.length).toBe(1);
    expect(searchRequests[0]).toContain('/api/v1/search');
    expect(searchRequests[0]).toContain('q=AI');
    expect(searchRequests[0]).toContain('locale=en');
    expect(searchRequests[0]).toContain('page=1');

    const results = page.locator('[data-testid="search-results"] article');
    await expect(results).toHaveCount(2);
    await expect(page.getByText('AI chips reshape the cloud market')).toBeVisible();
    await expect(page.getByText('AI founders weekly')).toBeVisible();

    const podcastLink = page.locator('[data-testid="search-results"] a[href*="/article/podcasts/podcast-1-"]').first();
    await expect(podcastLink).toBeVisible();

    await page.getByTestId('search-load-more').click();

    await expect.poll(() => searchRequests.length).toBe(2);
    expect(searchRequests[1]).toContain('cursor=cursor-1');

    await expect(results).toHaveCount(3);
    await expect(page.getByText('AI regulation enters a new phase')).toBeVisible();
  });
});

test.describe('Search overlay - mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile overlay appends cursor-loaded results', async ({ page }) => {
    const searchRequests = await mockSearchApi(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('mobile-search-btn').click();
    await expect(page.getByTestId('search-overlay')).toBeVisible();

    const input = page.getByTestId('search-input');
    await input.fill('AI');

    await expect.poll(() => searchRequests.length).toBeGreaterThanOrEqual(1);
    expect(searchRequests[0]).toContain('page=1');

    const results = page.locator('[data-testid="search-results"] article');
    await expect.poll(() => searchRequests.length).toBe(2);
    expect(searchRequests[1]).toContain('cursor=cursor-1');
    await expect(results).toHaveCount(3);
    await expect(page.getByText('AI regulation enters a new phase')).toBeVisible();
  });
});
