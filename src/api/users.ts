import type { UserPersonalInfo, UserPersonalInfoResponse, HomeWhoToFollow } from '../types'
import { SITE_CONFIG } from '../config/constants'

/**
 * API configuration
 * Uses environment-based configuration from SITE_CONFIG
 */
const API_BASE_URL = SITE_CONFIG.API_BASE_URL;

/**
 * Follow author API response type
 */
interface FollowAuthorResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data?: any;
}

/**
 * Author profile information interface
 */
export interface AuthorProfile {
  user_id: string;
  nick: string | null;
  name: string;
  avatar_url: string | null;
  profile_bio: string | null;
  twitter: string | null;
  followers: number;
  articles_count: number;
  created_at: string;
}

/**
 * Author profile API response interface
 */
interface AuthorProfileResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data: AuthorProfile;
}

/**
 * Fetch user personal information by user ID
 * @returns Promise with user personal information
 */
export async function fetchUserPersonalInfo(accessToken: string): Promise<UserPersonalInfo | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/personal`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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
    
    if (result.code === 2000) {
      return result.data
    } else {
      throw new Error(`API Error: ${result.msg.en}`)
    }
  } catch (error) {
    console.error('Error fetching user personal info:', error)
    // Return mock data for development
    return getMockUserPersonalInfo("5")
  }
}

/**
 * Follow an author for the current authenticated user
 * This function sends a POST request with Authorization header and author_id in the body.
 * It returns the server response message which contains i18n strings for both EN and ZH.
 */
export async function followAuthor(accessToken: string, authorId: string): Promise<FollowAuthorResponse> {
  console.log("🚀 ~ followAuthor ~ accessToken:", accessToken)
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/follow`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ author_id: authorId })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to follow author: ${response.status} ${response.statusText}`)
    }

    const result: FollowAuthorResponse = await response.json()

    if (result.code === 2000) {
      return result
    } else {
      // Backend may return error codes with message
      throw new Error(result?.msg?.en || 'Failed to follow author')
    }
  } catch (error) {
    console.error('Error following author:', error)
    throw error
  }
}

/**
 * Fetch author profile information by author name or user ID
 * @param authorIdentifier - Author name or user ID 
 * @returns Promise with author profile information
 */
export async function fetchAuthorProfile(authorIdentifier: string): Promise<AuthorProfile | null> {
  return getMockAuthorProfile(authorIdentifier)
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/profile?author=${encodeURIComponent(authorIdentifier)}`,
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
      throw new Error(`Failed to fetch author profile: ${response.statusText}`)
    }

    const result: AuthorProfileResponse = await response.json()
    
    if (result.code === 2000) {
      return result.data
    } else {
      throw new Error(`API Error: ${result.msg.en}`)
    }
  } catch (error) {
    console.error('Error fetching author profile:', error)
    // Return mock data for development
    return getMockAuthorProfile(authorIdentifier)
  }
}

/**
 * Mock author profile information for development
 * @param authorIdentifier - Author identifier
 * @returns Mock author profile information
 */
function getMockAuthorProfile(authorIdentifier: string): AuthorProfile {
  return {
    user_id: "crypto_feed_news_123",
    nick: null,
    name: "Crypto Feed News",
    avatar_url: "/api/placeholder/48/48",
    profile_bio: "Crypto Enthusiastic | Ambassador | KOL | Moderator | Community Builder | BTC Analyst | News Journalist | GemFinder",
    twitter: "CryptoFeedNews",
    followers: 15600,
    articles_count: 10,
    created_at: "2023-01-15T00:00:00Z"
  }
}

/**
 * Fetch recommended users to follow
 * @param locale - Current locale
 * @returns Array of recommended users
 */
export async function fetchWhoToFollow(locale: string): Promise<HomeWhoToFollow[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/who-to-follow?locale=${locale}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.code === 2000) {
      return result.data || []
    } else {
      throw new Error(`API Error: ${result.msg.en}`)
    }
  } catch (error) {
    console.error('Error fetching who to follow:', error)
    // Return mock data for development
    return getMockWhoToFollow()
  }
}

/**
 * Mock recommended users data for development
 * @returns Mock who to follow data
 */
function getMockWhoToFollow(): HomeWhoToFollow[] {
  return [
    {
      user_id: "crypto_expert_1",
      nick: "CryptoExpert",
      name: "Sir Ismail",
      avatar_url: "/api/placeholder/48/48",
      profile_bio: "Cryptocurrency analyst and blockchain expert with 10+ years experience"
    },
    {
      user_id: "blockchain_guru_2",
      nick: "BlockchainGuru",
      name: "Alex Chen",
      avatar_url: "/api/placeholder/48/48",
      profile_bio: "DeFi researcher and smart contract developer"
    },
    {
      user_id: "crypto_trader_3",
      nick: "CryptoTrader",
      name: "Maria Rodriguez",
      avatar_url: "/api/placeholder/48/48",
      profile_bio: "Professional crypto trader and market analyst"
    },
    {
      user_id: "nft_collector_4",
      nick: "NFTCollector",
      name: "David Kim",
      avatar_url: "/api/placeholder/48/48",
      profile_bio: "NFT enthusiast and digital art collector"
    },
    {
      user_id: "defi_expert_5",
      nick: "DeFiExpert",
      name: "Sarah Johnson",
      avatar_url: "/api/placeholder/48/48",
      profile_bio: "DeFi protocol researcher and yield farming specialist"
    }
  ]
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