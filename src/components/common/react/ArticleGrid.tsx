import type { ApiArticle, Locale } from '@/types'
import ArticleLink from './ArticleLink'
import { formatDate } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';

interface ArticleGridProps {
  articles: ApiArticle[];
  locale: Locale;
}

export default function ArticleGrid({ articles, locale }: ArticleGridProps) {
  const t = createTranslator(locale);

  return (
    <div className="space-y-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:space-y-0 mb-1 md:mb-12 mt-1 md:mt-6 px-4 md:px-6">
      {articles.map((article) => (
        <article key={article.slug} className="rounded overflow-hidden">
          {/* Mobile: Left image, right content layout */}
          <div className="flex gap-3 md:block">
            {/* Article Image */}
            <div className="relative flex-shrink-0 w-22 h-22 md:w-full md:h-48">
              <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name} className="block group w-full h-full">
                <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-full object-cover rounded md:rounded-none hover:scale-105 transition-transform duration-300" />
              </ArticleLink>
            </div>

            {/* Content area */}
            <div className="flex-1 md:mt-5">
              {/* Category and Tags */}
              <div className="flex flex-wrap gap-1 md:gap-2">
                {/* Category Badge */}
                <span className="text-primary text-[10px] md:text-xs font-medium uppercase">{article.category_name}</span>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 1).map((tag, index) => (
                      <span key={index} className="text-muted-foreground text-[10px] md:text-xs uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="pt-1">
                <h3 className="text-[16px] md:text-2xl font-medium text-foreground mb-[6px] md:mb-[10px] line-clamp-2">
                  <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name} className="hover:text-primary transition-colors">
                    {article.title}
                  </ArticleLink>
                </h3>
                <div className="hidden md:block">
                  <p className=" text-muted-foreground text-xs md:text-[16px] mb-2 md:mb-4 md:line-clamp-3">{article.sub_title}</p>
                </div>
                {/* Article Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1 truncate">
                    <span>{formatDate(article.created_at, locale)}</span>
                    <span className="">/ {t('article.by')} </span>
                    <span className="text-foreground uppercase">{article.author_name}</span>
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