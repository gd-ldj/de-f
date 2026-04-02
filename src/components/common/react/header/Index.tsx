import React from 'react';
import MobileHeader from './mobile';
import DesktopHeader from './DesktopHeader';
import { MULTI_SOURCE_CONFIG } from '@/config/constants';
import type { Locale } from '@/types';

interface HeaderProps {
  locale: Locale;
  currentPath: string;
  userComponent?: React.ReactNode;
}

export default function Header({ locale, currentPath, userComponent }: HeaderProps) {
  const handleLocaleSwitch = (newLocale: Locale) => {
    if (newLocale === locale) {
      return;
    }
    if (typeof window !== 'undefined') {
      const targetLanguage = MULTI_SOURCE_CONFIG.localeToLanguage(newLocale);
      const domains = MULTI_SOURCE_CONFIG.SOURCE_LANGUAGE_DOMAINS[targetLanguage] || [];
      const targetDomain = domains[0] || window.location.hostname;
      const protocol = window.location.protocol;
      const newUrl = `${protocol}//${targetDomain}${currentPath}${window.location.search}${window.location.hash}`;
      window.location.href = newUrl;
    }
  };

  return (
    <div data-header-loaded role="banner">
      <div className="md:hidden" aria-hidden={false}>
        <MobileHeader locale={locale} currentPath={currentPath} onLocaleSwitch={handleLocaleSwitch} />
      </div>
      <div className="hidden md:block" aria-hidden={false}>
        <DesktopHeader locale={locale} currentPath={currentPath} onLocaleSwitch={handleLocaleSwitch} userComponent={userComponent} />
      </div>
    </div>
  );
}
