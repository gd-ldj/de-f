import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  // 判断是否为生产环境
  // NODE_ENV 为空或为 'production' 时为生产环境
  const isProduction = !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
  
  let robots: string;
  
  if (isProduction) {
    // 生产环境 - 允许搜索引擎爬取
    robots = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap.xml', import.meta.env.SITE).href}`;
  } else {
    // 测试/开发环境 - 禁止搜索引擎爬取
    robots = `User-agent: *
Disallow: /`;
  }

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=86400', // 缓存1天
    },
  });
};