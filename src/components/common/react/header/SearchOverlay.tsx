import * as React from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useSearchArticles } from './useSearchArticles';
import { headerTexts, HEADER_LOGO_BLACK_URL } from './constants';
import ArticleLink from '@/components/common/react/ArticleLink';
import { formatDate, getArticleBusinessPath, getLocalizedCategoryLabel, getLocalizedTagLabel } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import type { ApiArticle, Locale, SourceLanguage } from '@/types';

interface SearchOverlayProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
}

const PC_PAGE_SIZE = 8; // 4 columns x 2 rows
const MOBILE_PAGE_SIZE = 10;

export default function SearchOverlay({ locale, isOpen, onClose }: SearchOverlayProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const pageSize = isMobile ? MOBILE_PAGE_SIZE : PC_PAGE_SIZE;
  const { query, setQuery, results, isLoading, hasMore, loadMore, reset } = useSearchArticles({
    locale,
    pageSize,
  });

  const t = createTranslator(locale);
  const texts = headerTexts[locale] || headerTexts.en;
  const lang = locale as SourceLanguage;

  // Detect mobile
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mobile infinite scroll via IntersectionObserver
  React.useEffect(() => {
    if (!isMobile || !isOpen || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isMobile, isOpen, hasMore, isLoading, loadMore]);

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" data-testid="search-overlay">
      {/* Full-screen white overlay */}
      <div className="absolute inset-0 bg-white flex flex-col">
        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex-1" />
            <img src={HEADER_LOGO_BLACK_URL} alt="deTake" className="h-6" />
            <div className="flex-1 flex justify-end">
              <button onClick={handleClose} className="p-1" aria-label="Close search" data-testid="search-close-btn">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Search input */}
        <div className={`${isMobile ? 'px-4 py-3' : 'px-6 md:px-12 lg:px-24 py-4'} border-b border-gray-200`}>
          {/* Desktop close button */}
          {!isMobile && (
            <div className="flex justify-end mb-2">
              <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close search" data-testid="search-close-btn">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={texts.actions.search || 'Search...'}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              data-testid="search-input"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results area - fixed height with scroll */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          data-testid="search-results"
        >
          {/* Loading state */}
          {isLoading && results.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && query.trim() && results.length === 0 && (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              No results found
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <>
              {isMobile ? (
                <MobileResults articles={results} locale={locale} lang={lang} t={t} onNavigate={handleClose} />
              ) : (
                <DesktopResults articles={results} locale={locale} lang={lang} t={t} onNavigate={handleClose} />
              )}

              {/* Load More button (PC only) */}
              {!isMobile && hasMore && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-8 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    data-testid="search-load-more"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    ) : null}
                    Load More
                  </button>
                </div>
              )}

              {/* Mobile infinite scroll sentinel */}
              {isMobile && hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-4">
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop: 4-column grid with article cards
function DesktopResults({
  articles,
  locale,
  lang,
  t,
  onNavigate,
}: {
  articles: ApiArticle[];
  locale: Locale;
  lang: SourceLanguage;
  t: (key: string) => string;
  onNavigate: () => void;
}) {
  return (
    <div className="px-6 md:px-12 lg:px-24 py-6">
      <div className="grid grid-cols-4 gap-6">
        {articles.map((article) => (
          <article key={article.entry_id} className="rounded overflow-hidden">
            {/* Image */}
            <div className="relative w-full h-40">
              <ArticleLink
                slug={article.slug}
                locale={locale}
                business={getArticleBusinessPath(article)}
                article={article}
                className="block group w-full h-full overflow-hidden"
                onClick={onNavigate}
              >
                <img
                  src={article.img_url || '/placeholder.svg'}
                  alt={article.title}
                  className="w-full h-full object-cover rounded hover:scale-105 transition-transform duration-300"
                />
              </ArticleLink>
            </div>

            {/* Content */}
            <div className="mt-3">
              {/* Category + Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-primary text-xs font-medium uppercase">
                  {getLocalizedCategoryLabel(article, lang)}
                </span>
                {article.tags?.slice(0, 1).map((tag, i) => (
                  <span key={i} className="text-muted-foreground text-xs uppercase">
                    {getLocalizedTagLabel(tag, lang)}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-base font-medium text-foreground mt-1.5 mb-1 line-clamp-2">
                <ArticleLink
                  slug={article.slug}
                  locale={locale}
                  article={article}
                  business={getArticleBusinessPath(article)}
                  className="hover:text-primary transition-colors"
                  onClick={onNavigate}
                >
                  {article.title}
                </ArticleLink>
              </h3>

              {/* Subtitle */}
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{article.sub_title}</p>

              {/* Meta */}
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{formatDate(article.created_at, locale)}</span>
                <span className="mx-1">/ {t('article.by')}</span>
                <span className="text-foreground uppercase truncate">
                  {article.author?.name || article.author_name}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// Mobile: list layout with thumbnail + info
function MobileResults({
  articles,
  locale,
  lang,
  t,
  onNavigate,
}: {
  articles: ApiArticle[];
  locale: Locale;
  lang: SourceLanguage;
  t: (key: string) => string;
  onNavigate: () => void;
}) {
  return (
    <div className="px-4 py-3">
      <div className="space-y-4">
        {articles.map((article) => (
          <article key={article.entry_id} className="flex gap-3">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-20 h-20">
              <ArticleLink
                slug={article.slug}
                locale={locale}
                business={getArticleBusinessPath(article)}
                article={article}
                className="block w-full h-full overflow-hidden rounded"
                onClick={onNavigate}
              >
                <img
                  src={article.img_url || '/placeholder.svg'}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </ArticleLink>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Category + Tags */}
              <div className="flex flex-wrap gap-1">
                <span className="text-primary text-[10px] font-medium uppercase">
                  {getLocalizedCategoryLabel(article, lang)}
                </span>
                {article.tags?.slice(0, 1).map((tag, i) => (
                  <span key={i} className="text-muted-foreground text-[10px] uppercase">
                    {getLocalizedTagLabel(tag, lang)}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-foreground mt-0.5 line-clamp-2">
                <ArticleLink
                  slug={article.slug}
                  locale={locale}
                  article={article}
                  business={getArticleBusinessPath(article)}
                  className="hover:text-primary transition-colors"
                  onClick={onNavigate}
                >
                  {article.title}
                </ArticleLink>
              </h3>

              {/* Meta */}
              <div className="flex items-center text-[10px] text-muted-foreground mt-1">
                <span>{formatDate(article.created_at, locale)}</span>
                <span className="mx-1">/ {t('article.by')}</span>
                <span className="text-foreground uppercase truncate">
                  {article.author?.name || article.author_name}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
