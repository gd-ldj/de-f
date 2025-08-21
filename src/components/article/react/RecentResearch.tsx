import React from 'react';
import type { Locale } from '@/types';

interface ResearchArticle {
  id: string;
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
    title: "Fusaka fork takes shape as Pectra enters final stretch",
    description: "Ethereum core developers finalize Pectra's May 7 launch and wrap scoping of the next upgrade",
    author: "JACK KUBINEC",
    date: "Apr 11, 2025",
    image: "/detake.svg",
    categories: ["MARKETS POLICY", "DEFI"]
  }
}) => {
  return (
    <div className="bg-white rounded border border-border p-6">
      {/* Title */}
      <h3 className="text-lg font-medium text-foreground mb-6">{locale === 'us' ? 'Recent Research' : '最新研究'}</h3>

      {/* Article Card */}
      <div className="space-y-4">
        {/* Article Image */}
        <div className="relative w-full h-48 rounded overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-fill"
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
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category, index) => (
            <span key={index} className="text-xs font-medium text-primary uppercase tracking-wide">
              {category}
            </span>
          ))}
        </div>

        {/* Article Title */}
        <h4 className="text-xl font-medium text-foreground leading-tight">{article.title}</h4>

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