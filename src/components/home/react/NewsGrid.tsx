import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { HomeNewsArticle, Locale } from '@/types';
import { formatDate } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import ArticleLink from '@/components/common/react/ArticleLink';

interface NewsGridProps {
  initialArticles?: HomeNewsArticle[];
  newsData?: Array<{
    tag: string;
    data: HomeNewsArticle[];
  }>;
  locale: Locale;
}

interface NewsCategory {
  key: string;
  name: string;
  category_name?: string;
  active?: boolean;
}

export default function NewsGrid({ newsData = [], locale }: NewsGridProps) {
  const t = createTranslator(locale);

  const [articles, setArticles] = useState<any[]>(newsData[0]?.data || []);
  const [activeCategory, setActiveCategory] = useState(newsData[0]?.tag.toLowerCase() || '');
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate news categories dynamically from newsData or use default categories
  const newsCategories: NewsCategory[] = useMemo(() => {
    const categories = newsData.map((item) => ({
      key: item.tag.toLowerCase(),
      name: item.tag,
      category_name: item.tag.toLowerCase(),
    }));
    return categories;
  }, [newsData]);

  // Handle scroll progress calculation for mobile horizontal scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  // Handle category switching with new data structure
  const handleCategoryChange = async (categoryKey: string) => {
    console.log('🚀 ~ handleCategoryChange ~ categoryKey:', categoryKey, activeCategory);
    if (categoryKey === activeCategory) return;

    setActiveCategory(categoryKey);

    const categoryData = newsData.find((item) => item.tag.toLowerCase() === categoryKey);
    console.log('🚀 ~ handleCategoryChange ~ categoryData:', categoryData);
    setArticles(categoryData?.data || []);
    
    // Reset scroll progress when category changes
    setScrollProgress(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  };

  // Add scroll event listener for mobile progress tracking
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="py-5 px-4 md:px-6 border border-y-0 border-border">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text font-medium text-foreground">{t('common.news')}</h2>
          <p className="hidden md:block text text-muted-foreground">{t('common.breakingHeadlines')}</p>
        </div>
        <a href="/news" className="text-primary text-sm font-medium hover:text-primary/80 md:inline-block transition-colors">
          {t('common.moreFromNews')}
        </a>
      </div>

      {/* Category navigation */}
      <div className="flex space-x-6 mb-5 md:mb-8 overflow-x-auto scrollbar-hide">
        {newsCategories?.map((category: any) => (
          <button key={category.key} onClick={() => handleCategoryChange(category.key)} className={`h-[40px] text-sm whitespace-nowrap px-[20px] rounded transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0 ${activeCategory === category.key ? 'bg-[#F5F6F7] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} aria-pressed={activeCategory === category.key}>
            {category.name}
          </button>
        ))}
      </div>

      {/* News articles grid */}
      {/* Mobile: 3 items per group with horizontal scroll */}
      <div className="md:hidden">
        <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide" onScroll={handleScroll}>
          {Array.from({ length: Math.ceil(articles.length / 3) }, (_, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-3 flex-shrink-0" style={{ width: 'calc(100vw - 32px)' }}>
              {articles.slice(groupIndex * 3, (groupIndex + 1) * 3).map((article) => (
                <article key={article.entry_id} className="bg-white rounded overflow-hidden group">
                  <div className="flex">
                    {/* Article image */}
                    <div className="relative flex-shrink-0">
                      <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name || 'news'} className="block">
                        <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-20 h-20 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </ArticleLink>
                    </div>

                    <div className="flex-1 pl-3 py-1">
                      {/* Category label */}
                      <div className="flex flex-wrap gap-2 mb-1">
                        <button className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">{article.category_name}</button>
                      </div>

                      {/* Article title */}
                      <h3 className="text-foreground text-sm leading-tight line-clamp-2 mb-2">
                        <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name || 'news'} className="hover:text-primary transition-colors">
                          {article.title}
                        </ArticleLink>
                      </h3>

                      {/* Article meta info */}
                      <div className="text-xs text-gray-500">
                        <span className="font-medium line-clamp-1">
                          <span data-date={article.created_at} data-locale={locale}>
                            {formatDate(article.created_at, locale)}
                          </span>{' '}
                          / {t('article.by')} <span className="text-foreground uppercase">{article.author.name}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile scroll progress indicator */}
        {articles.length > 3 && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-primary h-1 rounded-full transition-all duration-300 ease-out" style={{ width: `${scrollProgress}%` }} />
          </div>
        )}
      </div>

      {/* Desktop: Original horizontal scroll layout */}
      <div className="hidden md:block">
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
          {articles.map((article) => (
            <article key={article.entry_id} className="bg-white rounded overflow-hidden group flex-shrink-0" style={{ width: '212px' }}>
              <div className="flex flex-col h-full">
                {/* Article image */}
                <div className="relative w-full">
                  <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name || 'news'} className="block overflow-hidden">
                    <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-36 lg:h-32 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </ArticleLink>
                </div>

                <div className="flex flex-col py-4 h-full">
                  {/* Category label - clickable to enter category page */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">{article.category_name}</button>
                  </div>

                  {/* Article title - clickable to enter details */}
                  <h3 className="text-foreground mt-1 mb-2 leading-tight line-clamp-2">
                    <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name || 'news'} className="hover:text-primary transition-colors">
                      {article.title}
                    </ArticleLink>
                  </h3>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-4">{article.sub_title || article.title}</p>

                  {/* Article meta info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <span className="font-medium line-clamp-1">
                      <span data-date={article.created_at} data-locale={locale}>
                        {formatDate(article.created_at, locale)}
                      </span>{' '}
                      / {t('article.by')} <span className="text-foreground uppercase">{article.author.name}</span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
