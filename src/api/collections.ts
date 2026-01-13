import type { ApiArticle, ArticlesResponse, Locale } from '../types'

interface CollectionArticlesResponse {
  collectionId: string
  articles: ApiArticle[]
  total: number
}

const MOCK_COLLECTION_ARTICLES: ApiArticle[] = [
  {
    entry_id: 'collection-article-1',
    title: 'Fusaka fork takes shape as Pectra enters final stretch',
    sub_title:
      "Ethereum core developers finalize Pectra's May 7 launch and wrap scoping of the next upgrade",
    slug: 'fusaka-fork-takes-shape-as-pectra-enters-final-stretch-1',
    body: '',
    author_name: 'JACK KUBINEC',
    author_avatar: '',
    created_at: '2025-04-11T00:00:00.000Z',
    updated_at: '2025-04-11T00:00:00.000Z',
    category_name: 'Markets Policy',
    business_type_name: 'News',
    tags: ['DEFI'],
    img_url: 'https://images.pexels.com/photos/6801643/pexels-photo-6801643.jpeg?auto=compress&cs=tinysrgb&w=1600',
    language: 'en',
    page_view: '1200',
    unique_vistor: '800',
    contact: {
      email: 'editor@example.com',
      phone: '',
      title: '',
      company: '',
      full_name: ''
    },
    author: {
      id: 'author-1',
      name: 'JACK KUBINEC',
      avatar_url: '',
      bio: ''
    }
  },
  {
    entry_id: 'collection-article-2',
    title: 'Monad ecosystem gains traction among DeFi builders',
    sub_title: 'New protocols and liquidity incentives drive early adoption across the Monad ecosystem',
    slug: 'monad-ecosystem-gains-traction-among-defi-builders-2',
    body: '',
    author_name: 'JACK KUBINEC',
    author_avatar: '',
    created_at: '2025-04-10T00:00:00.000Z',
    updated_at: '2025-04-10T00:00:00.000Z',
    category_name: 'Markets Policy',
    business_type_name: 'News',
    tags: ['DEFI'],
    img_url: 'https://images.pexels.com/photos/6801644/pexels-photo-6801644.jpeg?auto=compress&cs=tinysrgb&w=1600',
    language: 'en',
    page_view: '980',
    unique_vistor: '640',
    contact: {
      email: 'editor@example.com',
      phone: '',
      title: '',
      company: '',
      full_name: ''
    },
    author: {
      id: 'author-1',
      name: 'JACK KUBINEC',
      avatar_url: '',
      bio: ''
    }
  },
  {
    entry_id: 'collection-article-3',
    title: 'L2 activity spikes as onchain incentives roll out',
    sub_title: 'Rollup ecosystems compete for liquidity with aggressive airdrop and points programs',
    slug: 'l2-activity-spikes-as-onchain-incentives-roll-out-3',
    body: '',
    author_name: 'JACK KUBINEC',
    author_avatar: '',
    created_at: '2025-04-09T00:00:00.000Z',
    updated_at: '2025-04-09T00:00:00.000Z',
    category_name: 'Markets Policy',
    business_type_name: 'News',
    tags: ['DEFI'],
    img_url: 'https://images.pexels.com/photos/6801645/pexels-photo-6801645.jpeg?auto=compress&cs=tinysrgb&w=1600',
    language: 'en',
    page_view: '860',
    unique_vistor: '590',
    contact: {
      email: 'editor@example.com',
      phone: '',
      title: '',
      company: '',
      full_name: ''
    },
    author: {
      id: 'author-1',
      name: 'JACK KUBINEC',
      avatar_url: '',
      bio: ''
    }
  },
  {
    entry_id: 'collection-article-4',
    title: 'Stablecoin flows signal renewed risk appetite',
    sub_title: 'Onchain metrics show stablecoin rotation into higher beta assets across majors',
    slug: 'stablecoin-flows-signal-renewed-risk-appetite-4',
    body: '',
    author_name: 'JACK KUBINEC',
    author_avatar: '',
    created_at: '2025-04-08T00:00:00.000Z',
    updated_at: '2025-04-08T00:00:00.000Z',
    category_name: 'Markets Policy',
    business_type_name: 'News',
    tags: ['DEFI'],
    img_url: 'https://images.pexels.com/photos/6801646/pexels-photo-6801646.jpeg?auto=compress&cs=tinysrgb&w=1600',
    language: 'en',
    page_view: '740',
    unique_vistor: '520',
    contact: {
      email: 'editor@example.com',
      phone: '',
      title: '',
      company: '',
      full_name: ''
    },
    author: {
      id: 'author-1',
      name: 'JACK KUBINEC',
      avatar_url: '',
      bio: ''
    }
  }
]

export async function fetchCollectionArticles(
  locale: Locale,
  collectionId: string,
  page: number = 1,
  limit: number = 10,
): Promise<CollectionArticlesResponse> {
  const start = (page - 1) * limit
  const end = start + limit
  const pagedArticles = MOCK_COLLECTION_ARTICLES.slice(start, end)

  return {
    collectionId,
    articles: pagedArticles,
    total: MOCK_COLLECTION_ARTICLES.length,
  }
}

