
// @ts-ignore
import astroI18next from 'astro-i18next';
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';
// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  integrations: [react(), astroI18next()],
  i18n: {
    defaultLocale: 'us',
    locales: ['us', 'asia'],
    routing: {
      prefixDefaultLocale: true
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});