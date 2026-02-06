import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { headerTexts } from './constants';
import type { Locale, CollectionItem } from '@/types';
import { fetchCollections } from '@/api/collections';

import CountryIcon from './assets/country.svg?url';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onLocaleSwitch: (newLocale: Locale) => void;
}

/**
 * Mobile sidebar navigation component
 * 100% pixel-perfect restoration based on UI design
 */
export default function MobileSidebar({ isOpen, onClose, locale, onLocaleSwitch }: MobileSidebarProps) {
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [isResearchExpanded, setIsResearchExpanded] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [isVoicesExpanded, setIsVoicesExpanded] = useState(false);
  const [isTutorialsExpanded, setIsTutorialsExpanded] = useState(false);
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(false);
  const [isLocaleExpanded, setIsLocaleExpanded] = useState(false);
  const [headerCollectionItems, setHeaderCollectionItems] = useState<CollectionItem[]>([]);
  const texts = headerTexts[locale] || headerTexts.us;

  useEffect(() => {
    let isMounted = true;

    const loadHeaderCollections = async () => {
      try {
        const { items } = await fetchCollections(1, 10);
        if (!isMounted) return;
        setHeaderCollectionItems(items);
      } catch (error) {
        console.error('Failed to fetch mobile header collections:', error);
      }
    };

    if (isOpen && headerCollectionItems.length === 0) {
      loadHeaderCollections();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, headerCollectionItems.length]);

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

  if (typeof document === 'undefined') return null;

  const sidebarContent = (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[110] md:hidden" onClick={onClose} />

      <div className="fixed top-0 left-0 w-full h-full bg-white z-[120] md:hidden overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="w-5"></div>
          <a href={`/${locale}`} className="flex items-center" onClick={onClose}>
            <img src="https://cdn.detake.com/images/logo-black.svg" alt="DeTake" className="h-6" />
          </a>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label={texts.actions.closeMenu}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-6">
          {/* Navigation Items */}
          <div className="space-y-1 mb-8">
            {/* News with expandable subcategories (two levels) */}
            <div>
              <div className="flex items-center justify-between w-full py-3">
                <button onClick={() => handleNavigation(`/${locale}/news`)} className="text-lg text-gray-900 text-left flex-1">
                  {texts.navigation.news}
                </button>
                <button onClick={() => setIsNewsExpanded(!isNewsExpanded)} className="p-1 ml-2" aria-label={isNewsExpanded ? texts.actions.collapseNews : texts.actions.expandNews}>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isNewsExpanded ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {isNewsExpanded && (
                <div className="mt-2 space-y-3 pl-4">
                  {texts.dropdown.newsGroups.map((group) => (
                    <div key={group.key}>
                      {/* Group title */}
                      <button onClick={() => handleNavigation(`/${locale}/news?category_name=${encodeURIComponent(group.name)}`)} className="block w-full py-2 px-2 text-left text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">
                        {group.name}
                      </button>
                      {/* Group items */}
                      <div className="mt-1 space-y-1 pl-3">
                        {group.items.map((item) => (
                          <button key={item} onClick={() => handleNavigation(`/${locale}/news?category_name=${encodeURIComponent(group.name)}&tag=${encodeURIComponent(item)}`)} className="block w-full py-1.5 px-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Research with expandable subcategories */}
            <div>
              <div className="flex items-center justify-between w-full py-3">
                <button onClick={() => handleNavigation(`/${locale}/research`)} className="text-lg text-gray-900 text-left flex-1">
                  {texts.navigation.categories.research}
                </button>
                <button onClick={() => setIsResearchExpanded(!isResearchExpanded)} className="p-1 ml-2" aria-label={isResearchExpanded ? texts.actions.collapseResearch : texts.actions.expandResearch}>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isResearchExpanded ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {isResearchExpanded && (
                <div className="mt-2 space-y-1 pl-4">
                  {texts.dropdown.researchItems.map((category) => (
                    <button key={category} onClick={() => handleNavigation(`/${locale}/research?category_name=${encodeURIComponent(category)}`)} className="block w-full py-2 px-2 text-left text-base text-gray-700 hover:bg-gray-50 rounded-md">
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Insights with expandable subcategories */}
            <div>
              <div className="flex items-center justify-between w-full py-3">
                <button onClick={() => handleNavigation(`/${locale}/insights`)} className="text-lg text-gray-900 text-left flex-1">
                  {texts.navigation.categories.insights}
                </button>
                <button onClick={() => setIsInsightsExpanded(!isInsightsExpanded)} className="p-1 ml-2" aria-label={isInsightsExpanded ? texts.actions.collapseInsights : texts.actions.expandInsights}>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isInsightsExpanded ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {isInsightsExpanded && (
                <div className="mt-2 space-y-1 pl-4">
                  {texts.dropdown.insightsItems.map((category) => (
                    <button key={category} onClick={() => handleNavigation(`/${locale}/insights?category_name=${encodeURIComponent(category)}`)} className="block w-full py-2 px-2 text-left text-base text-gray-700 hover:bg-gray-50 rounded-md">
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voices with expandable subcategories */}
            <div>
              <div className="flex items-center justify-between w-full py-3">
                <button onClick={() => handleNavigation(`/${locale}/voices`)} className="text-lg text-gray-900 text-left flex-1">
                  {texts.navigation.categories.voices}
                </button>
                <button onClick={() => setIsVoicesExpanded(!isVoicesExpanded)} className="p-1 ml-2" aria-label={isVoicesExpanded ? texts.actions.collapseVoices : texts.actions.expandVoices}>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isVoicesExpanded ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {isVoicesExpanded && (
                <div className="mt-2 space-y-1 pl-4">
                  {texts.dropdown.voicesItems.map((category) => (
                    <button key={category} onClick={() => handleNavigation(`/${locale}/voices?category_name=${encodeURIComponent(category)}`)} className="block w-full py-2 px-2 text-left text-base text-gray-700 hover:bg-gray-50 rounded-md">
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Collections with arrow */}
            <div>
              <div className="flex items-center justify-between w-full py-3">
                <button onClick={() => handleNavigation(`/${locale}/collections`)} className="text-lg text-gray-900 text-left flex-1">
                  {texts.navigation.collections}
                </button>
                <button onClick={() => setIsCollectionsExpanded(!isCollectionsExpanded)} className="p-1 ml-2" aria-label={isCollectionsExpanded ? texts.actions.collapseCollections : texts.actions.expandCollections}>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCollectionsExpanded ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {isCollectionsExpanded && (
                <div className="mt-2 space-y-1 pl-4">
                  {headerCollectionItems.map((item) => (
                    <button key={item.id} onClick={() => handleNavigation(`/${locale}/collections/${item.id}`)} className="block w-full py-2 px-2 text-left text-base text-gray-700 hover:bg-gray-50 rounded-md">
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tutorials with expandable subcategories */}
            <div>
              <div className="flex items-center justify-between w-full py-3">
                <button onClick={() => handleNavigation(`/${locale}/tutorials`)} className="text-lg text-gray-900 text-left flex-1">
                  {texts.navigation.learn}
                </button>
                <button onClick={() => setIsTutorialsExpanded(!isTutorialsExpanded)} className="p-1 ml-2" aria-label={isTutorialsExpanded ? texts.actions.collapseTutorials : texts.actions.expandTutorials}>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isTutorialsExpanded ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {isTutorialsExpanded && (
                <div className="mt-2 space-y-1 pl-4">
                  {texts.dropdown.tutorialsItems.map((category) => (
                    <button key={category} onClick={() => handleNavigation(`/${locale}/tutorials?category_name=${encodeURIComponent(category)}`)} className="block w-full py-2 px-2 text-left text-base text-gray-700 hover:bg-gray-50 rounded-md">
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

  return createPortal(sidebarContent, document.body);
}
