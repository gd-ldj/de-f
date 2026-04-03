import { atom } from 'jotai'
import type { User, Locale, WalletLoginData } from '../types'
import { DEFAULT_PROMOTE_CODE, STORAGE_KEYS } from '../config/constants'

/**
 * Current locale atom
 */
export const localeAtom = atom<Locale>('en')

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
 * Helper function to handle authentication data updates
 * Updates both access token and user ID atoms and localStorage
 */
const updateAuthData = (set: any, accessToken: string | null, userId: string | null) => {
  set(accessTokenAtom, accessToken)
  set(userIdAtom, userId)
  
  if (typeof window !== 'undefined') {
    if (accessToken && userId) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_ID)
    }
  }
}

/**
 * Combined auth data setter for wallet login
 * Updates both access token and user ID simultaneously
 */
export const setWalletAuthDataAtom = atom(
  null,
  (get, set, newValue: WalletLoginData | null) => {
    if (newValue) {
      updateAuthData(set, newValue.access_token, newValue.user_id)
    } else {
      updateAuthData(set, null, null)
    }
  }
)

/**
 * User ID atom (internal)
 */
const userIdBaseAtom = atom<string | null>(null)

/**
 * User ID atom with localStorage persistence
 * Automatically syncs user_id with localStorage
 */
export const userIdAtom = atom(
  (get) => get(userIdBaseAtom),
  (get, set, newValue: string | null) => {
    set(userIdBaseAtom, newValue)
    if (typeof window !== 'undefined') {
      if (newValue) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, newValue)
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER_ID)
      }
    }
  }
)

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

      // Fallback to anonymous fingerprint-based promote code
      const anonCode = localStorage.getItem('anonymous_promote_code')
      if (anonCode) {
        localStorage.setItem(STORAGE_KEYS.PROMOTE_CODE, anonCode)
        document.cookie = `${STORAGE_KEYS.PROMOTE_CODE}=${anonCode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
        return anonCode
      }

      // Final fallback: use default value
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
