import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const astroPackageJson = require.resolve('astro/package.json');
const viteEntry = require.resolve('vite', { paths: [astroPackageJson] });
const rootDir = process.cwd();

const mockArticle = {
  entry_id: 'home-news-1',
  slug: 'home-news-1',
  business_type_name: 'News',
  title: 'Mock home news title',
  sub_title: 'Mock home news subtitle',
  img_url: '',
  created_at: '2026-04-29T00:00:00.000Z',
  category_names: ['AI'],
  subcategory_names: [],
  tags: [],
  author: {
    name: 'DeTake',
    avatar_url: '',
    bio: '',
  },
};

async function renderNewsGrid(
  newsData: Array<{ tag: string; data: typeof mockArticle[] }>,
) {
  const { createServer } = await import(viteEntry);
  const server = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
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
    const module = await server.ssrLoadModule('/src/components/home/react/NewsGrid.tsx');
    return renderToStaticMarkup(React.createElement(module.default, { newsData, locale: 'en' }));
  } finally {
    await server.close();
  }
}

test.describe('Home news section render guards', () => {
  test('does not render the news section shell when news data is empty', async () => {
    const html = await renderNewsGrid([]);

    expect(html).toBe('');
  });

  test('renders the news section when at least one group has articles', async () => {
    const html = await renderNewsGrid([
      {
        tag: 'News',
        data: [mockArticle],
      },
    ]);

    expect(html).toContain('More From News');
    expect(html).toContain('Mock home news title');
  });
});
