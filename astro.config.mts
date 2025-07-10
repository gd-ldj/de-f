
// @ts-ignore
import astroI18next from 'astro-i18next';
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR
  adapter: node({
    mode: 'standalone'
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