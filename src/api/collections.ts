import type { ApiArticle, Locale, CollectionItem } from '../types';
import { SITE_CONFIG } from '../config/constants';

interface CollectionArticlesResponse {
  collectionId: string;
  articles: ApiArticle[];
  total: number;
  hasMore: boolean;
}

interface CollectionsApiResponse {
  code: number;
  msg: {
    en: string;
    zh: string;
  };
  data?: {
    list?: CollectionItem[];
    next?: boolean;
  };
}

const API_BASE_URL = SITE_CONFIG.API_BASE_URL;
const SSR_API_BASE_URL = SITE_CONFIG.SSR_API_BASE_URL || SITE_CONFIG.API_BASE_URL;

const getSsrCollectionsBaseUrl = () => (typeof window === 'undefined' ? SSR_API_BASE_URL : API_BASE_URL);

export async function fetchCollectionArticles(locale: Locale, collectionId: string, page: number = 1, limit: number = 11): Promise<CollectionArticlesResponse> {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    params.set('collection_id', collectionId);

    const response = await fetch(`${API_BASE_URL}/api/v1/collections/detail?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collection articles: ${response.statusText}`);
    }

    const result: {
      code: number;
      msg?: { en?: string; zh?: string } | string;
      data?: {
        list?: ApiArticle[];
        next?: boolean;
      };
    } = await response.json();

    if (result.code === 2000 && result.data) {
      const list = result.data.list || [];
      const hasMore = !!result.data.next;
      return {
        collectionId,
        articles: list,
        // 后端未返回 total，这里仅保留当前页数量以兼容旧字段
        total: list.length,
        hasMore,
      };
    }

    const msg = typeof result.msg === 'string' ? result.msg : result.msg?.en || result.msg?.zh || 'Unknown error';
    throw new Error(`Collection detail API Error: ${msg}`);
  } catch (error) {
    console.error('Error fetching collection articles:', error);
    return {
      collectionId,
      articles: [],
      total: 0,
      hasMore: false,
    };
  }
}

// 获取 Collections 列表数据
export async function fetchCollections(page: number = 1, limit: number = 10): Promise<{ items: CollectionItem[]; hasNext: boolean }> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  const response = await fetch(`${getSsrCollectionsBaseUrl()}/api/v1/collections?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.statusText}`);
  }

  const result: CollectionsApiResponse = await response.json();

  if (result.code !== 2000 || !result.data) {
    const msg = typeof result.msg === 'object' ? result.msg.en || result.msg.zh : 'Unknown error';
    throw new Error(`Collections API Error: ${msg}`);
  }

  const list = result.data.list || [];
  const next = !!result.data.next;

  return {
    items: list,
    hasNext: next,
  };
}
