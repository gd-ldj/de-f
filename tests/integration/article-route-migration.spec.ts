import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

import { buildArticleUrl, isTranslationPath } from '@/lib/language-utils';
import { getArticleUrl } from '@/lib/utils';
import { getCanonicalArticleUrl, generateSitemapEntry } from '@/utils/seo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const articleLinkManagerPath = path.resolve(__dirname, '../../src/scripts/article-link-manager.js');

test.describe('Article route migration helpers', () => {
  test('buildArticleUrl uses /user prefix for unpromoted user articles', () => {
    expect(buildArticleUrl('news', 'sample-slug', 'en', null, '42', false)).toBe(
      '/user/42/article/news/sample-slug',
    );
  });

  test('buildArticleUrl keeps promoted user articles on public article route', () => {
    expect(buildArticleUrl('news', 'sample-slug', 'en', null, '42', true)).toBe(
      '/article/news/sample-slug',
    );
  });

  test('buildArticleUrl adds translation prefix before /user route', () => {
    expect(buildArticleUrl('research', 'translated-slug', 'en', 'fr', '99', false)).toBe(
      '/fr/user/99/article/research/translated-slug',
    );
  });

  test('isTranslationPath recognises translated user article routes', () => {
    expect(isTranslationPath('/fr/user/99/article/news/translated-slug')).toBe(true);
  });

  test('getArticleUrl helper matches migrated unpromoted user article route', () => {
    expect(getArticleUrl('sample-slug', 'en', 'news', '42', 'promo1', false)).toBe(
      '/user/42/article/news/sample-slug-promo1',
    );
  });

  test('getCanonicalArticleUrl and sitemap entries omit /user for promoted content', () => {
    expect(getCanonicalArticleUrl('sample-slug', 'en', 'news', 'detake', '42', true)).toBe(
      '/article/news/sample-slug-detake',
    );

    expect(
      generateSitemapEntry(
        {
          slug: 'sample-slug',
          created_at: '2026-04-24T00:00:00.000Z',
          category: 'news',
          user_id: '42',
          is_promoted: true,
        },
        'en',
        'https://detake.news',
      ),
    ).toEqual({
      url: 'https://detake.news/article/news/sample-slug-detake',
      lastmod: '2026-04-24T00:00:00.000Z',
      changefreq: 'weekly',
      priority: 0.8,
    });
  });
});

test.describe('ArticleLink manager migration', () => {
  test('client-side link rewriting respects /user prefix and promotion status', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.setContent(`
      <a
        id="draft-link"
        data-article-link="true"
        data-slug="draft-story"
        data-locale="en"
        data-business="news"
        data-author-id="77"
        data-is-promoted="false"
        href="/article/news/draft-story-old"
      >draft</a>
      <a
        id="promoted-link"
        data-article-link="true"
        data-slug="public-story"
        data-locale="en"
        data-business="news"
        data-author-id="77"
        data-is-promoted="true"
        href="/user/77/article/news/public-story-old"
      >promoted</a>
    `, { waitUntil: 'load' });

    await page.evaluate(() => {
      localStorage.setItem('promote_code', 'promo1');
    });
    await page.addScriptTag({ path: articleLinkManagerPath });

    await expect(page.locator('#draft-link')).toHaveAttribute(
      'href',
      /\/user\/77\/article\/news\/draft-story-promo1$/,
    );
    await expect(page.locator('#promoted-link')).toHaveAttribute(
      'href',
      /\/article\/news\/public-story-promo1$/,
    );
  });
});
