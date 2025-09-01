import React, { useState, useEffect } from 'react';
import type { HomeNewsArticle, Locale } from '@/types';
import { formatDate } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import { fetchArticles } from '@/api/articles';
import ArticleLink from '@/components/common/react/ArticleLink';

interface NewsGridProps {
  initialArticles: HomeNewsArticle[];
  locale: Locale;
}

interface NewsCategory {
  key: string;
  name: string;
  category_name?: string;
  active?: boolean;
}

export default function NewsGrid({ initialArticles, locale }: NewsGridProps) {
  const t = createTranslator(locale);
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // 定义新闻分类
  const newsCategories: NewsCategory[] = [
    { key: 'all', name: t('common.all'), active: true },
    { key: 'opinion', name: t('common.opinion'), category_name: 'opinion' },
    { key: 'markets', name: t('common.markets'), category_name: 'markets' },
    { key: 'decibels', name: t('common.decibels'), category_name: 'decibels' },
    { key: 'exchange', name: t('common.exchange'), category_name: 'exchange' },
    { key: 'feature', name: t('common.feature'), category_name: 'feature' },
    { key: 'announcement', name: t('common.announcement'), category_name: 'announcement' },
    { key: 'people', name: t('common.people'), category_name: 'people' },
    { key: 'event', name: t('common.event'), category_name: 'event' },
    { key: 'analysis', name: t('common.analysis'), category_name: 'analysis' },
    { key: 'newsletter', name: t('common.lightspeedNewsletter'), category_name: 'newsletter' },
  ];

  // 处理分类切换
  const handleCategoryChange = async (categoryKey: string) => {
    if (categoryKey === activeCategory || loading) return;

    setLoading(true);
    setActiveCategory(categoryKey);

    try {
      if (categoryKey === 'all') {
        // 显示所有文章，使用初始数据
        setArticles(initialArticles);
      } else {
        // 根据 category_name 获取特定分类的文章
        const category = newsCategories.find((cat) => cat.key === categoryKey);
        if (category?.category_name) {
          // const response = await fetchArticles(locale, 1, 6, {
          //   business_type_name: 'news',
          //   category_name: category.category_name,
          //   order_by: 'Latest',
          // });

          // if (response?.articles) {
          //   setArticles(response.articles as any);
          // }
          setArticles(initialArticles);
        }
      }
    } catch (error) {
      console.error('Error fetching articles for category:', error);
      // 出错时保持当前数据
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 px-6 border border-y-0 border-border">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text font-medium text-foreground">{t('common.news')}</h2>
          <p className="text text-muted-foreground">{t('common.breakingHeadlines')}</p>
        </div>
        <a href={`/${locale}/news`} className="text-primary text-sm font-medium mt-6 hover:text-primary/80 inline-block transition-colors">
          {t('common.moreFromNews')}
        </a>
      </div>

      {/* 分类导航 */}
      <div className="flex space-x-6 mb-8 overflow-x-auto">
        {newsCategories.map((category) => (
          <button key={category.key} onClick={() => handleCategoryChange(category.key)} disabled={loading} className={`text-sm whitespace-nowrap px-3 py-1 rounded transition-colors disabled:opacity-50 ${activeCategory === category.key ? 'bg-[#F5F6F7] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} aria-pressed={activeCategory === category.key}>
            {category.name}
          </button>
        ))}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* 新闻文章网格 */}
      <div className={`grid grid-cols-6 gap-4 ${loading ? 'opacity-50' : ''}`}>
        {articles.map((article) => (
          <article key={article.entry_id} className="bg-white rounded overflow-hidden group">
            {/* 文章图片 */}
            <div className="relative">
              <ArticleLink 
                slug={article.slug} 
                locale={locale} 
                business={article.business_type_name || 'news'} 
                className="block"
              >
                <img 
                  src={article.img_url || '/placeholder.svg'} 
                  alt={article.title} 
                  className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" 
                  loading="lazy" 
                />
              </ArticleLink>
            </div>
            
            <div className="p-4">
              {/* 分类标签 - 可点击进入分类页面 */}
              <div className="flex flex-wrap gap-2 mb-2">
                <a 
                  href={`/${locale}/news/${article.category_name?.toLowerCase() || 'all'}`}
                  className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors"
                >
                  {article.business_type_name?.toUpperCase() || 'NEWS'}
                </a>
                {article.category_name && (
                  <a 
                    href={`/${locale}/news/${article.category_name.toLowerCase()}`}
                    className="text-xs text-muted-foreground uppercase hover:text-foreground transition-colors"
                  >
                    {article.category_name}
                  </a>
                )}
              </div>
              
              {/* 文章标题 - 可点击进入详情 */}
              <h3 className="font-medium text-foreground text-sm mt-1 mb-2 leading-tight">
                <ArticleLink 
                  slug={article.slug} 
                  locale={locale} 
                  business={article.business_type_name || 'news'}
                  className="hover:text-primary transition-colors"
                >
                  {article.title}
                </ArticleLink>
              </h3>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {article.sub_title || article.title}
              </p>
              
              {/* 文章元信息 */}
              <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                <span className="font-medium">
                  {formatDate(article.created_at, locale)} / {t('article.by')} <span className="text-foreground uppercase">{article.author.name}</span>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 无数据状态 */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('common.none')}</p>
        </div>
      )}
    </div>
  );
}
