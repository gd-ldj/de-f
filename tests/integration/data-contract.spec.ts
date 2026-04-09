import { test, expect } from '@playwright/test';
import { validateArticleContract, formatValidationReport } from '../utils/data-contract-validator';

/**
 * P1: API Data Contract Tests
 * Validates backend responses satisfy the minimum contract for frontend rendering.
 * Uses direct API calls (no browser needed).
 */

// API base URL for direct HTTP calls (beta environment, English)
const API_BASE = 'https://en-beta-api.detake.com';

test.describe('Data Contract: Articles API', () => {
  test('GET /api/v1/articles — articles match rendering contract', async ({ request }) => {
    let articles: Record<string, unknown>[] = [];

    await test.step('send GET /api/v1/articles?page=1&limit=5', async () => {
      const response = await request.get(`${API_BASE}/api/v1/articles?page=1&limit=5`);
      expect(response.ok(), `API returned ${response.status()}`).toBeTruthy();
      const json = await response.json();
      articles = json.data?.articles ?? json.articles ?? [];
    });

    await test.step('verify response contains articles', async () => {
      expect(articles.length, 'Expected at least 1 article from API').toBeGreaterThan(0);
    });

    await test.step('validate each article against rendering contract', async () => {
      const results = articles.map((article, i) => validateArticleContract(article, i));
      const allPassed = results.every((r) => r.passed);
      const report = formatValidationReport(results);
      expect(allPassed, `Article contract violations:\n${report}`).toBeTruthy();

      const warnings = results.flatMap((r) => r.warnings);
      if (warnings.length > 0) {
        console.warn(`Data contract warnings:\n${formatValidationReport(results)}`);
      }
    });
  });

  test('GET /api/v1/articles — response structure has pagination fields', async ({ request }) => {
    let data: Record<string, unknown> = {};

    await test.step('send GET /api/v1/articles?page=1&limit=5', async () => {
      const response = await request.get(`${API_BASE}/api/v1/articles?page=1&limit=5`);
      expect(response.ok()).toBeTruthy();
      const json = await response.json();
      data = (json.data ?? json) as Record<string, unknown>;
    });

    await test.step('verify articles is an array', async () => {
      expect(Array.isArray(data.articles), 'Expected articles to be an array').toBeTruthy();
    });

    await test.step('verify pagination info exists (total, hasMore, or next)', async () => {
      const hasPagination = 'total' in data || 'hasMore' in data || 'next' in data;
      expect(hasPagination, 'Expected pagination info (total, hasMore, or next)').toBeTruthy();
    });
  });
});

test.describe('Data Contract: Home API', () => {
  test('GET /api/v1/articles/home — home page data structure', async ({ request }) => {
    let data: Record<string, unknown> = {};

    await test.step('send GET /api/v1/articles/home?locale=en', async () => {
      const response = await request.get(`${API_BASE}/api/v1/articles/home?locale=en`);
      expect(response.ok(), `Home API returned ${response.status()}`).toBeTruthy();
      const json = await response.json();
      data = (json.data ?? json) as Record<string, unknown>;
    });

    await test.step('verify at least one content section exists', async () => {
      const hasContent =
        Array.isArray(data.lastest) ||
        Array.isArray(data.news_all) ||
        Array.isArray(data.mostread) ||
        Array.isArray(data.news);
      expect(hasContent, 'Home API should return at least one content section').toBeTruthy();
    });
  });
});

test.describe('Data Contract: Categories & Tags APIs', () => {
  test('GET /api/v1/articles/categories — returns non-empty list', async ({ request }) => {
    let categories: Array<Record<string, unknown>> = [];

    await test.step('send GET /api/v1/articles/categories', async () => {
      const response = await request.get(`${API_BASE}/api/v1/articles/categories`);
      expect(response.ok(), `Categories API returned ${response.status()}`).toBeTruthy();
      const json = await response.json();
      categories = (json.data ?? json) as Array<Record<string, unknown>>;
    });

    await test.step('verify categories is a non-empty array', async () => {
      expect(Array.isArray(categories), 'Expected categories to be an array').toBeTruthy();
      expect(categories.length, 'Expected at least 1 category').toBeGreaterThan(0);
    });

    await test.step('verify each category has a non-empty name', async () => {
      for (const cat of categories) {
        expect(typeof cat.name).toBe('string');
        expect((cat.name as string).trim().length).toBeGreaterThan(0);
      }
    });
  });

  test('GET /api/v1/articles/tags — returns non-empty list', async ({ request }) => {
    let tags: Array<Record<string, unknown>> = [];

    await test.step('send GET /api/v1/articles/tags', async () => {
      const response = await request.get(`${API_BASE}/api/v1/articles/tags`);
      expect(response.ok(), `Tags API returned ${response.status()}`).toBeTruthy();
      const json = await response.json();
      tags = (json.data ?? json) as Array<Record<string, unknown>>;
    });

    await test.step('verify tags is a non-empty array', async () => {
      expect(Array.isArray(tags), 'Expected tags to be an array').toBeTruthy();
      expect(tags.length, 'Expected at least 1 tag').toBeGreaterThan(0);
    });

    await test.step('verify each tag has a non-empty name', async () => {
      for (const tag of tags) {
        expect(typeof tag.name).toBe('string');
        expect((tag.name as string).trim().length).toBeGreaterThan(0);
      }
    });
  });
});
