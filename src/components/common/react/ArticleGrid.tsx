import type { ApiArticle, Locale } from '@/types'

interface ArticleGridProps {
  articles: ApiArticle[]
  locale: Locale
}

export default function ArticleGrid({ articles, locale }: ArticleGridProps) {
  /**
   * Format date to readable string
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'us' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 mt-6">
      {articles.map((article) => (
        <article key={article.slug} className="rounded overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {/* Article Image */}
          <div className="relative">
            <a href={`/${locale}/${article.business_type_name}/${article.slug}`} className="block group">
              <img src={article.img_url || '/placeholder.svg'} alt={article.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
            </a>
          </div>

          {/* Article Content */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-foreground mb-3 line-clamp-2">
              <a href={`/${locale}/${article.business_type_name}/${article.slug}`} className="hover:text-primary transition-colors">
                {article.title}
              </a>
            </h3>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.sub_title}</p>

            {/* Article Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>{formatDate(article.created_at)}</span>
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