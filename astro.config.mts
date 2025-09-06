// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';

import { nodePolyfills } from 'vite-plugin-node-polyfills';


const isDev = process.env.NODE_ENV === 'development';
console.log('🚀 ~ isDev:', isDev);

// https://astro.build/config
const devDefineConfig = defineConfig({
  output: 'server', // Enable SSR
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [react()],
  i18n: {
    defaultLocale: 'us',
    locales: ['us', 'asia'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
      nodePolyfills({
        globals: { Buffer: true, global: true, process: true },
        protocolImports: true,
        include: ['buffer', 'process', 'path', 'util', 'fs', 'os'],
      }) as any,

    ],
    define: {
      global: 'globalThis',
      module: '{}',
      __dirname: '"/"',
      __filename: '"/index.js"',
      'process.env.NODE_ENV': '"development"',
      'import.meta.url': '"file:///index.js"',
    },
    resolve: {
      alias: {
        buffer: 'buffer',
        process: 'process/browser',
        path: 'path-browserify',
      },
    },
    optimizeDeps: {
      include: ['buffer', 'process', 'path-browserify'],
    },
  },
});

export default isDev
  ? devDefineConfig
  : defineConfig({
      output: 'server', // Enable SSR
      adapter: vercel({
        webAnalytics: {
          enabled: true,
        },
      }),
      integrations: [react()],
      compressHTML: true, // Remove HTML comments and whitespace
      i18n: {
        defaultLocale: 'us',
        locales: ['us', 'asia'],
        routing: {
          prefixDefaultLocale: true,
        },
      },
      vite: {
        plugins: [tailwindcss() as any],
        define: {
          global: 'globalThis',
        },
        resolve: {
          alias: {
            buffer: 'buffer',
            process: 'process/browser',
          },
        },
        optimizeDeps: {
          include: ['buffer', 'process'],
        },
        build: {
          // Remove all comments in production build
          minify: 'terser',
          terserOptions: {
            format: {
              comments: false, // Remove all comments
            },
          },
          cssCodeSplit: true,
          cssMinify: true,
        },
      },
    });
