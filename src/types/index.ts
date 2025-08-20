/**
 * Backend API article data structure (new format)
 * This matches the fields returned directly from the backend API
 */
export interface ApiArticle {
  entry_id: string
  title: string
  sub_title: string
  slug: string
  body: string
  author: {
    name: string
    avatar_url?: string
    bio?: string
  }
  created_at: string
  updated_at: string
  category_name: string
  tags: string[]
  img_url?: string
  language: string
}

/**
 * @deprecated Legacy Article interface - use ApiArticle for new implementations
 * Article data structure from API (legacy format)
 */
export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  author: {
    name: string
    avatar_url?: string
    bio?: string
  }
  publishedAt: string
  updatedAt: string
  category: string
  tags: string[]
  featuredImage?: string
  readTime: number
  locale: string
  /** Raw HTML body used by ArticleContent for rendering */
  body?: string
}

/**
 * Article category data structure from API
 */
export interface ArticleCategory {
  id: string
  name: string
  description: string
}

/**
 * Article business type data structure from API
 */
export interface ArticleBusinessType {
  id: string
  name: string
  description: string
}

/**
 * Article tag data structure from API
 */
export interface ArticleTag {
  id: string
  name: string
  description: string
}

/**
 * API response structure for articles list (updated to use backend format)
 */
export interface ArticlesResponse {
  articles: ApiArticle[]
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
 * Updated to match new API format without refreshToken
 */
export interface WalletLoginData {
  type: string
  userId: string
  accessToken: string
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