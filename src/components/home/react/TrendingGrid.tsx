import React from 'react';
import type { HomeMostReadArticle, Locale } from '@/types';
import { formatDate } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import ArticleLink from '@/components/common/react/ArticleLink';

interface TrendingGridProps {
  articles: HomeMostReadArticle[];
  locale: Locale;
}

export default function TrendingGrid({ articles, locale }: TrendingGridProps) {
  const t = createTranslator(locale);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="py-5 px-4 md:px-6 border border-border space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="font-medium text-foreground">{t('common.trending')}</h3>
          <a href={`/${locale}/insights`} className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors px-2 py-1" aria-label={t('common.moreTrending')}>
            {t('common.moreTrending')}
          </a>
        </div>

        {/* Mobile layout: Simple vertical list */}
        <div className="block md:hidden space-y-4">
          {/* First 2 articles with vertical layout (image on top, text below) */}
          {articles.slice(0, 2).map((article, index) => (
            <article key={article.entry_id} className="space-y-3">
              {/* Top: Image */}
              <div className="w-full h-48 relative overflow-hidden rounded">
                <ArticleLink slug={article.slug} business="news" locale={locale} className="block h-full">
                  <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </ArticleLink>
              </div>

              {/* Bottom: Content */}
              <div className="space-y-2">
                <h4 className="line-clamp-2">
                  <ArticleLink slug={article.slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                    {article.title}
                  </ArticleLink>
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{article.sub_title}</p>
                <div className="flex items-center text-xs text-muted-foreground space-x-1 truncate">
                  <span data-date={article.created_at} data-locale={locale}>
                    {formatDate(article.created_at, locale)}
                  </span>
                  <span>/ {t('article.by')} </span>
                  <span className="text-foreground uppercase truncate">{article.author.name}</span>
                  {/* <a href={`/${locale}/authors/${encodeURIComponent(article.author.name)}`} className="text-foreground uppercase hover:text-primary transition-colors">{article.author.name}</a> */}
                </div>
              </div>
            </article>
          ))}

          {/* Third article with border and horizontal layout */}
          {articles.length > 2 && articles[2] && (
            <article className="flex space-x-3 p-4 border border-border rounded">
              {/* Left side: Image */}
              <div className="flex-shrink-0 w-22 h-22 relative overflow-hidden rounded">
                <ArticleLink slug={articles[2].slug} business="news" locale={locale} className="block h-full">
                  <img src={articles[2].img_url || '/placeholder.svg'} alt={articles[2].title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </ArticleLink>
              </div>

              {/* Right side: Content */}
              <div className="flex-1 py-1 flex flex-col justify-between">
                <h4 className="">
                  <ArticleLink slug={articles[2].slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                    {articles[2].title}
                  </ArticleLink>
                </h4>
                <div className="flex items-center text-xs text-muted-foreground space-x-1 truncate">
                  <span data-date={articles[2].created_at} data-locale={locale}>
                    {formatDate(articles[2].created_at, locale)}
                  </span>
                  <span>/ {t('article.by')} </span>
                  <span className="text-foreground uppercase truncate">{articles[2].author.name}</span>
                  {/* <a href={`/${locale}/authors/${encodeURIComponent(articles[2].author.name)}`} className="text-foreground uppercase hover:text-primary transition-colors">{articles[2].author.name}</a> */}
                </div>
              </div>
            </article>
          )}

          {/* Last 2 articles without images */}
          {articles.length > 3 &&
            articles.slice(3, 5).map((article, index) => (
              <article key={article.entry_id} className={`space-y-2 py-3 ${index < articles.slice(3, 5).length - 1 ? 'border-b border-border' : ''}`}>
                <h4 className="line-clamp-2">
                  <ArticleLink slug={article.slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                    {article.title}
                  </ArticleLink>
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 md:line-clamp-4">{article.sub_title}</p>
                <div className="flex items-center text-xs text-muted-foreground space-x-1">
                  <span data-date={article.created_at} data-locale={locale}>
                    {formatDate(article.created_at, locale)}
                  </span>
                  <span>/ {t('article.by')} </span>
                  <span className="text-foreground uppercase">{article.author.name}</span>
                  {/* <a href={`/${locale}/authors/${encodeURIComponent(article.author.name)}`} className="text-foreground uppercase hover:text-primary transition-colors">{article.author.name}</a> */}
                </div>
              </article>
            ))}
        </div>

        {/* Desktop layout: Complex grid layout */}
        <div className="hidden md:grid grid-cols-4 gap-4">
          {/* Left column: Two stacked cards */}
          {articles.length > 0 && (
            <div className="col-span-2 space-y-4">
              {articles.slice(0, 2).map((article, index) => (
                <article key={article.entry_id} className="h-[186px] relative overflow-hidden bg-white text-white flex group">
                  {/* Left side: Image */}
                  <div className="w-[330px] flex-none h-full relative overflow-hidden">
                    <ArticleLink slug={article.slug} business="news" locale={locale} className="block w-full h-full">
                      <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </ArticleLink>
                  </div>

                  {/* Right side: Content */}
                  <div className="pl-5 bg-white text-foreground flex flex-col justify-between pb-2">
                    <div>
                      <h4 className="font-medium text-[20px] leading-tight mb-3 line-clamp-2">
                        <ArticleLink slug={article.slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                          {article.title}
                        </ArticleLink>
                      </h4>

                      <p className="text-muted-foreground leading-relaxed mb-4 text-sm line-clamp-4">{article.sub_title}</p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-xs text-muted-foreground space-x-1 truncate">
                      <span data-date={article.created_at} data-locale={locale}>
                        {formatDate(article.created_at, locale)}
                      </span>
                      <span>/ {t('article.by')} </span>
                      {/* <a href={`/${locale}/authors/${encodeURIComponent(article.author.name)}`} className="text-foreground uppercase hover:text-primary transition-colors">{article.author.name}</a> */}
                      <span className="text-foreground uppercase truncate">{article.author.name}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Right column: Top large card and bottom two text-only cards */}
          <div className="col-span-2 space-y-4">
            {/* Top large card with image */}
            {articles.length > 2 && articles[2] && (
              <article className="h-[186px] block group hover:scale-[1.02] transition-transform duration-300 p-4 border border-border rounded">
                <div className="relative overflow-hidden rounded text-white flex">
                  {/* Left side: Image */}
                  <div className="w-[274px] flex-none h-full relative overflow-hidden">
                    <ArticleLink slug={articles[2].slug} business="news" locale={locale} className="block h-full">
                      <img src={articles[2].img_url || '/placeholder.svg'} alt={articles[2].title} className="w-full h-[154px] object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </ArticleLink>
                  </div>

                  {/* Right side: Content */}
                  <div className="w-2/3 pl-5 bg-white text-foreground flex flex-col justify-between pb-1">
                    <div>
                      <h4 className="font-medium text-xl leading-tight mb-2 line-clamp-2">
                        <ArticleLink slug={articles[2].slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                          {articles[2].title}
                        </ArticleLink>
                      </h4>

                      <p className="text-muted-foreground leading-relaxed mb-4 text-sm line-clamp-3">{articles[2].sub_title}</p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-xs text-muted-foreground space-x-1 truncate">
                      <span data-date={articles[2].created_at} data-locale={locale}>
                        {formatDate(articles[2].created_at, locale)}
                      </span>
                      <span>/ {t('article.by')} </span>
                      <span className="text-foreground uppercase truncate">{articles[2].author.name}</span>
                      {/* <a href={`/${locale}/authors/${encodeURIComponent(articles[2].author.name)}`} className="text-foreground uppercase hover:text-primary transition-colors">{articles[2].author.name}</a> */}
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Bottom two text-only cards */}
            {articles.length > 3 && (
              <div className="h-[186px] grid grid-cols-2 gap-4 p-4">
                {articles.slice(3, 5).map((article, index) => (
                  <article key={article.entry_id} className="transition-colors duration-300">
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
                        <ArticleLink slug={article.slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                          {article.title}
                        </ArticleLink>
                      </h4>

                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">{article.sub_title}</p>

                      {/* Date */}
                      {/* <div className="flex items-center text-xs text-muted-foreground space-x-1 truncate">
                        <span data-date={article.created_at} data-locale={locale}>
                          {formatDate(article.created_at, locale)}
                        </span>
                        <span>/ {t('article.by')} </span>
                        <span className="text-foreground uppercase truncate">{article.author.name}</span>
                      </div> */}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
