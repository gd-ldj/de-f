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
  // Token refresh buffer time (5 minutes before expiration)
  TOKEN_REFRESH_BUFFER_MS: 5 * 60 * 1000,
  
  // Privy initialization timeout (5 seconds)
  PRIVY_TIMEOUT_MS: 5000,
} as const

/**
 * LocalStorage keys used throughout the application
 */
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  WALLET_AUTH_DATA: 'wallet_auth_data',
  USER_ID: 'user_id',
  PROMOTE_CODE: 'promote_code',
} as const