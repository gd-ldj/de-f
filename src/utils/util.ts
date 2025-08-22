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
  };
  
  const dateObj = typeof isoString === 'string' ? new Date(isoString) : isoString;
  const targetLocale = localeMap[locale as keyof typeof localeMap] || 'en-US';
  
  // Use Intl.DateTimeFormat for more reliable locale-specific formatting
  return new Intl.DateTimeFormat(targetLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}
