import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const { params: routeParams } = params;
  
  // 解析参数：title, description, category 等
  const searchParams = new URL(request.url).searchParams;
  const title = searchParams.get('title') || 'DeTake - Crypto News';
  const description = searchParams.get('description') || 'Latest crypto news and analysis';
  const category = searchParams.get('category') || 'News';
  const author = searchParams.get('author') || 'DeTake';
  
  // 生成 SVG 图片
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景渐变 -->
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      
      <!-- 背景 -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- 装饰性元素 -->
      <circle cx="100" cy="100" r="50" fill="rgba(255,255,255,0.1)"/>
      <circle cx="1100" cy="530" r="80" fill="rgba(255,255,255,0.08)"/>
      <rect x="950" y="50" width="200" height="4" fill="rgba(255,255,255,0.3)" rx="2"/>
      
      <!-- Logo 区域 -->
      <rect x="60" y="60" width="120" height="40" fill="rgba(255,255,255,0.15)" rx="8"/>
      <text x="120" y="85" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
        DeTake
      </text>
      
      <!-- 分类标签 -->
      <rect x="60" y="150" width="${Math.max(100, category.length * 12)}" height="32" fill="rgba(255,255,255,0.2)" rx="16"/>
      <text x="${60 + Math.max(100, category.length * 12) / 2}" y="170" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="medium">
        ${category.toUpperCase()}
      </text>
      
      <!-- 标题 -->
      <text x="60" y="250" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold" filter="url(#shadow)">
        ${title.length > 40 ? title.substring(0, 40) + '...' : title}
      </text>
      
      <!-- 描述 -->
      <text x="60" y="320" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="24" font-weight="normal">
        ${description.length > 80 ? description.substring(0, 80) + '...' : description}
      </text>
      
      <!-- 作者信息 -->
      <text x="60" y="520" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="18">
        By ${author}
      </text>
      
      <!-- 底部装饰线 -->
      <rect x="60" y="580" width="1080" height="2" fill="rgba(255,255,255,0.3)" rx="1"/>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000', // 缓存一年
    },
  });
};