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

export function getArticleCategoryNames(article: Record<string, any>): string[] {
  if (Array.isArray(article?.category_names) && article.category_names.length > 0) {
    return article.category_names;
  }
  if (article?.category_name) {
    return [article.category_name];
  }
  return [];
}

export function getArticleSubcategoryNames(article: Record<string, any>): string[] {
  if (Array.isArray(article?.subcategory_names) && article.subcategory_names.length > 0) {
    return article.subcategory_names;
  }
  if (article?.category_name) {
    return [article.category_name];
  }
  return [];
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
