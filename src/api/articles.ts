import type { Article, ApiArticle, ArticlesResponse, Locale, ArticleCategory, ArticleBusinessType, ArticleTag, HomePageResponse, HomePageData } from '../types';

/**
 * API configuration
 */
// Use import.meta.env for browser-safe environment variables in Vite/Astro
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://preview-api.detake.com/';

/**
 * Fetch articles list with pagination, locale and category support
 * @param locale - Current locale
 * @param page - Page number
 * @param limit - Items per page
 * @param category - Article category (insights, news, research)
 * @returns Promise with articles response containing ApiArticle[]
 */
export async function fetchArticles(locale: Locale, page: number = 1, limit: number = 10, category?: string): Promise<ArticlesResponse> {
  try {
    // For development - return mock data immediately
    // return getMockArticles(locale, page, limit, category)

    const categoryParam = category ? `&category=${category}` : '';
    const localeParam = locale === 'us' ? 'en' : 'zh';

    const response = await fetch(`${API_BASE_URL}/api/v1/articles?locale=${localeParam}&page=${page}&limit=${limit}${categoryParam}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && result.data) {
      // Transform backend response to our ArticlesResponse format
      const { articles, pagination } = result.data;
      return {
        articles: articles || [], // ApiArticle[] from backend
        total: pagination?.total || 0,
        page: pagination?.page || page,
        limit: pagination?.limit || limit,
        hasMore: (pagination?.page || page) * (pagination?.limit || limit) < (pagination?.total || 0),
      };
    } else {
      throw new Error(`API Error: ${result.msg?.en || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Return mock data for development
    return getMockArticles(locale, page, limit, category);
  }
}

/**
 * Fetch single article by slug and category
 * @param slug - Article slug
 * @param locale - Current locale (used to map API language to our Locale union)
 * @param category - Article category (unused in API call but kept for compatibility)
 * @returns Promise<ApiArticle | null> - Returns backend format directly
 */
export async function fetchArticle(slug: string, locale?: Locale, category?: string): Promise<ApiArticle | null> {
  // return getMockArticle('us', slug, category)
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/info?slug=${slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && result.data) {
      // Return raw API data directly, components will use backend fields
      return result.data;
    } else {
      throw new Error(`API Error: ${result.msg?.en || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    // Return mock data for development
    return getMockArticle(locale as Locale, slug, category);
  }
}

/**
 * Fetch article categories from API (new endpoint)
 * Returns a typed list of categories or an empty array on failure
 */
export async function fetchArticleCategories(): Promise<ArticleCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/categories`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && Array.isArray(result.data)) {
      return result.data;
    } else {
      throw new Error(`API Error: ${result.msg?.en || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch article business types from API (new endpoint)
 * Returns a typed list of business types or an empty array on failure
 */
export async function fetchArticleBusinessTypes(): Promise<ArticleBusinessType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/business-types`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch business types: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && Array.isArray(result.data)) {
      return result.data;
    } else {
      throw new Error(`API Error: ${result.msg?.en || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching business types:', error);
    return [];
  }
}

/**
 * Fetch article tags from API (new endpoint)
 * Returns a typed list of tags or an empty array on failure
 */
export async function fetchArticleTags(): Promise<ArticleTag[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/tags`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && Array.isArray(result.data)) {
      return result.data;
    } else {
      throw new Error(`API Error: ${result.msg?.en || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Fetch home page data from API
 * @returns Promise<HomePageData>
 */
export async function fetchHomePageData(): Promise<HomePageData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/home`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch home page data: ${response.statusText}`);
    }

    const result: HomePageResponse = await response.json();
    if (result.code === 2000 && result.data) {
      return result.data;
    } else {
      throw new Error(`API Error: ${result.msg?.en || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching home page data:', error);
    // Return mock data for development
    return getMockHomePageData();
  }
}

/**
 * Fetch categories endpoint for development
 * Returns category configuration data
 */
export async function fetchCategories(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return mock data for development
    return {
      code: 2001,
      msg: { en: 'Success', zh: '成功' },
      data: [
        {
          name: 'Insights',
          description: 'In-depth analysis and interpretations of Web3 trends, technologies, and market dynamics, offering strategic perspectives and actionable intelligence for informed decision-making',
        },
        {
          name: 'News',
          description: 'Current events, announcements, and breaking developments in the Web3 ecosystem, including project launches, partnerships, regulatory updates, and market movements',
        },
        {
          name: 'Research',
          description: 'Comprehensive studies, technical papers, and data-driven investigations exploring Web3 technologies, protocols, and applications with academic rigor and empirical evidence',
        },
      ],
    };
  }
}

// Update mock functions to support category filtering and return proper types
function getMockArticles(locale: Locale, page: number, limit: number, category?: string): ArticlesResponse {
  const mockArticles: ApiArticle[] = [
    {
      entry_id: 'dtc-v19v6gMM',
      slug: 'byreal-dex-from-bybit-off-v6bq',
      title: 'Byreal DEX From Bybit Officially Launches On Solana',
      sub_title: 'Bybit has officially launched its Solana-based Decentralized Exchange (DEX) dubbed Byreal on testnet with mainnet launch slated for Q3.',
      img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=news-article-1',
      created_at: '2025-07-08T19:42:59.246Z',
      updated_at: '2025-07-08T19:42:59.246Z',
      category_name: 'News',
      author: {
        name: 'dannyburger',
        avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=dannyburger-1',
        bio: 'Crypto analyst specializing in DeFi protocols',
      },
      body: 'Bybit has officially launched its Solana-based Decentralized Exchange (DEX) dubbed Byreal on testnet with mainnet launch slated for Q3.',
      tags: ['bybit', 'solana', 'dex', 'defi'],
      language: locale === 'us' ? 'en' : 'zh',
    },
    {
      entry_id: 'dtc-eth-etf-news',
      slug: 'sec-approves-eth-etf-options-doge-filing',
      title: locale === 'us' ? 'SEC approves ETH ETF options, faces new DOGE filing' : 'SEC批准ETH ETF期权，面临新的DOGE申请',
      sub_title: locale === 'us' ? 'Crypto products come to market BlackRock, Fidelity and others have filed a spot ETH ETF approved, and we may see more' : '加密产品进入市场，BlackRock、Fidelity等公司已申请现货ETH ETF批准，我们可能会看到更多发展',
      img_url: '/placeholder.svg',
      created_at: '2024-04-11T00:00:00Z',
      updated_at: '2024-04-11T00:00:00Z',
      category_name: 'News',
      author: {
        name: 'JACK KUBRIC',
        avatar_url: '/avatars/jack-kubric.jpg',
      },
      body: 'Crypto products come to market as BlackRock, Fidelity and others have filed for spot ETH ETF approval, and we may see more developments in the regulatory landscape.',
      tags: ['sec', 'eth', 'etf', 'doge', 'regulation'],
      language: locale === 'us' ? 'en' : 'zh',
    },
    {
      entry_id: 'dtc-crypto-fundamentals',
      slug: 'how-crypto-evolving-xG0zT',
      title: locale === 'us' ? "How crypto's evolving with fundamentals" : '加密货币如何与基本面共同发展',
      sub_title: locale === 'us' ? 'SCALE is one of bitcoin said that certain metrics are becoming more important to gauging the success of projects' : 'SCALE是比特币之一，表示某些指标对于衡量项目成功变得更加重要',
      img_url: '/images/crypto-fundamentals.jpg',
      created_at: '2024-04-17T10:00:00Z',
      updated_at: '2024-04-17T10:00:00Z',
      category_name: 'Research',
      author: {
        name: 'Jack Kubinec',
        avatar_url: '/avatars/jack.jpg',
      },
      body: 'Full article content here...',
      tags: ['crypto', 'fundamentals', 'analysis'],
      language: locale === 'us' ? 'en' : 'zh',
    },
    {
      entry_id: 'dtc-loopscale-solana',
      slug: 'loopscale-launches-solana-defi',
      title: locale === 'us' ? 'Loopscale launches for more efficient Solana DeFi' : 'Loopscale推出更高效的Solana DeFi',
      sub_title: locale === 'us' ? 'Mary Generative, co-founder of Solana DeFi startup Loopscale, wants to give blockchain borrow-lend a facelift' : 'Solana DeFi初创公司Loopscale的联合创始人Mary Generative希望为区块链借贷提供新面貌',
      img_url: '/images/loopscale-launch.jpg',
      created_at: '2024-04-17T08:00:00Z',
      updated_at: '2024-04-17T08:00:00Z',
      category_name: 'News',
      author: {
        name: 'Jack Kubinec',
        avatar_url: '/avatars/jack.jpg',
      },
      body: 'Full article content here...',
      tags: ['solana', 'defi', 'loopscale'],
      language: locale === 'us' ? 'en' : 'zh',
    },
  ];

  return {
    articles: mockArticles,
    total: 50,
    page,
    limit,
    hasMore: page * limit < 50,
  };
}

/**
 * Get mock article for development
 * Returns ApiArticle format directly
 */
function getMockArticle(locale: Locale, slug: string, category?: string): ApiArticle | null {
  const mock = getMockArticles(locale, 1, 10, category);
  const article = mock.articles.find((article) => article.slug === slug);
  return article || null;
}

/**
 * Mock home page data for development
 */
function getMockHomePageData(): HomePageData {
  return {
    lastest: [
      {
        entry_id: 'dtc-v19v6gMM',
        business_type_name: 'News',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-dex-1',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        business_type_name: 'News',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-dex-2',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        business_type_name: 'News',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-dex-3',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        business_type_name: 'News',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-dex-4',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        business_type_name: 'News',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-dex-5',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        business_type_name: 'News',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-dex-6',
        created_at: '2025-07-08T19:42:59.246Z',
      },
    ],
    who_to_follow: [
      {
        user_id: '5',
        nick: 'byreal',
        name: 'Byreal',
        avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-user-1',
        profile_bio: 'Byreal is a decentralized exchange on Solana.',
      },
      {
        user_id: '5',
        nick: 'byreal',
        name: 'Byreal',
        avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-user-2',
        profile_bio: 'Byreal is a decentralized exchange on Solana.',
      },
      {
        user_id: '5',
        nick: 'byreal',
        name: 'Byreal',
        avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-user-3',
        profile_bio: 'Byreal is a decentralized exchange on Solana.',
      },
      {
        user_id: '5',
        nick: 'byreal',
        name: 'Byreal',
        avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-user-4',
        profile_bio: 'Byreal is a decentralized exchange on Solana.',
      },
      {
        user_id: '5',
        nick: 'byreal',
        name: 'Byreal',
        avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=byreal-user-5',
        profile_bio: 'Byreal is a decentralized exchange on Solana.',
      },
    ],
    news_all: [
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=news-article-1',
        created_at: '2025-07-08T19:42:59.246Z',
        business_type_name: 'BUSINESS',
        author: {
          name: 'dannyburger',
          avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=dannyburger-1',
          bio: 'xxx yyy',
        },
        body: 'Bybit has officially launched its Solana-based Decentralized Exchange (DEX) dubbed Byreal on testnet with mainnet launch slated for Q3.',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=news-article-2',
        created_at: '2025-07-08T19:42:59.246Z',
        business_type_name: 'News',
        author: {
          name: 'dannyburger',
          avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=dannyburger-2',
          bio: 'xxx yyy',
        },
        body: 'Bybit has officially launched its Solana-based Decentralized Exchange (DEX) dubbed Byreal on testnet with mainnet launch slated for Q3.',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=news-article-3',
        created_at: '2025-07-08T19:42:59.246Z',
        business_type_name: 'News',
        author: {
          name: 'dannyburger',
          avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=dannyburger-3',
          bio: 'xxx yyy',
        },
        body: 'Bybit has officially launched its Solana-based Decentralized Exchange (DEX) dubbed Byreal on testnet with mainnet launch slated for Q3.',
      },
    ],
    topics: [
      {
        name: 'AIWeb3',
        description: 'Integration of artificial intelligence with blockchain for enhanced decentralized systems',
      },
      {
        name: 'Blockchain',
        description: 'The foundational technology of Web3 enabling decentralized and immutable record-keeping',
      },
      {
        name: 'Cryptocurrency',
        description: 'Digital currencies using cryptography for security and operating on blockchain networks',
      },
      {
        name: 'DAO',
        description: 'Decentralized autonomous organizations governed by smart contracts and community voting',
      },
      {
        name: 'DApps',
        description: 'Decentralized applications running on peer-to-peer networks instead of centralized servers',
      },
      {
        name: 'DataMarkets',
        description: 'Platforms for secure data sharing and monetization with privacy preservation',
      },
      {
        name: 'DeFi',
        description: 'Decentralized finance applications and protocols that operate without traditional intermediaries',
      },
    ],
    mostread: [
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        business_type_name: 'News',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=featured-article-1',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        business_type_name: 'News',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=featured-article-2',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        business_type_name: 'News',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=featured-article-3',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        business_type_name: 'News',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=featured-article-4',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        business_type_name: 'News',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=featured-article-5',
        created_at: '2025-07-08T19:42:59.246Z',
      },
      {
        entry_id: 'dtc-v19v6gMM',
        slug: 'byreal-dex-from-bybit-off-v6bq',
        business_type_name: 'News',
        title: 'Byreal DEX From Bybit Officially Launches On Solana',
        img_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=featured-article-6',
        created_at: '2025-07-08T19:42:59.246Z',
      },
    ],
  };
}
