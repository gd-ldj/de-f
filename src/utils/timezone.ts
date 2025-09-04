/**
 * Timezone management utilities for SSR and client-side rendering
 * Handles default timezone (America/New_York) for SSR and user timezone for client
 */

// Default timezone for server-side rendering
export const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Format date with timezone support
 * @param dateString - ISO date string or Date object
 * @param locale - Locale for formatting ('asia' or 'us')
 * @param timezone - Target timezone (defaults to DEFAULT_TIMEZONE for SSR)
 * @param isClient - Whether this is running on client side
 * @returns Formatted date string
 */
export function formatDateWithTimezone(dateString: string | Date, locale: 'asia' | 'us' = 'us', timezone: string = DEFAULT_TIMEZONE, isClient: boolean = false): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      console.warn('[Timezone] Invalid date:', dateString);
      return String(dateString);
    }

    // Determine locale string based on region
    const localeString = locale === 'asia' ? 'zh-CN' : 'en-US';

    // Format options
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      //   hour: '2-digit',
      //   minute: '2-digit',
      //   hour12: locale === 'us'
    };

    return new Intl.DateTimeFormat(localeString, options).format(date);
  } catch (error) {
    console.warn('[Timezone] Format error:', error);
    return String(dateString);
  }
}

/**
 * Get user's timezone from browser
 * @returns User's timezone string
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('[Timezone] Failed to get user timezone:', error);
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Check if user's timezone is different from default
 * @param userTimezone - User's timezone (optional, will detect if not provided)
 * @returns True if different from default timezone
 */
export function isTimezoneDifferent(userTimezone?: string): boolean {
  const timezone = userTimezone || getUserTimezone();
  return timezone !== DEFAULT_TIMEZONE;
}

/**
 * Format date for server-side rendering with default timezone
 * @param dateString - ISO date string or Date object
 * @param locale - Locale for formatting
 * @returns Formatted date string with default timezone
 */
export function formatDateSSR(dateString: string | Date, locale: 'asia' | 'us' = 'us'): string {
  return formatDateWithTimezone(dateString, locale, DEFAULT_TIMEZONE, false);
}

/**
 * Format date for client-side rendering with user's timezone
 * @param dateString - ISO date string or Date object
 * @param locale - Locale for formatting
 * @param userTimezone - User's timezone (optional, will detect if not provided)
 * @returns Formatted date string with user's timezone
 */
export function formatDateClient(dateString: string | Date, locale: 'asia' | 'us' = 'us', userTimezone?: string): string {
  const timezone = userTimezone || getUserTimezone();
  return formatDateWithTimezone(dateString, locale, timezone, true);
}

/**
 * Create a data attribute for client-side timezone conversion
 * @param dateString - ISO date string or Date object
 * @returns Object with formatted date and data attributes
 */
export function createTimezoneData(dateString: string | Date, locale: 'asia' | 'us' = 'us') {
  const isoString = typeof dateString === 'string' ? dateString : dateString.toISOString();

  return {
    // Server-side formatted date with default timezone
    formattedDate: formatDateSSR(dateString, locale),
    // Data attributes for client-side conversion
    dataAttributes: {
      'data-date': isoString,
      'data-locale': locale,
    },
  };
}

/**
 * Update all timezone-aware elements on the page
 * This function runs on the client side to convert dates to user's timezone
 */
export function updatePageTimezones(): void {
  // Only run on client side
  if (typeof window === 'undefined') return;

  const userTimezone = getUserTimezone();

  // Only update if user's timezone is different from default
  if (!isTimezoneDifferent(userTimezone)) {
    return;
  }

  // Find all elements with data-date attribute
  const dateElements = document.querySelectorAll('[data-date]');

  dateElements.forEach((element) => {
    const dateString = element.getAttribute('data-date');
    const locale = (element.getAttribute('data-locale') as 'asia' | 'us') || 'us';

    if (dateString) {
      try {
        const formattedDate = formatDateClient(dateString, locale, userTimezone);
        element.textContent = formattedDate;
      } catch (error) {
        console.warn('[Timezone] Failed to update element date:', dateString, error);
      }
    }
  });
}

/**
 * Initialize timezone management on page load
 * This should be called in the global layout
 */
export function initializeTimezoneManagement(): void {
  if (typeof window === 'undefined') return;

  // Run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePageTimezones);
  } else {
    updatePageTimezones();
  }
}
