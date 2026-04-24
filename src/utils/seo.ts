import type { Locale } from '@/types';
import { SITE_CONFIG } from '@/config/constants';

/**
 * SEO utilities for article links and structured data
 */

/**
 * Generate canonical URL for an article
 * @param slug Article slug
 * @param locale Current locale
 * @param promoteCode Optional promote code (defaults to DEFAULT_PROMOTE_CODE)
 * @returns Canonical article URL
 *
 * URL formats:
 * - Admin/System articles: /article/{category}/{slug}
 * - User articles: /{userId}/article/{category}/{slug}
 *   (userId is numeric, distinguishable from language codes)
 */
export function getCanonicalArticleUrl(
  slug: string,
  locale: Locale,
  category: string = 'news',
  promoteCode?: string,
  userId?: string,
  isPromoted?: boolean,
): string {
  const normalizedCategory = category.toLowerCase();
  const normalizedSlug = promoteCode ? `${slug}-${promoteCode}` : slug;

  if (userId && !isPromoted) {
    return `/user/${userId}/article/${normalizedCategory}/${normalizedSlug}`;
  }
  return `/article/${normalizedCategory}/${normalizedSlug}`;
}

/**
 * Generate structured data (JSON-LD) for an article
 * Accepts backend field names directly for consistency across the app
 * @param article Article data with backend fields
 * @param locale Current locale
 * @param baseUrl Site base URL
 * @returns JSON-LD structured data
 */
export function generateArticleStructuredData(
  article: {
    title: string;
    sub_title: string;
    slug: string;
    created_at: string;
    img_url?: string;
    author?: string;
    category?: string;
    user_id?: string;
    is_promoted?: boolean;
  },
  locale: Locale,
  baseUrl: string = SITE_CONFIG.SITE_URL,
) {
  const canonicalUrl = `${baseUrl}${getCanonicalArticleUrl(article.slug, locale, article.category, 'detake', article.user_id, article.is_promoted)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.sub_title,
    url: canonicalUrl,
    datePublished: article.created_at,
    author: {
      '@type': 'Organization',
      name: article.author || 'Detake',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Detake',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    image: article.img_url ? `${baseUrl}${article.img_url}` : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };
}

/**
 * Generate meta tags for article SEO
 * Accepts backend field names directly for consistency across the app
 * @param article Article data with backend fields
 * @param locale Current locale
 * @param baseUrl Site base URL
 * @returns Meta tags object
 */
export function generateArticleMetaTags(
  article: {
    title: string;
    sub_title: string;
    slug: string;
    img_url?: string;
    category?: string;
    user_id?: string;
    is_promoted?: boolean;
  },
  locale: Locale,
  baseUrl: string = SITE_CONFIG.SITE_URL,
) {
  const canonicalUrl = `${baseUrl}${getCanonicalArticleUrl(article.slug, locale, article.category, 'detake', article.user_id, article.is_promoted)}`;
  const imageUrl = article.img_url ? `${baseUrl}${article.img_url}` : `${baseUrl}/og-default.png`;

  return {
    title: article.title,
    description: article.sub_title,
    canonical: canonicalUrl,
    openGraph: {
      title: article.title,
      description: article.sub_title,
      url: canonicalUrl,
      type: 'article',
      image: imageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.sub_title,
      image: imageUrl,
    },
  };
}

/**
 * Generate sitemap entry for an article
 * Accepts backend field names directly for consistency across the app
 * @param article Article data with backend fields
 * @param locale Current locale
 * @param baseUrl Site base URL
 * @returns Sitemap entry
 */
export function generateSitemapEntry(
  article: {
    slug: string;
    created_at: string;
    category?: string;
    user_id?: string;
    is_promoted?: boolean;
  },
  locale: Locale,
  baseUrl: string = SITE_CONFIG.SITE_URL,
) {
  return {
    url: `${baseUrl}${getCanonicalArticleUrl(article.slug, locale, article.category, 'detake', article.user_id, article.is_promoted)}`,
    lastmod: article.created_at,
    changefreq: 'weekly' as const,
    priority: 0.8,
  };
}

/**
 * Generate alternate language links for an article
 * @param slug Article slug
 * @param locales Available locales
 * @param baseUrl Site base URL
 * @returns Alternate language links
 */
export function generateAlternateLinks(
  slug: string,
  locales: Locale[],
  baseUrl: string = SITE_CONFIG.SITE_URL,
  category: string = 'news',
  userId?: string,
  isPromoted?: boolean,
) {
  return locales.map((locale) => ({
    hreflang: locale,
    href: `${baseUrl}${getCanonicalArticleUrl(slug, locale, category, 'detake', userId, isPromoted)}`,
  }));
}
