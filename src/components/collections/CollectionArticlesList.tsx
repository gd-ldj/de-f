import React, { useEffect, useRef, useState } from 'react';
import type { ApiArticle, Locale } from '@/types';
import { fetchCollectionArticles } from '@/api/collections';
import { formatDate, getLocalizedCategoryLabel, getLocalizedSubcategoryLabel, getLocalizedTagLabel } from '@/utils/util';
import type { SourceLanguage } from '@/types';
import { createTranslator } from '@/lib/i18n';
import { useAtom } from 'jotai';
import { persistedPromoteCodeAtom } from '@/stores';

interface CollectionArticlesListProps {
  locale: Locale;
  collectionId: string;
  initialArticles: ApiArticle[];
  hasMore: boolean;
  filterCategory?: string;
  filterSubCategory?: string;
  filterTag?: string;
}

const ITEMS_PER_PAGE = 11;

/**
 * 合集文章列表组件（移动端支持滚动触底自动加载）
 */
const CollectionArticlesList: React.FC<CollectionArticlesListProps> = ({ locale, collectionId, initialArticles, hasMore: initialHasMore, filterCategory, filterSubCategory, filterTag }) => {
  const [articles, setArticles] = useState<ApiArticle[]>(initialArticles || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const t = createTranslator(locale);
  const lang = locale as SourceLanguage;
  const [promoteCode, _] = useAtom(persistedPromoteCodeAtom);
  /**
   * 加载更多合集文章（用于移动端无限滚动）
   */
  const loadMoreArticles = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetchCollectionArticles(locale, collectionId, nextPage, 12);
      const nextArticles = response.articles || [];
      const mergedArticles = [...articles, ...nextArticles];
      setArticles(mergedArticles);
      setPage(nextPage);
      setHasMore(response.hasMore);
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
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef, hasMore, loading, page, articles]);

  return (
    <section className="px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-4 md:gap-y-6">
        {articles.map((article, index) =>
          index === 0 ? (
            <article key={article.entry_id} className="md:col-span-2 lg:col-span-2 overflow-hidden bg-white transition-shadow max-w-[460px]">
              <div className="relative">
                {article.img_url && (
                  <a href={`/collections/${collectionId}/${article.slug}`} className="block overflow-hidden">
                    <img src={article.img_url} alt={article.title} className="w-full md:h-[258px] lg:w-[460px] object-cover rounded-[2px] hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </a>
                )}
                <div className="absolute inset-x-0 bottom-0 px-4 md:px-6 py-3 bg-black/30 backdrop-blur" style={{ backdropFilter: 'blur(10px)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-white uppercase truncate">{[getLocalizedCategoryLabel(article, lang) || getLocalizedSubcategoryLabel(article, lang), ...(article.tags ? article.tags.slice(0, 2).map((tag: string) => getLocalizedTagLabel(tag, lang)) : [])].filter(Boolean).join('  ')}</div>
                    </div>
                    <div className="text-[11px] text-white/80 whitespace-nowrap">
                      {new Date(article.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })} <span className="">{`/ ${t('article.by')} `}</span> <span className="uppercase text-white">{article.author?.name || article.author_name}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-[10px] md:pt-2">
                <h2 className="text-base font-medium text-foreground mb-2 leading-tight">
                  <a href={`/collections/${collectionId}/${article.slug}-${promoteCode}`} className="hover:text-primary transition-colors line-clamp-2 md:line-clamp-1">
                    {article.title}
                  </a>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-1">{article.sub_title}</p>
              </div>
            </article>
          ) : (
            <article key={article.entry_id} className="overflow-hidden bg-white transition-shadow h-full py-2 md:py-0">
              <div className="flex gap-[10px] md:flex-col h-full">
                <div className="relative flex-shrink-0 w-22 h-22 md:w-full md:h-[127px] rounded-[2px]">
                  {article.img_url && (
                    <a href={`/collections/${collectionId}/${article.slug}`} className="block group w-full h-full hover:text-primary transition-colors rounded-[2px] overflow-hidden">
                      <img src={article.img_url} alt={article.title} className="w-full h-full object-cover rounded-[2px] hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </a>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    <span className="text-primary text-[10px] md:text-xs font-medium uppercase">{getLocalizedCategoryLabel(article, lang) || getLocalizedSubcategoryLabel(article, lang)}</span>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-muted-foreground text-[10px] md:text-xs uppercase">{getLocalizedTagLabel(article.tags.find((tag: string) => filterTag?.split(',').includes(tag)) || article.tags[0], lang)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-1 flex flex-col h-full">
                    <h3 className="text-[16px] md:text-[18px] font-medium text-foreground mb-[6px] md:mb-[10px] line-clamp-2">
                      <a href={`/collections/${collectionId}/${article.slug}-${promoteCode}`} className="hover:text-primary transition-colors leading-[140%]">
                        {article.title}
                      </a>
                    </h3>
                    <div className="hidden md:block">
                      <p className=" text-muted-foreground text-[12px] md:text-[14px] mb-2 md:mb-4 md:line-clamp-3 leading-[140%]">{article.sub_title}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center space-x-1 truncate">
                        <span>{formatDate(article.created_at, locale)}</span>
                        <span className="">{`/ ${t('article.by')} `}</span>
                        <span className="text-foreground uppercase truncate">{article.author?.name || article.author_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
      <div ref={sentinelRef} className="h-10 mt-4 flex items-center justify-center text-xs text-muted-foreground md:hidden">
        <span className="h-10 mt-4">{loading && t('common.loading')}</span>
        {!hasMore && !loading && articles.length > 0 && <span className="ml-2">{t('common.noMoreArticles')}</span>}
      </div>

      {articles.length > 0 && hasMore && (
        <div className="hidden md:flex items-center justify-center mt-8 mb-2">
          <button type="button" onClick={loadMoreArticles} disabled={loading} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-[2px] hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-[14px]">
            {loading ? t('common.loading') : t('common.loadMore')}
          </button>
        </div>
      )}
    </section>
  );
};

export default CollectionArticlesList;
