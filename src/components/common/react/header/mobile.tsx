import React, { useState } from 'react';
import { headerTexts } from './constants';
import { MULTI_SOURCE_CONFIG, STORAGE_KEYS } from '@/config/constants';
import { isValidSourceLanguage } from '@/lib/language-utils';
import MobileSidebar from './MobileSidebar';
import MobileCategoryPage from './MobileCategoryPage';
import { HEADER_LOGO_BLACK_URL } from './constants';

// Import icons from local assets
import SearchIcon from './assets/search.svg?url';
import MenuIcon from './assets/menu.svg?url';
import BackIcon from './assets/back.svg?url';

type Locale = 'us' | 'asia';

interface MobileHeaderProps {
  locale?: Locale;
  onLocaleSwitch?: (locale: Locale) => void;
  currentPath?: string;
}

function getLocaleFromURL(): Locale {
  if (typeof window !== 'undefined') {
    const storedLanguage = localStorage.getItem(STORAGE_KEYS.SOURCE_LANGUAGE);
    if (storedLanguage && isValidSourceLanguage(storedLanguage)) {
      return MULTI_SOURCE_CONFIG.languageToLocale(storedLanguage);
    }
    const hostname = window.location.hostname;
    const sourceLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname);
    return MULTI_SOURCE_CONFIG.languageToLocale(sourceLanguage);
  }
  return 'us';
}

/**
 * Check if current path is homepage
 */
function isHomePage(path: string, locale: Locale): boolean {
  return path === '/';
}

/**
 * Mobile Header Component - Adaptive design based on current page
 * Features: Logo in center, menu/back button on left, search/back arrow on right
 */
const MobileHeader: React.FC<MobileHeaderProps> = ({ locale: propLocale, onLocaleSwitch, currentPath }) => {
  const locale = propLocale || getLocaleFromURL();
  const texts = headerTexts[locale];

  // Get current path
  const getCurrentPath = (): string => {
    if (currentPath) return currentPath;
    if (typeof window !== 'undefined') return window.location.pathname;
    return '/';
  };

  const path = getCurrentPath();
  const isHome = isHomePage(path, locale);

  // State management for mobile navigation
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileCategoryPageOpen, setMobileCategoryPageOpen] = useState(false);
  const [currentMobileCategory, setCurrentMobileCategory] = useState<string>('');

  // Handle mobile sidebar open/close
  const handleMobileSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  // Handle mobile category page navigation
  const handleMobileCategoryPageOpen = (category: string) => {
    setCurrentMobileCategory(category);
    setMobileCategoryPageOpen(true);
    setMobileSidebarOpen(false);
  };

  const handleMobileCategoryPageClose = () => {
    setMobileCategoryPageOpen(false);
    setCurrentMobileCategory('');
  };

  const handleMobileCategoryPageBack = () => {
    setMobileCategoryPageOpen(false);
    setMobileSidebarOpen(true);
  };

  // Handle locale switching
  const handleLocaleSwitch = (newLocale: Locale) => {
    if (onLocaleSwitch) {
      onLocaleSwitch(newLocale);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <>
      {/* Mobile Header - Fixed positioning with proper z-index */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3 h-14">
          {/* Left - Menu Icon (only on homepage) or Empty Space */}
          <div className="w-8 h-8 flex items-center justify-center">
            <button onClick={handleMobileSidebarOpen} className="flex items-center justify-center w-8 h-8 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Open menu">
              <img src={MenuIcon} alt="deTake" className="h-6 w-auto" />
            </button>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <a href="/" className="flex items-center">
              <img src={HEADER_LOGO_BLACK_URL} alt="deTake" className="h-6 w-auto" />
            </a>
          </div>

          {/* Right - Search Icon (only on homepage) or Back Arrow */}
          <div className="w-8 h-8 flex items-center justify-center">
            {isHome && (
              <button className="flex items-center justify-center w-8 h-8 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Search">
                <img src={SearchIcon} alt="deTake" className="h-6 w-auto" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={handleMobileSidebarClose} locale={locale} onLocaleSwitch={handleLocaleSwitch} />

      {/* Mobile Category Page */}
      <MobileCategoryPage isOpen={mobileCategoryPageOpen} onClose={handleMobileCategoryPageClose} onBack={handleMobileCategoryPageBack} category={currentMobileCategory} locale={locale} />
    </>
  );
};

export default MobileHeader;
