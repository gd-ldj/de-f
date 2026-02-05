import React from 'react';
import MobileHeader from './mobile';
import DesktopHeader from './DesktopHeader';

type Locale = 'us' | 'asia';

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
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    if (typeof window !== 'undefined') {
      window.location.href = newPath;
    }
  };

  return (
    <div data-header-loaded>
      <div className="md:hidden">
        <MobileHeader locale={locale} currentPath={currentPath} onLocaleSwitch={handleLocaleSwitch} />
      </div>
      <div className="hidden md:block">
        <DesktopHeader locale={locale} currentPath={currentPath} onLocaleSwitch={handleLocaleSwitch} userComponent={userComponent} />
      </div>
    </div>
  );
}
