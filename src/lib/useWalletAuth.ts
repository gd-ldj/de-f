import { useAtom } from 'jotai'
import { useState, useEffect, useCallback } from 'react'
import { loginWithWallet } from '../api/auth';
import { fetchUserPersonalInfo } from '../api/users'
import {
  setWalletAuthDataAtom,
  persistedAccessTokenAtom,
  userIdAtom,
  persistedWalletAddressAtom,
  persistedPromoteCodeAtom,
  isAuthenticatedAtom
} from '../stores'
import { DEFAULT_PROMOTE_CODE, STORAGE_KEYS } from '../config/constants'
import type { WalletLoginData, UserPersonalInfo } from '../types'

/**
 * Custom hook for wallet-based authentication
 * Provides wallet login, token management, and global state synchronization
 * Integrates with the backend wallet login API and manages authentication persistence
 */
export const useWalletAuth = () => {
  const [, setWalletAuthData] = useAtom(setWalletAuthDataAtom)
  const [accessToken, setAccessToken] = useAtom(persistedAccessTokenAtom)
  const [userId, setUserId] = useAtom(userIdAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [walletAddress, setWalletAddress] = useAtom(persistedWalletAddressAtom)
  const [promoteCode, setPromoteCode] = useAtom(persistedPromoteCodeAtom)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPersonalInfo, setUserPersonalInfo] = useState<UserPersonalInfo | null>(null)

  /**
   * Initialize authentication state from localStorage on mount
   * Use async loading to prevent blocking initial render
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only initialize from localStorage in browser environment
        if (typeof window !== 'undefined') {
          // Use requestIdleCallback or setTimeout to defer localStorage reads
          await new Promise(resolve => {
            if ('requestIdleCallback' in window) {
              requestIdleCallback(resolve);
            } else {
              setTimeout(resolve, 0);
            }
          });

          // Load stored auth data
          const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
          const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)
          const storedWalletAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)

          if (storedAccessToken) setAccessToken(storedAccessToken)
          if (storedUserId) setUserId(storedUserId)
          if (storedWalletAddress) setWalletAddress(storedWalletAddress)
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error)
        clearAuthState()
      }
    }

    initializeAuth()
  }, [])

  /**
   * Clear all authentication state
   */
  const clearAuthState = useCallback(() => {
    setWalletAuthData(null)
    setAccessToken(null)
    setUserId(null)
    setWalletAddress(null)
    setUserPersonalInfo(null)
    setError(null)
    // Reset promote code to default value when clearing auth state
    setPromoteCode(DEFAULT_PROMOTE_CODE)
  }, [setWalletAuthData, setAccessToken, setUserId, setWalletAddress, setPromoteCode])

  /**
   * Handle wallet login with signature
   * @param walletAddress - User's wallet address
   * @param signature - Wallet signature for authentication

   * @returns Promise with login success status
   */
  const handleWalletLogin = useCallback(async (
    walletAddress: string,
    signature: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const loginData = await loginWithWallet(walletAddress, signature)
      
      if (loginData) {
        // Store authentication data globally
        setWalletAuthData(loginData)
        setAccessToken(loginData.access_token)
        setUserId(loginData.user_id)
        setWalletAddress(walletAddress)

        // Fetch user personal info after login and update promoteCode
        try {
          const personal = await fetchUserPersonalInfo(loginData.access_token)
          setUserPersonalInfo(personal)
          if (personal?.promote_code) {
            setPromoteCode(personal.promote_code)
          }
        } catch (e) {
          console.warn('Failed to fetch user personal info after login:', e)
        }
        
        console.log('Wallet login successful:', {
          userId: loginData.user_id,
          walletAddress,
        })
        
        return true
      } else {
        setError('Login failed: No data returned')
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Login failed: ${errorMessage}`)
      console.error('Wallet login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setWalletAuthData, setAccessToken, setUserId, setWalletAddress, setPromoteCode])

  /**
   * Get valid access token
   * @returns Promise with access token or null
   */
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    return accessToken
  }, [accessToken])

  return {
    // Authentication state
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    userId,
    walletAddress,
    promoteCode,
    userPersonalInfo,

    // Authentication methods
    login: handleWalletLogin,
    clearError: () => setError(null),

    // Utility methods
    getValidAccessToken,

    // State management
    clearAuthState,
  };
}