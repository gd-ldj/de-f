import { SITE_CONFIG } from '@/config/constants';
import type { Locale, ApiArticle } from '@/types';

const API_BASE_URL = SITE_CONFIG.API_BASE_URL;

export interface LearnItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  firstLetter: string;
  createdAt: string;
  updatedAt: string;
}

// Learn 详情类型：在 ApiArticle 基础上增加一些归一化字段
export interface LearnDetailItem extends ApiArticle {
  id: string;
  description: string;
  content?: string;
  firstLetter: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearnItemsResponse {
  items: LearnItem[];
  total: number;
  hasNext?: boolean;
}

export interface LearnItemsByLetterResponse {
  [letter: string]: LearnItem[];
}

interface LearnListApiItem {
  entry_id: string;
  slug: string;
  title: string;
  sub_title: string;
  created_at: string;
  updated_at: string;
}

function getFirstLetterFromTitle(title: string): string {
  const trimmed = (title || '').trim();
  if (!trimmed) return '#';
  const firstChar = trimmed[0]!.toUpperCase();
  if (firstChar >= 'A' && firstChar <= 'Z') return firstChar;
  if (firstChar >= '0' && firstChar <= '9') return '#';
  return '#';
}

// Fetch all learn items from backend API (type=learn)
export async function fetchLearnItems(locale: Locale): Promise<LearnItemsResponse> {
  try {
    const localeParam = locale === 'us' ? 'en' : 'zh';
    const queryParts: string[] = [];
    queryParts.push(`type=learn`);
    queryParts.push(`locale=${encodeURIComponent(localeParam)}`);

    const queryString = queryParts.join('&');
    const response = await fetch(`${API_BASE_URL}/api/v1/articles?${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch learn items: ${response.statusText}`);
    }

    const result: {
      code: number;
      msg?: { en?: string; zh?: string } | string;
      data?: {
        list?: LearnListApiItem[];
        total?: number;
        next?: boolean;
      };
    } = await response.json();

    if (result.code === 2000 && result.data) {
      const list = result.data.list || [];
      const items: LearnItem[] = list.map((item) => ({
        id: item.entry_id,
        title: item.title,
        slug: item.slug,
        description: item.sub_title,
        firstLetter: getFirstLetterFromTitle(item.title),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return {
        items,
        total: result.data.total ?? items.length,
        hasNext: !!result.data.next,
      };
    }

    const message = typeof result.msg === 'string' ? result.msg : result.msg?.en || result.msg?.zh || 'Unknown error';
    throw new Error(`Learn API Error: ${message}`);
  } catch (error) {
    console.error('Error fetching learn items:', error);
    return {
      items: [],
      total: 0,
      hasNext: false,
    };
  }
}

// Fetch learn items grouped by first letter
export async function fetchLearnItemsByLetter(locale: Locale): Promise<LearnItemsByLetterResponse> {
  try {
    const { items } = await fetchLearnItems(locale);

    // Group items by first letter
    const groupedItems: LearnItemsByLetterResponse = {};

    items.forEach((item) => {
      const letter = item.firstLetter.toUpperCase();
      if (!groupedItems[letter]) {
        groupedItems[letter] = [];
      }
      groupedItems[letter].push(item);
    });

    // Sort each group alphabetically
    Object.keys(groupedItems).forEach((letter) => {
      groupedItems[letter].sort((a, b) => a.title.localeCompare(b.title));
    });

    return groupedItems;
  } catch (error) {
    console.error('Error fetching learn items by letter:', error);
    return {};
  }
}

// 获取单条 Learn 详情，并将 ApiArticle 映射为 LearnDetailItem
export async function fetchLearnItem(locale: Locale, slug: string): Promise<LearnDetailItem | null> {
  try {
    const localeParam = locale === 'us' ? 'en' : 'zh';
    const queryParts: string[] = [];
    queryParts.push(`type=learn`);
    queryParts.push(`slug=${encodeURIComponent(slug)}`);
    queryParts.push(`locale=${encodeURIComponent(localeParam)}`);

    const queryString = queryParts.join('&');
    const response = await fetch(`${API_BASE_URL}/api/v1/articles/info?${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch learn item: ${response.statusText}`);
    }

    const result: {
      code: number;
      msg?: { en?: string; zh?: string } | string;
      data?: ApiArticle;
    } = await response.json();

    if (result.code === 2000 && result.data) {
      const article = result.data;
      return {
        ...article,
        id: article.entry_id,
        description: article.sub_title,
        content: article.body,
        firstLetter: getFirstLetterFromTitle(article.title),
        createdAt: article.created_at,
        updatedAt: article.updated_at,
      };
    }

    const message = typeof result.msg === 'string' ? result.msg : result.msg?.en || result.msg?.zh || 'Unknown error';
    throw new Error(`Learn detail API Error: ${message}`);
  } catch (error) {
    console.error('Error fetching learn item:', error);
    return null;
  }
}

// Get all available letters that have learn items
export async function getAvailableLetters(locale: Locale): Promise<string[]> {
  try {
    const groupedItems = await fetchLearnItemsByLetter(locale);
    const letters = Object.keys(groupedItems).sort((a, b) => {
      // Sort with '#' first, then alphabetically
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });

    return letters;
  } catch (error) {
    console.error('Error getting available letters:', error);
    return [];
  }
}
