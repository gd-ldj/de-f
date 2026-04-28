import type { SourceLanguage } from '@/types';

const publicEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

/**
 * Application configuration constants
 * Centralized location for all global configuration values
 */

/**
 * Site environment configuration
 * Determines which API endpoints and configurations to use
 */
export const SITE_CONFIG = {
  // Current site environment: 'beta' (local/test) or 'production'
  ENVIRONMENT: (publicEnv.PUBLIC_SITE_ENV || 'production') as 'beta' | 'production',

  // Whether this is a production deployment
  get IS_PRODUCTION() {
    return this.ENVIRONMENT === 'production';
  },

  // Get current API base URL based on environment and language
  // beta:       https://en-beta-api.detake.com
  // production: https://en-api.detake.com
  get API_BASE_URL() {
    const lang = publicEnv.PUBLIC_SOURCE_LANGUAGE || 'en';
    const prefix = this.IS_PRODUCTION ? '' : 'beta-';
    return `https://${lang}-${prefix}api.detake.com`;
  },

  // Get current SSR API base URL based on environment and language
  // beta:       https://en-beta-ssr-api.detake.com
  // production: https://en-ssr-api.detake.com
  get SSR_API_BASE_URL() {
    const lang = publicEnv.PUBLIC_SOURCE_LANGUAGE || 'en';
    const prefix = this.IS_PRODUCTION ? '' : 'beta-';
    return `https://${lang}-${prefix}ssr-api.detake.com`;
  },

  // Get current site URL based on environment and language
  // beta:       https://beta.detake.com
  // production: https://{lang}.detake.com
  get SITE_URL() {
    const lang = publicEnv.PUBLIC_SOURCE_LANGUAGE || 'en';
    if (!this.IS_PRODUCTION) {
      return 'https://beta.detake.com';
    }
    return `https://${lang}.detake.com`;
  },
} as const;

export const IS_DEV_ENV = ['development', 'dev'].includes((publicEnv.MODE || process.env.NODE_ENV || '').toLowerCase());

/**
 * Multi-source site configuration
 * Determines the source language of the current site based on domain or environment
 */
export const MULTI_SOURCE_CONFIG = {
  // Source language from environment variable (fallback to 'en')
  SOURCE_LANGUAGE: (publicEnv.PUBLIC_SOURCE_LANGUAGE as SourceLanguage) || 'en',

  // Supported source languages and their domain patterns
  // Matches all environments: production (.com), beta (.dev), and alternative (.news)
  SOURCE_LANGUAGE_DOMAINS: {
    en: [
      // Production
      'en.detake.com', 'detake.com',
      // Beta/Dev
      'en.dev.detake.com', 'dev.detake.com',
      'en.beta.detake.com', 'beta.detake.com',
      // Alternative domains
      'en.detake.news', 'detake.news',
    ],
    zh: [
      // Production
      'zh.detake.com',
      // Beta/Dev
      'zh.dev.detake.com', 'zh.beta.detake.com',
      // Alternative domains
      'zh.detake.news',
    ],
    ja: [
      // Production
      'ja.detake.com',
      // Beta/Dev
      'ja.dev.detake.com', 'ja.beta.detake.com',
      // Alternative domains
      'ja.detake.news',
    ],
  } as Record<SourceLanguage, string[]>,

  // Language to locale mapping
  LANGUAGE_TO_LOCALE_MAP: {
    en: 'en',
    zh: 'zh',
    ja: 'ja',
  } as Record<SourceLanguage, 'en' | 'zh' | 'ja'>,

  // Locale to language mapping
  LOCALE_TO_LANGUAGE_MAP: {
    en: 'en',
    zh: 'zh',
    ja: 'ja',
  } as Record<'en' | 'zh' | 'ja', SourceLanguage>,

  /**
   * Get source language from hostname
   * IMPORTANT: Always determines language from domain, never from cookies/localStorage
   * @param hostname - The hostname to check (e.g., 'ja.dev.detake.com', 'ja.detake.com')
   * @returns The detected source language or default from environment
   */
  getSourceLanguageFromDomain(hostname: string): SourceLanguage {
    // Normalize hostname (remove port if present)
    const normalizedHostname = hostname.split(':')[0].toLowerCase();

    // First, check for exact domain match in configuration
    for (const [lang, domains] of Object.entries(this.SOURCE_LANGUAGE_DOMAINS)) {
      if (domains.includes(normalizedHostname)) {
        return lang as SourceLanguage;
      }
    }

    // Second, check for language subdomain pattern at the start
    // Matches: en.*, zh.*, ja.* (regardless of what follows)
    const subdomainMatch = normalizedHostname.match(/^(en|zh|ja)\./);
    if (subdomainMatch) {
      return subdomainMatch[1] as SourceLanguage;
    }

    // Third, check if hostname contains detake.com/detake.news without language prefix
    // These default to 'en'
    if (
      normalizedHostname === 'detake.com' ||
      normalizedHostname === 'detake.news' ||
      normalizedHostname === 'dev.detake.com' ||
      normalizedHostname === 'beta.detake.com' ||
      normalizedHostname.endsWith('.detake.com') ||
      normalizedHostname.endsWith('.detake.news')
    ) {
      return 'en';
    }

    // Fallback to environment variable or default
    return this.SOURCE_LANGUAGE;
  },

  /**
   * Convert source language to locale
   * @param language - Source language code
   * @returns Legacy locale code
   */
  languageToLocale(language: SourceLanguage): 'en' | 'zh' | 'ja' {
    return this.LANGUAGE_TO_LOCALE_MAP[language] || 'en';
  },

  /**
   * Convert locale to source language
   * @param locale - Locale code
   * @returns Source language code
   */
  localeToLanguage(locale: 'en' | 'zh' | 'ja'): SourceLanguage {
    return this.LOCALE_TO_LANGUAGE_MAP[locale] || 'en';
  },
} as const;

/**
 * Default promote code used throughout the application
 * This value is used as fallback when no user-specific promote code is available
 */
export const DEFAULT_PROMOTE_CODE = 'xG0zT';

/**
 * Authentication related constants
 */
export const AUTH_CONFIG = {
  // Clerk initialization timeout (5 seconds)
  CLERK_TIMEOUT_MS: 5000,
} as const;

/**
 * LocalStorage keys used throughout the application
 */
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  ACCESS_TOKEN: 'access_token',
  USER_ID: 'user_id',
  PROMOTE_CODE: 'promote_code',
  VISITOR_ID: 'visitor_id',
  GA_CLIENT_ID: 'ga_client_id',
  USER_BEHAVIOR_DATA: 'user_behavior_data',
  SOURCE_LANGUAGE: 'source_language',
} as const;

// Derive Sentry environment label from SITE_CONFIG
export const DEPLOY_ENVIRONMENT = SITE_CONFIG.IS_PRODUCTION ? 'production' : 'preview';

/**
 * Analytics and tracking configuration
 *
 * GA_MEASUREMENT_ID and CLOUDFLARE_ANALYTICS_TOKEN are hardcoded.
 * Both beta and production share the same values.
 */
export const ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: 'G-ZEDPYG3TE4',
  CLOUDFLARE_ANALYTICS_TOKEN: 'jlpZdddOes4MHKwbLG6iTfzF48YFxZRxo3zkYHv6',

  // Behavior tracking intervals
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  SCROLL_THROTTLE: 500, // 500ms
  CLICK_DEBOUNCE: 300, // 300ms

  // Data collection limits
  MAX_EVENTS_QUEUE: 100,
  BATCH_SEND_INTERVAL: 60000, // 1 minute
} as const;

/**
 * Event types for user behavior tracking
 */
export const TRACKING_EVENTS = {
  PAGE_VIEW: 'page_view',
  ARTICLE_VIEW: 'article_view',
  ARTICLE_SHARE: 'article_share',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  CLICK_EVENT: 'click_event',
  SEARCH_EVENT: 'search_event',
  USER_ENGAGEMENT: 'user_engagement',
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  // Custom UI click events
  HEADER_USER_BUTTON_CLICK: 'header_user_button_click',
  WALLET_BUTTON_CLICK: 'wallet_button_click',
} as const;
