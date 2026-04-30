import type { ApiArticle, Locale } from '@/types';
import ArticleLink from './ArticleLink';
import { formatDate, getArticleBusinessPath, getDisplayTopics, getLocalizedCategoryLabel, getLocalizedTagLabel } from '@/utils/util';
import type { SourceLanguage } from '@/types';
import { createTranslator } from '@/lib/i18n';
import { placeholderImageUrl } from '@/config/assets';

interface ArticleGridProps {
  articles: ApiArticle[];
  locale: Locale;
}

export default function ArticleGrid({ articles, locale }: ArticleGridProps) {
  const t = createTranslator(locale);
  const lang = locale as SourceLanguage;

  return (
    <div className="space-y-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:space-y-0 mb-1 md:mb-12 mt-5 md:mt-6 px-4 md:px-6">
      {articles.map((article, index) => (
        <article key={article.slug} className="rounded overflow-hidden">
          {/* Mobile: Left image, right content layout */}
          <div className="flex gap-3 md:block">
            {/* Article Image */}
            <div className="relative flex-shrink-0 w-22 h-22 md:w-full md:h-48">
              <ArticleLink slug={article.slug} locale={locale} article={article} business={getArticleBusinessPath(article)} className="block group w-full h-full overflow-hidden">
                <img src={article.img_url || placeholderImageUrl} alt={article.title} loading={index < 4 ? 'eager' : 'lazy'} className="w-full h-full object-cover rounded md:rounded-none hover:scale-105 transition-transform duration-300" />
                {article.business_type_name === 'Podcasts' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67 60" fill="#FF0000" className="w-8 h-8 md:w-12 md:h-12 drop-shadow-lg opacity-90 group-hover:opacity-100 transition-opacity" focusable={false} aria-hidden="true">
                      <path d="M63 14.87a7.885 7.885 0 00-5.56-5.56C52.54 8 32.88 8 32.88 8S13.23 8 8.32 9.31c-2.7.72-4.83 2.85-5.56 5.56C1.45 19.77 1.45 30 1.45 30s0 10.23 1.31 15.13c.72 2.7 2.85 4.83 5.56 5.56C13.23 52 32.88 52 32.88 52s19.66 0 24.56-1.31c2.7-.72 4.83-2.85 5.56-5.56C64.31 40.23 64.31 30 64.31 30s0-10.23-1.31-15.13z" />
                      <path fill="#FFF" d="M26.6 39.43L42.93 30 26.6 20.57z" />
                    </svg>
                  </div>
                )}
              </ArticleLink>
            </div>

            {/* Content area */}
            <div className="flex-1 md:mt-5">
              {/* Category and Tags */}
              <div className="flex flex-wrap gap-1 md:gap-2">
                {/* Category Badge */}
                <span className="text-primary text-[10px] md:text-xs font-medium uppercase">{getLocalizedCategoryLabel(article, lang)}</span>
                {/* Category Badge */}
                {/* {getArticleSubcategoryLabel(article) && <span className="text-primary text-[10px] md:text-xs font-medium uppercase">{getArticleSubcategoryLabel(article)}</span>} */}
                {/* Tags */}
                {getDisplayTopics(article).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {getDisplayTopics(article).slice(0, 1).map((tag, index) => (
                      <span key={index} className="text-muted-foreground text-[10px] md:text-xs uppercase">
                        {getLocalizedTagLabel(tag, lang)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="pt-1">
                <h3 className="text-[16px] font-medium text-foreground mb-[6px] md:mb-[10px] line-clamp-2">
                  <ArticleLink slug={article.slug} locale={locale} article={article} business={getArticleBusinessPath(article)} className="hover:text-primary transition-colors">
                    {article.title}
                  </ArticleLink>
                </h3>
                {article.sub_title && (
                  <div className="hidden md:block">
                    <p className="text-muted-foreground text-xs md:text-[16px] mb-2 md:mb-4 md:line-clamp-3">{article.sub_title}</p>
                  </div>
                )}
                {/* Article Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1 truncate">
                    <span>{formatDate(article.created_at, locale)}</span>
                    <span>{`/ ${t('article.by')} `}</span>
                    <span className="text-foreground uppercase truncate">{article.author?.name || article.author_name || 'DeTake'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
