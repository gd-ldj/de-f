import path from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from '@playwright/test';
import { DEFAULT_TIMEZONE } from '@/utils/timezone';

const require = createRequire(import.meta.url);
const astroPackageJson = require.resolve('astro/package.json');
const viteEntry = require.resolve('vite', { paths: [astroPackageJson] });
const rootDir = process.cwd();

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

const mockCollectionArticles: MockCollectionArticle[] = [
  {
    entry_id: 'collection-timezone-lead',
    slug: 'collection-timezone-lead',
    title: 'Collection timezone lead title',
    sub_title: 'Collection timezone lead subtitle',
    author_name: 'DeTake',
    created_at: '2026-04-29T00:30:00.000Z',
    updated_at: '2026-04-29T00:30:00.000Z',
    category_names: ['Policy'],
    subcategory_names: [],
    business_type_name: 'News',
    tags: ['Anthropic'],
    topic_names: ['Anthropic'],
    img_url: '',
    author: {
      id: 'author-1',
      name: 'DeTake',
    },
  },
  {
    entry_id: 'collection-timezone-secondary',
    slug: 'collection-timezone-secondary',
    title: 'Collection timezone secondary title',
    sub_title: 'Collection timezone secondary subtitle',
    author_name: 'DeTake',
    created_at: '2026-04-29T00:30:00.000Z',
    updated_at: '2026-04-29T00:30:00.000Z',
    category_names: ['Policy'],
    subcategory_names: [],
    business_type_name: 'News',
    tags: ['Anthropic'],
    topic_names: ['Anthropic'],
    img_url: '',
    author: {
      id: 'author-2',
      name: 'DeTake',
    },
  },
];

async function renderCollectionArticlesList() {
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
    const module = await server.ssrLoadModule('/src/components/collections/CollectionArticlesList.tsx');
    return renderToStaticMarkup(
      React.createElement(module.default, {
        locale: 'en',
        collectionId: '17',
        initialArticles: mockCollectionArticles,
        hasMore: false,
      }),
    );
  } finally {
    await server.close();
  }
}

async function renderWithTimezone(timezone: string) {
  const previousTimezone = process.env.TZ;
  process.env.TZ = timezone;

  try {
    return await renderCollectionArticlesList();
  } finally {
    process.env.TZ = previousTimezone;
  }
}

test.describe.serial('Timezone hydration regressions', () => {
  test('collections list SSR markup stays stable across environment timezones', async () => {
    const htmlUtc = await renderWithTimezone('UTC');
    const htmlNewYork = await renderWithTimezone('America/New_York');
    const expectedDate = new Intl.DateTimeFormat('en-US', {
      timeZone: DEFAULT_TIMEZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(mockCollectionArticles[0].created_at));

    expect(htmlUtc).toBe(htmlNewYork);
    expect(htmlUtc).toContain(expectedDate);
  });
});
