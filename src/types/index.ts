/**
 * Article data structure from API
 */
export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  author: {
    name: string
    avatar?: string
  }
  publishedAt: string
  updatedAt: string
  category: string
  tags: string[]
  featuredImage?: string
  readTime: number
  locale: string
}

/**
 * API response structure for articles list
 */
export interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Supported locales
 */
export type Locale = 'us' | 'asia'

/**
 * Navigation item structure
 */
export interface NavItem {
  title: string
  href: string
  external?: boolean
}

/**
 * User data from Privy authentication
 */
export interface User {
  id: string
  email?: string | { address: string }
  wallet?: {
    address: string
    chainType: string
  }
}

/**
 * User wallet interface
 */
export interface UserWallet {
  wallet_id: string
  wallet_address: string
}

/**
 * User personal information interface
 */
export interface UserPersonalInfo {
  user_id: string
  nick: string | null
  email: string | null
  avatar_url: string | null
  promote_code: string
  full_name: string | null
  profile_bio: string | null
  twitter: string | null
  twitter_api_key: string | null
  evm_wallets: UserWallet[]
  sol_wallets: UserWallet[]
}

/**
 * API response interface for user personal info
 */
export interface UserPersonalInfoResponse {
  code: number
  msg: {
    en: string
    zh: string
  }
  data: UserPersonalInfo
}

/**
 * Wallet login request interface
 */
export interface WalletLoginRequest {
  wallet_address: string
  signature: string
}

/**
 * Wallet login response data interface
 */
export interface WalletLoginData {
  userId: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}

/**
 * API response interface for wallet login
 */
export interface WalletLoginResponse {
  code: number
  msg: {
    en: string
    zh: string
  }
  data: WalletLoginData
}

/**
 * API endpoints configuration
 */
export interface ApiConfig {
  baseUrl: string
  endpoints: {
    articles: string
    article: string
  }
}