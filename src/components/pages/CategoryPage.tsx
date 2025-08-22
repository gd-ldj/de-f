import { useEffect, useState, useCallback } from 'react';
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
  initialTag: string;
  initialOrderBy: 'Latest' | 'Popular' | 'Trending';
}

interface FilterState {
  page: number;
  categoryName: string | string[];
  authorName: string;
  tag: string | string[];
  orderBy: 'Latest' | 'Popular' | 'Trending';
}

export default function CategoryPage({ locale, category, initialPage, initialCategoryName, initialAuthorName, initialTag, initialOrderBy }: CategoryPageProps) {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  // Helper function to parse comma-separated values from URL parameters
  const parseCommaSeparatedValue = (value: string): string | string[] => {
    if (!value) return '';
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part);
    return parts.length > 1 ? parts : value;
  };

  const [filters, setFilters] = useState<FilterState>({
    page: initialPage,
    categoryName: parseCommaSeparatedValue(initialCategoryName),
    authorName: initialAuthorName,
    tag: parseCommaSeparatedValue(initialTag),
    orderBy: initialOrderBy,
  });

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

    // Build the final URL manually to handle tag and category_name parameters without encoding
    let finalUrl = `${url.origin}${url.pathname}`;
    const searchParamsString = newSearchParams.toString();

    const manualParams = [];
    if (newFilters.categoryName) {
      const categoryValue = Array.isArray(newFilters.categoryName) ? newFilters.categoryName.join(',') : newFilters.categoryName;
      manualParams.push(`category_name=${categoryValue}`);
    }

    if (newFilters.tag) {
      const tagValue = Array.isArray(newFilters.tag) ? newFilters.tag.join(',') : newFilters.tag;
      manualParams.push(`tag=${tagValue}`);
    }
    if (!newFilters.categoryName && !newFilters.tag) {
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
    async (currentFilters: FilterState) => {
      setLoading(true);
      try {
        const options = {
          business_type_name: category.toLowerCase(),
          category_name: Array.isArray(currentFilters.categoryName) ? currentFilters.categoryName.join(',') : currentFilters.categoryName || undefined,
          author_name: currentFilters.authorName || undefined,
          tag: Array.isArray(currentFilters.tag) ? currentFilters.tag.join(',') : currentFilters.tag || undefined,
          order_by: currentFilters.orderBy,
        };

        const response = await fetchArticles(locale, currentFilters.page, itemsPerPage, options);
        if (response) {
          setArticles(response.articles || []);
          setTotal(response.total || 0);
        } else {
          setArticles([]);
          setTotal(0);
        }
      } catch (error) {
        setArticles([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [locale, category, itemsPerPage]
  );

  // Handle filter changes from FilterBar
  const handleFilterChange = useCallback(
    (filterType: string, value: any) => {
      let newFilters = { ...filters };

      switch (filterType) {
        case 'category':
          newFilters.categoryName = value;
          break;
        case 'author':
          newFilters.authorName = value;
          break;
        case 'topic':
        case 'tag':
          newFilters.tag = value;
          break;
        case 'orderBy':
          newFilters.orderBy = value;
          break;
      }

      // Reset to page 1 when filters change (except for page change)
      if (filterType !== 'page') {
        newFilters.page = 1;
      }

      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      const newFilters = { ...filters, page };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    const clearedFilters = {
      page: 1,
      categoryName: '',
      authorName: '',
      tag: '',
      orderBy: 'Latest' as const,
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
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

    const handleTopicChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { selectedValues } = customEvent.detail;
      // Pass the entire selectedValues array for multi-select support
      const tag = Array.isArray(selectedValues) && selectedValues.length > 0 ? selectedValues : '';
      handleFilterChange('tag', tag);
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
    document.addEventListener('filter:changed', handleTopicChange);
    document.addEventListener('filter:clear-all', handleClearAllEvent);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('category:changed', handleCategoryChange);
      document.removeEventListener('author:search', handleAuthorSearch);
      document.removeEventListener('filter:changed', handleTopicChange);
      document.removeEventListener('filter:clear-all', handleClearAllEvent);
    };
  }, [handleFilterChange, handleClearAll]);

  // Fetch articles when filters change
  useEffect(() => {
    fetchArticlesData(filters);
  }, [filters, fetchArticlesData]);

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-8">
      {/* Filter Bar */}
      <FilterBarReact locale={locale} viewMode="grid" authorName={filters.authorName} initialCategoryName={filters.categoryName} initialTag={filters.tag} />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && <ArticleGrid articles={articles} locale={locale} />}

      {/* No Results */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{locale === 'us' ? 'No articles found' : '未找到文章'}</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > itemsPerPage && <PaginationReact currentPage={filters.page} totalItems={total} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} locale={locale} />}
    </main>
  );
}
