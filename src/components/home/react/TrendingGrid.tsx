import React from 'react';
import type { HomeMostReadArticle, Locale } from '@/types';
import { formatDate } from '@/utils/util';
import { useTranslation } from '@/lib/i18n';
import ArticleLink from '@/components/common/react/ArticleLink';

interface TrendingGridProps {
  articles: HomeMostReadArticle[];
  locale: Locale;
}

export default function TrendingGrid({ articles, locale }: TrendingGridProps) {
  const { t } = useTranslation(locale);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="py-5 px-6 border border-border space-y-6">
      <div>
        <h3 className="font-medium text-foreground mb-6">{t('common.trending')}</h3>

        {/* Grid layout for trending articles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Left column: Two stacked cards */}
          <div className="md:col-span-2 space-y-4">
            {articles.slice(0, 2).map((article, index) => (
              <article key={article.entry_id} className="relative overflow-hidden bg-whit text-white flex group">
                {/* Left side: Image */}
                <div className="w-1/3 relative overflow-hidden">
                  <ArticleLink slug={article.slug} business="news" locale={locale} className="block h-full">
                    <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </ArticleLink>
                </div>

                {/* Right side: Content */}
                <div className="w-2/3 p-6 bg-white text-foreground flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-lg leading-tight mb-3">
                      <ArticleLink slug={article.slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                        {article.title}
                      </ArticleLink>
                    </h4>

                    <p className="text-muted-foreground leading-relaxed mb-4 text-sm">{article.title}</p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">{formatDate(article.created_at, locale)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Right column: Top large card and bottom two text-only cards */}
          <div className="md:col-span-2 space-y-4">
            {/* Top large card with image */}
            {articles[2] && (
              <article className="block group hover:scale-[1.02] transition-transform duration-300 p-4 border border-border rounded">
                <div className="relative overflow-hidden rounded text-white h-[186px] flex">
                  {/* Left side: Image */}
                  <div className="w-1/3 relative overflow-hidden">
                    <ArticleLink slug={articles[2].slug} business="news" locale={locale} className="block h-full">
                      <img src={articles[2].img_url || '/placeholder.svg'} alt={articles[2].title} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </ArticleLink>
                  </div>

                  {/* Right side: Content */}
                  <div className="w-2/3 p-6 bg-white text-foreground flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-xl leading-tight mb-4">
                        <ArticleLink slug={articles[2].slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                          {articles[2].title}
                        </ArticleLink>
                      </h4>

                      <p className="text-muted-foreground leading-relaxed mb-4 text-sm">{articles[2].title}</p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="font-medium">{formatDate(articles[2].created_at, locale)}</span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Bottom two text-only cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {articles.slice(3, 5).map((article, index) => (
                <article key={article.entry_id} className="transition-colors duration-300">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground text-sm leading-tight">
                      <ArticleLink slug={article.slug} business="news" locale={locale} className="hover:text-primary transition-colors">
                        Telegram Trading Bots: Robinhood Without Borders
                      </ArticleLink>
                    </h4>

                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{article.title}</p>

                    {/* Date */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">{formatDate(article.created_at, locale)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
