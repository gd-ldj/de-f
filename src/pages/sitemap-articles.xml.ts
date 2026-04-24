import type { Locale, HomePageData, HomeNewsArticle, HomeLatestArticle, HomeMostReadArticle } from '@/types';
import { SITE_CONFIG } from '@/config/constants';
import { fetchHomePageData } from '@/api/articles';
import { fetchLearnItems } from '@/api/learn';
import { fetchCollections, fetchCollectionArticles } from '@/api/collections';
import { generateSitemapEntry } from '@/utils/seo';
import { getArticleBusinessPath } from '@/utils/util';

const SUPPORTED_LOCALES: Locale[] = ['en', 'zh', 'ja'];
const TRANSLATION_LANGS = ['en', 'zh', 'ar', 'ru', 'ja'] as const;

const getDefaultLang = (locale: Locale) => (locale === 'zh' ? 'zh' : locale === 'ja' ? 'ja' : 'en');
const getAlternateLangs = (locale: Locale) => TRANSLATION_LANGS.filter((lang) => lang !== getDefaultLang(locale));
const appendLangParam = (url: string, lang: string) => `${url}${url.includes('?') ? '&' : '?'}lang=${lang}`;

/**
 * 生成站点文章级 sitemap（首页、文章、Learn、Collections）
 * 仅在搜索引擎访问 /sitemap-articles.xml 时按需拉取数据
 */
async function buildArticlesSitemapXml(origin: string): Promise<string> {
  const baseUrl = SITE_CONFIG.SITE_URL || origin;
  const articleEntries: {
    url: string;
    lastmod: string;
  }[] = [];

  const urlSet = new Set<string>();

  const addEntry = (url: string, lastmod: string) => {
    if (urlSet.has(url)) return;
    urlSet.add(url);
    articleEntries.push({ url, lastmod });
  };

  const nowIso = new Date().toISOString();

  // 首页：统一使用站点根路径
  addEntry(baseUrl, nowIso);

  // 首页相关文章：通过首页数据接口拉取（news_all、insights、research、news、latest、mostread）
  for (const locale of SUPPORTED_LOCALES) {
    const homeData = (await fetchHomePageData(locale)) as HomePageData | null;
    if (!homeData) continue;
    const alternateLangs = getAlternateLangs(locale);

    const allHomeArticles: Array<HomeNewsArticle | HomeLatestArticle | HomeMostReadArticle> = [...(homeData.lastest || []), ...(homeData.mostread || []), ...(homeData.news_all || []), ...(homeData.news?.flatMap((group) => group.data) || []), ...(homeData.insights || []), ...(homeData.research || [])];

    for (const article of allHomeArticles) {
      const userId = (article as { user_id?: string }).user_id;
      const isPromoted = (article as { is_promoted?: boolean }).is_promoted;
      if (userId && !isPromoted) {
        continue;
      }

      const category = getArticleBusinessPath(article as any);
      const createdAt = (article as any).created_at || nowIso;
      const entry = generateSitemapEntry(
        {
          slug: (article as any).slug,
          created_at: createdAt,
          category,
          user_id: isPromoted ? undefined : userId,
          is_promoted: isPromoted,
        },
        locale,
        baseUrl,
      );

      addEntry(entry.url, entry.lastmod);
      for (const lang of alternateLangs) {
        addEntry(appendLangParam(entry.url, lang), entry.lastmod);
      }
    }
  }

  // Learn 词条：使用 Learn 列表接口
  for (const locale of SUPPORTED_LOCALES) {
    const learnResponse = await fetchLearnItems(locale);
    const alternateLangs = getAlternateLangs(locale);
    for (const item of learnResponse.items) {
      const learnUrl = `${baseUrl}/tutorials/${encodeURIComponent(item.slug)}`;
      const lastmod = item.updatedAt || item.createdAt || nowIso;
      addEntry(learnUrl, lastmod);
      for (const lang of alternateLangs) {
        addEntry(appendLangParam(learnUrl, lang), lastmod);
      }
    }
  }

  // Collections 文章：遍历合集与合集内文章
  for (const locale of SUPPORTED_LOCALES) {
    let page = 1;
    const limit = 50;
    const maxPages = 50;
    const alternateLangs = getAlternateLangs(locale);

    while (page <= maxPages) {
      const { items, hasNext } = await fetchCollections(page, limit);

      if (!items.length) {
        break;
      }

      for (const collection of items) {
        let articlePage = 1;
        const articleLimit = 50;
        const maxArticlePages = 50;

        while (articlePage <= maxArticlePages) {
          const { articles, hasMore } = await fetchCollectionArticles(locale, collection.id, articlePage, articleLimit);

          if (!articles.length) {
            break;
          }

          for (const article of articles) {
            const url = `${baseUrl}/collections/${collection.id}/${encodeURIComponent(article.slug)}`;
            const lastmod = article.updated_at || article.created_at || nowIso;
            addEntry(url, lastmod);
            for (const lang of alternateLangs) {
              addEntry(appendLangParam(url, lang), lastmod);
            }
          }

          if (!hasMore) {
            break;
          }

          articlePage += 1;
        }
      }

      if (!hasNext) {
        break;
      }

      page += 1;
    }
  }

  const urlsXml = articleEntries
    .map((entry) => {
      return ['  <url>', `    <loc>${entry.url}</loc>`, `    <lastmod>${entry.lastmod}</lastmod>`, '  </url>'].join('\n');
    })
    .join('\n');

  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', urlsXml, '</urlset>'].join('\n');
}

export const prerender = false;

export async function GET({ url }: { url: URL }) {
  const origin = url.origin;
  const xml = await buildArticlesSitemapXml(origin);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
