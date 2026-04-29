import { useEffect, useState, useCallback } from 'react';
import { fetchArticles } from '@/api/articles';
import type { ApiArticle, Locale } from '@/types';
import ArticleGrid from '@/components/common/react/ArticleGrid';
import PaginationReact from '@/components/common/react/Pagination';
import { createTranslator } from '@/lib/i18n';

interface TopicPageProps {
  locale: Locale;
  topic: string;
  topicSlug: string;
  initialPage: number;
}

/**
 * TopicPage component for displaying articles filtered by a specific topic/tag
 * Simple display without filtering functionality, only pagination
 */
export default function TopicPage({ locale, topic, topicSlug, initialPage }: TopicPageProps) {
  const t = createTranslator(locale);
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const itemsPerPage = 12;

  /**
   * Update URL when page changes
   */
  const updateURL = useCallback((page: number) => {
    const url = new URL(window.location.href);

    if (page > 1) {
      url.searchParams.set('page', page.toString());
    } else {
      url.searchParams.delete('page');
    }

    // Update URL without page reload
    window.history.replaceState({}, '', url.toString());
  }, []);

  /**
   * Fetch articles for the current topic
   */
  const fetchArticlesData = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const options = {
          topic_name: topic,
          order_by: 'Latest' as const,
          page: page,
        };

        const response = await fetchArticles(locale, page, itemsPerPage, options);
        console.log('🚀 ~ TopicPage ~ response:', response);
        if (response) {
          setArticles(response.articles || []);
          setTotal(response.total || 0);
        } else {
          setArticles([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Failed to fetch topic articles:', error);
        setArticles([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [locale, topic, itemsPerPage]
  );

  /**
   * Handle page change for pagination
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateURL(page);
    },
    [updateURL]
  );

  // Fetch articles when page changes
  useEffect(() => {
    fetchArticlesData(currentPage);
  }, [currentPage, fetchArticlesData]);

  return (
    <main className="max-w-[1440px] mx-auto py-4">
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
        <div className="text-center py-12 px-4 md:px-0">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-foreground mb-2">{t('common.noArticlesFound')}</h3>
            <p className="text-muted-foreground mb-4">
              {`${t('pages.topicNoArticlesPrefix')}${topic}${t('pages.topicNoArticlesSuffix')}`}
            </p>
            <a href="/" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              {t('common.browseAllArticles')}
            </a>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && articles.length > 0 && total > itemsPerPage && <PaginationReact currentPage={currentPage} totalItems={total} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} locale={locale} />}
    </main>
  );
}
