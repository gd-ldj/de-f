import * as React from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useSearchArticles } from './useSearchArticles';
import { headerTexts, HEADER_LOGO_BLACK_URL } from './constants';
import ArticleLink from '@/components/common/react/ArticleLink';
import { formatDate, getArticleBusinessPath, getDisplayTopics, getLocalizedCategoryLabel, getLocalizedTagLabel } from '@/utils/util';
import { createTranslator } from '@/lib/i18n';
import type { ApiArticle, Locale, SourceLanguage } from '@/types';
import { placeholderImageUrl } from '@/config/assets';

interface SearchOverlayProps {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
}

const PC_PAGE_SIZE = 8; // 4 columns x 2 rows
const MOBILE_PAGE_SIZE = 10;
const HEADER_HEIGHT = 96; // px, matches DesktopHeader h-[96px]

function isPodcastArticle(article: ApiArticle) {
  return article.business_type_name?.toLowerCase() === 'podcasts';
}

function PodcastPlayIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 67 60"
      fill="#FF0000"
      className={className}
      focusable="false"
      aria-hidden="true"
    >
      <path d="M63 14.87a7.885 7.885 0 00-5.56-5.56C52.54 8 32.88 8 32.88 8S13.23 8 8.32 9.31c-2.7.72-4.83 2.85-5.56 5.56C1.45 19.77 1.45 30 1.45 30s0 10.23 1.31 15.13c.72 2.7 2.85 4.83 5.56 5.56C13.23 52 32.88 52 32.88 52s19.66 0 24.56-1.31c2.7-.72 4.83-2.85 5.56-5.56C64.31 40.23 64.31 30 64.31 30s0-10.23-1.31-15.13z" />
      <path fill="#FFF" d="M26.6 39.43L42.93 30 26.6 20.57z" />
    </svg>
  );
}

export default function SearchOverlay({ locale, isOpen, onClose }: SearchOverlayProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const prevResultsCountRef = React.useRef(0);

  const pageSize = isMobile ? MOBILE_PAGE_SIZE : PC_PAGE_SIZE;
  const { query, setQuery, results, isLoading, hasMore, loadMore, reset, recommended, isLoadingRecommended } = useSearchArticles({
    locale,
    pageSize,
  });

  const showRecommended = !query.trim() && recommended.length > 0;

  const hasVisibleContent = showRecommended || (query.trim() && results.length > 0);

  // After Load More: scroll to show newly loaded content
  React.useEffect(() => {
    const prev = prevResultsCountRef.current;
    if (!isMobile && prev > 0 && results.length > prev && scrollContainerRef.current) {
      // Scroll to where new content starts (smooth)
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
    prevResultsCountRef.current = results.length;
  }, [results.length, isMobile]);

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

  // Lock body scroll when open; reset search state when closed externally
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      reset();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Shared search input
  const searchInput = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={200}
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
  );

  // Mobile: full-screen overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-white" role="dialog" aria-modal="true" data-testid="search-overlay">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex-1" />
          <img src={HEADER_LOGO_BLACK_URL} alt="deTake" className="h-6" />
          <div className="flex-1 flex justify-end">
            <button onClick={handleClose} className="p-1" aria-label="Close search" data-testid="search-close-btn">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-gray-200">
          {searchInput}
        </div>

        {/* Results area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto" data-testid="search-results">
          {/* Recommended articles when query is empty */}
          {showRecommended && (
            <>
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{texts.actions.popular || 'Popular'}</span>
              </div>
              <MobileResults articles={recommended} locale={locale} lang={lang} t={t} onNavigate={handleClose} />
            </>
          )}
          {!query.trim() && !showRecommended && isLoadingRecommended && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {/* Search results */}
          {isLoading && query.trim() && results.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && query.trim() && results.length === 0 && (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              No results found
            </div>
          )}
          {query.trim() && results.length > 0 && (
            <>
              <MobileResults articles={results} locale={locale} lang={lang} t={t} onNavigate={handleClose} />
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-4">
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Desktop: below header with semi-transparent backdrop
  return (
    <div
      className="fixed inset-0 z-[49]"
      style={{ top: `${HEADER_HEIGHT}px` }}
      role="dialog"
      aria-modal="true"
      data-testid="search-overlay"
    >
      {/* Semi-transparent backdrop - click to close */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} data-testid="search-backdrop" />

      {/* White panel - height locks after initial results so Load More doesn't resize */}
      <div
        ref={scrollContainerRef}
        className="relative bg-white shadow-lg overflow-y-auto overscroll-contain"
        style={{ height: '780px', maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        {/* Search input - sticky so it stays visible when scrolling */}
        <div className="px-6 md:px-12 lg:px-24 py-4 border-b border-gray-200 sticky top-0 z-10 bg-white max-w-[1440px] mx-auto">
          {searchInput}
        </div>

        {/* Results area */}
        <div data-testid="search-results" className="max-w-[1440px] mx-auto">
          {/* Recommended articles when query is empty */}
          {showRecommended && (
            <>
              <div className="px-6 md:px-12 lg:px-24 pt-4 pb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{texts.actions.popular || 'Popular'}</span>
              </div>
              <DesktopResults articles={recommended} locale={locale} lang={lang} t={t} onNavigate={handleClose} />
            </>
          )}
          {!query.trim() && !showRecommended && isLoadingRecommended && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {/* Search results */}
          {isLoading && query.trim() && results.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && query.trim() && results.length === 0 && (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              No results found
            </div>
          )}
          {query.trim() && results.length > 0 && (
            <>
              <DesktopResults articles={results} locale={locale} lang={lang} t={t} onNavigate={handleClose} />
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-8 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    data-testid="search-load-more"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                    Load More
                  </button>
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
    <div className="px-6 md:px-12 lg:px-24 py-4">
      <div className="grid grid-cols-4 gap-5">
        {articles.map((article) => (
          <article key={article.entry_id} className="rounded overflow-hidden">
            <div className="relative w-full h-36">
              <ArticleLink
                slug={article.slug}
                locale={locale}
                business={getArticleBusinessPath(article)}
                article={article}
                className="block group w-full h-full overflow-hidden"
                onClick={onNavigate}
              >
                <img
                  src={article.img_url || placeholderImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover rounded hover:scale-105 transition-transform duration-300"
                />
                {isPodcastArticle(article) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PodcastPlayIcon className="w-12 h-12 drop-shadow-lg opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </ArticleLink>
            </div>
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-primary text-xs font-medium uppercase">
                  {getLocalizedCategoryLabel(article, lang)}
                </span>
                {getDisplayTopics(article).slice(0, 1).map((tag, i) => (
                  <span key={i} className="text-muted-foreground text-xs uppercase">
                    {getLocalizedTagLabel(tag, lang)}
                  </span>
                ))}
              </div>
              <h3 className="text-base font-medium text-foreground mt-1.5 mb-1 line-clamp-1">
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
              <p className="text-muted-foreground text-sm mb-1.5 leading-relaxed line-clamp-2">{article.sub_title || ''}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{formatDate(article.created_at, locale)}</span>
                <span className="mx-1">{`/ ${t('article.by')}`}</span>
                <span className="text-foreground uppercase truncate">
                  {article.author?.name || article.author_name || 'DeTake'}
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
            <div className="relative flex-shrink-0 w-20 h-20">
              <ArticleLink
                slug={article.slug}
                locale={locale}
                business={getArticleBusinessPath(article)}
                article={article}
                className="block w-full h-full overflow-hidden rounded"
                onClick={onNavigate}
              >
                <img
                  src={article.img_url || placeholderImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                {isPodcastArticle(article) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PodcastPlayIcon className="w-8 h-8 drop-shadow-lg opacity-90" />
                  </div>
                )}
              </ArticleLink>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1">
                <span className="text-primary text-[10px] font-medium uppercase">
                  {getLocalizedCategoryLabel(article, lang)}
                </span>
                {getDisplayTopics(article).slice(0, 1).map((tag, i) => (
                  <span key={i} className="text-muted-foreground text-[10px] uppercase">
                    {getLocalizedTagLabel(tag, lang)}
                  </span>
                ))}
              </div>
              <h3 className="text-sm font-medium text-foreground mt-0.5 line-clamp-1">
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
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed line-clamp-2">{article.sub_title || ''}</p>
              <div className="flex items-center text-[10px] text-muted-foreground mt-1">
                <span>{formatDate(article.created_at, locale)}</span>
                <span className="mx-1">{`/ ${t('article.by')}`}</span>
                <span className="text-foreground uppercase truncate">
                  {article.author?.name || article.author_name || 'DeTake'}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
