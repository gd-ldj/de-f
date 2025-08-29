/**
 * Application configuration constants
 * Centralized location for all global configuration values
 */

/**
 * Default promote code used throughout the application
 * This value is used as fallback when no user-specific promote code is available
 */
export const DEFAULT_PROMOTE_CODE = 'xG0zT'

/**
 * Authentication related constants
 */
export const AUTH_CONFIG = {
  // Privy initialization timeout (5 seconds)
  PRIVY_TIMEOUT_MS: 5000,
} as const

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
} as const

/**
 * Analytics and tracking configuration
 */
export const ANALYTICS_CONFIG = {
  // Google Analytics configuration
  GA_MEASUREMENT_ID: import.meta.env.PUBLIC_GA_MEASUREMENT_ID,
  
  
  // Cloudflare Analytics token
  CLOUDFLARE_ANALYTICS_TOKEN: import.meta.env.PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN,
  
  // Behavior tracking intervals
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  SCROLL_THROTTLE: 500, // 500ms
  CLICK_DEBOUNCE: 300, // 300ms
  
  // Data collection limits
  MAX_EVENTS_QUEUE: 100,
  BATCH_SEND_INTERVAL: 60000, // 1 minute
} as const

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
} as const