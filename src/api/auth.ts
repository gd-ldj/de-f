import type { WalletLoginRequest, WalletLoginResponse, WalletLoginData } from '../types'
import { getDefaultStore } from 'jotai'
import { persistedPromoteCodeAtom } from '../stores'

/**
 * API configuration
 */
// TODO: 引用process.env.PUBLIC_API_BASE_URL后钱包插件加载异常
// const API_BASE_URL = process.env.PUBLIC_API_BASE_URL || 'https://api.detake.com'
const API_BASE_URL = 'https://api.detake.com'

/**
 * Wallet login function
 * @param walletAddress - User's wallet address
 * @param signature - Wallet signature for authentication
 * @returns Promise with login response data
 */
export async function loginWithWallet(
  walletAddress: string,
  signature: string
): Promise<WalletLoginData | null> {
  try {
    const requestBody: WalletLoginRequest = {
      wallet_address: walletAddress,
      signature: signature
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/login/wallet`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid wallet signature')
      }
      if (response.status === 404) {
        throw new Error('Wallet not found')
      }
      throw new Error(`Failed to login with wallet: ${response.statusText}`)
    }

    const result: WalletLoginResponse = await response.json()
    
    if (result.code === 2001) {
      return result.data
    } else {
      throw new Error(`API Error: ${result.msg.en}`)
    }
  } catch (error) {
    console.error('Error during wallet login:', error)
    // Return mock data for development
    return getMockWalletLoginData(walletAddress)
  }
}

/**
 * Mock wallet login data for development
 * @param walletAddress - Wallet address
 * @returns Mock login response data
 */
function getMockWalletLoginData(walletAddress: string): WalletLoginData {
  return {
    userId: "5",
    promoteCode: 'xG3gD',
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.cThIIoDvwdueQB468K5xDc5633seEFoqwxjF_xSJyQQ",
    accessTokenExpiresAt: "2025-07-08T10:41:37.035Z",
    refreshTokenExpiresAt: "2025-07-08T10:41:37.035Z"
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Current refresh token
 * @returns Promise with new login data
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<WalletLoginData | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid refresh token')
      }
      throw new Error(`Failed to refresh token: ${response.statusText}`)
    }

    const result: WalletLoginResponse = await response.json()
    
    if (result.code === 2001) {
      return result.data
    } else {
      throw new Error(`API Error: ${result.msg.en}`)
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return null
  }
}

/**
 * Logout function to invalidate tokens
 * @param accessToken - Current access token
 * @returns Promise with logout success status
 */
export async function logout(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.statusText}`)
    }

    const result = await response.json()
    return result.code === 2001
  } catch (error) {
    console.error('Error during logout:', error)
    return false
  }
}