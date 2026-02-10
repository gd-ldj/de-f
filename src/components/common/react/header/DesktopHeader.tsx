import * as React from 'react';
import { headerTexts, HEADER_LOGO_BLACK_URL } from './constants';
import { STORAGE_KEYS, TRACKING_EVENTS, MULTI_SOURCE_CONFIG } from '@/config/constants';
import { toast } from '@/components/common/react/Toast';
import type { CollectionItem, SourceLanguage } from '@/types';
import { fetchCollections } from '@/api/collections';
import { removeTranslationPrefix } from '@/lib/language-utils';

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
  const [localeDropdownOpen, setLocaleDropdownOpen] = React.useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = React.useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = React.useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = React.useState<string | null>(null);
  const [selectedSubcategoryName, setSelectedSubcategoryName] = React.useState<string | null>(null);
  const [headerCollectionItems, setHeaderCollectionItems] = React.useState<CollectionItem[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const collectionsDropdownRef = React.useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = React.useRef<HTMLDivElement>(null);
  const researchDropdownRef = React.useRef<HTMLDivElement>(null);
  const insightsDropdownRef = React.useRef<HTMLDivElement>(null);
  const voicesDropdownRef = React.useRef<HTMLDivElement>(null);
  const tutorialsDropdownRef = React.useRef<HTMLDivElement>(null);
  const [researchDropdownOpen, setResearchDropdownOpen] = React.useState(false);
  const [insightsDropdownOpen, setInsightsDropdownOpen] = React.useState(false);
  const [voicesDropdownOpen, setVoicesDropdownOpen] = React.useState(false);
  const [tutorialsDropdownOpen, setTutorialsDropdownOpen] = React.useState(false);
  const [currentSourceLanguage, setCurrentSourceLanguage] = React.useState<SourceLanguage>('en');
  const [isLocalHost, setIsLocalHost] = React.useState(false);
  const localeForTexts = isLocalHost ? MULTI_SOURCE_CONFIG.languageToLocale(currentSourceLanguage) : locale;
  const texts = headerTexts[localeForTexts] || headerTexts.us;

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
      }
      if (researchDropdownRef.current && !researchDropdownRef.current.contains(event.target as Node)) {
        setResearchDropdownOpen(false);
      }
      if (insightsDropdownRef.current && !insightsDropdownRef.current.contains(event.target as Node)) {
        setInsightsDropdownOpen(false);
      }
      if (voicesDropdownRef.current && !voicesDropdownRef.current.contains(event.target as Node)) {
        setVoicesDropdownOpen(false);
      }
      if (tutorialsDropdownRef.current && !tutorialsDropdownRef.current.contains(event.target as Node)) {
        setTutorialsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      setCurrentSourceLanguage(MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE);
      return;
    }
    const hostname = window.location.hostname;
    const allConfiguredDomains = Object.values(MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE_DOMAINS).flat();
    const isKnownDomain = allConfiguredDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    const storedLanguage = localStorage.getItem(STORAGE_KEYS.SOURCE_LANGUAGE) as SourceLanguage | null;
    const supportedLanguages: SourceLanguage[] = ['en', 'zh', 'ja'];
    const isStoredLanguageValid = storedLanguage ? supportedLanguages.includes(storedLanguage) : false;
    const detectedLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname);
    setIsLocalHost(!isKnownDomain);
    if (!isKnownDomain && isStoredLanguageValid) {
      setCurrentSourceLanguage(storedLanguage as SourceLanguage);
    } else {
      setCurrentSourceLanguage(detectedLanguage);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('category_name');
    const categoryTag = params.get('subcategory_name');
    setSelectedCategoryName(categoryName);
    setSelectedSubcategoryName(categoryTag);
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
    setCategoriesDropdownOpen(!categoriesDropdownOpen);
  };

  const handleCategoriesRootClick = () => {
    setCategoriesDropdownOpen(false);
    if (typeof window !== 'undefined') {
      const defaultCategory = categoriesItems[0];
      const targetHref = defaultCategory?.href || `/news`;
      window.location.href = targetHref;
    }
  };

  // Internationalized navigation items
  const navigation = {
    left: [
      {
        name: texts.navigation.categories.research,
        href: `/research`,
        key: 'research',
      },
      {
        name: texts.navigation.categories.insights,
        href: `/insights`,
        key: 'insights',
      },
      {
        name: texts.navigation.categories.voices,
        href: `/voices`,
        key: 'voices',
      },
    ],
    right: [
      {
        name: texts.navigation.learn,
        href: `/tutorials`,
        key: 'tutorials',
      },
    ],
  };

  const languageOptions: { code: SourceLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
  ];

  const currentLanguageOption = languageOptions.find((item) => item.code === currentSourceLanguage) || languageOptions[0];

  /**
   * Toggle locale dropdown
   */
  const toggleLocaleDropdown = () => {
    setLocaleDropdownOpen(!localeDropdownOpen);
  };

  /**
   * 根据选择的源站语言跳转到对应站点域名（桌面端语言切换）
   * - 生产/预发环境：切换到对应语言域名（含多语言子域）
   * - 测试/本地环境：如果当前域名不在已知配置列表，则仅保留当前域名，避免写死跳转
   */
  const handleLanguageSwitch = (targetLanguage: SourceLanguage) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (targetLanguage === currentSourceLanguage) {
      setLocaleDropdownOpen(false);
      return;
    }
    const { protocol, hostname, port, search, hash } = window.location;

    // 先尝试基于语言前缀子域名进行替换，如 en.detake.com / zh.detake.com / ja.detake.com
    const subdomainMatch = hostname.match(/^(en|zh|ja)\.(.+)$/);

    // 判断当前域名是否在配置的多源语言域名列表中（生产/预发）
    const allConfiguredDomains = Object.values(MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE_DOMAINS).flat();
    const isKnownDomain = allConfiguredDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

    const persistLanguage = (language: SourceLanguage) => {
      localStorage.setItem(STORAGE_KEYS.SOURCE_LANGUAGE, language);
      document.cookie = `${STORAGE_KEYS.SOURCE_LANGUAGE}=${language}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    };

    persistLanguage(targetLanguage);

    let targetHost = hostname;

    if (subdomainMatch) {
      // 当前是语言前缀子域，直接替换前缀
      const rootDomain = subdomainMatch[2];
      targetHost = `${targetLanguage}.${rootDomain}`;
    } else if (isKnownDomain) {
      // 当前是已知生产/预发域名，根据配置选择目标语言的域名
      const targetDomains = MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE_DOMAINS[targetLanguage] || [];
      if (targetDomains.length > 0) {
        targetHost = targetDomains[0];
      }
    } else {
      setCurrentSourceLanguage(targetLanguage);
      setLocaleDropdownOpen(false);
      const currentPathname = window.location.pathname;
      const nextPath = removeTranslationPrefix(currentPathname);
      const portPart = port ? `:${port}` : '';
      const nextUrl = `${protocol}//${hostname}${portPart}${nextPath}${search}${hash}`;
      if (nextUrl !== window.location.href) {
        window.location.href = nextUrl;
      } else {
        window.location.href = window.location.href;
      }
      return;
    }

    const portPart = port ? `:${port}` : '';
    const newUrl = `${protocol}//${targetHost}${portPart}${currentPath}${search}${hash}`;
    window.location.href = newUrl;
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
      href: `/news`,
      key: 'news',
    },
    {
      name: texts.navigation.categories.insights,
      href: `/insights`,
      key: 'insights',
    },
    {
      name: texts.navigation.categories.research,
      href: `/research`,
      key: 'research',
    },
    {
      name: texts.navigation.categories.voices,
      href: `/voices`,
      key: 'voices',
    },
  ];

  const articleIndex = pathSegments.indexOf('article');
  const articleCategoryKey = articleIndex >= 0 && pathSegments.length > articleIndex + 1 ? pathSegments[articleIndex + 1] : null;
  const normalizedArticleCategoryKey = categoriesItems.some((item) => item.key === articleCategoryKey) ? articleCategoryKey : null;
  const currentCategoryTypeKey = categoriesItems.find((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`) || currentPath.startsWith(`${item.href}?`))?.key || normalizedArticleCategoryKey || null;

  const isCategoryRouteActive = categoriesItems.some((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`) || currentPath.startsWith(`${item.href}?`)) || Boolean(currentCategoryTypeKey);

  const isCollectionsRouteActive = currentPath.startsWith(`/collections`);
  const isNewsRouteActive = currentPath === `/news` || currentPath.startsWith(`/news/`) || currentPath.startsWith(`/news?`) || normalizedArticleCategoryKey === 'news';
  const isTutorialsRouteActive = currentPath === `/tutorials` || currentPath.startsWith(`/tutorials/`) || currentPath.startsWith(`/tutorials?`);

  const handleCollectionsClick = () => {
    setCollectionsDropdownOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = `/collections`;
    }
  };

  const getCategoryFilterUrl = (typeKey: string, categoryLabel: string) => {
    const typeItem = categoriesItems.find((item) => item.key === typeKey);
    const baseHref = typeItem?.href || `/${typeKey}`;
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
            <div
              className="relative"
              ref={categoriesDropdownRef}
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => {
                setCategoriesDropdownOpen(false);
              }}
            >
              <button onClick={handleCategoriesRootClick} className={`flex items-center space-x-1 text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${categoriesDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.navigation.news} aria-expanded={categoriesDropdownOpen}>
                <span className={`${categoriesDropdownOpen ? 'text-white' : isNewsRouteActive ? 'text-primary' : 'text-gray-600'}`}>{texts.navigation.news}</span>
              </button>

              {/* Categories Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute left-0 z-50">
                  <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[480px] w-max">
                    <div className="py-3 px-4">
                      <div className="mt-1 grid grid-cols-4 gap-8">
                        {texts.dropdown.newsGroups.map((group) => {
                          const isGroupActive = currentCategoryTypeKey === 'news' && selectedCategoryName === group.name;

                          return (
                            <div key={group.key} className="min-w-[160px]">
                              <a href={getCategoryFilterUrl('news', group.name)} className={`block text-sm font-medium mb-2 text-foreground hover:text-primary cursor-pointer ${isGroupActive ? 'text-primary' : ''}`} onClick={() => setCategoriesDropdownOpen(false)}>
                                {group.name}
                              </a>
                              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                {group.items.map((category) => {
                                  const isSubcategoryActive = currentCategoryTypeKey === 'news' && selectedCategoryName === group.name && selectedSubcategoryName === category;

                                  return (
                                    <a
                                      key={category}
                                      href={`${getCategoryFilterUrl('news', group.name)}&subcategory_name=${encodeURIComponent(category)}`}
                                      className={`whitespace-nowrap hover:text-primary ${isSubcategoryActive ? 'text-primary font-medium' : ''}`}
                                      onClick={() => {
                                        setCategoriesDropdownOpen(false);
                                      }}
                                    >
                                      {category}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {navigation.left.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`) || currentPath.startsWith(`${item.href}?`) || normalizedArticleCategoryKey === item.key;

              if (item.key === 'research') {
                return (
                  <div key={item.key} className="relative" ref={researchDropdownRef} onMouseEnter={() => setResearchDropdownOpen(true)} onMouseLeave={() => setResearchDropdownOpen(false)}>
                    <a href={item.href} className={`flex items-center text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${researchDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                    </a>
                    {researchDropdownOpen && (
                      <div className="absolute -left-1 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.researchItems.map((label) => {
                                const isResearchItemActive = currentCategoryTypeKey === 'research' && selectedCategoryName === label;

                                return (
                                  <a key={label} href={getCategoryFilterUrl('research', label)} className={`whitespace-nowrap hover:text-primary ${isResearchItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setResearchDropdownOpen(false)}>
                                    {label}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.key === 'insights') {
                return (
                  <div key={item.key} className="relative" ref={insightsDropdownRef} onMouseEnter={() => setInsightsDropdownOpen(true)} onMouseLeave={() => setInsightsDropdownOpen(false)}>
                    <a href={item.href} className={`flex items-center text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${insightsDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                    </a>
                    {insightsDropdownOpen && (
                      <div className="absolute -left-1 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.insightsItems.map((label) => {
                                const isInsightsItemActive = currentCategoryTypeKey === 'insights' && selectedCategoryName === label;

                                return (
                                  <a key={label} href={getCategoryFilterUrl('insights', label)} className={`whitespace-nowrap hover:text-primary ${isInsightsItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setInsightsDropdownOpen(false)}>
                                    {label}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.key === 'voices') {
                return (
                  <div key={item.key} className="relative" ref={voicesDropdownRef} onMouseEnter={() => setVoicesDropdownOpen(true)} onMouseLeave={() => setVoicesDropdownOpen(false)}>
                    <a href={item.href} className={`flex items-center text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${voicesDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                    </a>
                    {voicesDropdownOpen && (
                      <div className="absolute -left-1 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.voicesItems.map((label) => {
                                const isVoicesItemActive = currentCategoryTypeKey === 'voices' && selectedCategoryName === label;

                                return (
                                  <a key={label} href={getCategoryFilterUrl('voices', label)} className={`whitespace-nowrap hover:text-primary ${isVoicesItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setVoicesDropdownOpen(false)}>
                                    {label}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a key={item.key} href={item.href} className={`text-sm transition-colors hover:text-gray-900 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Logo - Center */}
          <div className="flex items-center justify-center flex-shrink-0">
            <a href={`/`} className="flex items-center">
              <img src={HEADER_LOGO_BLACK_URL} alt="logo" className="w-8" />
            </a>
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center space-x-6 flex-1 justify-end">
            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsDropdownRef} onMouseEnter={() => setCollectionsDropdownOpen(true)} onMouseLeave={() => setCollectionsDropdownOpen(false)}>
              <button onClick={handleCollectionsClick} className={`flex items-center cursor-pointer space-x-1  text-sm px-3 h-12  transition-colors hover:bg-gray-100 ${collectionsDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.navigation.collections} aria-expanded={collectionsDropdownOpen}>
                <span className={`${collectionsDropdownOpen ? 'text-white' : isCollectionsRouteActive ? 'text-primary' : 'text-gray-600'}`}>{texts.navigation.collections}</span>
                <img src={collectionsDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${collectionsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Collections Dropdown Menu */}
              {collectionsDropdownOpen && (
                <div className="absolute -right-1 z-50 px-1">
                  <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[192px] w-max">
                    <div className="py-1">
                      {headerCollectionItems.map((item) => (
                        <a key={item.id} href={`/collections/${item.id}`} className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors whitespace-nowrap ${activeCollectionId === item.id ? 'text-primary font-medium bg-gray-50' : 'text-gray-600'}`} onClick={() => setCollectionsDropdownOpen(false)}>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Navigation Items */}
            {navigation.right.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`) || currentPath.startsWith(`${item.href}?`);

              if (item.key === 'tutorials') {
                return (
                  <div key={item.key} className="relative" ref={tutorialsDropdownRef} onMouseEnter={() => setTutorialsDropdownOpen(true)} onMouseLeave={() => setTutorialsDropdownOpen(false)}>
                    <a href={item.href} className={`flex items-center text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${tutorialsDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                    </a>
                    {tutorialsDropdownOpen && (
                      <div className="absolute right-0 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.tutorialsItems.map((label) => {
                                const isTutorialItemActive = isTutorialsRouteActive && selectedCategoryName === label;

                                return (
                                  <a key={label} href={getCategoryFilterUrl('tutorials', label)} className={`whitespace-nowrap hover:text-primary ${isTutorialItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setTutorialsDropdownOpen(false)}>
                                    {label}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button key={item.key} className={`text-sm transition-colors ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                  {item.name}
                </button>
              );
            })}

            {/* Search Icon */}
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={texts.actions.search}>
              <img src={SearchIcon} alt="SearchIcon" className="w-4 h-4" />
            </button>

            {/* Locale Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={toggleLocaleDropdown} className={`flex items-center space-x-2 px-2 h-12 hover:bg-gray-100 rounded transition-colors ${localeDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.actions.switchLanguage} aria-expanded={localeDropdownOpen}>
                <img src={CountryIcon} alt="CountryIcon" className="w-4 h-4" />
                <span className={`text-sm ${localeDropdownOpen ? 'text-white' : 'text-gray-600'}`}>{currentLanguageOption.label}</span>
                <img src={localeDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${localeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {localeDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-4 py-2 border-b border-gray-100 text-xs font-medium text-gray-400">{texts.dropdown.internationalEdition}</div>
                  <div className="py-1">
                    {languageOptions.map((option) => (
                      <button key={option.code} onClick={() => handleLanguageSwitch(option.code)} className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentSourceLanguage === option.code ? 'bg-gray-50 text-primary' : 'text-gray-600'}`}>
                        <span>{option.label}</span>
                        {currentSourceLanguage === option.code && <span className="ml-auto text-xs text-primary">✓</span>}
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
