import { atom } from 'jotai'
import type { User, Locale, WalletLoginData } from '../types'
import { DEFAULT_PROMOTE_CODE, STORAGE_KEYS } from '../config/constants'

/**
 * Current locale atom
 */
export const localeAtom = atom<Locale>('us')

/**
 * User authentication state atom
 */
export const userAtom = atom<User | null>(null)

/**
 * Loading state atom
 */
export const loadingAtom = atom<boolean>(false)

/**
 * Theme atom for dark/light mode
 */
export const themeAtom = atom<'light' | 'dark'>('light')

/**
 * Navigation menu open state
 */
export const mobileMenuOpenAtom = atom<boolean>(false)

/**
 * Search query atom
 */
export const searchQueryAtom = atom<string>('')

/**
 * Articles cache atom
 */
export const articlesCacheAtom = atom<Record<string, any>>({})

/**
 * Wallet address atom for cross-component synchronization
 * Stores the current wallet address from localStorage
 */
export const walletAddressAtom = atom<string | null>(null)

/**
 * Derived atom for wallet address with localStorage persistence
 * Automatically syncs with localStorage when the value changes
 * SSR-compatible with localStorage availability check
 */
export const persistedWalletAddressAtom = atom(
  (get) => get(walletAddressAtom),
  (get, set, newValue: string | null) => {
    set(walletAddressAtom, newValue)
    if (typeof window !== 'undefined') {
      if (newValue) {
        localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, newValue)
      } else {
        localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
      }
    }
  }
)

/**
 * Wallet authentication data atom
 * Stores the complete authentication information after wallet login
 */
export const walletAuthDataAtom = atom<WalletLoginData | null>(null)

/**
 * Access token atom with localStorage persistence
 * Automatically syncs access token with localStorage
 */
export const accessTokenAtom = atom<string | null>(null)

/**
 * Derived atom for access token with localStorage persistence
 * SSR-compatible with localStorage availability check
 */
export const persistedAccessTokenAtom = atom(
  (get) => get(accessTokenAtom),
  (get, set, newValue: string | null) => {
    set(accessTokenAtom, newValue)
    if (typeof window !== 'undefined') {
      if (newValue) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newValue)
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      }
    }
  }
)



/**
 * Derived atom for complete wallet auth data with localStorage persistence
 * Automatically syncs all authentication data with localStorage
 * SSR-compatible with localStorage availability check
 */
export const persistedWalletAuthDataAtom = atom(
  (get) => get(walletAuthDataAtom),
  (get, set, newValue: WalletLoginData | null) => {
    set(walletAuthDataAtom, newValue)
    if (typeof window !== 'undefined') {
      if (newValue) {
        // Store all auth data in localStorage
        localStorage.setItem(STORAGE_KEYS.WALLET_AUTH_DATA, JSON.stringify(newValue))
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newValue.accessToken)
        localStorage.setItem(STORAGE_KEYS.USER_ID, newValue.userId)
        
        // Update individual atoms
        set(accessTokenAtom, newValue.accessToken)
      } else {
        // Clear all auth data from localStorage
        localStorage.removeItem(STORAGE_KEYS.WALLET_AUTH_DATA)
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER_ID)
        
        // Clear individual atoms
        set(accessTokenAtom, null)
      }
    } else {
      // In SSR environment, only update atoms without localStorage
      if (newValue) {
        set(accessTokenAtom, newValue.accessToken)
      } else {
        set(accessTokenAtom, null)
      }
    }
  }
)

/**
 * User ID atom
 */
export const userIdAtom = atom<string | null>(null)

/**
 * Promote code atom with default value
 * Stores the promote code, defaults to system default value
 */
export const promoteCodeAtom = atom<string>(DEFAULT_PROMOTE_CODE)

/**
 * Derived atom for promote code with localStorage persistence
 * Automatically syncs promote code with localStorage
 * Falls back to default value if no stored value exists
 * SSR-compatible with localStorage availability check
 */
export const persistedPromoteCodeAtom = atom(
  (get) => {
    const currentValue = get(promoteCodeAtom)
    // Try to get from localStorage first, then cookies in browser environment
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(STORAGE_KEYS.PROMOTE_CODE)
      if (storedValue) {
        return storedValue
      }
      
      // Fallback to reading from cookies
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${STORAGE_KEYS.PROMOTE_CODE}=`))
        ?.split('=')[1]
      
      if (cookieValue) {
        // Sync cookie value to localStorage
        localStorage.setItem(STORAGE_KEYS.PROMOTE_CODE, cookieValue)
        return cookieValue
      }
      
      // If no stored value exists, initialize both localStorage and cookie with default value
      localStorage.setItem(STORAGE_KEYS.PROMOTE_CODE, currentValue)
      document.cookie = `${STORAGE_KEYS.PROMOTE_CODE}=${currentValue}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      return currentValue
    }
    return currentValue
  },
  (get, set, newValue: string) => {
    set(promoteCodeAtom, newValue)
    if (typeof window !== 'undefined') {
      // Store in localStorage for client-side persistence
      localStorage.setItem(STORAGE_KEYS.PROMOTE_CODE, newValue)
      
      // Also set cookie for SSR compatibility
      document.cookie = `${STORAGE_KEYS.PROMOTE_CODE}=${newValue}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      
      // Trigger custom event for manual promoteCode changes
      // This works with the global ArticleLink management script in BaseLayout
      try {
        window.dispatchEvent(new CustomEvent('promoteCodeChanged', {
          detail: { newValue, timestamp: Date.now() }
        }))
      } catch (error) {
        console.warn('[Store] Failed to dispatch promoteCodeChanged event:', error)
      }
    }
  }
)

/**
 * Authentication status derived atom
 * Returns true if user has valid access token and user ID
 */
export const isAuthenticatedAtom = atom(
  (get) => {
    const accessToken = get(accessTokenAtom)
    const userId = get(userIdAtom)
    return !!(accessToken && userId)
  }
)