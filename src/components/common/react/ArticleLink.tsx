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

const ArticleLink: React.FC<ArticleLinkProps> = ({ slug, locale, business, userId, children, className = '', onClick }) => {
  const getArticleUrl = (slug: string) => {
    const promoteCode = (typeof window !== 'undefined' ? localStorage.getItem('promote_code') : null) || DEFAULT_PROMOTE_CODE;
    const businessPath = business.toLowerCase();

    // User articles use /{userId}/ prefix (numeric ID distinguishes from language codes)
    if (userId) {
      return `/${userId}/article/${businessPath}/${slug}-${promoteCode}`;
    }

    return `/article/${businessPath}/${slug}-${promoteCode}`;
  };

  const articleUrl = getArticleUrl(slug);

  return (
    <a href={articleUrl} className={`hover:text-primary transition-colors ${className}`} onClick={onClick} data-article-link="true" data-slug={slug} data-locale={locale} data-business={business.toLowerCase()} data-author-id={userId}>
      {children}
    </a>
  );
};

export default ArticleLink;
