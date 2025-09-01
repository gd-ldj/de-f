import React from 'react';
import type { Locale } from '@/types';

interface I18nProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

// Simple provider that passes locale to children via context
// The actual translation is handled by the custom t() function in @/lib/i18n
export default function I18nProvider({ locale, children }: I18nProviderProps) {
  return (
    <div data-locale={locale}>
      {children}
    </div>
  );
}