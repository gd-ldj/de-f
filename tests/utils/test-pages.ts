import type { Page } from '@playwright/test';

/**
 * Centralized page URL constants and navigation helpers for DeTake tests.
 */

// Page routes to test (relative to baseURL)
export const TEST_PAGES = {
  home: '/',
  news: '/news',
  research: '/research',
  insights: '/insights',
  tutorials: '/tutorials',
  collections: '/collections',
  voices: '/voices',
  podcasts: '/voices/podcasts',
} as const;

// Pages that render ArticleCard lists
export const ARTICLE_LIST_PAGES = [
  TEST_PAGES.news,
  TEST_PAGES.research,
  TEST_PAGES.insights,
] as const;

/**
 * Navigate to the first article link found on a page.
 * Returns the article URL or null if no article links are available (API down / empty).
 */
export async function navigateToFirstArticle(page: Page): Promise<string | null> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const publicArticleLink = page.locator('a[href^="/article/"]').first();
  const publicCount = await publicArticleLink.count();
  const firstArticleLink = publicCount > 0 ? publicArticleLink : page.locator('a[href*="/article/"]').first();
  const count = await firstArticleLink.count();
  if (count === 0) return null;

  const isVisible = await firstArticleLink.isVisible().catch(() => false);
  if (!isVisible) return null;

  await firstArticleLink.click();
  await page.waitForLoadState('networkidle');

  return page.url();
}

/**
 * Check if a page loaded successfully with content (not a blank/error page).
 * Returns true if the page has visible content.
 */
export async function isPageLoaded(page: Page): Promise<boolean> {
  const body = page.locator('body');
  const textContent = await body.textContent();
  return !!textContent && textContent.trim().length > 50;
}
