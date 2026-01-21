// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

import { nodePolyfills } from 'vite-plugin-node-polyfills';

const isDev = process.env.NODE_ENV === 'development';

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || 'detake.news';

// https://astro.build/config
const devDefineConfig = defineConfig({
  site: `https://${productionHost}`,
  output: 'server', // Enable SSR
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'us',
        locales: {
          us: 'en-US',
          asia: 'zh-CN',
        },
      },
    }),
  ],
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
      site: `https://${productionHost}`,
      output: 'server', // Enable SSR
      adapter: vercel({
        webAnalytics: {
          enabled: true,
        },
      }),
      integrations: [
        react(),
        sitemap({
          i18n: {
            defaultLocale: 'us',
            locales: {
              us: 'en-US',
              asia: 'zh-CN',
            },
          },
        }),
      ],
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
          // Enhanced minification and obfuscation for production
          minify: 'terser',
          terserOptions: {
            compress: {
              drop_console: true, // Remove console.log statements
              drop_debugger: true, // Remove debugger statements
              pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
              passes: 2, // Multiple compression passes for better optimization
            },
            mangle: {
              toplevel: false, // Disable top-level mangling to avoid breaking imports
              properties: false, // Disable property mangling to avoid breaking object access
              reserved: ['React', 'ReactDOM', 'astro', 'window', 'document'], // Preserve important globals
            },
            format: {
              comments: false, // Remove all comments
              beautify: false, // Minimize whitespace
            },
          },
          cssCodeSplit: true,
          cssMinify: true,
          rollupOptions: {
            output: {
              manualChunks: {
                // Split vendor libraries for better caching
                vendor: ['react', 'react-dom'],
                utils: ['date-fns', 'lodash'],
              },
            },
          },
        },
      },
    });
