/**
 * Authentication Manager
 * Handles user authentication, logout, and token management
 * Moved from inline scripts to improve security and maintainability
 */

// Configuration constants
const AUTH_CONFIG = {
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    USER_ID: 'user_id',
    WALLET_ADDRESS: 'wallet_address',
    PROMOTE_CODE: 'promote_code',
    IS_WHITELIST: 'isWhitelist'
  },
  URL_PARAMS: {
    LOGOUT: 'ac=q'
  },
  WALLET_PREFIXES: {
    CLERK: 'clerk:',
    APPKIT: '@appkit/'
  }
};

/**
 * Clear all authentication-related data from localStorage
 * @param {boolean} includeWalletData - Whether to clear wallet connection data
 */
function clearAuthData(includeWalletData = true) {
  try {
    // Clear basic auth data
    Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    if (includeWalletData) {
      // Clear Clerk auth data
      const clerkKeys = Object.keys(localStorage).filter(key =>
        key.startsWith(AUTH_CONFIG.WALLET_PREFIXES.CLERK) || key.startsWith('__clerk')
      );
      clerkKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear AppKit wallet connection data
      const appkitKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(AUTH_CONFIG.WALLET_PREFIXES.APPKIT)
      );
      appkitKeys.forEach(key => localStorage.removeItem(key));
    }

    console.log('[AuthManager] Cleared authentication data');
  } catch (error) {
    console.error('[AuthManager] Failed to clear auth data:', error);
  }
}

/**
 * Set default authentication data (for development/testing)
 * WARNING: This should be removed in production
 */
function setDefaultAuthData() {
  try {
    // TODO: Remove this in production - only for development
    const defaultData = {
      [AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NCIsInJhbmRvbSI6IjExYWE0M2YyYjc0MmQxMTA1MDliZjAxZjZiMmJlMGU2ZmI1NzM3M2QyOGUwN2EzMzQ3ZTlhYTM0Y2RlZWMyNmUiLCJpYXQiOjE3NTY3OTMxMzV9.udTD7XBX3xWMHWC0mPdgATnu46QX3gpjgBM5v5EtzTI',
      [AUTH_CONFIG.STORAGE_KEYS.USER_ID]: '74',
      [AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS]: '4dtHnaQzb1cR6HHoXkhkCQ6Du7GsePy7KwgfitGdzwHF',
      [AUTH_CONFIG.STORAGE_KEYS.PROMOTE_CODE]: 'cjh7vWEC'
    };

    Object.entries(defaultData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('[AuthManager] Set default auth data (development only)');
  } catch (error) {
    console.error('[AuthManager] Failed to set default auth data:', error);
  }
}

/**
 * Handle logout based on URL parameters
 */
function handleLogoutFromURL() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const acParam = urlParams.get('ac');
    
    // Check if logout parameter exists
    if (acParam === 'q') {
      clearAuthData(true);

      // Signal ClerkApiTokenSync to also sign out from Clerk
      // (auth-manager.js runs before React hydration, so we pass intent via sessionStorage)
      sessionStorage.setItem('force_clerk_logout', '1');

      // Remove the logout parameter from URL
      urlParams.delete('ac');
      const newUrl = window.location.pathname +
        (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);

      console.log('[AuthManager] Logout completed via URL parameter');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[AuthManager] Failed to handle logout from URL:', error);
    return false;
  }
}

/**
 * Check if current environment is beta site
 * @returns {boolean} True if running on beta environment
 */
function isBetaEnvironment() {
  try {
    // Use environment variable to determine if this is beta/development environment
    // const siteEnv = import.meta.env.PUBLIC_SITE_ENV;
    // return siteEnv === 'beta';
    const hostname = window.location.hostname;
      return hostname.includes('beta')
  } catch (error) {
    console.error('[AuthManager] Failed to detect environment:', error);
  }
}

/**
 * Initialize authentication manager
 */
function initializeAuthManager() {
  console.log('[AuthManager] Initializing authentication manager');
  
  // Handle logout from URL parameter first
  const loggedOut = handleLogoutFromURL();
  
  if (!loggedOut && isBetaEnvironment()) {
    // Set default auth data only for beta/development environments
    setDefaultAuthData();
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid authentication
 */
function isAuthenticated() {
  try {
    const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    const userId = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_ID);
    return !!(token && userId);
  } catch (error) {
    console.error('[AuthManager] Failed to check authentication:', error);
    return false;
  }
}

/**
 * Get current user data
 * @returns {Object|null} User data object or null if not authenticated
 */
function getCurrentUser() {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    return {
      token: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN),
      userId: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_ID),
      walletAddress: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS),
      promoteCode: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.PROMOTE_CODE)
    };
  } catch (error) {
    console.error('[AuthManager] Failed to get current user:', error);
    return null;
  }
}

// Export functions for use in other modules
window.AuthManager = {
  initialize: initializeAuthManager,
  clearAuthData,
  setDefaultAuthData,
  handleLogoutFromURL,
  isAuthenticated,
  getCurrentUser,
  isBetaEnvironment,
  AUTH_CONFIG,
};

// Auto-initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuthManager);
} else {
  initializeAuthManager();
}