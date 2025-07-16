import { atom } from 'jotai'
import type { User, Locale, WalletLoginData } from '../types'

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
 */
export const persistedWalletAddressAtom = atom(
  (get) => get(walletAddressAtom),
  (get, set, newValue: string | null) => {
    set(walletAddressAtom, newValue)
    if (newValue) {
      localStorage.setItem('wallet_address', newValue)
    } else {
      localStorage.removeItem('wallet_address')
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
 * Refresh token atom with localStorage persistence
 * Automatically syncs refresh token with localStorage
 */
export const refreshTokenAtom = atom<string | null>(null)

/**
 * Derived atom for access token with localStorage persistence
 */
export const persistedAccessTokenAtom = atom(
  (get) => get(accessTokenAtom),
  (get, set, newValue: string | null) => {
    set(accessTokenAtom, newValue)
    if (newValue) {
      localStorage.setItem('access_token', newValue)
    } else {
      localStorage.removeItem('access_token')
    }
  }
)

/**
 * Derived atom for refresh token with localStorage persistence
 */
export const persistedRefreshTokenAtom = atom(
  (get) => get(refreshTokenAtom),
  (get, set, newValue: string | null) => {
    set(refreshTokenAtom, newValue)
    if (newValue) {
      localStorage.setItem('refresh_token', newValue)
    } else {
      localStorage.removeItem('refresh_token')
    }
  }
)

/**
 * Derived atom for complete wallet auth data with localStorage persistence
 * Automatically syncs all authentication data with localStorage
 */
export const persistedWalletAuthDataAtom = atom(
  (get) => get(walletAuthDataAtom),
  (get, set, newValue: WalletLoginData | null) => {
    set(walletAuthDataAtom, newValue)
    if (newValue) {
      // Store all auth data in localStorage
      localStorage.setItem('wallet_auth_data', JSON.stringify(newValue))
      localStorage.setItem('access_token', newValue.accessToken)
      localStorage.setItem('refresh_token', newValue.refreshToken)
      localStorage.setItem('user_id', newValue.userId)
      
      // Update individual atoms
      set(accessTokenAtom, newValue.accessToken)
      set(refreshTokenAtom, newValue.refreshToken)
    } else {
      // Clear all auth data from localStorage
      localStorage.removeItem('wallet_auth_data')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
      
      // Clear individual atoms
      set(accessTokenAtom, null)
      set(refreshTokenAtom, null)
    }
  }
)

/**
 * User ID atom
 */
export const userIdAtom = atom<string | null>(null)

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