import { SITE_CONFIG } from '@/config/constants';
import { ssrFetch } from '@/lib/serverFetch';
import type { ApiArticle, ArticlesResponse, Locale } from '@/types';

const API_BASE_URL = SITE_CONFIG.API_BASE_URL;
const SSR_API_BASE_URL = SITE_CONFIG.SSR_API_BASE_URL;

const getApiBaseUrl = () => (typeof window === 'undefined' ? SSR_API_BASE_URL : API_BASE_URL);

interface SearchApiItem {
  type?: 'article' | 'podcast';
  entry_id: string;
  title: string;
  sub_title?: string | null;
  slug?: string | null;
  language?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  channel_name?: string | null;
  duration?: number | null;
  created_at: string;
  updated_at: string;
  img_url?: string | null;
  category_names?: string[] | null;
  subcategory_names?: string[] | null;
  business_type_name?: string | null;
  tags?: string[] | null;
}

function mapSearchItemToArticle(item: SearchApiItem): ApiArticle {
  const isPodcast = item.type === 'podcast';

  return {
    entry_id: item.entry_id,
    title: item.title,
    sub_title: item.sub_title || '',
    slug: item.slug || item.entry_id,
    author_name: item.author_name || item.channel_name || '',
    author_avatar: item.author_avatar || undefined,
    created_at: item.created_at,
    updated_at: item.updated_at,
    category_names: item.category_names || (isPodcast ? ['Voices'] : []),
    subcategory_names: item.subcategory_names || [],
    business_type_name: item.business_type_name || (isPodcast ? 'Podcasts' : 'News'),
    tags: item.tags || [],
    img_url: item.img_url || undefined,
    language: item.language || undefined,
  };
}

export async function searchContent(
  locale: Locale,
  keyword: string,
  limit: number = 8,
  options?: {
    cursor?: string | null;
    page?: number;
    signal?: AbortSignal;
  },
): Promise<ArticlesResponse | null> {
  try {
    const params = new URLSearchParams();
    params.set('q', keyword);
    params.set('locale', locale);
    params.set('limit', String(limit));

    if (options?.cursor) {
      params.set('cursor', options.cursor);
    } else {
      params.set('page', String(options?.page || 1));
    }

    const response = await ssrFetch(`${getApiBaseUrl()}/api/v1/search?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: options?.signal,
      endpointName: 'searchContent',
    });

    if (!response.ok) {
      throw new Error(`Failed to search content: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.code === 2000 && result.data) {
      const { list, pagination } = result.data;

      return {
        articles: Array.isArray(list) ? list.map(mapSearchItemToArticle) : [],
        total: pagination?.total || 0,
        page: pagination?.page || options?.page || 1,
        limit: pagination?.limit || limit,
        hasMore: Boolean(pagination?.next),
        nextCursor: pagination?.next_cursor || null,
      };
    }

    throw new Error(`API Error: ${result.msg?.en || result.msg?.zh || 'Unknown error'}`);
  } catch (error) {
    console.error('Error searching content:', error);
    return null;
  }
}
