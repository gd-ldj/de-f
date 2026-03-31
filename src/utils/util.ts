/**
 * Format date string according to specified locale
 * @param isoString - ISO date string or Date object
 * @param locale - Language locale ('en' or 'zh')
 * @returns Formatted date string
 */
export function formatDate(isoString: string, locale = 'en') {
  const localeMap = {
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
  };

  const dateObj = typeof isoString === 'string' ? new Date(isoString) : isoString;
  const targetLocale = localeMap[locale as keyof typeof localeMap] || 'en-US';

  // Use Intl.DateTimeFormat for more reliable locale-specific formatting
  return new Intl.DateTimeFormat(targetLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Calculate relative time from now in hours
 * @param isoString - ISO date string or Date object
 * @param locale - Language locale for text formatting
 * @returns Relative time string (e.g., "2 hours ago", "2小时前")
 */
export function formatRelativeTime(isoString: string, locale = 'en'): string {
  const dateObj = typeof isoString === 'string' ? new Date(isoString) : isoString;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  // if (locale === 'zh') {
  //   if (diffInHours < 1) {
  //     return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes} minutes ago`;
  //   } else if (diffInHours < 24) {
  //     return `${diffInHours} hours ago`;
  //   } else {
  //     const diffInDays = Math.floor(diffInHours / 24);
  //     return `${diffInDays} days ago`;
  //   }
  // } else {
  if (diffInHours < 1) {
    return '1 H';
  } else if (diffInHours < 24) {
    return `${diffInHours} H`;
  } else {
    return '24 H';
  }
  // }
}

/**
 * Extract category names from article data and validate against taxonomy dictionary.
 * Only returns names that exist in CATEGORY_MAP to prevent invalid/tag data from leaking in.
 */
export function getArticleCategoryNames(article: Record<string, any>): string[] {
  let raw: string[] = [];
  if (Array.isArray(article?.category_names) && article.category_names.length > 0) {
    raw = article.category_names;
  } else if (article?.category_name) {
    raw = [article.category_name];
  }
  return raw.filter((name) => name in CATEGORY_MAP);
}

/**
 * Extract subcategory names from article data and validate against taxonomy dictionary.
 * Only returns names that exist in SUBCATEGORY_MAP to prevent tag data from appearing in breadcrumbs.
 */
export function getArticleSubcategoryNames(article: Record<string, any>): string[] {
  let raw: string[] = [];
  if (Array.isArray(article?.subcategory_names) && article.subcategory_names.length > 0) {
    raw = article.subcategory_names;
  } else if (article?.subcategory_name) {
    raw = [article.subcategory_name];
  }
  return raw.filter((name) => name in SUBCATEGORY_MAP);
}

export function getArticleCategoryLabel(article: Record<string, any>): string {
  return getArticleCategoryNames(article).join(' ');
}

export function getArticleSubcategoryLabel(article: Record<string, any>): string {
  return getArticleSubcategoryNames(article).join(' ');
}

export function getArticleBusinessPath(article: Record<string, any>): string {
  const primary = article?.business_type_name || article?.business_type || 'news';
  return primary.toLowerCase();
}

// ---------------------------------------------------------------------------
// Localized label helpers (use taxonomy dictionary for i18n)
// ---------------------------------------------------------------------------

import {
  CATEGORY_MAP,
  SUBCATEGORY_MAP,
  getBusinessTypeLabel,
  getCategoryLabel as getTaxonomyCategoryLabel,
  getSubcategoryLabel as getTaxonomySubcategoryLabel,
  getTagLabel as getTaxonomyTagLabel,
} from '@/config/article-taxonomy';
import type { SourceLanguage } from '@/types';

/**
 * Get localized category label(s) for an article.
 * Maps each raw English category name through the taxonomy dictionary.
 */
export function getLocalizedCategoryLabel(article: Record<string, any>, lang: SourceLanguage): string {
  return getArticleCategoryNames(article)
    .map((name) => getTaxonomyCategoryLabel(name, lang))
    .join(' ');
}

/**
 * Get localized subcategory label(s) for an article.
 */
export function getLocalizedSubcategoryLabel(article: Record<string, any>, lang: SourceLanguage): string {
  return getArticleSubcategoryNames(article)
    .map((name) => getTaxonomySubcategoryLabel(name, lang))
    .join(' ');
}

/**
 * Get localized tag label.
 */
export function getLocalizedTagLabel(tag: string, lang: SourceLanguage): string {
  return getTaxonomyTagLabel(tag, lang);
}

/**
 * Get localized business type label for an article.
 */
export function getLocalizedBusinessTypeLabel(article: Record<string, any>, lang: SourceLanguage): string {
  const primary = article?.business_type_name || article?.business_type || 'News';
  return getBusinessTypeLabel(primary, lang);
}
