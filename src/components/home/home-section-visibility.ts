import type {
  HomeLatestArticle,
  HomeMostReadArticle,
  HomeNewsArticle,
  HomeTopic,
} from '@/types';

export interface HomeNewsGroup {
  tag: string;
  data: HomeNewsArticle[];
}

/**
 * Resolve highlights data: prefer highlights (new API), fall back to
 * news_all (legacy).
 */
export function getHomeHighlightsArticles({
  highlights,
  newsAll,
}: {
  highlights?: HomeNewsArticle[] | null;
  newsAll?: HomeNewsArticle[] | null;
}): HomeNewsArticle[] {
  if (Array.isArray(highlights) && highlights.length > 0) {
    return highlights;
  }

  return Array.isArray(newsAll) ? newsAll : [];
}

export function hasItems<T>(items?: T[] | null): boolean {
  return Array.isArray(items) && items.length > 0;
}

export function hasNewsGroups(groups?: HomeNewsGroup[] | null): boolean {
  return Array.isArray(groups) && groups.some((group) => hasItems(group?.data));
}

export function hasRightSidebarContent(
  topics?: HomeTopic[] | null,
  mostRead?: HomeMostReadArticle[] | null,
): boolean {
  return hasItems(topics) || hasItems(mostRead);
}

export function hasBottomHomeSections({
  news,
  insights,
  research,
}: {
  news?: HomeNewsGroup[] | null;
  insights?: HomeLatestArticle[] | HomeMostReadArticle[] | HomeNewsArticle[] | null;
  research?: HomeLatestArticle[] | HomeMostReadArticle[] | HomeNewsArticle[] | null;
}): boolean {
  return hasNewsGroups(news) || hasItems(insights) || hasItems(research);
}

export function getHomeTopGridLayout({
  hasLatest,
  hasMainContent,
}: {
  hasLatest: boolean;
  hasMainContent: boolean;
}) {
  if (hasLatest && hasMainContent) {
    return {
      latest: 'col-span-3 py-5',
      main: 'col-span-6 border-x border-border py-5 px-6',
      right: 'col-span-3 space-y-6 py-5',
    };
  }

  if (hasLatest) {
    return {
      latest: 'col-span-9 py-5',
      main: null,
      right: 'col-span-3 space-y-6 py-5',
    };
  }

  if (hasMainContent) {
    return {
      latest: null,
      main: 'col-span-9 py-5 px-6',
      right: 'col-span-3 space-y-6 py-5',
    };
  }

  return {
    latest: null,
    main: null,
    right: 'col-span-12 space-y-6 py-5',
  };
}
