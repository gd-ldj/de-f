import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe } from 'lucide-react';
import { headerTexts } from './constants';

// Import icons from local assets
import DownIcon from './assets/down.svg?url';
import DetakeLogo from './assets/detake.svg?url';

type Locale = 'us' | 'asia';

interface HeaderProps {
  locale: Locale;
  currentPath: string;
  userComponent?: React.ReactNode;
}

/**
 * Main header component with navigation and authentication
 * Enhanced with lucide-react icons and improved internationalization
 */
export default function Header({ locale, currentPath, userComponent }: HeaderProps) {
  const texts = headerTexts[locale] || headerTexts.us;
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localeDropdownOpen, setLocaleDropdownOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const collectionsDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
   * Handle locale switching with smooth transition
   */
  const handleLocaleSwitch = (newLocale: Locale) => {
    if (newLocale === locale) {
      setLocaleDropdownOpen(false);
      return;
    }
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

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

  /**
   * Toggle categories dropdown
   */
  const toggleCategoriesDropdown = () => {
    setCategoriesDropdownOpen(!categoriesDropdownOpen);
  };

  // Collections dropdown items
  const collectionsItems = [
    {
      name: texts.navigation.myCollections,
      href: `/${locale}/collections/my`,
      key: 'my-collections',
    }
  ];

  // Categories dropdown items
  const categoriesItems = [
    {
      name: texts.navigation.categories.news,
      href: `/${locale}/news`,
      key: 'news',
    },
    {
      name: texts.navigation.categories.insight,
      href: `/${locale}/insight`,
      key: 'insight',
    },
    {
      name: texts.navigation.categories.research,
      href: `/${locale}/research`,
      key: 'research',
    },
  ];

  return (
    <header className="border-b border-gray-200 fixed w-screen top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/95 bg-white/95">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Categories Dropdown */}
            <div className="" ref={categoriesDropdownRef}>
              <button 
                onClick={toggleCategoriesDropdown} 
                className={`flex items-center space-x-1 text-sm px-3 py-1.5 rounded transition-colors hover:bg-gray-100 ${categoriesDropdownOpen ? '!bg-primary/80' : ''}`}
                aria-label={texts.navigation.allCategories} 
                aria-expanded={categoriesDropdownOpen}
              >
                <span>{texts.navigation.allCategories}</span>
                <img 
                  src={DownIcon} 
                  alt="dropdown" 
                  className={`w-4 h-4 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Categories Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute left-0 right-0 top-[64px] w-screen bg-white z-50 border border-border">
                  <div className="max-w-[1440px] mx-auto px-4">
                    <div className="pt-4 pb-3">
                      <h3 className="text-lg font-medium text-foreground mb-2 mt-1">{texts.dropdown.article}</h3>
                      <div className="flex items-center gap-8">
                        {categoriesItems.map((item) => (
                          <a 
                            key={item.key} 
                            href={item.href} 
                            className={`text-sm py-2 relative transition-colors ${
                              currentPath === item.href 
                                ? 'text-primary font-medium' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`} 
                            onClick={() => setCategoriesDropdownOpen(false)}
                          >
                            {item.name}
                            {currentPath === item.href && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Navigation Items */}
            {navigation.left.map((item) => (
              <a key={item.key} href={item.href} className={`text-sm transition-colors hover:text-gray-900 ${currentPath === item.href ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {item.name}
              </a>
            ))}
          </div>

          {/* Logo - Center */}
          <div className="flex items-center">
            <a href={`/${locale}`} className="flex items-center">
              <img src={DetakeLogo} alt="logo" className="w-24" />
            </a>
          </div>

          {/* Right Navigation & Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsDropdownRef}>
              <button onClick={toggleCollectionsDropdown} className={`flex items-center space-x-1 text-sm px-3 py-1.5 transition-colors hover:bg-gray-100 ${collectionsDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.navigation.collections} aria-expanded={collectionsDropdownOpen}>
                <span>{texts.navigation.collections}</span>
                <img src={DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${collectionsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Collections Dropdown Menu */}
              {collectionsDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {collectionsItems.map((item) => (
                      <a key={item.key} href={item.href} className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentPath === item.href ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`} onClick={() => setCollectionsDropdownOpen(false)}>
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Navigation Items */}
            {navigation.right.map((item) => (
              <a key={item.key} href={item.href} className={`text-sm transition-colors hover:text-gray-900 ${currentPath === item.href ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {item.name}
              </a>
            ))}

            {/* Search Icon */}
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={texts.actions.search}>
              <Search className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </button>

            {/* Locale Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={toggleLocaleDropdown} className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded transition-colors ${localeDropdownOpen ? '!bg-primary/80' : ''}`} aria-label={texts.actions.switchLanguage} aria-expanded={localeDropdownOpen}>
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{currentLocaleConfig.name}</span>
                <img src={DownIcon} alt="dropdown" className={`w-4 h-4 transition-transform duration-200 ${localeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {localeDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {Object.entries(localeConfig).map(([key, config]) => (
                      <button key={key} onClick={() => handleLocaleSwitch(key as Locale)} className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === key ? 'bg-gray-50 text-primary' : 'text-gray-600'}`}>
                        <span>{config.name}</span>
                        {locale === key && <span className="ml-auto text-xs text-primary">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

           {/* User Component - Can be customized for different projects */}
            {userComponent}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={texts.actions.openMenu}>
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Navigation Items */}
            {[...navigation.left, ...navigation.right].map((item) => (
              <a key={item.key} href={item.href} className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPath === item.href ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>
                {item.name}
              </a>
            ))}

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button onClick={() => handleLocaleSwitch(locale === 'us' ? 'asia' : 'us')} className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                <span className="text-sm">{locale === 'us' ? '🌏' : '🇺🇸'}</span>
                <span>{locale === 'us' ? (texts.locale as any).switchToAsia || 'Switch to Asia' : (texts.locale as any).switchToUS || '切换到美国'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}