import { expect, test } from '@playwright/test';

import { DEFAULT_PROMOTE_CODE } from '@/config/constants';

type TranslationLang = 'zh';

type ArticleRole = 'Authors' | 'Author' | 'User' | string;

interface ArticleListItem {
  slug?: string;
}

interface ArticleDetail {
  entry_id?: string;
  slug?: string;
  business_type_name?: string;
  user_id?: string;
  is_promoted?: boolean;
  author?: {
    id?: string;
    role?: ArticleRole;
  };
}

interface UserArticleSample {
  entryId: string;
  slug: string;
  userId: string;
  businessPath: string;
  userPath: string;
  publicPath: string;
  translatedPath?: string;
}

interface UserArticleSamples {
  unpromoted?: UserArticleSample;
  translated?: UserArticleSample;
  promoted?: UserArticleSample;
}

const API_PAGE_SIZE = 20;
const MAX_SCAN_PAGES = 7;
const API_REQUEST_TIMEOUT_MS = 5000;
const SAMPLE_DISCOVERY_TIMEOUT_MS = 20000;
const SOURCE_LANGUAGE = 'en';
const TRANSLATED_LANGUAGE: TranslationLang = 'zh';
const USER_AUTHOR_ROLES = new Set(['Authors', 'Author', 'User']);

let sampleCache: Promise<UserArticleSamples> | null = null;

function getApiBaseUrl(): string {
  const env = process.env.PUBLIC_SITE_ENV || 'beta';
  const lang = process.env.PUBLIC_SOURCE_LANGUAGE || SOURCE_LANGUAGE;
  const domainMap: Record<string, string> = {
    beta: 'beta-api.detake.com',
    web2: 'beta-api.detake.com',
    web3: 'api.detake.com',
    beta_dev: 'preview-api.detake.com',
  };

  return `https://${lang}-${domainMap[env] || domainMap.beta}`;
}

async function fetchApiEnvelope<T>(path: string): Promise<{ status: number; json: T | null }> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: {
        accept: 'application/json',
        'user-agent': 'Mozilla/5.0 (Playwright)',
      },
      signal: AbortSignal.timeout(API_REQUEST_TIMEOUT_MS),
    });

    const text = await response.text();
    const json = text ? (JSON.parse(text) as T) : null;
    return { status: response.status, json };
  } catch (error) {
    console.warn(`Failed to fetch ${path}:`, error);
    return { status: 0, json: null };
  }
}

function withTimeoutFallback<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T, label: string): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`${label} timed out after ${timeoutMs}ms`);
      resolve(fallbackValue);
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        console.warn(`${label} failed:`, error);
        resolve(fallbackValue);
      });
  });
}

function inferUserId(article: ArticleDetail): string | undefined {
  if (article.user_id) {
    return String(article.user_id);
  }

  const authorId = article.author?.id;
  const authorRole = article.author?.role;
  if (authorId && authorRole && USER_AUTHOR_ROLES.has(authorRole)) {
    return String(authorId);
  }

  return undefined;
}

function buildUserArticlePath(userId: string, businessPath: string, slug: string, translationLanguage?: TranslationLang): string {
  const basePath = `/user/${userId}/article/${businessPath}/${slug}-${DEFAULT_PROMOTE_CODE}`;
  return translationLanguage ? `/${translationLanguage}${basePath}` : basePath;
}

function buildPublicArticlePath(businessPath: string, slug: string): string {
  return `/article/${businessPath}/${slug}-${DEFAULT_PROMOTE_CODE}`;
}

function stripPromoteCode(path: string): string {
  return path.replace(`-${DEFAULT_PROMOTE_CODE}`, '');
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createSample(detail: ArticleDetail): UserArticleSample | null {
  const userId = inferUserId(detail);
  const slug = detail.slug;
  const entryId = detail.entry_id;
  const businessPath = detail.business_type_name?.toLowerCase();

  if (!userId || !slug || !entryId || !businessPath) {
    return null;
  }

  return {
    entryId,
    slug,
    userId,
    businessPath,
    userPath: buildUserArticlePath(userId, businessPath, slug),
    publicPath: buildPublicArticlePath(businessPath, slug),
    translatedPath: buildUserArticlePath(userId, businessPath, slug, TRANSLATED_LANGUAGE),
  };
}

async function discoverUserArticleSamples(): Promise<UserArticleSamples> {
  const samples: UserArticleSamples = {};

  for (let page = 1; page <= MAX_SCAN_PAGES; page += 1) {
    const listResponse = await fetchApiEnvelope<{ data?: { list?: ArticleListItem[] } }>(
      `/api/v1/articles?locale=${SOURCE_LANGUAGE}&page=${page}&limit=${API_PAGE_SIZE}`,
    );
    const list = listResponse.json?.data?.list ?? [];

    if (list.length === 0) {
      break;
    }

    for (const item of list) {
      if (!item.slug) {
        continue;
      }

      const detailResponse = await fetchApiEnvelope<{ data?: ArticleDetail }>(
        `/api/v1/articles/info?slug=${encodeURIComponent(item.slug)}`,
      );
      const detail = detailResponse.json?.data;
      if (!detail) {
        continue;
      }

      const sample = createSample(detail);
      if (!sample) {
        continue;
      }

      if (!detail.is_promoted && !samples.unpromoted) {
        samples.unpromoted = sample;
      }

      if (!detail.is_promoted && !samples.translated) {
        const translatedResponse = await fetchApiEnvelope<{ data?: { title?: string } }>(
          `/api/v1/articles/translated?entry_id=${encodeURIComponent(sample.entryId)}&language=${TRANSLATED_LANGUAGE}`,
        );
        if (translatedResponse.status === 200 && translatedResponse.json?.data?.title) {
          samples.translated = sample;
        }
      }

      if (detail.is_promoted && !samples.promoted) {
        samples.promoted = sample;
      }

      if (samples.unpromoted && samples.translated && samples.promoted) {
        return samples;
      }
    }
  }

  return samples;
}

async function getUserArticleSamples(): Promise<UserArticleSamples> {
  if (!sampleCache) {
    sampleCache = withTimeoutFallback(
      discoverUserArticleSamples(),
      SAMPLE_DISCOVERY_TIMEOUT_MS,
      {},
      'Live user article sample discovery',
    );
  }

  return sampleCache;
}

test.describe('User article routes with live API samples', () => {
  test.describe.configure({ mode: 'serial' });

  test('unpromoted user route keeps /user path and outputs noindex metadata', async ({ page }) => {
    const { unpromoted } = await getUserArticleSamples();
    if (!unpromoted) {
      test.skip(true, 'No live unpromoted user article sample available');
      return;
    }

    await page.goto(unpromoted.userPath, { waitUntil: 'load' });

    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(unpromoted.userPath)}$`));
    await expect(page.locator('article h1').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${escapeRegExp(stripPromoteCode(unpromoted.userPath))}$`),
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    expect(await page.locator(`a[href="${unpromoted.translatedPath}"]`).count()).toBeGreaterThan(0);
  });

  test('translated user route stays under translated /user path and keeps source link on /user', async ({ page }) => {
    const { translated } = await getUserArticleSamples();
    if (!translated) {
      test.skip(true, 'No live translated user article sample available');
      return;
    }

    await page.goto(translated.translatedPath!, { waitUntil: 'load' });

    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(translated.translatedPath!)}$`));
    await expect(page.locator('article[lang="zh"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${escapeRegExp(stripPromoteCode(translated.translatedPath!))}$`),
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    expect(await page.locator(`a[href="${translated.userPath}"]`).count()).toBeGreaterThan(0);
  });

  test('public article route blocks unpromoted user article access', async ({ page }) => {
    const { unpromoted } = await getUserArticleSamples();
    if (!unpromoted) {
      test.skip(true, 'No live unpromoted user article sample available');
      return;
    }

    await page.goto(unpromoted.publicPath, { waitUntil: 'load' });

    await expect(page).toHaveURL(/\/404$/);
    await expect(page.getByText("Sorry, we couldn't find this page.")).toBeVisible({ timeout: 15000 });
  });

  test('promoted user route redirects back to public article route when live sample exists', async ({ page }) => {
    const { promoted } = await getUserArticleSamples();
    if (!promoted) {
      test.skip(true, 'No live promoted user article sample available');
      return;
    }

    await page.goto(promoted.userPath, { waitUntil: 'load' });

    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(promoted.publicPath)}$`));
    await expect(page.locator('article h1').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/i);
  });
});
