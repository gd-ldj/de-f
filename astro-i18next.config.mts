/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: 'us',
  locales: ['us', 'asia'],
  load: ['server', 'client'],
  i18nextServerPlugins: {
    '{initReactI18next}': 'react-i18next',
  },
  i18nextClientPlugins: {
    '{initReactI18next}': 'react-i18next',
  },
};
