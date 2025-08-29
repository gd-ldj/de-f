import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '@/lib/i18n';
import type { Locale } from '@/types';

interface I18nProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

export default function I18nProvider({ locale, children }: I18nProviderProps) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        const instance = await initI18n(locale);
        setI18nInstance(instance);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setIsLoading(false);
      }
    };

    initializeI18n();
  }, [locale]);

  if (isLoading || !i18nInstance) {
    return <div>Loading...</div>;
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
}