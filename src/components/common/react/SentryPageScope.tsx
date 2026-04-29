import { useEffect } from 'react';
import { setPageScope, addBusinessBreadcrumb } from '@/lib/sentry';

interface SentryPageScopeProps {
  locale: string;
  /** Logical page type: 'home' | 'article' | 'category' | 'topic' | 'podcast' | ... */
  pageType: string;
  /** Optional Astro route pattern, e.g. '/us/article/[slug]'. */
  routePattern?: string;
  /**
   * When true, records an `article.view` business breadcrumb on mount.
   * Reserved for article-detail pages; other page types should omit this.
   */
  trackArticleView?: boolean;
  /** Optional article id forwarded to the breadcrumb data for correlation. */
  articleId?: string;
}

/**
 * Tiny island whose only job is to populate Sentry tags on every page.
 * Mounted from BaseLayout so that any event fired from a React island or
 * server component carries `locale` / `page_type` / `route` tags.
 *
 * Safe to mount in local dev — Sentry.init() only runs in production builds.
 * Beta/dev deployments still report to Sentry, but local `astro dev` stays a no-op.
 */
export function SentryPageScope({
  locale,
  pageType,
  routePattern,
  trackArticleView,
  articleId,
}: SentryPageScopeProps) {
  useEffect(() => {
    setPageScope({ locale, pageType, routePattern });
    if (trackArticleView) {
      addBusinessBreadcrumb('article.view', {
        locale,
        pageType,
        articleId,
      });
    }
  }, [locale, pageType, routePattern, trackArticleView, articleId]);

  return null;
}

export default SentryPageScope;
