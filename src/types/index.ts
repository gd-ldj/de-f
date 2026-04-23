/**
 * Backend API article data structure (new format)
 * This matches the fields returned directly from the backend API
 */
export interface ApiArticle {
  entry_id: string;
  title: string;
  sub_title: string;
  slug: string;
  body?: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  category_names: string[];
  subcategory_names: string[];
  category_name?: string;
  business_type_name?: string;
  tags: string[];
  topic_names?: string[];
  img_url?: string;
  language?: string;
  page_view?: string;
  unique_vistor?: string;
  user_id?: string; // User ID for regular user articles (not present for admin/system articles)
  contact?: {
    email: string;
    phone: string;
    title: string;
    company: string;
    full_name: string;
    twitter?: string;
  };
  // Legacy author object for backward compatibility
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    role?: string; // Role field to distinguish user articles (role === "Authors") from admin articles
  };
  // Podcast-specific optional fields (present when business_type_name === 'Podcasts')
  youtube_video_id?: string;
  youtube_url?: string;
  youtube_channel_id?: string;
  youtube_channel_url?: string;
  youtube_view_count?: number;
  transcript?: string;
}

export interface PodcastListItem {
  id: string;
  youtube_url: string;
  embed_url: string;
  title: string;
  description: string;
  channel_name: string;
  channel_url?: string;
  channel_avatar?: string;
  thumbnail?: string;
  duration?: number;
  view_count?: number | string;
  published_at: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PodcastDetailItem extends PodcastListItem {
  content: string;
  error_message?: string | null;
}

export interface TranslatedPodcastPayload {
  entry_id: string;
  language: string;
  title: string;
  body: string;
  thumbnail?: string;
  channel_name?: string;
  duration?: number;
  youtube_url?: string;
  published_at?: string;
}

/**
 * @deprecated Legacy Article interface - use ApiArticle for new implementations
 * Article data structure from API (legacy format)
 */
export interface Article {
  id: string;
  title: string;
  sub_title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: {
    name: string;
    avatar_url?: string;
    bio?: string;
  };
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  readTime: number;
  locale: string;
  /** Raw HTML body used by ArticleContent for rendering */
  body?: string;
}

/**
 * Article category data structure from API
 */
export interface ArticleCategory {
  id: string;
  name: string;
  description: string;
  business_type_name?: string;
}

/**
 * Article business type data structure from API
 */
export interface ArticleBusinessType {
  id: string;
  name: string;
  description: string;
}

/**
 * Article tag data structure from API
 */
export interface ArticleTag {
  id: string;
  name: string;
  description: string;
}

export interface ArticleSubcategory {
  id: string;
  name: string;
  description: string;
  parent_category_id: string;
  parent_category_name: string;
}

/**
 * API response structure for articles list (updated to use backend format)
 */
export interface ArticlesResponse {
  articles: ApiArticle[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

/**
 * Supported locales (aligned with source languages)
 */
export type Locale = 'en' | 'zh' | 'ja';

/**
 * Source language codes (site-level language)
 * Represents the primary language of a source site
 */
export type SourceLanguage = 'en' | 'zh' | 'ja';

/**
 * Translation language codes (content-level language)
 * All languages that articles can be translated to
 */
export type TranslationLanguage = 'en' | 'zh' | 'ja' | 'fr' | 'ar' | 'ru' | 'de' | 'es' | 'ko';

/**
 * All supported languages in the system
 */
export type SupportedLanguage = TranslationLanguage;

/**
 * Site configuration for multi-source architecture
 */
export interface SiteConfig {
  sourceLanguage: SourceLanguage;
  domain: string;
}

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, { en: string; native: string }> = {
  en: { en: 'English', native: 'English' },
  zh: { en: 'Chinese', native: '中文' },
  ja: { en: 'Japanese', native: '日本語' },
  fr: { en: 'French', native: 'Français' },
  ar: { en: 'Arabic', native: 'العربية' },
  ru: { en: 'Russian', native: 'Русский' },
  de: { en: 'German', native: 'Deutsch' },
  es: { en: 'Spanish', native: 'Español' },
  ko: { en: 'Korean', native: '한국어' },
};

/**
 * Navigation item structure
 */
export interface NavItem {
  title: string;
  href: string;
  external?: boolean;
}

/**
 * User data from authentication
 */
export interface User {
  id: string;
  email?: string | { address: string };
  wallet?: {
    address: string;
    chainType: string;
  };
}

/**
 * Clerk authentication request interface
 */
export interface ClerkAuthRequest {
  token: string;
}

/**
 * Clerk authentication response data interface
 */
export interface ClerkAuthData {
  type: string;
  user_id: string;
  access_token: string;
}

/**
 * API response interface for Clerk authentication
 */
export interface ClerkAuthResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data: ClerkAuthData;
}

/**
 * User wallet interface
 */
export interface UserWallet {
  wallet_id: string;
  wallet_address: string;
}

/**
 * User personal information interface
 */
export interface UserPersonalInfo {
  user_id: string;
  nick: string | null;
  email: string | null;
  avatar_url: string | null;
  promote_code: string;
  full_name: string | null;
  profile_bio: string | null;
  twitter: string | null;
  twitter_api_key: string | null;
  evm_wallets: UserWallet[];
  sol_wallets: UserWallet[];
}

/**
 * API response interface for user personal info
 */
export interface UserPersonalInfoResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data: UserPersonalInfo;
}

/**
 * Wallet login request interface
 */
export interface WalletLoginRequest {
  wallet_address: string;
  signature: string;
}

/**
 * Wallet login response data interface
 * Updated to match new API format without refreshToken
 */
export interface WalletLoginData {
  type: string;
  user_id: string;
  access_token: string;
}

/**
 * API response interface for wallet login
 */
export interface WalletLoginResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data: WalletLoginData;
}

/**
 * Home page data structures
 */
export interface HomeLatestArticle {
  entry_id: string;
  business_type_name: string;
  slug: string;
  title: string;
  sub_title: string;
  img_url: string;
  created_at: string;
}

export interface HomeWhoToFollow {
  user_id: string;
  nick: string;
  name: string;
  avatar_url: string;
  profile_bio: string;
}

export interface HomeNewsArticle {
  entry_id: string;
  slug: string;
  title: string;
  sub_title: string;
  img_url: string;
  created_at: string;
  business_type_name: string;
  user_id?: string; // User ID for regular user articles (not present for admin/system articles)
  author: {
    id?: string;
    name: string;
    avatar_url: string;
    bio: string;
    role?: string; // Role field to distinguish user articles (role === "Authors") from admin articles
  };
  body: string;
}

export interface HomeTopic {
  name: string;
  description: string;
}

export interface HomeMostReadArticle {
  entry_id: string;
  slug: string;
  business_type_name: string;
  title: string;
  sub_title: string;
  img_url: string;
  created_at: string;
  author: {
    name: string;
    avatar_url: string;
    bio: string;
  };
}

export interface HomePageData {
  lastest: HomeLatestArticle[];
  who_to_follow: HomeWhoToFollow[];
  news_all: HomeNewsArticle[];
  topics: HomeTopic[];
  mostread: HomeMostReadArticle[];
  news: Array<{
    tag: string;
    data: HomeNewsArticle[];
  }>;
  insights: HomeNewsArticle[];
  research: HomeNewsArticle[];
}

export interface HomePageResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data: HomePageData;
}

// Collections 列表项类型
export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  image_url?: string;
  hunters_count: number;
  bonus_amt: string;
  views_count: number;
  user_id: string;
  is_public: boolean;
}

// Collections 列表接口返回类型
export interface CollectionsListResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data: {
    list: CollectionItem[];
    next: boolean;
  };
}

/**
 * API endpoints configuration
 */
export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    articles: string;
    article: string;
  };
}
