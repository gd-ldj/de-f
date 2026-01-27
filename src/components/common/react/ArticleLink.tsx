import React from 'react';
import type { Locale } from '@/types';
import { DEFAULT_PROMOTE_CODE } from '@/config/constants';

interface ArticleLinkProps {
  slug: string;
  locale: Locale;
  business: string; // Changed from 'category' to 'business' as requested
  userId?: string; // User ID for regular user articles
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * React version of ArticleLink component
 * Generates article URLs with promote code for client-side navigation
 *
 * URL formats:
 * - Admin/System articles: /{locale}/{business}/{slug}-{promoteCode}
 * - User articles: /{locale}/{userId}/{business}/{slug}-{promoteCode}
 */
const ArticleLink: React.FC<ArticleLinkProps> = ({ slug, locale, business, userId, children, className = '', onClick }) => {
  /**
   * Generate article URL with promote code
   * Uses localStorage for client-side promote code retrieval
   */
  const getArticleUrl = (slug: string) => {
    // Get promote code from localStorage or use default
    const promoteCode = (typeof window !== 'undefined' ? localStorage.getItem('promote_code') : null) || DEFAULT_PROMOTE_CODE;
    const businessPath = business.toLowerCase();

    // If userId exists, it's a regular user article
    if (userId) {
      return `/${locale}/${userId}/article/${businessPath}/${slug}-${promoteCode}`;
    }

    // Otherwise, it's an admin/system article
    return `/${locale}/article/${businessPath}/${slug}-${promoteCode}`;
  };

  const articleUrl = getArticleUrl(slug);

  return (
    <a href={articleUrl} className={`hover:text-primary transition-colors ${className}`} onClick={onClick} data-article-link="true" data-slug={slug} data-locale={locale} data-business={business.toLowerCase()} data-author-id={userId}>
      {children}
    </a>
  );
};

export default ArticleLink;
