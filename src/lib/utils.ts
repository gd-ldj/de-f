import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEFAULT_PROMOTE_CODE, STORAGE_KEYS } from '@/config/constants'

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @param locale - Locale for formatting
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Generate article URL with locale and promote code
 * @param slug - Article slug
 * @param locale - Current locale
 * @param promoteCode - Optional promote code, will use default if not provided
 * @returns Article URL with promote code parameter
 */
export const getArticleUrl = (slug: string, locale: string, promoteCode?: string) => {
  // Use provided promote code or default
  const finalPromoteCode = promoteCode || DEFAULT_PROMOTE_CODE
  return `/${locale}/news/${slug}-${finalPromoteCode}`
}

/**
 * Get locale from URL path
 * @param pathname - Current pathname
 * @returns Extracted locale
 */
export function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/')
  return segments[1] || 'us'
}

export const shortenAddress = (
  address: string,
  start?: number,
  end?: number
) => {
  if (address?.length <= 11) {
    return address
  }
  return `${address.slice(0, start || 6)}...${address.slice(-(end || 4))}`
}

export function shortenEmail(email: string, startLength: number): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email
  }

  if (startLength < 0) {
    startLength = 0
  }

  const [username, domain] = email.split('@')

  if (username.length <= startLength) {
    return email
  }

  const shortenedUsername = username.slice(0, startLength || 5) + '...'

  return `${shortenedUsername}@${domain}`
}

/**
 * Handle logout logic when URL contains ac=q parameter
 * Clears all authentication-related localStorage data
 * @returns boolean - true if logout was triggered, false otherwise
 */
export function handleLogoutFromURL(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const acParam = urlParams.get('ac');
    
    // Check if ac=q parameter exists
    if (acParam === 'q') {
      // Clear all authentication-related localStorage data
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.PROMOTE_CODE);
      
      // Clear Privy wallet plugin data
      const privyKeys = Object.keys(localStorage).filter(key => key.startsWith('privy:'));
      privyKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear AppKit wallet connection data
      const appkitKeys = Object.keys(localStorage).filter(key => key.startsWith('@appkit/'));
      appkitKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear other wallet-related data
      localStorage.removeItem('isWhitelist');
      
      // Optional: Clear other user-related data
      // localStorage.removeItem(STORAGE_KEYS.VISITOR_ID);
      // localStorage.removeItem(STORAGE_KEYS.GA_CLIENT_ID);
      // localStorage.removeItem(STORAGE_KEYS.USER_BEHAVIOR_DATA);
      
      console.log('[Logout] Cleared authentication data due to ac=q parameter');
      
      // Remove the ac parameter from URL to clean up
      urlParams.delete('ac');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Logout] Error handling logout from URL:', error);
    return false;
  }
}