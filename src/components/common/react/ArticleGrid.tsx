import type { ApiArticle, Locale } from '@/types'
import ArticleLink from './ArticleLink'
import { formatDate } from '@/utils/util';

interface ArticleGridProps {
  articles: ApiArticle[]
  locale: Locale
}

export default function ArticleGrid({ articles, locale }: ArticleGridProps) {


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 mt-6">
      {articles.map((article) => (
        <article key={article.slug} className="rounded overflow-hidden ">
          {/* Article Image */}
          <div className="relative">
            <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name} className="block group">
              <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
            </ArticleLink>
          </div>
          {/* Category and Tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {/* Category Badge */}
            <span className="text-primary text-xs font-medium uppercase">{article.category_name}</span>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-muted-foreground text-xs uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Article Content */}
          <div className="pt-1">
            <h3 className="text-2xl font-medium text-foreground mb-[10px] line-clamp-2">
              <ArticleLink slug={article.slug} locale={locale} business={article.business_type_name} className="hover:text-primary transition-colors">
                {article.title}
              </ArticleLink>
            </h3>

            <p className="text-muted-foreground text-[16px] mb-4 line-clamp-3">{article.sub_title}</p>

            {/* Article Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>{formatDate(article.created_at, locale)}</span>
                <span>/ by </span>
                <span className="text-foreground">{article.author_name}</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}