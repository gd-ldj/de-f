import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchArticles } from '@/api/articles';
import type { ApiArticle, Locale } from '@/types';
import FilterBarReact from '@/components/common/react/FilterBar';
import ArticleGrid from '@/components/common/react/ArticleGrid';
import PaginationReact from '@/components/common/react/Pagination';

interface CategoryPageProps {
  locale: Locale;
  category: string;
  initialPage: number;
  initialCategoryName: string;
  initialAuthorName: string;
  initialSubcategoryName: string;
  initialTag: string;
  initialOrderBy: 'Latest' | 'Popular' | 'Trending';
}

interface FilterState {
  page: number;
  categoryName: string | string[];
  authorName: string;
  subcategoryName: string | string[];
  tag: string | string[];
  orderBy: 'Latest' | 'Popular' | 'Trending';
}

export default function CategoryPage({ locale, category, initialPage, initialCategoryName, initialAuthorName, initialSubcategoryName, initialTag, initialOrderBy }: CategoryPageProps) {
  // Helper function to parse comma-separated values from URL parameters
  const parseCommaSeparatedValue = (value: string): string | string[] => {
    if (!value) return '';
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part);
    return parts.length > 1 ? parts : value;
  };
  const normalizeFilterValues = (value: string | string[]) => {
    if (!value) return [];
    const rawValues = Array.isArray(value) ? value : value.split(',').map((part) => part.trim());
    return rawValues.filter((part) => part);
  };
  const areFilterValuesEqual = (left: string | string[], right: string | string[]) => {
    const leftValues = normalizeFilterValues(left);
    const rightValues = normalizeFilterValues(right);
    if (leftValues.length !== rightValues.length) return false;
    return leftValues.every((value, index) => value === rightValues[index]);
  };

  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastFetchKeyRef = useRef<string>('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const filtersRef = useRef<FilterState>({
    page: initialPage,
    categoryName: parseCommaSeparatedValue(initialCategoryName),
    authorName: initialAuthorName,
    subcategoryName: parseCommaSeparatedValue(initialSubcategoryName),
    tag: parseCommaSeparatedValue(initialTag),
    orderBy: initialOrderBy,
  });

  const [filters, setFilters] = useState<FilterState>({
    page: initialPage,
    categoryName: parseCommaSeparatedValue(initialCategoryName),
    authorName: initialAuthorName,
    subcategoryName: parseCommaSeparatedValue(initialSubcategoryName),
    tag: parseCommaSeparatedValue(initialTag),
    orderBy: initialOrderBy,
  });

  // Keep filtersRef in sync
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const itemsPerPage = 12;

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterState) => {
    const url = new URL(window.location.href);

    // Clear existing search params to rebuild them
    const newSearchParams = new URLSearchParams();

    // Update URL parameters based on filters
    if (newFilters.page > 1) {
      newSearchParams.set('page', newFilters.page.toString());
    }

    if (newFilters.authorName) {
      newSearchParams.set('author_name', newFilters.authorName);
    }

    if (newFilters.orderBy !== 'Latest') {
      newSearchParams.set('order_by', newFilters.orderBy);
    }

    // Build the final URL manually to handle subcategory_name, tag and category_name parameters without encoding
    let finalUrl = `${url.origin}${url.pathname}`;
    const searchParamsString = newSearchParams.toString();

    const manualParams = [];
    if (newFilters.categoryName) {
      const categoryValue = Array.isArray(newFilters.categoryName) ? newFilters.categoryName.join(',') : newFilters.categoryName;
      manualParams.push(`category_name=${categoryValue}`);
    }

    if (newFilters.subcategoryName) {
      const subcategoryValue = Array.isArray(newFilters.subcategoryName) ? newFilters.subcategoryName.join(',') : newFilters.subcategoryName;
      manualParams.push(`subcategory_name=${subcategoryValue}`);
    }
    if (newFilters.tag) {
      const tagValue = Array.isArray(newFilters.tag) ? newFilters.tag.join(',') : newFilters.tag;
      manualParams.push(`tag=${tagValue}`);
    }
    if (!newFilters.categoryName && !newFilters.subcategoryName && !newFilters.tag) {
      manualParams.length = 0;
    }
    const allParams = [];
    if (searchParamsString) {
      allParams.push(searchParamsString);
    }
    if (manualParams.length > 0) {
      allParams.push(...manualParams);
    }

    if (allParams.length > 0) {
      finalUrl += `?${allParams.join('&')}`;
    }

    // Update URL without page reload
    window.history.replaceState({}, '', finalUrl);
  }, []);

  // Fetch articles based on current filters
  const fetchArticlesData = useCallback(
    async (currentFilters: FilterState, append = false) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Increment request ID to track request order
      requestIdRef.current += 1;
      const currentRequestId = requestIdRef.current;

      setLoading(true);
      loadingRef.current = true;
      try {
        const options = {
          business_type_name: category,
          category_name: Array.isArray(currentFilters.categoryName) ? currentFilters.categoryName.join(',') : currentFilters.categoryName || undefined,
          author_name: currentFilters.authorName || undefined,
          subcategory_name: Array.isArray(currentFilters.subcategoryName) ? currentFilters.subcategoryName.join(',') : currentFilters.subcategoryName || undefined,
          tag: Array.isArray(currentFilters.tag) ? currentFilters.tag.join(',') : currentFilters.tag || undefined,
          order_by: currentFilters.orderBy,
          page: currentFilters.page,
          signal: abortController.signal,
        };

        const response = await fetchArticles(locale, currentFilters.page, itemsPerPage, options);

        // Check if this request was cancelled or superseded by a newer request
        if (abortController.signal.aborted || currentRequestId !== requestIdRef.current) {
          console.log('[fetchArticlesData] Request cancelled or superseded, ignoring response');
          return;
        }

        if (response) {
          if (append) {
            // Mobile infinite scroll: append new articles
            setArticles((prev) => [...prev, ...(response.articles || [])]);
          } else {
            // Desktop pagination: replace articles
            setArticles(response.articles || []);
          }
          setTotal(response.total || 0);

          // Check if there are more articles to load
          const currentTotal = append ? articles.length + (response.articles || []).length : (response.articles || []).length;
          const hasMoreValue = currentTotal < (response.total || 0);
          setHasMore(hasMoreValue);
          hasMoreRef.current = hasMoreValue;
        } else {
          if (!append) {
            setArticles([]);
            setTotal(0);
          }
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('[fetchArticlesData] Request aborted');
          return;
        }

        // Check if this request was superseded
        if (currentRequestId !== requestIdRef.current) {
          console.log('[fetchArticlesData] Request superseded, ignoring error');
          return;
        }

        if (!append) {
          setArticles([]);
          setTotal(0);
        }
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        // Only update loading state if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    },
    [locale, category, itemsPerPage, articles.length],
  );

  // Load more articles for mobile infinite scroll
  const loadMoreArticles = useCallback(() => {
    // Check if mobile in real-time
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    console.log('[loadMoreArticles] isMobile:', isMobile, 'loading:', loadingRef.current, 'hasMore:', hasMoreRef.current);

    if (!isMobile || loadingRef.current || !hasMoreRef.current) return;

    const nextPage = filtersRef.current.page + 1;
    console.log('[loadMoreArticles] Loading page:', nextPage);
    setFilters((prev) => ({ ...prev, page: nextPage }));
  }, []);

  // Handle filter changes from FilterBar
  const handleFilterChange = useCallback(
    (filterType: string, value: any) => {
      let newFilters = { ...filters };
      let didValueChange = false;

      switch (filterType) {
        case 'category':
          didValueChange = !areFilterValuesEqual(value, filters.categoryName);
          newFilters.categoryName = value;
          break;
        case 'author':
          didValueChange = value !== filters.authorName;
          newFilters.authorName = value;
          break;
        case 'subcategory':
          didValueChange = !areFilterValuesEqual(value, filters.subcategoryName);
          newFilters.subcategoryName = value;
          break;
        case 'tag':
          didValueChange = !areFilterValuesEqual(value, filters.tag);
          newFilters.tag = value;
          break;
        case 'orderBy':
          didValueChange = value !== filters.orderBy;
          newFilters.orderBy = value;
          break;
      }

      // Keep the SSR page when child filters emit their initial sync event.
      if (filterType !== 'page' && didValueChange) {
        newFilters.page = 1;
        setHasMore(true); // Reset hasMore when filters change
      }

      const isSameCategory = areFilterValuesEqual(newFilters.categoryName, filters.categoryName);
      const isSameSubcategory = areFilterValuesEqual(newFilters.subcategoryName, filters.subcategoryName);
      const isSameTag = areFilterValuesEqual(newFilters.tag, filters.tag);
      const isSameAuthor = newFilters.authorName === filters.authorName;
      const isSameOrder = newFilters.orderBy === filters.orderBy;
      const isSamePage = newFilters.page === filters.page;
      if (isSameCategory && isSameSubcategory && isSameTag && isSameAuthor && isSameOrder && isSamePage) {
        return;
      }

      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL],
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === filters.page) return;
      const newFilters = { ...filters, page };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL],
  );

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    const clearedFilters = {
      page: 1,
      categoryName: '',
      authorName: '',
      subcategoryName: '',
      tag: '',
      orderBy: 'Latest' as const,
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
    setHasMore(true); // Reset hasMore when clearing filters
  }, [updateURL]);

  // Listen for filter events from FilterBar
  useEffect(() => {
    const handleCategoryChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { selectedValues } = customEvent.detail;
      // Pass the entire selectedValues array for multi-select support
      const categoryName = Array.isArray(selectedValues) && selectedValues.length > 0 ? selectedValues : '';
      handleFilterChange('category', categoryName);
    };

    const handleAuthorSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { query } = customEvent.detail;
      handleFilterChange('author', query || '');
    };

    const handleSubcategoryChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { selectedValues } = customEvent.detail;
      // Pass the entire selectedValues array for multi-select support
      const subcategoryName = Array.isArray(selectedValues) && selectedValues.length > 0 ? selectedValues : '';
      handleFilterChange('subcategory', subcategoryName);
    };
    const handleTagChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { selectedValues } = customEvent.detail;
      const tagValue = Array.isArray(selectedValues) && selectedValues.length > 0 ? selectedValues : '';
      handleFilterChange('tag', tagValue);
    };

    const handleClearAllEvent = () => {
      // Use setTimeout to ensure all components have processed the clear event first
      setTimeout(() => {
        handleClearAll();
      }, 0);
    };

    // Add event listeners
    document.addEventListener('category:changed', handleCategoryChange);
    document.addEventListener('author:search', handleAuthorSearch);
    document.addEventListener('subcategory:changed', handleSubcategoryChange);
    document.addEventListener('tag:changed', handleTagChange);
    document.addEventListener('filter:clear-all', handleClearAllEvent);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('category:changed', handleCategoryChange);
      document.removeEventListener('author:search', handleAuthorSearch);
      document.removeEventListener('subcategory:changed', handleSubcategoryChange);
      document.removeEventListener('tag:changed', handleTagChange);
      document.removeEventListener('filter:clear-all', handleClearAllEvent);
    };
  }, [handleFilterChange, handleClearAll]);

  // Fetch articles when filters change
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isPageIncrement = filters.page > 1;
    const shouldAppend = isMobile && isPageIncrement;

    const fetchKey = JSON.stringify({
      page: filters.page,
      categoryName: normalizeFilterValues(filters.categoryName),
      authorName: filters.authorName,
      subcategoryName: normalizeFilterValues(filters.subcategoryName),
      tag: normalizeFilterValues(filters.tag),
      orderBy: filters.orderBy,
    });

    // Skip if this is the same request
    if (fetchKey === lastFetchKeyRef.current) return;

    lastFetchKeyRef.current = fetchKey;
    fetchArticlesData(filters, shouldAppend);
  }, [filters, fetchArticlesData]);

  // Setup IntersectionObserver for mobile infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof window === 'undefined' || window.innerWidth >= 768) {
      console.log('[IntersectionObserver] Not setting up - sentinel:', !!sentinel, 'width:', typeof window !== 'undefined' ? window.innerWidth : 'SSR');
      return;
    }

    console.log('[IntersectionObserver] Setting up observer');
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        console.log('[IntersectionObserver] Entry:', entry.isIntersecting, 'loading:', loadingRef.current, 'hasMore:', hasMoreRef.current);
        // Use refs to avoid re-creating observer
        if (!entry.isIntersecting || loadingRef.current || !hasMoreRef.current) return;
        loadMoreArticles();
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => {
      console.log('[IntersectionObserver] Disconnecting');
      observer.disconnect();
    };
  }, [loadMoreArticles]);

  return (
    <div className="max-w-[1440px] mx-auto py-4">
      {/* Filter Bar - temporarily hidden
      <FilterBarReact locale={locale} viewMode="grid" authorName={filters.authorName} initialCategoryName={filters.categoryName} initialSubcategoryName={filters.subcategoryName} initialTag={filters.tag} businessTypeName={category} />
      */}

      <hr className="border-border mb-4" />

      {/* Loading State - Only show for initial load or desktop pagination */}
      {loading && articles.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Articles Grid */}
      {articles.length > 0 && <ArticleGrid articles={articles} locale={locale} />}

      {/* No Results */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12 px-4 md:px-0">
          <p className="text-muted-foreground">{locale === 'zh' ? '未找到文章' : 'No articles found'}</p>
        </div>
      )}

      {/* Mobile Infinite Scroll Sentinel and Loading Indicator */}
      <div ref={sentinelRef} className="h-10 mt-4 flex items-center justify-center text-xs text-muted-foreground md:hidden">
        {loading && articles.length > 0 && <span>{locale === 'zh' ? '加载中...' : 'Loading...'}</span>}
        {!hasMore && !loading && articles.length > 0 && <span>{locale === 'zh' ? '没有更多文章了' : 'No more articles'}</span>}
      </div>

      {/* Desktop Pagination - Hidden on mobile */}
      {!loading && total > itemsPerPage && (
        <div className="hidden md:block">
          <PaginationReact currentPage={filters.page} totalItems={total} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} locale={locale} />
        </div>
      )}
    </div>
  );
}
