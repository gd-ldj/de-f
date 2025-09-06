import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  // Check if it's production environment
  // Production environment when NODE_ENV is empty or 'production'
  const isProduction = !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
  
  let robots: string;
  
  if (isProduction) {
    // Production environment - Allow search engine crawling
    robots = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap.xml', import.meta.env.SITE).href}`;
  } else {
    // Test/Development environment - Disallow search engine crawling
    robots = `User-agent: *
Disallow: /`;
  }

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=86400', // Cache for 1 day
    },
  });
};