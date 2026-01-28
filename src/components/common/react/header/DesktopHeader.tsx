import * as React from 'react';
import { headerTexts } from './constants';
import { STORAGE_KEYS } from '@/config/constants';
import { TRACKING_EVENTS } from '@/config/constants';
import { toast } from '@/components/common/react/Toast';
import type { CollectionItem } from '@/types';
import { fetchCollections } from '@/api/collections';

// Import icons from local assets
import DownIcon from './assets/down.svg?url';
import DownWhiteIcon from './assets/down_white.svg?url';
import CountryIcon from './assets/country.svg?url';
import SearchIcon from './assets/search.svg?url';

type Locale = 'us' | 'asia';

interface DesktopHeaderProps {
  locale: Locale;
  currentPath: string;
  onLocaleSwitch: (newLocale: Locale) => void;
  userComponent?: React.ReactNode;
}

export default function DesktopHeader({ locale, currentPath, onLocaleSwitch, userComponent }: DesktopHeaderProps) {
  const texts = headerTexts[locale] || headerTexts.us;

  const [localeDropdownOpen, setLocaleDropdownOpen] = React.useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = React.useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = React.useState(false);
  const [activeCategoryType, setActiveCategoryType] = React.useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = React.useState<string | null>(null);
  const [headerCollectionItems, setHeaderCollectionItems] = React.useState<CollectionItem[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const collectionsDropdownRef = React.useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = React.useRef<HTMLDivElement>(null);

  const pathSegments = currentPath.split('/');
  const collectionsIndex = pathSegments.indexOf('collections');
  const activeCollectionId = collectionsIndex >= 0 && pathSegments.length > collectionsIndex + 1 ? pathSegments[collectionsIndex + 1] : null;

  // Handle click outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocaleDropdownOpen(false);
      }
      if (collectionsDropdownRef.current && !collectionsDropdownRef.current.contains(event.target as Node)) {
        setCollectionsDropdownOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
        setActiveCategoryType(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('category_name');
    setSelectedCategoryName(categoryName);
  }, [currentPath]);

  // 从后端加载 header 中使用的合集列表
  React.useEffect(() => {
    let isMounted = true;

    const loadHeaderCollections = async () => {
      try {
        const { items } = await fetchCollections(1, 10);
        if (!isMounted) return;
        setHeaderCollectionItems(items);
      } catch (error) {
        console.error('Failed to fetch header collections:', error);
      }
    };

    loadHeaderCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCategoriesDropdown = () => {
    if (categoriesDropdownOpen) {
      setCategoriesDropdownOpen(false);
      setActiveCategoryType(null);
    } else {
      setCategoriesDropdownOpen(true);
    }
  };

  // Internationalized navigation items
  const navigation = {
    left: [
      {
        name: texts.navigation.social,
        href: `/${locale}/social`,
        key: 'social',
      },
      {
        name: texts.navigation.explore,
        href: `/${locale}/explore`,
        key: 'explore',
      },
      {
        name: texts.navigation.technology,
        href: `/${locale}/technology`,
        key: 'technology',
      },
    ],
    right: [
      {
        name: texts.navigation.trending,
        href: `/${locale}/trending`,
        key: 'trending',
      },
      {
        name: texts.navigation.learn,
        href: `/${locale}/learn`,
        key: 'learn',
      },
    ],
  };

  // Locale configuration
  const localeConfig = {
    us: {
      name: texts.locale.northAmerica,
      displayName: 'US',
    },
    asia: {
      name: texts.locale.asia,
      displayName: 'Asia',
    },
  };

  const currentLocaleConfig = localeConfig[locale] || localeConfig.us;

  /**
   * Toggle locale dropdown
   */
  const toggleLocaleDropdown = () => {
    setLocaleDropdownOpen(!localeDropdownOpen);
  };

  /**
   * Toggle collections dropdown
   */
  const toggleCollectionsDropdown = () => {
    setCollectionsDropdownOpen(!collectionsDropdownOpen);
  };

  // Categories dropdown items
  const categoriesItems = [
    {
      name: texts.navigation.categories.news,
      href: `/${locale}/news`,
      key: 'news',
    },
    {
      name: texts.navigation.categories.insights,
      href: `/${locale}/insights`,
      key: 'insights',
    },
    {
      name: texts.navigation.categories.research,
      href: `/${locale}/research`,
      key: 'research',
    },
  ];

  const currentCategoryTypeKey = categoriesItems.find((item) => item.href === currentPath)?.key || null;

  const handleCollectionsClick = () => {
    setCollectionsDropdownOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = `/${locale}/collections`;
    }
  };

  const getCategoryFilterUrl = (typeKey: string, categoryLabel: string) => {
    const typeItem = categoriesItems.find((item) => item.key === typeKey);
    const baseHref = typeItem?.href || `/${locale}/${typeKey}`;
    const encodedCategory = encodeURIComponent(categoryLabel);
    return `${baseHref}?category_name=${encodedCategory}`;
  };

  return (
    <header className="border-b border-gray-200 fixed w-screen top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/95 bg-white/95">
      <div className="max-w-[1440px] mx-auto pl-4 pr-6">
        <div className="flex items-center h-[96px]">
          {/* Left Navigation */}
          <div className="flex items-center space-x-8 flex-1">
            {/* Categories Dropdown */}
            <div className="" ref={categoriesDropdownRef}>
              <button onClick={toggleCategoriesDropdown} className={`flex items-center space-x-1 text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${categoriesDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.navigation.allCategories} aria-expanded={categoriesDropdownOpen}>
                <span className={`${categoriesDropdownOpen ? 'text-white' : 'text-gray-600'}`}>{texts.navigation.allCategories}</span>
                <img src={categoriesDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute left-0 right-0 top-[96px] w-screen bg-white z-50 border border-border">
                  <div className="max-w-[1440px] mx-auto px-4">
                    <div className="pt-4 pb-4" onMouseLeave={() => setActiveCategoryType(null)}>
                      <h3 className="text-lg font-medium text-foreground mb-2 mt-1">{texts.dropdown.article}</h3>
                      <div className="flex items-center gap-8">
                        {categoriesItems.map((item) => (
                          <a key={item.key} href={item.href} className={`text-sm py-2 relative transition-colors ${currentPath === item.href ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'}`} onClick={() => setCategoriesDropdownOpen(false)} onMouseEnter={() => setActiveCategoryType(item.key)}>
                            {item.name}
                            {currentPath === item.href && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                          </a>
                        ))}
                      </div>
                      {activeCategoryType && (
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                          {['Politics', 'Economy', 'Society', 'Climate', 'Technology', 'Markets'].map((category) => (
                            <a
                              key={category}
                              href={getCategoryFilterUrl(activeCategoryType, category)}
                              className={`whitespace-nowrap hover:text-primary ${selectedCategoryName === category && activeCategoryType === currentCategoryTypeKey ? 'text-primary font-medium' : ''}`}
                              onClick={() => {
                                setCategoriesDropdownOpen(false);
                                setActiveCategoryType(null);
                              }}
                            >
                              {category}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Navigation Items */}
            {navigation.left.map((item) => (
              <button key={item.key} className={`text-sm transition-colors hover:text-gray-900 ${currentPath === item.href ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {item.name}
              </button>
            ))}
          </div>

          {/* Logo - Center */}
          <div className="flex items-center justify-center flex-shrink-0">
            <a href={`/${locale}`} className="flex items-center">
              <img src="https://cdn.detake.com/images/logo-black.svg" alt="logo" className="w-32" />
            </a>
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center space-x-6 flex-1 justify-end">
            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsDropdownRef} onMouseEnter={() => setCollectionsDropdownOpen(true)} onMouseLeave={() => setCollectionsDropdownOpen(false)}>
              <button onClick={handleCollectionsClick} className={`flex items-center cursor-pointer space-x-1  text-sm px-3 h-12  transition-colors hover:bg-gray-100 ${collectionsDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.navigation.collections} aria-expanded={collectionsDropdownOpen}>
                <span className={`${collectionsDropdownOpen ? 'text-white' : 'text-gray-600'}`}>{texts.navigation.collections}</span>
                <img src={collectionsDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${collectionsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Collections Dropdown Menu */}
              {collectionsDropdownOpen && (
                <div className="absolute -right-1 z-50 px-1">
                  <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[192px] w-max">
                    <div className="py-1">
                      {headerCollectionItems.map((item) => (
                        <a key={item.id} href={`/${locale}/collections/${item.id}`} className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors whitespace-nowrap ${activeCollectionId === item.id ? 'text-primary font-medium bg-gray-50' : 'text-gray-600'}`} onClick={() => setCollectionsDropdownOpen(false)}>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Navigation Items */}
            {navigation.right.map((item) =>
              item.key === 'learn' ? (
                <a key={item.key} href={item.href} className={`text-sm transition-colors hover:text-primary ${currentPath === item.href ? 'text-primary' : 'text-gray-600'}`}>
                  {item.name}
                </a>
              ) : (
                <button key={item.key} className={`text-sm transition-colors ${currentPath === item.href ? 'text-primary' : 'text-gray-600'}`}>
                  {item.name}
                </button>
              ),
            )}

            {/* Search Icon */}
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={texts.actions.search}>
              <img src={SearchIcon} alt="SearchIcon" className="w-4 h-4" />
            </button>

            {/* Locale Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={toggleLocaleDropdown} className={`flex items-center space-x-2 px-2 h-12 hover:bg-gray-100 rounded transition-colors ${localeDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.actions.switchLanguage} aria-expanded={localeDropdownOpen}>
                <img src={CountryIcon} alt="CountryIcon" className="w-4 h-4" />
                <span className={`text-sm ${localeDropdownOpen ? 'text-white' : 'text-gray-600'}`}>{currentLocaleConfig.name}</span>
                <img src={localeDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${localeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {localeDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {Object.entries(localeConfig).map(([key, config]) => (
                      <button key={key} onClick={() => onLocaleSwitch(key as Locale)} className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === key ? 'bg-gray-50 text-primary' : 'text-gray-600'}`}>
                        <span>{config.name}</span>
                        {locale === key && <span className="ml-auto text-xs text-primary">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Component - Can be customized for different projects */}
            {/* {userComponent || (
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                onClick={() => {
                  try {
                    const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                    // Track click event with context
                    if (typeof window !== 'undefined' && (window as any).detakeAnalytics) {
                      (window as any).detakeAnalytics.trackEvent(TRACKING_EVENTS.HEADER_USER_BUTTON_CLICK, {
                        hasToken: Boolean(storedAccessToken),
                        locale,
                        source: 'header_user_button',
                      });
                    }

                    if (storedAccessToken) {
                      window.open(`https://caaaeee.vercel.app/${locale}?t=${storedAccessToken}`, '_blank');
                    } else {
                      toast.error(texts.messages.pleaseLoginFirst);
                    }
                  } catch (err) {
                    console.warn('[Analytics] Failed to track header user button click:', err);
                  }
                }}
              >
                <img src="/me.svg" alt="logo" className="w-5 h-5" />
              </button>
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}
