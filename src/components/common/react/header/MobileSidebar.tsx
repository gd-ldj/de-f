import React, { useState } from 'react';
import { headerTexts } from './constants';
import type { Locale } from '@/types';
import { createTranslator } from '@/lib/i18n';

import CountryIcon from './assets/country.svg?url';
import MeIcon from './assets/me.svg?url';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onLocaleSwitch: (newLocale: Locale) => void;
  onCategoryPageOpen?: (category: string) => void;
}

/**
 * Mobile sidebar navigation component
 * 100% pixel-perfect restoration based on UI design
 */
export default function MobileSidebar({ isOpen, onClose, locale, onLocaleSwitch, onCategoryPageOpen }: MobileSidebarProps) {
  const [isArticleExpanded, setIsArticleExpanded] = useState(false);
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
  const [isLocaleExpanded, setIsLocaleExpanded] = useState(false);
  const t = createTranslator(locale);
  const texts = headerTexts[locale] || headerTexts.us;

  if (!isOpen) return null;

  /**
   * Handle navigation item click
   * @param href - Target URL
   */
  const handleNavigation = (href: string) => {
    window.location.href = href;
    onClose();
  };

  /**
   * Handle locale switch
   * @param newLocale - Target locale
   */
  const handleLocaleSwitch = (newLocale: Locale) => {
    onLocaleSwitch(newLocale);
    setIsLocaleExpanded(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-full h-full bg-white z-50 md:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="w-5"></div>
          <img src="https://cdn.detake.com/images/logo-black.svg" alt="DeTake" className="h-6" />
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close menu">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="px-4 py-6">
          {/* All Categories */}
          <div className="mb-1">
            <button onClick={() => onCategoryPageOpen && onCategoryPageOpen('article')} className="flex items-center justify-between w-full py-3 text-left">
              <span className="text-lg font-medium text-gray-900">{texts.navigation.allCategories}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1 mb-8">
            <button
              // onClick={() => handleNavigation(`/${locale}/social`)}
              className="block w-full py-3 text-left text-lg text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              {texts.navigation.social}
            </button>

            <button
              // onClick={() => handleNavigation(`/${locale}/explore`)}
              className="block w-full py-3 text-left text-lg text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              {texts.navigation.explore}
            </button>

            {/* Collections with arrow */}
            <div>
              <button onClick={() => setIsCollectionsExpanded(!isCollectionsExpanded)} className="flex items-center justify-between w-full py-3 text-left">
                <span className="text-lg text-gray-900">{texts.navigation.collections}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              // onClick={() => handleNavigation(`/${locale}/trending`)}
              className="block w-full py-3 text-left text-lg text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              {texts.navigation.trending}
            </button>

            {/* Learn with expandable submenu */}
            <div>
              <button
                // onClick={() => handleNavigation(`/${locale}/learn`)}
                className="flex items-center justify-between w-full py-3 text-left"
              >
                <span className="text-lg text-gray-900">{texts.navigation.learn}</span>
              </button>
            </div>

            <button
              // onClick={() => handleNavigation(`/${locale}/technology`)}
              className="block w-full py-3 text-left text-lg text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              {texts.navigation.technology}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Location and User Settings */}
          <div className="space-y-1">
            {/* North America / Asia with globe icon */}
            <div>
              <button onClick={() => setIsLocaleExpanded(!isLocaleExpanded)} className="flex items-center justify-between w-full py-3 text-left">
                <span className="text-lg text-gray-900">{texts.locale.region}</span>
                <div className="flex items-center space-x-2">
                  <img src={CountryIcon} alt="DeTake" className="h-5" />
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isLocaleExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Locale submenu */}
              {isLocaleExpanded && (
                <div className="mt-2 space-y-1">
                  <button onClick={() => handleLocaleSwitch('us')} className={`block w-full py-2 px-3 text-left text-base rounded transition-colors ${locale === 'us' ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {texts.locale.northAmerica}
                  </button>
                  <button onClick={() => handleLocaleSwitch('asia')} className={`block w-full py-2 px-3 text-left text-base rounded transition-colors ${locale === 'asia' ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {texts.locale.asia}
                  </button>
                </div>
              )}
            </div>

            {/* Dashboard with user icon */}
            {/* <button onClick={() => handleNavigation(`/${locale}/dashboard`)} className="flex items-center justify-between w-full py-3 text-left">
              <span className="text-lg text-gray-900">{texts.user.dashboard}</span>
              <div className="flex items-center space-x-2">
                <img src={MeIcon} alt="DeTake" className="h-5" />
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
}
