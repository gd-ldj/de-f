import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';
import BackIcon from './assets/back.svg?url';
import { HEADER_LOGO_BLACK_URL } from './constants';

interface MobileCategoryPageProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  locale: Locale;
  category: string;
}

type ArticleTypeKey = 'news' | 'insights' | 'research' | 'voices';

/**
 * Mobile category page component
 * 100% pixel-perfect restoration based on UI design
 */
export default function MobileCategoryPage({ isOpen, onClose, onBack, locale, category }: MobileCategoryPageProps) {
  const [isLearnExpanded, setIsLearnExpanded] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [expandedType, setExpandedType] = useState<ArticleTypeKey | null>(null);
  const t = createTranslator(locale);

  if (!isOpen) return null;

  /**
   * 处理导航跳转，点击后关闭当前弹层
   */
  const handleNavigation = (href: string) => {
    window.location.href = href;
    onClose();
  };

  /**
   * 文章大类与子分类配置，保持与 PC 端一致
   */
  const categoriesItems: { key: ArticleTypeKey; href: string }[] = [
    { key: 'news', href: `/${locale}/news` },
    { key: 'insights', href: `/${locale}/insights` },
    { key: 'research', href: `/${locale}/research` },
    { key: 'voices', href: `/${locale}/voices` },
  ];

  const subCategories = ['Politics', 'Economy', 'Society', 'Climate', 'Technology', 'Markets'];

  /**
   * 根据文章大类和子分类生成跳转 URL
   * 与 PC 端 DesktopHeader.getCategoryFilterUrl 逻辑保持一致
   */
  const getCategoryFilterUrl = (typeKey: ArticleTypeKey, categoryLabel: string) => {
    const typeItem = categoriesItems.find((item) => item.key === typeKey);
    const baseHref = typeItem?.href || `/${locale}/${typeKey}`;
    const encodedCategory = encodeURIComponent(categoryLabel);
    return `${baseHref}?category_name=${encodedCategory}`;
  };

  /**
   * 切换当前展开的文章大类（News / Insights / Research）
   */
  const toggleTypeExpand = (typeKey: ArticleTypeKey) => {
    setExpandedType((prev) => (prev === typeKey ? null : typeKey));
  };

  // Category translations
  const categoryTranslations = {
    article: locale === 'us' ? 'Article' : '文章',
    news: locale === 'us' ? 'News' : '新闻',
    insight: locale === 'us' ? 'Insight' : '洞察',
    research: locale === 'us' ? 'Research' : '研究',
    voices: locale === 'us' ? 'Voices' : '观点',
  };

  const allCategoriesText = locale === 'us' ? 'All Categories' : '所有类别';
  const learnText = locale === 'us' ? 'Learn' : '学习';

  if (typeof document === 'undefined') return null;

  const categoryContent = (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[110] md:hidden" onClick={onClose} />

      <div className="fixed top-0 left-0 w-full h-full bg-white z-[120] md:hidden overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label="Back">
            <img src={BackIcon} alt="DeTake" className="h-6" />
          </button>
          <a href={`/${locale}`} className="flex items-center" onClick={onClose}>
            <img src={HEADER_LOGO_BLACK_URL} alt="DeTake" className="h-6" />
          </a>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close menu">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">{allCategoriesText}</span>
            <span className="text-gray-400">/</span>
            <span className="text-teal-600 font-medium">{categoryTranslations[category as keyof typeof categoryTranslations] || category}</span>
          </div>
        </div>

        <div className="px-4 py-6">
          {/* Category Title */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-medium text-gray-900">{categoryTranslations[category as keyof typeof categoryTranslations] || category}</h1>
            <button onClick={() => setIsCategoryExpanded(!isCategoryExpanded)} className="p-1 hover:bg-gray-100 rounded-md transition-all duration-200" aria-label={isCategoryExpanded ? 'Collapse category' : 'Expand category'}>
              <svg className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${isCategoryExpanded ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* Category Items */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoryExpanded ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-6">
              {/* News */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => handleNavigation(`/${locale}/news`)} className="text-xl text-gray-900 text-left">
                    {locale === 'us' ? 'News' : '新闻'}
                  </button>
                  <button onClick={() => toggleTypeExpand('news')} className="p-1 hover:bg-gray-100 rounded-md transition-all duration-200" aria-label={expandedType === 'news' ? 'Collapse news categories' : 'Expand news categories'}>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedType === 'news' ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedType === 'news' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pl-1">
                    {subCategories.map((item) => (
                      <button key={`news-${item}`} onClick={() => handleNavigation(getCategoryFilterUrl('news', item))} className="text-sm text-muted-foreground hover:text-primary">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => handleNavigation(`/${locale}/insights`)} className="text-xl text-gray-900 text-left">
                    {locale === 'us' ? 'Insights' : '洞察'}
                  </button>
                  <button onClick={() => toggleTypeExpand('insights')} className="p-1 hover:bg-gray-100 rounded-md transition-all duration-200" aria-label={expandedType === 'insights' ? 'Collapse insights categories' : 'Expand insights categories'}>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedType === 'insights' ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedType === 'insights' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pl-1">
                    {subCategories.map((item) => (
                      <button key={`insights-${item}`} onClick={() => handleNavigation(getCategoryFilterUrl('insights', item))} className="text-sm text-muted-foreground hover:text-primary">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Research */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => handleNavigation(`/${locale}/research`)} className="text-xl text-gray-900 text-left">
                    {locale === 'us' ? 'Research' : '研究'}
                  </button>
                  <button onClick={() => toggleTypeExpand('research')} className="p-1 hover:bg-gray-100 rounded-md transition-all duration-200" aria-label={expandedType === 'research' ? 'Collapse research categories' : 'Expand research categories'}>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedType === 'research' ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedType === 'research' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pl-1">
                    {subCategories.map((item) => (
                      <button key={`research-${item}`} onClick={() => handleNavigation(getCategoryFilterUrl('research', item))} className="text-sm text-muted-foreground hover:text-primary">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voices */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => handleNavigation(`/${locale}/voices`)} className="text-xl text-gray-900 text-left">
                    {locale === 'us' ? 'Voices' : '观点'}
                  </button>
                  <button onClick={() => toggleTypeExpand('voices')} className="p-1 hover:bg-gray-100 rounded-md transition-all duration-200" aria-label={expandedType === 'voices' ? 'Collapse voices categories' : 'Expand voices categories'}>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedType === 'voices' ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedType === 'voices' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pl-1">
                    {subCategories.map((item) => (
                      <button key={`voices-${item}`} onClick={() => handleNavigation(getCategoryFilterUrl('voices', item))} className="text-sm text-muted-foreground hover:text-primary">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>
        </div>
      </div>
    </>
  );

  return createPortal(categoryContent, document.body);
}
