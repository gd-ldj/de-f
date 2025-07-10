import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Search, Globe, Settings } from 'lucide-react';
import type { Locale } from '@/types';
import { IdentityProvider } from './IdentityProvider';
import { WalletPopover } from '@/components/common/react/WalletPopover';
import { useTranslation } from "react-i18next";

interface HeaderProps {
  locale: Locale;
  currentPath: string;
}

/**
 * Main header component with navigation and authentication
 * Enhanced with lucide-react icons and improved internationalization
 */
export default function Header({ locale, currentPath }: HeaderProps) {
  const { t } = useTranslation('translation');
  console.log("🚀 ~ Header ~ t:", t('navigation.allCategories'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [privyTimeout, setPrivyTimeout] = useState(false);
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Enhanced debugging for Privy state
  console.log('🚀 ~ Header ~ Privy state:', { ready, authenticated, user: user?.id });

  // Set timeout for Privy initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) {
        setPrivyTimeout(true);
        console.warn('⚠️ Privy initialization timeout - showing fallback UI');
      }
    }, 5000); // 5 second timeout

    if (ready) {
      clearTimeout(timer);
      setPrivyTimeout(false);
    }

    return () => clearTimeout(timer);
  }, [ready]);

  // Show auth section if ready or if timeout occurred
  const showAuthSection = ready || privyTimeout;

  // Internationalized navigation items
  const navigation = {
    left: [
      {
        name: t('navigation.allCategories'),
        href: `/${locale}`,
        key: 'categories',
      },
      {
        name: locale === 'us' ? 'Social Media' : '社交媒体',
        href: `/${locale}/social`,
        key: 'social',
      },
      {
        name: locale === 'us' ? 'Explore' : '探索',
        href: `/${locale}/explore`,
        key: 'explore',
      },
      {
        name: locale === 'us' ? 'Technology' : '技术',
        href: `/${locale}/technology`,
        key: 'technology',
      },
    ],
    right: [
      {
        name: locale === 'us' ? 'Collections' : '收藏',
        href: `/${locale}/collections`,
        key: 'collections',
      },
      {
        name: locale === 'us' ? 'Trending' : '热门',
        href: `/${locale}/trending`,
        key: 'trending',
      },
      {
        name: locale === 'us' ? 'Learn' : '学习',
        href: `/${locale}/learn`,
        key: 'learn',
      },
    ],
  };

  // Locale configuration
  const localeConfig = {
    us: {
      flag: '🇺🇸',
      name: 'North America',
      displayName: 'US',
    },
    asia: {
      flag: '🌏',
      name: '亚洲地区',
      displayName: 'Asia',
    },
  };

  const currentLocaleConfig = localeConfig[locale] || localeConfig.us;

  /**
   * Handle locale switching with smooth transition
   */
  const handleLocaleSwitch = () => {
    const newLocale = locale === 'us' ? 'asia' : 'us';
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.left.map((item) => (
              <a key={item.key} href={item.href} className={`text-sm transition-colors hover:text-gray-900 ${currentPath === item.href ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {item.name}
              </a>
            ))}
          </div>

          {/* Logo - Center */}
          <div className="flex items-center">
            <a href={`/${locale}`} className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                de<span className="text-teal-500">Take</span>
              </h1>
            </a>
          </div>

          {/* Right Navigation & Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Right Navigation Items */}
            {navigation.right.map((item) => (
              <a key={item.key} href={item.href} className={`text-sm transition-colors hover:text-gray-900 ${currentPath === item.href ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {item.name}
              </a>
            ))}

            {/* Search Icon */}
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={locale === 'us' ? 'Search' : '搜索'}>
              <Search className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </button>

            {/* Locale Switcher */}
            <button onClick={handleLocaleSwitch} className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={locale === 'us' ? 'Switch Language' : '切换语言'}>
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">{currentLocaleConfig.name}</span>
            </button>

            {/* Settings */}
            <IdentityProvider>
              <WalletPopover>
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label={locale === 'us' ? 'Settings' : '设置'}>
                  <Settings className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                </button>
              </WalletPopover>
            </IdentityProvider>
            {/* Wallet Component */}
            {/* <Wallet /> */}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={locale === 'us' ? 'Open menu' : '打开菜单'}>
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
              <button onClick={handleLocaleSwitch} className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                <Globe className="w-4 h-4" />
                <span>{locale === 'us' ? 'Switch to Asia' : '切换到美国'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
