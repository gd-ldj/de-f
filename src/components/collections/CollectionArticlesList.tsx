import React, { useEffect, useRef, useState } from 'react';
import type { ApiArticle, Locale } from '@/types';
import { fetchCollectionArticles } from '@/api/collections';
import { formatDate } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';

interface CollectionArticlesListProps {
  locale: Locale;
  collectionId: string;
  initialArticles: ApiArticle[];
  total: number;
}

const ITEMS_PER_PAGE = 10;

/**
 * 合集文章列表组件（移动端支持滚动触底自动加载）
 */
const CollectionArticlesList: React.FC<CollectionArticlesListProps> = ({ locale, collectionId, initialArticles, total }) => {
  const [articles, setArticles] = useState<ApiArticle[]>(initialArticles || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialArticles.length < total);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const t = createTranslator(locale);

  /**
   * 加载更多合集文章（用于移动端无限滚动）
   */
  const loadMoreArticles = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetchCollectionArticles(locale, collectionId, nextPage, ITEMS_PER_PAGE);
      const nextArticles = response.articles || [];
      const mergedArticles = [...articles, ...nextArticles];
      setArticles(mergedArticles);
      setPage(nextPage);
      setHasMore(mergedArticles.length < (response.total || 0));
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (typeof window !== 'undefined' && window.innerWidth >= 768) return;
        loadMoreArticles();
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef, hasMore, loading, page, articles]);

  return (
    <section className="px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {articles.map((article, index) =>
          index === 0 ? (
            <article key={article.entry_id} className="md:col-span-2 lg:col-span-2 overflow-hidden bg-white transition-shadow">
              <div className="relative">
                {article.img_url && (
                  <a href={`/${locale}/${article.business_type_name.toLowerCase()}/${article.slug}`} className="block">
                    <img src={article.img_url} alt={article.title} className="w-full h-[224px] md:h-[260px] object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </a>
                )}
                <div className="absolute inset-x-0 bottom-0 px-4 md:px-6 py-3 bg-black/30 backdrop-blur" style={{ backdropFilter: 'blur(10px)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3 items-center text-[11px] font-semibold tracking-wide">
                      <span className="uppercase text-white">{article.category_name}</span>
                      {article.tags &&
                        article.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="uppercase text-white">
                            {tag}
                          </span>
                        ))}
                    </div>
                    <div className="text-[11px] text-white/80 whitespace-nowrap">
                      {new Date(article.created_at).toLocaleDateString(locale === 'us' ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })} / <span className="uppercase text-white">{article.author?.name || article.author_name}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-4 md:py-5">
                <h2 className="text-lg md:text-xl font-both text-foreground mb-2 leading-tight">
                  <a href={`/${locale}/${article.business_type_name.toLowerCase()}/${article.slug}`} className="hover:text-primary transition-colors line-clamp-1">
                    {article.title}
                  </a>
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-1 md:line-clamp-1">{article.sub_title}</p>
              </div>
            </article>
          ) : (
            <article key={article.entry_id} className="overflow-hidden bg-white transition-shadow">
              <div className="flex gap-3 md:block">
                <div className="relative flex-shrink-0 w-22 h-22 md:w-full md:h-48">
                  {article.img_url && (
                    <a href={`/${locale}/${article.business_type_name.toLowerCase()}/${article.slug}`} className="block group w-full h-full hover:text-primary transition-colors" data-article-link="true" data-slug={article.slug} data-locale={locale}>
                      <img src={article.img_url} alt={article.title} className="w-full h-full object-cover rounded md:rounded-none hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </a>
                  )}
                </div>
                <div className="flex-1 md:mt-5">
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    <span className="text-primary text-[10px] md:text-xs font-medium uppercase">{article.category_name}</span>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 1).map((tag) => (
                          <span key={tag} className="text-muted-foreground text-[10px] md:text-xs uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-[16px] md:text-[18px] font-medium text-foreground mb-[6px] md:mb-[10px] line-clamp-2">
                      <a href={`/${locale}/${article.business_type_name.toLowerCase()}/${article.slug}`} className="hover:text-primary transition-colors" data-article-link="true" data-slug={article.slug} data-locale={locale}>
                        {article.title}
                      </a>
                    </h3>
                    <div className="hidden md:block">
                      <p className=" text-muted-foreground text-[12px] md:text-[14px] mb-2 md:mb-4 md:line-clamp-3">{article.sub_title}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <span>{formatDate(article.created_at, locale)}</span>
                        <span className="">{`/ ${t('article.by')} `}</span>
                        <span className="text-foreground uppercase">{article.author?.name || article.author_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        )}
      </div>
      <div ref={sentinelRef} className="h-10 mt-4 md:mt-6 flex items-center justify-center text-xs text-muted-foreground">
        {loading && (locale === 'us' ? 'Loading...' : '加载中...')}
        {/* {!hasMore && !loading && articles.length > 0 && (
          <span>{locale === 'us' ? 'No more articles' : '没有更多文章了'}</span>
        )} */}
      </div>
    </section>
  );
};

export default CollectionArticlesList;
