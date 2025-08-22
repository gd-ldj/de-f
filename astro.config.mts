// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';
// @ts-ignore
import astroI18next from 'astro-i18next';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// Custom plugin to fix astro-i18next dirname issue
const fixAstroI18nextPlugin = () => {
  return {
    name: 'fix-astro-i18next',
    transform(code: string, id: string) {
      if (id.includes('astro-i18next/dist/index.js')) {
        return code.replace(
          'const __dirname = path2.dirname(__filename);',
          'const __dirname = "/";'
        );
      }
    }
  };
};
// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [react(), astroI18next()],
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
          include: ['buffer', 'process', 'path', 'util', 'os'],
        }),
        fixAstroI18nextPlugin(),
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
