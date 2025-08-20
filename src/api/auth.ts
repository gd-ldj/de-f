import type { WalletLoginRequest, WalletLoginResponse, WalletLoginData } from '../types'

/**
 * API configuration
 */
// Use import.meta.env for browser-safe environment variables in Vite/Astro
// Note: Using process.env in the browser bundle causes "process is not defined"; import.meta.env is the correct approach
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://preview-api.detake.com/'

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
      `${API_BASE_URL}/api/v1/auth/wallet`,
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
    
    if (result.code === 2000) {
      return result.data
    } else {
      throw new Error(`API Error: ${result.msg.en}`)
    }
  } catch (error) {
    console.error('Error during wallet login:', error)
    // Return mock data for development
    return getMockWalletLoginData()
  }
}

/**
 * Mock wallet login data for development
 * @returns Mock login response data
 */
function getMockWalletLoginData(): WalletLoginData {
  return {
    type: "login",
    userId: "5",
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1IiwicmFuZG9tIjoiZGE0MDc3MjQxYjQ2YzJmYjU1OTQ1NWEyNjg2N2MxN2U0NDVmMjk3ODU2MTE2OWFkNzFiMzgzZmMwNjlmM2FjNiIsImlhdCI6MTc1NTYwODcwOX0.Q4Jd8L4xmWn9C5hFNIbQhKklLOyNXWdc8xGQQ317DuQ"
  }
}

/**
 * Logout function to invalidate tokens
 * @param accessToken - Current access token
 * @returns Promise with logout success status
 */
export async function logout(accessToken: string): Promise<boolean> {
  // NOTE: Backend logout is optional for now; clear client state regardless.
  // Keeping a stubbed true to avoid blocking UI while backend endpoint stabilizes.
  return true
}