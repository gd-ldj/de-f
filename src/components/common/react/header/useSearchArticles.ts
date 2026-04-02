import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchArticles } from '@/api/articles';
import type { ApiArticle, Locale } from '@/types';

interface UseSearchArticlesOptions {
  locale: Locale;
  debounceMs?: number;
  pageSize?: number;
}

interface UseSearchArticlesReturn {
  query: string;
  setQuery: (q: string) => void;
  results: ApiArticle[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  recommended: ApiArticle[];
  isLoadingRecommended: boolean;
}

export function useSearchArticles({
  locale,
  debounceMs = 300,
  pageSize = 8,
}: UseSearchArticlesOptions): UseSearchArticlesReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allResultsRef = useRef<ApiArticle[]>([]);

  // Recommended (popular) articles for empty query state
  const [recommended, setRecommended] = useState<ApiArticle[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const recommendedFetchedRef = useRef(false);

  useEffect(() => {
    if (recommendedFetchedRef.current) return;
    recommendedFetchedRef.current = true;
    setIsLoadingRecommended(true);

    const controller = new AbortController();
    fetchArticles(locale, 1, pageSize, {
      signal: controller.signal,
    })
      .then((res) => {
        if (res?.articles) {
          setRecommended(res.articles.slice(0, pageSize));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingRecommended(false));

    return () => controller.abort();
  }, [locale, pageSize]);

  const doSearch = useCallback(
    async (keyword: string, pageNum: number, append: boolean) => {
      if (!keyword.trim()) {
        setResults([]);
        setHasMore(false);
        allResultsRef.current = [];
        return;
      }

      // Abort previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);

      try {
        // Fetch a larger batch and filter client-side (no search API yet)
        const fetchPage = Math.ceil((pageNum * pageSize) / 20);
        const response = await fetchArticles(locale, fetchPage, 20, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (response?.articles) {
          const lowerKeyword = keyword.toLowerCase();
          const filtered = response.articles.filter(
            (a) =>
              a.title.toLowerCase().includes(lowerKeyword) ||
              a.sub_title?.toLowerCase().includes(lowerKeyword) ||
              a.author_name?.toLowerCase().includes(lowerKeyword),
          );

          const maxItems = pageNum * pageSize;

          if (append) {
            const combined = [...allResultsRef.current, ...filtered];
            // Deduplicate by entry_id
            const seen = new Set<string>();
            const unique = combined.filter((a) => {
              if (seen.has(a.entry_id)) return false;
              seen.add(a.entry_id);
              return true;
            });
            allResultsRef.current = unique;
            setResults(unique.slice(0, maxItems));
            setHasMore(unique.length > maxItems || (response.hasMore && filtered.length > 0));
          } else {
            allResultsRef.current = filtered;
            setResults(filtered.slice(0, maxItems));
            setHasMore(filtered.length > maxItems || (response.hasMore && filtered.length > 0));
          }
        } else {
          if (!append) {
            allResultsRef.current = [];
            setResults([]);
          }
          setHasMore(false);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Search error:', err);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [locale, pageSize],
  );

  // Debounced search on query change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setHasMore(false);
      setPage(1);
      allResultsRef.current = [];
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, 1, false);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs, doSearch]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, nextPage, true);
  }, [isLoading, hasMore, page, query, doSearch]);

  const reset = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasMore(false);
    setPage(1);
    allResultsRef.current = [];
    abortRef.current?.abort();
  }, []);

  return { query, setQuery, results, isLoading, hasMore, loadMore, reset, recommended, isLoadingRecommended };
}
