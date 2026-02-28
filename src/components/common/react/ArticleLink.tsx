import React from 'react';
import type { Locale } from '@/types';
import { DEFAULT_PROMOTE_CODE } from '@/config/constants';

interface ArticleLinkProps {
  slug: string;
  locale: Locale;
  business: string; // Changed from 'category' to 'business' as requested
  userId?: string; // User ID for regular user articles
  article?: any; // Article object to extract user_id from author info
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ArticleLink: React.FC<ArticleLinkProps> = ({ slug, locale, business, userId, article, children, className = '', onClick }) => {
  const getArticleUrl = (slug: string) => {
    const promoteCode = (typeof window !== 'undefined' ? localStorage.getItem('promote_code') : null) || DEFAULT_PROMOTE_CODE;
    const businessPath = business.toLowerCase();

    // Determine userId from multiple sources
    let finalUserId = userId;

    // If article object is provided, extract userId from it
    if (!finalUserId && article) {
      // Check user_id field first
      if (article.user_id) {
        finalUserId = article.user_id;
      }
      // If author.role is "Authors", use author.id as userId
      else if (article.author?.role === "Authors" && article.author?.id) {
        finalUserId = article.author.id;
      }
    }

    // User articles use /{userId}/ prefix (numeric ID distinguishes from language codes)
    if (finalUserId) {
      return `/${finalUserId}/article/${businessPath}/${slug}-${promoteCode}`;
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
