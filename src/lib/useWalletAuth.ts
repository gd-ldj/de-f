import { useAtom } from 'jotai'
import { useState, useEffect, useCallback } from 'react'
import { loginWithWallet, refreshAccessToken, logout } from '../api/auth'
import {
  persistedWalletAuthDataAtom,
  persistedAccessTokenAtom,
  persistedRefreshTokenAtom,
  userIdAtom,
  persistedWalletAddressAtom,
  persistedPromoteCodeAtom,
  isAuthenticatedAtom
} from '../stores'
import { DEFAULT_PROMOTE_CODE, STORAGE_KEYS, AUTH_CONFIG } from '../config/constants'
import type { WalletLoginData } from '../types'

/**
 * Custom hook for wallet-based authentication
 * Provides wallet login, token management, and global state synchronization
 * Integrates with the backend wallet login API and manages authentication persistence
 */
export const useWalletAuth = () => {
  const [walletAuthData, setWalletAuthData] = useAtom(persistedWalletAuthDataAtom)
  const [accessToken, setAccessToken] = useAtom(persistedAccessTokenAtom)
  const [refreshToken, setRefreshToken] = useAtom(persistedRefreshTokenAtom)
  const [userId, setUserId] = useAtom(userIdAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [walletAddress, setWalletAddress] = useAtom(persistedWalletAddressAtom)
  const [promoteCode, setPromoteCode] = useAtom(persistedPromoteCodeAtom)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Initialize authentication state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Only initialize from localStorage in browser environment
        if (typeof window !== 'undefined') {
          // Load stored auth data
          const storedAuthData = localStorage.getItem(STORAGE_KEYS.WALLET_AUTH_DATA)
          const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
          const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
          const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)
          const storedWalletAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)

          if (storedAuthData) {
            const authData: WalletLoginData = JSON.parse(storedAuthData)
            setWalletAuthData(authData)
          }

          if (storedAccessToken) setAccessToken(storedAccessToken)
          if (storedRefreshToken) setRefreshToken(storedRefreshToken)
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
    setRefreshToken(null)
    setUserId(null)
    setWalletAddress(null)
    setError(null)
    // Reset promote code to default value when clearing auth state
    setPromoteCode(DEFAULT_PROMOTE_CODE)
  }, [setWalletAuthData, setAccessToken, setRefreshToken, setUserId, setWalletAddress, setPromoteCode])

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
        // Store all authentication data globally
        setWalletAuthData(loginData)
        setAccessToken(loginData.accessToken)
        setRefreshToken(loginData.refreshToken)
        setUserId(loginData.userId)
        setWalletAddress(walletAddress)
        
        // Update promote code with user's value after successful login
        if (loginData.promoteCode) {
          setPromoteCode(loginData.promoteCode)
        }
        
        console.log('Wallet login successful:', {
          userId: loginData.userId,
          walletAddress,
          promoteCode: loginData.promoteCode,
          expiresAt: loginData.accessTokenExpiresAt
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
  }, [setWalletAuthData, setAccessToken, setRefreshToken, setUserId, setWalletAddress, setPromoteCode])

  /**
   * Handle token refresh
   * @returns Promise with refresh success status
   */
  const handleTokenRefresh = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) {
      setError('No refresh token available')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const newAuthData = await refreshAccessToken(refreshToken)
      
      if (newAuthData) {
        // Update authentication data
        setWalletAuthData(newAuthData)
        setAccessToken(newAuthData.accessToken)
        setRefreshToken(newAuthData.refreshToken)
        setUserId(newAuthData.userId)
        
        // Update promote code if available in refresh response
        if (newAuthData.promoteCode) {
          setPromoteCode(newAuthData.promoteCode)
        }
        
        console.log('Token refresh successful')
        return true
      } else {
        setError('Token refresh failed')
        clearAuthState()
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Token refresh failed: ${errorMessage}`)
      console.error('Token refresh error:', error)
      clearAuthState()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [refreshToken, setWalletAuthData, setAccessToken, setRefreshToken, setUserId, setPromoteCode, clearAuthState])

  /**
   * Handle logout
   * @returns Promise with logout success status
   */
  const handleLogout = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      let logoutSuccess = true
      
      // Attempt to logout from backend if we have an access token
      if (accessToken) {
        logoutSuccess = await logout(accessToken)
      }
      
      // Clear local state regardless of backend logout result
      clearAuthState()
      
      console.log('Logout completed:', { success: logoutSuccess })
      return logoutSuccess
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Logout failed: ${errorMessage}`)
      console.error('Logout error:', error)
      
      // Still clear local state even if backend logout fails
      clearAuthState()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, clearAuthState])

  /**
   * Check if access token is expired
   * @returns boolean indicating if token is expired
   */
  const isTokenExpired = useCallback((): boolean => {
    if (!walletAuthData?.accessTokenExpiresAt) return true
    
    const expirationTime = new Date(walletAuthData.accessTokenExpiresAt).getTime()
    const currentTime = Date.now()
    const bufferTime = AUTH_CONFIG.TOKEN_REFRESH_BUFFER_MS // Configurable buffer time
    
    return currentTime >= (expirationTime - bufferTime)
  }, [walletAuthData?.accessTokenExpiresAt])

  /**
   * Get valid access token, refreshing if necessary
   * @returns Promise with valid access token or null
   */
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null
    
    if (isTokenExpired()) {
      const refreshSuccess = await handleTokenRefresh()
      return refreshSuccess ? accessToken : null
    }
    
    return accessToken
  }, [accessToken, isTokenExpired, handleTokenRefresh])

  return {
    // Authentication state
    isAuthenticated,
    isLoading,
    error,
    walletAuthData,
    accessToken,
    refreshToken,
    userId,
    walletAddress,
    promoteCode,
    
    // Authentication methods
    login: handleWalletLogin,
    logout: handleLogout,
    refreshTokens: handleTokenRefresh,
    clearError: () => setError(null),
    
    // Utility methods
    isTokenExpired,
    getValidAccessToken,
    
    // State management
    clearAuthState
  }
}