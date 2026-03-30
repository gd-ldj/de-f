import { useAtom } from 'jotai'
import { useCallback } from 'react'
import {
  persistedAccessTokenAtom,
  userIdAtom,
  persistedWalletAddressAtom,
  persistedPromoteCodeAtom,
  isAuthenticatedAtom,
  setWalletAuthDataAtom,
} from '../stores'
import { DEFAULT_PROMOTE_CODE } from '../config/constants'

/**
 * Simplified wallet auth hook
 * Only reads Jotai auth state and provides utility methods.
 * Actual authentication is handled by ClerkApiTokenSync.
 */
export const useWalletAuth = () => {
  const [, setWalletAuthData] = useAtom(setWalletAuthDataAtom)
  const [accessToken, setAccessToken] = useAtom(persistedAccessTokenAtom)
  const [userId, setUserId] = useAtom(userIdAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [walletAddress, setWalletAddress] = useAtom(persistedWalletAddressAtom)
  const [, setPromoteCode] = useAtom(persistedPromoteCodeAtom)

  /**
   * Clear all authentication state
   */
  const clearAuthState = useCallback(() => {
    setWalletAuthData(null)
    setAccessToken(null)
    setUserId(null)
    setWalletAddress(null)
    setPromoteCode(DEFAULT_PROMOTE_CODE)
  }, [setWalletAuthData, setAccessToken, setUserId, setWalletAddress, setPromoteCode])

  /**
   * Get valid access token
   */
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    return accessToken
  }, [accessToken])

  return {
    isAuthenticated,
    isLoading: false,
    error: null,
    accessToken,
    userId,
    walletAddress,

    clearError: () => {},
    getValidAccessToken,
    clearAuthState,
  }
}
