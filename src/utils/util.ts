/**
 * Format date string according to specified locale
 * @param isoString - ISO date string or Date object
 * @param locale - Language locale ('en' or 'zh')
 * @returns Formatted date string
 */
export function formatDate(isoString: string, locale = 'us') {
  const localeMap = {
    us: 'en-US',
    asia: 'zh-CN',
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
export function formatRelativeTime(isoString: string, locale = 'us'): string {
  const dateObj = typeof isoString === 'string' ? new Date(isoString) : isoString;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  // if (locale === 'asia') {
  //   if (diffInHours < 1) {
  //     return diffInMinutes <= 0 ? '刚刚' : `${diffInMinutes}分钟前`;
  //   } else if (diffInHours < 24) {
  //     return `${diffInHours}小时前`;
  //   } else {
  //     const diffInDays = Math.floor(diffInHours / 24);
  //     return `${diffInDays}天前`;
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
