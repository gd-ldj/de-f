/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: 'us',
  locales: ['us', 'asia'],
  load: ['server', 'client'],
  i18nextServer: {
    resources: {
      us: {
        translation: {},
      },
      asia: {
        translation: {},
      },
    },
    fallbackLng: 'us',
    interpolation: {
      escapeValue: false,
    },
  },
  i18nextClient: {
    resources: {
      us: {
        translation: {},
      },
      asia: {
        translation: {},
      },
    },
    fallbackLng: 'us',
    interpolation: {
      escapeValue: false,
    },
  },
  i18nextServerPlugins: {
    '{initReactI18next}': 'react-i18next',
  },
  i18nextClientPlugins: {
    '{initReactI18next}': 'react-i18next',
  },
};
