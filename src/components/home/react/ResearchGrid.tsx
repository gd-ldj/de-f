import React from 'react';
import type { HomeMostReadArticle, Locale } from '@/types';
import { formatDate } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import ArticleLink from '@/components/common/react/ArticleLink';

interface ResearchGridProps {
  articles: HomeMostReadArticle[];
  locale: Locale;
}

export default function ResearchGrid({ articles, locale }: ResearchGridProps) {
  const t = createTranslator(locale);
  const researchArticles = articles.slice(0, 4); // 只显示前4篇文章
  console.log('🚀 ~ ResearchGrid ~ researchArticles:', researchArticles);

  return (
    <div>
      {/* Mobile layout: Horizontal list with left image, right text */}
      <div className="block sm:hidden">
        {researchArticles.map((article, index) => (
          <article key={article.entry_id} className="flex space-x-3 bg-white md:border border-gray-100 rounded py-3 hover:shadow-md transition-shadow">
            {/* Left side: Image */}
            <div className="flex-shrink-0 w-22 h-22 relative overflow-hidden rounded">
              <ArticleLink slug={article.slug} locale={locale} business="research" className="block h-full">
                <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
              </ArticleLink>
            </div>

            {/* Right side: Content */}
            <div className="flex-1 space-y-2">
              {/* Category tag */}
              <div className="flex flex-wrap gap-2">
                <a href={`/${locale}/research`} className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">
                  {article.author.name}
                </a>
              </div>

              {/* Article title */}
              <h3 className="text-[16px] md:text-[20px] font-medium text-foreground line-clamp-2 leading-tight">
                <ArticleLink slug={article.slug} locale={locale} business="research" className="hover:text-primary transition-colors">
                  {article.title}
                </ArticleLink>
              </h3>

              {/* Article description */}
              <p className="hidden md:block md:text-muted-foreground md:text-xs md:line-clamp-2 md:leading-relaxed">{t('research.tradingBotsDescription')}</p>

              {/* Article meta info */}
              <div className="flex items-center text-xs text-muted-foreground space-x-1">
                <span data-date={article.created_at} data-locale={locale}>
                  {formatDate(article.created_at, locale)}
                </span>
                <span>/ {t('article.by')} </span>
                <span className="text-foreground">JACK KUBINEC</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop layout: Grid layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {researchArticles.map((article, index) => (
          <article key={article.entry_id} className="rounded overflow-hidden group bg-white border border-gray-100 hover:shadow-md transition-shadow">
            {/* 研究卡片图片区域 */}
            <div className="relative">
              <ArticleLink slug={article.slug} locale={locale} business="research" className="block">
                <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-[186px] object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
              </ArticleLink>
            </div>

            {/* 卡片内容区域 */}
            <div className="p-4">
              {/* 分类和标签 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* 分类标签 - 可点击进入分类页面 */}
                <button className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">{article.category_name}</button>
              </div>

              {/* 文章内容 */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2 line-clamp-2 leading-tight">
                  <ArticleLink slug={article.slug} locale={locale} business="research" className="hover:text-primary transition-colors">
                    {article.title}
                  </ArticleLink>
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">{t('research.tradingBotsDescription')}</p>

                {/* 文章元信息 */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <span data-date={article.created_at} data-locale={locale}>
                      {formatDate(article.created_at, locale)}
                    </span>
                    <span>/ {t('article.by')} </span>
                    <span className="text-foreground">{t('research.authorJack')}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
