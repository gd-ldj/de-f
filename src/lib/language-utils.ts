/**
 * Language utilities for multi-source site architecture
 * Provides helpers for language detection, URL generation, and translation handling
 */

import type { SourceLanguage, TranslationLanguage } from '@/types';
import { MULTI_SOURCE_CONFIG, STORAGE_KEYS } from '@/config/constants';

/**
 * Check if a language code is a valid translation language
 */
export function isValidTranslationLanguage(lang: string): lang is TranslationLanguage {
  return ['en', 'zh', 'ja', 'fr', 'ar', 'ru', 'de', 'es', 'ko'].includes(lang);
}

/**
 * Check if a language code is a valid source language
 */
export function isValidSourceLanguage(lang: string): lang is SourceLanguage {
  return ['en', 'zh', 'ja'].includes(lang);
}

/**
 * Get source language from request hostname (SSR)
 *
 * Strategy:
 * - localhost: Use cookie if valid, otherwise use domain/env (allows manual switching)
 * - Non-localhost (test/production): Always use domain (ignores cookie)
 *
 * This allows local testing with language switching while ensuring production
 * sites always reflect their domain language.
 *
 * @param request - The HTTP request object
 * @param hostname - The hostname to check (optional, will extract from request if not provided)
 * @returns The source language based on domain or cookie (localhost only)
 */
export function getSourceLanguageFromRequest(request: Request, hostname?: string): SourceLanguage {
  // Extract hostname if not provided
  const effectiveHostname = hostname || request.headers.get('host') || '';

  // Check if this is localhost
  const isLocalhost =
    effectiveHostname === 'localhost' ||
    effectiveHostname.startsWith('localhost:') ||
    effectiveHostname === '127.0.0.1' ||
    effectiveHostname.startsWith('127.0.0.1:');

  // For localhost, check cookie first to allow manual language switching
  if (isLocalhost) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${STORAGE_KEYS.SOURCE_LANGUAGE}=([^;]+)`));
    const cookieValue = match?.[1] ? decodeURIComponent(match[1]) : null;

    if (cookieValue && isValidSourceLanguage(cookieValue)) {
      return cookieValue;
    }
  }

  // For all environments (including localhost fallback), use domain detection
  if (effectiveHostname) {
    return MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(effectiveHostname);
  }

  // Final fallback to environment variable
  return MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE;
}

/**
 * Get source language from URL hostname
 * This is the main function to determine which source site the user is on
 */
export function getSourceLanguageFromUrl(url: URL): SourceLanguage {
  return MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(url.hostname);
}

/**
 * Check if a string is a numeric user ID
 */
export function isNumericUserId(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Check if the first path segment is a language code (2 letters) or user ID (numeric)
 * @returns 'language' | 'userId' | 'other'
 */
export function detectFirstPathSegmentType(pathname: string): 'language' | 'userId' | 'other' {
  const match = pathname.match(/^\/([^/]+)/);
  if (!match || !match[1]) {
    return 'other';
  }

  const segment = match[1];

  // Check if it's a numeric user ID
  if (isNumericUserId(segment)) {
    return 'userId';
  }

  // Check if it's a 2-letter language code
  if (/^[a-z]{2}$/.test(segment) && isValidTranslationLanguage(segment)) {
    return 'language';
  }

  return 'other';
}

/**
 * Extract translation language from pathname
 * Returns null if no translation language is detected in the path
 *
 * @example
 * extractTranslationLanguageFromPath('/fr/article/news/example') // 'fr'
 * extractTranslationLanguageFromPath('/article/news/example') // null
 * extractTranslationLanguageFromPath('/10/article/news/example') // null (user ID, not language)
 */
export function extractTranslationLanguageFromPath(pathname: string): TranslationLanguage | null {
  // Match pattern: /{lang}/...
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);

  if (match && match[1]) {
    const lang = match[1];
    // Make sure it's a valid translation language and not a numeric user ID
    if (isValidTranslationLanguage(lang) && !isNumericUserId(lang)) {
      return lang;
    }
  }

  return null;
}

/**
 * Check if the current path is for translated content
 * Only article and collection pages support translation paths
 */
export function isTranslationPath(pathname: string): boolean {
  const translationLang = extractTranslationLanguageFromPath(pathname);

  if (!translationLang) {
    return false;
  }

  // Check if it's an article or collection path
  return /^\/(en|zh|ja|fr|ar|ru|de|es|ko)\/(article|collections|learn)\//.test(pathname);
}

/**
 * Remove translation language prefix from pathname
 *
 * @example
 * removeTranslationPrefix('/fr/article/news/example') // '/article/news/example'
 * removeTranslationPrefix('/article/news/example') // '/article/news/example'
 */
export function removeTranslationPrefix(pathname: string): string {
  const translationLang = extractTranslationLanguageFromPath(pathname);

  if (!translationLang) {
    return pathname;
  }

  return pathname.replace(/^\/[a-z]{2}/, '');
}

/**
 * Add translation language prefix to pathname
 * Only adds prefix if path is for article or collection
 *
 * @example
 * addTranslationPrefix('/article/news/example', 'fr') // '/fr/article/news/example'
 * addTranslationPrefix('/research', 'fr') // '/research' (no change for non-translatable paths)
 */
export function addTranslationPrefix(pathname: string, lang: TranslationLanguage): string {
  // Remove existing translation prefix first
  const cleanPath = removeTranslationPrefix(pathname);

  // Check if it's a translatable path (article or collection)
  const isTranslatable = /^\/(article|collections)\//.test(cleanPath);

  if (!isTranslatable) {
    return cleanPath;
  }

  return `/${lang}${cleanPath}`;
}

/**
 * Check if translation language matches source language
 * Used to determine if we should redirect to the non-prefixed version
 */
export function shouldRedirectToSourceVersion(sourceLanguage: SourceLanguage, translationLanguage: TranslationLanguage | null): boolean {
  return translationLanguage !== null && translationLanguage === sourceLanguage;
}

/**
 * Build article URL with proper language handling
 *
 * @param category - Article category
 * @param slug - Article slug
 * @param sourceLanguage - Current site's source language
 * @param translationLanguage - Target translation language (null for source version)
 * @param userId - Optional user ID for user-generated articles
 * @returns Complete pathname
 */
export function buildArticleUrl(category: string, slug: string, sourceLanguage: SourceLanguage, translationLanguage: TranslationLanguage | null = null, userId?: string): string {
  // Base path without language
  // User articles use /{userId}/ prefix (numeric ID distinguishes from language codes)
  const basePath = userId ? `/${userId}/article/${category}/${slug}` : `/article/${category}/${slug}`;

  // If translation language is null or same as source, return source version
  if (!translationLanguage || translationLanguage === sourceLanguage) {
    return basePath;
  }

  // Add translation prefix
  return `/${translationLanguage}${basePath}`;
}

/**
 * Build collection URL with proper language handling
 *
 * @param collectionId - Collection ID
 * @param slug - Collection slug
 * @param sourceLanguage - Current site's source language
 * @param translationLanguage - Target translation language (null for source version)
 * @returns Complete pathname
 */
export function buildCollectionUrl(collectionId: string, slug: string, sourceLanguage: SourceLanguage, translationLanguage: TranslationLanguage | null = null): string {
  // Base path without language
  const basePath = `/collections/${collectionId}/${slug}`;

  // If translation language is null or same as source, return source version
  if (!translationLanguage || translationLanguage === sourceLanguage) {
    return basePath;
  }

  // Add translation prefix
  return `/${translationLanguage}${basePath}`;
}

/**
 * Get display name for language
 */
export function getLanguageDisplayName(lang: TranslationLanguage, displayIn: 'en' | 'native' = 'native'): string {
  const names: Record<TranslationLanguage, { en: string; native: string }> = {
    en: { en: 'English', native: 'English' },
    zh: { en: 'Chinese', native: '中文' },
    ja: { en: 'Japanese', native: '日本語' },
    fr: { en: 'French', native: 'Français' },
    ar: { en: 'Arabic', native: 'العربية' },
    ru: { en: 'Russian', native: 'Русский' },
    de: { en: 'German', native: 'Deutsch' },
    es: { en: 'Spanish', native: 'Español' },
    ko: { en: 'Korean', native: '한국어' },
  };

  return names[lang]?.[displayIn] || lang;
}

/**
 * Parse URL to extract source language and translation language
 *
 * @returns Object containing sourceLanguage and translationLanguage
 */
export function parseLanguagesFromUrl(url: URL): {
  sourceLanguage: SourceLanguage;
  translationLanguage: TranslationLanguage | null;
} {
  const sourceLanguage = getSourceLanguageFromUrl(url);
  const translationLanguage = extractTranslationLanguageFromPath(url.pathname);

  return {
    sourceLanguage,
    translationLanguage,
  };
}

/**
 * Get the effective display language for content
 * If translation language is specified and different from source, use translation
 * Otherwise use source language
 */
export function getEffectiveLanguage(sourceLanguage: SourceLanguage, translationLanguage: TranslationLanguage | null): TranslationLanguage {
  if (translationLanguage && translationLanguage !== sourceLanguage) {
    return translationLanguage;
  }
  return sourceLanguage;
}

/**
 * Generate hreflang alternate URLs for an article or collection
 *
 * @param currentUrl - The current page URL
 * @param sourceLanguage - Source language of the site
 * @param availableTranslations - List of available translation languages
 * @returns Array of hreflang alternate entries
 */
export function generateHreflangAlternates(currentUrl: URL, sourceLanguage: SourceLanguage, availableTranslations: TranslationLanguage[]): Array<{ hreflang: string; href: string }> {
  const alternates: Array<{ hreflang: string; href: string }> = [];

  // Remove query and hash from URL
  const basePath = currentUrl.pathname;

  // Remove any existing language prefix from path
  const pathWithoutLang = basePath.replace(/^\/(en|zh|ja|fr|ar|ru|de|es|ko)\//, '/');

  // Source language URL (no prefix)
  const sourceUrl = `${currentUrl.origin}${pathWithoutLang}`;

  // Add x-default (points to source version)
  alternates.push({
    hreflang: 'x-default',
    href: sourceUrl,
  });

  // Add source language
  alternates.push({
    hreflang: sourceLanguage,
    href: sourceUrl,
  });

  // Add translation languages (excluding source language)
  for (const lang of availableTranslations) {
    if (lang !== sourceLanguage) {
      const translatedUrl = `${currentUrl.origin}/${lang}${pathWithoutLang}`;
      alternates.push({
        hreflang: lang,
        href: translatedUrl,
      });
    }
  }

  return alternates;
}
