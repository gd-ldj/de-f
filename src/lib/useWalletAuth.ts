import { useAtom } from 'jotai'
import { useState, useEffect, useCallback } from 'react'
import { loginWithWallet, refreshAccessToken, logout } from '../api/auth'
import {
  persistedWalletAuthDataAtom,
  persistedAccessTokenAtom,
  persistedRefreshTokenAtom,
  userIdAtom,
  isAuthenticatedAtom,
  persistedWalletAddressAtom
} from '../stores'
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
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Initialize authentication state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Load stored auth data
        const storedAuthData = localStorage.getItem('wallet_auth_data')
        const storedAccessToken = localStorage.getItem('access_token')
        const storedRefreshToken = localStorage.getItem('refresh_token')
        const storedUserId = localStorage.getItem('user_id')
        const storedWalletAddress = localStorage.getItem('wallet_address')

        if (storedAuthData) {
          const authData: WalletLoginData = JSON.parse(storedAuthData)
          setWalletAuthData(authData)
        }

        if (storedAccessToken) setAccessToken(storedAccessToken)
        if (storedRefreshToken) setRefreshToken(storedRefreshToken)
        if (storedUserId) setUserId(storedUserId)
        if (storedWalletAddress) setWalletAddress(storedWalletAddress)
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
  }, [setWalletAuthData, setAccessToken, setRefreshToken, setUserId, setWalletAddress])

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
        
        console.log('Wallet login successful:', {
          userId: loginData.userId,
          walletAddress,
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
  }, [setWalletAuthData, setAccessToken, setRefreshToken, setUserId, setWalletAddress])

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
  }, [refreshToken, setWalletAuthData, setAccessToken, setRefreshToken, setUserId, clearAuthState])

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
    const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
    
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