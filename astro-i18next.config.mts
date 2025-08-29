/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: 'us',
  locales: ['us', 'asia'],
  load: ['server', 'client'],
  i18nextServer: {
    backend: {
      loadPath: './public/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'us',
    interpolation: {
      escapeValue: false,
    },
  },
  i18nextClient: {
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'us',
    interpolation: {
      escapeValue: false,
    },
  },
  i18nextServerPlugins: {
    '{initReactI18next}': 'react-i18next',
    'Backend': 'i18next-fs-backend',
  },
  i18nextClientPlugins: {
    '{initReactI18next}': 'react-i18next',
    'Backend': 'i18next-http-backend',
  },
};
