import React from 'react';
import type { HomeMostReadArticle, Locale } from '@/types';
import { formatDate } from '@/utils/util';
import { t } from '@/lib/i18n';
import ArticleLink from '@/components/common/react/ArticleLink';

interface ResearchGridProps {
  articles: HomeMostReadArticle[];
  locale: Locale;
}

export default function ResearchGrid({ articles, locale }: ResearchGridProps) {
  const researchArticles = articles.slice(0, 4); // 只显示前4篇文章

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {researchArticles.map((article, index) => (
        <article key={article.entry_id} className="rounded overflow-hidden group bg-white border border-gray-100 hover:shadow-md transition-shadow">
          {/* 研究卡片图片区域 */}
          <div className="relative">
            <ArticleLink slug={article.slug} locale={locale} business="research" className="block">
              <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </ArticleLink>
          </div>

          {/* 卡片内容区域 */}
          <div className="p-4">
            {/* 分类和标签 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {/* 分类标签 - 可点击进入分类页面 */}
              <a href={`/${locale}/research`} className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">
                {t(locale, 'research.blockworksResearch').toUpperCase()}
              </a>
            </div>

            {/* 文章内容 */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2 line-clamp-2 leading-tight">
                <ArticleLink slug={article.slug} locale={locale} business="research" className="hover:text-primary transition-colors">
                  {article.title}
                </ArticleLink>
              </h3>

              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">{t(locale, 'research.tradingBotsDescription')}</p>

              {/* 文章元信息 */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span>{formatDate(article.created_at, locale)}</span>
                  <span>/ {t(locale, 'article.by')} </span>
                  <span className="text-foreground">{t(locale, 'research.authorJack')}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
