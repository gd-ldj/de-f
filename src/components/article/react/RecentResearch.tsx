import React from 'react';
import type { Locale } from '@/types';
import { DEFAULT_PROMOTE_CODE } from '@/config/constants';

interface ResearchArticle {
  id: string;
  slug?: string; // Article slug for URL generation
  title: string;
  description: string;
  author: string;
  date: string;
  image: string;
  categories: string[];
}

interface RecentResearchProps {
  locale: Locale;
  article?: ResearchArticle;
}

/**
 * Recent Research component displaying a featured research article
 * Shows article image, categories, title, description, and author information
 */
const RecentResearch: React.FC<RecentResearchProps> = ({ 
  locale, 
  article = {
    id: "1",
    slug: "fusaka-fork-takes-shape-as-pectra-enters-final-stretch",
    title: "Fusaka fork takes shape as Pectra enters final stretch",
    description: "Ethereum core developers finalize Pectra's May 7 launch and wrap scoping of the next upgrade",
    author: "JACK KUBINEC",
    date: "Apr 11, 2025",
    image: "/detake.svg",
    categories: ["MARKETS POLICY", "DEFI"]
  }
}) => {
  /**
   * Generate article URL with promote code
   * Follows the same pattern as ArticleLink.astro component
   */
  const getArticleUrl = (slug: string) => {
    // Get promote code from localStorage or use default
    const promoteCode = (typeof window !== 'undefined' ? 
      localStorage.getItem('promote_code') : null) || DEFAULT_PROMOTE_CODE;
    return `/${locale}/research/${slug}-${promoteCode}`;
  };

  const articleUrl = article.slug ? getArticleUrl(article.slug) : '#';
  return (
    <div className="">
      {/* Title */}
      <h3 className="text-lg font-medium text-foreground mb-6">{locale === 'us' ? 'Recent Research' : '最新研究'}</h3>

      {/* Article Card */}
      <div className="space-y-4">
        {/* Article Image */}
        <a href={articleUrl} className="block relative w-full h-48 rounded overflow-hidden group">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-fill group-hover:opacity-90 transition-opacity cursor-pointer"
            onError={(e) => {
              // Fallback to a placeholder color background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                parent.innerHTML = '<div class="flex items-center justify-center h-full text-white font-medium">Blockworks</div>';
              }
            }}
          />
          {/* Watermark */}
          <div className="absolute bottom-4 right-4">
            <span className="text-primary-foreground font-medium text-sm bg-black/20 px-2 py-1 rounded">Blockworks</span>
          </div>
        </a>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category, index) => (
            <span key={index} className="text-xs font-medium text-primary uppercase tracking-wide">
              {category}
            </span>
          ))}
        </div>

        {/* Article Title */}
        <h4 className="text-xl font-medium text-foreground leading-tight">
          <a href={articleUrl} className="hover:text-primary transition-colors cursor-pointer">
            {article.title}
          </a>
        </h4>

        {/* Article Description */}
        <p className="text-base text-muted-foreground leading-relaxed">{article.description}</p>

        {/* Author and Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{article.date}</span>
          <div className="flex items-center space-x-1">
            <span>{locale === 'us' ? 'By' : '作者'}</span>
            <span className="font-medium text-foreground">{article.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentResearch;
export type { ResearchArticle };