import type { ApiArticle, ArticlesResponse, Locale, ArticleCategory, ArticleBusinessType, ArticleTag, HomePageResponse, HomePageData } from '../types';

/**
 * API configuration
 */
// Use import.meta.env for browser-safe environment variables in Vite/Astro
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'https://preview-api.detake.com/';

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
  }
): Promise<ArticlesResponse | null > {
  try {

    // Build query parameters
    const params = new URLSearchParams();
    
    // Add locale parameter
    const localeParam = locale === 'us' ? 'en' : 'zh';
    params.append('locale', localeParam);
    
    // Add limit
    params.append('limit', limit.toString());
    
    // Add optional filtering parameters
    if (options?.business_type_name) {
      params.append('business_type_name', options.business_type_name);
    }
    if (options?.category_name) {
      params.append('category_name', options.category_name);
    }
    if (options?.tag) {
      params.append('tag', options.tag);
    }
    if (options?.author_name) {
      params.append('author_name', options.author_name);
    }
    if (options?.order_by) {
      params.append('order_by', options.order_by);
    }
    if (options?.cursor) {
      params.append('cursor', options.cursor);
    }
    
    // Legacy category support (map to business_type_name)
    if (options?.category && !options?.business_type_name) {
      params.append('business_type_name', options.category);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/articles?${params.toString()}`, {
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
      const { list, pagination } = result.data;
      return {
        articles: list || [], // ApiArticle[] from backend
        total: pagination?.total || 0,
        page: page, // Keep for compatibility
        limit: pagination?.limit || limit,
        hasMore: pagination?.has_more || false,
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
 * Fetch single article by slug and category
 * @param slug - Article slug
 * @param locale - Current locale (used to map API language to our Locale union)
 * @param category - Article category (unused in API call but kept for compatibility)
 * @returns Promise<ApiArticle | null> - Returns backend format directly
 */
export async function fetchArticle(slug: string, locale?: Locale, category?: string): Promise<ApiArticle | null> {
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