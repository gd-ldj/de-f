import React, { useState } from 'react';
import type { Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';
import DetakeLogo from './assets/detake.svg?url';
import BackIcon from './assets/back.svg?url';

interface MobileCategoryPageProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  locale: Locale;
  category: string;
}

/**
 * Mobile category page component
 * 100% pixel-perfect restoration based on UI design
 */
export default function MobileCategoryPage({ isOpen, onClose, onBack, locale, category }: MobileCategoryPageProps) {
  const [isLearnExpanded, setIsLearnExpanded] = useState(false);
  const t = createTranslator(locale);

  if (!isOpen) return null;

  /**
   * Handle navigation item click
   * @param href - Target URL
   */
  const handleNavigation = (href: string) => {
    window.location.href = href;
    onClose();
  };

  // Category translations
  const categoryTranslations = {
    article: locale === 'us' ? 'Article' : '文章',
    news: locale === 'us' ? 'News' : '新闻',
    insight: locale === 'us' ? 'Insight' : '洞察',
    research: locale === 'us' ? 'Research' : '研究',
  };

  const allCategoriesText = locale === 'us' ? 'All Categories' : '所有类别';
  const learnText = locale === 'us' ? 'Learn' : '学习';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />

      {/* Category Page */}
      <div className="fixed top-0 left-0 w-full h-full bg-white z-50 md:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label="Back">
            <img src={BackIcon} alt="DeTake" className="h-6" />
          </button>
          <img src={DetakeLogo} alt="DeTake" className="h-6" />
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close menu">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">{allCategoriesText}</span>
            <span className="text-gray-400">/</span>
            <span className="text-teal-600 font-medium">{categoryTranslations[category as keyof typeof categoryTranslations] || category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {/* Category Title */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-medium text-gray-900">{categoryTranslations[category as keyof typeof categoryTranslations] || category}</h1>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>

          {/* Category Items */}
          <div className="space-y-6">
            {/* News */}
            <button onClick={() => handleNavigation(`/${locale}/news`)} className="block w-full text-left">
              <div className="text-xl text-muted-foreground">{locale === 'us' ? 'News' : '新闻'}</div>
            </button>

            {/* Insight */}
            <button onClick={() => handleNavigation(`/${locale}/insights`)} className="block w-full text-left">
              <div className="text-xl text-muted-foreground">{locale === 'us' ? 'Insight' : '洞察'}</div>
            </button>

            {/* Research */}
            <button onClick={() => handleNavigation(`/${locale}/research`)} className="block w-full text-left">
              <div className="text-xl text-muted-foreground">{locale === 'us' ? 'Research' : '研究'}</div>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>
        </div>
      </div>
    </>
  );
}
