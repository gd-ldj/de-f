import type { ApiArticle, ArticlesResponse, Locale, ArticleCategory, ArticleBusinessType, ArticleTag, HomePageResponse, HomePageData } from '../types';
import { SITE_CONFIG } from '../config/constants';

/**
 * API configuration
 * Uses environment-based configuration from SITE_CONFIG
 */
const API_BASE_URL = SITE_CONFIG.API_BASE_URL;

/**
 * Fetch articles list with advanced filtering and pagination support
 * @param locale - Current locale
 * @param page - Page number (deprecated, use cursor for pagination)
 * @param limit - Items per page (default: 10)
 * @param options - Advanced filtering options
 * @returns Promise with articles response containing ApiArticle[]
 */
export async function fetchArticles(
  locale: Locale,
  page: number = 1,
  limit: number = 10,
  options?: {
    category?: string;
    business_type_name?: string;
    category_name?: string;
    tag?: string;
    author_name?: string;
    order_by?: 'Latest' | 'Popular' | 'Trending';
    cursor?: string;
    page?: number;
  }
): Promise<ArticlesResponse | null> {
  try {
    // Build query parameters manually to avoid encoding commas in tag parameter
    const queryParts: string[] = [];

    // Add locale parameter
    const localeParam = locale === 'us' ? 'en' : 'zh';
    queryParts.push(`locale=${encodeURIComponent(localeParam)}`);

    // Add limit
    queryParts.push(`limit=${encodeURIComponent(limit.toString())}`);

    // Add page parameter (use options.page if provided, otherwise use the page parameter)
    const pageNumber = options?.page || page;
    queryParts.push(`page=${encodeURIComponent(pageNumber.toString())}`);

    // Add optional filtering parameters
    if (options?.business_type_name) {
      queryParts.push(`business_type_name=${encodeURIComponent(options.business_type_name)}`);
    }
    if (options?.category_name) {
      // Don't encode commas in category_name parameter to preserve comma-separated values
      queryParts.push(`category_name=${options.category_name}`);
    }
    if (options?.tag) {
      // Don't encode commas in tag parameter to preserve comma-separated values
      queryParts.push(`tag=${options.tag}`);
    }
    if (options?.author_name) {
      queryParts.push(`author_name=${encodeURIComponent(options.author_name)}`);
    }
    if (options?.order_by) {
      queryParts.push(`order_by=${encodeURIComponent(options.order_by)}`);
    }
    if (options?.cursor) {
      queryParts.push(`cursor=${encodeURIComponent(options.cursor)}`);
    }

    // Legacy category support (map to business_type_name)
    if (options?.category && !options?.business_type_name) {
      queryParts.push(`business_type_name=${encodeURIComponent(options.category)}`);
    }

    const queryString = queryParts.join('&');
    const response = await fetch(`${API_BASE_URL}/api/v1/articles?${queryString}`, {
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
      const { list, pagination, next, total } = result.data;
      return {
        articles: list || [], // ApiArticle[] from backend
        total: pagination?.total || total || 0,
        page: page, // Keep for compatibility
        limit: pagination?.limit || limit,
        hasMore: pagination?.next || next || false,
        nextCursor: pagination?.next_cursor || null,
      };
    } else {
      throw new Error(`API Error: ${result.msg?.en || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    return null;
  }
}

/**
 * Fetch single article by slug
 * Optional lang param controls article language independently from site locale
 */
export async function fetchArticle(
  slug: string,
  locale?: Locale,
  category?: string,
  lang?: 'en' | 'zh'
): Promise<ApiArticle | null> {
  try {
    const params = new URLSearchParams();
    params.set('slug', slug);
    if (lang) {
      params.set('lang', lang);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/articles/info?${params.toString()}`, {
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
    return null;
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
export async function fetchHomePageData(): Promise<HomePageData | null> {
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
    return null;
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
    return null;
  }
}
