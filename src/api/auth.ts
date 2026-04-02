import type { WalletLoginRequest, WalletLoginResponse, WalletLoginData, ClerkAuthRequest, ClerkAuthResponse, ClerkAuthData } from '../types'
import { SITE_CONFIG } from '../config/constants'

/**
 * API configuration
 * Uses environment-based configuration from SITE_CONFIG
 */
const API_BASE_URL = SITE_CONFIG.API_BASE_URL;

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
      signature: signature,
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid wallet signature');
      }
      if (response.status === 404) {
        throw new Error('Wallet not found');
      }
      throw new Error(`Failed to login with wallet: ${response.statusText}`);
    }

    const result: WalletLoginResponse = await response.json();

    if (result.code === 2000) {
      return result.data;
    } else {
      throw new Error(`API Error: ${result.msg.en}`);
    }
  } catch (error) {
    console.error('Error during wallet login:', error);
    return null;
  }
}

/**
 * Clerk login function
 * Exchanges a Clerk JWT token for a backend access token
 * @param clerkToken - JWT token from Clerk
 * @returns Promise with login response data
 */
export async function loginWithClerk(
  clerkToken: string
): Promise<ClerkAuthData | null> {
  try {
    const requestBody: ClerkAuthRequest = {
      token: clerkToken,
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/clerk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Clerk token');
      }
      throw new Error(`Failed to login with Clerk: ${response.statusText}`);
    }

    const result: ClerkAuthResponse = await response.json();

    if (result.code === 2000 || result.code === 2001) {
      return result.data;
    } else {
      throw new Error(`API Error: ${result.msg.en}`);
    }
  } catch (error) {
    console.error('Error during Clerk login:', error);
    return null;
  }
}