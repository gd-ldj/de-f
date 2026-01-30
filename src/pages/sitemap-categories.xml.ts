import type { Locale, HomePageData, HomeTopic } from '@/types';
import { SITE_CONFIG } from '@/config/constants';
import { fetchHomePageData } from '@/api/articles';

const SUPPORTED_LOCALES: Locale[] = ['us', 'asia'];

/**
 * 生成分类与列表页 sitemap（频道页、Learn/Collections 列表、Topics 列表）
 */
async function buildCategoriesSitemapXml(origin: string): Promise<string> {
  const baseUrl = SITE_CONFIG.SITE_URL || origin;
  const entries: {
    url: string;
    lastmod: string;
  }[] = [];

  const urlSet = new Set<string>();

  const addEntry = (url: string, lastmod: string) => {
    if (urlSet.has(url)) return;
    urlSet.add(url);
    entries.push({ url, lastmod });
  };

  const nowIso = new Date().toISOString();

  for (const locale of SUPPORTED_LOCALES) {
    const prefix = `${baseUrl}/${locale}`;

    // 频道列表页：News / Insights / Research
    addEntry(`${prefix}/news`, nowIso);
    addEntry(`${prefix}/insights`, nowIso);
    addEntry(`${prefix}/research`, nowIso);

    // Learn 列表、Collections 列表、Social 列表
    addEntry(`${prefix}/learn`, nowIso);
    addEntry(`${prefix}/collections`, nowIso);
    addEntry(`${prefix}/social`, nowIso);

    // Topics 列表页：根据首页 topics 数据生成
    const homeData = (await fetchHomePageData(locale)) as HomePageData | null;
    const topics: HomeTopic[] = homeData?.topics || [];

    for (const topic of topics) {
      const slug = topic.name.toLowerCase().replace(/\s+/g, '-');
      const url = `${prefix}/topics/${slug}`;
      addEntry(url, nowIso);
    }
  }

  const urlsXml = entries
    .map((entry) => {
      return ['  <url>', `    <loc>${entry.url}</loc>`, `    <lastmod>${entry.lastmod}</lastmod>`, '  </url>'].join('\n');
    })
    .join('\n');

  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', urlsXml, '</urlset>'].join('\n');
}

export const prerender = false;

export async function GET({ url }: { url: URL }) {
  const origin = url.origin;
  const xml = await buildCategoriesSitemapXml(origin);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
