import { SITE_CONFIG } from '@/config/constants';

/**
 * 获取站点主域名（优先使用 Vercel 生产域名环境变量）
 */
function getHost(): string {
  const envHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

  if (envHost && typeof envHost === 'string') {
    return envHost;
  }

  try {
    const url = new URL(SITE_CONFIG.SITE_URL);
    return url.host;
  } catch {
    return 'detake.news';
  }
}

/**
 * 生成 robots.txt 内容
 */
function generateRobots(): string {
  const host = getHost();
  const sitemapUrl = `https://${host}/sitemap-index.xml`;
  const sitemapArticlesUrl = `https://${host}/sitemap-articles.xml`;

  const isProductionEnv = SITE_CONFIG.IS_PRODUCTION;

  if (!isProductionEnv) {
    return ['# DeTake Website - Robots.txt', '# Block all crawlers in non-production environments', '', 'User-agent: *', 'Disallow: /', '', '# No sitemap for non-production environments', ''].join('\n');
  }

  return [
    '# DeTake Website - Robots.txt',
    '# Allow all crawlers to access the production site',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Block user article directory (unpromoted content)',
    '# Source language: /user/{userId}/article/...',
    'Disallow: /user/',
    '# Translated versions: /{lang}/user/{userId}/article/...',
    'Disallow: /*/user/',
    '',
    '# Sitemap location',
    `Sitemap: ${sitemapUrl}`,
    `Sitemap: ${sitemapArticlesUrl}`,
    `Sitemap: https://${host}/sitemap-categories.xml`,
    '',
    '# Optional: Disallow specific paths if needed',
    '# Disallow: /api/',
    '# Disallow: /admin/',
    '# Disallow: /_astro/',
    '',
    '# Crawl-delay for specific bots (optional)',
    '# User-agent: Googlebot',
    '# Crawl-delay: 0',
    '',
    '# User-agent: Bingbot',
    '# Crawl-delay: 0',
    '',
  ].join('\n');
}

export const prerender = true;

/**
 * 处理 /robots.txt 请求
 */
export async function GET() {
  const body = generateRobots();

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
