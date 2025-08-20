
// @ts-ignore
import astroI18next from 'astro-i18next'
// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel/serverless'
import inject from '@rollup/plugin-inject'

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
    plugins: [
      tailwindcss(),
      // Inject Buffer identifier for browser bundles so libraries expecting Node's Buffer work properly
      // This replaces free "Buffer" references with an import from the "buffer" package at build time
      inject({
        Buffer: ['buffer', 'Buffer']
      })
    ],
    // Ensure the buffer polyfill is optimized and available during dev
    optimizeDeps: {
      include: ['buffer']
    },
    // Provide a sane global object mapping in browser
    define: {
      global: 'globalThis'
    }
  }
})