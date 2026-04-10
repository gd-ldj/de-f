import { SITE_CONFIG } from '@/config/constants';
import { ssrFetch } from '@/lib/serverFetch';
import type { ApiArticle, ArticlesResponse, PodcastDetailItem, PodcastListItem, TranslatedPodcastPayload } from '@/types';

const API_BASE_URL = SITE_CONFIG.API_BASE_URL;
const SSR_API_BASE_URL = SITE_CONFIG.SSR_API_BASE_URL;

const getApiBaseUrl = () => (typeof window === 'undefined' ? SSR_API_BASE_URL : API_BASE_URL);

function extractYoutubeVideoId(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace(/^\/+/, '') || undefined;
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v') || undefined;
      }

      const match = url.pathname.match(/\/embed\/([^/?]+)/);
      if (match?.[1]) {
        return match[1];
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function toPodcastArticleBase(item: PodcastListItem): ApiArticle {
  const youtubeVideoId = extractYoutubeVideoId(item.youtube_url) || extractYoutubeVideoId(item.embed_url);
  const createdAt = item.published_at || item.created_at || new Date().toISOString();
  const updatedAt = item.updated_at || createdAt;

  return {
    entry_id: item.id,
    slug: item.id,
    title: item.title,
    sub_title: item.description,
    author_name: item.channel_name,
    author_avatar: item.channel_avatar,
    created_at: createdAt,
    updated_at: updatedAt,
    category_names: ['Voices'],
    subcategory_names: [],
    business_type_name: 'Podcasts',
    tags: [],
    img_url: item.thumbnail,
    language: 'en',
    youtube_video_id: youtubeVideoId,
    youtube_url: item.youtube_url,
    youtube_channel_url: item.channel_url,
    youtube_view_count:
      typeof item.view_count === 'string' ? Number.parseInt(item.view_count, 10) || undefined : item.view_count,
  };
}

export function mapPodcastListItemToArticle(item: PodcastListItem): ApiArticle {
  return toPodcastArticleBase(item);
}

export function mapPodcastDetailToArticle(item: PodcastDetailItem): ApiArticle {
  return {
    ...toPodcastArticleBase(item),
    transcript: item.content,
    body: item.content,
  };
}

export function mergeTranslatedPodcastIntoArticle(
  baseArticle: ApiArticle,
  translated: TranslatedPodcastPayload,
): ApiArticle {
  return {
    ...baseArticle,
    entry_id: translated.entry_id,
    slug: translated.entry_id,
    title: translated.title,
    transcript: translated.body,
    body: translated.body,
    language: translated.language,
    author_name: translated.channel_name || baseArticle.author_name,
    img_url: translated.thumbnail || baseArticle.img_url,
    youtube_url: translated.youtube_url || baseArticle.youtube_url,
    created_at: translated.published_at || baseArticle.created_at,
    updated_at: translated.published_at || baseArticle.updated_at,
  };
}

export async function fetchPodcastsList(
  page: number = 1,
  limit: number = 10,
  keyword?: string,
): Promise<ArticlesResponse | null> {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (keyword) {
      params.set('keyword', keyword);
    }

    const response = await ssrFetch(`${getApiBaseUrl()}/api/v1/podcasts?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      endpointName: 'fetchPodcastsList',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch podcasts: ${response.statusText}`);
    }

    const result = await response.json();
    const list: PodcastListItem[] = result.data?.list || [];
    const total = result.data?.total || 0;
    const next = result.data?.next || false;

    return {
      articles: list.map(mapPodcastListItemToArticle),
      total,
      page,
      limit,
      hasMore: next,
      nextCursor: null,
    };
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return null;
  }
}

export async function fetchPodcastDetail(id: string): Promise<ApiArticle | null> {
  try {
    const response = await ssrFetch(`${getApiBaseUrl()}/api/v1/podcasts/${encodeURIComponent(id)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      endpointName: 'fetchPodcastDetail',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch podcast detail: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && result.data) {
      return mapPodcastDetailToArticle(result.data as PodcastDetailItem);
    }

    throw new Error(`Podcast detail API Error: ${result.msg?.en || result.msg?.zh || 'Unknown error'}`);
  } catch (error) {
    console.error('Error fetching podcast detail:', error);
    return null;
  }
}

export async function fetchRecommendedPodcasts(entryId: string, limit: number = 3): Promise<ApiArticle[]> {
  try {
    const params = new URLSearchParams();
    params.set('entry_id', entryId);
    params.set('limit', String(limit));

    const response = await ssrFetch(`${getApiBaseUrl()}/api/v1/podcasts/recommend?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      endpointName: 'fetchRecommendedPodcasts',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recommended podcasts: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && result.data?.list) {
      const list: PodcastListItem[] = result.data.list;
      return list.map(mapPodcastListItemToArticle);
    }

    return [];
  } catch (error) {
    console.error('Error fetching recommended podcasts:', error);
    return [];
  }
}

export async function fetchTranslatedPodcast(entryId: string, language: string): Promise<TranslatedPodcastPayload | null> {
  try {
    const params = new URLSearchParams();
    params.set('entry_id', entryId);
    params.set('language', language);

    const response = await ssrFetch(`${getApiBaseUrl()}/api/v1/podcasts/translated?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      endpointName: 'fetchTranslatedPodcast',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch translated podcast: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.code === 2000 && result.data) {
      return result.data as TranslatedPodcastPayload;
    }

    throw new Error(`Podcast translation API Error: ${result.msg?.en || result.msg?.zh || 'Unknown error'}`);
  } catch (error) {
    console.error('Error fetching translated podcast:', error);
    return null;
  }
}
