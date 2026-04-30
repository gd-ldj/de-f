import React from 'react';
import type { Locale, SourceLanguage } from '@/types';
import { buildArticleUrl } from '@/lib/language-utils';
import { useStablePromoteCode } from '@/lib/useStablePromoteCode';

interface ArticleLinkProps {
  slug: string;
  locale: Locale;
  business: string; // Changed from 'category' to 'business' as requested
  userId?: string; // User ID for regular user articles
  isPromoted?: boolean;
  article?: any; // Article object to extract user_id from author info
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ArticleLink: React.FC<ArticleLinkProps> = ({ slug, locale, business, userId, isPromoted, article, children, className = '', onClick }) => {
  const promoteCode = useStablePromoteCode();
  let finalUserId = userId;
  if (!finalUserId && article) {
    if (article.user_id) {
      finalUserId = article.user_id;
    } else if (article.author?.id) {
      finalUserId = article.author.id;
    }
  }

  const finalIsPromoted = isPromoted ?? article?.is_promoted ?? false;

  const getArticleUrl = (slug: string) => {
    return buildArticleUrl({
      category: business.toLowerCase(),
      slug,
      sourceLanguage: locale as SourceLanguage,
      userId: finalUserId,
      isPromoted: finalIsPromoted,
      promoteCode,
    });
  };

  const articleUrl = getArticleUrl(slug);

  return (
    <a
      href={articleUrl}
      className={`hover:text-primary transition-colors ${className}`}
      onClick={onClick}
      data-article-link="true"
      data-slug={slug}
      data-locale={locale}
      data-business={business.toLowerCase()}
      data-author-id={finalUserId || ''}
      data-is-promoted={String(finalIsPromoted)}
      suppressHydrationWarning
    >
      {children}
    </a>
  );
};

export default ArticleLink;
