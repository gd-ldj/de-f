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
 * API endpoints configuration
 */
export interface ApiConfig {
  baseUrl: string
  endpoints: {
    articles: string
    article: string
  }
}