import { atom } from 'jotai'
import type { User, Locale } from '../types'

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