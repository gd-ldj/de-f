import React from 'react';
import type { Locale } from '@/types';
import { DEFAULT_PROMOTE_CODE } from '@/config/constants';

interface ArticleLinkProps {
  slug: string;
  locale: Locale;
  business: string; // Changed from 'category' to 'business' as requested
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * React version of ArticleLink component
 * Generates article URLs with promote code for client-side navigation
 */
const ArticleLink: React.FC<ArticleLinkProps> = ({ slug, locale, business, children, className = '', onClick }) => {
  /**
   * Generate article URL with promote code
   * Uses localStorage for client-side promote code retrieval
   */
  const getArticleUrl = (slug: string) => {
    // Get promote code from localStorage or use default
    const promoteCode = (typeof window !== 'undefined' ? localStorage.getItem('promote_code') : null) || DEFAULT_PROMOTE_CODE;
    return `/${locale}/${business.toLowerCase()}/${slug}-${promoteCode}`;
  };

  const articleUrl = getArticleUrl(slug);

  return (
    <a href={articleUrl} className={`hover:text-primary transition-colors ${className}`} onClick={onClick} data-article-link="true" data-slug={slug} data-locale={locale}>
      {children}
    </a>
  );
};

export default ArticleLink;
