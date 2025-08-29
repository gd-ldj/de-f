import type { Locale } from '@/types';

// Import translation JSON files directly
import translationUS from '../../public/locales/us/translation.json';
import translationAsia from '../../public/locales/asia/translation.json';

const translations = {
  us: translationUS,
  asia: translationAsia,
};

/**
 * Get a translated string by key and locale
 */
export function getTranslation(locale: Locale, key: string): string {
  const translation = translations[locale] || translations.us;
  
  // Handle nested keys like 'common.latest'
  const keys = key.split('.');
  let value: any = translation;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to showing the key if translation not found
      console.warn(`Translation not found: ${key} for locale ${locale}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Get all translations for a locale
 */
export function getTranslations(locale: Locale): any {
  return translations[locale] || translations.us;
}