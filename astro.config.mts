// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';

import { nodePolyfills } from 'vite-plugin-node-polyfills';

const isDev = process.env.NODE_ENV === 'development';

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || 'detake.news';

// ---- Sentry build-time options ----
// Runtime SDK options (dsn, release, environment, tracesSampleRate, beforeSend, ...)
// MUST live in sentry.client.config.js / sentry.server.config.js because
// when those files exist, runtime options passed to sentry({ ... }) are ignored.
// See node_modules/@sentry/astro/build/types/integration/types.d.ts for the full contract.
const sentryReleaseName = process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA;

const sentryBuildConfig = {
  // Org slug for the EU-region project "detake" (verified via sentry-cli against DSN).
  // Previous value "tadle" was actually a sibling project slug and caused silent
  // sourcemap upload failures (releases existed but had 0 artifacts).
  org: 'hedgue',
  project: 'detake',
  // Auth token is required for source map upload. Provision it in Vercel env as SENTRY_AUTH_TOKEN.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  sourcemaps: {
    // Default glob works for Astro; set explicit assets only if the default misses files.
    // Disable uploading in local dev to avoid noisy failures.
    disable: isDev,
  },
  release: {
    // Falls back to Vercel commit SHA. If neither env is set, bundler-plugin tries git HEAD.
    name: sentryReleaseName,
    // Don't require git CLI inside Vercel build; rely on explicit name.
    setCommits: sentryReleaseName ? { auto: true, ignoreMissing: true, ignoreEmpty: true } : false,
  },
  unstable_sentryVitePluginOptions: {
    // Component name annotation: injects data-sentry-component / data-sentry-source-file
    // on every React component so breadcrumbs show ui.component_name.
    // Gated with SENTRY_ANNOTATE_COMPONENTS so we can disable via env if it breaks prop-passing.
    reactComponentAnnotation: {
      enabled: process.env.SENTRY_ANNOTATE_COMPONENTS !== 'false',
      // Known components that forward/inspect props and may break with extra DOM props.
      // Extend this list if we see runtime warnings in preview after enabling annotation.
      ignoredComponents: [
        'Slot',
        'SlotClone',
        'Primitive',
      ],
    },
  },
};

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
    sentry(sentryBuildConfig),
  ],
  i18n: {
    defaultLocale: 'us',
    locales: ['us', 'asia'],
    routing: {
      prefixDefaultLocale: false,
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
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
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
        sentry(sentryBuildConfig),
      ],
      compressHTML: true, // Remove HTML comments and whitespace
      i18n: {
        defaultLocale: 'us',
        locales: ['us', 'asia'],
        routing: {
          prefixDefaultLocale: false,
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
          dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
        },
        optimizeDeps: {
          include: ['buffer', 'process'],
        },
        build: {
          // IMPORTANT: source maps MUST be enabled for Sentry symbolication.
          // Use 'hidden' (NOT true) so the emitted .js has no `//# sourceMappingURL=`
          // comment — the Vite plugin still uploads the .map to Sentry (debug IDs
          // injected into the JS allow symbolication server-side), but browsers
          // cannot discover and download the map, so source code is not exposed.
          sourcemap: 'hidden',
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
