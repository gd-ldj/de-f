import type { Article, ArticlesResponse, Locale } from '../types'

/**
 * API configuration
 */
const API_BASE_URL = process.env.PUBLIC_API_BASE_URL || 'https://api.detake.com'


/**
 * Fetch articles list with pagination, locale and category support
 * @param locale - Current locale
 * @param page - Page number
 * @param limit - Items per page
 * @param category - Article category (insights, news, research)
 * @returns Promise with articles response
 */
export async function fetchArticles(
  locale: Locale,
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<ArticlesResponse> {
  try {
    const categoryParam = category ? `&category=${category}` : ''
    const response = await fetch(
      `${API_BASE_URL}/articles?locale=${locale}&page=${page}&limit=${limit}${categoryParam}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching articles:', error)
    // Return mock data for development
    return getMockArticles(locale, page, limit, category)
  }
}

/**
 * Fetch single article by slug and category
 * @param locale - Current locale
 * @param slug - Article slug
 * @param category - Article category
 * @returns Promise with article data
 */
export async function fetchArticle(
  locale: Locale,
  slug: string,
  category?: string
): Promise<Article | null> {
  try {
    const categoryParam = category ? `&category=${category}` : ''
    const response = await fetch(
      `${API_BASE_URL}/articles/${slug}?locale=${locale}${categoryParam}`,
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
      throw new Error(`Failed to fetch article: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching article:', error)
    // Return mock data for development
    return getMockArticle(locale, slug, category)
  }
}

/**
 * Fetch categories from API
 * @returns Promise with categories data
 */
export async function fetchCategories(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Return mock data for development
    return {
      code: 2001,
      msg: { en: "Success", zh: "成功" },
      data: [
        {
          name: "Insights",
          description: "In-depth analysis and interpretations of Web3 trends, technologies, and market dynamics, offering strategic perspectives and actionable intelligence for informed decision-making"
        },
        {
          name: "News",
          description: "Current events, announcements, and breaking developments in the Web3 ecosystem, including project launches, partnerships, regulatory updates, and market movements"
        },
        {
          name: "Research",
          description: "Comprehensive studies, technical papers, and data-driven investigations exploring Web3 technologies, protocols, and applications with academic rigor and empirical evidence"
        }
      ]
    }
  }
}

// Update mock functions to support category filtering
function getMockArticles(locale: Locale, page: number, limit: number, category?: string): ArticlesResponse {
  const mockArticles: Article[] = [
    {
      id: '1',
      title: locale === 'us' ? 'Loopscale launches for more efficient Solana DeFi' : 'Loopscale推出更高效的Solana DeFi',
      content: 'Mary Governance, co-founder of Solana DeFi startup Loopscale, wants to give blockchain farmers "send a facet". This innovative approach aims to revolutionize the DeFi landscape on Solana by providing more efficient lending and borrowing mechanisms.',
      excerpt: locale === 'us' ? 'Mary Governance, co-founder of Solana DeFi startup Loopscale, wants to give blockchain farmers "send a facet"' : 'Solana DeFi初创公司Loopscale的联合创始人Mary Governance希望为区块链农民提供"发送一个方面"',
      slug: 'loopscale-launches-efficient-solana-defi',
      author: {
        name: 'JACK KUBRIC',
        avatar: '/avatars/jack-kubric.jpg'
      },
      publishedAt: '2024-04-11T00:00:00Z',
      updatedAt: '2024-04-11T00:00:00Z',
      category: 'News',
      tags: ['solana', 'defi', 'loopscale', 'business'],
      featuredImage: '/placeholder.svg',
      readTime: 6,
      locale
    },
    {
      id: '2',
      title: locale === 'us' ? 'SEC approves ETH ETF options, faces new DOGE filing' : 'SEC批准ETH ETF期权，面临新的DOGE申请',
      content: 'Crypto products come to market as BlackRock, Fidelity and others have filed for spot ETH ETF approval, and we may see more developments in the regulatory landscape.',
      excerpt: locale === 'us' ? 'crypto products come to market BlackRock, Fidelity and others have filed a spot ETH ETF approved, and we may see more' : '加密产品进入市场，BlackRock、Fidelity等公司已申请现货ETH ETF批准，我们可能会看到更多发展',
      slug: 'sec-approves-eth-etf-options-doge-filing',
      author: {
        name: 'JACK KUBRIC',
        avatar: '/avatars/jack-kubric.jpg'
      },
      publishedAt: '2024-04-11T00:00:00Z',
      updatedAt: '2024-04-11T00:00:00Z',
      category: 'News',
      tags: ['sec', 'eth', 'etf', 'doge', 'regulation'],
      featuredImage: '/placeholder.svg',
      readTime: 3,
      locale
    },
    {
      id: '3',
      title: locale === 'us' ? 'SEC approves ETH ETF options, faces new DOGE filing' : 'SEC批准ETH ETF期权，面临新的DOGE申请',
      content: 'Crypto products come to market as BlackRock, Fidelity and others have filed for spot ETH ETF approval, and we may see more developments in the regulatory landscape.',
      excerpt: locale === 'us' ? 'crypto products come to market BlackRock, Fidelity and others have filed a spot ETH ETF approved, and we may see more' : '加密产品进入市场，BlackRock、Fidelity等公司已申请现货ETH ETF批准，我们可能会看到更多发展',
      slug: 'sec-approves-eth-etf-options-doge-filing-research',
      author: {
        name: 'JACK KUBRIC',
        avatar: '/avatars/jack-kubric.jpg'
      },
      publishedAt: '2024-04-11T00:00:00Z',
      updatedAt: '2024-04-11T00:00:00Z',
      category: 'Research',
      tags: ['sec', 'eth', 'etf', 'doge', 'research'],
      featuredImage: '/placeholder.svg',
      readTime: 3,
      locale
    },
    {
      id: '4',
      title: locale === 'us' ? 'How crypto\'s evolving with fundamentals' : '加密货币如何与基本面共同发展',
      content: 'Full article content here...',
      excerpt: locale === 'us' ? 'SCALE is one of bitcoin said that certain metrics are becoming more important to gauging the success of projects' : 'SCALE是比特币之一，表示某些指标对于衡量项目成功变得更加重要',
      slug: 'how-crypto-evolving-xG0zT',
      author: {
        name: 'Jack Kubinec',
        avatar: '/avatars/jack.jpg'
      },
      publishedAt: '2024-04-17T10:00:00Z',
      updatedAt: '2024-04-17T10:00:00Z',
      category: 'News',
      tags: ['crypto', 'fundamentals', 'analysis'],
      featuredImage: '/images/crypto-fundamentals.jpg',
      readTime: 5,
      locale
    },
    {
      id: '5',
      title: locale === 'us' ? 'Loopscale launches for more efficient Solana DeFi' : 'Loopscale推出更高效的Solana DeFi',
      content: 'Full article content here...',
      excerpt: locale === 'us' ? 'Mary Generative, co-founder of Solana DeFi startup Loopscale, wants to give blockchain borrow-lend a facelift' : 'Solana DeFi初创公司Loopscale的联合创始人Mary Generative希望为区块链借贷提供新面貌',
      slug: 'loopscale-launches-solana-defi',
      author: {
        name: 'Jack Kubinec',
        avatar: '/avatars/jack.jpg'
      },
      publishedAt: '2024-04-17T08:00:00Z',
      updatedAt: '2024-04-17T08:00:00Z',
      category: 'News',
      tags: ['solana', 'defi', 'loopscale'],
      featuredImage: '/images/loopscale-launch.jpg',
      readTime: 4,
      locale
    },
  ]

  return {
    articles: mockArticles,
    total: 50,
    page,
    limit,
    hasMore: page * limit < 50
  }
}


function getMockArticle(locale: Locale, slug: string, category?: string): Article | null {
  const mockArticles = getMockArticles(locale, 1, 10, category)
  return mockArticles.articles.find(article => article.slug === slug) || null
}