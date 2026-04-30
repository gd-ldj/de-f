import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const astroPackageJson = require.resolve('astro/package.json');
const viteEntry = require.resolve('vite', { paths: [astroPackageJson] });
const rootDir = process.cwd();

type RenderableModule = {
  default: React.ComponentType<Record<string, unknown>>;
};

type MockCollectionArticle = {
  entry_id: string;
  title: string;
  sub_title: string;
  slug: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  category_names: string[];
  subcategory_names: string[];
  business_type_name?: string;
  tags: string[];
  topic_names?: string[];
  img_url?: string;
  author?: {
    id: string;
    name: string;
  };
};

async function renderModule(modulePath: string, props: Record<string, unknown>) {
  const { createServer } = await import(viteEntry);
  const server = await createServer({
    root: rootDir,
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    resolve: {
      alias: {
        '@': path.join(rootDir, 'src'),
        buffer: 'buffer',
        process: 'process/browser',
        path: 'path-browserify',
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    define: {
      global: 'globalThis',
      'process.env.NODE_ENV': '"development"',
    },
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
  });

  try {
    const module = await server.ssrLoadModule(modulePath) as RenderableModule;
    return renderToStaticMarkup(React.createElement(module.default, props));
  } finally {
    await server.close();
  }
}

const mockCollectionArticle: MockCollectionArticle = {
  entry_id: 'collection-article-1',
  slug: 'collection-article-1',
  title: 'Collection article title',
  sub_title: 'Collection article subtitle',
  author_name: 'DeTake',
  created_at: '2026-04-29T00:00:00.000Z',
  updated_at: '2026-04-29T00:00:00.000Z',
  category_names: ['Policy'],
  subcategory_names: [],
  business_type_name: 'News',
  tags: ['Anthropic', 'Geopolitics of AI'],
  topic_names: ['Anthropic', 'Geopolitics of AI'],
  img_url: '',
  author: {
    id: 'author-1',
    name: 'DeTake',
  },
};

test.describe('Home auth and collections render regressions', () => {
  test('home login renders without a Clerk provider during SSR', async () => {
    const html = await renderModule('/src/components/home/react/Login.tsx', {
      locale: 'en',
    });

    expect(html).toContain('Get Started');
  });

  test('collections lead card metadata uses a stable visible separator', async () => {
    const html = await renderModule('/src/components/collections/CollectionArticlesList.tsx', {
      locale: 'en',
      collectionId: '17',
      initialArticles: [mockCollectionArticle],
      hasMore: false,
    });

    expect(html).toContain('Policy');
    expect(html).toContain('Anthropic');
    expect(html).toContain('Geopolitics of AI');
    expect(html).toContain('·');
    expect(html).not.toContain('Policy  Anthropic  Geopolitics of AI');
  });

  test('collections page does not hydrate with link drift when a stored promote code exists', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    await page.addInitScript(() => {
      window.localStorage.setItem('promote_code', 'stored999');
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.goto('/collections/17');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    expect(pageErrors).toEqual([]);
    expect(
      consoleErrors.filter((message) => message.includes("didn't match") || message.includes('hydration mismatch')),
    ).toEqual([]);

    const firstLinkHref = await page.locator('article a').first().getAttribute('href');
    expect(firstLinkHref).toContain('-stored999');
  });
});
