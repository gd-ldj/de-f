import type { Locale, SourceLanguage } from '@/types';

// Import translation files for multi-source architecture
import enTranslations from '../../public/locales/en/translation.json';
import zhTranslations from '../../public/locales/zh/translation.json';
import jaTranslations from '../../public/locales/ja/translation.json';

/**
 * Translation data type
 */
interface TranslationData {
  [key: string]: string | TranslationData;
}

/**
 * Available translations (source language based)
 */
const languageTranslations: Record<SourceLanguage, TranslationData> = {
  en: enTranslations as TranslationData,
  zh: zhTranslations as TranslationData,
  ja: jaTranslations as TranslationData,
};

/**
 * Available translations (locale-based)
 */
const translations: Record<Locale, TranslationData> = {
  en: enTranslations as TranslationData,
  zh: zhTranslations as TranslationData,
  ja: jaTranslations as TranslationData,
};

/**
 * Get translation value by key path
 */
const getNestedValue = (obj: TranslationData, path: string): string => {
  const keys = path.split('.');
  let value: any = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof value === 'string' ? value : path;
};

/**
 * Translation function - main API for getting translated text
 * @param locale - Current locale ('en' | 'zh' | 'ja')
 * @param key - Translation key (e.g., 'common.filters', 'article.aboutAuthor')
 * @param fallback - Optional fallback text if translation not found
 * @returns Translated text
 */
export const t = (locale: Locale, key: string, fallback?: string): string => {
  const localeData = translations[locale] || translations.en;
  const translatedValue = getNestedValue(localeData, key);

  // If translation found, return it
  if (translatedValue !== key) {
    return translatedValue;
  }

  // Try fallback locale (en) if current locale failed
  if (locale !== 'en') {
    const fallbackValue = getNestedValue(translations.en, key);
    if (fallbackValue !== key) {
      return fallbackValue;
    }
  }

  // Return provided fallback or the key itself
  return fallback || key;
};

/**
 * Hook for React components to use translations
 * @param locale - Current locale
 * @returns Translation function bound to the locale
 */
export const useTranslation = (locale: Locale) => {
  return {
    t: (key: string, fallback?: string) => t(locale, key, fallback),
  };
};

/**
 * Create a translation function bound to a specific locale
 * This is useful for components that want to avoid passing locale repeatedly
 * @param locale - Current locale
 * @returns Translation function that only requires the key
 */
export const createTranslator = (locale: Locale) => {
  return (key: string, fallback?: string) => t(locale, key, fallback);
};

/**
 * Translation function for source language (new multi-source architecture)
 * @param language - Source language ('en' | 'zh' | 'ja')
 * @param key - Translation key
 * @param fallback - Optional fallback text
 * @returns Translated text
 */
export const tl = (language: SourceLanguage, key: string, fallback?: string): string => {
  const languageData = languageTranslations[language] || languageTranslations.en;
  const translatedValue = getNestedValue(languageData, key);

  // If translation found, return it
  if (translatedValue !== key) {
    return translatedValue;
  }

  // Try fallback language (en) if current language failed
  if (language !== 'en') {
    const fallbackValue = getNestedValue(languageTranslations.en, key);
    if (fallbackValue !== key) {
      return fallbackValue;
    }
  }

  // Return provided fallback or the key itself
  return fallback || key;
};

/**
 * Hook for React components to use translations with source language
 * @param language - Source language
 * @returns Translation function bound to the language
 */
export const useLanguageTranslation = (language: SourceLanguage) => {
  return {
    t: (key: string, fallback?: string) => tl(language, key, fallback),
  };
};

/**
 * Create a translation function bound to a specific source language
 * @param language - Source language
 * @returns Translation function that only requires the key
 */
export const createLanguageTranslator = (language: SourceLanguage) => {
  return (key: string, fallback?: string) => tl(language, key, fallback);
};
