import React, { useState, useEffect } from 'react';
import { formatDateSSR } from '../../../utils/timezone';
import { fetchArticles } from '../../../api/articles';
import type { ApiArticle, Locale } from '../../../types';
import { DEFAULT_PROMOTE_CODE } from '@/config/constants';
import { createTranslator } from '@/lib/i18n';

interface ResearchArticle {
  id: string;
  slug?: string; // Article slug for URL generation
  title: string;
  description: string;
  author: string;
  date: string;
  image: string;
  categories: string[];
}

interface RecentResearchProps {
  locale: Locale;
}

/**
 * Recent Research component displaying a featured research article
 * Shows article image, categories, title, description, and author information
 * Fetches real-time data from the research API
 */
const RecentResearch: React.FC<RecentResearchProps> = ({ locale }) => {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = createTranslator(locale);
  /**
   * Transform API response to component data structure
   */
  const transformApiData = (apiArticle: ApiArticle): ResearchArticle => {
    return {
      id: apiArticle.entry_id,
      slug: apiArticle.slug,
      title: apiArticle.title,
      description: apiArticle.sub_title,
      author: apiArticle.author_name,
      date: formatDateSSR(apiArticle.created_at, locale),
      image: apiArticle.img_url || '',
      categories: [apiArticle.category_name, ...apiArticle.tags],
    };
  };

  /**
   * Fetch research articles from API
   */
  const fetchResearchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchArticles(locale, 1, 2, {
        business_type_name: 'Research',
        order_by: 'Latest',
      });

      if (data && data.articles && data.articles.length > 0) {
        const transformedArticles = data.articles.map(transformApiData);
        setArticles(transformedArticles);
      } else {
        throw new Error('No research articles found');
      }
    } catch (err) {
      console.error('Failed to fetch research data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load research data');
      // Fallback to default articles
      setArticles([
        {
          id: '1',
          slug: 'fusaka-fork-takes-shape-as-pectra-enters-final-stretch',
          title: 'Fusaka fork takes shape as Pectra enters final stretch',
          description: "Ethereum core developers finalize Pectra's May 7 launch and wrap scoping of the next upgrade",
          author: 'JACK KUBINEC',
          date: 'Apr 11, 2025',
          image: '/detake.svg',
          categories: ['MARKETS POLICY', 'DEFI'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchData();
  }, [locale]);
  /**
   * Generate article URL with promote code
   * Follows the same pattern as ArticleLink.astro component
   */
  const getArticleUrl = (slug: string) => {
    // Get promote code from localStorage or use default
    const promoteCode = (typeof window !== 'undefined' ? localStorage.getItem('promote_code') : null) || DEFAULT_PROMOTE_CODE;
    return `/${locale}/research/${slug}-${promoteCode}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="">
        <h3 className="text-lg font-medium text-foreground mb-6">{locale === 'us' ? 'Recent Research' : '最新研究'}</h3>
        <div className="space-y-4 animate-pulse">
          <div className="w-full h-48 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || articles.length === 0) {
    return (
      <div className="">
        <h3 className="text-lg font-medium text-foreground mb-6">{locale === 'us' ? 'Recent Research' : '最新研究'}</h3>
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <p className="text-red-600 text-sm">{locale === 'us' ? 'Failed to load research data. Please try again later.' : '加载研究数据失败，请稍后重试。'}</p>
          <button onClick={fetchResearchData} className="mt-2 text-sm text-red-700 hover:text-red-900 underline">
            {locale === 'us' ? 'Retry' : '重试'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Title */}
      <h3 className="text-lg font-medium text-foreground mb-6">{locale === 'us' ? 'Recent Research' : '最新研究'}</h3>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {articles.map((article) => {
          const articleUrl = article.slug ? getArticleUrl(article.slug) : '#';
          return (
            <div key={article.id} className="space-y-2">
              {/* Article Image */}
              <a href={articleUrl} className="block relative w-full h-48 rounded overflow-hidden group">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity cursor-pointer"
                  onError={(e) => {
                    // Fallback to a placeholder color background if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      parent.innerHTML = '<div class="flex items-center justify-center h-full text-white font-medium">Blockworks</div>';
                    }
                  }}
                />
              </a>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-4">
                {article.categories.map((category: string, index: number) => (
                  <span key={index} className="text-xs font-medium text-primary uppercase tracking-wide">
                    {category}
                  </span>
                ))}
              </div>

              {/* Article Title */}
              <h4 className="text-lg font-medium text-foreground leading-tight">
                <a href={articleUrl} className="hover:text-primary transition-colors cursor-pointer line-clamp-2">
                  {article.title}
                </a>
              </h4>

              {/* Article Description */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{article.description}</p>

              {/* Author and Date */}
              <div className="flex items-center justify-start text-xs text-muted-foreground space-x-1">
                <span>{article.date}</span>
                <p class="font-medium text-foreground space-x-1">
                  <span class="text-muted-foreground mr-[2px] ">/ {t('article.by')} </span>
                  <span class="text-foreground uppercase">{article.author}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentResearch;
export type { ResearchArticle };
