import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getTranslations } from './translations';

export const initI18n = async (language: string = 'us') => {
  // Get translations for the specific language
  const translationUS = getTranslations('us');
  const translationAsia = getTranslations('asia');
  
  const resources = {
    us: {
      translation: translationUS,
    },
    asia: {
      translation: translationAsia,
    },
  };

  if (!i18next.isInitialized) {
    await i18next.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: 'us',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  } else {
    // If already initialized, just change language
    await i18next.changeLanguage(language);
  }
  
  return i18next;
};

export default i18next;