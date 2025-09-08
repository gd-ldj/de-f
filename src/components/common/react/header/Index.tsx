import React, { useState, useEffect } from 'react';
import MobileHeader from './mobile';
import DesktopHeader from './DesktopHeader';
import { useDeviceType } from '@/lib/useDeviceType';

type Locale = 'us' | 'asia';

interface HeaderProps {
  userComponent?: React.ReactNode;
}

/**
 * Extract locale from current URL pathname
 * @returns Current locale from URL or default 'us'
 */
function getLocaleFromURL(): Locale {
  if (typeof window === 'undefined') return 'us';
  const pathname = window.location.pathname;
  const segments = pathname.split('/');
  const localeSegment = segments[1]; // First segment after domain
  return (localeSegment === 'asia' || localeSegment === 'us') ? localeSegment : 'us';
}

/**
 * Get current path from window location
 * @returns Current pathname
 */
function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname;
}

/**
 * Main header component that renders appropriate header based on device type
 */
export default function Header({ userComponent }: HeaderProps) {
  const [locale, setLocale] = useState<Locale>('us');
  const [currentPath, setCurrentPath] = useState<string>('/');
  const { isMobile, isInitialized } = useDeviceType();
  
  // Extract locale and path from URL on mount and URL changes
  useEffect(() => {
    const updateFromURL = () => {
      setLocale(getLocaleFromURL());
      setCurrentPath(getCurrentPath());
    };
    
    updateFromURL();
    
    // Listen for navigation changes (popstate for back/forward)
    window.addEventListener('popstate', updateFromURL);
    
    return () => {
      window.removeEventListener('popstate', updateFromURL);
    };
  }, []);

  /**
   * Handle locale switching with smooth transition
   */
  const handleLocaleSwitch = (newLocale: Locale) => {
    if (newLocale === locale) {
      return;
    }
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  // Prevent rendering until device type is determined to avoid hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <div data-header-loaded>
      {isMobile ? (
        <MobileHeader 
          locale={locale}
          currentPath={currentPath}
          onLocaleSwitch={handleLocaleSwitch}
        />
      ) : (
        <DesktopHeader 
          locale={locale}
          currentPath={currentPath}
          onLocaleSwitch={handleLocaleSwitch}
          userComponent={userComponent}
        />
      )}
    </div>
  );
}