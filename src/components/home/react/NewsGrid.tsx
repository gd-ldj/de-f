import React, { useState, useEffect, useMemo } from 'react';
import type { HomeNewsArticle, Locale } from '@/types';
import { formatDate } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import { fetchArticles } from '@/api/articles';
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
  console.log('🚀 ~ NewsGrid ~ newsData:', newsData);
  const t = createTranslator(locale);

  const [articles, setArticles] = useState<any[]>(newsData[0]?.data || []);
  console.log('🚀 ~ NewsGrid ~ articles:', articles);
  const [activeCategory, setActiveCategory] = useState(newsData[0]?.tag.toLowerCase() || '');
  console.log('🚀 ~ NewsGrid ~ activeCategory:', activeCategory);

  // Generate news categories dynamically from newsData or use default categories
  const newsCategories: NewsCategory[] = useMemo(() => {
    const categories = newsData.map((item) => ({
      key: item.tag.toLowerCase(),
      name: item.tag,
      category_name: item.tag.toLowerCase(),
    }));
    return categories;
  }, [newsData]);

  // Handle category switching with new data structure
  const handleCategoryChange = async (categoryKey: string) => {
    console.log('🚀 ~ handleCategoryChange ~ categoryKey:', categoryKey, activeCategory);
    if (categoryKey === activeCategory) return;

    setActiveCategory(categoryKey);

    const categoryData = newsData.find((item) => item.tag.toLowerCase() === categoryKey);
    console.log('🚀 ~ handleCategoryChange ~ categoryData:', categoryData);
    setArticles(categoryData?.data || []);
  };

  return (
    <div className="py-5 px-4 md:px-6 border border-y-0 border-border">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text font-medium text-foreground">{t('common.news')}</h2>
          <p className="hidden md:block text text-muted-foreground">{t('common.breakingHeadlines')}</p>
        </div>
        <a href={`/${locale}/news`} className="hidden text-primary text-sm font-medium mt-6 hover:text-primary/80 md:inline-block transition-colors">
          {t('common.moreFromNews')}
        </a>
      </div>

      {/* 分类导航 */}
      <div className="flex space-x-6 mb-5 md:mb-8 overflow-x-auto scrollbar-hide">
        {newsCategories?.map((category: any) => (
          <button key={category.key} onClick={() => handleCategoryChange(category.key)} className={`text-sm whitespace-nowrap px-3 py-1 rounded transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0 ${activeCategory === category.key ? 'bg-[#F5F6F7] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} aria-pressed={activeCategory === category.key}>
            {category.name}
          </button>
        ))}
      </div>

      {/* 新闻文章网格 */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 `}>
        {articles.map((article) => (
          <article key={article.entry_id} className="bg-white rounded overflow-hidden group">
            {/* Mobile: Left image, right content layout */}
            <div className="flex sm:block">
              {/* 文章图片 */}
              <div className="relative flex-shrink-0 sm:w-full">
                <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name || 'news'} className="block">
                  <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-22 h-22 sm:w-full sm:h-36 lg:h-32 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </ArticleLink>
              </div>

              <div className="flex-1 pl-3 sm:p-4">
                {/* 分类标签 - 可点击进入分类页面 */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <a href={`/${locale}/news/${article.category_name?.toLowerCase() || 'all'}`} className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">
                    {article.business_type_name?.toUpperCase() || 'NEWS'}
                  </a>
                  {article.category_name && (
                    <a href={`/${locale}/news/${article.category_name.toLowerCase()}`} className="text-xs text-muted-foreground uppercase hover:text-foreground transition-colors">
                      {article.category_name}
                    </a>
                  )}
                </div>

                {/* 文章标题 - 可点击进入详情 */}
                <h3 className="text-foreground mt-1 mb-2 leading-tight line-clamp-2">
                  <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name || 'news'} className="hover:text-primary transition-colors">
                    {article.title}
                  </ArticleLink>
                </h3>

                <p className="hidden md:block text-sm text-muted-foreground mb-3 md:line-clamp-2">{article.sub_title || article.title}</p>

                {/* 文章元信息 */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  <span className="font-medium">
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
  );
}
