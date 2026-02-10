import React from 'react';
import type { HomeMostReadArticle, Locale } from '@/types';
import { formatDate, getArticleBusinessPath, getArticleCategoryLabel } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import ArticleLink from '@/components/common/react/ArticleLink';

interface ResearchGridProps {
  articles: HomeMostReadArticle[];
  locale: Locale;
}

export default function ResearchGrid({ articles, locale }: ResearchGridProps) {
  const t = createTranslator(locale);
  const researchArticles = articles.slice(0, 4); // Only show first 4 articles

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
                <a href="/research" className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">
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
              <p className="hidden md:block md:text-muted-foreground md:text-xs md:line-clamp-4 md:leading-relaxed">{article.sub_title}</p>

              {/* Article meta info */}
              <div className="flex items-center text-xs text-muted-foreground space-x-1">
                <span data-date={article.created_at} data-locale={locale}>
                  {formatDate(article.created_at, locale)}
                </span>
                <span>/ {t('article.by')} </span>
                <span className="text-foreground uppercase">{article.author.name}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop layout: Grid layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {researchArticles.map((article, index) => (
          <article key={article.entry_id} className="rounded overflow-hidden group bg-white border border-gray-100 hover:shadow-md transition-shadow">
            {/* Research card image area */}
            <div className="relative">
              <ArticleLink slug={article.slug} locale={locale} business="research" className="block overflow-hidden">
                <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-[186px] object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
              </ArticleLink>
            </div>

            {/* Card content area */}
            <div className="p-4">
              {/* Category and tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Category label - clickable to enter category page */}
                <button className="text-primary text-xs font-medium uppercase hover:text-primary/80 transition-colors">{getArticleCategoryLabel(article)}</button>
              </div>

              {/* Article content */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2 line-clamp-2 leading-tight">
                  <ArticleLink slug={article.slug} locale={locale} business="research" className="hover:text-primary transition-colors">
                    {article.title}
                  </ArticleLink>
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-4 leading-relaxed">{article.sub_title}</p>

                {/* Article meta info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1 truncate">
                    <span data-date={article.created_at} data-locale={locale}>
                      {formatDate(article.created_at, locale)}
                    </span>
                    <span>/ {t('article.by')} </span>
                    <span className="text-foreground uppercase truncate">{article.author.name}</span>
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
