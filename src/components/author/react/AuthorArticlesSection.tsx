import React, { useState, useEffect } from 'react';
import type { Locale, ApiArticle } from '@/types';
import { fetchArticles } from '@/api/articles';
import Image from '@/components/common/react/Image';
import { createTranslator } from '@/lib/i18n';
import { getArticleBusinessPath, getLocalizedBusinessTypeLabel, getLocalizedTagLabel } from '@/utils/util';
import type { SourceLanguage } from '@/types';
import { placeholderImageUrl } from '@/config/assets';

interface AuthorArticlesSectionProps {
  articles: ApiArticle[];
  authorName: string;
  locale: Locale;
  hasMore: boolean;
  nextCursor?: string | null;
}

interface ArticleCardProps {
  article: ApiArticle;
  locale: Locale;
}

/**
 * Individual article card component
 */
const ArticleCard: React.FC<ArticleCardProps> = ({ article, locale }) => {
  const t = createTranslator(locale);
  const lang = locale as SourceLanguage;
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (locale === 'zh') {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      if (locale === 'ja') {
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const getArticleUrl = (): string => {
    const businessPath = getArticleBusinessPath(article);
console.log('🚀 ~ getArticleUrl ~ article.author:', article.author);
    // Determine user_id based on author.role or existing user_id field
    // User articles have author.role === "Authors" or have a user_id field
    let userId = article.user_id;
    if (!userId && article.author?.role === "Authors" && article.author?.id) {
      userId = article.author.id;
    }

    // User articles use /{userId}/ prefix (numeric ID distinguishes from language codes)
    if (userId) {
      return `/${userId}/article/${businessPath}/${article.slug}`;
    }
    return `/article/${businessPath}/${article.slug}`;
  };

  return (
    <article className="flex space-x-4 py-6 border-b border-border last:border-b-0">
      {/* Article Image */}
      <div className="flex-shrink-0">
        <a href={getArticleUrl()}>
          <Image src={article.img_url || placeholderImageUrl} fallbackSrc={placeholderImageUrl} alt={article.title} className="w-30 h-20 object-cover rounded-lg border border-gray-200" />
        </a>
      </div>

      {/* Article Content */}
      <div className="flex-1 min-w-0">
        {/* Category and Date */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
          <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs font-medium">{getLocalizedBusinessTypeLabel(article, lang)}</span>
          <span>•</span>
          <time>{formatDate(article.created_at)}</time>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
          <a href={getArticleUrl()}>{article.title}</a>
        </h3>

        {/* Subtitle/Excerpt */}
        {article.sub_title && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.sub_title}</p>}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                {getLocalizedTagLabel(tag, lang)}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{article.tags.length - 3}
                {t('author.moreCountSuffix')}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

/**
 * Author articles section component with infinite loading
 */
const AuthorArticlesSection: React.FC<AuthorArticlesSectionProps> = ({
  articles: initialArticles,
  authorName,
  locale,
  hasMore: initialHasMore,
  nextCursor: initialNextCursor
}) => {
  const [articles, setArticles] = useState<ApiArticle[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor || null);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Load more articles
   */
  const loadMoreArticles = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      
      const response = await fetchArticles(locale, currentPage + 1, 10, {
        author_name: authorName,
        order_by: 'Latest',
        cursor: nextCursor || undefined
      });

      if (response && response.articles.length > 0) {
        setArticles(prev => [...prev, ...response.articles]);
        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor ?? null);
        setCurrentPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = createTranslator(locale);

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('author.articles')}</h2>
        <div className="text-sm text-muted-foreground">
          {articles.length}
          {t('author.articlesCountSuffix')}
        </div>
      </div>

      {/* Articles List */}
      {articles.length > 0 ? (
        <div className="space-y-0">
          {articles.map((article) => (
            <ArticleCard key={article.entry_id} article={article} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-muted-foreground">{t('author.noArticles')}</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && articles.length > 0 && (
        <div className="text-center mt-8">
          <button onClick={loadMoreArticles} disabled={loading} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('author.loading')}</span>
              </div>
            ) : (
              <span>{t('author.loadMore')}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthorArticlesSection;
