import * as React from 'react';
import { headerTexts, HEADER_LOGO_BLACK_URL } from './constants';
import { STORAGE_KEYS, TRACKING_EVENTS, MULTI_SOURCE_CONFIG, IS_DEV_ENV } from '@/config/constants';
import { toast } from '@/components/common/react/Toast';
import type { Locale, SourceLanguage } from '@/types';
import { removeTranslationPrefix } from '@/lib/language-utils';
import SearchOverlay from './SearchOverlay';

// Import icons from local assets
import DownIcon from './assets/down.svg?url';
import DownWhiteIcon from './assets/down_white.svg?url';
import CountryIcon from './assets/country.svg?url';
import SearchIcon from './assets/search.svg?url';

interface DesktopHeaderProps {
  locale: Locale;
  currentPath: string;
  onLocaleSwitch: (newLocale: Locale) => void;
  userComponent?: React.ReactNode;
}

export default function DesktopHeader({ locale, currentPath, onLocaleSwitch, userComponent }: DesktopHeaderProps) {
  const [localeDropdownOpen, setLocaleDropdownOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = React.useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = React.useState<string | null>(null);
  const [selectedSubcategoryName, setSelectedSubcategoryName] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = React.useRef<HTMLDivElement>(null);
  const researchDropdownRef = React.useRef<HTMLDivElement>(null);
  const insightsDropdownRef = React.useRef<HTMLDivElement>(null);
  const voicesDropdownRef = React.useRef<HTMLDivElement>(null);
  const tutorialsDropdownRef = React.useRef<HTMLDivElement>(null);
  const [researchDropdownOpen, setResearchDropdownOpen] = React.useState(false);
  const [insightsDropdownOpen, setInsightsDropdownOpen] = React.useState(false);
  const [voicesDropdownOpen, setVoicesDropdownOpen] = React.useState(false);
  const [tutorialsDropdownOpen, setTutorialsDropdownOpen] = React.useState(false);
  // Initialize source language from domain (for non-localhost environments)
  const getInitialSourceLanguage = (): SourceLanguage => {
    if (typeof window === 'undefined') {
      return MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE;
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname.startsWith('localhost:') || hostname === '127.0.0.1';

    if (isLocalhost && IS_DEV_ENV) {
      // Localhost: Use localStorage if available
      const stored = localStorage.getItem(STORAGE_KEYS.SOURCE_LANGUAGE) as SourceLanguage | null;
      if (stored && ['en', 'zh', 'ja'].includes(stored)) {
        return stored;
      }
    }

    // Non-localhost: Always use domain
    const domainLanguage = MULTI_SOURCE_CONFIG.getSourceLanguageFromDomain(hostname);

    // Update localStorage to match domain (prevents stale data)
    if (!isLocalhost) {
      localStorage.setItem(STORAGE_KEYS.SOURCE_LANGUAGE, domainLanguage);
    }

    return domainLanguage;
  };

  const [currentSourceLanguage, setCurrentSourceLanguage] = React.useState<SourceLanguage>(getInitialSourceLanguage);
  const texts = headerTexts[locale] || headerTexts.en;
  const enTexts = headerTexts.en;

  const pathSegments = currentPath.split('/');

  // Handle click outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocaleDropdownOpen(false);
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

  // Note: currentSourceLanguage is initialized correctly in useState above
  // No need for additional useEffect to set it

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('category_name');
    const categoryTag = params.get('subcategory_name');
    setSelectedCategoryName(categoryName);
    setSelectedSubcategoryName(categoryTag);
  }, [currentPath]);


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
      const portPart = port ? `:${port}` : '';
      const nextUrl = `${protocol}//${hostname}${portPart}/`;
      window.location.href = nextUrl;
      return;
    }

    const portPart = port ? `:${port}` : '';
    const newUrl = `${protocol}//${targetHost}${portPart}/`;
    window.location.href = newUrl;
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


  const getCategoryFilterUrl = (typeKey: string, categoryLabel: string) => {
    const typeItem = categoriesItems.find((item) => item.key === typeKey);
    const baseHref = typeItem?.href || `/${typeKey}`;
    const encodedCategory = encodeURIComponent(categoryLabel);
    return `${baseHref}?category_name=${encodedCategory}`;
  };

  return (
    <>
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
                <img src={categoriesDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute left-0 z-50">
                  <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[480px] w-max">
                    <div className="py-3 px-4">
                      <div className="mt-1 grid grid-cols-4 gap-8">
                        {texts.dropdown.newsGroups.map((group, groupIndex) => {
                          const enGroup = enTexts.dropdown.newsGroups[groupIndex];
                          const isGroupActive = currentCategoryTypeKey === 'news' && (selectedCategoryName === group.name || selectedCategoryName === enGroup.name);

                          return (
                            <div key={group.key} className="min-w-[160px]">
                              <a href={getCategoryFilterUrl('news', enGroup.name)} className={`block text-base font-medium mb-3 text-foreground hover:text-primary cursor-pointer ${isGroupActive ? 'text-primary' : ''}`} onClick={() => setCategoriesDropdownOpen(false)}>
                                {group.name}
                              </a>
                              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                {group.items.map((category, itemIndex) => {
                                  const enCategory = enGroup.items[itemIndex];
                                  const isSubcategoryActive = currentCategoryTypeKey === 'news' && (selectedCategoryName === group.name || selectedCategoryName === enGroup.name) && (selectedSubcategoryName === category || selectedSubcategoryName === enCategory);

                                  return (
                                    <a
                                      key={category}
                                      href={`${getCategoryFilterUrl('news', enGroup.name)}&subcategory_name=${encodeURIComponent(enCategory)}`}
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
                    <a href={item.href} className={`flex items-center space-x-1 text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${researchDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                      <img src={researchDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${researchDropdownOpen ? 'rotate-180' : ''}`} />
                    </a>
                    {researchDropdownOpen && (
                      <div className="absolute -left-1 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.researchItems.map((label, index) => {
                                const enLabel = enTexts.dropdown.researchItems[index];
                                const isResearchItemActive = currentCategoryTypeKey === 'research' && (selectedCategoryName === label || selectedCategoryName === enLabel);

                                return (
                                  <a key={label} href={getCategoryFilterUrl('research', enLabel)} className={`whitespace-nowrap hover:text-primary ${isResearchItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setResearchDropdownOpen(false)}>
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
                    <a href={item.href} className={`flex items-center space-x-1 text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${insightsDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                      <img src={insightsDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${insightsDropdownOpen ? 'rotate-180' : ''}`} />
                    </a>
                    {insightsDropdownOpen && (
                      <div className="absolute -left-1 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.insightsItems.map((label, index) => {
                                const enLabel = enTexts.dropdown.insightsItems[index];
                                const isInsightsItemActive = currentCategoryTypeKey === 'insights' && (selectedCategoryName === label || selectedCategoryName === enLabel);

                                return (
                                  <a key={label} href={getCategoryFilterUrl('insights', enLabel)} className={`whitespace-nowrap hover:text-primary ${isInsightsItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setInsightsDropdownOpen(false)}>
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
                    <a href={item.href} className={`flex items-center space-x-1 text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${voicesDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                      <img src={voicesDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${voicesDropdownOpen ? 'rotate-180' : ''}`} />
                    </a>
                    {voicesDropdownOpen && (
                      <div className="absolute -left-1 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.voicesItems.map((label, index) => {
                                const enLabel = enTexts.dropdown.voicesItems[index];
                                const isVoicesItemActive = currentCategoryTypeKey === 'voices' && (selectedCategoryName === label || selectedCategoryName === enLabel);

                                return (
                                  <a key={label} href={getCategoryFilterUrl('voices', enLabel)} className={`whitespace-nowrap hover:text-primary ${isVoicesItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setVoicesDropdownOpen(false)}>
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
            {/* Collections Link */}
            <a href="/collections" className={`text-sm px-3 h-12 flex items-center transition-colors hover:bg-gray-100 rounded ${isCollectionsRouteActive ? 'text-primary' : 'text-gray-600'}`}>
              {texts.navigation.collections}
            </a>

            {/* Right Navigation Items */}
            {navigation.right.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`) || currentPath.startsWith(`${item.href}?`);

              if (item.key === 'tutorials') {
                return (
                  <div key={item.key} className="relative" ref={tutorialsDropdownRef} onMouseEnter={() => setTutorialsDropdownOpen(true)} onMouseLeave={() => setTutorialsDropdownOpen(false)}>
                    <a href={item.href} className={`flex items-center space-x-1 text-sm px-3 h-12 rounded transition-colors hover:bg-gray-100 ${tutorialsDropdownOpen ? '!bg-primary/80 text-white' : isActive ? 'text-primary' : 'text-gray-600'}`}>
                      {item.name}
                      <img src={tutorialsDropdownOpen ? DownWhiteIcon : DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${tutorialsDropdownOpen ? 'rotate-180' : ''}`} />
                    </a>
                    {tutorialsDropdownOpen && (
                      <div className="absolute right-0 z-50 px-1">
                        <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px] w-max">
                          <div className="py-3 px-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              {texts.dropdown.tutorialsItems.map((label, index) => {
                                const enLabel = enTexts.dropdown.tutorialsItems[index];
                                const isTutorialItemActive = isTutorialsRouteActive && (selectedCategoryName === label || selectedCategoryName === enLabel);

                                return (
                                  <a key={label} href={getCategoryFilterUrl('tutorials', enLabel)} className={`whitespace-nowrap hover:text-primary ${isTutorialItemActive ? 'text-primary font-medium' : ''}`} onClick={() => setTutorialsDropdownOpen(false)}>
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
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={texts.actions.search} onClick={() => setSearchOpen((prev) => !prev)} data-testid="desktop-search-btn">
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

            {/* User Component - AuthMount portal renders WalletPopover here */}
            {/* Default avatar shown immediately; auto-hidden via CSS when portal content appears */}
            <div id="user-button-root">
              <button className="p-1 hover:bg-gray-100 rounded-md transition-colors outline-none [&:not(:only-child)]:hidden" aria-label="User menu">
                <img src="/me.svg" alt="User" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <SearchOverlay locale={locale} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
