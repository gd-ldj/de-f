import type { Locale } from '@/types'
import { DEFAULT_PROMOTE_CODE } from '@/config/constants'

/**
 * SEO utilities for article links and structured data
 */

/**
 * Generate canonical URL for an article
 * @param slug Article slug
 * @param locale Current locale
 * @param promoteCode Optional promote code (defaults to DEFAULT_PROMOTE_CODE)
 * @returns Canonical article URL
 */
export function getCanonicalArticleUrl(
  slug: string,
  locale: Locale,
  promoteCode?: string
): string {
  const code = promoteCode || DEFAULT_PROMOTE_CODE
  return `/${locale}/news/${slug}-${code}`
}

/**
 * Generate structured data (JSON-LD) for an article
 * @param article Article data
 * @param locale Current locale
 * @param baseUrl Site base URL
 * @returns JSON-LD structured data
 */
export function generateArticleStructuredData(
  article: {
    title: string
    excerpt: string
    slug: string
    publishedAt: string
    featuredImage?: string
    author?: string
  },
  locale: Locale,
  baseUrl: string = 'https://detake.com'
) {
  const canonicalUrl = `${baseUrl}${getCanonicalArticleUrl(article.slug, locale)}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    url: canonicalUrl,
    datePublished: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: article.author || 'Detake'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Detake',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    image: article.featuredImage ? `${baseUrl}${article.featuredImage}` : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  }
}

/**
 * Generate meta tags for article SEO
 * @param article Article data
 * @param locale Current locale
 * @param baseUrl Site base URL
 * @returns Meta tags object
 */
export function generateArticleMetaTags(
  article: {
    title: string
    excerpt: string
    slug: string
    featuredImage?: string
  },
  locale: Locale,
  baseUrl: string = 'https://detake.com'
) {
  const canonicalUrl = `${baseUrl}${getCanonicalArticleUrl(article.slug, locale)}`
  const imageUrl = article.featuredImage ? `${baseUrl}${article.featuredImage}` : `${baseUrl}/og-default.png`
  
  return {
    title: article.title,
    description: article.excerpt,
    canonical: canonicalUrl,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      type: 'article',
      image: imageUrl
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      image: imageUrl
    }
  }
}

/**
 * Generate sitemap entry for an article
 * @param article Article data
 * @param locale Current locale
 * @param baseUrl Site base URL
 * @returns Sitemap entry
 */
export function generateSitemapEntry(
  article: {
    slug: string
    publishedAt: string
  },
  locale: Locale,
  baseUrl: string = 'https://detake.com'
) {
  return {
    url: `${baseUrl}${getCanonicalArticleUrl(article.slug, locale)}`,
    lastmod: article.publishedAt,
    changefreq: 'weekly' as const,
    priority: 0.8
  }
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
  baseUrl: string = 'https://detake.com'
) {
  return locales.map(locale => ({
    hreflang: locale,
    href: `${baseUrl}${getCanonicalArticleUrl(slug, locale)}`
  }))
}