import type { Locale } from '@/types';

// Import translation files directly from src (avoid importing from public)
import usTranslations from '../../public/locales/us/translation.json';
import asiaTranslations from '../../public/locales/asia/translation.json';

/**
 * Translation data type
 */
interface TranslationData {
  [key: string]: string | TranslationData;
}

/**
 * Available translations
 */
const translations: Record<Locale, TranslationData> = {
  us: usTranslations as TranslationData,
  asia: asiaTranslations as TranslationData,
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
 * @param locale - Current locale ('us' | 'asia')
 * @param key - Translation key (e.g., 'common.filters', 'article.aboutAuthor')
 * @param fallback - Optional fallback text if translation not found
 * @returns Translated text
 */
export const t = (locale: Locale, key: string, fallback?: string): string => {
  const localeData = translations[locale] || translations.us;
  const translatedValue = getNestedValue(localeData, key);

  // If translation found, return it
  if (translatedValue !== key) {
    return translatedValue;
  }

  // Try fallback locale (us) if current locale failed
  if (locale !== 'us') {
    const fallbackValue = getNestedValue(translations.us, key);
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
