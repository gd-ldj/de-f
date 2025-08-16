import type { UserPersonalInfo, UserPersonalInfoResponse } from '../types'

/**
 * API configuration
 */
const API_BASE_URL = process.env.PUBLIC_API_BASE_URL || 'https://test-api.detake.com/';

/**
 * Fetch user personal information by user ID
 * @param userId - User ID to fetch personal information for
 * @returns Promise with user personal information
 */
export async function fetchUserPersonalInfo(
  userId: string
): Promise<UserPersonalInfo | null> {
    return getMockUserPersonalInfo(userId)

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/${userId}/personal`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch user personal info: ${response.statusText}`)
    }

    const result: UserPersonalInfoResponse = await response.json()
    
    if (result.code === 2001) {
      return result.data
    } else {
      throw new Error(`API Error: ${result.msg.en}`)
    }
  } catch (error) {
    console.error('Error fetching user personal info:', error)
    // Return mock data for development
    return getMockUserPersonalInfo(userId)
  }
}

/**
 * Mock user personal information for development
 * @param userId - User ID
 * @returns Mock user personal information
 */
function getMockUserPersonalInfo(userId: string): UserPersonalInfo {
  return {
    user_id: userId,
    nick: null,
    email: null,
    avatar_url: null,
    promote_code: "BlzpQRpi",
    full_name: null,
    profile_bio: null,
    twitter: null,
    twitter_api_key: null,
    evm_wallets: [],
    sol_wallets: [
      {
        wallet_id: "Mg==",
        wallet_address: "0xadc5340863207eA08bf199Eb1Ae9Bee6b34499Fc"
      }
    ]
  }
}